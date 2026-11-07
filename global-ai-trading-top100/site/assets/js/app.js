/* ==========================================================================
   AI Trading Atlas — application
   ========================================================================== */
(function () {
  "use strict";

  const DATA = window.SITE_DATA;
  const app = document.getElementById("app");
  const modalRoot = document.getElementById("modal-root");
  const toastEl = document.getElementById("toast");

  if (!DATA) {
    app.innerHTML = '<div class="container" style="padding:80px 0"><h1>数据加载失败</h1><p class="muted">请确认 assets/js/data.js 已生成。</p></div>';
    return;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const TIER = Object.fromEntries(DATA.tiers.map(t => [t.key, t]));
  const STRATEGIES = DATA.strategies;
  const FAMILIES = DATA.families;
  const FAMILY_BY_ID = Object.fromEntries(FAMILIES.map(f => [f.id, f]));
  const MODULE_ORDER = DATA.modules.map(m => m.id);
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    theme: readTheme(),
    rank: { q: "", tier: "all", type: "全部" },
    family: "all",
  };

  let revealObserver = null;
  let toastTimer = null;

  /* ------------------------------------------------------------------------
     Utilities
     ------------------------------------------------------------------------ */
  function readTheme() {
    try {
      const queryTheme = new URLSearchParams(location.search).get("theme");
      if (queryTheme === "light" || queryTheme === "dark") return queryTheme;
      const saved = localStorage.getItem("atlas-theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch (_) { /* ignore */ }
    return "dark";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    state.theme = theme;
    try { localStorage.setItem("atlas-theme", theme); } catch (_) { /* ignore */ }
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escAttr(value) {
    return esc(value).replace(/"/g, "&quot;");
  }

  function fmtPct(value, digits = 1, signed = true) {
    const v = Number(value) * 100;
    const sign = signed && v > 0 ? "+" : "";
    return `${sign}${v.toFixed(digits)}%`;
  }

  function fmtNum(value, digits = 2) {
    return Number(value).toFixed(digits);
  }

  function categoryColor(name) {
    return DATA.categoryColors[name] || "var(--accent)";
  }

  function tierBadge(key, full) {
    const t = TIER[key];
    return `<span class="badge ${String(key).toLowerCase()}">${esc(full || (t ? t.full : key))}</span>`;
  }

  function icon(name, cls = "") {
    const icons = {
      arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
      chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
      search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
      copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
      download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
      close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
      code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/></svg>',
      doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6zM14 2v5h5"/><path d="M9 13h6M9 17h6"/></svg>',
      table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 4v16"/></svg>',
      zip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12v20H6z"/><path d="M12 2v6M10 8h4M10 11h4M10 14h4"/></svg>',
      file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6zM14 2v5h5"/></svg>',
      spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.2"/></svg>',
    };
    return `<span class="icon ${cls}" aria-hidden="true">${icons[name] || ""}</span>`;
  }

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("已复制到剪贴板");
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast("已复制到剪贴板");
      } catch (e) {
        toast("复制失败，请手动选择");
      }
      document.body.removeChild(ta);
    }
  }

  function downloadText(filename, text, mime = "text/plain;charset=utf-8") {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightPython(code) {
    const keywords = new Set([
      "and", "as", "assert", "async", "await", "break", "class", "continue", "def",
      "del", "elif", "else", "except", "finally", "for", "from", "global", "if",
      "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise",
      "return", "try", "while", "with", "yield", "True", "False", "None",
    ]);
    const re = /("""[\s\S]*?"""|'''[\s\S]*?'''|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
    let out = "";
    let last = 0;
    let match;
    while ((match = re.exec(code)) !== null) {
      out += escapeHtml(code.slice(last, match.index));
      const token = match[0];
      let cls = "";
      if (token.startsWith("#")) {
        cls = "tok-com";
      } else if (token.startsWith('"""') || token.startsWith("'''") ||
                 token.startsWith('"') || token.startsWith("'")) {
        cls = "tok-str";
      } else if (/^\d/.test(token)) {
        cls = "tok-num";
      } else if (keywords.has(token)) {
        cls = "tok-kw";
      } else {
        const after = code.slice(match.index + token.length);
        if (/^\s*\(/.test(after)) cls = "tok-fn";
      }
      out += cls ? `<span class="${cls}">${escapeHtml(token)}</span>` : escapeHtml(token);
      last = match.index + token.length;
    }
    out += escapeHtml(code.slice(last));
    return out;
  }

  /* ------------------------------------------------------------------------
     Routing
     ------------------------------------------------------------------------ */
  function getRoute() {
    const raw = (location.hash || "#/").replace(/^#/, "");
    const [pathPart, queryPart] = raw.split("?");
    const path = pathPart.replace(/\/+$/, "") || "/";
    return { path, params: new URLSearchParams(queryPart || "") };
  }

  function navigate(path) {
    location.hash = "#" + path;
  }

  function updateNav(path) {
    const base = path.startsWith("/strategy/") ? "/strategies" : path;
    $$("[data-nav]").forEach(a => {
      const active = a.dataset.nav === base;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function render() {
    const route = getRoute();
    const path = route.path;
    let html = "";

    closeModal();
    document.body.classList.remove("nav-open");
    const menuBtn = $("#menu-btn");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");

    if (path === "/") {
      html = homeView();
    } else if (path === "/rankings") {
      state.rank.tier = route.params.get("tier") || "all";
      html = rankingsView();
    } else if (path === "/strategies") {
      html = strategiesView();
    } else if (path.startsWith("/strategy/")) {
      html = detailView(path.split("/")[2]);
    } else if (path === "/code") {
      html = codePageView();
    } else if (path === "/method") {
      html = methodView();
    } else if (path === "/report") {
      html = reportView();
    } else {
      html = notFoundView();
    }

    app.innerHTML = html;
    updateNav(path);
    initReveal();
    initCounters();

    if (path === "/rankings") bindRankings();
    if (path === "/strategies") bindStrategies();
    if (path.startsWith("/strategy/")) bindDetail();

    const titles = {
      "/": "全球 AI 交易 TOP 100 · 策略图谱",
      "/rankings": "TOP 100 榜单 · AI Trading Atlas",
      "/strategies": "策略族地图 · AI Trading Atlas",
      "/code": "代码库 · AI Trading Atlas",
      "/method": "方法论 · AI Trading Atlas",
      "/report": "报告与下载 · AI Trading Atlas",
    };
    document.title = path.startsWith("/strategy/")
      ? `${STRATEGIES[path.split("/")[2]] ? STRATEGIES[path.split("/")[2]].title : "策略"} · AI Trading Atlas`
      : (titles[path] || "AI Trading Atlas");

    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------------------
     Home
     ------------------------------------------------------------------------ */
  function stat(value, label, suffix = "") {
    return `<div class="stat"><span class="stat-num">${value}${suffix ? `<span class="stat-suffix">${suffix}</span>` : ""}</span><span class="stat-label">${label}</span></div>`;
  }

  function tierCard(t) {
    return `<a class="tier-card" href="#/rankings?tier=${t.key}" style="--tier-color:${t.color}" data-reveal>
      <div class="tier-top"><span class="tier-key">${esc(t.full)}</span><span class="tier-range">${esc(t.range)}</span></div>
      <div class="tier-count">${t.count}</div>
      <div class="tier-label">${esc(t.label)}</div>
      <div class="tier-names">${t.names.slice(0, 4).map(esc).join(" · ")}</div>
    </a>`;
  }

  function categoryBars() {
    return DATA.categories.map(c => `
      <div class="category-row">
        <span class="category-name">${esc(c.name)}</span>
        <div class="category-bar"><div class="category-fill" style="width:${(c.count / DATA.families.length) * 100}%;background:${c.color}"></div></div>
        <span class="category-count">${c.count}</span>
      </div>`).join("");
  }

  function homeView() {
    const tickerItems = [...DATA.ticker, ...DATA.ticker]
      .map(t => `<span class="ticker-item">${esc(t)}</span>`).join("");
    return `
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <div class="eyebrow"><span class="dot"></span> RESEARCH ATLAS · 2026</div>
            <h1 class="hero-title">全球 AI 交易<br><span class="grad">TOP 100</span></h1>
            <p class="hero-lead">从 RenTech 的统计套利到 DeepSeek 背后的算力网络，从配对交易到强化学习执行。100 位交易员、机构与策略范式，25 个策略族，15 个可运行实现——一张可以读、可以跑、可以改的 AI 交易地图。</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="#/rankings">浏览榜单 ${icon("arrow")}</a>
              <a class="btn btn-ghost" href="#/strategies">探索策略地图</a>
            </div>
            <div class="hero-stats">
              ${stat(DATA.meta.counts.rankings, "条编辑性榜单")}
              ${stat(DATA.meta.counts.families, "个策略族")}
              ${stat(DATA.meta.counts.modules, "个可运行模块")}
              ${stat(DATA.meta.counts.tiers, "个分档")}
            </div>
          </div>
          <div class="hero-visual" aria-hidden="true">
            <div class="orbit">
              <div class="orbit-ring ring-1"></div>
              <div class="orbit-ring ring-2"></div>
              <div class="orbit-ring ring-3"></div>
              <div class="orbit-core"><div><strong>100</strong><small>ENTRIES</small></div></div>
              <span class="orbit-chip chip-1">Renaissance</span>
              <span class="orbit-chip chip-2">Two Sigma</span>
              <span class="orbit-chip chip-3">Citadel</span>
              <span class="orbit-chip chip-4">Jane Street</span>
              <span class="orbit-chip chip-5">幻方 High-Flyer</span>
              <span class="orbit-chip chip-6">Numerai</span>
            </div>
          </div>
        </div>
      </section>

      <div class="ticker" aria-hidden="true"><div class="ticker-track">${tickerItems}</div></div>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="eyebrow">THE RANKING</div>
              <h2>五个分档，一张生态地图</h2>
              <p>不是按收益排序，而是按资本与存续、创新与影响力、可验证业绩、人才与知识溢出综合评分。</p>
            </div>
            <a class="section-link" href="#/rankings">查看完整榜单 ${icon("arrow")}</a>
          </div>
          <div class="tier-grid">${DATA.tiers.map(tierCard).join("")}</div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="eyebrow">STRATEGY MAP</div>
              <h2>25 个策略族，六个战场</h2>
              <p>方向性、相对价值、微观结构、事件驱动、执行与组合、加密原生。真正的 alpha 往往藏在交叉地带。</p>
            </div>
            <a class="section-link" href="#/strategies">打开策略地图 ${icon("arrow")}</a>
          </div>
          <div class="category-panel" data-reveal>
            <div class="category-list">${categoryBars()}</div>
            <div class="category-note">
              <h3>从“预测”到“执行”</h3>
              <p>策略不是孤立的模型。一个可实盘的策略，至少要同时回答：信号从哪里来、组合怎么建、成本怎么控、风险怎么停。25 个策略族，就是 25 种回答方式。</p>
              <div style="margin-top:16px"><a class="section-link" href="#/strategies">浏览全部 ${icon("arrow")}</a></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="eyebrow">FEATURED IMPLEMENTATIONS</div>
              <h2>从原理到代码</h2>
              <p>六个代表性模块，覆盖相对价值、做市、机器学习、强化学习与加密原生。</p>
            </div>
            <a class="section-link" href="#/code">进入代码库 ${icon("arrow")}</a>
          </div>
          <div class="card-grid">${DATA.featured.map(strategyCard).join("")}</div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="eyebrow">CODE FIRST</div>
              <h2>不只告诉你“是什么”，还给你“怎么写”</h2>
              <p>15 个模块只依赖 numpy / pandas，包含合成数据、回测、成本与绩效指标。每一段代码都能独立运行。</p>
            </div>
          </div>
          <div class="code-feature">
            <div class="terminal" data-reveal>
              <div class="terminal-head"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="terminal-title">strategies/s01_pairs.py</span></div>
              <div class="terminal-body"><pre>${highlightPython(`def signals(prices, entry=2.0, exit_z=0.5):
    spread = log(prices["A1"]) - beta * log(prices["A0"])
    z = (spread - spread.rolling(60).mean()) / spread.rolling(60).std()

    state = 0.0
    if z > entry:
        state = -1.0      # 价差过高：空高估腿
    elif z < -entry:
        state = 1.0       # 价差过低：多低估腿

    return normalize_gross(state * hedge_weights)`)}</pre></div>
            </div>
            <div class="code-side">
              <div class="method-card" data-reveal style="margin-bottom:14px">
                <div class="method-num">01 / PORTABLE</div>
                <h3>零重型依赖</h3>
                <p>只依赖 numpy 与 pandas。不需要 GPU、不需要数据库，下载即可跑。</p>
              </div>
              <div class="method-card" data-reveal style="margin-bottom:14px">
                <div class="method-num">02 / HONEST</div>
                <h3>合成数据自检</h3>
                <p>所有指标都来自可复现的合成面板，明确标注“不是实盘业绩”。</p>
              </div>
              <a class="btn btn-ghost" href="#/code" style="width:100%">查看 15 个模块 ${icon("arrow")}</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="eyebrow">METHODOLOGY</div>
              <h2>先承认不知道，再谈排名</h2>
              <p>任何“TOP 100”都是编辑性重构。我们把方法论和盲区一起放在台面上。</p>
            </div>
            <a class="section-link" href="#/method">阅读方法论 ${icon("arrow")}</a>
          </div>
          <div class="method-grid">
            <div class="method-card" data-reveal><div class="method-num">01 / SCORING</div><h3>四个维度</h3><p>资本与存续 30%、创新与影响力 30%、可验证业绩 20%、人才与知识溢出 20%。</p></div>
            <div class="method-card" data-reveal><div class="method-num">02 / BLIND SPOTS</div><h3>五个盲区</h3><p>匿名自营、幸存者偏差、规模与收益负相关、时间漂移、AI 标签通胀。</p></div>
            <div class="method-card" data-reveal><div class="method-num">03 / SYNTHETIC</div><h3>合成数据</h3><p>代码只验证管线，不证明策略有效。真实市场有冲击、拥挤、制度变化。</p></div>
          </div>
          <div class="callout" style="margin-top:16px" data-reveal><strong>重要声明：</strong>本网站不是官方排名，也不构成投资建议。对冲基金与自营交易公司没有披露义务，大量顶级交易员匿名；所有回测数字来自合成数据，仅用于验证代码管线。</div>
        </div>
      </section>
    `;
  }

  /* ------------------------------------------------------------------------
     Strategy cards
     ------------------------------------------------------------------------ */
  function strategyCard(id) {
    const s = STRATEGIES[id];
    if (!s) return "";
    const m = s.metrics;
    const color = categoryColor(s.category);
    const metric = m.type === "回测"
      ? `<div class="card-sharpe">${fmtNum(m.sharpe)}<span>SHARPE</span></div>`
      : `<div class="card-sharpe">${esc(m.key || "—")}<span>SIM</span></div>`;
    return `<a class="strategy-card" href="#/strategy/${id}" style="--card-color:${color}" data-reveal>
      <div class="card-top">
        <span class="card-rank">#${s.rank} · ${esc(s.category)}</span>
        <span class="badge" style="border-color:${color}55;background:${color}14">代码</span>
      </div>
      <h3 class="card-title">${esc(s.title)}</h3>
      <div class="card-en">${esc(s.en)}</div>
      <p class="card-summary">${esc(s.tagline)}</p>
      <div class="card-meta"><span><b>${s.lines}</b> 行代码</span><span><b>${esc(s.category)}</b></span></div>
      <div class="card-foot">${metric}<span class="card-link">查看实现 ${icon("arrow")}</span></div>
    </a>`;
  }

  function familyCard(f) {
    const code = f.code ? STRATEGIES[f.code] : null;
    const metric = code
      ? (code.metrics.type === "回测"
        ? `<div class="card-sharpe">${fmtNum(code.metrics.sharpe)}<span>SHARPE</span></div>`
        : `<div class="card-sharpe">${esc(code.metrics.key || "—")}<span>SIM</span></div>`)
      : `<div class="card-sharpe" style="color:var(--faint)">原理<span>CARD</span></div>`;
    return `<button class="strategy-card" type="button" data-family="${f.id}" style="--card-color:${f.color}" data-category="${escAttr(f.category)}">
      <div class="card-top">
        <span class="card-rank">#${f.rank} · ${esc(f.category)}</span>
        ${code ? `<span class="badge" style="border-color:${f.color}55;background:${f.color}14">可运行</span>` : `<span class="badge">原理</span>`}
      </div>
      <h3 class="card-title">${esc(f.name)}</h3>
      <div class="card-en">${esc(f.en)}</div>
      <p class="card-summary">${esc(f.summary)}</p>
      <div class="card-meta"><span>持有期 <b>${esc(f.horizon)}</b></span><span>容量 <b>${esc(f.capacity)}</b></span></div>
      <div class="card-foot">${metric}<span class="card-link">${code ? "查看实现" : "查看原理"} ${icon("arrow")}</span></div>
    </button>`;
  }

  /* ------------------------------------------------------------------------
     Rankings
     ------------------------------------------------------------------------ */
  function rankingsView() {
    const tierChips = [
      `<button class="chip ${state.rank.tier === "all" ? "active" : ""}" data-tier="all" type="button">全部</button>`,
      ...DATA.tiers.map(t => `<button class="chip ${state.rank.tier === t.key ? "active" : ""}" data-tier="${t.key}" type="button">${t.key} ${esc(t.label)}</button>`),
    ].join("");
    const typeOptions = ["全部", "人物", "机构", "系统", "策略"]
      .map(t => `<option value="${t}" ${state.rank.type === t ? "selected" : ""}>${t === "全部" ? "全部类型" : t}</option>`)
      .join("");

    return `
      <section class="page-head">
        <div class="container">
          <div class="eyebrow">THE RANKING · 1–100</div>
          <h1 class="page-title">TOP 100 榜单</h1>
          <p class="page-sub">人物、机构、AI 原生系统与策略范式混合编排。这不是一份“纯人物榜”，而是一张 AI 交易生态的全景图。点击任意条目查看入选理由。</p>
          <div class="stats-inline">
            <div><strong>100</strong><span>ENTRIES</span></div>
            <div><strong>5</strong><span>TIERS</span></div>
            <div><strong>15</strong><span>MODULES</span></div>
          </div>
        </div>
      </section>
      <section class="section-tight">
        <div class="container">
          <div class="toolbar">
            <div class="search-box">${icon("search")}<input class="input" id="rank-search" type="search" placeholder="搜索名称、机构、策略或关键词…" value="${escAttr(state.rank.q)}" aria-label="搜索榜单"></div>
            <div class="chips" id="tier-chips">${tierChips}</div>
            <select class="select" id="type-filter" aria-label="按类型筛选">${typeOptions}</select>
            <button class="btn btn-sm btn-ghost" id="export-csv" type="button">${icon("download")}导出 CSV</button>
          </div>
          <div class="rank-meta"><span id="rank-count"></span><span>点击条目查看详情 · 数据为编辑性重构</span></div>
          <div class="rank-list" id="rank-list"></div>
        </div>
      </section>
    `;
  }

  function filteredRankings() {
    const q = state.rank.q.trim().toLowerCase();
    return DATA.rankings.filter(r => {
      if (state.rank.tier !== "all" && r.tier !== state.rank.tier) return false;
      if (state.rank.type !== "全部" && r.type !== state.rank.type) return false;
      if (!q) return true;
      return [r.name, r.org, r.strategy, r.reason, r.type, r.tierLabel]
        .join(" ").toLowerCase().includes(q);
    });
  }

  function rankRow(r) {
    return `<div class="rank-row" data-rank="${r.rank}" tabindex="0" role="button" aria-label="查看第 ${r.rank} 名 ${escAttr(r.name)}">
      <div class="rank-no">${String(r.rank).padStart(3, "0")}</div>
      <div><div class="rank-name">${esc(r.name)}</div><div class="rank-sub">${esc(r.org)} · ${esc(r.type)}<span class="mobile-tier"> · ${esc(r.tierLabel)}</span></div></div>
      <div class="rank-strategy">${esc(r.strategy)}</div>
      <div class="rank-tier">${tierBadge(r.tier, r.tierLabel)}</div>
      <div class="rank-arrow" aria-hidden="true">›</div>
    </div>`;
  }

  function updateRankList() {
    const rows = filteredRankings();
    const list = $("#rank-list");
    const count = $("#rank-count");
    if (!list || !count) return;
    count.textContent = `显示 ${rows.length} / ${DATA.rankings.length} 条`;
    list.innerHTML = rows.length
      ? rows.map(rankRow).join("")
      : `<div class="empty">没有匹配的条目。试试更短的关键词，或切换分档。</div>`;
  }

  function bindRankings() {
    updateRankList();

    let timer = null;
    const search = $("#rank-search");
    if (search) {
      search.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          state.rank.q = search.value;
          updateRankList();
        }, 120);
      });
    }

    const chips = $("#tier-chips");
    if (chips) {
      chips.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-tier]");
        if (!btn) return;
        state.rank.tier = btn.dataset.tier;
        $$("[data-tier]", chips).forEach(b => b.classList.toggle("active", b === btn));
        updateRankList();
      });
    }

    const type = $("#type-filter");
    if (type) {
      type.addEventListener("change", () => {
        state.rank.type = type.value;
        updateRankList();
      });
    }

    const exportBtn = $("#export-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const rows = filteredRankings();
        const header = ["排名", "名称", "类型", "机构/归属", "代表策略", "入选理由", "分档"];
        const csv = [header, ...rows.map(r => [r.rank, r.name, r.type, r.org, r.strategy, r.reason, r.tierLabel])]
          .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
          .join("\r\n");
        downloadText("ai-trading-top100-filtered.csv", "\ufeff" + csv, "text/csv;charset=utf-8");
        toast(`已导出 ${rows.length} 条`);
      });
    }

    const list = $("#rank-list");
    if (list) {
      list.addEventListener("click", (e) => {
        const row = e.target.closest(".rank-row");
        if (row) openRankModal(Number(row.dataset.rank));
      });
      list.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        const row = e.target.closest(".rank-row");
        if (!row) return;
        e.preventDefault();
        openRankModal(Number(row.dataset.rank));
      });
    }
  }

  function openRankModal(rank) {
    const r = DATA.rankings.find(x => x.rank === rank);
    if (!r) return;
    openModal(`
      <div class="modal-head">
        <div>
          ${tierBadge(r.tier, r.tierLabel)}
          <h3 style="margin-top:10px">${esc(r.name)}</h3>
          <p class="modal-sub">${esc(r.org)} · ${esc(r.type)} · 第 ${r.rank} 名</p>
        </div>
        <button class="modal-close" type="button" data-close-modal aria-label="关闭">${icon("close")}</button>
      </div>
      <div class="modal-section" style="margin-top:0;padding-top:0;border-top:0">
        <span class="label">代表策略</span>
        <p style="color:var(--text)">${esc(r.strategy)}</p>
      </div>
      <div class="modal-section">
        <span class="label">入选理由</span>
        <p>${esc(r.reason)}</p>
      </div>
      <div class="modal-section">
        <span class="label">分档说明</span>
        <p>${esc(TIER[r.tier] ? TIER[r.tier].desc : "")}</p>
      </div>
    `);
  }

  /* ------------------------------------------------------------------------
     Strategies page
     ------------------------------------------------------------------------ */
  function scatterChart() {
    const points = DATA.results
      .filter(r => r.type === "回测" && STRATEGIES[r.module])
      .map(r => ({ ...r, s: STRATEGIES[r.module] }));
    if (!points.length) return "";

    const W = 820, H = 400;
    const padL = 56, padR = 24, padT = 26, padB = 46;
    const xMax = 18, yMax = 12, yMin = -1;
    const X = v => padL + (v / xMax) * (W - padL - padR);
    const Y = v => H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB);
    const xTicks = [0, 6, 12, 18];
    const yTicks = [0, 4, 8, 12];

    const labelConfig = {
      s14_crypto_basis: { dx: 9, dy: 3, anchor: "start" },
      s01_pairs: { dx: -10, dy: -9, anchor: "end" },
      s02_xsec_momentum: { dx: 9, dy: -9, anchor: "start" },
    };

    let grid = "";
    xTicks.forEach(t => {
      grid += `<line class="grid-line" x1="${X(t)}" y1="${Y(0)}" x2="${X(t)}" y2="${Y(yMax)}"/>`;
      grid += `<text class="axis-text" x="${X(t)}" y="${H - padB + 18}" text-anchor="middle">${t}%</text>`;
    });
    yTicks.forEach(t => {
      grid += `<line class="grid-line" x1="${X(0)}" y1="${Y(t)}" x2="${X(xMax)}" y2="${Y(t)}"/>`;
      grid += `<text class="axis-text" x="${padL - 12}" y="${Y(t) + 3}" text-anchor="end">${t}%</text>`;
    });
    grid += `<line class="axis-line" x1="${X(0)}" y1="${Y(0)}" x2="${X(xMax)}" y2="${Y(0)}"/>`;
    grid += `<line class="axis-line" x1="${X(0)}" y1="${Y(yMin)}" x2="${X(0)}" y2="${Y(yMax)}"/>`;
    grid += `<text class="axis-title" x="${X(xMax)}" y="${H - 10}" text-anchor="end">年化波动率 →</text>`;
    grid += `<text class="axis-title" x="${padL}" y="${padT - 10}">年化收益 ↑</text>`;

    const dots = points.map(p => {
      const x = X(p.ann_vol * 100);
      const y = Y(p.ann_ret * 100);
      const r = Math.max(5, Math.min(13, 5 + Math.max(0, p.sharpe) * 3));
      const color = categoryColor(p.s.category);
      const cfg = labelConfig[p.module];
      const label = cfg
        ? `<text x="${cfg.dx}" y="${cfg.dy}" text-anchor="${cfg.anchor}">${esc(p.s.title.split("：")[0])}</text>`
        : "";
      return `<g class="scatter-point" data-id="${p.module}" transform="translate(${x},${y})">
        <title>${esc(p.s.title)} · 年化 ${fmtPct(p.ann_ret)} · 夏普 ${fmtNum(p.sharpe)}</title>
        <circle r="${r}" fill="${color}" fill-opacity="0.78" stroke="${color}" stroke-width="1"/>
        ${label}
      </g>`;
    }).join("");

    const legend = DATA.categories.map(c =>
      `<span><i style="background:${c.color}"></i>${esc(c.name)}</span>`).join("");

    return `<div class="chart-card" data-reveal>
      <div class="chart-head">
        <div><h3>风险—收益地图</h3><p>11 个回测模块 · 圆点大小代表夏普 · 悬停查看，点击进入详情</p></div>
        <span class="badge">SYNTHETIC DATA</span>
      </div>
      <div class="scatter-wrap"><svg id="scatter" viewBox="0 0 ${W} ${H}" role="img" aria-label="策略风险收益散点图">${grid}${dots}</svg></div>
      <div class="chart-hint">左右滑动查看完整图表</div>
      <div class="legend">${legend}</div>
    </div>`;
  }

  function strategiesView() {
    const chips = ["全部", ...DATA.categories.map(c => c.name)]
      .map(c => `<button class="chip ${state.family === c ? "active" : ""}" data-category="${escAttr(c)}" type="button">${esc(c)}</button>`)
      .join("");
    return `
      <section class="page-head">
        <div class="container">
          <div class="eyebrow">STRATEGY MAP · 25 FAMILIES</div>
          <h1 class="page-title">策略族地图</h1>
          <p class="page-sub">从统计套利到链上 MEV，25 个策略族覆盖 AI 交易的主要战场。带“可运行”标记的卡片可以进入完整实现与源代码。</p>
          <div class="stats-inline">
            <div><strong>25</strong><span>FAMILIES</span></div>
            <div><strong>15</strong><span>KITS</span></div>
            <div><strong>6</strong><span>CATEGORIES</span></div>
          </div>
        </div>
      </section>
      <section class="section-tight">
        <div class="container">${scatterChart()}</div>
      </section>
      <section class="section-tight">
        <div class="container">
          <div class="chips" id="category-chips" style="margin-bottom:18px">${chips}</div>
          <div class="card-grid" id="family-grid">${FAMILIES.map(familyCard).join("")}</div>
        </div>
      </section>
    `;
  }

  function bindStrategies() {
    const chips = $("#category-chips");
    if (chips) {
      chips.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-category]");
        if (!btn) return;
        state.family = btn.dataset.category;
        $$("[data-category]", chips).forEach(b => b.classList.toggle("active", b === btn));
        const grid = $("#family-grid");
        if (grid) {
          const list = state.family === "全部"
            ? FAMILIES
            : FAMILIES.filter(f => f.category === state.family);
          grid.innerHTML = list.map(familyCard).join("");
        }
      });
    }

    const grid = $("#family-grid");
    if (grid) {
      grid.addEventListener("click", (e) => {
        const card = e.target.closest("[data-family]");
        if (!card) return;
        const fam = FAMILY_BY_ID[card.dataset.family];
        if (!fam) return;
        if (fam.code) {
          navigate(`/strategy/${fam.code}`);
        } else {
          openFamilyModal(fam.id);
        }
      });
    }

    const chart = $("#scatter");
    if (chart) {
      chart.addEventListener("click", (e) => {
        const point = e.target.closest(".scatter-point");
        if (point) navigate(`/strategy/${point.dataset.id}`);
      });
    }
  }

  function openFamilyModal(id) {
    const f = FAMILY_BY_ID[id];
    if (!f) return;
    const code = f.code ? STRATEGIES[f.code] : null;
    openModal(`
      <div class="modal-head">
        <div>
          <span class="badge" style="border-color:${f.color}55;background:${f.color}14">#${f.rank} · ${esc(f.category)}</span>
          <h3 style="margin-top:10px">${esc(f.name)}</h3>
          <p class="modal-sub">${esc(f.en)}</p>
        </div>
        <button class="modal-close" type="button" data-close-modal aria-label="关闭">${icon("close")}</button>
      </div>
      <p class="muted" style="font-size:13px;line-height:1.9">${esc(f.summary)}</p>
      <div class="modal-grid">
        <div><span>典型信号</span><strong>${esc(f.signal)}</strong></div>
        <div><span>持有期</span><strong>${esc(f.horizon)}</strong></div>
        <div><span>容量</span><strong>${esc(f.capacity)}</strong></div>
        <div><span>主要风险</span><strong>${esc(f.risk)}</strong></div>
      </div>
      <div class="modal-section">
        <span class="label">实现路径</span>
        <ul style="margin:0;padding-left:18px;color:var(--muted);font-size:13px;line-height:1.9">
          ${f.howto.map(h => `<li>${esc(h)}</li>`).join("")}
        </ul>
      </div>
      ${code ? `<div class="modal-section"><a class="btn btn-primary" href="#/strategy/${code.id}" data-close-modal>查看完整实现与源码 ${icon("arrow")}</a></div>` : ""}
    `);
  }

  /* ------------------------------------------------------------------------
     Strategy detail
     ------------------------------------------------------------------------ */
  function metricCard(label, value, note = "") {
    return `<div class="metric"><span class="metric-label">${esc(label)}</span><span class="metric-value">${esc(value)}</span>${note ? `<span class="metric-note">${esc(note)}</span>` : ""}</div>`;
  }

  function metricGrid(s) {
    const m = s.metrics;
    if (m.type === "回测") {
      return `<div class="metric-grid">
        ${metricCard("年化收益", fmtPct(m.ann_ret), "合成数据")}
        ${metricCard("年化波动", fmtPct(m.ann_vol, 1, false), "60 日滚动")}
        ${metricCard("夏普", fmtNum(m.sharpe), "未扣无风险利率")}
        ${metricCard("最大回撤", fmtPct(m.max_dd, 1, false), "净值峰谷")}
        ${metricCard("年换手", `${fmtNum(m.turnover, 1)}x`, "权重变化")}
      </div>`;
    }
    return `<div class="metric-grid">
      ${metricCard("类型", "仿真", "机制验证")}
      ${metricCard("关键结果", m.key || "—", "非历史回测")}
      ${metricCard("路径波动", fmtNum(m.ann_vol), "跨路径")}
      ${metricCard("代码行数", String(s.lines), "Python")}
      ${metricCard("类别", s.category, "策略族")}
    </div>`;
  }

  function codeShell(id, code) {
    const lines = code.split("\n").length;
    return `<div class="code-shell">
      <div class="code-head">
        <div class="code-title"><i></i> strategies/${esc(id)}.py <span style="color:#475569">· ${lines} lines</span></div>
        <div class="code-actions">
          <button class="code-btn" type="button" data-copy="${escAttr(id)}">${icon("copy")}复制</button>
          <button class="code-btn" type="button" data-download="${escAttr(id)}">${icon("download")}下载</button>
        </div>
      </div>
      <div class="code-body"><pre><code>${highlightPython(code)}</code></pre></div>
    </div>`;
  }

  function detailView(id) {
    const s = STRATEGIES[id];
    if (!s) return notFoundView();
    const color = categoryColor(s.category);
    const fam = s.familyId ? FAMILY_BY_ID[s.familyId] : null;
    const related = s.related.filter(x => STRATEGIES[x]);
    const prev = s.prev ? `<a class="btn btn-sm" href="#/strategy/${s.prev}">← ${esc(STRATEGIES[s.prev].title)}</a>` : "<span></span>";
    const next = s.next ? `<a class="btn btn-sm" href="#/strategy/${s.next}">${esc(STRATEGIES[s.next].title)} →</a>` : "<span></span>";

    return `
      <section class="detail-hero">
        <div class="container">
          <div class="breadcrumb"><a href="#/">首页</a><span>/</span><a href="#/strategies">策略</a><span>/</span><span>${esc(s.title)}</span></div>
          <div class="detail-kicker">
            <span class="badge">#${s.rank}</span>
            <span class="cat" style="--cat:${color}"><i></i>${esc(s.category)}</span>
            ${fam ? `<span class="badge">${esc(fam.name)}</span>` : ""}
          </div>
          <h1 class="detail-title">${esc(s.title)}</h1>
          <p class="detail-en">${esc(s.en)}</p>
          <p class="detail-lead">${esc(s.tagline)}</p>
          <div class="tag-row">${s.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          ${metricGrid(s)}
        </div>
      </section>

      <section class="section">
        <div class="container detail-grid">
          <div class="prose">
            <h2>原理</h2>
            <p>${esc(s.principle)}</p>

            <h2>数学</h2>
            <div class="formula-list">${s.math.map(f => `<div class="formula">${esc(f)}</div>`).join("")}</div>

            <h2>实现要点</h2>
            <ul>${s.implementation.map(i => `<li>${esc(i)}</li>`).join("")}</ul>

            <h2>风险</h2>
            <p>${esc(s.risk)}</p>

            <h2 style="scroll-margin-top:100px">源代码</h2>
            ${codeShell(id, s.code)}

            <div style="display:flex;justify-content:space-between;gap:12px;margin-top:34px;padding-top:20px;border-top:1px solid var(--line)">
              ${prev}${next}
            </div>
          </div>

          <aside class="detail-side">
            <div class="side-card">
              <h3>速览</h3>
              <dl class="side-list">
                <div><dt>排名</dt><dd>#${s.rank}</dd></div>
                <div><dt>策略族</dt><dd>${esc(s.category)}</dd></div>
                <div><dt>代码行数</dt><dd>${s.lines}</dd></div>
                <div><dt>回测类型</dt><dd>${esc(s.metrics.type)}</dd></div>
                <div><dt>文件</dt><dd class="mono" style="font-size:10px">${esc(id)}.py</dd></div>
              </dl>
            </div>

            ${fam ? `<div class="side-card">
              <h3>所属策略族</h3>
              <p style="margin:0 0 10px;font-size:12.5px;color:var(--muted);line-height:1.8">${esc(fam.summary)}</p>
              <a class="section-link" href="#/strategies">返回策略地图 ${icon("arrow")}</a>
            </div>` : ""}

            <div class="side-card">
              <h3>相关实现</h3>
              <div class="side-links">
                ${related.map(rid => `<a href="#/strategy/${rid}">${esc(STRATEGIES[rid].title)}<span>${esc(STRATEGIES[rid].category)}</span></a>`).join("")}
              </div>
            </div>

            <div class="side-card">
              <h3>下载</h3>
              <div style="display:flex;flex-direction:column;gap:8px">
                <button class="btn btn-sm btn-ghost" type="button" data-download="${escAttr(id)}">${icon("download")}下载 ${esc(id)}.py</button>
                <a class="btn btn-sm btn-ghost" href="#/report">${icon("doc")}报告与数据</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    `;
  }

  function bindDetail() {
    // Code copy/download handled by the global click listener.
  }

  /* ------------------------------------------------------------------------
     Code library
     ------------------------------------------------------------------------ */
  function moduleRow(mod, index) {
    const m = mod.metrics;
    const sharpe = m.type === "回测" ? fmtNum(m.sharpe) : (m.key || "—");
    const drawdown = m.type === "回测" ? fmtPct(m.max_dd, 1, false) : "—";
    const stats = m.type === "回测"
      ? `夏普 <b>${sharpe}</b> · 回撤 <b>${drawdown}</b>`
      : `结果 <b>${esc(m.key || "—")}</b>`;
    return `<div class="module-row">
      <span class="module-no">${String(index + 1).padStart(2, "0")}</span>
      <div>
        <div class="module-title">${esc(mod.title)}</div>
        <div class="module-file">strategies/${esc(mod.id)}.py · ${mod.lines} 行 · ${esc(mod.category)}</div>
      </div>
      <div class="module-metrics">${stats}</div>
      <div class="module-actions">
        <a class="btn btn-sm" href="#/strategy/${mod.id}">查看</a>
        <button class="btn btn-sm btn-ghost" type="button" data-download="${escAttr(mod.id)}">下载</button>
      </div>
    </div>`;
  }

  function codePageView() {
    return `
      <section class="page-head">
        <div class="container">
          <div class="eyebrow">CODE LIBRARY · 15 MODULES</div>
          <h1 class="page-title">代码库</h1>
          <p class="page-sub">15 个可独立运行的 Python 模块，只依赖 numpy / pandas。包含合成数据、向量化回测、交易成本与绩效指标。</p>
          <div class="stats-inline">
            <div><strong>15</strong><span>MODULES</span></div>
            <div><strong>1,000+</strong><span>LINES</span></div>
            <div><strong>0</strong><span>HEAVY DEPS</span></div>
          </div>
        </div>
      </section>
      <section class="section-tight">
        <div class="container">
          <div class="install">
            <span><b>$</b> pip install -r requirements.txt</span>
            <button class="code-btn" type="button" data-copy="requirements.txt">${icon("copy")}复制</button>
          </div>
          <div class="module-list" style="margin-top:18px">${DATA.modules.map(moduleRow).join("")}</div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-head">
            <div><div class="eyebrow">RUNNER</div><h2>一键跑完所有自检</h2><p>run_all.py 会依次运行 15 个模块，输出统一指标并写入 output/results.json。</p></div>
            <a class="section-link" href="#/report">下载完整报告 ${icon("arrow")}</a>
          </div>
          ${codeShell("run_all.py", DATA.codeExtras["run_all.py"] || "")}
        </div>
      </section>
    `;
  }

  /* ------------------------------------------------------------------------
     Method
     ------------------------------------------------------------------------ */
  function methodView() {
    return `
      <section class="page-head">
        <div class="container">
          <div class="eyebrow">METHODOLOGY</div>
          <h1 class="page-title">方法论与盲区</h1>
          <p class="page-sub">任何“TOP 100”都是编辑性重构。与其假装客观，不如把评分维度、数据来源和盲区一起说清楚。</p>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-head"><div><div class="eyebrow">SCORING</div><h2>四个维度</h2></div></div>
          <div class="dimension-grid">
            <div class="method-card" data-reveal><div class="method-num">30%</div><h3>资本与存续</h3><p>管理规模、存续年限、机构稳定性、穿越周期的能力。</p></div>
            <div class="method-card" data-reveal><div class="method-num">30%</div><h3>创新与影响力</h3><p>策略范式、论文/专利、开源工具、行业标准。</p></div>
            <div class="method-card" data-reveal><div class="method-num">20%</div><h3>可验证业绩</h3><p>公开竞赛名次、可查证记录、学术引用。不使用未审计收益。</p></div>
            <div class="method-card" data-reveal><div class="method-num">20%</div><h3>人才与溢出</h3><p>培养的人才、衍生机构、对行业基础设施的贡献。</p></div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-head"><div><div class="eyebrow">BLIND SPOTS</div><h2>五个必须承认的盲区</h2></div></div>
          <div class="report-list">
            <div class="report-item"><strong>匿名自营</strong><p>全球最赚钱的高频交易员可能从未出现在任何媒体上。</p><span>01</span></div>
            <div class="report-item"><strong>幸存者偏差</strong><p>我们只看到活下来的基金，看不到同样聪明却爆仓的团队。</p><span>02</span></div>
            <div class="report-item"><strong>规模与收益</strong><p>很多高夏普策略容量极小，规模做大后收益被稀释。</p><span>03</span></div>
            <div class="report-item"><strong>时间漂移</strong><p>今天的排名三年后可能完全失效，尤其是依赖制度红利的策略。</p><span>04</span></div>
            <div class="report-item"><strong>AI 标签通胀</strong><p>用线性回归包装成“AI”的基金，比真正做深度学习的多得多。</p><span>05</span></div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-head"><div><div class="eyebrow">SYNTHETIC DATA</div><h2>代码验证的是管线，不是收益</h2></div></div>
          <div class="category-panel">
            <div>
              <p class="muted" style="font-size:13.5px;line-height:1.9">合成面板包含市场因子、行业因子、弱趋势、个股 OU 定价误差、一组精确协整的资产对与短期反转成分。这样设计是为了让不同策略都能展示“信号—仓位—成本—净值”的完整管线。</p>
              <p class="muted" style="font-size:13.5px;line-height:1.9;margin-bottom:0">它不是对真实市场的模拟。所有夏普、收益、回撤只用于代码自检，不能用来推断策略的真实表现。</p>
            </div>
            <div class="category-note">
              <h3>三个不要</h3>
              <p>不要把合成数据回测当实盘业绩；不要把示例参数直接用于交易；不要忽略交易成本、容量与拥挤。</p>
            </div>
          </div>
          <div class="callout" style="margin-top:16px" data-reveal><strong>重要声明：</strong>${esc(DATA.meta.disclaimer)}</div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-head"><div><div class="eyebrow">READING LIST</div><h2>延伸阅读</h2></div></div>
          <div class="report-list">
            ${DATA.references.map(r => `<div class="report-item"><strong>${esc(r.title)}</strong><p>${esc(r.meta)} · ${esc(r.note)}</p><span>REF</span></div>`).join("")}
          </div>
        </div>
      </section>
    `;
  }

  /* ------------------------------------------------------------------------
     Report / downloads
     ------------------------------------------------------------------------ */
  function fileIcon(filename) {
    if (filename.endsWith(".docx")) return "doc";
    if (filename.endsWith(".xlsx") || filename.endsWith(".csv")) return "table";
    if (filename.endsWith(".zip")) return "zip";
    return "file";
  }

  function downloadCard(d) {
    return `<a class="download-card" href="${escAttr(d.href)}" download data-reveal>
      <span class="download-icon">${icon(fileIcon(d.filename))}</span>
      <h3>${esc(d.label)}</h3>
      <p>${esc(d.desc)}</p>
      <div class="download-foot"><span>${esc(d.size)}</span><span style="color:var(--accent)">下载 ↓</span></div>
    </a>`;
  }

  function reportView() {
    return `
      <section class="page-head">
        <div class="container">
          <div class="eyebrow">REPORT & DATA</div>
          <h1 class="page-title">报告与数据</h1>
          <p class="page-sub">主报告、榜单表格、Markdown 文本、CSV 与完整源码包。所有文件都可以离线使用。</p>
          <div class="stats-inline">
            <div><strong>5</strong><span>FILES</span></div>
            <div><strong>100</strong><span>ENTRIES</span></div>
            <div><strong>15</strong><span>MODULES</span></div>
          </div>
        </div>
      </section>
      <section class="section-tight">
        <div class="container">
          <div class="download-grid">${DATA.downloads.map(downloadCard).join("")}</div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-head"><div><div class="eyebrow">STRUCTURE</div><h2>报告里有什么</h2></div></div>
          <div class="report-list">
            <div class="report-item"><strong>100 条榜单</strong><p>人物、机构、AI 原生系统与策略范式，五个分档，附入选理由。</p><span>01</span></div>
            <div class="report-item"><strong>25 个策略族</strong><p>从统计套利、做市到加密基差与 MEV，附信号、持有期、容量与风险。</p><span>02</span></div>
            <div class="report-item"><strong>15 个策略详解</strong><p>原理、数学、实现要点、风险，以及可直接运行的完整 Python 代码。</p><span>03</span></div>
            <div class="report-item"><strong>实盘与合规</strong><p>前视偏差、幸存者偏差、成本、容量、过拟合、制度变化与执行运维。</p><span>04</span></div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-head"><div><div class="eyebrow">CITATION</div><h2>引用与许可</h2></div></div>
          <div class="code-shell">
            <div class="code-head"><div class="code-title"><i></i> citation.txt</div><button class="code-btn" type="button" data-copy="citation">${icon("copy")}复制</button></div>
            <div class="code-body"><pre><code>AI Trading Atlas. (2026). 全球 AI 交易 TOP 100 与顶尖策略源代码.
Research Edition 1.0. 编辑性榜单，非官方排名。

代码：MIT License · 文字：CC BY-NC 4.0
仅供研究学习，不构成投资建议。</code></pre></div>
          </div>
        </div>
      </section>
    `;
  }

  /* ------------------------------------------------------------------------
     Modal / not found
     ------------------------------------------------------------------------ */
  function openModal(html) {
    modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
    document.body.style.overflow = "hidden";
    const closeBtn = $(".modal-close", modalRoot);
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modalRoot.innerHTML) return;
    modalRoot.innerHTML = "";
    document.body.style.overflow = "";
  }

  function notFoundView() {
    return `<section class="page-head"><div class="container">
      <div class="eyebrow">404</div>
      <h1 class="page-title">这条路径不存在</h1>
      <p class="page-sub">可能是链接过期，或者策略编号写错了。</p>
      <div style="margin-top:24px"><a class="btn btn-primary" href="#/">返回首页 ${icon("arrow")}</a></div>
    </div></section>`;
  }

  /* ------------------------------------------------------------------------
     Motion
     ------------------------------------------------------------------------ */
  function initReveal() {
    if (revealObserver) revealObserver.disconnect();
    const els = $$("[data-reveal]");
    if (!els.length) return;
    if (REDUCED || !("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("in"));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => revealObserver.observe(el));
  }

  function initCounters() {
    // 数字直接以最终值渲染，避免首屏动画造成误导或布局抖动。
  }

  /* ------------------------------------------------------------------------
     Global interactions
     ------------------------------------------------------------------------ */
  function bindGlobal() {
    const themeBtn = $("#theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        applyTheme(state.theme === "dark" ? "light" : "dark");
        toast(state.theme === "dark" ? "已切换到深色主题" : "已切换到浅色主题");
      });
    }

    const menuBtn = $("#menu-btn");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        const open = document.body.classList.toggle("nav-open");
        menuBtn.setAttribute("aria-expanded", String(open));
      });
    }

    document.addEventListener("click", (e) => {
      if (e.target.classList && e.target.classList.contains("modal-backdrop")) {
        closeModal();
        return;
      }
      const closeBtn = e.target.closest("[data-close-modal]");
      if (closeBtn) {
        closeModal();
        return;
      }
      if (e.target.closest(".nav a")) {
        document.body.classList.remove("nav-open");
        if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
      }

      const copyBtn = e.target.closest("[data-copy]");
      if (copyBtn) {
        const key = copyBtn.dataset.copy;
        let text = "";
        if (key === "citation") {
          text = `AI Trading Atlas. (2026). 全球 AI 交易 TOP 100 与顶尖策略源代码. Research Edition 1.0.`;
        } else if (STRATEGIES[key]) {
          text = STRATEGIES[key].code;
        } else if (DATA.codeExtras[key]) {
          text = DATA.codeExtras[key];
        }
        if (text) copyText(text);
        return;
      }

      const downloadBtn = e.target.closest("[data-download]");
      if (downloadBtn) {
        const key = downloadBtn.dataset.download;
        if (STRATEGIES[key]) {
          downloadText(`${key}.py`, STRATEGIES[key].code, "text/x-python;charset=utf-8");
          toast(`已下载 ${key}.py`);
        } else if (DATA.codeExtras[key]) {
          downloadText(key, DATA.codeExtras[key]);
          toast(`已下载 ${key}`);
        }
        return;
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        const search = $("#rank-search");
        if (search) {
          e.preventDefault();
          search.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  applyTheme(state.theme);
  if ($("#foot-date")) $("#foot-date").textContent = DATA.meta.generated;
  bindGlobal();
  window.addEventListener("hashchange", render);
  render();
})();
