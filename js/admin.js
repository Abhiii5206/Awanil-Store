/**
 * Add / manage custom products (stored in localStorage)
 */

document.addEventListener('DOMContentLoaded', () => {
  initAddProductForm();
  renderAdminProductList();
});

function initAddProductForm() {
  const form = document.getElementById('add-product-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    hideAlert('admin-alert');

    const name = form.productName.value.trim();
    const price = parseFloat(form.productPrice.value);
    const category = form.productCategory.value.trim();
    const description = form.productDescription.value.trim();
    const image = form.productImage.value.trim();
    const badge = form.productBadge.value.trim() || null;
    const featured = form.productFeatured.checked;

    if (!name || !price || !category || !description) {
      showAlert('admin-alert', 'Please fill in all required fields.', 'error');
      return;
    }

    const product = {
      id: generateProductId(name),
      name,
      category,
      price,
      description,
      image: image || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
      badge,
      featured
    };

    addCustomProduct(product);
    showAlert('admin-alert', `"${name}" added successfully! It now appears in the shop.`, 'success');
    form.reset();
    renderAdminProductList();
  });
}

function renderAdminProductList() {
  const container = document.getElementById('custom-products-list');
  if (!container) return;

  const custom = getCustomProducts();

  if (custom.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted);">No custom products yet. Add one above.</p>';
    return;
  }

  container.innerHTML = custom
    .map(
      p => `
      <div class="admin-product-item">
        <img src="${p.image}" alt="${p.name}"
             onerror="this.src='https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'">
        <div class="admin-product-info">
          <h4>${p.name}</h4>
          <span>${formatPrice(p.price)} · ${p.category}${p.featured ? ' · Featured' : ''}</span>
        </div>
        <button class="btn-delete" onclick="handleDeleteProduct('${p.id}')">Remove</button>
      </div>
    `
    )
    .join('');
}

function handleDeleteProduct(id) {
  if (!confirm('Remove this product from your shop?')) return;
  deleteCustomProduct(id);
  renderAdminProductList();
  showAlert('admin-alert', 'Product removed.', 'info');
}
