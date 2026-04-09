import { Link } from "react-router-dom";
import { ShoppingCart, Star, Tag, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const CATEGORY_COLORS = {
  Electronics:     "bg-blue-50 text-blue-600",
  Clothing:        "bg-pink-50 text-pink-600",
  Books:           "bg-amber-50 text-amber-700",
  "Home & Kitchen":"bg-green-50 text-green-600",
  Sports:          "bg-orange-50 text-orange-600",
  Toys:            "bg-purple-50 text-purple-600",
  "Health & Beauty":"bg-rose-50 text-rose-600",
  Automotive:      "bg-zinc-100 text-zinc-600",
  Other:           "bg-zinc-100 text-zinc-500",
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`Added to cart`, { duration: 1800 });
  };

  const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other;
  const price = parseFloat(product.price);

  return (
    <Link to={`/products/${product.id}`} className="card group flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-zinc-50 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-2">
            <Tag className="h-10 w-10" />
            <span className="text-xs text-zinc-300">No image</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.featured && (
            <span className="bg-amber-400 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-zinc-800/80 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
              Sold out
            </span>
          )}
        </div>

        {/* Quick add — slides up on hover */}
        {product.stock > 0 && (
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add to cart
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className={`self-start text-[11px] font-semibold px-2 py-0.5 rounded-full ${catColor}`}>
          {product.category}
        </span>

        <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {product.aiTags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.aiTags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-zinc-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {product.averageRating > 0 ? (
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="font-medium text-zinc-700">{product.averageRating}</span>
              <span className="text-zinc-400">({product.reviews?.length || 0})</span>
            </div>
          ) : (
            <span className="text-[11px] text-zinc-400">No reviews</span>
          )}
        </div>
      </div>
    </Link>
  );
}
