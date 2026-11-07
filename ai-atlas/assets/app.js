/* AI ATLAS 2026 — interactions and rendering */
(function () {
  "use strict";

  const DATA = window.AI_ATLAS;
  if (!DATA || !Array.isArray(DATA.products)) {
    document.getElementById("productGrid").innerHTML =
      '<p style="color:#f1eee4">数据文件加载失败，请检查 assets/data.js。</p>';
    return;
  }

  const products = DATA.products.map((product, index) => ({ ...product, _index: index }));
  const categories = DATA.categories;
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const BOOKMARK_KEY = "ai-atlas-bookmarks-v1";

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  const state = {
    tab: "all",
    category: "all",
    query: "",
    sort: "reach",
    view: "grid",
    freeOnly: false,
    bookmarksOnly: false,
    bookmarks: loadBookmarks(),
    rankMap: new Map(),
    lastFocus: null
  };

  let searchTimer = 0;
  let toastTimer = 0;

  /* ── Utilities ───────────────────────────────── */

  function loadBookmarks() {
    try {
      const value = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
      return new Set(Array.isArray(value) ? value.filter((id) => typeof id === "string") : []);
    } catch (error) {
      return new Set();
    }
  }

  function persistBookmarks() {
    try {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Array.from(state.bookmarks)));
    } catch (error) {
      /* Local storage can be unavailable in private windows. */
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character]));
  }

  function formatCN(value) {
    if (value == null || Number.isNaN(Number(value)) || Number(value) === 0) return "—";
    const number = Number(value);
    if (number >= 100) {
      const billions = number / 100;
      const digits = billions >= 10 ? 1 : 2;
      return `${Number(billions.toFixed(digits))}亿`;
    }
    if (number >= 1) {
      return `${Math.round(number * 100).toLocaleString("en-US")}万`;
    }
    return `${Math.round(number * 1000) / 10}万`;
  }

  function formatRaw(value) {
    return value == null ? "" : String(value);
  }

  function formatGrowth(value) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const number = Number(value);
    return `${number >= 0 ? "+" : ""}${number.toFixed(1)}%`;
  }

  function reach(product) {
    return Math.max(
      Number(product.visits) || 0,
      Number(product.mau) || 0,
      (Number(product.downloads) || 0) * 3
    );
  }

  function displayColor(product) {
    const hex = String(product.color || "").replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(hex)) return "#d8ff3e";
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance < 0.2 ? "#d8ff3e" : product.color;
  }

  function initials(product) {
    const name = String(product.name || "AI").trim();
    if (/[\u3400-\u9fff]/.test(Array.from(name)[0] || "")) {
      return Array.from(name.replace(/\s/g, "")).slice(0, 2).join("");
    }
    const cleaned = name.replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
    const latin = cleaned.match(/[A-Za-z0-9]+/g);
    if (latin && latin.length) {
      if (latin.length > 1) {
        return latin.slice(0, 2).map((word) => word.charAt(0)).join("").toUpperCase();
      }
      return latin[0].slice(0, 2).toUpperCase();
    }
    return Array.from(cleaned.replace(/\s/g, "")).slice(0, 2).join("");
  }

  function typeLabel(type) {
    return type === "both" ? "双端" : type === "app" ? "APP" : "网站";
  }

  function typeFilter(type) {
    return type === "both" ? "双端产品" : type === "app" ? "移动应用" : "网站";
  }

  function priceLabel(type) {
    return type === "paid" ? "付费" : type === "free" ? "免费" : "免费增值";
  }

  function categoryName(id) {
    return categoryById.get(id)?.name || "其他";
  }

  function categoryColor(id) {
    return categoryById.get(id)?.color || "#d8ff3e";
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function setHash(hash) {
    try {
      history.replaceState(null, "", hash);
    } catch (error) {
      /* file:// documents can restrict history updates. */
    }
  }

  function clearProductHash() {
    if (location.hash.startsWith("#p-")) {
      setHash(location.pathname + location.search);
    }
  }

  function copyText(text) {
    const fallback = () => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showToast("链接已复制");
      } catch (error) {
        showToast("复制失败，请手动选择链接");
      }
      textarea.remove();
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast("链接已复制")).catch(fallback);
    } else {
      fallback();
    }
  }

  function categoryIcon(id) {
    const icons = {
      assistant: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/>',
      search: '<circle cx="11" cy="11" r="6"/><path d="m15.5 15.5 4 4"/>',
      image: '<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="8.5" cy="9" r="1.5"/><path d="m3 17 5-5 4 4 3-3 6 6"/>',
      photo: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="m8 6 1.5-2h5L16 6"/><circle cx="12" cy="13" r="4"/>',
      video: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m10 9 5 3-5 3V9Z"/>',
      audio: '<path d="M4 10v4M8 7v10M12 5v14M16 8v8M20 11v2"/>',
      productivity: '<path d="M5 3h10l4 4v14H5V3Z"/><path d="M15 3v5h5M8 12h8M8 16h6"/>',
      code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>',
      education: '<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
      companion: '<path d="M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2 4.5 4.5 0 0 1 8 2c0 5.3-8 10-8 10Z"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[id] || icons.assistant}</svg>`;
  }

  function compareProducts(a, b) {
    const tie = reach(b) - reach(a);
    switch (state.sort) {
      case "visits":
        return (Number(b.visits) || -1) - (Number(a.visits) || -1) || tie;
      case "downloads":
        return (Number(b.downloads) || -1) - (Number(a.downloads) || -1) || tie;
      case "mau":
        return (Number(b.mau) || -1) - (Number(a.mau) || -1) || tie;
      case "year":
        return (Number(b.year) || 0) - (Number(a.year) || 0) || tie;
      case "name":
        return String(a.name).localeCompare(String(b.name), "zh-CN");
      case "reach":
      default:
        return tie || String(a.name).localeCompare(String(b.name), "zh-CN");
    }
  }

  /* ── Scope / filtering ────────────────────────── */

  function pools() {
    return {
      web: products.filter((product) => Number(product.visits) > 0),
      app: products.filter((product) => Number(product.downloads) > 0)
    };
  }

  function tabProducts() {
    if (state.tab === "web") {
      return pools().web
        .slice()
        .sort((a, b) => (Number(b.visits) || 0) - (Number(a.visits) || 0))
        .slice(0, 50);
    }
    if (state.tab === "app") {
      return pools().app
        .slice()
        .sort((a, b) => (Number(b.downloads) || 0) - (Number(a.downloads) || 0))
        .slice(0, 50);
    }
    return products.slice();
  }

  function baseMatch(product) {
    if (state.freeOnly && !["free", "freemium"].includes(product.priceType)) return false;
    if (state.bookmarksOnly && !state.bookmarks.has(product.id)) return false;

    if (state.query) {
      const haystack = [
        product.name,
        product.company,
        product.country,
        product.tagline,
        product.desc,
        product.long,
        product.pricing,
        categoryName(product.category),
        categoryById.get(product.category)?.en,
        (product.tags || []).join(" "),
        product.url
      ].join(" ").toLowerCase();
      if (!haystack.includes(state.query)) return false;
    }
    return true;
  }

  function filteredProducts(options) {
    const includeCategory = !options || options.includeCategory !== false;
    const list = tabProducts().filter((product) => {
      if (!baseMatch(product)) return false;
      if (includeCategory && state.category !== "all" && product.category !== state.category) return false;
      return true;
    });
    return list.sort(compareProducts);
  }

  function totalTabCount() {
    return tabProducts().length;
  }

  /* ── Render: hero, marquee, categories ────────── */

  function renderHeroStats() {
    const all = products.slice().sort((a, b) => reach(b) - reach(a));
    const totalReach = all.reduce((sum, product) => sum + reach(product), 0);
    const totalVisits = all.reduce((sum, product) => sum + (Number(product.visits) || 0), 0);
    const totalDownloads = all.reduce((sum, product) => sum + (Number(product.downloads) || 0), 0);
    const marketCount = new Set(
      all.flatMap((product) => String(product.country).split("/").map((part) => part.trim()).filter(Boolean))
    ).size;
    const webCount = all.filter((product) => Number(product.visits) > 0).length;
    const appCount = all.filter((product) => Number(product.downloads) > 0).length;

    $("#statReach").textContent = formatCN(totalReach);
    $("#statVisits").textContent = formatCN(totalVisits);
    $("#statDownloads").textContent = formatCN(totalDownloads);
    $("#statProducts").textContent = products.length;
    $("#statUpdated").textContent = DATA.meta.updated.slice(0, 7).replace("-", ".");
    $("#ledgerMarkets").textContent = marketCount;
    $("#ledgerWebCount").textContent = `${webCount} / ${products.length}`;
    $("#ledgerAppCount").textContent = `${appCount} / ${products.length}`;

    const noteSpans = $$(".hero-note span");
    if (noteSpans[0]) noteSpans[0].innerHTML = `<i aria-hidden="true"></i> ${categories.length} 个赛道`;
    if (noteSpans[1]) noteSpans[1].innerHTML = `<i aria-hidden="true"></i> ${marketCount} 个市场`;

    const heroBars = all.slice(0, 4);
    const max = reach(heroBars[0]) || 1;
    $("#heroBars").innerHTML = heroBars.map((product) => `
      <div class="ledger-bar">
        <span>${escapeHtml(product.name)}</span>
        <i style="--w:${Math.max(8, (reach(product) / max) * 100).toFixed(1)}%"></i>
        <span>${formatCN(reach(product))}</span>
      </div>
    `).join("");
  }

  function renderMarquee() {
    const names = products.slice().sort((a, b) => reach(b) - reach(a)).slice(0, 20);
    const item = (product) => `
      <span class="marquee-item">
        <b>${escapeHtml(product.name)}</b>
        <span>${escapeHtml(categoryById.get(product.category)?.en || "")}</span>
      </span>
    `;
    const items = names.map(item).join("");
    $("#marqueeTrack").innerHTML = items + items;
  }

  function renderCategoryGrid() {
    const grid = $("#categoryGrid");
    grid.innerHTML = categories.map((category, index) => {
      const count = products.filter((product) => product.category === category.id).length;
      return `
        <button class="category-card" type="button" data-category="${category.id}" style="--accent:${category.color}" aria-label="查看${category.name}分类">
          <span class="category-card-top">
            <span class="category-icon">${categoryIcon(category.id)}</span>
            <span class="category-index">${pad(index + 1)} / 10</span>
          </span>
          <h3>${category.name}</h3>
          <span class="category-en">${category.en.toUpperCase()}</span>
          <p>${category.desc}</p>
          <span class="category-card-foot">
            <span><span class="category-count">${pad(count)}</span> 个产品</span>
            <span>查看榜单 ↗</span>
          </span>
        </button>
      `;
    }).join("");
  }

  /* ── Render: tabs and filters ─────────────────── */

  function renderTabs() {
    const counts = {
      all: products.length,
      web: Math.min(50, pools().web.length),
      app: Math.min(50, pools().app.length)
    };

    $$(".tab").forEach((tab) => {
      const active = tab.dataset.tab === state.tab;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      const badge = $("span", tab);
      if (badge) badge.textContent = counts[tab.dataset.tab];
    });
  }

  function renderCategoryFilters() {
    const pool = filteredProducts({ includeCategory: false });
    const countMap = new Map();
    pool.forEach((product) => {
      countMap.set(product.category, (countMap.get(product.category) || 0) + 1);
    });

    const items = [{
      id: "all",
      name: "全部分类",
      color: "#0b0d08",
      count: pool.length
    }].concat(categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      count: countMap.get(category.id) || 0
    })));

    $("#categoryFilters").innerHTML = items.map((item) => {
      const active = state.category === item.id;
      return `
        <button class="filter-item ${active ? "is-active" : ""}" type="button" data-category="${item.id}" aria-pressed="${active}">
          <span class="filter-name"><i style="--dot:${item.color}" aria-hidden="true"></i>${escapeHtml(item.name)}</span>
          <span>${item.count}</span>
        </button>
      `;
    }).join("");
  }

  function renderActiveFilters() {
    const chips = [];
    const removeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';

    if (state.query) {
      chips.push(`<span class="chip">搜索：${escapeHtml(state.query)}<button type="button" data-remove="query" aria-label="清除搜索">${removeIcon}</button></span>`);
    }
    if (state.category !== "all") {
      chips.push(`<span class="chip">${escapeHtml(categoryName(state.category))}<button type="button" data-remove="category" aria-label="清除分类筛选">${removeIcon}</button></span>`);
    }
    if (state.freeOnly) {
      chips.push(`<span class="chip">免费可用<button type="button" data-remove="free" aria-label="清除免费筛选">${removeIcon}</button></span>`);
    }
    if (state.bookmarksOnly) {
      chips.push(`<span class="chip">已收藏<button type="button" data-remove="bookmarks" aria-label="清除收藏筛选">${removeIcon}</button></span>`);
    }
    if (chips.length) {
      chips.push('<button class="chip" type="button" data-remove="all">清空全部</button>');
    }
    $("#activeFilters").innerHTML = chips.join("");
  }

  function renderSummary(list) {
    const sortLabels = {
      reach: "综合触达",
      visits: "月访问量",
      downloads: "月下载量",
      mau: "月活跃",
      year: "最新上线",
      name: "名称 A–Z"
    };
    const total = totalTabCount();
    const scope = state.tab === "all" ? "总榜" : state.tab === "web" ? "网站 TOP 50" : "APP TOP 50";
    let text = `显示 <b>${list.length}</b> / ${total} 个产品 · ${sortLabels[state.sort] || "综合触达"}`;
    if (state.category !== "all") text += ` · ${categoryName(state.category)}`;
    if (state.query) text += ` · “${escapeHtml(state.query)}”`;
    $("#resultSummary").innerHTML = text;
    $("#resultSummary").setAttribute("title", scope);
  }

  /* ── Render: cards and table ──────────────────── */

  function metricMarkup(product) {
    const order = state.tab === "app"
      ? ["downloads", "mau", "visits"]
      : state.tab === "web"
        ? ["visits", "mau", "downloads"]
        : ["visits", "downloads", "mau"];
    const labels = { visits: "月访问", downloads: "月下载", mau: "MAU" };
    const metrics = [];

    order.forEach((key) => {
      if (metrics.length >= 2) return;
      const value = Number(product[key]);
      if (value > 0) {
        metrics.push({
          label: labels[key],
          value: formatCN(value),
          star: key !== "visits" && Boolean(product.est)
        });
      }
    });

    if (!metrics.length) {
      metrics.push({ label: "上线", value: product.year || "—", star: false });
    }
    return metrics;
  }

  function cardTemplate(product, rank) {
    const first = rank === 1;
    const color = displayColor(product);
    const growth = product.growth != null && Math.abs(Number(product.growth)) >= 0.1;
    const metrics = metricMarkup(product);
    const saved = state.bookmarks.has(product.id);
    const tags = `<span class="card-tag card-cat">${escapeHtml(categoryName(product.category))}</span>`
      + (product.tags || []).slice(0, 1).map((tag) => `<span class="card-tag">${escapeHtml(tag)}</span>`).join("");

    return `
      <article class="product-card ${first ? "is-first" : ""}" data-id="${escapeHtml(product.id)}" data-rank="${pad(rank)}" tabindex="0" role="button" aria-label="查看 ${escapeHtml(product.name)} 详情" style="--brand:${color}">
        <div class="card-top">
          <span class="card-rank">${pad(rank)}</span>
          <span class="type-pill">${typeLabel(product.type)}</span>
          ${growth ? `<span class="trend-pill">${Number(product.growth) >= 0 ? "↗" : "↘"} ${Math.abs(Number(product.growth)).toFixed(1)}%</span>` : ""}
          <button class="bookmark-btn ${saved ? "is-saved" : ""}" type="button" data-bookmark="${escapeHtml(product.id)}" aria-label="${saved ? "取消收藏" : "收藏"} ${escapeHtml(product.name)}" aria-pressed="${saved}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>
          </button>
        </div>
        <div class="card-brand">
          <span class="card-logo">${escapeHtml(initials(product))}</span>
          <div class="card-name">
            <h3 title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.company)} · ${escapeHtml(product.country)}</p>
          </div>
        </div>
        <p class="card-desc">${escapeHtml(product.tagline || product.desc)}</p>
        <div class="card-metrics ${metrics.length === 1 ? "card-single-metric" : ""}">
          ${metrics.map((metric) => `
            <div class="card-metric">
              <span>${metric.label}</span>
              <strong>${metric.value}${metric.star ? "<em>*</em>" : ""}</strong>
            </div>
          `).join("")}
        </div>
        <div class="card-foot">
          <div class="card-tags">${tags}</div>
          <span class="card-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>
          </span>
        </div>
      </article>
    `;
  }

  function tableTemplate(product, rank) {
    const color = displayColor(product);
    const estDownload = product.est && Number(product.downloads) > 0;
    const estMau = product.est && Number(product.mau) > 0;
    return `
      <tr data-id="${escapeHtml(product.id)}" tabindex="0">
        <td class="table-rank">${pad(rank)}</td>
        <td>
          <div class="table-product">
            <span class="table-logo" style="--brand:${color}">${escapeHtml(initials(product))}</span>
            <span>
              <span class="table-name">${escapeHtml(product.name)}</span>
              <span class="table-company">${escapeHtml(product.company)}</span>
            </span>
          </div>
        </td>
        <td class="table-category">${escapeHtml(categoryName(product.category))}</td>
        <td class="table-category">${typeLabel(product.type)}</td>
        <td class="table-num">${formatCN(product.visits)}</td>
        <td class="table-num">${formatCN(product.downloads)}${estDownload ? "*" : ""}</td>
        <td class="table-num">${formatCN(product.mau)}${estMau ? "*" : ""}</td>
        <td class="table-country">${escapeHtml(product.country)}</td>
        <td class="table-year">${product.year || "—"}</td>
        <td>
          <a class="table-link" href="${escapeHtml(product.url)}" target="_blank" rel="noopener" aria-label="打开 ${escapeHtml(product.name)} 官网">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
          </a>
        </td>
      </tr>
    `;
  }

  function renderRanking() {
    const list = filteredProducts();
    state.rankMap = new Map(list.map((product, index) => [product.id, index + 1]));

    renderTabs();
    renderCategoryFilters();
    renderSummary(list);
    renderActiveFilters();
    updateBookmarkUI();

    $("#sortSelect").value = state.sort;
    if (document.activeElement !== $("#searchInput")) {
      $("#searchInput").value = state.query;
    }
    $("#freeOnly").checked = state.freeOnly;
    $("#bookmarkOnly").checked = state.bookmarksOnly;
    $("#headerBookmarkFilter").setAttribute("aria-pressed", String(state.bookmarksOnly));

    $$(".view-btn").forEach((button) => {
      const active = button.dataset.view === state.view;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const grid = $("#productGrid");
    const tableWrap = $("#tableWrap");
    const empty = $("#emptyState");

    if (!list.length) {
      grid.hidden = true;
      tableWrap.hidden = true;
      empty.hidden = false;
      grid.innerHTML = "";
      $("#tableBody").innerHTML = "";
      return;
    }

    empty.hidden = true;
    grid.hidden = state.view !== "grid";
    tableWrap.hidden = state.view !== "table";
    grid.innerHTML = list.map((product, index) => cardTemplate(product, index + 1)).join("");
    $("#tableBody").innerHTML = list.map((product, index) => tableTemplate(product, index + 1)).join("");
  }

  /* ── Render: insights and method ──────────────── */

  function renderInsights() {
    const sortedByVisits = products.filter((product) => Number(product.visits) > 0)
      .slice()
      .sort((a, b) => b.visits - a.visits);
    const chatgpt = products.find((product) => product.id === "chatgpt");
    const gemini = products.find((product) => product.id === "gemini");
    const multiple = chatgpt && gemini && gemini.visits ? chatgpt.visits / gemini.visits : 0;
    $("#concentrationMultiple").textContent = multiple.toFixed(1);
    $("#concentrationText").textContent = multiple.toFixed(1);

    const concentration = sortedByVisits.slice(0, 3);
    const maxVisit = concentration[0]?.visits || 1;
    $("#concentrationBars").innerHTML = concentration.map((product) => `
      <div class="mini-row">
        <span>${escapeHtml(product.name)}</span>
        <i style="--w:${Math.max(7, (product.visits / maxVisit) * 100).toFixed(1)}%"></i>
        <span>${formatCN(product.visits)}</span>
      </div>
    `).join("");

    const categoryCounts = categories.map((category) => ({
      ...category,
      count: products.filter((product) => product.category === category.id).length
    })).sort((a, b) => b.count - a.count);
    const maxCategory = categoryCounts[0]?.count || 1;
    $("#categoryBars").innerHTML = categoryCounts.slice(0, 6).map((category, index) => `
      <div class="bar-row">
        <span class="bar-name"><i class="bar-dot" style="--dot:${category.color}"></i>${category.name}</span>
        <span class="bar-track"><i style="--w:${(category.count / maxCategory) * 100}%;--bar:${index === 0 ? "var(--lime-deep)" : "var(--ink)"}"></i></span>
        <span class="bar-val">${category.count}</span>
      </div>
    `).join("");

    const countryCounts = new Map();
    products.forEach((product) => {
      const primary = String(product.country).split("/")[0].trim();
      countryCounts.set(primary, (countryCounts.get(primary) || 0) + 1);
    });
    const topCountries = Array.from(countryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const maxCountry = topCountries[0]?.[1] || 1;
    $("#countryBars").innerHTML = topCountries.map(([country, count]) => `
      <div class="bar-row">
        <span class="bar-name">${escapeHtml(country)}</span>
        <span class="bar-track"><i style="--w:${(count / maxCountry) * 100}%"></i></span>
        <span class="bar-val">${String(count).padStart(2, "0")}</span>
      </div>
    `).join("");

    const formCounts = {
      both: products.filter((product) => product.type === "both").length,
      web: products.filter((product) => product.type === "web").length,
      app: products.filter((product) => product.type === "app").length
    };
    const total = products.length;
    const bothPct = (formCounts.both / total) * 100;
    const webPct = bothPct + (formCounts.web / total) * 100;
    $("#platformDonut").style.setProperty(
      "--donut",
      `conic-gradient(var(--lime) 0 ${bothPct}%, var(--ink) ${bothPct}% ${webPct}%, var(--orange) ${webPct}% 100%)`
    );
    $("#platformDonut").innerHTML = `<div class="donut-center"><strong>${formCounts.both + formCounts.web + formCounts.app}</strong><span>PRODUCTS</span></div>`;
    $("#platformLegend").innerHTML = [
      { label: "双端产品", count: formCounts.both, color: "var(--lime)" },
      { label: "纯网站", count: formCounts.web, color: "var(--ink)" },
      { label: "纯 APP", count: formCounts.app, color: "var(--orange)" }
    ].map((item) => `
      <div class="legend-row">
        <i class="legend-dot" style="--dot:${item.color}"></i>
        <span>${item.label}</span>
        <b>${item.count}</b>
      </div>
    `).join("");

    const topDownloads = products.filter((product) => Number(product.downloads) > 0)
      .slice()
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 5);
    $("#topDownloads").innerHTML = topDownloads.map((product, index) => `
      <li>
        <span class="list-index">${pad(index + 1)}</span>
        <span class="list-name">${escapeHtml(product.name)}</span>
        <span class="list-value">${formatCN(product.downloads)}${product.est ? "<em>*</em>" : ""}</span>
      </li>
    `).join("");

    const topVisits = sortedByVisits.slice(0, 5);
    $("#topVisits").innerHTML = topVisits.map((product, index) => `
      <li>
        <span class="list-index">${pad(index + 1)}</span>
        <span class="list-name">${escapeHtml(product.name)}</span>
        <span class="list-value">${formatCN(product.visits)}</span>
      </li>
    `).join("");
  }

  function renderSources() {
    $("#sourceList").innerHTML = DATA.meta.sources.map((source) => `
      <a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener">
        <span>
          <b>${escapeHtml(source.label)}</b>
          <span>${escapeHtml(source.note)}</span>
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
      </a>
    `).join("");
  }

  function renderAll() {
    renderCategoryGrid();
    renderHeroStats();
    renderMarquee();
    renderSources();
    renderInsights();
    renderRanking();
    setupReveal();
  }

  /* ── Bookmarks ────────────────────────────────── */

  function updateBookmarkUI() {
    const count = state.bookmarks.size;
    $("#headerBookmarkCount").textContent = count;
    $("#sidebarBookmarkCount").textContent = count;
    $("#headerBookmarkFilter").setAttribute("aria-pressed", String(state.bookmarksOnly));
  }

  function toggleBookmark(id) {
    if (state.bookmarks.has(id)) {
      state.bookmarks.delete(id);
      showToast("已取消收藏");
    } else {
      state.bookmarks.add(id);
      showToast("已收藏，可在顶部筛选");
    }
    persistBookmarks();
    updateBookmarkUI();

    $$(`[data-bookmark="${id}"]`).forEach((button) => {
      const saved = state.bookmarks.has(id);
      button.classList.toggle("is-saved", saved);
      button.setAttribute("aria-pressed", String(saved));
      button.setAttribute("aria-label", saved ? "取消收藏" : "收藏");
    });

    if (state.bookmarksOnly) renderRanking();
    if ($("#detailDialog").open) updateDetailBookmark(id);
  }

  /* ── Detail dialog ────────────────────────────── */

  function detailRank(product) {
    if (state.rankMap.has(product.id)) return state.rankMap.get(product.id);
    const all = filteredProducts();
    const index = all.findIndex((item) => item.id === product.id);
    return index >= 0 ? index + 1 : product._index + 1;
  }

  function detailSource(product) {
    const bits = [];
    if (Number(product.visits) > 0) bits.push("月访问：Similarweb / AI 产品榜（2025.10）");
    if (Number(product.downloads) > 0) bits.push(`月下载：DataEye / 点点数据（2025.10）${product.est ? "，带 * 为估算" : ""}`);
    if (Number(product.mau) > 0) bits.push(`MAU：Sensor Tower / a16z 与公开资料（2026）${product.est ? "，带 * 为估算" : ""}`);
    bits.push("不同数据源统计口径与时间不同，数值仅用于趋势参考。");
    return bits.join(" · ");
  }

  function openDetail(id, options) {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const dialog = $("#detailDialog");
    const rank = detailRank(product);
    const color = displayColor(product);
    const cat = categoryById.get(product.category);
    const saved = state.bookmarks.has(product.id);

    state.lastFocus = document.activeElement;

    $("#detailHero").style.setProperty("--brand", color);
    $("#detailHero").setAttribute("data-rank", pad(rank));
    $("#detailHero").innerHTML = `
      <div class="detail-hero-top">
        <span>RANK ${pad(rank)} / ${state.rankMap.size || totalTabCount()}</span>
        <span class="type-pill">${typeLabel(product.type)}</span>
        <span>${escapeHtml(cat?.name || "")}</span>
      </div>
      <div class="detail-brand">
        <span class="detail-logo">${escapeHtml(initials(product))}</span>
        <div>
          <h2 id="detailTitle">${escapeHtml(product.name)}</h2>
          <p>${escapeHtml(product.company)} · ${escapeHtml(product.country)} · ${product.year || "—"}</p>
        </div>
      </div>
      <div class="detail-metrics">
        <div class="detail-metric">
          <span>月访问</span>
          <strong>${formatCN(product.visits)}</strong>
        </div>
        <div class="detail-metric">
          <span>月下载</span>
          <strong>${formatCN(product.downloads)}${product.est && product.downloads ? "<em>*</em>" : ""}</strong>
        </div>
        <div class="detail-metric">
          <span>MAU</span>
          <strong>${formatCN(product.mau)}${product.est && product.mau ? "<em>*</em>" : ""}</strong>
        </div>
        <div class="detail-metric">
          <span>${product.growth != null ? "月环比" : "上线"}</span>
          <strong>${product.growth != null ? formatGrowth(product.growth) : (product.year || "—")}</strong>
        </div>
      </div>
    `;

    let host = String(product.url).replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
    try {
      host = new URL(product.url).hostname.replace(/^www\./, "");
    } catch (error) {
      /* Keep the visible host fallback if a URL needs correction. */
    }

    const facts = [
      ["分类", cat?.name || "—"],
      ["形态", typeFilter(product.type)],
      ["公司", product.company],
      ["国家 / 地区", product.country],
      ["上线年份", String(product.year || "—")],
      ["定价方式", priceLabel(product.priceType)],
      ["官网", `<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener">${escapeHtml(host)} ↗</a>`]
    ];

    $("#detailBody").innerHTML = `
      <p class="detail-summary">${escapeHtml(product.tagline)}</p>
      <p class="detail-long">${escapeHtml(product.long || product.desc)}</p>
      <div class="detail-info">
        <div class="detail-block">
          <h3>PRODUCT NOTES / 经营内容</h3>
          <p class="detail-long" style="margin-top:0">${escapeHtml(product.desc)}</p>
          <h3 style="margin-top:18px">TAGS</h3>
          <div class="detail-tags">
            ${(product.tags || []).map((tag) => `<span class="detail-tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
        <div class="detail-block">
          <h3>FACT SHEET / 产品档案</h3>
          <div class="detail-facts">
            ${facts.map(([label, value]) => `
              <div class="detail-fact"><span>${escapeHtml(label)}</span><b>${value}</b></div>
            `).join("")}
          </div>
        </div>
      </div>
      <div class="detail-actions">
        <a class="btn btn-primary" href="${escapeHtml(product.url)}" target="_blank" rel="noopener">
          访问官网
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
        </a>
        <button class="btn btn-ghost" type="button" data-action="copy">
          复制链接
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 8V5h11v11h-3M4 9h11v11H4z"/></svg>
        </button>
        <button class="btn btn-ghost ${saved ? "is-saved" : ""}" type="button" data-action="bookmark" aria-pressed="${saved}">
          <span>${saved ? "已收藏" : "收藏"}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>
        </button>
      </div>
      <p class="detail-source">${escapeHtml(detailSource(product))}</p>
    `;

    $("#detailDialog").dataset.id = product.id;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      window.open(product.url, "_blank", "noopener");
      return;
    }
    document.body.classList.add("modal-open");
    if (!options || options.updateHash !== false) {
      setHash(`#p-${product.id}`);
    }
    const closeButton = $("#detailClose");
    if (closeButton) closeButton.focus({ preventScroll: true });
    const shell = $(".detail-shell");
    if (shell) shell.scrollTop = 0;
  }

  function closeDetail() {
    const dialog = $("#detailDialog");
    if (dialog && dialog.open) dialog.close();
  }

  function updateDetailBookmark(id) {
    const button = $('[data-action="bookmark"]', $("#detailBody"));
    if (!button) return;
    const saved = state.bookmarks.has(id);
    button.classList.toggle("is-saved", saved);
    button.setAttribute("aria-pressed", String(saved));
    const label = $("span", button);
    if (label) label.textContent = saved ? "已收藏" : "收藏";
  }

  /* ── CSV ──────────────────────────────────────── */

  function csvCell(value) {
    return `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
  }

  function downloadCsv() {
    const ranked = products.slice().sort((a, b) => reach(b) - reach(a));
    const rows = [
      ["排名", "产品", "公司", "国家/地区", "分类", "形态", "月访问(百万)", "月下载(百万)", "MAU(百万)", "上线年份", "定价", "官网", "简介", "数据备注"]
    ];
    ranked.forEach((product, index) => {
      rows.push([
        index + 1,
        product.name,
        product.company,
        product.country,
        categoryName(product.category),
        typeLabel(product.type),
        formatRaw(product.visits),
        formatRaw(product.downloads),
        formatRaw(product.mau),
        formatRaw(product.year),
        product.pricing,
        product.url,
        product.desc,
        product.est ? "下载/MAU 为公开资料估算" : "第三方公开数据"
      ]);
    });

    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ai-atlas-2026-top100.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    showToast("CSV 已开始下载");
  }

  /* ── Interactions ─────────────────────────────── */

  function resetFilters(options) {
    state.category = "all";
    state.query = "";
    state.freeOnly = false;
    state.bookmarksOnly = false;
    if (!options || options.keepSort !== true) {
      state.sort = state.tab === "web" ? "visits" : state.tab === "app" ? "downloads" : "reach";
    }
    $("#searchInput").value = "";
    renderRanking();
  }

  function setTab(tab) {
    state.tab = tab;
    state.sort = tab === "web" ? "visits" : tab === "app" ? "downloads" : "reach";
    renderRanking();
  }

  function removeFilter(kind) {
    if (kind === "all") {
      resetFilters();
      return;
    }
    if (kind === "query") {
      state.query = "";
      $("#searchInput").value = "";
    } else if (kind === "category") {
      state.category = "all";
    } else if (kind === "free") {
      state.freeOnly = false;
    } else if (kind === "bookmarks") {
      state.bookmarksOnly = false;
    }
    renderRanking();
  }

  function setupReveal() {
    const elements = $$(".category-card, .panel, .insight-feature, .method-block, .cta-band");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -34px 0px" });

    elements.forEach((element, index) => {
      element.classList.add("reveal");
      element.style.transitionDelay = `${Math.min(index % 5, 4) * 35}ms`;
      window.setTimeout(() => { element.style.transitionDelay = ""; }, 1000);
      observer.observe(element);
    });
  }

  function bindEvents() {
    const header = $("#siteHeader");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    $$(".tab").forEach((tab) => {
      tab.addEventListener("click", () => setTab(tab.dataset.tab));
    });

    $("#heroAppRank").addEventListener("click", () => {
      state.category = "all";
      state.query = "";
      $("#searchInput").value = "";
      setTab("app");
      window.setTimeout(() => {
        $("#ranking").scrollIntoView({ behavior: "smooth", block: "start" });
      }, 30);
    });

    $("#sortSelect").addEventListener("change", (event) => {
      state.sort = event.target.value;
      renderRanking();
    });

    $("#searchInput").addEventListener("input", (event) => {
      if (event.isComposing) return;
      window.clearTimeout(searchTimer);
      const value = event.target.value.trim().toLowerCase();
      searchTimer = window.setTimeout(() => {
        state.query = value;
        renderRanking();
      }, 90);
    });

    $("#searchInput").addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.target.value = "";
        state.query = "";
        renderRanking();
      }
    });

    $$(".view-btn").forEach((button) => {
      button.addEventListener("click", () => {
        state.view = button.dataset.view;
        renderRanking();
      });
    });

    $("#categoryGrid").addEventListener("click", (event) => {
      const card = event.target.closest("[data-category]");
      if (!card) return;
      state.category = card.dataset.category;
      renderRanking();
      $("#ranking").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    $("#categoryFilters").addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      renderRanking();
    });

    $("#activeFilters").addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove]");
      if (!button) return;
      removeFilter(button.dataset.remove);
    });

    $("#resetFilters").addEventListener("click", () => resetFilters());
    $("#emptyReset").addEventListener("click", () => resetFilters());

    $("#freeOnly").addEventListener("change", (event) => {
      state.freeOnly = event.target.checked;
      renderRanking();
    });

    $("#bookmarkOnly").addEventListener("change", (event) => {
      state.bookmarksOnly = event.target.checked;
      renderRanking();
    });

    $("#headerBookmarkFilter").addEventListener("click", () => {
      if (!state.bookmarks.size && !state.bookmarksOnly) {
        showToast("还没有收藏，点击卡片右上角的书签试试");
        return;
      }
      state.bookmarksOnly = !state.bookmarksOnly;
      $("#ranking").scrollIntoView({ behavior: "smooth", block: "start" });
      renderRanking();
    });

    $("#mobileFilterToggle").addEventListener("click", () => {
      const panel = $("#filtersPanel");
      const open = panel.classList.toggle("is-open");
      $("#mobileFilterToggle").setAttribute("aria-expanded", String(open));
    });

    $("#productGrid").addEventListener("click", (event) => {
      const bookmark = event.target.closest("[data-bookmark]");
      if (bookmark) {
        event.preventDefault();
        event.stopPropagation();
        toggleBookmark(bookmark.dataset.bookmark);
        return;
      }
      const card = event.target.closest(".product-card");
      if (card) openDetail(card.dataset.id);
    });

    $("#productGrid").addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest("button")) return;
      const card = event.target.closest(".product-card");
      if (!card) return;
      event.preventDefault();
      openDetail(card.dataset.id);
    });

    $("#tableWrap").addEventListener("click", (event) => {
      const headerCell = event.target.closest("th[data-sort]");
      if (headerCell) {
        const sort = headerCell.dataset.sort;
        state.sort = sort === "rank" ? "reach" : sort;
        renderRanking();
        return;
      }
      if (event.target.closest("a")) return;
      const row = event.target.closest("tr[data-id]");
      if (row) openDetail(row.dataset.id);
    });

    $("#tableWrap").addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest("a")) return;
      const row = event.target.closest("tr[data-id]");
      if (!row) return;
      event.preventDefault();
      openDetail(row.dataset.id);
    });

    const detailDialog = $("#detailDialog");
    $("#detailClose").addEventListener("click", closeDetail);
    detailDialog.addEventListener("click", (event) => {
      if (event.target === detailDialog) closeDetail();
    });
    detailDialog.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      clearProductHash();
      if (state.lastFocus && document.contains(state.lastFocus)) {
        state.lastFocus.focus({ preventScroll: true });
      }
    });

    $("#detailBody").addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]");
      if (!action) return;
      const id = detailDialog.dataset.id;
      if (action.dataset.action === "copy") {
        copyText(`${location.origin === "null" ? "file://" + location.pathname : location.href.split("#")[0]}#p-${id}`);
      }
      if (action.dataset.action === "bookmark") toggleBookmark(id);
    });

    ["downloadCsv", "heroDownload", "ctaDownload"].forEach((id) => {
      const button = document.getElementById(id);
      if (button) button.addEventListener("click", downloadCsv);
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping = target && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      );
      if (event.key === "/" && !isTyping && !detailDialog.open) {
        event.preventDefault();
        $("#searchInput").focus();
      }
    });

    window.addEventListener("hashchange", () => {
      if (location.hash.startsWith("#p-")) {
        const id = location.hash.slice(3);
        if (products.some((product) => product.id === id) && !detailDialog.open) {
          openDetail(id, { updateHash: false });
        }
      }
    });
  }

  /* ── Init ─────────────────────────────────────── */

  renderAll();
  bindEvents();

  if (location.hash.startsWith("#p-")) {
    const id = location.hash.slice(3);
    if (products.some((product) => product.id === id)) {
      window.requestAnimationFrame(() => openDetail(id, { updateHash: false }));
    }
  }

  /* A quiet integrity check for anyone editing the data file. */
  if (products.length !== 100) {
    console.warn(`AI Atlas: expected 100 products, found ${products.length}.`);
  }
  if (new Set(products.map((product) => product.id)).size !== products.length) {
    console.warn("AI Atlas: duplicate product ids found.");
  }
})();
