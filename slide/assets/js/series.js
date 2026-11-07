/* ============================================================
   SLIDE — series.js
   The three new objects (02 FLIP / 03 SLIDE / 04 TURN):
   e-paper canvases, flip interaction, card & dial frame changes,
   and the edition (material) switcher.
   ============================================================ */
(function () {
  'use strict';

  var ART = window.SLIDE_ART;
  var BY_ID = {};
  ART.SCENES.forEach(function (s, i) { BY_ID[s.id] = i; });

  var CARD_SCENES = ['waves', 'morning', 'bars'];
  var DIAL_SCENES = ['night', 'map', 'weather'];

  /* centre-square crops, per scene */
  var CROPS = {
    poem: { x: 150, y: 0, w: 320, h: 320 }
  };

  function paint(cv) {
    var id = cv.getAttribute('data-obj');
    var idx = BY_ID[id] !== undefined ? BY_ID[id] : 0;
    var preset = cv.getAttribute('data-preset') || 'spectra';
    var square = cv.getAttribute('data-crop') === 'square';
    if (square) {
      var crop = CROPS[id] || { x: 80, y: 0, w: 320, h: 320 };
      ART.paintCrop(cv, idx, preset, crop, { scale: 2 });
    } else {
      ART.paint(cv, idx, preset, { scale: 2 });
    }
  }

  function cycle(cv, list, state) {
    state.i = (state.i + 1) % list.length;
    cv.setAttribute('data-obj', list[state.i]);
    paint(cv);
  }

  /* ---------- flip ---------- */
  function initFlip() {
    Array.prototype.forEach.call(document.querySelectorAll('.obj-flip'), function (obj) {
      var coin = obj.querySelector('.coin');
      if (!coin || coin.getAttribute('data-interactive') === null) return;
      coin.addEventListener('click', function () {
        obj.classList.toggle('is-flipped');
        coin.setAttribute('aria-pressed', obj.classList.contains('is-flipped') ? 'true' : 'false');
      });
    });
  }

  /* ---------- card ---------- */
  function initCard() {
    Array.prototype.forEach.call(document.querySelectorAll('.obj-card'), function (obj) {
      if (obj.getAttribute('data-interactive') === null) return;
      var cv = obj.querySelector('canvas');
      var state = { i: 0 };
      obj.addEventListener('click', function () {
        cycle(cv, CARD_SCENES, state);
        obj.classList.add('is-open');
        window.setTimeout(function () { obj.classList.remove('is-open'); }, 700);
      });
    });
  }

  /* ---------- dial ---------- */
  function initDial() {
    Array.prototype.forEach.call(document.querySelectorAll('.obj-dial'), function (obj) {
      if (obj.getAttribute('data-interactive') === null) return;
      var cv = obj.querySelector('canvas');
      var ring = obj.querySelector('.dial-ring');
      var state = { i: 0 };
      var angle = 0;
      obj.addEventListener('click', function () {
        angle += 30;
        if (ring) ring.style.transform = 'rotate(' + angle + 'deg)';
        cycle(cv, DIAL_SCENES, state);
      });
    });
  }

  /* ---------- editions ---------- */
  function initEditions() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-edition-set]'));
    if (!buttons.length) return;
    var objects = Array.prototype.slice.call(document.querySelectorAll('.obj'));
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var ed = b.getAttribute('data-edition-set');
        objects.forEach(function (o) { o.setAttribute('data-edition', ed); });
        var label = document.querySelector('[data-edition-label]');
        if (label) label.textContent = ed.toUpperCase();
        buttons.forEach(function (x) {
          var on = x === b;
          x.classList.toggle('is-active', on);
          x.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      });
    });
  }

  /* ---------- pointer specular ---------- */
  function initSpecular() {
    Array.prototype.forEach.call(document.querySelectorAll('.obj'), function (obj) {
      obj.addEventListener('pointermove', function (e) {
        var r = obj.getBoundingClientRect();
        if (!r.width) return;
        obj.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        obj.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
      obj.addEventListener('pointerleave', function () {
        obj.style.removeProperty('--mx');
        obj.style.removeProperty('--my');
      });
    });
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('canvas[data-obj]'), paint);
    initFlip();
    initCard();
    initDial();
    initEditions();
    initSpecular();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
