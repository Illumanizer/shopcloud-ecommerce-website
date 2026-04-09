const API_BASE = "/api";

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, options);
  const data = await res.json();
  if (!res.ok) {
    const message =
      data.errors?.map((e) => e.msg).join(", ") || data.error || "Request failed";
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Products
  getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/products?${query}`);
  },

  getProduct(id) {
    return request(`/products/${id}`);
  },

  createProduct(formData) {
    return request("/products", { method: "POST", body: formData });
  },

  updateProduct(id, formData) {
    return request(`/products/${id}`, { method: "PUT", body: formData });
  },

  deleteProduct(id) {
    return request(`/products/${id}`, { method: "DELETE" });
  },

  // Reviews
  addReview(productId, review) {
    return request(`/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });
  },

  // AI Chat — Azure Language AI powered Q&A
  chat(productId, message) {
    return request(`/products/${productId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  },

  // Translate — Azure Translator
  translate(texts, targetLanguage) {
    return request("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, targetLanguage }),
    });
  },

  // Analyze image with Azure Computer Vision (pre-upload, returns tags)
  analyzeImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    return request("/products/analyze-image", { method: "POST", body: formData });
  },

  // AI Description Generator — Azure Language AI + Computer Vision powered
  generateDescription(name, category, price, imageTags = []) {
    return request("/products/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, price, imageTags }),
    });
  },

  // Categories & Stats
  getCategories() {
    return request("/products/categories");
  },

  getStats() {
    return request("/products/stats");
  },

};
