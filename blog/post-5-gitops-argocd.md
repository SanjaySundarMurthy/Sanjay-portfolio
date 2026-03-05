---
title: "GitOps with ArgoCD: A Practical Guide for Kubernetes Teams"
published: false
description: How to implement GitOps with ArgoCD on Azure AKS — from installation to production-grade multi-app deployments with automated sync, health checks, and rollback strategies.
tags: kubernetes, devops, gitops, azure
---

GitOps sounds elegant in theory: *"Git is the single source of truth for your infrastructure."* In practice, getting it right is harder than most tutorials suggest.

After implementing GitOps with ArgoCD across multiple AKS clusters managing **100+ microservices**, here's the practical guide I wish I'd had.

---

## Why GitOps Over Traditional CI/CD Deployments?

```
Traditional CI/CD (Push-based):
Pipeline → kubectl apply → Cluster
                ↑
    "Who deployed what? When? Why?"
    "Is the cluster state matching Git?"
    "Someone ran kubectl edit in prod..."

GitOps (Pull-based):
Git Repo ← ArgoCD watches ← Cluster syncs automatically
                ↑
    "Git log IS the deployment history"
    "Cluster always matches Git"
    "Drift? Auto-corrected."
```

| Capability | Traditional CI/CD | GitOps with ArgoCD |
|-----------|-------------------|-------------------|
| Deployment history | Pipeline logs | Git commit history |
| Rollback | Re-run old pipeline | `git revert` |
| Drift detection | None (manual kubectl) | Automatic |
| Self-healing | None | Yes (auto-sync) |
| Multi-cluster | Complex scripts | Native support |
| Audit trail | Pipeline logs | Git blame |

---

## Step 1: Install ArgoCD on AKS

### Using Helm (Recommended for Production)

```bash
# Add Helm repo
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Create namespace
kubectl create namespace argocd

# Install with production values
helm install argocd argo/argo-cd \
  --namespace argocd \
  --values argocd-values.yaml \
  --version 6.x.x
```

### Production Values File

```yaml
# argocd-values.yaml
global:
  image:
    tag: "v2.10.0"  # Pin the version

server:
  replicas: 2  # HA for the API server
  
  ingress:
    enabled: true
    ingressClassName: nginx
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt
      nginx.ingress.kubernetes.io/ssl-passthrough: "true"
      nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
    hosts:
      - argocd.yourdomain.com
    tls:
      - secretName: argocd-tls
        hosts:
          - argocd.yourdomain.com

  config:
    # OIDC for Azure AD authentication
    oidc.config: |
      name: AzureAD
      issuer: https://login.microsoftonline.com/<TENANT_ID>/v2.0
      clientID: <CLIENT_ID>
      clientSecret: $oidc.clientSecret
      requestedScopes:
        - openid
        - profile
        - email

controller:
  replicas: 1  # Single controller is fine
  metrics:
    enabled: true
    serviceMonitor:
      enabled: true  # Prometheus scraping

repoServer:
  replicas: 2  # HA for git operations
  
  # Resource limits for repo server
  resources:
    requests:
      cpu: 250m
      memory: 256Mi
    limits:
      cpu: 1000m
      memory: 1Gi

redis-ha:
  enabled: true  # HA Redis for caching

configs:
  params:
    # Reconciliation interval
    timeout.reconciliation: 180s
```

---

## Step 2: The Git Repository Structure

This is where most teams go wrong. You need **two repos** minimum:

```
┌─────────────────────────┐     ┌─────────────────────────┐
│     SOURCE REPO         │     │     CONFIG REPO          │
│  (Application Code)     │     │  (Kubernetes Manifests)  │
│                         │     │                          │
│  src/                   │     │  apps/                   │
│  tests/                 │     │  ├── base/               │
│  Dockerfile             │     │  │   ├── deployment.yaml │
│  .github/workflows/     │     │  │   ├── service.yaml    │
│                         │     │  │   └── kustomization   │
│  CI builds image ──────────────▶ ├── dev/                │
│  Updates config repo    │     │  │   └── kustomization   │
│                         │     │  ├── staging/            │
│                         │     │  │   └── kustomization   │
│                         │     │  └── production/         │
│                         │     │      └── kustomization   │
│                         │     │                          │
│                         │     │  ArgoCD watches this ◄──── ArgoCD
└─────────────────────────┘     └─────────────────────────┘
```

