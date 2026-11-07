/* ==========================================================================
   天枢云 · 站点交互
   ========================================================================== */
(function () {
  "use strict";

  var API = window.TIANSHU_API || {};
  var MODELS = window.TIANSHU_MODELS || [];
  var TYPE_LABEL = { text: "文本", image: "图像", video: "视频" };

  /* ---------- Header ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var nav = document.getElementById("site-nav");
  var navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      var ro = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              ro.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );
      reveals.forEach(function (el) {
        ro.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  /* ---------- Copy helper ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function flashLabel(el, text) {
    if (!el.getAttribute("data-original-html")) {
      el.setAttribute("data-original-html", el.innerHTML);
    }
    el.textContent = text;
    window.setTimeout(function () {
      el.innerHTML = el.getAttribute("data-original-html");
    }, 1600);
  }

  document.addEventListener("click", function (e) {
    var copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) {
      e.preventDefault();
      copyText(copyBtn.getAttribute("data-copy"))
        .then(function () {
          flashLabel(copyBtn, "已复制");
        })
        .catch(function () {
          flashLabel(copyBtn, "复制失败");
        });
    }
  });

  /* ---------- Code tabs ---------- */
  document.querySelectorAll(".code-card").forEach(function (card) {
    var tabs = card.querySelectorAll("[data-tab]");
    var panels = card.querySelectorAll("[data-panel]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.toggle("is-active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        panels.forEach(function (p) {
          p.classList.toggle("is-active", p.getAttribute("data-panel") === tab.getAttribute("data-tab"));
        });
      });
    });

    var copy = card.querySelector("[data-copy-code]");
    if (copy) {
      copy.addEventListener("click", function () {
        var active = card.querySelector(".code-panel.is-active") || card.querySelector(".code-panel");
        if (!active) return;
        copyText(active.innerText)
          .then(function () {
            flashLabel(copy, "已复制");
          })
          .catch(function () {
            flashLabel(copy, "复制失败");
          });
      });
    }
  });

  /* ---------- Model cards ---------- */
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function priceBlock(m) {
    if (m.inPrice) {
      return (
        '<div class="p-in"><small>输入 · 百万 tokens</small><b>¥' +
        escapeHTML(m.inPrice) +
        "</b></div>" +
        '<div class="p-out"><small>输出 · 百万 tokens</small><b>¥' +
        escapeHTML(m.outPrice) +
        "</b></div>"
      );
    }
    return (
      '<div class="p-in"><small>计费方式</small><b>' +
      escapeHTML(m.priceText || "按量计费") +
      "</b></div>" +
      '<div class="p-out"><small>单价</small><b>控制台实时</b></div>'
    );
  }

  function cardHTML(m) {
    var tags = (m.tags || [])
      .map(function (t) {
        return '<span class="tag">' + escapeHTML(t) + "</span>";
      })
      .join("");

    return (
      '<article class="model-card">' +
      '<div class="model-head">' +
      '<span class="model-avatar" aria-hidden="true">' +
      escapeHTML(m.mark || m.vendor.slice(0, 1)) +
      "</span>" +
      "<div>" +
      '<h3 class="model-name">' +
      escapeHTML(m.name) +
      "</h3>" +
      '<p class="model-vendor">' +
      escapeHTML(m.vendor) +
      " · " +
      TYPE_LABEL[m.type] +
      "</p>" +
      "</div>" +
      "</div>" +
      '<div class="model-tags">' +
      tags +
      "</div>" +
      '<p class="model-desc">' +
      escapeHTML(m.desc || "") +
      "</p>" +
      '<div class="model-price">' +
      priceBlock(m) +
      "</div>" +
      '<div class="model-cta">' +
      '<code class="mono">' +
      escapeHTML(m.id) +
      "</code>" +
      '<button type="button" class="copy-mini" data-copy="' +
      escapeHTML(m.id) +
      '">复制模型名</button>' +
      "</div>" +
      "</article>"
    );
  }

  var featuredGrid = document.getElementById("featured-grid");
  if (featuredGrid) {
    var featured = MODELS.filter(function (m) {
      return m.hot;
    }).slice(0, 6);
    featuredGrid.innerHTML = featured.map(cardHTML).join("");
  }

  var catalog = document.getElementById("model-grid");
  if (catalog) {
    var searchInput = document.getElementById("model-search");
    var countEl = document.getElementById("model-count");
    var pills = document.querySelectorAll("[data-filter]");
    var activeType = "all";
    var keyword = "";

    var matches = function (m) {
      if (activeType !== "all" && m.type !== activeType) return false;
      if (!keyword) return true;
      var haystack = [m.name, m.vendor, m.id]
        .concat(m.tags || [])
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(keyword) !== -1;
    };

    var renderCatalog = function () {
      var list = MODELS.filter(matches);
      catalog.innerHTML = list.length
        ? list.map(cardHTML).join("")
        : '<div class="empty-state">没有匹配的模型，试试其他关键词，或直接前往控制台查看完整模型列表。</div>';
      if (countEl) {
        countEl.textContent = "共 " + list.length + " 个模型";
      }
    };

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) {
          p.classList.toggle("is-active", p === pill);
        });
        activeType = pill.getAttribute("data-filter");
        renderCatalog();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        keyword = searchInput.value.trim().toLowerCase();
        renderCatalog();
      });
    }

    renderCatalog();
  }

  /* ---------- Docs scrollspy ---------- */
  var docsNav = document.querySelector(".docs-nav");
  if (docsNav) {
    var links = Array.prototype.slice.call(docsNav.querySelectorAll("a[href^='#']"));
    var sections = links
      .map(function (a) {
        return document.getElementById(a.getAttribute("href").slice(1));
      })
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            links.forEach(function (a) {
              a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
            });
          });
        },
        { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
      );
      sections.forEach(function (s) {
        spy.observe(s);
      });
    }
  }

  /* ---------- Partner commission calculator ---------- */
  var calcRange = document.getElementById("calc-range");
  if (calcRange) {
    var calcInput = document.getElementById("calc-input");
    var tierEl = document.getElementById("calc-tier");
    var rateEl = document.getElementById("calc-rate");
    var monthEl = document.getElementById("calc-month");
    var yearEl = document.getElementById("calc-year");
    var hintEl = document.getElementById("calc-hint");
    var CALC_MAX = 200000;
    var CALC_TIERS = [
      { min: 0, name: "推广伙伴", rate: 0.1 },
      { min: 3000, name: "认证代理", rate: 0.15 },
      { min: 20000, name: "金牌代理", rate: 0.2 },
      { min: 80000, name: "城市 / 行业代理", rate: 0.25 }
    ];
    var calcFmt = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });

    var tierFor = function (value) {
      var tier = CALC_TIERS[0];
      for (var i = 0; i < CALC_TIERS.length; i++) {
        if (value >= CALC_TIERS[i].min) tier = CALC_TIERS[i];
      }
      return tier;
    };

    var renderCalc = function (value) {
      var v = Math.max(0, Math.min(CALC_MAX, Number(value) || 0));
      var tier = tierFor(v);
      var monthly = Math.round(v * tier.rate);
      tierEl.textContent = tier.name;
      rateEl.textContent = Math.round(tier.rate * 100) + "%";
      monthEl.textContent = "¥" + calcFmt.format(monthly);
      yearEl.textContent = "¥" + calcFmt.format(monthly * 12);

      var index = CALC_TIERS.indexOf(tier);
      if (index < CALC_TIERS.length - 1) {
        var next = CALC_TIERS[index + 1];
        hintEl.textContent = "再增长 ¥" + calcFmt.format(next.min - v) + " 可升级为「" + next.name + "」";
      } else {
        hintEl.textContent = "已达最高等级，可洽谈区域独家与年度返点";
      }
    };

    calcRange.addEventListener("input", function () {
      calcInput.value = calcRange.value;
      renderCalc(calcRange.value);
    });

    calcInput.addEventListener("input", function () {
      var v = Math.max(0, Math.min(CALC_MAX, Number(calcInput.value) || 0));
      calcRange.value = v;
      renderCalc(v);
    });

    calcInput.addEventListener("blur", function () {
      var v = Math.max(0, Math.min(CALC_MAX, Number(calcInput.value) || 0));
      calcInput.value = v;
      renderCalc(v);
    });

    renderCalc(calcInput.value);
  }

  /* ---------- Outbound links ---------- */
  document.querySelectorAll("[data-outbound]").forEach(function (a) {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });

  window.__TS_OK = true;
})();
