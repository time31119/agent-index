/* ============================================================
   SLIDE — art.js
   Procedural "slides" rendered at 480×320, then quantised to a
   6-colour e-paper palette with ordered (Bayer) dithering.
   Everything on this site is drawn here: no photography.
   ============================================================ */
(function (global) {
  'use strict';

  var W = 480, H = 320;

  var PALETTES = {
    spectra:   ['#12110f', '#f2ecdf', '#c8452b', '#d6a12c', '#2f5590', '#3a6b52'],
    news:      ['#12110f', '#efe8d8'],
    blueprint: ['#12233d', '#e6edf2', '#86a9c2'],
    sepia:     ['#2a1d14', '#e9d9bf', '#b07a45'],
    neon:      ['#0a0a10', '#f2ecdf', '#e23b2e', '#3d63c8'],
    mud:       ['#171410', '#d9cfb8', '#7d6d54', '#46402f']
  };

  var BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];

  /* deterministic pseudo random */
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s += 0x6D2B79F5;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hexToRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function text(ctx, str, x, y, font, color, align, spacing) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'alphabetic';
    if (spacing && ctx.letterSpacing !== undefined) ctx.letterSpacing = spacing;
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  /* ---------------- scenes ---------------- */

  var SCENES = [
    /* 0 — sundown */
    {
      id: 'sundown', label: 'SUNDOWN',
      draw: function (c) {
        var g = c.createLinearGradient(0, 0, 0, 200);
        g.addColorStop(0, '#b03a24');
        g.addColorStop(.45, '#d0642c');
        g.addColorStop(.78, '#d6a12c');
        g.addColorStop(1, '#f2ecdf');
        c.fillStyle = g;
        c.fillRect(0, 0, W, 200);
        c.fillStyle = '#f2ecdf';
        c.beginPath();
        c.arc(316, 150, 46, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(242,236,223,.28)';
        c.beginPath();
        c.arc(316, 150, 62, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#2f5590';
        c.fillRect(0, 200, W, H - 200);
        c.fillStyle = '#12110f';
        c.fillRect(0, 200, W, 26);
        for (var i = 0; i < 16; i++) {
          var yy = 212 + i * 6.4;
          var w = 30 + (i % 4) * 22;
          c.fillStyle = i % 3 === 0 ? '#d6a12c' : '#2f5590';
          c.fillRect(316 - w / 2 - (i % 3) * 8, yy, w, 1.6);
        }
        c.fillStyle = '#12110f';
        c.beginPath();
        c.moveTo(92, 200); c.lineTo(112, 150); c.lineTo(116, 200); c.closePath();
        c.fill();
        c.fillStyle = '#f2ecdf';
        c.beginPath();
        c.moveTo(112, 150); c.lineTo(112, 198); c.lineTo(130, 198); c.closePath();
        c.fill();
        text(c, 'SUNDOWN', 24, 300, '600 15px "Bahnschrift", sans-serif', '#f2ecdf', 'left', '3px');
        text(c, '18:42 / 十一月五日', 24, 314, '10px "Noto Sans SC", sans-serif', 'rgba(242,236,223,.6)', 'left', '1px');
      }
    },

    /* 1 — morning type */
    {
      id: 'morning', label: 'MORNING',
      draw: function (c) {
        c.fillStyle = '#f2ecdf';
        c.fillRect(0, 0, W, H);
        c.fillStyle = '#12110f';
        c.fillRect(0, 0, W, 8);
        text(c, '07:42', 24, 40, '11px "Consolas", monospace', '#12110f', 'left', '2px');
        text(c, 'THU', 456, 40, '11px "Consolas", monospace', '#12110f', 'right', '2px');
        text(c, '早安', 26, 210, '600 148px "Noto Serif SC", "SimSun", serif', '#12110f');
        c.fillStyle = '#c8452b';
        c.fillRect(30, 236, 150, 7);
        text(c, '今天也慢慢来。', 30, 274, '15px "Noto Sans SC", sans-serif', '#12110f');
        text(c, 'SLIDE / ROLL 001', 30, 306, '9px "Consolas", monospace', 'rgba(18,17,15,.55)', 'left', '2px');
        c.fillStyle = '#c8452b';
        c.fillRect(420, 250, 34, 34);
        text(c, '晴', 437, 274, '18px "Noto Serif SC", serif', '#f2ecdf', 'center');
      }
    },

    /* 2 — waves */
    {
      id: 'waves', label: 'WAVES',
      draw: function (c) {
        c.fillStyle = '#f2ecdf';
        c.fillRect(0, 0, W, H);
        c.strokeStyle = '#c8452b';
        c.fillStyle = '#c8452b';
        c.beginPath();
        c.arc(376, 66, 26, 0, Math.PI * 2);
        c.fill();
        for (var i = 0; i < 11; i++) {
          var y = 108 + i * 17;
          c.beginPath();
          c.moveTo(-10, y);
          for (var x = 0; x <= W + 20; x += 10) {
            var yy = y + Math.sin((x / 76) + i * .5) * (5 + i * 1.1) + Math.cos(x / 33 + i) * 2;
            c.lineTo(x, yy);
          }
          c.lineWidth = i % 3 === 0 ? 4.2 : 1.6;
          c.strokeStyle = i % 3 === 0 ? '#2f5590' : (i % 4 === 1 ? '#3a6b52' : '#12110f');
          c.stroke();
        }
        text(c, 'WAVES / 02', 24, 44, '10px "Consolas", monospace', '#12110f', 'left', '2px');
      }
    },

    /* 3 — moon */
    {
      id: 'moon', label: 'MOON',
      draw: function (c) {
        c.fillStyle = '#12110f';
        c.fillRect(0, 0, W, H);
        var r = rng(7);
        for (var i = 0; i < 60; i++) {
          var x = r() * W, y = r() * 230, s = r() * 1.6 + .5;
          c.fillStyle = r() > .7 ? '#d6a12c' : 'rgba(242,236,223,.75)';
          c.fillRect(x, y, s, s);
        }
        c.fillStyle = '#f2ecdf';
        c.beginPath();
        c.arc(240, 138, 66, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(18,17,15,.18)';
        c.beginPath(); c.arc(222, 118, 13, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(262, 152, 9, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(236, 172, 6, 0, Math.PI * 2); c.fill();
        text(c, 'WANING GIBBOUS', 240, 246, '10px "Consolas", monospace', 'rgba(242,236,223,.8)', 'center', '3px');
        text(c, '88% / 03:12', 240, 264, '10px "Consolas", monospace', 'rgba(242,236,223,.4)', 'center', '2px');
      }
    },

    /* 4 — profile card */
    {
      id: 'profile', label: 'PROFILE',
      draw: function (c) {
        c.fillStyle = '#f2ecdf';
        c.fillRect(0, 0, W, H);
        c.fillStyle = '#c8452b';
        c.fillRect(0, 0, 6, H);
        text(c, 'LINE ZHI XIA', 32, 74, '600 30px "Bahnschrift", sans-serif', '#12110f', 'left', '3px');
        text(c, '林知夏 / 产品设计师', 32, 106, '13px "Noto Sans SC", sans-serif', '#12110f');
        c.fillStyle = '#12110f';
        c.fillRect(32, 126, 60, 2);
        text(c, 'slide.studio/lin', 32, 160, '11px "Consolas", monospace', 'rgba(18,17,15,.65)', 'left', '1px');
        text(c, 'NFC 轻触 · 打开这一卷', 32, 288, '11px "Noto Sans SC", sans-serif', 'rgba(18,17,15,.5)');

        var mod = 7, ox = 306, oy = 76, n = 21, r = rng(42);
        for (var yy = 0; yy < n; yy++) {
          for (var xx = 0; xx < n; xx++) {
            var finder = (xx < 7 && yy < 7) || (xx > 13 && yy < 7) || (xx < 7 && yy > 13);
            var on;
            if (finder) {
              var lx = xx % 7, ly = yy % 7;
              if (xx > 13) lx = xx - 14;
              if (yy > 13) ly = yy - 14;
              on = lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx > 1 && lx < 5 && ly > 1 && ly < 5);
            } else {
              on = r() > .5;
            }
            if (on) {
              c.fillStyle = '#12110f';
              c.fillRect(ox + xx * mod, oy + yy * mod, mod - 1, mod - 1);
            }
          }
        }
      }
    },

    /* 5 — weather */
    {
      id: 'weather', label: 'WEATHER',
      draw: function (c) {
        c.fillStyle = '#f2ecdf';
        c.fillRect(0, 0, W, H);
        text(c, '深圳 / SHENZHEN', 26, 44, '10px "Consolas", monospace', 'rgba(18,17,15,.6)', 'left', '2px');
        text(c, '24°', 20, 200, '600 150px "Bahnschrift", sans-serif', '#12110f');
        text(c, '晴 · 微风', 30, 238, '17px "Noto Sans SC", sans-serif', '#12110f');
        c.fillStyle = '#d6a12c';
        c.beginPath(); c.arc(400, 108, 34, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#d6a12c';
        c.lineWidth = 2;
        for (var i = 0; i < 8; i++) {
          var a = i * Math.PI / 4;
          c.beginPath();
          c.moveTo(400 + Math.cos(a) * 46, 108 + Math.sin(a) * 46);
          c.lineTo(400 + Math.cos(a) * 56, 108 + Math.sin(a) * 56);
          c.stroke();
        }
        var days = ['一', '二', '三', '四', '五'];
        var vals = [.62, .48, .74, .56, .4];
        for (var d = 0; d < 5; d++) {
          var bx = 30 + d * 44, by = 280;
          c.fillStyle = 'rgba(18,17,15,.12)';
          c.fillRect(bx, by - 44, 22, 44);
          c.fillStyle = d === 4 ? '#c8452b' : '#2f5590';
          c.fillRect(bx, by - 44 * vals[d], 22, 44 * vals[d]);
          text(c, days[d], bx + 11, by + 16, '10px "Noto Sans SC", sans-serif', 'rgba(18,17,15,.55)', 'center');
        }
      }
    },

    /* 6 — colour bars */
    {
      id: 'bars', label: 'COLOUR CHECK',
      draw: function (c) {
        var cols = ['#f2ecdf', '#d6a12c', '#c8452b', '#3a6b52', '#2f5590', '#12110f'];
        var bw = W / 6;
        for (var i = 0; i < 6; i++) {
          c.fillStyle = cols[i];
          c.fillRect(i * bw, 0, bw, 214);
        }
        c.fillStyle = '#12110f';
        c.fillRect(0, 214, W, 106);
        for (var g = 0; g < 6; g++) {
          var v = Math.round(255 * (1 - g / 6));
          c.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
          c.fillRect(16 + g * 34, 236, 24, 24);
        }
        text(c, 'SLIDE 01 / COLOR CHECK', 240, 292, '10px "Consolas", monospace', 'rgba(242,236,223,.55)', 'center', '3px');
        text(c, '48 COLORS · 3.0 S', 240, 308, '9px "Consolas", monospace', 'rgba(242,236,223,.3)', 'center', '2px');
      }
    },

    /* 7 — blueprint */
    {
      id: 'blueprint', label: 'BLUEPRINT',
      draw: function (c) {
        c.fillStyle = '#12233d';
        c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(230,237,242,.13)';
        c.lineWidth = 1;
        for (var x = 0; x < W; x += 24) {
          c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke();
        }
        for (var y = 0; y < H; y += 24) {
          c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
        }
        c.strokeStyle = '#e6edf2';
        c.lineWidth = 2;
        roundRect(c, 96, 96, 288, 128, 10);
        c.stroke();
        c.strokeStyle = '#86a9c2';
        c.lineWidth = 1.4;
        c.strokeRect(112, 112, 256, 96);
        c.beginPath();
        c.moveTo(96, 60); c.lineTo(96, 96); c.moveTo(384, 60); c.lineTo(384, 96);
        c.stroke();
        text(c, '62.0', 240, 88, '11px "Consolas", monospace', '#86a9c2', 'center', '2px');
        text(c, '44.0', 408, 166, '11px "Consolas", monospace', '#86a9c2', 'center', '2px');
        text(c, 'SLIDE 01 — FRONT / 1:1', 24, 40, '10px "Consolas", monospace', '#86a9c2', 'left', '2px');
        text(c, '6063 AL · 9.8 MM', 456, 300, '9px "Consolas", monospace', 'rgba(230,237,242,.5)', 'right', '2px');
        c.fillStyle = '#c8452b';
        c.beginPath(); c.arc(356, 160, 5, 0, Math.PI * 2); c.fill();
      }
    },

    /* 8 — receipt */
    {
      id: 'receipt', label: 'RECEIPT',
      draw: function (c) {
        c.fillStyle = '#12110f';
        c.fillRect(0, 0, W, H);
        c.fillStyle = '#f2ecdf';
        c.fillRect(126, 26, 228, 268);
        c.beginPath();
        c.moveTo(126, 294);
        for (var i = 0; i <= 12; i++) {
          c.lineTo(126 + i * 19, 294 + (i % 2 ? 8 : 0));
        }
        c.lineTo(354, 294);
        c.lineTo(354, 320);
        c.lineTo(126, 320);
        c.fill();
        var lines = [
          ['SLIDE 01', '1'],
          ['磁吸面板', '2'],
          ['桌面底座', '1'],
          ['挂绳', '1'],
          ['', ''],
          ['TOTAL', '$69.00']
        ];
        for (var l = 0; l < lines.length; l++) {
          var ly = 74 + l * 24;
          text(c, lines[l][0], 146, ly, '11px "Consolas", monospace', '#12110f', 'left', '1px');
          text(c, lines[l][1], 334, ly, '11px "Consolas", monospace', '#12110f', 'right', '1px');
        }
        c.fillStyle = '#12110f';
        c.fillRect(146, 210, 188, 1);
        text(c, '2026.11.05  22:14', 146, 232, '9px "Consolas", monospace', 'rgba(18,17,15,.6)', 'left', '1px');
        c.strokeStyle = '#c8452b';
        c.lineWidth = 2;
        c.beginPath(); c.arc(300, 262, 28, 0, Math.PI * 2); c.stroke();
        text(c, 'PAID', 300, 267, '600 12px "Bahnschrift", sans-serif', '#c8452b', 'center', '3px');
      }
    },

    /* 9 — poem */
    {
      id: 'poem', label: 'POEM',
      draw: function (c) {
        c.fillStyle = '#f2ecdf';
        c.fillRect(0, 0, W, H);
        c.fillStyle = '#12110f';
        c.fillRect(0, 0, W, 6);
        var cols = ['山中何事', '松花酿酒', '春水煎茶'];
        for (var i = 0; i < cols.length; i++) {
          var x = 392 - i * 62;
          for (var j = 0; j < cols[i].length; j++) {
            text(c, cols[i][j], x, 70 + j * 44, '600 32px "Noto Serif SC", "SimSun", serif', '#12110f', 'center');
          }
        }
        c.fillStyle = '#c8452b';
        c.fillRect(176, 240, 26, 26);
        text(c, '印', 189, 259, '14px "Noto Serif SC", serif', '#f2ecdf', 'center');
        text(c, '— 张可久', 34, 300, '11px "Noto Serif SC", serif', 'rgba(18,17,15,.55)');
        text(c, 'POEM / 09', 456, 300, '9px "Consolas", monospace', 'rgba(18,17,15,.4)', 'right', '2px');
      }
    },

    /* 10 — map */
    {
      id: 'map', label: 'MAP',
      draw: function (c) {
        c.fillStyle = '#f2ecdf';
        c.fillRect(0, 0, W, H);
        c.strokeStyle = '#3a6b52';
        var r = rng(11);
        for (var i = 0; i < 15; i++) {
          c.beginPath();
          c.lineWidth = i % 5 === 0 ? 2 : .9;
          c.strokeStyle = i % 5 === 0 ? '#12110f' : 'rgba(58,107,82,.75)';
          for (var a = 0; a <= 48; a++) {
            var ang = a / 48 * Math.PI * 2;
            var rad = 26 + i * 9 + Math.sin(ang * 3 + i) * (6 + i * .7);
            var px = 214 + Math.cos(ang) * rad * 1.35;
            var py = 160 + Math.sin(ang) * rad * .92;
            if (a === 0) c.moveTo(px, py); else c.lineTo(px, py);
          }
          c.closePath();
          c.stroke();
        }
        c.strokeStyle = '#c8452b';
        c.lineWidth = 2.4;
        c.beginPath();
        c.moveTo(96, 262);
        c.bezierCurveTo(160, 230, 190, 200, 232, 176);
        c.bezierCurveTo(280, 148, 330, 128, 380, 74);
        c.stroke();
        c.fillStyle = '#c8452b';
        c.beginPath(); c.arc(96, 262, 5, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(380, 74, 5, 0, Math.PI * 2); c.fill();
        text(c, 'N 22°32′  E 114°03′', 24, 34, '10px "Consolas", monospace', '#12110f', 'left', '2px');
      }
    },

    /* 11 — night */
    {
      id: 'night', label: 'NIGHT',
      draw: function (c) {
        c.fillStyle = '#12110f';
        c.fillRect(0, 0, W, H);
        var r = rng(99);
        for (var i = 0; i < 40; i++) {
          c.fillStyle = 'rgba(242,236,223,' + (r() * .5 + .2) + ')';
          c.fillRect(r() * W, r() * 120, 1.4, 1.4);
        }
        var bx = [24, 96, 176, 262, 344, 414];
        var bw = [58, 66, 70, 62, 54, 50];
        for (var b = 0; b < 6; b++) {
          var hgt = 90 + (b % 3) * 46;
          c.fillStyle = '#f2ecdf';
          c.fillRect(bx[b], H - hgt, bw[b], hgt);
          for (var wy = 0; wy < Math.floor(hgt / 18); wy++) {
            for (var wx = 0; wx < Math.floor(bw[b] / 16); wx++) {
              if (r() > .45) {
                c.fillStyle = r() > .8 ? '#d6a12c' : '#12110f';
                c.fillRect(bx[b] + 6 + wx * 16, H - hgt + 10 + wy * 18, 6, 7);
              }
            }
          }
        }
        c.fillStyle = '#c8452b';
        c.fillRect(150, 120, 30, 108);
        text(c, '夜', 165, 158, '600 17px "Noto Serif SC", serif', '#f2ecdf', 'center');
        text(c, '宵', 165, 186, '600 17px "Noto Serif SC", serif', '#f2ecdf', 'center');
        text(c, '23:58', 456, 292, '10px "Consolas", monospace', 'rgba(242,236,223,.55)', 'right', '2px');
      }
    }
  ];

  /* tone curves compensate for palettes with very few levels */
  var TONE = {
    news:      { gamma: 0.66, lift: 8 },
    blueprint: { gamma: 0.86, lift: 0 },
    sepia:     { gamma: 0.82, lift: 4 },
    mud:       { gamma: 0.9, lift: 0 },
    neon:      { gamma: 1.0, lift: 0 }
  };

  function luts(tone) {
    var g = tone && tone.gamma || 1;
    var lift = tone && tone.lift || 0;
    var out = new Uint8ClampedArray(256);
    for (var i = 0; i < 256; i++) {
      out[i] = Math.max(0, Math.min(255, Math.pow(i / 255, g) * 255 + lift));
    }
    return out;
  }

  /* ---------------- dithering ---------------- */

  function quantize(ctx, w, h, palette, strength, tone) {
    var img = ctx.getImageData(0, 0, w, h);
    var d = img.data;
    var rgb = palette.map(hexToRgb);
    var spread = strength || 44;
    var lut = luts(tone);

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4;
        var o = (BAYER[y & 3][x & 3] / 16 - .5) * spread;
        var pr = lut[d[i]] + o, pg = lut[d[i + 1]] + o, pb = lut[d[i + 2]] + o;
        var best = 0, bestD = Infinity;
        for (var p = 0; p < rgb.length; p++) {
          var dr = pr - rgb[p][0], dg = pg - rgb[p][1], db = pb - rgb[p][2];
          var dist = dr * dr * .32 + dg * dg * .5 + db * db * .18;
          if (dist < bestD) { bestD = dist; best = p; }
        }
        d[i] = rgb[best][0];
        d[i + 1] = rgb[best][1];
        d[i + 2] = rgb[best][2];
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /* ---------------- public API ---------------- */

  var off = null;
  function offscreen() {
    if (!off) {
      off = document.createElement('canvas');
      off.width = W;
      off.height = H;
    }
    return off;
  }

  /* render a scene, crop a region, quantise into the target canvas */
  function paintCrop(canvas, sceneIndex, preset, crop, opts) {
    var idx = ((sceneIndex % SCENES.length) + SCENES.length) % SCENES.length;
    var scene = SCENES[idx];
    var pal = PALETTES[preset] || PALETTES.spectra;
    var o = offscreen();
    var octx = o.getContext('2d', { willReadFrequently: true });
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, W, H);
    scene.draw(octx, W, H);

    var cw = crop && crop.w ? crop.w : W;
    var ch = crop && crop.h ? crop.h : H;
    var cx = crop && crop.x ? crop.x : 0;
    var cy = crop && crop.y ? crop.y : 0;
    var scale = (opts && opts.scale) || 2;

    canvas.width = Math.round(cw * scale);
    canvas.height = Math.round(ch * scale);
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(o, cx, cy, cw, ch, 0, 0, canvas.width, canvas.height);
    quantize(ctx, canvas.width, canvas.height, pal, 44 * scale, TONE[preset] || null);
  }

  function paint(canvas, sceneIndex, preset, opts) {
    var idx = ((sceneIndex % SCENES.length) + SCENES.length) % SCENES.length;
    var scene = SCENES[idx];
    var pal = PALETTES[preset] || PALETTES.spectra;
    var scale = (opts && opts.scale) || 1;
    var w = W * scale, h = H * scale;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    scene.draw(ctx, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    quantize(ctx, w, h, pal, (preset === 'news' ? 54 : 44) * scale, TONE[preset] || null);
  }

  global.SLIDE_ART = {
    W: W, H: H,
    PALETTES: PALETTES,
    SCENES: SCENES,
    paint: paint,
    paintCrop: paintCrop
  };
})(window);
