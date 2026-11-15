/* =========================================================================
   枢元智联 NEXUS EDGE — 交互脚本（无依赖，file:// 直接可用）
   ========================================================================= */
(function () {
  "use strict";

  var D = window.NEXUS_DATA || { brand: {}, categories: [] };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- 导航 ---------------- */
  var nav = $(".nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = $(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    $$(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  /* 当前页高亮 */
  var path = location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a").forEach(function (a) {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });

  /* 年份 */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------------- 滚动显现 ---------------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- 数字滚动 ---------------- */
  function countUp(el, target, suffix) {
    if (reduced) { el.textContent = target + suffix; return; }
    var dur = 1100, start = null;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function observeCounters(scope) {
    var list = $$("[data-count]", scope || document);
    if (!list.length) return;
    if (!("IntersectionObserver" in window)) {
      list.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ""); });
      return;
    }
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        co.unobserve(el);
        countUp(el, parseFloat(el.dataset.count), el.dataset.suffix || "");
      });
    }, { threshold: 0.35 });
    list.forEach(function (el) { co.observe(el); });
  }

  /* ---------------- 统计（数据驱动） ---------------- */
  var cats = D.categories || [];
  var totalSlots = cats.reduce(function (n, c) {
    return n + c.slots.filter(function (s) { return !s.empty; }).length;
  }, 0);
  var openSlots = cats.reduce(function (n, c) {
    return n + c.slots.filter(function (s) { return s.empty; }).length;
  }, 0);

  var statBox = $("#stats");
  if (statBox) {
    var data = [
      { v: cats.length, s: "", l: "应用领域" },
      { v: totalSlots, s: "", l: "可交付产品位" },
      { v: openSlots, s: "", l: "开放产品位" },
      { v: 4, s: "周", l: "需求到样机" }
    ];
    statBox.innerHTML = data.map(function (d) {
      return '<div class="stat"><b data-count="' + d.v + '" data-suffix="' + d.s + '">0' + d.s + "</b><span>" + d.l + "</span></div>";
    }).join("");
    observeCounters(statBox);
  }

  /* ---------------- 状态样式映射 ---------------- */
  function matClass(m) {
    return { "量产级": "b-ok", "方案级": "b-dev", "在研": "b-plan", "规划级": "b-custom" }[m] || "b-plain";
  }
  function stClass(s) {
    return { "量产": "st-ok", "在研": "st-dev", "规划": "st-plan", "企划": "st-plan", "可定制": "st-custom" }[s] || "st-plan";
  }
  function esc(str) {
    return String(str).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------------- 首页：品类预览 ---------------- */
  var catGrid = $("#catGrid");
  if (catGrid) {
    catGrid.innerHTML = cats.map(function (c, i) {
      var open = c.slots.filter(function (s) { return s.empty; }).length;
      var pipe = (c.pipeline && c.pipeline.length) ? " · <b>" + c.pipeline.length + "</b> 个新品企划" : "";
      var cover = (c.pipeline && c.pipeline[0]) ? c.pipeline[0] : null;
      var thumb = cover
        ? '<div class="cc-thumb"><img src="assets/img/products/' + cover.code + '.webp" onerror="this.onerror=null;this.src=\'assets/img/products/' + cover.code + '.png\'" alt="' + c.name + " 代表产品" + '" loading="lazy" decoding="async" width="900" height="675"></div>'
        : "";
      return (
        '<a class="cat-card reveal" data-d="' + (i % 3) + '" href="applications.html#' + c.id + '">' +
          thumb +
          '<div class="cc-top"><span class="cc-no">' + c.no + "</span>" +
            '<span class="badge ' + matClass(c.maturity) + '">' + c.maturity + "</span></div>" +
          "<div><h3>" + c.name + "</h3><span class=\"cc-en\">" + c.en + "</span></div>" +
          "<p>" + c.tagline + "</p>" +
          '<div class="cc-foot"><span class="cc-open"><b>' + open + "</b> 个开放产品位" + pipe + "</span>" +
            '<span class="cc-arrow" aria-hidden="true">&#8250;</span></div>' +
        "</a>"
      );
    }).join("");
    if ("IntersectionObserver" in window) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io2.unobserve(e.target); }
        });
      }, { threshold: 0.04 });
      $$("#catGrid .reveal").forEach(function (el) { io2.observe(el); });
    } else {
      $$("#catGrid .reveal").forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* ---------------- 应用图谱页 ---------------- */
  var appList = $("#appList");
  if (appList) {
    appList.innerHTML = cats.map(function (c) {
      var pipeline = c.pipeline || [];
      var searchText = [c.name, c.en, c.summary, c.maturity]
        .concat(c.scenes, c.tech, c.chips)
        .concat(c.slots.map(function (s) { return (s.name || "") + " " + (s.note || ""); }))
        .concat(pipeline.map(function (p) { return p.name + " " + p.en + " " + p.pos + " " + p.gap; }))
        .join(" ").toLowerCase();

      var filled = c.slots.filter(function (s) { return !s.empty; });
      var openCount = c.slots.length - filled.length;

      var slots = filled.map(function (s) {
        return '<div class="slot">' +
          '<div class="slot-top"><span class="st ' + stClass(s.status) + '">' + s.status + "</span>" +
          '<span class="code">' + s.code + "</span></div>" +
          "<h5>" + s.name + "</h5><p>" + s.note + "</p></div>";
      }).join("");

      if (openCount > 0) {
        slots += '<a class="slot empty wide" href="about.html#contact">' +
          '<span class="plus" aria-hidden="true">+</span>' +
          "<b>" + openCount + " 个开放产品位</b>" +
          "<small>联合开发 · ODM · 联合品牌</small></a>";
      }

      var pipelineHtml = "";
      if (pipeline.length) {
        pipelineHtml =
          '<section class="pipeline">' +
            '<div class="pipe-head">' +
              '<div>' +
                '<span class="eyebrow" style="margin-bottom:10px"><i></i>PIPELINE · ' + pipeline.length + " CONCEPTS</span>" +
                "<h3>" + (c.pipelineTitle || "新品企划") + "</h3>" +
                "<p>" + (c.pipelineIntro || "") + "</p>" +
              "</div>" +
              '<span class="badge b-plan">企划中 · 未上市</span>' +
            "</div>" +
            '<div class="pipe-grid">' +
              pipeline.map(function (p) {
                return '<article class="pipe-card">' +
                  '<div class="pipe-thumb"><img src="assets/img/products/' + p.code + '.webp" onerror="this.onerror=null;this.src=\'assets/img/products/' + p.code + '.png\'" alt="' + p.name + ' 概念图" loading="lazy" decoding="async" width="900" height="675"></div>' +
                  '<div class="pipe-top"><span class="mono">' + p.code + "</span>" +
                    '<span class="st ' + stClass(p.status) + '">' + p.status + "</span></div>" +
                  "<h4>" + p.name + (p.en ? ' <span class="pipe-en">' + p.en + "</span>" : "") + "</h4>" +
                  '<p class="pipe-pos">' + p.pos + "</p>" +
                  '<div class="pipe-gap"><b>市场空白</b>' + p.gap + "</div>" +
                  '<div class="pipe-stack">' +
                    p.stack.map(function (s) { return '<span class="tag">' + s + "</span>"; }).join("") +
                  "</div>" +
                  '<div class="pipe-meta"><span>' + p.form + "</span><span>" + p.price + "</span><span>" + p.timing + "</span>" +
                    (p.detail ? '<a class="pipe-link" href="' + p.detail + '">完整定义 →</a>' : "") +
                  "</div>" +
                "</article>";
              }).join("") +
            "</div>" +
            (c.pipelineNote ? '<p class="pipe-note">* ' + c.pipelineNote + "</p>" : "") +
          "</section>";
      }

      return (
        '<article class="cat" id="' + c.id + '" data-mat="' + c.maturity +
          '" data-chips="' + c.chips.join("|") + '" data-search="' + esc(searchText) + '">' +
          '<div class="cat-head">' +
            '<div class="cat-no">' + c.no + "</div>" +
            '<div class="cat-title"><h2>' + c.name + "</h2><span>" + c.en + "</span></div>" +
            '<span class="badge ' + matClass(c.maturity) + '">' + c.maturity + "</span>" +
          "</div>" +
          '<p class="cat-sum">' + c.summary + "</p>" +
          '<div class="cat-cols">' +
            '<div class="cat-col"><h4>典型场景</h4><div class="cat-tags">' +
              c.scenes.map(function (s) { return '<span class="tag">' + s + "</span>"; }).join("") +
            "</div></div>" +
            '<div class="cat-col"><h4>技术要点</h4><div class="cat-tags">' +
              c.tech.map(function (s) { return '<span class="tag tag-line">' + s + "</span>"; }).join("") +
            "</div></div>" +
            '<div class="cat-col"><h4>推荐平台</h4><div class="chip-set">' +
              c.chips.map(function (s) { return '<span class="tag">' + s + "</span>"; }).join("") +
            "</div></div>" +
          "</div>" +
          '<div class="slots">' + slots + "</div>" +
          pipelineHtml +
        "</article>"
      );
    }).join("");

    /* 筛选 */
    var state = { mat: "全部", chip: "全部", q: "" };
    var countEl = $("#resultCount");

    function apply() {
      var shown = 0, slotSeen = 0;
      $$(".cat", appList).forEach(function (el) {
        var okMat = state.mat === "全部" || el.dataset.mat === state.mat;
        var okChip = state.chip === "全部" || el.dataset.chips.indexOf(state.chip) > -1;
        var okQ = !state.q || el.dataset.search.indexOf(state.q) > -1;
        var ok = okMat && okChip && okQ;
        el.hidden = !ok;
        if (ok) { shown++; slotSeen += el.querySelectorAll(".slot:not(.empty)").length; }
      });
      if (countEl) {
        countEl.innerHTML = "显示 <b>" + shown + "</b> / " + cats.length + " 个领域 · <b>" + slotSeen + "</b> 个产品位";
      }
    }

    $$("[data-filter-mat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.mat = btn.dataset.filterMat;
        $$("[data-filter-mat]").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        apply();
      });
    });
    $$("[data-filter-chip]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.chip = btn.dataset.filterChip;
        $$("[data-filter-chip]").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        apply();
      });
    });
    var searchInput = $("#appSearch");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.q = searchInput.value.trim().toLowerCase();
        apply();
      });
    }
    apply();

    /* 锚点定位 */
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "start" }); }, 120);
    }
  }

  /* ---------------- 联系表单（静态：唤起邮件客户端） ---------------- */
  var form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var lines = [
        "姓名：" + (data.get("name") || ""),
        "公司：" + (data.get("company") || ""),
        "邮箱：" + (data.get("email") || ""),
        "合作类型：" + (data.get("type") || ""),
        "目标品类：" + (data.get("category") || ""),
        "",
        "需求描述：",
        (data.get("message") || "")
      ];
      var subject = "官网咨询 · " + (data.get("type") || "合作") + " · " + (data.get("name") || "");
      var href = "mailto:" + (D.brand.email || "hello@nexusedge.cn") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      var ok = $("#formOk");
      if (ok) {
        ok.classList.add("show");
        ok.textContent = "已生成邮件草稿 —— 若浏览器未自动打开邮箱，请直接发送至 " + (D.brand.email || "hello@nexusedge.cn");
      }
      window.location.href = href;
    });
  }

  /* ---------------- 首屏网络节点动画 ---------------- */
  var canvas = document.getElementById("net");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var pts = [], W = 0, H = 0, raf = null;

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(64, Math.max(22, Math.round((W * H) / 22000)));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.24,
          vy: (Math.random() - 0.5) * 0.24,
          r: Math.random() * 1.5 + 0.7
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!reduced) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 16900) {
            var a = 0.14 * (1 - Math.sqrt(d2) / 130);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(120,190,220," + a.toFixed(3) + ")";
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = "rgba(150,210,230,0.6)";
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    }

    size();
    frame();
    window.addEventListener("resize", function () {
      size();
      if (reduced) frame();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
      else if (!raf && !reduced) frame();
    });
  }

  /* ---------------- 页脚品牌信息填充 ---------------- */
  $$("[data-brand-email]").forEach(function (el) { el.textContent = D.brand.email || ""; });
  $$("[data-brand-phone]").forEach(function (el) { el.textContent = D.brand.phone || ""; });
})();
