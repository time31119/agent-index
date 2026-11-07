/* BOTIQUE — shop / index page */
(function () {
  'use strict';
  const D = window.BOTIQUE_DATA;
  const S = window.BOTIQUE;
  const PAGE = 24;

  const params = new URLSearchParams(location.search);
  const state = {
    cat: params.get('cat') || '',
    q: params.get('q') || '',
    sort: params.get('sort') || 'rank',
    platform: params.get('platform') || '',
    price: params.get('price') || '',
    max: params.get('max') || '',
    launch: params.get('launch') === '1',
    shown: PAGE
  };

  const priceBuckets = {
    p1: [0, 50], p2: [50, 150], p3: [150, 300], p4: [300, 1000], p5: [1000, 99999]
  };

  function filtered() {
    let list = D.products.slice();
    if (state.launch) list = list.filter(function (p) { return p.launch; });
    if (state.cat) list = list.filter(function (p) { return p.cat === state.cat; });
    if (state.platform) list = list.filter(function (p) { return p.platforms.indexOf(state.platform) > -1; });
    if (state.price && priceBuckets[state.price]) {
      const b = priceBuckets[state.price];
      list = list.filter(function (p) { return p.price >= b[0] && p.price < b[1]; });
    }
    if (state.max) list = list.filter(function (p) { return p.price <= parseFloat(state.max); });
    if (state.q) {
      const q = state.q.toLowerCase().trim();
      list = list.filter(function (p) {
        return (p.name + ' ' + p.brand + ' ' + p.tagline + ' ' + p.cat).toLowerCase().indexOf(q) > -1;
      });
    }
    if (state.sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === 'rating') list.sort(function (a, b) { return b.rating - a.rating || a.rank - b.rank; });
    else if (state.sort === 'new') list.sort(function (a, b) { return b.year - a.year || a.rank - b.rank; });
    else list.sort(function (a, b) { return a.rank - b.rank; });
    return list;
  }

  function syncURL() {
    const p = new URLSearchParams();
    if (state.launch) p.set('launch', '1');
    ['cat', 'q', 'sort', 'platform', 'price', 'max'].forEach(function (k) {
      if (state[k] && !(k === 'sort' && state[k] === 'rank')) p.set(k, state[k]);
    });
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  function renderChips() {
    const host = document.getElementById('cat-chips');
    if (!host) return;
    host.innerHTML = '<button class="chip ' + (state.launch ? 'is-on' : '') + '" data-launch="1">' + S.t('shop.availableChip') + ' <span style="opacity:.5">' + D.launchCount + '</span></button>' +
      '<button class="chip ' + (!state.launch && state.cat === '' ? 'is-on' : '') + '" data-all="1">' + S.t('common.all') + ' <span style="opacity:.5">100</span></button>' +
      D.categories.map(function (c) {
        return '<button class="chip ' + (!state.launch && state.cat === c.id ? 'is-on' : '') + '" data-cat="' + c.id + '">' + (S.state.lang === 'zh' ? c.zh : c.name) + ' <span style="opacity:.5">' + D.byCat(c.id).length + '</span></button>';
      }).join('');
  }

  function renderActive() {
    const host = document.getElementById('active-filters');
    if (!host) return;
    const parts = [];
    if (state.launch) parts.push('<span class="active-filter">' + S.t('shop.availableChip') + ' <button data-clear="launch" aria-label="Clear availability">' + S.icon('close') + '</button></span>');
    if (state.q) parts.push('<span class="active-filter">“' + S.esc(state.q) + '” <button data-clear="q" aria-label="Clear search">' + S.icon('close') + '</button></span>');
    if (state.cat) {
      const c = D.categories.filter(function (x) { return x.id === state.cat; })[0];
      parts.push('<span class="active-filter">' + (c ? (S.state.lang === 'zh' ? c.zh : c.name) : state.cat) + ' <button data-clear="cat" aria-label="Clear category">' + S.icon('close') + '</button></span>');
    }
    if (state.platform) parts.push('<span class="active-filter">' + (D.platforms[state.platform] ? D.platforms[state.platform].name : state.platform) + ' <button data-clear="platform" aria-label="Clear platform">' + S.icon('close') + '</button></span>');
    if (state.price) {
      const label = { p1: 'Under $50', p2: '$50–$150', p3: '$150–$300', p4: '$300–$1,000', p5: '$1,000+' }[state.price] || state.price;
      parts.push('<span class="active-filter">' + label + ' <button data-clear="price" aria-label="Clear price">' + S.icon('close') + '</button></span>');
    }
    if (state.max) parts.push('<span class="active-filter">Under ' + S.money(parseFloat(state.max)) + ' <button data-clear="max" aria-label="Clear max price">' + S.icon('close') + '</button></span>');
    host.innerHTML = parts.length ? parts.join('') + '<button class="active-filter" data-clear-all style="background:var(--ink);color:var(--paper)">' + S.t('common.clear') + '</button>' : '';
  }

  function renderGrid() {
    const list = filtered();
    const host = document.getElementById('shop-grid');
    const empty = document.getElementById('empty-shop');
    const load = document.getElementById('load-wrap');
    const count = document.getElementById('result-count');
    if (!host) return;
    const slice = list.slice(0, state.shown);
    host.innerHTML = slice.map(function (p) { return S.productCard(p); }).join('');
    if (count) count.innerHTML = S.t('shop.results', { n: '<b>' + list.length + '</b>' });
    if (empty) empty.hidden = list.length !== 0;
    if (load) load.hidden = list.length === 0 || state.shown >= list.length;
    const note = document.getElementById('load-note');
    if (note) note.textContent = list.length && state.shown >= list.length ? S.t('shop.end') : '';
    renderActive();
    syncURL();
  }

  function renderAll() {
    renderChips();
    renderGrid();
    const h1 = document.querySelector('.page-hero h1');
    const lede = document.querySelector('.page-hero .lede');
    if (h1) h1.textContent = state.launch ? S.t('shop.launchH1') : S.t('shop.h1');
    if (lede) lede.textContent = state.launch ? S.t('shop.launchLede') : S.t('shop.lede');
    document.title = (state.launch ? S.t('shop.launchH1') : S.t('shop.h1')) + ' — BOTIQUE';
    const sort = document.getElementById('sort-select');
    const platform = document.getElementById('platform-select');
    const price = document.getElementById('price-select');
    const search = document.getElementById('shop-search');
    if (sort) sort.value = state.sort;
    if (platform) platform.value = state.platform;
    if (price) price.value = state.price;
    if (search && document.activeElement !== search) search.value = state.q;
  }

  function bind() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-launch]')) { state.launch = true; state.cat = ''; state.shown = PAGE; renderAll(); return; }
      if (e.target.closest('[data-all]')) { state.launch = false; state.cat = ''; state.shown = PAGE; renderAll(); return; }
      const chip = e.target.closest('[data-cat]');
      if (chip) { state.cat = chip.getAttribute('data-cat'); state.launch = false; state.shown = PAGE; renderAll(); return; }
      const clear = e.target.closest('[data-clear]');
      if (clear) {
        const key = clear.getAttribute('data-clear');
        if (key === 'launch') state.launch = false;
        else state[key] = '';
        state.shown = PAGE; renderAll(); return;
      }
      if (e.target.closest('[data-clear-all]')) { state.launch = false; state.cat = state.q = state.platform = state.price = state.max = ''; state.sort = 'rank'; state.shown = PAGE; renderAll(); return; }
      if (e.target.closest('#load-more')) { state.shown += PAGE; renderGrid(); return; }
    });
    document.getElementById('sort-select').addEventListener('change', function (e) { state.sort = e.target.value; state.shown = PAGE; renderGrid(); });
    document.getElementById('platform-select').addEventListener('change', function (e) { state.platform = e.target.value; state.shown = PAGE; renderGrid(); });
    document.getElementById('price-select').addEventListener('change', function (e) { state.price = e.target.value; state.shown = PAGE; renderGrid(); });
    let timer = null;
    document.getElementById('shop-search').addEventListener('input', function (e) {
      clearTimeout(timer);
      const v = e.target.value;
      timer = setTimeout(function () { state.q = v; state.shown = PAGE; renderGrid(); }, 140);
    });
    document.addEventListener('botique:currency', renderAll);
    document.addEventListener('botique:lang', renderAll);
  }

  document.addEventListener('DOMContentLoaded', function () {
    S.init();
    renderAll();
    bind();
  });
})();