### Why Two Repos?

1. **Different access controls** — Developers push code, ArgoCD reads config
2. **Different change frequencies** — Code changes hourly, config changes daily
3. **Clean separation** — CI handles building, GitOps handles deploying
4. **Better audit trail** — Config changes are distinct from code changes

---

## Step 3: Kustomize-Based Multi-Environment Setup

### Base (Shared Configuration)

```yaml
# apps/order-service/base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
        - name: order-service
          image: myacr.azurecr.io/order-service:latest  # Overridden per env
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
            initialDelaySeconds: 30
---
# apps/order-service/base/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
    - port: 80
      targetPort: 8080
---
# apps/order-service/base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
```

### Dev Overlay

```yaml
# apps/order-service/overlays/dev/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: dev
namePrefix: dev-
resources:
  - ../../base
patches:
  - target:
      kind: Deployment
      name: order-service
    patch: |
      - op: replace
        path: /spec/replicas
        value: 1
images:
  - name: myacr.azurecr.io/order-service
    newTag: "dev-abc1234"  # Updated by CI pipeline
```

### Production Overlay

```yaml
# apps/order-service/overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: production
resources:
  - ../../base
patches:
  - target:
      kind: Deployment
      name: order-service
    patch: |
      - op: replace
        path: /spec/replicas
        value: 5
      - op: add
        path: /spec/template/spec/topologySpreadConstraints
        value:
          - maxSkew: 1
            topologyKey: topology.kubernetes.io/zone
            whenUnsatisfiable: DoNotSchedule
            labelSelector:
              matchLabels:
                app: order-service
images:
  - name: myacr.azurecr.io/order-service
    newTag: "v1.2.3"  # Promoted from staging
```

---

## Step 4: ArgoCD Application Definitions

### Single Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service-production
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: production
  source:
    repoURL: https://github.com/myorg/k8s-config.git
    targetRevision: main
    path: apps/order-service/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true       # Delete resources removed from Git
      selfHeal: true    # Fix manual changes (drift correction)
      allowEmpty: false # Don't sync if no resources
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:
      limit: 3
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### The App of Apps Pattern (Managing 100+ Services)

Instead of creating 100 ArgoCD Application resources manually, create ONE app that generates all others:

```yaml
# Root application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: production-apps
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/k8s-config.git
    targetRevision: main
    path: argocd/production  # Contains all app definitions
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      selfHeal: true
      prune: true
```

```
# Directory structure
argocd/production/
├── order-service.yaml       # ArgoCD Application
├── payment-service.yaml     # ArgoCD Application
├── user-service.yaml        # ArgoCD Application
├── notification-service.yaml
├── inventory-service.yaml
└── ... (100+ more)
```

**Add a new microservice? Create one YAML file in this directory. ArgoCD picks it up automatically.**

---

## Step 5: ApplicationSet (Dynamic Generation)

For even more automation, use ApplicationSet to generate apps from a template:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: production-services
  namespace: argocd
