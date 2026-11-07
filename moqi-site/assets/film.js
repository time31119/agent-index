(function () {
  "use strict";

  /* ============================================================
     Configuration
     ============================================================ */

  var C = {
    paper: "#F4EFE4",
    paperRaised: "#FAF6EC",
    paperDeep: "#E9E1D2",
    ink: "#171713",
    ink2: "#35342E",
    muted: "#726D61",
    faint: "#9A9487",
    red: "#C8402C",
    redDeep: "#9D2C1B",
    redSoft: "#E7765F",
    green: "#4D6352",
    night: "#11120F",
    night2: "#191A16",
    line: "rgba(23,23,19,.15)",
    lineNight: "rgba(244,239,228,.15)"
  };

  var SERIF = '"Noto Serif SC","Songti SC","STSong","SimSun",serif';
  var SANS = '"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif';
  var MONO = '"IBM Plex Mono","SFMono-Regular",Consolas,monospace';

  var COPY = {
    film: {
      disappear: ["有些话，", "说完就消失了。"],
      disappearSub: "不是每一句话，都值得被留下。",
      decide: ["但有些话，", "会在第二天", "决定一件事。"],
      decideSub: "THE NEXT DAY / 09:14",
      promise: ["你答应过什么？"],
      promiseSub: "不是所有承诺，都会被写下来。",
      revealEyebrow: "CARD 01 / CONSENT-FIRST AI MEMORY CARD",
      revealTitle: "默契",
      revealSub: ["一张先征得同意，", "再开始记录的记忆卡。"],
      revealTag: "不是又一个录音笔。",
      consentKicker: "CONSENT / 双方确认",
      consentTitle: ["可以吗？"],
      consentDone: "双方确认，才开始。",
      receiptTitle: ["每一次对话，", "都有一张回执。"],
      localTitle: ["记忆的默认值，", "是不上云。"],
      localSub: "它不回答你，只替你记得。",
      endTitle: "默契",
      endClaim: "记得住，也懂分寸。",
      endSub: "FOUNDING 500 / MOQI.STUDIO"
    },
    short: {
      disappear: ["有些话，", "说完就消失了。"],
      disappearSub: "有些话，会在第二天决定一件事。",
      revealEyebrow: "CONSENT-FIRST AI MEMORY CARD",
      revealTitle: "默契",
      revealSub: ["一张先征得同意，", "再开始记录的记忆卡。"],
      revealTag: "不是又一个录音笔。",
      consentKicker: "TWO TO AGREE",
      consentTitle: ["双方确认，", "才开始。"],
      consentDone: "",
      endTitle: "默契",
      endClaim: "记得住，也懂分寸。",
      endSub: "MOQI / FOUNDING 500"
    }
  };

  var CUTS = {
    film: {
      total: 48,
      scenes: [
        { key: "disappear", t0: 0, t1: 5, bg: "night" },
        { key: "decide", t0: 5, t1: 10.5, bg: "night" },
        { key: "promise", t0: 10.5, t1: 16, bg: "paper" },
        { key: "reveal", t0: 16, t1: 23, bg: "paper" },
        { key: "consent", t0: 23, t1: 30, bg: "paper" },
        { key: "receipt", t0: 30, t1: 37, bg: "paper" },
        { key: "local", t0: 37, t1: 43, bg: "night" },
        { key: "end", t0: 43, t1: 48, bg: "red" }
      ]
    },
    short: {
      total: 15,
      scenes: [
        { key: "disappear", t0: 0, t1: 3.2, bg: "night" },
        { key: "reveal", t0: 3.2, t1: 7.2, bg: "paper" },
        { key: "consent", t0: 7.2, t1: 11.2, bg: "paper" },
        { key: "end", t0: 11.2, t1: 15, bg: "red" }
      ]
    }
  };

  /* ============================================================
     DOM
     ============================================================ */

  var canvas = document.getElementById("filmCanvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var els = {
    shell: document.querySelector("[data-canvas-shell]"),
    play: document.querySelector("[data-play]"),
    playOverlay: document.querySelector("[data-play-overlay]"),
    playLabel: document.querySelector("[data-play-label]"),
    restart: document.querySelector("[data-restart]"),
    mute: document.querySelector("[data-mute]"),
    timeline: document.querySelector("[data-timeline]"),
    time: document.querySelector("[data-time]"),
    formatLabel: document.querySelector("[data-format-label]"),
    specFormat: document.querySelector("[data-spec-format]"),
    specDuration: document.querySelector("[data-spec-duration]"),
    exportBtn: document.querySelector("[data-export]"),
    downloadLink: document.querySelector("[data-export-download]"),
    overlay: document.querySelector("[data-export-overlay]"),
    exportPercent: document.querySelector("[data-export-percent]"),
    exportBar: document.querySelector("[data-export-bar]"),
    toast: document.querySelector("[data-toast]")
  };

  var lastDownloadUrl = null;

  var state = {
    cut: "film",
    format: "vertical",
    t: 0,
    playing: false,
    muted: false,
    exporting: false,
    total: 48
  };

  var W = 1080;
  var H = 1920;
  var raf = 0;
  var playStart = 0;
  var lastUiT = -1;

  /* ============================================================
     Utilities
     ============================================================ */

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function clamp01(v) {
    return clamp(v, 0, 1);
  }

  function easeOut(p) {
    p = clamp01(p);
    return 1 - Math.pow(1 - p, 3);
  }

  function easeInOut(p) {
    p = clamp01(p);
    return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  }

  function easeBack(p) {
    p = clamp01(p);
    var c = 1.70158;
    return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
  }

  function fadeIn(t, start, dur) {
    if (t <= start) return 0;
    return clamp01((t - start) / Math.max(0.001, dur));
  }

  function fadeOut(t, start, dur) {
    return 1 - fadeIn(t, start, dur);
  }

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fillRR(x, y, w, h, r, fill) {
    ctx.fillStyle = fill;
    rr(x, y, w, h, r);
    ctx.fill();
  }

  function strokeRR(x, y, w, h, r, stroke, lineWidth) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth || 1;
    rr(x, y, w, h, r);
    ctx.stroke();
  }

  function font(size, weight, family) {
    return (weight || 600) + " " + Math.round(size) + "px " + (family || SERIF);
  }

  function text(str, x, y, opts) {
    opts = opts || {};
    var size = opts.size || 48;
    var weight = opts.weight || 600;
    var family = opts.family || SERIF;
    var color = opts.color || C.paper;
    var align = opts.align || "center";
    var baseline = opts.baseline || "middle";
    var alpha = opts.alpha == null ? 1 : opts.alpha;
    var tracking = opts.tracking || 0;

    if (alpha <= 0.001) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = color;
    ctx.font = font(size, weight, family);
    ctx.textBaseline = baseline;

    if (!tracking) {
      ctx.textAlign = align;
      ctx.fillText(str, x, y);
    } else {
      var chars = Array.from(String(str));
      var widths = chars.map(function (ch) { return ctx.measureText(ch).width; });
      var total = widths.reduce(function (a, b) { return a + b; }, 0) + tracking * Math.max(0, chars.length - 1);
      var cx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
      ctx.textAlign = "left";
      for (var i = 0; i < chars.length; i++) {
        ctx.fillText(chars[i], cx, y);
        cx += widths[i] + tracking;
      }
    }
    ctx.restore();
  }

  function stack(lines, x, y, size, lineH, opts) {
    opts = opts || {};
    var alpha = opts.alpha == null ? 1 : opts.alpha;
    var start = y - ((lines.length - 1) * lineH) / 2;
    for (var i = 0; i < lines.length; i++) {
      text(lines[i], x, start + i * lineH, Object.assign({}, opts, { size: size, alpha: alpha }));
    }
  }

  function drawLinesTop(lines, x, y, size, lineH, opts) {
    opts = opts || {};
    for (var i = 0; i < lines.length; i++) {
      text(lines[i], x, y + i * lineH, Object.assign({}, opts, { size: size, baseline: "top" }));
    }
  }

  /* ============================================================
     Textures / backgrounds
     ============================================================ */

  var noiseCanvas = null;
  var noiseAudioBuffer = null;
  var einkPattern = null;

  function makeNoiseCanvas() {
    var c = document.createElement("canvas");
    c.width = c.height = 180;
    var g = c.getContext("2d");
    var img = g.createImageData(180, 180);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = 80 + Math.random() * 160;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 26;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function paintGrain(alpha) {
    if (!noiseCanvas) noiseCanvas = makeNoiseCanvas();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(noiseCanvas, 0, 0, W, H);
    ctx.restore();
  }

  function paintVignette(strength) {
    var g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.22, W / 2, H / 2, Math.max(W, H) * 0.78);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0," + strength + ")");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function background(kind) {
    ctx.save();
    if (kind === "paper") {
      ctx.fillStyle = C.paper;
      ctx.fillRect(0, 0, W, H);
      var pg = ctx.createRadialGradient(W * 0.82, H * 0.08, 0, W * 0.82, H * 0.08, W * 0.85);
      pg.addColorStop(0, "rgba(200,64,44,.055)");
      pg.addColorStop(1, "rgba(200,64,44,0)");
      ctx.fillStyle = pg;
      ctx.fillRect(0, 0, W, H);
      paintGrain(0.06);
      paintVignette(0.12);
    } else if (kind === "red") {
      ctx.fillStyle = C.red;
      ctx.fillRect(0, 0, W, H);
      var rg = ctx.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.38, Math.max(W, H) * 0.75);
      rg.addColorStop(0, "rgba(255,180,150,.16)");
      rg.addColorStop(1, "rgba(80,10,4,.34)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
      paintGrain(0.035);
      paintVignette(0.24);
    } else {
      ctx.fillStyle = C.night;
      ctx.fillRect(0, 0, W, H);
      var ng = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.72);
      ng.addColorStop(0, "rgba(200,64,44,.075)");
      ng.addColorStop(1, "rgba(200,64,44,0)");
      ctx.fillStyle = ng;
      ctx.fillRect(0, 0, W, H);
      paintGrain(0.045);
      paintVignette(0.38);
    }
    ctx.restore();
  }

  /* ============================================================
     HUD
     ============================================================ */

  function hud(t, scene, index, total, count) {
    var dark = scene.bg !== "paper";
    var color = dark ? "rgba(244,239,228,.56)" : "rgba(23,23,19,.5)";
    var faint = dark ? "rgba(244,239,228,.26)" : "rgba(23,23,19,.24)";
    var line = dark ? "rgba(244,239,228,.16)" : "rgba(23,23,19,.14)";
    var progress = dark ? C.redSoft : C.red;

    text("MOQI / THE MEMORY FILM", 54, 48, {
      size: 17, family: MONO, weight: 500, color: color, align: "left", tracking: 1.6
    });
    text(String(index + 1).padStart(2, "0") + " / " + String(count).padStart(2, "0"), W - 54, 48, {
      size: 17, family: MONO, weight: 500, color: color, align: "right", tracking: 1.2
    });
    text(total + " SEC / 30 FPS", 54, H - 46, {
      size: 13, family: MONO, weight: 400, color: faint, align: "left", tracking: 1.2
    });
    text("MOQI.STUDIO", W - 54, H - 46, {
      size: 13, family: MONO, weight: 400, color: faint, align: "right", tracking: 1.2
    });

    ctx.fillStyle = line;
    ctx.fillRect(54, H - 27, W - 108, 1);
    ctx.fillStyle = progress;
    ctx.fillRect(54, H - 27, (W - 108) * clamp01(t / total), 1);
  }

  /* ============================================================
     Small graphics
     ============================================================ */

  function drawWave(cx, cy, width, height, phase, alpha, color) {
    var bars = 72;
    var gap = width / bars;
    var bw = Math.max(1.5, gap * 0.28);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    for (var i = 0; i < bars; i++) {
      var x = cx - width / 2 + i * gap;
      var n = Math.abs(Math.sin(i * 0.61 + phase * 1.4) * Math.cos(i * 0.17 - phase * 0.7));
      var h = height * (0.08 + n * 0.92);
      ctx.fillRect(x, cy - h / 2, bw, h);
    }
    ctx.restore();
  }

  function drawMark(cx, cy, size, bg, fg) {
    fillRR(cx - size / 2, cy - size / 2, size, size, size * 0.22, bg);
    ctx.save();
    ctx.strokeStyle = fg;
    ctx.lineWidth = size * 0.075;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.16, cy - size * 0.29);
    ctx.bezierCurveTo(cx - size * 0.39, cy - size * 0.13, cx - size * 0.39, cy + size * 0.13, cx - size * 0.16, cy + size * 0.29);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.16, cy - size * 0.29);
    ctx.bezierCurveTo(cx + size * 0.39, cy - size * 0.13, cx + size * 0.39, cy + size * 0.13, cx + size * 0.16, cy + size * 0.29);
    ctx.stroke();
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function getEinkPattern() {
    if (einkPattern) return einkPattern;
    var c = document.createElement("canvas");
    c.width = c.height = 6;
    var g = c.getContext("2d");
    g.fillStyle = "rgba(45,53,42,.9)";
    g.fillRect(1, 1, 1, 1);
    g.fillRect(4, 3, 1, 1);
    einkPattern = ctx.createPattern(c, "repeat");
    return einkPattern;
  }

  function drawShadow(cx, cy, rx, ry, alpha) {
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    g.addColorStop(0, "rgba(0,0,0," + alpha + ")");
    g.addColorStop(0.55, "rgba(0,0,0," + alpha * 0.5 + ")");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ============================================================
     The card
     ============================================================ */

  function drawCard(cx, cy, cw, angle, opts) {
    opts = opts || {};
    var ch = cw / 1.586;
    var s = cw / 760;
    var scale = opts.scale == null ? 1 : opts.scale;
    var consent = opts.consent || "0/2";
    var status = opts.status || "待机 · 未记录";
    var line = opts.line || "轻触「共识键」，与对方一起开始。";
    var lines = Array.isArray(line) ? line : [line];
    var recording = !!opts.recording;
    var taps = opts.taps || [];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    /* shadow */
    ctx.save();
    ctx.shadowColor = "rgba(23,23,19,.38)";
    ctx.shadowBlur = 42 * s;
    ctx.shadowOffsetY = 24 * s;
    fillRR(-cw / 2, -ch / 2, cw, ch, 22 * s, "#e8dfcf");
    ctx.restore();

    /* body */
    var g = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
    g.addColorStop(0, "#FCF8EE");
    g.addColorStop(0.5, "#F0E8D8");
    g.addColorStop(1, "#DCD2BE");
    ctx.fillStyle = g;
    rr(-cw / 2, -ch / 2, cw, ch, 22 * s);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.65)";
    ctx.lineWidth = 1;
    rr(-cw / 2, -ch / 2, cw, ch, 22 * s);
    ctx.stroke();
    ctx.strokeStyle = "rgba(94,78,52,.22)";
    ctx.lineWidth = 1;
    rr(-cw / 2 + 1, -ch / 2 + 1, cw - 2, ch - 2, 21 * s);
    ctx.stroke();

    /* top slot */
    fillRR(-46 * s, -ch / 2 + 10 * s, 92 * s, 6 * s, 3 * s, "rgba(38,34,27,.88)");

    /* head */
    drawMark(-cw / 2 + 42 * s, -ch / 2 + 44 * s, 32 * s, C.red, C.paper);
    text("默契", -cw / 2 + 68 * s, -ch / 2 + 36 * s, {
      size: 27 * s, weight: 700, color: C.ink, align: "left", tracking: 1.5
    });
    text("MOQI", -cw / 2 + 69 * s, -ch / 2 + 55 * s, {
      size: 7 * s, family: MONO, weight: 500, color: C.red, align: "left", tracking: 1.8
    });
    text("CARD 01 / NO. 0001", cw / 2 - 34 * s, -ch / 2 + 35 * s, {
      size: 8 * s, family: MONO, weight: 500, color: "rgba(23,23,19,.6)", align: "right", tracking: 0.6
    });
    text("CONSENT-FIRST MEMORY", cw / 2 - 34 * s, -ch / 2 + 51 * s, {
      size: 5.8 * s, family: MONO, weight: 400, color: "rgba(23,23,19,.38)", align: "right", tracking: 0.5
    });

    /* e-ink */
    var ex = -cw / 2 + 34 * s;
    var ey = -ch / 2 + 76 * s;
    var ew = cw * 0.55;
    var eh = ch * 0.54;
    var eg = ctx.createLinearGradient(ex, ey, ex + ew, ey + eh);
    eg.addColorStop(0, "#E6E9DE");
    eg.addColorStop(1, "#D2D8C9");
    fillRR(ex, ey, ew, eh, 8 * s, eg);
    strokeRR(ex, ey, ew, eh, 8 * s, "rgba(23,23,19,.24)", 1);
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = getEinkPattern();
    ctx.fillRect(ex, ey, ew, eh);
    ctx.restore();

    var dotX = ex + 15 * s;
    var dotY = ey + 18 * s;
    ctx.fillStyle = recording ? C.red : "#7E8878";
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    if (recording) {
      ctx.strokeStyle = "rgba(200,64,44,.25)";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 9 * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    text(status, ex + 25 * s, ey + 18 * s, {
      size: 10.5 * s, family: MONO, weight: 500, color: "#3E473B", align: "left", tracking: 0.2
    });
    text("LOCAL", ex + ew - 14 * s, ey + 18 * s, {
      size: 8 * s, family: MONO, weight: 400, color: "#65705F", align: "right", tracking: 0.8
    });
    text(opts.time || "00:00:00", ex + 15 * s, ey + 53 * s, {
      size: 36 * s, family: MONO, weight: 500, color: "#1C211B", align: "left", tracking: -1.2
    });

    /* waveform */
    var waveY = ey + 93 * s;
    var waveW = ew - 30 * s;
    var bars = 18;
    var barGap = waveW / bars;
    ctx.save();
    ctx.fillStyle = "#465143";
    for (var i = 0; i < bars; i++) {
      var n = Math.abs(Math.sin(i * 0.9 + (opts.wavePhase || 0)) * Math.cos(i * 0.27));
      var bh = (8 + n * 20) * s;
      ctx.globalAlpha = 0.78;
      ctx.fillRect(ex + 15 * s + i * barGap, waveY - bh / 2, Math.max(2, barGap * 0.25), bh);
    }
    ctx.restore();

    /* card copy */
    drawLinesTop(lines, ex + 15 * s, ey + eh * 0.61, 13 * s, 19 * s, {
      family: SERIF, weight: 500, color: "#333A30", align: "left"
    });
    ctx.fillStyle = "rgba(23,23,19,.19)";
    ctx.fillRect(ex + 15 * s, ey + eh - 24 * s, ew - 30 * s, 1);
    text("CONSENT", ex + 15 * s, ey + eh - 14 * s, {
      size: 8 * s, family: MONO, weight: 500, color: "#596152", align: "left", tracking: 0.6
    });
    text(consent, ex + ew - 15 * s, ey + eh - 14 * s, {
      size: 9 * s, family: MONO, weight: 600, color: "#1F241D", align: "right", tracking: 0.6
    });

    /* key */
    var kx = cw * 0.29;
    var ky = 4 * s;
    var kr = cw * 0.112;
    ctx.save();
    ctx.strokeStyle = "rgba(23,23,19,.18)";
    ctx.setLineDash([3 * s, 5 * s]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(kx, ky, kr * 1.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    var kg = ctx.createRadialGradient(kx - kr * 0.35, ky - kr * 0.4, 0, kx, ky, kr);
    kg.addColorStop(0, "#E46A52");
    kg.addColorStop(0.48, "#C8402C");
    kg.addColorStop(0.8, "#9F2C1B");
    kg.addColorStop(1, "#782013");
    ctx.fillStyle = kg;
    ctx.beginPath();
    ctx.arc(kx, ky, kr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.arc(kx, ky, kr * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    text("共识", kx, ky - 4 * s, {
      size: 16 * s, weight: 600, color: C.paper, tracking: 1.6
    });
    text("TAP TO AGREE", kx, ky + 15 * s, {
      size: 5.2 * s, family: MONO, weight: 500, color: "rgba(244,239,228,.78)", tracking: 0.8
    });

    for (var ti = 0; ti < taps.length; ti++) {
      var age = taps[ti];
      if (age < 0 || age > 1.35) continue;
      var p = age / 1.35;
      ctx.save();
      ctx.globalAlpha = 0.52 * (1 - p);
      ctx.strokeStyle = C.red;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(kx, ky, kr * (1 + p * 1.15), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    text("双方各按一次", kx, ky + kr + 20 * s, {
      size: 7 * s, family: MONO, weight: 500, color: "rgba(23,23,19,.44)", tracking: 0.4
    });

    /* foot */
    ctx.fillStyle = "rgba(23,23,19,.16)";
    ctx.fillRect(-cw / 2 + 34 * s, ch / 2 - 27 * s, cw - 68 * s, 1);
    text("85.6 × 54 MM", -cw / 2 + 34 * s, ch / 2 - 14 * s, {
      size: 6.2 * s, family: MONO, weight: 400, color: "rgba(23,23,19,.42)", align: "left", tracking: 0.3
    });
    text("32 GB · LOCAL VAULT", 0, ch / 2 - 14 * s, {
      size: 6.2 * s, family: MONO, weight: 400, color: "rgba(23,23,19,.42)", align: "center", tracking: 0.3
    });
    text("DESIGNED FOR CONVERSATIONS", cw / 2 - 34 * s, ch / 2 - 14 * s, {
      size: 5.3 * s, family: MONO, weight: 400, color: "rgba(23,23,19,.3)", align: "right", tracking: 0.3
    });

    ctx.restore();
  }

  /* ============================================================
     Receipt
     ============================================================ */

  function drawReceipt(cx, cy, rw, rh, reveal, stampP) {
    var s = rw / 640;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-1.5 * Math.PI / 180);

    ctx.save();
    ctx.shadowColor = "rgba(23,23,19,.32)";
    ctx.shadowBlur = 32 * s;
    ctx.shadowOffsetY = 18 * s;
    fillRR(-rw / 2, -rh / 2, rw, rh, 2, "#FBF8EF");
    ctx.restore();

    ctx.strokeStyle = "rgba(23,23,19,.2)";
    ctx.lineWidth = 1;
    rr(-rw / 2, -rh / 2, rw, rh, 2);
    ctx.stroke();

    /* perforation */
    ctx.save();
    ctx.strokeStyle = "rgba(23,23,19,.16)";
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(-rw / 2 + 18 * s, -rh / 2 + 6 * s);
    ctx.lineTo(rw / 2 - 18 * s, -rh / 2 + 6 * s);
    ctx.stroke();
    ctx.restore();

    var x0 = -rw / 2 + 30 * s;
    var x1 = rw / 2 - 30 * s;
    var y = -rh / 2 + 34 * s;

    drawMark(x0 + 18 * s, y + 10 * s, 34 * s, C.red, C.paper);
    text("默契", x0 + 44 * s, y + 3 * s, {
      size: 18 * s, weight: 700, color: C.ink, align: "left", tracking: 1.2
    });
    text("MOQI", x0 + 44 * s, y + 18 * s, {
      size: 5.5 * s, family: MONO, weight: 500, color: C.red, align: "left", tracking: 1.4
    });
    text("CONVERSATION RECEIPT", x1, y + 3 * s, {
      size: 7.5 * s, family: MONO, weight: 500, color: C.ink, align: "right", tracking: 0.6
    });
    text("NO. MQ-1104-072", x1, y + 16 * s, {
      size: 6.5 * s, family: MONO, weight: 400, color: C.muted, align: "right", tracking: 0.4
    });

    y += 40 * s;
    ctx.fillStyle = C.ink;
    ctx.fillRect(x0, y, x1 - x0, 1);
    y += 18 * s;

    text("A RECEIPT FOR BOTH OF YOU / 双方各一份", x0, y, {
      size: 6.8 * s, family: MONO, weight: 500, color: C.muted, align: "left", tracking: 0.5
    });
    y += 22 * s;

    text("WITH", x0, y, { size: 5.8 * s, family: MONO, weight: 400, color: C.faint, align: "left", tracking: 0.6 });
    text("林知远 · 山川资本", x0, y + 14 * s, { size: 10 * s, family: SERIF, weight: 600, color: C.ink, align: "left" });
    text("DATE", x0 + (x1 - x0) * 0.58, y, { size: 5.8 * s, family: MONO, weight: 400, color: C.faint, align: "left", tracking: 0.6 });
    text("2026.11.04 / 42:18", x0 + (x1 - x0) * 0.58, y + 14 * s, { size: 9 * s, family: MONO, weight: 500, color: C.ink, align: "left" });
    y += 36 * s;

    text("CONSENT", x0, y, { size: 5.8 * s, family: MONO, weight: 400, color: C.faint, align: "left", tracking: 0.6 });
    text("✓ 2/2 · BOTH PARTIES", x0, y + 14 * s, { size: 9 * s, family: MONO, weight: 600, color: C.green, align: "left" });
    text("STORAGE", x0 + (x1 - x0) * 0.58, y, { size: 5.8 * s, family: MONO, weight: 400, color: C.faint, align: "left", tracking: 0.6 });
    text("LOCAL VAULT · AES-256", x0 + (x1 - x0) * 0.58, y + 14 * s, { size: 8 * s, family: MONO, weight: 500, color: C.ink, align: "left" });
    y += 38 * s;

    ctx.save();
    ctx.strokeStyle = "rgba(23,23,19,.25)";
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.restore();
    y += 20 * s;

    var rows = [
      { label: "DECISIONS / 决定", count: "02", items: ["周五前给到 A 轮数据包", "下周二 10:00 复盘"] },
      { label: "PROMISES / 承诺", count: "02", items: ["你 → 发 3 页备忘录", "对方 → 介绍两位客户"] },
      { label: "NEXT / 下一步", count: "01", items: ["11.10 前确认数据包版本"] }
    ];

    var ri = 0;
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var ra = clamp01(reveal * 3 - r * 0.45);
      text(row.label, x0, y, {
        size: 6.5 * s, family: MONO, weight: 500, color: C.red, align: "left", tracking: 0.7, alpha: ra
      });
      text(row.count, x1, y, {
        size: 6.5 * s, family: MONO, weight: 500, color: C.red, align: "right", tracking: 0.6, alpha: ra
      });
      y += 15 * s;
      for (var i = 0; i < row.items.length; i++) {
        var ia = clamp01(reveal * 5 - ri * 0.38);
        text(String(i + 1).padStart(2, "0"), x0, y, {
          size: 6 * s, family: MONO, weight: 400, color: C.faint, align: "left", alpha: ia
        });
        text(row.items[i], x0 + 18 * s, y, {
          size: 10.5 * s, family: SANS, weight: 400, color: C.ink2, align: "left", alpha: ia
        });
        y += 18 * s;
        ri++;
      }
      y += 10 * s;
    }

    y = Math.max(y + 20 * s, -rh / 2 + rh * 0.42);
    ctx.save();
    ctx.strokeStyle = "rgba(23,23,19,.18)";
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.restore();
    y += 17 * s;

    text("PRIVATE NOTE / 仅你可见", x0, y, {
      size: 6 * s, family: MONO, weight: 500, color: C.faint, align: "left", tracking: 0.7
    });
    text("「下周二之前，把数据包和两位客户都确认掉。」", x0, y + 22 * s, {
      size: 11.5 * s, family: SERIF, weight: 500, color: C.ink2, align: "left"
    });
    text("同一份事实，双方各留一份；私密备注不共享。", x0, y + 41 * s, {
      size: 8.5 * s, family: SANS, weight: 300, color: C.muted, align: "left"
    });

    var footerY = rh / 2 - 58 * s;
    ctx.save();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, footerY);
    ctx.lineTo(x1, footerY);
    ctx.stroke();
    ctx.restore();

    text("SHARED VIA NFC / BOTH PARTIES HOLD A COPY / REVOCABLE WITHIN 24H", x0, footerY + 14 * s, {
      size: 5.4 * s, family: MONO, weight: 400, color: C.muted, align: "left", tracking: 0.4
    });

    /* barcode */
    ctx.save();
    ctx.globalAlpha = 0.76;
    var bx = x1 - 86 * s;
    var by = footerY + 26 * s;
    for (var b = 0; b < 22; b++) {
      ctx.fillStyle = C.ink;
      ctx.fillRect(bx + b * 3.8 * s, by, (b % 3 === 0 ? 1.8 : 0.8) * s, 24 * s);
    }
    ctx.restore();

    /* stamp */
    var sp = easeBack(stampP);
    if (sp > 0.01) {
      ctx.save();
      ctx.translate(x1 - 72 * s, -rh / 2 + 112 * s);
      ctx.rotate(8 * Math.PI / 180);
      ctx.scale(sp, sp);
      ctx.globalAlpha = clamp01(stampP * 2);
      ctx.strokeStyle = C.red;
      ctx.lineWidth = 2.4 * s;
      ctx.beginPath();
      ctx.arc(0, 0, 44 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.arc(0, 0, 35 * s, 0, Math.PI * 2);
      ctx.stroke();
      text("双方已确认", 0, -6 * s, {
        size: 8.5 * s, family: SERIF, weight: 600, color: C.red, tracking: 0.8
      });
      text("2 / 2", 0, 12 * s, {
        size: 12 * s, family: MONO, weight: 600, color: C.red, tracking: 1
      });
      ctx.restore();
    }

    ctx.restore();
  }

  /* ============================================================
     Data path
     ============================================================ */

  function drawPath(cx, cy, nodeW, nodeH) {
    var gap = 16;
    var total = nodeW * 4 + gap * 3;
    var start = cx - total / 2;
    var nodes = [
      { en: "MIC", cn: "麦克风", sub: "物理遮片", state: "ON", on: true },
      { en: "NPU", cn: "端侧转写", sub: "音频不离开", state: "ON DEVICE", on: true },
      { en: "VAULT", cn: "加密记忆库", sub: "AES-256", state: "LOCKED", on: true },
      { en: "CLOUD", cn: "云端同步", sub: "默认关闭", state: "OFF", on: false }
    ];

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var x = start + i * (nodeW + gap);
      var y = cy - nodeH / 2;
      fillRR(x, y, nodeW, nodeH, 2, n.on ? "rgba(244,239,228,.055)" : "rgba(200,64,44,.045)");
      strokeRR(x, y, nodeW, nodeH, 2, n.on ? "rgba(244,239,228,.18)" : "rgba(200,64,44,.38)", 1);

      text(n.en, x + 14, y + 21, {
        size: 12, family: MONO, weight: 500, color: n.on ? C.paper : C.redSoft, align: "left", tracking: 1.4
      });
      text(n.cn, x + 14, y + 49, {
        size: 16, family: SERIF, weight: 500, color: n.on ? "rgba(244,239,228,.78)" : "rgba(244,239,228,.4)", align: "left"
      });
      text(n.sub, x + 14, y + 70, {
        size: 10, family: SANS, weight: 300, color: "rgba(244,239,228,.36)", align: "left"
      });
      text(n.state, x + nodeW - 14, y + 21, {
        size: 7, family: MONO, weight: 500, color: n.on ? "rgba(244,239,228,.42)" : C.redSoft, align: "right", tracking: 0.5
      });
      if (!n.on) {
        ctx.save();
        ctx.strokeStyle = C.redSoft;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 14, y + 40);
        ctx.lineTo(x + nodeW - 14, y + 40);
        ctx.stroke();
        ctx.restore();
      }

      if (i < nodes.length - 1) {
        var ax = x + nodeW + 2;
        var ay = cy;
        ctx.save();
        ctx.strokeStyle = n.on ? "rgba(244,239,228,.22)" : C.redSoft;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + gap - 4, ay);
        ctx.stroke();
        ctx.fillStyle = n.on ? "rgba(244,239,228,.35)" : C.redSoft;
        ctx.beginPath();
        ctx.moveTo(ax + gap - 5, ay);
        ctx.lineTo(ax + gap - 11, ay - 3);
        ctx.lineTo(ax + gap - 11, ay + 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  /* ============================================================
     Scenes
     ============================================================ */

  function sceneDisappear(local, p, scene, copy) {
    background("night");
    var a = fadeIn(local, 0.15, 0.9) * fadeOut(local, scene.t1 - scene.t0 - 0.8, 0.8);
    drawWave(W / 2, H * 0.35, W * 0.66, H * 0.06, local, 0.5 * a, C.paper);
    text("A CONVERSATION / 00:00", W / 2, H * 0.25, {
      size: 15, family: MONO, weight: 400, color: "rgba(244,239,228,.38)", tracking: 2.2, alpha: a
    });
    stack(copy.disappear, W / 2, H * 0.5, verticalType(86), verticalType(108), {
      color: C.paper, alpha: a
    });
    text(copy.disappearSub, W / 2, H * 0.66, {
      size: 22, family: SERIF, weight: 400, color: "rgba(244,239,228,.4)", alpha: a, tracking: 0.5
    });
    text("不是所有记忆，都值得被留下。", W / 2, H * 0.72, {
      size: 13, family: MONO, weight: 400, color: "rgba(200,64,44,.6)", alpha: a, tracking: 1.4
    });
  }

  function sceneDecide(local, p, scene, copy) {
    background("night");
    var a = fadeIn(local, 0.15, 0.8);
    var grid = 0.06 * a;

    ctx.save();
    ctx.strokeStyle = "rgba(244,239,228," + grid + ")";
    ctx.lineWidth = 1;
    var gx0 = W * 0.2;
    var gx1 = W * 0.8;
    var gy0 = H * 0.22;
    var gy1 = H * 0.76;
    for (var i = 0; i <= 5; i++) {
      var gx = gx0 + ((gx1 - gx0) / 5) * i;
      ctx.beginPath(); ctx.moveTo(gx, gy0); ctx.lineTo(gx, gy1); ctx.stroke();
    }
    for (var j = 0; j <= 4; j++) {
      var gy = gy0 + ((gy1 - gy0) / 4) * j;
      ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.lineTo(gx1, gy); ctx.stroke();
    }
    ctx.restore();

    var dotX = W * 0.69;
    var dotY = H * 0.35;
    var pulse = 1 + 0.16 * Math.sin(local * 3.4);
    ctx.save();
    ctx.globalAlpha = 0.15 * a;
    ctx.fillStyle = C.redSoft;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 34 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.9 * a;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    stack(copy.decide, W / 2, H * 0.5, verticalType(74), verticalType(96), {
      color: C.paper, alpha: a
    });

    var lineP = easeOut(clamp01((local - 1.1) / 1.1));
    ctx.save();
    ctx.strokeStyle = C.redSoft;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.5 - 120 * lineP, H * 0.655);
    ctx.lineTo(W * 0.5 + 120 * lineP, H * 0.655);
    ctx.stroke();
    ctx.restore();

    text(copy.decideSub, W / 2, H * 0.72, {
      size: 14, family: MONO, weight: 400, color: "rgba(244,239,228,.42)", tracking: 2.4, alpha: a
    });
    text("有些承诺，从说出口的那一刻就开始过期。", W / 2, H * 0.77, {
      size: 17, family: SERIF, weight: 400, color: "rgba(244,239,228,.32)", alpha: a
    });
  }

  function scenePromise(local, p, scene, copy) {
    background("paper");
    var a = fadeIn(local, 0.15, 0.8);

    /* ghost receipt */
    ctx.save();
    ctx.globalAlpha = 0.13 * a;
    ctx.translate(W / 2, H * 0.64);
    ctx.rotate(-2 * Math.PI / 180);
    fillRR(-W * 0.28, -H * 0.16, W * 0.56, H * 0.32, 2, "#FFFFFF");
    ctx.strokeStyle = "rgba(23,23,19,.3)";
    ctx.lineWidth = 1;
    rr(-W * 0.28, -H * 0.16, W * 0.56, H * 0.32, 2);
    ctx.stroke();
    for (var i = 0; i < 9; i++) {
      ctx.fillStyle = "rgba(23,23,19,.4)";
      ctx.fillRect(-W * 0.24, -H * 0.12 + i * 34, W * (i % 2 ? 0.34 : 0.46), 2);
    }
    ctx.restore();

    text("?", W * 0.78, H * 0.51, {
      size: 380, family: SERIF, weight: 700, color: "rgba(200,64,44,.08)", alpha: a
    });

    text("PROMISE / 承诺", W / 2, H * 0.23, {
      size: 14, family: MONO, weight: 500, color: C.red, tracking: 2.6, alpha: a
    });

    var qSize = verticalType(84);
    stack(copy.promise, W / 2, H * 0.43, qSize, qSize * 1.12, {
      color: C.ink, alpha: a
    });

    var lineP = easeOut(clamp01((local - 0.8) / 1.2));
    ctx.save();
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 150 * lineP, H * 0.505);
    ctx.lineTo(W / 2 + 150 * lineP, H * 0.505);
    ctx.stroke();
    ctx.restore();

    text(copy.promiseSub, W / 2, H * 0.58, {
      size: 20, family: SERIF, weight: 400, color: C.muted, alpha: a
    });
    text("A PROMISE IS A MEMORY WITH A DEADLINE.", W / 2, H * 0.64, {
      size: 11, family: MONO, weight: 400, color: "rgba(23,23,19,.38)", tracking: 2, alpha: a
    });
  }

  function sceneReveal(local, p, scene, copy) {
    background("paper");
    var a = fadeIn(local, 0.1, 0.7);
    var isShort = state.cut === "short";
    var e = easeOut(clamp01(local / 1.5));
    var cardW = Math.min(W * (isShort ? 0.56 : 0.66), 760);
    var cardY = H * 0.54 + (isShort ? 20 : 30);
    var cardH = cardW / 1.586;
    var angle = (-9 + 9 * e) * Math.PI / 180;
    var titleY = H * (H > W ? 0.3 : (isShort ? 0.26 : 0.27));

    text(copy.revealEyebrow, W / 2, H * 0.2, {
      size: 11, family: MONO, weight: 500, color: C.red, tracking: 2.2, alpha: a
    });

    if (isShort) {
      text(copy.revealTitle, W / 2, titleY, {
        size: verticalType(118), family: SERIF, weight: 600, color: C.ink, tracking: 4, alpha: a
      });
    } else {
      text(copy.revealTitle, W / 2, titleY, {
        size: verticalType(98), family: SERIF, weight: 600, color: C.ink, tracking: 5, alpha: a
      });
      text("CARD 01 / 共识式 AI 记忆卡", W / 2, titleY + 55, {
        size: 15, family: MONO, weight: 400, color: C.muted, tracking: 1.2, alpha: a
      });
    }

    drawShadow(W / 2, cardY + cardH / 2 + 18, cardW * 0.52, 20, 0.24 * a);
    drawCard(W / 2, cardY + Math.sin(local * 0.9) * 5, cardW, angle, {
      scale: 0.88 + 0.12 * e,
      consent: "0/2",
      status: "待机 · 未记录",
      line: ["轻触「共识键」，", "与对方一起开始。"],
      tap: [],
      wavePhase: local * 0.6
    });

    stack(copy.revealSub, W / 2, cardY + cardH / 2 + 88, 25, 37, {
      color: C.ink2, alpha: a
    });
    text(copy.revealTag, W / 2, cardY + cardH / 2 + 154, {
      size: 13, family: MONO, weight: 500, color: C.red, tracking: 1.8, alpha: a
    });
  }

  function sceneConsent(local, p, scene, copy) {
    background("paper");
    var a = fadeIn(local, 0.1, 0.7);
    var isShort = state.cut === "short";
    var tap1 = isShort ? 1.2 : 1.55;
    var tap2 = isShort ? 2.2 : 2.75;
    var consent = local > tap2 ? "2/2" : local > tap1 ? "1/2" : "0/2";
    var recording = local > tap2;
    var status = consent === "0/2" ? "待机 · 未记录" : consent === "1/2" ? "等待对方 · 1/2" : "记录中 · 双方已确认";
    var line = consent === "0/2" ? ["轻触「共识键」，", "与对方一起开始。"] : consent === "1/2" ? ["你已确认。", "请对方轻触卡片。"] : ["正在记录。", "卡面状态，所有人都看得见。"];

    if (isShort) {
      text(copy.consentKicker, W / 2, H * 0.18, {
        size: 11, family: MONO, weight: 500, color: C.red, tracking: 2.2, alpha: a
      });
      stack(copy.consentTitle, W / 2, H * 0.27, verticalType(74), verticalType(88), {
        color: C.ink, alpha: a
      });
    } else {
      text(copy.consentKicker, W / 2, H * 0.15, {
        size: 12, family: MONO, weight: 500, color: C.red, tracking: 2.2, alpha: a
      });
      stack(copy.consentTitle, W / 2, H * 0.26, verticalType(101), verticalType(118), {
        color: C.ink, alpha: a
      });
    }

    var cardW = Math.min(W * (isShort ? 0.64 : 0.7), 780);
    var cardY = H * (isShort ? (H > W ? 0.52 : 0.57) : 0.57);
    var cardH = cardW / 1.586;
    drawShadow(W / 2, cardY + cardH / 2 + 18, cardW * 0.5, 20, 0.24 * a);
    drawCard(W / 2, cardY, cardW, 0, {
      consent: consent,
      status: status,
      line: line,
      recording: recording,
      time: recording ? "00:14:32" : "00:00:00",
      taps: [local - tap1, local - tap2],
      wavePhase: local * 2.2
    });

    if (copy.consentDone) {
      var doneA = fadeIn(local, 3.2, 0.55) * a;
      text(copy.consentDone, W / 2, cardY + cardH / 2 + 92, {
        size: 24, family: SERIF, weight: 500, color: C.ink2, alpha: doneA
      });
      text("TWO TO AGREE / 2 OF 2", W / 2, cardY + cardH / 2 + 136, {
        size: 10, family: MONO, weight: 500, color: C.red, tracking: 1.8, alpha: doneA
      });
    }
  }

  function sceneReceipt(local, p, scene, copy) {
    background("paper");
    var a = fadeIn(local, 0.1, 0.7);
    var isShort = state.cut === "short";
    var titleY = isShort ? H * 0.18 : H * 0.24;
    var titleSize = isShort ? 48 : verticalType(63);

    stack(copy.receiptTitle, W / 2, titleY, titleSize, titleSize * 1.18, {
      color: C.ink, alpha: a
    });
    text("NOT MINUTES. A RECEIPT.", W / 2, titleY + titleSize * 1.15, {
      size: 11, family: MONO, weight: 500, color: C.red, tracking: 2, alpha: a
    });

    var rw = H > W ? Math.min(W * 0.62, 670) : 600;
    var rh = H * (H > W ? 0.38 : 0.574);
    var ry = H * (H > W ? 0.63 : 0.64);
    var reveal = easeOut(clamp01((local - 0.5) / 2.2));
    var stampP = clamp01((local - 1.65) / 0.55);

    /* printer slot */
    fillRR(W / 2 - rw * 0.44, ry - rh / 2 - 32, rw * 0.88, 10, 3, "rgba(23,23,19,.75)");
    if (H > W) {
      text("RECEIPT PRINTER / 回执打印", W / 2, ry - rh / 2 - 48, {
        size: 8, family: MONO, weight: 400, color: "rgba(23,23,19,.38)", tracking: 1.2, alpha: a
      });
    }

    drawReceipt(W / 2, ry, rw, rh, reveal, stampP);

    if (local > 4 && H > W) {
      var footA = fadeIn(local, 4, 0.5) * a;
      text("双方各一份。事实共享，私密备注各自保留。", W / 2, H * 0.88, {
        size: 17, family: SERIF, weight: 400, color: C.muted, alpha: footA
      });
    }
  }

  function sceneLocal(local, p, scene, copy) {
    background("night");
    var a = fadeIn(local, 0.15, 0.8);
    var isShort = state.cut === "short";
    var titleY = H * (H > W ? 0.17 : 0.21);

    if (!isShort) {
      stack(copy.localTitle, W / 2, titleY, verticalType(68), verticalType(86), {
        color: C.paper, alpha: a
      });
      text("LOCAL BY DEFAULT", W / 2, H > W ? H * 0.285 : H * 0.07, {
        size: 11, family: MONO, weight: 500, color: C.redSoft, tracking: 2.4, alpha: a
      });
    } else {
      text("LOCAL BY DEFAULT", W / 2, H * 0.2, {
        size: 11, family: MONO, weight: 500, color: C.redSoft, tracking: 2.4, alpha: a
      });
    }

    var cardW = Math.min(W * 0.44, 560);
    var cardY = H * 0.41;
    drawShadow(W / 2, cardY + cardW / 3.2 + 16, cardW * 0.5, 18, 0.28 * a);
    drawCard(W / 2, cardY, cardW, -2 * Math.PI / 180, {
      consent: "2/2",
      status: "本地记忆库",
      line: ["音频不离开设备。", "云端同步默认关闭。"],
      time: "00:12:08",
      wavePhase: local * 1.1
    });

    drawPath(W / 2, H * 0.68, Math.min(230, (W - 160 - 48) / 4), 122);

    text(copy.localSub, W / 2, H * 0.84, {
      size: verticalType(27), family: SERIF, weight: 500, color: C.paper, alpha: a
    });
    text("NO CLOUD BY DEFAULT / NO DATA SALE / NO TRAINING", W / 2, H * 0.885, {
      size: 10, family: MONO, weight: 400, color: "rgba(244,239,228,.34)", tracking: 1.4, alpha: a
    });
  }

  function sceneEnd(local, p, scene, copy) {
    background("red");
    var a = fadeIn(local, 0.1, 0.8);
    var centerY = H * 0.49;

    drawMark(W / 2, centerY - H * 0.19, 72, C.paper, C.red);

    text(copy.endTitle, W / 2, centerY - H * 0.075, {
      size: verticalType(148), family: SERIF, weight: 700, color: C.paper, tracking: 5, alpha: a
    });
    text(copy.endClaim, W / 2, centerY + H * 0.06, {
      size: verticalType(38), family: SERIF, weight: 500, color: C.paper, tracking: 1.5, alpha: a
    });

    ctx.save();
    ctx.strokeStyle = "rgba(244,239,228,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 130, centerY + H * 0.102);
    ctx.lineTo(W / 2 + 130, centerY + H * 0.102);
    ctx.stroke();
    ctx.restore();

    text("CONSENT-FIRST AI MEMORY CARD", W / 2, centerY + H * 0.128, {
      size: 11, family: MONO, weight: 500, color: "rgba(244,239,228,.7)", tracking: 2, alpha: a
    });
    text(copy.endSub, W / 2, centerY + H * 0.17, {
      size: 11, family: MONO, weight: 400, color: "rgba(244,239,228,.48)", tracking: 1.6, alpha: a
    });
  }

  var SCENES = {
    disappear: sceneDisappear,
    decide: sceneDecide,
    promise: scenePromise,
    reveal: sceneReveal,
    consent: sceneConsent,
    receipt: sceneReceipt,
    local: sceneLocal,
    end: sceneEnd
  };

  function verticalType(base) {
    return H > W ? base * 1.08 : base;
  }

  /* ============================================================
     Timeline / draw
     ============================================================ */

  function currentCut() {
    return CUTS[state.cut];
  }

  function sceneAt(t) {
    var cut = currentCut();
    for (var i = 0; i < cut.scenes.length; i++) {
      if (t < cut.scenes[i].t1 || i === cut.scenes.length - 1) {
        return { scene: cut.scenes[i], index: i, cut: cut };
      }
    }
    return { scene: cut.scenes[0], index: 0, cut: cut };
  }

  function draw(t) {
    t = clamp(t, 0, currentCut().total);
    var info = sceneAt(t);
    var scene = info.scene;
    var cut = info.cut;
    var local = t - scene.t0;
    var p = clamp01(local / Math.max(0.001, scene.t1 - scene.t0));
    var copy = COPY[state.cut];

    background(scene.bg);
    SCENES[scene.key](local, p, scene, copy);

    var dip = clamp01(local / 0.32);
    if (dip < 1) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0," + (1 - dip) + ")";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    hud(t, scene, info.index, cut.total, cut.scenes.length);
  }

  /* ============================================================
     Audio
     ============================================================ */

  var audio = {
    ctx: null,
    master: null,
    music: null,
    sfx: null,
    dest: null,
    nodes: [],
    active: false
  };

  function ensureAudio() {
    if (audio.ctx) return audio.ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      var ac = new AC();
      var master = ac.createGain();
      master.gain.value = state.muted ? 0 : 0.82;
      var comp = ac.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 22;
      comp.ratio.value = 3;
      comp.attack.value = 0.004;
      comp.release.value = 0.22;
      master.connect(comp);
      comp.connect(ac.destination);
      if (ac.createMediaStreamDestination) {
        audio.dest = ac.createMediaStreamDestination();
        comp.connect(audio.dest);
      }
      var music = ac.createGain();
      music.gain.value = 0.78;
      music.connect(master);
      var sfx = ac.createGain();
      sfx.gain.value = 0.72;
      sfx.connect(master);

      audio.ctx = ac;
      audio.master = master;
      audio.music = music;
      audio.sfx = sfx;
      return ac;
    } catch (e) {
      return null;
    }
  }

  function getNoiseBuffer() {
    if (noiseAudioBuffer) return noiseAudioBuffer;
    var ac = audio.ctx;
    var len = Math.floor(ac.sampleRate * 1.2);
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseAudioBuffer = buf;
    return buf;
  }

  function trackNode(node) {
    audio.nodes.push(node);
    if (node.stop) {
      node.onended = function () {
        try { node.disconnect(); } catch (e) {}
      };
    }
  }

  function tone(freq, when, dur, type, gain, dest, filterFreq) {
    var ac = audio.ctx;
    if (!ac) return;
    var o = ac.createOscillator();
    var g = ac.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, when);
    var out = o;
    if (filterFreq) {
      var f = ac.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = filterFreq;
      o.connect(f);
      out = f;
    }
    out.connect(g);
    g.connect(dest || audio.music);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), when + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.1, dur));
    o.start(when);
    o.stop(when + Math.max(0.1, dur) + 0.12);
    trackNode(o);
    trackNode(g);
  }

  function noise(when, dur, gain, filterType, freq, q, dest) {
    var ac = audio.ctx;
    if (!ac) return;
    var src = ac.createBufferSource();
    src.buffer = getNoiseBuffer();
    var f = ac.createBiquadFilter();
    f.type = filterType || "bandpass";
    f.frequency.setValueAtTime(freq || 1200, when);
    f.Q.value = q || 0.7;
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.03, dur));
    src.connect(f);
    f.connect(g);
    g.connect(dest || audio.sfx);
    src.start(when);
    src.stop(when + Math.max(0.04, dur) + 0.05);
    trackNode(src);
    trackNode(g);
  }

  function kick(when, gain) {
    var ac = audio.ctx;
    if (!ac) return;
    var o = ac.createOscillator();
    var g = ac.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(128, when);
    o.frequency.exponentialRampToValueAtTime(42, when + 0.22);
    g.gain.setValueAtTime(gain || 0.16, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.34);
    o.connect(g);
    g.connect(audio.music);
    o.start(when);
    o.stop(when + 0.4);
    trackNode(o);
    trackNode(g);
  }

  function whoosh(when) {
    var ac = audio.ctx;
    if (!ac) return;
    var src = ac.createBufferSource();
    src.buffer = getNoiseBuffer();
    var f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.setValueAtTime(220, when);
    f.frequency.exponentialRampToValueAtTime(2400, when + 0.55);
    f.Q.value = 1.2;
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.11, when + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.7);
    src.connect(f);
    f.connect(g);
    g.connect(audio.sfx);
    src.start(when);
    src.stop(when + 0.8);
    trackNode(src);
    trackNode(g);
  }

  function chime(when) {
    var notes = [523.25, 659.25, 783.99];
    for (var i = 0; i < notes.length; i++) {
      tone(notes[i], when + i * 0.11, 2.4, "sine", 0.035, audio.sfx);
      tone(notes[i] * 2, when + i * 0.11, 1.6, "sine", 0.012, audio.sfx);
    }
  }

  function scheduleSfx(type, when) {
    if (type === "paper") {
      noise(when, 0.38, 0.075, "highpass", 1500, 0.5);
      noise(when + 0.12, 0.22, 0.045, "bandpass", 2600, 0.8);
    } else if (type === "whoosh") {
      whoosh(when);
      kick(when, 0.12);
    } else if (type === "tap") {
      tone(880, when, 0.09, "sine", 0.09, audio.sfx);
      noise(when, 0.055, 0.05, "highpass", 2500, 0.6);
    } else if (type === "print") {
      for (var i = 0; i < 4; i++) {
        noise(when + i * 0.18, 0.12, 0.035, "bandpass", 1800 + i * 180, 0.7);
      }
      tone(110, when, 0.9, "sawtooth", 0.025, audio.sfx, 700);
    } else if (type === "stamp") {
      kick(when, 0.22);
      noise(when, 0.18, 0.09, "lowpass", 600, 0.6);
    } else if (type === "switch") {
      noise(when, 0.06, 0.06, "highpass", 2800, 0.6);
      tone(1200, when + 0.02, 0.05, "square", 0.025, audio.sfx);
    } else if (type === "chime") {
      chime(when);
    }
  }

  var FILM_SCORE = {
    chords: [
      { t: 0, d: 8, root: 110.0, notes: [0, 7, 12, 19] },
      { t: 8, d: 8, root: 87.31, notes: [0, 7, 12, 16] },
      { t: 16, d: 8, root: 130.81, notes: [0, 4, 7, 12] },
      { t: 24, d: 8, root: 98.0, notes: [0, 7, 12, 19] },
      { t: 32, d: 8, root: 110.0, notes: [0, 7, 12, 19] },
      { t: 40, d: 8, root: 87.31, notes: [0, 7, 12, 16] }
    ],
    kicks: [0, 2.1, 4.2, 8.2, 10.4, 16.0, 24.0],
    sfx: [
      { t: 10.5, type: "paper" },
      { t: 16.0, type: "whoosh" },
      { t: 24.55, type: "tap" },
      { t: 25.75, type: "tap" },
      { t: 30.15, type: "print" },
      { t: 31.75, type: "stamp" },
      { t: 37.05, type: "switch" },
      { t: 43.2, type: "chime" }
    ]
  };

  var SHORT_SCORE = {
    chords: [
      { t: 0, d: 4, root: 110.0, notes: [0, 7, 12] },
      { t: 4, d: 4, root: 87.31, notes: [0, 7, 12, 16] },
      { t: 8, d: 4, root: 130.81, notes: [0, 4, 7, 12] },
      { t: 12, d: 3, root: 110.0, notes: [0, 7, 12, 19] }
    ],
    kicks: [0, 3.2],
    sfx: [
      { t: 3.2, type: "whoosh" },
      { t: 8.4, type: "tap" },
      { t: 9.4, type: "tap" },
      { t: 11.3, type: "chime" }
    ]
  };

  function scheduleScore(from) {
    stopAudioNodes();
    var ac = ensureAudio();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var score = state.cut === "film" ? FILM_SCORE : SHORT_SCORE;
    var total = currentCut().total;
    var t0 = ac.currentTime + 0.08;

    /* drone */
    if (from < total) {
      tone(55, t0, total - from, "sine", 0.02, audio.music, 280);
      tone(82.5, t0, total - from, "sine", 0.008, audio.music, 380);
    }

    /* chords */
    for (var i = 0; i < score.chords.length; i++) {
      var ch = score.chords[i];
      if (ch.t + ch.d <= from) continue;
      var startT = Math.max(ch.t, from);
      var dur = ch.t + ch.d - startT;
      var when = t0 + (startT - from);
      for (var n = 0; n < ch.notes.length; n++) {
        var freq = ch.root * Math.pow(2, ch.notes[n] / 12);
        tone(freq, when, dur, n === 0 ? "sine" : "triangle", n === 0 ? 0.045 : 0.022, audio.music, 820);
      }
    }

    /* soft heartbeat */
    for (var k = 0; k < score.kicks.length; k++) {
      var kt = score.kicks[k];
      if (kt >= from) kick(t0 + (kt - from), 0.1);
    }

    /* sfx */
    for (var s = 0; s < score.sfx.length; s++) {
      var ev = score.sfx[s];
      if (ev.t >= from) scheduleSfx(ev.type, t0 + (ev.t - from));
    }

    audio.active = true;
  }

  function stopAudioNodes() {
    for (var i = 0; i < audio.nodes.length; i++) {
      var n = audio.nodes[i];
      try { if (n.stop) n.stop(0); } catch (e) {}
      try { n.disconnect(); } catch (e) {}
    }
    audio.nodes = [];
    audio.active = false;
  }

  function setMuted(muted, force) {
    state.muted = !!muted;
    if (audio.master) audio.master.gain.value = state.muted ? 0 : 0.82;
    if (els.mute) {
      els.mute.setAttribute("aria-pressed", state.muted ? "true" : "false");
      els.mute.setAttribute("aria-label", state.muted ? "取消静音" : "静音");
    }
    if (force) return;
  }

  /* ============================================================
     Playback
     ============================================================ */

  function updateUI() {
    var total = currentCut().total;
    if (els.time) els.time.textContent = fmt(state.t) + " / " + fmt(total);
    if (els.timeline) {
      els.timeline.max = String(total);
      els.timeline.value = String(state.t);
      els.timeline.style.setProperty("--progress", (state.t / total) * 100 + "%");
    }
    if (els.playLabel) els.playLabel.textContent = state.playing ? "暂停" : "播放";
    if (els.play) {
      els.play.classList.toggle("is-playing", state.playing);
      els.play.setAttribute("aria-label", state.playing ? "暂停品牌片" : "播放品牌片");
    }
    if (els.playOverlay) {
      els.playOverlay.hidden = state.playing || state.exporting || state.t > 0.05;
    }

    var info = sceneAt(state.t);
    var activeIndex = info.index;
    document.querySelectorAll("[data-chapter]").forEach(function (btn) {
      var v = parseFloat(btn.getAttribute("data-chapter"));
      var isActive = false;
      if (v <= state.t + 0.001) {
        var scene = sceneAt(v + 0.001);
        isActive = scene.index === activeIndex;
      }
      btn.classList.toggle("is-active", isActive);
    });
  }

  function drawCurrent() {
    draw(state.t);
    updateUI();
  }

  function posterTime() {
    return state.cut === "film" ? 1.2 : 0.9;
  }

  function drawPoster() {
    draw(posterTime());
    updateUI();
  }

  function play() {
    if (state.exporting) return;
    var total = currentCut().total;
    if (state.t >= total - 0.03) state.t = 0;
    state.playing = true;
    playStart = performance.now() - state.t * 1000;
    scheduleScore(state.t);
    updateUI();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function pause() {
    state.playing = false;
    cancelAnimationFrame(raf);
    raf = 0;
    stopAudioNodes();
    updateUI();
  }

  function togglePlay() {
    if (state.playing) pause();
    else play();
  }

  function seekTo(t) {
    var total = currentCut().total;
    var wasPlaying = state.playing;
    if (wasPlaying) pause();
    state.t = clamp(t, 0, total);
    drawCurrent();
    if (wasPlaying) play();
  }

  function loop(now) {
    if (!state.playing) return;
    var total = currentCut().total;
    state.t = clamp((now - playStart) / 1000, 0, total);
    draw(state.t);
    updateUI();
    if (state.t >= total) {
      state.playing = false;
      stopAudioNodes();
      updateUI();
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  function restart() {
    var wasPlaying = state.playing;
    if (wasPlaying) pause();
    state.t = 0;
    drawCurrent();
    if (wasPlaying) play();
  }

  /* ============================================================
     Format / cut
     ============================================================ */

  function applyFormat(format) {
    state.format = format;
    state.t = 0;
    state.playing = false;
    cancelAnimationFrame(raf);
    stopAudioNodes();
    if (els.downloadLink) els.downloadLink.hidden = true;

    if (format === "horizontal") {
      canvas.width = 1920;
      canvas.height = 1080;
      W = 1920;
      H = 1080;
      els.shell.classList.remove("is-vertical");
      els.shell.classList.add("is-horizontal");
      els.shell.setAttribute("data-format", "horizontal");
      els.formatLabel.textContent = "16:9 HORIZONTAL / 1920 × 1080";
      els.specFormat.textContent = "1920 × 1080 / 16:9";
    } else {
      canvas.width = 1080;
      canvas.height = 1920;
      W = 1080;
      H = 1920;
      els.shell.classList.remove("is-horizontal");
      els.shell.classList.add("is-vertical");
      els.shell.setAttribute("data-format", "vertical");
      els.formatLabel.textContent = "9:16 VERTICAL / 1080 × 1920";
      els.specFormat.textContent = "1080 × 1920 / 9:16";
    }

    syncButtons();
    drawPoster();
  }

  function applyCut(cut) {
    state.cut = cut;
    state.t = 0;
    state.playing = false;
    cancelAnimationFrame(raf);
    stopAudioNodes();
    if (els.downloadLink) els.downloadLink.hidden = true;
    state.total = CUTS[cut].total;
    if (els.specDuration) {
      els.specDuration.textContent = (cut === "film" ? "48 秒" : "15 秒") + " / 30fps";
    }
    document.querySelectorAll("[data-chapters]").forEach(function (list) {
      list.hidden = list.getAttribute("data-chapters") !== cut;
    });
    if (els.timeline) {
      els.timeline.max = String(state.total);
      els.timeline.value = "0";
    }
    syncButtons();
    drawPoster();
  }

  function syncButtons() {
    document.querySelectorAll("[data-format]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-format") === state.format ? "true" : "false");
    });
    document.querySelectorAll("[data-cut]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-cut") === state.cut ? "true" : "false");
    });
  }

  /* ============================================================
     Export
     ============================================================ */

  function pickMime() {
    var candidates = [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
    for (var i = 0; i < candidates.length; i++) {
      try {
        if (MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
      } catch (e) {}
    }
    return "";
  }

  function toast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("is-on");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () {
      els.toast.classList.remove("is-on");
    }, 3200);
  }

  function setExportUI(active, percent) {
    state.exporting = active;
    if (els.overlay) els.overlay.hidden = !active;
    if (els.exportPercent) els.exportPercent.textContent = Math.round((percent || 0) * 100) + "%";
    if (els.exportBar) els.exportBar.style.width = ((percent || 0) * 100) + "%";
    if (els.exportBtn) {
      els.exportBtn.disabled = active;
      var label = els.exportBtn.querySelector("span");
      if (label) label.textContent = active ? "渲染中…" : "导出成片";
    }
  }

  function downloadBlob(blob, mime) {
    var ext = mime.indexOf("mp4") >= 0 ? "mp4" : "webm";
    var name = "moqi-film-" + (state.cut === "film" ? "48s" : "15s") + "-" +
      (state.format === "vertical" ? "9x16" : "16x9") + "." + ext;
    if (lastDownloadUrl) {
      try { URL.revokeObjectURL(lastDownloadUrl); } catch (e) {}
    }
    var url = URL.createObjectURL(blob);
    lastDownloadUrl = url;
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (els.downloadLink) {
      els.downloadLink.href = url;
      els.downloadLink.setAttribute("download", name);
      els.downloadLink.hidden = false;
    }
    return name;
  }

  async function exportFilm() {
    if (state.exporting) return;
    if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) {
      toast("当前浏览器不支持画布录制，请使用 Chrome / Edge。");
      return;
    }

    pause();
    if (els.downloadLink) els.downloadLink.hidden = true;
    var previousMuted = state.muted;
    setMuted(false, true);
    var ac = ensureAudio();
    if (ac && ac.state === "suspended") {
      try { await ac.resume(); } catch (e) {}
    }

    var stream = canvas.captureStream(30);
    var audioTrack = audio.dest && audio.dest.stream.getAudioTracks()[0];
    if (audioTrack) stream.addTrack(audioTrack);

    var mime = pickMime();
    var rec;
    try {
      rec = new MediaRecorder(stream, mime ? {
        mimeType: mime,
        videoBitsPerSecond: 8000000
      } : {
        videoBitsPerSecond: 8000000
      });
    } catch (e) {
      toast("无法创建录制器：" + e.message);
      stream.getVideoTracks().forEach(function (t) { t.stop(); });
      setMuted(previousMuted, true);
      return;
    }

    var chunks = [];
    var stopped = false;
    var total = currentCut().total;

    function cleanup() {
      stream.getVideoTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
      stopAudioNodes();
      state.exporting = false;
      setExportUI(false, 0);
      state.t = 0;
      drawPoster();
      syncButtons();
      setMuted(previousMuted, true);
    }

    rec.ondataavailable = function (e) {
      if (e.data && e.data.size) chunks.push(e.data);
    };
    rec.onerror = function () {
      if (stopped) return;
      stopped = true;
      cleanup();
      toast("录制出错，请重试。");
    };
    rec.onstop = function () {
      if (stopped) return;
      stopped = true;
      var blob = new Blob(chunks, { type: mime || "video/webm" });
      var name = downloadBlob(blob, mime || "video/webm");
      cleanup();
      toast("已导出 " + name + "。如为 WebM，可用 ffmpeg 转 MP4。");
    };

    state.exporting = true;
    setExportUI(true, 0);
    state.t = 0;
    drawCurrent();
    startAudioForExport();

    var t0 = performance.now();
    try {
      rec.start(120);
    } catch (e) {
      cleanup();
      toast("无法开始录制：" + e.message);
      return;
    }

    function step(now) {
      if (!state.exporting) return;
      state.t = clamp((now - t0) / 1000, 0, total);
      draw(state.t);
      setExportUI(true, state.t / total);
      if (state.t >= total) {
        setTimeout(function () {
          try { rec.stop(); } catch (e) {}
        }, 260);
        return;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function startAudioForExport() {
    stopAudioNodes();
    var ac = ensureAudio();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    scheduleScore(0);
  }

  /* ============================================================
     Events
     ============================================================ */

  if (els.play) els.play.addEventListener("click", togglePlay);
  if (els.playOverlay) els.playOverlay.addEventListener("click", play);
  if (els.restart) els.restart.addEventListener("click", restart);
  if (els.mute) {
    els.mute.addEventListener("click", function () {
      setMuted(!state.muted);
    });
  }
  if (els.timeline) {
    els.timeline.addEventListener("input", function () {
      if (state.playing) pause();
      var total = currentCut().total;
      state.t = clamp(parseFloat(els.timeline.value) || 0, 0, total);
      drawCurrent();
    });
  }
  if (els.exportBtn) {
    els.exportBtn.addEventListener("click", exportFilm);
  }

  document.querySelectorAll("[data-format]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (state.exporting) return;
      var format = btn.getAttribute("data-format");
      if (format !== state.format) applyFormat(format);
    });
  });

  document.querySelectorAll("[data-cut]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (state.exporting) return;
      var cut = btn.getAttribute("data-cut");
      if (cut !== state.cut) applyCut(cut);
    });
  });

  document.querySelectorAll("[data-chapter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (state.exporting) return;
      var t = parseFloat(btn.getAttribute("data-chapter")) || 0;
      seekTo(t);
      document.querySelector(".canvas-shell").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  document.querySelectorAll("[data-jump-cut]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (state.exporting) return;
      applyCut("short");
      document.querySelector(".canvas-shell").scrollIntoView({ behavior: "smooth", block: "center" });
      toast("已切换到 15 秒投放版，可预览或导出。");
    });
  });

  document.addEventListener("keydown", function (event) {
    var tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || tag === "A") return;
    if (event.code === "Space") {
      event.preventDefault();
      togglePlay();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      seekTo(state.t + 2);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      seekTo(state.t - 2);
    } else if (event.key === "m" || event.key === "M") {
      setMuted(!state.muted);
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && state.playing) pause();
  });

  window.addEventListener("beforeunload", function () {
    stopAudioNodes();
    if (lastDownloadUrl) {
      try { URL.revokeObjectURL(lastDownloadUrl); } catch (e) {}
    }
  });

  /* ============================================================
     Boot
     ============================================================ */

  function boot() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get("cut") === "short") state.cut = "short";
      if (params.get("format") === "horizontal") state.format = "horizontal";
    } catch (e) {}

    state.total = CUTS[state.cut].total;
    applyFormat(state.format);
    applyCut(state.cut);
    drawPoster();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (!state.playing && !state.exporting && state.t === 0) drawPoster();
      });
    }

    var year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  boot();
})();
