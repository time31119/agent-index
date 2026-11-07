/* TRACE marketing site interactions */
(function () {
  "use strict";

  var $ = function (selector, scope) {
    return (scope || document).querySelector(selector);
  };
  var $$ = function (selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  };

  /* ---------------------------------------------------------------- clock */
  var clock = $("#clock");
  var timeFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  function tickClock() {
    if (!clock) return;
    clock.textContent = timeFormatter.format(new Date());
  }
  tickClock();
  window.setInterval(tickClock, 1000);

  /* --------------------------------------------------------------- header */
  var header = $(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ----------------------------------------------------------- mobile nav */
  var menuToggle = $(".menu-toggle");
  var navLinks = $("#siteMenu");

  function closeMenu() {
    if (!menuToggle || !navLinks) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "打开菜单");
    navLinks.classList.remove("open");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      var open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
      menuToggle.setAttribute("aria-label", open ? "打开菜单" : "关闭菜单");
      navLinks.classList.toggle("open", !open);
    });

    $$("a", navLinks).forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
      if (!navLinks.classList.contains("open")) return;
      if (navLinks.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* --------------------------------------------------------- scroll reveal */
  var revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("in");
    });
  }

  /* --------------------------------------------------------- toast helper */
  var toast = $("#toast");
  var toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 3600);
  }

  /* --------------------------------------------------------- risk preview */
  var risk = {
    capital: 12500,
    traderEquity: 250000,
    delta: 1.2,
    price: 68420,
    fixedNotional: 3000,
    mode: "ratio"
  };

  var slipRange = $("#slipRange");
  var levRange = $("#levRange");
  var lossRange = $("#lossRange");
  var outSlip = $("#outSlip");
  var outRatio = $("#outRatio");
  var outQty = $("#outQty");
  var outNotional = $("#outNotional");
  var outLimit = $("#outLimit");
  var outMargin = $("#outMargin");
  var outDaily = $("#outDaily");
  var slipValue = $("#slipValue");
  var levValue = $("#levValue");
  var lossValue = $("#lossValue");

  function money(value, decimals) {
    return "$" + value.toLocaleString("en-US", {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0
    });
  }

  function setFill(input) {
    if (!input) return;
    var min = parseFloat(input.min);
    var max = parseFloat(input.max);
    var value = parseFloat(input.value);
    var pct = ((value - min) / (max - min)) * 100;
    input.style.setProperty("--fill", pct + "%");
  }

  function updateRisk() {
    if (!slipRange || !levRange || !lossRange) return;

    var slip = parseFloat(slipRange.value);
    var lev = parseFloat(levRange.value);
    var loss = parseFloat(lossRange.value);

    var qty;
    var notional;
    var ratioText;

    if (risk.mode === "fixed") {
      notional = risk.fixedNotional;
      qty = notional / risk.price;
      ratioText = "定额 " + money(risk.fixedNotional);
    } else {
      var ratio = risk.capital / risk.traderEquity;
      qty = risk.delta * ratio;
      notional = qty * risk.price;
      ratioText = (ratio * 100).toFixed(2) + "%";
    }

    var limit = risk.price * (1 + slip / 100);
    var margin = notional / lev;
    var daily = risk.capital * (loss / 100);

    if (outRatio) outRatio.textContent = ratioText;
    if (outQty) outQty.textContent = qty.toFixed(4) + " BTC";
    if (outNotional) outNotional.textContent = money(notional);
    if (outLimit) outLimit.textContent = money(limit, 2);
    if (outMargin) outMargin.textContent = money(margin);
    if (outDaily) outDaily.textContent = money(daily);
    if (outSlip) outSlip.textContent = slip.toFixed(2) + "%";
    if (slipValue) slipValue.textContent = slip.toFixed(2) + "%";
    if (levValue) levValue.textContent = lev.toFixed(1) + "x";
    if (lossValue) lossValue.textContent = loss.toFixed(0) + "%";

    [slipRange, levRange, lossRange].forEach(setFill);
  }

  if (slipRange && levRange && lossRange) {
    [slipRange, levRange, lossRange].forEach(function (input) {
      input.addEventListener("input", updateRisk);
    });

    $$("[data-mode]").forEach(function (button) {
      button.addEventListener("click", function () {
        risk.mode = button.getAttribute("data-mode");
        $$("[data-mode]").forEach(function (item) {
          item.setAttribute("aria-pressed", String(item === button));
        });
        updateRisk();
      });
    });

    updateRisk();
  }

  /* ------------------------------------------------------ profit sharing */
  var profitDays = {
    "1": {
      equity: 1200,
      hwm: 1200,
      fee: 20,
      note: "第 1 天：账户从 $1,000 升至 $1,200，新增盈利 $200，按 10% 收取 $20。高水位更新为 $1,200。"
    },
    "2": {
      equity: 900,
      hwm: 1200,
      fee: 0,
      note: "第 2 天：账户回撤至 $900，低于已分润的 $1,200 高水位，不产生任何分润。已收取的 $20 不退还，也不重复计费。"
    },
    "3": {
      equity: 1300,
      hwm: 1300,
      fee: 10,
      note: "第 3 天：账户回升至 $1,300，相对已分润的 $1,200 高出 $100，仅对新增部分收取 10% = $10。高水位更新为 $1,300。"
    }
  };

  var profitEquity = $("#profitEquity");
  var profitHwm = $("#profitHwm");
  var profitFee = $("#profitFee");
  var profitNote = $("#profitNote");

  function updateProfit(day) {
    var data = profitDays[day];
    if (!data) return;

    if (profitEquity) profitEquity.textContent = money(data.equity, 2);
    if (profitHwm) profitHwm.textContent = money(data.hwm, 2);
    if (profitFee) {
      profitFee.textContent = money(data.fee, 2);
      profitFee.style.color = data.fee > 0 ? "var(--lime)" : "var(--faint)";
    }
    if (profitNote) profitNote.textContent = data.note;

    $$("[data-day]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-day") === day));
    });

    $$("[data-chart-day]").forEach(function (point) {
      point.classList.toggle("active", point.getAttribute("data-chart-day") === day);
    });
  }

  $$("[data-day]").forEach(function (button) {
    button.addEventListener("click", function () {
      updateProfit(button.getAttribute("data-day"));
    });
  });

  if (profitEquity) updateProfit("1");

  /* ---------------------------------------------------------------- modal */
  var modal = $("#seedModal");
  var closeModalButton = modal ? $("[data-close-modal]", modal) : null;
  var seedForm = $("#seedForm");
  var seedSuccess = $("#seedSuccess");
  var lastFocused = null;

  function resetModal() {
    if (!seedForm || !seedSuccess) return;
    seedForm.reset();
    seedForm.style.display = "";
    seedSuccess.classList.remove("show");
    var heading = $("h3", seedSuccess);
    var copy = $("p", seedSuccess);
    var mark = $("#successMark");
    if (heading) heading.textContent = "已记录（演示）";
    if (copy) copy.textContent = "这是一次前端演示提交，没有数据离开你的浏览器。正式种子招募会通过已验证邮箱发送 KYC 与适当性评估入口。";
    if (mark) {
      mark.textContent = "✓";
      mark.style.color = "";
      mark.style.borderColor = "";
    }
  }

  function openModal(event) {
    if (!modal) return;
    if (event) event.preventDefault();
    closeMenu();
    resetModal();
    var role = event && event.currentTarget ? event.currentTarget.getAttribute("data-seed-role") : null;
    if (role) {
      var roleSelect = $("#seedRole");
      if (roleSelect) roleSelect.value = role;
    }
    lastFocused = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    window.setTimeout(function () {
      var target = closeModalButton || $(".modal-panel", modal);
      if (target) target.focus();
    }, 80);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  $$("[data-open-seed]").forEach(function (button) {
    button.addEventListener("click", openModal);
  });

  if (closeModalButton) closeModalButton.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (!modal || !modal.classList.contains("open")) return;
    if (event.key === "Escape") closeModal();

    if (event.key === "Tab") {
      var focusables = $$("button, [href], input, select, textarea", modal).filter(function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  if (seedForm) {
    seedForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = $("#seedName");
      var email = $("#seedEmail");
      var region = $("#seedRegion");

      if (!name || !name.value.trim()) {
        showToast("请填写称呼。");
        if (name) name.focus();
        return;
      }
      if (!email || !email.value.trim() || email.value.indexOf("@") === -1) {
        showToast("请填写有效邮箱。");
        if (email) email.focus();
        return;
      }
      if (!region || !region.value) {
        showToast("请选择居住地，用于地域校验。");
        if (region) region.focus();
        return;
      }

      var heading = seedSuccess ? $("h3", seedSuccess) : null;
      var copy = seedSuccess ? $("p", seedSuccess) : null;
      var mark = $("#successMark");
      var isRestricted = region.value === "restricted";

      if (isRestricted) {
        if (heading) heading.textContent = "当前地区暂不开放";
        if (copy) copy.textContent = "根据初期地域策略，美国、加拿大、英国、中国大陆及香港零售用户暂不能进入。若你属于香港专业投资者，请通过正式渠道提交资质，由人工单独审核。";
        if (mark) {
          mark.textContent = "!";
          mark.style.color = "var(--orange)";
          mark.style.borderColor = "rgba(255, 120, 82, 0.55)";
        }
      } else {
        if (heading) heading.textContent = "已记录（演示）";
        if (copy) copy.textContent = "这是一次前端演示提交，没有数据离开你的浏览器。正式种子招募会通过已验证邮箱发送 KYC 与适当性评估入口。";
        if (mark) {
          mark.textContent = "✓";
          mark.style.color = "";
          mark.style.borderColor = "";
        }
      }

      seedForm.style.display = "none";
      if (seedSuccess) seedSuccess.classList.add("show");
      showToast(isRestricted ? "该地区暂不开放，演示记录未提交。" : "演示预约已记录，未发送任何数据。");
    });
  }

  /* -------------------------------------------------- profile seed CTA nav */
  try {
    if (new URLSearchParams(window.location.search).get("intent") === "seed") {
      window.setTimeout(function () {
        openModal();
      }, 320);
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname + window.location.hash);
        }
      } catch (historyError) {
        /* file:// may block replaceState; the modal still opens. */
      }
    }
  } catch (error) {
    /* URLSearchParams is not available: the normal CTA still works. */
  }

  $$('a[href="#"]').forEach(function (link) {
    if (!link.hasAttribute("data-open-seed")) return;
    link.addEventListener("click", function (event) {
      event.preventDefault();
    });
  });
})();
