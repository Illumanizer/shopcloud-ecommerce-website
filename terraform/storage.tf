resource "azurerm_storage_account" "main" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.main.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  # Allow public blob access (needed so product images are publicly viewable)
  allow_nested_items_to_be_public = true

  # Match actual Azure settings to avoid drift
  min_tls_version                  = "TLS1_0" # Current Azure setting (portal default at creation time)
  cross_tenant_replication_enabled = false     # Matches current Azure setting
}

resource "azurerm_storage_container" "products" {
  name                  = var.storage_container_name
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob" # Public read access for blobs (not container listing)
}
