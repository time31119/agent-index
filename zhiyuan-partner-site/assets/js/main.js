/*!
 * 智元科技 · 共建事业合伙人路演（招商演示版网站）
 * 纯静态实现：无构建、无外部依赖、可直接双击 index.html 运行。
 * 如需接入真实招商表单，只需填写下方 CONFIG.leadEndpoint。
 */
(function () {
  "use strict";

  var CONFIG = {
    /* 例：'https://api.your-domain.com/leads'。留空则仅保存在浏览器本地。 */
    leadEndpoint: "",
    storageKey: "zhiyuan_partner_leads_v1",
    maxLocalLeads: 50
  };

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ------------------------------------------------------------------
   * 1. 导航：滚动状态、进度条、当前章节、移动端菜单
   * ------------------------------------------------------------------ */
  var nav = $("#nav");
  var progress = $("#navProgress");
  var mobileMenu = $("#mobileMenu");
  var navToggle = $(".nav-toggle");
  var navLinks = $$(".nav-links a");
  var sections = $$("main section[id]");
  var latestY = window.pageYOffset;
  var ticking = false;

  function onScrollFrame() {
    var y = window.pageYOffset;
    latestY = y;

    if (nav) nav.classList.toggle("is-scrolled", y > 12);

    if (progress) {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? (y / docH) * 100 : 0;
      progress.style.width = Math.max(0, Math.min(100, pct)) + "%";
    }

    if (navLinks.length && sections.length) {
      var probe = y + window.innerHeight * 0.32;
      var currentId = "";
      sections.forEach(function (sec) {
        if (sec.offsetTop <= probe) currentId = sec.id;
      });
      navLinks.forEach(function (a) {
        var href = a.getAttribute("href") || "";
        a.classList.toggle("is-active", href === "#" + currentId);
      });
    }
    ticking = false;
  }

  function requestScrollFrame() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScrollFrame);
  }

  window.addEventListener("scroll", requestScrollFrame, { passive: true });
  window.addEventListener("resize", requestScrollFrame);
  onScrollFrame();

  if (navToggle && mobileMenu) {
    var setMenu = function (open) {
      mobileMenu.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    };
    navToggle.addEventListener("click", function () {
      setMenu(!mobileMenu.classList.contains("is-open"));
    });
    $$("a", mobileMenu).forEach(function (a) {
      a.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------
   * 1b. 移动端底部常驻 CTA（滚出首屏出现，进入报名区隐藏）
   * ------------------------------------------------------------------ */
  var mobileCta = document.getElementById("mobileCta");
  var applySection = document.getElementById("apply");

  if (mobileCta) {
    var heroSection = document.querySelector(".hero");
    var ctaTicking = false;
    var syncCta = function () {
      var passedHero = window.pageYOffset > (heroSection ? heroSection.offsetHeight * 0.7 : 500);
      var inApply = false;
      if (applySection) {
        var r = applySection.getBoundingClientRect();
        inApply = r.top < window.innerHeight * 0.85 && r.bottom > 0;
      }
      mobileCta.classList.toggle("is-on", passedHero && !inApply);
      ctaTicking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (ctaTicking) return;
        ctaTicking = true;
        window.requestAnimationFrame(syncCta);
      },
      { passive: true }
    );
    window.addEventListener("resize", syncCta);
    syncCta();
  }

  /* ------------------------------------------------------------------
   * 2. 进入视口时淡入
   * ------------------------------------------------------------------ */
  var revealEls = $$(".reveal");
  if (hasIO && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ------------------------------------------------------------------
   * 3. 数字滚动
   * ------------------------------------------------------------------ */
  function formatNumber(value, decimals) {
    var fixed = value.toFixed(decimals);
    if (decimals > 0) return fixed;
    return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var finish = function () {
      el.textContent = formatNumber(target, decimals);
    };
    if (reduceMotion) {
      finish();
      return;
    }
    /* 用定时器而非 rAF：后台标签页 / 截图环境也能保证数值最终落位 */
    var duration = 1400;
    var start = Date.now();
    var timer = window.setInterval(function () {
      var p = Math.min(1, (Date.now() - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNumber(target * eased, decimals);
      if (p >= 1) {
        window.clearInterval(timer);
        finish();
      }
    }, 40);
    window.setTimeout(function () {
      window.clearInterval(timer);
      finish();
    }, duration + 900);
    el.textContent = formatNumber(0, decimals);
  }

  var counters = $$(".num[data-count]");
  if (counters.length) {
    if (hasIO) {
      var co = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              co.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        co.observe(el);
      });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* 打印/导出 PDF 前，确保所有数字落在最终值上 */
  function settleCounters() {
    $$(".num[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (!isNaN(target)) el.textContent = formatNumber(target, decimals);
    });
  }

  window.addEventListener("beforeprint", settleCounters);

  /* ------------------------------------------------------------------
   * 4. 投资档位交互
   * ------------------------------------------------------------------ */
  var tierButtons = $$("[data-tiers] .tier");
  var tierDetail = $("#tierDetail");
  var tierSelect = $("#fTier");

  function selectTier(btn) {
    if (!btn) return;
    tierButtons.forEach(function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    var nameEl = $(".t-name", btn);
    var name = nameEl ? nameEl.textContent.trim() : btn.getAttribute("data-tier");
    var d = btn.dataset;
    if (tierDetail) {
      var set = function (key, val) {
        var node = $('[data-td="' + key + '"]', tierDetail);
        if (node && val !== undefined) node.textContent = val;
      };
      set("name", name);
      set("amount", d.amount + " · " + d.pct);
      set("year", d.year);
      set("month", d.month);
      set("note", d.note);
    }
    if (tierSelect) {
      var want = d.tier === "vip4" ? "VIP4 · 60 万" : "VIP" + d.tier.slice(3) + " · " + d.amount.replace(" 万元", " 万");
      $$("option", tierSelect).forEach(function (o) {
        if (o.value === want) tierSelect.value = want;
      });
    }
  }

  if (tierButtons.length) {
    tierButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectTier(btn);
      });
    });
    selectTier(tierButtons[0]);
  }

  /* 推广通道卡片：点击档位 → 选中表单档位并滚动到报名区 */
  var applyTierButtons = $$('[data-apply-tier]');
  if (applyTierButtons.length) {
    applyTierButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-apply-tier');
        if (tierSelect && value) {
          var matched = false;
          $$('option', tierSelect).forEach(function (o) {
            if (o.value === value) {
              tierSelect.value = value;
              matched = true;
            }
          });
          if (!matched) {
            $$('option', tierSelect).forEach(function (o) {
              if (!matched && o.value && value.indexOf(o.value) === 0) {
                tierSelect.value = o.value;
                matched = true;
              }
            });
          }
          setError(tierSelect, false);
        }
        var applyAnchor = document.getElementById('apply');
        if (applyAnchor) {
          applyAnchor.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
   * 5. 放映模式（16:9 路演 Deck）
   * ------------------------------------------------------------------ */
  var deck = $("#deck");
  var stage = $("#deckStage");
  var slides = $$(".deck-slide", deck || document);
  var countEl = $("#deckCount");
  var dotsWrap = $("#deckDots");
  var current = 0;
  var lastFocus = null;
  var deckOpen = false;
  var savedScroll = 0;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function fitStage() {
    if (!stage) return;
    var padX = window.innerWidth < 700 ? 12 : 72;
    var padY = window.innerWidth < 700 ? 90 : 130;
    var scale = Math.min(
      (window.innerWidth - padX) / 1280,
      (window.innerHeight - padY) / 720,
      1.45
    );
    stage.style.transform = "scale(" + Math.max(0.2, scale) + ")";
  }

  function renderDots() {
    if (!dotsWrap || dotsWrap.childElementCount === slides.length) return;
    dotsWrap.innerHTML = "";
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "第 " + (i + 1) + " 页");
      b.addEventListener("click", function () {
        showSlide(i);
      });
      dotsWrap.appendChild(b);
    });
  }

  function showSlide(index) {
    if (!slides.length) return;
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach(function (s, i) {
      s.classList.toggle("is-active", i === current);
    });
    if (countEl) countEl.textContent = pad(current + 1) + " / " + pad(slides.length);
    if (dotsWrap) {
      $$("button", dotsWrap).forEach(function (b, i) {
        b.classList.toggle("is-active", i === current);
      });
    }
  }

  function openDeck() {
    if (!deck) return;
    lastFocus = document.activeElement;
    savedScroll = window.pageYOffset;
    deckOpen = true;
    renderDots();
    deck.classList.add("is-open");
    deck.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    fitStage();
    showSlide(current);
    var closeBtn = $("#deckClose");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeDeck() {
    if (!deck || !deckOpen) return;
    deckOpen = false;
    deck.classList.remove("is-open");
    deck.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    window.scrollTo(0, savedScroll);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    }
  }

  $$("[data-deck-open]").forEach(function (btn) {
    btn.addEventListener("click", openDeck);
  });

  var closeBtn = $("#deckClose");
  var prevBtn = $("#deckPrev");
  var nextBtn = $("#deckNext");
  if (closeBtn) closeBtn.addEventListener("click", closeDeck);
  if (prevBtn) prevBtn.addEventListener("click", function () { showSlide(current - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { showSlide(current + 1); });

  document.addEventListener("keydown", function (e) {
    if (!deckOpen) return;
    if (e.key === "Escape") {
      closeDeck();
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      showSlide(current + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      showSlide(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      showSlide(0);
    } else if (e.key === "End") {
      e.preventDefault();
      showSlide(slides.length - 1);
    } else if (e.key === "f" || e.key === "F") {
      if (!document.fullscreenElement) {
        if (deck.requestFullscreen) deck.requestFullscreen().catch(function () {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
    }
  });

  window.addEventListener("resize", function () {
    if (deckOpen) fitStage();
  });

  /* 触屏左右滑动 */
  var touchX = null;
  if (deck) {
    deck.addEventListener("touchstart", function (e) {
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    deck.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 48) showSlide(current + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
   * 6. 表单：校验 + 本地留存 + 意向单
   * ------------------------------------------------------------------ */
  var form = $("#applyForm");
  var receipt = $("#applyReceipt");
  var receiptList = $("#rcList");
  var receiptDesc = $("#rcDesc");
  var lastLead = null;

  function fieldOf(input) {
    return input.closest ? input.closest(".field") : null;
  }

  function setError(input, on) {
    var wrap = fieldOf(input);
    if (wrap) wrap.classList.toggle("has-error", !!on);
  }

  function clearErrors() {
    $$(".field.has-error", form).forEach(function (f) {
      f.classList.remove("has-error");
    });
    var agreeErr = $("#agreeErr");
    if (agreeErr) agreeErr.style.display = "none";
  }

  function validPhone(v) {
    return /^1[3-9]\d{9}$/.test(String(v).replace(/\s|-/g, ""));
  }

  function makeId() {
    var d = new Date();
    var stamp = "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var tail = "";
    for (var i = 0; i < 4; i++) tail += chars.charAt(Math.floor(Math.random() * chars.length));
    return "ZY-" + stamp + "-" + tail;
  }

  function saveLead(lead) {
    try {
      var raw = window.localStorage.getItem(CONFIG.storageKey);
      var list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      list.unshift(lead);
      if (list.length > CONFIG.maxLocalLeads) list = list.slice(0, CONFIG.maxLocalLeads);
      window.localStorage.setItem(CONFIG.storageKey, JSON.stringify(list));
    } catch (err) {
      /* 隐私模式下 localStorage 可能不可用，静默降级 */
    }
  }

  function postLead(lead) {
    if (!CONFIG.leadEndpoint || !window.fetch) return;
    try {
      window.fetch(CONFIG.leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      }).catch(function () {});
    } catch (err) {}
  }

  function buildReceipt(lead) {
    if (!receiptList) return;
    var rows = [
      ["意向编号", lead.id],
      ["姓名 / 手机", lead.name + " · " + lead.phone],
      ["所在城市", lead.city || "未填写"],
      ["意向档位", lead.tier],
      ["每周投入", lead.time || "未填写"],
      ["相关经验", lead.background || "未填写"],
      ["提交时间", lead.at]
    ];
    receiptList.innerHTML = rows
      .map(function (r) {
        return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>";
      })
      .join("");
  }

  function leadToText(lead) {
    return [
      "【智元科技 · 共建事业合伙人意向单】",
      "意向编号：" + lead.id,
      "姓名：" + lead.name,
      "手机：" + lead.phone,
      "城市：" + (lead.city || "—"),
      "意向档位：" + lead.tier,
      "每周投入：" + (lead.time || "—"),
      "相关经验：" + (lead.background || "—"),
      "备注：" + (lead.note || "—"),
      "提交时间：" + lead.at
    ].join("\n");
  }

  function copyText(text, btn) {
    var done = function () {
      if (!btn) return;
      var old = btn.textContent;
      btn.textContent = "已复制";
      window.setTimeout(function () {
        btn.textContent = old;
      }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (err) {}
    }
  }

  if (form) {
    $$("input, select, textarea", form).forEach(function (input) {
      var evt = input.tagName === "SELECT" || input.type === "checkbox" ? "change" : "input";
      input.addEventListener(evt, function () {
        setError(input, false);
        if (input.id === "fAgree") {
          var agreeErr = $("#agreeErr");
          if (agreeErr) agreeErr.style.display = "none";
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      var name = $("#fName");
      var phone = $("#fPhone");
      var tier = $("#fTier");
      var agree = $("#fAgree");
      var firstBad = null;

      if (!name || !name.value.trim()) {
        setError(name, true);
        firstBad = firstBad || name;
      }
      if (!phone || !validPhone(phone.value)) {
        setError(phone, true);
        firstBad = firstBad || phone;
      }
      if (!tier || !tier.value) {
        setError(tier, true);
        firstBad = firstBad || tier;
      }
      if (agree && !agree.checked) {
        var agreeErr = $("#agreeErr");
        if (agreeErr) agreeErr.style.display = "block";
        firstBad = firstBad || agree;
      }

      if (firstBad) {
        if (firstBad.focus) firstBad.focus({ preventScroll: false });
        return;
      }

      var now = new Date();
      var lead = {
        id: makeId(),
        name: name.value.trim(),
        phone: phone.value.trim(),
        city: ($("#fCity") || {}).value ? $("#fCity").value.trim() : "",
        tier: tier.value,
        time: ($("#fTime") || {}).value || "",
        background: ($("#fBg") || {}).value || "",
        note: ($("#fNote") || {}).value ? $("#fNote").value.trim() : "",
        at:
          now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) +
          " " + pad(now.getHours()) + ":" + pad(now.getMinutes())
      };

      lastLead = lead;
      saveLead(lead);
      postLead(lead);
      buildReceipt(lead);

      if (receiptDesc) {
        receiptDesc.textContent =
          lead.name + "，你的意向已登记（编号 " + lead.id + "）。招商顾问会在 1 个工作日内通过 " +
          lead.phone + " 与你联系。";
      }
      form.style.display = "none";
      if (receipt) {
        receipt.classList.add("is-on");
        receipt.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
    });
  }

  var rcCopy = $("#rcCopy");
  if (rcCopy) {
    rcCopy.addEventListener("click", function () {
      if (lastLead) copyText(leadToText(lastLead), rcCopy);
    });
  }

  var rcAgain = $("#rcAgain");
  if (rcAgain) {
    rcAgain.addEventListener("click", function () {
      if (!form) return;
      form.reset();
      clearErrors();
      form.style.display = "";
      if (receipt) receipt.classList.remove("is-on");
      var nameInput = $("#fName");
      if (nameInput) nameInput.focus();
    });
  }

  /* ------------------------------------------------------------------
   * 7. 小工具：为无 JS 场景兜底
   * ------------------------------------------------------------------ */
  document.documentElement.classList.add("has-js");

  window.ZhiyuanSite = {
    openDeck: openDeck,
    closeDeck: closeDeck,
    goSlide: showSlide,
    selectTier: function (index) {
      selectTier(tierButtons[index]);
    }
  };
})();
