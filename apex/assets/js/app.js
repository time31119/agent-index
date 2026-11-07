/* APEX — shared UI layer */
(function () {
  'use strict';
  const A = window.APEX;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.4l2.95 6.02 6.63.92-4.82 4.66 1.16 6.6L12 17.5l-5.92 3.1 1.16-6.6L2.42 9.34l6.63-.92z"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function markSVG(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (A.MARKS[k] || A.MARKS.orbit) + '</svg>';
  }
  function agentIcon(a, cls) {
    return '<span class="agent-icon ' + (a.gradient || 'g1') + ' ' + (cls || '') + '">' + markSVG(a.mark) + '</span>';
  }
  function stars(n) {
    let out = '<span class="review-stars" aria-label="' + n + ' 分">';
    for (let i = 0; i < 5; i++) out += '<span style="color:' + (i < n ? '#0b0c0e' : 'rgba(11,12,14,.18)') + '">' + STAR + '</span>';
    return out + '</span>';
  }
  function money(n) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  /* ---------- toast ---------- */
  let toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = CHECK + '<span>' + msg + '</span>';
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2600);
  }

  /* ---------- header ---------- */
  const header = $('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  /* active nav */
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const map = { 'index.html': 'home', 'agents.html': 'agents', 'agent.html': 'agents', 'compute.html': 'compute', 'console.html': 'console', 'developers.html': 'developers', 'blueprint.html': 'blueprint' };
  const active = map[file] || '';
  $$('.nav-links a').forEach(a => {
    if (a.getAttribute('data-nav') === active) a.classList.add('is-active');
  });

  /* ---------- reveal ---------- */
  const revealables = $$('[data-reveal]');
  if ('IntersectionObserver' in window && revealables.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i % 6, 5) * 45 + 'ms';
      io.observe(el);
    });
  } else {
    revealables.forEach(el => el.classList.add('in'));
  }

  /* ---------- counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    const dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = target * eased;
      const txt = dec > 0
        ? v.toFixed(dec)
        : Math.round(v).toLocaleString('en-US');
      el.textContent = prefix + txt + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters = $$('[data-count]');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setFinal(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    const dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const txt = dec > 0 ? target.toFixed(dec) : Math.round(target).toLocaleString('en-US');
    el.textContent = prefix + txt + suffix;
  }
  if (counters.length && reduceMotion) {
    counters.forEach(setFinal);
  } else if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- rails ---------- */
  $$('[data-rail]').forEach(rail => {
    const wrap = rail.closest('.rail-wrap') || document;
    $$('[data-rail-dir]', wrap).forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = parseInt(btn.getAttribute('data-rail-dir'), 10) || 1;
        rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.8, 460), behavior: 'smooth' });
      });
    });
  });

  /* ---------- command palette ---------- */
  const overlay = document.createElement('div');
  overlay.className = 'cmdk';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', '全局搜索');
  overlay.innerHTML =
    '<div class="cmdk-panel">' +
      '<div class="cmdk-input-row">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m15.8 15.8 4.4 4.4"/></svg>' +
        '<input id="cmdkInput" type="text" placeholder="搜索智能体、算力或页面…" autocomplete="off" spellcheck="false">' +
        '<span class="kbd">ESC</span>' +
      '</div>' +
      '<div class="cmdk-list" id="cmdkList"></div>' +
      '<div class="cmdk-foot"><span><span class="kbd">↑↓</span> 选择</span><span><span class="kbd">↵</span> 打开</span><span><span class="kbd">⌘K</span> 随时唤起</span></div>' +
    '</div>';
  document.body.appendChild(overlay);

  const cmdkInput = $('#cmdkInput');
  const cmdkList = $('#cmdkList');
  let cmdkItems = [];
  let selected = 0;

  function buildIndex(q) {
    const s = q.trim().toLowerCase();
    const agents = A.AGENTS.filter(a => {
      if (!s) return a.rating >= 4.8;
      return (a.name + ' ' + a.zh + ' ' + a.maker + ' ' + a.cat + ' ' + a.tagline + ' ' + (a.tags || []).join(' ')).toLowerCase().includes(s);
    }).slice(0, 6).map(a => ({
      group: '智能体', title: a.name + ' · ' + a.zh, desc: a.maker + ' · ' + a.cat,
      href: 'agent.html?id=' + a.id, icon: { gradient: a.gradient, mark: a.mark }, kind: a.price.label
    }));

    const gpus = A.GPUS.filter(g => {
      if (!s) return g.price > 1.9;
      return (g.name + ' ' + g.short + ' ' + g.cat + ' ' + g.vendor).toLowerCase().includes(s);
    }).slice(0, 4).map(g => ({
      group: '算力', title: g.name, desc: g.mem + ' · ' + g.cat,
      href: 'compute.html#gpu-' + g.id, icon: null, kind: '$' + g.price.toFixed(2) + '/h'
    }));

    const pages = A.PAGES.filter(p => {
      if (!s) return true;
      return (p.title + ' ' + p.desc).toLowerCase().includes(s);
    }).slice(0, 4).map(p => ({
      group: '页面', title: p.title, desc: p.desc, href: p.url, icon: null, kind: p.kind
    }));

    return agents.concat(gpus, pages);
  }

  function render(q) {
    cmdkItems = buildIndex(q);
    selected = 0;
    if (!cmdkItems.length) {
      cmdkList.innerHTML = '<div class="cmdk-empty">没有找到与「' + q.replace(/[<>&]/g, '') + '」相关的结果<br><span style="font-size:10px">试试「编程」「H200」「研究」</span></div>';
      return;
    }
    let html = '', last = '';
    cmdkItems.forEach((it, i) => {
      if (it.group !== last) { html += '<div class="cmdk-group">' + it.group + '</div>'; last = it.group; }
      html += '<div class="cmdk-item' + (i === 0 ? ' is-sel' : '') + '" data-href="' + it.href + '" data-i="' + i + '">' +
        (it.icon ? '<span class="agent-icon ' + it.icon.gradient + '">' + markSVG(it.icon.mark) + '</span>'
                 : '<span class="agent-icon g5" style="background:rgba(11,12,14,.06);color:#0b0c0e">' +
                   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 12h8M12 8v8"/></svg></span>') +
        '<span><span class="ci-t">' + it.title + '</span><span class="ci-d">' + it.desc + '</span></span>' +
        '<span class="ci-kind">' + it.kind + '</span></div>';
    });
    cmdkList.innerHTML = html;
  }

  function select(i) {
    const items = $$('.cmdk-item', cmdkList);
    if (!items.length) return;
    selected = (i + items.length) % items.length;
    items.forEach((el, idx) => el.classList.toggle('is-sel', idx === selected));
    items[selected].scrollIntoView({ block: 'nearest' });
  }

  function openPalette() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    cmdkInput.value = '';
    render('');
    setTimeout(() => cmdkInput.focus(), 30);
  }
  function closePalette() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closePalette();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePalette();
    const item = e.target.closest('.cmdk-item');
    if (item) location.href = item.getAttribute('data-href');
  });
  cmdkInput.addEventListener('input', () => render(cmdkInput.value));
  cmdkInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); select(selected + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); select(selected - 1); }
    else if (e.key === 'Enter') {
      const it = cmdkItems[selected];
      if (it) location.href = it.href;
    }
  });
  $$('.search-trigger').forEach(b => b.addEventListener('click', openPalette));

  /* ---------- misc ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  $$('[data-scroll-top]').forEach(b => b.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })));


  /* dev deep-link: ?to=<section-id> */
  (function () {
    const to = new URLSearchParams(location.search).get('to');
    if (!to) return;
    const el = document.getElementById(to);
    if (el) requestAnimationFrame(() => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 68));
  })();

  window.APEX.ui = {
    $, $$, markSVG, agentIcon, stars, money, toast, openPalette, CHECK, ARROW, STAR
  };
})();

