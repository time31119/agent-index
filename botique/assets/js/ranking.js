/* BOTIQUE — ranking methodology + data table */
(function () {
  'use strict';
  const D = window.BOTIQUE_DATA;
  const S = window.BOTIQUE;
  let sortKey = 'rank';
  let sortDir = 1;
  let q = '';

  function catName(c) {
    const x = D.categories.filter(function (k) { return k.id === c; })[0];
    return x ? (S.state.lang === 'zh' ? x.zh : x.name) : c;
  }

  function renderKPIs() {
    const brands = new Set(D.products.map(function (p) { return p.brand; })).size;
    const el = document.getElementById('kpi-brands');
    if (el) el.textContent = brands;
  }

  function bars(rows) {
    const max = Math.max.apply(null, rows.map(function (r) { return r[1]; }));
    return rows.map(function (r) {
      return '<div class="bar-row"><span>' + r[0] + '</span><div class="bar-track"><span style="width:' + (r[1] / max * 100).toFixed(1) + '%"></span></div><em>' + r[1] + '</em></div>';
    }).join('');
  }

  function renderCharts() {
    const plat = [
      ['Amazon', D.products.filter(function (p) { return p.platforms.indexOf('amazon') > -1; }).length],
      ['TikTok Shop', D.products.filter(function (p) { return p.platforms.indexOf('tiktok') > -1; }).length],
      ['Meta Shops', D.products.filter(function (p) { return p.platforms.indexOf('meta') > -1; }).length]
    ];
    const cat = D.categories.map(function (c) { return [S.state.lang === 'zh' ? c.zh : c.name, D.byCat(c.id).length]; });
    const ph = document.getElementById('platform-chart');
    const ch = document.getElementById('category-chart');
    if (ph) ph.innerHTML = bars(plat);
    if (ch) ch.innerHTML = bars(cat);
  }

  function sorted() {
    let list = D.products.slice();
    if (q) {
      const s = q.toLowerCase();
      list = list.filter(function (p) { return (p.name + ' ' + p.brand + ' ' + catName(p.cat)).toLowerCase().indexOf(s) > -1; });
    }
    list.sort(function (a, b) {
      let x = a[sortKey], y = b[sortKey];
      if (sortKey === 'cat') { x = catName(a.cat); y = catName(b.cat); }
      if (typeof x === 'string') return x.localeCompare(y) * sortDir;
      return (x - y) * sortDir;
    });
    return list;
  }

  function renderTable() {
    const body = document.getElementById('rank-body');
    if (!body) return;
    const list = sorted();
    body.innerHTML = list.map(function (p) {
      return '<tr><td class="t-rank">' + p.rank + '</td><td class="t-name"><a href="product.html?id=' + p.id + '">' + S.esc(p.name) + '</a><span>' + S.esc(p.brand) + '</span></td><td class="t-cat">' + catName(p.cat) + '</td><td class="t-num">' + S.money(p.price) + '</td><td class="t-num">' + p.units.toLocaleString('en-US') + '</td><td><div class="t-plats">' + p.platforms.map(function (id) { return '<span class="plat plat-' + id + '">' + D.platforms[id].short + '</span>'; }).join('') + '</div></td></tr>';
    }).join('');
    document.querySelectorAll('.data-table th[data-sort]').forEach(function (th) {
      const active = th.getAttribute('data-sort') === sortKey;
      th.setAttribute('aria-sort', active ? (sortDir === 1 ? 'ascending' : 'descending') : 'none');
      th.style.color = active ? 'var(--lime)' : '';
    });
  }

  function download() {
    const rows = [['rank', 'product', 'brand', 'category', 'price_usd', 'rating', 'public_reviews', 'est_units_30d', 'platforms', 'url']];
    D.products.forEach(function (p) {
      rows.push([p.rank, p.name, p.brand, p.category || catName(p.cat), p.price.toFixed(2), p.rating, p.reviews, p.units, p.platforms.join('|'), 'https://botique.shop/product.html?id=' + p.id]);
    });
    const csv = rows.map(function (r) {
      return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'botique-top100-2026-11.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    S.toast('CSV downloaded · 100 rows');
  }

  document.addEventListener('DOMContentLoaded', function () {
    S.init();
    renderKPIs();
    renderCharts();
    renderTable();
    document.querySelectorAll('.data-table th[data-sort]').forEach(function (th) {
      th.addEventListener('click', function () {
        const key = th.getAttribute('data-sort');
        if (sortKey === key) sortDir *= -1;
        else { sortKey = key; sortDir = 1; }
        renderTable();
      });
    });
    const search = document.getElementById('table-search');
    if (search) search.addEventListener('input', function () { q = search.value; renderTable(); });
    const dl = document.getElementById('download-csv');
    if (dl) dl.addEventListener('click', download);
    document.addEventListener('botique:currency', renderTable);
    document.addEventListener('botique:lang', function () { renderCharts(); renderTable(); });
  });
})();
