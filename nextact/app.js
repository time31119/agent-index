/* =========================================================
   NEXTACT / 次幕 — prototype interactions
   ========================================================= */

(() => {
  "use strict";

  const assets = [
    {
      id: "NX-0248",
      title: "月蚀契约",
      en: "BLOOD MOON PACT",
      market: "北美",
      genre: "狼人",
      stage: "已上线",
      episodes: 62,
      runtime: "2′10″",
      producer: "夜航制作",
      producerEn: "NIGHTNAV",
      data: "connected",
      rank: "前 18%",
      rights: ["完整版权", "区域独家"],
      cover: "assets/cover-moon.svg",
      spark: [12, 15, 14, 18, 17, 24, 22, 29, 27, 35, 33, 41]
    },
    {
      id: "NX-0239",
      title: "别叫我太太",
      en: "NOT YOUR MRS",
      market: "东南亚",
      genre: "霸总",
      stage: "成片",
      episodes: 48,
      runtime: "1′45″",
      producer: "拾光映画",
      producerEn: "LUMEN PICTURES",
      data: "basic",
      trend: "",
      rights: ["完整版权"],
      cover: "assets/cover-mrs.svg",
      spark: []
    },
    {
      id: "NX-0233",
      title: "第七次回门",
      en: "THE SEVENTH RETURN",
      market: "日韩",
      genre: "复仇",
      stage: "粗剪",
      episodes: 36,
      runtime: "2′30″",
      producer: "孤岛文化",
      producerEn: "ISLAND CULTURE",
      data: "connected",
      rank: "前 31%",
      rights: ["改编权"],
      cover: "assets/cover-return.svg",
      spark: [19, 17, 20, 18, 23, 22, 26, 24, 30, 31, 29, 36]
    },
    {
      id: "NX-0227",
      title: "沙漠玫瑰",
      en: "ROSE OF THE SANDS",
      market: "中东",
      genre: "逆袭",
      stage: "成片",
      episodes: 40,
      runtime: "2′00″",
      producer: "MIRAGE STUDIO",
      producerEn: "MIRAGE STUDIO",
      data: "basic",
      trend: "",
      rights: ["完整版权"],
      cover: "assets/cover-rose.svg",
      spark: []
    },
    {
      id: "NX-0219",
      title: "合约情人",
      en: "THE CONTRACT",
      market: "拉美",
      genre: "甜宠",
      stage: "已上线",
      episodes: 55,
      runtime: "1′50″",
      producer: "倾橙制作",
      producerEn: "ORANGE HOUSE",
      data: "connected",
      rank: "前 42%",
      rights: ["非独家"],
      cover: "assets/cover-contract.svg",
      spark: [26, 28, 25, 30, 29, 33, 32, 36, 34, 38, 37, 42]
    },
    {
      id: "NX-0208",
      title: "雾港来信",
      en: "LETTERS FROM FOG HARBOR",
      market: "北美",
      genre: "悬疑",
      stage: "剧本",
      episodes: 24,
      runtime: "2′20″",
      producer: "北岸叙事",
      producerEn: "NORTHSHORE",
      data: "basic",
      trend: "",
      rights: ["区域独家"],
      cover: "assets/cover-fog.svg",
      spark: []
    }
  ];

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function closeMenu() {
    document.body.classList.remove("nav-open");
    const toggle = $(".menu-toggle");
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "打开菜单");
  }

  /* ---------- Helpers ---------- */

  function sparkPath(values, width = 60, height = 20, padding = 2) {
    if (!values.length) return "";
    const max = Math.max(...values);
    const min = Math.min(...values);
    const spread = max - min || 1;
    const step = (width - padding * 2) / (values.length - 1);
    return values
      .map((value, index) => {
        const x = padding + index * step;
        const y = height - padding - ((value - min) / spread) * (height - padding * 2);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function reference(prefix = "NX-Q") {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
  }

  /* ---------- Asset rendering ---------- */

  const assetGrid = $("#assetGrid");
  const emptyState = $("#emptyState");
  const resultCount = $("#resultCount");
  const marketTabs = $$(".market-tab");
  const filterGenre = $("#filterGenre");
  const filterStage = $("#filterStage");
  const filterData = $("#filterData");
  const filterRights = $("#filterRights");
  const filterSearch = $("#filterSearch");
  const resetFilters = $("#resetFilters");
  const sortAssets = $("#sortAssets");

  const state = {
    market: "全部市场",
    genre: "全部",
    stage: "全部",
    data: "全部",
    rights: "全部",
    query: "",
    sort: "credit"
  };

  function matchesFilters(asset, skipMarket = false) {
    if (!skipMarket && state.market !== "全部市场" && asset.market !== state.market) return false;
    if (state.genre !== "全部" && asset.genre !== state.genre) return false;
    if (state.stage !== "全部" && asset.stage !== state.stage) return false;
    if (state.data === "已接入" && asset.data !== "connected") return false;
    if (state.data === "基础认证" && asset.data !== "basic") return false;
    if (state.rights !== "全部" && !asset.rights.includes(state.rights)) return false;
    if (state.query) {
      const haystack = [
        asset.title,
        asset.en,
        asset.producer,
        asset.producerEn,
        asset.market,
        asset.genre,
        asset.stage,
        ...asset.rights
      ].join(" ").toLowerCase();
      if (!haystack.includes(state.query.toLowerCase())) return false;
    }
    return true;
  }

  function assetCard(asset) {
    const isConnected = asset.data === "connected";
    const tags = [
      `<span>${escapeHtml(asset.stage)}</span>`,
      `<span>${escapeHtml(asset.genre)}</span>`,
      `<span class="highlight">${escapeHtml(asset.rights[0])}</span>`,
      asset.rights[1] ? `<span>${escapeHtml(asset.rights[1])}</span>` : ""
    ].join("");

    const signal = isConnected
      ? `<div class="data-signal">
          <span class="signal-dot" aria-hidden="true"></span>
          <span>已接入播放数据</span>
          <strong>${escapeHtml(asset.rank)} / 30D</strong>
          <svg class="mini-spark" viewBox="0 0 60 20" aria-hidden="true">
            <path d="${sparkPath(asset.spark)}" fill="none" stroke="#c8f65d" stroke-width="1.2"/>
            <circle cx="58" cy="${(() => {
              const max = Math.max(...asset.spark);
              const min = Math.min(...asset.spark);
              const spread = max - min || 1;
              return (20 - 2 - ((asset.spark[asset.spark.length - 1] - min) / spread) * 16).toFixed(1);
            })()}" r="1.6" fill="#c8f65d"/>
          </svg>
        </div>`
      : `<div class="data-signal basic">
          <span class="signal-dot" aria-hidden="true"></span>
          <span>仅基础信息认证</span>
          <strong>暂无数据授权</strong>
        </div>`;

    return `<article class="asset-card" data-id="${escapeHtml(asset.id)}">
      <div class="asset-cover">
        <img src="${escapeHtml(asset.cover)}" alt="">
        <div class="cover-meta top"><span>${escapeHtml(asset.id)}</span><span>${escapeHtml(asset.stage)}</span></div>
        <span class="cover-credit${isConnected ? " on" : ""}">${isConnected ? "DATA ✓" : "NO DATA"}</span>
        <div class="cover-meta bottom"><span class="cover-market">${escapeHtml(asset.market)}</span><span>${asset.episodes} EP</span></div>
      </div>
      <div class="asset-main">
        <div class="asset-heading">
          <div>
            <h3>${escapeHtml(asset.title)}</h3>
            <p class="asset-en">${escapeHtml(asset.en)}</p>
          </div>
          <div class="asset-runtime"><strong>${asset.episodes}</strong><span>集</span><small>${escapeHtml(asset.runtime)} / 集</small></div>
        </div>
        <div class="asset-tags">${tags}</div>
        ${signal}
        <div class="asset-bottom">
          <div class="producer">
            <span class="producer-badge" aria-hidden="true">✓</span>
            ${escapeHtml(asset.producer)}
            <em>已认证 · ${escapeHtml(asset.producerEn)}</em>
          </div>
          <button class="inquire-btn" type="button" data-inquire="${escapeHtml(asset.id)}">
            发起询价 <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>`;
  }

  function updateMarketCounts() {
    marketTabs.forEach((tab) => {
      const market = tab.dataset.market;
      const count = assets.filter((asset) => {
        if (market !== "全部市场" && asset.market !== market) return false;
        return matchesFilters(asset, true);
      }).length;
      const counter = $("span", tab);
      if (counter) counter.textContent = count;
    });
  }

  function renderAssets() {
    const visible = assets.filter((asset) => matchesFilters(asset));

    if (state.sort === "episodes") {
      visible.sort((a, b) => b.episodes - a.episodes || b.id.localeCompare(a.id));
    } else if (state.sort === "latest") {
      visible.sort((a, b) => b.id.localeCompare(a.id));
    } else {
      visible.sort((a, b) => Number(b.data === "connected") - Number(a.data === "connected") || b.id.localeCompare(a.id));
    }

    assetGrid.innerHTML = visible.map(assetCard).join("");
    resultCount.textContent = visible.length;
    emptyState.hidden = visible.length !== 0;
    updateMarketCounts();
  }

  marketTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.market = tab.dataset.market;
      marketTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderAssets();
    });
  });

  [filterGenre, filterStage, filterData, filterRights].forEach((select) => {
    select.addEventListener("change", () => {
      state.genre = filterGenre.value;
      state.stage = filterStage.value;
      state.data = filterData.value;
      state.rights = filterRights.value;
      renderAssets();
    });
  });

  filterSearch.addEventListener("input", () => {
    state.query = filterSearch.value.trim();
    renderAssets();
  });

  sortAssets.addEventListener("change", () => {
    state.sort = sortAssets.value;
    renderAssets();
  });

  resetFilters.addEventListener("click", () => {
    state.market = "全部市场";
    state.genre = "全部";
    state.stage = "全部";
    state.data = "全部";
    state.rights = "全部";
    state.query = "";
    state.sort = "credit";
    sortAssets.value = "credit";
    filterGenre.value = "全部";
    filterStage.value = "全部";
    filterData.value = "全部";
    filterRights.value = "全部";
    filterSearch.value = "";
    marketTabs.forEach((tab) => {
      const active = tab.dataset.market === "全部市场";
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-pressed", String(active));
    });
    renderAssets();
  });

  marketTabs.forEach((tab) => {
    tab.setAttribute("aria-pressed", String(tab.classList.contains("is-active")));
  });
  renderAssets();

  /* ---------- Dialog utilities ---------- */

  const leadDialog = $("#leadDialog");
  const leadForm = $("#leadForm");
  const leadSuccess = $("#leadSuccess");
  const leadSubmit = $("#leadSubmit");
  const leadMode = $("#leadMode");
  const leadAsset = $("#leadAsset");
  const leadContext = $("#leadContext");
  const leadContextName = $("#leadContextName");
  const leadContextMeta = $("#leadContextMeta");
  const leadTitle = $("#leadTitle");
  const leadEyebrow = $("#leadEyebrow");
  const leadIntro = $("#leadIntro");
  const leadTypeLabel = $("#leadTypeLabel");
  const leadType = $("#leadType");
  const leadSuccessTitle = $("#leadSuccessTitle");
  const leadSuccessCopy = $("#leadSuccessCopy");
  const leadRef = $("#leadRef");

  const submitDialog = $("#submitDialog");
  const submitForm = $("#submitForm");
  const submitSuccess = $("#submitSuccess");
  const submitAssetBtn = $("#submitAssetBtn");
  const submitRef = $("#submitRef");

  const buyerTypes = ["海外发行商", "流媒体平台", "版权采购方", "产业基金 / 资金方", "其他"];
  const serviceTypes = ["本土化叙事顾问", "多语种配音与字幕", "合规与版权审查", "投流优化服务", "尚未确定"];
  let leadTimer = null;
  let submitTimer = null;

  function setOptions(select, values, selected = "") {
    select.innerHTML = values
      .map((value) => `<option${value === selected ? " selected" : ""}>${escapeHtml(value)}</option>`)
      .join("");
  }

  function syncBodyLock() {
    const anyOpen = Boolean(document.querySelector("dialog[open]"));
    document.body.classList.toggle("modal-open", anyOpen);
  }

  function resetLeadDialog() {
    if (leadTimer) {
      window.clearTimeout(leadTimer);
      leadTimer = null;
    }
    leadForm.reset();
    leadForm.hidden = false;
    leadSuccess.hidden = true;
    leadSubmit.disabled = false;
    leadSubmit.innerHTML = '发送询价 <span aria-hidden="true">↗</span>';
    leadAsset.value = "";
    leadContext.hidden = true;
  }

  function openLead(mode = "inquiry", options = {}) {
    resetLeadDialog();
    leadMode.value = mode;

    if (mode === "inquiry" && options.asset) {
      const asset = options.asset;
      leadTitle.textContent = "发起询价";
      leadEyebrow.textContent = "BUYER INQUIRY / 站内询价";
      leadIntro.textContent = "询价通过站内编号转交制作方，平台不会公开任何个人联系方式。";
      leadTypeLabel.textContent = "买方类型";
      setOptions(leadType, buyerTypes);
      leadContext.hidden = false;
      leadContextName.textContent = `《${asset.title}》`;
      leadContextMeta.textContent = `${asset.id} · ${asset.market} · ${asset.episodes} 集`;
      leadAsset.value = asset.id;
      leadSubmit.innerHTML = '发送询价 <span aria-hidden="true">↗</span>';
      leadSuccessTitle.textContent = "询价已进入队列";
      leadSuccessCopy.textContent = "平台将以匿名编号转交制作方，并通过工作邮箱同步进展。制作方将决定是否开放试看与详细数据。";
    } else if (mode === "service") {
      leadTitle.textContent = "申请服务商匹配";
      leadEyebrow.textContent = "SERVICE MATCHING / 服务匹配";
      leadIntro.textContent = "说明项目阶段与需求，平台将在 48 小时内返回匹配方案。资金经平台托管，验收后放款。";
      leadTypeLabel.textContent = "所需服务";
      setOptions(leadType, serviceTypes, options.service || "");
      leadSubmit.innerHTML = '提交服务申请 <span aria-hidden="true">↗</span>';
      leadSuccessTitle.textContent = "服务申请已提交";
      leadSuccessCopy.textContent = "平台将根据项目阶段、目标市场与预算，在 48 小时内返回 2–3 家认证服务商的匹配方案。";
    } else if (mode === "buyer") {
      leadTitle.textContent = "买方实名认证";
      leadEyebrow.textContent = "BUYER VERIFICATION / 买方准入";
      leadIntro.textContent = "完成机构与联系人核验后，开放完整资产目录、试看链接与站内询价权限。";
      leadTypeLabel.textContent = "买方类型";
      setOptions(leadType, buyerTypes);
      leadSubmit.innerHTML = '提交认证申请 <span aria-hidden="true">↗</span>';
      leadSuccessTitle.textContent = "认证申请已提交";
      leadSuccessCopy.textContent = "平台将在 1 个工作日内完成机构核验，并通过工作邮箱发送完整目录与询价权限说明。";
    } else {
      leadTitle.textContent = "申请完整资产目录";
      leadEyebrow.textContent = "CATALOGUE ACCESS / 目录权限";
      leadIntro.textContent = "完整目录包含 146 个在库资产与数据授权状态，仅向完成实名认证的买方开放。";
      leadTypeLabel.textContent = "买方类型";
      setOptions(leadType, buyerTypes);
      leadSubmit.innerHTML = '申请目录权限 <span aria-hidden="true">↗</span>';
      leadSuccessTitle.textContent = "目录申请已提交";
      leadSuccessCopy.textContent = "平台将核验机构信息，并在 1 个工作日内通过工作邮箱发送完整目录与数据授权说明。";
    }

    leadDialog.showModal();
    syncBodyLock();
    window.setTimeout(() => $("#leadCompany").focus(), 80);
  }

  function openSubmit() {
    if (submitTimer) {
      window.clearTimeout(submitTimer);
      submitTimer = null;
    }
    submitForm.reset();
    submitForm.hidden = false;
    submitSuccess.hidden = true;
    submitAssetBtn.disabled = false;
    submitAssetBtn.innerHTML = '提交初审 <span aria-hidden="true">↗</span>';
    submitDialog.showModal();
    syncBodyLock();
    window.setTimeout(() => submitForm.querySelector("input").focus(), 80);
  }

  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
    window.setTimeout(syncBodyLock, 0);
  }

  $$("[data-open-submit]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openSubmit();
      closeMenu();
    });
  });

  $$("[data-lead-mode]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openLead(trigger.dataset.leadMode);
      closeMenu();
    });
  });

  assetGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-inquire]");
    if (!button) return;
    const asset = assets.find((item) => item.id === button.dataset.inquire);
    if (asset) openLead("inquiry", { asset });
  });

  $$(".service-open").forEach((button) => {
    button.addEventListener("click", () => {
      openLead("service", { service: button.dataset.service });
    });
  });

  $$("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
      closeDialog(button.closest("dialog"));
    });
  });

  [leadDialog, submitDialog].forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("close", syncBodyLock);
  });

  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!leadForm.reportValidity()) return;
    leadSubmit.disabled = true;
    leadSubmit.textContent = "发送中…";

    leadTimer = window.setTimeout(() => {
      leadForm.hidden = true;
      leadSuccess.hidden = false;
      const prefix = leadMode.value === "inquiry" ? "NX-Q" : leadMode.value === "service" ? "NX-S" : leadMode.value === "buyer" ? "NX-B" : "NX-C";
      leadRef.textContent = reference(prefix);
      leadSubmit.disabled = false;
      leadTimer = null;
      leadSuccess.querySelector("h3").focus();
    }, 650);
  });

  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!submitForm.reportValidity()) return;
    submitAssetBtn.disabled = true;
    submitAssetBtn.textContent = "提交中…";

    submitTimer = window.setTimeout(() => {
      submitForm.hidden = true;
      submitSuccess.hidden = false;
      submitRef.textContent = reference("NX-A");
      submitAssetBtn.disabled = false;
      submitTimer = null;
      submitSuccess.querySelector("h3").focus();
    }, 650);
  });

  /* ---------- Report tabs ---------- */

  const reportTabs = $$(".report-tab");
  const reportPanels = {
    tabCredit: $("#panelCredit"),
    tabDashboard: $("#panelDashboard")
  };

  function activateReportTab(tab) {
    reportTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    Object.entries(reportPanels).forEach(([id, panel]) => {
      if (panel) panel.hidden = id !== tab.id;
    });
  }

  reportTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateReportTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const index = reportTabs.indexOf(tab);
      const next = reportTabs[(index + (event.key === "ArrowRight" ? 1 : -1) + reportTabs.length) % reportTabs.length];
      activateReportTab(next);
      next.focus();
    });
  });
  reportTabs.forEach((tab, index) => {
    tab.tabIndex = index === 0 ? 0 : -1;
  });

  /* ---------- Motion preference ---------- */

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Reveal on scroll ---------- */

  const revealElements = $$(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  /* ---------- Header, clock & active section ---------- */

  const clock = $("#clock");
  const feedTime = $("#feedTime");
  function updateClock() {
    const time = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai"
    }).format(new Date());
    if (clock) clock.textContent = time;
    if (feedTime) feedTime.textContent = time;
  }
  updateClock();
  window.setInterval(updateClock, 30000);

  const menuToggle = $(".menu-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });

    $$(".nav-links a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  const navLinks = $$(".nav-links a");
  const trackedSections = $$("main section[id]");
  let scrollTicking = false;

  function updateActiveNav() {
    const marker = window.scrollY + 150;
    let currentId = "";
    trackedSections.forEach((section) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top <= marker) currentId = section.id;
    });
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(updateActiveNav);
    },
    { passive: true }
  );
  updateActiveNav();

  /* ---------- Anchor offset for sticky header ---------- */

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      if (event.defaultPrevented || anchor.classList.contains("skip-link")) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Cross-page intent links ---------- */

  const intent = new URLSearchParams(window.location.search).get("intent");
  const intentActions = {
    submit: openSubmit,
    service: () => openLead("service"),
    buyer: () => openLead("buyer"),
    catalogue: () => openLead("catalogue")
  };
  if (intent && Object.prototype.hasOwnProperty.call(intentActions, intent)) {
    window.setTimeout(intentActions[intent], 280);
  }
})();
