/* site/assets/compare.js */
(function () {
  'use strict';
  const U = window.TLU, CH = window.TLChart;
  const ALL = window.TL_ALL, CURVES = window.TL_CURVES_ALL, MKT = window.TL_MARKETS;
  const COLORS = ['#d9b26a', '#5aa9ff', '#2ecc8f', '#f0564a', '#a78bfa', '#f5a524', '#e879f9', '#94a3b8'];
  const $ = s => document.querySelector(s);
  const IND = ALL.indicators;
  const MAP = Object.fromEntries(IND.map(i => [i.id, i]));
  const bmCurve = mid => MKT.benchmark[mid].full.curve;

  function selected() { return [...document.querySelectorAll('.chip input:checked')].map(x => x.value); }

  function draw() {
    const ids = selected().slice(0, 8);
    const mid = $('#cmp-market').value, range = $('#cmp-range').value;
    const title = document.getElementById('cmp-title');
    title.textContent = (range === 'full' ? '全样本 2005–2026' : '样本外 2016–2026') + ' · ' + (MKT.markets.find(m => m.id === mid) || {}).name;
    if (!ids.length) {
      $('#cmp-chart').innerHTML = '<div class="dim" style="padding:40px;text-align:center">请在左侧勾选指标</div>';
      $('#cmp-table').innerHTML = '<tr><td colspan="7" class="l dim">请选择指标</td></tr>';
      $('#cmp-legend').innerHTML = '';
      return;
    }
    const series = [], rows = [];
    let bm = bmCurve(mid);
    if (range === 'oof' || range === 'oos') bm = bm.filter(p => p[0] >= '2016-01-01');
    bm = bm.map(p => [p[0], p[1] / bm[0][1]]);
    series.push({ name: '买入持有', color: '#ffffff', data: bm, width: 1.2, opacity: .45 });
    ids.forEach((id, k) => {
      const ind = MAP[id]; if (!ind) return;
      let c = CURVES[id][mid][range === 'full' ? 'c' : 'o'];
      if (!c || !c.length) return;
      c = c.map(p => [p[0], p[1] / c[0][1]]);
      if (range === 'oos') c = c.filter(p => p[0] >= '2016-01-01');
      const col = COLORS[k % COLORS.length];
      series.push({ name: ind.short, color: col, data: c, width: 1.8 });
      const m = ind.perMarket[mid];
      rows.push(`<tr><td class="l name" style="color:${col}">${U.esc(ind.short)}</td>
        <td class="${m.full.cagr > 0 ? 'up' : 'down'}">${U.pct0(m.full.cagr, 2)}</td>
        <td class="dim">${U.pct0(m.full.bhCagr, 2)}</td>
        <td class="${m.full.excessCagr > 0 ? 'up' : 'down'}">${U.pct(m.full.excessCagr, 2)}</td>
        <td class="down">${U.pct0(m.full.maxDD, 1)}</td><td>${m.full.sharpe.toFixed(2)}</td><td>${m.full.trades}</td></tr>`);
    });
    if (series.length < 2) {
      $('#cmp-chart').innerHTML = '<div class="dim" style="padding:40px;text-align:center">该市场暂无数据</div>';
      return;
    }
    CH.line($('#cmp-chart'), series, { height: 380, pct: true });
    $('#cmp-legend').innerHTML = series.map(s => `<span><i style="background:${s.color}"></i>${U.esc(s.name)}</span>`).join('');
    $('#cmp-table').innerHTML = rows.join('') || '<tr><td colspan="7" class="l dim">暂无数据</td></tr>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 默认选中前 4 名
    const top = IND.slice().sort((a, b) => b.medFullExcess - a.medFullExcess).slice(0, 4);
    top.forEach(i => {
      const cb = document.querySelector(`.chip input[value="${i.id}"]`);
      if (cb) cb.checked = true;
    });
    document.querySelectorAll('.chip input').forEach(cb => cb.addEventListener('change', draw));
    $('#cmp-run').addEventListener('click', draw);
    $('#cmp-market').addEventListener('change', draw);
    $('#cmp-range').addEventListener('change', draw);
    $('#cmp-clear').addEventListener('click', () => { document.querySelectorAll('.chip input').forEach(cb => cb.checked = false); draw(); });
    $('#cmp-top').addEventListener('click', () => {
      document.querySelectorAll('.chip input').forEach(cb => cb.checked = false);
      IND.slice().sort((a, b) => b.medFullExcess - a.medFullExcess).slice(0, 5).forEach(i => {
        const cb = document.querySelector(`.chip input[value="${i.id}"]`); if (cb) cb.checked = true;
      });
      draw();
    });
    draw();
  });
})();
