import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Edit,
  Trash2,
  Star,
  Tag,
  Loader2,
  AlertCircle,
  Cpu,
  Languages,
  MessageCircle,
  Send,
  X,
  Bot,
} from "lucide-react";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import StarRating from "../components/StarRating";
import toast from "react-hot-toast";

// ── Sentiment badge helper (Azure Language AI) ─────────────────────
function SentimentBadge({ sentiment }) {
  if (!sentiment) return null;
  const config = {
    positive: { emoji: "😊", label: "Positive", classes: "bg-green-50 text-green-700 border-green-200" },
    negative: { emoji: "😟", label: "Negative", classes: "bg-red-50 text-red-700 border-red-200" },
    neutral:  { emoji: "😐", label: "Neutral",  classes: "bg-gray-50 text-gray-600 border-gray-200" },
    mixed:    { emoji: "🤔", label: "Mixed",     classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  };
  const c = config[sentiment];
  if (!c) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${c.classes}`}>
      {c.emoji} {c.label}
    </span>
  );
}

// ── Language options ────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en",  label: "EN", flag: "🇺🇸" },
  { code: "hi",  label: "HI", flag: "🇮🇳" },
  { code: "fr",  label: "FR", flag: "🇫🇷" },
  { code: "de",  label: "DE", flag: "🇩🇪" },
  { code: "es",  label: "ES", flag: "🇪🇸" },
  { code: "ja",  label: "JA", flag: "🇯🇵" },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Review form
  const [reviewForm, setReviewForm] = useState({ author: "", rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  // ── Feature: Translate ──────────────────────────────────────────
  const [selectedLang, setSelectedLang] = useState("en");
  const [translating, setTranslating] = useState(false);
  const [translatedName, setTranslatedName] = useState(null);
  const [translatedDesc, setTranslatedDesc] = useState(null);

  // ── Feature: Chat ───────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { loadProduct(); }, [id]);

  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatOpen]);

  async function loadProduct() {
    setLoading(true);
    try {
      const data = await api.getProduct(id);
      setProduct(data);
      // Reset translations on product change
      setSelectedLang("en");
      setTranslatedName(null);
      setTranslatedDesc(null);
      setChatMessages([
        { role: "bot", text: `Hi! I'm the AI assistant for this product. Ask me anything — price, availability, reviews, or details!` },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(true);
    try {
      await api.deleteProduct(id);
      toast.success("Product deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const updated = await api.addReview(id, reviewForm);
      setProduct(updated);
      setReviewForm({ author: "", rating: 5, comment: "" });
      toast.success("Review added!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  }

  // ── Translate handler ───────────────────────────────────────────
  async function handleLanguageChange(langCode) {
    setSelectedLang(langCode);
    if (langCode === "en") {
      setTranslatedName(null);
      setTranslatedDesc(null);
      return;
    }
    setTranslating(true);
    try {
      const result = await api.translate([product.name, product.description], langCode);
      setTranslatedName(result.translated[0]);
      setTranslatedDesc(result.translated[1]);
    } catch {
      toast.error("Translation failed — check Azure Translator setup");
    } finally {
      setTranslating(false);
    }
  }

  // ── Chat handler ────────────────────────────────────────────────
  async function handleChatSend(e) {
    e?.preventDefault();
    const msg = chatInput.trim();
    if (!msg) return;

    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const result = await api.chat(id, msg);
      setChatMessages((prev) => [...prev, { role: "bot", text: result.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "bot", text: "Sorry, I couldn't process that. Try asking about price, stock, or reviews!" }]);
    } finally {
      setChatLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700">{error || "Product not found"}</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const displayName = translatedName || product.name;
  const displayDesc = translatedDesc || product.description;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Tag className="h-24 w-24" />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-3">{displayName}</h1>
              {translatedName && (
                <p className="text-xs text-gray-400 mt-1">Translated · Original: {product.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                to={`/products/${product.id}/edit`}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
              >
                <Edit className="h-5 w-5" />
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <StarRating rating={Math.round(product.averageRating)} />
            <span className="text-sm text-gray-500">
              {product.averageRating > 0
                ? `${product.averageRating} (${product.reviews.length} reviews)`
                : "No reviews yet"}
            </span>
          </div>

          {/* Price */}
          <p className="text-4xl font-bold text-gray-900 mt-4">₹{product.price.toLocaleString("en-IN")}</p>

          {/* Stock */}
          <p className={`text-sm mt-2 font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {/* ── Feature 2: Translate toggle ──────────────────────── */}
          <div className="mt-5 flex items-center gap-2">
            <Languages className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-gray-500 font-medium">Translate:</span>
            <div className="flex gap-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={translating}
                  className={`text-xs px-2 py-1 rounded-md font-medium transition-all ${
                    selectedLang === lang.code
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
            {translating && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
          </div>

          {/* Description */}
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{displayDesc}</p>
            {translatedDesc && (
              <span className="text-xs text-blue-500 mt-1 block flex items-center gap-1">
                <Languages className="h-3 w-3" /> Azure Translator
              </span>
            )}
          </div>

          {/* AI Tags */}
          {product.aiTags?.length > 0 && (
            <div className="mt-5">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-600" />
                AI-Generated Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.aiTags.map((tag) => (
                  <span key={tag} className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <button
            onClick={() => { addToCart(product); toast.success("Added to cart!"); }}
            disabled={product.stock === 0}
            className="mt-7 btn-primary py-3 px-8 text-lg flex items-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Customer Reviews ({product.reviews.length})
        </h2>

        {/* Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold mb-4">Write a Review</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Your name"
              value={reviewForm.author}
              onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
              required
              className="input-field"
            />
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Rating:</span>
              <StarRating
                rating={reviewForm.rating}
                onRate={(r) => setReviewForm({ ...reviewForm, rating: r })}
                interactive
              />
            </div>
          </div>
          <textarea
            placeholder="Write your review..."
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            required
            rows={3}
            className="input-field mb-4"
          />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submittingReview} className="btn-primary">
              {submittingReview ? "Analysing & Submitting..." : "Submit Review"}
            </button>
            {submittingReview && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Cpu className="h-3 w-3" /> Azure Language AI analysing sentiment…
              </span>
            )}
          </div>
        </form>

        {/* ── Feature 1: Reviews with Sentiment badges ─────────── */}
        {product.reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {/* Sentiment summary bar */}
            {product.reviews.some((r) => r.sentiment) && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-gray-100 p-4 flex items-center gap-6 text-sm mb-6">
                <span className="font-semibold text-gray-700 flex items-center gap-1">
                  <Cpu className="h-4 w-4 text-purple-500" /> AI Sentiment Summary
                </span>
                <span className="text-green-700">😊 {product.reviews.filter((r) => r.sentiment === "positive").length} Positive</span>
                <span className="text-red-600">😟 {product.reviews.filter((r) => r.sentiment === "negative").length} Negative</span>
                <span className="text-gray-500">😐 {product.reviews.filter((r) => r.sentiment === "neutral" || r.sentiment === "mixed").length} Neutral</span>
              </div>
            )}

            {product.reviews
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((review, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                        {review.author[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{review.author}</span>
                      {/* Sentiment badge */}
                      <SentimentBadge sentiment={review.sentiment} />
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── Feature 3: Floating Chat Widget ──────────────────────────── */}
      {/* Chat bubble button */}
      <button
        onClick={() => setChatOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        title="Ask AI about this product"
      >
        {chatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <p className="font-semibold text-sm">AI Product Assistant</p>
              <p className="text-xs text-primary-200">Powered by Azure Language AI</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-72">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] text-sm px-3 py-2 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-primary-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 text-sm px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleChatSend} className="border-t border-gray-100 p-3 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about price, stock…"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
