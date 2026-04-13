variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "eastasia"
}

variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
  default     = "rg-product-catalogue"
}

# ── PostgreSQL ────────────────────────────────────────────────────────────────

variable "db_admin_login" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "pgadmin"
}

variable "db_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "db_server_name" {
  description = "PostgreSQL flexible server name"
  type        = string
  default     = "shopcloud-pg-pranav"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "productcatalogue"
}

# ── Storage ───────────────────────────────────────────────────────────────────

variable "storage_account_name" {
  description = "Azure Storage Account name (must be globally unique, lowercase, 3-24 chars)"
  type        = string
  default     = "shopcloudpranavstore"
}

variable "storage_container_name" {
  description = "Blob container name for product images"
  type        = string
  default     = "product-images"
}

# ── Cognitive Services ────────────────────────────────────────────────────────

variable "cognitive_vision_account_name" {
  description = "Cognitive Services Computer Vision account name"
  type        = string
  default     = "shopcloud-vision-Pranav"
}

variable "cognitive_language_account_name" {
  description = "Cognitive Services Language account name"
  type        = string
  default     = "shopcloud-language-pranav"
}

variable "translator_account_name" {
  description = "Azure Translator Cognitive Services account name"
  type        = string
  default     = "shopcloud-translator-pranav"
}

# ── App Service ───────────────────────────────────────────────────────────────

variable "app_service_plan_name" {
  description = "App Service Plan name"
  type        = string
  default     = "shopcloud-plan"
}

variable "app_service_name" {
  description = "Web App name (must be globally unique)"
  type        = string
  default     = "shopcloud-pranav"
}

# ── App Settings (secrets passed in via tfvars) ───────────────────────────────

variable "azure_storage_connection_string" {
  description = "Azure Blob Storage connection string"
  type        = string
  sensitive   = true
}

variable "azure_vision_key" {
  description = "Azure Computer Vision API key"
  type        = string
  sensitive   = true
}

variable "azure_language_key" {
  description = "Azure Language AI API key"
  type        = string
  sensitive   = true
}

variable "azure_translator_key" {
  description = "Azure Translator API key"
  type        = string
  sensitive   = true
}

variable "appinsights_connection_string" {
  description = "Azure Application Insights connection string"
  type        = string
  sensitive   = true
}

# ── Monitoring ────────────────────────────────────────────────────────────────

variable "app_insights_name" {
  description = "Application Insights component name"
  type        = string
  default     = "shopcloud-insights"
}
