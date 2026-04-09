import { useLocation, Link, Navigate } from "react-router-dom";
import { CheckCircle2, Package, MapPin, ArrowRight } from "lucide-react";

export default function OrderConfirmation() {
  const { state } = useLocation();

  if (!state?.orderNumber) return <Navigate to="/" replace />;

  const { orderNumber, customerName, customerEmail, customerPhone, shippingAddress, items, total } = state;
  const addr = shippingAddress;

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        {/* Success banner */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-5">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 mb-2">Order Placed!</h1>
          <p className="text-zinc-500">
            Thanks, <span className="font-semibold text-zinc-700">{customerName}</span>! We've received your order.
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            Confirmation sent to <span className="text-zinc-600">{customerEmail}</span>
          </p>
        </div>

        {/* Order card */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          {/* Header */}
          <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-medium">Order number</p>
              <p className="font-bold text-zinc-900 tracking-wide">{orderNumber}</p>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              Confirmed
            </span>
          </div>

          {/* Items */}
          <div className="px-6 py-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> Items ordered
            </p>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-11 h-11 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-zinc-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{item.name}</p>
                    <p className="text-xs text-zinc-400">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-100 flex justify-between font-bold text-zinc-900">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Shipping */}
          <div className="px-6 pb-6">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Shipping to
            </p>
            <p className="text-sm text-zinc-700 font-medium">{customerName}</p>
            <p className="text-sm text-zinc-500">{addr.street}</p>
            <p className="text-sm text-zinc-500">{addr.city}, {addr.state} — {addr.pincode}</p>
            <p className="text-sm text-zinc-500">{customerPhone}</p>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Link to="/" className="btn-primary flex items-center gap-2 text-sm">
            Continue shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
