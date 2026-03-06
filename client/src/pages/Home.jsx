import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Books",
  "Home & Kitchen",
  "Sports",
  "Toys",
  "Health & Beauty",
  "Automotive",
  "Other",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    loadProducts();
  }, [category, sort, page, searchQuery]);

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error);
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12, sort };
      if (category !== "All") params.category = category;
      if (searchQuery) params.search = searchQuery;

      const data = await api.getProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero / Stats Section */}
      {!searchQuery && (
        <div className="mb-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome to ShopCloud</h1>
          <p className="text-primary-100 mb-6">
            Your cloud-powered product catalogue — powered by Microsoft Azure
          </p>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Products", value: stats.totalProducts },
                { label: "Categories", value: stats.totalCategories },
                { label: "Avg. Price", value: `₹${Number(stats.averagePrice).toLocaleString("en-IN")}` },
                { label: "Featured", value: stats.featuredCount },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-primary-200">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search results header */}
      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Search results for "{searchQuery}"
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""} found
          </p>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <AlertCircle className="h-10 w-10 mb-3" />
          <p className="font-medium">{error}</p>
          <button onClick={loadProducts} className="mt-3 btn-primary text-sm">
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Package className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium text-gray-500">No products found</p>
          <p className="text-sm">Try changing your filters or add a new product.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary p-2 disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                    page === p
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary p-2 disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
