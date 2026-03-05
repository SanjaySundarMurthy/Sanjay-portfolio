---
title: Azure AKS Best Practices from Managing 100+ Microservices in Production
published: false
description: Battle-tested patterns for running Kubernetes at scale on Azure AKS — cluster design, networking, security, scaling, and observability from real production experience.
tags: azure, kubernetes, devops, cloudnative
---

Running **100+ microservices** on Azure Kubernetes Service teaches you things no documentation ever will.

After 2+ years operating multi-cluster AKS environments at enterprise scale, here are the patterns that keep our services running at **99.9% uptime** — and the mistakes that almost took us down.

---

## 1. Cluster Architecture: Don't Put Everything in One Basket

### The Mistake
Starting with one massive cluster for everything — dev, staging, production, monitoring, all in one place.

### The Pattern

```
┌─────────────────────────────────────────────────────┐
│                   PRODUCTION                        │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  System Pool  │  │  App Pool 1  │  (General)    │
│  │  (3 nodes)   │  │  (5-20 nodes)│               │
│  │  CriticalOnly │  │  Auto-scale  │               │
│  └──────────────┘  └──────────────┘                │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  App Pool 2  │  │  Spot Pool   │  (Batch jobs) │
│  │  (GPU/Memory)│  │  (Cost-opt)  │               │
│  └──────────────┘  └──────────────┘                │
├─────────────────────────────────────────────────────┤
│                   NON-PROD                          │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Dev Cluster  │  │ Staging Clstr│               │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

**Separate clusters for prod vs non-prod.** Not just namespaces — actual clusters. Here's why:

- A dev namespace with a memory leak shouldn't be able to OOM your production nodes
- Different RBAC policies for different environments
- You can upgrade non-prod clusters first as a canary
- Cost attribution becomes trivial

### The Terraform

```hcl
resource "azurerm_kubernetes_cluster" "prod" {
  name                = "aks-prod-${var.region}"
  location            = var.location
  resource_group_name = azurerm_resource_group.aks.name
  dns_prefix          = "prod"
  kubernetes_version  = var.k8s_version
  sku_tier            = "Standard"  # NOT Free — you need the SLA

  default_node_pool {
    name                = "system"
    vm_size             = "Standard_D4s_v5"
    node_count          = 3
    min_count           = 3
    max_count           = 5
    auto_scaling_enabled = true
    zones               = [1, 2, 3]  # Availability zones
    only_critical_addons_enabled = true  # System pods only
    
    node_labels = {
      "nodepool-type" = "system"
      "environment"   = "production"
    }
  }

  network_profile {
    network_plugin    = "azure"      # Azure CNI for performance
    network_policy    = "calico"     # Network policies are non-negotiable
    load_balancer_sku = "standard"
    outbound_type     = "userDefinedRouting"  # Control egress
  }

  identity {
    type = "SystemAssigned"
  }

  azure_active_directory_role_based_access_control {
    azure_rbac_enabled = true  # Azure AD RBAC
    managed            = true
  }
}
```

### Application Node Pools

```hcl
resource "azurerm_kubernetes_cluster_node_pool" "apps" {
  name                  = "apps"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.prod.id
  vm_size               = "Standard_D8s_v5"
  min_count             = 5
  max_count             = 20
  auto_scaling_enabled  = true
  zones                 = [1, 2, 3]

  node_labels = {
    "nodepool-type" = "application"
    "environment"   = "production"
  }

  node_taints = []  # No taints — general purpose

  tags = {
    "cost-center" = "engineering"
  }
}

# Spot instances for batch/non-critical workloads — 60-90% cheaper
resource "azurerm_kubernetes_cluster_node_pool" "spot" {
  name                  = "spot"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.prod.id
  vm_size               = "Standard_D8s_v5"
  min_count             = 0
  max_count             = 10
  auto_scaling_enabled  = true
  priority              = "Spot"
  eviction_policy       = "Delete"
  spot_max_price        = -1  # Pay market price

  node_taints = [
    "kubernetes.azure.com/scalesetpriority=spot:NoSchedule"
  ]

  node_labels = {
    "nodepool-type"                          = "spot"
    "kubernetes.azure.com/scalesetpriority"  = "spot"
  }
}
```

---

## 2. Resource Requests & Limits: The #1 Production Killer

This single topic causes more outages than anything else in Kubernetes.

### The Rules

```yaml
# ❌ NEVER do this in production
resources: {}  # No limits = a ticking time bomb

# ❌ Also bad — limits too high, wasting money
resources:
  requests:
    cpu: "4"
    memory: "8Gi"
  limits:
    cpu: "4"
    memory: "8Gi"

