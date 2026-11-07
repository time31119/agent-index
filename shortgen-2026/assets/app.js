/* 短视频生成器索引 2026 — 交互层 */
(function () {
  "use strict";

  var DATA = window.SITE_DATA;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var CAT = {
    model: "视频模型",
    agent: "一站式成片",
    script: "图文口播",
    edit: "剪辑数字人"
  };

  var state = {
    cat: "all",
    q: "",
    sort: "rec",
    calc: { modelId: "seedance-25", tier: 1, dur: 30, tries: 3, pass: 0.5 }
  };

  var byId = {};
  DATA.tools.forEach(function (t) { byId[t.id] = t; });

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cny(n) {
    if (n >= 100) return "¥" + Math.round(n).toLocaleString("zh-CN");
    if (n >= 10) return "¥" + (Math.round(n * 10) / 10).toLocaleString("zh-CN");
    return "¥" + (Math.round(n * 100) / 100).toLocaleString("zh-CN");
  }

  function searchLink(t) {
    return "https://www.bing.com/search?q=" + encodeURIComponent(t.search || (t.name + " 官网"));
  }

  function ym(iso) {
    if (!iso) return "—";
    var p = String(iso).split("-");
    return p[0] + "." + (p[1] || "01");
  }

  function linkFor(t) {
    return t.url || searchLink(t);
  }

  /* ---------------- picks ---------------- */

  function renderPicks() {
    var host = $("#picksGrid");
    var list = DATA.picks.map(function (id) { return byId[id]; }).filter(Boolean);

    host.innerHTML = list.map(function (t, i) {
      var specs = t.chips.slice(0, 3).map(function (c) { return "<span>" + esc(c) + "</span>"; }).join("");
      return '<article class="pick' + (i === 0 ? " is-hero" : "") + '" data-id="' + t.id + '">' +
        '<span class="pick-rank">0' + (i + 1) + "</span>" +
        '<div class="pick-top">' +
          '<span class="pick-label">编辑选择</span>' +
          '<span class="pick-badge">' + esc(t.badge) + "</span>" +
        "</div>" +
        "<h3>" + esc(t.name) + "</h3>" +
        '<p class="en">' + esc(t.en) + " · " + esc(t.vendor) + "</p>" +
        '<p class="tagline">' + esc(t.tagline) + "</p>" +
        '<div class="pick-specs">' + specs + "</div>" +
        '<p class="pick-meta"><span>★ <b>' + t.rating.toFixed(1) + "</b></span><span>" + ym(t.released) + " 发布</span></p>" +
        '<div class="pick-foot">' +
          '<div class="pick-price"><strong>' + esc(t.price) + "</strong><span>" + esc(t.priceNote) + "</span></div>" +
          '<button class="pick-btn" type="button" data-open="' + t.id + '">查看详情 <span aria-hidden="true">→</span></button>' +
        "</div>" +
      "</article>";
    }).join("");

    host.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-open]");
      if (btn) { openModal(btn.getAttribute("data-open")); return; }
      var card = e.target.closest(".pick");
      if (card) openModal(card.getAttribute("data-id"));
    });
  }

  /* ---------------- library ---------------- */

  function matches(t, q) {
    if (!q) return true;
    var hay = [
      t.name, t.en, t.vendor, t.tagline, t.desc, t.badge,
      (t.chips || []).join(" "), (t.tags || []).join(" "), CAT[t.cat]
    ].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
  }

  function currentTools() {
    var list = DATA.tools.filter(function (t) {
      return (state.cat === "all" || t.cat === state.cat) && matches(t, state.q);
    });
    if (state.sort === "rating") {
      list.sort(function (a, b) { return b.rating - a.rating || a.name.localeCompare(b.name, "zh"); });
    } else if (state.sort === "new") {
      list.sort(function (a, b) { return String(b.released || "").localeCompare(String(a.released || "")); });
    }
    return list;
  }

  function renderGrid() {
    var host = $("#grid");
    var list = currentTools();

    host.innerHTML = list.map(function (t, i) {
      var chips = t.chips.slice(0, 3).map(function (c) { return "<span>" + esc(c) + "</span>"; }).join("");
      return '<article class="card reveal" tabindex="0" role="button" aria-label="查看 ' + esc(t.name) + ' 详情" data-id="' + t.id + '" style="--d:' + (i % 3) * 45 + 'ms">' +
        '<div class="card-top">' +
          '<span class="chip-cat ' + t.cat + '">' + CAT[t.cat] + "</span>" +
          '<span class="rating">★ <b>' + t.rating.toFixed(1) + "</b></span>" +
        "</div>" +
        "<h3>" + esc(t.name) + "</h3>" +
        '<p class="vendor">' + esc(t.vendor) + "</p>" +
        '<p class="tagline">' + esc(t.tagline) + "</p>" +
        '<div class="card-chips">' + chips + "</div>" +
        '<div class="card-foot">' +
          '<div class="card-price">' + esc(t.price) + "<small>" + esc(t.priceNote) + "</small></div>" +
          '<span class="card-go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
        "</div>" +
      "</article>";
    }).join("");

    $("#empty").hidden = list.length > 0;
    observeReveals(host);
  }

  function updateCounts() {
    $$("#tabs .tab").forEach(function (btn) {
      var cat = btn.getAttribute("data-cat");
      var n = cat === "all" ? DATA.tools.length : DATA.tools.filter(function (t) { return t.cat === cat; }).length;
      var span = btn.querySelector("span");
      if (span) span.textContent = n;
    });
  }

  function setQuery(q, scroll) {
    state.q = q;
    var a = $("#heroSearch"), b = $("#libSearch");
    if (a.value !== q) a.value = q;
    if (b.value !== q) b.value = q;
    renderGrid();
    if (scroll) {
      var target = $("#library");
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 78, behavior: "smooth" });
    }
  }

  function bindLibrary() {
    $("#tabs").addEventListener("click", function (e) {
      var btn = e.target.closest(".tab");
      if (!btn) return;
      state.cat = btn.getAttribute("data-cat");
      $$("#tabs .tab").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      renderGrid();
    });

    $("#sort").addEventListener("change", function (e) {
      state.sort = e.target.value;
      renderGrid();
    });

    $("#heroSearch").addEventListener("input", function (e) { setQuery(e.target.value, false); });
    $("#heroSearch").addEventListener("keydown", function (e) {
      if (e.key === "Enter") setQuery(e.target.value, true);
    });
    $("#libSearch").addEventListener("input", function (e) { setQuery(e.target.value, false); });

    $("#libSearch").addEventListener("keydown", function (e) {
      if (e.key === "Escape") setQuery("", false);
    });

    $("#quickTags").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-q]");
      if (!btn) return;
      var q = btn.getAttribute("data-q");
      setQuery(state.q === q ? "" : q, true);
    });

    $("#resetBtn").addEventListener("click", function () {
      state.cat = "all";
      state.q = "";
      state.sort = "rec";
      $("#sort").value = "rec";
      $$("#tabs .tab").forEach(function (b, i) {
        b.classList.toggle("is-on", i === 0);
        b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      });
      setQuery("", false);
    });

    $("#grid").addEventListener("click", function (e) {
      var card = e.target.closest(".card");
      if (card) openModal(card.getAttribute("data-id"));
    });

    $("#grid").addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var card = e.target.closest(".card");
      if (!card) return;
      e.preventDefault();
      openModal(card.getAttribute("data-id"));
    });
  }

  /* ---------------- compare ---------------- */

  function renderCompare() {
    var host = $("#compareBody");
    host.innerHTML = DATA.compare.map(function (m, i) {
      var pct = Math.round((m.rating / 5) * 100);
      return "<tr>" +
        '<td><span class="model-cell"><i>' + String(i + 1).padStart(2, "0") + "</i><span>" + esc(m.name) +
          "<small>" + esc(m.vendor) + "</small></span></span></td>" +
        "<td>" + esc(m.duration) + "</td>" +
        "<td>" + esc(m.res) + "</td>" +
        "<td>" + esc(m.audio) + "</td>" +
        "<td>" + esc(m.refs) + "</td>" +
        "<td>" + esc(m.price) + "</td>" +
        '<td><span class="rt"><b>' + m.rating.toFixed(1) + '</b><span style="--w:' + pct + '%"></span></span></td>' +
      "</tr>";
    }).join("");
  }

  /* ---------------- calculator ---------------- */

  function calcModel() {
    return DATA.calc.filter(function (m) { return m.id === state.calc.modelId; })[0] || DATA.calc[0];
  }

  function renderCalcSelect() {
    var sel = $("#calcModel");
    sel.innerHTML = DATA.calc.map(function (m) {
      return '<option value="' + m.id + '">' + esc(m.name) + "</option>";
    }).join("");
    sel.value = state.calc.modelId;
  }

  function renderTiers() {
    var m = calcModel();
    if (state.calc.tier >= m.tiers.length) state.calc.tier = m.tiers.length - 1;
    var host = $("#tiers");
    host.innerHTML = m.tiers.map(function (t, i) {
      return '<button type="button" data-tier="' + i + '" class="' + (i === state.calc.tier ? "is-on" : "") + '">' + esc(t.label) + "</button>";
    }).join("");
  }

  function compute() {
    var m = calcModel();
    var tier = m.tiers[state.calc.tier];
    var one = tier.price * state.calc.dur;
    var total = one * state.calc.tries;
    var usable = state.calc.tries * state.calc.pass;
    var per = total / usable;

    $("#perUsable").textContent = cny(per);
    $("#oneCost").textContent = cny(one);
    $("#totalCost").textContent = cny(total);
    $("#usable").textContent = (Math.round(usable * 10) / 10) + " 条";
    $("#calcSub").textContent = m.name + " · " + tier.label + " · " + state.calc.dur + " 秒 · 抽 " +
      state.calc.tries + " 次 · 通过率 " + Math.round(state.calc.pass * 100) + "%";
  }

  function paintRange(input) {
    var min = +input.min, max = +input.max, val = +input.value;
    input.style.setProperty("--p", ((val - min) / (max - min) * 100) + "%");
  }

  function bindCalc() {
    renderCalcSelect();
    renderTiers();
    compute();
    paintRange($("#dur"));
    paintRange($("#tries"));

    $("#calcModel").addEventListener("change", function (e) {
      state.calc.modelId = e.target.value;
      state.calc.tier = calcModel().tiers.length - 1;
      renderTiers();
      compute();
    });

    $("#dur").addEventListener("input", function (e) {
      state.calc.dur = +e.target.value;
      $("#durOut").textContent = state.calc.dur + " 秒";
      paintRange(e.target);
      compute();
    });

    $("#tries").addEventListener("input", function (e) {
      state.calc.tries = +e.target.value;
      $("#tryOut").textContent = state.calc.tries + " 次";
      paintRange(e.target);
      compute();
    });

    $("#tiers").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-tier]");
      if (!btn) return;
      state.calc.tier = +btn.getAttribute("data-tier");
      $$("#tiers button").forEach(function (b) { b.classList.toggle("is-on", b === btn); });
      compute();
    });

    $("#passSeg").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-pass]");
      if (!btn) return;
      state.calc.pass = +btn.getAttribute("data-pass");
      $("#passOut").textContent = Math.round(state.calc.pass * 100) + "%";
      $$("#passSeg button").forEach(function (b) { b.classList.toggle("is-on", b === btn); });
      compute();
    });
  }

  /* ---------------- scenes / flow / insights / sources ---------------- */

  var ICONS = {
    mic: '<svg viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.2 11h10.4L20 7H6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.4" fill="currentColor"/><circle cx="17" cy="19" r="1.4" fill="currentColor"/></svg>',
    drama: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M8 3v4M16 3v4M10 10l5 2.5-5 2.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5Z" stroke="currentColor" stroke-width="1.4"/></svg>'
  };

  function renderScenes() {
    $("#scenesGrid").innerHTML = DATA.scenes.map(function (s) {
      return '<article class="scene reveal">' +
        '<div class="scene-top"><span class="scene-icon">' + ICONS[s.icon] + "</span>" +
        '<span class="scene-budget">' + esc(s.budget) + "</span></div>" +
        "<h3>" + esc(s.title) + "</h3>" +
        '<p class="scene-combo">' + esc(s.combo) + "</p>" +
        "<p>" + esc(s.why) + "</p>" +
      "</article>";
    }).join("");
  }

  function renderFlow() {
    $("#flowList").innerHTML = DATA.flow.map(function (f) {
      return "<li>" +
        '<span class="n">' + esc(f.n) + "</span>" +
        "<h3>" + esc(f.title) + "</h3>" +
        "<p>" + esc(f.desc) + "</p>" +
        '<span class="tools">' + esc(f.tools) + "</span>" +
      "</li>";
    }).join("");
  }

  function renderInsights() {
    $("#insights").innerHTML = DATA.insights.map(function (i) {
      return "<div><b>" + esc(i.value) + "</b><span>" + esc(i.label) + "</span><p>" + esc(i.note) + "</p></div>";
    }).join("");
  }

  function renderSources() {
    $("#sourceList").innerHTML = DATA.sources.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + " ↗</a></li>";
    }).join("");
  }

  /* ---------------- modal ---------------- */

  var lastFocus = null;

  function specRows(t) {
    return t.specs.map(function (s) {
      return "<div><dt>" + esc(s.k) + "</dt><dd>" + esc(s.v) + "</dd></div>";
    }).join("");
  }

  function openModal(id) {
    var t = byId[id];
    if (!t) return;
    lastFocus = document.activeElement;

    var body = $("#modalBody");
    body.innerHTML =
      '<div class="m-top"><span class="chip-cat ' + t.cat + '">' + CAT[t.cat] + "</span>" +
        '<span class="pick-badge">' + esc(t.badge) + "</span>" +
        '<span class="rating" style="margin-left:6px">★ <b>' + t.rating.toFixed(1) + "</b></span></div>" +
      '<h2 class="m-title" id="mTitle">' + esc(t.name) + "</h2>" +
      '<p class="m-vendor">' + esc(t.en) + " · " + esc(t.vendor) + "</p>" +
      '<p class="m-desc">' + esc(t.desc) + "</p>" +
      '<dl class="m-specs">' + specRows(t) + "</dl>" +
      '<div class="m-box best"><p class="k">价格 / 适合谁</p><p><b>' + esc(t.price) + "</b> · " + esc(t.priceNote) + "</p>" +
        "<p>" + esc(t.bestFor) + "</p></div>" +
      '<div class="m-box warn"><p class="k">注意</p><p>' + esc(t.caution) + "</p></div>" +
      '<div class="m-actions">' +
        '<a class="btn-primary" href="' + esc(linkFor(t)) + '" target="_blank" rel="noopener noreferrer">' +
          (t.url ? "访问官网" : "搜索官网") + " <span aria-hidden=\"true\">↗</span></a>" +
        '<button class="btn-ghost" type="button" data-close>关闭</button>' +
      "</div>";

    var modal = $("#modal");
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var x = modal.querySelector(".modal-x");
    if (x) x.focus();
  }

  function closeModal() {
    var modal = $("#modal");
    if (modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function bindModal() {
    var modal = $("#modal");
    modal.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]") || e.target.classList.contains("modal-backdrop")) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (modal.hidden || e.key !== "Tab") return;
      var focusables = $$("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])", modal)
        .filter(function (n) { return n.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------------- theme ---------------- */

  function bindTheme() {
    var btn = $("#themeBtn");
    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("shortgen-theme", next); } catch (e) {}
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "light" ? "#f4f1ea" : "#07080c");
    });
  }

  /* ---------------- reveal + counters ---------------- */

  var observer = null;

  function observeReveals(root) {
    var nodes = $$(".reveal", root || document).filter(function (n) { return !n.classList.contains("in"); });
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }
    nodes.forEach(function (n) { observer.observe(n); });
  }

  function countUp() {
    var nodes = $$("[data-count]");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      nodes.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-count"));
        var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        el.textContent = decimals ? target.toFixed(decimals) : String(target);
      });
      return;
    }
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        var start = performance.now();
        var dur = 1100;

        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toString();
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = decimals ? target.toFixed(decimals) : Math.round(target).toString();
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------------- init ---------------- */

  function init() {
    renderPicks();
    updateCounts();
    renderGrid();
    renderCompare();
    renderScenes();
    renderFlow();
    renderInsights();
    renderSources();
    bindLibrary();
    bindCalc();
    bindModal();
    bindTheme();
    observeReveals(document);
    countUp();

    var openId = new URLSearchParams(location.search).get("open");
    if (openId && byId[openId]) setTimeout(function () { openModal(openId); }, 60);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
      if (e.key === "/" && $("#modal").hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault();
        var input = $("#heroSearch");
        input.focus();
        input.select();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
