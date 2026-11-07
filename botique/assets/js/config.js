/* BOTIQUE — store configuration.
   This file is the single place to connect real commerce infrastructure.
   The site runs in demo mode until you add live payment links. */
window.BOTIQUE_CONFIG = {
  storeName: 'BOTIQUE',
  supportEmail: 'hello@botique.shop',
  currency: 'USD',

  // 'demo' shows the preview checkout. 'stripe-links' redirects each product
  // to a Stripe Payment Link (create one per product in the Stripe dashboard).
  payments: {
    mode: 'demo',
    stripePublishableKey: '', // pk_live_… (only needed for embedded Stripe Checkout)
    paymentLinks: {
      // 'eilik': 'https://buy.stripe.com/…',
    },
    paypalClientId: ''
  },

  // Optional: connect a form endpoint (Formspree, Basin, your own API).
  newsletterEndpoint: '',
  orderEndpoint: '',

  // Analytics — paste your IDs, then uncomment the loader in SELLING.md.
  analytics: {
    ga4: '',
    metaPixel: '',
    tiktokPixel: '',
    klaviyo: ''
  },

  // Operational defaults displayed in the UI.
  shipping: {
    freeThresholdUSD: 150,
    dispatch: '1–2 business days',
    returnsDays: 30,
    warrantyYears: 2
  }
};
