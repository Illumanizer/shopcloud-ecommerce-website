import { Star } from "lucide-react";

export default function StarRating({ rating, onRate, interactive = false, size = "md" }) {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onRate?.(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          disabled={!interactive}
        >
          <Star
            className={`${sizeClass} ${
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300"
            } ${interactive ? "hover:text-amber-400" : ""}`}
          />
        </button>
      ))}
    </div>
  );
}