# ✅ The right way
resources:
  requests:
    cpu: "250m"      # What you ACTUALLY use (check metrics)
    memory: "512Mi"  # Based on p95 memory usage
  limits:
    cpu: "1000m"     # Allow burst up to 4x request
    memory: "1Gi"    # Hard ceiling — OOMKill if exceeded
```

### The Process

1. **Deploy without limits** (in dev only!)
2. **Observe for 48 hours** using Prometheus metrics
3. **Set requests to p50** (average usage)
4. **Set memory limits to p99 + 20%** buffer
5. **Set CPU limits to 2-4x requests** (allow bursting)

### The Query (Prometheus)

```promql
# Find actual CPU usage for right-sizing
quantile_over_time(0.95,
  rate(container_cpu_usage_seconds_total{
    namespace="production",
    container!=""
  }[5m])
[7d:1m])

# Find actual memory usage
quantile_over_time(0.95,
  container_memory_working_set_bytes{
    namespace="production",
    container!=""
  }
[7d:1m])
```

### Enforce with OPA/Gatekeeper

```yaml
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredResources
metadata:
  name: require-resource-limits
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    namespaces: ["production"]
  parameters:
    limits:
      - cpu
      - memory
    requests:
      - cpu
      - memory
```

Now **nobody can deploy to production without resource limits.** Policy as code.

---

## 3. Networking: Azure CNI + Network Policies

### IP Planning

The biggest mistake teams make: not planning IP addresses. Azure CNI assigns a real VNet IP to every pod.

```
IP Math for Azure CNI:
─────────────────────
20 nodes × 30 pods each = 600 pod IPs needed
+ 20 node IPs
+ Services, LB, etc.
≈ 700 IPs minimum

Use a /22 subnet (1024 IPs) for headroom.
DO NOT use a /24 (256 IPs) — you'll regret it.
```

### Network Policies (Non-Negotiable)

By default, every pod can talk to every other pod. In production with 100+ microservices, that's a security nightmare.

```yaml
# Default deny all ingress traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress

---
# Allow specific service communication
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend-service
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - protocol: TCP
          port: 8080
```

**Pattern:** Default deny everything, then whitelist specific flows. Tedious to set up, but saved us during a lateral movement attempt.

---

## 4. Autoscaling: The Three Layers

```
Layer 1: Pod Autoscaling (HPA)
├── Scale pods based on CPU/memory/custom metrics
├── Min: 2 replicas (always — for HA)
└── Max: based on load testing

Layer 2: Node Autoscaling (Cluster Autoscaler)
├── Scale nodes when pods can't be scheduled
├── Scale down when nodes are underutilized
└── Configure scale-down delay (10 min minimum)

Layer 3: KEDA (Event-Driven)
├── Scale based on queue depth, event count
├── Scale to zero for batch workloads
└── Saves $$$ on non-constant workloads
```

### HPA Configuration

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3        # Never go below 3
  maxReplicas: 50       # Based on load test ceiling
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30   # React fast
      policies:
        - type: Percent
          value: 100
          periodSeconds: 30
    scaleDown:
      stabilizationWindowSeconds: 300  # Scale down slowly
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

**Key insight:** Scale up aggressively, scale down conservatively. Flapping kills stability.

---

## 5. Secrets Management: Never in YAML

```
❌ Never:
├── Hardcoded secrets in deployment YAML
├── ConfigMaps for sensitive data  
├── Environment variables visible in `kubectl describe`
└── Secrets in Git (even encrypted base64 is NOT encryption)

✅ Always:
├── Azure Key Vault + CSI Driver
├── External Secrets Operator
├── Sealed Secrets (minimum)
└── Workload Identity (no static credentials)
```

### Azure Key Vault CSI Driver

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: azure-kv-secrets
  namespace: production
spec:
  provider: azure
  parameters:
    usePodIdentity: "false"
    useVMUserAssignedIdentity: "true"
    userAssignedIdentityID: "<managed-identity-client-id>"
    keyvaultName: "kv-prod-app"
    tenantId: "<tenant-id>"
    objects: |
      array:
        - |
          objectName: database-connection-string
          objectType: secret
        - |
          objectName: api-key
          objectType: secret
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
spec:
  template:
    spec:
      serviceAccountName: api-service-sa
      containers:
        - name: api
          volumeMounts:
            - name: secrets-store
              mountPath: "/mnt/secrets"
              readOnly: true
      volumes:
        - name: secrets-store
          csi:
            driver: secrets-store.csi.k8s.io
            readOnly: true
            volumeAttributes:
              secretProviderClass: "azure-kv-secrets"
```

Secrets are mounted as files, rotated automatically from Key Vault, and **never stored in etcd**.

---

## 6. Observability: You Can't Fix What You Can't See

### The Stack

