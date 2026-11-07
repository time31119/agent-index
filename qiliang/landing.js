/* =========================================================
   起量 QILIANG — public site interactions
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  let toastTimer = null;

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove("show"), 2600);
  }

  function openLogin() {
    const modal = $("#loginModal");
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => $("#phone")?.focus(), 80);
  }

  function closeLogin() {
    const modal = $("#loginModal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    const login = target.closest("[data-login]");
    if (login) {
      event.preventDefault();
      closeMobileNav();
      openLogin();
      return;
    }

    const close = target.closest("[data-close]");
    if (close) {
      closeLogin();
      return;
    }

    if (target.classList.contains("modal-backdrop")) {
      closeLogin();
    }
  });

  $$(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      $$(".faq-item").forEach((el) => el.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });

  function openMobileNav() {
    const panel = $("#mobilePanel");
    if (!panel) return;
    const isOpen = panel.classList.toggle("open");
    $("#mobileNav")?.setAttribute("aria-expanded", String(isOpen));
  }

  function closeMobileNav() {
    $("#mobilePanel")?.classList.remove("open");
    $("#mobileNav")?.setAttribute("aria-expanded", "false");
  }

  $("#mobileNav")?.addEventListener("click", openMobileNav);
  $$("#mobilePanel a").forEach((link) => link.addEventListener("click", closeMobileNav));

  $("#sendCode")?.addEventListener("click", () => {
    const phone = $("#phone")?.value.trim();
    if (!phone) {
      toast("先输入手机号");
      $("#phone")?.focus();
      return;
    }
    toast("演示环境：验证码已发送（任意 6 位可登录）");
  });

  function login() {
    const phone = $("#phone")?.value.trim();
    if (!phone) {
      toast("先输入手机号");
      $("#phone")?.focus();
      return;
    }
    closeLogin();
    toast("登录成功，正在进入工作台");
    window.setTimeout(() => {
      window.location.href = "app.html";
    }, 500);
  }

  $("#loginBtn")?.addEventListener("click", login);
  $("#code")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      login();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLogin();
      closeMobileNav();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#mobilePanel") && !event.target.closest("#mobileNav")) {
      closeMobileNav();
    }
  });

  // Header gets a slightly stronger border after scrolling.
  const header = $(".site-header");
  if (header) {
    const onScroll = () => {
      header.style.borderBottomColor = window.scrollY > 12
        ? "rgba(201, 191, 174, 0.9)"
        : "rgba(221, 213, 199, 0.7)";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
