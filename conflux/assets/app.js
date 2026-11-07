/* 合流 Conflux — interaction layer (concept prototype) */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header state ---------- */
  var header = $('#header');
  if (header) {
    var setHeader = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    setHeader();
    window.addEventListener('scroll', setHeader, { passive: true });
  }

  /* ---------- mobile navigation ---------- */
  var toggle = $('#navToggle');
  var mobileNav = $('#mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? '打开菜单' : '关闭菜单');
      mobileNav.classList.toggle('is-open', !open);
    });
    $$('a', mobileNav).forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = $$('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window && !reduced) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---------- number counters ---------- */
  var counters = $$('[data-count]');
  var animateCount = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (isNaN(target)) return;
    if (reduced) { el.textContent = target.toFixed(decimals); return; }
    var start = null;
    var dur = 1300;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(step);
  };
  counters.forEach(function (el) {
    el.textContent = '0';
    window.setTimeout(function () { animateCount(el); }, 350);
  });

  /* ---------- progress ring ---------- */
  var ring = $('#dealRing');
  if (ring) {
    window.setTimeout(function () { ring.classList.add('is-on'); }, 550);
  }

  /* ---------- project filters ---------- */
  var tabs = $$('.tab[data-filter]');
  var cards = $$('#projectGrid .p-card');
  if (tabs.length && cards.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var filter = tab.getAttribute('data-filter');
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', String(on));
        });
        cards.forEach(function (card) {
          var show = filter === 'all' || card.getAttribute('data-cat') === filter;
          card.hidden = !show;
        });
      });
    });
  }

  /* ---------- demo form ---------- */
  var form = $('#demoForm');
  var toast = $('#toast');
  var toastTimer = null;
  var showToast = function (msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('is-on'); }, 3600);
  };

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[name="email"]');
      var value = email ? email.value.trim() : '';
      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showToast('请填写有效的工作邮箱');
        if (email) email.focus();
        return;
      }
      showToast('演示环境：申请已记录（不会真实发送）');
      form.reset();
    });
  }

  /* ---------- project page: section spy ---------- */
  var pTabs = $$('.p-tab[href^="#"]');
  if (pTabs.length && 'IntersectionObserver' in window) {
    var sections = pTabs
      .map(function (t) { return document.querySelector(t.getAttribute('href')); })
      .filter(Boolean);

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        pTabs.forEach(function (t) {
          t.classList.toggle('is-active', t.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-140px 0px -62% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- project page: interview slots ---------- */
  var slots = $$('.slot');
  slots.forEach(function (slot) {
    slot.addEventListener('click', function () {
      slots.forEach(function (s) { s.classList.remove('is-active'); });
      slot.classList.add('is-active');
    });
  });

  var requestBtn = $('#requestInterview');
  if (requestBtn) {
    requestBtn.addEventListener('click', function () {
      var active = document.querySelector('.slot.is-active');
      showToast(active ? '演示环境：已申请「' + active.textContent.trim() + '」约谈' : '请先选择一个时段');
    });
  }
})();
