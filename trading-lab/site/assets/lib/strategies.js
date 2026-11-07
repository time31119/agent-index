/* ============================================================
 * strategies.js — 指标 / 策略注册表（26 个指标，全部可回测）
 * 每个指标：meta + params + grid + signal(data, p) -> 0/1 仓位数组
 * 所有信号只使用当日及以前的数据，引擎在下一交易日开盘执行。
 * ============================================================ */
(function (global) {
  'use strict';
  var TL = global.TL = global.TL || {};
  var I = TL.ind;

  function crossUp(a, b, i) { return i > 0 && a[i] !== null && b[i] !== null && a[i - 1] !== null && b[i - 1] !== null && a[i - 1] <= b[i - 1] && a[i] > b[i]; }
  function crossDn(a, b, i) { return i > 0 && a[i] !== null && b[i] !== null && a[i - 1] !== null && b[i - 1] !== null && a[i - 1] >= b[i - 1] && a[i] < b[i]; }
  function holdFrom(crossArr) {
    var out = new Array(crossArr.length).fill(0), pos = 0;
    for (var i = 0; i < crossArr.length; i++) { if (crossArr[i] === 1) pos = 1; else if (crossArr[i] === 0) pos = 0; out[i] = pos; }
    return out;
  }
  function above(a, b) { return a.map(function (v, i) { return (v === null || b[i] === null) ? null : (v > b[i] ? 1 : 0); }); }

  var REG = [];

  REG.push({
    id: 'sma', name: 'SMA 简单移动平均（价格 vs 均线）', short: 'SMA 均线', cat: 'trend',
    books: ['murphy', 'elder', 'schwager'],
    idea: '价格在均线之上视为上升趋势，之下视为下降趋势。均线的本质是“平滑噪音后的趋势方向”，单均线用价格与均线的相对位置做多空判断。',
    params: { n: 50 }, grid: { n: [20, 30, 40, 50, 60, 90, 120, 200] },
    signal: function (d, p) {
      var ma = I.sma(d.close, p.n);
      return above(d.close, ma).map(function (v) { return v === null ? 0 : v; });
    }
  });

  REG.push({
    id: 'ema', name: 'EMA 指数移动平均（价格 vs 均线）', short: 'EMA 均线', cat: 'trend',
    books: ['murphy', 'elder', 'weinstein'],
    idea: 'EMA 对近期价格赋予更高权重，转折比 SMA 更早；代价是震荡市里假信号更多。',
    params: { n: 40 }, grid: { n: [10, 15, 20, 30, 40, 60, 90, 120] },
    signal: function (d, p) {
      var ma = I.ema(d.close, p.n);
      return above(d.close, ma).map(function (v) { return v === null ? 0 : v; });
    }
  });

  REG.push({
    id: 'macd', name: 'MACD 指数平滑异同移动平均', short: 'MACD', cat: 'momentum',
    books: ['appel', 'murphy', 'elder'],
    idea: '快慢 EMA 之差衡量动量方向与强度，信号线交叉提供进出场；零轴之上金叉胜率通常更高。此处测试“MACD 上穿信号线做多、下穿离场”。',
    params: { fast: 12, slow: 26, sig: 9 }, grid: { fast: [8, 12, 16], slow: [21, 26, 34], sig: [9] },
    signal: function (d, p) {
      var m = I.macd(d.close, p.fast, p.slow, p.sig), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (crossUp(m.macd, m.signal, i)) out[i] = 1;
        else if (crossDn(m.macd, m.signal, i)) out[i] = 0;
        else out[i] = out[i - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'rsi', name: 'RSI 相对强弱指标', short: 'RSI', cat: 'osc',
    books: ['wilder', 'elder', 'connors'],
    idea: 'Wilder 用平均涨幅/跌幅衡量多空力量。经典用法是超卖买入、回归中枢卖出；Elder 强调 RSI 与价格的背离比阈值更重要。此处测试“RSI 自下而上穿越 30 买入，上穿 70 卖出”。',
    params: { n: 14, buy: 30, sell: 70 }, grid: { n: [6, 9, 14, 21], buy: [20, 25, 30, 35], sell: [65, 70, 75, 80] },
    signal: function (d, p) {
      var r = I.rsi(d.close, p.n), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (r[i] === null) { out[i] = 0; continue; }
        if (r[i] < p.buy) out[i] = 1;            // 进入超卖区买入
        else if (r[i] > p.sell) out[i] = 0;      // 进入超买区卖出
        else out[i] = out[i - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'stoch', name: 'KDJ / 随机指标（Stochastic）', short: 'KDJ 随机指标', cat: 'osc',
    books: ['lane', 'murphy'],
    idea: '收盘价在最近 N 日高低区间中的相对位置；K 上穿 D 且处于低位为买入信号，高位死叉为卖出信号。对震荡市敏感，趋势市中容易钝化。',
    params: { k: 9, d: 3, buy: 20, sell: 80 }, grid: { k: [5, 9, 14, 21], d: [3, 5], buy: [15, 20, 25, 30], sell: [70, 75, 80, 85] },
    signal: function (d, p) {
      var s = I.stoch(d.high, d.low, d.close, p.k, p.d, 3), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (s.k[i] === null) { out[i] = 0; continue; }
        if (s.k[i] < p.buy) out[i] = 1;
        else if (s.k[i] > p.sell) out[i] = 0;
        else out[i] = out[i - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'boll', name: '布林带（Bollinger Bands）', short: '布林带', cat: 'vol',
    books: ['bollinger', 'murphy'],
    idea: '均线 ± k 倍标准差构成通道，宽度反映波动。Bollinger 本人强调“价格触及上轨不是卖出信号”，真正有用的是带宽收缩后的突破与 %b 的均值回归。此处测试中轨趋势跟随（收盘站上中轨做多）。',
    params: { n: 20, k: 2 }, grid: { n: [10, 20, 30, 50], k: [1.5, 2, 2.5, 3] },
    signal: function (d, p) {
      var b = I.boll(d.close, p.n, p.k);
      return above(d.close, b.mid).map(function (v) { return v === null ? 0 : v; });
    }
  });

  REG.push({
    id: 'bollrev', name: '布林带均值回归（下轨买入）', short: '布林带回归', cat: 'vol',
    books: ['bollinger', 'connors'],
    idea: '收盘跌破下轨视为短期超卖，回到中轨即离场。与趋势跟随相反的假设：震荡市中“低吸”优于“追涨”。',
    params: { n: 20, k: 2 }, grid: { n: [10, 15, 20, 30], k: [1.5, 2, 2.5] },
    signal: function (d, p) {
      var b = I.boll(d.close, p.n, p.k), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (b.lo[i] === null) continue;
        if (d.close[i] < b.lo[i]) out[i] = 1;
        else if (d.close[i] > b.mid[i]) out[i] = 0;
        else out[i] = out[i - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'atr', name: 'ATR 波动率过滤趋势', short: 'ATR 波动过滤', cat: 'vol',
    books: ['wilder', 'faith'],
    idea: 'ATR 本身无方向，Wilder 用它做止损与仓位。此处用“EMA20 方向 + ATR 确认波动放大”组合：当日均线向上且 ATR 高于其 20 日均值（波动扩张）时持有，代表“趋势需要波动配合”。',
    params: { n: 20, atrN: 14, ratio: 1.0 }, grid: { n: [10, 20, 30, 50], atrN: [14], ratio: [0.8, 1.0, 1.2] },
    signal: function (d, p) {
      var ma = I.ema(d.close, p.n), atr = I.atr(d.high, d.low, d.close, p.atrN), atrMa = I.sma(atr.map(function (x) { return x === null ? 0 : x; }), 20), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (ma[i] === null || atr[i] === null || i < Math.max(p.n, 2)) { out[i] = 0; continue; }
        var up = ma[i] > ma[i - 2] && d.close[i] > ma[i];
        var volOk = atr[i] > atrMa[i] * p.ratio;
        out[i] = (up && volOk) ? 1 : 0;
      }
      return out;
    }
  });

  REG.push({
    id: 'donchian', name: '唐奇安通道 / 海龟突破', short: '唐奇安通道', cat: 'breakout',
    books: ['turtle', 'dennis', 'murphy'],
    idea: '价格创 N 日新高做多、创 M 日新低离场（海龟 System 1/2 的简化版）。突破的本质是“用规则强制在趋势启动时上车”，代价是震荡市连续小亏。',
    params: { entry: 20, exit: 10 }, grid: { entry: [10, 20, 30, 55], exit: [5, 10, 20, 30] },
    signal: function (d, p) {
      var up = I.donchian(d.high, d.low, p.entry), dn = I.donchian(d.high, d.low, p.exit), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (up.up[i - 1] === null || dn.lo[i - 1] === null) { out[i] = 0; continue; }
        if (d.close[i] > up.up[i - 1]) out[i] = 1;
        else if (d.close[i] < dn.lo[i - 1]) out[i] = 0;
        else out[i] = out[i - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'adx', name: 'ADX / DMI 趋向系统', short: 'ADX 趋向', cat: 'trend',
    books: ['wilder', 'schwager'],
    idea: 'Wilder 的 DMI 用 +DI/-DI 判断方向、ADX 判断趋势强度。经典规则：ADX > 20~25 且 +DI 在 -DI 上方才做多，过滤掉无趋势的震荡期。',
    params: { n: 14, adxMin: 20 }, grid: { n: [10, 14, 20], adxMin: [15, 20, 25, 30] },
    signal: function (d, p) {
      var m = I.dmi(d.high, d.low, d.close, p.n), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (m.adx[i] === null || m.pdi[i] === null) { out[i] = 0; continue; }
        out[i] = (m.pdi[i] > m.mdi[i] && m.adx[i] > p.adxMin) ? 1 : 0;
      }
      return out;
    }
  });

  REG.push({
    id: 'aroon', name: 'Aroon 阿隆指标', short: 'Aroon', cat: 'trend',
    books: ['chande'],
    idea: 'Aroon-Up 衡量“距离最近 N 日最高点过去了多少天”，用来判断趋势的新鲜度。Aroon-Up > 70 且 > Aroon-Down 视为上升趋势。',
    params: { n: 25, th: 70 }, grid: { n: [10, 14, 25, 40], th: [50, 60, 70, 80] },
    signal: function (d, p) {
      var a = I.aroon(d.high, d.low, p.n), out = new Array(d.close.length).fill(0);
      for (var i = 0; i < out.length; i++) {
        if (a.up[i] === null) continue;
        out[i] = (a.up[i] > p.th && a.up[i] > a.dn[i]) ? 1 : 0;
      }
      return out;
    }
  });

  REG.push({
    id: 'ichimoku', name: '一目均衡表（Ichimoku）', short: '一目均衡表', cat: 'trend',
    books: ['ichimoku', 'murphy'],
    idea: '转换线/基准线/先行带构成“云图”。价格站上云图且转换线在基准线上方代表多头结构；云图同时给出支撑阻力与趋势方向。',
    params: { t: 9, k: 26, b: 52 }, grid: { t: [9], k: [26, 34, 52], b: [52, 78] },
    signal: function (d, p) {
      var m = I.ichimoku(d.high, d.low, d.close, p.t, p.k, p.b), n = d.close.length, out = new Array(n).fill(0);
      for (var i = 1; i < n; i++) {
        if (m.spanA[i] === null || m.spanB[i] === null || m.tenkan[i] === null) { out[i] = 0; continue; }
        var cloudTop = Math.max(m.spanA[i], m.spanB[i]);
        out[i] = (d.close[i] > cloudTop && m.tenkan[i] > m.kijun[i]) ? 1 : 0;
      }
      return out;
    }
  });

  REG.push({
    id: 'psar', name: '抛物线 SAR（Parabolic SAR）', short: '抛物线 SAR', cat: 'trend',
    books: ['wilder', 'murphy'],
    idea: 'Wilder 的止损转向系统：SAR 在价格下方为多头，在价格上方为空头。它把“止损”机械化，适合强趋势，不适合宽幅震荡。',
    params: { step: 0.02, max: 0.2 }, grid: { step: [0.01, 0.02, 0.03], max: [0.1, 0.2, 0.3] },
    signal: function (d, p) {
      var sar = I.psar(d.high, d.low, p.step, p.max), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) out[i] = (sar[i] !== null && d.close[i] > sar[i]) ? 1 : 0;
      return out;
    }
  });

  REG.push({
    id: 'supertrend', name: 'Supertrend 超级趋势', short: 'Supertrend', cat: 'trend',
    books: ['wilder', 'faith'],
    idea: 'ATR 通道 + 趋势翻转规则：收盘价突破上轨转多、跌破下轨转空。本质是“带波动率自适应带宽的唐奇安通道”。',
    params: { n: 10, mult: 3 }, grid: { n: [7, 10, 14, 20], mult: [2, 2.5, 3, 4] },
    signal: function (d, p) {
      var s = I.supertrend(d.high, d.low, d.close, p.n, p.mult), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) if (s.dir[i] !== null) out[i] = s.dir[i] === 1 ? 1 : 0;
      return out;
    }
  });

  REG.push({
    id: 'stochrsi', name: 'Stochastic RSI（随机相对强弱）', short: 'StochRSI', cat: 'osc',
    books: ['connors', 'chande'],
    idea: '对 RSI 再做一次随机指标，放大超买超卖的敏感度。适合短线均值回归，噪音也更大。',
    params: { n: 14, k: 14, buy: 20, sell: 80 }, grid: { n: [7, 14, 21], k: [9, 14], buy: [15, 20, 25], sell: [75, 80, 85] },
    signal: function (d, p) {
      var r = I.rsi(d.close, p.n);
      var valid = [], map = [];
      for (var i = 0; i < r.length; i++) if (r[i] !== null) { valid.push(r[i]); map.push(i); }
      var st = I.stoch(valid, valid, valid, p.k, 3, 3);
      var kv = new Array(d.close.length).fill(null), dv = new Array(d.close.length).fill(null);
      for (var j = 0; j < map.length; j++) { kv[map[j]] = st.k[j]; dv[map[j]] = st.d[j]; }
      var out = new Array(d.close.length).fill(0);
      for (var q = 1; q < out.length; q++) {
        if (kv[q] === null || dv[q] === null) { out[q] = 0; continue; }
        if (crossUp(kv, dv, q) && kv[q] < p.buy + 15) out[q] = 1;
        else if (crossDn(kv, dv, q) && kv[q] > p.sell - 15) out[q] = 0;
        else out[q] = out[q - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'cci', name: 'CCI 顺势指标', short: 'CCI', cat: 'osc',
    books: ['lambert', 'elder'],
    idea: '典型价格偏离其均值的程度，用平均绝对偏差归一化。CCI > +100 视为强势启动（顺势），< -100 视为弱势。Elder 用 CCI 做“脉冲系统”。',
    params: { n: 20, th: 100 }, grid: { n: [14, 20, 34], th: [80, 100, 120, 150] },
    signal: function (d, p) {
      var c = I.cci(d.high, d.low, d.close, p.n), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (c[i] === null) continue;
        if (crossUp(c, new Array(c.length).fill(p.th), i)) out[i] = 1;
        else if (crossDn(c, new Array(c.length).fill(-p.th * 0.3), i)) out[i] = 0;
        else out[i] = out[i - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'roc', name: 'ROC 变动率 / 动量', short: 'ROC 动量', cat: 'momentum',
    books: ['oneil', 'schwager'],
    idea: 'N 日涨跌幅，最朴素的动量指标。动量效应（强者继续强）在跨市场长期存在，但在 A 股高波动环境下回撤更大。',
    params: { n: 20, th: 0 }, grid: { n: [10, 20, 60, 120], th: [0, 2, 5] },
    signal: function (d, p) {
      var r = I.roc(d.close, p.n), out = new Array(d.close.length).fill(0);
      for (var i = 0; i < out.length; i++) if (r[i] !== null) out[i] = r[i] > p.th ? 1 : 0;
      return out;
    }
  });

  REG.push({
    id: 'willr', name: 'Williams %R 威廉指标', short: 'Williams %R', cat: 'osc',
    books: ['williams', 'murphy'],
    idea: '与随机指标同源但取负值。Larry Williams 强调“短期极端值反转”，-80 以下超卖买入、-20 以上超买卖出。',
    params: { n: 14, buy: -80, sell: -20 }, grid: { n: [7, 14, 21], buy: [-90, -85, -80], sell: [-25, -20, -15] },
    signal: function (d, p) {
      var w = I.williamsR(d.high, d.low, d.close, p.n), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (w[i] === null) { out[i] = 0; continue; }
        if (w[i] < p.buy) out[i] = 1;            // -80 以下超卖
        else if (w[i] > p.sell) out[i] = 0;      // -20 以上超买
        else out[i] = out[i - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'obv', name: 'OBV 能量潮', short: 'OBV 能量潮', cat: 'volume',
    books: ['granville', 'murphy'],
    idea: 'Granville 的“量在价先”：把涨跌日的成交量累加，OBV 领先于价格突破。测试 OBV 相对其均线走强时持有。',
    params: { n: 30 }, grid: { n: [10, 20, 30, 60] },
    signal: function (d, p) {
      var o = I.obv(d.close, d.volume), ma = I.sma(o, p.n), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (ma[i] === null) { out[i] = 0; continue; }
        out[i] = o[i] > ma[i] ? 1 : 0;
      }
      return out;
    }
  });

  REG.push({
    id: 'volratio', name: '量比 + 价格趋势', short: '量比', cat: 'volume',
    books: ['oneil', 'weinstein', 'granville'],
    idea: '成交量 / 20 日均量 > 1.5 代表资金异动；配合价格站上 MA20，代表“放量上涨”。这是 O\'Neil 与 Weinstein 共同强调的量价确认。',
    params: { n: 20, ratio: 1.5 }, grid: { n: [10, 20, 30], ratio: [1.2, 1.5, 2, 2.5] },
    signal: function (d, p) {
      var vr = I.volumeRatio(d.volume, p.n), ma = I.sma(d.close, p.n), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (vr[i] === null || ma[i] === null) { out[i] = 0; continue; }
        out[i] = (vr[i] > p.ratio && d.close[i] > ma[i]) ? 1 : 0;
      }
      return out;
    }
  });

  REG.push({
    id: 'mfi', name: 'MFI 资金流量指标', short: 'MFI', cat: 'volume',
    books: ['murphy', 'granville'],
    idea: '把“价+量”合成 RSI 式的 0-100 指标，衡量资金流入流出。MFI < 20 视为超卖，> 80 视为超买。',
    params: { n: 14, buy: 30, sell: 70 }, grid: { n: [7, 14, 21], buy: [20, 25, 30, 35], sell: [60, 65, 70, 75] },
    signal: function (d, p) {
      var tp = d.close.map(function (c, i) { return (d.high[i] + d.low[i] + c) / 3; });
      var pos = new Array(tp.length).fill(0), neg = new Array(tp.length).fill(0);
      for (var i = 1; i < tp.length; i++) {
        var f = tp[i] * d.volume[i];
        if (tp[i] > tp[i - 1]) pos[i] = f; else if (tp[i] < tp[i - 1]) neg[i] = f;
      }
      var ap = I.rma(pos, p.n), an = I.rma(neg, p.n), mfi = new Array(tp.length).fill(null);
      for (var j = 0; j < tp.length; j++) {
        if (ap[j] === null || an[j] === null) continue;
        mfi[j] = an[j] === 0 ? 100 : 100 - 100 / (1 + ap[j] / an[j]);
      }
      var out = new Array(tp.length).fill(0);
      for (var q = 1; q < out.length; q++) {
        if (mfi[q] === null) { out[q] = 0; continue; }
        if (mfi[q] < p.buy) out[q] = 1;
        else if (mfi[q] > p.sell) out[q] = 0;
        else out[q] = out[q - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'keltner', name: '肯特纳通道突破', short: '肯特纳通道', cat: 'vol',
    books: ['keltner', 'faith'],
    idea: 'EMA 中轨 ± ATR 带宽。收盘突破上轨做多、跌破中轨离场；比布林带更平滑，适合捕捉中等趋势。',
    params: { n: 20, k: 2 }, grid: { n: [10, 20, 30], k: [1.5, 2, 2.5, 3] },
    signal: function (d, p) {
      var kc = I.keltner(d.high, d.low, d.close, p.n, p.k), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (kc.up[i] === null) continue;
        if (d.close[i] > kc.up[i]) out[i] = 1;
        else if (d.close[i] < kc.mid[i]) out[i] = 0;
        else out[i] = out[i - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'pivot', name: '摆动高低点（结构突破）', short: '结构突破', cat: 'ma',
    books: ['edwards', 'murphy', 'minervini'],
    idea: '用左右各 5 根 K 线确认摆动高点，收盘突破最近一个确认高点即“结构突破”，跌破最近确认低点离场。这是道氏理论“高低点抬高”的可计算版本。',
    params: { k: 5 }, grid: { k: [3, 5, 8, 13] },
    signal: function (d, p) {
      var piv = I.pivot(d.high, d.low, d.close, p.k), n = d.close.length, out = new Array(n).fill(0);
      var lastHigh = null, lastLow = null;
      for (var i = 0; i < n; i++) {
        // 只用“已确认”的摆动点（确认日 = i - k）
        var c = i - p.k;
        if (c >= 0) {
          if (piv.ph[c] !== null) lastHigh = piv.ph[c];
          if (piv.pl[c] !== null) lastLow = piv.pl[c];
        }
        if (lastHigh !== null && d.close[i] > lastHigh) out[i] = 1;
        else if (lastLow !== null && d.close[i] < lastLow) out[i] = 0;
        else out[i] = i > 0 ? out[i - 1] : 0;
      }
      return out;
    }
  });

  REG.push({
    id: 'round', name: '整数关口 / 心理价位', short: '整数关口', cat: 'ma',
    books: ['livermore', 'murphy'],
    idea: '整数位（如 3000、4000 点）聚集订单与情绪，常成为支撑阻力。测试“站上最近整数关口做多、跌破离场”，检验心理价位是否有统计意义。',
    params: { step: 100 }, grid: { step: [50, 100, 200, 500] },
    signal: function (d, p) {
      var out = new Array(d.close.length).fill(0), f = I.roundLevel(p.step);
      for (var i = 1; i < out.length; i++) {
        var lvl = f(d.close[i]);
        out[i] = d.close[i] > lvl ? 1 : 0;
      }
      return out;
    }
  });

  REG.push({
    id: 'high52', name: '52 周新高突破', short: '52周新高', cat: 'breakout',
    books: ['oneil', 'darvas', 'minervini'],
    idea: 'O\'Neil 的 CAN SLIM 与 Darvas 箱体都强调“创新高的股票最强”。测试收盘创 250 日新高做多、跌破 50 日低点离场。',
    params: { hi: 250, lo: 50 }, grid: { hi: [120, 200, 250], lo: [20, 50, 100] },
    signal: function (d, p) {
      var hh = I.donchian(d.high, d.low, p.hi), ll = I.donchian(d.high, d.low, p.lo), out = new Array(d.close.length).fill(0);
      for (var i = 1; i < out.length; i++) {
        if (hh.up[i - 1] === null || ll.lo[i - 1] === null) { out[i] = 0; continue; }
        if (d.close[i] > hh.up[i - 1]) out[i] = 1;
        else if (d.close[i] < ll.lo[i - 1]) out[i] = 0;
        else out[i] = out[i - 1];
      }
      return out;
    }
  });

  REG.push({
    id: 'tsmom', name: '时序动量（12-1 月）', short: '时序动量', cat: 'momentum',
    books: ['faber', 'asness'],
    idea: '学术与实务都验证过的“时序动量”：过去 12 个月（跳过最近 1 个月）为正则持有，否则空仓。Faber 的“10 月均线”与 Asness 的动量因子同源。',
    params: { look: 252, skip: 21 }, grid: { look: [126, 189, 252, 378], skip: [0, 21] },
    signal: function (d, p) {
      var out = new Array(d.close.length).fill(0);
      for (var i = p.look; i < out.length; i++) {
        var past = d.close[i - p.skip], base = d.close[i - p.look];
        out[i] = (past > base) ? 1 : 0;
      }
      return out;
    }
  });

  REG.push({
    id: 'trendmom', name: '双确认：趋势 + 动量', short: '趋势+动量', cat: 'combo',
    books: ['elder', 'weinstein', 'oneil'],
    idea: 'Elder 的“三重滤网”思想：大周期趋势向上（价格 > MA200）且中周期动量向上（MACD 柱 > 0）才做多。双条件过滤减少单一指标的假信号。',
    params: { n: 200, fast: 12, slow: 26 }, grid: { n: [100, 150, 200, 250], fast: [8, 12], slow: [21, 26, 34] },
    signal: function (d, p) {
      var ma = I.sma(d.close, p.n), m = I.macd(d.close, p.fast, p.slow, 9), out = new Array(d.close.length).fill(0);
      for (var i = 0; i < out.length; i++) {
        if (ma[i] === null || m.hist[i] === null) continue;
        out[i] = (d.close[i] > ma[i] && m.hist[i] > 0) ? 1 : 0;
      }
      return out;
    }
  });

  REG.push({
    id: 'voltarget', name: '波动率择时（目标波动仓位）', short: '波动率择时', cat: 'combo',
    books: ['wilder', 'asness', 'turtle'],
    idea: '仓位 ∝ 目标波动率 / 已实现波动率，下跌波动放大时自动减仓。海龟法则的“按波动率等风险配置”与风险平价的简化版。',
    params: { n: 20, target: 0.15, ma: 100 }, grid: { n: [10, 20, 40], target: [0.10, 0.15, 0.20], ma: [50, 100, 200] },
    signal: function (d, p) {
      var ma = I.sma(d.close, p.ma), rets = d.close.map(function (c, i) { return i ? c / d.close[i - 1] - 1 : 0; });
      var vol = I.stdev(rets, p.n), out = new Array(d.close.length).fill(0);
      for (var i = 0; i < out.length; i++) {
        if (ma[i] === null || vol[i] === null) continue;
        var pos = Math.min(1, p.target / (vol[i] * Math.sqrt(252)));
        out[i] = d.close[i] > ma[i] ? pos : 0;
      }
      return out;
    }
  });

  TL.reg = REG;
  if (typeof module !== 'undefined' && module.exports) module.exports = REG;
})(typeof window !== 'undefined' ? window : globalThis);
