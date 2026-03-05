---
title: "Terraform Modules: Building Reusable Infrastructure for Azure"
published: false
description: How to design production-grade Terraform modules for Azure — module architecture, composition patterns, state management, testing, and a real-world module library that provisions infrastructure 90% faster.
tags: terraform, azure, devops, iac
---

Writing Terraform without modules is like writing code without functions — it works until it doesn't.

After building a **reusable module library** that provisions Azure infrastructure **90% faster** across multiple teams, here's how to design modules that actually get adopted.

---

## The Problem With Flat Terraform

```
# Every project starts like this...
main.tf          (2000+ lines)
variables.tf     (500+ lines)
outputs.tf       (200+ lines)

# Then you need a second environment...
# Copy-paste everything.
# Then a third...
# Now you have 3 copies with subtle drift.

# 6 months later:
"Why does staging have a different VM size than production?"
"Who changed the network config in dev?"
"This S3—I mean Storage Account—was supposed to have versioning."
```

---

## Module Architecture

### The Three-Layer Pattern

```
Layer 1: ROOT MODULES (composition layer)
├── Combines child modules for a specific use case
├── Example: "web-app" = AKS + Redis + SQL + Key Vault
└── Teams consume this layer

Layer 2: CHILD MODULES (resource layer)
├── Provisions a single Azure resource type
├── Example: "aks-cluster", "sql-database", "key-vault"
└── Reusable building blocks

Layer 3: UTILITY MODULES (helper layer)
├── Naming conventions, tagging, diagnostics
├── Example: "naming", "tags", "diagnostic-settings"
└── Consistency enforcement
```

```
terraform-modules/
├── modules/
│   ├── aks-cluster/          # Child module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── versions.tf
│   │   └── README.md
│   ├── sql-database/         # Child module
│   ├── key-vault/            # Child module
│   ├── storage-account/      # Child module
│   ├── virtual-network/      # Child module
│   ├── container-registry/   # Child module
│   └── naming/               # Utility module
├── compositions/
│   ├── web-app/              # Root module
│   │   ├── main.tf           # Composes child modules
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── data-platform/        # Root module
├── examples/
│   ├── aks-basic/
│   └── aks-production/
└── tests/
    ├── aks_test.go
    └── sql_test.go
```

---

## Building a Production-Grade Module

### Example: AKS Cluster Module

```hcl
# modules/aks-cluster/versions.tf
terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.80.0"
    }
  }
}
```

```hcl
# modules/aks-cluster/variables.tf
variable "name" {
  description = "Name of the AKS cluster"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.name))
    error_message = "Cluster name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = null  # Uses latest if not specified
}

variable "sku_tier" {
  description = "AKS SKU tier: Free or Standard"
  type        = string
  default     = "Standard"

  validation {
    condition     = contains(["Free", "Standard"], var.sku_tier)
    error_message = "SKU tier must be Free or Standard."
  }
}

variable "system_node_pool" {
  description = "System node pool configuration"
  type = object({
    vm_size    = optional(string, "Standard_D4s_v5")
    node_count = optional(number, 3)
    min_count  = optional(number, 3)
    max_count  = optional(number, 5)
    zones      = optional(list(number), [1, 2, 3])
  })
  default = {}
}

variable "app_node_pools" {
  description = "Map of application node pools"
  type = map(object({
    vm_size    = optional(string, "Standard_D8s_v5")
    min_count  = optional(number, 2)
    max_count  = optional(number, 10)
    zones      = optional(list(number), [1, 2, 3])
    node_labels = optional(map(string), {})
    node_taints = optional(list(string), [])
    priority   = optional(string, "Regular")
  }))
  default = {}
}

variable "network_config" {
  description = "Network configuration"
  type = object({
    plugin         = optional(string, "azure")
    policy         = optional(string, "calico")
    subnet_id      = string
    service_cidr   = optional(string, "10.0.0.0/16")
    dns_service_ip = optional(string, "10.0.0.10")
  })
}

variable "enable_azure_rbac" {
  description = "Enable Azure AD RBAC integration"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
```

