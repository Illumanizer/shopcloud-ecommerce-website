const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");

let client = null;

function getClient() {
  if (client) return client;

  const key = process.env.AZURE_LANGUAGE_KEY;
  const endpoint = process.env.AZURE_LANGUAGE_ENDPOINT;

  if (!key || !endpoint) {
    console.warn("⚠️  Azure Language service not configured — sentiment/chat disabled");
    return null;
  }

  client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));
  console.log("✅ Azure Language service client ready");
  return client;
}

/**
 * Analyze sentiment of a piece of text.
 * Returns { sentiment: "positive"|"negative"|"neutral"|"mixed", score: 0-1 }
 */
async function analyzeSentiment(text) {
  const c = getClient();
  if (!c) return null;

  try {
    const [result] = await c.analyzeSentiment([text]);
    if (result.error) return null;

    const scoreMap = { positive: result.confidenceScores.positive, negative: result.confidenceScores.negative, neutral: result.confidenceScores.neutral, mixed: 0 };
    const score = scoreMap[result.sentiment] || 0;

    return { sentiment: result.sentiment, score: parseFloat(score.toFixed(2)) };
  } catch (err) {
    console.error("❌ Sentiment analysis error:", err.message);
    return null;
  }
}

/**
 * Extract key phrases from text to understand user intent.
 * Used to power the product chat assistant.
 */
async function extractKeyPhrases(text) {
  const c = getClient();
  if (!c) return [];

  try {
    const [result] = await c.extractKeyPhrases([text]);
    if (result.error) return [];
    return result.keyPhrases;
  } catch (err) {
    console.error("❌ Key phrase extraction error:", err.message);
    return [];
  }
}

module.exports = { analyzeSentiment, extractKeyPhrases };
