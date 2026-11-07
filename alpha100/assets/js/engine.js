/*
 * ALPHA 100 闂?deterministic daily-bar research engine.
 * No network, no dependencies. Signals are computed on closes and executed at
 * the next open (or at the open for intraday gap strategies). This is a
 * research tool, not an execution system.
 */
(function (global) {
  "use strict";

  const Engine = {};
  const YEAR_DAYS = 365.25;

  /* ------------------------------------------------------------------ */
  /* math / indicators                                                   */
  /* ------------------------------------------------------------------ */

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const isNum = (x) => typeof x === "number" && Number.isFinite(x);

  function mean(a) {
    if (!a.length) return 0;
    return a.reduce((s, x) => s + x, 0) / a.length;
  }
  function variance(a) {
    if (a.length < 2) return 0;
    const m = mean(a);
    return a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1);
  }
  function stdev(a) {
    return Math.sqrt(variance(a));
  }
  function quantile(a, q) {
    if (!a.length) return 0;
    const b = a.slice().sort((x, y) => x - y);
    const pos = (b.length - 1) * q;
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    if (lo === hi) return b[lo];
    return b[lo] + (b[hi] - b[lo]) * (pos - lo);
  }

  function sma(values, len) {
    const out = new Array(values.length).fill(null);
    let sum = 0;
    let count = 0;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (isNum(v)) {
        sum += v;
        count++;
      }
      if (i >= len) {
        const old = values[i - len];
        if (isNum(old)) {
          sum -= old;
          count--;
        }
      }
      if (i >= len - 1 && count === len) out[i] = sum / len;
    }
    return out;
  }

  function ema(values, len) {
    const out = new Array(values.length).fill(null);
    const k = 2 / (len + 1);
    let prev = null;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (!isNum(v)) continue;
      prev = prev === null ? v : v * k + prev * (1 - k);
      out[i] = prev;
    }
    return out;
  }

  function rollingStd(values, len) {
    const out = new Array(values.length).fill(null);
    for (let i = len - 1; i < values.length; i++) {
      const slice = values.slice(i - len + 1, i + 1);
      if (slice.some((x) => !isNum(x))) continue;
      out[i] = stdev(slice);
    }
    return out;
  }

  function rollingMean(values, len) {
    return sma(values, len);
  }

  function rollingMax(values, len) {
    // prior `len` bars, excluding the current bar
    const out = new Array(values.length).fill(null);
    for (let i = len; i < values.length; i++) {
      let m = -Infinity;
      let ok = true;
      for (let j = i - len; j < i; j++) {
        if (!isNum(values[j])) { ok = false; break; }
        if (values[j] > m) m = values[j];
      }
      if (ok) out[i] = m;
    }
    return out;
  }

  function rollingMin(values, len) {
    const out = new Array(values.length).fill(null);
    for (let i = len; i < values.length; i++) {
      let m = Infinity;
      let ok = true;
      for (let j = i - len; j < i; j++) {
        if (!isNum(values[j])) { ok = false; break; }
        if (values[j] < m) m = values[j];
      }
      if (ok) out[i] = m;
    }
    return out;
  }

  function roc(values, len) {
    const out = new Array(values.length).fill(null);
    for (let i = len; i < values.length; i++) {
      if (isNum(values[i]) && isNum(values[i - len]) && values[i - len] !== 0) {
        out[i] = values[i] / values[i - len] - 1;
      }
    }
    return out;
  }

  function rsi(values, len) {
    const out = new Array(values.length).fill(null);
    if (values.length <= len) return out;
    let gain = 0;
    let loss = 0;
    for (let i = 1; i <= len; i++) {
      const d = values[i] - values[i - 1];
      if (d >= 0) gain += d; else loss -= d;
    }
    let avgGain = gain / len;
    let avgLoss = loss / len;
    out[len] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    for (let i = len + 1; i < values.length; i++) {
      const d = values[i] - values[i - 1];
      const g = d > 0 ? d : 0;
      const l = d < 0 ? -d : 0;
      avgGain = (avgGain * (len - 1) + g) / len;
      avgLoss = (avgLoss * (len - 1) + l) / len;
      out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }
    return out;
  }

  function atr(highs, lows, closes, len) {
    const tr = new Array(closes.length).fill(null);
    for (let i = 1; i < closes.length; i++) {
      if (![highs[i], lows[i], closes[i], closes[i - 1]].every(isNum)) continue;
      tr[i] = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
    }
    const out = new Array(closes.length).fill(null);
    let sum = 0;
    let count = 0;
    for (let i = 1; i < closes.length; i++) {
      if (isNum(tr[i])) { sum += tr[i]; count++; }
      if (i > len) {
        const old = tr[i - len];
        if (isNum(old)) { sum -= old; count--; }
      }
      if (i >= len && count === len) out[i] = sum / len;
    }
    return out;
  }

  function zscore(values, len) {
    const out = new Array(values.length).fill(null);
    for (let i = len - 1; i < values.length; i++) {
      const slice = values.slice(i - len + 1, i + 1);
      if (slice.some((x) => !isNum(x))) continue;
      const m = mean(slice);
      const sd = stdev(slice);
      out[i] = sd > 1e-12 ? (values[i] - m) / sd : 0;
    }
    return out;
  }

  function slope(values, len) {
    const out = new Array(values.length).fill(null);
    for (let i = len - 1; i < values.length; i++) {
      const slice = values.slice(i - len + 1, i + 1);
      if (slice.some((x) => !isNum(x))) continue;
      const m = mean(slice);
      if (Math.abs(m) < 1e-12) { out[i] = 0; continue; }
      let num = 0;
      let den = 0;
      const mid = (len - 1) / 2;
      for (let j = 0; j < len; j++) {
        num += (j - mid) * (slice[j] - m);
        den += (j - mid) * (j - mid);
      }
      out[i] = (num / den) / m;
    }
    return out;
  }

  function betaOf(a, b, len) {
    const out = new Array(a.length).fill(null);
    for (let i = len - 1; i < a.length; i++) {
      const ra = [];
      const rb = [];
      for (let j = i - len + 1; j <= i; j++) {
        if (!isNum(a[j]) || !isNum(b[j]) || !isNum(a[j - 1]) || !isNum(b[j - 1])) continue;
        ra.push(a[j] / a[j - 1] - 1);
        rb.push(b[j] / b[j - 1] - 1);
      }
      if (ra.length < len * 0.8) continue;
      const ma = mean(ra);
      const mb = mean(rb);
      let cov = 0;
      let varB = 0;
      for (let j = 0; j < ra.length; j++) {
        cov += (ra[j] - ma) * (rb[j] - mb);
        varB += (rb[j] - mb) * (rb[j] - mb);
      }
      if (varB > 1e-12) out[i] = clamp(cov / varB, 0.1, 3);
    }
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* data preparation                                                    */
  /* ------------------------------------------------------------------ */

  function prepare(market, symbols, start, end) {
    if (!market || !market.dates || !market.symbols) throw new Error("Market data missing");
    const dates = [];
    const idx = [];
    for (let i = 0; i < market.dates.length; i++) {
      const d = market.dates[i];
      if (d < start || d > end) continue;
      let ok = true;
      for (const s of symbols) {
        const sym = market.symbols[s];
        if (!sym || !isNum(sym.o[i]) || !isNum(sym.c[i])) { ok = false; break; }
      }
      if (ok) { dates.push(d); idx.push(i); }
    }
    if (dates.length < 260) throw new Error("Not enough aligned bars for " + symbols.join("/"));
    const out = { dates, n: dates.length, idx, symbols: {} };
    for (const s of symbols) {
      const src = market.symbols[s];
      const obj = { o: [], h: [], l: [], c: [], v: [] };
      for (const i of idx) {
        obj.o.push(src.o[i]);
        obj.h.push(src.h[i]);
        obj.l.push(src.l[i]);
        obj.c.push(src.c[i]);
        obj.v.push(src.v[i] || 0);
      }
      out.symbols[s] = obj;
    }
    return out;
  }

  function periodsPerYear(dates) {
    if (dates.length < 30) return 252;
    const first = Date.parse(dates[0]);
    const last = Date.parse(dates[dates.length - 1]);
    const years = Math.max((last - first) / (365.25 * 86400000), 1 / 365.25);
    return (dates.length - 1) / years;
  }

  /* ------------------------------------------------------------------ */
  /* metrics                                                             */
  /* ------------------------------------------------------------------ */

  function drawdownSeries(equity) {
    let peak = equity[0] || 1;
    const dd = [];
    for (const v of equity) {
      if (v > peak) peak = v;
      dd.push(peak > 0 ? v / peak - 1 : 0);
    }
    return dd;
  }

  function monthKey(date) {
    return date.slice(0, 7);
  }

  function monthlyReturns(equity, dates) {
    const map = new Map();
    for (let i = 0; i < equity.length; i++) {
      const key = monthKey(dates[i]);
      if (!map.has(key)) map.set(key, { first: equity[i], last: equity[i] });
      else map.get(key).last = equity[i];
    }
    const rows = [];
    let prev = null;
    for (const [key, v] of map) {
      const r = prev === null ? v.last / v.first - 1 : v.last / prev - 1;
      rows.push({ month: key, ret: r });
      prev = v.last;
    }
    return rows;
  }

  function calcMetrics(equity, dates, trades, benchmark, periods) {
    const n = equity.length;
    if (n < 3) return emptyMetrics();
    const rets = [];
    for (let i = 1; i < n; i++) {
      if (equity[i - 1] > 0) rets.push(equity[i] / equity[i - 1] - 1);
    }
    const total = equity[n - 1] / equity[0] - 1;
    const years = Math.max((Date.parse(dates[n - 1]) - Date.parse(dates[0])) / (365.25 * 86400000), 1 / 365.25);
    const cagr = equity[n - 1] > 0 ? Math.pow(equity[n - 1] / equity[0], 1 / years) - 1 : -1;
    const vol = stdev(rets) * Math.sqrt(periods);
    const avg = mean(rets) * periods;
    const sharpe = vol > 1e-12 ? avg / vol : 0;
    const downside = rets.filter((r) => r < 0);
    const downVol = downside.length ? Math.sqrt(mean(downside.map((r) => r * r))) * Math.sqrt(periods) : 0;
    const sortino = downVol > 1e-12 ? avg / downVol : 0;
    const dd = drawdownSeries(equity);
    const maxDD = Math.min(...dd);
    const calmar = maxDD < -1e-12 ? cagr / Math.abs(maxDD) : 0;
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl <= 0);
    const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const profitFactor = grossLoss > 1e-12 ? grossWin / grossLoss : (grossWin > 0 ? 99 : 0);
    let bTotal = null;
    if (benchmark && benchmark.length === equity.length) {
      bTotal = benchmark[n - 1] / benchmark[0] - 1;
    }
    const monthly = monthlyReturns(equity, dates);
    const mrets = monthly.map((m) => m.ret);
    const bestMonth = mrets.length ? Math.max(...mrets) : 0;
    const worstMonth = mrets.length ? Math.min(...mrets) : 0;
    const eqRets = rets;
    const var95 = quantile(eqRets, 0.05);
    const m = mean(eqRets);
    const sd = stdev(eqRets);
    const skew = sd > 1e-12 ? mean(eqRets.map((r) => Math.pow((r - m) / sd, 3))) : 0;
    return {
      total,
      cagr,
      vol,
      sharpe,
      sortino,
      maxDD,
      calmar,
      trades: trades.length,
      winRate: trades.length ? wins.length / trades.length : 0,
      profitFactor,
      avgTrade: trades.length ? mean(trades.map((t) => t.pnl)) : 0,
      avgWin: wins.length ? mean(wins.map((t) => t.pnl)) : 0,
      avgLoss: losses.length ? mean(losses.map((t) => t.pnl)) : 0,
      expectancy: trades.length ? mean(trades.map((t) => t.pnl)) : 0,
      bestMonth,
      worstMonth,
      var95,
      skew,
      benchmarkTotal: bTotal,
      months: monthly.length,
    };
  }

  function emptyMetrics() {
    return {
      total: 0, cagr: 0, vol: 0, sharpe: 0, sortino: 0, maxDD: 0, calmar: 0,
      trades: 0, winRate: 0, profitFactor: 0, avgTrade: 0, avgWin: 0, avgLoss: 0,
      expectancy: 0, bestMonth: 0, worstMonth: 0, var95: 0, skew: 0,
      benchmarkTotal: null, months: 0,
    };
  }

  function sliceEquity(equity, dates, from, to) {
    const e = equity.slice(from, to + 1).map((v) => v / equity[from]);
    return { equity: e, dates: dates.slice(from, to + 1) };
  }

  /* ------------------------------------------------------------------ */
  /* single-asset runner                                                 */
  /* ------------------------------------------------------------------ */

  function runSingle(prepared, opts) {
    const { dates, n } = prepared;
    const sym = prepared.symbols[opts.symbol];
    if (!sym) throw new Error("Missing symbol " + opts.symbol);
    const open = sym.o;
    const close = sym.c;
    const high = sym.h;
    const low = sym.l;
    const signal = opts.signal;
    const cost = (opts.costBps || 0) / 10000;
    const volTarget = opts.volTarget || 0;
    const maxLev = opts.maxLev == null ? 1 : opts.maxLev;
    const atrStopMult = opts.atrStop || 0;
    const atrArr = atrStopMult ? atr(high, low, close, 20) : null;
    const ret1 = new Array(n).fill(null);
    for (let i = 1; i < n; i++) if (open[i - 1] > 0) ret1[i] = open[i] / open[i - 1] - 1;
    const dailyRet = new Array(n).fill(null);
    for (let i = 1; i < n; i++) if (close[i - 1] > 0) dailyRet[i] = close[i] / close[i - 1] - 1;
    const realizedVol = new Array(n).fill(0);
    for (let i = 21; i < n; i++) {
      const part = dailyRet.slice(i - 20, i).filter(isNum);
      if (part.length >= 15) realizedVol[i] = stdev(part) * Math.sqrt(252);
    }

    const equity = new Array(n).fill(1);
    const trades = [];
    let pos = 0;
    let entryPrice = 0;
    let entryIndex = -1;
    let stopPrice = null;
    let totalTurnover = 0;
    let exposureDays = 0;
    const debug = opts.debug ? [] : null;

    let i = 1;
    while (i < n - 1) {
      let desired = signal[i - 1] || 0;

      // hard stop / max hold are evaluated on the previous close, executed now
      if (pos !== 0 && entryIndex >= 0) {
        if (atrStopMult && stopPrice != null) {
          if (pos > 0 && close[i - 1] <= stopPrice) desired = 0;
          if (pos < 0 && close[i - 1] >= stopPrice) desired = 0;
        }
        if (opts.maxHold && i - 1 - entryIndex >= opts.maxHold) desired = 0;
      }

      let size = 1;
      if (volTarget > 0) {
        const rv = realizedVol[i - 1] || realizedVol[i - 2] || 0;
        size = rv > 1e-6 ? clamp(volTarget / rv, 0, maxLev) : 1;
      }
      const target = desired === 0 ? 0 : desired * size;

      const turnover = Math.abs(target - pos);
      totalTurnover += turnover;
      const r = ret1[i + 1] || 0;
      equity[i + 1] = equity[i] * (1 + target * r - turnover * cost);
      if (target !== 0) exposureDays++;
      if (debug) debug.push({ date: dates[i], sig: signal[i - 1], posBefore: pos, target, r, turnover, equity: equity[i + 1], close: close[i] });

      // position changes are executed at this open
      if (target !== 0 && (pos === 0 || Math.sign(target) !== Math.sign(pos))) {
        if (pos !== 0) {
          const pnl = pos * (open[i] / entryPrice - 1) - 2 * cost;
          trades.push({
            entryDate: dates[entryIndex], exitDate: dates[i], entry: entryPrice, exit: open[i],
            side: pos > 0 ? "L" : "S", pnl, bars: i - entryIndex,
          });
        }
        entryPrice = open[i];
        entryIndex = i;
        stopPrice = null;
        if (atrStopMult && isNum(atrArr[i - 1])) {
          stopPrice = target > 0
            ? open[i] - atrStopMult * atrArr[i - 1]
            : open[i] + atrStopMult * atrArr[i - 1];
        }
      } else if (target === 0 && pos !== 0) {
        const pnl = pos * (open[i] / entryPrice - 1) - 2 * cost;
        trades.push({
          entryDate: dates[entryIndex], exitDate: dates[i], entry: entryPrice, exit: open[i],
          side: pos > 0 ? "L" : "S", pnl, bars: i - entryIndex,
        });
        entryIndex = -1;
        stopPrice = null;
      }

      pos = target;
      i++;
    }

    // close any open position at the final open
    if (pos !== 0 && entryIndex >= 0) {
      const last = n - 1;
      const pnl = pos * (open[last] / entryPrice - 1) - 2 * cost;
      trades.push({
        entryDate: dates[entryIndex], exitDate: dates[last], entry: entryPrice, exit: open[last],
        side: pos > 0 ? "L" : "S", pnl, bars: last - entryIndex,
      });
    }

    const benchSym = prepared.symbols[opts.benchmark];
    const benchmark = new Array(n).fill(1);
    if (benchSym) {
      for (let j = 1; j < n; j++) {
        const br = benchSym.o[j] > 0 ? benchSym.o[j] / benchSym.o[j - 1] - 1 : 0;
        benchmark[j] = benchmark[j - 1] * (1 + br);
      }
    }

    return { equity, benchmark, trades, exposureDays, totalTurnover, debug };
  }

  /* ------------------------------------------------------------------ */
  /* signal builders                                                     */
  /* ------------------------------------------------------------------ */

  function sigTrend(prepared, p) {
    const sym = prepared.symbols[p.symbol];
    const c = sym.c;
    const fast = sma(c, p.fast || 50);
    const slow = sma(c, p.slow || 200);
    const sl = slope(slow, p.slope || 20);
    const vix = p.vixMax && prepared.symbols["^VIX"] ? prepared.symbols["^VIX"].c : null;
    const out = new Array(c.length).fill(0);
    for (let i = 0; i < c.length; i++) {
      if (![fast[i], slow[i], sl[i]].every(isNum)) continue;
      let s = 0;
      if (fast[i] > slow[i] && sl[i] > 0) s = 1;
      else if ((p.mode || "long") === "both" && fast[i] < slow[i] && sl[i] < 0) s = -1;
      if (s !== 0 && vix && isNum(vix[i]) && vix[i] > p.vixMax) s = 0;
      out[i] = s;
    }
    return out;
  }

  function sigBreakout(prepared, p) {
    const c = prepared.symbols[p.symbol].c;
    const hi = rollingMax(c, p.entry || 55);
    const lo = rollingMin(c, p.exit || 20);
    const trend = p.trend ? sma(c, p.trend) : null;
    const out = new Array(c.length).fill(0);
    let state = 0;
    for (let i = 0; i < c.length; i++) {
      if (!isNum(c[i])) { out[i] = 0; continue; }
      const trendOk = !trend || (isNum(trend[i]) && c[i] > trend[i]);
      if (state === 0) {
        if (isNum(hi[i]) && c[i] > hi[i] && trendOk) state = 1;
        else if ((p.mode || "long") === "both" && isNum(lo[i]) && c[i] < lo[i] && (!trend || (isNum(trend[i]) && c[i] < trend[i]))) state = -1;
      } else if (state > 0) {
        if (isNum(lo[i]) && c[i] < lo[i]) state = 0;
      } else if (state < 0) {
        if (isNum(hi[i]) && c[i] > hi[i]) state = 0;
      }
      out[i] = state;
    }
    return out;
  }

  function sigRsi(prepared, p) {
    const c = prepared.symbols[p.symbol].c;
    const r = rsi(c, p.rsiLen || 2);
    const trend = p.trendFilter ? sma(c, p.trendFilter) : null;
    const out = new Array(c.length).fill(0);
    let state = 0;
    let held = 0;
    for (let i = 0; i < c.length; i++) {
      if (state === 0) {
        const trendOk = !trend || (isNum(trend[i]) && c[i] > trend[i]);
        if (trendOk && isNum(r[i]) && r[i] < (p.entry || 10)) { state = 1; held = 0; }
      } else {
        held++;
        if ((isNum(r[i]) && r[i] > (p.exit || 60)) || held >= (p.maxHold || 5)) state = 0;
      }
      out[i] = state;
    }
    return out;
  }

  function sigBollinger(prepared, p) {
    const c = prepared.symbols[p.symbol].c;
    const mid = sma(c, p.len || 20);
    const sd = rollingStd(c, p.len || 20);
    const out = new Array(c.length).fill(0);
    let state = 0;
    let held = 0;
    for (let i = 0; i < c.length; i++) {
      if (![mid[i], sd[i]].every(isNum)) continue;
      const lower = mid[i] - (p.k || 2) * sd[i];
      if (state === 0 && c[i] < lower) { state = 1; held = 0; }
      else if (state === 1) {
        held++;
        if (c[i] >= mid[i] || held >= (p.maxHold || 20)) state = 0;
      }
      out[i] = state;
    }
    return out;
  }

  function sigZ(prepared, p) {
    const c = prepared.symbols[p.symbol].c;
    const z = zscore(c, p.len || 20);
    const out = new Array(c.length).fill(0);
    let state = 0;
    let held = 0;
    for (let i = 0; i < c.length; i++) {
      if (!isNum(z[i])) continue;
      if (state === 0 && z[i] < -(p.entryZ || 2)) { state = 1; held = 0; }
      else if (state === 1) {
        held++;
        if (z[i] > -(p.exitZ || 0.3) || held >= (p.maxHold || 20)) state = 0;
      }
      out[i] = state;
    }
    return out;
  }

  function sigSeasonality(prepared, p) {
    const dates = prepared.dates;
    const n = dates.length;
    const out = new Array(n).fill(0);
    const day = (d) => Number(d.slice(8, 10));
    const month = (d) => d.slice(0, 7);
    const byMonth = new Map();
    for (let i = 0; i < n; i++) {
      if (!byMonth.has(month(dates[i]))) byMonth.set(month(dates[i]), []);
      byMonth.get(month(dates[i])).push(i);
    }
    const active = new Set();
    for (const [, idxs] of byMonth) {
      for (let k = Math.max(0, idxs.length - (p.daysBefore || 2)); k < idxs.length; k++) active.add(idxs[k]);
      for (let k = 0; k < Math.min(idxs.length, p.daysAfter || 3); k++) active.add(idxs[k]);
    }
    for (let i = 0; i < n; i++) out[i] = active.has(i) ? 1 : 0;
    return out;
  }

  function gapIntraday(prepared, p, mode) {
    const sym = prepared.symbols[p.symbol];
    const n = prepared.n;
    const o = sym.o;
    const c = sym.c;
    const trend = p.trend ? sma(c, p.trend) : null;
    const pos = new Array(n).fill(0);
    const rets = new Array(n).fill(0);
    const trades = [];
    const cost = (p.costBps || 2) / 10000;
    for (let i = 1; i < n; i++) {
      if (!(o[i] > 0 && c[i - 1] > 0)) continue;
      const gap = o[i] / c[i - 1] - 1;
      let dir = 0;
      const trendUp = !trend || (isNum(trend[i - 1]) && c[i - 1] > trend[i - 1]);
      const trendDown = !trend || (isNum(trend[i - 1]) && c[i - 1] < trend[i - 1]);
      if (mode === "continue") {
        if (gap > (p.gap || 0.005) && trendUp) dir = 1;
        else if (gap < -(p.gap || 0.005) && trendDown) dir = -1;
      } else {
        if (gap > (p.gap || 0.01)) dir = -1;
        else if (gap < -(p.gap || 0.01)) dir = 1;
      }
      if ((p.mode || "both") === "long" && dir < 0) dir = 0;
      if (dir === 0) continue;
      const r = c[i] / o[i] - 1;
      pos[i] = dir;
      rets[i] = dir * r - cost * 2;
      trades.push({ entryDate: prepared.dates[i], exitDate: prepared.dates[i], entry: o[i], exit: c[i], side: dir > 0 ? "L" : "S", pnl: dir * r - cost * 2, bars: 0 });
    }
    const equity = new Array(n).fill(1);
    for (let i = 1; i < n; i++) equity[i] = equity[i - 1] * (1 + (pos[i] ? rets[i] : 0));
    const benchSym = prepared.symbols[p.benchmark] || sym;
    const benchmark = new Array(n).fill(1);
    for (let i = 1; i < n; i++) {
      const br = benchSym.o[i] > 0 ? benchSym.o[i] / benchSym.o[i - 1] - 1 : 0;
      benchmark[i] = benchmark[i - 1] * (1 + br);
    }
    return { equity, benchmark, trades, exposureDays: pos.filter((x) => x !== 0).length, totalTurnover: trades.length * 2 };
  }

  /* ------------------------------------------------------------------ */
  /* pairs                                                               */
  /* ------------------------------------------------------------------ */

  function runPairs(prepared, p) {
    const a = prepared.symbols[p.a];
    const b = prepared.symbols[p.b];
    if (!a || !b) throw new Error("Pairs legs missing");
    const n = prepared.n;
    const la = a.c.map((x) => Math.log(x));
    const lb = b.c.map((x) => Math.log(x));
    const beta = betaOf(a.c, b.c, p.lookback || 60);
    const spread = new Array(n).fill(null);
    for (let i = 0; i < n; i++) if (isNum(la[i]) && isNum(lb[i]) && isNum(beta[i])) spread[i] = la[i] - beta[i] * lb[i];
    const z = new Array(n).fill(null);
    for (let i = (p.lookback || 60); i < n; i++) {
      const slice = spread.slice(i - (p.lookback || 60) + 1, i + 1);
      if (slice.some((x) => !isNum(x))) continue;
      const m = mean(slice);
      const sd = stdev(slice);
      if (sd > 1e-12) z[i] = (spread[i] - m) / sd;
    }
    const cost = (p.costBps || 3) / 10000;
    const equity = new Array(n).fill(1);
    const trades = [];
    let state = 0;
    let entryZ = 0;
    let entryIndex = -1;
    let entryBeta = 1;
    let exposure = 0;
    for (let i = 1; i < n - 1; i++) {
      const zz = z[i - 1];
      let target = state;
      if (state === 0 && isNum(zz)) {
        if (zz > (p.entryZ || 2)) { target = -1; entryZ = zz; entryIndex = i; entryBeta = beta[i - 1] || 1; }
        else if (zz < -(p.entryZ || 2)) { target = 1; entryZ = zz; entryIndex = i; entryBeta = beta[i - 1] || 1; }
      } else if (state !== 0 && isNum(zz)) {
        if (Math.abs(zz) < (p.exitZ || 0.5) || Math.abs(zz) > (p.stopZ || 3.5) || i - entryIndex > (p.maxHold || 60)) {
          target = 0;
          const gross = pairReturn(a, b, entryBeta, entryIndex, i, state);
          const pnl = gross - 2 * cost;
          trades.push({ entryDate: prepared.dates[entryIndex], exitDate: prepared.dates[i], entry: entryZ, exit: zz, side: state > 0 ? "L" : "S", pnl, bars: i - entryIndex });
        }
      }
      const turnover = Math.abs(target - state);
      const r = pairReturn(a, b, beta, i, i + 1, target);
      equity[i + 1] = equity[i] * (1 + r - turnover * cost * 2);
      if (target !== 0) exposure++;
      state = target;
      if (state === 0) entryIndex = -1;
    }
    if (state !== 0 && entryIndex >= 0) {
      const gross = pairReturn(a, b, entryBeta, entryIndex, n - 1, state);
      trades.push({ entryDate: prepared.dates[entryIndex], exitDate: prepared.dates[n - 1], entry: entryZ, exit: z[n - 1], side: state > 0 ? "L" : "S", pnl: gross - 2 * cost, bars: n - 1 - entryIndex });
    }
    const benchmark = new Array(n).fill(1);
    for (let i = 1; i < n; i++) {
      const ra = a.o[i] / a.o[i - 1] - 1;
      const rb = b.o[i] / b.o[i - 1] - 1;
      benchmark[i] = benchmark[i - 1] * (1 + 0.5 * ra + 0.5 * rb);
    }
    return { equity, benchmark, trades, exposureDays: exposure, totalTurnover: exposure * 2 };
  }

  function pairReturn(a, b, beta, i, j, state) {
    if (!state || i < 0 || j >= a.o.length) return 0;
    const ra = a.o[j] / a.o[i] - 1;
    const rb = b.o[j] / b.o[i] - 1;
    const bt = typeof beta === "number" ? beta : (beta[i] || 1);
    const wb = clamp(0.5 * bt, 0, 0.9);
    return state * (0.5 * ra - wb * rb);
  }

  /* ------------------------------------------------------------------ */
  /* cross-sectional                                                     */
  /* ------------------------------------------------------------------ */

  function runCrossSectional(prepared, p, kind) {
    const syms = p.universe;
    const n = prepared.n;
    const closes = syms.map((s) => prepared.symbols[s].c);
    const opens = syms.map((s) => prepared.symbols[s].o);
    const costs = (p.costBps || 3) / 10000;
    const rebalance = p.rebalance || 21;
    const equity = new Array(n).fill(1);
    const weights = syms.map(() => 0);
    const trades = [];
    let lastRebalance = -999;
    let exposure = 0;
    let pendingTurnover = 0;

    function rebalanceAt(signalIndex, execIndex) {
      const scores = syms.map((s, j) => {
        const c = closes[j];
        const look = p.lookback || 126;
        if (!isNum(c[signalIndex]) || !isNum(c[signalIndex - look])) return -Infinity;
        const skip = p.skip || 0;
        if (skip && (!isNum(c[signalIndex - skip]) || c[signalIndex - skip] <= 0)) return -Infinity;
        const base = skip ? c[signalIndex - skip] : c[signalIndex];
        let score = base / c[signalIndex - look] - 1;
        if (kind === "reversal") score = -score;
        if (kind === "factor") {
          const rets = [];
          for (let k = Math.max(1, signalIndex - 20); k <= signalIndex; k++) {
            if (isNum(c[k]) && isNum(c[k - 1])) rets.push(c[k] / c[k - 1] - 1);
          }
          const vol = rets.length > 5 ? stdev(rets) * Math.sqrt(252) : 1;
          score = score / Math.max(vol, 0.05);
        }
        return score;
      });
      const valid = scores.map((s, j) => ({ s, j })).filter((x) => Number.isFinite(x.s));
      valid.sort((x, y) => y.s - x.s);
      if (valid.length < 2) return 0;
      const topN = Math.min(p.topN || 2, valid.length);
      const bottomN = Math.min(p.bottomN || 2, valid.length - topN);
      const next = syms.map(() => 0);
      for (let k = 0; k < topN; k++) next[valid[k].j] = (p.longOnly ? 1 : 0.5) / topN;
      if (!p.longOnly) {
        for (let k = 0; k < bottomN; k++) next[valid[valid.length - 1 - k].j] = -0.5 / bottomN;
      }
      let turnover = 0;
      for (let j = 0; j < syms.length; j++) turnover += Math.abs(next[j] - weights[j]);
      for (let j = 0; j < syms.length; j++) weights[j] = next[j];
      if (trades.length) trades[trades.length - 1].exitIdx = execIndex;
      trades.push({
        entryDate: prepared.dates[execIndex], exitDate: null, side: "REBAL",
        pnl: 0, bars: 0, entryIdx: execIndex, exitIdx: null,
        basket: valid.slice(0, topN).map((x) => syms[x.j]).join(","),
        shortBasket: p.longOnly ? "" : valid.slice(-bottomN).map((x) => syms[x.j]).join(","),
        turnover,
      });
      return turnover;
    }

    for (let i = 1; i < n - 1; i++) {
      if (i - lastRebalance >= rebalance) {
        pendingTurnover = rebalanceAt(i - 1, i);
        lastRebalance = i;
      }
      let r = 0;
      for (let j = 0; j < syms.length; j++) {
        if (weights[j] === 0) continue;
        r += weights[j] * (opens[j][i + 1] / opens[j][i] - 1);
      }
      equity[i + 1] = equity[i] * (1 + r - pendingTurnover * costs);
      pendingTurnover = 0;
      if (weights.some((w) => w !== 0)) exposure++;
    }

    for (const t of trades) {
      if (t.exitIdx == null) t.exitIdx = n - 1;
      t.exitDate = prepared.dates[t.exitIdx];
      t.bars = t.exitIdx - t.entryIdx;
      t.pnl = equity[t.exitIdx] / equity[t.entryIdx] - 1;
    }

    const benchSym = prepared.symbols[p.benchmark];
    const benchmark = new Array(n).fill(1);
    if (benchSym) for (let i = 1; i < n; i++) benchmark[i] = benchmark[i - 1] * (1 + (benchSym.o[i] / benchSym.o[i - 1] - 1));
    return { equity, benchmark, trades, exposureDays: exposure, totalTurnover: trades.reduce((s, t) => s + (t.turnover || 0), 0) };
  }

  /* ------------------------------------------------------------------ */
  /* portfolio strategies                                                */
  /* ------------------------------------------------------------------ */

  function finalizePortfolioTrades(trades, equity, dates, n) {
    for (let i = 0; i < trades.length; i++) {
      const t = trades[i];
      if (t.exitIdx == null) t.exitIdx = i + 1 < trades.length ? trades[i + 1].entryIdx : n - 1;
      t.exitDate = dates[t.exitIdx];
      t.bars = t.exitIdx - t.entryIdx;
      t.pnl = equity[t.exitIdx] / equity[t.entryIdx] - 1;
    }
  }

  function runDualMomentum(prepared, p) {
    const risky = p.universe || ["SPY", "EFA", "EEM", "GLD"];
    const defensive = p.defensive || "TLT";
    const all = risky.concat([defensive]);
    const n = prepared.n;
    const opens = all.map((s) => prepared.symbols[s].o);
    const closes = all.map((s) => prepared.symbols[s].c);
    const costRate = (p.costBps || 3) / 10000;
    const equity = new Array(n).fill(1);
    const weights = all.map(() => 0);
    const trades = [];
    let last = -999;
    for (let i = 1; i < n - 1; i++) {
      if (i - last >= (p.rebalance || 21)) {
        const look = p.lookback || 252;
        const scores = all.map((s, j) => (isNum(closes[j][i - 1]) && isNum(closes[j][i - 1 - look]) ? closes[j][i - 1] / closes[j][i - 1 - look] - 1 : -Infinity));
        let best = 0;
        for (let j = 1; j < risky.length; j++) if (scores[j] > scores[best]) best = j;
        const defIdx = all.length - 1;
        let choose = scores[best] > scores[defIdx] ? best : defIdx;
        if (p.trendFilter) {
          const ma = sma(closes[choose], p.trendFilter);
          if (!isNum(ma[i - 1]) || closes[choose][i - 1] < ma[i - 1]) choose = defIdx;
          const defMa = sma(closes[defIdx], p.trendFilter);
          if (choose === defIdx && (!isNum(defMa[i - 1]) || closes[defIdx][i - 1] < defMa[i - 1])) choose = -1;
        }
        const next = all.map(() => 0);
        if (choose >= 0) next[choose] = 1;
        let turnover = 0;
        for (let j = 0; j < all.length; j++) turnover += Math.abs(next[j] - weights[j]);
        for (let j = 0; j < all.length; j++) weights[j] = next[j];
        trades.push({ entryDate: prepared.dates[i], exitDate: null, side: "ROT", pnl: 0, bars: 0, entryIdx: i, exitIdx: null, basket: choose >= 0 ? all[choose] : "CASH", turnover });
        last = i;
      }
      let r = 0;
      for (let j = 0; j < all.length; j++) if (weights[j]) r += weights[j] * (opens[j][i + 1] / opens[j][i] - 1);
      let cost = 0;
      if (last === i) cost = (trades[trades.length - 1].turnover || 0) * costRate;
      equity[i + 1] = equity[i] * (1 + r - cost);
    }
    finalizePortfolioTrades(trades, equity, prepared.dates, n);
    const benchSym = prepared.symbols[p.benchmark || "SPY"];
    const benchmark = new Array(n).fill(1);
    for (let i = 1; i < n; i++) benchmark[i] = benchmark[i - 1] * (1 + (benchSym.o[i] / benchSym.o[i - 1] - 1));
    return { equity, benchmark, trades, exposureDays: n, totalTurnover: trades.reduce((s, t) => s + (t.turnover || 0), 0) };
  }

  function runRiskParity(prepared, p) {
    const universe = p.universe || ["SPY", "TLT", "GLD", "USO"];
    const n = prepared.n;
    const opens = universe.map((s) => prepared.symbols[s].o);
    const closes = universe.map((s) => prepared.symbols[s].c);
    const costRate = (p.costBps || 3) / 10000;
    const equity = new Array(n).fill(1);
    let weights = universe.map(() => 1 / universe.length);
    let last = -999;
    const trades = [];
    for (let i = 1; i < n - 1; i++) {
      if (i - last >= (p.rebalance || 21)) {
        const vols = universe.map((s, j) => {
          const rets = [];
          for (let k = Math.max(1, i - (p.lookback || 60)); k <= i; k++) rets.push(closes[j][k] / closes[j][k - 1] - 1);
          return stdev(rets) * Math.sqrt(252);
        });
        const inv = vols.map((v) => 1 / Math.max(v, 0.03));
        const sum = inv.reduce((s, x) => s + x, 0);
        let next = inv.map((x) => (x / sum) * (p.maxLev || 1));
        const gross = next.reduce((s, x) => s + x, 0);
        if (gross > (p.maxLev || 1)) next = next.map((x) => x * (p.maxLev || 1) / gross);
        let turnover = 0;
        for (let j = 0; j < universe.length; j++) turnover += Math.abs(next[j] - weights[j]);
        weights = next;
        trades.push({ entryDate: prepared.dates[i], exitDate: null, side: "RP", pnl: 0, bars: 0, entryIdx: i, exitIdx: null, basket: universe.join(","), turnover });
        last = i;
      }
      let r = 0;
      for (let j = 0; j < universe.length; j++) r += weights[j] * (opens[j][i + 1] / opens[j][i] - 1);
      let tradeCost = 0;
      if (last === i) tradeCost = (trades[trades.length - 1].turnover || 0) * costRate;
      equity[i + 1] = equity[i] * (1 + r - tradeCost);
    }
    finalizePortfolioTrades(trades, equity, prepared.dates, n);
    const benchSym = prepared.symbols[p.benchmark || "SPY"];
    const benchmark = new Array(n).fill(1);
    for (let i = 1; i < n; i++) benchmark[i] = benchmark[i - 1] * (1 + (benchSym.o[i] / benchSym.o[i - 1] - 1));
    return { equity, benchmark, trades, exposureDays: n, totalTurnover: trades.reduce((s, t) => s + (t.turnover || 0), 0) };
  }

  function runTrendBasket(prepared, p) {
    const universe = p.universe || ["SPY", "TLT", "GLD", "USO"];
    const n = prepared.n;
    const opens = universe.map((s) => prepared.symbols[s].o);
    const closes = universe.map((s) => prepared.symbols[s].c);
    const costRate = (p.costBps || 3) / 10000;
    const equity = new Array(n).fill(1);
    let weights = universe.map(() => 0);
    let last = -999;
    const trades = [];
    for (let i = 1; i < n - 1; i++) {
      if (i - last >= (p.rebalance || 21)) {
        const next = universe.map((s, j) => {
          const ma = sma(closes[j], p.lookback || 200);
          if (!isNum(ma[i])) return 0;
          const w = 1 / universe.length; return closes[j][i] > ma[i] ? w : (p.longShort === false ? 0 : -w);
        });
        let turnover = 0;
        for (let j = 0; j < universe.length; j++) turnover += Math.abs(next[j] - weights[j]);
        weights = next;
        trades.push({ entryDate: prepared.dates[i], exitDate: null, side: "TSMOM", pnl: 0, bars: 0, entryIdx: i, exitIdx: null, basket: universe.map((s, j) => s + ":" + weights[j]).join(" "), turnover });
        last = i;
      }
      let r = 0;
      for (let j = 0; j < universe.length; j++) r += weights[j] * (opens[j][i + 1] / opens[j][i] - 1);
      let tradeCost = 0;
      if (last === i) tradeCost = (trades[trades.length - 1].turnover || 0) * costRate;
      equity[i + 1] = equity[i] * (1 + r - tradeCost);
    }
    finalizePortfolioTrades(trades, equity, prepared.dates, n);
    const benchSym = prepared.symbols[p.benchmark || "SPY"];
    const benchmark = new Array(n).fill(1);
    for (let i = 1; i < n; i++) benchmark[i] = benchmark[i - 1] * (1 + (benchSym.o[i] / benchSym.o[i - 1] - 1));
    return { equity, benchmark, trades, exposureDays: n, totalTurnover: trades.reduce((s, t) => s + (t.turnover || 0), 0) };
  }

  /* ------------------------------------------------------------------ */
  /* public API                                                          */
  /* ------------------------------------------------------------------ */

  Engine.run = function run(strategy, market, overrides) {
    const p = Object.assign({}, strategy.params || {}, overrides || {});
    const start = (overrides && overrides.start) || "2017-01-01";
    const end = (overrides && overrides.end) || "2026-11-03";
    const costBps = overrides && overrides.costBps != null ? overrides.costBps : (strategy.costBps || 2);
    const symbols = Array.from(new Set([].concat(
      strategy.symbols || [],
      strategy.universe || [],
      p.universe || [],
      [p.a, p.b, p.defensive, strategy.benchmark].filter(Boolean)
    )));
    const prepared = prepare(market, symbols, start, end);
    const n = prepared.n;
    let raw;

    switch (strategy.engine) {
      case "trend_ma": {
        const signal = sigTrend(prepared, Object.assign({ symbol: strategy.symbols[0] }, p));
        raw = runSingle(prepared, {
          symbol: strategy.symbols[0], signal, benchmark: strategy.benchmark || "SPY",
          costBps, volTarget: p.volTarget || 0, maxLev: p.maxLev || 1, atrStop: p.atrStop || 0, maxHold: p.maxHold || 0, debug: overrides && overrides.debug,
        });
        break;
      }
      case "breakout": {
        const signal = sigBreakout(prepared, Object.assign({ symbol: strategy.symbols[0] }, p));
        raw = runSingle(prepared, {
          symbol: strategy.symbols[0], signal, benchmark: strategy.benchmark || "SPY",
          costBps, volTarget: p.volTarget || 0, maxLev: p.maxLev || 1, atrStop: p.atrStop || 0, debug: overrides && overrides.debug,
        });
        break;
      }
      case "rsi_reversion": {
        const signal = sigRsi(prepared, Object.assign({ symbol: strategy.symbols[0] }, p));
        raw = runSingle(prepared, { symbol: strategy.symbols[0], signal, benchmark: strategy.benchmark || "SPY", costBps, atrStop: p.atrStop || 0, maxHold: p.maxHold || 0, debug: overrides && overrides.debug });
        break;
      }
      case "bollinger": {
        const signal = sigBollinger(prepared, Object.assign({ symbol: strategy.symbols[0] }, p));
        raw = runSingle(prepared, { symbol: strategy.symbols[0], signal, benchmark: strategy.benchmark || "SPY", costBps, atrStop: p.atrStop || 0, maxHold: p.maxHold || 0, debug: overrides && overrides.debug });
        break;
      }
      case "zscore_reversion": {
        const signal = sigZ(prepared, Object.assign({ symbol: strategy.symbols[0] }, p));
        raw = runSingle(prepared, { symbol: strategy.symbols[0], signal, benchmark: strategy.benchmark || "SPY", costBps, atrStop: p.atrStop || 0, maxHold: p.maxHold || 0, debug: overrides && overrides.debug });
        break;
      }
      case "seasonality": {
        const signal = sigSeasonality(prepared, p);
        raw = runSingle(prepared, { symbol: strategy.symbols[0], signal, benchmark: strategy.benchmark || "SPY", costBps, volTarget: 0, maxLev: 1, debug: overrides && overrides.debug });
        break;
      }
      case "gap_continuation":
        raw = gapIntraday(prepared, Object.assign({ symbol: strategy.symbols[0], benchmark: strategy.benchmark || "SPY" }, p), "continue");
        break;
      case "gap_fade":
        raw = gapIntraday(prepared, Object.assign({ symbol: strategy.symbols[0], benchmark: strategy.benchmark || "SPY" }, p), "fade");
        break;
      case "pairs":
        raw = runPairs(prepared, Object.assign({ costBps }, p));
        break;
      case "dual_momentum":
        raw = runDualMomentum(prepared, Object.assign({ costBps }, p));
        break;
      case "xs_momentum":
        raw = runCrossSectional(prepared, Object.assign({ costBps, universe: strategy.universe || p.universe, benchmark: strategy.benchmark || "SPY" }, p), "momentum");
        break;
      case "xs_reversal":
        raw = runCrossSectional(prepared, Object.assign({ costBps, universe: strategy.universe || p.universe, benchmark: strategy.benchmark || "SPY" }, p), "reversal");
        break;
      case "xs_factor":
        raw = runCrossSectional(prepared, Object.assign({ costBps, universe: strategy.universe || p.universe, benchmark: strategy.benchmark || "SPY" }, p), "factor");
        break;
      case "risk_parity":
        raw = runRiskParity(prepared, Object.assign({ costBps }, p));
        break;
      case "trend_basket":
        raw = runTrendBasket(prepared, Object.assign({ costBps }, p));
        break;
      default:
        throw new Error("Unknown engine: " + strategy.engine);
    }

    const periods = periodsPerYear(prepared.dates);
    const split = Math.max(2, Math.min(n - 3, Math.floor(n * 0.7)));
    const isSlice = sliceEquity(raw.equity, prepared.dates, 0, split);
    const oosSlice = sliceEquity(raw.equity, prepared.dates, split, n - 1);
    const isTrades = raw.trades.filter((t) => t.exitDate <= prepared.dates[split]);
    const oosTrades = raw.trades.filter((t) => t.entryDate >= prepared.dates[split]);
    const metrics = calcMetrics(raw.equity, prepared.dates, raw.trades, raw.benchmark, periods);
    const isMetrics = calcMetrics(isSlice.equity, isSlice.dates, isTrades, null, periodsPerYear(isSlice.dates));
    const oosMetrics = calcMetrics(oosSlice.equity, oosSlice.dates, oosTrades, null, periodsPerYear(oosSlice.dates));
    const dd = drawdownSeries(raw.equity);
    return {
      ok: true,
      dates: prepared.dates,
      equity: raw.equity,
      benchmark: raw.benchmark,
      drawdown: dd,
      metrics,
      isMetrics,
      oosMetrics,
      monthly: monthlyReturns(raw.equity, prepared.dates),
      trades: raw.trades,
      debug: raw.debug || null,
      exposure: raw.exposureDays / Math.max(n - 1, 1),
      turnover: raw.totalTurnover,
      periods,
      splitIndex: split,
      splitDate: prepared.dates[split],
      start: prepared.dates[0],
      end: prepared.dates[n - 1],
      params: p,
      symbols: symbols,
    };
  };

  Engine.indicators = { sma, ema, rsi, atr, zscore, slope, roc, rollingMax, rollingMin, stdev, betaOf };
  Engine.metrics = calcMetrics;
  Engine._debug = { prepare, sigTrend, sigBreakout, sigRsi, sigBollinger, sigZ };
  global.AlphaEngine = Engine;
})(typeof window !== "undefined" ? window : globalThis);




