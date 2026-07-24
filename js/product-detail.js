/**
 * Product detail page — Flipkart / Amazon style layout
 */

document.addEventListener('DOMContentLoaded', () => {
  initProductDetailPage();
});

function initProductDetailPage() {
  const productId = getUrlParam('id');
  const product = productId ? enrichProduct(getProductById(productId)) : null;

  if (!product) {
    showProductNotFound();
    return;
  }

  document.title = `${product.name} — Velora`;
  renderBreadcrumb(product);
  renderProductGallery(product);
  renderProductInfo(product);
  renderProductTabs(product);
  renderRelatedProducts(product.id);
  renderSimilarProducts(product.id);
  initGalleryControls();
  initQuantityControls(product);
  initDetail3DEffect();
}

function showProductNotFound() {
  document.getElementById('product-detail-root').innerHTML = `
    <div class="container product-not-found">
      <h1>Product Not Found</h1>
      <p>The product you're looking for doesn't exist or may have been removed.</p>
      <a href="products.html" class="btn btn-primary">Browse All Products</a>
    </div>
  `;
}

function renderBreadcrumb(product) {
  const el = document.getElementById('breadcrumb');
  if (!el) return;

  el.innerHTML = `
    <a href="index.html">Home</a>
    <span class="breadcrumb-sep">/</span>
    <a href="products.html">Shop</a>
    <span class="breadcrumb-sep">/</span>
    <a href="products.html?category=${encodeURIComponent(product.category)}">${product.category}</a>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">${product.name}</span>
  `;
}

function renderProductGallery(product) {
  const mainImage = document.getElementById('detail-main-image');
  const thumbs = document.getElementById('detail-thumbnails');
  if (!mainImage || !thumbs) return;

  const images = getProductImages(product);
  mainImage.src = images[0];
  mainImage.alt = product.name;

  thumbs.innerHTML = images
    .map(
      (img, index) => `
      <button type="button" class="detail-thumb${index === 0 ? ' active' : ''}" data-image="${img}" aria-label="View image ${index + 1}">
        <img src="${img}" alt="${product.name} view ${index + 1}"
             onerror="this.src='https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'">
      </button>
    `
    )
    .join('');
}

function renderProductInfo(product) {
  const badge = product.badge
    ? `<span class="detail-badge">${product.badge}</span>`
    : '';

  const stars = renderStars(product.rating);

  document.getElementById('detail-category').textContent = product.category;
  document.getElementById('detail-title').textContent = product.name;
  document.getElementById('detail-badges').innerHTML = badge;
  document.getElementById('detail-rating').innerHTML = `
    ${stars}
    <span class="detail-rating-text">${product.rating} · ${product.reviewCount} reviews</span>
  `;
  document.getElementById('detail-price').textContent = formatPrice(product.price);
  document.getElementById('detail-mrp').textContent = formatPrice(Math.round(product.price * 1.15));
  document.getElementById('detail-short-desc').textContent = product.description;

  document.getElementById('detail-capacity').textContent = product.capacity;
  document.getElementById('detail-stock').textContent = product.inStock ? 'In Stock' : 'Out of Stock';
  document.getElementById('detail-stock').className = product.inStock ? 'stock-in' : 'stock-out';

  const orderBtn = document.getElementById('detail-order-btn');
  const buyBtn = document.getElementById('detail-buy-btn');
  const orderUrl = `order.html?product=${product.id}`;

  orderBtn.href = orderUrl;
  buyBtn.href = orderUrl;

  document.getElementById('detail-features-list').innerHTML = product.features
    .map(f => `<li>${f}</li>`)
    .join('');
}

function renderProductTabs(product) {
  document.getElementById('detail-full-desc').textContent = product.description;

  const specsEl = document.getElementById('detail-specs-table');
  specsEl.innerHTML = Object.entries(product.specs)
    .map(
      ([key, value]) => `
      <div class="spec-row">
        <span class="spec-label">${key}</span>
        <span class="spec-value">${value}</span>
      </div>
    `
    )
    .join('');
}

function renderRelatedProducts(productId) {
  const container = document.getElementById('related-products');
  const products = getRelatedProducts(productId, 4);
  renderProductSection(container, products, 'related-empty');
}

function renderSimilarProducts(productId) {
  const container = document.getElementById('similar-products');
  const products = getSimilarProducts(productId, 4);
  renderProductSection(container, products, 'similar-empty');
}

function renderProductSection(container, products, emptyId) {
  if (!container) return;

  const emptyEl = document.getElementById(emptyId);
  if (products.length === 0) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  container.innerHTML = products.map(p => renderProductCard(p, { compact: true })).join('');
  initScrollEffects();
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '<span class="detail-stars">';

  for (let i = 0; i < 5; i++) {
    if (i < full) html += '&#9733;';
    else if (i === full && half) html += '&#9733;';
    else html += '<span class="star-empty">&#9733;</span>';
  }

  html += '</span>';
  return html;
}

function initGalleryControls() {
  const mainImage = document.getElementById('detail-main-image');
  const thumbs = document.querySelectorAll('.detail-thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImage.src = thumb.dataset.image;
      mainImage.style.opacity = '0';
      setTimeout(() => {
        mainImage.style.opacity = '1';
      }, 50);
    });
  });
}

function initQuantityControls(product) {
  const qtyInput = document.getElementById('detail-quantity');
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  const orderBtn = document.getElementById('detail-order-btn');
  const buyBtn = document.getElementById('detail-buy-btn');

  if (!qtyInput) return;

  function updateLinks() {
    const qty = qtyInput.value;
    const url = `order.html?product=${product.id}&quantity=${qty}`;
    orderBtn.href = url;
    buyBtn.href = url;
  }

  minusBtn?.addEventListener('click', () => {
    const val = parseInt(qtyInput.value) || 1;
    if (val > 1) qtyInput.value = val - 1;
    updateLinks();
  });

  plusBtn?.addEventListener('click', () => {
    const val = parseInt(qtyInput.value) || 1;
    if (val < 99) qtyInput.value = val + 1;
    updateLinks();
  });

  qtyInput.addEventListener('change', () => {
    let val = parseInt(qtyInput.value) || 1;
    val = Math.max(1, Math.min(99, val));
    qtyInput.value = val;
    updateLinks();
  });

  document.querySelectorAll('.detail-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.detail-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    });
  });
}

function initDetail3DEffect() {
  const gallery = document.querySelector('.detail-gallery-main');
  const image = document.getElementById('detail-main-image');
  if (!gallery || !image) return;

  gallery.addEventListener('mousemove', e => {
    const rect = gallery.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    image.style.transform = `scale(1.05) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });

  gallery.addEventListener('mouseleave', () => {
    image.style.transform = 'scale(1) rotateY(0deg) rotateX(0deg)';
  });
}
