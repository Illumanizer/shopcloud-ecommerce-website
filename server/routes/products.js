const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const { Op, fn, col, literal } = require("sequelize");
const Product = require("../models/Product");
const upload = require("../middleware/upload");
const { uploadImage, deleteImage } = require("../services/blobStorage");
const { analyzeImage, analyzeImageFromBuffer } = require("../services/computerVision");
const { analyzeSentiment, extractKeyPhrases } = require("../services/languageService");

const router = express.Router();

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
}

// ─── GET /api/products ──────────────────────────────────────────────
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
      const offset = (page - 1) * limit;

      const where = {};
      if (req.query.category) where.category = req.query.category;
      if (req.query.featured) where.featured = true;
      if (req.query.search) {
        const s = req.query.search;
        where[Op.or] = [
          { name: { [Op.iLike]: `%${s}%` } },
          { description: { [Op.iLike]: `%${s}%` } },
          // Search within the aiTags array by casting to text
          literal(`array_to_string("ai_tags", ',') ILIKE '%${s.replace(/'/g, "''")}%'`),
        ];
      }

      let order;
      switch (req.query.sort) {
        case "price_asc":  order = [["price", "ASC"]]; break;
        case "price_desc": order = [["price", "DESC"]]; break;
        case "rating":     order = [["average_rating", "DESC"]]; break;
        default:           order = [["created_at", "DESC"]];
      }

      const { count, rows: products } = await Product.findAndCountAll({
        where,
        order,
        limit,
        offset,
        raw: true,
      });

      res.json({
        products,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
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
    const rows = await Product.findAll({
      attributes: ["category"],
      group: ["category"],
      raw: true,
    });
    res.json(rows.map((r) => r.category));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ─── GET /api/products/stats ────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [totalProducts, categoryRows, avgRow, featuredCount] = await Promise.all([
      Product.count(),
      Product.findAll({ attributes: ["category"], group: ["category"], raw: true }),
      Product.findOne({ attributes: [[fn("AVG", col("price")), "avg"]], raw: true }),
      Product.count({ where: { featured: true } }),
    ]);

    res.json({
      totalProducts,
      totalCategories: categoryRows.length,
      averagePrice: avgRow?.avg ? parseFloat(avgRow.avg).toFixed(2) : "0.00",
      featuredCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─── GET /api/products/:id ──────────────────────────────────────────
router.get(
  "/:id",
  [param("id").isUUID().withMessage("Invalid product ID")],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const product = await Product.findByPk(req.params.id);
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
    body("name").trim().notEmpty().withMessage("Product name is required").isLength({ max: 200 }),
    body("description").trim().notEmpty().withMessage("Description is required").isLength({ max: 2000 }),
    body("price").notEmpty().withMessage("Price is required").isFloat({ min: 0, max: 999999.99 }),
    body("category")
      .trim()
      .notEmpty()
      .withMessage("Category is required")
      .isIn(["Electronics","Clothing","Books","Home & Kitchen","Sports","Toys","Health & Beauty","Automotive","Other"]),
    body("stock").optional().isInt({ min: 0 }),
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

      if (req.file) {
        const imageUrl = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
        if (imageUrl) {
          productData.imageUrl = imageUrl;
          const tags = await analyzeImage(imageUrl);
          if (tags.length > 0) productData.aiTags = tags;
        }
      }

      const product = await Product.create(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("POST /products error:", error);
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ errors: error.errors.map((e) => ({ msg: e.message })) });
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
    param("id").isUUID().withMessage("Invalid product ID"),
    body("name").optional().trim().isLength({ max: 200 }),
    body("description").optional().trim().isLength({ max: 2000 }),
    body("price").optional().isFloat({ min: 0, max: 999999.99 }),
    body("category").optional().isIn(["Electronics","Clothing","Books","Home & Kitchen","Sports","Toys","Health & Beauty","Automotive","Other"]),
    body("stock").optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const fields = ["name", "description", "price", "category", "stock", "featured"];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          if (f === "price") product[f] = parseFloat(req.body[f]);
          else if (f === "stock") product[f] = parseInt(req.body[f]);
          else if (f === "featured") product[f] = req.body[f] === "true" || req.body[f] === true;
          else product[f] = req.body[f];
        }
      });

      if (req.file) {
        if (product.imageUrl) await deleteImage(product.imageUrl);
        const imageUrl = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
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
  [param("id").isUUID().withMessage("Invalid product ID")],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      if (product.imageUrl) await deleteImage(product.imageUrl);
      await product.destroy();

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
    param("id").isUUID().withMessage("Invalid product ID"),
    body("author").trim().notEmpty().withMessage("Author name is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").trim().notEmpty().withMessage("Comment is required"),
  ],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const sentimentResult = await analyzeSentiment(req.body.comment);

      const newReview = {
        author: req.body.author,
        rating: parseInt(req.body.rating),
        comment: req.body.comment,
        sentiment: sentimentResult?.sentiment || null,
        sentimentScore: sentimentResult?.score || null,
        createdAt: new Date().toISOString(),
      };

      product.reviews = [...(product.reviews || []), newReview];
      product.updateAverageRating();
      await product.save();

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to add review" });
    }
  }
);

