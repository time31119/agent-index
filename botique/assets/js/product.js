/* BOTIQUE — product detail */
(function () {
  'use strict';
  const D = window.BOTIQUE_DATA;
  const A = window.BOTIQUE_ART;
  const S = window.BOTIQUE;
  const params = new URLSearchParams(location.search);
  const product = D.byId(params.get('id')) || D.products[0];

  const CAT_COPY = {
    companion: {
      blurb: 'A desk-sized companion built for eye contact, small gestures and the occasional unprompted opinion. It is not a butler; it is company.',
      best: 'Desk-side company, gift-worthy surprises and anyone who talks to their appliances.',
      skip: 'You want a real assistant, a security camera or something that folds laundry.',
      highlights: ['Expressive face and touch sensors', 'Starts playing without an app', 'Quiet enough for a shared desk', 'Personality that grows with use']
    },
    pets: {
      blurb: 'A low-maintenance pet that lives on a shelf, a desk or the floor — and never needs a vet visit. Soft, responsive and designed to be picked up.',
      best: 'Allergic households, quiet apartments and anyone who wants a pet without the vet bills.',
      skip: 'You expect a live animal’s chaos, or a plush that survives a determined toddler.',
      highlights: ['Responds to touch and voice', 'Soft, huggable materials', 'No feeding, walking or vet bills', 'Designed for calm, repeat interaction']
    },
    dogs: {
      blurb: 'A four-legged robot with real movement, real sensors and a personality that fills a room. This is the closest thing to a dog that never needs a walk.',
      best: 'Robot-dog fans, makers and anyone who wants movement in the room.',
      skip: 'You have thick rugs, stairs or a low tolerance for motor noise.',
      highlights: ['Walks, turns and reacts to gestures', 'Obstacle sensors keep it out of trouble', 'Rechargeable, app-assisted control', 'A proper platform for tinkering']
    },
    stem: {
      blurb: 'Part toy, part classroom: build it, code it, then take it apart to see how it works. The best ones survive being loved a little too hard.',
      best: 'Curious builders, classroom extensions and screen-time negotiations.',
      skip: 'You want something that works perfectly out of the box with zero patience.',
      highlights: ['Build-and-code kit with guided projects', 'Block coding plus text-based options', 'Open-ended after the first build', 'Replaceable, repairable parts']
    },
    rc: {
      blurb: 'A remote-controlled hit that turns any room, garden or park into a playground. Fast to start, hard to put down, and built for video.',
      best: 'Weekend flyers, gadget gifts and anyone who likes a remote in their hand.',
      skip: 'You live under a flight path, in a dense city or without outdoor space.',
      highlights: ['Ready to run out of the box', 'Remote control plus app modes', 'Tough enough for indoor and outdoor play', 'A very good group-chat video']
    }
  };

  function copyFor(p) {
    const c = Object.assign({}, CAT_COPY[p.cat] || CAT_COPY.companion);
    if (p.cat === 'companion') {
      if (p.form === 'dog') {
        c.blurb = 'A roaming companion with a face, a voice and a surprising amount of personality. It follows you around the room — and occasionally ignores you.';
        c.best = 'Robot-pet fans who want movement and personality without a real dog’s routine.';
        c.skip = 'You have thick rugs, stairs or a low tolerance for motor noise.';
        c.highlights = ['Rolls, turns and follows gestures', 'Screen face with a big personality', 'Chats via a cloud AI model', 'Rechargeable, app-assisted control'];
      } else if (p.form === 'plush') {
        c.blurb = 'A soft, warm companion designed to be held, not commanded. The intelligence is in the touch, the sound and the slow accumulation of attachment.';
        c.best = 'Anyone who wants a calm, huggable companion without a loud screen.';
        c.skip = 'You want a full conversation, a camera or a robot that moves around.';
        c.highlights = ['Soft, holdable body', 'Reacts to touch and voice', 'Grows a personality over time', 'A calmer alternative to a screen pet'];
      } else if (p.form === 'screen') {
        c.blurb = 'A screen-faced companion that communicates with a face, a voice and a curated stream of content. It is part character, part interface.';
        c.best = 'People who like a visual, voice-first companion and guided content.';
        c.skip = 'You want a screen-free, offline toy.';
        c.highlights = ['Expressive screen face', 'Voice-first interaction', 'Curated content or skills', 'Check the subscription before buying'];
      } else {
        c.blurb = 'A small companion built for presence: eye contact, small gestures and the occasional unprompted opinion. It is not a butler; it is company.';
        c.highlights = ['Expressive face and touch sensors', 'Starts playing without an app', 'Small footprint, big presence', 'Personality that grows with use'];
      }
    }
    return c;
  }

  let qty = 1;
  let view = 1;
  let country = 'US';

  const money = S.money;

  function savePct() {
    if (!product.compareAt) return 0;
    return Math.round((1 - product.price / product.compareAt) * 100);
  }

  function galleryHTML() {
    const tone = D.tones[product.tone];
    const photo = A.hasPhoto(product);
    const lifestyle = A.layout(product) === 'lifestyle';
    const cr = A.credit(product);
    const shots = A.photos(product);
    const viewShots = [];
    for (let i = 0; i < 4; i++) viewShots.push(shots.length ? shots[i % shots.length] : null);
    const bg = photo ? ((cr && cr.bg) || '#F7F3EA') : tone.bg;
    const thumbs = [0, 1, 2, 3].map(function (i) {
      const src = viewShots[i];
      const thumbBg = photo ? ((cr && cr.bg) || '#F7F3EA') : (i === 0 ? tone.bg : i === 1 ? 'var(--paper-2)' : i === 2 ? 'var(--ink)' : 'var(--lime)');
      const inner = src
        ? '<img class="bot-art bot-photo" src="' + src + '" alt="' + S.esc(product.name) + ' product photo ' + (i + 1) + '" loading="lazy" decoding="async">'
        : A.art(product);
      return '<button class="thumb ' + (view === i + 1 ? 'is-on' : '') + '" data-view="' + (i + 1) + '"' + (src ? ' data-photo-src="' + src + '"' : '') + ' style="background:' + thumbBg + '" aria-label="View ' + (i + 1) + '">' + inner + '</button>';
    }).join('');
    return '<div class="gallery">' +
      '<div class="gallery-main view-' + view + (photo ? ' has-photo' : '') + (lifestyle ? ' lifestyle' : '') + '" id="gallery-main" style="background:' + bg + '">' +
      '<div class="gallery-tag"><span>No.' + String(product.rank).padStart(2, '0') + ' / 100</span>' + (product.badge ? '<span class="hot">' + S.esc(product.badge) + '</span>' : '') + (photo ? '<span>Official photo</span>' : '') + '</div>' +
      '<div class="gallery-actions"><button data-wish="' + product.id + '" class="' + (S.isWished(product.id) ? 'is-on' : '') + '" aria-label="Save" aria-pressed="' + S.isWished(product.id) + '">' + S.icon('heart') + '</button><button data-share aria-label="Share">' + S.icon('share') + '</button></div>' +
      '<div class="gallery-art">' + A.art(product) + '</div></div>' +
      '<div class="thumbs">' + thumbs + '</div>' +
      '<div class="gallery-meta"><div><b>#' + product.rank + '</b><span>of 100</span></div><div><b>' + product.units.toLocaleString('en-US') + '</b><span>est. units / mo</span></div><div><b>' + product.rating.toFixed(1) + '</b><span>public rating</span></div></div>' +
      (cr
        ? '<p class="photo-credit">Photo: ' + S.esc(cr.credit) + ' · <a href="' + S.esc(cr.source) + '" target="_blank" rel="noopener">source</a></p>'
        : '<p class="fine" style="margin-top:10px">Product illustration · colour and finish may vary by batch.</p>') +
      '</div>';
  }

  function infoHTML() {
    const tone = D.tones[product.tone];
    const c = copyFor(product);
    const pct = savePct();
    const sub = product.spec.sub || 'None';
    const freeDelivery = S.shippingFor(country, product.price);
    return '<div class="product-info">' +
      '<div class="product-brand-line"><span class="brand">' + S.esc(product.brand) + '</span><span class="product-rank">' + S.t('product.rank', { rank: product.rank }) + '</span></div>' +
      '<h1 class="product-title">' + S.esc(product.name) + '</h1>' +
      '<p class="product-tagline">' + S.esc(product.tagline) + '</p>' +
      '<div class="product-rating">' + S.ratingStars(product.rating) + '<span>' + product.reviews.toLocaleString('en-US') + ' ' + S.t('product.reviews') + '</span>' + S.platformDots(product) + '</div>' +
      '<div class="product-price-row"><span class="product-price">' + money(product.price) + '</span>' +
      (product.compareAt ? '<span class="product-was">' + money(product.compareAt) + '</span><span class="save-pill">Save ' + pct + '%</span>' : '') +
      '</div>' +
      (product.launch
        ? '<p class="installments">or <b>4 × ' + money(product.price / 4) + '</b> with Klarna · ' + S.t('product.duties') + '</p>' +
          '<div class="stock-line"><span class="stock-dot"></span><span>' + S.t('product.inStock') + '</span></div>' +
          '<div class="product-form"><div class="qty-big"><button data-pq="-1" aria-label="Decrease quantity">' + S.icon('minus') + '</button><span id="pq">' + qty + '</span><button data-pq="1" aria-label="Increase quantity">' + S.icon('plus') + '</button></div>' +
          '<button class="btn btn-dark" data-add-product>' + S.t('product.add') + ' · ' + money(product.price) + '</button></div>' +
          '<button class="btn btn-lime btn-full buy-now" data-buy-now>' + S.t('product.buy') + ' ' + S.icon('arrow') + '</button>' +
          '<div class="product-perks"><span>' + S.icon('truck') + ' ' + S.t('home.trust1') + '</span><span>' + S.icon('return') + ' ' + S.t('home.trust2') + '</span><span>' + S.icon('shield') + ' ' + S.t('home.trust3') + '</span><span>' + S.icon('globe') + ' ' + S.t('home.trust4') + '</span></div>' +
          '<div class="delivery-box"><div><span class="db-label">' + S.t('product.delivery') + '</span><b id="delivery-date">' + S.deliveryWindow(freeDelivery.eta) + '</b></div><select id="country-select" aria-label="Delivery country">' +
          Object.keys(S.SHIPPING).map(function (code) { return '<option value="' + code + '"' + (code === country ? ' selected' : '') + '>' + S.SHIPPING[code].name + '</option>'; }).join('') +
          '</select></div>'
        : '<div class="index-notice"><span class="index-kicker">' + S.t('card.indexOnly') + '</span><h3>' + S.t('product.indexTitle') + '</h3><p>' + S.t('product.indexBody') + '</p><div class="notify-row"><input type="email" data-notify-email placeholder="you@example.com" aria-label="' + S.t('common.email') + '"><button class="btn btn-dark" data-notify>' + S.t('product.notify') + ' ' + S.icon('arrow') + '</button></div></div>') +
      '<div class="why-box"><h3>' + S.t('product.why') + '</h3><p>' + S.esc(product.note) + '</p></div>' +
      '<div style="margin-top:6px">' +
      '<details class="accordion" open><summary>' + S.t('product.highlights') + ' ' + S.icon('plus') + '</summary><div class="acc-body"><p style="margin-bottom:9px">' + c.blurb + '</p><ul style="display:grid;gap:5px">' + c.highlights.map(function (h) { return '<li style="display:flex;gap:7px;align-items:flex-start;font-size:12px;color:var(--muted)"><span style="color:var(--ink)">' + S.icon('check') + '</span>' + h + '</li>'; }).join('') + '</ul></div></details>' +
      '<details class="accordion"><summary>' + S.t('product.specs') + ' ' + S.icon('plus') + '</summary><div class="acc-body">' + specsTable() + '</div></details>' +
      '<details class="accordion"><summary>' + S.t('product.shipping') + ' ' + S.icon('plus') + '</summary><div class="acc-body"><p>' + S.t('product.accordion2b') + '</p><p>' + S.t('product.accordion1b') + '</p></div></details>' +
      '<details class="accordion"><summary>' + S.t('product.accordion3') + ' ' + S.icon('plus') + '</summary><div class="acc-body"><p>' + S.t('product.accordion3b') + '</p></div></details>' +
      '</div>' +
      '<p class="review-note">' + S.t('product.reviewNote') + '</p>' +
      '</div>';
  }

  function specsTable() {
    const s = product.spec;
    const rows = [
      [S.t('common.category'), (function () { const c = D.categories.filter(function (x) { return x.id === product.cat; })[0]; return c ? (S.state.lang === 'zh' ? c.zh : c.name) : product.cat; })()],
      [S.t('product.age'), s.age],
      [S.t('product.battery'), s.battery],
      [S.t('product.connect'), s.connectivity],
      [S.t('product.sub'), s.sub],
      [S.t('product.warranty'), '2 years'],
      ['Released', product.year],
      ['BOTIQUE rank', '#' + product.rank + ' of 100']
    ];
    return '<table class="spec-table">' + rows.map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table>';
  }

  function verdictHTML() {
    const c = copyFor(product);
    const sub = product.spec.sub || 'None';
    const run = sub.toLowerCase() === 'none'
      ? 'One-time price. No mandatory subscription, no cloud paywall to unlock the basics.'
      : 'Recurring cost: ' + sub + '. Check what stops working if you cancel before checkout.';
    return '<div class="verdict-grid">' +
      '<div class="verdict-main"><span class="kicker">The verdict</span><h2>' + S.esc(product.tagline) + '</h2><p>' + S.esc(product.note) + ' ' + c.blurb + '</p>' +
      '<div class="verdict-stats"><div><b>#' + product.rank + '</b><span>of 100</span></div><div><b>' + product.rating.toFixed(1) + '</b><span>public rating</span></div><div><b>' + product.units.toLocaleString('en-US') + '</b><span>est. units / month</span></div></div></div>' +
      '<div class="fit-cards">' +
      '<div class="fit-card"><span>01 · Best for</span><p>' + c.best + '</p></div>' +
      '<div class="fit-card"><span>02 · Skip if</span><p>' + c.skip + '</p></div>' +
      '<div class="fit-card"><span>03 · Running cost</span><p>' + run + '</p></div>' +
      '</div></div>';
  }

  function relatedHTML() {
    let list = D.products.filter(function (p) { return p.cat === product.cat && p.id !== product.id; }).sort(function (a, b) { return a.rank - b.rank; }).slice(0, 4);
    if (list.length < 4) {
      D.products.forEach(function (p) {
        if (list.length < 4 && p.id !== product.id && list.indexOf(p) === -1) list.push(p);
      });
    }
    return '<h2>' + S.t('product.pair') + '</h2><div class="product-grid">' + list.map(function (p) { return S.productCard(p); }).join('') + '</div>';
  }

  function render() {
    const layout = document.getElementById('product-layout');
    if (!layout) return;
    layout.innerHTML = galleryHTML() + infoHTML();
    document.getElementById('product-verdict').innerHTML = verdictHTML();
    document.getElementById('related').innerHTML = relatedHTML();
    document.getElementById('crumb-name').textContent = product.name;
    document.title = product.name + ' — BOTIQUE';
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', product.tagline + ' Shop ' + product.name + ' at BOTIQUE with worldwide shipping and 30-day returns.');
    const ogt = document.querySelector('meta[property="og:title"]');
    if (ogt) ogt.setAttribute('content', product.name + ' — BOTIQUE');
    const ogd = document.querySelector('meta[property="og:description"]');
    if (ogd) ogd.setAttribute('content', product.tagline);
    const can = document.querySelector('link[rel="canonical"]');
    if (can) can.setAttribute('href', 'https://botique.shop/product.html?id=' + product.id);
    let ogu = document.querySelector('meta[property="og:url"]');
    if (!ogu) {
      ogu = document.createElement('meta');
      ogu.setAttribute('property', 'og:url');
      document.head.appendChild(ogu);
    }
    ogu.setAttribute('content', 'https://botique.shop/product.html?id=' + product.id);
  }

  function injectSchema() {
    const old = document.getElementById('product-schema');
    if (old) old.remove();
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      brand: { '@type': 'Brand', name: product.brand },
      description: product.tagline + ' ' + product.note,
      image: 'https://botique.shop/assets/og.png',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: product.price.toFixed(2),
        availability: product.launch ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: 'https://botique.shop/product.html?id=' + product.id
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'product-schema';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  function bind() {
    document.addEventListener('click', function (e) {
      const pq = e.target.closest('[data-pq]');
      if (pq) {
        qty = Math.max(1, Math.min(20, qty + parseInt(pq.getAttribute('data-pq'), 10)));
        const el = document.getElementById('pq');
        if (el) el.textContent = qty;
        return;
      }
      if (e.target.closest('[data-add-product]')) { S.addToCart(product.id, qty); return; }
      if (e.target.closest('[data-buy-now]')) { S.addToCart(product.id, qty, { open: false }); location.href = 'checkout.html'; return; }
      if (e.target.closest('[data-notify]')) {
        const input = document.querySelector('[data-notify-email]');
        const email = input ? input.value.trim() : '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          S.toast(S.t('product.notifyEmail'));
          if (input) input.focus();
          return;
        }
        try {
          const key = 'botique.waitlist';
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          if (!list.some(function (x) { return x.id === product.id && x.email === email; })) list.push({ id: product.id, email: email, date: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(list));
        } catch (err) {}
        S.toast(S.t('product.notifyDone'));
        return;
      }
      const viewBtn = e.target.closest('[data-view]');
      if (viewBtn) {
        view = parseInt(viewBtn.getAttribute('data-view'), 10);
        const main = document.getElementById('gallery-main');
        if (main) {
          const isPhoto = A.hasPhoto(product);
          main.className = 'gallery-main view-' + view + (isPhoto ? ' has-photo' : '') + (A.layout(product) === 'lifestyle' ? ' lifestyle' : '');
          main.style.background = isPhoto ? '#F7F3EA' : view === 1 ? D.tones[product.tone].bg : view === 2 ? 'var(--paper-2)' : view === 3 ? 'var(--ink)' : 'var(--lime)';
          const src = viewBtn.getAttribute('data-photo-src');
          const img = main.querySelector('img.bot-photo');
          if (src && img) img.src = src;
        }
        document.querySelectorAll('.thumb').forEach(function (t) { t.classList.toggle('is-on', t.getAttribute('data-view') === String(view)); });
        return;
      }
      if (e.target.closest('[data-share]')) {
        const url = location.href;
        if (navigator.share) { navigator.share({ title: product.name, url: url }).catch(function () {}); }
        else if (navigator.clipboard) { navigator.clipboard.writeText(url).then(function () { S.toast(S.t('product.copied')); }).catch(function () { S.toast(url); }); }
        else S.toast(url);
        return;
      }
    });
    document.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'country-select') {
        country = e.target.value;
        const d = S.shippingFor(country, product.price);
        const el = document.getElementById('delivery-date');
        if (el) el.textContent = S.deliveryWindow(d.eta);
      }
    });
    document.addEventListener('botique:lang', function () { render(); });
    document.addEventListener('botique:currency', function () { render(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    S.init();
    render();
    injectSchema();
    bind();
  });
})();
