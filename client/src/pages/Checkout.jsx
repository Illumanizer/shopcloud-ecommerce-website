import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ShoppingBag, MapPin, User, Phone, Mail } from "lucide-react";
import { useCart } from "../context/CartContext";

function Field({ label, field, type = "text", placeholder, icon: Icon, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field ${Icon ? "pl-10" : ""} ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag className="h-16 w-16 text-zinc-200" />
        <p className="text-xl font-semibold text-zinc-700">Your cart is empty</p>
        <Link to="/" className="btn-primary text-sm">Browse products</Link>
      </div>
    );
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const e = {};
    if (!form.customerName.trim()) e.customerName = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) e.customerEmail = "Valid email required";
    if (!/^\d{10}$/.test(form.customerPhone.replace(/\s/g, ""))) e.customerPhone = "10-digit phone required";
    if (!form.street.trim()) e.street = "Street address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "6-digit pincode required";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const orderNumber = "ORD-" + Date.now().toString(36).toUpperCase();
    clearCart();
    navigate("/order-confirmation", {
      state: {
        orderNumber,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
        shippingAddress: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        items,
        total: totalPrice,
      },
    });
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Continue shopping
        </Link>

        <h1 className="text-3xl font-black text-zinc-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left — Form */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
              <h2 className="font-bold text-zinc-900 mb-5 flex items-center gap-2">
                <User className="h-4 w-4 text-primary-600" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Full Name" field="customerName" placeholder="Rahul Sharma" icon={User} value={form.customerName} onChange={(e) => set("customerName", e.target.value)} error={errors.customerName} />
                </div>
                <Field label="Email" field="customerEmail" type="email" placeholder="rahul@example.com" icon={Mail} value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} error={errors.customerEmail} />
                <Field label="Phone" field="customerPhone" placeholder="9876543210" icon={Phone} value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} error={errors.customerPhone} />
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
              <h2 className="font-bold text-zinc-900 mb-5 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-600" />
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Street Address" field="street" placeholder="123, MG Road" value={form.street} onChange={(e) => set("street", e.target.value)} error={errors.street} />
                </div>
                <Field label="City" field="city" placeholder="Bengaluru" value={form.city} onChange={(e) => set("city", e.target.value)} error={errors.city} />
                <Field label="State" field="state" placeholder="Karnataka" value={form.state} onChange={(e) => set("state", e.target.value)} error={errors.state} />
                <Field label="Pincode" field="pincode" placeholder="560001" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} error={errors.pincode} />
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 sticky top-24">
              <h2 className="font-bold text-zinc-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{item.name}</p>
                      <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-900 text-lg pt-2 border-t border-zinc-100">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-5">
                Place Order — ₹{totalPrice.toLocaleString("en-IN")}
              </button>

              <p className="text-xs text-zinc-400 text-center mt-3">
                This is a demo store. No real payment is processed.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