```
Metrics:    Prometheus + Grafana
Logging:    Fluentd → Elasticsearch → Kibana (or Azure Log Analytics)
Tracing:    Application Insights / Jaeger
Alerting:   AlertManager → PagerDuty/Teams
Dashboards: Grafana (operational) + Azure Monitor (management)
```

### The Four Golden Signals (per service)

```yaml
# Grafana dashboard variables
# Every microservice dashboard must show:

1. Latency    → histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
2. Traffic    → sum(rate(http_requests_total[5m])) by (service)
3. Errors     → sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
4. Saturation → container_memory_working_set_bytes / container_spec_memory_limit_bytes
```

### Alerting Rules That Don't Cry Wolf

```yaml
groups:
  - name: production-critical
    rules:
      # Alert if error rate > 1% for 5 minutes
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5..", namespace="production"}[5m]))
          /
          sum(rate(http_requests_total{namespace="production"}[5m]))
          > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error rate above 1% for {{ $labels.service }}"

      # Alert if p99 latency > 2s for 10 minutes
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_request_duration_seconds_bucket{namespace="production"}[5m]))
            by (le, service)
          ) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "p99 latency above 2s for {{ $labels.service }}"

      # Alert if pod restart count > 3 in 15 minutes
      - alert: PodCrashLooping
        expr: |
          increase(kube_pod_container_status_restarts_total{namespace="production"}[15m]) > 3
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: "Pod {{ $labels.pod }} crash looping"
```

---

## 7. Zero-Downtime Deployments

### Rolling Update Strategy

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0     # Never take down existing pods first
      maxSurge: 25%         # Spin up 25% new pods at a time
  template:
    spec:
      containers:
        - name: app
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 5
      terminationGracePeriodSeconds: 60  # Give connections time to drain
```

### Pod Disruption Budgets

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-gateway-pdb
spec:
  minAvailable: 2    # Always keep at least 2 pods running
  selector:
    matchLabels:
      app: api-gateway
```

This prevents node drains and cluster upgrades from taking down all your replicas simultaneously.

### Topology Spread Constraints

```yaml
spec:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      labelSelector:
        matchLabels:
          app: api-gateway
    - maxSkew: 1
      topologyKey: kubernetes.io/hostname
      whenUnsatisfiable: ScheduleAnyway
      labelSelector:
        matchLabels:
          app: api-gateway
```

This ensures pods are spread across availability zones AND nodes. If one AZ goes down, your service stays up.

---

## 8. Cost Optimization Wins

After 2 years of optimization, here's what saved us the most:

| Strategy | Savings | Effort |
|----------|---------|--------|
| Right-size resource requests | 30-40% | Medium |
| Spot instances for non-critical | 60-90% | Low |
| Scale non-prod to zero after hours | 40% | Low |
| Reserved instances for base load | 30-40% | Low |
| Namespace resource quotas | Prevents runaway | Low |
| Delete orphaned PVCs and LBs | 5-10% | Low |

### Auto-shutdown for Non-Prod

```bash
#!/bin/bash
# Scale down dev/staging after 7 PM, scale up at 8 AM
# Run via Azure DevOps scheduled pipeline

HOUR=$(date +%H)
if [ "$HOUR" -ge 19 ] || [ "$HOUR" -lt 8 ]; then
  az aks nodepool scale \
    --resource-group rg-nonprod \
    --cluster-name aks-dev \
    --name apps \
    --node-count 0
fi
```

This alone saved us **$3,000/month** on dev clusters sitting idle overnight.

---

## The Checklist

Before claiming your AKS cluster is "production-ready," verify:

- [ ] **Multi-AZ node pools** with topology spread constraints
- [ ] **Separate system and app node pools** (CriticalAddOnsOnly taint)
- [ ] **Resource requests AND limits** on every container
- [ ] **Network policies** (default deny + explicit allow)
- [ ] **Pod Disruption Budgets** on critical services
- [ ] **Readiness + Liveness probes** on every container
- [ ] **Secrets in Key Vault** (not Kubernetes secrets)
- [ ] **Azure AD RBAC** (not local k8s accounts)
- [ ] **Prometheus + Grafana** monitoring
- [ ] **Cluster autoscaler** configured
- [ ] **HPA** on all variable-load services
- [ ] **Ingress controller** with TLS termination
- [ ] **Log aggregation** (ELK or Azure Log Analytics)
- [ ] **Backup strategy** (Velero or Azure Backup)
- [ ] **DR plan** tested in the last 90 days

---

These patterns took us from "Kubernetes is complicated" to "Kubernetes just works." They're not theoretical — they're running in production right now, serving real traffic.

Start with the checklist. Implement one pattern per sprint. In 3 months, your cluster will be unrecognizable.

---

*Got questions about AKS in production? Drop a comment — I've probably hit the same issue. Follow for more real-world DevOps content.*
