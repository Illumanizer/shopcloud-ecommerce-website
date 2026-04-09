require("dotenv").config();

// Azure Application Insights - must be initialized before other imports
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  const appInsights = require("applicationinsights");
  appInsights
    .setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .start();
  console.log("✅ Azure Application Insights initialized");
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");
const productRoutes = require("./routes/products");
const translateRoutes = require("./routes/translate");

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/translate", translateRoutes);

// Log status of all Azure services on startup
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  Azure Services Status:");
console.log(`  Blob Storage    : ${process.env.AZURE_STORAGE_CONNECTION_STRING ? "✅ configured" : "❌ missing AZURE_STORAGE_CONNECTION_STRING"}`);
console.log(`  Computer Vision : ${process.env.AZURE_VISION_KEY ? "✅ configured" : "❌ missing AZURE_VISION_KEY"}`);
console.log(`  Language AI     : ${process.env.AZURE_LANGUAGE_KEY ? "✅ configured" : "❌ missing AZURE_LANGUAGE_KEY"}`);
console.log(`  Translator      : ${process.env.AZURE_TRANSLATOR_KEY ? "✅ configured" : "❌ missing AZURE_TRANSLATOR_KEY"}`);
console.log(`  App Insights    : ${process.env.APPINSIGHTS_CONNECTION_STRING ? "✅ configured" : "❌ missing APPINSIGHTS_CONNECTION_STRING"}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Something went wrong",
    message:
      process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
