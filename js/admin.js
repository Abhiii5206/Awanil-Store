/**
 * Admin Panel: Add, Fetch & Delete products via Live Cloud Backend (Render + MongoDB Atlas)
 */

document.addEventListener('DOMContentLoaded', () => {
  initAddProductForm();
  renderAdminProductList();
});

// 1. Add New Product Handler
function initAddProductForm() {
  const form = document.getElementById('add-product-form');
  const alertBox = document.getElementById('admin-alert');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (alertBox) {
      alertBox.textContent = 'Uploading product and images to cloud...';
      alertBox.style.display = 'block';
      alertBox.style.color = 'var(--gold-light, #d4af37)';
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/products`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (alertBox) {
          alertBox.textContent = `✅ "${result.data?.name || 'Product'}" added successfully to MongoDB Atlas!`;
          alertBox.style.color = '#4ade80';
        }
        form.reset();
        renderAdminProductList();
      } else {
        if (alertBox) {
          alertBox.textContent = `❌ ${result.message || 'Failed to add product.'}`;
          alertBox.style.color = '#f87171';
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      if (alertBox) {
        alertBox.textContent = '❌ Cloud connection failed. Please check internet connection.';
        alertBox.style.color = '#f87171';
      }
    }
  });
}

// 2. Fetch & Render Products with "Remove" Button
async function renderAdminProductList() {
  const container = document.getElementById('custom-products-list');
  if (!container) return;

  container.innerHTML = '<p style="color: var(--text-muted); padding: 10px 0;">Loading live products from database...</p>';

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/products`);
    const data = await res.json();

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      container.innerHTML = data.data
        .map(p => {
          const imgUrl = p.images && p.images.primaryImage 
            ? `${CONFIG.UPLOADS_URL}${p.images.primaryImage}` 
            : 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80';

          return `
            <div class="admin-product-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); margin-bottom: 8px; border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <img src="${imgUrl}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: contain; background: rgba(0,0,0,0.3); border-radius: 6px; padding: 4px;"
                     onerror="this.src='https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'">
                <div class="admin-product-info">
                  <h4 style="margin: 0; color: #fff; font-size: 0.95rem;">${p.name}</h4>
                  <span style="font-size: 0.8rem; color: var(--gold-light, #d4af37);">
                    ${CONFIG.currency || '₹'}${Number(p.price).toLocaleString('en-IN')} · ${p.category} ${p.featured ? '· ⭐ Featured' : ''}
                  </span>
                  ${p.buyLink ? `<div style="font-size: 0.75rem;"><a href="${p.buyLink}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Flipkart Link</a></div>` : ''}
                </div>
              </div>
              <button onclick="handleDeleteProduct('${p._id}')" style="background: #ef4444; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: background 0.2s ease;">
                🗑️ Remove
              </button>
            </div>
          `;
        })
        .join('');
    } else {
      container.innerHTML = '<p style="color: var(--text-muted); padding: 10px 0;">No products found in cloud database. Add one above.</p>';
    }
  } catch (err) {
    console.error('Error fetching admin products:', err);
    container.innerHTML = '<p style="color: #f87171;">Failed to load products from backend.</p>';
  }
}

// 3. Delete Product Function (Triggers Backend DELETE Route)
window.handleDeleteProduct = async function(productId) {
  if (!confirm('Are you sure you want to permanently delete this product from MongoDB Atlas?')) {
    return;
  }

  const alertBox = document.getElementById('admin-alert');
  if (alertBox) {
    alertBox.textContent = 'Deleting product from database...';
    alertBox.style.display = 'block';
    alertBox.style.color = 'var(--gold-light, #d4af37)';
  }

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/products/${productId}`, {
      method: 'DELETE'
    });
    const result = await res.json();

    if (res.ok && result.success) {
      if (alertBox) {
        alertBox.textContent = '✅ Product deleted successfully from MongoDB Atlas!';
        alertBox.style.color = '#4ade80';
      }
      renderAdminProductList(); // List reload karega
    } else {
      if (alertBox) {
        alertBox.textContent = `❌ ${result.message || 'Failed to delete product.'}`;
        alertBox.style.color = '#f87171';
      }
    }
  } catch (error) {
    console.error('Delete error:', error);
    if (alertBox) {
      alertBox.textContent = '❌ Server connection failed. Could not delete.';
      alertBox.style.color = '#f87171';
    }
  }
};