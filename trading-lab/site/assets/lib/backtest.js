/* ============================================================
 * backtest.js — 事件驱动、无未来函数的日线回测引擎（份额制记账）
 * 约定：
 *  - signal[t] 由 t 日收盘及之前的信息计算，t 日收盘后决策；
 *  - 仓位在 t+1 日开盘执行，买入价 open×(1+cost)，卖出价 open×(1-cost)；
 *  - 二值信号：0→1 全仓买入，1→0 全部卖出；持仓期间不做日度再平衡；
 *  - 连续信号：仅当目标权重相对当前权重变化超过 10 个百分点才调仓；
 *  - 净值每日按收盘价 Mark-to-Market，成本只在换手时计一次。
 * ============================================================ */
(function (global) {
  'use strict';
  var TL = global.TL = global.TL || {};
  var TRADING_DAYS = 252;

  function mean(a) { if (!a.length) return 0; var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function std(a) {
    if (a.length < 2) return 0;
    var m = mean(a), s = 0;
    for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return Math.sqrt(s / (a.length - 1));
  }

  function maxDrawdown(equity) {
    var peak = equity[0], mdd = 0, mddStart = 0, mddEnd = 0, curStart = 0;
    for (var i = 1; i < equity.length; i++) {
      if (equity[i] > peak) { peak = equity[i]; curStart = i; }
      var dd = equity[i] / peak - 1;
      if (dd < mdd) { mdd = dd; mddStart = curStart; mddEnd = i; }
    }
    return { mdd: mdd, start: mddStart, end: mddEnd };
  }

  function computeStats(equity, dates, rets) {
    var n = equity.length;
    var total = equity[n - 1] / equity[0] - 1;
    var years = rets.length / TRADING_DAYS;
    var cagr = (years > 0 && equity[0] > 0) ? Math.pow(equity[n - 1] / equity[0], 1 / years) - 1 : 0;
    var mu = mean(rets), sd = std(rets);
    var rf = 0.02 / TRADING_DAYS;
    var sharpe = sd > 0 ? (mu - rf) / sd * Math.sqrt(TRADING_DAYS) : 0;
    var downside = rets.filter(function (r) { return r < 0; });
    var dsd = std(downside);
    var sortino = dsd > 0 ? (mu - rf) / dsd * Math.sqrt(TRADING_DAYS) : 0;
    var md = maxDrawdown(equity);
    var calmar = md.mdd < 0 ? cagr / Math.abs(md.mdd) : 0;
    var yearly = {}, lastName = null, yearStart = {}, yearEnd = {};
    for (var i = 0; i < n; i++) {
      var y = dates[i].slice(0, 4);
      if (lastName !== y) { yearStart[y] = equity[i]; lastName = y; }
      yearEnd[y] = equity[i];
    }
    Object.keys(yearStart).forEach(function (y) { yearly[y] = yearEnd[y] / yearStart[y] - 1; });
    return {
      start: dates[0], end: dates[n - 1], days: n, years: years,
      totalReturn: total, cagr: cagr, vol: sd * Math.sqrt(TRADING_DAYS),
      sharpe: sharpe, sortino: sortino, maxDD: md.mdd, calmar: calmar,
      ddStart: dates[md.start], ddEnd: dates[md.end],
      yearly: yearly, finalEquity: equity[n - 1]
    };
  }

  function clampPos(p) {
    if (p === null || p === undefined || Number.isNaN(p)) return 0;
    if (p > 1) return 1; if (p < 0) return 0; return p;
  }

  function run(data, signal, opts) {
    opts = opts || {};
    var cost = opts.cost === undefined ? 0.0005 : opts.cost;
    var band = opts.band === undefined ? 0.10 : opts.band;
    var rf = opts.rf === undefined ? 0 : opts.rf;   // 空仓现金的年化无风险收益
    var rfDay = rf / TRADING_DAYS;
    var startIdx = opts.startIdx || 0;
    var dates = data.dates, open = data.open, close = data.close;
    var n = dates.length;
    var eqDates = [dates[startIdx]], equity = [1], rets = [0], posSeries = [0];
    var trades = [];
    var cash = 1, shares = 0, avgCost = 0, pos = 0, prevEquity = 1, trade = null;

    function equityNow(price) { return cash + shares * price; }

    for (var t = startIdx; t < n - 1; t++) {
      cash *= (1 + rfDay);                       // 现金计息（空仓期）
      var execOpen = open[t + 1];
      var eqPre = equityNow(close[t]);
      var target = clampPos(signal[t]);
      var prevPos = pos;
      var traded = false;
      var buyVal = 0, sellVal = 0;

      var delta = target - pos;
      if (Math.abs(delta) > 1e-9) {
        var binary = (target === 0 || target === 1) && (pos === 0 || pos === 1);
        var want = binary ? target : (Math.abs(delta) >= band ? target : pos);
        if (want !== pos) {
          var targetVal = eqPre * want;
          var curVal = shares * execOpen;
          if (targetVal > curVal + eqPre * 1e-10) {
            buyVal = targetVal - curVal;
            var buyPrice = execOpen * (1 + cost);
            var newShares = buyVal / buyPrice;
            if (buyVal > cash) { buyVal = Math.max(0, cash); newShares = buyVal / buyPrice; }
            if (shares > 0) avgCost = (avgCost * shares + buyPrice * newShares) / (shares + newShares);
            else avgCost = buyPrice;
            shares += newShares; cash -= buyVal; traded = true;
            if (prevPos === 0 && want > 0) trade = { entryIdx: t + 1, entryDate: dates[t + 1], entryPrice: execOpen };
          } else if (curVal > targetVal + eqPre * 1e-10) {
            sellVal = curVal - targetVal;
            var sellPrice = execOpen * (1 - cost);
            var sellShares = sellVal / sellPrice;
            if (sellShares > shares) sellShares = shares;
            shares -= sellShares; cash += sellShares * sellPrice; traded = true;
            if (want === 0 && shares < 1e-9) {
              if (trade) trades.push({
                entryDate: trade.entryDate, exitDate: dates[t + 1],
                entryPrice: trade.entryPrice, exitPrice: execOpen,
                ret: (execOpen * (1 - cost)) / (trade.entryPrice * (1 + cost)) - 1,
                bars: t + 1 - trade.entryIdx
              });
              shares = 0; avgCost = 0; trade = null;
            }
          }
          pos = want;
        }
      }

      var eq = traded ? equityNow(execOpen) : equityNow(close[t + 1]);
      var r = eq / prevEquity - 1;
      eqDates.push(dates[t + 1]); equity.push(eq); rets.push(r); posSeries.push(pos);
      prevEquity = eq;
    }

    var openTrade = null;
    if (shares > 0 && trade) {
      var lastClose = close[n - 1], exitPrice = lastClose * (1 - cost);
      openTrade = {
        entryDate: trade.entryDate, entryPrice: trade.entryPrice,
        exitDate: null, exitPrice: lastClose, bars: n - 1 - trade.entryIdx,
        ret: exitPrice / trade.entryPrice - 1, open: true
      };
    }

    var stats = computeStats(equity, eqDates, rets);
    var wins = trades.filter(function (x) { return x.ret > 0; });
    var losses = trades.filter(function (x) { return x.ret <= 0; });
    var sumWin = wins.reduce(function (a, b) { return a + b.ret; }, 0);
    var sumLoss = Math.abs(losses.reduce(function (a, b) { return a + b.ret; }, 0));
    stats.trades = trades.length;
    stats.winRate = trades.length ? wins.length / trades.length : 0;
    stats.avgWin = wins.length ? sumWin / wins.length : 0;
    stats.avgLoss = losses.length ? -sumLoss / losses.length : 0;
    stats.payoff = (losses.length && wins.length && sumLoss > 0) ? (sumWin / wins.length) / (sumLoss / losses.length) : 0;
    stats.profitFactor = sumLoss > 0 ? sumWin / sumLoss : (sumWin > 0 ? 99 : 0);
    stats.exposure = posSeries.reduce(function (a, b) { return a + b; }, 0) / posSeries.length;
    stats.avgBars = trades.length ? trades.reduce(function (a, b) { return a + b.bars; }, 0) / trades.length : 0;
    stats.expectancy = trades.length ? trades.reduce(function (a, b) { return a + b.ret; }, 0) / trades.length : 0;
    stats.openTrade = openTrade;

    return {
      dates: eqDates, equity: equity, rets: rets, pos: posSeries,
      trades: trades, openTrade: openTrade, stats: stats, signal: signal
    };
  }

  function sliceStats(res, i0, i1) {
    var eq = res.equity.slice(i0, i1 + 1), ds = res.dates.slice(i0, i1 + 1), rs = res.rets.slice(i0 + 1, i1 + 1);
    var e0 = eq[0];
    var norm = eq.map(function (x) { return x / e0; });
    return computeStats(norm, ds, rs);
  }

  TL.bt = { run: run, stats: computeStats, maxDrawdown: maxDrawdown, sliceStats: sliceStats, TRADING_DAYS: TRADING_DAYS };
  if (typeof module !== 'undefined' && module.exports) module.exports = TL.bt;
})(typeof window !== 'undefined' ? window : globalThis);
