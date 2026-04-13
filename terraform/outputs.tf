output "app_url" {
  description = "Live URL of the deployed ShopCloud app"
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "postgres_fqdn" {
  description = "PostgreSQL server fully qualified domain name"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "storage_account_endpoint" {
  description = "Blob Storage primary endpoint"
  value       = azurerm_storage_account.main.primary_blob_endpoint
}

output "cognitive_vision_endpoint" {
  description = "Computer Vision endpoint"
  value       = azurerm_cognitive_account.vision.endpoint
}

output "cognitive_language_endpoint" {
  description = "Language AI endpoint"
  value       = azurerm_cognitive_account.language.endpoint
}

output "translator_endpoint" {
  description = "Azure Translator endpoint"
  value       = azurerm_cognitive_account.translator.endpoint
}

output "app_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "app_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}
