/**
 * Shop Products Catalog: Live fetch from Render & MongoDB Atlas
 */

let ALL_PRODUCTS_CACHE = [];

// 1. Fetch products from Render API
async function fetchAllLiveProducts() {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/products`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();

    if (result.success && Array.isArray(result.data)) {
      ALL_PRODUCTS_CACHE = result.data;
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch products from backend:', error);
    return [];
  }
}

// 2. Render Cards into Grid
function renderCards(products, container) {
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">No products found in this category.</p>';
    return;
  }

  container.innerHTML = products.map(product => {
    const imgUrl = product.images && product.images.primaryImage
      ? `${CONFIG.UPLOADS_URL}${product.images.primaryImage}`
      : 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80';

    const buyButtonHtml = product.buyLink 
      ? `<a href="${product.buyLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="text-align: center; width: 100%;">Buy on Flipkart</a>`
      : `<a href="order.html?product=${product._id}" class="btn btn-primary" style="text-align: center; width: 100%;">Buy Now</a>`;

    return `
      <div class="product-card">
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
            <span class="current-price">${CONFIG.currency || '₹'}${Number(product.price).toLocaleString('en-IN')}</span>
            ${product.mrp ? `<span class="original-price">${CONFIG.currency \vert{}\vert{} '₹'}${Number(product.mrp).toLocaleString('en-IN')}</span>` : ''}
          </div>
          <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 8px;">
            ${buyButtonHtml}
            <a href="product-detail.html?id=${product._id}" class="btn btn-secondary" style="text-align: center; width: 100%;">View Details</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 3. Initialize Shop and Category Buttons
document.addEventListener('DOMContentLoaded', async () => {
  const productsContainer = document.getElementById('all-products') || document.getElementById('products-grid');
  const filtersContainer = document.getElementById('category-filters');

  if (!productsContainer) return;

  productsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">Loading products...</p>';

  const products = await fetchAllLiveProducts();
  renderCards(products, productsContainer);

  // Render Dynamic Category Buttons
  if (filtersContainer && products.length > 0) {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    
    // Remove old dynamic buttons, keep only 'All'
    filtersContainer.innerHTML = '<button class="filter-btn active" data-category="all">All</button>';

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.category = cat;
      btn.textContent = cat;
      filtersContainer.appendChild(btn);
    });

    // Add Click Listener to Category Buttons
    filtersContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('filter-btn')) return;

      filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const selectedCategory = e.target.dataset.category;
      const filteredList = selectedCategory === 'all'
        ? ALL_PRODUCTS_CACHE
        : ALL_PRODUCTS_CACHE.filter(p => p.category === selectedCategory);

      renderCards(filteredList, productsContainer);
    });
  }
});