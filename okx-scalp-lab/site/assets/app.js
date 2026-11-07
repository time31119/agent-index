/* SCALP//LAB — page interactions and chart wiring. */
(function () {
  'use strict';

  const D = window.LAB;
  if (!D) return;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fmtPct = v => (v == null || !isFinite(v)) ? '—' : (v > 0 ? '+' : '') + Number(v).toFixed(2) + '%';
  const fmtNum = v => (v == null || !isFinite(v)) ? '—' : Number(v).toFixed(2).replace(/\.00$/, '');
  const fmtPrice = v => LabCharts.fmtPrice(v);
  const fmtCompact = v => LabCharts.fmtCompact(v);
  const tsUTC = t => LabCharts.tsLabel(t, true);

  document.documentElement.classList.add('js');

  // ---------------------------------------------------------------------
  // Navigation / copy / code highlighting
  // ---------------------------------------------------------------------
  function initNav() {
    const toggle = $('.nav-toggle');
    const nav = $('.nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(code) {
    const re = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|(\b(?:ta|strategy|math|color|plot|input|request|array|line|label|table|box|chart)\.[A-Za-z0-9_]+)|(\b(?:strategy|if|else|for|var|float|int|bool|and|or|not|na|true|false|series|simple)\b)|(\b\d+(?:\.\d+)?\b)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += escapeHtml(code.slice(last, m.index));
      const cls = m[1] ? 'tok-com' : m[2] ? 'tok-str' : m[3] ? 'tok-fn' : m[4] ? 'tok-kw' : 'tok-num';
      out += '<span class="' + cls + '">' + escapeHtml(m[0]) + '</span>';
      last = re.lastIndex;
    }
    out += escapeHtml(code.slice(last));
    return out;
  }

  function initCode() {
    $$('[data-pine]').forEach(pre => {
      const raw = pre.textContent;
      pre.dataset.raw = raw;
      pre.innerHTML = highlight(raw);
      const card = pre.closest('.code-card');
      if (card) {
        const lines = card.querySelector('.lines');
        if (lines) lines.textContent = raw.split('\n').length + ' LINES';
      }
    });
    $$('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const target = document.getElementById(btn.dataset.copy);
        if (!target) return;
        const text = target.dataset.raw || target.textContent;
        try {
          await navigator.clipboard.writeText(text);
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        const old = btn.textContent;
        btn.textContent = 'COPIED';
        setTimeout(() => { btn.textContent = old; }, 1400);
      });
    });
  }

  // ---------------------------------------------------------------------
  // Ticker tape + snapshot sparklines
  // ---------------------------------------------------------------------
  function initTape() {
    const wrap = $('[data-tape]');
    if (!wrap) return;
    wrap.innerHTML = D.sample.symbols.map(s => {
      const q = D.snapshot[s];
      const tone = q.change24h >= 0 ? 'up' : 'down';
      return '<div class="tape-item">' +
        '<span class="tape-sym">' + s + '/USDT</span>' +
        '<span class="tape-px">' + fmtPrice(q.price) + '</span>' +
        '<span class="tape-chg ' + tone + '">' + fmtPct(q.change24h) + '</span>' +
        '<canvas class="tape-mini" data-tape-spark="' + s + '"></canvas>' +
        '</div>';
    }).join('');
    $$('[data-tape-spark]').forEach(c => {
      const s = c.dataset.tapeSpark;
      const closes = D.chart[s].candles.slice(-48).map(x => x.c);
      LabCharts.sparkline(c, closes, D.snapshot[s].change24h >= 0 ? '#c9ff4a' : '#ff5d6c', { width: 1.1, dot: false });
    });
  }

  function initSnapshotSparks() {
    $$('[data-sym-spark]').forEach(c => {
      const s = c.dataset.symSpark;
      const closes = D.chart[s].candles.map(x => x.c);
      LabCharts.sparkline(c, closes, D.snapshot[s].change24h >= 0 ? '#c9ff4a' : '#ff5d6c', { width: 1.2 });
    });
  }

  function initCurveSparks() {
    $$('[data-curve]').forEach(c => {
      const st = D.strategies.find(x => x.meta.key === c.dataset.curve);
      if (!st) return;
      const vals = st.curve.map(p => p.v);
      LabCharts.sparkline(c, vals, st.meta.color, { width: 1.3 });
    });
    const top = $('[data-top-spark]');
    if (top) {
      const st = D.strategies[0];
      LabCharts.sparkline(top, st.curve.map(p => p.v), '#c9ff4a', { width: 1.6 });
    }
  }

  // ---------------------------------------------------------------------
  // Home equity chart
  // ---------------------------------------------------------------------
  function initHomeChart() {
    const canvas = $('#home-equity');
    if (!canvas) return;
    const top = D.strategies.slice(0, 5);
    const series = top.map(s => ({
      name: '#' + s.meta.rank + ' ' + s.meta.name,
      color: s.meta.color,
      data: s.curve,
      width: s.meta.rank === 1 ? 2.2 : 1.15
    }));
    series.push({
      name: '等权买入持有',
      color: '#8b958c',
      data: D.benchmark.equalWeightCurve,
      dash: [4, 4],
      width: 1.3
    });
    LabCharts.lineChart(canvas, series, {
      baseline: 100,
      yFmt: v => v.toFixed(0),
      valFmt: v => v.toFixed(1)
    });
    const wrap = $('#home-equity-legend');
    if (wrap) {
      wrap.innerHTML = series.map(s =>
        '<span><i style="background:' + s.color + '"></i>' + s.name + '</span>'
      ).join('');
    }
  }

  // ---------------------------------------------------------------------
  // Ranking: sorting + family filter + scatter
  // ---------------------------------------------------------------------
  function initRanking() {
    const table = $('[data-ranking-table]');
    if (!table) return;
    const rows = $$('tbody tr', table);
    const count = $('[data-rank-count]');
    let family = 'all';
    let query = '';
    let sortKey = 'return';
    let sortDir = -1;
    let scatterApi = null;

    function rowVal(r, key) {
      return parseFloat(r.dataset[key] || '0');
    }

    function apply() {
      const visible = [];
      rows.forEach(r => {
        const okFamily = family === 'all' || r.dataset.family === family;
        const okQuery = !query || (r.dataset.name || '').toLowerCase().includes(query);
        const show = okFamily && okQuery;
        r.style.display = show ? '' : 'none';
        if (show) visible.push(r);
      });
      visible.sort((a, b) => {
        const av = rowVal(a, sortKey), bv = rowVal(b, sortKey);
        return (av - bv) * sortDir;
      });
      const tbody = $('tbody', table);
      visible.forEach(r => tbody.appendChild(r));
      rows.forEach(r => { if (r.style.display === 'none') tbody.appendChild(r); });
      if (count) count.textContent = String(visible.length).padStart(2, '0');
      renderScatter(visible);
    }

    function renderScatter(visible) {
      const canvas = $('[data-scatter]');
      if (!canvas) return;
      const points = visible.map(r => ({
        rank: parseInt(r.dataset.rank, 10),
        label: r.dataset.name,
        x: parseFloat(r.dataset.dd || '0'),
        y: parseFloat(r.dataset.return || '0'),
        color: r.dataset.color || '#c9ff4a'
      }));
      if (scatterApi) {
        // replace canvas to drop old pointer handlers cleanly
        const fresh = canvas.cloneNode(false);
        canvas.parentNode.replaceChild(fresh, canvas);
        scatterApi = LabCharts.scatterChart(fresh, points);
      } else {
        scatterApi = LabCharts.scatterChart(canvas, points);
      }
    }

    $$('[data-family]').forEach(btn => {
      btn.addEventListener('click', () => {
        family = btn.dataset.family;
        $$('[data-family]').forEach(b => b.classList.toggle('on', b === btn));
        apply();
      });
    });
    const search = $('[data-search]');
    if (search) {
      search.addEventListener('input', () => {
        query = search.value.trim().toLowerCase();
        apply();
      });
    }
    $$('[data-sort]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sort;
        if (sortKey === key) sortDir *= -1;
        else { sortKey = key; sortDir = key === 'dd' ? 1 : -1; }
        $$('[data-sort]').forEach(b => b.classList.toggle('on', b === btn));
        apply();
      });
    });
    apply();
  }

  // ---------------------------------------------------------------------
  // Strategy detail charts
  // ---------------------------------------------------------------------
  function drawdownSeries(curve) {
    let peak = -Infinity;
    return curve.map(p => {
      peak = Math.max(peak, p.v);
      return { t: p.t, v: (p.v / peak - 1) * 100 };
    });
  }

  function initDetail() {
    const root = $('[data-strategy]');
    if (!root) return;
    const key = root.dataset.strategy;
    const st = D.strategies.find(x => x.meta.key === key);
    if (!st) return;
    const canvas = $('#equity-chart');
    if (canvas) {
      const series = [];
      const selected = new Set(['net', 'bh']);
      const all = {
        net: { name: '策略净值', color: st.meta.color, data: st.curve, width: 2.1 },
        gross: { name: '零成本净值', color: '#8b958c', data: st.grossCurve, dash: [4, 4], width: 1.2 },
        bh: { name: '等权买入持有', color: '#59645c', data: D.benchmark.equalWeightCurve, dash: [2, 4], width: 1.3 }
      };
      function render() {
        const data = [];
        selected.forEach(k => { if (all[k] && all[k].data) data.push(all[k]); });
        LabCharts.lineChart(canvas, data, { baseline: 100, yFmt: v => v.toFixed(0), valFmt: v => v.toFixed(1) });
        const legend = $('#equity-legend');
        if (legend) {
          legend.innerHTML = ['net', 'gross', 'bh'].map(k => {
            const a = all[k];
            if (!a || !a.data) return '';
            return '<span style="opacity:' + (selected.has(k) ? '1' : '.35') + '"><i style="background:' + a.color + ';' + (a.dash ? 'height:1px;' : '') + '"></i>' + a.name + '</span>';
          }).join('');
        }
      }
      $$('[data-series]').forEach(btn => {
        btn.addEventListener('click', () => {
          const k = btn.dataset.series;
          if (selected.has(k)) selected.delete(k); else selected.add(k);
          btn.classList.toggle('on', selected.has(k));
          if (selected.size === 0) { selected.add(k); btn.classList.add('on'); }
          render();
        });
      });
      render();
    }
    const dd = $('#dd-chart');
    if (dd) {
      const data = drawdownSeries(st.curve);
      LabCharts.lineChart(dd, [{ name: '回撤', color: '#ff5d6c', data, area: true, width: 1.2 }], {
        baseline: 0,
        yFmt: v => v.toFixed(0) + '%',
        valFmt: v => v.toFixed(1) + '%',
        padLeft: 42
      });
    }
  }

  // ---------------------------------------------------------------------
  // Data page: candle chart + symbol switch + overlay toggles
  // ---------------------------------------------------------------------
  function initDataPage() {
    let canvas = $('#candle-chart');
    if (!canvas) return;
    let symbol = 'BTC';
    let api = null;
    const overlayState = { ema: true, bb: false, st: true, vol: true };
    const label = $('[data-chart-label]');

    function build() {
      const payload = D.chart[symbol];
      if (api) {
        const fresh = canvas.cloneNode(false);
        canvas.parentNode.replaceChild(fresh, canvas);
        canvas = fresh;
        api = LabCharts.candleChart(canvas, payload, { initial: overlayState });
      } else {
        api = LabCharts.candleChart(canvas, payload, { initial: overlayState });
      }
      if (label) label.textContent = symbol + '-USDT-SWAP · ' + D.sample.bar + ' · 最近 180 根';
    }
    build();

    $$('[data-chart-symbol]').forEach(btn => {
      btn.addEventListener('click', () => {
        symbol = btn.dataset.chartSymbol;
        $$('[data-chart-symbol]').forEach(b => b.classList.toggle('on', b === btn));
        build();
      });
    });
    $$('[data-overlay]').forEach(btn => {
      btn.classList.toggle('on', ['ema', 'st', 'vol'].includes(btn.dataset.overlay));
      btn.addEventListener('click', () => {
        const k = btn.dataset.overlay;
        overlayState[k] = !overlayState[k];
        btn.classList.toggle('on', overlayState[k]);
        api.set(k, overlayState[k]);
      });
    });
  }

  // ---------------------------------------------------------------------
  // Small UI details
  // ---------------------------------------------------------------------
  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    $$('.reveal').forEach(el => io.observe(el));
  }

  function init() {
    initNav();
    initTape();
    initSnapshotSparks();
    initCurveSparks();
    initHomeChart();
    initRanking();
    initDetail();
    initDataPage();
    initCode();
    initReveal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
