/* =========================================================
   LUMEN — interactions
   A self-contained concept site. No external dependencies.
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = reducedMotion ? "auto" : "smooth";

  /* ---------------------------------------------------------
     Utilities
     --------------------------------------------------------- */

  const toast = $("#toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2800);
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function truncate(value, length = 52) {
    const text = String(value).trim().replace(/\s+/g, " ");
    return text.length > length ? `${text.slice(0, length)}…` : text;
  }

  function lockBody(locked) {
    document.body.classList.toggle("is-locked", locked);
  }

  function scrollToElement(element, offset = 82) {
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: scrollBehavior });
  }

  /* ---------------------------------------------------------
     Header, progress, mobile navigation
     --------------------------------------------------------- */

  const header = $("[data-header]");
  const progressBar = $("#pageProgress");
  let scrollTicking = false;

  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;

    if (header) header.classList.toggle("is-scrolled", scrollTop > 24);
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollUI);
    },
    { passive: true }
  );
  updateScrollUI();

  const navToggle = $(".nav-toggle");
  const mainNav = $("#mainNav");

  function closeMenu() {
    if (!mainNav || !navToggle) return;
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开菜单");
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
    });

    $$("a", mainNav).forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("click", (event) => {
      if (!mainNav.classList.contains("is-open")) return;
      if (mainNav.contains(event.target) || navToggle.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  /* ---------------------------------------------------------
     Reveal-in-view
     --------------------------------------------------------- */

  const revealElements = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => element.classList.add("is-inview"));
  }

  /* ---------------------------------------------------------
     Muse rail — pointer glow + prompt launch
     --------------------------------------------------------- */

  $$(".muse").forEach((muse) => {
    muse.addEventListener("pointermove", (event) => {
      const rect = muse.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      muse.style.setProperty("--mx", `${x}%`);
      muse.style.setProperty("--my", `${y}%`);
    });
  });

  /* ---------------------------------------------------------
     Hero / CTA prompt composers
     --------------------------------------------------------- */

  const heroForm = $("#heroForm");
  const heroPrompt = $("#heroPrompt");
  const ctaForm = $("#ctaForm");
  const ctaPrompt = $("#ctaPrompt");
  const studioPrompt = $("#studioPrompt");
  const studioShell = $("[data-studio]");

  function launchPrompt(prompt, options = {}) {
    const text = String(prompt || "").trim();
    if (!text) {
      showToast("先给 Lumen 一个方向，哪怕只有三个词。");
      if (options.focus !== false && heroPrompt) heroPrompt.focus();
      return;
    }

    if (heroPrompt) heroPrompt.value = text;
    if (ctaPrompt) ctaPrompt.value = text;
    if (studioPrompt) {
      studioPrompt.value = text;
      studioPrompt.style.height = "28px";
    }

    scrollToElement($("#studio"), 72);

    if (options.run !== false) {
      window.setTimeout(() => runStudioDemo(text), reducedMotion ? 60 : 620);
    } else {
      showToast("方向已放入工作台，继续和 Lumen 聊聊。");
    }
  }

  if (heroForm) {
    heroForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = heroPrompt.value.trim();
      if (!value) {
        heroPrompt.focus();
        showToast("描述一个项目，Lumen 就能开始。");
        return;
      }
      launchPrompt(value);
    });
  }

  if (ctaForm) {
    ctaForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = ctaPrompt.value.trim();
      if (!value) {
        ctaPrompt.focus();
        showToast("没有想法也可以——试试“帮我做个大胆的”。");
        return;
      }
      launchPrompt(value);
    });
  }

  $$("[data-prompt]").forEach((button) => {
    if (button.classList.contains("work-card")) return;
    button.addEventListener("click", () => {
      launchPrompt(button.dataset.prompt || "");
    });
  });

  $$("[data-start]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToElement($("#studio"), 72);
      window.setTimeout(() => {
        if (window.innerWidth > 760 && studioPrompt) {
          studioPrompt.focus({ preventScroll: true });
        }
      }, reducedMotion ? 30 : 520);
    });
  });

  /* ---------------------------------------------------------
     ChatCanvas demo
     --------------------------------------------------------- */

  const chatLog = $("#chatLog");
  const studioForm = $("#studioForm");
  const chatSend = $(".chat-send");
  let isBusy = false;

  const variantDetails = {
    sun: { label: "黄金时刻", accent: "#bf5524" },
    tide: { label: "潮汐秩序", accent: "#1f6f5c" },
    noir: { label: "夜行材质", accent: "#d6ff58" },
    blush: { label: "柔光粉体", accent: "#bd3c57" },
  };

  function inferVariant(text) {
    const value = text.toLowerCase();
    if (/(黑|夜|暗|金属|未来|摇滚|地下|noir|black|metal|night)/.test(value)) return "noir";
    if (/(茶|森林|植物|绿|自然|东方|海|蓝|木|mori|tea|green|forest|ocean)/.test(value)) return "tide";
    if (/(粉|彩妆|女性|柔|浪漫|花|blush|pink|beauty|flower)/.test(value)) return "blush";
    return "sun";
  }

  function appendUserMessage(text) {
    if (!chatLog) return null;
    const element = document.createElement("div");
    element.className = "msg msg--user";
    element.innerHTML = '<span class="msg-author">YOU</span><p></p>';
    $("p", element).textContent = text;
    chatLog.append(element);
    scrollChat();
    return element;
  }

  function appendTypingMessage() {
    if (!chatLog) return null;
    const element = document.createElement("div");
    element.className = "msg msg--agent";
    element.innerHTML =
      '<span class="msg-author">LUMEN · THINKING</span><p><span class="typing" aria-label="Lumen 正在思考"><i></i><i></i><i></i></span></p>';
    chatLog.append(element);
    scrollChat();
    return element;
  }

  function appendPlanMessage(text, variant) {
    if (!chatLog) return null;
    const element = document.createElement("div");
    element.className = "msg msg--agent msg--plan";
    element.innerHTML = `
      <span class="msg-author">LUMEN · DIRECTION</span>
      <p></p>
      <ol class="agent-plan">
        <li><span>01</span>建立品牌语法<i>done</i></li>
        <li><span>02</span>锁定色彩与材质<i>done</i></li>
        <li><span>03</span>展开应用资产<i>running</i></li>
      </ol>
    `;
    const body = $("p", element);
    const lead = document.createTextNode("收到。我会先把 ");
    const quote = document.createElement("strong");
    quote.textContent = `“${truncate(text, 30)}”`;
    const tail = document.createTextNode(
      ` 翻译成可执行的视觉规则，再把它们收束成一套 ${variantDetails[variant].label} 系统。`
    );
    body.append(lead, quote, tail);
    chatLog.append(element);
    scrollChat();
    return element;
  }

  function appendSuccessMessage(variant) {
    if (!chatLog) return null;
    const element = document.createElement("div");
    element.className = "msg msg--agent";
    element.innerHTML = `
      <span class="msg-author">LUMEN · READY</span>
      <p>三块画板已经更新。你可以直接点选任意画板，继续用自然语言修改；也可以让我把它延展到社媒、包装或网页。</p>
      <div class="agent-result">
        <span class="result-thumbs" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>方向 A · ${escapeHTML(variantDetails[variant].label)}<br><small>12 assets / 3 formats</small></span>
        <b>✓</b>
      </div>
    `;
    chatLog.append(element);
    scrollChat();
    return element;
  }

  function scrollChat() {
    if (!chatLog) return;
    window.requestAnimationFrame(() => {
      chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  function setVariant(variant) {
    if (!studioShell) return;
    studioShell.dataset.variant = variant;
  }

  function runStudioDemo(prompt) {
    const text = String(prompt || "").trim() || "为独立香氛品牌做一套克制而性感的品牌视觉";
    if (isBusy) {
      showToast("Lumen 正在构思，给它几秒钟。");
      return;
    }

    isBusy = true;
    if (studioShell) {
      studioShell.classList.add("is-generating");
      studioShell.setAttribute("aria-busy", "true");
    }
    if (chatSend) chatSend.disabled = true;
    if (studioPrompt) studioPrompt.value = "";

    appendUserMessage(text);
    const typing = appendTypingMessage();
    const variant = inferVariant(text);
    let planMessage = null;

    const phaseOne = reducedMotion ? 80 : 850;
    const phaseTwo = reducedMotion ? 120 : 1450;

    window.setTimeout(() => {
      if (typing) typing.remove();
      planMessage = appendPlanMessage(text, variant);
      setVariant(variant);
    }, phaseOne);

    window.setTimeout(() => {
      if (studioShell) {
        studioShell.classList.remove("is-generating");
        studioShell.setAttribute("aria-busy", "false");
      }
      if (planMessage) {
        const running = $(".agent-plan li:last-child i", planMessage);
        if (running) running.textContent = "done";
      }
      appendSuccessMessage(variant);
      if (chatSend) chatSend.disabled = false;
      isBusy = false;
      showToast(`Lumen 已将画板切换为「${variantDetails[variant].label}」方向`);
    }, phaseOne + phaseTwo);
  }

  function submitStudio() {
    if (!studioPrompt) return;
    const text = studioPrompt.value.trim();
    if (!text) return;
    if (isBusy) {
      showToast("Lumen 正在构思，给它几秒钟。");
      return;
    }
    runStudioDemo(text);
    studioPrompt.value = "";
    studioPrompt.style.height = "28px";
  }

  if (studioForm) {
    studioForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitStudio();
    });
  }

  if (studioPrompt) {
    studioPrompt.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitStudio();
      }
    });

    studioPrompt.addEventListener("input", () => {
      studioPrompt.style.height = "auto";
      studioPrompt.style.height = `${Math.min(studioPrompt.scrollHeight, 90)}px`;
    });
  }

  $$("[data-chat-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!studioPrompt) return;
      studioPrompt.value = button.dataset.chatPrompt || "";
      submitStudio();
    });
  });

  $$("[data-board]").forEach((board) => {
    const selectBoard = () => {
      $$("[data-board]").forEach((other) => {
        const selected = other === board;
        other.classList.toggle("is-selected", selected);
        other.setAttribute("aria-pressed", String(selected));
      });
      const label = $(".board-tag", board)?.textContent?.trim() || "画板";
      showToast(`已选中「${label}」· 在对话框中告诉 Lumen 你想怎么改`);
      if (chatLog) {
        const selected = document.createElement("div");
        selected.className = "msg msg--agent";
        selected.innerHTML =
          '<span class="msg-author">LUMEN · SELECTION</span><p>已选中画板。你可以说“把标题缩小一点”“换成更克制的配色”，或者“把这版延展成户外广告”。</p>';
        chatLog.append(selected);
        scrollChat();
      }
    };

    board.addEventListener("click", selectBoard);
    board.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectBoard();
    });
  });

  // Make the first board feel alive on load.
  const initialBoard = $(".board--brand");
  if (initialBoard) {
    initialBoard.classList.add("is-selected");
    initialBoard.setAttribute("aria-pressed", "true");
  }
  $$("[data-board]").forEach((board) => {
    if (!board.hasAttribute("aria-pressed")) board.setAttribute("aria-pressed", "false");
  });

  $$(".tool").forEach((tool) => {
    tool.addEventListener("click", () => {
      if (tool.classList.contains("tool-avatar")) return;
      $$(".tool").forEach((item) => item.classList.toggle("is-active", item === tool));
      showToast(`${tool.getAttribute("aria-label") || "工具"}已启用 · 演示`);
    });
  });

  $$(".canvas-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".canvas-tab").forEach((item) => item.classList.toggle("is-active", item === tab));
      showToast(tab.textContent.includes("Assets") ? "资产面板 · 概念演示" : "已返回画布");
    });
  });

  /* ---------------------------------------------------------
     Work filters
     --------------------------------------------------------- */

  const filterButtons = $$("[data-filter]");
  const workCards = $$(".work-card");

  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      workCards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-filtered", !show);
      });
    });
  });

  /* ---------------------------------------------------------
     Project dialog
     --------------------------------------------------------- */

  const projectData = [
    {
      title: "SOLSTICE",
      description:
        "为独立防晒品牌 SOLSTICE 建立以“光的仪式”为核心的品牌世界。低角度太阳被转译为可延展的图形资产，温暖纸张与冷调留白构成克制的性感。",
      client: "SOLSTICE Skin",
      scope: "品牌系统 / 艺术指导 / 包装",
      deliverables: "标识、色彩、字体、包装、社媒",
      year: "2026",
    },
    {
      title: "NOIR. 黑胶文化节",
      description:
        "NOIR 黑胶文化节的主视觉以转速、噪点与酸性绿构成。整套系统覆盖海报、票根、舞台屏幕与 15 秒动态开场，在粗粝与精密之间保持张力。",
      client: "NOIR Festival",
      scope: "传播概念 / 主视觉 / 动态",
      deliverables: "主视觉、票务、舞台屏幕、动态",
      year: "2025",
    },
    {
      title: "MORI TEA",
      description:
        "MORI TEA 把森林的层次压进三种绿色。包装使用未涂布纸与单色丝网，日文与中文共享一套几何骨架，让“安静”变成可识别的品牌资产。",
      client: "Mori Tea Co.",
      scope: "包装系统 / 插画 / 字体",
      deliverables: "包装、标签、礼盒、字体",
      year: "2026",
    },
    {
      title: "ARC ARCHITECTS",
      description:
        "ARC 建筑事务所的网站让建筑本身退后，留下光、阴影与停顿。滚动节奏被设计成穿过一条长廊，项目图像在接近时缓慢显影。",
      client: "ARC Architects",
      scope: "数字体验 / 网站 / 字体",
      deliverables: "网站、动效、数字识别",
      year: "2026",
    },
    {
      title: "KIN — Issue 08",
      description:
        "KIN 第八期以“身体作为作品”为题，把编辑摄影、字体与红色油墨压进同一股力量。视觉系统在纸张与屏幕之间保持同等强度。",
      client: "KIN Magazine",
      scope: "编辑设计 / 艺术指导",
      deliverables: "封面、内页、社媒、字体",
      year: "2025",
    },
    {
      title: "FORM 01",
      description:
        "FORM 01 是一场关于字母的物理实验。可变字重与网格在动态中呼吸，形成机构可无限延展的识别系统，而不是一枚静止的标识。",
      client: "Form Studio",
      scope: "字体设计 / 识别系统",
      deliverables: "可变字体、标识、动态规范",
      year: "2026",
    },
  ];

  const projectDialog = $("#projectDialog");
  const projectArt = $("#projectArt");
  const projectTitle = $("#projectTitle");
  const projectDesc = $("#projectDesc");
  const projectMeta = $("#projectMeta");
  const projectStart = $("#projectStart");
  let activeProject = null;

  function openProject(card, index) {
    if (!projectDialog || !projectArt) return;
    const data = projectData[index] || projectData[0];
    activeProject = { data, prompt: card.dataset.prompt || "" };

    projectArt.innerHTML = "";
    const art = $(".work-art", card);
    if (art) {
      const clone = art.cloneNode(true);
      $(".work-hover", clone)?.remove();
      projectArt.append(clone);
    }

    if (projectTitle) projectTitle.textContent = data.title;
    if (projectDesc) projectDesc.textContent = data.description;
    if (projectMeta) {
      projectMeta.innerHTML = `
        <div><dt>CLIENT</dt><dd>${escapeHTML(data.client)}</dd></div>
        <div><dt>SCOPE</dt><dd>${escapeHTML(data.scope)}</dd></div>
        <div><dt>DELIVERABLES</dt><dd>${escapeHTML(data.deliverables)}</dd></div>
        <div><dt>YEAR</dt><dd>${escapeHTML(data.year)}</dd></div>
      `;
    }

    lockBody(true);
    if (typeof projectDialog.showModal === "function") {
      projectDialog.showModal();
    } else {
      projectDialog.setAttribute("open", "");
    }
  }

  workCards.forEach((card, index) => {
    card.addEventListener("click", () => openProject(card, index));
  });

  if (projectStart) {
    projectStart.addEventListener("click", () => {
      const prompt = activeProject?.prompt || "";
      projectDialog?.close();
      lockBody(false);
      launchPrompt(prompt);
    });
  }

  $$("[data-close-project]").forEach((button) => {
    button.addEventListener("click", () => {
      projectDialog?.close();
      lockBody(false);
    });
  });

  if (projectDialog) {
    projectDialog.addEventListener("close", () => {
      lockBody(false);
      if (projectArt) projectArt.innerHTML = "";
    });
    projectDialog.addEventListener("click", (event) => {
      if (event.target !== projectDialog) return;
      projectDialog.close();
    });
  }

  /* ---------------------------------------------------------
     Pricing toggle
     --------------------------------------------------------- */

  const billingButtons = $$("[data-billing]");
  const priceValues = $$("[data-price]");

  function setBilling(mode) {
    billingButtons.forEach((button) => {
      const active = button.dataset.billing === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    priceValues.forEach((value) => {
      const nextValue = value.dataset[mode];
      if (nextValue === undefined) return;
      value.textContent = nextValue;
    });

    const pricingNote = $(".pricing-note");
    if (pricingNote) {
      pricingNote.textContent =
        mode === "yearly"
          ? "每年结算一次 · 相比月付节省 23% · 所有价格均为概念演示"
          : "所有价格均为概念演示 · 按年价格以月均展示 · 可随时取消";
    }
  }

  billingButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    button.addEventListener("click", () => setBilling(button.dataset.billing));
  });

  /* ---------------------------------------------------------
     FAQ — one open at a time
     --------------------------------------------------------- */

  const faqItems = $$(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item && other.open) other.open = false;
      });
    });
  });

  /* ---------------------------------------------------------
     Login dialog
     --------------------------------------------------------- */

  const authDialog = $("#authDialog");
  const loginForm = $("#loginForm");
  const loginSuccess = $("#loginSuccess");
  const loginEmail = $("#loginEmail");
  const dialogLegalNote = $("#dialogLegalNote");

  function openLogin() {
    if (!authDialog) return;
    if (loginForm) loginForm.hidden = false;
    if (loginSuccess) loginSuccess.hidden = true;
    if (loginEmail) loginEmail.value = "";
    if (dialogLegalNote) dialogLegalNote.textContent = "";
    lockBody(true);
    if (typeof authDialog.showModal === "function") {
      authDialog.showModal();
    } else {
      authDialog.setAttribute("open", "");
    }
    window.setTimeout(() => {
      if (authDialog.open) loginEmail?.focus({ preventScroll: true });
    }, 120);
  }

  $$("[data-open-login]").forEach((button) => {
    button.addEventListener("click", openLogin);
  });

  $$("[data-close-login]").forEach((button) => {
    button.addEventListener("click", () => authDialog?.close());
  });

  $$("[data-dialog-toast]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (dialogLegalNote) dialogLegalNote.textContent = link.dataset.dialogToast || "演示内容，暂未开放。";
    });
  });

  if (authDialog) {
    authDialog.addEventListener("close", () => {
      lockBody(false);
      if (loginForm) loginForm.hidden = false;
      if (loginSuccess) loginSuccess.hidden = true;
      if (dialogLegalNote) dialogLegalNote.textContent = "";
    });
    authDialog.addEventListener("click", (event) => {
      if (event.target === authDialog) authDialog.close();
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
      }
      loginForm.hidden = true;
      if (loginSuccess) loginSuccess.hidden = false;
      if (dialogLegalNote) dialogLegalNote.textContent = "";
    });
  }

  /* ---------------------------------------------------------
     Toasts / share / misc
     --------------------------------------------------------- */

  $$("[data-toast]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (element.tagName === "A") event.preventDefault();
      showToast(element.dataset.toast || "这是一个演示操作。");
    });
  });

  $$(".app-share").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("分享链接已复制（演示）");
      } catch {
        showToast("分享链接已生成（演示）");
      }
    });
  });

  // Keep decorative links from jumping the page.
  $$('a[href="#"]').forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  // Close any open dialog when clicking its backdrop is handled per-dialog.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (projectDialog?.open) projectDialog.close();
    if (authDialog?.open) authDialog.close();
  });

  /* ---------------------------------------------------------
     Process step highlighter
     --------------------------------------------------------- */

  const processSteps = $$("[data-step]");
  if (processSteps.length && "IntersectionObserver" in window) {
    const processObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          processSteps.forEach((step) => step.classList.toggle("is-active", step === entry.target));
        });
      },
      { threshold: 0.35, rootMargin: "-18% 0px -38% 0px" }
    );
    processSteps.forEach((step) => processObserver.observe(step));
  }

  /* ---------------------------------------------------------
     Small delight: current local time in footer? not needed.
     --------------------------------------------------------- */

  // Mark the page as interactive only after every interaction is wired.
  // Until this point, reveal elements remain visible even if a script fails.
  document.documentElement.classList.add("js-anim");
})();
