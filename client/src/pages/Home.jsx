import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Package,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  "All", "Electronics", "Clothing", "Books",
  "Home & Kitchen", "Sports", "Toys", "Health & Beauty", "Automotive", "Other",
];

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest" },
  { value: "price_asc",  label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "rating",     label: "Top rated" },
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

  useEffect(() => { loadProducts(); }, [category, sort, page, searchQuery]);
  useEffect(() => { api.getStats().then(setStats).catch(() => {}); }, []);

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
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────── */}
      {!searchQuery && (
        <div className="bg-white border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-5">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                Azure-powered catalogue
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 leading-[1.1] tracking-tight mb-4">
                Find things<br />
                <span className="text-primary-600">worth owning.</span>
              </h1>
              <p className="text-zinc-500 text-lg mb-6 max-w-md">
                Browse {stats?.totalProducts ?? "—"} products across {stats?.totalCategories ?? "—"} categories.
                AI-tagged, searchable, and ready to explore.
              </p>

              {stats && (
                <div className="flex flex-wrap gap-3">
                  {[
                    { n: stats.totalProducts,    label: "products" },
                    { n: stats.totalCategories,  label: "categories" },
                    { n: `₹${Number(stats.averagePrice).toLocaleString("en-IN")}`, label: "avg. price" },
                    { n: stats.featuredCount,    label: "featured" },
                  ].map((s) => (
                    <div key={s.label} className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                      <p className="text-xl font-black text-zinc-900">{s.n}</p>
                      <p className="text-xs text-zinc-400 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Search header ─────────────────────────────────── */}
      {searchQuery && (
        <div className="bg-white border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Search results</p>
            <h2 className="text-2xl font-black text-zinc-900">"{searchQuery}"</h2>
            <p className="text-zinc-400 text-sm mt-1">{pagination.total} product{pagination.total !== 1 ? "s" : ""} found</p>
          </div>
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <div className="flex items-center gap-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  category === cat
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-zinc-400 hidden sm:block" />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="text-sm border border-zinc-200 rounded-xl px-3 py-1.5 bg-white text-zinc-700 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Products ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="font-semibold text-zinc-700">{error}</p>
            <button onClick={loadProducts} className="btn-secondary text-sm">Try again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
              <Package className="h-8 w-8 text-zinc-400" />
            </div>
            <div>
              <p className="font-semibold text-zinc-700 text-lg">Nothing here yet</p>
              <p className="text-zinc-400 text-sm mt-1">Try a different filter or add the first product.</p>
            </div>
            <Link to="/products/new" className="btn-primary text-sm flex items-center gap-2">
              Add product <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary p-2 disabled:opacity-30 rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl font-semibold text-sm transition-all ${
                      page === p
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="btn-secondary p-2 disabled:opacity-30 rounded-xl"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
