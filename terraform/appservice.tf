resource "azurerm_service_plan" "main" {
  name                = var.app_service_plan_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "F1" # Free tier
}

resource "azurerm_linux_web_app" "main" {
  name                = var.app_service_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on    = false       # Must be false on F1 (free tier does not support Always On)
    ftps_state   = "FtpsOnly" # Matches current Azure setting
    http2_enabled = true       # Matches current Azure setting

    ip_restriction_default_action     = "Allow" # Matches current Azure setting
    scm_ip_restriction_default_action = "Allow" # Matches current Azure setting

    application_stack {
      node_version = "20-lts"
    }
  }

  client_affinity_enabled                        = true  # Matches current Azure setting
  ftp_publish_basic_authentication_enabled       = false # Keep disabled for security
  webdeploy_publish_basic_authentication_enabled = false # Keep disabled for security

  app_settings = {
    # Runtime config
    NODE_ENV                       = "production"
    PORT                           = "8080"
    SCM_DO_BUILD_DURING_DEPLOYMENT = "false"

    # Application Insights agent (set by Azure portal)
    APPLICATIONINSIGHTS_ENABLE_AGENT = "false"

    # Database
    DATABASE_URL = "postgresql://${var.db_admin_login}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}/${var.db_name}?sslmode=require"

    # Blob Storage
    # Note: the app hardcodes CONTAINER_NAME = "product-images" in blobStorage.js and does not
    # read this env var. The value here matches var.storage_container_name for consistency.
    AZURE_STORAGE_CONNECTION_STRING = var.azure_storage_connection_string
    AZURE_STORAGE_CONTAINER         = var.storage_container_name # "product-images"

    # Cognitive Services (Computer Vision + Language AI share the same endpoint/key)
    AZURE_VISION_KEY        = var.azure_vision_key
    AZURE_VISION_ENDPOINT   = "https://${var.location}.api.cognitive.microsoft.com/"
    AZURE_LANGUAGE_KEY      = var.azure_language_key
    AZURE_LANGUAGE_ENDPOINT = "https://${var.location}.api.cognitive.microsoft.com/"

    # Translator
    AZURE_TRANSLATOR_KEY    = var.azure_translator_key
    AZURE_TRANSLATOR_REGION = var.location

    # Application Insights
    APPINSIGHTS_CONNECTION_STRING = var.appinsights_connection_string
  }
}
