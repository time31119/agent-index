/*
 * INTRADAY 100 — session-bar research engine.
 * Every strategy is flat by the session close. No overnight positions.
 */
(function (global) {
  "use strict";
  const DATA = global.INTRADAY_DATA || { datasets: {} };
  const Engine = {};

  const isNum = (x) => typeof x === "number" && Number.isFinite(x);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);

  function stdev(a) {
    if (a.length < 2) return 0;
    const m = mean(a);
    return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1));
  }

  function ema(values, len) {
    const out = new Array(values.length).fill(null);
    const k = 2 / (len + 1);
    let prev = null;
    for (let i = 0; i < values.length; i++) {
      if (!isNum(values[i])) continue;
      prev = prev === null ? values[i] : values[i] * k + prev * (1 - k);
      out[i] = prev;
    }
    return out;
  }

  function rsi(values, len) {
    const out = new Array(values.length).fill(null);
    if (values.length <= len) return out;
    let gain = 0, loss = 0;
    for (let i = 1; i <= len; i++) {
      const d = values[i] - values[i - 1];
      if (d >= 0) gain += d; else loss -= d;
    }
    let ag = gain / len, al = loss / len;
    out[len] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    for (let i = len + 1; i < values.length; i++) {
      const d = values[i] - values[i - 1];
      ag = (ag * (len - 1) + (d > 0 ? d : 0)) / len;
      al = (al * (len - 1) + (d < 0 ? -d : 0)) / len;
      out[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    }
    return out;
  }

  function rollingStats(values, len) {
    const m = new Array(values.length).fill(null);
    const sd = new Array(values.length).fill(null);
    for (let i = len - 1; i < values.length; i++) {
      const slice = values.slice(i - len + 1, i + 1);
      if (slice.some((x) => !isNum(x))) continue;
      m[i] = mean(slice);
      sd[i] = stdev(slice);
    }
    return { mean: m, sd };
  }

  function minuteOf(tm) {
    if (!tm || tm.length < 5) return -1;
    return Number(tm.slice(0, 2)) * 60 + Number(tm.slice(3, 5));
  }

  function prepare(dataset, symbols, start, end) {
    const ds = DATA.datasets[dataset];
    if (!ds) throw new Error("Missing dataset " + dataset);
    const idx = [];
    for (let i = 0; i < ds.t.length; i++) {
      const d = ds.d[i];
      if (!d || d < start || d > end) continue;
      let ok = true;
      for (const s of symbols) {
        const sym = ds.symbols[s];
        if (!sym || !isNum(sym.c[i]) || !isNum(sym.o[i])) { ok = false; break; }
      }
      if (ok) idx.push(i);
    }
    if (idx.length < 50) throw new Error("Not enough aligned bars for " + symbols.join("/"));
    const out = { dataset, t: [], d: [], tm: [], n: idx.length, symbols: {}, meta: ds.meta };
    for (const i of idx) { out.t.push(ds.t[i]); out.d.push(ds.d[i]); out.tm.push(ds.tm[i]); }
    for (const s of symbols) {
      const src = ds.symbols[s];
      const obj = { o: [], h: [], l: [], c: [], v: [] };
      for (const i of idx) {
        obj.o.push(src.o[i]); obj.h.push(src.h[i]); obj.l.push(src.l[i]); obj.c.push(src.c[i]); obj.v.push(src.v[i] || 0);
      }
      out.symbols[s] = obj;
    }
    return out;
  }

  function groups(prepared) {
    const map = new Map();
    for (let i = 0; i < prepared.n; i++) {
      const d = prepared.d[i];
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(i);
    }
    return Array.from(map.entries()).map(([date, idx]) => ({ date, idx }));
  }

  function vwapSeries(prepared, sym) {
    const s = prepared.symbols[sym];
    const out = new Array(prepared.n).fill(null);
    let pv = 0, vv = 0, day = null;
    for (let i = 0; i < prepared.n; i++) {
      if (prepared.d[i] !== day) { day = prepared.d[i]; pv = 0; vv = 0; }
      const tp = (s.h[i] + s.l[i] + s.c[i]) / 3;
      const v = s.v[i] || 0;
      pv += tp * v; vv += v;
      out[i] = vv > 0 ? pv / vv : s.c[i];
    }
    return out;
  }

  function atrBars(prepared, sym, len) {
    const s = prepared.symbols[sym];
    const tr = new Array(prepared.n).fill(null);
    for (let i = 1; i < prepared.n; i++) {
      if (prepared.d[i] !== prepared.d[i - 1]) { tr[i] = s.h[i] - s.l[i]; continue; }
      tr[i] = Math.max(s.h[i] - s.l[i], Math.abs(s.h[i] - s.c[i - 1]), Math.abs(s.l[i] - s.c[i - 1]));
    }
    const out = new Array(prepared.n).fill(null);
    for (let i = len; i < prepared.n; i++) {
      const slice = tr.slice(i - len + 1, i + 1);
      if (slice.every(isNum)) out[i] = mean(slice);
    }
    return out;
  }

  function prevCloseMap(prepared, sym) {
    const s = prepared.symbols[sym];
    const map = new Map();
    let last = null;
    for (let i = 0; i < prepared.n; i++) {
      if (prepared.d[i] !== prepared.d[i - 1]) map.set(prepared.d[i], last);
      last = s.c[i];
    }
    return map;
  }

  function makeTrade(prepared, entryIdx, exitIdx, side, entryPrice, exitPrice, reason) {
    return {
      entryDate: prepared.d[entryIdx],
      exitDate: prepared.d[exitIdx],
      entryTime: prepared.tm[entryIdx],
      exitTime: prepared.tm[exitIdx],
      side: side > 0 ? "L" : "S",
      entry: entryPrice,
      exit: exitPrice,
      pnl: side * (exitPrice / entryPrice - 1),
      bars: exitIdx - entryIdx,
      reason,
    };
  }

  function finish(prepared, trades, costBps) {
    const cost = (costBps || 0) / 10000;
    for (const t of trades) t.pnl -= 2 * cost;
    return analyze(prepared, trades);
  }

  function analyze(prepared, trades) {
    const sorted = trades.slice().sort((a, b) => a.entryDate.localeCompare(b.entryDate) || a.entryTime.localeCompare(b.entryTime));
    let eq = 1;
    const equity = [{ date: sorted[0]?.entryDate || prepared.d[0], v: 1 }];
    for (const t of sorted) { eq *= (1 + t.pnl); equity.push({ date: t.exitDate, v: eq }); }
    const byDay = new Map();
    for (const t of sorted) {
      if (!byDay.has(t.exitDate)) byDay.set(t.exitDate, 0);
      byDay.set(t.exitDate, byDay.get(t.exitDate) + t.pnl);
    }
    const days = Array.from(byDay.entries()).map(([date, pnl]) => ({ date, pnl }));
    const wins = sorted.filter((t) => t.pnl > 0);
    const losses = sorted.filter((t) => t.pnl <= 0);
    const grossW = wins.reduce((s, t) => s + t.pnl, 0);
    const grossL = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    let peak = 1, maxDD = 0;
    for (const e of equity) { if (e.v > peak) peak = e.v; maxDD = Math.min(maxDD, e.v / peak - 1); }
    const start = new Date(sorted[0]?.entryDate || prepared.d[0]);
    const end = new Date(sorted[sorted.length - 1]?.exitDate || prepared.d[prepared.n - 1]);
    const years = Math.max((end - start) / (365.25 * 86400000), 1 / 365.25);
    const total = eq - 1;
    const cagr = days.length >= 20 && eq > 0 ? Math.pow(eq, 1 / years) - 1 : null;
    const dailyPnl = days.map((d) => d.pnl);
    const greenDays = days.filter((d) => d.pnl > 0).length;
    let streak = 0, maxStreak = 0;
    for (const d of days) { if (d.pnl < 0) { streak++; maxStreak = Math.max(maxStreak, streak); } else streak = 0; }
    const avgDaily = dailyPnl.length ? mean(dailyPnl) : 0;
    const sdDaily = dailyPnl.length > 1 ? stdev(dailyPnl) : 0;
    const dailySharpe = sdDaily > 1e-9 ? (avgDaily / sdDaily) * Math.sqrt(252) : 0;
    const tradeRets = sorted.map((t) => t.pnl);
    const vol = stdev(tradeRets) * Math.sqrt(Math.max(1, sorted.length / Math.max(years, 1 / 12)));
    const sharpe = vol > 1e-9 ? mean(tradeRets) * Math.max(1, sorted.length / Math.max(years, 1 / 12)) / vol : 0;
    const overnight = sorted.filter((t) => t.entryDate !== t.exitDate).length;
    const best = sorted.slice().sort((a, b) => b.pnl - a.pnl)[0] || null;
    const worst = sorted.slice().sort((a, b) => a.pnl - b.pnl)[0] || null;
    return {
      trades: sorted,
      equity,
      days,
      summary: {
        start: sorted[0]?.entryDate || prepared.d[0],
        end: sorted[sorted.length - 1]?.exitDate || prepared.d[prepared.n - 1],
        total, cagr, sharpe, dailySharpe, maxDD,
        trades: sorted.length,
        winRate: sorted.length ? wins.length / sorted.length : 0,
        profitFactor: grossL > 1e-9 ? grossW / grossL : (grossW > 0 ? Infinity : 0),
        avgTrade: tradeRets.length ? mean(tradeRets) : 0,
        avgWin: wins.length ? mean(wins.map((t) => t.pnl)) : 0,
        avgLoss: losses.length ? mean(losses.map((t) => t.pnl)) : 0,
        activeDays: days.length,
        greenDays,
        redDays: days.length - greenDays,
        greenDayRate: days.length ? greenDays / days.length : 0,
        avgDaily,
        bestDay: dailyPnl.length ? Math.max(...dailyPnl) : 0,
        worstDay: dailyPnl.length ? Math.min(...dailyPnl) : 0,
        maxLosingStreak: maxStreak,
        overnight,
        avgBars: sorted.length ? mean(sorted.map((t) => t.bars)) : 0,
      },
      best,
      worst,
    };
  }

  function splitAnalysis(prepared, trades, splitDate) {
    const inT = trades.filter((t) => t.exitDate <= splitDate);
    const outT = trades.filter((t) => t.entryDate > splitDate);
    return { inSample: analyze(prepared, inT), outSample: analyze(prepared, outT) };
  }

  function makeResult(prepared, trades, strategy, costBps) {
    const full = finish(prepared, trades, costBps);
    const dates = Array.from(new Set(prepared.d));
    const splitDate = dates[Math.floor(dates.length * 0.7)] || dates[dates.length - 1];
    const parts = splitAnalysis(prepared, full.trades, splitDate);
    const s = full.summary;
    const oos = parts.outSample.summary;
    const fullOk = s.trades >= 20 && s.sharpe > 0.1 && s.cagr > 0 && s.greenDayRate > 0.4;
    const oosOk = oos.trades >= 8 && oos.sharpe > 0.1 && oos.cagr > 0;
    const verdict = oos.trades < 8 ? "样本不足" : fullOk && oosOk ? "样本外通过" : oosOk ? "仅样本外通过" : "样本外未通过";
    return {
      ok: true,
      strategyId: strategy.id,
      dataset: prepared.dataset,
      start: s.start,
      end: s.end,
      splitDate,
      metrics: s,
      is: parts.inSample.summary,
      oos,
      verdict,
      trades: full.trades,
      best: full.best,
      worst: full.worst,
      equity: full.equity,
      days: full.days,
      noOvernight: s.overnight === 0,
    };
  }

  /* ------------------------------ strategies ------------------------------ */

  function runOrb(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const trades = [];
    const openMin = p.openMinutes || 30;
    for (const g of groups(prepared)) {
      const first = g.idx[0];
      const startMin = minuteOf(prepared.tm[first]);
      let orEnd = first, hi = s.h[first], lo = s.l[first];
      for (let k = 1; k < g.idx.length; k++) {
        const i = g.idx[k];
        if (minuteOf(prepared.tm[i]) - startMin >= openMin) break;
        orEnd = i; hi = Math.max(hi, s.h[i]); lo = Math.min(lo, s.l[i]);
      }
      const rangePct = (hi - lo) / lo;
      if (p.minRangePct && rangePct < p.minRangePct) continue;
      if (p.maxRangePct && rangePct > p.maxRangePct) continue;
      let pos = 0, entry = 0, stop = 0, target = 0, entryIdx = -1;
      for (let k = g.idx.indexOf(orEnd) + 1; k < g.idx.length; k++) {
        const i = g.idx[k];
        if (pos === 0) {
          const buffer = (p.buffer || 0) * (hi - lo || hi);
          if (s.c[i] > hi + buffer && p.direction !== "short") { pos = 1; entry = s.o[Math.min(i + 1, g.idx[g.idx.length - 1])]; entryIdx = Math.min(i + 1, g.idx[g.idx.length - 1]); stop = Math.min(lo, entry * (1 - (p.stopPct || 0.004))); target = entry + (p.targetR || 1.5) * (entry - stop); }
          else if (s.c[i] < lo - buffer && p.direction !== "long") { pos = -1; entry = s.o[Math.min(i + 1, g.idx[g.idx.length - 1])]; entryIdx = Math.min(i + 1, g.idx[g.idx.length - 1]); stop = Math.max(hi, entry * (1 + (p.stopPct || 0.004))); target = entry - (p.targetR || 1.5) * (stop - entry); }
          if (pos !== 0) { k = g.idx.indexOf(entryIdx); }
        } else {
          if (pos > 0 && s.l[i] <= stop) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, stop, "stop")); pos = 0; break; }
          if (pos > 0 && s.h[i] >= target) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, target, "target")); pos = 0; break; }
          if (pos < 0 && s.h[i] >= stop) { trades.push(makeTrade(prepared, entryIdx, i, -1, entry, stop, "stop")); pos = 0; break; }
          if (pos < 0 && s.l[i] <= target) { trades.push(makeTrade(prepared, entryIdx, i, -1, entry, target, "target")); pos = 0; break; }
        }
      }
      if (pos !== 0) {
        const last = g.idx[g.idx.length - 1];
        trades.push(makeTrade(prepared, entryIdx, last, pos, entry, s.c[last], "close"));
      }
    }
    return trades;
  }

  function runOpeningDrive(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const trades = [];
    for (const g of groups(prepared)) {
      const first = g.idx[0], startMin = minuteOf(prepared.tm[first]);
      let end = first;
      for (let k = 1; k < g.idx.length; k++) { if (minuteOf(prepared.tm[g.idx[k]]) - startMin >= (p.minutes || 30)) break; end = g.idx[k]; }
      const move = s.c[end] / s.o[first] - 1;
      if (Math.abs(move) < (p.minMove || 0.003)) continue;
      const entryIdx = Math.min(g.idx[g.idx.indexOf(end) + 1], g.idx[g.idx.length - 1]);
      if (entryIdx === end) continue;
      const side = move > 0 ? 1 : -1;
      const entry = s.o[entryIdx];
      let stop = entry * (1 - side * (p.stopPct || 0.004));
      let exitIdx = g.idx[g.idx.length - 1], exit = s.c[exitIdx], reason = "close";
      for (let k = g.idx.indexOf(entryIdx); k < g.idx.length; k++) {
        const i = g.idx[k];
        if (side > 0 && s.l[i] <= stop) { exitIdx = i; exit = stop; reason = "stop"; break; }
        if (side < 0 && s.h[i] >= stop) { exitIdx = i; exit = stop; reason = "stop"; break; }
      }
      trades.push(makeTrade(prepared, entryIdx, exitIdx, side, entry, exit, reason));
    }
    return trades;
  }

  function runGap(prepared, p, sym, fade) {
    const s = prepared.symbols[sym];
    const prev = prevCloseMap(prepared, sym);
    const trades = [];
    for (const g of groups(prepared)) {
      const first = g.idx[0];
      const pc = prev.get(g.date);
      if (!isNum(pc)) continue;
      const gap = s.o[first] / pc - 1;
      if (Math.abs(gap) < (p.minGap || 0.005) || Math.abs(gap) > (p.maxGap || 0.03)) continue;
      const side = fade ? (gap > 0 ? -1 : 1) : (gap > 0 ? 1 : -1);
      const entryIdx = fade ? first : Math.min(first + 1, g.idx[g.idx.length - 1]);
      const entry = s.o[entryIdx];
      let stop = entry * (1 - side * (p.stopPct || 0.004));
      let exitIdx = g.idx[g.idx.length - 1], exit = s.c[exitIdx], reason = "close";
      const vwap = vwapSeries(prepared, sym);
      for (let k = g.idx.indexOf(entryIdx); k < g.idx.length; k++) {
        const i = g.idx[k];
        if (side > 0 && s.l[i] <= stop) { exitIdx = i; exit = stop; reason = "stop"; break; }
        if (side < 0 && s.h[i] >= stop) { exitIdx = i; exit = stop; reason = "stop"; break; }
        if (fade) {
          if (side > 0 && s.h[i] >= vwap[i]) { exitIdx = i; exit = vwap[i]; reason = "vwap"; break; }
          if (side < 0 && s.l[i] <= vwap[i]) { exitIdx = i; exit = vwap[i]; reason = "vwap"; break; }
        }
      }
      trades.push(makeTrade(prepared, entryIdx, exitIdx, side, entry, exit, reason));
    }
    return trades;
  }

  function runPrevDayBreak(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const byDate = new Map();
    for (let i = 0; i < prepared.n; i++) {
      if (!byDate.has(prepared.d[i])) byDate.set(prepared.d[i], []);
      byDate.get(prepared.d[i]).push(i);
    }
    const dates = Array.from(byDate.keys());
    const trades = [];
    for (let di = 1; di < dates.length; di++) {
      const prevIdx = byDate.get(dates[di - 1]);
      const g = byDate.get(dates[di]);
      const prevHi = Math.max(...prevIdx.map((i) => s.h[i]));
      const prevLo = Math.min(...prevIdx.map((i) => s.l[i]));
      let pos = 0, entry = 0, stop = 0, entryIdx = -1;
      for (let k = 0; k < g.length; k++) {
        const i = g[k];
        if (pos === 0) {
          const buf = (p.buffer || 0.001);
          if (s.c[i] > prevHi * (1 + buf)) { pos = 1; entryIdx = Math.min(i + 1, g[g.length - 1]); entry = s.o[entryIdx]; stop = entry * (1 - (p.stopPct || 0.004)); }
          else if (s.c[i] < prevLo * (1 - buf)) { pos = -1; entryIdx = Math.min(i + 1, g[g.length - 1]); entry = s.o[entryIdx]; stop = entry * (1 + (p.stopPct || 0.004)); }
          if (pos !== 0) k = g.indexOf(entryIdx);
        } else {
          if (pos > 0 && s.l[i] <= stop) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, stop, "stop")); pos = 0; break; }
          if (pos < 0 && s.h[i] >= stop) { trades.push(makeTrade(prepared, entryIdx, i, -1, entry, stop, "stop")); pos = 0; break; }
        }
      }
      if (pos !== 0) { const last = g[g.length - 1]; trades.push(makeTrade(prepared, entryIdx, last, pos, entry, s.c[last], "close")); }
    }
    return trades;
  }

  function runVwapReversion(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const vwap = vwapSeries(prepared, sym);
    const diff = s.c.map((c, i) => c - vwap[i]);
    const stats = rollingStats(diff, p.lookback || 30);
    const trades = [];
    for (const g of groups(prepared)) {
      let pos = 0, entry = 0, stop = 0, entryIdx = -1, count = 0;
      for (const i of g.idx) {
        if (!isNum(stats.sd[i]) || stats.sd[i] < 1e-12) continue;
        const z = (diff[i] - stats.mean[i]) / stats.sd[i];
        if (pos === 0 && count < (p.maxTrades || 2)) {
          if (z < -(p.entryZ || 2)) { pos = 1; entryIdx = Math.min(i + 1, g.idx[g.idx.length - 1]); entry = s.o[entryIdx]; stop = entry * (1 - (p.stopPct || 0.004)); count++; }
          else if (z > (p.entryZ || 2)) { pos = -1; entryIdx = Math.min(i + 1, g.idx[g.idx.length - 1]); entry = s.o[entryIdx]; stop = entry * (1 + (p.stopPct || 0.004)); count++; }
        } else if (pos !== 0) {
          if (pos > 0 && s.l[i] <= stop) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, stop, "stop")); pos = 0; continue; }
          if (pos < 0 && s.h[i] >= stop) { trades.push(makeTrade(prepared, entryIdx, i, -1, entry, stop, "stop")); pos = 0; continue; }
          const exit = pos > 0 ? z > -(p.exitZ || 0.3) : z < (p.exitZ || 0.3);
          if (exit) { trades.push(makeTrade(prepared, entryIdx, i, pos, entry, s.c[i], "vwap")); pos = 0; }
        }
      }
      if (pos !== 0) { const last = g.idx[g.idx.length - 1]; trades.push(makeTrade(prepared, entryIdx, last, pos, entry, s.c[last], "close")); }
    }
    return trades;
  }

  function runBollinger(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const st = rollingStats(s.c, p.len || 20);
    const vwap = vwapSeries(prepared, sym);
    const trades = [];
    for (const g of groups(prepared)) {
      let pos = 0, entry = 0, stop = 0, entryIdx = -1;
      for (const i of g.idx) {
        if (!isNum(st.mean[i]) || st.sd[i] < 1e-12) continue;
        const lower = st.mean[i] - (p.k || 2) * st.sd[i];
        if (pos === 0 && s.c[i] < lower && s.c[i] > vwap[i]) { pos = 1; entryIdx = Math.min(i + 1, g.idx[g.idx.length - 1]); entry = s.o[entryIdx]; stop = entry * (1 - (p.stopPct || 0.004)); }
        else if (pos === 1) {
          if (s.l[i] <= stop) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, stop, "stop")); pos = 0; continue; }
          if (s.c[i] >= st.mean[i]) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, s.c[i], "mid")); pos = 0; }
        }
      }
      if (pos === 1) { const last = g.idx[g.idx.length - 1]; trades.push(makeTrade(prepared, entryIdx, last, 1, entry, s.c[last], "close")); }
    }
    return trades;
  }

  function runRsi(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const r = rsi(s.c, p.rsiLen || 2);
    const vwap = vwapSeries(prepared, sym);
    const trades = [];
    for (const g of groups(prepared)) {
      let pos = 0, entry = 0, stop = 0, entryIdx = -1;
      for (const i of g.idx) {
        if (!isNum(r[i])) continue;
        if (pos === 0 && r[i] < (p.entry || 10) && s.c[i] > vwap[i]) { pos = 1; entryIdx = Math.min(i + 1, g.idx[g.idx.length - 1]); entry = s.o[entryIdx]; stop = entry * (1 - (p.stopPct || 0.004)); }
        else if (pos === 1) {
          if (s.l[i] <= stop) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, stop, "stop")); pos = 0; continue; }
          if (r[i] > (p.exit || 60)) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, s.c[i], "rsi")); pos = 0; }
        }
      }
      if (pos === 1) { const last = g.idx[g.idx.length - 1]; trades.push(makeTrade(prepared, entryIdx, last, 1, entry, s.c[last], "close")); }
    }
    return trades;
  }

  function runDropReversal(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const vwap = vwapSeries(prepared, sym);
    const trades = [];
    for (const g of groups(prepared)) {
      let pos = 0, entry = 0, stop = 0, entryIdx = -1;
      for (let k = (p.lookback || 3); k < g.idx.length; k++) {
        const i = g.idx[k], base = g.idx[k - (p.lookback || 3)];
        if (pos === 0 && s.c[i] / s.c[base] - 1 < -(p.dropPct || 0.006)) { pos = 1; entryIdx = Math.min(i + 1, g.idx[g.idx.length - 1]); entry = s.o[entryIdx]; stop = entry * (1 - (p.stopPct || 0.004)); }
        else if (pos === 1) {
          if (s.l[i] <= stop) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, stop, "stop")); pos = 0; continue; }
          if (s.c[i] >= vwap[i]) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, s.c[i], "vwap")); pos = 0; }
        }
      }
      if (pos === 1) { const last = g.idx[g.idx.length - 1]; trades.push(makeTrade(prepared, entryIdx, last, 1, entry, s.c[last], "close")); }
    }
    return trades;
  }

  function runOpeningFade(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const vwap = vwapSeries(prepared, sym);
    const trades = [];
    for (const g of groups(prepared)) {
      const first = g.idx[0], startMin = minuteOf(prepared.tm[first]);
      let end = first;
      for (let k = 1; k < g.idx.length; k++) { if (minuteOf(prepared.tm[g.idx[k]]) - startMin >= 30) break; end = g.idx[k]; }
      const move = s.c[end] / s.o[first] - 1;
      if (Math.abs(move) < (p.movePct || 0.006)) continue;
      const side = move > 0 ? -1 : 1;
      const entryIdx = Math.min(g.idx[g.idx.indexOf(end) + 1], g.idx[g.idx.length - 1]);
      if (entryIdx === end) continue;
      const entry = s.o[entryIdx];
      let stop = entry * (1 - side * (p.stopPct || 0.004));
      let exitIdx = g.idx[g.idx.length - 1], exit = s.c[exitIdx], reason = "close";
      for (let k = g.idx.indexOf(entryIdx); k < g.idx.length; k++) {
        const i = g.idx[k];
        if (side > 0 && s.l[i] <= stop) { exitIdx = i; exit = stop; reason = "stop"; break; }
        if (side < 0 && s.h[i] >= stop) { exitIdx = i; exit = stop; reason = "stop"; break; }
        if (side > 0 && s.h[i] >= vwap[i]) { exitIdx = i; exit = vwap[i]; reason = "vwap"; break; }
        if (side < 0 && s.l[i] <= vwap[i]) { exitIdx = i; exit = vwap[i]; reason = "vwap"; break; }
      }
      trades.push(makeTrade(prepared, entryIdx, exitIdx, side, entry, exit, reason));
    }
    return trades;
  }

  function runIntradayMomentum(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const fast = ema(s.c, p.fast || 9), slow = ema(s.c, p.slow || 21);
    const vwap = vwapSeries(prepared, sym);
    const trades = [];
    for (const g of groups(prepared)) {
      let pos = 0, entry = 0, stop = 0, entryIdx = -1;
      for (const i of g.idx) {
        if (!isNum(fast[i]) || !isNum(slow[i])) continue;
        if (pos === 0 && fast[i] > slow[i] && s.c[i] > vwap[i]) { pos = 1; entryIdx = Math.min(i + 1, g.idx[g.idx.length - 1]); entry = s.o[entryIdx]; stop = entry * (1 - (p.stopPct || 0.005)); }
        else if (pos === 1) {
          if (s.l[i] <= stop) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, stop, "stop")); pos = 0; continue; }
          if (fast[i] < slow[i] || s.c[i] < vwap[i]) { trades.push(makeTrade(prepared, entryIdx, i, 1, entry, s.c[i], "exit")); pos = 0; }
        }
      }
      if (pos === 1) { const last = g.idx[g.idx.length - 1]; trades.push(makeTrade(prepared, entryIdx, last, 1, entry, s.c[last], "close")); }
    }
    return trades;
  }

  function runLateMomentum(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const trades = [];
    for (const g of groups(prepared)) {
      const last = g.idx[g.idx.length - 1];
      const startMin = minuteOf(prepared.tm[last]) - (p.minutes || 60);
      let start = last;
      for (let k = g.idx.length - 1; k >= 0; k--) { if (minuteOf(prepared.tm[g.idx[k]]) <= startMin) { start = g.idx[k]; break; } }
      if (start >= last) continue;
      const move = s.c[last] / s.o[start] - 1;
      if (Math.abs(move) < (p.minMove || 0.003)) continue;
      const entryIdx = Math.min(g.idx[g.idx.indexOf(last) - 1], last);
      if (entryIdx <= start) continue;
      const side = move > 0 ? 1 : -1;
      const entry = s.o[entryIdx];
      trades.push(makeTrade(prepared, entryIdx, last, side, entry, s.c[last], "close"));
    }
    return trades;
  }

  function runRelativeMomentum(prepared, p) {
    const a = prepared.symbols[p.a], b = prepared.symbols[p.b];
    const trades = [];
    for (const g of groups(prepared)) {
      const first = g.idx[0], startMin = minuteOf(prepared.tm[first]);
      let end = first;
      for (let k = 1; k < g.idx.length; k++) { if (minuteOf(prepared.tm[g.idx[k]]) - startMin >= (p.minutes || 30)) break; end = g.idx[k]; }
      const ma = a.c[end] / a.o[first] - 1;
      const mb = b.c[end] / b.o[first] - 1;
      const spread = ma - mb;
      if (Math.abs(spread) < (p.minSpread || 0.003)) continue;
      const entryIdx = Math.min(g.idx[g.idx.indexOf(end) + 1], g.idx[g.idx.length - 1]);
      if (entryIdx === end) continue;
      const last = g.idx[g.idx.length - 1];
      const side = spread > 0 ? 1 : -1;
      const pnl = 0.5 * side * (a.c[last] / a.o[entryIdx] - 1) - 0.5 * side * (b.c[last] / b.o[entryIdx] - 1);
      const t = makeTrade(prepared, entryIdx, last, side, 1, 1 + pnl, "close");
      t.pnl = pnl;
      trades.push(t);
    }
    return trades;
  }

  function runVolumeIgnition(prepared, p, sym) {
    const s = prepared.symbols[sym];
    const gs = groups(prepared);
    const stats = [];
    for (const g of gs) {
      const first = g.idx[0], startMin = minuteOf(prepared.tm[first]);
      let end = first, vol = 0;
      for (const i of g.idx) {
        if (minuteOf(prepared.tm[i]) - startMin >= (p.minutes || 30)) break;
        end = i; vol += s.v[i] || 0;
      }
      stats.push({ g, end, vol, move: s.c[end] / s.o[first] - 1 });
    }
    const trades = [];
    for (let d = 10; d < stats.length; d++) {
      const st = stats[d];
      const avg = mean(stats.slice(d - 10, d).map((x) => x.vol));
      if (!avg || st.vol < avg * (p.volMult || 2) || Math.abs(st.move) < (p.movePct || 0.004)) continue;
      const entryIdx = Math.min(st.g.idx[st.g.idx.indexOf(st.end) + 1], st.g.idx[st.g.idx.length - 1]);
      if (entryIdx === st.end) continue;
      const side = st.move > 0 ? 1 : -1;
      const entry = s.o[entryIdx];
      const stop = entry * (1 - side * (p.stopPct || 0.005));
      let exitIdx = st.g.idx[st.g.idx.length - 1], exit = s.c[exitIdx], reason = "close";
      for (const i of st.g.idx.slice(st.g.idx.indexOf(entryIdx))) {
        if (side > 0 && s.l[i] <= stop) { exitIdx = i; exit = stop; reason = "stop"; break; }
        if (side < 0 && s.h[i] >= stop) { exitIdx = i; exit = stop; reason = "stop"; break; }
      }
      trades.push(makeTrade(prepared, entryIdx, exitIdx, side, entry, exit, reason));
    }
    return trades;
  }

  function runPairs(prepared, p) {    const a = prepared.symbols[p.a], b = prepared.symbols[p.b];
    const look = p.lookback || 60;
    const retA = a.c.map((c, i) => (i ? c / a.c[i - 1] - 1 : 0));
    const retB = b.c.map((c, i) => (i ? c / b.c[i - 1] - 1 : 0));
    const beta = new Array(prepared.n).fill(1);
    for (let i = look; i < prepared.n; i++) {
      const ra = retA.slice(i - look + 1, i + 1), rb = retB.slice(i - look + 1, i + 1);
      const ma = mean(ra), mb = mean(rb);
      let cov = 0, varB = 0;
      for (let k = 0; k < ra.length; k++) { cov += (ra[k] - ma) * (rb[k] - mb); varB += (rb[k] - mb) ** 2; }
      if (varB > 1e-12) beta[i] = clamp(cov / varB, 0.2, 3);
    }
    const spread = a.c.map((c, i) => Math.log(c) - beta[i] * Math.log(b.c[i]));
    const z = new Array(prepared.n).fill(null);
    for (let i = look; i < prepared.n; i++) {
      const sl = spread.slice(i - look + 1, i + 1);
      if (sl.some((x) => !Number.isFinite(x))) continue;
      const m = mean(sl), sd = stdev(sl);
      if (sd > 1e-12) z[i] = (spread[i] - m) / sd;
    }
    const trades = [];
    for (const g of groups(prepared)) {
      let pos = 0, entryIdx = -1, entryZ = 0, entryBeta = 1;
      for (const i of g.idx) {
        if (!isNum(z[i])) continue;
        if (pos === 0) {
          if (z[i] > (p.entryZ || 2)) { pos = -1; entryIdx = Math.min(i + 1, g.idx[g.idx.length - 1]); entryZ = z[i]; entryBeta = beta[i]; }
          else if (z[i] < -(p.entryZ || 2)) { pos = 1; entryIdx = Math.min(i + 1, g.idx[g.idx.length - 1]); entryZ = z[i]; entryBeta = beta[i]; }
        } else {
          const exit = Math.abs(z[i]) < (p.exitZ || 0.5) || Math.abs(z[i]) > (p.stopZ || 3.5);
          if (exit || i === g.idx[g.idx.length - 1]) {
            const j = i === g.idx[g.idx.length - 1] ? i : i;
            const ra = a.c[j] / a.o[entryIdx] - 1;
            const rb = b.c[j] / b.o[entryIdx] - 1;
            const pnl = pos * (0.5 * ra - 0.5 * entryBeta * rb);
            const t = makeTrade(prepared, entryIdx, j, pos, 1, 1 + pnl, exit ? "z" : "close");
            t.pnl = pnl;
            trades.push(t);
            pos = 0;
          }
        }
      }
      if (pos !== 0) {
        const last = g.idx[g.idx.length - 1];
        const ra = a.c[last] / a.o[entryIdx] - 1;
        const rb = b.c[last] / b.o[entryIdx] - 1;
        const pnl = pos * (0.5 * ra - 0.5 * entryBeta * rb);
        const t = makeTrade(prepared, entryIdx, last, pos, 1, 1 + pnl, "close");
        t.pnl = pnl;
        trades.push(t);
      }
    }
    return trades;
  }

  /* ------------------------------ public API ------------------------------ */

  Engine.run = function (strategy, datasetOverride, overrides) {
    const p = Object.assign({}, strategy.params || {}, overrides || {});
    const dataset = datasetOverride || strategy.dataset || "hour";
    const start = (overrides && overrides.start) || (dataset === "five" ? "2026-08-11" : dataset === "crypto" ? "2025-11-05" : "2024-01-01");
    const end = (overrides && overrides.end) || (dataset === "five" ? "2026-11-03" : dataset === "crypto" ? "2026-11-04" : "2026-11-03");
    const symbols = Array.from(new Set([].concat(strategy.symbols || [], [p.a, p.b].filter(Boolean))));
    const prepared = prepare(dataset, symbols, start, end);
    const sym = strategy.symbols[0];
    let trades;
    switch (strategy.engine) {
      case "orb": trades = runOrb(prepared, p, sym); break;
      case "opening_drive": trades = runOpeningDrive(prepared, p, sym); break;
      case "gap_continuation": trades = runGap(prepared, p, sym, false); break;
      case "gap_fade": trades = runGap(prepared, p, sym, true); break;
      case "prev_day_break": trades = runPrevDayBreak(prepared, p, sym); break;
      case "vwap_reversion": trades = runVwapReversion(prepared, p, sym); break;
      case "bollinger_scalp": trades = runBollinger(prepared, p, sym); break;
      case "rsi_reversion": trades = runRsi(prepared, p, sym); break;
      case "drop_reversal": trades = runDropReversal(prepared, p, sym); break;
      case "opening_fade": trades = runOpeningFade(prepared, p, sym); break;
      case "intraday_momentum": trades = runIntradayMomentum(prepared, p, sym); break;
      case "late_momentum": trades = runLateMomentum(prepared, p, sym); break;
      case "relative_momentum": trades = runRelativeMomentum(prepared, p); break;
      case "volume_ignition": trades = runVolumeIgnition(prepared, p, sym); break;
      case "pairs": trades = runPairs(prepared, p); break;
      default: throw new Error("Unknown engine: " + strategy.engine);
    }
    return makeResult(prepared, trades, strategy, overrides && overrides.costBps != null ? overrides.costBps : (strategy.costBps || 2));
  };

  Engine.datasets = DATA.datasets;
  Engine._debug = { prepare, groups, vwapSeries };
  global.IntradayEngine = Engine;
})(typeof window !== "undefined" ? window : globalThis);
