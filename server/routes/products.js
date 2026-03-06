const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const Product = require("../models/Product");
const upload = require("../middleware/upload");
const { uploadImage, deleteImage } = require("../services/blobStorage");
const { analyzeImage } = require("../services/computerVision");
const { analyzeSentiment, extractKeyPhrases } = require("../services/languageService");

const router = express.Router();

// Helper: send validation errors
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
}

// ─── GET /api/products ──────────────────────────────────────────────
// List all products with pagination, search, category filter, and sorting
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
    query("category").optional().isString().trim(),
    query("search").optional().isString().trim(),
    query("sort").optional().isIn(["price_asc", "price_desc", "newest", "rating"]),
    query("featured").optional().isBoolean().toBoolean(),
  ],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const page = req.query.page || 1;
      const limit = req.query.limit || 12;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (req.query.category) filter.category = req.query.category;
      if (req.query.featured) filter.featured = true;
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: "i" } },
          { description: { $regex: req.query.search, $options: "i" } },
          { aiTags: { $regex: req.query.search, $options: "i" } },
        ];
      }

      // Build sort
      let sort = { createdAt: -1 };
      switch (req.query.sort) {
        case "price_asc":
          sort = { price: 1 };
          break;
        case "price_desc":
          sort = { price: -1 };
          break;
        case "rating":
          sort = { averageRating: -1 };
          break;
        case "newest":
        default:
          sort = { createdAt: -1 };
      }

      const [products, total] = await Promise.all([
        Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Product.countDocuments(filter),
      ]);

      res.json({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("GET /products error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
);

// ─── GET /api/products/categories ───────────────────────────────────
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ─── GET /api/products/stats ────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [totalProducts, totalCategories, avgPrice, featuredCount] = await Promise.all([
      Product.countDocuments(),
      Product.distinct("category").then((c) => c.length),
      Product.aggregate([{ $group: { _id: null, avg: { $avg: "$price" } } }]),
      Product.countDocuments({ featured: true }),
    ]);

    res.json({
      totalProducts,
      totalCategories,
      averagePrice: avgPrice[0]?.avg?.toFixed(2) || "0.00",
      featuredCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─── GET /api/products/:id ──────────────────────────────────────────
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid product ID")],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  }
);

// ─── POST /api/products ─────────────────────────────────────────────
router.post(
  "/",
  upload.single("image"),
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Product name is required")
      .isLength({ max: 200 })
      .withMessage("Name too long"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 2000 })
      .withMessage("Description too long"),
    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 0, max: 999999.99 })
      .withMessage("Price must be between 0 and 999,999.99"),
    body("category")
      .trim()
      .notEmpty()
      .withMessage("Category is required")
      .isIn([
        "Electronics",
        "Clothing",
        "Books",
        "Home & Kitchen",
        "Sports",
        "Toys",
        "Health & Beauty",
        "Automotive",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be non-negative"),
    body("featured").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        category: req.body.category,
        stock: parseInt(req.body.stock) || 0,
        featured: req.body.featured === "true" || req.body.featured === true,
      };

      // Upload image to Azure Blob Storage
      if (req.file) {
        const imageUrl = await uploadImage(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
        if (imageUrl) {
          productData.imageUrl = imageUrl;

          // AI: Analyze image with Azure Computer Vision
          const tags = await analyzeImage(imageUrl);
          if (tags.length > 0) {
            productData.aiTags = tags;
          }
        }
      }

      const product = new Product(productData);
      await product.save();

      res.status(201).json(product);
    } catch (error) {
      console.error("POST /products error:", error);
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({ errors: messages.map((m) => ({ msg: m })) });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  }
);

// ─── PUT /api/products/:id ──────────────────────────────────────────
router.put(
  "/:id",
  upload.single("image"),
  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    body("name").optional().trim().isLength({ max: 200 }),
    body("description").optional().trim().isLength({ max: 2000 }),
    body("price").optional().isFloat({ min: 0, max: 999999.99 }),
    body("category")
      .optional()
      .isIn([
        "Electronics",
        "Clothing",
        "Books",
        "Home & Kitchen",
        "Sports",
        "Toys",
        "Health & Beauty",
        "Automotive",
        "Other",
      ]),
    body("stock").optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      // Update fields
      const fields = ["name", "description", "price", "category", "stock", "featured"];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          if (f === "price") product[f] = parseFloat(req.body[f]);
          else if (f === "stock") product[f] = parseInt(req.body[f]);
          else if (f === "featured")
            product[f] = req.body[f] === "true" || req.body[f] === true;
          else product[f] = req.body[f];
        }
      });

      // Handle new image upload
      if (req.file) {
        if (product.imageUrl) await deleteImage(product.imageUrl);
        const imageUrl = await uploadImage(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
        if (imageUrl) {
          product.imageUrl = imageUrl;
          const tags = await analyzeImage(imageUrl);
          if (tags.length > 0) product.aiTags = tags;
        }
      }

      await product.save();
      res.json(product);
    } catch (error) {
      console.error("PUT /products error:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  }
);

// ─── DELETE /api/products/:id ───────────────────────────────────────
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid product ID")],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      if (product.imageUrl) await deleteImage(product.imageUrl);
      await product.deleteOne();

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
);

