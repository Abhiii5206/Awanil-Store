/**
 * Shop Products Catalog: Fetches live data from Render & MongoDB Atlas
 */

let ALL_PRODUCTS_CACHE = [];

async function fetchAllLiveProducts() {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/products`);
    const data = await res.json();
    if (data.success) {
      ALL_PRODUCTS_CACHE = data.data;
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch products from backend:', error);
    return [];
  }
}

async function getAllProducts() {
  if (ALL_PRODUCTS_CACHE.length > 0) return ALL_PRODUCTS_CACHE;
  return await fetchAllLiveProducts();
}

async function getProductById(id) {
  const products = await getAllProducts();
  return products.find(p => p._id === id || p.id === id) || null;
}

function formatPrice(price) {
  return `${CONFIG.currency}${Number(price).toLocaleString('en-IN')}`;
}

// Render dynamic products on the Shop page
document.addEventListener('DOMContentLoaded', async () => {
  const productsGrid = document.getElementById('products-grid') || document.querySelector('.products-grid');
  if (!productsGrid) return;

  productsGrid.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">Loading premium catalog...</p>';

  const products = await fetchAllLiveProducts();

  if (!products || products.length === 0) {
    productsGrid.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">No products found in store.</p>';
    return;
  }

  productsGrid.innerHTML = '';

  products.forEach(product => {
    const imgUrl = product.images && product.images.primaryImage
      ? `${CONFIG.UPLOADS_URL}${product.images.primaryImage}`
      : 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80';

    // External buy link handler
    const buyButtonHtml = product.buyLink 
      ? `<a href="${product.buyLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="text-align: center; width: 100%;">Buy on Flipkart</a>`
      : `<a href="order.html?product=${product._id}" class="btn btn-primary" style="text-align: center; width: 100%;">Buy Now</a>`;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
      <div class="product-thumb">
        <a href="product-detail.html?id=${product._id}">
          <img src="${imgUrl}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'">
        </a>
      </div>
      <div class="product-info">
        <span class="category">${product.category}</span>
        <h3 class="product-title"><a href="product-detail.html?id=${product._id}">${product.name}</a></h3>
        <div class="product-pricing">
          <span class="current-price">${formatPrice(product.price)}</span>
          ${product.mrp ? `<span class="original-price">${formatPrice(product.mrp)}</span>` : ''}
        </div>
        <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 8px;">
          ${buyButtonHtml}
          <a href="product-detail.html?id=${product._id}" class="btn btn-secondary" style="text-align: center; width: 100%;">View Details</a>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
});