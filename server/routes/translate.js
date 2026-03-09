const express = require("express");
const { body, validationResult } = require("express-validator");
const { translateTexts } = require("../services/translatorService");

const router = express.Router();

const SUPPORTED_LANGUAGES = {
  hi: "Hindi",
  fr: "French",
  de: "German",
  es: "Spanish",
  ja: "Japanese",
  zh: "Chinese (Simplified)",
  ar: "Arabic",
};

// POST /api/translate
router.post(
  "/",
  [
    body("texts").isArray({ min: 1, max: 10 }).withMessage("texts must be an array of 1–10 strings"),
    body("texts.*").isString().trim().notEmpty(),
    body("targetLanguage")
      .trim()
      .notEmpty()
      .isIn(Object.keys(SUPPORTED_LANGUAGES))
      .withMessage(`Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}`),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { texts, targetLanguage } = req.body;

    const translated = await translateTexts(texts, targetLanguage);

    if (!translated) {
      return res.status(503).json({ error: "Translation service unavailable — check AZURE_TRANSLATOR_KEY in .env" });
    }

    res.json({ translated, targetLanguage, languageName: SUPPORTED_LANGUAGES[targetLanguage] });
  }
);

// GET /api/translate/languages — return supported languages
router.get("/languages", (req, res) => {
  res.json(SUPPORTED_LANGUAGES);
});

module.exports = router;
