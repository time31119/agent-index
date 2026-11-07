(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header ---------- */

  var header = document.querySelector("[data-header]");
  var lastScroll = -1;

  function updateHeader() {
    var y = window.scrollY || window.pageYOffset;
    if (!header) return;
    if (y > 14 && lastScroll <= 14) header.classList.add("is-scrolled");
    if (y <= 14 && lastScroll > 14) header.classList.remove("is-scrolled");
    lastScroll = y;
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- mobile nav ---------- */

  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mainNav = document.querySelector("[data-nav]");

  function closeNav() {
    if (!menuToggle || !mainNav) return;
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "打开菜单");
    document.body.classList.remove("nav-open");
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      document.body.classList.toggle("nav-open", open);
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) closeNav();
    });
  }

  /* ---------- reveal ---------- */

  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ---------- card tilt ---------- */

  var scene = document.querySelector("[data-card-scene]");
  var cardTilt = scene ? scene.querySelector("[data-card-tilt]") : null;

  if (scene && cardTilt && !reduceMotion) {
    var tiltFrame = null;

    scene.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      if (tiltFrame) cancelAnimationFrame(tiltFrame);

      tiltFrame = requestAnimationFrame(function () {
        var rect = scene.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width;
        var py = (event.clientY - rect.top) / rect.height;
        var ry = (px - 0.5) * 10;
        var rx = (0.5 - py) * 8;

        scene.style.setProperty("--rx", rx.toFixed(2) + "deg");
        scene.style.setProperty("--ry", ry.toFixed(2) + "deg");
        scene.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        scene.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });
    });

    scene.addEventListener("pointerleave", function () {
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
      scene.style.setProperty("--rx", "0deg");
      scene.style.setProperty("--ry", "0deg");
    });

    scene.addEventListener("pointercancel", function () {
      scene.style.setProperty("--rx", "0deg");
      scene.style.setProperty("--ry", "0deg");
    });
  }

  /* ---------- card flip ---------- */

  var flipButton = document.querySelector("[data-card-flip]");

  if (scene && flipButton) {
    flipButton.addEventListener("click", function () {
      var flipped = scene.classList.toggle("is-flipped");
      flipButton.setAttribute("aria-pressed", flipped ? "true" : "false");
      var label = flipButton.querySelector("[data-flip-label]");
      if (label) label.textContent = flipped ? "回到正面" : "翻到背面";
    });
  }

  /* ---------- consent demo ---------- */

  var demoButtons = document.querySelectorAll("[data-consent-demo]");
  var consentKey = document.querySelector("[data-consent-key]");
  var einkStatus = document.querySelector("[data-eink-status]");
  var einkTime = document.querySelector("[data-eink-time]");
  var einkLine = document.querySelector("[data-eink-line]");
  var einkConsent = document.querySelector("[data-eink-consent]");

  var demoState = "idle";
  var demoTimer = null;
  var demoTick = null;
  var demoSeconds = 0;

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function formatTime(total) {
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    return pad(h) + ":" + pad(m) + ":" + pad(s);
  }

  function setDemoButtonText(text) {
    demoButtons.forEach(function (button) {
      var label = button.querySelector("[data-demo-label]");
      if (label) label.textContent = text;
      else button.textContent = text;
    });
  }

  function clearDemoTimers() {
    if (demoTimer) {
      clearTimeout(demoTimer);
      demoTimer = null;
    }
    if (demoTick) {
      clearInterval(demoTick);
      demoTick = null;
    }
  }

  function renderConsentDemo() {
    if (!scene || !einkStatus) return;

    scene.classList.remove("is-recording", "is-done");

    if (demoState === "idle") {
      einkStatus.textContent = "待机 · 未记录";
      einkTime.textContent = "00:00:00";
      einkLine.textContent = "轻触「共识键」，与对方一起开始。";
      einkConsent.textContent = "0/2";
      setDemoButtonText("模拟一次共识录音");
    } else if (demoState === "waiting") {
      einkStatus.textContent = "等待对方 · 1/2";
      einkTime.textContent = "00:00:00";
      einkLine.textContent = "你已确认。请对方轻触卡片。";
      einkConsent.textContent = "1/2";
      setDemoButtonText("等待对方轻触…");
    } else if (demoState === "recording") {
      scene.classList.add("is-recording");
      einkStatus.textContent = "记录中 · 双方已确认";
      einkTime.textContent = formatTime(demoSeconds);
      einkLine.textContent = "正在记录。卡面状态，所有人都看得见。";
      einkConsent.textContent = "2/2";
      setDemoButtonText("结束并生成回执");
    } else if (demoState === "done") {
      scene.classList.add("is-done");
      einkStatus.textContent = "回执已生成 · 本地";
      einkTime.textContent = formatTime(demoSeconds);
      einkLine.textContent = "3 个决定 · 2 个承诺 · 1 个下一步";
      einkConsent.textContent = "2/2";
      setDemoButtonText("再试一次");
    }
  }

  function startRecording() {
    clearDemoTimers();
    demoState = "recording";
    demoSeconds = 0;
    renderConsentDemo();
    demoTick = setInterval(function () {
      demoSeconds += 1;
      if (einkTime) einkTime.textContent = formatTime(demoSeconds);
    }, 1000);
  }

  function advanceConsentDemo() {
    if (demoState === "idle") {
      if (scene && scene.classList.contains("is-flipped")) {
        scene.classList.remove("is-flipped");
        if (flipButton) {
          flipButton.setAttribute("aria-pressed", "false");
          var flipLabel = flipButton.querySelector("[data-flip-label]");
          if (flipLabel) flipLabel.textContent = "翻到背面";
        }
      }
      demoState = "waiting";
      renderConsentDemo();
      demoTimer = setTimeout(startRecording, 1050);
    } else if (demoState === "waiting") {
      startRecording();
    } else if (demoState === "recording") {
      clearDemoTimers();
      demoState = "done";
      renderConsentDemo();
    } else {
      clearDemoTimers();
      demoState = "idle";
      demoSeconds = 0;
      renderConsentDemo();
    }
  }

  if (scene && einkStatus) {
    demoButtons.forEach(function (button) {
      button.addEventListener("click", advanceConsentDemo);
    });

    if (consentKey) {
      consentKey.addEventListener("click", advanceConsentDemo);
    }

    renderConsentDemo();
  }

  /* ---------- tabs ---------- */

  function setupTabs(tablist) {
    if (!tablist) return;
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    function activate(tab) {
      tabs.forEach(function (current) {
        var isActive = current === tab;
        current.setAttribute("aria-selected", isActive ? "true" : "false");
        current.tabIndex = isActive ? 0 : -1;
        var panel = document.getElementById(current.getAttribute("aria-controls"));
        if (panel) panel.hidden = !isActive;
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activate(tab);
      });

      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          next = tabs[(index + 1) % tabs.length];
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          next = tabs[(index - 1 + tabs.length) % tabs.length];
        } else if (event.key === "Home") {
          next = tabs[0];
        } else if (event.key === "End") {
          next = tabs[tabs.length - 1];
        }

        if (next) {
          event.preventDefault();
          activate(next);
          next.focus();
        }
      });
    });
  }

  document.querySelectorAll('[data-tabs="memory"]').forEach(setupTabs);
  document.querySelectorAll('[data-tabs="case"]').forEach(setupTabs);

  /* ---------- pricing toggle ---------- */

  var billingButtons = document.querySelectorAll("[data-billing]");
  var sidePrice = document.querySelector("[data-side-price]");
  var sidePeriod = document.querySelector("[data-side-period]");
  var sideNote = document.querySelector("[data-side-note]");

  var billing = {
    monthly: { price: "19", period: "/ 月", note: "随时取消。本地模式永久免费。" },
    yearly: { price: "168", period: "/ 年", note: "平均每月 ¥14。含 1 年记忆库 Plus。" }
  };

  billingButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var period = button.getAttribute("data-billing");
      var data = billing[period];
      if (!data) return;

      billingButtons.forEach(function (current) {
        current.setAttribute("aria-pressed", current === button ? "true" : "false");
      });

      if (sidePrice) sidePrice.textContent = data.price;
      if (sidePeriod) sidePeriod.textContent = data.period;
      if (sideNote) sideNote.textContent = data.note;
    });
  });

  /* ---------- toast ---------- */

  var toast = document.querySelector("[data-toast]");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-on");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-on");
    }, 2100);
  }

  /* ---------- copy colour ---------- */

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy");
      if (!text) return;

      function done() {
        showToast("已复制 " + text);
      }

      function fallback() {
        try {
          var input = document.createElement("textarea");
          input.value = text;
          input.setAttribute("readonly", "");
          input.style.position = "fixed";
          input.style.opacity = "0";
          document.body.appendChild(input);
          input.select();
          var ok = document.execCommand("copy");
          document.body.removeChild(input);
          if (ok) done();
          else showToast("请手动复制 " + text);
        } catch (error) {
          showToast("请手动复制 " + text);
        }
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  });

  /* ---------- waitlist ---------- */

  var waitlistForm = document.querySelector("[data-waitlist-form]");
  var waitlistSuccess = document.querySelector("[data-waitlist-success]");
  var waitlistError = document.querySelector("[data-waitlist-error]");
  var successNo = document.querySelector("[data-success-no]");
  var successName = document.querySelector("[data-success-name]");
  var storageKey = "moqi_waitlist_v1";

  function getEntries() {
    try {
      var raw = window.localStorage.getItem(storageKey);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveEntry(entry) {
    var entries = getEntries();
    entries.push(entry);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch (error) {
      /* localStorage may be unavailable; the demo still succeeds. */
    }
    return entries.length;
  }

  if (waitlistForm && waitlistSuccess) {
    waitlistForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var nameInput = waitlistForm.querySelector('[name="name"]');
      var emailInput = waitlistForm.querySelector('[name="email"]');
      var roleInput = waitlistForm.querySelector('[name="role"]');
      var noteInput = waitlistForm.querySelector('[name="note"]');
      var contactInput = waitlistForm.querySelector('[name="contact"]');
      var name = nameInput ? nameInput.value.trim() : "";
      var email = emailInput ? emailInput.value.trim() : "";
      var role = roleInput ? roleInput.value : "";
      var note = noteInput ? noteInput.value.trim() : "";

      if (waitlistError) {
        waitlistError.hidden = true;
        waitlistError.textContent = "";
      }

      if (!name) {
        if (waitlistError) {
          waitlistError.textContent = "请留下一个称呼，方便我们记得你。";
          waitlistError.hidden = false;
        }
        if (nameInput) nameInput.focus();
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (waitlistError) {
          waitlistError.textContent = "请填写一个有效的邮箱地址。";
          waitlistError.hidden = false;
        }
        if (emailInput) emailInput.focus();
        return;
      }

      if (contactInput && !contactInput.checked) {
        if (waitlistError) {
          waitlistError.textContent = "请先确认：我们可以在首批开放时通过邮件联系你。";
          waitlistError.hidden = false;
        }
        contactInput.focus();
        return;
      }

      var count = saveEntry({
        name: name,
        email: email,
        role: role,
        note: note,
        createdAt: new Date().toISOString()
      });

      var number = "MQ-" + String(Math.min(count, 500)).padStart(3, "0");
      if (successNo) successNo.textContent = "WAITLIST NO. " + number;
      if (successName) successName.textContent = name;

      waitlistForm.hidden = true;
      waitlistSuccess.hidden = false;

      var heading = waitlistSuccess.querySelector("h3");
      if (heading) heading.focus();
    });
  }

  /* ---------- footer year ---------- */

  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  /* ---------- expose small utilities for prototype pages ---------- */

  window.MOQI = {
    toast: showToast,
    reduceMotion: reduceMotion
  };
})();
