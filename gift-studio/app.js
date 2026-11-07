/* =========================================================
   礼序 LIXU — storefront behaviour
   • logo upload + local preview
   • per-product colour, finish, scale, rotation, drag
   • catalog filtering, bundle loading, quote drawer
   • canvas export of the live mockup
   ========================================================= */
(function () {
  "use strict";

  const API = window.LIXU;
  if (!API) {
    console.error("LIXU product library failed to load.");
    return;
  }

  const { PRODUCTS, SAMPLE_LOGO, renderProductSVG, utils } = API;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const byId = (id) => PRODUCTS.find((product) => product.id === id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const pad = (number) => String(number).padStart(2, "0");
  const money = (number) => `¥${Number(number).toLocaleString("zh-CN")}`;
  const FINISH_LABEL = { original: "原色", white: "纯白", dark: "单黑" };
  const DEFAULT_CUSTOM = () => ({ scale: 1, rotation: 0, offsetX: 0, offsetY: 0, finish: "original" });
  const STORAGE_KEY = "lixu-gift-quote-v1";
  const ORDER_KEY = "lixu-last-order-v1";

  const els = {
    header: $("#site-header"),
    menuToggle: $("#menu-toggle"),
    siteNav: $("#site-nav"),
    quoteCount: $("#quote-count"),
    openQuote: $("#open-quote"),
    drawer: $("#quote-drawer"),
    drawerBackdrop: $("#drawer-backdrop"),
    closeQuote: $("#close-quote"),
    drawerScroll: $("#drawer-scroll"),
    drawerCount: $("#drawer-count"),
    quoteItems: $("#quote-items"),
    quoteEmpty: $("#quote-empty"),
    quoteFormWrap: $("#quote-form-wrap"),
    quoteForm: $("#quote-form"),
    quoteTotal: $("#quote-total"),
    quoteSuccess: $("#quote-success"),
    successCopy: $("#success-copy"),
    successRef: $("#success-ref"),
    successClose: $("#success-close"),
    emptyBrowse: $("#empty-browse"),
    downloadQuote: $("#download-quote"),
    dropzone: $("#dropzone"),
    logoInput: $("#logo-input"),
    uploadThumbImg: $("#upload-thumb-img"),
    uploadTitle: $("#upload-title"),
    uploadMeta: $("#upload-meta"),
    samplePill: $("#sample-pill"),
    useSample: $("#use-sample"),
    colorName: $("#color-name"),
    colorSwatches: $("#color-swatches"),
    finishTabs: $("#finish-tabs"),
    logoSize: $("#logo-size"),
    logoRotation: $("#logo-rotation"),
    sizeOutput: $("#size-output"),
    rotationOutput: $("#rotation-output"),
    resetLogo: $("#reset-logo"),
    stage: $("#stage"),
    stageArt: $("#stage-art"),
    stageLogo: $("#stage-logo"),
    stageLogoImg: $("#stage-logo-img"),
    stageName: $("#stage-name"),
    stageCraft: $("#stage-craft"),
    stageCaption: $("#stage-caption"),
    stagePrice: $("#stage-price"),
    stageMoq: $("#stage-moq"),
    productIndex: $("#product-index"),
    stageLabel: $(".stage-label"),
    stageHint: $("#stage-hint"),
    productStrip: $("#product-strip"),
    addQuote: $("#add-quote"),
    downloadMockup: $("#download-mockup"),
    bgButtons: $$("[data-bg]"),
    filters: $("#filters"),
    search: $("#catalog-search"),
    productGrid: $("#product-grid"),
    catalogEmpty: $("#catalog-empty"),
    catalogCount: $("#catalog-count"),
    clearFilters: $("#clear-filters"),
    bundleGrid: $("#bundle-grid"),
    toastStack: $("#toast-stack"),
  };

  const state = {
    productId: "tote",
    filter: "全部",
    query: "",
    colors: Object.fromEntries(PRODUCTS.map((p) => [p.id, 0])),
    custom: {},
    logo: {
      src: SAMPLE_LOGO,
      name: "示例品牌 MONO",
      meta: "SVG · 示例文件 · 点击上传你的 Logo",
      isSample: true,
      img: null,
    },
    darkStage: false,
    quote: loadQuote(),
    lastOrder: null,
    lastFocus: null,
  };

  let searchTimer = 0;
  let drawerCloseTimer = 0;
  let sampleImage = null;
  let drag = null;

  const currentProduct = () => byId(state.productId) || PRODUCTS[0];

  function getCustom(id) {
    if (!state.custom[id]) state.custom[id] = DEFAULT_CUSTOM();
    return state.custom[id];
  }

  function colorFor(product) {
    const index = state.colors[product.id] || 0;
    return product.colors[index] || product.colors[0];
  }

  function colorIndexFor(product) {
    const index = state.colors[product.id] || 0;
    return index >= 0 && index < product.colors.length ? index : 0;
  }

  function logoStyle(product, custom) {
    const x = product.print.x / 10 + (custom.offsetX || 0);
    const y = product.print.y / 10 + (custom.offsetY || 0);
    const width = (product.print.w / 10) * (custom.scale || 1);
    const height = (product.print.h / 10) * (custom.scale || 1);
    const rotation = (product.baseRotation || 0) + (custom.rotation || 0);
    return `left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;width:${width.toFixed(2)}%;height:${height.toFixed(2)}%;transform:translate(-50%,-50%) rotate(${rotation.toFixed(2)}deg);`;
  }

  function logoBoxHTML(product, custom) {
    const finish = custom.finish || "original";
    return `<div class="art-logo finish-${finish}" style="${logoStyle(product, custom)}"></div>`;
  }

  function setRootLogo() {
    const safe = String(state.logo.src).replace(/["\\\r\n]/g, "");
    document.documentElement.style.setProperty("--logo-url", `url("${safe}")`);
  }

  function updateLogoUI() {
    els.uploadThumbImg.src = state.logo.src;
    els.uploadTitle.textContent = state.logo.name;
    els.uploadMeta.textContent = state.logo.meta;
    els.samplePill.hidden = !state.logo.isSample;
    els.useSample.hidden = state.logo.isSample;
    els.stageLogoImg.src = state.logo.src;
  }

  /* ---------- Product preview rendering ---------- */

  function renderStage() {
    const product = currentProduct();
    const custom = getCustom(product.id);
    els.stageArt.innerHTML = renderProductSVG(product, colorFor(product));
    els.stage.style.setProperty("--scene", product.scene);
    els.stage.classList.toggle("is-dark", state.darkStage);
    els.stageLabel.textContent = `MOCKUP / ${pad(PRODUCTS.indexOf(product) + 1)}`;
    applyStageLogo();
    renderControls();
  }

  function applyStageLogo() {
    const product = currentProduct();
    const custom = getCustom(product.id);
    els.stageLogo.setAttribute("style", logoStyle(product, custom));
    els.stageLogo.className = `stage-logo finish-${custom.finish || "original"}`;
    if (els.stageLogoImg.getAttribute("src") !== state.logo.src) {
      els.stageLogoImg.src = state.logo.src;
    }
    els.stageLogo.setAttribute("aria-label", `你的 Logo 在${product.name}上的预览，可拖动或使用方向键调整位置`);
  }

  function renderControls() {
    const product = currentProduct();
    const custom = getCustom(product.id);
    const color = colorFor(product);
    const index = PRODUCTS.indexOf(product);

    els.productIndex.textContent = pad(index + 1);
    els.stageName.textContent = product.name;
    els.stageCraft.textContent = product.craft;
    els.stageCaption.textContent = product.craft;
    els.stagePrice.textContent = product.price;
    els.stageMoq.textContent = product.moq;
    els.colorName.textContent = color.name;

    els.colorSwatches.innerHTML = product.colors
      .map(
        (item, itemIndex) =>
          `<button class="swatch" type="button" style="--swatch:${item.body}" data-color="${itemIndex}" aria-pressed="${itemIndex === colorIndexFor(product)}" aria-label="${item.name}" title="${item.name}"></button>`
      )
      .join("");

    $$("[data-finish]", els.finishTabs).forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.finish === (custom.finish || "original")));
    });

    setRange(els.logoSize, Math.round((custom.scale || 1) * 100));
    setRange(els.logoRotation, custom.rotation || 0);
    els.sizeOutput.textContent = `${Math.round((custom.scale || 1) * 100)}%`;
    els.rotationOutput.textContent = `${Math.round(custom.rotation || 0)}°`;
  }

  function setRange(input, value) {
    const min = Number(input.min);
    const max = Number(input.max);
    input.value = String(value);
    const progress = ((Number(value) - min) / (max - min)) * 100;
    input.style.setProperty("--progress", `${clamp(progress, 0, 100)}%`);
  }

  function renderStrip() {
    els.productStrip.innerHTML = PRODUCTS.map((product, index) => {
      const color = colorFor(product);
      return `<button class="strip-item${product.id === state.productId ? " is-active" : ""}" type="button" data-product="${product.id}" aria-pressed="${product.id === state.productId}" title="${product.name}" style="--strip-scene:${product.scene}">
        <span class="strip-thumb">${renderProductSVG(product, color)}</span>
        <span>${product.name}</span>
      </button>`;
    }).join("");
  }

  function updateStripActive() {
    $$(".strip-item", els.productStrip).forEach((button) => {
      const active = button.dataset.product === state.productId;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderHero() {
    $$("[data-hero-product]").forEach((node) => {
      const product = byId(node.dataset.heroProduct);
      if (!product) return;
      const custom = getCustom(product.id);
      node.innerHTML = `<div class="hero-mockup">${renderProductSVG(product, colorFor(product))}${logoBoxHTML(product, custom)}</div>`;
    });
  }

  function renderCatalog() {
    const query = state.query.trim().toLowerCase();
    const filtered = PRODUCTS.filter((product) => {
      const inCategory = state.filter === "全部" || product.category === state.filter;
      if (!inCategory) return false;
      if (!query) return true;
      const haystack = [product.name, product.en, product.category, product.craft, product.size, product.desc, product.tag].join(" ").toLowerCase();
      return haystack.includes(query);
    });

    els.productGrid.innerHTML = filtered
      .map((product) => {
        const custom = getCustom(product.id);
        const color = colorFor(product);
        return `<article class="product-card" data-id="${product.id}">
          <div class="card-visual" style="--scene:${product.scene}" aria-hidden="true">
            <span class="card-tag">${product.tag}</span>
            <div class="mini-mockup">${renderProductSVG(product, color)}${logoBoxHTML(product, custom)}</div>
            <button class="quick-add" type="button" data-add="${product.id}" aria-label="将${product.name}加入选品单"><svg class="icon"><use href="#i-plus"></use></svg></button>
          </div>
          <div class="card-body">
            <div class="card-top"><span>${product.category} / ${product.en}</span><span>${product.moq} 件起</span></div>
            <h3>${product.name}</h3>
            <p class="card-spec">${product.craft} · ${product.size}</p>
            <div class="card-foot">
              <span class="card-price">¥${product.price}<small>起</small></span>
              <button class="card-link" type="button" data-select="${product.id}">定制预览 <svg class="icon"><use href="#i-arrow"></use></svg></button>
            </div>
          </div>
        </article>`;
      })
      .join("");

    const hasResults = filtered.length > 0;
    if (hasResults && state.filter === "全部" && !query) {
      els.productGrid.insertAdjacentHTML(
        "beforeend",
        `<article class="catalog-cta">
          <div class="catalog-cta-copy">
            <span class="catalog-cta-eyebrow">NOT SURE YET?</span>
            <h3>没找到合适的？<br><em>告诉我们场景。</em></h3>
            <p>不必先想清楚要送什么。说清送给谁、预算多少，礼赠顾问会给你 3 套可选方案。</p>
          </div>
          <div class="catalog-cta-action">
            <button class="catalog-cta-btn" type="button" data-contact>和礼赠顾问聊聊 ↗</button>
            <span>1 个工作日内回复 · 不收费</span>
          </div>
          <div class="catalog-cta-mark" aria-hidden="true">礼</div>
        </article>`
      );
    }
    els.catalogEmpty.hidden = hasResults;
    if (els.catalogCount) els.catalogCount.textContent = String(PRODUCTS.length);
  }

  const BUNDLES = [
    {
      id: "onboarding",
      index: "01",
      tag: "ONBOARDING",
      title: "新同事入职礼",
      desc: "让第一天，有点仪式感。",
      ids: ["tote", "mug", "notebook"],
      moq: 50,
      bg: "#17382f",
      ink: "#fbf8f1",
      className: "",
    },
    {
      id: "thankyou",
      index: "02",
      tag: "CLIENT CARE",
      title: "客户答谢礼",
      desc: "不贵重，但每天都能用到。",
      ids: ["tumbler", "keyring"],
      moq: 30,
      bg: "#e8623d",
      ink: "#171915",
      className: "bundle-card--two",
    },
    {
      id: "expo",
      index: "03",
      tag: "TRADE SHOW",
      title: "展会引流礼",
      desc: "让人愿意带走，也记得住。",
      ids: ["cap", "pen", "powerbank"],
      moq: 30,
      bg: "#d9ed8a",
      ink: "#17382f",
      className: "",
    },
  ];

  function renderBundles() {
    els.bundleGrid.innerHTML = BUNDLES.map((bundle) => {
      const products = bundle.ids.map(byId).filter(Boolean);
      const price = products.reduce((sum, product) => sum + product.price, 0);
      const objects = products
        .map((product) => {
          const custom = getCustom(product.id);
          return `<div class="bundle-object">${renderProductSVG(product, colorFor(product))}${logoBoxHTML(product, custom)}</div>`;
        })
        .join("");

      return `<article class="bundle-card ${bundle.className}" style="--bundle-bg:${bundle.bg};--bundle-ink:${bundle.ink}">
        <div class="bundle-top"><span>${bundle.index} / ${bundle.tag}</span><span>${products.length} PIECES</span></div>
        <div class="bundle-art" aria-hidden="true">${objects}</div>
        <div class="bundle-body">
          <h3>${bundle.title}</h3>
          <p class="bundle-desc">${bundle.desc}</p>
          <div class="bundle-includes">${products.map((product) => `<span>${product.name}</span>`).join("")}</div>
        </div>
        <div class="bundle-foot">
          <div class="bundle-price">¥${price}<small> / 套起 · ${bundle.moq} 套</small></div>
          <button class="bundle-add" type="button" data-bundle="${bundle.id}">载入这套 <svg class="icon"><use href="#i-plus"></use></svg></button>
        </div>
      </article>`;
    }).join("");
  }

  /* ---------- Quote ---------- */

  function finishLabel(finish) {
    return FINISH_LABEL[finish] || FINISH_LABEL.original;
  }

  function loadQuote() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      const seen = new Set();
      return raw.reduce((items, item) => {
        const product = PRODUCTS.find((p) => p.id === item.id);
        if (!product) return items;
        const color = Number.isInteger(item.color) && item.color >= 0 && item.color < product.colors.length ? item.color : 0;
        const finish = FINISH_LABEL[item.finish] ? item.finish : "original";
        const qty = Math.max(product.moq, parseInt(item.qty, 10) || product.moq);
        const key = `${product.id}|${color}|${finish}`;
        if (seen.has(key)) return items;
        seen.add(key);
        items.push({ key, id: product.id, color, finish, qty });
        return items;
      }, []);
    } catch (error) {
      return [];
    }
  }

  function saveQuote() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.quote));
    } catch (error) {
      /* storage can be unavailable in private mode — preview still works */
    }
  }

  function quoteTotal() {
    return state.quote.reduce((sum, entry) => {
      const product = byId(entry.id);
      return product ? sum + product.price * entry.qty : sum;
    }, 0);
  }

  function updateQuoteCount(bump = false) {
    const count = state.quote.length;
    els.quoteCount.textContent = String(count);
    els.drawerCount.textContent = String(count);
    els.quoteCount.classList.toggle("has-items", count > 0);
    if (bump) {
      els.quoteCount.classList.remove("bump");
      void els.quoteCount.offsetWidth;
      els.quoteCount.classList.add("bump");
      window.setTimeout(() => els.quoteCount.classList.remove("bump"), 520);
    }
  }

  function updateQuoteTotal() {
    if (els.quoteTotal) els.quoteTotal.textContent = money(quoteTotal());
  }

  function renderQuote() {
    const hasItems = state.quote.length > 0;
    updateQuoteCount();
    updateQuoteTotal();

    if (hasItems) {
      els.quoteSuccess.hidden = true;
      els.quoteEmpty.hidden = true;
      els.quoteFormWrap.hidden = false;
      els.quoteItems.innerHTML = state.quote
        .map((entry) => {
          const product = byId(entry.id);
          if (!product) return "";
          const color = product.colors[entry.color] || product.colors[0];
          const miniCustom = { scale: 1, rotation: 0, offsetX: 0, offsetY: 0, finish: entry.finish };
          return `<article class="quote-item" data-key="${entry.key}">
            <div class="quote-thumb" style="--quote-scene:${product.scene}">
              <div>${renderProductSVG(product, color)}${logoBoxHTML(product, miniCustom)}</div>
            </div>
            <div class="quote-info">
              <h4>${product.name}</h4>
              <p class="quote-meta">${color.name} · ${finishLabel(entry.finish)} · ${product.moq} 件起</p>
              <div class="quote-price">¥${product.price}<small> / 件</small></div>
            </div>
            <div class="quote-controls">
              <div class="qty-control">
                <button type="button" data-delta="-${product.moq}" data-key="${entry.key}" aria-label="减少数量">−</button>
                <input type="number" inputmode="numeric" value="${entry.qty}" min="${product.moq}" step="10" data-qty="${entry.key}" aria-label="${product.name}数量">
                <button type="button" data-delta="${product.moq}" data-key="${entry.key}" aria-label="增加数量">+</button>
              </div>
              <button class="remove-item" type="button" data-remove="${entry.key}" aria-label="移除${product.name}"><svg class="icon"><use href="#i-close"></use></svg></button>
            </div>
          </article>`;
        })
        .join("");
    } else {
      els.quoteItems.innerHTML = "";
      els.quoteFormWrap.hidden = true;
      if (!els.quoteSuccess.hidden) {
        els.quoteEmpty.hidden = true;
      } else {
        els.quoteEmpty.hidden = false;
      }
    }
  }

  function addToQuote(productId, options = {}) {
    const product = byId(productId);
    if (!product) return;
    const custom = getCustom(productId);
    const color = colorIndexFor(product);
    const finish = custom.finish || "original";
    const key = `${productId}|${color}|${finish}`;
    const existing = state.quote.find((entry) => entry.key === key);
    if (existing) {
      existing.qty += product.moq;
    } else {
      state.quote.push({ key, id: productId, color, finish, qty: product.moq });
    }
    saveQuote();
    renderQuote();
    updateQuoteCount(true);
    if (!options.silent) {
      toast(`${product.name} 已加入选品单`);
    }
  }

  function addBundle(bundleId) {
    const bundle = BUNDLES.find((item) => item.id === bundleId);
    if (!bundle) return;
    bundle.ids.forEach((id) => addToQuote(id, { silent: true }));
    openDrawer();
    toast(`「${bundle.title}」已载入，共 ${bundle.ids.length} 件`);
  }

  function removeQuoteItem(key) {
    state.quote = state.quote.filter((entry) => entry.key !== key);
    saveQuote();
    renderQuote();
    toast("已从选品单移除");
  }

  function setQuoteQty(key, value) {
    const entry = state.quote.find((item) => item.key === key);
    if (!entry) return;
    const product = byId(entry.id);
    if (!product) return;
    const qty = Math.max(product.moq, Math.min(999999, parseInt(value, 10) || product.moq));
    entry.qty = qty;
    saveQuote();
    updateQuoteTotal();
    return qty;
  }

  /* ---------- Drawer ---------- */

  function openDrawer() {
    window.clearTimeout(drawerCloseTimer);
    state.lastFocus = document.activeElement;
    els.drawerBackdrop.hidden = false;
    els.drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    window.requestAnimationFrame(() => {
      els.drawerBackdrop.classList.add("is-visible");
      els.drawer.classList.add("is-open");
    });
    window.setTimeout(() => {
      const focusTarget = els.quoteSuccess.hidden ? els.closeQuote : els.successClose;
      focusTarget.focus({ preventScroll: true });
    }, 50);
  }

  function closeDrawer() {
    els.drawer.classList.remove("is-open");
    els.drawerBackdrop.classList.remove("is-visible");
    els.drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    window.clearTimeout(drawerCloseTimer);
    drawerCloseTimer = window.setTimeout(() => {
      els.drawerBackdrop.hidden = true;
    }, 430);
    if (state.lastFocus && typeof state.lastFocus.focus === "function") {
      state.lastFocus.focus({ preventScroll: true });
    }
  }

  function resetDrawerAfterSuccess() {
    els.quoteSuccess.hidden = true;
    els.quoteEmpty.hidden = false;
    els.quoteFormWrap.hidden = true;
    els.drawerScroll.scrollTop = 0;
    updateQuoteCount();
  }

  /* ---------- Toasts ---------- */

  function toast(message) {
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    els.toastStack.appendChild(node);
    window.setTimeout(() => {
      node.classList.add("is-leaving");
      window.setTimeout(() => node.remove(), 320);
    }, 2800);
  }

  /* ---------- Logo upload ---------- */

  function formatBytes(bytes) {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function fileLabel(file) {
    const extension = (file.name.split(".").pop() || "").toUpperCase();
    if (extension) return extension;
    return file.type.replace("image/", "").toUpperCase() || "IMAGE";
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image could not be loaded"));
      image.src = src;
    });
  }

  function applyLogo(src, name, meta, isSample, image) {
    state.logo = { src, name, meta, isSample, img: image || null };
    setRootLogo();
    updateLogoUI();
    applyStageLogo();
    renderHero();
    renderCatalog();
    renderBundles();
    renderQuote();
    if (isSample) {
      els.stage.classList.remove("has-dragged");
    }
  }

  function handleFiles(fileList) {
    const file = fileList && fileList[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|svg|webp)$/i.test(file.name);
    if (!isImage) {
      toast("请上传 PNG、JPG、SVG 或 WebP 图片");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast("图片超过 8MB，请压缩后重试");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => toast("读取失败，请换一张图片重试");
    reader.onload = () => {
      const src = String(reader.result);
      loadImage(src)
        .then((image) => {
          applyLogo(src, file.name, `${fileLabel(file)} · ${formatBytes(file.size)} · 点击更换`, false, image);
          toast("Logo 已更新，正在为你预览");
          if (window.matchMedia("(max-width: 980px)").matches) {
            window.setTimeout(() => {
              els.stage.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 240);
          }
        })
        .catch(() => toast("这张图片无法识别，请换一个文件"));
    };
    reader.readAsDataURL(file);
  }

  function useSampleLogo() {
    const apply = (image) => {
      applyLogo(SAMPLE_LOGO, "示例品牌 MONO", "SVG · 示例文件 · 点击上传你的 Logo", true, image);
      toast("已恢复示例 Logo");
    };
    if (sampleImage && sampleImage.complete) {
      apply(sampleImage);
      return;
    }
    loadImage(SAMPLE_LOGO).then(apply).catch(() => toast("示例 Logo 加载失败"));
  }

  function preloadSample() {
    loadImage(SAMPLE_LOGO)
      .then((image) => {
        sampleImage = image;
        if (state.logo.isSample && !state.logo.img) state.logo.img = image;
      })
      .catch(() => {});
  }

  /* ---------- Catalog / selection ---------- */

  function selectProduct(productId, options = {}) {
    if (!byId(productId)) return;
    state.productId = productId;
    renderStage();
    updateStripActive();
    if (options.scroll) {
      const mobile = window.matchMedia("(max-width: 700px)").matches;
      const target = mobile ? $(".stage") : $(".studio-app");
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - (mobile ? 78 : 94);
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    }
  }

  function applyColor(index) {
    const product = currentProduct();
    if (!product.colors[index]) return;
    state.colors[product.id] = index;
    renderStage();
    renderHero();
    renderCatalog();
    renderBundles();
  }

  /* ---------- Export ---------- */

  function hexToRgba(hex, alpha) {
    const { r, g, b } = utils.toRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function paintBackdrop(context, size, product) {
    if (state.darkStage) {
      const base = context.createLinearGradient(0, 0, size, size);
      base.addColorStop(0, "#171e19");
      base.addColorStop(0.55, "#222b23");
      base.addColorStop(1, "#141a16");
      context.fillStyle = base;
      context.fillRect(0, 0, size, size);

      const glow = context.createRadialGradient(size * 0.5, size * 0.42, 0, size * 0.5, size * 0.5, size * 0.68);
      glow.addColorStop(0, "rgba(217, 237, 138, 0.15)");
      glow.addColorStop(0.5, "rgba(75, 95, 67, 0.05)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, size, size);
    } else {
      context.fillStyle = "#f4efe5";
      context.fillRect(0, 0, size, size);
      const wash = context.createRadialGradient(size * 0.5, size * 0.44, size * 0.02, size * 0.5, size * 0.5, size * 0.7);
      wash.addColorStop(0, "rgba(255, 253, 248, 0.98)");
      wash.addColorStop(0.42, hexToRgba(product.scene, 0.78));
      wash.addColorStop(1, hexToRgba(product.scene, 0.18));
      context.fillStyle = wash;
      context.fillRect(0, 0, size, size);
    }

    const dotColor = state.darkStage ? "rgba(255, 253, 248, 0.09)" : "rgba(23, 25, 21, 0.07)";
    context.fillStyle = dotColor;
    const gap = size / 31;
    const radius = Math.max(1, size * 0.0012);
    for (let y = gap / 2; y < size; y += gap) {
      for (let x = gap / 2; x < size; x += gap) {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  async function drawLogo(context, product, custom, size) {
    let image = state.logo.img;
    if (!image) {
      image = await loadImage(state.logo.src);
      state.logo.img = image;
    }

    const imageWidth = image.naturalWidth || 460;
    const imageHeight = image.naturalHeight || 160;
    const boxWidth = (product.print.w / 1000) * size * (custom.scale || 1);
    const boxHeight = (product.print.h / 1000) * size * (custom.scale || 1);
    const ratio = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
    const width = Math.max(1, imageWidth * ratio);
    const height = Math.max(1, imageHeight * ratio);
    const centerX = ((product.print.x + (custom.offsetX || 0) * 10) / 1000) * size;
    const centerY = ((product.print.y + (custom.offsetY || 0) * 10) / 1000) * size;
    const rotation = (((product.baseRotation || 0) + (custom.rotation || 0)) * Math.PI) / 180;

    let source = image;
    if (custom.finish === "white" || custom.finish === "dark") {
      const layer = document.createElement("canvas");
      layer.width = Math.ceil(width);
      layer.height = Math.ceil(height);
      const layerContext = layer.getContext("2d");
      layerContext.imageSmoothingQuality = "high";
      layerContext.drawImage(image, 0, 0, layer.width, layer.height);
      layerContext.globalCompositeOperation = "source-in";
      layerContext.fillStyle = custom.finish === "white" ? "#fffdf8" : "#171915";
      layerContext.fillRect(0, 0, layer.width, layer.height);
      source = layer;
    }

    context.save();
    context.translate(centerX, centerY);
    context.rotate(rotation);
    context.imageSmoothingQuality = "high";
    context.drawImage(source, -width / 2, -height / 2, width, height);
    context.restore();
  }

  async function downloadMockup() {
    const button = els.downloadMockup;
    const original = button.innerHTML;
    if (button.classList.contains("is-loading")) return;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    button.innerHTML = `<svg class="icon"><use href="#i-download"></use></svg> 生成中…`;

    try {
      const product = currentProduct();
      const custom = getCustom(product.id);
      const size = 1500;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      context.imageSmoothingQuality = "high";

      paintBackdrop(context, size, product);

      let svg = renderProductSVG(product, colorFor(product));
      svg = svg.replace(/^<svg /, `<svg width="${size}" height="${size}" `);
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      try {
        const productImage = await loadImage(url);
        context.drawImage(productImage, 0, 0, size, size);
      } finally {
        URL.revokeObjectURL(url);
      }

      await drawLogo(context, product, custom, size);

      const png = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!png) throw new Error("PNG export failed");

      const downloadUrl = URL.createObjectURL(png);
      const link = document.createElement("a");
      const safeName = product.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      link.download = `lixu-${safeName}-mockup.png`;
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1500);
      toast("效果图已下载，可直接发给团队");
    } catch (error) {
      console.error(error);
      toast("生成失败，请稍后再试或换一张 Logo");
    } finally {
      button.classList.remove("is-loading");
      button.removeAttribute("aria-busy");
      button.innerHTML = original;
    }
  }

  /* ---------- CSV ---------- */

  function csvCell(value) {
    return `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
  }

  function downloadQuoteCsv() {
    if (!state.quote.length) {
      toast("选品单还是空的");
      return;
    }
    const formData = new FormData(els.quoteForm);
    const company = String(formData.get("company") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const now = new Date();
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const rows = [
      ["礼序 LIXU 选品单"],
      ["生成日期", date],
      ["公司", company],
      ["联系人", contact],
      [],
      ["产品", "颜色", "工艺", "数量", "单价", "小计"],
    ];

    state.quote.forEach((entry) => {
      const product = byId(entry.id);
      if (!product) return;
      const color = product.colors[entry.color] || product.colors[0];
      rows.push([product.name, color.name, finishLabel(entry.finish), entry.qty, product.price, product.price * entry.qty]);
    });
    rows.push([], ["", "", "", "", "预估合计", quoteTotal()]);

    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `礼序-选品单-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("选品清单已导出");
  }

  /* ---------- Form ---------- */

  function submitQuote(event) {
    event.preventDefault();
    if (!state.quote.length) return;
    if (!els.quoteForm.reportValidity()) return;

    const formData = new FormData(els.quoteForm);
    const company = String(formData.get("company") || "").trim();
    const count = state.quote.reduce((sum, entry) => sum + entry.qty, 0);
    const lineCount = state.quote.length;
    const total = quoteTotal();
    const ref = `LX-${String(Date.now()).slice(-6)}`;
    const order = {
      ref,
      createdAt: new Date().toISOString(),
      company,
      contact: String(formData.get("contact") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      date: String(formData.get("date") || ""),
      note: String(formData.get("note") || "").trim(),
      items: state.quote.map((entry) => {
        const product = byId(entry.id);
        return { ...entry, name: product ? product.name : entry.id };
      }),
      total,
    };

    state.lastOrder = order;
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch (error) {
      /* local only */
    }

    els.successCopy.textContent = `已记录 ${company || "你的团队"} 的 ${state.quote.length} 项选品，共 ${count} 件，预估合计 ${money(total)}。`;
    els.successRef.textContent = ref;
    els.quoteSuccess.hidden = false;
    els.quoteFormWrap.hidden = true;
    els.quoteEmpty.hidden = true;
    els.quoteItems.innerHTML = "";
    els.quoteSuccess.scrollIntoView({ behavior: "smooth", block: "start" });

    state.quote = [];
    saveQuote();
    updateQuoteCount();
    els.drawerCount.textContent = String(lineCount);
    updateQuoteTotal();
    els.quoteForm.reset();
    toast("需求单已生成");
  }

  /* ---------- Events ---------- */

  function bindEvents() {
    window.addEventListener(
      "scroll",
      () => {
        els.header.classList.toggle("is-scrolled", window.scrollY > 8);
      },
      { passive: true }
    );
    els.header.classList.toggle("is-scrolled", window.scrollY > 8);

    els.menuToggle.addEventListener("click", () => {
      const open = !els.siteNav.classList.contains("is-open");
      els.siteNav.classList.toggle("is-open", open);
      els.menuToggle.setAttribute("aria-expanded", String(open));
      els.menuToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });
    els.siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        els.siteNav.classList.remove("is-open");
        els.menuToggle.setAttribute("aria-expanded", "false");
        els.menuToggle.setAttribute("aria-label", "打开菜单");
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) {
        els.siteNav.classList.remove("is-open");
        els.menuToggle.setAttribute("aria-expanded", "false");
      }
    });

    els.logoInput.addEventListener("change", (event) => {
      handleFiles(event.target.files);
      event.target.value = "";
    });
    els.useSample.addEventListener("click", useSampleLogo);

    ["dragenter", "dragover"].forEach((type) => {
      els.dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        event.stopPropagation();
        els.dropzone.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach((type) => {
      els.dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        event.stopPropagation();
        els.dropzone.classList.remove("is-dragover");
      });
    });
    els.dropzone.addEventListener("drop", (event) => {
      if (event.dataTransfer && event.dataTransfer.files.length) handleFiles(event.dataTransfer.files);
    });

    els.colorSwatches.addEventListener("click", (event) => {
      const button = event.target.closest("[data-color]");
      if (!button) return;
      applyColor(Number(button.dataset.color));
    });

    els.finishTabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-finish]");
      if (!button) return;
      const custom = getCustom(state.productId);
      custom.finish = button.dataset.finish;
      applyStageLogo();
      $$("[data-finish]", els.finishTabs).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      renderCatalog();
      renderBundles();
      renderQuote();
    });

    els.logoSize.addEventListener("input", (event) => {
      const custom = getCustom(state.productId);
      custom.scale = Number(event.target.value) / 100;
      setRange(event.target, event.target.value);
      els.sizeOutput.textContent = `${event.target.value}%`;
      applyStageLogo();
    });
    els.logoRotation.addEventListener("input", (event) => {
      const custom = getCustom(state.productId);
      custom.rotation = Number(event.target.value);
      setRange(event.target, event.target.value);
      els.rotationOutput.textContent = `${event.target.value}°`;
      applyStageLogo();
    });
    els.resetLogo.addEventListener("click", () => {
      const custom = getCustom(state.productId);
      Object.assign(custom, { scale: 1, rotation: 0, offsetX: 0, offsetY: 0 });
      applyStageLogo();
      setRange(els.logoSize, 100);
      setRange(els.logoRotation, 0);
      els.sizeOutput.textContent = "100%";
      els.rotationOutput.textContent = "0°";
      els.stage.classList.remove("has-dragged");
      toast("已重置 Logo 位置与大小");
    });

    els.bgButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.darkStage = button.dataset.bg === "dark";
        els.stage.classList.toggle("is-dark", state.darkStage);
        els.bgButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      });
    });

    els.productStrip.addEventListener("click", (event) => {
      const button = event.target.closest("[data-product]");
      if (button) selectProduct(button.dataset.product);
    });

    els.productGrid.addEventListener("click", (event) => {
      const contact = event.target.closest("[data-contact]");
      if (contact) {
        document.getElementById("contact").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const add = event.target.closest("[data-add]");
      if (add) {
        event.stopPropagation();
        addToQuote(add.dataset.add);
        return;
      }
      const select = event.target.closest("[data-select]");
      if (select) {
        selectProduct(select.dataset.select, { scroll: true });
        return;
      }
      const card = event.target.closest(".product-card");
      if (card) selectProduct(card.dataset.id, { scroll: true });
    });

    els.filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      state.filter = button.dataset.filter;
      $$(".filter", els.filters).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      renderCatalog();
    });
    els.search.addEventListener("input", (event) => {
      window.clearTimeout(searchTimer);
      const value = event.target.value;
      searchTimer = window.setTimeout(() => {
        state.query = value;
        renderCatalog();
      }, 110);
    });
    els.clearFilters.addEventListener("click", () => {
      state.filter = "全部";
      state.query = "";
      els.search.value = "";
      $$(".filter", els.filters).forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.filter === "全部")));
      renderCatalog();
    });

    els.bundleGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-bundle]");
      if (button) addBundle(button.dataset.bundle);
    });

    els.addQuote.addEventListener("click", () => addToQuote(state.productId));
    els.downloadMockup.addEventListener("click", downloadMockup);

    els.openQuote.addEventListener("click", openDrawer);
    els.closeQuote.addEventListener("click", closeDrawer);
    els.drawerBackdrop.addEventListener("click", closeDrawer);
    els.emptyBrowse.addEventListener("click", () => {
      closeDrawer();
      window.setTimeout(() => document.getElementById("collection").scrollIntoView({ behavior: "smooth", block: "start" }), 110);
    });
    els.successClose.addEventListener("click", () => {
      resetDrawerAfterSuccess();
      closeDrawer();
      window.setTimeout(() => document.getElementById("collection").scrollIntoView({ behavior: "smooth", block: "start" }), 110);
    });

    els.quoteItems.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-remove]");
      if (remove) {
        removeQuoteItem(remove.dataset.remove);
        return;
      }
      const delta = event.target.closest("[data-delta]");
      if (delta) {
        const entry = state.quote.find((item) => item.key === delta.dataset.key);
        if (!entry) return;
        const product = byId(entry.id);
        const next = Math.max(product.moq, entry.qty + Number(delta.dataset.delta));
        entry.qty = next;
        saveQuote();
        renderQuote();
        updateQuoteTotal();
      }
    });
    els.quoteItems.addEventListener("change", (event) => {
      const input = event.target.closest("[data-qty]");
      if (!input) return;
      const qty = setQuoteQty(input.dataset.qty, input.value);
      if (qty) input.value = String(qty);
    });

    els.quoteForm.addEventListener("submit", submitQuote);
    els.downloadQuote.addEventListener("click", downloadQuoteCsv);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.drawer.classList.contains("is-open")) {
        closeDrawer();
        return;
      }
      if (event.key === "Tab" && els.drawer.classList.contains("is-open")) {
        const focusable = $$(
          'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          els.drawer
        ).filter((element) => element.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    bindDragging();
    bindStageKeyboard();
  }

  function bindDragging() {
    els.stageLogo.tabIndex = 0;
    els.stageLogo.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      const rect = els.stage.getBoundingClientRect();
      const custom = getCustom(state.productId);
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: custom.offsetX || 0,
        originY: custom.offsetY || 0,
        width: rect.width,
        height: rect.height,
      };
      els.stageLogo.setPointerCapture(event.pointerId);
      els.stage.classList.add("is-dragging");
      event.preventDefault();
    });
    els.stageLogo.addEventListener("pointermove", (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const custom = getCustom(state.productId);
      const x = drag.originX + ((event.clientX - drag.startX) / drag.width) * 100;
      const y = drag.originY + ((event.clientY - drag.startY) / drag.height) * 100;
      custom.offsetX = Number(clamp(x, -32, 32).toFixed(2));
      custom.offsetY = Number(clamp(y, -32, 32).toFixed(2));
      els.stageLogo.setAttribute("style", logoStyle(currentProduct(), custom));
      event.preventDefault();
    });
    const finish = (event) => {
      if (!drag) return;
      drag = null;
      els.stage.classList.remove("is-dragging");
      els.stage.classList.add("has-dragged");
      try {
        els.stageLogo.releasePointerCapture(event.pointerId);
      } catch (error) {
        /* pointer may already be released */
      }
    };
    els.stageLogo.addEventListener("pointerup", finish);
    els.stageLogo.addEventListener("pointercancel", finish);
    els.stageLogo.addEventListener("dblclick", () => {
      const custom = getCustom(state.productId);
      custom.offsetX = 0;
      custom.offsetY = 0;
      els.stageLogo.setAttribute("style", logoStyle(currentProduct(), custom));
      toast("已把 Logo 移回中心");
    });
  }

  function bindStageKeyboard() {
    els.stageLogo.addEventListener("keydown", (event) => {
      const directions = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      const custom = getCustom(state.productId);
      const step = event.shiftKey ? 3 : 1;
      custom.offsetX = clamp((custom.offsetX || 0) + direction[0] * step, -32, 32);
      custom.offsetY = clamp((custom.offsetY || 0) + direction[1] * step, -32, 32);
      els.stageLogo.setAttribute("style", logoStyle(currentProduct(), custom));
      els.stage.classList.add("has-dragged");
    });
  }

  function setupReveal() {
    const elements = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    elements.forEach((element) => observer.observe(element));
  }

  function init() {
    setRootLogo();
    updateLogoUI();
    renderHero();
    renderStage();
    renderStrip();
    renderCatalog();
    renderBundles();
    renderQuote();
    updateQuoteCount();
    bindEvents();
    preloadSample();
    setupReveal();
    els.stageLogoImg.src = state.logo.src;
  }

  init();
})();
