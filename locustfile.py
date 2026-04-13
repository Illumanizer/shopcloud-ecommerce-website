"""
ShopCloud Load Test — Assignment 3 Part 3
Target: https://shopcloud-pranav.azurewebsites.net

Simulates realistic e-commerce user behaviour:
  - Browsing the product catalogue (most common)
  - Filtering by category and searching
  - Viewing individual product pages
  - Submitting product reviews
  - Using the AI chat feature
  - Checking health endpoint

Run:
  locust -f locustfile.py --host https://shopcloud-pranav.azurewebsites.net
  Then open http://localhost:8089 in your browser.
"""

from locust import HttpUser, task, between
import random

# Real product IDs from the live database
PRODUCT_IDS = [
    "9dff5752-43f5-4e5c-b37d-2a6e9a401d22",
    "35dcb7b9-8d8b-4316-89ce-4e0517b1c236",
    "e371251b-68b7-43dc-99f8-f2d2638f89f3",
    "99773a59-9632-4a6f-b0e6-12c46bb948ac",
    "c1e44987-d6c7-4230-b6ff-87fdef3baeff",
    "3f801029-22cc-436d-a603-1897d6a0e943",
    "873a6ab9-1be1-4de6-903f-d0e5f0ba94d4",
    "b9c13e27-5b66-49ca-8519-c57e8dcf88b8",
    "1e430cf3-b5d0-40eb-a1e2-453aaaf2a16a",
    "bdef5ea9-0e68-4708-b76e-09ef3dd522ad",
]

CATEGORIES = [
    "Electronics", "Clothing", "Books",
    "Home & Kitchen", "Sports", "Toys",
    "Health & Beauty", "Automotive",
]

SEARCH_TERMS = [
    "shirt", "phone", "book", "kitchen", "sport",
    "toy", "beauty", "car", "cotton", "wireless",
]

REVIEW_AUTHORS = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"]
REVIEW_COMMENTS = [
    "Great product, really happy with the quality!",
    "Decent value for the price.",
    "Arrived quickly and as described.",
    "Not what I expected but still usable.",
    "Excellent! Would buy again.",
    "Good build quality, fast delivery.",
]

CHAT_MESSAGES = [
    "What is the price?",
    "Is this item in stock?",
    "What are the reviews like?",
    "Tell me about this product.",
    "What category is this?",
    "Hello, can you help me?",
]


class ShopCloudUser(HttpUser):
    """
    Simulates a typical shopper on ShopCloud.
    Wait 1–5 seconds between requests (realistic think time).
    """
    wait_time = between(1, 5)

    # ── Read-heavy tasks (weighted higher — most users just browse) ────────────

    @task(10)
    def browse_products(self):
        """List products — most common action."""
        page = random.randint(1, 3)
        limit = random.choice([6, 12])
        self.client.get(
            f"/api/products?page={page}&limit={limit}",
            name="/api/products [browse]",
        )

    @task(6)
    def browse_by_category(self):
        """Filter products by category."""
        category = random.choice(CATEGORIES)
        self.client.get(
            f"/api/products?category={category}&limit=12",
            name="/api/products [by category]",
        )

    @task(5)
    def search_products(self):
        """Search products by keyword."""
        term = random.choice(SEARCH_TERMS)
        self.client.get(
            f"/api/products?search={term}",
            name="/api/products [search]",
        )

    @task(5)
    def view_product(self):
        """View a single product detail page."""
        product_id = random.choice(PRODUCT_IDS)
        self.client.get(
            f"/api/products/{product_id}",
            name="/api/products/:id",
        )

    @task(4)
    def get_categories(self):
        """Load category list (used by navbar filter)."""
        self.client.get("/api/products/categories", name="/api/products/categories")

    @task(3)
    def get_stats(self):
        """Load catalogue stats (shown on homepage)."""
        self.client.get("/api/products/stats", name="/api/products/stats")

    @task(2)
    def health_check(self):
        """Health endpoint — simulates monitoring pings."""
        self.client.get("/api/health", name="/api/health")

    @task(3)
    def browse_featured(self):
        """View featured products."""
        self.client.get(
            "/api/products?featured=true&limit=6",
            name="/api/products [featured]",
        )

    @task(2)
    def browse_sorted(self):
        """Sort products by price or rating."""
        sort = random.choice(["price_asc", "price_desc", "rating", "newest"])
        self.client.get(
            f"/api/products?sort={sort}&limit=12",
            name="/api/products [sorted]",
        )

    # ── Write tasks (weighted lower — fewer users write than read) ─────────────

    @task(2)
    def submit_review(self):
        """Post a product review (triggers Azure Language AI sentiment analysis)."""
        product_id = random.choice(PRODUCT_IDS)
        self.client.post(
            f"/api/products/{product_id}/reviews",
            json={
                "author": random.choice(REVIEW_AUTHORS),
                "rating": random.randint(1, 5),
                "comment": random.choice(REVIEW_COMMENTS),
            },
            name="/api/products/:id/reviews",
        )

    @task(2)
    def chat_with_product(self):
        """Ask the AI chat assistant about a product (triggers Azure Language AI)."""
        product_id = random.choice(PRODUCT_IDS)
        self.client.post(
            f"/api/products/{product_id}/chat",
            json={"message": random.choice(CHAT_MESSAGES)},
            name="/api/products/:id/chat",
        )
