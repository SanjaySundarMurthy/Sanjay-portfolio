# The $3,000/Month Kubernetes Mistake That Nobody Talks About

*How we cut our Azure bill by 40% without touching a single line of application code*

---

I stared at the Azure Cost Management dashboard at 11 PM on a Thursday night. The number glaring back at me made my stomach drop.

**$47,000.**

That was our monthly Azure bill. For infrastructure that was supposed to cost $28,000.

Somewhere between "let's move to Kubernetes" and "it's running in production," we'd hemorrhaged $19,000 a month in cloud waste. And the worst part? Nobody noticed for three months.

That's $57,000 — gone. Burned. Evaporated into the cloud. Literally.

This is the story of how we found the waste, killed it, and brought our bill down to $28,500 — and the eight mistakes that were silently draining our budget that I guarantee you're making too.

---

## The Audit: Where Was the Money Going?

I spent the next 72 hours doing something I should have done on day one: a line-by-line audit of every resource in our Azure subscription.

Here's what I found.

### Mistake #1: The "Just In Case" Node Pools

Our AKS cluster had three node pools:

- **System pool:** 3 × Standard_D4s_v5 (correct)
- **App pool:** 12 × Standard_D8s_v5 (way too many)
- **"Temporary" pool:** 5 × Standard_D16s_v5 (forgotten)

That "temporary" pool? A developer spun it up three months ago to test a memory-intensive job. The job ran for 2 hours. The nodes ran for 2,160 hours.

**Cost of forgetting:** $3,200/month

> **Lesson:** If you create something "temporary" in the cloud and don't set a calendar reminder to delete it, it becomes permanent. The cloud doesn't care about your intentions.

### Mistake #2: Autoscaling That Only Scales Up

We had the Cluster Autoscaler enabled. Great. But we'd configured it with such conservative scale-down settings that nodes rarely — if ever — scaled down.

```yaml
# What we had (terrified of disruption)
scale-down-delay-after-add: 30m
scale-down-delay-after-delete: 5m
scale-down-unneeded-time: 30m      # Node must be idle 30 min
scale-down-utilization-threshold: 0.3  # Only scale down at <30% usage
```

Translation: a node had to be less than 30% utilized for 30 consecutive minutes before the autoscaler even *considered* removing it. In practice, with pod scheduling churn, this almost never happened.

```yaml
# What we changed to
scale-down-delay-after-add: 10m
scale-down-delay-after-delete: 1m
scale-down-unneeded-time: 10m
scale-down-utilization-threshold: 0.5  # Scale down at <50% usage
```

**Cost saved:** $2,100/month

### Mistake #3: Resource Requests Were Fiction

This was the big one.

When I looked at our actual CPU and memory utilization versus what we'd *requested* in our Kubernetes manifests, I found this:

| Service | CPU Requested | CPU Actually Used | Waste |
|---------|--------------|-------------------|-------|
| api-gateway | 2 cores | 0.3 cores | 85% |
| order-service | 1 core | 0.15 cores | 85% |
| auth-service | 500m | 80m | 84% |
| notification-svc | 1 core | 50m | 95% |
| report-generator | 4 cores | 0.2 cores | 95% |

I wish I was exaggerating.

Developers had set resource requests based on *vibes*. "This is important, give it 2 cores." "This processes reports, better give it 4 cores." Nobody had ever looked at actual metrics.

The result? Kubernetes thought our cluster was 85% full. In reality, it was 15% utilized. But because the *scheduler* uses requests (not actual usage) to place pods, nodes were "full" on paper while being empty in practice. So the autoscaler kept adding more nodes.

**How we fixed it:**

```promql
# Prometheus query: actual CPU usage over 7 days
quantile_over_time(0.95,
  rate(container_cpu_usage_seconds_total{
    namespace="production",
    container!=""
  }[5m])
[7d:1m])
```

We ran this for every service, set requests to the p95 value plus a 20% buffer, and set limits to 2-3x the request to allow burst capacity.

**Cost saved:** $5,400/month

> This alone was the single biggest win. Right-sizing resource requests saved more money than every other optimization combined.

### Mistake #4: 24/7 Non-Production Environments

Our dev and staging clusters ran 24/7. But our developers work 9 AM to 7 PM, Monday through Friday.

That means our non-prod infrastructure was running idle for:
- 14 hours every weekday night (5 PM to 7 AM)
- 48 hours every weekend
- Total: **118 out of 168 hours per week — 70% idle time**

We set up a simple Azure DevOps scheduled pipeline:

```bash
# Scale down at 7 PM IST
- cron: "30 13 * * 1-5"  # 7 PM IST = 1:30 PM UTC
  displayName: "Scale down non-prod"
  always: true
  branches:
    include: [main]

# Scale up at 8:30 AM IST
- cron: "0 3 * * 1-5"  # 8:30 AM IST = 3 AM UTC
  displayName: "Scale up non-prod"
  always: true
  branches:
    include: [main]
```

**Cost saved:** $3,100/month

