const axios = require("axios");

/**
 * Translate an array of strings to a target language using Azure Translator.
 * @param {string[]} texts - Array of strings to translate
 * @param {string} targetLanguage - BCP-47 language code (e.g. "hi", "fr", "de", "es")
 * @returns {string[]|null} Translated strings, or null if service is unavailable
 */
async function translateTexts(texts, targetLanguage) {
  const key = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION || "eastasia";

  if (!key) {
    console.warn("⚠️  Azure Translator not configured — translation disabled");
    return null;
  }

  try {
    const body = texts.map((t) => ({ text: t }));
    const response = await axios.post(
      "https://api.cognitive.microsofttranslator.com/translate",
      body,
      {
        params: { "api-version": "3.0", to: targetLanguage },
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.map((r) => r.translations[0].text);
  } catch (err) {
    console.error("❌ Translator error:", err.response?.data?.error?.message || err.message);
    return null;
  }
}

module.exports = { translateTexts };