spec:
  generators:
    # Generate one Application per directory in the config repo
    - git:
        repoURL: https://github.com/myorg/k8s-config.git
        revision: main
        directories:
          - path: apps/*/overlays/production
  template:
    metadata:
      name: '{{path[1]}}-production'  # e.g., order-service-production
    spec:
      project: production
      source:
        repoURL: https://github.com/myorg/k8s-config.git
        targetRevision: main
        path: '{{path}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: production
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

**Now ArgoCD auto-discovers services.** Add a new service directory? ArgoCD creates the application automatically.

---

## Step 6: CI Pipeline Updates the Config Repo

The CI pipeline builds the image, then updates the config repo to trigger GitOps:

```yaml
# In CI pipeline (GitHub Actions)
- name: Update config repo
  run: |
    # Clone config repo
    git clone https://x-access-token:${{ secrets.CONFIG_REPO_TOKEN }}@github.com/myorg/k8s-config.git
    cd k8s-config
    
    # Update image tag in kustomization
    cd apps/order-service/overlays/dev
    kustomize edit set image \
      myacr.azurecr.io/order-service:${{ github.sha }}
    
    # Commit and push
    git config user.name "CI Bot"
    git config user.email "ci@myorg.com"
    git add .
    git commit -m "chore(order-service): update dev image to ${{ github.sha }}"
    git push origin main
```

ArgoCD detects the commit → syncs the new image → rolling update happens automatically.

---

## Step 7: Sync Waves (Ordered Deployments)

Some resources must be deployed before others (ConfigMaps before Deployments, Namespaces before everything):

```yaml
# ConfigMap (deployed first)
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  annotations:
    argocd.argoproj.io/sync-wave: "-1"  # Deployed first
data:
  DATABASE_HOST: "db.production.svc"

---
# Deployment (deployed second)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  annotations:
    argocd.argoproj.io/sync-wave: "0"   # Deployed after wave -1

---
# HPA (deployed last)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
  annotations:
    argocd.argoproj.io/sync-wave: "1"   # Deployed after wave 0
```

**Order:** ConfigMap (-1) → Deployment (0) → HPA (1)

---

## Step 8: Rollback Strategy

### Automatic Rollback on Degraded Health

```yaml
spec:
  syncPolicy:
    automated:
      selfHeal: true
    retry:
      limit: 3
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### Manual Rollback via Git

```bash
# Method 1: Git revert (creates forward-moving history)
git revert HEAD
git push origin main
# ArgoCD syncs the reverted state automatically

# Method 2: ArgoCD CLI (faster for emergencies)
argocd app rollback order-service-production
```

### Custom Health Checks

```yaml
# Tell ArgoCD how to determine if your app is "Healthy"
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service-production
spec:
  # ... other config
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas  # Ignore HPA-managed replicas
```

---

## Step 9: RBAC and Multi-Tenancy

### ArgoCD Projects (Isolation)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: production
  namespace: argocd
spec:
  description: "Production applications"
  
  # Only allow production namespace
  destinations:
    - namespace: production
      server: https://kubernetes.default.svc
  
  # Only allow specific repos
  sourceRepos:
    - https://github.com/myorg/k8s-config.git
  
  # Only allow specific resource types
  clusterResourceWhitelist:
    - group: ""
      kind: Namespace
  
  namespaceResourceWhitelist:
    - group: "apps"
      kind: Deployment
    - group: ""
      kind: Service
    - group: ""
      kind: ConfigMap
    - group: "networking.k8s.io"
      kind: Ingress
  
  # Prevent accidental deletion
  orphanedResources:
    warn: true
```

**Each team gets their own project** with scoped access — they can't deploy to another team's namespace.

---

## Common Pitfalls

### 1. Secret Management

ArgoCD syncs from Git. **Secrets should NOT be in Git.** Use one of:

```
Option A: Sealed Secrets
├── Encrypt secrets locally
├── Commit encrypted SealedSecret to Git
└── Controller decrypts in-cluster

Option B: External Secrets Operator
├── Store secrets in Azure Key Vault
├── ExternalSecret resource in Git references the vault
└── Operator syncs secrets from vault to K8s

Option C: SOPS + KMS
├── Encrypt secret files with SOPS
├── Commit encrypted files to Git
└── ArgoCD decrypts using KMS key
```

### 2. Webhook Configuration

Don't rely on polling (default 3-minute interval). Set up webhooks for instant sync:

```bash
# ArgoCD will process Git webhooks for immediate sync
# Configure in GitHub: Settings → Webhooks
# URL: https://argocd.yourdomain.com/api/webhook
# Content type: application/json
# Events: Just the push event
```

### 3. Resource Tracking

When migrating existing resources to ArgoCD, add tracking labels:

```bash
# Label existing resources so ArgoCD can manage them
kubectl label deployment order-service \
  app.kubernetes.io/managed-by=argocd \
  -n production
```

---

## The GitOps Maturity Checklist

- [ ] ArgoCD installed with HA configuration
- [ ] Separate source and config repos
- [ ] Kustomize overlays per environment
- [ ] Automated sync with self-heal enabled
- [ ] App of Apps or ApplicationSet pattern
- [ ] CI pipeline updates config repo (not deploying directly)
- [ ] Secrets managed outside Git (Sealed Secrets/External Secrets)
- [ ] RBAC via AppProjects
- [ ] Webhooks for instant sync
- [ ] Monitoring with Prometheus ServiceMonitor
- [ ] Sync waves for ordered deployments
- [ ] Rollback strategy documented and tested

---

GitOps isn't just about tools — it's about making Git the single source of truth for everything. Once you get there, deployments become boring. And boring deployments are the best kind.

---

*Running ArgoCD in production? What patterns work for your team? Drop a comment — let's learn from each other.*
