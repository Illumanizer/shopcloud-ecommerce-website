# ShopCloud — Terraform Infrastructure

This directory contains the Terraform configuration for the ShopCloud e-commerce platform deployed on Microsoft Azure.

## Architecture

| Resource | Azure Service | SKU |
|---|---|---|
| Web App | Azure App Service (Linux) | F1 Free, Node 20 LTS |
| Database | Azure Database for PostgreSQL Flexible Server | B_Standard_B1ms, 32 GB |
| Blob Storage | Azure Storage Account | Standard LRS |
| Computer Vision | Azure Cognitive Services | F0 Free |
| Language AI | Azure Cognitive Services | F0 Free |
| Translator | Azure Cognitive Services | F0 Free |
| Monitoring | Azure Application Insights | Workspace-based |

## File Structure

```
terraform/
├── main.tf              # Provider config (azurerm ~> 3.90)
├── variables.tf         # All input variables
├── resource_group.tf    # Azure Resource Group
├── appservice.tf        # App Service Plan + Linux Web App
├── database.tf          # PostgreSQL server, database, firewall rules
├── storage.tf           # Storage Account + Blob Container
├── cognitive.tf         # Computer Vision, Language AI, Translator
├── monitoring.tf        # Application Insights
├── outputs.tf           # App URL, DB FQDN, endpoints
├── import.sh            # One-time import script for existing resources
├── terraform.tfvars.example  # Example variables file (copy to terraform.tfvars)
└── README.md            # This file
```

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.5.0
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed and authenticated
- An active Azure subscription

## Setup

### 1. Authenticate with Azure

```bash
az login
az account set --subscription "<your-subscription-id>"
```

### 2. Configure variables

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and fill in all required values
```

Required values in `terraform.tfvars`:

```hcl
subscription_id                 = "your-azure-subscription-id"
db_admin_password               = "your-postgres-password"
azure_storage_connection_string = "your-blob-storage-connection-string"
azure_vision_key                = "your-computer-vision-key"
azure_language_key              = "your-language-ai-key"
azure_translator_key            = "your-translator-key"
appinsights_connection_string   = "your-app-insights-connection-string"
```

### 3. Initialize Terraform

```bash
terraform init
```

## Deployment

### Option A — Fresh deployment (new resources)

```bash
terraform validate
terraform plan
terraform apply
```

### Option B — Import existing Azure resources (used in this project)

If resources are already deployed in Azure, import them before applying:

```bash
terraform init
bash import.sh      # imports all 14 existing resources into state
terraform plan      # verify: should show 0 to destroy
terraform apply
```

## Verify Deployment

```bash
terraform validate   # check configuration syntax
terraform plan       # preview changes
terraform apply      # apply changes
terraform show       # display full current state
terraform output     # show output values (app URL, DB FQDN, etc.)
```

## Outputs

After apply, Terraform outputs:

| Output | Description |
|---|---|
| `app_url` | Live URL of the deployed ShopCloud app |
| `postgres_fqdn` | PostgreSQL server fully qualified domain name |
| `storage_account_endpoint` | Blob Storage primary endpoint |
| `cognitive_vision_endpoint` | Computer Vision API endpoint |
| `cognitive_language_endpoint` | Language AI endpoint |
| `translator_endpoint` | Azure Translator endpoint |

## Notes

- `terraform.tfvars` is excluded from version control — never commit secrets
- The F1 App Service tier does not support `always_on` — cold starts may occur after idle periods
- All Cognitive Services use F0 (free) tier — suitable for demo/development usage
- PostgreSQL B1ms is the minimum burstable tier — upgrade for production workloads
- The `AZURE_STORAGE_CONTAINER` app setting references `var.storage_container_name` (`"product-images"`). Note that `server/services/blobStorage.js` hardcodes the container name directly and does not read this env var — the setting is kept for documentation/consistency purposes.
