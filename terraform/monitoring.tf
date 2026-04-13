resource "azurerm_application_insights" "main" {
  name                = var.app_insights_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  application_type    = "web"

  # Azure auto-created a managed Log Analytics workspace when this was provisioned via portal
  workspace_id        = "/subscriptions/75b3d2e5-8a1a-4a23-acaf-0ffdf1823cc8/resourceGroups/ai_shopcloud-insights_c102118b-61e5-421b-8cd0-0ca133a833fe_managed/providers/Microsoft.OperationalInsights/workspaces/managed-shopcloud-insights-ws"
  sampling_percentage = 0 # Matches current Azure setting (0 = adaptive sampling off)
}