### Mistake #5: Premium Storage for Non-Premium Workloads

Every Persistent Volume Claim in our cluster was using `managed-premium` storage class. Log aggregation? Premium SSD. Temporary build caches? Premium SSD. Dev environment databases? Premium SSD.

Here's Azure Storage pricing reality:

| Storage Type | Cost per GB/month | IOPS |
|-------------|-------------------|------|
| Premium SSD (P30) | $0.12 | 5,000 |
| Standard SSD | $0.04 | 500 |
| Standard HDD | $0.02 | 500 |

We reclassified workloads:

- **Premium SSD:** Production databases, Redis, Elasticsearch (hot tier)
- **Standard SSD:** Staging databases, application logs, CI/CD caches
- **Standard HDD:** Archival logs, backups, cold storage

**Cost saved:** $800/month

### Mistake #6: Orphaned Resources — The Silent Killers

I found:
- **14 unattached managed disks** from deleted pods ($180/month)
- **3 orphaned public IPs** from deleted LoadBalancer services ($30/month)
- **2 forgotten Azure Container Registries** with old images ($150/month)
- **8 snapshots** from a migration we did 6 months ago ($90/month)

These resources were created by Kubernetes or Terraform, then the parent resource was deleted — but the child resource remained. Nobody got an alert. Nobody noticed.

**Cost saved:** $450/month

I now run this cleanup check monthly:

```bash
# Find orphaned disks
az disk list --query "[?managedBy==null].{Name:name, Size:diskSizeGb, State:diskState}" -o table

# Find unattached public IPs
az network public-ip list --query "[?ipConfiguration==null].{Name:name, IP:ipAddress}" -o table

# Find orphaned NICs
az network nic list --query "[?virtualMachine==null].{Name:name}" -o table
```

### Mistake #7: No Reserved Instances for Base Load

We knew our production cluster would always run at least 6 D8s_v5 nodes. That base load never changes — it's the minimum to serve our traffic.

Yet we were paying on-demand prices for all of them.

| Pricing | Monthly Cost (6 nodes) |
|---------|----------------------|
| On-demand | $2,340 |
| 1-year Reserved | $1,497 (36% savings) |
| 3-year Reserved | $1,029 (56% savings) |

We bought 1-year reservations for our base load and kept autoscaling for the variable portion.

**Cost saved:** $843/month

### Mistake #8: No Spot Instances for Fault-Tolerant Workloads

We had batch jobs, data processing pipelines, and CI/CD build agents that could tolerate interruption. All running on regular on-demand nodes.

Azure Spot VMs are 60-90% cheaper. Yes, they can be evicted with 30 seconds notice. But for workloads that can retry? It's free money.

```hcl
resource "azurerm_kubernetes_cluster_node_pool" "spot" {
  name       = "spot"
  vm_size    = "Standard_D8s_v5"
  priority   = "Spot"
  spot_max_price = -1
  eviction_policy = "Delete"
  
  node_taints = [
    "kubernetes.azure.com/scalesetpriority=spot:NoSchedule"
  ]

  min_count = 0
  max_count = 10
}
```

**Cost saved:** $2,500/month (on batch processing alone)

---

## The Results

After 3 weeks of optimization:

| Before | After | Savings |
|--------|-------|---------|
| $47,000/month | $28,500/month | $18,500/month |
| | | **$222,000/year** |

Let me say that again. **$222,000 per year** was being wasted on infrastructure nobody was using.

And we didn't change a single line of application code. We didn't reduce features. We didn't degrade performance. We didn't sacrifice reliability.

We just stopped paying for things we weren't using.

---

## The Checklist

If you're running Kubernetes on any cloud provider, print this and tape it to your monitor:

- [ ] Are your resource requests based on actual metrics or developer guesses?
- [ ] Is your cluster autoscaler configured to scale *down*, not just up?
- [ ] Do you have "temporary" resources older than 30 days?
- [ ] Are non-prod environments running 24/7?
- [ ] Is everything on premium storage, including things that don't need it?
- [ ] When was the last time you checked for orphaned disks, IPs, and NICs?
- [ ] Do you have reserved instances for your base load?
- [ ] Are fault-tolerant workloads on spot instances?

If you answered "I don't know" to more than two of these, you're overpaying. Guaranteed.

---

## The Uncomfortable Truth

Cloud cost optimization isn't a technical problem. It's a cultural one.

Nobody gets promoted for *reducing* the cloud bill. Nobody writes a performance review that says "Saved the company $222K by deleting forgotten nodes." There's no glory in it.

But there's glory in "migrated to Kubernetes" and "deployed 50 microservices" and "built a multi-region architecture." Those are the projects that get funded, celebrated, and rewarded.

So the infrastructure grows. And grows. And nobody asks what it costs until finance sends an email with the subject line: **"Can someone explain this Azure invoice?"**

Don't wait for that email.

---

*If this saved you money (or stress), give it a clap. Follow me for more real-world DevOps stories — no fluff, just production war stories.*

*Have your own cloud cost horror story? I'd love to hear it in the comments.*