// ─── POST /api/products/:id/reviews ─────────────────────────────────
router.post(
  "/:id/reviews",
  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    body("author").trim().notEmpty().withMessage("Author name is required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment").trim().notEmpty().withMessage("Comment is required"),
  ],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      // Azure Language AI — analyze sentiment of review comment
      const sentimentResult = await analyzeSentiment(req.body.comment);

      product.reviews.push({
        author: req.body.author,
        rating: parseInt(req.body.rating),
        comment: req.body.comment,
        sentiment: sentimentResult?.sentiment || null,
        sentimentScore: sentimentResult?.score || null,
      });

      product.updateAverageRating();
      await product.save();

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to add review" });
    }
  }
);

// ─── POST /api/products/:id/chat ────────────────────────────────────
// AI-powered product Q&A using Azure Language key phrase extraction
router.post(
  "/:id/chat",
  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    body("message").trim().notEmpty().withMessage("Message is required").isLength({ max: 500 }),
  ],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const product = await Product.findById(req.params.id).lean();
      if (!product) return res.status(404).json({ error: "Product not found" });

      const message = req.body.message;

      // Azure Language AI — extract key phrases to understand intent
      const keyPhrases = await extractKeyPhrases(message);
      const allTerms = [message.toLowerCase(), ...keyPhrases.map((p) => p.toLowerCase())].join(" ");

      let reply = "";

      // Intent: Price / Cost
      if (/price|cost|how much|expensive|cheap|afford|₹|\$/.test(allTerms)) {
        reply = `The ${product.name} is priced at ₹${product.price.toLocaleString("en-IN")}.`;
        if (product.stock > 0) reply += ` It's currently in stock with ${product.stock} units available.`;
        else reply += ` However, it's currently out of stock.`;
      }
      // Intent: Stock / Availability
      else if (/stock|available|availability|units|buy|purchase|order|deliver/.test(allTerms)) {
        if (product.stock > 0) {
          reply = `Yes! The ${product.name} is available — ${product.stock} units in stock at ₹${product.price.toLocaleString("en-IN")}.`;
        } else {
          reply = `Sorry, the ${product.name} is currently out of stock. Please check back later!`;
        }
      }
      // Intent: Reviews / Ratings / Opinions
      else if (/review|rating|opinion|feedback|people say|customers|recommend|rated|stars/.test(allTerms)) {
        if (product.reviews.length === 0) {
          reply = `No reviews yet for ${product.name}. Be the first to write one!`;
        } else {
          const posCount = product.reviews.filter((r) => r.sentiment === "positive").length;
          const negCount = product.reviews.filter((r) => r.sentiment === "negative").length;
          const neutCount = product.reviews.filter((r) => r.sentiment === "neutral" || r.sentiment === "mixed").length;
          reply = `${product.name} has ${product.reviews.length} review(s) with an average rating of ${product.averageRating}/5.`;
          if (posCount + negCount > 0) {
            reply += ` Sentiment breakdown: ${posCount} 😊 positive, ${negCount} 😟 negative, ${neutCount} 😐 neutral.`;
          }
        }
      }
      // Intent: Category / Type
      else if (/category|type|kind|section|department|genre/.test(allTerms)) {
        reply = `${product.name} belongs to the ${product.category} category.`;
      }
      // Intent: AI Tags / Labels
      else if (/tag|ai|artificial|label|keyword|identified|detected/.test(allTerms)) {
        if (product.aiTags?.length > 0) {
          reply = `AI-detected attributes for this product: ${product.aiTags.join(", ")}.`;
        } else {
          reply = `No AI tags have been generated yet. Try uploading an image for this product.`;
        }
      }
      // Intent: Description / Features / Details
      else if (/describe|description|what is|tell me|about|feature|detail|spec|explain/.test(allTerms)) {
        reply = product.description;
        if (product.aiTags?.length > 0) {
          reply += ` Key AI-identified attributes: ${product.aiTags.slice(0, 5).join(", ")}.`;
        }
      }
      // Intent: Compare / Similar
      else if (/compare|similar|alternative|other|vs|versus/.test(allTerms)) {
        reply = `I can only answer questions about this specific product. For comparisons, browse other products in the ${product.category} category!`;
      }
      // Greeting
      else if (/hi|hello|hey|help|assist|support/.test(allTerms)) {
        reply = `Hi! I'm the AI assistant for ${product.name}. You can ask me about the price, availability, reviews, category, or product details!`;
      }
      // Fallback — give a useful summary
      else {
        reply = `${product.name} is a ${product.category} item priced at ₹${product.price.toLocaleString("en-IN")}. ${product.description.slice(0, 150)}${product.description.length > 150 ? "..." : ""} Ask me about price, stock, or reviews for more info!`;
      }

      res.json({ reply, keyPhrases });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Chat service error" });
    }
  }
);

module.exports = router;