// ─── POST /api/products/analyze-image ───────────────────────────────
router.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided" });
    const tags = await analyzeImageFromBuffer(req.file.buffer);
    res.json({ tags });
  } catch (error) {
    console.error("Analyze image error:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

// ─── POST /api/products/generate-description ────────────────────────
router.post(
  "/generate-description",
  [
    body("name").optional().trim(),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("price").optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const { name, category, price, imageTags } = req.body;
      const productName = name?.trim() || (imageTags?.length ? `${category} product` : category);

      // Use Azure Language AI to extract key phrases from the product name
      const keyPhrases = name?.trim() ? await extractKeyPhrases(name) : [];
      // Merge language key phrases with visual AI tags from image (if provided)
      const allTerms = [...new Set([...keyPhrases, ...(imageTags || [])])];
      const terms = allTerms.length > 0 ? allTerms : [productName];
      const priceStr = price ? `₹${parseFloat(price).toLocaleString("en-IN")}` : "a competitive price";

      const categoryTemplates = {
        Electronics: [
          `${productName} is a cutting-edge electronic device designed for modern consumers.`,
          `Featuring ${terms.join(", ")}, this product delivers exceptional performance and reliability.`,
          `Built with advanced technology, it offers seamless connectivity and an intuitive user experience.`,
          `Ideal for everyday use, it combines convenience with high-end functionality at ${priceStr}.`,
        ],
        Clothing: [
          `${productName} is a stylish and comfortable addition to any wardrobe.`,
          `Crafted with premium quality fabric, it offers a flattering fit for all occasions.`,
          `Featuring ${terms.join(", ")}, this piece blends contemporary style with everyday wearability.`,
          `Easy to care for and versatile enough to dress up or down, it makes a perfect choice for fashion-conscious individuals.`,
        ],
        Books: [
          `${productName} is a must-read that offers profound insights and engaging content.`,
          `Exploring themes of ${terms.join(", ")}, this book captivates readers from the very first page.`,
          `Whether for personal growth, education, or entertainment, it delivers a rich and rewarding reading experience.`,
          `A valuable addition to any collection, accessible to readers of all backgrounds and interests.`,
        ],
        "Home & Kitchen": [
          `${productName} is a practical and durable addition to any home or kitchen.`,
          `Designed with ${terms.join(", ")} in mind, it simplifies everyday tasks and enhances your living space.`,
          `Made from high-quality materials, it ensures long-lasting performance and easy maintenance.`,
          `Perfect for modern households, it combines functionality with elegant design.`,
        ],
        Sports: [
          `${productName} is designed for athletes and fitness enthusiasts seeking performance and durability.`,
          `Built to support ${terms.join(", ")}, it enhances your training sessions and sporting activities.`,
          `Engineered with quality materials, it withstands rigorous use while keeping you comfortable.`,
          `Whether for professional training or recreational use, it is the ideal companion for an active lifestyle.`,
        ],
        Toys: [
          `${productName} is a fun and engaging toy that sparks creativity and imagination.`,
          `Featuring ${terms.join(", ")}, it provides hours of entertainment for children of all ages.`,
          `Made with child-safe materials, it meets safety standards and is built to withstand enthusiastic play.`,
          `A wonderful gift choice that promotes learning, development, and endless fun.`,
        ],
        "Health & Beauty": [
          `${productName} is a premium health and beauty product formulated for effective results.`,
          `Enriched with ${terms.join(", ")}, it nourishes and revitalises for a healthier, more radiant appearance.`,
          `Dermatologically tested and free from harmful chemicals, it is suitable for all skin and body types.`,
          `Make it a part of your daily self-care routine for visible and lasting benefits.`,
        ],
        Automotive: [
          `${productName} is a high-quality automotive product built for performance and reliability.`,
          `Featuring ${terms.join(", ")}, it is engineered to meet the demands of modern vehicles.`,
          `Manufactured to precise standards, it ensures compatibility, durability, and safe operation.`,
          `An essential addition for car enthusiasts and everyday drivers looking to maintain their vehicle at its best.`,
        ],
        Other: [
          `${productName} is a versatile and high-quality product suited for a wide range of uses.`,
          `Featuring ${terms.join(", ")}, it delivers consistent performance and lasting value.`,
          `Crafted with attention to detail and quality materials, it is built to exceed expectations.`,
          `A practical and reliable choice at ${priceStr}, ideal for those who value quality.`,
        ],
      };

      const template = categoryTemplates[category] || categoryTemplates["Other"];
      const description = template.join(" ");

      res.json({ description });
    } catch (error) {
      console.error("Generate description error:", error);
      res.status(500).json({ error: "Failed to generate description" });
    }
  }
);

// ─── POST /api/products/:id/chat ────────────────────────────────────
router.post(
  "/:id/chat",
  [
    param("id").isUUID().withMessage("Invalid product ID"),
    body("message").trim().notEmpty().withMessage("Message is required").isLength({ max: 500 }),
  ],
  async (req, res) => {
    try {
      const vErr = handleValidation(req, res);
      if (vErr) return;

      const product = await Product.findByPk(req.params.id, { raw: true });
      if (!product) return res.status(404).json({ error: "Product not found" });

      const message = req.body.message;
      const keyPhrases = await extractKeyPhrases(message);
      const allTerms = [message.toLowerCase(), ...keyPhrases.map((p) => p.toLowerCase())].join(" ");

      let reply = "";

      if (/price|cost|how much|expensive|cheap|afford|₹|\$/.test(allTerms)) {
        reply = `The ${product.name} is priced at ₹${parseFloat(product.price).toLocaleString("en-IN")}.`;
        if (product.stock > 0) reply += ` It's currently in stock with ${product.stock} units available.`;
        else reply += ` However, it's currently out of stock.`;
      } else if (/stock|available|availability|units|buy|purchase|order|deliver/.test(allTerms)) {
        if (product.stock > 0) {
          reply = `Yes! The ${product.name} is available — ${product.stock} units in stock at ₹${parseFloat(product.price).toLocaleString("en-IN")}.`;
        } else {
          reply = `Sorry, the ${product.name} is currently out of stock. Please check back later!`;
        }
      } else if (/review|rating|opinion|feedback|people say|customers|recommend|rated|stars/.test(allTerms)) {
        const reviews = product.reviews || [];
        if (reviews.length === 0) {
          reply = `No reviews yet for ${product.name}. Be the first to write one!`;
        } else {
          const posCount = reviews.filter((r) => r.sentiment === "positive").length;
          const negCount = reviews.filter((r) => r.sentiment === "negative").length;
          const neutCount = reviews.filter((r) => r.sentiment === "neutral" || r.sentiment === "mixed").length;
          reply = `${product.name} has ${reviews.length} review(s) with an average rating of ${product.averageRating}/5.`;
          if (posCount + negCount > 0) {
            reply += ` Sentiment breakdown: ${posCount} 😊 positive, ${negCount} 😟 negative, ${neutCount} 😐 neutral.`;
          }
        }
      } else if (/category|type|kind|section|department|genre/.test(allTerms)) {
        reply = `${product.name} belongs to the ${product.category} category.`;
      } else if (/tag|ai|artificial|label|keyword|identified|detected/.test(allTerms)) {
        const tags = product.aiTags || [];
        if (tags.length > 0) {
          reply = `AI-detected attributes for this product: ${tags.join(", ")}.`;
        } else {
          reply = `No AI tags have been generated yet. Try uploading an image for this product.`;
        }
      } else if (/describe|description|what is|tell me|about|feature|detail|spec|explain/.test(allTerms)) {
        reply = product.description;
        const tags = product.aiTags || [];
        if (tags.length > 0) reply += ` Key AI-identified attributes: ${tags.slice(0, 5).join(", ")}.`;
      } else if (/compare|similar|alternative|other|vs|versus/.test(allTerms)) {
        reply = `I can only answer questions about this specific product. For comparisons, browse other products in the ${product.category} category!`;
      } else if (/hi|hello|hey|help|assist|support/.test(allTerms)) {
        reply = `Hi! I'm the AI assistant for ${product.name}. You can ask me about the price, availability, reviews, category, or product details!`;
      } else {
        reply = `${product.name} is a ${product.category} item priced at ₹${parseFloat(product.price).toLocaleString("en-IN")}. ${product.description.slice(0, 150)}${product.description.length > 150 ? "..." : ""} Ask me about price, stock, or reviews for more info!`;
      }

      res.json({ reply, keyPhrases });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Chat service error" });
    }
  }
);

module.exports = router;
