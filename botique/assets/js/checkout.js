/* BOTIQUE — checkout (demo mode by default; Stripe-ready) */
(function () {
  'use strict';
  const D = window.BOTIQUE_DATA;
  const S = window.BOTIQUE;
  const params = new URLSearchParams(location.search);

  if (params.get('preview') === '1' && S.cartCount() === 0) {
    ['eilik', 'emo', 'aibi'].forEach(function (id) {
      if (!S.state.cart.some(function (l) { return l.id === id; })) S.state.cart.push({ id: id, qty: 1 });
    });
    S.save(); S.renderCart(); S.updateBadges();
  }

  const co = {
    country: 'US',
    ship: 'standard',
    discount: 0,
    code: '',
    placed: null,
    processing: false,
    form: {
      email: '', first: '', last: '', address: '', apt: '', city: '', state: '', postal: '', phone: '',
      card: S.CONFIG.payments.mode === 'demo' ? '4242 4242 4242 4242' : '',
      exp: S.CONFIG.payments.mode === 'demo' ? '12/28' : '',
      cvc: S.CONFIG.payments.mode === 'demo' ? '123' : '',
      cardname: ''
    }
  };

  const $ = function (s) { return document.querySelector(s); };
  const esc = S.esc;

  function subtotal() { return S.cartTotal(); }
  function shippingCost() {
    if (!subtotal()) return 0;
    const s = S.shippingFor(co.country, subtotal());
    return co.ship === 'express' ? s.express : s.standard;
  }
  function total() { return Math.max(0, subtotal() - co.discount + shippingCost()); }

  function renderEmpty() {
    const root = $('#checkout-content');
    root.innerHTML = '<div class="empty-state" style="min-height:56vh">' + S.art(D.products[2]) +
      '<h3>' + S.t('checkout.empty') + '</h3><a class="btn btn-dark" href="shop.html">' + S.t('cart.emptyCta') + '</a></div>';
  }

  function renderCheckout() {
    const root = $('#checkout-content');
    if (!root) return;
    if (!S.cartLines().length) { renderEmpty(); return; }
    const demo = S.CONFIG.payments.mode === 'demo';
    const f = co.form;
    const field = function (id, label, value, opts) {
      opts = opts || {};
      return '<div class="field ' + (opts.full ? 'full' : '') + '" data-field="' + id + '"><label for="f-' + id + '">' + label + '</label><input id="f-' + id + '" data-form="' + id + '" type="' + (opts.type || 'text') + '" value="' + esc(value || '') + '" placeholder="' + (opts.ph || '') + '" autocomplete="' + (opts.ac || 'off') + '" ' + (opts.inputmode ? 'inputmode="' + opts.inputmode + '"' : '') + '><span class="err">' + (opts.err || 'Required') + '</span></div>';
    };
    root.innerHTML = '<div class="checkout-page"><div class="checkout-grid">' +
      '<div class="checkout-main">' +
      (demo ? '<div class="checkout-banner">' + S.icon('info') + '<span>' + S.t('checkout.demo') + '</span></div>' : '') +
      '<form id="checkout-form" novalidate>' +
      '<div class="checkout-step"><div class="checkout-step-head"><h2><span class="step-num">1</span>' + S.t('checkout.contact') + '</h2></div>' +
      '<div class="field-grid">' + field('email', S.t('checkout.email'), f.email, { full: true, type: 'email', ac: 'email', ph: 'you@example.com' }) + '</div></div>' +

      '<div class="checkout-step"><div class="checkout-step-head"><h2><span class="step-num">2</span>' + S.t('checkout.shipping') + '</h2></div>' +
      '<div class="field-grid">' +
      field('first', S.t('checkout.first'), f.first, { ac: 'given-name' }) +
      field('last', S.t('checkout.last'), f.last, { ac: 'family-name' }) +
      field('address', S.t('checkout.address'), f.address, { full: true, ac: 'address-line1' }) +
      field('apt', S.t('checkout.apartment'), f.apt, { full: true, ac: 'address-line2' }) +
      field('city', S.t('checkout.city'), f.city, { ac: 'address-level2' }) +
      field('state', S.t('checkout.state'), f.state, { ac: 'address-level1' }) +
      field('postal', S.t('checkout.postal'), f.postal, { ac: 'postal-code' }) +
      '<div class="field" data-field="country"><label for="f-country">' + S.t('checkout.country') + '</label><select id="f-country" data-form="country">' +
      Object.keys(S.SHIPPING).map(function (code) { return '<option value="' + code + '"' + (co.country === code ? ' selected' : '') + '>' + S.SHIPPING[code].name + '</option>'; }).join('') +
      '</select><span class="err">Required</span></div>' +
      field('phone', S.t('checkout.phone'), f.phone, { type: 'tel', ac: 'tel' }) +
      '</div></div>' +

      '<div class="checkout-step"><div class="checkout-step-head"><h2><span class="step-num">3</span>' + S.t('checkout.delivery') + '</h2></div>' +
      deliveryOptionsHTML() + '</div>' +

      '<div class="checkout-step"><div class="checkout-step-head"><h2><span class="step-num">4</span>' + S.t('checkout.payment') + '</h2><span class="fine">' + (demo ? 'Demo' : 'Stripe') + '</span></div>' +
      '<div class="pay-card"><div class="pay-card-head"><span>' + S.icon('shield') + ' ' + S.t('checkout.secure') + '</span><span>VISA · MC · AMEX</span></div>' +
      '<div class="field-grid">' + field('card', S.t('checkout.card'), f.card, { full: true, inputmode: 'numeric', ph: '4242 4242 4242 4242' }) + '</div>' +
      '<div class="card-row" style="margin-top:7px">' + field('exp', S.t('checkout.exp'), f.exp, { ph: 'MM / YY' }) + field('cvc', S.t('checkout.cvc'), f.cvc, { ph: 'CVC' }) + field('cardname', S.t('checkout.nameCard'), f.cardname, { ph: 'Name' }) + '</div>' +
      '<p class="fine" style="margin-top:8px">' + (demo ? S.t('checkout.testNote') : 'You will be redirected to Stripe to complete payment securely.') + '</p></div>' +
      '<div class="checkout-actions"><button class="btn btn-dark btn-full" type="submit" id="pay-btn">' + S.t('checkout.pay') + ' · ' + S.money(total()) + ' ' + S.icon('arrow') + '</button>' +
      '<div class="secure-line">' + S.icon('shield') + ' ' + S.t('checkout.secure') + '</div><p class="checkout-terms">' + S.t('checkout.terms') + '</p></div>' +
      '</div></form></div>' +

      '<aside class="checkout-summary"><h2>' + S.t('checkout.summary') + '</h2>' +
      '<div class="summary-lines">' + summaryLinesHTML() + '</div>' +
      '<div class="discount-row"><input id="discount-input" placeholder="WELCOME10" aria-label="' + S.t('checkout.discount') + '"><button class="btn btn-dark" type="button" data-apply-discount>' + S.t('checkout.apply') + '</button></div>' +
      '<p class="fine" id="discount-msg" style="margin-top:6px"></p>' +
      '<div class="summary-totals" id="summary-totals">' + totalsHTML() + '</div>' +
      '<div class="summary-note"><span>' + S.icon('globe') + ' ' + S.t('product.duties') + '</span><span>' + S.icon('truck') + ' ' + S.t('cart.shippingNote') + '</span><span>' + S.icon('return') + ' ' + S.t('home.trust2') + '</span></div>' +
      '</aside></div></div>';
    bindForm();
  }

  function deliveryOptionsHTML() {
    const s = S.shippingFor(co.country, subtotal());
    const stdFree = s.standard === 0;
    return '<label class="delivery-opt ' + (co.ship === 'standard' ? 'is-on' : '') + '"><input type="radio" name="ship" value="standard" data-ship ' + (co.ship === 'standard' ? 'checked' : '') + '><span class="do-info"><b>' + S.t('checkout.standard') + '</b><span id="eta-standard">' + S.deliveryWindow(s.eta) + '</span></span><span class="do-price" id="price-standard">' + (stdFree ? S.t('checkout.free') : S.money(s.standard)) + '</span></label>' +
      '<label class="delivery-opt ' + (co.ship === 'express' ? 'is-on' : '') + '"><input type="radio" name="ship" value="express" data-ship ' + (co.ship === 'express' ? 'checked' : '') + '><span class="do-info"><b>' + S.t('checkout.express') + '</b><span id="eta-express">' + S.deliveryWindow(s.expressEta) + '</span></span><span class="do-price" id="price-express">' + S.money(s.express) + '</span></label>' +
      '<p class="fine" style="margin-top:8px">' + S.t('product.duties') + ' · ' + S.SHIPPING[co.country].name + '</p>';
  }

  function summaryLinesHTML() {
    return S.cartLines().map(function (l) {
      return '<div class="summary-line"><div class="summary-thumb" style="background:' + D.tones[l.p.tone].bg + '">' + S.art(l.p) + '</div><div><b>' + esc(l.p.name) + '</b><span>Qty ' + l.qty + ' · ' + esc(l.p.brand) + '</span></div><span class="sp">' + S.money(l.p.price * l.qty) + '</span></div>';
    }).join('');
  }

  function totalsHTML() {
    const sub = subtotal();
    const ship = shippingCost();
    return '<div><span>' + S.t('checkout.subtotal') + '</span><span>' + S.money(sub) + '</span></div>' +
      (co.discount > 0 ? '<div style="color:var(--coral)"><span>' + co.code + '</span><span>−' + S.money(co.discount) + '</span></div>' : '') +
      '<div><span>' + S.t('checkout.shippingLine') + '</span><span>' + (ship === 0 ? S.t('checkout.free') : S.money(ship)) + '</span></div>' +
      '<div class="total"><span>' + S.t('checkout.total') + '</span><span>' + S.money(total()) + '</span></div>';
  }

  function refreshTotals() {
    const t = $('#summary-totals');
    if (t) t.innerHTML = totalsHTML();
    const pay = $('#pay-btn');
    if (pay) pay.innerHTML = S.t('checkout.pay') + ' · ' + S.money(total()) + ' ' + S.icon('arrow');
  }

  function refreshDelivery() {
    const s = S.shippingFor(co.country, subtotal());
    const set = function (id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set('eta-standard', S.deliveryWindow(s.eta));
    set('eta-express', S.deliveryWindow(s.expressEta));
    set('price-standard', s.standard === 0 ? S.t('checkout.free') : S.money(s.standard));
    set('price-express', S.money(s.express));
    document.querySelectorAll('[data-ship]').forEach(function (r) {
      r.closest('.delivery-opt').classList.toggle('is-on', r.value === co.ship);
    });
    refreshTotals();
  }

  function bindForm() {
    const form = $('#checkout-form');
    if (!form) return;
    form.addEventListener('input', function (e) {
      const key = e.target.getAttribute('data-form');
      if (!key) return;
      let v = e.target.value;
      if (key === 'card') {
        v = v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
        e.target.value = v;
      }
      if (key === 'exp') {
        v = v.replace(/\D/g, '').slice(0, 4);
        if (v.length > 2) v = v.slice(0, 2) + ' / ' + v.slice(2);
        e.target.value = v;
      }
      if (key === 'cvc') {
        v = v.replace(/\D/g, '').slice(0, 4);
        e.target.value = v;
      }
      co.form[key] = v;
      const wrap = e.target.closest('.field');
      if (wrap) wrap.classList.remove('invalid');
    });
    form.addEventListener('change', function (e) {
      if (e.target.matches('[data-ship]')) {
        co.ship = e.target.value;
        document.querySelectorAll('.delivery-opt').forEach(function (l) { l.classList.toggle('is-on', l.querySelector('input').checked); });
        refreshTotals();
        return;
      }
      if (e.target.id === 'f-country') {
        co.country = e.target.value;
        co.form.country = e.target.value;
        refreshDelivery();
      }
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); placeOrder(); });
    document.querySelectorAll('[data-apply-discount]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const input = $('#discount-input');
        const code = (input.value || '').trim().toUpperCase();
        const msg = $('#discount-msg');
        if (code === 'WELCOME10') {
          co.code = 'WELCOME10'; co.discount = subtotal() * 0.10;
          msg.textContent = '10% off applied.'; msg.style.color = 'var(--ink)';
          refreshTotals();
        } else {
          msg.textContent = 'That code isn’t valid. Try WELCOME10.'; msg.style.color = 'var(--coral)';
        }
      });
    });
  }

  function validate() {
    let ok = true;
    const email = ($('[data-form="email"]') || {}).value || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ok = false;
    ['email', 'first', 'last', 'address', 'city', 'postal'].forEach(function (key) {
      const input = document.querySelector('[data-form="' + key + '"]');
      if (!input) return;
      const wrap = input.closest('.field');
      const bad = !input.value.trim() || (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));
      if (wrap) wrap.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) {
      const first = document.querySelector('.field.invalid');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      S.toast(S.t('checkout.required'));
    }
    return ok;
  }

  function placeOrder() {
    if (co.processing) return;
    document.querySelectorAll('[data-form]').forEach(function (el) { co.form[el.getAttribute('data-form')] = el.value; });
    co.form.country = co.country;
    if (!validate()) return;
    const mode = S.CONFIG.payments.mode;
    if (mode === 'stripe-links') {
      const lines = S.cartLines();
      const link = lines.length === 1 && S.CONFIG.payments.paymentLinks[lines[0].p.id];
      if (link) { location.href = link; return; }
      S.toast('No Stripe Payment Link configured for this cart. Add one in config.js.');
      return;
    }
    co.processing = true;
    const btn = $('#pay-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = S.t('common.loading'); }
    setTimeout(function () {
      const now = new Date();
      const order = {
        id: 'BQ-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        email: co.form.email,
        name: co.form.first + ' ' + co.form.last,
        city: co.form.city,
        country: S.SHIPPING[co.country].name,
        items: S.cartLines().map(function (l) { return { id: l.p.id, name: l.p.name, qty: l.qty, price: l.p.price }; }),
        subtotal: subtotal(),
        discount: co.discount,
        shipping: shippingCost(),
        total: total(),
        ship: co.ship,
        eta: S.deliveryWindow(S.shippingFor(co.country, subtotal())[co.ship === 'express' ? 'expressEta' : 'eta']),
        date: now.toISOString(),
        mode: mode
      };
      try { localStorage.setItem('botique.lastOrder', JSON.stringify(order)); } catch (e) {}
      S.state.cart = [];
      S.save(); S.renderCart(); S.updateBadges();
      co.placed = order;
      renderSuccess(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 950);
  }

  function renderSuccess(order) {
    const root = $('#checkout-content');
    root.innerHTML = '<div class="success"><div class="success-mark">' + S.icon('check') + '</div>' +
      '<h1>' + S.t('checkout.successTitle') + '</h1><p>' + S.t('checkout.successBody') + '</p>' +
      '<div class="success-card"><div class="row"><span>' + S.t('checkout.order') + '</span><b>' + order.id + '</b></div>' +
      '<div class="row"><span>Email</span><span>' + esc(order.email) + '</span></div>' +
      '<div class="row"><span>' + S.t('checkout.shipping') + '</span><span>' + esc(order.city) + ', ' + esc(order.country) + '</span></div>' +
      '<div class="row"><span>' + S.t('product.delivery') + '</span><span>' + order.eta + '</span></div>' +
      '<div class="row"><span>' + S.t('checkout.total') + '</span><b>' + S.money(order.total) + '</b></div></div>' +
      '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:22px"><a class="btn btn-dark" href="shop.html">' + S.t('checkout.continue') + '</a><a class="btn btn-ghost" href="policies.html?p=track">' + S.t('footer.track') + '</a></div>' +
      '<p class="fine" style="margin-top:16px">Demo order · no payment was taken. Connect Stripe in <code>assets/js/config.js</code> to go live.</p></div>';
  }

  function snapshotAndRender() {
    document.querySelectorAll('[data-form]').forEach(function (el) { co.form[el.getAttribute('data-form')] = el.value; });
    if (co.placed) return;
    renderCheckout();
  }

  document.addEventListener('DOMContentLoaded', function () {
    S.init();
    renderCheckout();
    document.addEventListener('botique:currency', function () {
      if (co.placed) return;
      refreshTotals();
      refreshDelivery();
    });
    document.addEventListener('botique:lang', snapshotAndRender);
  });
})();
