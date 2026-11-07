/* BOTIQUE — policy pages */
(function () {
  'use strict';
  const S = window.BOTIQUE;
  const docs = {
    shipping: {
      nav: 'Shipping', title: 'Shipping', lede: 'Where we ship, how fast, and who pays the customs bill (spoiler: we do).',
      body: '<p class="updated">Last updated 1 November 2026</p>' +
        '<div class="doc-note"><b>The short version:</b> free standard shipping over $150. Orders leave our warehouses in 1–2 business days. Duties and taxes are included at checkout — no surprise invoice on the doorstep.</div>' +
        '<h2>Dispatch</h2><p>Orders placed before 2pm local warehouse time usually leave the same business day. Orders placed on weekends or public holidays leave the next business day. You will receive a tracking link as soon as the carrier scans your parcel.</p>' +
        '<p>We ship from regional warehouses in the United States, the European Union and Singapore. Where a product is not stocked locally, it ships from our Asia hub with express air freight; the product page and checkout will show the estimated window for your country.</p>' +
        '<h2>Rates & delivery windows</h2>' +
        '<table><thead><tr><th>Destination</th><th>Standard</th><th>Express</th><th>Typical window</th></tr></thead><tbody>' +
        '<tr><td>United States</td><td>Free over $150, otherwise $9</td><td>$24</td><td>3–5 business days</td></tr>' +
        '<tr><td>Canada</td><td>Free over $150, otherwise $12</td><td>$29</td><td>5–8 business days</td></tr>' +
        '<tr><td>United Kingdom</td><td>Free over $150, otherwise $10</td><td>$28</td><td>3–5 business days</td></tr>' +
        '<tr><td>European Union</td><td>Free over $150, otherwise $10</td><td>$28</td><td>3–6 business days</td></tr>' +
        '<tr><td>Australia & New Zealand</td><td>Free over $150, otherwise $14</td><td>$34</td><td>6–9 business days</td></tr>' +
        '<tr><td>Japan, Korea, Singapore</td><td>Free over $150, otherwise $12</td><td>$30</td><td>4–7 business days</td></tr>' +
        '<tr><td>United Arab Emirates</td><td>Free over $150, otherwise $15</td><td>$35</td><td>5–8 business days</td></tr>' +
        '<tr><td>Rest of world</td><td>Free over $150, otherwise $19</td><td>$45</td><td>7–12 business days</td></tr>' +
        '</tbody></table>' +
        '<p>Delivery windows are estimates from the moment the parcel is handed to the carrier, not from the moment you order. Remote postcodes, customs inspections and severe weather can add time.</p>' +
        '<h2>Duties, taxes and fees</h2><p>Prices at checkout include duties and import taxes for every destination we ship to. BOTIQUE pays the customs broker; you should not receive a separate bill. If a carrier nevertheless charges you import fees, send the receipt to <a href="mailto:hello@botique.shop">hello@botique.shop</a> and we will reimburse them within 10 business days.</p>' +
        '<h2>Tracking</h2><p>Every parcel is tracked. If tracking has not moved for five business days, contact us with your order number and we will open a trace with the carrier. A parcel is considered lost after 20 business days for domestic and 30 business days for international destinations; we will replace it or refund you at that point.</p>' +
        '<h2>Address changes</h2><p>We can change an address before the parcel is handed to the carrier. Once it is in transit, the carrier may allow a redirect; any fee is passed on at cost. We cannot redirect orders that have already cleared customs.</p>' +
        '<h2>Damaged or missing items</h2><p>Please photograph the outer box and the product within 48 hours of delivery and email us. We will arrange a replacement or refund. Do not dispose of the packaging until the claim is closed.</p>'
    },
    returns: {
      nav: 'Returns', title: 'Returns & exchanges', lede: 'Thirty days to change your mind. A few hygiene and safety exceptions, explained plainly.',
      body: '<p class="updated">Last updated 1 November 2026</p>' +
        '<div class="doc-note"><b>The short version:</b> 30 days from delivery, unused and in original packaging. Email us first — we will send a return label and an RMA number.</div>' +
        '<h2>What can be returned</h2><p>You can return most products within 30 days of delivery for a refund or exchange, provided the item is unused, in its original packaging and includes all accessories. A brief test of a robot to confirm it works is fine; a weekend of play is not.</p>' +
        '<h2>What cannot be returned</h2><ul><li>Opened plush, wearable or hygiene-sensitive products, unless faulty. This includes companion pets designed to be cuddled.</li><li>Digital subscriptions, activation codes and gift cards once redeemed.</li><li>Products marked “final sale” at checkout.</li><li>Items damaged by misuse, water, unauthorised repair or modification.</li></ul>' +
        '<h2>How to start a return</h2><ol><li>Email <a href="mailto:hello@botique.shop">hello@botique.shop</a> with your order number and a short description (photos help).</li><li>We reply within one business day with an RMA number and return instructions.</li><li>Pack the item securely, include the RMA slip, and drop it at the carrier we specify.</li><li>We inspect the return within 3 business days of arrival.</li></ol>' +
        '<h2>Refunds</h2><p>Approved refunds are issued to the original payment method within 5–10 business days. Your bank may take a further 3–5 business days to post the credit. Shipping charges are refunded only when the item is faulty, damaged or not what you ordered.</p>' +
        '<h2>Return shipping</h2><p>For faulty, damaged or incorrectly shipped items, we provide a prepaid label. For change-of-mind returns, you pay the return shipping unless your local law says otherwise. We can arrange a discounted label in most countries.</p>' +
        '<h2>Exchanges</h2><p>If you want a different colour or model, return the original and place a new order. This is faster than a manual exchange and keeps stock accurate. If the original was faulty, we will cover the difference in shipping.</p>' +
        '<h2>Your statutory rights</h2><p>Nothing in this policy limits your rights under applicable consumer law, including the EU/UK 14-day right of withdrawal and Australian Consumer Law guarantees. If those rights give you more, they prevail.</p>'
    },
    warranty: {
      nav: 'Warranty', title: '2-year warranty', lede: 'Every robot on BOTIQUE is covered for two years against hardware defects. Here is exactly what that means.',
      body: '<p class="updated">Last updated 1 November 2026</p>' +
        '<div class="doc-note"><b>The short version:</b> two years of hardware cover, handled by us, not a call centre. Keep your order number. We repair, replace or refund if a manufacturing defect appears.</div>' +
        '<h2>What is covered</h2><ul><li>Motors, servos, screens, sensors, speakers and charging hardware that fail under normal use.</li><li>Battery capacity that drops below 60% of its rated capacity within two years, verified by our test.</li><li>Connectivity or firmware faults that cannot be resolved by a documented update.</li><li>Dead-on-arrival units and transit damage reported within 48 hours.</li></ul>' +
        '<h2>What is not covered</h2><ul><li>Water damage, drops, pet damage, sand, food or liquid ingress.</li><li>Normal cosmetic wear, scratches, fabric pilling or fading.</li><li>Consumables such as fur covers, stickers and charging cables after 90 days.</li><li>Damage from unauthorised repair, modification or use outside the product’s stated age and environment.</li><li>Software subscriptions, third-party services and cloud features that depend on a manufacturer’s servers.</li></ul>' +
        '<h2>How to claim</h2><ol><li>Email <a href="mailto:hello@botique.shop">hello@botique.shop</a> with your order number, a description and a short video of the fault.</li><li>We diagnose remotely within two business days.</li><li>If a repair is needed, we send a prepaid label or arrange a local repair partner where available.</li><li>Repairs are completed within 10 business days of receipt. If we cannot repair it, we replace it with the same or equivalent model. If neither is available, we refund the purchase price.</li></ol>' +
        '<h2>Brand warranties</h2><p>Some manufacturers offer their own warranty. That does not shorten the BOTIQUE cover. If a brand warranty is longer, you may claim under either, but not twice for the same fault.</p>' +
        '<h2>Keep your proof</h2><p>Your order confirmation email is your proof of purchase. No registration card is required. The warranty is transferable if you gift the product, provided the original order number is available.</p>'
    },
    privacy: {
      nav: 'Privacy', title: 'Privacy policy', lede: 'What we collect, why we collect it, and how to make us delete it.',
      body: '<p class="updated">Last updated 1 November 2026</p>' +
        '<div class="doc-note"><b>The short version:</b> we collect what is needed to fulfil your order and improve the store. We do not sell personal data. You can ask for a copy or deletion at any time.</div>' +
        '<h2>Who we are</h2><p>BOTIQUE Pte. Ltd. (“BOTIQUE”, “we”) is the data controller for this store. Contact: <a href="mailto:privacy@botique.shop">privacy@botique.shop</a>. Postal enquiries: 1 Fusionopolis Way, Singapore 138632 (concept address; use email for all data requests).</p>' +
        '<h2>What we collect</h2><ul><li><b>Order data:</b> name, email, shipping address, phone (optional), items purchased and order value.</li><li><b>Payment data:</b> handled by our payment processor. We receive a token, card brand and last four digits — never your full card number.</li><li><b>Technical data:</b> IP address, device type, browser, pages viewed and referral source, collected through privacy-respecting analytics.</li><li><b>Marketing data:</b> email address and preferences if you subscribe.</li><li><b>Support data:</b> messages sent to our support inbox.</li></ul>' +
        '<h2>Why we use it</h2><ul><li>To fulfil your order, process payment, ship and handle returns (contract).</li><li>To prevent fraud and comply with tax and consumer law (legal obligation).</li><li>To improve the store and measure marketing (legitimate interests, with consent where required).</li><li>To send the newsletter if you opt in (consent, withdrawable anytime).</li></ul>' +
        '<h2>Who we share it with</h2><p>Payment processors (Stripe, PayPal), fulfilment and shipping partners, email and analytics providers, and professional advisers. Each is bound by a data processing agreement. We do not sell personal data, and we do not share it with brands for their own marketing.</p>' +
        '<h2>International transfers</h2><p>We are based in Singapore and use processors in the United States and the European Union. Transfers rely on standard contractual clauses or an equivalent lawful mechanism. You can request a copy of the safeguards we use.</p>' +
        '<h2>Retention</h2><p>Order and tax records are kept for seven years. Support messages are kept for three years. Marketing data is kept until you unsubscribe, plus a suppression record. Analytics data is aggregated after 14 months.</p>' +
        '<h2>Your rights</h2><p>Depending on where you live, you may have the right to access, correct, delete, restrict or port your data, object to processing, and withdraw consent. Email <a href="mailto:privacy@botique.shop">privacy@botique.shop</a>; we respond within 30 days. You may also complain to your local data protection authority.</p>' +
        '<h2>Children</h2><p>The store is intended for adults. We do not knowingly collect data from children under 13. Products designed for children must be purchased by an adult. Where a connected toy has its own app, the manufacturer’s privacy policy applies to data processed by that app; please review it before setting up the toy.</p>' +
        '<h2>Cookies</h2><p>See our <a href="policies.html?p=cookies">Cookie notice</a>. Essential cookies are required for the cart and checkout; analytics and marketing cookies are optional.</p>'
    },
    terms: {
      nav: 'Terms', title: 'Terms of sale', lede: 'The contract between you and BOTIQUE when you place an order.',
      body: '<p class="updated">Last updated 1 November 2026</p>' +
        '<h2>1. Who can order</h2><p>You must be at least 18 years old and legally able to enter a contract. By placing an order you confirm that the payment method is yours or that you have permission to use it.</p>' +
        '<h2>2. Products and descriptions</h2><p>We describe products using manufacturer information, our own testing and public listings. Illustrations are representative; colours, packaging and minor specifications may change without notice. Estimated sales ranks are editorial estimates, not guarantees of popularity or availability.</p>' +
        '<h2>3. Prices and payment</h2><p>Prices are shown in your selected currency and include duties and taxes where stated. Currency conversions are indicative and may vary slightly at the payment processor’s rate. Payment is taken at the time of order. If a price is obviously wrong, we may cancel and refund the order before dispatch.</p>' +
        '<h2>4. Availability and pre-orders</h2><p>Stock is limited. If an item sells out after you order, we will contact you within two business days with the option to wait, swap or receive a full refund. Pre-order dates are estimates, not guarantees; you may cancel a pre-order for a full refund at any time before dispatch.</p>' +
        '<h2>5. Delivery and risk</h2><p>Risk passes to you on delivery. Delivery windows are estimates. If a parcel is lost or damaged in transit, we will replace or refund it in accordance with our Shipping policy.</p>' +
        '<h2>6. Returns</h2><p>Returns are governed by our Returns policy and your statutory rights. Nothing in these terms excludes rights you cannot legally waive.</p>' +
        '<h2>7. Intellectual property</h2><p>All BOTIQUE text, illustrations, photography and layout are owned by BOTIQUE or licensed to us. Product names, logos and trademarks belong to their respective owners. You may not reproduce the store for commercial purposes without permission.</p>' +
        '<h2>8. Acceptable use</h2><p>Do not use the store to commit fraud, scrape personal data, test stolen payment cards, or interfere with its security. We may refuse or cancel orders that appear fraudulent.</p>' +
        '<h2>9. Liability</h2><p>To the maximum extent permitted by law, our liability for any order is limited to the amount you paid for that order. We are not liable for indirect or consequential loss. This does not limit liability for death, personal injury or fraud.</p>' +
        '<h2>10. Governing law</h2><p>These terms are governed by the laws of Singapore. Consumers retain the protection of the mandatory laws of their country of residence. Disputes should first be sent to <a href="mailto:hello@botique.shop">hello@botique.shop</a>; we will try to resolve them within 30 days.</p>'
    },
    cookies: {
      nav: 'Cookies', title: 'Cookie notice', lede: 'The small files that keep your bag, currency and preferences working — and the optional ones you can refuse.',
      body: '<p class="updated">Last updated 1 November 2026</p>' +
        '<h2>Essential</h2><p>These keep your cart, currency, language and checkout session working. They are set by BOTIQUE and cannot be switched off without breaking the store. They contain no advertising identifiers.</p>' +
        '<table><thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead><tbody><tr><td>botique.store.v1</td><td>Cart, wishlist, currency, language</td><td>12 months</td></tr><tr><td>botique.lastOrder</td><td>Your most recent order confirmation on this device</td><td>12 months</td></tr></tbody></table>' +
        '<h2>Analytics (optional)</h2><p>Aggregated page views and conversion events help us understand which robots people actually want. We use a privacy-first analytics provider and do not send names, emails or full IP addresses.</p>' +
        '<h2>Marketing (optional)</h2><p>If you consent, we may use pixels from Meta, TikTok and Google to measure campaigns and show relevant ads. These cookies can recognize your browser across sites. You can withdraw consent at any time.</p>' +
        '<h2>Managing cookies</h2><p>Use the cookie banner on your first visit, or clear cookies in your browser settings. Blocking essential cookies will break the cart and checkout. On iOS and Android you can also limit ad tracking at the operating-system level.</p>' +
        '<h2>Contact</h2><p>Questions about cookies: <a href="mailto:privacy@botique.shop">privacy@botique.shop</a>.</p>'
    },
    access: {
      nav: 'Accessibility', title: 'Accessibility', lede: 'A store about friendly machines should be friendly to the humans using it.',
      body: '<p class="updated">Last updated 1 November 2026</p>' +
        '<h2>Our target</h2><p>We aim to meet WCAG 2.2 AA across the store. That means keyboard navigation, visible focus states, sufficient colour contrast, meaningful alt text, labelled forms and no motion that cannot be paused or reduced.</p>' +
        '<h2>What we have done</h2><ul><li>All interactive elements are reachable by keyboard.</li><li>Colour is never the only way to convey information.</li><li>Animations respect <code>prefers-reduced-motion</code>.</li><li>Product illustrations include descriptive accessible names.</li><li>Forms use explicit labels and inline error messages.</li><li>Text can be zoomed to 200% without loss of content.</li></ul>' +
        '<h2>Known limitations</h2><p>Some product illustrations are stylised and may not convey every physical detail. Third-party payment pages are controlled by their providers. If any part of the store blocks you, tell us and we will offer an alternative way to order.</p>' +
        '<h2>Contact</h2><p>Email <a href="mailto:hello@botique.shop">hello@botique.shop</a> with “Accessibility” in the subject. We aim to respond within two business days and to fix confirmed issues within 30 days.</p>'
    },
    track: {
      nav: 'Track order', title: 'Track your order', lede: 'Enter your order number and email to see the latest status.',
      body: '<p class="updated">Order tracking</p>' +
        '<div class="doc-note">Orders are traceable once the carrier scans them, usually within one business day of dispatch. Your confirmation email contains the tracking link.</div>' +
        '<form id="track-form" style="max-width:520px;margin:18px 0"><div class="field-grid"><div class="field full"><label for="track-order">Order number</label><input id="track-order" placeholder="BQ-202611-ABCD" autocomplete="off"></div><div class="field full"><label for="track-email">Email</label><input id="track-email" type="email" placeholder="you@example.com" autocomplete="email"></div></div><button class="btn btn-dark" type="submit" style="margin-top:12px">Track order</button></form><div id="track-result"></div>' +
        '<h2>Carriers we use</h2><p>DHL Express, UPS, FedEx, Royal Mail, Australia Post and Ninja Van, depending on destination. The tracking link in your email is always the fastest source of truth.</p>' +
        '<h2>No tracking yet?</h2><p>If your order was placed more than two business days ago and you have no tracking link, email <a href="mailto:hello@botique.shop">hello@botique.shop</a> with your order number. We will check the warehouse queue and reply within one business day.</p>'
    }
  };

  const order = ['shipping', 'returns', 'warranty', 'track', 'privacy', 'terms', 'cookies', 'access'];

  function renderNav(active) {
    const nav = document.getElementById('doc-nav');
    nav.innerHTML = '<span class="eyebrow" style="padding:0 12px 8px">Help</span>' + order.map(function (k) {
      return '<a href="policies.html?p=' + k + '" class="' + (k === active ? 'is-on' : '') + '">' + docs[k].nav + '</a>';
    }).join('');
  }

  function render() {
    const slug = new URLSearchParams(location.search).get('p') || 'shipping';
    const doc = docs[slug] || docs.shipping;
    document.getElementById('doc-title').textContent = doc.title;
    document.getElementById('doc-lede').textContent = doc.lede;
    document.getElementById('doc-content').innerHTML = doc.body;
    document.title = doc.title + ' — BOTIQUE';
    renderNav(slug);
    if (slug === 'track') bindTrack();
  }

  function bindTrack() {
    const form = document.getElementById('track-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const id = document.getElementById('track-order').value.trim().toUpperCase();
      const email = document.getElementById('track-email').value.trim().toLowerCase();
      const result = document.getElementById('track-result');
      let last = null;
      try { last = JSON.parse(localStorage.getItem('botique.lastOrder') || 'null'); } catch (err) {}
      if (last && last.id.toUpperCase() === id && (!email || (last.email || '').toLowerCase() === email)) {
        result.innerHTML = '<div class="success-card" style="max-width:520px;margin:14px 0"><div class="row"><span>Order</span><b>' + last.id + '</b></div><div class="row"><span>Status</span><b>Preparing for dispatch</b></div><div class="row"><span>Estimated delivery</span><span>' + last.eta + '</span></div><div class="row"><span>Destination</span><span>' + last.city + ', ' + last.country + '</span></div></div><p class="fine">Demo tracking: in production this panel would read from your fulfilment provider.</p>';
      } else {
        result.innerHTML = '<div class="doc-note" style="background:var(--paper-2);border-color:var(--ink)">No matching order found in this browser. Check the number and email, or contact <a href="mailto:hello@botique.shop">hello@botique.shop</a>.</div>';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    S.init();
    render();
    document.addEventListener('botique:lang', render);
  });
})();
