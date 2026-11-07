/* BOTIQUE — home page */
(function () {
  'use strict';
  const D = window.BOTIQUE_DATA;
  const A = window.BOTIQUE_ART;
  const S = window.BOTIQUE;

  const catHero = { companion: 'eilik', pets: 'joy-for-all-pup', dogs: 'yonbo-y1', stem: 'sphero-bolt', rc: 'dji-neo' };

  function renderStats() {
    const brands = new Set(D.products.map(function (p) { return p.brand; })).size;
    const avg = D.products.reduce(function (n, p) { return n + p.rating; }, 0) / D.products.length;
    const b = document.getElementById('stat-brands');
    const r = document.getElementById('stat-rating');
    const bi = document.getElementById('brand-count-inline');
    if (b) b.textContent = brands;
    if (r) r.textContent = avg.toFixed(1);
    if (bi) bi.textContent = brands;
  }

  function renderHero() {
    const eilik = D.byId('eilik');
    const emo = D.byId('emo');
    const art = document.getElementById('hero-art');
    const mini = document.getElementById('hero-mini');
    if (art) art.innerHTML = A.art(eilik);
    if (mini) mini.innerHTML = A.art(emo);
    const feat = document.getElementById('feature-art');
    if (feat) feat.innerHTML = A.art(eilik);
    document.querySelectorAll('[data-art-product]').forEach(function (el) {
      const p = D.byId(el.getAttribute('data-art-product'));
      if (p) el.innerHTML = A.art(p);
    });
  }

  function renderCategories() {
    const host = document.getElementById('cat-grid');
    if (!host) return;
    host.innerHTML = D.categories.map(function (c) {
      const count = D.byCat(c.id).length;
      const p = D.byId(catHero[c.id]) || D.byCat(c.id)[0];
      return '<a class="cat-card" href="shop.html?cat=' + c.id + '" style="background:' + D.tones[c.tone].bg + '">' +
        '<span class="cat-arrow">' + S.icon('arrow') + '</span>' +
        '<div class="cat-art" aria-hidden="true">' + A.art(p) + '</div>' +
        '<div><span class="cat-count">' + count + ' bots · ' + S.t('common.from') + ' ' + S.money(D.byCat(c.id).reduce(function (m, x) { return Math.min(m, x.price); }, 9999)) + '</span>' +
        '<h3>' + (S.state.lang === 'zh' ? c.zh : c.name) + '</h3><p>' + c.blurb + '</p></div></a>';
    }).join('') +
      '<a class="cat-card all" href="shop.html"><div><span class="cat-count">The complete index · 2026</span><h3>' + S.t('home.topLink') + '</h3></div><span class="cat-arrow">' + S.icon('arrow') + '</span></a>';
  }

  function renderTop() {
    const host = document.getElementById('top-rail');
    if (!host) return;
    host.innerHTML = D.top(10).map(function (p) { return S.productCard(p, { className: 'top-card', bigRank: true }); }).join('');
  }

  function renderAll() {
    renderStats();
    renderHero();
    renderCategories();
    renderTop();
  }

  /* Gift finder ----------------------------------------------------------- */
  const gift = { step: 0, who: '', budget: '', vibe: '' };
  const questions = [
    { key: 'who', title: 'Who is it for?', sub: 'We won’t judge if the answer is “me.”', options: [
      ['kid', 'A curious kid', '3–10'], ['teen', 'A hard-to-impress teen', '11–17'], ['adult', 'A grown-up desk companion', '18+'], ['elder', 'A parent or grandparent', '65+']
    ]},
    { key: 'budget', title: 'What’s the budget?', sub: 'All prices in USD, shipping not included.', options: [
      ['b1', 'Under $75', 'Stocking filler'], ['b2', '$75 – $200', 'The sweet spot'], ['b3', '$200 – $500', 'Properly nice'], ['b4', '$500+', 'Go big']
    ]},
    { key: 'vibe', title: 'What vibe?', sub: 'Pick the one you’d describe to a friend.', options: [
      ['cuddly', 'Cuddly', 'Soft, warm, low-maintenance'], ['chatty', 'Chatty', 'Talks back, remembers you'], ['clever', 'Clever', 'Builds, codes, learns'], ['chaotic', 'Chaotic', 'Moves fast, makes noise']
    ]}
  ];

  function renderGiftModal() {
    const host = document.getElementById('gift-modal');
    if (!host) return;
    const q = questions[gift.step];
    if (!q) { renderGiftResults(host); return; }
    host.innerHTML = '<div class="gift-shell" role="dialog" aria-modal="true" aria-label="Gift finder">' +
      '<button class="icon-btn gift-close" data-close-gift aria-label="Close">' + S.icon('close') + '</button>' +
      '<div class="gift-progress">' + questions.map(function (_, i) { return '<span class="' + (i <= gift.step ? 'is-on' : '') + '"></span>'; }).join('') + '</div>' +
      '<span class="kicker">Gift mode · ' + (gift.step + 1) + ' / 3</span>' +
      '<h2>' + q.title + '</h2><p class="gift-sub">' + q.sub + '</p>' +
      '<div class="gift-options">' + q.options.map(function (o) {
        const on = gift[q.key] === o[0] ? ' style="background:var(--lime);border-color:var(--ink)"' : '';
        return '<button class="gift-opt" data-gift="' + q.key + '" data-value="' + o[0] + '"' + on + '>' + o[1] + '<span>' + o[2] + '</span></button>';
      }).join('') + '</div>' +
      '<div class="gift-nav"><button class="link-btn" data-gift-back ' + (gift.step === 0 ? 'disabled style="opacity:.3"' : '') + '>← Back</button>' +
      '<button class="btn btn-dark btn-sm" data-gift-next ' + (gift[q.key] ? '' : 'disabled style="opacity:.35"') + '>Continue</button></div></div>';
    host.classList.add('is-open');
    host.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function pickGift() {
    const budget = { b1: [0, 75], b2: [75, 200], b3: [200, 500], b4: [500, 99999] }[gift.budget] || [0, 99999];
    const weights = {
      companion: { kid: 2, teen: 3, adult: 3, elder: 2, cuddly: 2, chatty: 4, clever: 2, chaotic: 2 },
      pets: { kid: 3, teen: 1, adult: 2, elder: 4, cuddly: 5, chatty: 2, clever: 1, chaotic: 1 },
      dogs: { kid: 2, teen: 3, adult: 2, elder: 1, cuddly: 1, chatty: 1, clever: 2, chaotic: 4 },
      stem: { kid: 2, teen: 3, adult: 2, elder: 1, cuddly: 0, chatty: 1, clever: 5, chaotic: 2 },
      rc: { kid: 3, teen: 3, adult: 1, elder: 1, cuddly: 0, chatty: 1, clever: 2, chaotic: 5 }
    };
    return D.products.filter(function (p) { return p.launch; }).map(function (p) {
      let score = 0;
      score += (weights[p.cat] && (weights[p.cat][gift.who] + weights[p.cat][gift.vibe])) || 0;
      const inBudget = p.price >= budget[0] && p.price <= budget[1];
      score += inBudget ? 5 : -4;
      score += (p.rating - 4) * 2;
      score += Math.max(0, 3 - p.rank / 40);
      if (gift.vibe === 'cuddly' && p.form === 'plush') score += 3;
      if (gift.vibe === 'chaotic' && (p.form === 'dog' || p.form === 'drone')) score += 2;
      if (gift.vibe === 'clever' && p.cat === 'stem') score += 2;
      if (gift.who === 'elder' && p.id === 'joy-for-all-pup') score += 5;
      return { p: p, score: score };
    }).sort(function (a, b) { return b.score - a.score; }).slice(0, 3).map(function (x) { return x.p; });
  }

  function renderGiftResults(host) {
    const picks = pickGift();
    host.innerHTML = '<div class="gift-shell" role="dialog" aria-modal="true" aria-label="Gift results">' +
      '<button class="icon-btn gift-close" data-close-gift aria-label="Close">' + S.icon('close') + '</button>' +
      '<span class="kicker">Your shortlist</span><h2>Three very good little weirdos.</h2>' +
      '<p class="gift-sub">Picked for ' + ({ kid: 'a curious kid', teen: 'a hard-to-impress teen', adult: 'a grown-up', elder: 'a parent or grandparent' }[gift.who]) + ', ' + ({ b1: 'under $75', b2: '$75–$200', b3: '$200–$500', b4: '$500+' }[gift.budget]) + ', and a ' + gift.vibe + ' vibe.</p>' +
      '<div class="gift-results">' + picks.map(function (p) { return S.productCard(p); }).join('') + '</div>' +
      '<div class="gift-nav"><button class="link-btn" data-gift-restart>← Start over</button><a class="btn btn-dark btn-sm" href="shop.html?launch=1">' + S.t('nav.available') + ' ' + S.icon('arrow') + '</a></div></div>';
  }

  function bindGift() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-open-gift]')) { gift.step = 0; gift.who = gift.budget = gift.vibe = ''; renderGiftModal(); return; }
      if (e.target.closest('[data-close-gift]')) { S.closeAll(); return; }
      const opt = e.target.closest('[data-gift]');
      if (opt) {
        gift[opt.getAttribute('data-gift')] = opt.getAttribute('data-value');
        if (gift.step < 2) { gift.step++; renderGiftModal(); }
        else { gift.step = 3; renderGiftModal(); }
        return;
      }
      if (e.target.closest('[data-gift-back]')) { gift.step = Math.max(0, gift.step - 1); renderGiftModal(); return; }
      if (e.target.closest('[data-gift-next]')) {
        const q = questions[gift.step];
        if (q && gift[q.key]) {
          if (gift.step < 2) { gift.step++; renderGiftModal(); }
          else { gift.step = 3; renderGiftModal(); }
        }
        return;
      }
      if (e.target.closest('[data-gift-restart]')) { gift.step = 0; gift.who = gift.budget = gift.vibe = ''; renderGiftModal(); return; }
      if (e.target === document.getElementById('gift-modal')) S.closeAll();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    S.init();
    renderAll();
    bindGift();
    if (new URLSearchParams(location.search).get('gift') === '1') setTimeout(function () { renderGiftModal(); }, 100);
    document.addEventListener('botique:currency', renderAll);
    document.addEventListener('botique:lang', renderAll);
  });
})();
