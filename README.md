# ShopCloud — Product Catalogue

Cloud Computing Assignment 2 | IIT Delhi | 2025

Live URL: https://shopcloud-pranav.azurewebsites.net

---

## What is this

A full-stack product catalogue app deployed on Microsoft Azure. You can add products, upload images, browse/search/filter them, add to cart, and checkout. Several Azure AI services are integrated — Computer Vision tags images automatically, Language AI generates descriptions, and Translator translates them.

---

## Features

- **Product listing** with search, category filter, and sort (newest / price / rating)
- **Add / Edit / Delete products** with image upload to Azure Blob Storage
- **AI auto-tags** — when you upload an image, Computer Vision tags it automatically
- **AI auto-description** — click "✨ Auto-generate" and Language AI writes a description based on the product name, category, and image tags
- **Cart** — add items, change quantities, remove items, see total
- **Checkout** — fill in contact + shipping details, get an order confirmation with order number
- **Reviews** — leave star ratings and text reviews on any product
- **Sentiment analysis** — reviews are analyzed by Language AI (positive/negative/neutral)
- **Translation** — translate product descriptions to Hindi, French, Spanish, etc. via Azure Translator
- **Stats on homepage** — total products, categories, avg price, featured count
- **Application Insights** — all requests/errors tracked in Azure

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | Azure PostgreSQL Flexible Server (Sequelize ORM) |
| Images | Azure Blob Storage |
| AI Tagging | Azure Computer Vision |
| Descriptions | Azure Language AI (Text Analytics) |
| Translation | Azure Translator |
| Monitoring | Azure Application Insights |
| Hosting | Azure App Service (F1 Linux) |

---

## Project Structure

```
product-catalogue/
├── server/
│   ├── server.js              # Express app entry point
│   ├── config/db.js           # Sequelize + PostgreSQL connection
│   ├── models/Product.js      # Product schema (UUID, JSONB reviews, etc.)
│   ├── routes/products.js     # All product CRUD + AI endpoints
│   ├── routes/translate.js    # Translation endpoint
│   ├── services/
│   │   ├── blobStorage.js     # Azure Blob upload/delete
│   │   ├── computerVision.js  # Image tagging (URL + buffer stream)
│   │   ├── languageService.js # Key phrase extraction + sentiment
│   │   └── translatorService.js
│   ├── middleware/upload.js   # Multer config for image uploads
│   └── seed.js                # Seeds 16 sample products
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Product grid + filters + hero
│   │   │   ├── ProductDetail.jsx  # Product page + reviews + translation
│   │   │   ├── AddProduct.jsx     # Add product form with AI description
│   │   │   ├── EditProduct.jsx    # Edit product form
│   │   │   ├── Checkout.jsx       # Checkout form
│   │   │   └── OrderConfirmation.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Search bar + cart icon
│   │   │   ├── CartDrawer.jsx     # Side drawer cart
│   │   │   ├── ProductCard.jsx    # Card with hover add-to-cart
│   │   │   ├── StarRating.jsx     # Star rating component
│   │   │   └── Footer.jsx
│   │   ├── context/CartContext.jsx
│   │   └── services/api.js        # All API calls
│   └── tailwind.config.js
├── deploy.zip                 # What gets deployed to Azure
└── README.md
```

---

## Azure Resources Created

All in resource group `rg-product-catalogue`, region `eastasia`.

```
shopcloud-plan              → App Service Plan (F1 Linux)
shopcloud-pranav            → App Service (Node 20 LTS)
shopcloud-pg-pranav         → PostgreSQL Flexible Server (Standard_B1ms)
shopcloudpranavstore        → Storage Account → container: products
shopcloud-vision-Pranav     → Cognitive Services (Computer Vision + Language AI)
shopcloud-translator        → Cognitive Services (Text Translator)
shopcloud-insights          → Application Insights
```

---

## Environment Variables

```env
DATABASE_URL=postgresql://pgadmin:password@shopcloud-pg-pranav.postgres.database.azure.com/productcatalogue?sslmode=require

AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER=products

AZURE_VISION_KEY=...
AZURE_VISION_ENDPOINT=https://eastasia.api.cognitive.microsoft.com/

AZURE_LANGUAGE_KEY=...
AZURE_LANGUAGE_ENDPOINT=https://eastasia.api.cognitive.microsoft.com/

AZURE_TRANSLATOR_KEY=...
AZURE_TRANSLATOR_REGION=eastasia

APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=...

PORT=5000
NODE_ENV=development
```

---

## Running Locally

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Add your .env file (see above)

# Seed the database with 16 sample products
node server/seed.js

# Run both frontend and backend together
npm run dev
```

Frontend runs at http://localhost:5173
Backend API runs at http://localhost:5000

---

## Deploying to Azure

These are the exact commands used for this deployment:

### One-time setup

```bash
# Login
az login

# Resource group
az group create --name rg-product-catalogue --location eastasia

