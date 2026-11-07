/* 短剧全球流量榜 — 交互与视图 */
(function () {
  "use strict";

  var DATA = window.SD_DATA;
  var MAX_COVERAGE = 41;

  /* ── 指数模型 ──────────────────────────────────────────── */
  var D_MIN = 0.15, D_MAX = 40;
  var R_MIN = 0.05, R_MAX = 50;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function logNorm(v, min, max) {
    var x = Math.log10(Math.max(v, min));
    return clamp((x - Math.log10(min)) / (Math.log10(max) - Math.log10(min)), 0, 1);
  }

  function partsOf(p) {
    var d = 70 * logNorm(p.downloads, D_MIN, D_MAX);
    var r = 20 * logNorm(p.revenue + 0.05, R_MIN, R_MAX);
    var c = 10 * clamp(p.coverage / MAX_COVERAGE, 0, 1);
    return { d: d, r: r, c: c, total: d + r + c };
  }

  function scoreOf(p) { return partsOf(p).total; }

  var platforms = DATA.platforms.map(function (p) {
    var copy = Object.assign({}, p);
    copy.score = scoreOf(p);
    return copy;
  });

  /* ── 工具 ──────────────────────────────────────────────── */
  function fmtM(v) { return v.toFixed(1) + "M"; }
  function fmtR(v) { return "$" + v.toFixed(1) + "M"; }
  function pad2(n) { return n < 10 ? "0" + n : String(n); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function confClass(c) {
    return c === "高" ? "pill-high" : c === "中" ? "pill-mid" : "pill-low";
  }

  var LINKS = window.SD_LINKS || {};
  function linksOf(p) { return LINKS[p.name] || {}; }
  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return url; }
  }
  function primaryLink(p) {
    var l = linksOf(p);
    if (l.site) return { href: l.site, label: "官网", host: hostOf(l.site) };
    if (l.ios) return { href: l.ios, label: "App Store", host: "apps.apple.com" };
    if (l.android) return { href: l.android, label: "Google Play", host: "play.google.com" };
    return null;
  }

  var state = { q: "", model: "all", camp: "all", sort: "score", open: null };

  /* ── 顶部 PODIUM ───────────────────────────────────────── */
  function renderPodium() {
    var top = platforms.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 3);
    var host = document.getElementById("podium");
    host.innerHTML = top.map(function (p, i) {
      return '<li>' +
        '<span class="p-rank">' + pad2(i + 1) + '</span>' +
        '<span><span class="p-name">' + esc(p.name) + '</span><br>' +
        '<span class="p-sub">' + esc(p.company) + ' · ' + esc(p.hq) + '</span></span>' +
        '<span class="p-score">' + p.score.toFixed(1) + '</span>' +
        '</li>';
    }).join("");
    document.getElementById("hero-date").textContent = DATA.updatedAt;
  }

  /* ── 榜单 ──────────────────────────────────────────────── */
  function getVisible() {
    var q = state.q.trim().toLowerCase();
    var list = platforms.filter(function (p) {
      if (state.model !== "all" && p.model !== state.model) return false;
      if (state.camp !== "all" && p.camp !== state.camp) return false;
      if (!q) return true;
      return (p.name + " " + p.company + " " + p.hq + " " + p.markets.join(" ")).toLowerCase().indexOf(q) > -1;
    });

    var sorters = {
      score: function (a, b) { return b.score - a.score; },
      downloads: function (a, b) { return b.downloads - a.downloads; },
      revenue: function (a, b) { return b.revenue - a.revenue; },
      coverage: function (a, b) { return b.coverage - a.coverage; },
      name: function (a, b) { return a.name.localeCompare(b.name); }
    };
    list.sort(sorters[state.sort] || sorters.score);
    return list;
  }

  function renderRows() {
    var list = getVisible();
    var maxScore = Math.max.apply(null, platforms.map(function (p) { return p.score; }));
    var host = document.getElementById("rows");

    host.innerHTML = list.map(function (p, i) {
      var rank = state.sort === "score" ? i + 1 : platforms.slice().sort(function (a, b) { return b.score - a.score; }).indexOf(p) + 1;
      var width = clamp((p.score / maxScore) * 100, 3, 100);
      var isOpen = state.open === p.name;
      var parts = partsOf(p);
      var link = primaryLink(p);
      var L = linksOf(p);
      var linkHTML = link
        ? '<a class="ext" href="' + esc(link.href) + '" target="_blank" rel="noopener noreferrer" ' +
          'title="' + esc(link.label + " · " + link.host) + '" ' +
          'aria-label="打开 ' + esc(p.name) + ' 的' + link.label + '（新窗口）">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 16 8M9.5 8H16v6.5"/></svg></a>'
        : "";

      return '<article class="item' + (isOpen ? " open" : "") + '" data-name="' + esc(p.name) + '">' +
        '<div class="row" role="row" tabindex="0" aria-expanded="' + (isOpen ? "true" : "false") + '">' +
          '<div class="c-rank" role="cell">' + pad2(rank) + '</div>' +
          '<div class="c-name" role="cell">' +
            '<div class="name-top"><span class="pname">' + esc(p.name) + '</span>' +
              '<span class="badge" data-m="' + p.model + '">' + p.model + '</span>' +
              linkHTML + '</div>' +
            '<div class="pcompany">' + esc(p.company) + ' · ' + esc(p.hq) + '</div>' +
            '<div class="r-meta">' + fmtM(p.downloads) + ' 下载 · ' + fmtR(p.revenue) + ' 流水 · ' + p.coverage + ' 市场</div>' +
          '</div>' +
          '<div class="c-model" role="cell"><span class="badge" data-m="' + p.model + '">' + p.model + '</span></div>' +
          '<div class="c-markets" role="cell">' + esc(p.markets.join(" · ")) + '</div>' +
          '<div class="c-cov" role="cell">' + p.coverage + '</div>' +
          '<div class="c-dl" role="cell">' + fmtM(p.downloads) + '</div>' +
          '<div class="c-rev" role="cell">' + fmtR(p.revenue) + '</div>' +
          '<div class="c-score" role="cell">' +
            '<div class="score-bar"><i style="width:' + width.toFixed(1) + '%"></i></div>' +
            '<span class="score-val">' + p.score.toFixed(1) + '</span>' +
          '</div>' +
          '<div class="c-conf" role="cell"><span class="pill ' + confClass(p.confidence) + '">' + p.confidence + '</span></div>' +
        '</div>' +
        '<div class="detail"><div class="detail-inner"><div class="detail-grid">' +
          '<div><h4>一句话判断</h4><p>' + esc(p.blurb) + '</p></div>' +
          '<div><h4>基本盘</h4><div class="facts">' +
            '<span class="fact">上线 ' + esc(p.launch) + '</span>' +
            '<span class="fact">' + esc(p.camp) + '</span>' +
            '<span class="fact">' + esc(p.genres.join(" / ")) + '</span>' +
            '<span class="fact">在榜 ' + p.coverage + ' 市场</span>' +
          '</div>' +
          (L.site || L.ios || L.android ? '<h4 class="facts-title">入口</h4><div class="facts">' +
            (L.site ? '<a class="fact fact-link" href="' + esc(L.site) + '" target="_blank" rel="noopener noreferrer">官网 ' + esc(hostOf(L.site)) + ' ↗</a>' : '') +
            (L.ios ? '<a class="fact fact-link" href="' + esc(L.ios) + '" target="_blank" rel="noopener noreferrer">App Store ↗</a>' : '') +
            (L.android ? '<a class="fact fact-link" href="' + esc(L.android) + '" target="_blank" rel="noopener noreferrer">Google Play ↗</a>' : '') +
          '</div>' : '') +
          '</div>' +
          '<div><h4>指数 ' + parts.total.toFixed(1) + ' 的构成</h4>' +
            '<p class="score-break">' +
              '<span>下载 ' + parts.d.toFixed(1) + '</span>' +
              '<span>流水 ' + parts.r.toFixed(1) + '</span>' +
              '<span>覆盖 ' + parts.c.toFixed(1) + '</span>' +
            '</p>' +
            '<p class="evidence">' + esc(p.evidence) + '</p></div>' +
        '</div></div></div>' +
      '</article>';
    }).join("");

    document.getElementById("empty").hidden = list.length > 0;
    var sortLabel = { score: "流量指数", downloads: "月下载", revenue: "月流水", coverage: "覆盖市场", name: "名称" }[state.sort];
    document.getElementById("count").textContent =
      "显示 " + list.length + " / " + platforms.length + " · 按" + sortLabel + "排序";
  }

  /* 展开 / 收起 */
  function toggleItem(article) {
    var name = article.getAttribute("data-name");
    var open = state.open === name;
    state.open = open ? null : name;

    document.querySelectorAll(".item").forEach(function (el) {
      var on = el.getAttribute("data-name") === state.open;
      el.classList.toggle("open", on);
      var row = el.querySelector(".row");
      if (row) row.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }

  document.getElementById("rows").addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    var row = e.target.closest(".row");
    if (row) toggleItem(row.parentElement);
  });
  document.getElementById("rows").addEventListener("keydown", function (e) {
    if (e.target.closest("a")) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    var row = e.target.closest(".row");
    if (!row) return;
    e.preventDefault();
    toggleItem(row.parentElement);
  });

  /* ── 筛选交互 ──────────────────────────────────────────── */
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.setAttribute("aria-pressed", chip.classList.contains("is-on") ? "true" : "false");
    chip.addEventListener("click", function () {
      var group = chip.getAttribute("data-filter");
      document.querySelectorAll('.chip[data-filter="' + group + '"]').forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      state[group] = chip.getAttribute("data-value");
      renderRows();
    });
  });

  document.getElementById("q").addEventListener("input", function (e) {
    state.q = e.target.value;
    renderRows();
  });

  document.getElementById("sort").addEventListener("change", function (e) {
    state.sort = e.target.value;
    renderRows();
  });

  /* ── 导出 ──────────────────────────────────────────────── */
  document.getElementById("export").addEventListener("click", function () {
    var list = getVisible();
    var rankMap = {};
    platforms.slice().sort(function (a, b) { return b.score - a.score; })
      .forEach(function (p, i) { rankMap[p.name] = i + 1; });

    var head = ["排名", "平台", "公司", "总部", "上线", "模式", "阵营", "主战场", "在榜市场", "月下载(百万)", "月流水(百万美元)", "流量指数", "置信度", "官网", "App Store", "Google Play"];
    var lines = [head.join(",")];
    list.forEach(function (p) {
      var L = linksOf(p);
      lines.push([
        rankMap[p.name], p.name, p.company, p.hq, p.launch, p.model, p.camp,
        p.markets.join("/"), p.coverage, p.downloads, p.revenue, p.score.toFixed(1), p.confidence,
        L.site || "", L.ios || "", L.android || ""
      ].map(function (v) {
        var s = String(v);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(","));
    });

    var blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "short-drama-top50-2026-11-02.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });

  /* ── 图表 ──────────────────────────────────────────────── */
  function renderTop10() {
    var top = platforms.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 10);
    var max = top[0].score;
    document.getElementById("top10").innerHTML = top.map(function (p) {
      return '<div class="bar-row">' +
        '<span class="bar-label">' + esc(p.name) + '</span>' +
        '<span class="bar-track"><i class="bar-fill" style="width:' + (p.score / max * 100).toFixed(1) + '%;display:block"></i></span>' +
        '<span class="bar-val">' + p.score.toFixed(1) + '</span>' +
      '</div>';
    }).join("");
  }

  function renderDonut() {
    var order = ["IAP", "IAA", "IAAP"];
    var colors = { IAP: "#FF5C39", IAA: "#57D2C6", IAAP: "#F6C177" };
    var total = platforms.length;
    var counts = order.map(function (m) {
      return platforms.filter(function (p) { return p.model === m; }).length;
    });
    var degs = counts.map(function (c) { return c / total * 360; });
    var donut = document.getElementById("donut");
    donut.style.setProperty("--a", degs[0].toFixed(2) + "deg");
    donut.style.setProperty("--b", degs[1].toFixed(2) + "deg");
    donut.style.setProperty("--c", degs[2].toFixed(2) + "deg");
    donut.insertAdjacentHTML("beforeend",
      '<div class="donut-center"><strong>' + total + '</strong><span>平台</span></div>');

    document.getElementById("donut-legend").innerHTML = order.map(function (m, i) {
      return '<li><span class="sw" style="background:' + colors[m] + '"></span>' + m +
        '<span class="lv">' + counts[i] + ' · ' + Math.round(counts[i] / total * 100) + '%</span></li>';
    }).join("");
  }

  function renderCamps() {
    var order = ["中国出海", "海外本土", "南亚本土"];
    var colors = { "中国出海": "#FF5C39", "海外本土": "#57D2C6", "南亚本土": "#F6C177" };
    var total = platforms.length;
    document.getElementById("camps").innerHTML = order.map(function (c) {
      var n = platforms.filter(function (p) { return p.camp === c; }).length;
      return '<div class="stack-item">' +
        '<div class="stack-top"><span>' + c + '</span><span class="sv">' + n + ' 个 · ' + Math.round(n / total * 100) + '%</span></div>' +
        '<div class="stack-track"><i class="stack-fill" style="width:' + (n / total * 100).toFixed(1) + '%;background:' + colors[c] + ';display:block"></i></div>' +
      '</div>';
    }).join("");
  }

  /* ── 数据源 ────────────────────────────────────────────── */
  function renderSources() {
    document.getElementById("source-list").innerHTML = DATA.sources.map(function (s, i) {
      return '<li>' +
        '<span class="sn">' + pad2(i + 1) + '</span>' +
        '<a href="' + s.url + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + '</a>' +
        '<span class="sp">' + esc(s.publisher) + ' · ' + s.date + '</span>' +
      '</li>';
    }).join("");
  }

  /* ── init ──────────────────────────────────────────────── */
  renderPodium();
  renderRows();
  renderTop10();
  renderDonut();
  renderCamps();
  renderSources();

  /* 轻微视差：hero 卡片随滚动淡入 */
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.opacity = "1";
          en.target.style.transform = "none";
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".chart, .method-card, .insight").forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(14px)";
      el.style.transition = "opacity .6s ease, transform .6s cubic-bezier(.22,.8,.28,1)";
      io.observe(el);
    });
  }
})();
