const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 200] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0, max: 999999.99 },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [
          [
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
        ],
      },
    },
    imageUrl: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    aiTags: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Reviews stored as JSONB — avoids a separate join table for this use case
    reviews: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 0,
    },
  },
  {
    tableName: "products",
    timestamps: true,
    underscored: true,
  }
);

Product.prototype.updateAverageRating = function () {
  if (!this.reviews || this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
  }
};

module.exports = Product;
