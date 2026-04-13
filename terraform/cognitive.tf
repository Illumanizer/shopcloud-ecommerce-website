# Azure Computer Vision
resource "azurerm_cognitive_account" "vision" {
  name                = var.cognitive_vision_account_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  kind                = "ComputerVision"
  sku_name            = "F0" # Free tier — matches actual deployed SKU
}

# Azure Language AI (Text Analytics)
resource "azurerm_cognitive_account" "language" {
  name                = var.cognitive_language_account_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  kind                = "TextAnalytics"
  sku_name            = "F0" # Free tier — matches actual deployed SKU
}

# Azure Translator (separate account, uses TextTranslation kind)
resource "azurerm_cognitive_account" "translator" {
  name                = var.translator_account_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  kind                = "TextTranslation"
  sku_name            = "F0" # Free tier: 2 million characters/month
}
