document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = 'products.html';
    return;
  }

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/products`);
    const result = await res.json();

    if (!result.success || !Array.isArray(result.data)) return;

    const product = result.data.find(p => p._id === productId || p.id === productId);
    if (!product) return;

    // 1. Title, Category & Badges
    document.title = `${product.name} — Awanil Store`;
    
    const titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.textContent = product.name;

    const categoryEl = document.getElementById('detail-category');
    if (categoryEl) categoryEl.textContent = product.category || 'Premium';

    const badgesContainer = document.getElementById('detail-badges');
    if (badgesContainer) {
      badgesContainer.innerHTML = product.badge ? `<span class="badge">${product.badge}</span>` : '';
    }

    // 2. Breadcrumbs
    const breadcrumbEl = document.getElementById('breadcrumb');
    if (breadcrumbEl) {
      breadcrumbEl.innerHTML = `
        <a href="index.html">Home</a> &rsaquo;
        <a href="products.html">Shop</a> &rsaquo;
        <span>${product.name}</span>
      `;
    }

    // 3. Pricing & Discounts
    const priceEl = document.getElementById('detail-price');
    if (priceEl) priceEl.textContent = `${CONFIG.currency || '₹'}${Number(product.price).toLocaleString('en-IN')}`;

    const mrpEl = document.getElementById('detail-mrp');
    const discountEl = document.querySelector('.detail-discount');
    if (product.mrp && product.mrp > product.price) {
      if (mrpEl) mrpEl.textContent = `${CONFIG.currency || '₹'}${Number(product.mrp).toLocaleString('en-IN')}`;
      if (discountEl) {
        const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);
        discountEl.textContent = `${discountPercent}% off`;
        discountEl.style.display = 'inline-block';
      }
    } else {
      const mrpContainer = document.querySelector('.detail-mrp');
      if (mrpContainer) mrpContainer.style.display = 'none';
      if (discountEl) discountEl.style.display = 'none';
    }

    // 4. Descriptions
    const shortDescEl = document.getElementById('detail-short-desc');
    if (shortDescEl) shortDescEl.textContent = product.description || '';

    const fullDescEl = document.getElementById('detail-full-desc');
    if (fullDescEl) fullDescEl.textContent = product.description || 'Premium craftsmanship and durable design for everyday hydration.';

    // 5. Stock & Capacity Options
    const capacityEl = document.getElementById('detail-capacity');
    if (capacityEl) capacityEl.textContent = product.capacity || '750ml';

    const stockEl = document.getElementById('detail-stock');
    if (stockEl) {
      stockEl.textContent = product.availability || 'In Stock';
      if ((product.availability || '').toLowerCase().includes('out')) {
        stockEl.className = 'stock-out';
      } else {
        stockEl.className = 'stock-in';
      }
    }

    // 6. Primary Image & Thumbnails Gallery
    const fallbackImg = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80';
    const mainImg = document.getElementById('detail-main-image');
    
    const primaryImgUrl = product.images?.primaryImage ? `${CONFIG.UPLOADS_URL}${product.images.primaryImage}` : fallbackImg;
    if (mainImg) mainImg.src = primaryImgUrl;

    const thumbsContainer = document.getElementById('detail-thumbnails');
    if (thumbsContainer) {
      thumbsContainer.innerHTML = '';
      const imageList = [];
      if (product.images?.primaryImage) imageList.push(`${CONFIG.UPLOADS_URL}${product.images.primaryImage}`);
      if (product.images?.galleryImage1) imageList.push(`${CONFIG.UPLOADS_URL}${product.images.galleryImage1}`);
      if (product.images?.galleryImage2) imageList.push(`${CONFIG.UPLOADS_URL}${product.images.galleryImage2}`);

      if (imageList.length === 0) imageList.push(fallbackImg);

      imageList.forEach((imgSrc, idx) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.className = idx === 0 ? 'detail-thumb active' : 'detail-thumb';
        thumb.style = 'width: 70px; height: 70px; object-fit: contain; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);';
        
        thumb.addEventListener('click', () => {
          if (mainImg) mainImg.src = imgSrc;
          document.querySelectorAll('.detail-thumb').forEach(t => t.style.borderColor = 'rgba(255,255,255,0.1)');
          thumb.style.borderColor = 'var(--gold-light, #d4af37)';
        });

        thumbsContainer.appendChild(thumb);
      });
    }

    // 7. Specifications Tab Table
    const specsTable = document.getElementById('detail-specs-table');
    if (specsTable) {
      specsTable.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-top: 10px;">
          ${product.capacity ? `<div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px;"><strong style="color: var(--gold-light);">Capacity:</strong><p style="margin: 4px 0 0; color: #fff;">${product.capacity}</p></div>` : ''}
          ${product.material ? `<div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px;"><strong style="color: var(--gold-light);">Material:</strong><p style="margin: 4px 0 0; color: #fff;">${product.material}</p></div>` : ''}
          ${product.insulation ? `<div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px;"><strong style="color: var(--gold-light);">Insulation:</strong><p style="margin: 4px 0 0; color: #fff;">${product.insulation}</p></div>` : ''}
          ${product.origin ? `<div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px;"><strong style="color: var(--gold-light);">Origin:</strong><p style="margin: 4px 0 0; color: #fff;">${product.origin}</p></div>` : ''}
          ${product.warranty ? `<div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px;"><strong style="color: var(--gold-light);">Warranty:</strong><p style="margin: 4px 0 0; color: #fff;">${product.warranty}</p></div>` : ''}
        </div>
      `;
    }

    // 8. Dynamic Flipkart / Direct Order Action Buttons
    const buyBtn = document.getElementById('detail-buy-btn');
    const orderBtn = document.getElementById('detail-order-btn');

    if (product.buyLink) {
      if (buyBtn) {
        buyBtn.textContent = 'Buy on Flipkart';
        buyBtn.href = product.buyLink;
        buyBtn.target = '_blank';
        buyBtn.rel = 'noopener noreferrer';
      }
      if (orderBtn) {
        orderBtn.style.display = 'none'; // Marketplace product ke liye secondary button hide karein
      }
    } else {
      if (buyBtn) {
        buyBtn.textContent = 'Buy Now';
        buyBtn.href = `order.html?product=${product._id}`;
      }
      if (orderBtn) {
        orderBtn.href = `order.html?product=${product._id}`;
      }
    }

    // 9. Quantity Buttons Setup
    const qtyInput = document.getElementById('detail-quantity');
    const minusBtn = document.getElementById('qty-minus');
    const plusBtn = document.getElementById('qty-plus');

    if (plusBtn && qtyInput) {
      plusBtn.addEventListener('click', () => {
        qtyInput.value = parseInt(qtyInput.value || 1) + 1;
      });
    }
    if (minusBtn && qtyInput) {
      minusBtn.addEventListener('click', () => {
        if (parseInt(qtyInput.value) > 1) {
          qtyInput.value = parseInt(qtyInput.value) - 1;
        }
      });
    }

  } catch (error) {
    console.error('Failed to load product details:', error);
  }
});