```hcl
# modules/aks-cluster/main.tf

# Fetch latest stable K8s version if not specified
data "azurerm_kubernetes_service_versions" "current" {
  location        = var.location
  include_preview = false
}

locals {
  kubernetes_version = coalesce(
    var.kubernetes_version,
    data.azurerm_kubernetes_service_versions.current.latest_version
  )

  default_tags = {
    "managed-by"  = "terraform"
    "module"      = "aks-cluster"
    "k8s-version" = local.kubernetes_version
  }

  tags = merge(local.default_tags, var.tags)
}

resource "azurerm_kubernetes_cluster" "this" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = var.name
  kubernetes_version  = local.kubernetes_version
  sku_tier            = var.sku_tier

  # System node pool
  default_node_pool {
    name                         = "system"
    vm_size                      = var.system_node_pool.vm_size
    node_count                   = var.system_node_pool.node_count
    min_count                    = var.system_node_pool.min_count
    max_count                    = var.system_node_pool.max_count
    auto_scaling_enabled         = true
    zones                        = var.system_node_pool.zones
    only_critical_addons_enabled = true
    temporary_name_for_rotation  = "systemtemp"
    os_disk_type                 = "Ephemeral"
    os_disk_size_gb              = 128
    vnet_subnet_id               = var.network_config.subnet_id

    node_labels = {
      "nodepool-type" = "system"
    }
  }

  # Network configuration
  network_profile {
    network_plugin    = var.network_config.plugin
    network_policy    = var.network_config.policy
    load_balancer_sku = "standard"
    service_cidr      = var.network_config.service_cidr
    dns_service_ip    = var.network_config.dns_service_ip
  }

  # Managed identity (no service principals)
  identity {
    type = "SystemAssigned"
  }

  # Azure AD RBAC
  dynamic "azure_active_directory_role_based_access_control" {
    for_each = var.enable_azure_rbac ? [1] : []
    content {
      azure_rbac_enabled = true
      managed            = true
    }
  }

  # Monitoring
  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.aks.id
  }

  # Maintenance window
  maintenance_window_auto_upgrade {
    frequency   = "Weekly"
    interval    = 1
    day_of_week = "Sunday"
    start_time  = "02:00"
    duration    = 4
    utc_offset  = "+05:30"
  }

  tags = local.tags

  lifecycle {
    ignore_changes = [
      default_node_pool[0].node_count,  # Managed by autoscaler
      kubernetes_version,                # Managed by auto-upgrade
    ]
  }
}

# Application node pools
resource "azurerm_kubernetes_cluster_node_pool" "apps" {
  for_each = var.app_node_pools

  name                  = each.key
  kubernetes_cluster_id = azurerm_kubernetes_cluster.this.id
  vm_size               = each.value.vm_size
  min_count             = each.value.min_count
  max_count             = each.value.max_count
  auto_scaling_enabled  = true
  zones                 = each.value.zones
  os_disk_type          = "Ephemeral"
  os_disk_size_gb       = 128
  vnet_subnet_id        = var.network_config.subnet_id
  priority              = each.value.priority
  node_labels           = each.value.node_labels
  node_taints           = each.value.node_taints

  eviction_policy = each.value.priority == "Spot" ? "Delete" : null
  spot_max_price  = each.value.priority == "Spot" ? -1 : null

  tags = local.tags

  lifecycle {
    ignore_changes = [node_count]
  }
}

# Log Analytics workspace for monitoring
resource "azurerm_log_analytics_workspace" "aks" {
  name                = "${var.name}-logs"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = local.tags
}
```

```hcl
# modules/aks-cluster/outputs.tf
output "cluster_id" {
  description = "AKS cluster resource ID"
  value       = azurerm_kubernetes_cluster.this.id
}

output "cluster_name" {
  description = "AKS cluster name"
  value       = azurerm_kubernetes_cluster.this.name
}

output "kube_config" {
  description = "Kubeconfig for cluster access"
  value       = azurerm_kubernetes_cluster.this.kube_config_raw
  sensitive   = true
}

output "kubelet_identity" {
  description = "Kubelet managed identity"
  value = {
    client_id = azurerm_kubernetes_cluster.this.kubelet_identity[0].client_id
    object_id = azurerm_kubernetes_cluster.this.kubelet_identity[0].object_id
  }
}

output "node_resource_group" {
  description = "Auto-generated resource group for nodes"
  value       = azurerm_kubernetes_cluster.this.node_resource_group
}

output "oidc_issuer_url" {
  description = "OIDC issuer URL for workload identity"
  value       = azurerm_kubernetes_cluster.this.oidc_issuer_url
}
```

---

## Module Consumption

### Simple Usage

