/* LeadScope app — DOM layer */
(function () {
  "use strict";
  var DB = window.DB, E = window.Engine, K = window.ChartKit;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var META = DB.meta, ST = META.stats;

  var LEADS = DB.leads.map(function (l, i) {
    var sc = E.score(l);
    return Object.assign({}, l, {
      rank: i + 1, score: sc.total, verdict: sc.verdict, parts: sc.parts,
      flags: sc.flags, prior: sc.prior === null ? null : sc.prior,
      payoff: sc.payoff, exp: sc.expectancy
    });
  });

  /* ---------- formatting ---------- */
  function pct(v, d) {
    if (v === null || v === undefined || isNaN(v)) return "—";
    var n = Math.abs(v) >= 1000 ? v.toFixed(0) : v.toFixed(d === undefined ? 1 : d);
    return (v > 0 ? "+" : "") + n + "%";
  }
  function cls(v) { return v === null || v === undefined ? "dim" : v > 0 ? "up" : v < 0 ? "down" : "dim"; }
  function priorTxt(l, d) { return l.prior === null || Math.abs(l.prior) < 0.05 ? "—" : pct(l.prior, d === undefined ? 0 : d); }
  function flagBadges(l, max) {
    var n = max || 2;
    var f = l.flags.slice(0, n).map(function (x) { return '<span class="badge ghost">' + x + "</span>"; });
    if (l.flags.length > n) f.push('<span class="badge ghost">+' + (l.flags.length - n) + "</span>");
    return f.join(" ");
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function verdictBadge(v) {
    var map = { ok: ["ok", "可小额试跟"], watch: ["watch", "先观察"], avoid: ["avoid", "不建议跟"] };
    var m = map[v];
    return '<span class="badge ' + m[0] + '">' + m[1] + "</span>";
  }
  function starBtn(h) {
    var on = watchlist().indexOf(h) >= 0;
    return '<button class="star-btn' + (on ? " on" : "") + '" data-star="' + h + '" title="加入自选">' + (on ? "★" : "☆") + "</button>";
  }
  function watchlist() {
    try { return JSON.parse(localStorage.getItem("ls_watch") || "[]"); } catch (e) { return []; }
  }
  function toggleWatch(h) {
    var w = watchlist(), i = w.indexOf(h);
    if (i >= 0) w.splice(i, 1); else w.push(h);
    localStorage.setItem("ls_watch", JSON.stringify(w));
    return w;
  }

  /* ---------- nav ---------- */
  function markNav() {
    var page = document.body.dataset.page;
    $$(".nav a").forEach(function (a) {
      if (a.dataset.nav === page) a.classList.add("on");
    });
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ================= HOME ================= */
  function initHome() {
    var tiles = [
      ["样本 · 可核验账户", LEADS.length + " 位", "全站 " + META.totalTracked.toLocaleString() + " 位，其中 " + META.eligible.toLocaleString() + " 位通过平台基础门槛"],
      ["30 天收益中位数", pct(ST.medianMonth, 2), "均值 " + pct(ST.meanMonth, 2) + " · " + ST.posPct + "% 的人为正"],
      ["前十名「前 60 天」为负", ST.top10NegPrior + " / 10", "这 10 位前 60 天收益中位数 " + pct(ST.top10MedianPrior, 0)],
      ["30 天收益 vs 前 60 天", ST.spearmanMonthPrior.toFixed(2), "秩相关 · 接近 0 = 榜单没有预测力"]
    ];
    var wrap = $("#tiles");
    if (wrap) {
      wrap.innerHTML = tiles.map(function (t) {
        return '<div class="tile"><div class="k">' + t[0] + '</div><div class="v">' + t[1] + '</div><div class="s">' + t[2] + "</div></div>";
      }).join("");
    }

    var tb = $("#top10 tbody");
    if (tb) {
      tb.innerHTML = LEADS.slice(0, 10).map(function (l, i) {
        return "<tr data-h=\"" + l.h + "\">" +
          '<td class="rank">' + (i + 1) + "</td>" +
          '<td class="l"><div class="who"><b>' + esc(l.n) + "</b><span>" + l.h + "</span></div></td>" +
          '<td class="num ' + cls(l.m) + '">' + pct(l.m) + "</td>" +
          '<td class="num ' + cls(l.w) + '">' + pct(l.w) + "</td>" +
          '<td class="num ' + cls(l.prior) + '">' + priorTxt(l) + "</td>" +
          '<td class="num ' + cls(l.dd) + '">' + pct(l.dd, 0) + "</td>" +
          '<td class="num"><span class="score ' + (l.score >= 65 ? "hi" : l.score >= 45 ? "mid" : "lo") + '">' + l.score + "</span></td>" +
          "<td>" + verdictBadge(l.verdict) + "</td>" +
          "</tr>";
      }).join("");
      tb.addEventListener("click", function (e) {
        var tr = e.target.closest("tr");
        if (tr) openSheet(tr.dataset.h);
      });
    }

    // charts
    var sc = $("#scatter");
    if (sc) {
      var top = LEADS.slice(0, 10).map(function (l) { return l.h; });
      var pts = LEADS.map(function (l) {
        var v = l.verdict;
        return {
          x: l.m, y: l.dd === null ? 0 : l.dd, label: l.n + " · " + l.h,
          top: top.indexOf(l.h) >= 0,
          color: v === "ok" ? "rgba(46,230,168,.9)" : v === "watch" ? "rgba(255,200,87,.9)" : "rgba(255,92,122,.9)"
        };
      });
      K.scatter(sc, pts, { height: 420 });
    }
    var hc = $("#hist");
    if (hc) K.hist(hc, LEADS.map(function (l) { return l.m; }), { height: 300 });

    // score-vs-return insight bars
    var dist = { ok: 0, watch: 0, avoid: 0 };
    LEADS.forEach(function (l) { dist[l.verdict]++; });
    var box = $("#distBars");
    if (box) {
      var rows = [
        ["不建议跟", dist.avoid, "avoid"],
        ["先观察", dist.watch, "watch"],
        ["可小额试跟", dist.ok, "ok"]
      ];
      box.innerHTML = rows.map(function (r) {
        var w = (r[1] / LEADS.length * 100).toFixed(1);
        return '<div class="dist-row"><span>' + r[0] + '</span><div class="dist-track"><i class="' + r[2] + '" style="width:' + w + '%"></i></div><b class="mono">' + r[1] + "</b></div>";
      }).join("");
    }
  }

  /* ================= BOARD ================= */
  var boardState = { sort: "m", dir: -1, q: "", filter: "all", limit: 60 };

  function initBoard() {
    renderBoard();
    var tb = $("#board tbody");
    if (tb) tb.addEventListener("click", function (e) {
      var tr = e.target.closest("tr");
      if (tr && tr.dataset.h) openSheet(tr.dataset.h);
    });
    var q = $("#q");
    if (q) q.addEventListener("input", function () { boardState.q = this.value.trim().toLowerCase(); boardState.limit = 60; renderBoard(); });
    $$(".chip[data-filter]").forEach(function (c) {
      c.addEventListener("click", function () {
        $$(".chip[data-filter]").forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on"); boardState.filter = c.dataset.filter; boardState.limit = 60; renderBoard();
      });
    });
    $$("#board thead th[data-key]").forEach(function (th) {
      th.classList.add("th-sort");
      th.addEventListener("click", function () {
        var k = th.dataset.key;
        if (boardState.sort === k) boardState.dir *= -1; else { boardState.sort = k; boardState.dir = -1; }
        $$("#board thead th").forEach(function (x) { x.classList.remove("asc", "desc"); });
        th.classList.add(boardState.dir < 0 ? "desc" : "asc");
        renderBoard();
      });
    });
    var more = $("#more");
    if (more) more.addEventListener("click", function () { boardState.limit += 60; renderBoard(); });
  }

  function boardRows() {
    var rows = LEADS.filter(function (l) {
      if (boardState.q) {
        var hay = (l.n + " " + l.h).toLowerCase();
        if (hay.indexOf(boardState.q) < 0) return false;
      }
      if (boardState.filter === "pos") return l.m > 0;
      if (boardState.filter === "lowdd") return l.dd !== null && l.dd > -25;
      if (boardState.filter === "copyable") return l.verdict === "ok";
      if (boardState.filter === "watch") return watchlist().indexOf(l.h) >= 0;
      return true;
    });
    var k = boardState.sort;
    rows.sort(function (a, b) {
      var x = a[k], y = b[k];
      if (x === null || x === undefined) x = -1e9;
      if (y === null || y === undefined) y = -1e9;
      if (typeof x === "string") return x.localeCompare(y) * boardState.dir;
      return (x - y) * boardState.dir;
    });
    return rows;
  }

  function renderBoard() {
    var rows = boardRows();
    var tb = $("#board tbody");
    if (!tb) return;
    var slice = rows.slice(0, boardState.limit);
    tb.innerHTML = slice.map(function (l, i) {
      var pb = l.payoff === null ? null : Math.min(l.payoff, 4);
      return "<tr data-h=\"" + l.h + "\">" +
        '<td class="rank">' + (i + 1) + "</td>" +
        '<td class="l"><div class="who"><b>' + esc(l.n) + "</b><span>" + l.h + "</span></div></td>" +
        '<td class="num ' + cls(l.m) + '">' + pct(l.m) + "</td>" +
        '<td class="num ' + cls(l.w) + '">' + pct(l.w) + "</td>" +
        '<td class="num ' + cls(l.prior) + '">' + priorTxt(l) + "</td>" +
        '<td class="num ' + cls(l.dd) + '">' + pct(l.dd, 0) + "</td>" +
        '<td class="num ' + cls(l.sh) + '">' + (l.sh === null ? "—" : l.sh.toFixed(2)) + "</td>" +
        '<td class="num">' + (l.wr === null ? "—" : l.wr.toFixed(0) + "%") + "</td>" +
        '<td class="num">' + (pb === null ? "—" : pb.toFixed(2)) + "</td>" +
        '<td class="num">' + (l.tpm === null ? "—" : Math.round(l.tpm)) + "</td>" +
        '<td class="num"><span class="score ' + (l.score >= 65 ? "hi" : l.score >= 45 ? "mid" : "lo") + '">' + l.score + "</span></td>" +
        "<td>" + verdictBadge(l.verdict) + "</td>" +
        "</tr>";
    }).join("");
    var stat = $("#boardStat");
    if (stat) stat.textContent = "显示 " + slice.length + " / " + rows.length + " 位";
    var more = $("#more");
    if (more) more.style.display = rows.length > boardState.limit ? "block" : "none";
  }

  /* ---------- detail sheet ---------- */
  function openSheet(h) {
    var l = LEADS.filter(function (x) { return x.h === h; })[0];
    if (!l) return;
    var mask = $("#mask"), sheet = $("#sheet");
    if (!mask || !sheet) return;
    var parts = [
      ["生存（回撤）", l.parts.survival, 30], ["延续性", l.parts.persistence, 20], ["风险调整收益", l.parts.riskAdj, 20],
      ["收益结构", l.parts.structure, 15], ["成本/频率", l.parts.frequency, 8], ["记录长度", l.parts.track, 7]
    ];
    sheet.innerHTML =
      '<button class="close" id="sheetClose">×</button>' +
      "<h3>" + esc(l.n) + "</h3>" +
      '<div class="handle">' + l.h + " · " + (l.cat === "day" ? "日内" : l.cat === "swing" ? "波段" : "长线") + " · 跟踪 " + l.hist + " 天</div>" +
      '<div style="margin:14px 0 0">' + verdictBadge(l.verdict) + " " + starBtn(l.h) + "</div>" +
      '<div class="kv">' +
      kv("30 天收益", pct(l.m), cls(l.m)) +
      kv("前 60 天收益", priorTxt(l), cls(l.prior)) +
      kv("7 天收益", pct(l.w), cls(l.w)) +
      kv("最大回撤", pct(l.dd, 1), "down") +
      kv("胜率", l.wr === null ? "—" : l.wr.toFixed(1) + "%") +
      kv("盈亏比", l.payoff === null ? "—" : l.payoff.toFixed(2)) +
      kv("笔/月", l.tpm === null ? "—" : Math.round(l.tpm)) +
      kv("累计交易", l.tr === null ? "—" : l.tr) +
      "</div>" +
      '<div style="font-size:12px;color:var(--dim);letter-spacing:.06em;margin:20px 0 10px">可跟单指数 · ' + l.score + " / 100</div>" +
      parts.map(function (p) {
        var w = Math.max(0, Math.min(100, p[1] / p[2] * 100));
        return '<div class="dist-row"><span>' + p[0] + '</span><div class="dist-track"><i class="' + (w > 66 ? "ok" : w > 33 ? "watch" : "avoid") + '" style="width:' + w + '%"></i></div><b class="mono">' + p[1].toFixed(0) + "</b></div>";
      }).join("") +
      (l.flags.length ? '<div style="margin-top:18px;display:flex;gap:6px;flex-wrap:wrap">' + flagBadges(l, 3) + "</div>" : "") +
      '<p class="note" style="margin-top:18px">数据来源：Meror 镜像的 Binance Copy Trading 档案，快照 ' + META.asOf + "（UTC+8）。收益口径为该组合的净值变动，未扣除跟单人滑点与手续费。</p>" +
      '<a class="btn ghost" style="display:block;text-align:center;margin-top:8px" href="https://meror.ca/trader/' + l.h + '" target="_blank" rel="noopener">查看源档案 ↗</a>';
    mask.classList.add("on"); sheet.classList.add("on");
    $("#sheetClose").onclick = closeSheet;
    var st = sheet.querySelector("[data-star]");
    if (st) st.onclick = function () {
      toggleWatch(l.h);
      this.textContent = watchlist().indexOf(l.h) >= 0 ? "★" : "☆";
      this.classList.toggle("on");
      if (boardState.filter === "watch") renderBoard();
    };
  }
  function kv(k, v, c) {
    return '<div><div class="k">' + k + '</div><div class="v ' + (c || "") + '">' + v + "</div></div>";
  }
  function closeSheet() {
    $("#mask").classList.remove("on");
    $("#sheet").classList.remove("on");
  }

  /* ================= ANALYSIS ================= */
  function initAnalysis() {
    var db = $("#dumbbell");
    if (db) {
      K.dumbbell(db, LEADS.slice(0, 10).map(function (l) {
        return { label: l.n, a: l.prior === null ? 0 : l.prior, b: l.m };
      }), { height: 400 });
    }
    var fu = $("#funnel");
    if (fu) {
      var steps = [
        ["Binance 跟单生态中被跟踪的带单员", META.totalTracked, 100],
        ["通过平台基础门槛（历史、交易数、数据质量）", META.eligible, META.eligible / META.totalTracked * 100],
        ["本次抓取到完整 30 天数据的样本", META.sample, META.sample / META.totalTracked * 100]
      ];
      fu.innerHTML = steps.map(function (s) {
        return '<div class="funnel-row">' +
          '<div class="funnel-head"><span>' + s[0] + '</span><span><b>' + s[1].toLocaleString() +
          '</b><em>' + s[2].toFixed(1) + '%</em></span></div>' +
          '<div class="funnel-track"><i style="width:' + Math.max(2, s[2]) + '%"></i></div></div>';
      }).join("");
    }
    // per-trade structure scatter? small table of top10 flags
    var flagBox = $("#flagTable");
    if (flagBox) {
      flagBox.innerHTML = LEADS.slice(0, 10).map(function (l, i) {
        return "<tr><td class='rank'>" + (i + 1) + "</td><td class='l'>" + esc(l.n) + "</td>" +
          "<td class='num " + cls(l.prior) + "'>" + priorTxt(l) + "</td>" +
          "<td class='num " + cls(l.dd) + "'>" + pct(l.dd, 0) + "</td>" +
          "<td class='num'>" + (l.exp === null ? "—" : (l.exp > 0 ? "+" : "") + l.exp.toFixed(2)) + "</td>" +
          "<td class='l'>" + (l.flags.length ? flagBadges(l, 2) : '<span class="dim">无</span>') + "</td></tr>";
      }).join("");
    }

    var byScore = $("#byScore tbody");
    if (byScore) {
      var best = LEADS.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 8);
      byScore.innerHTML = best.map(function (l, i) {
        var why = "回撤 " + pct(l.dd, 0) + " · 前 60 天 " + priorTxt(l) + " · " + Math.round(l.tpm || 0) + " 笔/月";
        return "<tr data-h=\"" + l.h + "\"><td class='rank'>" + (i + 1) + "</td>" +
          "<td class='l'><div class='who'><b>" + esc(l.n) + "</b><span>" + l.h + "</span></div></td>" +
          "<td class='num'><span class='score hi'>" + l.score + "</span></td>" +
          "<td class='num " + cls(l.m) + "'>" + pct(l.m) + "</td>" +
          "<td class='num " + cls(l.prior) + "'>" + priorTxt(l) + "</td>" +
          "<td class='num " + cls(l.dd) + "'>" + pct(l.dd, 1) + "</td>" +
          "<td class='num'>" + Math.round(l.tpm || 0) + "</td>" +
          "<td class='l' style='font-family:var(--sans);color:var(--muted);font-size:12.5px'>" + why + "</td></tr>";
      }).join("");
      byScore.addEventListener("click", function (e) {
        var tr = e.target.closest("tr");
        if (tr) openSheet(tr.dataset.h);
      });
    }
  }

  /* ================= SIMULATOR ================= */
  function initSim() {
    var sel = $("#preset");
    if (!sel) return;
    var demo = LEADS.filter(function (l) { return l.h === "bn66795009"; })[0] || LEADS[0];
    var presets = LEADS.slice(0, 10).map(function (l) {
      return { v: l.h, label: (l.rank) + ". " + l.n + " · " + pct(l.m, 0) + " / 回撤 " + pct(l.dd, 0), l: l };
    });
    presets.unshift({ v: "demo", label: "示例 · 低回撤可跟型（" + demo.n + "）", l: demo });
    presets.push({ v: "custom", label: "自定义参数", l: null });
    sel.innerHTML = presets.map(function (p) { return '<option value="' + p.v + '">' + esc(p.label) + "</option>"; }).join("");

    var state = { wr: 55, aw: 3.5, al: -4, tpm: 45, months: 6, split: 10, slip: 12, fee: 5, lev: 1, drift: 0 };

    function bindRange(id, key, fmt, scale) {
      var el = $("#" + id), out = $("#" + id + "v");
      if (!el) return;
      el.value = state[key];
      if (out) out.textContent = fmt(state[key]);
      el.addEventListener("input", function () {
        state[key] = parseFloat(this.value) * (scale || 1);
        if (out) out.textContent = fmt(state[key]);
        run();
      });
    }

    // 用账户「30 天实际收益 / 笔数」反推单笔几何收益，再把镜像的胜率与盈亏比
    // 等比例缩放到这个收益上；否则 85% 胜率 × 4.6% 平均盈利会复利出天文数字。
    function calibrate(l) {
      var tpm = Math.max(1, Math.min(400, l.tpm || 60));
      var e = Math.pow(1 + (l.m || 0) / 100, 1 / tpm) - 1;
      var p = (l.wr === null ? 50 : l.wr) / 100;
      var aw = l.aw === null ? 2 : l.aw;
      var al = l.al === null ? -2 : l.al;
      var Eraw = p * aw + (1 - p) * al;
      var k = Eraw > 0.0001 ? (e * 100) / Eraw : 1;
      k = Math.max(0.02, Math.min(3, k));
      return { aw: aw * k, al: al * k, wr: p * 100, tpm: tpm, k: k, inconsistent: Eraw <= 0.0001, e: e * 100 };
    }

    function loadPreset(v) {
      if (v === "custom") return;
      var p = presets.filter(function (x) { return x.v === v; })[0];
      if (!p || !p.l) return;
      var l = p.l, c = calibrate(l);
      state.wr = c.wr;
      state.aw = c.aw;
      state.al = c.al;
      state.tpm = c.tpm;
      var note = $("#presetNote");
      if (note) {
        note.innerHTML = c.inconsistent
          ? "⚠ 该账户的逐笔结构与月度收益矛盾（账面期望为负），无法用其自身参数复现 " + pct(l.m, 0) + "。下面按账面结构原样模拟，结果必然与榜单不符——这正是「收益不来自稳定优势」的证据。"
          : "已按 30 天实际收益校准单笔幅度 ×" + c.k.toFixed(2) + "：" + pct(l.m, 0) + " / " + Math.round(c.tpm) + " 笔 ≈ 每笔 " + c.e.toFixed(2) + "%。";
      }
      ["wr", "aw", "al", "tpm"].forEach(function (k) {
        var el = $("#" + k), out = $("#" + k + "v");
        if (el) el.value = state[k];
        if (out) out.textContent = fmtOf(k, state[k]);
      });
      run();
    }
    function fmtOf(k, v) {
      if (k === "wr") return v.toFixed(0) + "%";
      if (k === "aw" || k === "al") return v.toFixed(2) + "%";
      if (k === "tpm") return Math.round(v) + " 笔";
      return v;
    }

    sel.addEventListener("change", function () { loadPreset(this.value); });

    ["wr", "aw", "al", "tpm"].forEach(function (k) {
      var el = $("#" + k), out = $("#" + k + "v");
      if (!el) return;
      el.addEventListener("input", function () {
        state[k] = parseFloat(this.value);
        if (out) out.textContent = fmtOf(k, state[k]);
        $("#preset").value = "custom";
        run();
      });
    });
    bindRange("months", "months", function (v) { return v + " 个月"; });
    bindRange("split", "split", function (v) { return v + "%"; });
    bindRange("slip", "slip", function (v) { return v + " bps"; });
    bindRange("fee", "fee", function (v) { return v + " bps"; });
    bindRange("lev", "lev", function (v) { return v.toFixed(1) + "x"; });
    bindRange("drift", "drift", function (v) { return v > 0 ? "+" + (v * 100).toFixed(0) + "pt" : (v * 100).toFixed(0) + "pt"; });

    var runBtn = $("#run");
    if (runBtn) runBtn.addEventListener("click", run);

    var last = null;
    function run() {
      var res = E.simulate({
        wr: state.wr, aw: state.aw, al: state.al, tpm: state.tpm, months: state.months,
        split: state.split, slipBps: state.slip, feeBps: state.fee, lev: state.lev,
        drift: state.drift, paths: 3000, seed: 11
      });
      last = res;
      var box = $("#results");
      if (box) {
        box.innerHTML = [
          ["期末净值中位数", res.median.toFixed(2) + "x", res.median >= 1 ? "up" : "down"],
          ["盈利概率", res.probUp.toFixed(0) + "%", res.probUp > 50 ? "up" : "down"],
          ["腰斩概率", res.probHalf.toFixed(0) + "%", res.probHalf > 10 ? "down" : "muted"],
          ["接近归零", res.probRuin.toFixed(0) + "%", res.probRuin > 2 ? "down" : "muted"]
        ].map(function (r) {
          return '<div class="res"><div class="k">' + r[0] + '</div><div class="v ' + r[2] + '">' + r[1] + "</div></div>";
        }).join("");
      }
      var f = $("#fan");
      if (f) K.fan(f, res.curves, { height: 300 });
      var note = $("#simNote");
      if (note) {
        note.innerHTML = "按当前参数，" + state.months + " 个月后 5% 分位 " + res.p5.toFixed(2) + "x，95% 分位 " + res.p95.toFixed(2) +
          "x；翻倍概率 " + res.probDouble.toFixed(0) + "%。带单员分成已按「当月净利润 × " + state.split + "%」逐月扣除。";
      }
    }
    function syncLabels() {
      ["wr", "aw", "al", "tpm"].forEach(function (k) {
        var el = $("#" + k), out = $("#" + k + "v");
        if (el) el.value = state[k];
        if (out) out.textContent = fmtOf(k, state[k]);
      });
    }
    syncLabels();
    sel.value = "demo";
    loadPreset("demo");
  }

  /* ================= PLAYBOOK ================= */
  function initPlaybook() {
    var items = $$(".check-item");
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem("ls_check") || "{}"); } catch (e) { }
    items.forEach(function (it) {
      var k = it.dataset.k;
      if (saved[k]) it.classList.add("done");
      it.addEventListener("click", function () {
        it.classList.toggle("done");
        saved[k] = it.classList.contains("done");
        localStorage.setItem("ls_check", JSON.stringify(saved));
        var n = $$(".check-item.done").length;
        var c = $("#checkCount");
        if (c) c.textContent = n + " / " + items.length;
      });
    });
    var c = $("#checkCount");
    if (c) c.textContent = $$(".check-item.done").length + " / " + items.length;
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    markNav();
    reveal();
    var page = document.body.dataset.page;
    if (page === "home") initHome();
    if (page === "board") initBoard();
    if (page === "analysis") initAnalysis();
    if (page === "simulator") initSim();
    if (page === "playbook") initPlaybook();

    var mask = $("#mask");
    if (mask) mask.addEventListener("click", closeSheet);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });

    $$("#asOf, #asOf2, #asOf3, #asOfTop, #asOfH").forEach(function (el) { el.textContent = META.asOf; });
    var cnt = $("#sampleCount");
    if (cnt) cnt.textContent = META.sample;
  });
})();
