const { ComputerVisionClient } = require("@azure/cognitiveservices-computervision");
const { ApiKeyCredentials } = require("@azure/ms-rest-js");

let visionClient = null;

function getVisionClient() {
  if (visionClient) return visionClient;

  const key = process.env.AZURE_VISION_KEY;
  const endpoint = process.env.AZURE_VISION_ENDPOINT;

  if (!key || !endpoint) {
    console.warn("⚠️  Azure Computer Vision not configured — AI tagging disabled");
    return null;
  }

  visionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
    endpoint
  );
  console.log("✅ Azure Computer Vision client ready");
  return visionClient;
}

/**
 * Analyze an image URL and return descriptive tags.
 * Uses Azure Cognitive Services Computer Vision API.
 */
async function analyzeImage(imageUrl) {
  const client = getVisionClient();
  if (!client) {
    console.warn("⚠️  Computer Vision client not available — check AZURE_VISION_KEY and AZURE_VISION_ENDPOINT in .env");
    return [];
  }

  try {
    console.log("🔍 Analyzing image with Computer Vision:", imageUrl);
    const result = await client.analyzeImage(imageUrl, {
      visualFeatures: ["Tags", "Description"],
    });

    const allTags = result.tags || [];
    console.log(`📊 Computer Vision returned ${allTags.length} raw tags:`, allTags.map(t => `${t.name}(${t.confidence.toFixed(2)})`).join(", "));

    const tags = allTags
      .filter((t) => t.confidence > 0.7)
      .map((t) => t.name)
      .slice(0, 10);

    console.log(`✅ Filtered tags (confidence > 0.7):`, tags);
    return tags;
  } catch (error) {
    console.error("❌ Computer Vision error:", error.message);
    console.error("   Endpoint:", process.env.AZURE_VISION_ENDPOINT);
    console.error("   Key set:", !!process.env.AZURE_VISION_KEY);
    return [];
  }
}

/**
 * Analyze an image buffer and return descriptive tags.
 * Used for pre-upload analysis (e.g., description generation before save).
 */
async function analyzeImageFromBuffer(buffer) {
  const client = getVisionClient();
  if (!client) return [];

  try {
    const { Readable } = require("stream");
    const result = await client.analyzeImageInStream(() => Readable.from(buffer), {
      visualFeatures: ["Tags", "Description"],
    });

    const tags = (result.tags || [])
      .filter((t) => t.confidence > 0.7)
      .map((t) => t.name)
      .slice(0, 10);

    return tags;
  } catch (error) {
    console.error("❌ Computer Vision stream error:", error.message);
    return [];
  }
}

module.exports = { analyzeImage, analyzeImageFromBuffer };
