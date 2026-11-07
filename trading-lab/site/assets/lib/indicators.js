/* ============================================================
 * indicators.js — 纯函数技术指标库（浏览器 / Node 通用）
 * 输入统一为数值数组，输出等长数组，前置不足期为 null / NaN 处理。
 * ============================================================ */
(function (global) {
  'use strict';

  var I = {};

  function nz(x) { return (x === null || x === undefined || Number.isNaN(x)) ? null : x; }

  I.sma = function (src, n) {
    var out = new Array(src.length).fill(null), sum = 0;
    for (var i = 0; i < src.length; i++) {
      sum += src[i];
      if (i >= n) sum -= src[i - n];
      if (i >= n - 1) out[i] = sum / n;
    }
    return out;
  };

  I.ema = function (src, n) {
    var out = new Array(src.length).fill(null), k = 2 / (n + 1), prev = null;
    for (var i = 0; i < src.length; i++) {
      if (i === n - 1) {
        var s = 0; for (var j = 0; j < n; j++) s += src[j];
        prev = s / n; out[i] = prev;
      } else if (i >= n) {
        prev = src[i] * k + prev * (1 - k); out[i] = prev;
      }
    }
    return out;
  };

  I.rma = function (src, n) { // Wilder 平滑
    var out = new Array(src.length).fill(null), prev = null;
    for (var i = 0; i < src.length; i++) {
      if (i === n - 1) {
        var s = 0; for (var j = 0; j < n; j++) s += src[j];
        prev = s / n; out[i] = prev;
      } else if (i >= n) {
        prev = (prev * (n - 1) + src[i]) / n; out[i] = prev;
      }
    }
    return out;
  };

  I.stdev = function (src, n) {
    var out = new Array(src.length).fill(null);
    for (var i = n - 1; i < src.length; i++) {
      var s = 0, s2 = 0;
      for (var j = i - n + 1; j <= i; j++) { s += src[j]; s2 += src[j] * src[j]; }
      var m = s / n, v = Math.max(0, s2 / n - m * m);
      out[i] = Math.sqrt(v);
    }
    return out;
  };

  I.rsi = function (close, n) {
    n = n || 14;
    var gains = new Array(close.length).fill(0), losses = new Array(close.length).fill(0);
    for (var i = 1; i < close.length; i++) {
      var d = close[i] - close[i - 1];
      gains[i] = d > 0 ? d : 0; losses[i] = d < 0 ? -d : 0;
    }
    var ag = I.rma(gains, n), al = I.rma(losses, n), out = new Array(close.length).fill(null);
    for (var k = 0; k < close.length; k++) {
      if (ag[k] === null || al[k] === null) continue;
      if (al[k] === 0) { out[k] = 100; continue; }
      var rs = ag[k] / al[k]; out[k] = 100 - 100 / (1 + rs);
    }
    return out;
  };

  I.macd = function (close, fast, slow, sig) {
    fast = fast || 12; slow = slow || 26; sig = sig || 9;
    var ef = I.ema(close, fast), es = I.ema(close, slow);
    var line = close.map(function (_, i) { return (ef[i] === null || es[i] === null) ? null : ef[i] - es[i]; });
    var valid = [], map = [];
    for (var i = 0; i < line.length; i++) { if (line[i] !== null) { valid.push(line[i]); map.push(i); } }
    var sigValid = I.ema(valid, sig), signal = new Array(close.length).fill(null), hist = new Array(close.length).fill(null);
    for (var j = 0; j < map.length; j++) {
      signal[map[j]] = sigValid[j];
      if (sigValid[j] !== null) hist[map[j]] = line[map[j]] - sigValid[j];
    }
    return { macd: line, signal: signal, hist: hist };
  };

  I.atr = function (h, l, c, n) {
    n = n || 14;
    var tr = new Array(c.length).fill(null);
    for (var i = 0; i < c.length; i++) {
      if (i === 0) { tr[i] = h[i] - l[i]; continue; }
      tr[i] = Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1]));
    }
    return I.rma(tr, n);
  };

  I.trueRange = function (h, l, c) {
    var tr = new Array(c.length).fill(null);
    for (var i = 0; i < c.length; i++) {
      if (i === 0) { tr[i] = h[i] - l[i]; continue; }
      tr[i] = Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1]));
    }
    return tr;
  };

  I.boll = function (close, n, k) {
    n = n || 20; k = k || 2;
    var mid = I.sma(close, n), sd = I.stdev(close, n);
    var up = close.map(function (_, i) { return sd[i] === null ? null : mid[i] + k * sd[i]; });
    var lo = close.map(function (_, i) { return sd[i] === null ? null : mid[i] - k * sd[i]; });
    var width = close.map(function (_, i) { return sd[i] === null ? null : (up[i] - lo[i]) / mid[i] * 100; });
    var pctb = close.map(function (_, i) { return sd[i] === null ? null : (close[i] - lo[i]) / (up[i] - lo[i]); });
    return { mid: mid, up: up, lo: lo, width: width, pctb: pctb, sd: sd };
  };

  I.stoch = function (h, l, c, k, d, smooth) {
    k = k || 14; d = d || 3; smooth = smooth || 3;
    var raw = new Array(c.length).fill(null);
    for (var i = k - 1; i < c.length; i++) {
      var hh = -Infinity, ll = Infinity;
      for (var j = i - k + 1; j <= i; j++) { if (h[j] > hh) hh = h[j]; if (l[j] < ll) ll = l[j]; }
      raw[i] = hh === ll ? 50 : (c[i] - ll) / (hh - ll) * 100;
    }
    var fastK = I.sma(raw.filter(function (x) { return x !== null; }), smooth);
    var kk = new Array(c.length).fill(null), idx = 0;
    for (var m = 0; m < c.length; m++) if (raw[m] !== null) { kk[m] = fastK[idx++]; }
    var dv = kk.filter(function (x) { return x !== null; }), dSm = I.sma(dv, d);
    var dd = new Array(c.length).fill(null); idx = 0;
    for (var q = 0; q < c.length; q++) if (kk[q] !== null) { dd[q] = dSm[idx++]; }
    return { k: kk, d: dd };
  };

  I.williamsR = function (h, l, c, n) {
    n = n || 14;
    var out = new Array(c.length).fill(null);
    for (var i = n - 1; i < c.length; i++) {
      var hh = -Infinity, ll = Infinity;
      for (var j = i - n + 1; j <= i; j++) { if (h[j] > hh) hh = h[j]; if (l[j] < ll) ll = l[j]; }
      out[i] = hh === ll ? -50 : (hh - c[i]) / (hh - ll) * -100;
    }
    return out;
  };

  I.cci = function (h, l, c, n) {
    n = n || 20;
    var tp = c.map(function (_, i) { return (h[i] + l[i] + c[i]) / 3; });
    var ma = I.sma(tp, n), out = new Array(c.length).fill(null);
    for (var i = n - 1; i < c.length; i++) {
      var md = 0;
      for (var j = i - n + 1; j <= i; j++) md += Math.abs(tp[j] - ma[i]);
      md /= n;
      out[i] = md === 0 ? 0 : (tp[i] - ma[i]) / (0.015 * md);
    }
    return out;
  };

  I.roc = function (src, n) {
    n = n || 10;
    return src.map(function (v, i) { return i >= n ? (v / src[i - n] - 1) * 100 : null; });
  };

  I.momentum = function (src, n) {
    n = n || 10;
    return src.map(function (v, i) { return i >= n ? v - src[i - n] : null; });
  };

  // ADX / +DI / -DI
  I.dmi = function (h, l, c, n) {
    n = n || 14;
    var plusDM = new Array(c.length).fill(0), minusDM = new Array(c.length).fill(0);
    for (var i = 1; i < c.length; i++) {
      var up = h[i] - h[i - 1], dn = l[i - 1] - l[i];
      plusDM[i] = (up > dn && up > 0) ? up : 0;
      minusDM[i] = (dn > up && dn > 0) ? dn : 0;
    }
    var tr = I.trueRange(h, l, c);
    var atr = I.rma(tr, n), pDM = I.rma(plusDM, n), mDM = I.rma(minusDM, n);
    var pdi = new Array(c.length).fill(null), mdi = new Array(c.length).fill(null);
    for (var k = 0; k < c.length; k++) {
      if (atr[k] === null || atr[k] === 0) continue;
      pdi[k] = pDM[k] / atr[k] * 100; mdi[k] = mDM[k] / atr[k] * 100;
    }
    var dx = new Array(c.length).fill(null);
    for (var q = 0; q < c.length; q++) {
      if (pdi[q] === null || mdi[q] === null) continue;
      var s = pdi[q] + mdi[q]; dx[q] = s === 0 ? 0 : Math.abs(pdi[q] - mdi[q]) / s * 100;
    }
    var dxValid = dx.filter(function (x) { return x !== null; });
    var adxValid = I.rma(dxValid, n), adx = new Array(c.length).fill(null), idx = 0;
    for (var m = 0; m < c.length; m++) if (dx[m] !== null) { adx[m] = adxValid[idx++]; }
    return { adx: adx, pdi: pdi, mdi: mdi, dx: dx };
  };

  I.donchian = function (h, l, n) {
    n = n || 20;
    var up = new Array(h.length).fill(null), lo = new Array(h.length).fill(null);
    for (var i = n - 1; i < h.length; i++) {
      var hh = -Infinity, ll = Infinity;
      for (var j = i - n + 1; j <= i; j++) { if (h[j] > hh) hh = h[j]; if (l[j] < ll) ll = l[j]; }
      up[i] = hh; lo[i] = ll;
    }
    return { up: up, lo: lo, mid: up.map(function (v, i) { return v === null ? null : (v + lo[i]) / 2; }) };
  };

  I.keltner = function (h, l, c, n, k) {
    n = n || 20; k = k || 2;
    var mid = I.ema(c, n), atr = I.atr(h, l, c, n);
    return {
      mid: mid,
      up: c.map(function (_, i) { return (mid[i] === null || atr[i] === null) ? null : mid[i] + k * atr[i]; }),
      lo: c.map(function (_, i) { return (mid[i] === null || atr[i] === null) ? null : mid[i] - k * atr[i]; })
    };
  };

  I.obv = function (c, v) {
    var out = new Array(c.length).fill(0);
    for (var i = 1; i < c.length; i++) {
      out[i] = out[i - 1] + (c[i] > c[i - 1] ? v[i] : c[i] < c[i - 1] ? -v[i] : 0);
    }
    return out;
  };

  I.vwapRoll = function (h, l, c, v, n) {
    n = n || 20;
    var tp = c.map(function (_, i) { return (h[i] + l[i] + c[i]) / 3; });
    var out = new Array(c.length).fill(null);
    for (var i = n - 1; i < c.length; i++) {
      var pv = 0, vv = 0;
      for (var j = i - n + 1; j <= i; j++) { pv += tp[j] * v[j]; vv += v[j]; }
      out[i] = vv === 0 ? null : pv / vv;
    }
    return out;
  };

  I.aroon = function (h, l, n) {
    n = n || 25;
    var up = new Array(h.length).fill(null), dn = new Array(l.length).fill(null);
    for (var i = n - 1; i < h.length; i++) {
      var hiIdx = i, loIdx = i;
      for (var j = i - n + 1; j <= i; j++) {
        if (h[j] >= h[hiIdx]) hiIdx = j;
        if (l[j] <= l[loIdx]) loIdx = j;
      }
      up[i] = (n - 1 - (i - hiIdx)) / (n - 1) * 100;
      dn[i] = (n - 1 - (i - loIdx)) / (n - 1) * 100;
    }
    return { up: up, dn: dn, osc: up.map(function (v, i) { return v === null ? null : v - dn[i]; }) };
  };

  I.ichimoku = function (h, l, c, tenkan, kijun, spanB) {
    tenkan = tenkan || 9; kijun = kijun || 26; spanB = spanB || 52;
    function mid(period) {
      var out = new Array(h.length).fill(null);
      for (var i = period - 1; i < h.length; i++) {
        var hh = -Infinity, ll = Infinity;
        for (var j = i - period + 1; j <= i; j++) { if (h[j] > hh) hh = h[j]; if (l[j] < ll) ll = l[j]; }
        out[i] = (hh + ll) / 2;
      }
      return out;
    }
    var t = mid(tenkan), k = mid(kijun), b = mid(spanB);
    var spanA = t.map(function (v, i) { return (v === null || k[i] === null) ? null : (v + k[i]) / 2; });
    // 云图按经典用法前移 26 期
    var shift = function (arr, s) {
      var out = new Array(arr.length).fill(null);
      for (var i = 0; i < arr.length; i++) if (arr[i] !== null && i + s < arr.length) out[i + s] = arr[i];
      return out;
    };
    return { tenkan: t, kijun: k, spanA: shift(spanA, kijun), spanB: shift(b, kijun), baseA: spanA, baseB: b };
  };

  I.psar = function (h, l, step, max) {
    step = step || 0.02; max = max || 0.2;
    var n = h.length, out = new Array(n).fill(null);
    if (n < 2) return out;
    var up = h[1] >= h[0], af = step, ep = up ? h[1] : l[1], sar = up ? l[0] : h[0];
    out[1] = sar;
    for (var i = 2; i < n; i++) {
      sar = sar + af * (ep - sar);
      if (up) {
        if (l[i] < sar) { up = false; sar = ep; ep = l[i]; af = step; }
        else { if (h[i] > ep) { ep = h[i]; af = Math.min(max, af + step); } }
      } else {
        if (h[i] > sar) { up = true; sar = ep; ep = h[i]; af = step; }
        else { if (l[i] < ep) { ep = l[i]; af = Math.min(max, af + step); } }
      }
      out[i] = sar;
    }
    return out;
  };

  I.supertrend = function (h, l, c, n, mult) {
    n = n || 10; mult = mult || 3;
    var atr = I.atr(h, l, c, n), trend = new Array(c.length).fill(null), dir = new Array(c.length).fill(null);
    var upper = new Array(c.length).fill(null), lower = new Array(c.length).fill(null);
    var prevU = null, prevL = null, prevDir = 1;
    for (var i = 0; i < c.length; i++) {
      if (atr[i] === null) continue;
      var mid = (h[i] + l[i]) / 2;
      var bu = mid + mult * atr[i], bl = mid - mult * atr[i];
      if (prevU !== null) {
        bu = (bu < prevU || c[i - 1] > prevU) ? bu : prevU;
        bl = (bl > prevL || c[i - 1] < prevL) ? bl : prevL;
      }
      var d = prevDir;
      if (prevDir === 1 && c[i] < bl) d = -1;
      else if (prevDir === -1 && c[i] > bu) d = 1;
      dir[i] = d; trend[i] = d === 1 ? bl : bu;
      upper[i] = bu; lower[i] = bl;
      prevU = bu; prevL = bl; prevDir = d;
    }
    return { line: trend, dir: dir, upper: upper, lower: lower };
  };

  I.volumeRatio = function (v, n) {
    n = n || 20;
    var ma = I.sma(v, n);
    return v.map(function (x, i) { return ma[i] === null || ma[i] === 0 ? null : x / ma[i]; });
  };

  I.slopePct = function (arr, n) {
    n = n || 10;
    return arr.map(function (v, i) {
      if (i < n || v === null || arr[i - n] === null) return null;
      return (v / arr[i - n] - 1) * 100;
    });
  };

  I.pivot = function (h, l, c, k) { // k 左/右确认根数
    k = k || 5;
    var ph = new Array(h.length).fill(null), pl = new Array(l.length).fill(null);
    for (var i = k; i < h.length - k; i++) {
      var isH = true, isL = true;
      for (var j = i - k; j <= i + k; j++) {
        if (j === i) continue;
        if (h[j] >= h[i]) isH = false;
        if (l[j] <= l[i]) isL = false;
      }
      if (isH) ph[i] = h[i];
      if (isL) pl[i] = l[i];
    }
    return { ph: ph, pl: pl };
  };

  I.roundLevel = function (step) { // 心理整数关口
    return function (price) { return Math.round(price / step) * step; };
  };

  I.percentileRank = function (arr, n) {
    n = n || 252;
    return arr.map(function (v, i) {
      if (i < n - 1) return null;
      var cnt = 0;
      for (var j = i - n + 1; j <= i; j++) if (arr[j] <= v) cnt++;
      return cnt / n * 100;
    });
  };

  global.TL = global.TL || {};
  global.TL.ind = I;
  if (typeof module !== 'undefined' && module.exports) module.exports = I;
})(typeof window !== 'undefined' ? window : globalThis);
