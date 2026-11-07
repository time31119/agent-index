/* site/assets/core.js — 页面通用工具 */
(function (global) {
  'use strict';
  const CAT = {
    trend: { name: '趋势', color: '#5aa9ff' }, osc: { name: '震荡', color: '#a78bfa' },
    vol: { name: '波动率', color: '#f5a524' }, volume: { name: '量能', color: '#2ecc8f' },
    breakout: { name: '突破', color: '#f0564a' }, momentum: { name: '动量', color: '#e879f9' },
    ma: { name: '结构', color: '#94a3b8' }, combo: { name: '组合', color: '#d9b26a' }
  };
  const U = {
    CAT,
    pct(v, d) { if (v === null || v === undefined || Number.isNaN(v)) return '—'; const s = (v * 100).toFixed(d === undefined ? 1 : d); return (v > 0 ? '+' : '') + s + '%'; },
    pct0(v, d) { if (v === null || v === undefined || Number.isNaN(v)) return '—'; return (v * 100).toFixed(d === undefined ? 1 : d) + '%'; },
    num(v, d) { if (v === null || v === undefined || Number.isNaN(v)) return '—'; return Number(v).toFixed(d === undefined ? 2 : d); },
    color(v) { return v > 0 ? 'up' : v < 0 ? 'down' : 'muted'; },
    catName(c) { return (CAT[c] || {}).name || c; },
    catColor(c) { return (CAT[c] || {}).color || '#94a3b8'; },
    esc(s) { return String(s === undefined ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
    paramsText(p) { return Object.keys(p).map(k => k + '=' + (typeof p[k] === 'number' ? (p[k] % 1 ? p[k].toFixed(2) : p[k]) : p[k])).join(', '); },
    indUrl(id) { return 'ind-' + id + '.html'; },
    qs(k) { return new URLSearchParams(location.search).get(k); },
    yearlyOf(series, from, to) {
      // 从 [date, value] 曲线计算年度收益（value 已归一化）
      const out = {};
      let prev = null, prevY = null;
      series.forEach(p => {
        const y = p[0].slice(0, 4);
        if (from && p[0] < from) { prev = p[1]; prevY = y; return; }
        if (to && p[0] > to) return;
        if (prevY === null) { prevY = y; prev = p[1]; return; }
        if (y !== prevY) { out[prevY] = prev !== null ? (p[1] / prev - 1) : 0; prev = p[1]; prevY = y; }
      });
      if (prevY && prev !== null) { /* 最后一年收益在下面按末值补 */ }
      return out;
    },
    // 更可靠：把曲线转成 {year: 收益}
    yearlyCurve(curve) {
      const out = {};
      const byYear = {};
      curve.forEach(p => { const y = p[0].slice(0, 4); if (!byYear[y]) byYear[y] = []; byYear[y].push(p); });
      const ys = Object.keys(byYear).sort();
      let prevEnd = null;
      ys.forEach(y => {
        const arr = byYear[y];
        const start = prevEnd === null ? arr[0][1] : prevEnd;
        out[y] = arr[arr.length - 1][1] / start - 1;
        prevEnd = arr[arr.length - 1][1];
      });
      return out;
    },
    el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; },
    loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  };
  global.TLU = U;
})(window);