```hcl
module "aks" {
  source = "git::https://github.com/myorg/terraform-modules.git//modules/aks-cluster?ref=v2.1.0"

  name                = "aks-prod-eastus"
  resource_group_name = azurerm_resource_group.main.name
  location            = "eastus"

  network_config = {
    subnet_id = module.vnet.subnet_ids["aks"]
  }

  app_node_pools = {
    apps = {
      vm_size   = "Standard_D8s_v5"
      min_count = 3
      max_count = 20
    }
    spot = {
      vm_size   = "Standard_D8s_v5"
      min_count = 0
      max_count = 10
      priority  = "Spot"
      node_taints = [
        "kubernetes.azure.com/scalesetpriority=spot:NoSchedule"
      ]
    }
  }

  tags = {
    environment = "production"
    team        = "platform"
    cost-center = "engineering"
  }
}
```

**5 minutes to provision a production-grade AKS cluster.** Without the module, this would be 200+ lines of hand-written Terraform.

---

## State Management Strategy

```
Rule 1: NEVER use local state in production
Rule 2: One state file per environment per component
Rule 3: State locking is mandatory
Rule 4: Enable versioning for rollback
```

### Backend Configuration

```hcl
# backend.tf
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "sttfstateproduction"
    container_name       = "tfstate"
    key                  = "production/aks/terraform.tfstate"
    use_oidc             = true  # Workload identity authentication
  }
}
```

### State File Layout

```
Storage Account: sttfstateproduction
└── Container: tfstate
    ├── production/
    │   ├── networking/terraform.tfstate
    │   ├── aks/terraform.tfstate
    │   ├── databases/terraform.tfstate
    │   └── monitoring/terraform.tfstate
    ├── staging/
    │   ├── networking/terraform.tfstate
    │   ├── aks/terraform.tfstate
    │   └── databases/terraform.tfstate
    └── dev/
        └── ... (same structure)
```

### Why Separate State Files?

```
❌ One giant state file:
├── terraform plan takes 10 minutes
├── Lock contention between teams
├── Blast radius = everything
└── One mistake = destroy all

✅ Scoped state files:
├── terraform plan takes 30 seconds
├── Teams work independently
├── Blast radius = one component
└── Mistakes are contained
```

---

## Module Versioning

**Always pin module versions.** Use Git tags:

```hcl
# ✅ Pinned to specific version
module "aks" {
  source = "git::https://github.com/myorg/terraform-modules.git//modules/aks-cluster?ref=v2.1.0"
}

# ❌ Using main branch (will break randomly)
module "aks" {
  source = "git::https://github.com/myorg/terraform-modules.git//modules/aks-cluster?ref=main"
}
```

### Semantic Versioning for Modules

```
v1.0.0 → Initial release
v1.1.0 → New optional variable added (non-breaking)
v1.1.1 → Bug fix (non-breaking)
v2.0.0 → Variable renamed or removed (BREAKING)
```

### Release Process

```bash
# After merging to main
git tag -a v2.1.0 -m "feat: add spot node pool support"
git push origin v2.1.0
```

---

## The Composition Pattern

Combine child modules into higher-level abstractions:

```hcl
# compositions/web-app/main.tf

# A "web app" composition = VNet + AKS + ACR + Key Vault + SQL

module "naming" {
  source      = "../../modules/naming"
  project     = var.project_name
  environment = var.environment
  region      = var.location
}

module "vnet" {
  source              = "../../modules/virtual-network"
  name                = module.naming.virtual_network
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  address_space       = [var.vnet_cidr]

  subnets = {
    aks = {
      address_prefix = var.aks_subnet_cidr
    }
    database = {
      address_prefix                            = var.db_subnet_cidr
      private_endpoint_network_policies_enabled = true
    }
  }

  tags = var.tags
}

module "acr" {
  source              = "../../modules/container-registry"
  name                = module.naming.container_registry
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  sku                 = "Premium"  # For geo-replication and private endpoints
  
  allowed_subnet_ids = [module.vnet.subnet_ids["aks"]]

  tags = var.tags
}

module "aks" {
  source              = "../../modules/aks-cluster"
  name                = module.naming.kubernetes_cluster
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location

  network_config = {
    subnet_id = module.vnet.subnet_ids["aks"]
  }

  app_node_pools = var.node_pools

  tags = var.tags
}

module "key_vault" {
  source              = "../../modules/key-vault"
  name                = module.naming.key_vault
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location

  # Grant AKS managed identity access
  access_policies = {
    aks = {
      object_id          = module.aks.kubelet_identity.object_id
      secret_permissions = ["Get", "List"]
    }
  }

  # Private endpoint
  subnet_id = module.vnet.subnet_ids["database"]

  tags = var.tags
}

# Grant AKS → ACR pull access
resource "azurerm_role_assignment" "aks_acr" {
  principal_id         = module.aks.kubelet_identity.object_id
  role_definition_name = "AcrPull"
  scope                = module.acr.registry_id
}
```

