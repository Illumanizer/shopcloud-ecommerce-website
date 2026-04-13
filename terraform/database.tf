resource "azurerm_postgresql_flexible_server" "main" {
  name                   = var.db_server_name
  resource_group_name    = azurerm_resource_group.main.name
  location               = var.location
  version                = "16"
  administrator_login    = var.db_admin_login
  administrator_password = var.db_admin_password

  sku_name   = "B_Standard_B1ms"
  storage_mb = 32768


  # Backup retention (minimum for cost savings)
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  zone = "1"
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = var.db_name
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Azure auto-generated this rule name when 'Allow Azure services' was enabled in portal
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "AllowAllAzureServicesAndResourcesWithinAzureIps_2026-3-8_12-25-15"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Local dev machine IPs (added during development)
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_local_dev" {
  name             = "allow-local-dev"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "152.59.183.68"
  end_ip_address   = "152.59.183.68"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_local_ip" {
  name             = "AllowLocalIP"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "103.27.10.68"
  end_ip_address   = "103.27.10.68"
}
