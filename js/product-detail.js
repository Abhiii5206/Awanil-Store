// Helper: Image URL resolver (Base64 + Cloud + Local upload safe)
function getResolvedImageUrl(imagePath) {
  const fallbackImage = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80';
  if (!imagePath) return fallbackImage;

  if (imagePath.startsWith('data:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const cleanUploadsUrl = (CONFIG.UPLOADS_URL || '').replace(/\/+$/, '');
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanUploadsUrl}${cleanPath}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Tab Switching Functionality (Description vs Specifications)
  const tabButtons = document.querySelectorAll('.detail-tab-btn');
  const tabPanels = document.querySelectorAll('.detail-tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTabId = button.getAttribute('data-tab');

      // Active state reset karein
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none'; // Safe fallback
      });

      // Selected tab active karein
      button.classList.add('active');
      const activePanel = document.getElementById(targetTabId);
      if (activePanel) {
        activePanel.classList.add('active');
        activePanel.style.display = 'block';
      }
    });
  });

  // 2. Fetch Product Data
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

    // Title, Category & Badges
    document.title = `${product.name} — Awanil Store`;
    
    const titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.textContent = product.name;

    const categoryEl = document.getElementById('detail-category');
    if (categoryEl) categoryEl.textContent = product.category || 'Premium';

    const badgesContainer = document.getElementById('detail-badges');
    if (badgesContainer) {
      badgesContainer.innerHTML = product.badge ? `<span class="badge">${product.badge}</span>` : '';
    }

    // Breadcrumbs
    const breadcrumbEl = document.getElementById('breadcrumb');
    if (breadcrumbEl) {
      breadcrumbEl.innerHTML = `
        <a href="index.html">Home</a> &rsaquo;
        <a href="products.html">Shop</a> &rsaquo;
        <span>${product.name}</span>
      `;
    }

    // Pricing & Discounts
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

    // Descriptions
    const shortDescEl = document.getElementById('detail-short-desc');
    if (shortDescEl) shortDescEl.textContent = product.description || '';

    const fullDescEl = document.getElementById('detail-full-desc');
    if (fullDescEl) fullDescEl.textContent = product.description || 'Premium craftsmanship and durable design for everyday hydration.';

    // Options: Capacity, Color & Availability
    const capacityEl = document.getElementById('detail-capacity');
    if (capacityEl) capacityEl.textContent = product.capacity || '750ml';

    const colorEl = document.getElementById('detail-color');
    if (colorEl) colorEl.textContent = product.color || 'Standard';

    const stockEl = document.getElementById('detail-stock');
    if (stockEl) {
      stockEl.textContent = product.availability || 'In Stock';
      if ((product.availability || '').toLowerCase().includes('out')) {
        stockEl.className = 'stock-out';
      } else {
        stockEl.className = 'stock-in';
      }
    }

    // Gallery & Thumbnails
    const fallbackImg = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80';
    const mainImg = document.getElementById('detail-main-image');
    
    const primaryImgUrl = getResolvedImageUrl(product.images?.primaryImage);
    if (mainImg) {
      mainImg.src = primaryImgUrl;
      mainImg.onerror = () => { mainImg.src = fallbackImg; };
    }

    const thumbsContainer = document.getElementById('detail-thumbnails');
    if (thumbsContainer) {
      thumbsContainer.innerHTML = '';
      const imageList = [];
      
      if (product.images?.primaryImage) imageList.push(getResolvedImageUrl(product.images.primaryImage));
      if (product.images?.galleryImage1) imageList.push(getResolvedImageUrl(product.images.galleryImage1));
      if (product.images?.galleryImage2) imageList.push(getResolvedImageUrl(product.images.galleryImage2));

      if (imageList.length === 0) imageList.push(fallbackImg);

      imageList.forEach((imgSrc, idx) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.className = idx === 0 ? 'detail-thumb active' : 'detail-thumb';
        thumb.style = 'width: 70px; height: 70px; object-fit: contain; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);';
        thumb.onerror = () => { thumb.src = fallbackImg; };

        thumb.addEventListener('click', () => {
          if (mainImg) mainImg.src = imgSrc;
          document.querySelectorAll('.detail-thumb').forEach(t => t.style.borderColor = 'rgba(255,255,255,0.1)');
          thumb.style.borderColor = 'var(--gold-light, #d4af37)';
        });

        thumbsContainer.appendChild(thumb);
      });
    }

    // 3. Render Complete Add-Product Specifications in Table
    const specsTable = document.getElementById('detail-specs-table');
    if (specsTable) {
      const specsData = [
        { label: 'Product Name', value: product.name },
        { label: 'Category', value: product.category },
        { label: 'Color', value: product.color || 'Standard' },
        { label: 'Capacity', value: product.capacity },
        { label: 'Material', value: product.material || 'Stainless Steel' },
        { label: 'Availability', value: product.availability || 'In Stock' },
        { label: 'Country of Origin', value: product.origin || 'Crafted in India' },
        { label: 'Badge', value: product.badge || 'Standard Edition' }
      ];

      specsTable.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 15px;">
          ${specsData.map(item => `
            <div style="padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
              <span style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gold-light, #d4af37); display: block; margin-bottom: 4px;">
                ${item.label}
              </span>
              <p style="margin: 0; color: #fff; font-size: 1rem; font-weight: 500;">
                ${item.value}
              </p>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Action Buttons
    const buyBtn = document.getElementById('detail-buy-btn');
    const orderBtn = document.getElementById('detail-order-btn');

    if (product.buyLink) {
      if (buyBtn) {
        buyBtn.textContent = 'Buy on Flipkart';
        buyBtn.href = product.buyLink;
        buyBtn.target = '_blank';
        buyBtn.rel = 'noopener noreferrer';
      }
      if (orderBtn) orderBtn.style.display = 'none';
    } else {
      if (buyBtn) {
        buyBtn.textContent = 'Buy Now';
        buyBtn.href = `order.html?product=${product._id}`;
      }
      if (orderBtn) {
        orderBtn.href = `order.html?product=${product._id}`;
      }
    }

  } catch (error) {
    console.error('Failed to load product details:', error);
  }
});