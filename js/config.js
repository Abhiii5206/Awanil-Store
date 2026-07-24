/**
 * Velora E-Commerce — Site Configuration
 *
 * GMAIL SETUP (EmailJS — free, no backend needed):
 * 1. Go to https://www.emailjs.com/ and create a free account
 * 2. Add an Email Service → connect your Gmail account
 * 3. Create an Email Template with these variables:
 *    {{customer_name}}, {{customer_email}}, {{customer_phone}},
 *    {{product_name}}, {{quantity}}, {{total_price}},
 *    {{address}}, {{city}}, {{pincode}}, {{state}}, {{notes}}
 * 4. Copy your Service ID, Template ID, and Public Key below
 */

const SITE_CONFIG = {
  brandName: 'Velora',
  tagline: 'Premium Bottles, Elevated Living',
  ownerEmail: 'your-email@gmail.com',

  emailJS: {
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    publicKey: 'YOUR_PUBLIC_KEY'
  },

  currency: '₹',
  currencyCode: 'INR'
};