# PostgreSQL
az postgres flexible-server create \
  --name shopcloud-pg-pranav \
  --resource-group rg-product-catalogue \
  --location eastasia \
  --admin-user pgadmin \
  --admin-password "ShopCloud@2024!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16

az postgres flexible-server db create \
  --server-name shopcloud-pg-pranav \
  --resource-group rg-product-catalogue \
  --database-name productcatalogue

# Allow Azure services to reach the DB
az postgres flexible-server firewall-rule create \
  --name AllowAzureServices \
  --server-name shopcloud-pg-pranav \
  --resource-group rg-product-catalogue \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Blob Storage
az storage account create \
  --name shopcloudpranavstore \
  --resource-group rg-product-catalogue \
  --location eastasia \
  --sku Standard_LRS \
  --allow-blob-public-access true

az storage container create \
  --name products \
  --account-name shopcloudpranavstore \
  --public-access blob

# Cognitive Services (covers Computer Vision + Language AI)
az cognitiveservices account create \
  --name shopcloud-vision-Pranav \
  --resource-group rg-product-catalogue \
  --kind CognitiveServices \
  --sku S0 \
  --location eastasia \
  --yes

# Translator
az cognitiveservices account create \
  --name shopcloud-translator \
  --resource-group rg-product-catalogue \
  --kind TextTranslation \
  --sku F0 \
  --location eastasia \
  --yes

# App Insights
az monitor app-insights component create \
  --app shopcloud-insights \
  --location eastasia \
  --resource-group rg-product-catalogue \
  --application-type web

# App Service plan
az appservice plan create \
  --name shopcloud-plan \
  --resource-group rg-product-catalogue \
  --sku F1 \
  --is-linux \
  --location eastasia

# Web app
az webapp create \
  --name shopcloud-pranav \
  --resource-group rg-product-catalogue \
  --plan shopcloud-plan \
  --runtime "NODE|20-lts"

# Set environment variables
az webapp config appsettings set \
  --name shopcloud-pranav \
  --resource-group rg-product-catalogue \
  --settings \
    NODE_ENV="production" \
    PORT="8080" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="false" \
    DATABASE_URL="postgresql://pgadmin:password@shopcloud-pg-pranav.postgres.database.azure.com/productcatalogue?sslmode=require" \
    AZURE_STORAGE_CONNECTION_STRING="your-value" \
    AZURE_STORAGE_CONTAINER="products" \
    AZURE_VISION_KEY="your-value" \
    AZURE_VISION_ENDPOINT="https://eastasia.api.cognitive.microsoft.com/" \
    AZURE_LANGUAGE_KEY="your-value" \
    AZURE_LANGUAGE_ENDPOINT="https://eastasia.api.cognitive.microsoft.com/" \
    AZURE_TRANSLATOR_KEY="your-value" \
    AZURE_TRANSLATOR_REGION="eastasia" \
    APPINSIGHTS_CONNECTION_STRING="your-value"
```

### Every redeployment

```bash
# Build the React frontend
cd client && npm run build && cd ..

# Package everything (include node_modules — needed since build is disabled on Azure)
zip -r deploy.zip . \
  -x "client/node_modules/*" \
  -x "client/src/*" \
  -x ".git/*" \
  -x ".claude/*"

# Deploy
az webapp deployment source config-zip \
  --name shopcloud-pranav \
  --resource-group rg-product-catalogue \
  --src deploy.zip
```

> **Note:** `SCM_DO_BUILD_DURING_DEPLOYMENT=false` means Azure won't run `npm install` on the server.
> That's why server `node_modules` must be included in the zip.

---

## API Endpoints

```
GET    /api/products              list with filters (search, category, sort, page)
POST   /api/products              create product (multipart form)
GET    /api/products/stats        homepage stats
GET    /api/products/categories   list categories
POST   /api/products/analyze-image      analyze image buffer → tags (pre-upload)
POST   /api/products/generate-description  AI description from name/category/tags
GET    /api/products/:id          get single product
PUT    /api/products/:id          update product
DELETE /api/products/:id          delete product
POST   /api/products/:id/reviews  add review (triggers sentiment analysis)
POST   /api/products/:id/chat     Q&A about product (Language AI)

POST   /api/translate             translate text to target language
```

---

## Things I Learned / Gotchas

- **F1 tier has a 60 CPU-minute daily quota** — the app may get automatically suspended if the quota is exceeded. Restart the app service if that happens.
- **Sequelize `sync({ alter: true })`** is expensive on startup (it introspects every table). Changed to plain `sync()` since tables are already created.
- **Computer Vision streaming** — to analyze an image before uploading, you pass a factory function `() => Readable.from(buffer)` not the stream itself.
- **PostgreSQL vs MongoDB field names** — Sequelize uses `.id` (UUID), Mongoose used `._id`. Had to update all frontend references.
- **Azure App Service zip deploy** excludes node_modules by default when `SCM_DO_BUILD_DURING_DEPLOYMENT=false`. The zip must include them or the app crashes on start.
