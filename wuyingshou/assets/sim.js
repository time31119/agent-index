/* 模拟交易引擎 — 与 Python 回测引擎规则逐条对应
 * 若要验证一致性: node tools/verify_sim.js (比对样本外区间结果)
 */
(function (root) {
  'use strict';

  const CFG = {
    risk_pct: 0.75, max_lots: 5, min_lots: 0.01, lot_step: 0.01,
    contract: 100, spread: 0.20, block_hours: [21, 22], friday_cutoff: 19
  };

  const emaK = n => 2 / (n + 1);

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- 流式指标 (与 Python 实现逐位对齐) ---------- */
  class Indicators {
    constructor() {
      this.n = 0;
      this.ema21 = null; this.ema55 = null;
      this.mf = null; this.ms = null; this.sig = null;
      this.prevHist = null; this.hist = null;
      this.ag = 0; this.al = 0; this.rsi = null;
      this.trSum = 0; this.atr = null; this.prevClose = null;
      this.win = []; this.winSum = 0; this.winSq = 0;
      this.sma20 = null; this.bbUp = null; this.bbDn = null;
      this.ema21hist = [];
    }
    push(o, h, l, c) {
      const i = this.n++;
      // EMA 21 / 55
      if (i === 0) { this.ema21 = c; this.ema55 = c; }
      else {
        this.ema21 = c * emaK(21) + this.ema21 * (1 - emaK(21));
        this.ema55 = c * emaK(55) + this.ema55 * (1 - emaK(55));
      }
      this.ema21hist.push(this.ema21);
      // MACD 12/26/9
      if (i === 0) { this.mf = c; this.ms = c; this.sig = 0; }
      else {
        this.mf = c * emaK(12) + this.mf * (1 - emaK(12));
        this.ms = c * emaK(26) + this.ms * (1 - emaK(26));
      }
      const line = this.mf - this.ms;
      if (i === 0) { this.sig = line; this.prevHist = 0; this.hist = 0; }
      else {
        const prevLine = this.prevLine === undefined ? line : this.prevLine;
        this.sig = line * emaK(9) + this.sig * (1 - emaK(9));
        this.prevHist = this.hist;
        this.hist = line - this.sig;
        this.prevLine = line;
      }
      // RSI 14 (Wilder)
      if (i > 0) {
        const ch = c - this.prevClose2;
        if (i <= 14) {
          this.ag += Math.max(ch, 0); this.al += Math.max(-ch, 0);
          if (i === 14) { this.ag /= 14; this.al /= 14; this.rsi = this.al === 0 ? 100 : 100 - 100 / (1 + this.ag / this.al); }
        } else {
          this.ag = (this.ag * 13 + Math.max(ch, 0)) / 14;
          this.al = (this.al * 13 + Math.max(-ch, 0)) / 14;
          this.rsi = this.al === 0 ? 100 : 100 - 100 / (1 + this.ag / this.al);
        }
      }
      this.prevClose2 = c;
      // ATR 14 (Wilder), TR = h-l / |h-pc| / |l-pc|
      const tr = i === 0 ? h - l : Math.max(h - l, Math.abs(h - this.prevClose), Math.abs(l - this.prevClose));
      if (i < 14) { this.trSum += tr; if (i === 13) this.atr = this.trSum / 14; }
      else this.atr = (this.atr * 13 + tr) / 14;
      this.prevClose = c;
      // 布林 20, 2σ
      this.win.push(c); this.winSum += c; this.winSq += c * c;
      if (this.win.length > 20) { const old = this.win.shift(); this.winSum -= old; this.winSq -= old * old; }
      if (this.win.length === 20) {
        const mu = this.winSum / 20;
        const sd = Math.sqrt(Math.max(0, this.winSq / 20 - mu * mu));
        this.sma20 = mu; this.bbUp = mu + 2 * sd; this.bbDn = mu - 2 * sd;
      }
    }
  }

  /* ---------- 高周期聚合 ---------- */
  class HTF {
    constructor(tfSec, source) {
      this.tf = tfSec;
      this.bars = [];
      this.cur = null;
      (source || []).forEach(b => this.bars.push(b.slice(0, 6)));
      this.cursor = 0;
      this._rebuildEma();
    }
    _rebuildEma() {
      const cl = this.bars.map(b => b[4]);
      this.ema50 = emaArr(cl, 50); this.ema200 = cl.length >= 200 ? emaArr(cl, 200) : null;
    }
    add(bar) {
      const t = bar[0] - (bar[0] % this.tf);
      const last = this.bars[this.bars.length - 1];
      if (last && last[0] === t) {
        last[2] = Math.max(last[2], bar[2]); last[3] = Math.min(last[3], bar[3]); last[4] = bar[4];
        last[5] += bar[5];
        this._patchEma(this.bars.length - 1);
      } else if (!last || t > last[0]) {
        this.bars.push([t, bar[1], bar[2], bar[3], bar[4], bar[5]]);
        this._patchEma(this.bars.length - 1);
      }
    }
    _patchEma(i) {
      const c = this.bars[i][4];
      if (i === 0) { this.ema50[i] = c; if (this.ema200) this.ema200[i] = c; return; }
      this.ema50[i] = c * emaK(50) + this.ema50[i - 1] * (1 - emaK(50));
      if (this.ema200) this.ema200[i] = c * emaK(200) + this.ema200[i - 1] * (1 - emaK(200));
    }
    idxBefore(t) { // 最后一根已收盘 (bar.t + tf <= t)
      const cut = t - this.tf;
      let lo = 0, hi = this.bars.length - 1, ans = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (this.bars[mid][0] <= cut) { ans = mid; lo = mid + 1; } else hi = mid - 1;
      }
      return ans;
    }
  }

  function emaArr(vals, n) {
    const k = emaK(n), out = new Array(vals.length);
    let a = vals[0]; out[0] = a;
    for (let i = 1; i < vals.length; i++) { a = vals[i] * k + a * (1 - k); out[i] = a; }
    return out;
  }

  /* ---------- 单策略引擎 ---------- */
  class StrategyEngine {
    constructor(kind, h1, d1, balance, riskPct, opts) {
      this.kind = kind; this.h1 = h1; this.d1 = d1;
      this.balance0 = balance; this.balance = balance;
      this.riskPct = riskPct;
      this.tradeFrom = (opts && opts.tradeFrom) || 0;
      this.ind = new Indicators();
      this.pos = null; this.pending = null;
      this.trades = []; this.cooldownUntil = -1; this.i = -1;
      this.equity = [];
      this.closes = [];
    }
    d1State(t) {
      const i = this.d1.idxBefore(t), e = this.d1.ema50;
      if (i < 50) return 0;
      return this.d1.bars[i][4] > e[i] ? 1 : -1;
    }
    d1Dir(t) {
      const i = this.d1.idxBefore(t), e = this.d1.ema50;
      if (i < 50) return 0;
      return e[i] > e[Math.max(0, i - 1)] ? 1 : -1;
    }
    h1State(t) {
      const i = this.h1.idxBefore(t);
      if (i < 200 || !this.h1.ema200) return 0;
      const c = this.h1.bars[i][4];
      if (c > this.h1.ema50[i] && this.h1.ema50[i] > this.h1.ema200[i]) return 1;
      if (c < this.h1.ema50[i] && this.h1.ema50[i] < this.h1.ema200[i]) return -1;
      return 0;
    }
    roundLots(x) {
      const v = Math.floor(x / CFG.lot_step) * CFG.lot_step;
      return Math.round(Math.max(CFG.min_lots, Math.min(CFG.max_lots, v)) * 100) / 100;
    }
    onBar(bar) {
      const [t, o, h, l, c, v] = bar;
      this.i++;
      this.ind.push(o, h, l, c);
      this.closes.push(c);
      const ind = this.ind;

      // 1) 挂单成交 (上一根收盘产生)
      if (this.pending) {
        const p = this.pending; this.pending = null;
        const raw = o;
        const entry = p.dir === 1 ? raw + CFG.spread / 2 : raw - CFG.spread / 2;
        const stop = p.kind === 'trend' ? 1.8 * p.atr0 : 2.2 * p.atr0;
        const tp = p.kind === 'trend' ? null : p.tp;
        const riskAmt = this.balance * this.riskPct / 100;
        const lots = this.roundLots(riskAmt / (stop * CFG.contract));
        if (lots >= CFG.min_lots && stop > 0) {
          this.pos = {
            dir: p.dir, entry, open_time: t, lots, atr0: p.atr0, risk: stop, risk_amt: riskAmt,
            sl: p.dir === 1 ? entry - stop : entry + stop,
            sl0: p.dir === 1 ? entry - stop : entry + stop,
            tp, max_hold: p.kind === 'trend' ? 120 : 48,
            bars: 0, mfe: 0, mae: 0, be: false, trail: false,
            hi: entry, lo: entry, open_bar: this.i
          };
        }
      }

      // 2) 持仓管理
      if (this.pos) {
        const P = this.pos, d = P.dir;
        let exitP = null, reason = null;
        if (this.kind === 'trend') {
          if (d === 1 && l <= P.sl) { exitP = o < P.sl ? Math.min(P.sl, o) : P.sl; reason = P.trail ? '移动止损' : (P.be ? '保本' : '止损'); }
          else if (d === -1 && h >= P.sl) { exitP = o > P.sl ? Math.max(P.sl, o) : P.sl; reason = P.trail ? '移动止损' : (P.be ? '保本' : '止损'); }
        } else {
          if (d === 1) {
            if (l <= P.sl) { exitP = o < P.sl ? Math.min(P.sl, o) : P.sl; reason = '止损'; }
            else if (P.tp !== null && h >= P.tp) { exitP = P.tp; reason = '中轨止盈'; }
          } else {
            if (h >= P.sl) { exitP = o > P.sl ? Math.max(P.sl, o) : P.sl; reason = '止损'; }
            else if (P.tp !== null && l <= P.tp) { exitP = P.tp; reason = '中轨止盈'; }
          }
        }
        P.bars++;
        if (exitP === null && P.bars >= P.max_hold) { exitP = c; reason = '超时平仓'; }
        if (exitP !== null) {
          const fill = d === 1 ? exitP - CFG.spread / 2 : exitP + CFG.spread / 2;
          const pnl = (fill - P.entry) * d * CFG.contract * P.lots;
          this.balance += pnl;
          const tr = {
            id: this.trades.length + 1, strategy: this.kind, dir: d === 1 ? 'long' : 'short',
            open_time: P.open_time, open_price: +P.entry.toFixed(2),
            close_time: t, close_price: +fill.toFixed(2), lots: P.lots,
            sl: +P.sl0.toFixed(2), tp: P.tp ? +P.tp.toFixed(2) : null,
            pnl: +pnl.toFixed(2), r: +(pnl / P.risk_amt).toFixed(2), bars: P.bars,
            reason, balance: +this.balance.toFixed(2),
            mfe: +P.mfe.toFixed(2), mae: +P.mae.toFixed(2), atr0: +P.atr0.toFixed(2),
            open_bar: P.open_bar, close_bar: this.i
          };
          this.trades.push(tr);
          this.pos = null;
          this.cooldownUntil = this.i + 3;
        }
      }

      // 3) 推进止损
      if (this.pos) {
        const P = this.pos, d = P.dir;
        if (d === 1) { P.mfe = Math.max(P.mfe, h - P.entry); P.mae = Math.min(P.mae, l - P.entry); P.hi = Math.max(P.hi, h); }
        else { P.mfe = Math.max(P.mfe, P.entry - l); P.mae = Math.min(P.mae, P.entry - h); P.lo = Math.min(P.lo, l); }
        if (this.kind === 'trend') {
          if (d === 1 && (P.hi - P.entry) >= P.risk) {
            const cand = P.hi - 2.5 * P.atr0;
            if (cand > P.sl) { P.sl = Math.max(cand, P.entry); P.trail = true; P.be = true; }
          } else if (d === -1 && (P.entry - P.lo) >= P.risk) {
            const cand = P.lo + 2.5 * P.atr0;
            if (cand < P.sl) { P.sl = Math.min(cand, P.entry); P.trail = true; P.be = true; }
          }
        }
      }

      // 4) 信号
      const hour = new Date(t * 1000).getUTCHours();
      const wd = new Date(t * 1000).getUTCDay();
      const sessOk = !CFG.block_hours.includes(hour) && !(wd === 5 && hour >= CFG.friday_cutoff);
      if (!this.pos && !this.pending && this.i >= 250 && this.i >= this.tradeFrom && ind.atr > 0 && sessOk) {
        let d = 0;
        if (this.kind === 'trend') {
          const st = this.h1State(t), ds = this.d1State(t), dr = this.d1Dir(t);
          let reclaimLong = false, reclaimShort = false;
          for (let k = 1; k <= 3; k++) {
            const a = this.i - k, b = a + 1;
            if (a - 1 < 0) continue;
            const ea = ind.ema21hist[a], eb = ind.ema21hist[b];
            if (this.closes[a] <= ea && this.closes[b] > eb) reclaimLong = true;
            if (this.closes[a] >= ea && this.closes[b] < eb) reclaimShort = true;
          }
          if (ds === 1 && dr === 1 && st === 1 && reclaimLong && ind.rsi > 52 && ind.hist > ind.prevHist && ind.ema21 > ind.ema55) d = 1;
          else if (ds === -1 && dr === -1 && st === -1 && reclaimShort && ind.rsi < 48 && ind.hist < ind.prevHist && ind.ema21 < ind.ema55) d = -1;
        } else {
          if (this.i > this.cooldownUntil) {
            if (c <= ind.bbDn && ind.rsi <= 30) d = 1;
            else if (c >= ind.bbUp && ind.rsi >= 70) d = -1;
          }
        }
        if (d !== 0) this.pending = { dir: d, atr0: ind.atr, kind: this.kind, tp: ind.sma20 };
      }

      // 5) 权益
      let fl = 0;
      if (this.pos) fl = (c - this.pos.entry) * this.pos.dir * CFG.contract * this.pos.lots;
      this.equity.push([t, +(this.balance + fl).toFixed(2)]);
    }
  }

  /* ---------- 模拟交易会话 ---------- */
  class PaperSession {
    constructor(market, data, mode) {
      this.mkt = market; this.data = data; this.mode = mode;
      this.split = data.meta.split_idx;
      this.real = market.tf.M15;
      this.reset();
    }
    reset() {
      const total = this.data.meta.initial_balance;
      this.d1 = new HTF(86400, this.mkt.tf.D1);
      this.h1 = new HTF(3600, this.mkt.tf.H1);
      this.initial = total;
      const risk = (this.data.config && this.data.config.risk_per_trade_pct) || 0.75;
      const opt = { tradeFrom: this.split };
      this.engines = this.mode === 'portfolio'
        ? [new StrategyEngine('trend', this.h1, this.d1, total / 2, risk, opt),
           new StrategyEngine('reversion', this.h1, this.d1, total / 2, risk, opt)]
        : [new StrategyEngine(this.mode, this.h1, this.d1, total, risk, opt)];
      this.synth = [];
      this.rng = mulberry32(20261110);
      this.cursor = this.split;
      this.equity = [];
      this.bars = this.real.slice(0, this.split).map(b => b.slice());
      // 预热: 指标必须从第一根 K 线递推, 与回测完全一致
      for (let i = 0; i < this.split; i++) this.engines.forEach(e => e.onBar(this.real[i].slice()));
      this.equity.push([this.real[Math.max(0, this.split - 1)][0], total]);
    }
    lastBar() {
      if (this.bars.length) return this.bars[this.bars.length - 1];
      return this.real[this.real.length - 1];
    }
    synthBar() {
      const last = this.lastBar();
      let t = last[0] + 900;
      let d = new Date(t * 1000).getUTCDay();
      if (d === 6) t += 2 * 86400; else if (d === 0) t += 86400;
      const ind = this.engines[0].ind;
      const vol = Math.max(0.7, (ind.atr || 3) * 0.55);
      const o = last[4];
      const c = Math.max(1, o + (this.rng() - 0.5) * vol * 1.5);
      const h = Math.max(o, c) + this.rng() * vol * 0.55;
      const l = Math.min(o, c) - this.rng() * vol * 0.55;
      const v = Math.round(60 + this.rng() * 500);
      return [t, +o.toFixed(2), +h.toFixed(2), +l.toFixed(2), +c.toFixed(2), v];
    }
    floating(e) {
      if (!e.pos) return 0;
      const c = this.lastBar()[4];
      return (c - e.pos.entry) * e.pos.dir * CFG.contract * e.pos.lots;
    }
    step() {
      let bar, isSynth = false;
      if (this.cursor < this.real.length) {
        bar = this.real[this.cursor].slice(); this.cursor++;
        this.bars.push(bar);
      } else {
        isSynth = true;
        bar = this.synthBar();
        this.h1.add(bar); this.d1.add(bar);
        this.bars.push(bar);
      }
      this.engines.forEach(e => e.onBar(bar));
      const eq = this.engines.reduce((s, e) => s + e.balance + this.floating(e), 0);
      this.equity.push([bar[0], +eq.toFixed(2)]);
      if (this.equity.length > 4000) this.equity.shift();
      return { bar, isSynth };
    }
    state() {
      const bal = this.engines.reduce((s, e) => s + e.balance, 0);
      const fl = this.engines.reduce((s, e) => s + this.floating(e), 0);
      const trades = [];
      this.engines.forEach(e => e.trades.forEach(t => trades.push(t)));
      trades.sort((a, b) => b.close_time - a.close_time);
      return {
        balance: bal, floating: fl, equity: bal + fl,
        pnl: bal + fl - this.initial,
        positions: this.engines.filter(e => e.pos),
        trades,
        lastBar: this.lastBar(),
        synthetic: this.cursor >= this.real.length,
        progress: Math.min(1, Math.max(0, (this.cursor - this.split) / Math.max(1, this.real.length - this.split))),
        bars: this.bars, equityCurve: this.equity
      };
    }
  }

  root.DSH_SIM = { StrategyEngine, Indicators, HTF, PaperSession, CFG, emaArr, mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.DSH_SIM;
})(typeof window !== 'undefined' ? window : globalThis);
