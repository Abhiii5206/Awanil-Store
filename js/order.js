/**
 * Order form — sends order details to Gmail via EmailJS
 */

let selectedProduct = null;

document.addEventListener('DOMContentLoaded', () => {
  initOrderPage();
});

function initOrderPage() {
  const productId = getUrlParam('product');
  selectedProduct = productId ? getProductById(productId) : null;

  populateProductSelect();
  updateOrderSummary();

  if (selectedProduct) {
    const select = document.getElementById('product-select');
    if (select) select.value = selectedProduct.id;
  }

  const qtyParam = getUrlParam('quantity');
  if (qtyParam) {
    const qtyInput = document.getElementById('quantity');
    if (qtyInput) qtyInput.value = Math.max(1, Math.min(99, parseInt(qtyParam) || 1));
  }

  document.getElementById('product-select')?.addEventListener('change', e => {
    selectedProduct = getProductById(e.target.value);
    updateOrderSummary();
  });

  document.getElementById('quantity')?.addEventListener('input', updateOrderSummary);

  document.getElementById('order-form')?.addEventListener('submit', handleOrderSubmit);
}

function populateProductSelect() {
  const select = document.getElementById('product-select');
  if (!select) return;

  const products = getAllProducts();
  select.innerHTML = products
    .map(p => `<option value="${p.id}">${p.name} — ${formatPrice(p.price)}</option>`)
    .join('');

  if (products.length > 0 && !selectedProduct) {
    selectedProduct = products[0];
  }
}

function updateOrderSummary() {
  const summaryEl = document.getElementById('order-summary');
  if (!summaryEl || !selectedProduct) return;

  const qty = parseInt(document.getElementById('quantity')?.value) || 1;
  const total = selectedProduct.price * qty;

  summaryEl.innerHTML = `
    <h3>Order Summary</h3>
    <div class="summary-row">
      <span>Product</span>
      <span>${selectedProduct.name}</span>
    </div>
    <div class="summary-row">
      <span>Unit Price</span>
      <span>${formatPrice(selectedProduct.price)}</span>
    </div>
    <div class="summary-row">
      <span>Quantity</span>
      <span>${qty} piece${qty > 1 ? 's' : ''}</span>
    </div>
    <div class="summary-row total">
      <span>Total</span>
      <span>${formatPrice(total)}</span>
    </div>
  `;
}

async function handleOrderSubmit(e) {
  e.preventDefault();
  hideAlert('form-alert');

  const form = e.target;
  const submitBtn = form.querySelector('[type="submit"]');
  const originalText = submitBtn.textContent;

  const productId = form.product.value;
  selectedProduct = getProductById(productId);
  if (!selectedProduct) {
    showAlert('form-alert', 'Please select a valid product.', 'error');
    return;
  }

  const quantity = parseInt(form.quantity.value) || 1;
  const totalPrice = selectedProduct.price * quantity;

  const orderData = {
    customer_name: form.fullName.value.trim(),
    customer_email: form.email.value.trim(),
    customer_phone: form.phone.value.trim(),
    product_name: selectedProduct.name,
    product_id: selectedProduct.id,
    quantity: quantity,
    unit_price: formatPrice(selectedProduct.price),
    total_price: formatPrice(totalPrice),
    address: form.address.value.trim(),
    city: form.city.value.trim(),
    state: form.state.value.trim(),
    pincode: form.pincode.value.trim(),
    notes: form.notes.value.trim() || 'None',
    order_date: new Date().toLocaleString('en-IN')
  };

  if (!validateOrder(orderData)) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending Order...';

  const emailSent = await sendOrderEmail(orderData);

  if (emailSent) {
    saveOrderLocally(orderData);
    showAlert(
      'form-alert',
      'Order placed successfully! We will contact you shortly to confirm your order.',
      'success'
    );
    form.reset();
    if (selectedProduct) {
      form.product.value = selectedProduct.id;
    }
    form.quantity.value = '1';
    updateOrderSummary();
  } else {
    showAlert(
      'form-alert',
      'Could not send email automatically. Your order was saved locally — please configure EmailJS in js/config.js or contact us directly.',
      'error'
    );
    saveOrderLocally(orderData);
    openMailtoFallback(orderData);
  }

  submitBtn.disabled = false;
  submitBtn.textContent = originalText;
}

function validateOrder(data) {
  if (!data.customer_name) {
    showAlert('form-alert', 'Please enter your full name.', 'error');
    return false;
  }
  if (!data.customer_email || !data.customer_email.includes('@')) {
    showAlert('form-alert', 'Please enter a valid email address.', 'error');
    return false;
  }
  if (!data.customer_phone || data.customer_phone.length < 10) {
    showAlert('form-alert', 'Please enter a valid phone number.', 'error');
    return false;
  }
  if (!data.address) {
    showAlert('form-alert', 'Please enter your delivery address.', 'error');
    return false;
  }
  if (!data.city) {
    showAlert('form-alert', 'Please enter your city.', 'error');
    return false;
  }
  if (!data.pincode || data.pincode.length < 6) {
    showAlert('form-alert', 'Please enter a valid 6-digit pincode.', 'error');
    return false;
  }
  return true;
}

async function sendOrderEmail(orderData) {
  const { serviceId, templateId, publicKey } = SITE_CONFIG.emailJS;

  if (
    serviceId === 'YOUR_SERVICE_ID' ||
    templateId === 'YOUR_TEMPLATE_ID' ||
    publicKey === 'YOUR_PUBLIC_KEY'
  ) {
    return false;
  }

  if (typeof emailjs === 'undefined') {
    return false;
  }

  try {
    await emailjs.send(serviceId, templateId, orderData, publicKey);
    return true;
  } catch (err) {
    console.error('EmailJS error:', err);
    return false;
  }
}

function openMailtoFallback(data) {
  const subject = encodeURIComponent(`New Order: ${data.product_name} x${data.quantity}`);
  const body = encodeURIComponent(
    `NEW ORDER — ${SITE_CONFIG.brandName}\n` +
    `${'='.repeat(40)}\n\n` +
    `Customer: ${data.customer_name}\n` +
    `Email: ${data.customer_email}\n` +
    `Phone: ${data.customer_phone}\n\n` +
    `Product: ${data.product_name}\n` +
    `Quantity: ${data.quantity} pieces\n` +
    `Unit Price: ${data.unit_price}\n` +
    `Total: ${data.total_price}\n\n` +
    `Delivery Address:\n${data.address}\n` +
    `${data.city}, ${data.state} — ${data.pincode}\n\n` +
    `Notes: ${data.notes}\n\n` +
    `Order Date: ${data.order_date}`
  );

  window.open(`mailto:${SITE_CONFIG.ownerEmail}?subject=${subject}&body=${body}`, '_blank');
}

function saveOrderLocally(orderData) {
  const orders = JSON.parse(localStorage.getItem('velora_orders') || '[]');
  orders.push({ ...orderData, savedAt: new Date().toISOString() });
  localStorage.setItem('velora_orders', JSON.stringify(orders));
}
