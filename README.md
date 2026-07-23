# Velora — Premium Bottle E-Commerce Website

A professional, 3D-styled frontend e-commerce website for selling premium bottles. Built with **HTML, CSS, and JavaScript only** — no backend required.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero with 3D bottle, featured products, features, testimonials |
| Shop | `products.html` | Full product catalog with category filters |
| About | `about.html` | Brand story and values |
| Contact | `contact.html` | Contact form and business info |
| Product Detail | `product-detail.html` | Full product page with gallery, options, related & similar products |
| Order | `order.html` | Order form — sends details to Gmail |
| Add Product | `add-product.html` | Easy admin page to add new products |

## Quick Start

1. Open `index.html` in your browser (double-click the file)
2. Or run a local server:
   ```bash
   npx serve .
   ```

## Gmail Order Setup (EmailJS)

Orders are sent to your Gmail automatically using [EmailJS](https://www.emailjs.com/) (free tier: 200 emails/month).

### Step 1: Create EmailJS Account
Go to [emailjs.com](https://www.emailjs.com/) and sign up free.

### Step 2: Connect Gmail
- Dashboard → **Email Services** → Add New Service → Gmail
- Connect your Gmail account

### Step 3: Create Email Template
Dashboard → **Email Templates** → Create New Template

Use this template body:

```
NEW ORDER — Velora Premium Bottles
===================================

Customer: {{customer_name}}
Email: {{customer_email}}
Phone: {{customer_phone}}

Product: {{product_name}}
Quantity: {{quantity}} pieces
Unit Price: {{unit_price}}
Total: {{total_price}}

Delivery Address:
{{address}}
{{city}}, {{state}} — {{pincode}}

Notes: {{notes}}
Order Date: {{order_date}}
```

Set **To Email** to your Gmail address.

### Step 4: Update Config
Edit `js/config.js`:

```javascript
const SITE_CONFIG = {
  brandName: 'Velora',
  ownerEmail: 'your-actual@gmail.com',  // Your Gmail

  emailJS: {
    serviceId: 'service_xxxxxxx',    // From Email Services
    templateId: 'template_xxxxxxx',  // From Email Templates
    publicKey: 'your_public_key'     // From Account → API Keys
  },
  // ...
};
```

### Fallback
If EmailJS is not configured, the order form opens your email client (mailto) with all order details pre-filled.

## Adding Products

### Method 1: Admin Page (Easy)
1. Go to **Add Product** page (`add-product.html`)
2. Fill in name, price, category, description, image URL
3. Click **Add Product to Shop**
4. Product appears instantly in the shop

### Method 2: Edit Code (Permanent)
Edit `js/products.js` and add to the `DEFAULT_PRODUCTS` array:

```javascript
{
  id: 'my-new-bottle',
  name: 'My New Bottle',
  category: 'Premium',
  price: 1999,
  description: 'Product description here.',
  image: 'https://images.unsplash.com/photo-xxxxx',
  badge: 'New',
  featured: true
}
```

## Customization

| What | Where |
|------|-------|
| Brand name & email | `js/config.js` |
| Default products | `js/products.js` |
| Colors & styling | `css/style.css` (`:root` variables) |
| Contact info | `contact.html` |

## File Structure

```
E-Commerce/
├── index.html
├── products.html
├── about.html
├── contact.html
├── order.html
├── product-detail.html
├── add-product.html
├── css/
│   └── style.css
├── js/
│   ├── config.js      ← Site & EmailJS config
│   ├── products.js    ← Product catalog
│   ├── main.js        ← Shared functionality
│   ├── order.js       ← Order form & Gmail
│   ├── product-detail.js ← Product detail page
│   └── admin.js       ← Add product page
└── README.md
```

## Features

- 3D hero bottle with mouse parallax effect
- Dark luxury theme with gold accents
- Fully responsive (mobile, tablet, desktop)
- Category filtering on shop page
- Live order summary with price calculation
- Product management without coding
- Scroll reveal animations
- All pages linked via navigation

## Future Backend

When you're ready to add a backend, replace:
- EmailJS → your server API for orders
- localStorage products → database
- Static pages → dynamic routing

The frontend structure is ready for this upgrade.
