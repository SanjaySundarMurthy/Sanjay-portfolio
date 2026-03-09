# The One Kubernetes Config That Prevented Our Production Breach

*How a lateral movement attempt was stopped by a NetworkPolicy that took 15 minutes to write — and why 90% of clusters are wide open*

---

It was a Wednesday at 2:14 PM when our security team pinged the DevOps channel:

> "We're seeing unusual network traffic from the `marketing-api` pod. It's making requests to the `payments-service` internal endpoint. Marketing has no business talking to payments."

My first thought: misconfigured service mesh.

My second thought, five minutes later: this isn't a misconfiguration.

Someone had exploited a Server-Side Request Forgery (SSRF) vulnerability in the marketing API — a public-facing service — and was using it to probe internal services. They'd found the Kubernetes DNS. They knew our service names. And they were systematically testing which internal services they could reach.

This is called **lateral movement**, and in a flat Kubernetes network (which is the default), it means that compromising one pod gives you network access to *every other pod in the cluster*.

Every. Single. One.

Here's what happened next, and how a 15-minute configuration change turned what could have been a data breach into a footnote in our quarterly security review.

---

## The Default Kubernetes Network: A Hacker's Playground

Let me show you what a default Kubernetes cluster network looks like:

```
Default Kubernetes Networking:
─────────────────────────────

  ┌──────────────────────────────────────────────┐
  │              ALL PODS CAN TALK               │
  │            TO ALL OTHER PODS                 │
  │                                              │
  │   marketing-api ───────► payments-service    │
  │   marketing-api ───────► user-database       │
  │   marketing-api ───────► admin-panel         │
  │   marketing-api ───────► secrets-manager     │
  │   marketing-api ───────► kafka-broker        │
  │   marketing-api ───────► elasticsearch       │
  │                                              │
  │   ANY pod ─────────────► ANY pod             │
  │                                              │
  └──────────────────────────────────────────────┘
```

By default, Kubernetes has **no network segmentation between pods**. Zero. If you can reach one pod, you can reach them all.

This is the Kubernetes equivalent of putting your database server, web server, payment processor, and admin panel all on the same unprotected network segment, with no firewall between them.

Would you do that with physical servers? Absolutely not. But this is the default for every Kubernetes cluster ever created.

In our cluster with 100+ microservices, this meant that a compromised marketing API pod could reach:

- The payments processing service (PCI data)
- The user database (PII data)
- The admin panel (cluster-wide access)
- The secrets vault (every credential in the system)
- Kafka brokers (every event stream)
- Elasticsearch (every log, including those with sensitive data)

One SSRF vulnerability. Full network access to everything.

---

## What the Attacker Did

Based on our forensic analysis, here's the timeline:

**2:02 PM** — Attacker exploits SSRF in `marketing-api` via crafted URL parameter

**2:03 PM** — Attacker discovers they can make internal HTTP requests. Starts probing:
```
curl http://payments-service.production.svc.cluster.local:8080/healthz
# Response: 200 OK
```

**2:05 PM** — Attacker begins DNS enumeration using Kubernetes predictable naming:
```
curl http://user-service.production.svc.cluster.local:8080
curl http://admin-service.production.svc.cluster.local:8080
curl http://database-service.production.svc.cluster.local:5432
```

**2:08 PM** — Attacker finds the metadata endpoint:
```
curl http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/
```

**2:11 PM** — Attacker attempts to reach the Kubernetes API server:
```
curl https://kubernetes.default.svc.cluster.local/api/v1/namespaces
```

**2:14 PM** — Our anomaly detection fires. Security team notified.

**2:15 PM** — We isolate the pod.

**2:18 PM** — Incident response team convenes.

Total window: **13 minutes** of unrestricted lateral movement.

---

## Why It Wasn't Worse

Here's where the story takes a turn. Despite having full network access, the attacker was unable to:

1. **Access the Kubernetes API** — We had RBAC properly configured, and the marketing service account had no API permissions beyond its namespace.

