/* site/assets/indicator-page.js — 单指标页交互 */
(function () {
  'use strict';
  const U = window.TLU, CH = window.TLChart;
  const IND = window.TL_IND, CURVES = window.TL_CURVES, MARKETS = window.TL_MARKETS;
  const id = window.TL_IND_ID;
  const start = '2005-01-04', split = '2016-01-01';
  const $ = s => document.querySelector(s);

  function bmCurve(mid) { return MARKETS.benchmark[mid].full.curve; }
  function fullCurve(pts, from, to) { return pts.filter(p => p[0] >= from && (!to || p[0] <= to)); }

  // ---- 主净值图 ----
  function drawEquity(mid) {
    const c = CURVES[mid].c, b = bmCurve(mid);
    const from = c[0][0];
    window.__mid = mid;
    CH.line($('#ch-equity'), [
      { name: IND.short, color: '#d9b26a', data: c, area: true, base: 1, width: 2 },
      { name: '买入持有', color: '#5aa9ff', data: b, width: 1.5, opacity: .85 }
    ], { height: 320, pct: true, dec: 2 });
    // 样本外竖线
    const svg = $('#ch-equity svg');
    if (svg) {
      const w = svg.viewBox.baseVal.width, h = svg.viewBox.baseVal.height;
      const x0 = new Date(c[0][0]).getTime(), x1 = new Date(c[c.length - 1][0]).getTime();
      const x = 52 + (new Date(split).getTime() - x0) / (x1 - x0) * (w - 68);
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', x); l.setAttribute('x2', x); l.setAttribute('y1', 16); l.setAttribute('y2', h - 30);
      l.setAttribute('stroke', 'rgba(240,86,74,.55)'); l.setAttribute('stroke-dasharray', '4 4');
      svg.appendChild(l);
    }
    // 年度柱
    const ys = U.yearlyCurve(c), yb = U.yearlyCurve(bmCurve(mid));
    const years = Object.keys(ys).sort();
    const wrap = $('#ch-yearly');
    wrap.innerHTML = '<div id="yb1" style="height:200px"></div>';
    // 双序列柱：用两张叠加柱状图不易，改为分组柱的自定义实现
    groupedBars($('#yb1'), years.map(y => [y, ys[y] || 0, yb[y] || 0]));
    // 样本外曲线
    const co = CURVES[mid].o;
    const bo = bmCurve(mid).filter(p => p[0] >= split);
    CH.line($('#ch-oos'), [
      { name: IND.short, color: '#d9b26a', data: co, area: true, base: 1, width: 2 },
      { name: '买入持有', color: '#5aa9ff', data: bo.map(p => [p[0], p[1] / bo[0][1]]), width: 1.5, opacity: .85 }
    ], { height: 230, pct: true });
  }

  function groupedBars(div, rows) {
    // rows: [[year, strategy, bm], ...]
    const h = 200, w = div.clientWidth || 500;
    const NS = 'http://www.w3.org/2000/svg';
    div.innerHTML = `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}"></svg>`;
    const svg = div.querySelector('svg');
    const pad = { l: 42, r: 8, t: 10, b: 22 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    let mn = 0, mx = 0;
    rows.forEach(r => { mn = Math.min(mn, r[1], r[2]); mx = Math.max(mx, r[1], r[2]); });
    const padY = (mx - mn) * .15 || .05; mx += padY; mn -= padY;
    const y = v => pad.t + ih - (v - mn) / (mx - mn) * ih;
    const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
    // grid
    for (let i = 0; i <= 3; i++) {
      const v = mn + (mx - mn) * i / 3;
      el('line', { x1: pad.l, x2: w - pad.r, y1: y(v), y2: y(v), stroke: 'rgba(255,255,255,.07)' });
      const t = el('text', { x: pad.l - 6, y: y(v) + 3, 'text-anchor': 'end', fill: '#64748b', 'font-size': 9.5 });
      t.textContent = (v * 100).toFixed(0) + '%';
    }
    el('line', { x1: pad.l, x2: w - pad.r, y1: y(0), y2: y(0), stroke: 'rgba(255,255,255,.22)' });
    const bw = iw / rows.length, ww = bw * .32;
    rows.forEach((r, i) => {
      const x0 = pad.l + i * bw;
      [[r[1], '#d9b26a'], [r[2], '#5aa9ff']].forEach((v, k) => {
        const xx = x0 + bw * .18 + k * ww;
        const top = Math.min(y(v[0]), y(0)), hh = Math.abs(y(v[0]) - y(0)) || 1;
        el('rect', { x: xx, y: top, width: ww * .92, height: hh, rx: 1.5, fill: v[1], opacity: .85 });
      });
      if (rows.length <= 14 || i % 2 === 0) {
        const t = el('text', { x: x0 + bw / 2, y: h - 7, 'text-anchor': 'middle', fill: '#64748b', 'font-size': 9 });
        t.textContent = r[0].slice(2);
      }
    });
  }

  // ---- 交易记录 ----
  function drawTrades(mid) {
    const tr = (IND.perMarket[mid].trades || []).slice().reverse();
    const tb = $('#trade-body');
    if (!tr.length) { tb.innerHTML = '<tr><td colspan="7" class="l dim">该市场在统计窗口内没有完整交易。</td></tr>'; return; }
    tb.innerHTML = tr.map((t, k) => `<tr><td class="l dim">${tr.length - k}</td><td class="l">${t.e}</td><td class="l">${t.x || '<span class="tag">持仓中</span>'}</td>
      <td>${t.ep}</td><td>${t.xp}</td><td>${t.b}</td><td class="${t.r > 0 ? 'up' : 'down'}">${U.pct(t.r, 2)}</td></tr>`).join('');
  }

  // ---- 参数实验室 ----
  function labRun() {
    const mid = $('#lab-market').value;
    const params = {};
    Object.keys(IND.defaultParams).forEach(k => {
      const el = document.getElementById('p_' + k);
      if (el) params[k] = parseFloat(el.value);
    });
    let full = window.TL_LAB;
    if (window.TL_LAB_MARKET !== mid) {
      $('#lab-out').innerHTML = '正在加载 ' + mid + ' 历史数据…';
      U.loadScript('data/ohlc/' + mid + '.js').then(function () {
        window.TL_LAB_MARKET = mid; labRun();
      });
      return;
    }
    if (!full) { $('#lab-out').innerHTML = '<span class="down">数据未加载</span>'; return; }
    let i0 = full.dates.findIndex(d => d >= start);
    const d = { dates: full.dates.slice(i0), open: full.open.slice(i0), high: full.high.slice(i0), low: full.low.slice(i0), close: full.close.slice(i0), volume: full.volume.slice(i0) };
    const strat = TL.reg.find(s => s.id === id);
    let sig;
    try { sig = strat.signal(d, params); } catch (e) { $('#lab-out').innerHTML = '<span class="down">参数无效：' + U.esc(e.message) + '</span>'; return; }
    const r = TL.bt.run(d, sig, { cost: 0.0005, rf: 0.02 });
    const bh = TL.bt.run(d, new Array(d.close.length).fill(1), { cost: 0.0005 });
    const ex = r.stats.cagr - bh.stats.cagr;
    $('#lab-out').innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 18px">
      <div>年化收益 <b class="${r.stats.cagr > 0 ? 'up' : 'down'}">${U.pct(r.stats.cagr, 2)}</b></div>
      <div>买入持有 <b>${U.pct(bh.stats.cagr, 2)}</b></div>
      <div>超额 <b class="${ex > 0 ? 'up' : 'down'}">${U.pct(ex, 2)}</b></div>
      <div>最大回撤 <b class="down">${U.pct(r.stats.maxDD, 1)}</b></div>
      <div>夏普 <b>${r.stats.sharpe.toFixed(2)}</b></div>
      <div>交易 <b>${r.stats.trades}</b> 笔 · 胜率 ${(r.stats.winRate * 100).toFixed(0)}%</div></div>`;
    const pts = [];
    const step = Math.max(1, Math.floor(r.equity.length / 300));
    for (let i = 0; i < r.equity.length; i += step) pts.push([r.dates[i], r.equity[i] / r.equity[0]]);
    pts.push([r.dates[r.equity.length - 1], r.equity[r.equity.length - 1] / r.equity[0]]);
    CH.line($('#lab-chart'), [{ name: '自定义参数', color: '#f0d49a', data: pts, area: true, base: 1, width: 1.8 }], { height: 170, pct: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.TL_LAB_MARKET = 'csi300';
    drawEquity('csi300');
    drawTrades('csi300');
    document.querySelectorAll('.mk-link').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      const m = a.dataset.mk;
      drawEquity(m); drawTrades(m);
      $('#lab-market').value = m;
    }));
    // 散点
    const mid0 = 'csi300';
    if (IND.perMarket[mid0] && IND.perMarket[mid0].scatter) {
      CH.scatter($('#ch-scatter'), IND.perMarket[mid0].scatter.map(p => [p[0], p[1]]), { height: 280 });
    }
    const run = $('#lab-run');
    if (run) run.addEventListener('click', labRun);
    // 首次自动跑一次默认参数
    window.setTimeout(labRun, 60);
  });
})();
