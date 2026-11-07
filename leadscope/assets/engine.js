/* LeadScope engine — pure analytics, no DOM. Works in browser (window.Engine) and node (module.exports). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Engine = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var nz = function (v, d) { return v === null || v === undefined || isNaN(v) ? (d === undefined ? 0 : d) : v; };

  /* ---------- derived fields ---------- */

  // 前 60 天收益：由「全期收益」和「近 30 天收益」反推
  // (1+all) = (1+prior) * (1+month)  =>  prior = (1+all)/(1+month) - 1
  function priorReturn(l) {
    if (l.a === null || l.a === undefined || l.m === null) return null;
    var den = 1 + l.m / 100;
    if (den <= 0.01) return null;
    return ((1 + l.a / 100) / den - 1) * 100;
  }

  // 逐笔期望（按镜像口径的胜率、平均盈/亏）
  function expectancy(l) {
    if (l.wr === null || l.aw === null || l.al === null) return null;
    var p = l.wr / 100;
    return p * l.aw + (1 - p) * l.al;
  }

  function payoffRatio(l) {
    if (!l.aw || !l.al || l.al === 0) return null;
    return Math.abs(l.aw / l.al);
  }

  /* ---------- copyability score (0-100) ----------
     设计原则：先看「跟下去会不会先被打残」（回撤 30 分），
     再看「这份收益有没有延续证据」（前 60 天 + 7 天 20 分），
     最后才是收益本身（风险调整后 20 分）与成本结构（15+8+7）。 */
  function score(l) {
    var parts = {};
    var flags = [];

    var dd = Math.abs(nz(l.dd, -100));
    var m = nz(l.m, 0);
    var w = nz(l.w, 0);
    var p = priorReturn(l);
    var sh = l.sh;
    var wr = nz(l.wr, 0);
    var b = payoffRatio(l);
    var tpm = nz(l.tpm, 0);
    var hist = nz(l.hist, 0);

    // 1) 生存：回撤越小越高，30 分
    parts.survival = 30 * Math.exp(-dd / 22);

    // 2) 延续性 20：前 60 天与近 7 天都为正，才算「有延续证据」
    var priorPos = p !== null && p > 0;
    var weekPos = w > 0;
    parts.persistence = priorPos && weekPos ? 20 : (priorPos || weekPos ? 8 : 0);

    // 3) 风险调整收益 20：30 天收益 / 回撤，回撤过深时封顶
    var ratio = m / (dd + 8);
    var ra = clamp(ratio / 2.2, 0, 1) * 20;
    if (dd > 70) ra *= 0.2; else if (dd > 50) ra *= 0.45;
    parts.riskAdj = ra;

    // 4) 收益结构 15：正偏（大赢小亏）健康；小赢大亏 + 高胜率是马丁/扛单
    if (b === null) { parts.structure = 6; }
    else if (b >= 1.1 && wr >= 33 && wr <= 70) { parts.structure = 15; }
    else if (b >= 1.1) { parts.structure = 11; }
    else if (b < 0.45 && wr >= 72) { parts.structure = 2; }
    else if (b < 0.7) { parts.structure = 5; }
    else { parts.structure = 9; }
    if (wr >= 97 && (l.al === null || l.al === 0)) { parts.structure = 0; }


    // 5) 成本 8：交易越频繁，滑点与手续费吃掉的比例越高
    parts.frequency = tpm <= 60 ? 8 : tpm <= 120 ? 6 : tpm <= 250 ? 3.5 : tpm <= 400 ? 1.5 : 0;

    // 6) 记录长度 7
    parts.track = hist >= 180 ? 7 : hist >= 120 ? 6 : hist >= 90 ? 5 : hist >= 60 ? 3 : 1;

    var total = parts.survival + parts.persistence + parts.riskAdj + parts.structure + parts.frequency + parts.track;
    // 容量硬约束：一个月几百上千笔的策略，跟单人的滑点与最低下单额损耗无法复制
    if (tpm > 1000) total *= 0.5; else if (tpm > 500) total *= 0.65; else if (tpm > 300) total *= 0.82;
    if (wr >= 99 && (l.al === null || l.al === 0)) total = Math.min(total, 35);
    total = clamp(total, 0, 100);

    if (p !== null && p < -30) flags.push("前期巨亏后反弹");
    if (dd >= 75) flags.push("回撤 " + Math.round(dd) + "%");
    else if (dd >= 50) flags.push("回撤 " + Math.round(dd) + "%");
    if (nz(l.a, 0) < 0) flags.push("全期为负");
    if (tpm > 300) flags.push("高频 " + Math.round(tpm) + " 笔/月");
    if (b !== null && b < 0.5 && wr > 70) flags.push("小赢大亏结构");
    var e = expectancy(l);
    if (e !== null && e < 0) flags.push("账面期望为负");

    var verdict = total >= 65 ? "ok" : total >= 45 ? "watch" : "avoid";
    return { total: Math.round(total), parts: parts, verdict: verdict, flags: flags, prior: p, expectancy: e, payoff: b };
  }

  function verdictLabel(v) {
    return v === "ok" ? "可小额试跟" : v === "watch" ? "先观察" : "不建议跟";
  }

  /* ---------- pool statistics ---------- */
  function pctile(sorted, q) {
    if (!sorted.length) return 0;
    var i = clamp(Math.floor((sorted.length - 1) * q), 0, sorted.length - 1);
    return sorted[i];
  }

  function rank(arr, key) {
    var idx = arr.map(function (_, i) { return i; }).sort(function (a, b) { return key(arr[a]) - key(arr[b]); });
    var r = new Array(arr.length);
    var i = 0;
    while (i < idx.length) {
      var j = i;
      while (j + 1 < idx.length && key(arr[idx[j + 1]]) === key(arr[idx[i]])) j++;
      var avg = (i + j) / 2 + 1;
      for (var k = i; k <= j; k++) r[idx[k]] = avg;
      i = j + 1;
    }
    return r;
  }

  function spearman(a, b) {
    var ra = rank(a, function (x) { return x; });
    var rb = rank(b, function (x) { return x; });
    var n = a.length, ma = 0, mb = 0, i;
    for (i = 0; i < n; i++) { ma += ra[i]; mb += rb[i]; }
    ma /= n; mb /= n;
    var num = 0, da = 0, db = 0;
    for (i = 0; i < n; i++) { var x = ra[i] - ma, y = rb[i] - mb; num += x * y; da += x * x; db += y * y; }
    return da && db ? num / Math.sqrt(da * db) : 0;
  }

  function poolStats(leads) {
    var months = leads.map(function (l) { return l.m; }).filter(function (v) { return v !== null; }).sort(function (a, b) { return a - b; });
    var dds = leads.map(function (l) { return nz(l.dd, 0); }).sort(function (a, b) { return a - b; });
    var pairs = leads.filter(function (l) { return priorReturn(l) !== null; });
    var pos = months.filter(function (m) { return m > 0; }).length;
    return {
      n: leads.length,
      median: pctile(months, 0.5),
      mean: months.reduce(function (a, b) { return a + b; }, 0) / months.length,
      p25: pctile(months, 0.25),
      p75: pctile(months, 0.75),
      p90: pctile(months, 0.9),
      p99: pctile(months, 0.99),
      max: months[months.length - 1],
      posPct: 100 * pos / months.length,
      medianDD: pctile(dds, 0.5),
      negPriorPct: 100 * pairs.filter(function (l) { return priorReturn(l) < 0; }).length / pairs.length,
      rho: spearman(pairs.map(function (l) { return l.m; }), pairs.map(function (l) { return priorReturn(l); }))
    };
  }

  /* ---------- Monte Carlo copy simulation ---------- */
  // 逐笔模型：胜率 p、平均盈利 aw%、平均亏损 al%（占名义仓位），
  // 每笔对账户权益的影响 = lev * (r%) - 成本；月度盈利再扣分成。
  function simulate(opt) {
    var o = {
      wr: 50, aw: 2, al: -2, tpm: 60, months: 6, split: 10, slipBps: 12, feeBps: 5,
      lev: 1, paths: 4000, drift: 0, stopDD: 0, seed: 7
    };
    for (var k in opt) if (Object.prototype.hasOwnProperty.call(opt, k)) o[k] = opt[k];

    var costPerTrade = (o.feeBps * 2 + o.slipBps * 2) / 10000; // 双边
    var rnd = mulberry32(o.seed || 1);
    var finals = new Array(o.paths);
    var curves = [];
    var samples = Math.min(o.paths, 120);

    for (var pIdx = 0; pIdx < o.paths; pIdx++) {
      var eq = 1;
      var peak = 1, mdd = 0;
      var curve = [1];
      var broke = false;
      for (var mo = 0; mo < o.months; mo++) {
        var monthStart = eq;
        var trades = Math.max(1, Math.round(o.tpm * (0.85 + rnd() * 0.3)));
        for (var t = 0; t < trades; t++) {
          var win = rnd() < clamp(o.wr / 100 + o.drift, 0, 1);
          var r = (win ? o.aw : o.al) / 100;
          var delta = o.lev * r - o.lev * costPerTrade;
          eq *= (1 + delta);
          if (eq <= 0.0001) { eq = 0; broke = true; break; }
          if (eq > peak) peak = eq;
          var ddNow = eq / peak - 1;
          if (ddNow < mdd) mdd = ddNow;
        }
        if (broke) { curve.push(0); break; }
        // 分成：只对当月净利润收取
        if (eq > monthStart && o.split > 0) eq = monthStart + (eq - monthStart) * (1 - o.split / 100);
        curve.push(eq);
        if (o.stopDD && (eq / peak - 1) <= -o.stopDD / 100) break;
      }
      finals[pIdx] = eq;
      if (pIdx < samples) curves.push(curve);
    }

    var sorted = finals.slice().sort(function (a, b) { return a - b; });
    var sum = finals.reduce(function (a, b) { return a + b; }, 0);
    var mean = sum / finals.length;
    var med = pctile(sorted, 0.5);
    return {
      finals: finals, curves: curves, months: o.months,
      mean: mean, median: med,
      p5: pctile(sorted, 0.05), p25: pctile(sorted, 0.25), p75: pctile(sorted, 0.75), p95: pctile(sorted, 0.95),
      probUp: 100 * finals.filter(function (v) { return v > 1; }).length / finals.length,
      probDouble: 100 * finals.filter(function (v) { return v >= 2; }).length / finals.length,
      probHalf: 100 * finals.filter(function (v) { return v <= 0.5; }).length / finals.length,
      probRuin: 100 * finals.filter(function (v) { return v <= 0.05; }).length / finals.length,
      params: o
    };
  }

  // 可复现随机数
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  return {
    priorReturn: priorReturn, expectancy: expectancy, payoffRatio: payoffRatio,
    score: score, verdictLabel: verdictLabel,
    poolStats: poolStats, spearman: spearman, pctile: pctile,
    simulate: simulate, clamp: clamp
  };
});