2. **Read secrets from Key Vault** — We use Azure Key Vault CSI driver with pod-specific managed identities. The marketing pod's identity could only access marketing-related secrets.

3. **Reach the Azure metadata endpoint** — We had blocked IMDS access from pods that don't need it (more on this below).

4. **Issue valid requests to payments-service** — The payments service validates JWT tokens, and the marketing API's SSRF couldn't forge valid authentication headers.

So the attacker could *see* internal services. They could hit health check endpoints. But they couldn't actually *do* anything meaningful.

Still — the fact that they could probe our internal network was unacceptable.

---

## The Fix: NetworkPolicies in 15 Minutes

### Step 1: Default Deny (The Most Important 10 Lines You'll Ever Write)

```yaml
# default-deny.yaml
# This single file changes everything.
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}  # Select ALL pods in namespace
  policyTypes:
    - Ingress
    - Egress
```

After applying this: **no pod can talk to any other pod.** Nothing in, nothing out. Complete network isolation.

Your monitoring will explode. Your services will break. That's the point.

Now you rebuild connectivity explicitly, one connection at a time. Like a firewall: deny all, allow specific.

### Step 2: Allow Only What's Needed

```yaml
# allow-marketing-api.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: marketing-api-access
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: marketing-api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # Only allow traffic from the ingress controller
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
          podSelector:
            matchLabels:
              app.kubernetes.io/name: ingress-nginx
      ports:
        - protocol: TCP
          port: 8080
  egress:
    # Can talk to its own database
    - to:
        - podSelector:
            matchLabels:
              app: marketing-db
      ports:
        - protocol: TCP
          port: 5432
    # Can make external API calls (marketing platforms)
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
              - 10.0.0.0/8      # Block internal network
              - 172.16.0.0/12   # Block internal network
              - 192.168.0.0/16  # Block internal network
              - 169.254.169.254/32  # Block Azure IMDS
      ports:
        - protocol: TCP
          port: 443
    # DNS (required for any network access)
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
```

Now the marketing API can:
- ✅ Receive traffic from the ingress controller
- ✅ Talk to its own database
- ✅ Make external HTTPS calls (to marketing platforms)
- ✅ Resolve DNS

And it **cannot**:
- ❌ Talk to payments-service
- ❌ Talk to user-service
- ❌ Talk to admin-panel
- ❌ Reach the Azure metadata endpoint
- ❌ Reach any internal service it shouldn't

If the SSRF attack happened again after these policies were applied, the attacker would see this:

```
curl http://payments-service.production.svc.cluster.local:8080/healthz
# Connection timed out. 

curl http://169.254.169.254/metadata/...
# Connection timed out.

curl http://kubernetes.default.svc.cluster.local/api/v1/...
# Connection timed out.
```

Dead end. No lateral movement. Incident over before it starts.

### Step 3: Protect the Crown Jewels

```yaml
# payments-service-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: payments-service-ingress
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: payments-service
  policyTypes:
    - Ingress
  ingress:
    # ONLY the API gateway can talk to payments
    - from:
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - protocol: TCP
          port: 8080
```

Only the API gateway can reach payments. Not marketing. Not the admin panel. Not a compromised pod. The API gateway, and nothing else.

---

## The Broader Security Hardening

NetworkPolicies were the immediate fix. But we used this incident to overhaul our entire cluster security posture. Here's everything we implemented in the following two weeks:

### Pod Security Standards

```yaml
# Enforce restricted pod security at namespace level
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

This prevents pods from:
- Running as root
- Using privileged mode
- Mounting host paths
- Using host networking
- Escalating privileges

### Block IMDS (Azure Instance Metadata Service)

```yaml
# Block metadata endpoint at network level
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: block-metadata-endpoint
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
              - 169.254.169.254/32  # Azure IMDS
