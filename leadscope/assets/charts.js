/* ChartKit — tiny dependency-free canvas charts for LeadScope */
(function (root) {
  "use strict";
  var C = {
    ink: "#e9eefb", muted: "#95a2bd", dim: "#63708c", grid: "rgba(255,255,255,.055)",
    line: "#18202f", up: "#2ee6a8", down: "#ff5c7a", amber: "#ffc857",
    accent: "#6ea8ff", violet: "#a78bfa", panel: "#0b1019"
  };

  function setup(canvas, h) {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(rect.width, 240);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = h + "px";
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function font(ctx, size, weight) {
    ctx.font = (weight || 400) + " " + size + "px 'SF Mono', Consolas, ui-monospace, monospace";
  }

  function tip(container) {
    var el = container.querySelector(".chart-tip");
    if (!el) {
      el = document.createElement("div");
      el.className = "chart-tip";
      container.appendChild(el);
    }
    return el;
  }

  function fmtPct(v, d) {
    if (v === null || v === undefined || isNaN(v)) return "—";
    var s = Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(d === undefined ? 1 : d);
    return (v > 0 ? "+" : "") + s + "%";
  }

  /* ---------------- scatter: 30d return vs max drawdown ---------------- */
  function scatter(canvas, points, opt) {
    opt = opt || {};
    var h = opt.height || 380;
    var s = setup(canvas, h);
    var ctx = s.ctx, W = s.w, H = s.h;
    var pad = { l: 52, r: 18, t: 16, b: 40 };

    var xMax = opt.xMax || 500, xMin = opt.xMin || -100;
    var sx = function (v) {
      v = Math.max(xMin, Math.min(xMax, v));
      var t = Math.sign(v) * Math.sqrt(Math.abs(v));
      var tMax = Math.sqrt(xMax), tMin = -Math.sqrt(Math.abs(xMin));
      return pad.l + (t - tMin) / (tMax - tMin) * (W - pad.l - pad.r);
    };
    var sy = function (v) {
      v = Math.max(-100, Math.min(0, v));
      return pad.t + (-v / 100) * (H - pad.t - pad.b);
    };

    // quadrant tints
    ctx.fillStyle = "rgba(255,92,122,.045)";
    ctx.fillRect(pad.l, sy(-62), W - pad.l - pad.r, sy(-100) - sy(-62));
    ctx.fillStyle = "rgba(46,230,168,.035)";
    ctx.fillRect(sx(0), pad.t, W - pad.r - sx(0), sy(-25) - pad.t);

    // grid + y labels
    font(ctx, 10);
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    [-100, -75, -50, -25, 0].forEach(function (v) {
      var y = sy(v);
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      ctx.fillStyle = C.dim; ctx.fillText(v + "%", pad.l - 9, y);
    });
    // x ticks
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    [-100, -25, 0, 25, 100, 200, 300, 500].forEach(function (v) {
      var x = sx(v);
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, H - pad.b); ctx.stroke();
      ctx.fillStyle = C.dim; ctx.fillText(fmtPct(v, 0), x, H - pad.b + 8);
    });
    font(ctx, 10);
    ctx.fillStyle = C.dim; ctx.textAlign = "right";
    ctx.fillText("30 天收益 →", W - pad.r, H - 14);
    ctx.save(); ctx.translate(12, pad.t + 4); ctx.rotate(-Math.PI / 2); ctx.textAlign = "left";
    ctx.fillText("最大回撤", 0, 0); ctx.restore();

    // quadrant captions
    font(ctx, 10);
    ctx.fillStyle = "rgba(255,92,122,.5)"; ctx.textAlign = "left";
    ctx.fillText("灾难区 · 回撤 >60%", pad.l + 10, sy(-94));
    ctx.fillStyle = "rgba(46,230,168,.5)";
    ctx.fillText("可考虑区 · 正收益 & 回撤 <25%", sx(0) + 10, pad.t + 12);

    // normal dots
    ctx.globalAlpha = .55;
    points.forEach(function (p) {
      if (p.top) return;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), 2.4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // highlighted top10
    points.forEach(function (p) {
      if (!p.top) return;
      var x = sx(p.x), y = sy(p.y);
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = C.amber;
      ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2); ctx.fill();
    });

    // hover
    var el = tip(canvas.parentElement);
    canvas.onmousemove = function (ev) {
      var r = canvas.getBoundingClientRect();
      var mx = ev.clientX - r.left, my = ev.clientY - r.top;
      var best = null, bd = 1e9;
      points.forEach(function (p) {
        var d = Math.hypot(sx(p.x) - mx, sy(p.y) - my);
        if (d < bd) { bd = d; best = p; }
      });
      if (best && bd < 14) {
        el.style.opacity = 1;
        el.innerHTML = "<b>" + best.label + "</b><span>30天 " + fmtPct(best.x) + " · 回撤 " + fmtPct(best.y, 0) + "</span>";
        el.style.left = Math.min(W - 170, Math.max(8, mx + 14)) + "px";
        el.style.top = Math.max(6, my - 46) + "px";
      } else el.style.opacity = 0;
    };
    canvas.onmouseleave = function () { el.style.opacity = 0; };
  }

  /* ---------------- histogram of 30d returns ---------------- */
  function hist(canvas, values, opt) {
    opt = opt || {};
    var h = opt.height || 300;
    var s = setup(canvas, h);
    var ctx = s.ctx, W = s.w, H = s.h;
    var pad = { l: 40, r: 14, t: 14, b: 42 };
    var bins = opt.bins || [
      { to: -50, label: "<-50" }, { to: -25, label: "-50~-25" }, { to: -10, label: "-25~-10" },
      { to: 0, label: "-10~0" }, { to: 10, label: "0~10" }, { to: 25, label: "10~25" },
      { to: 50, label: "25~50" }, { to: 100, label: "50~100" }, { to: 200, label: "100~200" },
      { to: 1e9, label: ">200" }
    ];
    var counts = bins.map(function () { return 0; });
    var posCounts = bins.map(function () { return 0; });
    values.forEach(function (v) {
      for (var i = 0; i < bins.length; i++) {
        var prev = i === 0 ? -1e9 : bins[i - 1].to;
        if (v > prev && v <= bins[i].to) { counts[i]++; if (v > 0) posCounts[i]++; break; }
      }
    });
    var maxC = Math.max.apply(null, counts) || 1;
    var bw = (W - pad.l - pad.r) / bins.length;
    var top10Count = counts[7] + counts[8] + counts[9];

    font(ctx, 10);
    for (var g = 0; g <= 4; g++) {
      var y = pad.t + (H - pad.t - pad.b) * g / 4;
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      ctx.fillStyle = C.dim; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(Math.round(maxC * (1 - g / 4)), pad.l - 8, y);
    }
    bins.forEach(function (b, i) {
      var x = pad.l + i * bw + 3;
      var bh = (counts[i] / maxC) * (H - pad.t - pad.b);
      var y0 = H - pad.b - bh;
      ctx.fillStyle = i >= 7 ? "rgba(255,200,87,.75)" : (b.to <= 0 ? "rgba(255,92,122,.55)" : "rgba(46,230,168,.5)");
      ctx.fillRect(x, y0, bw - 6, bh);
      ctx.fillStyle = C.dim; ctx.textAlign = "center"; ctx.textBaseline = "top";
      font(ctx, 9);
      ctx.fillText(b.label, x + (bw - 6) / 2, H - pad.b + 8);
      if (counts[i]) {
        ctx.fillStyle = i >= 7 ? C.amber : C.muted; ctx.textBaseline = "bottom";
        font(ctx, 10, 600);
        ctx.fillText(counts[i], x + (bw - 6) / 2, y0 - 3);
      }
    });

  }

  /* ---------------- dumbbell: prior 60d vs last 30d ---------------- */
  function dumbbell(canvas, rows, opt) {
    opt = opt || {};
    var h = opt.height || 420;
    var s = setup(canvas, h);
    var ctx = s.ctx, W = s.w, H = s.h;
    var pad = { l: 132, r: 26, t: 26, b: 30 };
    var all = [];
    rows.forEach(function (r) { all.push(r.a); all.push(r.b); });
    var vMax = Math.max.apply(null, all), vMin = Math.min.apply(null, all);
    var lo = Math.min(vMin, -10) * 1.08, hi = Math.max(vMax, 10) * 1.08;
    var sx = function (v) { return pad.l + (v - lo) / (hi - lo) * (W - pad.l - pad.r); };
    var zero = sx(0);
    var rowH = (H - pad.t - pad.b) / rows.length;

    // zero line
    ctx.strokeStyle = "rgba(255,255,255,.16)"; ctx.beginPath(); ctx.moveTo(zero, pad.t - 6); ctx.lineTo(zero, H - pad.b + 6); ctx.stroke();
    font(ctx, 10); ctx.fillStyle = C.dim; ctx.textAlign = "center"; ctx.textBaseline = "top";
    [-100, -50, 0, 50, 100, 200, 300, 400, 500].forEach(function (v) {
      if (v < lo || v > hi) return;
      ctx.fillText(fmtPct(v, 0), sx(v), 6);
    });

    rows.forEach(function (r, i) {
      var y = pad.t + rowH * i + rowH / 2;
      ctx.strokeStyle = "rgba(255,255,255,.13)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx(r.a), y); ctx.lineTo(sx(r.b), y); ctx.stroke();
      ctx.fillStyle = C.down;
      ctx.beginPath(); ctx.arc(sx(r.a), y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = r.b >= 0 ? C.up : C.down;
      ctx.beginPath(); ctx.arc(sx(r.b), y, 4.5, 0, Math.PI * 2); ctx.fill();
      font(ctx, 10.5); ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillStyle = C.muted;
      var name = r.label.length > 18 ? r.label.slice(0, 17) + "…" : r.label;
      ctx.fillText(name, pad.l - 12, y);
    });
    // legend
    font(ctx, 10); ctx.textAlign = "right"; ctx.textBaseline = "top";
    ctx.fillStyle = C.down; ctx.fillText("● 前 60 天", W - 96, H - 18);
    ctx.fillStyle = C.up; ctx.fillText("● 近 30 天", W - 16, H - 18);
  }

  /* ---------------- fan chart of simulated equity paths ---------------- */
  function fan(canvas, curves, opt) {
    opt = opt || {};
    var h = opt.height || 300;
    var s = setup(canvas, h);
    var ctx = s.ctx, W = s.w, H = s.h;
    var pad = { l: 50, r: 16, t: 14, b: 30 };
    var months = Math.max.apply(null, curves.map(function (c) { return c.length - 1; })) || 1;
    var maxV = 1, minV = 1;
    curves.forEach(function (c) { c.forEach(function (v) { if (v > 0) { maxV = Math.max(maxV, v); minV = Math.min(minV, v); } }); });
    var lo = Math.log10(Math.max(0.02, minV)) - 0.08, hi = Math.log10(maxV) + 0.08;
    var sx = function (i) { return pad.l + i / months * (W - pad.l - pad.r); };
    var sy = function (v) {
      var lv = Math.log10(Math.max(0.02, v));
      return pad.t + (hi - lv) / (hi - lo) * (H - pad.t - pad.b);
    };

    font(ctx, 10); ctx.textAlign = "right"; ctx.textBaseline = "middle";
    [0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 10].forEach(function (v) {
      if (Math.log10(v) < lo || Math.log10(v) > hi) return;
      var y = sy(v);
      ctx.strokeStyle = v === 1 ? "rgba(255,255,255,.18)" : C.grid;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      ctx.fillStyle = C.dim; ctx.fillText(v + "x", pad.l - 8, y);
    });
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (var m = 0; m <= months; m++) {
      if (months > 8 && m % 2) continue;
      ctx.fillStyle = C.dim; font(ctx, 10);
      ctx.fillText(m + "月", sx(m), H - pad.b + 8);
    }

    function band(q1, q2, color) {
      ctx.beginPath();
      for (var i = 0; i <= months; i++) {
        var vals = curves.map(function (c) { return c[Math.min(i, c.length - 1)]; }).sort(function (a, b) { return a - b; });
        var v = vals[Math.min(vals.length - 1, Math.floor(vals.length * q1))];
        if (i === 0) ctx.moveTo(sx(i), sy(v)); else ctx.lineTo(sx(i), sy(v));
      }
      for (var j = months; j >= 0; j--) {
        var vals2 = curves.map(function (c) { return c[Math.min(j, c.length - 1)]; }).sort(function (a, b) { return a - b; });
        var v2 = vals2[Math.min(vals2.length - 1, Math.floor(vals2.length * q2))];
        ctx.lineTo(sx(j), sy(v2));
      }
      ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    }
    band(0.05, 0.95, "rgba(110,168,255,.10)");
    band(0.25, 0.75, "rgba(110,168,255,.18)");

    // median line
    ctx.beginPath(); ctx.strokeStyle = C.accent; ctx.lineWidth = 1.6;
    for (var i2 = 0; i2 <= months; i2++) {
      var vs = curves.map(function (c) { return c[Math.min(i2, c.length - 1)]; }).sort(function (a, b) { return a - b; });
      var mv = vs[Math.floor(vs.length / 2)];
      if (i2 === 0) ctx.moveTo(sx(i2), sy(mv)); else ctx.lineTo(sx(i2), sy(mv));
    }
    ctx.stroke(); ctx.lineWidth = 1;
    font(ctx, 10); ctx.textAlign = "right"; ctx.textBaseline = "top";
    ctx.fillStyle = C.dim; ctx.fillText("对数刻度 · 中位线 + 50/80% 区间", W - pad.r, 0);
  }

  root.ChartKit = { scatter: scatter, hist: hist, dumbbell: dumbbell, fan: fan, C: C, fmtPct: fmtPct, setup: setup };
})(window);
