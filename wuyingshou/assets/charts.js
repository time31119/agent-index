/* 轻量 Canvas 图表库 — 无外部依赖 */
(function () {
  const DPR = Math.max(1, window.devicePixelRatio || 1);

  function setup(canvas) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(10, rect.width), h = Math.max(10, rect.height);
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }

  function niceTicks(min, max, count) {
    if (min === max) { min -= 1; max += 1; }
    const span = max - min;
    const raw = span / Math.max(2, count);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
    const start = Math.ceil(min / step) * step;
    const ticks = [];
    for (let v = start; v <= max + step * 1e-6; v += step) ticks.push(v);
    return { ticks, step };
  }

  const fmtNum = (v, d) => {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    return v.toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d });
  };

  const COL = {
    grid: 'rgba(255,255,255,.055)',
    axis: 'rgba(255,255,255,.14)',
    text: 'rgba(226,232,240,.62)',
    up: '#22c55e', down: '#ef4444', gold: '#d4a637', blue: '#3b82f6'
  };

  /** 折线/面积图
   * opts: { series:[{data:[[t,y],...],color,fill,width,dash}], yFmt, xFmt, height,
   *         markers:[{i,color,label}], baseline, bands:[{from,to,color}] }
   */
  function lineChart(canvas, opts) {
    const { ctx, w, h } = setup(canvas);
    const pad = { l: 58, r: 14, t: 14, b: 26 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    if (plotW <= 0 || plotH <= 0) return null;

    const all = [];
    opts.series.forEach(s => s.data.forEach(p => all.push(p)));
    let yMin = Infinity, yMax = -Infinity, xMin = Infinity, xMax = -Infinity;
    all.forEach(([x, y]) => {
      if (y < yMin) yMin = y; if (y > yMax) yMax = y;
      if (x < xMin) xMin = x; if (x > xMax) xMax = x;
    });
    if (!all.length) return null;
    if (opts.baseline !== undefined) { yMin = Math.min(yMin, opts.baseline); yMax = Math.max(yMax, opts.baseline); }
    // 防止等值序列产生退化的坐标轴
    const minSpan = Math.max(Math.abs(yMax) * 0.004, 1e-9);
    if (yMax - yMin < minSpan) {
      const mid = (yMax + yMin) / 2;
      yMin = mid - minSpan / 2; yMax = mid + minSpan / 2;
    }
    const yPad = (yMax - yMin) * 0.08 || 1;
    yMin -= yPad; yMax += yPad;

    const X = x => pad.l + (x - xMin) / (xMax - xMin || 1) * plotW;
    const Y = y => pad.t + plotH - (y - yMin) / (yMax - yMin || 1) * plotH;

    const { ticks } = niceTicks(yMin, yMax, 5);
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ticks.forEach(v => {
      const y = Y(v);
      if (y < pad.t - 1 || y > pad.t + plotH + 1) return;
      ctx.strokeStyle = COL.grid; ctx.beginPath();
      ctx.moveTo(pad.l, y + .5); ctx.lineTo(pad.l + plotW, y + .5); ctx.stroke();
      ctx.fillStyle = COL.text;
      ctx.fillText((opts.yFmt || (x => fmtNum(x, 2)))(v), pad.l - 8, y);
    });

    // 基准线
    if (opts.baseline !== undefined) {
      const y = Y(opts.baseline);
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(212,166,55,.55)';
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + plotW, y); ctx.stroke(); ctx.restore();
    }

    // x 轴标签
    const nx = Math.max(2, Math.floor(plotW / 92));
    ctx.textBaseline = 'top'; ctx.fillStyle = COL.text;
    if (opts.hideX) {
      ctx.strokeStyle = COL.axis; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t + plotH + .5); ctx.lineTo(pad.l + plotW, pad.t + plotH + .5); ctx.stroke();
    } else
    for (let k = 0; k <= nx; k++) {
      const x = xMin + (xMax - xMin) * k / nx;
      const px = X(x);
      const label = (opts.xFmt || (v => v))(x);
      if (k === 0) { ctx.textAlign = 'left'; ctx.fillText(label, pad.l, h - 18); }
      else if (k === nx) { ctx.textAlign = 'right'; ctx.fillText(label, pad.l + plotW, h - 18); }
      else { ctx.textAlign = 'center'; ctx.fillText(label, px, h - 18); }
    }

    // 系列
    opts.series.forEach(s => {
      if (!s.data.length) return;
      if (s.fill) {
        const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + plotH);
        grad.addColorStop(0, s.fill);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        s.data.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])));
        ctx.lineTo(X(s.data[s.data.length - 1][0]), pad.t + plotH);
        ctx.lineTo(X(s.data[0][0]), pad.t + plotH);
        ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
      }
      ctx.beginPath();
      ctx.lineWidth = s.width || 1.6;
      ctx.strokeStyle = s.color;
      if (s.dash) ctx.setLineDash(s.dash);
      s.data.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])));
      ctx.stroke(); ctx.setLineDash([]);
    });

    // 标记点
    (opts.markers || []).forEach(m => {
      const px = X(m.x), py = Y(m.y);
      ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = m.color || COL.gold; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1; ctx.stroke();
    });

    ctx.strokeStyle = COL.axis; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t + plotH + .5); ctx.lineTo(pad.l + plotW, pad.t + plotH + .5); ctx.stroke();

    return { X, Y, xMin, xMax, yMin, yMax, pad, plotW, plotH };
  }

  /** K 线图 + 交易标记 */
  function candleChart(canvas, bars, opts) {
    const { ctx, w, h } = setup(canvas);
    const pad = { l: 58, r: 58, t: 12, b: 24 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    if (plotW <= 0 || plotH <= 0 || !bars.length) return null;

    let lo = Infinity, hi = -Infinity;
    bars.forEach(b => { lo = Math.min(lo, b[3]); hi = Math.max(hi, b[2]); });
    const padY = (hi - lo) * 0.06 || 1;
    lo -= padY; hi += padY;

    const n = bars.length;
    const slot = plotW / n;
    const bw = Math.max(1, Math.min(11, slot * 0.68));
    const X = i => pad.l + (i + 0.5) * slot;
    const Y = v => pad.t + plotH - (v - lo) / (hi - lo) * plotH;

    const { ticks } = niceTicks(lo, hi, 6);
    ctx.font = '11px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ticks.forEach(v => {
      const y = Y(v);
      if (y < pad.t || y > pad.t + plotH) return;
      ctx.strokeStyle = COL.grid; ctx.beginPath();
      ctx.moveTo(pad.l, y + .5); ctx.lineTo(pad.l + plotW, y + .5); ctx.stroke();
      ctx.fillStyle = COL.text; ctx.fillText(fmtNum(v, 2), pad.l + plotW + 6, y);
    });

    bars.forEach((b, i) => {
      const up = b[4] >= b[1];
      const cx = X(i);
      ctx.strokeStyle = up ? COL.up : COL.down;
      ctx.fillStyle = up ? COL.up : COL.down;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, Y(b[2])); ctx.lineTo(cx, Y(b[3])); ctx.stroke();
      const y1 = Y(Math.max(b[1], b[4])), y2 = Y(Math.min(b[1], b[4]));
      ctx.fillRect(cx - bw / 2, y1, bw, Math.max(1, y2 - y1));
    });

    // x 轴时间
    const nx = Math.max(2, Math.floor(plotW / 110));
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = COL.text;
    for (let k = 0; k <= nx; k++) {
      const i = Math.round((n - 1) * k / nx);
      const b = bars[Math.min(i, n - 1)];
      ctx.fillText(opts.xFmt ? opts.xFmt(b[0]) : '', X(i), h - 17);
    }

    // 交易标记
    (opts.trades || []).forEach(t => {
      const i = t.idx;
      if (i === undefined || i < 0 || i >= n) return;
      const long = t.dir === 'long';
      if (t.open) {
        const y = Y(long ? bars[i][3] : bars[i][2]);
        const off = long ? 9 : -9;
        ctx.beginPath();
        ctx.moveTo(X(i), y + off);
        ctx.lineTo(X(i) - 4, y + off + (long ? 7 : -7));
        ctx.lineTo(X(i) + 4, y + off + (long ? 7 : -7));
        ctx.closePath();
        ctx.fillStyle = long ? COL.up : COL.down;
        ctx.globalAlpha = .9; ctx.fill(); ctx.globalAlpha = 1;
      } else {
        const y = Y(t.price !== undefined ? t.price : bars[i][4]);
        ctx.beginPath(); ctx.arc(X(i), y, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = t.pnl > 0 ? COL.up : COL.down;
        ctx.fill();
      }
    });
    return { X, Y, slot, xMin: 0, xMax: n - 1, lo, hi, pad, plotW, plotH };
  }

  /** 竖向柱状图 (分布) */
  function barChart(canvas, items, opts) {
    const { ctx, w, h } = setup(canvas);
    const pad = { l: 46, r: 10, t: 14, b: 30 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    if (!items.length || plotW <= 0) return null;
    const vals = items.map(d => d.v);
    const maxV = Math.max(...vals, 0), minV = Math.min(...vals, 0);
    const span = (maxV - minV) || 1;
    const Y = v => pad.t + plotH - (v - minV) / span * plotH;
    const slot = plotW / items.length;
    const bw = Math.min(38, slot * 0.62);

    const zeroY = Y(0);
    ctx.strokeStyle = COL.axis; ctx.beginPath();
    ctx.moveTo(pad.l, zeroY + .5); ctx.lineTo(pad.l + plotW, zeroY + .5); ctx.stroke();

    const { ticks } = niceTicks(minV, maxV, 4);
    ctx.font = '11px ui-monospace, Menlo, monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ticks.forEach(v => {
      const y = Y(v); if (y < pad.t - 1 || y > pad.t + plotH + 1) return;
      ctx.strokeStyle = COL.grid; ctx.beginPath(); ctx.moveTo(pad.l, y + .5); ctx.lineTo(pad.l + plotW, y + .5); ctx.stroke();
      ctx.fillStyle = COL.text; ctx.fillText(opts.yFmt ? opts.yFmt(v) : fmtNum(v, 0), pad.l - 7, y);
    });

    items.forEach((d, i) => {
      const cx = pad.l + (i + 0.5) * slot;
      const y0 = Y(0), y1 = Y(d.v);
      ctx.fillStyle = d.c || (d.v >= 0 ? COL.up : COL.down);
      ctx.fillRect(cx - bw / 2, Math.min(y0, y1), bw, Math.max(1, Math.abs(y1 - y0)));
      ctx.fillStyle = COL.text; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.font = '10px ui-monospace, Menlo, monospace';
      if (items.length <= 8 || i % Math.ceil(items.length / 8) === 0) {
        ctx.fillText(d.k, cx, pad.t + plotH + 8);
      }
    });
    return { pad, plotW, plotH, slot, Y };
  }

  window.Charts = { lineChart, candleChart, barChart, COL, fmtNum, niceTicks, DPR };
})();