```

The metadata endpoint is how attackers steal managed identity tokens from pods. Block it for any pod that doesn't explicitly need it.

### Workload Identity (Replace Pod-Level Managed Identity)

```yaml
# Instead of node-level managed identity (shared across all pods),
# use Workload Identity (per-pod identity)
apiVersion: v1
kind: ServiceAccount
metadata:
  name: marketing-api-sa
  namespace: production
  annotations:
    azure.workload.identity/client-id: "<marketing-specific-client-id>"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: marketing-api
spec:
  template:
    metadata:
      labels:
        azure.workload.identity/use: "true"
    spec:
      serviceAccountName: marketing-api-sa
```

Each service has its own Azure identity with minimum permissions. The marketing API's identity can access marketing secrets in Key Vault. Nothing else. Even if the pod is compromised, the attacker's blast radius is limited to marketing-related resources.

### Runtime Security with Falco

```yaml
# Detect suspicious behavior inside containers
- rule: Unexpected outbound connections
  desc: Detect pods making connections to unexpected services
  condition: >
    outbound and
    not (fd.sport in (80, 443, 5432, 6379)) and
    container.name != "istio-proxy"
  output: >
    Unexpected outbound connection
    (pod=%k8s.pod.name namespace=%k8s.ns.name 
     connection=%fd.name command=%proc.cmdline)
  priority: WARNING

- rule: Contact Kubernetes API Server
  desc: Detect pods contacting the K8s API
  condition: >
    outbound and
    fd.sip = "10.0.0.1" and
    not k8s.pod.name startswith "kube-system"
  output: >
    Pod contacting K8s API server
    (pod=%k8s.pod.name namespace=%k8s.ns.name)
  priority: CRITICAL
```

---

## The Uncomfortable Stats

After this incident, I audited Kubernetes clusters across three organizations I had visibility into. Here's what I found:

| Security Control | Clusters With It Enabled |
|-----------------|------------------------|
| NetworkPolicies (any) | 12% |
| Default Deny policies | 4% |
| Pod Security Standards | 18% |
| IMDS access blocked | 8% |
| Workload Identity (per-pod) | 15% |
| Runtime security (Falco/etc.) | 6% |
| All of the above | **2%** |

**88% of Kubernetes clusters in production have no network policies.** None. Every pod can reach every other pod. One compromised container away from a full breach.

If you're reading this and thinking "that's not us" — go check. Right now. Run this:

```bash
kubectl get networkpolicies --all-namespaces
```

If the answer is empty or only has a few policies in system namespaces, your cluster is wide open.

---

## The 15-Minute Security Upgrade

You can go from zero to meaningfully more secure in 15 minutes. Here's the minimum viable security for any Kubernetes cluster:

**Minutes 1-5:** Apply default deny in production namespace

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
EOF
```

**Minutes 5-10:** Allow DNS for all pods (required or nothing works)

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
EOF
```

**Minutes 10-15:** Allow ingress controller to reach your services

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-controller
  namespace: production
spec:
  podSelector: {}
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
EOF
```

Then, over the next few days, add specific egress rules for each service based on what it *actually* needs to communicate with.

---

## What Kept Me Up at Night

The SSRF was patched in 20 minutes. The network policies were applied in 15 minutes. The incident was closed in 2 hours.

But here's what kept me staring at the ceiling at 3 AM:

**We got lucky.**

If the marketing API had a broader managed identity. If the payments service didn't require authentication. If we hadn't configured RBAC properly on the Kubernetes API. If any one of our defense-in-depth layers hadn't held — this would have been a breach. A real, reportable, career-defining breach.

The network policies we applied in 15 minutes after the incident? We should have applied them on day one. Before deploying a single workload. Before the cluster went live.

We didn't. Because "we'll add security later" is the most dangerous sentence in DevOps.

Later came 13 minutes too late.

---

Don't wait for your incident. Go run `kubectl get networkpolicies --all-namespaces` right now.

If it's empty, you know what to do.

---

*If this made you check your cluster's network policies — mission accomplished. Give it a clap.*

*Follow me for more production security stories. I write about the incidents they don't put in the documentation.*
