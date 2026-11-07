/* =========================================================
   澜算 LANSUAN — interactions
   ========================================================= */
(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const PRODUCTS = {
    h200: {
      id: "h200",
      name: "H200",
      full: "H200 8-GPU",
      kicker: "TRAINING FLAGSHIP",
      serial: "LS-H200-0087",
      image: "assets/product-h200.svg",
      price: 2480000,
      rent: 88000,
      hosting: 16800,
      occupancy: 85,
      residualRate: 0.42,
      unit: "8× H200 SXM5",
      description: "8 卡 H200 液冷整机，适合万亿参数模型训练、长上下文推理与高价值算力租赁。",
      specs: [
        ["GPU", "8 × NVIDIA H200 SXM5"],
        ["显存", "1.1TB HBM3e"],
        ["互联", "NVLink 900GB/s"],
        ["网络", "2 × 400G InfiniBand"],
        ["存储", "8 × 3.2TB NVMe"],
        ["功耗", "8.4kW / 整机"],
        ["交付", "30–45 天"],
        ["质保", "3 年"]
      ],
      included: ["72h 满载压测", "上架与系统初始化", "7×24 远程运维", "月度收益结算单"]
    },
    h100: {
      id: "h100",
      name: "H100",
      full: "H100 8-GPU",
      kicker: "TRAINING WORKHORSE",
      serial: "LS-H100-0142",
      image: "assets/product-h100.svg",
      price: 1780000,
      rent: 65000,
      hosting: 14200,
      occupancy: 85,
      residualRate: 0.4,
      unit: "8× H100 SXM5",
      description: "成熟生态与稳定调度，适合绝大多数大模型训练、微调与批量推理任务。",
      specs: [
        ["GPU", "8 × NVIDIA H100 SXM5"],
        ["显存", "640GB HBM3"],
        ["互联", "NVLink 900GB/s"],
        ["网络", "2 × 400G InfiniBand"],
        ["存储", "8 × 3.2TB NVMe"],
        ["功耗", "7.2kW / 整机"],
        ["交付", "20–30 天"],
        ["质保", "3 年"]
      ],
      included: ["72h 满载压测", "上架与系统初始化", "7×24 远程运维", "月度收益结算单"]
    },
    r4090: {
      id: "r4090",
      name: "4090",
      full: "RTX 4090 8-GPU",
      kicker: "INFERENCE VALUE",
      serial: "LS-4090-0316",
      image: "assets/product-4090.svg",
      price: 268000,
      rent: 9800,
      hosting: 3600,
      occupancy: 88,
      residualRate: 0.32,
      unit: "8× RTX 4090 24G",
      description: "紧凑型八卡推理工作站，部署快、调度灵活，适合小团队持有与弹性算力出租。",
      specs: [
        ["GPU", "8 × RTX 4090 24G"],
        ["显存", "192GB GDDR6X"],
        ["互联", "PCIe 4.0"],
        ["网络", "2 × 100G Ethernet"],
        ["存储", "4 × 3.84TB NVMe"],
        ["功耗", "3.2kW / 整机"],
        ["交付", "7–14 天"],
        ["质保", "2 年"]
      ],
      included: ["48h 满载压测", "上架与系统初始化", "远程运维", "月度收益结算单"]
    }
  };

  const NODES = {
    n01: { code: "N01", name: "乌兰察布", sub: "内蒙古 · 京津冀低时延节点", pue: "1.19", green: "62%", latency: "6ms", label: "到北京", slots: "36" },
    n02: { code: "N02", name: "中卫", sub: "宁夏 · 西部绿电枢纽", pue: "1.18", green: "71%", latency: "22ms", label: "到北京", slots: "28" },
    n03: { code: "N03", name: "张家口", sub: "河北 · 北京低时延圈", pue: "1.20", green: "58%", latency: "5ms", label: "到北京", slots: "24" },
    n04: { code: "N04", name: "庆阳", sub: "甘肃 · 陇东算力基地", pue: "1.16", green: "69%", latency: "8ms", label: "到西安", slots: "18" },
    n05: { code: "N05", name: "芜湖", sub: "安徽 · 长三角节点", pue: "1.24", green: "41%", latency: "9ms", label: "到上海", slots: "18" },
    n06: { code: "N06", name: "贵安", sub: "贵州 · 南方绿电集群", pue: "1.17", green: "71%", latency: "28ms", label: "到广州", slots: "11" }
  };

  const state = {
    model: "h200",
    qty: 1,
    occ: 85,
    tier: 1,
    activeProduct: "h200",
    shareProduct: "h200",
    shareTier: { label: "分享官", rate: "0.6%" }
  };

  const formatMoney = (value) => "¥" + Math.round(value).toLocaleString("zh-CN");

  const compactMoney = (value) => {
    if (value >= 1000000) return "¥" + (value / 1000000).toFixed(2).replace(/0$/, "").replace(/\.0$/, "") + "M";
    if (value >= 10000) return "¥" + (value / 10000).toFixed(1).replace(/\.0$/, "") + "万";
    return formatMoney(value);
  };

  const monthText = (value) => (Number.isFinite(value) ? value.toFixed(1) : "—");

  let toastTimer;
  const toast = (message) => {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2600);
  };

  /* ---------------- header / menu ---------------- */

  const header = $("#siteHeader");
  const menuToggle = $("#menuToggle");
  const siteNav = $("#siteNav");

  const closeMenu = () => {
    if (!header || !menuToggle) return;
    header.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "打开菜单");
    const use = menuToggle.querySelector("use");
    if (use) use.setAttribute("href", "#i-menu");
    document.body.classList.remove("menu-open");
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
    const use = menuToggle.querySelector("use");
    if (use) use.setAttribute("href", isOpen ? "#i-close" : "#i-menu");
    document.body.classList.toggle("menu-open", isOpen);
  });

  $$("#siteNav a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header?.classList.contains("nav-open")) closeMenu();
  });

  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { if (window.innerWidth > 960) closeMenu(); });
  onScroll();

  /* ---------------- reveal + counters ---------------- */

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -40px" })
    : null;

  if (revealObserver) {
    $$(".reveal").forEach((el) => revealObserver.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }

  const animateCount = (el) => {
    if (el.dataset.counted) return;
    el.dataset.counted = "true";
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const decimals = String(target).includes(".") ? 2 : 0;
    const start = performance.now();
    const duration = 1300;
    const formatter = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatter.format(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = formatter.format(target) + suffix;
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.55 });
    $$("[data-count]").forEach((el) => countObserver.observe(el));
  }

  /* ---------------- product filters ---------------- */

  const filterTabs = $$(".filter-tab");
  const productCards = $$(".product-card");

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;
      filterTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
      productCards.forEach((card) => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.hidden = !visible;
        card.classList.toggle("is-hidden", !visible);
      });
    });
  });

  /* ---------------- dialogs ---------------- */

  const productDialog = $("#productDialog");
  const shareDialog = $("#shareDialog");
  let lastFocused = null;

  const showDialog = (dialog) => {
    if (!dialog) return;
    lastFocused = document.activeElement;
    dialog.showModal();
    document.body.classList.add("dialog-open");
    const close = dialog.querySelector(".modal-close");
    close?.focus({ preventScroll: true });
  };

  const closeDialog = (dialog) => {
    if (dialog?.open) dialog.close();
  };

  const syncDialogBody = () => {
    const open = $$("dialog[open]").length > 0;
    document.body.classList.toggle("dialog-open", open);
    if (!open && lastFocused instanceof HTMLElement) lastFocused.focus({ preventScroll: true });
  };

  $$("dialog").forEach((dialog) => {
    dialog.addEventListener("close", syncDialogBody);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  $$("[data-close-dialog]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeDialog(btn.closest("dialog"));
    });
  });

  /* ---------------- product modal ---------------- */

  const openProduct = (id) => {
    const product = PRODUCTS[id];
    if (!product) return;
    state.activeProduct = id;
    $("#modalKicker").textContent = product.kicker;
    $("#productDialogTitle").textContent = product.full;
    $("#modalDesc").textContent = product.description;
    $("#modalPrice").textContent = formatMoney(product.price);
    $("#modalRent").textContent = formatMoney(product.rent);
    $("#modalImage").src = product.image;
    $("#modalImage").alt = `${product.full} 产品图`;
    $("#modalSerial").textContent = product.serial;
    $("#modalSpecs").innerHTML = product.specs.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("");
    const gross = product.rent * product.occupancy / 100;
    const fee = gross * 0.03;
    const net = gross - product.hosting - fee;
    const payback = (product.price / net / 12).toFixed(1);
    $("#modalEcon").innerHTML = [
      `参考月净租 <b>${formatMoney(net)}</b>`,
      `按 ${product.occupancy}% 出租率`,
      `静态回本 <b>${payback} 年</b>`,
      `参考残值 <b>${Math.round(product.residualRate * 100)}%</b>`
    ].map((value) => `<span>${value}</span>`).join("");
    $("#modalIncluded").innerHTML = product.included.map((item) => `<em>${item}</em>`).join("");
    $("#modalCalcBtn").dataset.model = id;
    showDialog(productDialog);
  };

  $$("[data-open-product]").forEach((btn) => {
    btn.addEventListener("click", () => openProduct(btn.dataset.openProduct));
  });

  $("#modalCalcBtn")?.addEventListener("click", (event) => {
    const id = event.currentTarget.dataset.model || state.activeProduct;
    closeDialog(productDialog);
    setModel(id, true);
    document.querySelector("#calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("已带入收益计算器，可继续调整数量与出租率");
  });

  /* ---------------- calculator ---------------- */

  const calcModelTabs = $$(".model-tab");
  const calcTierTabs = $$(".tier-tab");
  const qtyInput = $("#qtyInput");
  const occRange = $("#occRange");
  const cashChart = $("#cashChart");

  const renderChart = (capex, net) => {
    if (!cashChart) return;
    const W = 600;
    const H = 205;
    const left = 46;
    const right = 10;
    const top = 13;
    const bottom = 22;
    const maxY = Math.max(capex * 1.18, net * 60 * 1.035, 1);
    const x = (month) => left + (month / 60) * (W - left - right);
    const y = (value) => top + (1 - value / maxY) * (H - top - bottom);
    const points = [];
    for (let month = 0; month <= 60; month += 1) {
      points.push(`${x(month).toFixed(1)},${y(net * month).toFixed(1)}`);
    }
    const path = "M" + points.join(" L");
    const area = `${path} L${x(60).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;
    const payback = capex / net;
    const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const yy = y(maxY * ratio).toFixed(1);
      return `<line x1="${left}" y1="${yy}" x2="${W - right}" y2="${yy}" stroke="#0b0f0c" stroke-opacity=".08"/>`;
    }).join("");
    const yLabels = [0, 0.5, 1].map((ratio) => {
      const value = maxY * ratio;
      const label = value >= 1000000 ? (value / 1000000).toFixed(1) + "M" : Math.round(value / 1000) + "k";
      return `<text x="${left - 8}" y="${y(value) + 2.4}" text-anchor="end" font-family="monospace" font-size="7.5" fill="#8d9284">${label}</text>`;
    }).join("");
    const xLabels = [0, 12, 24, 36, 48, 60].map((month) => `<text x="${x(month)}" y="${H - 5}" text-anchor="middle" font-family="monospace" font-size="7.5" fill="#8d9284">${month}</text>`).join("");
    const capexY = y(capex).toFixed(1);
    let paybackMark = "";
    if (payback <= 60) {
      const px = x(payback).toFixed(1);
      const py = y(capex).toFixed(1);
      paybackMark = `
        <line x1="${px}" y1="${top}" x2="${px}" y2="${H - bottom}" stroke="#7a8e4e" stroke-opacity=".42" stroke-dasharray="2 4"/>
        <circle cx="${px}" cy="${py}" r="4.3" fill="#f2eee2" stroke="#607b38" stroke-width="2"/>
        <circle cx="${px}" cy="${py}" r="1.6" fill="#607b38"/>
        <text x="${px}" y="${Number(py) - 9}" text-anchor="middle" font-family="monospace" font-size="7.5" fill="#4e6332">回本</text>`;
    }
    const endpointX = x(60).toFixed(1);
    const endpointY = y(net * 60).toFixed(1);
    cashChart.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
        <defs>
          <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#c9f15b" stop-opacity=".5"/>
            <stop offset="1" stop-color="#c9f15b" stop-opacity=".02"/>
          </linearGradient>
        </defs>
        ${grid}${yLabels}${xLabels}
        <line x1="${left}" y1="${capexY}" x2="${W - right}" y2="${capexY}" stroke="#b86f4d" stroke-opacity=".7" stroke-dasharray="4 5"/>
        <text x="${W - right}" y="${Number(capexY) - 5}" text-anchor="end" font-family="monospace" font-size="7" fill="#a36a4e">CAPEX</text>
        <path d="${area}" fill="url(#cashFill)"/>
        <path d="${path}" fill="none" stroke="#607b38" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${paybackMark}
        <circle cx="${endpointX}" cy="${endpointY}" r="3.2" fill="#607b38"/>
        <text x="${endpointX}" y="${Number(endpointY) - 9}" text-anchor="end" font-family="monospace" font-size="8" fill="#4e6332">${compactMoney(net * 60)}</text>
      </svg>`;
    $("#chartPayback").textContent = payback <= 60 ? `回本点 ${Math.ceil(payback)} 个月` : "回本点 > 60 个月";
    cashChart.setAttribute("aria-label", `60个月累计净租金曲线，静态回本约${monthText(payback)}个月`);
  };

  const updateCalculator = () => {
    const p = PRODUCTS[state.model];
    const capex = p.price * state.qty;
    const gross = p.rent * state.qty * state.occ / 100;
    const hosting = p.hosting * state.qty * state.tier;
    const fee = gross * 0.03;
    const net = gross - hosting - fee;
    const annual = net > 0 ? (net * 12 / capex) * 100 : 0;
    const payback = net > 0 ? capex / net : Infinity;
    const residual = capex * p.residualRate;

    calcModelTabs.forEach((tab) => {
      const active = tab.dataset.model === state.model;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-pressed", String(active));
    });
    calcTierTabs.forEach((tab) => {
      const active = Number(tab.dataset.tier) === state.tier;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-pressed", String(active));
    });

    $("#calcUnit").textContent = p.unit;
    $("#tierNote").textContent = state.tier === 1 ? "标准托管 · 7×24 远程运维" : "高可用托管 · 双路网络 + 15min 响应";
    $("#occValue").textContent = `${state.occ}%`;
    $("#netMonthly").textContent = formatMoney(net);
    $("#netMonthlyHint").textContent = `${state.qty} 台 ${p.name} · ${state.occ}% 出租率`;
    $("#annualYield").textContent = `${annual.toFixed(1)}%`;
    $("#payback").innerHTML = `${monthText(payback)} <small>月</small>`;
    $("#cum5").textContent = compactMoney(net * 60);
    $("#residual").textContent = compactMoney(residual);
    $("#bGross").textContent = formatMoney(gross);
    $("#bHost").textContent = "−" + formatMoney(hosting);
    $("#bFee").textContent = "−" + formatMoney(fee);
    $("#bHost").parentElement.style.setProperty("--w", `${Math.min(hosting / Math.max(gross, 1) * 100, 100)}%`);
    $("#bFee").parentElement.style.setProperty("--w", `${Math.min(fee / Math.max(gross, 1) * 100, 100)}%`);
    $("#residual").parentElement.querySelector("em").textContent = `参考 ${Math.round(p.residualRate * 100)}%`;

    const fill = ((state.occ - 60) / 40) * 100;
    occRange.style.setProperty("--fill", `${fill}%`);
    qtyInput.value = String(state.qty);
    renderChart(capex, net);
  };

  const setModel = (id, resetOccupancy = false) => {
    if (!PRODUCTS[id]) return;
    state.model = id;
    if (resetOccupancy) state.occ = PRODUCTS[id].occupancy;
    updateCalculator();
  };

  calcModelTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.occ = PRODUCTS[tab.dataset.model].occupancy;
      setModel(tab.dataset.model);
    });
  });

  calcTierTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.tier = Number(tab.dataset.tier);
      updateCalculator();
    });
  });

  const setQty = (value) => {
    const parsed = Number.parseInt(value, 10);
    state.qty = Number.isFinite(parsed) ? Math.min(20, Math.max(1, parsed)) : 1;
    updateCalculator();
  };

  $("#qtyMinus")?.addEventListener("click", () => setQty(state.qty - 1));
  $("#qtyPlus")?.addEventListener("click", () => setQty(state.qty + 1));
  qtyInput?.addEventListener("change", (event) => setQty(event.target.value));
  qtyInput?.addEventListener("input", (event) => {
    if (event.target.value.length > 2) setQty(event.target.value);
  });
  $$(".quick-qty [data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => setQty(btn.dataset.qty));
  });
  occRange?.addEventListener("input", (event) => {
    state.occ = Number(event.target.value);
    updateCalculator();
  });

  /* ---------------- hosting node map ---------------- */

  const nodeButtons = $$(".map-node");
  const setNode = (id) => {
    const node = NODES[id];
    if (!node) return;
    nodeButtons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.node === id));
    $("#nodeCode").textContent = node.code;
    $("#nodeName").textContent = node.name;
    $("#nodeSub").textContent = node.sub;
    $("#nodePue").textContent = node.pue;
    $("#nodeGreen").textContent = node.green;
    $("#nodeLatency").textContent = node.latency;
    $("#nodeSlots").textContent = node.slots;
    const latencyLabel = $("#nodeLatency")?.closest("div")?.querySelector("span");
    if (latencyLabel) latencyLabel.textContent = node.label;
  };
  nodeButtons.forEach((btn) => btn.addEventListener("click", () => setNode(btn.dataset.node)));

  /* ---------------- share / referral ---------------- */

  const makeCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "LS-";
    const values = new Uint8Array(4);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(values);
    else for (let i = 0; i < values.length; i += 1) values[i] = Math.floor(Math.random() * 256);
    for (let i = 0; i < 4; i += 1) code += chars[values[i] % chars.length];
    return code;
  };

  let referralCode = "";
  try {
    referralCode = localStorage.getItem("lansuan_referral_code") || "";
    if (!/^LS-[A-Z0-9]{4}$/.test(referralCode)) {
      referralCode = makeCode();
      localStorage.setItem("lansuan_referral_code", referralCode);
    }
  } catch (error) {
    referralCode = makeCode();
  }

  const buildShareUrl = () => {
    if (location.protocol === "http:" || location.protocol === "https:") {
      const url = new URL(location.href);
      url.hash = "";
      url.search = "";
      url.pathname = url.pathname.replace(/index\.html$/i, "");
      return `${url.toString()}${url.toString().includes("?") ? "&" : "?"}ref=${referralCode}`;
    }
    return `https://lansuan.example/i/${referralCode}`;
  };

  const shareUrl = buildShareUrl();
  const displayShareUrl = shareUrl.replace(/^https?:\/\//, "");

  const renderQr = (container, text, cellSize = 6) => {
    if (!container) return;
    try {
      if (typeof window.qrcode !== "function") throw new Error("QR library unavailable");
      const qr = window.qrcode(0, "M");
      qr.addData(text);
      qr.make();
      const img = document.createElement("img");
      img.src = qr.createDataURL(cellSize, 3);
      img.alt = "分享二维码";
      container.replaceChildren(img);
    } catch (error) {
      container.innerHTML = '<span style="font-size:7px;color:#777">QR</span>';
    }
  };

  const updateShareUi = () => {
    const product = PRODUCTS[state.shareProduct];
    $$("#shareCodeDisplay, #shareCode, #posterCode").forEach((el) => { el.textContent = referralCode; });
    $$("#shareLinkText, #shareUrlText").forEach((el) => { el.textContent = displayShareUrl; });
    const tierEl = $(".share-tier");
    if (tierEl) tierEl.textContent = `${state.shareTier.label} · ${state.shareTier.rate}`;
    $("#posterProductImage").src = product.image;
    $("#posterProductImage").alt = `${product.full} 产品图`;
    $("#posterTag").textContent = `${product.name} / ${product.id === "r4090" ? "8-GPU" : "8-GPU"}`;
    $("#posterRent").textContent = formatMoney(product.rent);
    $("#posterPrice").textContent = formatMoney(product.price);
    $$(".poster-product-tabs button").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.posterProduct === state.shareProduct));
    renderQr($("#miniQr"), shareUrl, 4);
    renderQr($("#posterQr"), shareUrl, 4);
    renderQr($("#shareQr"), shareUrl, 5);
  };

  const openShare = (tier = "share", productId = state.model) => {
    state.shareTier = tier === "partner"
      ? { label: "合伙人", rate: "1.0%" }
      : tier === "city"
        ? { label: "城市主理人", rate: "1.5%" }
        : { label: "分享官", rate: "0.6%" };
    state.shareProduct = PRODUCTS[productId] ? productId : "h200";
    updateShareUi();
    showDialog(shareDialog);
  };

  ["#openShareBtn", "#openShareBtn2", "#posterMini"].forEach((selector) => {
    $(selector)?.addEventListener("click", () => openShare("share", state.model));
  });
  $$("[data-open-share]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tier = btn.dataset.openShare;
      if (tier === "share") {
        openShare("share", state.model);
        return;
      }
      const interest = $("#contactForm")?.elements.interest;
      if (interest) interest.value = "成为澜算合伙人";
      document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast(tier === "city" ? "已预填城市主理人合作意向，请留下联系方式" : "已预填合伙人申请，请留下联系方式");
    });
  });
  $("#calcShareBtn")?.addEventListener("click", () => openShare("share", state.model));

  $$(".poster-product-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.shareProduct = btn.dataset.posterProduct;
      updateShareUi();
    });
  });

  const fallbackCopy = (text) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.remove();
      return ok;
    } catch (error) {
      return false;
    }
  };

  const copyText = async (text, message) => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (error) {
      copied = false;
    }
    if (!copied) copied = fallbackCopy(text);
    toast(copied ? (message || "已复制到剪贴板") : "复制失败，请手动选择文本");
  };

  const inviteText = () => {
    const p = PRODUCTS[state.shareProduct];
    return `我在看澜算的 ${p.full}：采购、托管、租赁一站式。参考月租 ${formatMoney(p.rent)}。用我的专属码 ${referralCode} 了解方案：${shareUrl}\n（收益为情景测算，不构成保本或收益承诺）`;
  };

  ["#copyLinkBtn", "#shareCopyLink"].forEach((selector) => {
    $(selector)?.addEventListener("click", () => copyText(shareUrl, "专属链接已复制"));
  });
  ["#copyInviteBtn", "#copyPosterText"].forEach((selector) => {
    $(selector)?.addEventListener("click", () => copyText(inviteText(), "邀请文案已复制"));
  });

  $$("[data-asset]").forEach((btn) => {
    btn.addEventListener("click", () => toast(`${btn.dataset.asset}素材包已加入下载（演示）`));
  });

  /* ---------------- poster PNG export ---------------- */

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const drawPosterCanvas = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext("2d");
    const product = PRODUCTS[state.shareProduct];

    ctx.fillStyle = "#0a0e0b";
    ctx.fillRect(0, 0, 1080, 1440);

    const glow = ctx.createRadialGradient(790, 400, 10, 790, 400, 620);
    glow.addColorStop(0, "rgba(201,241,91,.22)");
    glow.addColorStop(0.45, "rgba(201,241,91,.055)");
    glow.addColorStop(1, "rgba(201,241,91,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1440);

    ctx.strokeStyle = "rgba(201,241,91,.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1080; x += 54) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1440);
      ctx.stroke();
    }
    for (let y = 0; y <= 1440; y += 54) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1080, y);
      ctx.stroke();
    }

    ctx.fillStyle = "#c9f15b";
    ctx.beginPath();
    ctx.roundRect(72, 60, 54, 54, 13);
    ctx.fill();
    ctx.strokeStyle = "#0a0e0b";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    [[88, 78], [88, 87], [88, 96]].forEach(([x, y], index) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(index === 1 ? 118 : 126, y);
      ctx.stroke();
    });
    ctx.fillStyle = "#c9f15b";
    ctx.beginPath();
    ctx.arc(124, 87, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f2eee2";
    ctx.font = '700 36px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("澜算", 145, 103);
    ctx.fillStyle = "rgba(242,239,230,.48)";
    ctx.font = '500 12px "Consolas", monospace';
    ctx.letterSpacing = "3px";
    ctx.fillText("LANSUAN", 224, 102);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(242,239,230,.42)";
    ctx.font = '500 12px "Consolas", monospace';
    ctx.fillText("INVITE / 2026", 1008, 96);
    ctx.textAlign = "left";

    ctx.fillStyle = "#c9f15b";
    ctx.font = '500 12px "Consolas", monospace';
    ctx.fillText("GPU ASSET · OWN · HOST · EARN", 72, 171);

    ctx.fillStyle = "#f2eee2";
    ctx.font = '800 76px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("一起持有", 68, 270);
    ctx.fillText("AI 时代的", 68, 355);
    ctx.fillStyle = "#f2eee2";
    ctx.font = '700 76px "Songti SC", "SimSun", serif';
    ctx.fillText("算力资产。", 68, 440);

    ctx.strokeStyle = "rgba(201,241,91,.6)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(68, 473);
    ctx.lineTo(280, 473);
    ctx.stroke();

    ctx.fillStyle = "rgba(16,23,17,.55)";
    ctx.beginPath();
    ctx.roundRect(45, 520, 990, 470, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(201,241,91,.13)";
    ctx.lineWidth = 1;
    ctx.stroke();

    try {
      const img = await loadImage((window.LANSUAN_POSTER_IMAGES && window.LANSUAN_POSTER_IMAGES[product.id]) || product.image);
      const maxW = 930;
      const maxH = 430;
      const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      const w = img.naturalWidth * ratio;
      const h = img.naturalHeight * ratio;
      ctx.drawImage(img, (1080 - w) / 2, 542 + (430 - h) / 2, w, h);
    } catch (error) {
      ctx.fillStyle = "#c9f15b";
      ctx.font = '600 26px "Microsoft YaHei", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(`${product.name} · 8-GPU NODE`, 540, 770);
      ctx.textAlign = "left";
    }

    ctx.fillStyle = "rgba(201,241,91,.12)";
    ctx.beginPath();
    ctx.roundRect(900, 548, 108, 34, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(201,241,91,.35)";
    ctx.stroke();
    ctx.fillStyle = "#c9f15b";
    ctx.font = '500 13px "Consolas", monospace';
    ctx.textAlign = "center";
    ctx.fillText(`${product.name} / 8-GPU`, 954, 571);
    ctx.textAlign = "left";

    ctx.strokeStyle = "rgba(242,239,230,.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(72, 1032);
    ctx.lineTo(1008, 1032);
    ctx.stroke();

    ctx.fillStyle = "rgba(242,239,230,.42)";
    ctx.font = '400 16px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("参考月租", 72, 1071);
    ctx.fillText("含税起售价", 382, 1071);
    ctx.fillStyle = "#f2eee2";
    ctx.font = '500 34px "Consolas", monospace';
    ctx.fillText(formatMoney(product.rent), 72, 1111);
    ctx.fillText(formatMoney(product.price), 382, 1111);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(72, 1160, 206, 206, 8);
    ctx.fill();
    try {
      if (typeof window.qrcode === "function") {
        const qr = window.qrcode(0, "M");
        qr.addData(shareUrl);
        qr.make();
        const qrImg = await loadImage(qr.createDataURL(7, 0));
        ctx.drawImage(qrImg, 82, 1170, 186, 186);
      }
    } catch (error) {
      ctx.fillStyle = "#0a0e0b";
      ctx.font = '500 14px "Consolas", monospace';
      ctx.fillText("QR", 160, 1275);
    }

    ctx.fillStyle = "#f2eee2";
    ctx.font = '600 22px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("扫码了解方案", 310, 1202);
    ctx.fillStyle = "rgba(242,239,230,.55)";
    ctx.font = '400 16px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText(`专属顾问 · 林舟    邀请码 ${referralCode}`, 310, 1239);
    ctx.fillText("400-820-2026", 310, 1272);
    ctx.fillStyle = "#c9f15b";
    ctx.font = '500 13px "Consolas", monospace';
    ctx.fillText("LANSUAN / GPU ASSET INFRASTRUCTURE", 310, 1315);

    ctx.fillStyle = "rgba(242,239,230,.28)";
    ctx.font = '400 13px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("收益为基于假设情景的演示测算，不构成保本、保收益承诺。", 72, 1397);

    return canvas;
  };

  $("#downloadPoster")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = "正在生成…";
    try {
      await document.fonts.ready;
      const canvas = await drawPosterCanvas();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Canvas export failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lansuan-poster-${referralCode}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast("海报已生成，请查看下载文件");
    } catch (error) {
      toast("当前预览环境不支持导出，部署到服务器后可下载 PNG");
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  });

  /* ---------------- contact form ---------------- */

  const contactForm = $("#contactForm");
  const formSuccess = $("#formSuccess");
  const budgetButtons = $$(".budget-chips button");
  const budgetInput = $('input[name="budget"]');

  budgetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      budgetButtons.forEach((item) => item.classList.toggle("is-active", item === btn));
      if (budgetInput) budgetInput.value = btn.dataset.budget;
    });
  });

  $$("#contactForm input, #contactForm textarea").forEach((input) => {
    input.addEventListener("input", () => input.closest(".field")?.classList.remove("is-invalid"));
  });

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = contactForm.elements.name;
    const phone = contactForm.elements.phone;
    const consent = contactForm.elements.consent;
    let valid = true;
    [name, phone].forEach((field) => {
      const fieldWrap = field.closest(".field");
      const empty = field === name ? !field.value.trim() : field.value.trim().length < 6;
      fieldWrap?.classList.toggle("is-invalid", empty);
      if (empty) valid = false;
    });
    if (!consent.checked) {
      valid = false;
      toast("请先勾选信息使用同意");
    }
    if (!valid) {
      if (!name.value.trim()) name.focus();
      else if (phone.value.trim().length < 6) phone.focus();
      return;
    }
    contactForm.hidden = true;
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  $("#resetFormBtn")?.addEventListener("click", () => {
    contactForm.reset();
    contactForm.hidden = false;
    formSuccess.hidden = true;
    budgetButtons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.budget === "50–200万"));
    if (budgetInput) budgetInput.value = "50–200万";
    contactForm.elements.name?.focus();
  });

  /* ---------------- referral landing note ---------------- */

  const params = new URLSearchParams(location.search);
  const incomingRef = params.get("ref");
  if (incomingRef && /^LS-[A-Z0-9]{4}$/.test(incomingRef)) {
    try { localStorage.setItem('lansuan_attributed_ref', incomingRef); } catch (error) { /* storage unavailable */ }
    const refField = $('#formRef');
    if (refField) refField.value = incomingRef;
    setTimeout(() => toast(`已记录邀请关系 · 来自 ${incomingRef}`), 900);
  }

  /* ---------------- boot ---------------- */

  updateShareUi();
  updateCalculator();

  // Keep an accessible pressed state for the filter group.
  filterTabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.classList.contains("is-active"))));
})();
