import { Link } from "react-router-dom";
import { ShoppingCart, Star, Tag } from "lucide-react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link to={`/products/${product._id}`} className="card group">
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Tag className="h-16 w-16" />
          </div>
        )}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-1 rounded-full">
            Featured
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary-600 font-medium mb-1">
              {product.category}
            </p>
            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>

        {/* AI Tags */}
        {product.aiTags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.aiTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full"
              >
                AI: {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating & Price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            {product.averageRating > 0 ? (
              <>
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">{product.averageRating}</span>
                <span className="text-xs text-gray-400">
                  ({product.reviews?.length || 0})
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">No reviews</span>
            )}
          </div>
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`mt-3 w-full flex items-center justify-center gap-2 text-sm btn-primary ${
            product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
