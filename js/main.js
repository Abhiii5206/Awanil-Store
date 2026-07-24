/**
 * Shared functionality across all pages
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollEffects();
  init3DEffects();
  highlightActiveNav();
});

function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }
}

function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initScrollEffects() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
}

function init3DEffects() {
  const showcase = document.querySelector('.bottle-showcase-inner');
  if (!showcase) return;

  const parent = showcase.closest('.hero-3d');
  parent.addEventListener('mousemove', e => {
    const rect = parent.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    showcase.style.transform = `rotateY(${x * 20}deg) rotateX(${-y * 15}deg)`;
  });

  parent.addEventListener('mouseleave', () => {
    showcase.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}

function renderProductCard(product, options = {}) {
  const compact = options.compact === true;
  const detailUrl = getProductDetailUrl(product.id);
  const fallbackImage = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80';

  const badge = product.badge
    ? `<span class="product-badge">${product.badge}</span>`
    : '';

  return `
    <article class="product-card${compact ? ' product-card-compact' : ''} reveal" data-category="${product.category}">
      <a href="${detailUrl}" class="product-image-link" aria-label="View ${product.name} details">
        <div class="product-image-wrap">
          ${badge}
          <img src="${product.image}" alt="${product.name}" loading="lazy"
               onerror="this.src='${fallbackImage}'">
        </div>
      </a>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3><a href="${detailUrl}" class="product-title-link">${product.name}</a></h3>
        ${compact ? '' : `<p>${product.description}</p>`}
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
          <a href="order.html?product=${product.id}" class="btn btn-ghost" onclick="event.stopPropagation()">Order Now</a>
        </div>
      </div>
    </article>
  `;
}

function renderProductsGrid(container, products) {
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try a different category or add new products.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products
    .map(p => renderProductCard(p, { compact: p.compact }))
    .join('');
  initScrollEffects();
}

function getUrlParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function showAlert(elementId, message, type = 'success') {
  const alert = document.getElementById(elementId);
  if (!alert) return;
  alert.textContent = message;
  alert.className = `alert alert-${type} show`;
}

function hideAlert(elementId) {
  const alert = document.getElementById(elementId);
  if (alert) alert.classList.remove('show');
}
