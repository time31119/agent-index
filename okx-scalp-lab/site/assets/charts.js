/* Canvas charts — hand-built, dependency-free, retina aware. */
(function () {
  'use strict';

  const C = {
    ink: '#eef2e9',
    muted: '#8b958c',
    dim: '#5e675f',
    line: 'rgba(224,240,223,0.11)',
    lineStrong: 'rgba(224,240,223,0.20)',
    lime: '#c9ff4a',
    red: '#ff5d6c',
    cyan: '#65e6ff',
    amber: '#ffb454',
    violet: '#b9a2ff',
    green: '#74f5a8',
    grid: 'rgba(224,240,223,0.075)',
    bg: '#0b0e0c'
  };

  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function prep(canvas, fromParent) {
    const parent = canvas.parentElement;
    const w = Math.max(40, fromParent === false ? (canvas.clientWidth || parent.clientWidth) : parent.clientWidth);
    const h = Math.max(18, fromParent === false ? (canvas.clientHeight || parent.clientHeight) : parent.clientHeight);
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    if (fromParent !== false) {
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { ctx, w, h };
  }

  function fmtPrice(v) {
    if (v == null || !isFinite(v)) return '—';
    const a = Math.abs(v);
    if (a >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    if (a >= 10) return v.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    if (a >= 1) return v.toFixed(3);
    return v.toFixed(5);
  }

  function fmtPct(v, digits = 2) {
    if (v == null || !isFinite(v)) return '—';
    return (v > 0 ? '+' : '') + v.toFixed(digits) + '%';
  }

  function fmtCompact(v) {
    if (!isFinite(v)) return '—';
    const a = Math.abs(v);
    if (a >= 1e9) return (v / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return (v / 1e6).toFixed(2) + 'M';
    if (a >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    return v.toFixed(0);
  }

  function tsLabel(t, withTime) {
    const d = new Date(t);
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    if (!withTime) return mm + '/' + dd;
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mi = String(d.getUTCMinutes()).padStart(2, '0');
    return mm + '/' + dd + ' ' + hh + ':' + mi;
  }

  function tooltipEl(canvas) {
    const parent = canvas.parentElement;
    let tip = parent.querySelector('.chart-tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tip';
      parent.appendChild(tip);
    }
    return tip;
  }

  function showTip(tip, x, y, html, parent) {
    tip.innerHTML = html;
    tip.style.opacity = '1';
    const tw = tip.offsetWidth;
    const ph = parent.clientWidth;
    let left = x + 14;
    if (left + tw > ph - 8) left = x - tw - 14;
    if (left < 8) left = 8;
    let top = y - 16;
    if (top < 8) top = 8;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function hideTip(tip) { tip.style.opacity = '0'; }

  function pathSeries(ctx, series, xOf, yOf, w, h) {
    let started = false;
    ctx.beginPath();
    for (let i = 0; i < series.data.length; i++) {
      const p = series.data[i];
      if (!p || p.v == null || !isFinite(p.v)) { started = false; continue; }
      const x = xOf(p.t), y = yOf(p.v);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    }
  }

  function lineChart(canvas, series, opts) {
    opts = opts || {};
    const draw = () => {
      const { ctx, w, h } = prep(canvas);
      const all = series.filter(s => s.visible !== false);
      if (!all.length) return;
      const pad = { l: opts.padLeft || 48, r: 14, t: 14, b: 26 };
      const iw = w - pad.l - pad.r;
      const ih = h - pad.t - pad.b;
      let minT = Infinity, maxT = -Infinity, minV = Infinity, maxV = -Infinity;
      all.forEach(s => s.data.forEach(p => {
        if (p && p.v != null && isFinite(p.v)) {
          minT = Math.min(minT, p.t); maxT = Math.max(maxT, p.t);
          minV = Math.min(minV, p.v); maxV = Math.max(maxV, p.v);
        }
      }));
      if (!isFinite(minV)) return;
      if (opts.baseline != null) { minV = Math.min(minV, opts.baseline); maxV = Math.max(maxV, opts.baseline); }
      const span = maxV - minV || 1;
      minV -= span * 0.08; maxV += span * 0.08;
      const xOf = t => pad.l + (t - minT) / (maxT - minT || 1) * iw;
      const yOf = v => pad.t + (maxV - v) / (maxV - minV || 1) * ih;

      ctx.clearRect(0, 0, w, h);
      // grid
      ctx.font = '9px "Cascadia Code", Consolas, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const ticks = 4;
      for (let i = 0; i <= ticks; i++) {
        const v = minV + (maxV - minV) * i / ticks;
        const y = yOf(v);
        ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, y + .5); ctx.lineTo(w - pad.r, y + .5); ctx.stroke();
        ctx.fillStyle = C.dim;
        ctx.fillText(opts.yFmt ? opts.yFmt(v) : v.toFixed(1), pad.l - 8, y);
      }
      // baseline
      if (opts.baseline != null) {
        const y = yOf(opts.baseline);
        ctx.strokeStyle = 'rgba(224,240,223,0.26)';
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
        ctx.setLineDash([]);
      }
      // x labels
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let i = 0; i <= 4; i++) {
        const t = minT + (maxT - minT) * i / 4;
        const x = xOf(t);
        ctx.fillStyle = C.dim;
        ctx.fillText(tsLabel(t, false), x, h - pad.b + 8);
      }
      // series
      all.forEach((s, idx) => {
        if (s.area) {
          pathSeries(ctx, s, xOf, yOf, w, h);
          ctx.lineTo(xOf(s.data[s.data.length - 1].t), yOf(opts.baseline != null ? opts.baseline : minV));
          ctx.lineTo(xOf(s.data[0].t), yOf(opts.baseline != null ? opts.baseline : minV));
          ctx.closePath();
          const g = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
          g.addColorStop(0, hexA(s.color || C.lime, 0.18));
          g.addColorStop(1, hexA(s.color || C.lime, 0));
          ctx.fillStyle = g; ctx.fill();
        }
        pathSeries(ctx, s, xOf, yOf, w, h);
        ctx.strokeStyle = s.color || C.lime;
        ctx.lineWidth = s.width || (idx === 0 ? 2 : 1.25);
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        if (s.dash) ctx.setLineDash(s.dash); else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      // hover
      if (!canvas._tip) canvas._tip = tooltipEl(canvas);
      const tip = canvas._tip;
      if (!canvas._hoverBound) {
        canvas._hoverBound = true;
        const parent = canvas.parentElement;
        canvas.addEventListener('pointermove', ev => {
          const r = canvas.getBoundingClientRect();
          const px = ev.clientX - r.left;
          const py = ev.clientY - r.top;
          const idx = Math.max(0, Math.min(1, (px - pad.l) / iw));
          const t = minT + idx * (maxT - minT);
          let nearest = null, best = Infinity;
          all.forEach(s => s.data.forEach(p => {
            if (p && isFinite(p.v) && Math.abs(p.t - t) < best) { best = Math.abs(p.t - t); nearest = p; }
          }));
          if (!nearest) return;
          draw();
          const hx = xOf(nearest.t), hy = yOf(nearest.v);
          ctx.strokeStyle = 'rgba(238,242,233,.35)';
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(hx, pad.t); ctx.lineTo(hx, h - pad.b); ctx.stroke();
          ctx.setLineDash([]);
          let html = '<b>' + tsLabel(nearest.t, true) + ' UTC</b>';
          all.forEach(s => {
            let p = null, bd = Infinity;
            s.data.forEach(q => {
              if (q && isFinite(q.v) && Math.abs(q.t - nearest.t) < bd) { bd = Math.abs(q.t - nearest.t); p = q; }
            });
            if (p) {
              ctx.fillStyle = s.color || C.lime;
              ctx.beginPath(); ctx.arc(xOf(p.t), yOf(p.v), 2.5, 0, Math.PI * 2); ctx.fill();
              html += '<br><span style="color:' + (s.color || C.lime) + '">●</span> ' + s.name + ' <b>' + (opts.valFmt ? opts.valFmt(p.v) : p.v.toFixed(2)) + '</b>';
            }
          });
          showTip(tip, px, py, html, parent);
        });
        canvas.addEventListener('pointerleave', () => hideTip(tip));
      }
    };
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas.parentElement);
    canvas._redraw = draw;
    return { redraw: draw };
  }

  function sparkline(canvas, values, color, opts) {
    opts = opts || {};
    const draw = () => {
      const { ctx, w, h } = prep(canvas, false);
      const vals = values.filter(v => v != null && isFinite(v));
      if (vals.length < 2) return;
      const min = Math.min(...vals), max = Math.max(...vals);
      const span = max - min || 1;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      vals.forEach((v, i) => {
        const x = 1 + i / (vals.length - 1) * (w - 2);
        const y = 2 + (max - v) / span * (h - 4);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      if (opts.fill !== false) {
        const lastX = w - 1, lastY = h;
        ctx.lineTo(lastX, lastY); ctx.lineTo(1, lastY); ctx.closePath();
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, hexA(color || C.lime, .16));
        g.addColorStop(1, hexA(color || C.lime, 0));
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath();
        vals.forEach((v, i) => {
          const x = 1 + i / (vals.length - 1) * (w - 2);
          const y = 2 + (max - v) / span * (h - 4);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
      }
      ctx.strokeStyle = color || C.lime;
      ctx.lineWidth = opts.width || 1.4;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.stroke();
      // endpoint
      if (opts.dot !== false) {
        const x = w - 1, y = 2 + (max - vals[vals.length - 1]) / span * (h - 4);
        ctx.fillStyle = color || C.lime;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    };
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas.parentElement);
    return { redraw: draw };
  }

  function scatterChart(canvas, points, opts) {
    opts = opts || {};
    const draw = () => {
      const { ctx, w, h } = prep(canvas);
      const pad = { l: 46, r: 28, t: 18, b: 30 };
      const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
      const xs = points.map(p => Math.abs(p.x));
      const ys = points.map(p => p.y);
      const xMax = Math.max(...xs) * 1.14 || 1;
      const yMin = Math.min(0, ...ys), yMax = Math.max(...ys) * 1.14 || 1;
      const X = v => pad.l + v / xMax * iw;
      const Y = v => pad.t + (yMax - v) / (yMax - yMin || 1) * ih;
      ctx.clearRect(0, 0, w, h);
      ctx.font = '9px "Cascadia Code", Consolas, monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let i = 0; i <= 4; i++) {
        const v = yMin + (yMax - yMin) * i / 4;
        const y = Y(v);
        ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad.l, y + .5); ctx.lineTo(w - pad.r, y + .5); ctx.stroke();
        ctx.fillStyle = C.dim; ctx.fillText(v.toFixed(0) + '%', pad.l - 7, y);
      }
      for (let i = 0; i <= 4; i++) {
        const v = xMax * i / 4;
        const x = X(v);
        ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x + .5, pad.t); ctx.lineTo(x + .5, h - pad.b); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillStyle = C.dim; ctx.fillText(v.toFixed(0) + '%', x, h - pad.b + 8);
      }
      ctx.fillStyle = C.dim; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('↑ 净收益', pad.l, 2);
      ctx.textAlign = 'right'; ctx.fillText('最大回撤 →', w - 4, h - 12);
      if (yMin < 0 && yMax > 0) {
        ctx.strokeStyle = 'rgba(224,240,223,.24)';
        ctx.beginPath(); ctx.moveTo(pad.l, Y(0)); ctx.lineTo(w - pad.r, Y(0)); ctx.stroke();
      }
      const tip = tooltipEl(canvas);
      points.forEach((p, idx) => {
        const x = X(Math.abs(p.x)), y = Y(p.y);
        ctx.fillStyle = hexA(p.color || C.lime, .18);
        ctx.beginPath(); ctx.arc(x, y, p.rank <= 3 ? 14 : 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.color || C.lime;
        ctx.beginPath(); ctx.arc(x, y, p.rank <= 3 ? 4.2 : 3.2, 0, Math.PI * 2); ctx.fill();
        if (p.rank <= 3) {
          ctx.fillStyle = C.ink;
          ctx.font = '10px "Cascadia Code", Consolas, monospace';
          ctx.textAlign = x > w * .7 ? 'right' : 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText('#' + p.rank + ' ' + p.label, x + (x > w * .7 ? -8 : 8), y - 7);
        }
      });
      canvas.onpointermove = ev => {
        const r = canvas.getBoundingClientRect();
        const mx = ev.clientX - r.left, my = ev.clientY - r.top;
        let best = null, bd = 18 * 18;
        points.forEach(p => {
          const dx = mx - X(Math.abs(p.x)), dy = my - Y(p.y);
          const d = dx * dx + dy * dy;
          if (d < bd) { bd = d; best = p; }
        });
        if (!best) { hideTip(tip); return; }
        showTip(tip, mx, my,
          '<b>#' + best.rank + ' ' + best.label + '</b><br>净收益 <b>' + fmtPct(best.y) + '</b><br>最大回撤 <b>' + best.x.toFixed(1) + '%</b>',
          canvas.parentElement);
      };
      canvas.onpointerleave = () => hideTip(tip);
    };
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas.parentElement);
    return { redraw: draw };
  }

  function candleChart(canvas, payload, opts) {
    opts = opts || {};
    const state = Object.assign({ ema: true, bb: false, st: false, vol: true }, opts.initial || {});
    const draw = () => {
      const { ctx, w, h } = prep(canvas);
      const candles = payload.candles;
      if (!candles || !candles.length) return;
      const pad = { l: 10, r: 54, t: 12, b: 22 };
      const volH = state.vol ? Math.min(64, h * .18) : 0;
      const priceH = h - pad.t - pad.b - volH - (state.vol ? 8 : 0);
      const iw = w - pad.l - pad.r;
      let hi = -Infinity, lo = Infinity;
      candles.forEach(c => { hi = Math.max(hi, c.h); lo = Math.min(lo, c.l); });
      if (state.bb) {
        payload.bbUpper.forEach(v => { if (isFinite(v)) hi = Math.max(hi, v); });
        payload.bbLower.forEach(v => { if (isFinite(v)) lo = Math.min(lo, v); });
      }
      const span = hi - lo || 1;
      hi += span * .06; lo -= span * .06;
      const n = candles.length;
      const cw = Math.max(1.5, Math.min(8, iw / n * .66));
      const X = i => pad.l + (i + .5) / n * iw;
      const Y = v => pad.t + (hi - v) / (hi - lo) * priceH;
      const maxVol = Math.max(...candles.map(c => c.v), 1);
      const VY = v => h - pad.b - (v / maxVol) * volH;

      ctx.clearRect(0, 0, w, h);
      // grid / price labels
      ctx.font = '9px "Cascadia Code", Consolas, monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      for (let i = 0; i <= 4; i++) {
        const v = lo + (hi - lo) * i / 4;
        const y = Y(v);
        ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad.l, y + .5); ctx.lineTo(w - pad.r, y + .5); ctx.stroke();
        ctx.fillStyle = C.dim; ctx.fillText(fmtPrice(v), w - pad.r + 7, y);
      }
      // time labels
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let i = 0; i <= 3; i++) {
        const idx = Math.round(i / 3 * (n - 1));
        ctx.fillStyle = C.dim;
        ctx.fillText(tsLabel(candles[idx].t, true), X(idx), h - pad.b + 7);
      }
      // volume
      if (state.vol) {
        candles.forEach((c, i) => {
          ctx.fillStyle = c.c >= c.o ? 'rgba(201,255,74,.22)' : 'rgba(255,93,108,.22)';
          const x = X(i) - cw / 2;
          ctx.fillRect(x, VY(c.v), cw, h - pad.b - VY(c.v));
        });
      }
      // candles
      candles.forEach((c, i) => {
        const x = X(i);
        const up = c.c >= c.o;
        ctx.strokeStyle = up ? C.lime : C.red;
        ctx.fillStyle = up ? 'rgba(201,255,74,.14)' : 'rgba(255,93,108,.16)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, Y(c.h)); ctx.lineTo(x, Y(c.l)); ctx.stroke();
        const top = Y(Math.max(c.o, c.c)), bot = Y(Math.min(c.o, c.c));
        const bh = Math.max(1, bot - top);
        ctx.fillRect(x - cw / 2, top, cw, bh);
        ctx.strokeRect(x - cw / 2, top, cw, bh);
      });
      // overlays
      if (state.ema) {
        drawLine(payload.ema9, C.cyan, 1.5);
        drawLine(payload.ema21, C.amber, 1.2);
        drawLine(payload.ema55, C.violet, 1.1);
      }
      if (state.bb) {
        drawLine(payload.bbUpper, 'rgba(255,255,255,.32)', 1, [3, 3]);
        drawLine(payload.bbMid, 'rgba(255,255,255,.22)', 1, [2, 4]);
        drawLine(payload.bbLower, 'rgba(255,255,255,.32)', 1, [3, 3]);
      }
      if (state.st) {
        // draw segments by direction
        for (let i = 1; i < n; i++) {
          if (!isFinite(payload.stVal[i]) || !isFinite(payload.stVal[i - 1])) continue;
          ctx.strokeStyle = payload.stDir[i] > 0 ? C.green : C.red;
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(X(i - 1), Y(payload.stVal[i - 1])); ctx.lineTo(X(i), Y(payload.stVal[i])); ctx.stroke();
        }
      }
      function drawLine(arr, color, width, dash) {
        if (!arr) return;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < arr.length; i++) {
          const v = arr[i];
          if (!isFinite(v)) { started = false; continue; }
          const x = X(i), y = Y(v);
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color; ctx.lineWidth = width || 1;
        if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
        ctx.stroke(); ctx.setLineDash([]);
      }
      // crosshair
      const tip = tooltipEl(canvas);
      canvas.onpointermove = ev => {
        const r = canvas.getBoundingClientRect();
        const mx = ev.clientX - r.left, my = ev.clientY - r.top;
        let idx = Math.round((mx - pad.l) / iw * n - .5);
        idx = Math.max(0, Math.min(n - 1, idx));
        const c = candles[idx];
        if (!c) return;
        draw();
        const x = X(idx);
        ctx.strokeStyle = 'rgba(238,242,233,.30)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = c.c >= c.o ? C.lime : C.red;
        ctx.beginPath(); ctx.arc(x, Y(c.c), 2.5, 0, Math.PI * 2); ctx.fill();
        const chg = (c.c / c.o - 1) * 100;
        showTip(tip, mx, my,
          '<b>' + tsLabel(c.t, true) + ' UTC</b><br>' +
          'O <b>' + fmtPrice(c.o) + '</b>  H <b>' + fmtPrice(c.h) + '</b><br>' +
          'L <b>' + fmtPrice(c.l) + '</b>  C <b>' + fmtPrice(c.c) + '</b><br>' +
          '涨跌 <b style="color:' + (chg >= 0 ? C.lime : C.red) + '">' + fmtPct(chg) + '</b>  量 <b>' + fmtCompact(c.v) + '</b>',
          canvas.parentElement);
      };
      canvas.onpointerleave = () => hideTip(tip);
    };
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas.parentElement);
    return {
      redraw: draw,
      set(key, val) { state[key] = val; draw(); },
      state
    };
  }

  function hexA(hex, a) {
    if (hex.startsWith('rgb')) return hex;
    const h = hex.replace('#', '');
    const n = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
    const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  window.LabCharts = { lineChart, sparkline, scatterChart, candleChart, fmtPrice, fmtPct, fmtCompact, tsLabel };
})();
