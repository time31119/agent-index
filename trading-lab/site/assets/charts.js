/* ============================================================
 * charts.js — 零依赖 SVG 图表：折线/面积、柱状、散点、价格+买卖点
 * ============================================================ */
(function (global) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const C = { gold: '#d9b26a', gold2: '#f0d49a', up: '#f0564a', down: '#2ecc8f', blue: '#5aa9ff', purple: '#a78bfa', muted: '#94a3b8', line: 'rgba(255,255,255,.09)', dim: '#64748b' };
  const fmt = (v, d) => (v === null || v === undefined || Number.isNaN(v)) ? '—' : (v >= 0 ? '+' : '') + (v * 100).toFixed(d === undefined ? 1 : d) + '%';

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function niceTicks(min, max, n) {
    if (max === min) { max = min + 1; }
    const span = max - min, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const norm = step0 / mag;
    let step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
    const start = Math.floor(min / step) * step, out = [];
    for (let v = start; v <= max + step * .0001; v += step) out.push(+v.toFixed(10));
    return out;
  }
  function ensureSvg(div, h) {
    const w = div.clientWidth || 640;
    div.innerHTML = '';
    const svg = el('svg', { class: 'chart', viewBox: `0 0 ${w} ${h}`, height: h, preserveAspectRatio: 'none' });
    div.appendChild(svg);
    return { svg, w, h };
  }
  function tooltip(div) {
    let tip = div.querySelector('.chart-tip');
    if (!tip) { tip = document.createElement('div'); tip.className = 'chart-tip'; div.appendChild(tip); }
    return tip;
  }

  // series: [{name,color,data:[[date,val],...], area?}]
  function line(div, series, opts) {
    opts = opts || {};
    const h = opts.height || 300;
    const { svg, w } = ensureSvg(div, h);
    const pad = { l: 52, r: 16, t: 16, b: 30 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const all = series.flatMap(s => s.data);
    if (!all.length) return;
    const x0 = all[0][0], x1 = all[all.length - 1][0];
    let ymin = Infinity, ymax = -Infinity;
    all.forEach(p => { if (p[1] < ymin) ymin = p[1]; if (p[1] > ymax) ymax = p[1]; });
    if (opts.pct) { ymin = 0; } else { ymin = Math.min(ymin, 0); }
    const padY = (ymax - ymin) * .08 || .1; ymax += padY; if (ymin < 0) ymin -= padY;
    const x = d => pad.l + (new Date(d).getTime() - new Date(x0).getTime()) / (new Date(x1).getTime() - new Date(x0).getTime() || 1) * iw;
    const y = v => pad.t + ih - (v - ymin) / (ymax - ymin) * ih;
    // grid
    niceTicks(ymin, ymax, 4).forEach(v => {
      el('line', { x1: pad.l, x2: w - pad.r, y1: y(v), y2: y(v), stroke: C.line }, svg);
      const t = el('text', { x: pad.l - 8, y: y(v) + 4, 'text-anchor': 'end', fill: C.dim, 'font-size': 10.5, 'font-family': 'monospace' }, svg);
      t.textContent = opts.pct ? (v * 100).toFixed(0) + '%' : v.toFixed(opts.dec || 0);
    });
    // x ticks
    const years = new Date(x1).getFullYear() - new Date(x0).getFullYear();
    const stepY = years > 14 ? 4 : years > 8 ? 2 : 1;
    let lastY = null;
    all.forEach(p => {
      const yy = new Date(p[0]).getFullYear();
      if (yy % stepY === 0 && yy !== lastY) {
        lastY = yy;
        el('line', { x1: x(p[0]), x2: x(p[0]), y1: pad.t, y2: h - pad.b, stroke: 'rgba(255,255,255,.04)' }, svg);
        const t = el('text', { x: x(p[0]), y: h - 10, 'text-anchor': 'middle', fill: C.dim, 'font-size': 10.5 }, svg);
        t.textContent = yy;
      }
    });
    series.forEach(s => {
      const pts = s.data.map(p => `${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join(' ');
      if (s.area) {
        const gid = 'g' + Math.random().toString(36).slice(2, 7);
        const defs = el('defs', {}, svg);
        const lg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        el('stop', { offset: '0%', 'stop-color': s.color, 'stop-opacity': .22 }, lg);
        el('stop', { offset: '100%', 'stop-color': s.color, 'stop-opacity': 0 }, lg);
        const base = s.base === undefined ? ymin : s.base;
        el('polygon', { points: `${x(s.data[0][0])},${y(base)} ${pts} ${x(s.data[s.data.length - 1][0])},${y(base)}`, fill: `url(#${gid})` }, svg);
      }
      el('polyline', { points: pts, fill: 'none', stroke: s.color, 'stroke-width': s.width || 1.8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: s.opacity || 1 }, svg);
    });
    // hover
    const overlay = el('rect', { x: pad.l, y: pad.t, width: iw, height: ih, fill: 'transparent' }, svg);
    const cross = el('line', { y1: pad.t, y2: h - pad.b, stroke: 'rgba(255,255,255,.3)', 'stroke-dasharray': '3 3', opacity: 0 }, svg);
    const tip = tooltip(div);
    overlay.addEventListener('mousemove', ev => {
      const r = svg.getBoundingClientRect();
      const mx = (ev.clientX - r.left) * (w / r.width);
      const t0 = new Date(x0).getTime(), t1 = new Date(x1).getTime();
      const td = new Date(t0 + (mx - pad.l) / iw * (t1 - t0));
      let best = null;
      series.forEach(s => {
        let bd = null, bdist = Infinity;
        s.data.forEach(p => { const d = Math.abs(new Date(p[0]) - td); if (d < bdist) { bdist = d; bd = p; } });
        if (bd) { if (!best) best = { date: bd[0], rows: [] }; best.rows.push([s.name, bd[1], s.color]); }
      });
      if (!best) return;
      cross.setAttribute('x1', x(best.date)); cross.setAttribute('x2', x(best.date)); cross.setAttribute('opacity', 1);
      tip.style.opacity = 1;
      tip.innerHTML = `<div style="color:${C.muted};margin-bottom:2px">${best.date}</div>` + best.rows.map(rr => `<div><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${rr[2]};margin-right:6px"></i>${rr[0]} <b>${opts.pct ? fmt(rr[1], 1) : rr[1].toFixed(opts.dec || 0)}</b></div>`).join('');
      const lx = x(best.date), ly = y(best.rows[0][1]);
      tip.style.left = Math.min(div.clientWidth - 150, Math.max(0, lx / w * r.width + 12)) + 'px';
      tip.style.top = Math.max(0, ly / h * r.height - 10) + 'px';
    });
    overlay.addEventListener('mouseleave', () => { cross.setAttribute('opacity', 0); tip.style.opacity = 0; });
  }

  // 年度收益柱状图 data: {year: value}
  function bars(div, data, opts) {
    opts = opts || {};
    const h = opts.height || 220;
    const { svg, w } = ensureSvg(div, h);
    const pad = { l: 48, r: 12, t: 14, b: 26 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const entries = Object.keys(data).sort();
    const vals = entries.map(k => data[k]);
    let ymin = Math.min(0, ...vals), ymax = Math.max(0, ...vals);
    const padY = (ymax - ymin) * .12 || .05; ymax += padY; ymin -= padY;
    const y = v => pad.t + ih - (v - ymin) / (ymax - ymin) * ih;
    niceTicks(ymin, ymax, 3).forEach(v => {
      el('line', { x1: pad.l, x2: w - pad.r, y1: y(v), y2: y(v), stroke: v === 0 ? 'rgba(255,255,255,.2)' : C.line }, svg);
      const t = el('text', { x: pad.l - 6, y: y(v) + 4, 'text-anchor': 'end', fill: C.dim, 'font-size': 10 }, svg);
      t.textContent = (v * 100).toFixed(0) + '%';
    });
    const bw = iw / entries.length;
    entries.forEach((k, i) => {
      const v = data[k], xx = pad.l + i * bw + bw * .18, ww = bw * .64;
      const top = Math.min(y(v), y(0)), hh = Math.abs(y(v) - y(0)) || 1;
      el('rect', { x: xx, y: top, width: ww, height: hh, rx: 2, fill: v >= 0 ? C.up : C.down, opacity: .82 }, svg);
      if (entries.length <= 16 || i % 2 === 0) {
        const t = el('text', { x: xx + ww / 2, y: h - 8, 'text-anchor': 'middle', fill: C.dim, 'font-size': 9.5 }, svg);
        t.textContent = k.slice(2);
      }
    });
    const tip = tooltip(div);
    svg.addEventListener('mousemove', ev => {
      const r = svg.getBoundingClientRect(), mx = (ev.clientX - r.left) * (w / r.width);
      const i = Math.floor((mx - pad.l) / bw);
      if (i < 0 || i >= entries.length) { tip.style.opacity = 0; return; }
      const k = entries[i], v = data[k];
      tip.style.opacity = 1;
      tip.innerHTML = `<div style="color:${C.muted}">${k} 年</div><b style="color:${v >= 0 ? C.up : C.down}">${fmt(v, 1)}</b>`;
      tip.style.left = Math.min(div.clientWidth - 90, mx + 8) + 'px';
      tip.style.top = '10px';
    });
    svg.addEventListener('mouseleave', () => { tip.style.opacity = 0; });
  }

  // 散点：参数敏感性 x=样本内年化, y=样本外年化
  function scatter(div, pts, opts) {
    opts = opts || {};
    const h = opts.height || 280;
    const { svg, w } = ensureSvg(div, h);
    const pad = { l: 56, r: 16, t: 16, b: 40 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    if (!pts || !pts.length) return;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    let xmin = Math.min(...xs, 0), xmax = Math.max(...xs), ymin = Math.min(...ys, 0), ymax = Math.max(...ys);
    const dx = (xmax - xmin) * .1 || .05, dy = (ymax - ymin) * .1 || .05;
    xmin -= dx; xmax += dx; ymin -= dy; ymax += dy;
    const x = v => pad.l + (v - xmin) / (xmax - xmin) * iw;
    const y = v => pad.t + ih - (v - ymin) / (ymax - ymin) * ih;
    niceTicks(xmin, xmax, 4).forEach(v => {
      el('line', { x1: x(v), x2: x(v), y1: pad.t, y2: h - pad.b, stroke: C.line }, svg);
      const t = el('text', { x: x(v), y: h - pad.b + 15, 'text-anchor': 'middle', fill: C.dim, 'font-size': 10 }, svg);
      t.textContent = (v * 100).toFixed(0) + '%';
    });
    niceTicks(ymin, ymax, 4).forEach(v => {
      el('line', { x1: pad.l, x2: w - pad.r, y1: y(v), y2: y(v), stroke: C.line }, svg);
      const t = el('text', { x: pad.l - 8, y: y(v) + 4, 'text-anchor': 'end', fill: C.dim, 'font-size': 10 }, svg);
      t.textContent = (v * 100).toFixed(0) + '%';
    });
    el('line', { x1: pad.l, x2: w - pad.r, y1: y(0), y2: y(0), stroke: 'rgba(255,255,255,.25)' }, svg);
    el('line', { x1: x(0), x2: x(0), y1: pad.t, y2: h - pad.b, stroke: 'rgba(255,255,255,.25)' }, svg);
    const tip = tooltip(div);
    pts.forEach(p => {
      const c = el('circle', { cx: x(p[0]), cy: y(p[1]), r: 4.5, fill: p[1] > 0 ? C.up : C.down, opacity: .78, stroke: '#0b0f17', 'stroke-width': 1 }, svg);
      c.addEventListener('mouseenter', () => {
        tip.style.opacity = 1;
        tip.innerHTML = `参数 ${opts.label ? opts.label(p) : ''}<div>样本内 ${fmt(p[0], 1)}</div><div>样本外 ${fmt(p[1], 1)}</div>`;
        tip.style.left = Math.min(div.clientWidth - 120, x(p[0]) + 8) + 'px';
        tip.style.top = Math.max(0, y(p[1]) - 44) + 'px';
      });
      c.addEventListener('mouseleave', () => { tip.style.opacity = 0; });
    });
    const tx = el('text', { x: pad.l + iw / 2, y: h - 4, 'text-anchor': 'middle', fill: C.dim, 'font-size': 10.5 }, svg);
    tx.textContent = '样本内年化收益 (2005–2015)';
    const ty = el('text', { x: 12, y: pad.t + ih / 2, 'text-anchor': 'middle', fill: C.dim, 'font-size': 10.5, transform: `rotate(-90 12 ${pad.t + ih / 2})` }, svg);
    ty.textContent = '样本外年化收益 (2016–今)';
  }

  // 价格折线 + 买卖点
  function price(div, pts, trades, opts) {
    opts = opts || {};
    const h = opts.height || 280;
    const { svg, w } = ensureSvg(div, h);
    const pad = { l: 58, r: 14, t: 16, b: 28 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    if (!pts.length) return;
    const x0 = pts[0][0], x1 = pts[pts.length - 1][0];
    let ymin = Math.min(...pts.map(p => p[1])), ymax = Math.max(...pts.map(p => p[1]));
    const d = (ymax - ymin) * .06 || 1; ymin -= d; ymax += d;
    const x = v => pad.l + (new Date(v) - new Date(x0)) / (new Date(x1) - new Date(x0)) * iw;
    const y = v => pad.t + ih - (v - ymin) / (ymax - ymin) * ih;
    niceTicks(ymin, ymax, 4).forEach(v => {
      el('line', { x1: pad.l, x2: w - pad.r, y1: y(v), y2: y(v), stroke: C.line }, svg);
      const t = el('text', { x: pad.l - 8, y: y(v) + 4, 'text-anchor': 'end', fill: C.dim, 'font-size': 10 }, svg);
      t.textContent = v.toFixed(0);
    });
    const path = pts.map(p => `${x(p[0])},${y(p[1])}`).join(' ');
    el('polyline', { points: path, fill: 'none', stroke: C.blue, 'stroke-width': 1.5, opacity: .9 }, svg);
    (trades || []).forEach(t => {
      if (t.entryDate) {
        el('circle', { cx: x(t.entryDate), cy: y(t.entryPrice), r: 3.2, fill: C.up, opacity: .9 }, svg);
      }
      if (t.exitDate) {
        el('circle', { cx: x(t.exitDate), cy: y(t.exitPrice), r: 3.2, fill: C.down, opacity: .9 }, svg);
      }
    });
    const tip = tooltip(div);
    const overlay = el('rect', { x: pad.l, y: pad.t, width: iw, height: ih, fill: 'transparent' }, svg);
    overlay.addEventListener('mousemove', ev => {
      const r = svg.getBoundingClientRect(), mx = (ev.clientX - r.left) * (w / r.width);
      let best = pts[0], bd = Infinity;
      pts.forEach(p => { const dd = Math.abs(x(p[0]) - mx); if (dd < bd) { bd = dd; best = p; } });
      tip.style.opacity = 1;
      tip.innerHTML = `<div style="color:${C.muted}">${best[0]}</div><b>${best[1].toFixed(2)}</b>`;
      tip.style.left = Math.min(div.clientWidth - 100, x(best[0]) + 8) + 'px';
      tip.style.top = Math.max(0, y(best[1]) - 40) + 'px';
    });
    overlay.addEventListener('mouseleave', () => { tip.style.opacity = 0; });
  }

  global.TLChart = { line, bars, scatter, price, fmt, C };
})(window);
