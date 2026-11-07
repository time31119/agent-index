/* ============================================================
   SLIDE — app.js
   Devices, roll interaction, darkroom presets, colourways,
   reveal-on-scroll and the (demo) reservation form.
   ============================================================ */
(function () {
  'use strict';

  var ART = window.SLIDE_ART;
  var FRAMES = ART.SCENES.length;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var devices = [];
  var wheelDevice = null;

  var PRESET_CN = {
    spectra: '光谱', news: '报纸', blueprint: '蓝图',
    sepia: '棕褐', neon: '霓虹', mud: '泥灰'
  };

  /* ---------- device ---------- */
  function buildDevice(slot) {
    var color = slot.getAttribute('data-color') || 'alu';
    var el = document.createElement('div');
    el.className = 'device';
    el.setAttribute('data-color', color);
    el.innerHTML =
      '<div class="device-shadow"></div>' +
      '<div class="device-body">' +
        '<div class="device-slot-top"></div>' +
        '<div class="device-plate"></div>' +
        '<div class="device-screen">' +
          '<canvas width="480" height="320" aria-label="SLIDE 01 电子纸预览"></canvas>' +
          '<div class="screen-glare"></div>' +
          '<div class="screen-flash"></div>' +
        '</div>' +
        '<div class="device-marks"><span>SLIDE 01</span><span class="nfc">NFC &#9679;</span></div>' +
      '</div>' +
      '<div class="device-wheel" role="slider" tabindex="0" aria-label="滚轮：切换画面" aria-valuemin="1" aria-valuemax="' + FRAMES + '" aria-valuenow="1" aria-orientation="vertical"></div>';
    slot.appendChild(el);

    var canvas = el.querySelector('canvas');
    var wheel = el.querySelector('.device-wheel');
    var state = { el: el, canvas: canvas, frame: 0, locked: false, name: slot.getAttribute('data-device') };

    function render() {
      ART.paint(canvas, state.frame, 'spectra');
    }
    render();

    function refresh(dir) {
      if (state.locked) return;
      state.frame = (state.frame + dir + FRAMES) % FRAMES;
      state.locked = true;
      render();
      el.classList.add('is-refreshing');
      wheel.setAttribute('aria-valuenow', String(state.frame + 1));
      window.setTimeout(function () { el.classList.remove('is-refreshing'); }, 470);
      window.setTimeout(function () { state.locked = false; }, 190);
      if (state.name === 'wheel') syncStrip(state.frame);
    }

    var acc = 0;
    wheel.addEventListener('wheel', function (e) {
      e.preventDefault();
      acc += e.deltaY;
      if (Math.abs(acc) > 42) {
        refresh(acc > 0 ? 1 : -1);
        acc = 0;
      }
    }, { passive: false });

    var dragging = false, lastY = 0;
    wheel.addEventListener('pointerdown', function (e) {
      dragging = true; lastY = e.clientY;
      wheel.setPointerCapture(e.pointerId);
      el.classList.add('is-advancing');
    });
    wheel.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dy = e.clientY - lastY;
      if (Math.abs(dy) > 22) {
        refresh(dy > 0 ? 1 : -1);
        lastY = e.clientY;
      }
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-advancing');
      if (e && e.pointerId !== undefined && wheel.hasPointerCapture(e.pointerId)) {
        wheel.releasePointerCapture(e.pointerId);
      }
    }
    wheel.addEventListener('pointerup', endDrag);
    wheel.addEventListener('pointercancel', endDrag);

    wheel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); refresh(1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); refresh(-1); }
    });

    state.setFrame = function (i) {
      if (state.locked) return;
      state.frame = ((i % FRAMES) + FRAMES) % FRAMES;
      state.locked = true;
      render();
      el.classList.add('is-refreshing');
      wheel.setAttribute('aria-valuenow', String(state.frame + 1));
      window.setTimeout(function () { el.classList.remove('is-refreshing'); }, 470);
      window.setTimeout(function () { state.locked = false; }, 190);
      if (state.name === 'wheel') syncStrip(state.frame);
    };
    state.refresh = refresh;

    devices.push(state);
    return state;
  }

  /* ---------- strip ---------- */
  var stripItems = [];

  function buildStrip(container) {
    for (var i = 0; i < FRAMES; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'strip-item' + (i === 0 ? ' is-active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.setAttribute('aria-label', '第 ' + (i + 1) + ' 张：' + ART.SCENES[i].label);
      b.title = ART.SCENES[i].label;
      var cv = document.createElement('canvas');
      cv.width = 480; cv.height = 320;
      b.appendChild(cv);
      ART.paint(cv, i, 'spectra');
      (function (idx) {
        b.addEventListener('click', function () {
          if (wheelDevice) wheelDevice.setFrame(idx);
        });
      })(i);
      container.appendChild(b);
      stripItems.push(b);
    }
  }

  function syncStrip(frame) {
    stripItems.forEach(function (b, i) {
      b.classList.toggle('is-active', i === frame);
      b.setAttribute('aria-selected', i === frame ? 'true' : 'false');
    });
    var label = document.querySelector('[data-frame-label]');
    if (label) label.textContent = 'FRAME ' + String(frame + 1).padStart(2, '0') + ' / ' + FRAMES;
  }

  /* ---------- darkroom ---------- */
  function initDarkroom() {
    var canvas = document.querySelector('[data-darkroom]');
    var presetButtons = Array.prototype.slice.call(document.querySelectorAll('[data-preset]'));
    if (!canvas || !presetButtons.length) return;
    var current = 'spectra';

    function apply(preset) {
      current = preset;
      ART.paint(canvas, 0, preset, { scale: 2 });
      presetButtons.forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-preset') === preset);
      });
      var name = document.querySelector('[data-preset-name]');
      var cn = document.querySelector('[data-preset-cn]');
      if (name) name.textContent = preset.toUpperCase();
      if (cn) cn.textContent = PRESET_CN[preset] || '';
    }

    presetButtons.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-preset')); });
    });
    apply('spectra');
  }

  /* ---------- colourways ---------- */
  function initSwatches() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-swatches] .swatch'));
    var target = document.querySelector('[data-device="shell"] .device');
    if (!buttons.length || !target) return;

    function set(color) {
      target.setAttribute('data-color', color);
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-color') === color;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { set(b.getAttribute('data-color')); });
    });
  }

  /* ---------- hero slides / story slide ---------- */
  function initStaticSlides() {
    var row = document.querySelector('[data-slides="3"]');
    if (row) {
      var presets = [
        ['spectra', 'SPECTRA', '光谱'],
        ['news', 'NEWS', '报纸'],
        ['blueprint', 'BLUEPRINT', '蓝图']
      ];
      presets.forEach(function (p) {
        var fig = document.createElement('figure');
        fig.className = 'slide-fig reveal';
        var frame = document.createElement('div');
        frame.className = 'slide';
        var cv = document.createElement('canvas');
        cv.width = 480; cv.height = 320;
        cv.setAttribute('aria-label', p[1] + ' 预设预览');
        frame.appendChild(cv);
        fig.appendChild(frame);
        var cap = document.createElement('figcaption');
        cap.textContent = p[1] + ' — ' + p[2];
        fig.appendChild(cap);
        row.appendChild(fig);
        ART.paint(cv, 0, p[0], { scale: 2 });
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-slide]'), function (el) {
      var name = el.getAttribute('data-slide');
      var preset = el.getAttribute('data-preset') || 'sepia';
      var idx = ART.SCENES.findIndex(function (s) { return s.id === name; });
      var cv = document.createElement('canvas');
      cv.width = 480; cv.height = 320;
      el.appendChild(cv);
      ART.paint(cv, idx < 0 ? 0 : idx, preset, { scale: 2 });
    });
  }

  /* ---------- reveal ---------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduced) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseFloat(el.getAttribute('data-delay') || 0);
        window.setTimeout(function () { el.classList.add('in'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    els.forEach(function (el) {
      var parent = el.parentElement;
      if (parent) {
        var sibs = Array.prototype.filter.call(parent.children, function (c) { return c.classList.contains('reveal'); });
        var i = sibs.indexOf(el);
        if (i > 0) el.setAttribute('data-delay', String(Math.min(i, 4) * 70));
      }
      io.observe(el);
    });

    /* safety net: never leave content invisible */
    window.setTimeout(function () {
      els.forEach(function (el) { el.classList.add('in'); });
    }, 2600);
  }

  /* ---------- nav ---------- */
  function initNav() {
    var nav = document.getElementById('nav');
    var bar = document.querySelector('.scroll-line span');
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('mobileMenu');

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (nav) nav.classList.toggle('is-stuck', y > 40);
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle && menu) {
      var close = function () {
        menu.hidden = true;
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '打开菜单');
      };
      toggle.addEventListener('click', function () {
        var open = menu.hidden;
        menu.hidden = !open;
        document.body.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
      });
      Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
        a.addEventListener('click', close);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !menu.hidden) close();
      });
    }
  }

  /* ---------- reservation form ---------- */
  function initForm() {
    var form = document.getElementById('reserveForm');
    if (!form) return;
    var email = document.getElementById('email');
    var field = email.closest('.field');
    var err = form.querySelector('[data-err="email"]');
    var done = form.querySelector('[data-done]');
    var order = form.querySelector('[data-order]');

    function valid(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    }

    email.addEventListener('input', function () {
      field.classList.remove('is-err');
      if (err) err.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valid(email.value.trim())) {
        field.classList.add('is-err');
        if (err) err.hidden = false;
        email.focus();
        return;
      }
      var n = Math.floor(1000 + Math.random() * 8999);
      if (order) order.textContent = 'NO. SLIDE-' + n;
      ['input', 'select', 'button'].forEach(function (tag) {
        Array.prototype.forEach.call(form.querySelectorAll(tag), function (el) {
          el.disabled = true;
        });
      });
      if (done) done.hidden = false;
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('.device-slot'), function (slot) {
      var state = buildDevice(slot);
      if (slot.getAttribute('data-device') === 'wheel') wheelDevice = state;
    });

    var strip = document.querySelector('[data-strip]');
    if (strip) {
      buildStrip(strip);
      syncStrip(0);
    }

    initStaticSlides();
    initDarkroom();
    initSwatches();
    initReveal();
    initNav();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
