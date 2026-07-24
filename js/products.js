/**
 * Default product catalog.
 * Custom products added via Add Product page are stored in localStorage
 * and merged automatically by getAllProducts().
 */

const DEFAULT_PRODUCTS = [
  {
    id: 'velora-elite-750',
    name: 'Velora Elite 750ml',
    category: 'Premium',
    price: 2499,
    capacity: '750ml',
    description: 'Hand-crafted borosilicate glass bottle with 24K gold-plated cap. Double-wall vacuum insulation keeps drinks cold for 24 hours.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
      'https://images.unsplash.com/photo-1589365278144-c7694a659764?w=800&q=80'
    ],
    badge: 'Bestseller',
    featured: true,
    rating: 4.8,
    reviewCount: 342
  },
  {
    id: 'aqua-luxe-pro',
    name: 'Aqua Luxe Pro 1L',
    category: 'Professional',
    price: 3299,
    capacity: '1 Litre',
    description: 'Medical-grade stainless steel with copper lining. Leak-proof sport cap and premium leather carry sleeve included.',
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
      'https://images.unsplash.com/photo-1610621440483-3741a8a4e5e0?w=800&q=80'
    ],
    badge: 'New',
    featured: true,
    rating: 4.7,
    reviewCount: 218
  },
  {
    id: 'crystal-pure-500',
    name: 'Crystal Pure 500ml',
    category: 'Classic',
    price: 1899,
    description: 'Crystal-clear Tritan body with ergonomic grip. BPA-free, dishwasher safe, and designed for everyday elegance.',
    image: 'https://images.unsplash.com/photo-1589365278144-c7694a659764?w=600&q=80',
    badge: null,
    featured: true
  },
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian 650ml',
    category: 'Premium',
    price: 2799,
    description: 'Matte black finish with laser-engraved logo. Temperature retention for 18 hours hot, 24 hours cold.',
    image: 'https://images.unsplash.com/photo-1610621440483-3741a8a4e5e0?w=600&q=80',
    badge: 'Limited',
    featured: true
  },
  {
    id: 'rose-gold-edition',
    name: 'Rose Gold Edition 750ml',
    category: 'Luxury',
    price: 4499,
    description: 'Exclusive rose gold electroplated finish. Numbered edition with certificate of authenticity and gift packaging.',
    image: 'https://images.unsplash.com/photo-1600573472591-ee6981b68a64?w=600&q=80',
    badge: 'Exclusive',
    featured: false
  },
  {
    id: 'travel-companion',
    name: 'Travel Companion 400ml',
    category: 'Travel',
    price: 1499,
    description: 'Compact and lightweight for on-the-go hydration. Fits standard cup holders with one-hand flip lid.',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
    badge: null,
    featured: false
  },
  {
    id: 'eco-warrior-1l',
    name: 'Eco Warrior 1L',
    category: 'Eco',
    price: 1699,
    description: 'Made from 100% recycled ocean plastic. Every purchase removes 1kg of plastic from the ocean.',
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a9?w=600&q=80',
    badge: 'Eco',
    featured: false
  },
  {
    id: 'executive-set',
    name: 'Executive Gift Set',
    category: 'Luxury',
    price: 6999,
    description: 'Premium duo set with two 500ml bottles in walnut gift box. Perfect for corporate gifting and special occasions.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
    badge: 'Gift Set',
    featured: false
  }
];

const STORAGE_KEY = 'velora_custom_products';

function getCustomProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getAllProducts() {
  const custom = getCustomProducts();
  const defaultIds = new Set(DEFAULT_PRODUCTS.map(p => p.id));
  const uniqueCustom = custom.filter(p => !defaultIds.has(p.id));
  return [...DEFAULT_PRODUCTS, ...uniqueCustom];
}

function getProductById(id) {
  return getAllProducts().find(p => p.id === id) || null;
}

function getFeaturedProducts(limit = 4) {
  return getAllProducts().filter(p => p.featured).slice(0, limit);
}

function getCategories() {
  const products = getAllProducts();
  return [...new Set(products.map(p => p.category))];
}

function formatPrice(price) {
  return `${SITE_CONFIG.currency}${price.toLocaleString('en-IN')}`;
}

function generateProductId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
}

function addCustomProduct(product) {
  const custom = getCustomProducts();
  custom.push(product);
  saveCustomProducts(custom);
}

function deleteCustomProduct(id) {
  const custom = getCustomProducts().filter(p => p.id !== id);
  saveCustomProducts(custom);
}

function isCustomProduct(id) {
  return getCustomProducts().some(p => p.id === id);
}

function enrichProduct(product) {
  if (!product) return null;

  return {
    ...product,
    images: product.images || [product.image],
    features: product.features || [
      'Premium quality materials',
      'Leak-proof sealed cap',
      'BPA-free and food-safe',
      '1 year manufacturer warranty'
    ],
    specs: product.specs || {
      Capacity: product.capacity || '750ml',
      Material: 'Premium Grade',
      Insulation: 'Up to 24 hours',
      Origin: 'Crafted in India',
      Warranty: '1 Year'
    },
    rating: product.rating ?? 4.6,
    reviewCount: product.reviewCount ?? 128,
    capacity: product.capacity || '750ml',
    inStock: product.inStock !== false
  };
}

function getProductImages(product) {
  const enriched = enrichProduct(product);
  return enriched ? enriched.images : [];
}

function getRelatedProducts(productId, limit = 4) {
  const product = getProductById(productId);
  if (!product) return [];

  return getAllProducts()
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

function getSimilarProducts(productId, limit = 4) {
  const product = getProductById(productId);
  if (!product) return [];

  return getAllProducts()
    .filter(p => p.id !== productId && p.category !== product.category)
    .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
    .slice(0, limit);
}

function getProductDetailUrl(productId) {
  return `product-detail.html?id=${encodeURIComponent(productId)}`;
}
