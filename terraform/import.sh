#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# import.sh — Import all existing Azure resources into Terraform state
#
# Run this ONCE after `terraform init`, before `terraform plan`.
# After importing, Terraform will manage these resources without recreating them.
#
# Usage: bash import.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

SUB="75b3d2e5-8a1a-4a23-acaf-0ffdf1823cc8"
RG="rg-product-catalogue"

echo "▶ Importing Resource Group..."
terraform import azurerm_resource_group.main \
  "/subscriptions/$SUB/resourceGroups/$RG"

echo "▶ Importing PostgreSQL Flexible Server..."
terraform import azurerm_postgresql_flexible_server.main \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.DBforPostgreSQL/flexibleServers/shopcloud-pg-pranav"

echo "▶ Importing PostgreSQL Database..."
terraform import azurerm_postgresql_flexible_server_database.main \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.DBforPostgreSQL/flexibleServers/shopcloud-pg-pranav/databases/productcatalogue"

echo "▶ Importing PostgreSQL Firewall Rule (Azure Services)..."
terraform import azurerm_postgresql_flexible_server_firewall_rule.allow_azure_services \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.DBforPostgreSQL/flexibleServers/shopcloud-pg-pranav/firewallRules/AllowAllAzureServicesAndResourcesWithinAzureIps_2026-3-8_12-25-15"

echo "▶ Importing PostgreSQL Firewall Rule (local-dev IP)..."
terraform import azurerm_postgresql_flexible_server_firewall_rule.allow_local_dev \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.DBforPostgreSQL/flexibleServers/shopcloud-pg-pranav/firewallRules/allow-local-dev"

echo "▶ Importing PostgreSQL Firewall Rule (AllowLocalIP)..."
terraform import azurerm_postgresql_flexible_server_firewall_rule.allow_local_ip \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.DBforPostgreSQL/flexibleServers/shopcloud-pg-pranav/firewallRules/AllowLocalIP"

echo "▶ Importing Storage Account..."
terraform import azurerm_storage_account.main \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.Storage/storageAccounts/shopcloudpranavstore"

echo "▶ Importing Storage Container..."
terraform import azurerm_storage_container.products \
  "https://shopcloudpranavstore.blob.core.windows.net/product-images"

echo "▶ Importing Computer Vision account..."
terraform import azurerm_cognitive_account.vision \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.CognitiveServices/accounts/shopcloud-vision-Pranav"

echo "▶ Importing Language AI account..."
terraform import azurerm_cognitive_account.language \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.CognitiveServices/accounts/shopcloud-language-pranav"

echo "▶ Importing Translator account..."
terraform import azurerm_cognitive_account.translator \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.CognitiveServices/accounts/shopcloud-translator-pranav"

echo "▶ Importing Application Insights..."
terraform import azurerm_application_insights.main \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.Insights/components/shopcloud-insights"

echo "▶ Importing App Service Plan..."
terraform import azurerm_service_plan.main \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.Web/serverFarms/shopcloud-plan"

echo "▶ Importing Web App..."
terraform import azurerm_linux_web_app.main \
  "/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.Web/sites/shopcloud-pranav"

echo ""
echo "✅ All resources imported! Run 'terraform plan' to verify no changes are needed."
