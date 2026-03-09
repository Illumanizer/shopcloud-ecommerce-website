require("dotenv").config();
const { connectDB } = require("./config/db");
const Product = require("./models/Product");

const products = [
  // ── Electronics ──────────────────────────────────────────
  {
    name: "boAt Rockerz 450 Bluetooth Headphones",
    description: "Wireless over-ear headphones with 15 hours playback, 40mm dynamic drivers, and soft padded earcups. Features built-in mic for hands-free calling and foldable design for easy portability.",
    price: 1299,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    stock: 45,
    featured: true,
    aiTags: ["headphones", "wireless", "audio", "bluetooth", "music"],
  },
  {
    name: "Samsung Galaxy M34 5G",
    description: "6000mAh battery smartphone with 6.5-inch Super AMOLED display, 50MP triple camera, and Exynos 1280 processor. Supports 25W fast charging and comes with 8GB RAM and 128GB storage.",
    price: 18999,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
    stock: 30,
    featured: true,
    aiTags: ["smartphone", "mobile", "5G", "camera", "android"],
  },
  {
    name: "JBL Go 3 Portable Bluetooth Speaker",
    description: "Compact waterproof and dustproof portable speaker with 5 hours of playtime. Features bold JBL Pro Sound, built-in speakerphone, and USB-C charging. Perfect for outdoor use.",
    price: 2499,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
    stock: 60,
    featured: false,
    aiTags: ["speaker", "bluetooth", "portable", "waterproof", "audio"],
  },
  {
    name: "Noise ColorFit Pro 4 Smartwatch",
    description: "1.72-inch TFT LCD display smartwatch with 100+ sports modes, heart rate monitor, SpO2 tracking, and 7-day battery life. Bluetooth calling, IP68 water resistance, and 150+ watch faces.",
    price: 3499,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    stock: 35,
    featured: false,
    aiTags: ["smartwatch", "fitness", "wearable", "health", "bluetooth"],
  },

  // ── Clothing ──────────────────────────────────────────────
  {
    name: "Men's Slim Fit Cotton Formal Shirt",
    description: "Premium 100% cotton formal shirt with slim fit cut. Wrinkle-resistant fabric, mother-of-pearl buttons, and reinforced collar. Available in multiple colours. Ideal for office and formal occasions.",
    price: 849,
    category: "Clothing",
    imageUrl: "https://images.unsplash.com/photo-1598033129183-c28f8a927033?w=500&h=500&fit=crop",
    stock: 80,
    featured: false,
    aiTags: ["shirt", "formal", "cotton", "menswear", "clothing"],
  },
  {
    name: "Women's Embroidered Anarkali Kurta Set",
    description: "Elegant 3-piece Anarkali kurta set with intricate floral embroidery on soft georgette fabric. Includes matching dupatta and palazzo pants. Perfect for festive occasions and family functions.",
    price: 1599,
    category: "Clothing",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=500&fit=crop",
    stock: 40,
    featured: true,
    aiTags: ["kurta", "ethnic", "embroidery", "festive", "womenswear"],
  },
  {
    name: "Levi's 511 Slim Fit Jeans",
    description: "Classic slim fit jeans made with advanced stretch denim for all-day comfort. Features Levi's signature 5-pocket styling, zip fly, and sits below the waist. Machine washable.",
    price: 2999,
    category: "Clothing",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
    stock: 55,
    featured: false,
    aiTags: ["jeans", "denim", "slim fit", "casual", "clothing"],
  },

  // ── Books ─────────────────────────────────────────────────
  {
    name: "Wings of Fire — APJ Abdul Kalam",
    description: "The autobiography of Dr. APJ Abdul Kalam, former President of India and renowned scientist. A deeply inspiring account of his journey from humble beginnings in Rameswaram to leading India's space and missile programs.",
    price: 199,
    category: "Books",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop",
    stock: 120,
    featured: true,
    aiTags: ["autobiography", "inspirational", "science", "India", "biography"],
  },
  {
    name: "Atomic Habits — James Clear",
    description: "An easy and proven way to build good habits and break bad ones. James Clear shares actionable strategies for every goal with the 1% rule. Over 10 million copies sold worldwide.",
    price: 499,
    category: "Books",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f84c0?w=500&h=500&fit=crop",
    stock: 90,
    featured: false,
    aiTags: ["self-help", "habits", "productivity", "motivation", "bestseller"],
  },

  // ── Home & Kitchen ────────────────────────────────────────
  {
    name: "Prestige Pressure Cooker 5 Litre",
    description: "Aluminium pressure cooker with gasket release system for safe venting. Suitable for all heat sources including induction. Comes with a spare gasket and safety valve. ISI marked.",
    price: 1899,
    category: "Home & Kitchen",
    imageUrl: "https://images.unsplash.com/photo-1574717024652-be21e3e62f1b?w=500&h=500&fit=crop",
    stock: 25,
    featured: false,
    aiTags: ["cooker", "kitchen", "cooking", "appliance", "pressure cooker"],
  },
  {
    name: "Philips HL7756 750W Mixer Grinder",
    description: "Powerful 750W motor mixer grinder with 3 stainless steel jars — liquidising, multipurpose, and chutney. Features motor overload protection, copper motor, and Turbo mode for efficient grinding.",
    price: 3299,
    category: "Home & Kitchen",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
    stock: 20,
    featured: false,
    aiTags: ["mixer grinder", "kitchen", "appliance", "cooking", "electric"],
  },
  {
    name: "Milton Thermosteel Flask 1 Litre",
    description: "Double-walled vacuum insulated stainless steel flask that keeps beverages hot for 24 hours and cold for 12 hours. Leak-proof lid, food-grade inner and outer, and wide mouth for easy cleaning.",
    price: 699,
    category: "Home & Kitchen",
    imageUrl: "https://images.unsplash.com/photo-1602143407296-7303fe3f8a58?w=500&h=500&fit=crop",
    stock: 70,
    featured: false,
    aiTags: ["flask", "thermos", "bottle", "insulated", "stainless steel"],
  },

  // ── Sports ────────────────────────────────────────────────
  {
    name: "Boldfit Anti-Slip Yoga Mat",
    description: "6mm thick NBR foam yoga mat with non-slip surface, moisture-resistant top, and alignment lines. Comes with carry strap for easy transport. Suitable for yoga, pilates, and floor exercises.",
    price: 599,
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop",
    stock: 65,
    featured: false,
    aiTags: ["yoga", "fitness", "mat", "exercise", "sports"],
  },
  {
    name: "Cosco Football Size 5",
    description: "FIFA standard size 5 football with 32-panel design, high-gloss PU outer casing, and latex bladder for superior bounce and shape retention. Ideal for matches and training sessions.",
    price: 449,
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
    stock: 55,
    featured: false,
    aiTags: ["football", "soccer", "sports", "outdoor", "game"],
  },

  // ── Health & Beauty ───────────────────────────────────────
  {
    name: "Himalaya Neem Face Wash 150ml",
    description: "Gentle, soap-free face wash with neem and turmeric extracts that helps control acne and pimples. Removes excess oil while maintaining skin's natural moisture balance. Dermatologically tested, suitable for all skin types.",
    price: 149,
    category: "Health & Beauty",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop",
    stock: 150,
    featured: false,
    aiTags: ["face wash", "skincare", "neem", "acne", "beauty"],
  },
  {
    name: "Mamaearth Vitamin C Face Serum 30ml",
    description: "Lightweight face serum with 15% Vitamin C and hyaluronic acid that brightens skin tone and reduces dark spots. Boosts collagen production, reduces fine lines, and provides antioxidant protection. Free from harmful chemicals.",
    price: 549,
    category: "Health & Beauty",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop",
    stock: 85,
    featured: true,
    aiTags: ["serum", "skincare", "vitamin C", "face", "beauty"],
  },
];

async function seed() {
  try {
    await connectDB();

    // Delete all existing products
    const deleted = await Product.destroy({ where: {}, truncate: true });
    console.log(`🗑️  Cleared existing products`);

    // Insert new products
    const inserted = await Product.bulkCreate(products);
    console.log(`✅ Inserted ${inserted.length} new products:\n`);
    inserted.forEach((p) => console.log(`   • ${p.name} — ₹${p.price}`));

    console.log("\n🎉 Seed complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
