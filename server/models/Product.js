const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true, trim: true, maxlength: 100 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  // Azure Language AI — sentiment analysis
  sentiment: {
    type: String,
    enum: ["positive", "negative", "neutral", "mixed", null],
    default: null,
  },
  sentimentScore: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [999999.99, "Price cannot exceed 999,999.99"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: [
          "Electronics",
          "Clothing",
          "Books",
          "Home & Kitchen",
          "Sports",
          "Toys",
          "Health & Beauty",
          "Automotive",
          "Other",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    imageUrl: {
      type: String,
      default: "",
    },
    aiTags: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Update average rating when reviews change
productSchema.methods.updateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
  }
};

// Regular indexes for search (text indexes not supported in Cosmos DB for MongoDB)
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model("Product", productSchema);
