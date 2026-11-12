/* 无影手 V7.55 终端 — 页面逻辑 */
(function () {
  'use strict';
  const D = window.DSH_DATA, MK = window.DSH_MARKET, SIM = window.DSH_SIM, C = window.Charts;
  if (!D || !MK) { document.body.innerHTML = '<p style="padding:40px">数据未加载</p>'; return; }

  const TF = MK.tf, M15 = TF.M15;
  const T0 = new Map(); M15.forEach((b, i) => T0.set(b[0], i));
  const INIT = D.meta.initial_balance;

  /* ---------------- 工具 ---------------- */
  const pad = n => String(n).padStart(2, '0');
  function fmtDate(t, withTime) {
    const d = new Date(t * 1000);
    const s = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    return withTime ? `${s} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` : s;
  }
  const money = (v, d = 2) => (v < 0 ? '−' : '') + '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const signed = (v, d = 2) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (v, d = 2) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%';
  const num = (v, d = 2) => (v === null || v === undefined ? '—' : Number(v).toFixed(d));
  const cls = v => (v > 0 ? 'pos-t' : v < 0 ? 'neg-t' : '');
  const WEEK = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  /* ---------------- 状态 ---------------- */
  const state = { strat: 'portfolio', range: 0, sortKey: 'id', sortDir: -1, dir: '', res: '' };

  function view() {
    return state.strat === 'portfolio'
      ? { metrics: D.portfolio.metrics, equity: D.portfolio.equity, trades: D.portfolio.trades,
          monthly: D.portfolio.monthly, by_hour: D.portfolio.by_hour,
          by_weekday: D.portfolio.by_weekday, rdist: D.portfolio.rdist,
          label: '组合 50/50', color: '#d4a637' }
      : Object.assign({ label: D.strat_meta[state.strat].name, color: D.strat_meta[state.strat].color },
          D.strategies[state.strat]);
  }

  /* ---------------- 顶部信息 ---------------- */
  document.getElementById('m-symbol').textContent = D.meta.symbol;
  document.getElementById('m-server').textContent = D.meta.server;
  document.getElementById('m-account').textContent = D.meta.account;
  document.getElementById('foot-range').textContent =
    `${fmtDate(D.meta.first_time)} → ${fmtDate(D.meta.last_time)} · ${D.meta.bars} 根 M15`;
  setInterval(() => {
    const d = new Date();
    document.getElementById('clock').textContent =
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }, 1000);

  /* ---------------- KPI ---------------- */
  function renderKPI() {
    const m = view().metrics;
    const cards = [
      { k: '净利润', v: money(m.net_profit), s: `${pct(m.return_pct)} · 期末 ${money(m.final_balance)}`, c: m.net_profit >= 0 ? 'pos' : 'neg' },
      { k: '胜率', v: num(m.win_rate, 1) + '%', s: `${m.wins} 胜 / ${m.losses} 负`, c: m.win_rate >= 50 ? 'pos' : '' },
      { k: '盈亏比', v: num(m.payoff, 2), s: `利润因子 ${num(m.profit_factor, 3)}`, c: (m.payoff || 0) >= 1.5 ? 'pos' : '' },
      { k: '最大回撤', v: num(m.max_dd_pct, 2) + '%', s: money(-m.max_dd), c: 'neg' },
      { k: '交易笔数', v: String(m.trades), s: `${m.longs} 多 / ${m.shorts} 空`, c: '' },
      { k: '期望值', v: signed(m.expectancy_r, 3) + 'R', s: `每笔 ${signed(m.expectancy)} 美元`, c: m.expectancy >= 0 ? 'pos' : 'neg' },
      { k: '夏普比率', v: num(m.sharpe, 2), s: `索提诺 ${num(m.sortino, 2)}`, c: m.sharpe >= 0 ? 'pos' : 'neg' },
      { k: '恢复因子', v: num(m.recovery, 2), s: `最长连亏 ${m.worst_streak} 笔`, c: (m.recovery || 0) >= 0 ? 'pos' : 'neg' }
    ];
    document.getElementById('kpis').innerHTML = cards.map(c => `
      <div class="kpi ${c.c}"><div class="k">${c.k}</div><div class="v">${c.v}</div><div class="s">${c.s}</div></div>`).join('');
  }

  function renderVerdict() {
    const v = view(), m = v.metrics;
    const edge = m.expectancy_r;
    const title = edge >= 0 ? `${v.label} 在样本内为正期望` : `${v.label} 在样本内未取得正期望`;
    const text = `默认参数下 ${m.trades} 笔交易、净利润 ${money(m.net_profit)}（${pct(m.return_pct)}）。`
      + `胜率 ${num(m.win_rate, 1)}%、盈亏比 ${num(m.payoff, 2)}，每笔期望 ${signed(m.expectancy_r, 3)}R`
      + `（毛利 ${money(m.gross_profit)}，亏损 ${money(-m.gross_loss)}）。`
      + `最大回撤 ${num(m.max_dd_pct, 2)}%。样本仅 ${D.meta.bars} 根 M15（约 21 个交易日），`
      + `结论不具备统计显著性——请同时查看参数敏感性与样本外结果。`;
    document.getElementById('verdict-title').textContent = title;
    document.getElementById('verdict-text').textContent = text;
    document.querySelector('.verdict-icon').textContent = edge >= 0 ? '✓' : '!';
  }

  function renderBreakdown() {
    const m = view().metrics;
    const rows = [
      ['毛利总额', money(m.gross_profit)], ['亏损总额', money(-m.gross_loss)],
      ['平均盈利', money(m.avg_win)], ['平均亏损', money(m.avg_loss)],
      ['盈亏比', num(m.payoff, 2)], ['利润因子', num(m.profit_factor, 3)],
      ['每笔期望', money(m.expectancy)], ['期望 R', signed(m.expectancy_r, 3)],
      ['累计 R', signed(m.total_r, 2)], ['平均持仓', num(m.avg_bars, 1) + ' 根'],
      ['最长连胜', m.best_streak + ' 笔'], ['最长连亏', m.worst_streak + ' 笔']
    ];
    document.getElementById('breakdown').innerHTML = rows.map(([k, v], i) => {
      const neg = /^−/.test(String(v));
      return `<div class="row${i > 11 ? ' full' : ''}"><span>${k}</span><span class="${neg ? 'neg-t' : ''}">${v}</span></div>`;
    }).join('');
  }

  function renderStructure() {
    const m = view().metrics, tr = view().trades;
    const lon = tr.filter(t => t.dir === 'long'), sho = tr.filter(t => t.dir === 'short');
    const lp = lon.reduce((s, t) => s + t.pnl, 0), sp = sho.reduce((s, t) => s + t.pnl, 0);
    const mfe = tr.reduce((s, t) => s + t.mfe, 0) / (tr.length || 1);
    const mae = tr.reduce((s, t) => s + t.mae, 0) / (tr.length || 1);
    const rows = [
      ['多单笔数', `${lon.length} 笔`], ['空单笔数', `${sho.length} 笔`],
      ['多单盈亏', money(lp)], ['空单盈亏', money(sp)],
      ['多单胜率', num(lon.length ? lon.filter(t => t.pnl > 0).length / lon.length * 100 : 0, 1) + '%'],
      ['空单胜率', num(sho.length ? sho.filter(t => t.pnl > 0).length / sho.length * 100 : 0, 1) + '%'],
      ['平均浮盈 MFE', money(mfe)], ['平均浮亏 MAE', money(mae)],
      ['交易频率', num(tr.length / Math.max(1, (D.meta.split_idx) / 96), 1) + ' 笔/日'],
      ['平均每笔手数', num(tr.reduce((s, t) => s + t.lots, 0) / (tr.length || 1), 2) + ' 手'],
      ['最大单笔盈利', money(Math.max(0, ...tr.map(t => t.pnl)))],
      ['最大单笔亏损', money(Math.min(0, ...tr.map(t => t.pnl)))]
    ];
    document.getElementById('structure').innerHTML = rows.map(([k, v]) =>
      `<div class="row"><span>${k}</span><span class="${/^−/.test(String(v)) ? 'neg-t' : ''}">${v}</span></div>`).join('');
  }

  function renderOOS() {
    const rows = [
      ['trend', '趋势引擎 A', D.strategies.trend.metrics, D.strategies.trend.oos],
      ['reversion', '回归引擎 B', D.strategies.reversion.metrics, D.strategies.reversion.oos],
      ['portfolio', '组合 50/50', D.portfolio.metrics, D.portfolio.oos]
    ];
    let html = `<thead><tr><th>策略</th><th>样本内净利</th><th>样本内笔数</th>
      <th>样本外净利</th><th>样本外笔数</th><th>样本外胜率</th><th>样本外 PF</th><th>方向一致性</th></tr></thead><tbody>`;
    rows.forEach(([k, name, a, b]) => {
      if (!b) return;
      const same = Math.sign(a.net_profit) === Math.sign(b.net_profit);
      html += `<tr${k === state.strat ? ' class="best"' : ''}>
        <td>${name}</td>
        <td class="${a.net_profit >= 0 ? 'pos-t' : 'neg-t'}">${signed(a.net_profit)}</td>
        <td>${a.trades}</td>
        <td class="${b.net_profit >= 0 ? 'pos-t' : 'neg-t'}">${signed(b.net_profit)}</td>
        <td>${b.trades}</td>
        <td>${num(b.win_rate, 1)}%</td>
        <td>${num(b.profit_factor, 2)}</td>
        <td>${same ? '<span class="pos-t">一致</span>' : '<span class="neg-t">反转</span>'}</td></tr>`;
    });
    document.getElementById('tbl-oos').innerHTML = html + '</tbody>';
    if (D.oos_window) {
      document.getElementById('oos-window').textContent =
        `${fmtDate(D.oos_window.from)} → ${fmtDate(D.oos_window.to)} · ${D.oos_window.bars} 根`;
    }
  }

  /* ---------------- 图表 ---------------- */
  let LAY = {};
  function drawEquity() {
    const v = view(), eq = v.equity;
    const series = [{ data: eq, color: v.color, width: 1.7, fill: 'rgba(212,166,55,.16)' }];
    const lay = C.lineChart(document.getElementById('c-equity'), {
      series, baseline: INIT,
      yFmt: x => '$' + Math.round(x).toLocaleString('en-US'),
      xFmt: x => fmtDate(x).slice(5), hideX: true
    });
    LAY.eq = lay; LAY.eqData = eq;

    // 回撤
    let peak = -Infinity; const dd = [];
    eq.forEach(([t, y]) => { peak = Math.max(peak, y); dd.push([t, (y / peak - 1) * 100]); });
    const lay2 = C.lineChart(document.getElementById('c-dd'), {
      series: [{ data: dd, color: '#ef4444', width: 1.3, fill: 'rgba(239,68,68,.18)' }],
      baseline: 0, yFmt: x => x.toFixed(1) + '%', xFmt: x => fmtDate(x).slice(5)
    });
    LAY.dd = lay2; LAY.ddData = dd;
  }

  function drawCandle() {
    const v = view();
    const n = state.range ? Math.min(state.range, M15.length) : M15.length;
    const start = M15.length - n;
    const bars = M15.slice(start);
    const trades = [];
    v.trades.forEach(t => {
      const oi = T0.get(t.open_time), ci = T0.get(t.close_time);
      if (oi >= start) trades.push({ idx: oi - start, dir: t.dir, open: true });
      if (ci >= start) trades.push({ idx: ci - start, dir: t.dir, open: false, pnl: t.pnl, price: t.close_price });
    });
    const lay = C.candleChart(document.getElementById('c-candle'), bars, {
      xFmt: t => fmtDate(t, true).slice(5), trades
    });
    LAY.candle = lay; LAY.candleBars = bars; LAY.candleStart = start;
    const last = bars[bars.length - 1], first = bars[0];
    document.getElementById('chart-title').textContent =
      `XAUUSDc · M15 · ${fmtDate(first[0])} → ${fmtDate(last[0])}（${bars.length} 根）`;
  }

  function drawDist() {
    const v = view();
    const mon = Object.entries(v.monthly).map(([k, x]) => ({ k: k.slice(2), v: x.pnl }));
    C.barChart(document.getElementById('c-month'), mon, { yFmt: x => (x >= 0 ? '' : '−') + Math.abs(Math.round(x)) });

    const rd = Object.entries(v.rdist).map(([k, n]) => ({ k, v: n, c: k.startsWith('-') || k.startsWith('−') ? '#ef4444' : '#22c55e' }));
    C.barChart(document.getElementById('c-rdist'), rd, { yFmt: x => Math.round(x) });

    const hours = [];
    for (let h = 0; h < 24; h++) {
      const d = v.by_hour[String(h)];
      hours.push({ k: pad(h), v: d ? d.pnl : 0 });
    }
    C.barChart(document.getElementById('c-hour'), hours, { yFmt: x => (x >= 0 ? '' : '−') + Math.abs(Math.round(x)) });

    const wd = [];
    for (let i = 0; i < 7; i++) { const d = v.by_weekday[String(i)]; if (d) wd.push({ k: WEEK[i], v: d.pnl }); }
    C.barChart(document.getElementById('c-weekday'), wd, { yFmt: x => (x >= 0 ? '' : '−') + Math.abs(Math.round(x)) });
  }

  /* ---------------- 交易表 ---------------- */
  function tradeRows() {
    let rows = view().trades.slice();
    if (state.dir) rows = rows.filter(t => t.dir === state.dir);
    if (state.res === 'win') rows = rows.filter(t => t.pnl > 0);
    if (state.res === 'loss') rows = rows.filter(t => t.pnl <= 0);
    const k = state.sortKey;
    rows.sort((a, b) => {
      let x = a[k], y = b[k];
      if (k === 'open_time' || k === 'close_time') { x = x; y = y; }
      if (typeof x === 'string') return state.sortDir * x.localeCompare(y);
      return state.sortDir * (x - y);
    });
    return rows;
  }

  function renderTrades() {
    const rows = tradeRows();
    const tb = document.querySelector('#tbl-trades tbody');
    tb.innerHTML = rows.map(t => `
      <tr>
        <td>${t.id}</td>
        <td class="${t.dir === 'long' ? 'dir-long' : 'dir-short'}">${t.dir === 'long' ? '多' : '空'}</td>
        <td>${fmtDate(t.open_time, true)}</td>
        <td class="r">${num(t.open_price)}</td>
        <td>${fmtDate(t.close_time, true)}</td>
        <td class="r">${num(t.close_price)}</td>
        <td class="r">${num(t.lots)}</td>
        <td class="r">${t.bars}</td>
        <td>${t.reason}</td>
        <td class="r ${t.pnl > 0 ? 'pos-t' : t.pnl < 0 ? 'neg-t' : ''}">${signed(t.pnl)}</td>
        <td class="r ${t.r > 0 ? 'pos-t' : t.r < 0 ? 'neg-t' : ''}">${signed(t.r, 2)}</td>
        <td class="r">${num(t.balance)}</td>
      </tr>`).join('') || '<tr><td colspan="12" style="text-align:center;color:#5f6878;padding:24px">该筛选条件下没有交易</td></tr>';
    const sum = rows.reduce((s, t) => s + t.pnl, 0);
    document.getElementById('trade-foot').innerHTML =
      `<span>显示 ${rows.length} / ${view().trades.length} 笔</span>
       <span>合计盈亏 <b class="${sum > 0 ? 'pos-t' : sum < 0 ? 'neg-t' : ''}">${signed(sum)}</b></span>`;
  }

  document.querySelectorAll('#tbl-trades thead th').forEach(th => {
    th.addEventListener('click', () => {
      const k = th.dataset.k;
      state.sortDir = state.sortKey === k ? -state.sortDir : 1;
      state.sortKey = k;
      renderTrades();
    });
  });
  document.getElementById('f-dir').addEventListener('change', e => { state.dir = e.target.value; renderTrades(); });
  document.getElementById('f-res').addEventListener('change', e => { state.res = e.target.value; renderTrades(); });

  document.getElementById('btn-csv').addEventListener('click', () => {
    const rows = tradeRows();
    const head = ['编号', '方向', '开仓时间', '开仓价', '平仓时间', '平仓价', '手数', '持仓K线', '平仓原因', '盈亏USD', 'R倍数', '结余'];
    const lines = [head.join(',')].concat(rows.map(t => [
      t.id, t.dir === 'long' ? '多' : '空', fmtDate(t.open_time, true), t.open_price,
      fmtDate(t.close_time, true), t.close_price, t.lots, t.bars, t.reason, t.pnl, t.r, t.balance
    ].join(',')));
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `wuyingshou_trades_${state.strat}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  /* ---------------- 参数敏感性 ---------------- */
  function renderSens() {
    const S = D.sensitivity || [];
    const t = S.filter(x => x.strategy === 'trend');
    const sls = [...new Set(t.map(x => x.sl_atr))].sort();
    const trs = [...new Set(t.map(x => x.trail_atr))].sort();
    const cell = (v, pf) => `<td class="${v >= 0 ? 'pos-t' : 'neg-t'}">${signed(v)}<br><span style="color:#5f6878;font-size:10px">PF ${num(pf, 2)}</span></td>`;
    let html = '<thead><tr><th>止损 \\ 移动</th>' + trs.map(x => `<th>${x}×ATR</th>`).join('') + '</tr></thead><tbody>';
    sls.forEach(sl => {
      html += `<tr><td>${sl}×ATR</td>`;
      trs.forEach(tr => {
        const d = t.find(x => x.sl_atr === sl && x.trail_atr === tr);
        html += d ? cell(d.net, d.pf) : '<td>—</td>';
      });
      html += '</tr>';
    });
    document.getElementById('tbl-sens-trend').innerHTML = html + '</tbody>';

    const r = S.filter(x => x.strategy === 'reversion');
    let h2 = '<thead><tr><th>布林 σ</th><th>净利</th><th>PF</th><th>胜率</th><th>笔数</th></tr></thead><tbody>';
    r.forEach(d => {
      h2 += `<tr><td>${d.bb_k}σ</td><td class="${d.net >= 0 ? 'pos-t' : 'neg-t'}">${signed(d.net)}</td>
        <td>${num(d.pf, 2)}</td><td>${num(d.wr, 1)}%</td><td>${d.n}</td></tr>`;
    });
    document.getElementById('tbl-sens-rev').innerHTML = h2 + '</tbody>';

    const posT = t.filter(x => x.net > 0).length, negT = t.filter(x => x.net <= 0).length;
    document.getElementById('sens-note').textContent =
      `趋势引擎 9 组参数中 ${posT} 组为正、${negT} 组为负；把止损从 1.8 放宽到 2.2×ATR 即可让净利由 ${signed(D.strategies.trend.metrics.net_profit)} 翻正，`
      + `而移动止损在 2.0–3.0 之间的差异同样可观。这种「一格之差」的敏感度说明：样本内没有稳定优势，参数只是拟合了这段行情。`;
  }

  /* ---------------- 数据与方法 ---------------- */
  function renderMethod() {
    const dm = D.data_meta || {};
    const tf = dm.timeframes || {};
    const order = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1', 'W1', 'MN1'];
    const rows = order.filter(k => tf[k]).map(k =>
      [k, `${tf[k].bars} 根`, `${fmtDate(tf[k].from)} → ${fmtDate(tf[k].to)}`]);
    document.getElementById('data-src').innerHTML = rows.map(([k, n, r]) =>
      `<div class="row full"><span>${k}</span><span>${n} · ${r}</span></div>`).join('')
      + `<div class="row full"><span>源文件</span><span>11/history/Exness-Real36/*.hst</span></div>`;

    const cf = D.config;
    document.getElementById('costs').innerHTML = [
      ['初始资金', money(INIT)], ['每笔风险', cf.risk_per_trade_pct + '% 权益'],
      ['点差', cf.spread.toFixed(2) + ' 美元/盎司'], ['手续费', cf.commission_per_lot.toFixed(2) + ' 美元/手'],
      ['合约规格', cf.contract_size + ' 盎司/手'], ['手数步长', cf.lot_step.toFixed(2)],
      ['单笔最大手数', cf.max_lots.toFixed(2)], ['杠杆效应', '按风险反推手数'],
      ['加仓/网格', '无（单笔单仓）'], ['隔夜利息', '未计入']
    ].map(([k, v]) => `<div class="row"><span>${k}</span><span>${v}</span></div>`).join('');
  }

  /* ---------------- 模拟交易 ---------------- */
  const sim = {
    session: null, timer: null, running: false, speed: 250, last: null
  };
  const $ = id => document.getElementById(id);

  function buildSession() {
    sim.session = new SIM.PaperSession(MK, D, state.strat);
    sim.last = null;
    $('sim-mode-label').textContent = view().label;
    $('sim-phase').textContent = '待启动';
    $('sim-progress').style.width = '0%';
    $('btn-start').textContent = '开始模拟交易';
    $('sim-feed').innerHTML = '<p class="empty">等待启动…</p>';
    $('sim-positions').innerHTML = '<p class="empty">空仓</p>';
    ['sim-equity', 'sim-balance', 'sim-float', 'sim-pnl', 'sim-price'].forEach(id => $(id).textContent = '—');
    $('sim-count').textContent = '0';
    drawSimChart();
  }

  function startSim() {
    if (!sim.session) buildSession();
    if (sim.running) return;
    sim.running = true;
    $('btn-start').textContent = '暂停';
    $('sim-phase').textContent = sim.session.cursor >= M15.length ? '合成延伸行情' : '回放样本外行情';
    sim.timer = setInterval(() => {
      const r = sim.session.step();
      sim.last = r;
      renderSim();
    }, sim.speed);
  }
  function pauseSim() {
    sim.running = false;
    clearInterval(sim.timer); sim.timer = null;
    $('btn-start').textContent = '继续';
  }

  function renderSim() {
    const s = sim.session.state();
    const eq = s.equity;
    $('sim-equity').textContent = money(eq);
    $('sim-balance').textContent = money(s.balance);
    const f = $('sim-float');
    f.textContent = signed(s.floating); f.className = cls(s.floating);
    const p = $('sim-pnl');
    p.textContent = signed(s.pnl); p.className = cls(s.pnl);
    $('sim-count').textContent = String(s.trades.length);
    $('sim-price').textContent = num(s.lastBar[4]);

    // 进度
    const pctDone = Math.round(s.progress * 100);
    $('sim-progress').style.width = pctDone + '%';
    $('sim-phase').textContent = s.synthetic
      ? `合成延伸行情 · 已回放 ${pctDone}%`
      : `样本外回放 ${pctDone}% · ${fmtDate(s.lastBar[0], true)}`;

    // 持仓
    if (s.positions.length) {
      $('sim-positions').innerHTML = s.positions.map(e => {
        const po = e.pos, fl = sim.session.floating(e);
        return `<div class="pos-card">
          <div class="top"><b class="${po.dir === 1 ? 'pos-t' : 'neg-t'}">${po.dir === 1 ? '多头' : '空头'} ${num(po.lots)} 手</b>
            <span class="${cls(fl)}">${signed(fl)}</span></div>
          <div class="grid">
            <span>入场 <b>${num(po.entry)}</b></span><span>止损 <b>${num(po.sl)}</b></span>
            <span>目标 <b>${po.tp ? num(po.tp) : '移动止损'}</b></span><span>持仓 <b>${po.bars} 根</b></span>
            <span>策略 <b>${D.strat_meta[e.kind].name.slice(0, 4)}</b></span><span>风险 <b>$${num(po.risk_amt, 0)}</b></span>
          </div></div>`;
      }).join('');
    } else $('sim-positions').innerHTML = '<p class="empty">空仓</p>';

    // 成交
    const recent = s.trades.slice(0, 7);
    $('sim-feed').innerHTML = recent.length ? recent.map(t => `
      <div><span class="t">${fmtDate(t.close_time, true).slice(5)}</span>
        <span class="${t.dir === 'long' ? 'pos-t' : 'neg-t'}">${t.dir === 'long' ? '多' : '空'}</span>
        <span class="${t.pnl >= 0 ? 'pos-t' : 'neg-t'}">${signed(t.pnl)}</span></div>`).join('')
      : '<p class="empty">暂无成交</p>';

    drawSimChart(s);
  }

  function drawSimChart(s) {
    const session = sim.session;
    if (!session) return;
    const curve = session.equity.slice(-420);
    if (curve.length < 2) return;
    C.lineChart($('c-sim'), {
      series: [{ data: curve, color: '#d4a637', width: 1.6, fill: 'rgba(212,166,55,.15)' }],
      baseline: session.initial,
      yFmt: x => '$' + Math.round(x).toLocaleString('en-US'),
      xFmt: x => fmtDate(x, true).slice(5, 16)
    });
  }

  $('btn-start').addEventListener('click', () => { sim.running ? pauseSim() : startSim(); });
  $('btn-reset').addEventListener('click', () => {
    pauseSim(); buildSession(); $('btn-start').textContent = '开始模拟交易';
  });
  $('sim-speed').addEventListener('change', e => {
    sim.speed = +e.target.value;
    if (sim.running) { clearInterval(sim.timer); sim.timer = setInterval(() => { sim.session.step(); renderSim(); }, sim.speed); }
  });

  /* ---------------- 切换 ---------------- */
  document.querySelectorAll('#strat-switch button').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#strat-switch button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      state.strat = b.dataset.s;
      const wasRunning = sim.running;
      pauseSim(); sim.session = null; buildSession();
      renderAll();
      if (wasRunning) startSim();
    });
  });

  document.querySelectorAll('#range-switch button').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#range-switch button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      state.range = +b.dataset.r;
      drawCandle();
    });
  });

  /* ---------------- 悬停提示 ---------------- */
  const tip = document.getElementById('tip');
  function showTip(html, x, y) {
    tip.innerHTML = html; tip.classList.add('on');
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hideTip() { tip.classList.remove('on'); }

  document.getElementById('c-equity').addEventListener('mousemove', e => {
    if (!LAY.eq || !LAY.eqData) return;
    const r = e.currentTarget.getBoundingClientRect();
    const lay = LAY.eq;
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left - lay.pad.l) / lay.plotW));
    const i = Math.round(ratio * (LAY.eqData.length - 1));
    const [t, y] = LAY.eqData[i];
    showTip(`${fmtDate(t)}<br><b>${money(y)}</b>`, e.clientX, e.clientY);
  });
  document.getElementById('c-equity').addEventListener('mouseleave', hideTip);

  document.getElementById('c-candle').addEventListener('mousemove', e => {
    if (!LAY.candle) return;
    const r = e.currentTarget.getBoundingClientRect();
    const lay = LAY.candle;
    const i = Math.floor((e.clientX - r.left - lay.pad.l) / lay.slot);
    const b = LAY.candleBars[i];
    if (!b) return hideTip();
    showTip(`${fmtDate(b[0], true)}<br>开 ${num(b[1])} 高 ${num(b[2])}<br>低 ${num(b[3])} 收 ${num(b[4])}`, e.clientX, e.clientY);
  });
  document.getElementById('c-candle').addEventListener('mouseleave', hideTip);

  /* ---------------- 渲染 ---------------- */
  function renderAll() {
    renderKPI(); renderVerdict(); renderBreakdown(); renderStructure(); renderOOS();
    drawEquity(); drawCandle(); drawDist(); renderTrades(); renderSens(); renderMethod();
  }

  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { drawEquity(); drawCandle(); drawDist(); drawSimChart(); }, 160);
  });

  // 导航高亮
  const secs = [...document.querySelectorAll('main section')];
  const links = [...document.querySelectorAll('#tabs a')];
  const io = new IntersectionObserver(es => {
    es.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-120px 0px -60% 0px' });
  secs.forEach(s => io.observe(s));

  renderAll();
  buildSession();
  // 自动开始, 让"模拟交易"立即有数据流动
  setTimeout(startSim, 900);
})();
