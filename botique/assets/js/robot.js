/* BOTIQUE — procedural product art v2.
   One hundred products, one hundred distinct little robots.
   Every silhouette is built from a form + a deterministic 'look' (eyes, mouth,
   accessory, decal, pattern, proportion). No two products share a look. */
(function (global) {
  'use strict';
  const INK = '#15130F';
  const PAPER = '#FFFDF8';
  const LIME = '#D8FF3F';

  const EYES = ['round', 'sleepy', 'star', 'wink', 'pixel', 'heart', 'wide', 'curl'];
  const ACCESSORIES = ['none', 'bow', 'flower', 'halo', 'headphones', 'crown', 'propeller', 'starclip', 'flag', 'visor'];
  const DECALS = ['button', 'heart', 'star', 'bolt', 'badge', 'stripe', 'patch', 'none'];
  const PATTERNS = ['none', 'spots', 'stripes', 'patch', 'grid'];
  const MOUTHS = ['smile', 'open', 'flat', 'wavy', 'o'];
  const VARIANTS = [
    '',
    'translate(200 330) scale(.88 1.12) translate(-200 -330)',
    'translate(200 330) scale(1.12 .88) translate(-200 -330)',
    'translate(400 0) scale(-1 1)'
  ];

  const HEAD = {
    desk: [200, 112, 76], screen: [200, 92, 96], orb: [200, 104, 112], plush: [200, 110, 104],
    dog: [200, 118, 66], quad: [200, 126, 48], drone: [200, 194, 60], rover: [200, 140, 68],
    humanoid: [200, 106, 58], arm: [200, 248, 50]
  };
  const EYE_Y = { desk: 170, screen: 176, orb: 208, plush: 206, dog: 186, quad: 156, drone: 225, rover: 180, humanoid: 152, arm: 201 };
  const DECAL_AT = {
    desk: [160, 266], screen: [158, 246], orb: [156, 250], plush: [150, 250], dog: [160, 254],
    quad: [158, 236], drone: [158, 242], rover: [158, 242], humanoid: [168, 238], arm: [160, 254]
  };
  const PATTERN_AT = {
    desk: [240, 270], screen: [240, 250], orb: [248, 246], plush: [244, 258], dog: [242, 268],
    quad: [242, 242], drone: [242, 242], rover: [242, 250], humanoid: [242, 244], arm: [238, 258]
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function hash(str, salt) {
    let h = (2166136261 ^ Math.imul(salt + 1, 2654435761)) >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
    return h >>> 0;
  }

  function rawLook(p, salt) {
    const key = p.id + '|' + salt;
    return {
      eye: hash(key, 1) % EYES.length,
      acc: hash(key, 2) % ACCESSORIES.length,
      decal: hash(key, 3) % DECALS.length,
      pattern: hash(key, 4) % PATTERNS.length,
      mouth: hash(key, 5) % MOUTHS.length,
      variant: hash(key, 6) % VARIANTS.length
    };
  }

  // A few hero products get a deliberately clean signature look.
  const OVERRIDES = {
    eilik: { eye: 0, acc: 0, decal: 7, pattern: 0, mouth: 0, variant: 0 }
  };

  const LOOKS = {};
  const USED = new Set();
  (function buildLooks() {
    const data = global.BOTIQUE_DATA;
    if (!data) return;
    data.products.slice().sort(function (a, b) { return a.rank - b.rank; }).forEach(function (p) {
      let salt = 0;
      let look;
      let key;
      do {
        look = OVERRIDES[p.id] || rawLook(p, salt);
        key = [look.eye, look.acc, look.decal, look.pattern, look.mouth, look.variant].join('-');
        salt++;
      } while (USED.has(key) && salt < 80 && !OVERRIDES[p.id]);
      USED.add(key);
      LOOKS[p.id] = look;
    });
  })();

  function lookFor(p) {
    return LOOKS[p.id] || rawLook(p, 0);
  }

  function defs(uid, t) {
    return '<defs>' +
      '<linearGradient id="body-' + uid + '" x1="0" y1="0" x2="0.7" y2="1">' +
      '<stop offset="0" stop-color="' + t.body + '"/><stop offset="1" stop-color="' + t.deep + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="screen-' + uid + '" x1="0" y1="0" x2="0.6" y2="1">' +
      '<stop offset="0" stop-color="#2A2721"/><stop offset="1" stop-color="#0E0D0B"/>' +
      '</linearGradient>' +
      '<radialGradient id="glow-' + uid + '" cx="0.5" cy="0.5" r="0.5">' +
      '<stop offset="0" stop-color="' + t.eye + '" stop-opacity=".55"/><stop offset="1" stop-color="' + t.eye + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      '</defs>';
  }

  function shadow(cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + (cy || 344) + '" rx="' + (rx || 92) + '" ry="' + (ry || 14) + '" fill="' + INK + '" opacity=".12"/>';
  }

  function sparkles(t, seed) {
    const sets = [
      [[74, 108], [330, 92], [318, 286]],
      [[64, 260], [332, 150], [312, 318]],
      [[70, 140], [326, 252], [96, 300]],
      [[92, 96], [306, 118], [338, 300]],
      [[60, 190], [342, 196], [88, 322]]
    ];
    const pts = sets[seed % sets.length];
    return pts.map(function (pt, i) {
      const s = 5 + (i % 2) * 3;
      return '<path d="M' + pt[0] + ' ' + (pt[1] - s) + 'L' + (pt[0] + s * 0.5) + ' ' + pt[1] + 'L' + pt[0] + ' ' + (pt[1] + s) + 'L' + (pt[0] - s * 0.5) + ' ' + pt[1] + 'Z" fill="' + t.deep + '" opacity=".55"/>';
    }).join('');
  }

  function starPath(cx, cy, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * 0.44 : r;
      const a = -Math.PI / 2 + (Math.PI * i) / 5;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return d + 'Z';
  }

  function heartPath(cx, cy, r) {
    return 'M' + cx + ' ' + (cy + r * 0.85) +
      'C' + (cx - r * 1.35) + ' ' + (cy - r * 0.05) + ' ' + (cx - r * 0.72) + ' ' + (cy - r * 1.25) + ' ' + cx + ' ' + (cy - r * 0.42) +
      'C' + (cx + r * 0.72) + ' ' + (cy - r * 1.25) + ' ' + (cx + r * 1.35) + ' ' + (cy - r * 0.05) + ' ' + cx + ' ' + (cy + r * 0.85) + 'Z';
  }

  function oneEye(x, cy, w, h, color, style, side) {
    const rx = w / 2;
    const ry = h / 2;
    if (style === 1) { // sleepy
      return '<path d="M' + (x - rx) + ' ' + (cy - 2) + 'q' + rx + ' ' + (h * 0.9) + ' ' + w + ' 0" fill="none" stroke="' + color + '" stroke-width="5.2" stroke-linecap="round"/>';
    }
    if (style === 2) { // star
      return '<path d="' + starPath(x, cy, Math.max(w, h) * 0.62) + '" fill="' + color + '"/>';
    }
    if (style === 3) { // wink
      if (side === 0) return '<rect x="' + (x - rx) + '" y="' + (cy - ry) + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + color + '"/>';
      return '<path d="M' + (x - rx) + ' ' + (cy + 1) + 'q' + rx + ' ' + (-h * 0.8) + ' ' + w + ' 0" fill="none" stroke="' + color + '" stroke-width="4.2" stroke-linecap="round"/>';
    }
    if (style === 4) { // pixel
      const s = Math.max(3, Math.round(w / 3));
      return '<g fill="' + color + '"><rect x="' + (x - s * 1.5) + '" y="' + (cy - s * 1.5) + '" width="' + s + '" height="' + s + '"/><rect x="' + (x + s * 0.5) + '" y="' + (cy - s * 1.5) + '" width="' + s + '" height="' + s + '"/><rect x="' + (x - s * 1.5) + '" y="' + (cy + s * 0.5) + '" width="' + s + '" height="' + s + '"/><rect x="' + (x + s * 0.5) + '" y="' + (cy + s * 0.5) + '" width="' + s + '" height="' + s + '"/></g>';
    }
    if (style === 5) { // heart
      return '<path d="' + heartPath(x, cy, Math.max(w, h) * 0.55) + '" fill="' + color + '"/>';
    }
    if (style === 6) { // wide
      return '<circle cx="' + x + '" cy="' + cy + '" r="' + Math.max(rx, ry) + '" fill="' + color + '"/><circle cx="' + (x - rx * 0.35) + '" cy="' + (cy - ry * 0.35) + '" r="' + Math.max(2, w * 0.13) + '" fill="' + PAPER + '" opacity=".75"/>';
    }
    if (style === 7) { // happy curl
      return '<path d="M' + (x - rx) + ' ' + (cy + 2) + 'q' + rx + ' ' + (-h * 0.95) + ' ' + w + ' 0" fill="none" stroke="' + color + '" stroke-width="4.4" stroke-linecap="round"/>';
    }
    return '<rect x="' + (x - rx) + '" y="' + (cy - ry) + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + color + '"/>';
  }

  function eyes(cx, cy, gap, w, h, color, style) {
    return '<g class="bq-blink" style="transform-origin:' + cx + 'px ' + cy + 'px">' +
      oneEye(cx - gap, cy, w, h, color, style, 0) +
      oneEye(cx + gap, cy, w, h, color, style, 1) +
      '</g>';
  }

  function mouth(cx, cy, color, style, width) {
    const w = width || 22;
    if (style === 1) { // open
      return '<ellipse cx="' + cx + '" cy="' + (cy + 2) + '" rx="' + (w * 0.28) + '" ry="5.5" fill="' + color + '"/>';
    }
    if (style === 2) { // flat
      return '<path d="M' + (cx - w * 0.3) + ' ' + cy + 'h' + (w * 0.6) + '" fill="none" stroke="' + color + '" stroke-width="4.2" stroke-linecap="round"/>';
    }
    if (style === 3) { // wavy
      return '<path d="M' + (cx - w * 0.36) + ' ' + cy + 'q' + (w * 0.18) + ' -6 ' + (w * 0.36) + ' 0t' + (w * 0.36) + ' 0" fill="none" stroke="' + color + '" stroke-width="4" stroke-linecap="round"/>';
    }
    if (style === 4) { // o
      return '<circle cx="' + cx + '" cy="' + (cy + 1) + '" r="4.6" fill="none" stroke="' + color + '" stroke-width="3.6"/>';
    }
    return '<path d="M' + (cx - w * 0.34) + ' ' + cy + 'c' + (w * 0.2) + ' 7 ' + (w * 0.48) + ' 7 ' + (w * 0.68) + ' 0" fill="none" stroke="' + color + '" stroke-width="4.4" stroke-linecap="round"/>';
  }

  function blush(cx, cy, gap, color) {
    return '<ellipse cx="' + (cx - gap) + '" cy="' + cy + '" rx="11" ry="6" fill="' + color + '" opacity=".55"/>' +
      '<ellipse cx="' + (cx + gap) + '" cy="' + cy + '" rx="11" ry="6" fill="' + color + '" opacity=".55"/>';
  }

  function accessory(look, t, form) {
    const id = look.acc;
    if (id === 0) return '';
    const h = HEAD[form] || HEAD.desk;
    const cx = h[0];
    const cy = h[1];
    const r = h[2];
    if (id === 1) { // bow
      return '<g transform="translate(' + (cx + r * 0.42) + ' ' + (cy + 4) + ') rotate(8)">' +
        '<path d="M0 0c-18-12-28 2-22 12 5 8 16 6 22-12Z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M0 0c18-12 28 2 22 12-5 8-16 6-22-12Z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<circle cx="0" cy="5" r="5" fill="' + LIME + '" stroke="' + INK + '" stroke-width="3"/></g>';
    }
    if (id === 2) { // flower
      let petals = '';
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        petals += '<circle cx="' + (Math.cos(a) * 11).toFixed(1) + '" cy="' + (Math.sin(a) * 11).toFixed(1) + '" r="7" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>';
      }
      return '<g transform="translate(' + (cx + r * 0.46) + ' ' + (cy + 1) + ')">' + petals + '<circle cx="0" cy="0" r="5" fill="' + LIME + '" stroke="' + INK + '" stroke-width="2.5"/></g>';
    }
    if (id === 3) { // halo
      return '<ellipse cx="' + cx + '" cy="' + (cy - 12) + '" rx="' + (r * 0.55) + '" ry="9" fill="none" stroke="' + LIME + '" stroke-width="7" opacity=".95"/><ellipse cx="' + cx + '" cy="' + (cy - 12) + '" rx="' + (r * 0.55) + '" ry="9" fill="none" stroke="' + INK + '" stroke-width="2"/>';
    }
    if (id === 4) { // headphones
      return '<path d="M' + (cx - r * 0.82) + ' ' + (cy + 22) + 'Q' + cx + ' ' + (cy - 38) + ' ' + (cx + r * 0.82) + ' ' + (cy + 22) + '" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/>' +
        '<circle cx="' + (cx - r * 0.82) + '" cy="' + (cy + 22) + '" r="12" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<circle cx="' + (cx + r * 0.82) + '" cy="' + (cy + 22) + '" r="12" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<circle cx="' + (cx - r * 0.82) + '" cy="' + (cy + 22) + '" r="4" fill="' + LIME + '"/>' +
        '<circle cx="' + (cx + r * 0.82) + '" cy="' + (cy + 22) + '" r="4" fill="' + LIME + '"/>';
    }
    if (id === 5) { // crown
      return '<path d="M' + (cx - 30) + ' ' + (cy + 4) + 'l7-22 12 13 11-20 11 20 12-13 7 22z" fill="' + LIME + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<circle cx="' + (cx - 21) + '" cy="' + (cy - 10) + '" r="3" fill="' + t.deep + '"/><circle cx="' + cx + '" cy="' + (cy - 16) + '" r="3" fill="' + t.deep + '"/><circle cx="' + (cx + 21) + '" cy="' + (cy - 10) + '" r="3" fill="' + t.deep + '"/>';
    }
    if (id === 6) { // propeller cap
      return '<g transform="translate(' + cx + ' ' + (cy - 2) + ')">' +
        '<path d="M-28 8c0-17 12-28 28-28S28-9 28 8Z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M0-20V-38" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M0-38c14-11 28 3 20 10-6 5-14 2-20-10Z" fill="' + LIME + '" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M0-38c-14-11-28 3-20 10 6 5 14 2 20-10Z" fill="' + LIME + '" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="0" cy="-38" r="4" fill="' + INK + '"/></g>';
    }
    if (id === 7) { // star clip
      return '<path d="' + starPath(cx + r * 0.52, cy + 24, 12) + '" fill="' + LIME + '" stroke="' + INK + '" stroke-width="3"/>';
    }
    if (id === 8) { // flag
      return '<g transform="translate(' + (cx + r * 0.5) + ' ' + (cy + 18) + ')">' +
        '<path d="M0 0V-34" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M2-32h26l-8 9 8 9H2Z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/></g>';
    }
    // visor
    const ey = EYE_Y[form] || 170;
    return '<rect x="' + (cx - r * 0.66) + '" y="' + (ey - 27) + '" width="' + (r * 1.32) + '" height="11" rx="5.5" fill="' + t.eye + '" opacity=".32" stroke="' + INK + '" stroke-width="2.2"/>';
  }

  function decal(look, t, form) {
    const id = look.decal;
    if (id === 7) return '';
    const a = DECAL_AT[form] || DECAL_AT.desk;
    const x = a[0];
    const y = a[1];
    const c = t.eye;
    if (id === 0) return '<circle cx="' + x + '" cy="' + y + '" r="7" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/>';
    if (id === 1) return '<path d="' + heartPath(x, y, 8) + '" fill="' + c + '" stroke="' + INK + '" stroke-width="2.4"/>';
    if (id === 2) return '<path d="' + starPath(x, y, 9) + '" fill="' + c + '" stroke="' + INK + '" stroke-width="2.4"/>';
    if (id === 3) return '<path d="M' + (x + 2) + ' ' + (y - 11) + 'l-9 13h7l-3 10 10-14h-7z" fill="' + c + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
    if (id === 4) return '<rect x="' + (x - 11) + '" y="' + (y - 8) + '" width="22" height="16" rx="4" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/><path d="M' + (x - 6) + ' ' + (y - 2) + 'h12M' + (x - 6) + ' ' + (y + 3) + 'h9" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>';
    if (id === 5) return '<path d="M' + (x - 12) + ' ' + (y + 6) + 'l18-13M' + (x - 12) + ' ' + (y + 12) + 'l18-13" stroke="' + c + '" stroke-width="4" stroke-linecap="round" opacity=".85"/>';
    if (id === 6) return '<rect x="' + (x - 9) + '" y="' + (y - 9) + '" width="18" height="18" rx="4" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="2.5" stroke-dasharray="3 3"/>';
    return '';
  }

  function pattern(look, t, form) {
    const id = look.pattern;
    if (id === 0) return '';
    const a = PATTERN_AT[form] || PATTERN_AT.desk;
    const x = a[0];
    const y = a[1];
    const c = t.deep;
    if (id === 1) { // spots
      return '<g fill="' + c + '" opacity=".3"><circle cx="' + (x - 16) + '" cy="' + (y - 10) + '" r="5"/><circle cx="' + (x + 10) + '" cy="' + (y - 2) + '" r="4"/><circle cx="' + (x - 3) + '" cy="' + (y + 12) + '" r="3.4"/></g>';
    }
    if (id === 2) { // stripes
      return '<g stroke="' + c + '" stroke-width="5" stroke-linecap="round" opacity=".28"><path d="M' + (x - 18) + ' ' + (y + 8) + 'l12-10M' + (x - 6) + ' ' + (y + 13) + 'l12-10M' + (x + 6) + ' ' + (y + 18) + 'l12-10"/></g>';
    }
    if (id === 3) { // patch
      return '<rect x="' + (x - 12) + '" y="' + (y - 9) + '" width="24" height="18" rx="5" fill="' + c + '" opacity=".22" stroke="' + INK + '" stroke-width="2" stroke-dasharray="3 3"/>';
    }
    // grid
    return '<g fill="' + c + '" opacity=".28"><rect x="' + (x - 14) + '" y="' + (y - 10) + '" width="7" height="7" rx="1"/><rect x="' + (x - 3) + '" y="' + (y - 10) + '" width="7" height="7" rx="1"/><rect x="' + (x - 14) + '" y="' + (y + 1) + '" width="7" height="7" rx="1"/><rect x="' + (x - 3) + '" y="' + (y + 1) + '" width="7" height="7" rx="1"/></g>';
  }

  const FORMS = {
    desk: function (uid, t, look) {
      return shadow(200, 346, 88, 13) +
        '<g class="bq-float">' +
        '<path d="M152 300h30v34h-30zM218 300h30v34h-30z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<path d="M142 318h44M214 318h44" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="136" y="238" width="128" height="78" rx="34" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M138 270c-18 3-30 14-34 32" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/>' +
        '<path d="M262 270c18 3 30 14 34 32" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/>' +
        '<circle cx="200" cy="286" r="9" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<rect x="124" y="112" width="152" height="132" rx="46" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<rect x="108" y="150" width="18" height="46" rx="9" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<rect x="274" y="150" width="18" height="46" rx="9" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<rect x="144" y="132" width="112" height="88" rx="32" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="4"/>' +
        eyes(200, 170, 25, 15, 24, t.eye, look.eye) +
        mouth(200, 199, t.eye, look.mouth, 24) +
        '<path d="M200 112V92" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="200" cy="84" r="11" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="4"/>' +
        '</g>';
    },

    screen: function (uid, t, look) {
      return shadow(200, 348, 96, 13) +
        '<g class="bq-float">' +
        '<path d="M154 300h30v36h-30zM218 300h30v36h-30z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<rect x="104" y="92" width="192" height="212" rx="42" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<rect x="122" y="112" width="156" height="148" rx="30" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="4"/>' +
        eyes(200, 176, 34, 19, 30, t.eye, look.eye) +
        mouth(200, 214, t.eye, look.mouth, 36) +
        '<path d="M152 276h96" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" opacity=".25"/>' +
        '<circle cx="200" cy="284" r="8" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M200 92V70" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="200" cy="62" r="10" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="4"/>' +
        '</g>';
    },

    orb: function (uid, t, look) {
      return shadow(200, 342, 98, 14) +
        '<g class="bq-float">' +
        '<path d="M160 318h24v26h-24zM218 318h24v26h-24z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<circle cx="200" cy="216" r="112" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<ellipse cx="200" cy="214" rx="76" ry="58" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="4"/>' +
        eyes(200, 208, 28, 16, 25, t.eye, look.eye) +
        mouth(200, 238, t.eye, look.mouth, 28) +
        blush(200, 240, 46, t.eye) +
        '<path d="M94 200c-16 8-24 22-22 42" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/>' +
        '<path d="M306 200c16 8 24 22 22 42" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/>' +
        '<path d="M200 104V84" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="200" cy="76" r="10" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="4"/>' +
        '</g>';
    },

    plush: function (uid, t, look) {
      let fluff = '';
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12;
        fluff += '<circle cx="' + (200 + Math.cos(a) * 104).toFixed(1) + '" cy="' + (214 + Math.sin(a) * 104).toFixed(1) + '" r="22" fill="' + t.body + '"/>';
      }
      return shadow(200, 342, 100, 14) +
        '<g class="bq-float">' +
        '<path d="M120 132c-18-26 12-48 32-30l18 16-18 30z" fill="' + t.body + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<path d="M280 132c18-26-12-48-32-30l-18 16 18 30z" fill="' + t.body + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
        fluff +
        '<circle cx="200" cy="214" r="104" fill="' + t.body + '"/>' +
        '<circle cx="200" cy="214" r="104" fill="none" stroke="' + INK + '" stroke-width="5"/>' +
        '<ellipse cx="200" cy="228" rx="54" ry="44" fill="' + PAPER + '" opacity=".28"/>' +
        eyes(200, 206, 28, 11, 15, INK, look.eye) +
        mouth(200, 232, INK, look.mouth, 22) +
        blush(200, 226, 48, t.deep) +
        '<path d="M160 318h24v22h-24zM216 318h24v22h-24z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5"/>' +
        '</g>';
    },

    dog: function (uid, t, look) {
      return shadow(200, 348, 112, 14) +
        '<g class="bq-float">' +
        '<path d="M118 244h164c18 0 32 14 32 32v22H100v-22c0-18 8-32 18-32z" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M112 292v34M148 292v34M252 292v34M288 292v34" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/>' +
        '<path d="M112 292v34M148 292v34M252 292v34M288 292v34" stroke="' + t.deep + '" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M310 256c30-6 38 18 22 34" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/>' +
        '<circle cx="200" cy="184" r="66" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M148 138c-18-16-36 2-28 24l12 32 24-22z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<path d="M252 138c18-16 36 2 28 24l-12 32-24-22z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<rect x="160" y="160" width="80" height="54" rx="24" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="4"/>' +
        eyes(200, 184, 18, 12, 17, t.eye, look.eye) +
        mouth(200, 203, t.eye, look.mouth, 18) +
        '<ellipse cx="200" cy="242" rx="21" ry="15" fill="' + PAPER + '" opacity=".7"/>' +
        '<ellipse cx="200" cy="236" rx="7" ry="5" fill="' + INK + '"/>' +
        '<path d="M174 262h52" stroke="' + t.deep + '" stroke-width="10" stroke-linecap="round"/>' +
        '<circle cx="200" cy="262" r="6" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="3"/>' +
        '</g>';
    },

    quad: function (uid, t, look) {
      const leg = function (x, flip) {
        const d = 'M' + x + ' 258l' + (14 * flip) + ' 30 6 30M' + x + ' 288l' + (18 * flip) + ' 0 6 26';
        return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="' + d + '" fill="none" stroke="' + t.body + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>';
      };
      return shadow(200, 354, 108, 13) +
        '<g class="bq-float">' +
        leg(142, 1) + leg(258, -1) +
        '<path d="M124 210l22-38h108l22 38-18 56H142z" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<path d="M154 172l18-34h56l18 34z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<rect x="168" y="146" width="64" height="20" rx="10" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="4"/>' +
        eyes(200, 156, 16, 9, 12, t.eye, look.eye) +
        '<path d="M200 138V112" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="200" cy="104" r="9" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M148 232h104" stroke="' + INK + '" stroke-width="4" opacity=".3"/>' +
        '<rect x="182" y="222" width="36" height="20" rx="6" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="200" cy="232" r="4" fill="' + t.eye + '"/>' +
        '</g>';
    },

    drone: function (uid, t, look) {
      return shadow(200, 348, 112, 12) +
        '<g class="bq-float">' +
        '<path d="M132 216l-48-48M268 216l48-48M136 246l-40 44M264 246l40 44" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M132 216l-48-48M268 216l48-48M136 246l-40 44M264 246l40 44" stroke="' + t.body + '" stroke-width="5" stroke-linecap="round"/>' +
        '<g stroke="' + INK + '" stroke-width="4" fill="' + t.deep + '">' +
        '<ellipse cx="76" cy="160" rx="36" ry="9"/><ellipse cx="324" cy="160" rx="36" ry="9"/>' +
        '<ellipse cx="88" cy="296" rx="30" ry="8"/><ellipse cx="312" cy="296" rx="30" ry="8"/>' +
        '</g>' +
        '<path d="M148 194h104c22 0 40 18 40 40v14c0 22-18 40-40 40H148c-22 0-40-18-40-40v-14c0-22 18-40 40-40z" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<rect x="164" y="208" width="72" height="34" rx="16" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="4"/>' +
        eyes(200, 225, 16, 10, 15, t.eye, look.eye) +
        mouth(200, 254, t.eye, look.mouth, 14) +
        '<circle cx="200" cy="274" r="18" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<circle cx="200" cy="274" r="9" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="200" cy="274" r="4" fill="' + t.eye + '"/>' +
        '<circle cx="150" cy="252" r="5" fill="' + t.eye + '"/><circle cx="250" cy="252" r="5" fill="' + t.eye + '"/>' +
        '</g>';
    },

    rover: function (uid, t, look) {
      return shadow(200, 342, 116, 14) +
        '<g class="bq-float">' +
        '<circle cx="126" cy="292" r="40" fill="' + INK + '"/><circle cx="126" cy="292" r="23" fill="' + t.deep + '"/><circle cx="126" cy="292" r="8" fill="' + PAPER + '"/>' +
        '<circle cx="274" cy="292" r="40" fill="' + INK + '"/><circle cx="274" cy="292" r="23" fill="' + t.deep + '"/><circle cx="274" cy="292" r="8" fill="' + PAPER + '"/>' +
        '<rect x="94" y="208" width="212" height="74" rx="34" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M132 208c8-46 36-68 68-68s60 22 68 68z" fill="' + t.body + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<rect x="158" y="160" width="84" height="40" rx="20" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="4"/>' +
        eyes(200, 180, 18, 12, 18, t.eye, look.eye) +
        mouth(200, 194, t.eye, look.mouth, 16) +
        '<path d="M200 140V118" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="200" cy="110" r="9" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M116 258h54M230 258h54" stroke="' + INK + '" stroke-width="5" stroke-linecap="round" opacity=".35"/>' +
        '<circle cx="200" cy="248" r="7" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="3"/>' +
        '</g>';
    },

    humanoid: function (uid, t, look) {
      return shadow(200, 350, 82, 13) +
        '<g class="bq-float">' +
        '<path d="M160 296h26v40h-26zM214 296h26v40h-26z" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M146 334h52M202 334h52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' +
        '<rect x="148" y="210" width="104" height="96" rx="34" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M150 226c-22 8-32 26-30 52M250 226c22 8 32 26 30 52" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/>' +
        '<circle cx="118" cy="282" r="9" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<circle cx="282" cy="282" r="9" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<circle cx="200" cy="254" r="13" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="4"/>' +
        '<circle cx="200" cy="254" r="5" fill="' + t.eye + '"/>' +
        '<rect x="142" y="106" width="116" height="102" rx="40" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<rect x="158" y="124" width="84" height="62" rx="24" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="4"/>' +
        eyes(200, 152, 20, 12, 19, t.eye, look.eye) +
        mouth(200, 173, t.eye, look.mouth, 22) +
        '<path d="M200 106V84" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="200" cy="76" r="9" fill="' + t.eye + '" stroke="' + INK + '" stroke-width="4"/>' +
        '</g>';
    },

    arm: function (uid, t, look) {
      return shadow(200, 344, 96, 13) +
        '<g class="bq-float">' +
        '<rect x="118" y="304" width="164" height="30" rx="15" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<rect x="160" y="272" width="80" height="42" rx="18" fill="url(#body-' + uid + ')" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M200 272l-26-64" stroke="' + INK + '" stroke-width="24" stroke-linecap="round"/>' +
        '<path d="M200 272l-26-64" stroke="' + t.body + '" stroke-width="14" stroke-linecap="round"/>' +
        '<circle cx="174" cy="208" r="20" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<circle cx="174" cy="208" r="7" fill="' + t.eye + '"/>' +
        '<path d="M174 208l52-42" stroke="' + INK + '" stroke-width="22" stroke-linecap="round"/>' +
        '<path d="M174 208l52-42" stroke="' + t.body + '" stroke-width="12" stroke-linecap="round"/>' +
        '<circle cx="226" cy="166" r="17" fill="' + t.deep + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M236 154l26-16M240 164l28 2M236 174l24 18" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' +
        '<rect x="144" y="188" width="62" height="26" rx="8" fill="url(#screen-' + uid + ')" stroke="' + INK + '" stroke-width="4"/>' +
        eyes(175, 201, 13, 9, 12, t.eye, look.eye) +
        '</g>';
    }
  };

  function imageFor(p) {
    const m = global.BOTIQUE_IMAGES && global.BOTIQUE_IMAGES[p.id];
    return m && m.files && m.files.length ? m : null;
  }

  function photos(p) {
    const m = imageFor(p);
    return m ? m.files.slice() : [];
  }

  function credit(p) {
    return imageFor(p);
  }

  function hasPhoto(p) {
    return !!imageFor(p);
  }

  function imageLayout(p) {
    const m = imageFor(p);
    return (m && m.layout) || 'cutout';
  }

  function art(p, opts) {
    opts = opts || {};
    const photo = imageFor(p);
    if (photo && !opts.forceArt) {
      return '<img class="bot-art bot-photo ' + (opts.className || '') + '" src="' + photo.files[0] + '" alt="' + esc(photo.alt || (p.name + ' product photo')) + '" loading="lazy" decoding="async">';
    }
    const t = (global.BOTIQUE_DATA && global.BOTIQUE_DATA.tones[p.tone]) || { bg: '#FFD9CF', body: '#FF6B57', deep: '#C53A28', eye: '#D8FF3F' };
    const uid = String(p.id).replace(/[^a-z0-9]/g, '').slice(0, 22) + (opts.variant || '');
    const look = lookFor(p);
    const fn = FORMS[p.form] || FORMS.desk;
    let shape = fn(uid, t, look);
    const extras = accessory(look, t, p.form) + decal(look, t, p.form) + pattern(look, t, p.form);
    const close = shape.lastIndexOf('</g>');
    if (close > -1) shape = shape.slice(0, close) + extras + shape.slice(close);
    const tf = VARIANTS[look.variant];
    if (tf) shape = '<g transform="' + tf + '">' + shape + '</g>';
    return '<svg class="bot-art ' + (opts.className || '') + '" viewBox="0 0 400 400" role="img" aria-label="' + esc(p.name) + ' illustration" xmlns="http://www.w3.org/2000/svg">' +
      defs(uid, t) + sparkles(t, (p.rank || 0) % 7) + shape + '</svg>';
  }

  function heroArt(p) {
    return art(p, { className: 'hero-bot', variant: 'hero' });
  }

  global.BOTIQUE_ART = {
    art: art,
    heroArt: heroArt,
    lookFor: lookFor,
    photos: photos,
    credit: credit,
    hasPhoto: hasPhoto,
    layout: imageLayout
  };
})(typeof window !== 'undefined' ? window : globalThis);