### Consuming the Composition

```hcl
# A team provisions their entire stack in 30 lines:
module "web_app" {
  source = "git::https://github.com/myorg/terraform-modules.git//compositions/web-app?ref=v3.0.0"

  project_name = "order-platform"
  environment  = "production"
  location     = "eastus"

  vnet_cidr       = "10.1.0.0/16"
  aks_subnet_cidr = "10.1.0.0/20"
  db_subnet_cidr  = "10.1.16.0/24"

  node_pools = {
    apps = {
      vm_size   = "Standard_D8s_v5"
      min_count = 3
      max_count = 15
    }
  }

  tags = {
    team        = "order-platform"
    cost-center = "CC-1234"
  }
}
```

**From zero to full production infrastructure in 30 lines.** VNet, AKS, ACR, Key Vault, RBAC — all wired together with best practices baked in.

---

## Validation and Testing

### Variable Validation

```hcl
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "vm_size" {
  type = string
  validation {
    condition     = can(regex("^Standard_", var.vm_size))
    error_message = "VM size must be a Standard_ SKU."
  }
}
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.86.0
    hooks:
      - id: terraform_fmt        # Format check
      - id: terraform_validate   # Syntax validation
      - id: terraform_tflint     # Linting
      - id: terraform_docs       # Auto-generate README
      - id: terraform_tfsec      # Security scanning
```

### Automated Testing with Terratest

```go
// tests/aks_test.go
package test

import (
    "testing"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestAksModule(t *testing.T) {
    t.Parallel()

    terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
        TerraformDir: "../examples/aks-basic",
        Vars: map[string]interface{}{
            "name":     "aks-test-ci",
            "location": "eastus",
        },
    })

    defer terraform.Destroy(t, terraformOptions)
    terraform.InitAndApply(t, terraformOptions)

    // Verify outputs
    clusterName := terraform.Output(t, terraformOptions, "cluster_name")
    assert.Equal(t, "aks-test-ci", clusterName)

    nodeRG := terraform.Output(t, terraformOptions, "node_resource_group")
    assert.Contains(t, nodeRG, "aks-test-ci")
}
```

---

## CI/CD for Modules

```yaml
# .github/workflows/module-ci.yml
name: Module CI

on:
  pull_request:
    paths:
      - 'modules/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        module: [aks-cluster, sql-database, key-vault, virtual-network]
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.7.0"

      - name: Terraform Format
        run: terraform fmt -check -recursive
        working-directory: modules/${{ matrix.module }}

      - name: Terraform Init
        run: terraform init -backend=false
        working-directory: modules/${{ matrix.module }}

      - name: Terraform Validate
        run: terraform validate
        working-directory: modules/${{ matrix.module }}

      - name: TFLint
        uses: terraform-linters/setup-tflint@v4
      - run: |
          tflint --init
          tflint --recursive
        working-directory: modules/${{ matrix.module }}

      - name: TFSec Security Scan
        uses: aquasecurity/tfsec-action@v1.0.3
        with:
          working_directory: modules/${{ matrix.module }}
```

---

## The Module Adoption Checklist

Before releasing a module to your org:

- [ ] **README.md** with examples (terraform-docs auto-generates this)
- [ ] **Input validation** on all variables
- [ ] **Sensible defaults** (works out of the box)
- [ ] **Outputs** for everything downstream modules need
- [ ] **Version pinning** for providers
- [ ] **Lifecycle rules** (ignore autoscaler changes, etc.)
- [ ] **Tags** applied consistently to all resources
- [ ] **Examples** in an `/examples` directory
- [ ] **Tests** (at minimum, `terraform validate`)
- [ ] **Security scan** passing (tfsec/checkov)
- [ ] **Semantic version tag** on release
- [ ] **CHANGELOG.md** documenting breaking changes

---

Build the module library once. Let every team provision infrastructure in minutes instead of weeks. That's the power of reusable Terraform.

---

*Building Terraform modules? Share your patterns in the comments. Follow for more infrastructure-as-code content.*
