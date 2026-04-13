resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = "canadacentral" # Intentionally different from var.location (eastasia) to match actual Azure deployment
}
