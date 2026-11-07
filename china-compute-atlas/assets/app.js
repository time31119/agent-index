/* ==========================================================================
   算力地理 · 交互层
   无构建工具、无外部依赖，直接打开 index.html 即可运行。
   ========================================================================== */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const number = new Intl.NumberFormat("zh-CN");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    query: "",
    province: "全部",
    type: "全部",
    use: "全部",
    sort: "relevance",
    completeOnly: false,
    view: "grid",
    compare: [],
  };

  let currentCenterId = null;
  let lastFocused = null;
  let toastTimer = null;

  /* ------------------------------------------------------------------------
     Utilities
     ------------------------------------------------------------------------ */

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalise(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[·•]/g, "");
  }

  function formatP(value) {
    if (value == null || Number.isNaN(value)) return "—";
    if (value >= 1000) {
      const ep = value / 1000;
      return `${number.format(Number(ep.toFixed(ep % 1 === 0 ? 0 : 1)))} EP`;
    }
    return `${number.format(value)}P`;
  }

  function formatCompute(c) {
    if (c.aiCompute && c.hpcCompute) return `${formatP(c.aiCompute)} AI / ${formatP(c.hpcCompute)} HPC`;
    if (c.aiCompute) return formatP(c.aiCompute);
    if (c.hpcCompute) return formatP(c.hpcCompute);
    if (c.computeText && c.computeText !== "未披露") return c.computeText;
    return "未披露";
  }

  function maxCompute(c) {
    return Math.max(c.aiCompute || 0, c.hpcCompute || 0);
  }

  function contactCount(c) {
    return [c.phone, c.email, c.website].filter(Boolean).length;
  }

  function locationText(c) {
    const parts = [c.province];
    if (c.city && c.city !== c.province) parts.push(c.city);
    if (c.district) parts.push(c.district);
    return parts.join(" · ");
  }

  function completeness(c) {
    const fields = [
      { key: "地址", ok: Boolean(c.address) },
      { key: "联系方式", ok: contactCount(c) > 0 },
      { key: "机型", ok: (c.models && c.models.length) || (c.chips && c.chips.length) },
      { key: "算力", ok: Boolean(c.aiCompute || c.hpcCompute || (c.computeText && c.computeText !== "未披露")) },
      { key: "规模", ok: Boolean(c.scale) },
      { key: "计费", ok: Boolean(c.pricing && c.pricing.text) },
      { key: "来源", ok: Boolean(c.sources && c.sources.length) },
    ];
    const done = fields.filter((field) => field.ok).length;
    return {
      done,
      total: fields.length,
      pct: Math.round((done / fields.length) * 100),
      missing: fields.filter((field) => !field.ok).map((field) => field.key),
    };
  }

  function confMeta(c) {
    return CONFIDENCE_META[c.confidence] || CONFIDENCE_META.pending;
  }

  function amapUrl(c) {
    return `https://www.amap.com/search?query=${encodeURIComponent(`${c.name} ${c.address || c.city || ""}`)}`;
  }

  function phoneHref(phone) {
    return `tel:${String(phone).replace(/[^\d+]/g, "")}`;
  }

  function hostOf(url) {
    try { return new URL(url).host.replace(/^www\./, ""); } catch { return url; }
  }

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 2300);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制到剪贴板");
      return true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      document.body.removeChild(area);
      showToast(ok ? "已复制到剪贴板" : "复制失败，请手动选择");
      return ok;
    }
  }

  function setHash(hash, mode = "push") {
    try {
      history[mode === "replace" ? "replaceState" : "pushState"]({ drawer: hash.startsWith("#/center/") }, "", hash);
    } catch {
      location.hash = hash;
    }
  }

  function parseCenterHash(hash) {
    const match = String(hash || "").match(/^#\/center\/(.+)$/);
    if (!match) return null;
    try { return decodeURIComponent(match[1]); } catch { return null; }
  }

  /* ------------------------------------------------------------------------
     Filtering & rendering
     ------------------------------------------------------------------------ */

  function getFiltered() {
    const query = normalise(state.query);
    let list = CENTERS.filter((c) => {
      if (state.province !== "全部" && c.province !== state.province) return false;
      if (state.type !== "全部" && c.type !== state.type) return false;
      if (state.use !== "全部" && !(c.uses || []).includes(state.use)) return false;
      if (state.completeOnly && completeness(c).pct < 60) return false;

      if (query) {
        const haystack = normalise([
          c.name, c.alias, c.province, c.city, c.district, c.type, c.operator,
          c.address, c.computeText, c.computeNote, c.scale,
          (c.models || []).join(" "), (c.chips || []).join(" "),
          (c.uses || []).join(" "), (c.pricing && c.pricing.text) || "",
        ].join(" "));
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    if (state.sort === "compute") {
      list = list.slice().sort((a, b) => maxCompute(b) - maxCompute(a) || a.name.localeCompare(b.name, "zh-CN"));
    } else if (state.sort === "completeness") {
      list = list.slice().sort((a, b) => completeness(b).pct - completeness(a).pct || a.name.localeCompare(b.name, "zh-CN"));
    } else if (state.sort === "province") {
      list = list.slice().sort((a, b) => PROVINCES.indexOf(a.province) - PROVINCES.indexOf(b.province));
    } else if (state.sort === "name") {
      list = list.slice().sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
    }
    return list;
  }

  function renderCard(c, index) {
    const comp = completeness(c);
    const conf = confMeta(c);
    const modelTags = (c.models && c.models.length ? c.models : c.chips) || [];
    const tags = modelTags.length
      ? modelTags.slice(0, 3).map((model) => `<span class="tag">${escapeHTML(model)}</span>`).join("")
      : '<span class="tag tag-muted">机型未披露</span>';
    const extraTag = modelTags.length > 3 ? `<span class="tag tag-muted">+${modelTags.length - 3}</span>` : "";

    return `
      <article class="center-card" data-id="${escapeHTML(c.id)}" data-type="${escapeHTML(c.type)}">
        <span class="card-index">NO.${String(index + 1).padStart(3, "0")}</span>
        <div class="card-top">
          <span class="type-badge" data-type="${escapeHTML(c.type)}">${escapeHTML(c.type)}</span>
          <span class="conf-badge" data-tone="${escapeHTML(conf.tone)}">${escapeHTML(conf.label)}</span>
        </div>
        <h3><a href="#/center/${encodeURIComponent(c.id)}" data-open-center="${escapeHTML(c.id)}">${escapeHTML(c.name)}</a></h3>
        <p class="card-location">
          <svg class="icon" aria-hidden="true"><use href="#i-pin"></use></svg>
          <span>${escapeHTML(locationText(c))}</span>
        </p>
        <div class="card-metrics">
          <div>
            <span>智能算力</span>
            <strong>${c.aiCompute ? formatP(c.aiCompute) : "—"}</strong>
          </div>
          <div>
            <span>超算峰值</span>
            <strong>${c.hpcCompute ? formatP(c.hpcCompute) : "—"}</strong>
          </div>
          <div>
            <span>资料完整</span>
            <strong>${comp.pct}<small>%</small></strong>
          </div>
        </div>
        <div class="card-tags">${tags}${extraTag}</div>
        <p class="card-note">${escapeHTML(c.computeNote || c.operator || "公开资料待补充。")}</p>
        <div class="card-foot">
          <span class="completeness">
            <span class="completeness-bar"><i style="width:${comp.pct}%"></i></span>
            ${comp.done}/${comp.total} 字段
          </span>
          <span class="card-open">
            <button class="compare-toggle${state.compare.includes(c.id) ? " is-on" : ""}" type="button" data-compare="${escapeHTML(c.id)}" aria-pressed="${state.compare.includes(c.id)}" title="加入对比">
              <svg class="icon" aria-hidden="true"><use href="#i-compare"></use></svg>
              对比
            </button>
            <a href="#/center/${encodeURIComponent(c.id)}" data-open-center="${escapeHTML(c.id)}">查看档案</a>
            <svg class="icon" aria-hidden="true"><use href="#i-arrow"></use></svg>
          </span>
        </div>
      </article>`;
  }

  function renderRow(c, index) {
    const comp = completeness(c);
    const conf = confMeta(c);
    const tags = ((c.models && c.models.length ? c.models : c.chips) || []).slice(0, 2);
    return `
      <article class="center-row" data-id="${escapeHTML(c.id)}" data-type="${escapeHTML(c.type)}">
        <span class="row-no">${String(index + 1).padStart(2, "0")}</span>
        <div class="row-main">
          <h3><a href="#/center/${encodeURIComponent(c.id)}" data-open-center="${escapeHTML(c.id)}">${escapeHTML(c.name)}</a></h3>
          <p>${escapeHTML(locationText(c))} &nbsp;/&nbsp; ${escapeHTML(c.type)} &nbsp;/&nbsp; ${comp.pct}%</p>
        </div>
        <div class="row-compute">
          <span>公开算力</span>
          ${escapeHTML(formatCompute(c))}
        </div>
        <div class="row-tags">
          ${tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("") || '<span class="tag tag-muted">机型未披露</span>'}
        </div>
        <div class="row-right">
          <span class="conf-badge" data-tone="${escapeHTML(conf.tone)}">${escapeHTML(conf.short)}</span>
          <button class="compare-toggle${state.compare.includes(c.id) ? " is-on" : ""}" type="button" data-compare="${escapeHTML(c.id)}" aria-pressed="${state.compare.includes(c.id)}" title="加入对比">
            <svg class="icon" aria-hidden="true"><use href="#i-compare"></use></svg>
          </button>
        </div>
      </article>`;
  }

  function renderDirectory() {
    const grid = $("#directoryGrid");
    const empty = $("#emptyState");
    const count = $("#resultsCount");
    if (!grid) return;

    const list = getFiltered();
    const covered = new Set(list.map((c) => c.province)).size;
    grid.classList.toggle("is-list", state.view === "list");
    grid.innerHTML = state.view === "list"
      ? list.map(renderRow).join("")
      : list.map(renderCard).join("");

    if (empty) empty.hidden = list.length > 0;
    if (count) {
      count.innerHTML = `<strong>${list.length}</strong> 个设施 / 共 ${CENTERS.length} 条档案 · 覆盖 ${covered} 个省级行政区`;
    }
    renderActiveFilters();
    updateCompareTray();
  }

  function renderActiveFilters() {
    const wrap = $("#activeFilters");
    if (!wrap) return;
    const chips = [];
    if (state.query) chips.push({ key: "query", label: `搜索：${state.query}` });
    if (state.province !== "全部") chips.push({ key: "province", label: `省份：${state.province}` });
    if (state.type !== "全部") chips.push({ key: "type", label: `类型：${state.type}` });
    if (state.use !== "全部") chips.push({ key: "use", label: `能力：${state.use}` });
    if (state.completeOnly) chips.push({ key: "completeOnly", label: "资料较完整" });
    wrap.innerHTML = chips.map((chip) => `
      <span class="filter-chip">${escapeHTML(chip.label)}
        <button type="button" data-clear-filter="${chip.key}" aria-label="移除筛选：${escapeHTML(chip.label)}">×</button>
      </span>`).join("");
  }

  function renderAtlas() {
    const board = $("#provinceBoard");
    if (!board) return;

    const stats = new Map(PROVINCE_STATS.map((item) => [item.province, item]));
    const maxValue = Math.max(...PROVINCE_STATS.map((item) => Math.max(item.ai, item.hpc)), 1);
    const logMax = Math.log10(maxValue + 1);

    board.innerHTML = REGIONS.map((region) => {
      const regionStats = region.provinces.map((province) => stats.get(province) || { province, count: 0, ai: 0, hpc: 0 });
      const total = regionStats.reduce((sum, item) => sum + item.count, 0);
      const cards = regionStats.map((item) => {
        const active = state.province === item.province;
        const value = Math.max(item.ai, item.hpc);
        const bar = item.count && value > 0 ? Math.max(8, Math.round((Math.log10(value + 1) / logMax) * 100)) : 0;
        const computeLabel = item.count
          ? (item.ai ? `${formatP(item.ai)} AI` : item.hpc ? `${formatP(item.hpc)} HPC` : "算力未披露")
          : "暂无档案";
        return `
          <button class="province-card${item.count ? "" : " is-empty"}${active ? " is-active" : ""}" type="button" data-province="${escapeHTML(item.province)}" aria-pressed="${active}">
            <span class="pc-top">
              <span class="pc-name">${escapeHTML(item.province)}</span>
              <span class="pc-count">${item.count || "—"}<small>${item.count ? "条" : "待补"}</small></span>
            </span>
            <span class="pc-meta">${escapeHTML(computeLabel)}</span>
            <span class="pc-bar"><i style="width:${bar}%"></i></span>
          </button>`;
      }).join("");

      return `
        <section class="region-block">
          <div class="region-head">
            <h3>${escapeHTML(region.name)}</h3>
            <span>${escapeHTML(region.en)}<br>${region.provinces.length} 省 · ${total} 设施</span>
          </div>
          <div class="province-grid">${cards}</div>
        </section>`;
    }).join("");
  }

  function renderHeroGrid() {
    const grid = $("#heroGrid");
    if (!grid) return;
    grid.innerHTML = CENTERS.map((c) => `
      <button class="hero-cell" type="button" data-type="${escapeHTML(c.type)}" data-open-center="${escapeHTML(c.id)}" title="${escapeHTML(`${c.name} · ${c.city}`)}" aria-label="${escapeHTML(c.name)}"></button>
    `).join("");
  }

  function renderModelIndex() {
    const wrap = $("#modelGrid");
    if (!wrap) return;

    const groups = [
      {
        key: "ascend",
        label: "昇腾 910 / Atlas 900",
        en: "HUAWEI ASCEND · NPU",
        mark: "NPU",
        test: (c) => /昇腾|Ascend|Atlas/i.test([...(c.chips || []), ...(c.models || [])].join(" ")),
      },
      {
        key: "nvidia",
        label: "NVIDIA 训练 GPU",
        en: "H100 / H800 / A100 / A800",
        mark: "GPU",
        test: (c) => /NVIDIA|H100|H800|A100|A800/i.test([...(c.chips || []), ...(c.models || [])].join(" ")),
      },
      {
        key: "shenwei",
        label: "申威 26010",
        en: "SW26010 · MANY-CORE CPU",
        mark: "CPU",
        test: (c) => /申威|SW26010/i.test([...(c.chips || []), ...(c.models || [])].join(" ")),
      },
      {
        key: "tianhe",
        label: "天河 / 神威 系统",
        en: "TIANHE / SHENWEI SYSTEMS",
        mark: "HPC",
        test: (c) => /天河|神威/i.test([...(c.models || [])].join(" ")),
      },
      {
        key: "domestic",
        label: "国产加速卡 / DCU",
        en: "HYGON DCU · MLU · R200",
        mark: "DCU",
        test: (c) => /海光|DCU|寒武纪|MLU|昆仑芯|R200|燧原/i.test([...(c.chips || []), ...(c.models || [])].join(" ")),
      },
      {
        key: "gpu",
        label: "通用 GPU / 异构集群",
        en: "GPU CLUSTER · MIXED",
        mark: "GPU",
        test: (c) => /GPU/i.test([...(c.chips || []), ...(c.models || [])].join(" ")) && !/NVIDIA|H100|H800|A100|A800|昇腾|Ascend|Atlas/i.test([...(c.chips || []), ...(c.models || [])].join(" ")),
      },
    ];

    groups.forEach((group) => {
      group.count = CENTERS.filter(group.test).length;
    });

    wrap.innerHTML = groups.map((group) => `
      <article class="model-card" data-mark="${escapeHTML(group.mark)}">
        <div class="model-top">
          <span>${escapeHTML(group.en)}</span>
          <span>${String(group.count).padStart(2, "0")}</span>
        </div>
        <h3>${escapeHTML(group.label)}</h3>
        <p class="model-sub">档案登记数（含待核实）</p>
        <div class="model-count">${group.count ? `<strong>${group.count}</strong><span>个设施</span>` : "<strong>—</strong><span>公开机型待补</span>"}</div>
      </article>
    `).join("");
  }

  function renderGaps() {
    const wrap = $("#gapList");
    if (!wrap) return;
    const stats = new Map(PROVINCE_STATS.map((item) => [item.province, item]));
    wrap.innerHTML = PROVINCES.map((province) => {
      const stat = stats.get(province) || { count: 0 };
      const items = CENTERS.filter((c) => c.province === province);
      const missing = items.reduce((sum, c) => sum + completeness(c).missing.length, 0);
      return `
        <div class="gap-row${stat.count ? "" : " is-empty"}">
          <span>${escapeHTML(province)}</span>
          <span>${stat.count ? `${stat.count} 条 · ${missing} 项待补` : "暂无档案 · 待补"}</span>
        </div>`;
    }).join("");
  }

  function updateStats() {
    const provinceCount = new Set(CENTERS.map((c) => c.province)).size;
    const nsccCount = CENTERS.filter((c) => c.type === "国家超算").length;
    const contacts = CENTERS.filter((c) => contactCount(c) > 0).length;

    const bindings = {
      centerCount: CENTERS.length,
      provinceCount,
      nsccCount,
      contactCount: contacts,
    };
    Object.entries(bindings).forEach(([key, value]) => {
      $$(`[data-bind="${key}"]`).forEach((el) => { el.textContent = number.format(value); });
    });
  }

  function renderProvinceFilter() {
    const select = $("#provinceFilter");
    if (!select) return;
    const stats = new Map(PROVINCE_STATS.map((item) => [item.province, item.count]));
    select.innerHTML = '<option value="全部">全部省份</option>' + PROVINCES.map((province) => {
      const count = stats.get(province) || 0;
      return `<option value="${escapeHTML(province)}">${escapeHTML(province)}${count ? ` (${count})` : " · 待补"}</option>`;
    }).join("");
  }

  /* ------------------------------------------------------------------------
     Detail drawer
     ------------------------------------------------------------------------ */

  function detailTemplate(c) {
    const comp = completeness(c);
    const conf = confMeta(c);
    const phone = c.phone
      ? `<a href="${phoneHref(c.phone)}">${escapeHTML(c.phone)}</a>`
      : '<span class="contact-empty">未公开</span>';
    const email = c.email
      ? `<a href="mailto:${escapeHTML(c.email)}">${escapeHTML(c.email)}</a>`
      : '<span class="contact-empty">未公开</span>';
    const website = c.website
      ? `<a href="${escapeHTML(c.website)}" target="_blank" rel="noopener">${escapeHTML(hostOf(c.website))}</a>`
      : '<span class="contact-empty">未公开</span>';
    const models = (c.models && c.models.length)
      ? c.models.map((model) => `<span class="tag">${escapeHTML(model)}</span>`).join("")
      : '<span class="tag tag-muted">未披露</span>';
    const chips = (c.chips && c.chips.length)
      ? c.chips.map((chip) => `<span class="tag">${escapeHTML(chip)}</span>`).join("")
      : '<span class="tag tag-muted">未披露</span>';
    const uses = (c.uses && c.uses.length)
      ? c.uses.map((use) => `<span class="tag">${escapeHTML(use)}</span>`).join("")
      : '<span class="tag tag-muted">待补充</span>';
    const gaps = (c.gaps && c.gaps.length)
      ? c.gaps.map((gap) => `<span class="gap-chip">${escapeHTML(gap)}</span>`).join("")
      : '<span class="gap-chip">暂未列出</span>';
    const sources = (c.sources && c.sources.length)
      ? c.sources.map((source) => `
          <div class="source-item">
            <a href="${escapeHTML(source.url)}" target="_blank" rel="noopener">${escapeHTML(source.label)} <svg class="icon" aria-hidden="true"><use href="#i-external"></use></svg></a>
            <span>${escapeHTML(source.kind || "来源")}</span>
          </div>`).join("")
      : '<div class="source-item"><span>暂无公开来源</span></div>';
    const hasFacilitySource = (c.sources || []).some((source) => source.kind !== "政策");

    return `
      <div class="detail-hero">
        <div class="detail-badges">
          <span class="type-badge" data-type="${escapeHTML(c.type)}">${escapeHTML(c.type)}</span>
          <span class="conf-badge" data-tone="${escapeHTML(conf.tone)}">${escapeHTML(conf.label)}</span>
          <span class="conf-badge">${escapeHTML(c.status || "状态待核实")}</span>
        </div>
        <h1 id="detailTitle">${escapeHTML(c.name)}</h1>
        ${c.alias ? `<p class="detail-alias">${escapeHTML(c.alias)}</p>` : ""}
        <div class="detail-location">
          <svg class="icon" aria-hidden="true"><use href="#i-pin"></use></svg>
          <span>${escapeHTML(locationText(c))} / 定位精度：${escapeHTML(c.precision || "待核实")}</span>
        </div>
        <div class="detail-metrics">
          <div class="detail-metric"><span>智能算力</span><strong>${c.aiCompute ? formatP(c.aiCompute) : "—"}</strong><small>PFLOPS · 多为 FP16</small></div>
          <div class="detail-metric"><span>超算峰值</span><strong>${c.hpcCompute ? formatP(c.hpcCompute) : "—"}</strong><small>PFLOPS · 多为 FP64</small></div>
          <div class="detail-metric"><span>资料完整度</span><strong>${comp.pct}%</strong><small>${comp.done} / ${comp.total} 个字段</small></div>
        </div>
        <div class="detail-actions">
          <a class="btn btn-solid btn-small" href="${amapUrl(c)}" target="_blank" rel="noopener">
            <svg class="icon" aria-hidden="true"><use href="#i-map"></use></svg> 地图搜索
          </a>
          <button class="btn btn-line btn-small" type="button" data-copy-summary="${escapeHTML(c.id)}">
            <svg class="icon" aria-hidden="true"><use href="#i-copy"></use></svg> 复制摘要
          </button>
          <button class="btn btn-line btn-small${state.compare.includes(c.id) ? " is-on" : ""}" type="button" data-compare="${escapeHTML(c.id)}">
            <svg class="icon" aria-hidden="true"><use href="#i-compare"></use></svg> ${state.compare.includes(c.id) ? "已加入对比" : "加入对比"}
          </button>
          <button class="btn btn-line btn-small" type="button" data-action="open-contribute">
            <svg class="icon" aria-hidden="true"><use href="#i-plus"></use></svg> 补充资料
          </button>
        </div>
      </div>

      <section class="detail-section">
        <div class="detail-section-head"><h2>位置与联系</h2><span>LOCATION / CONTACT</span></div>
        <div class="addr-block">
          <p>${escapeHTML(c.address || "详细地址待补充")}</p>
          <small>${c.precision === "门牌" ? "门牌级定位，建议出发前电话确认" : "园区 / 城市级定位，门牌与楼栋待核实"}</small>
          <div class="copy-row">
            <button class="text-btn" type="button" data-copy="${escapeHTML(c.address || "")}" data-label="地址">复制地址</button>
          </div>
        </div>
        <div class="contact-list">
          <div class="contact-item">
            <span>电话 / PHONE</span>
            ${phone}
            <small>${escapeHTML(c.phoneNote || "以运营方最新公布为准")}</small>
          </div>
          <div class="contact-item">
            <span>邮箱 / EMAIL</span>
            ${email}
            <small>${c.email ? "商务或技术支持邮箱" : "未公开"}</small>
          </div>
          <div class="contact-item">
            <span>官网 / WEB</span>
            ${website}
            <small>${c.website ? "运营方或项目官网" : "未公开"}</small>
          </div>
          <div class="contact-item">
            <span>补充说明 / NOTE</span>
            <strong style="font-weight:400">${escapeHTML(c.contactNote || "公开资料未列额外联系说明。")}</strong>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="detail-section-head"><h2>算力与机型</h2><span>COMPUTE / MACHINES</span></div>
        <dl class="data-rows">
          <div class="data-row"><dt>运营方</dt><dd>${escapeHTML(c.operator || "待补充")}</dd></div>
          <div class="data-row"><dt>类型 / 状态</dt><dd>${escapeHTML(c.type)} · ${escapeHTML(c.status || "待核实")}${c.founded ? ` · 成立于 ${escapeHTML(c.founded)}` : ""}</dd></div>
          <div class="data-row"><dt>算力口径</dt><dd><strong>${escapeHTML(c.computeText || "未披露")}</strong><small>${escapeHTML(c.computeNote || "暂无口径说明。")}</small></dd></div>
          <div class="data-row"><dt>整机 / 系统</dt><dd><div class="gap-chips">${models}</div></dd></div>
          <div class="data-row"><dt>芯片 / 加速卡</dt><dd><div class="gap-chips">${chips}</div></dd></div>
          <div class="data-row"><dt>规模</dt><dd>${escapeHTML(c.scale || "待补充")}</dd></div>
          <div class="data-row"><dt>能力</dt><dd><div class="gap-chips">${uses}</div></dd></div>
          ${c.hub ? `<div class="data-row"><dt>枢纽 / 集群</dt><dd>${escapeHTML(c.hub)}${c.cluster ? ` · ${escapeHTML(c.cluster)} 集群` : ""}</dd></div>` : ""}
        </dl>
      </section>

      <section class="detail-section">
        <div class="detail-section-head"><h2>收费与接入</h2><span>PRICING / ACCESS</span></div>
        <div class="pricing-box">
          <strong>${escapeHTML((c.pricing && c.pricing.mode) || "需询价")}</strong>
          <p>${escapeHTML((c.pricing && c.pricing.text) || "未公开标准价，需向运营方询价。")}</p>
        </div>
        <p class="detail-note">价格会随卡型、卡数、存储、网络、时长与补贴政策变化。请以运营方书面报价为准；本站不代收、不转售算力。</p>
      </section>

      <section class="detail-section">
        <div class="detail-section-head"><h2>资料来源</h2><span>SOURCES</span></div>
        <div class="source-list">${sources}</div>
        ${hasFacilitySource ? "" : '<p class="source-warning">本条目前只有区域政策来源，设施级地址、运营状态与算力尚未获得运营方公告或政府项目页确认。</p>'}
        <p class="detail-note">最后核对：${escapeHTML(SITE.snapshot)}。凡标注“待核实”的字段，均不建议作为采购或访问的唯一依据。</p>
      </section>

      <section class="detail-section">
        <div class="detail-section-head"><h2>还缺什么</h2><span>OPEN FIELDS</span></div>
        <div class="gap-chips">${gaps}</div>
        <p class="detail-note">如果你掌握公开来源，欢迎补充门牌、商务电话、在售机型、可用算力或计费单价。空白不是错误，假装完整才是。</p>
        <div class="copy-row">
          <button class="btn btn-line btn-small" type="button" data-action="open-contribute">提交这条档案的补充</button>
        </div>
      </section>
    `;
  }

  function openDetail(id, options = {}) {
    const c = CENTERS.find((item) => item.id === id);
    if (!c) {
      showToast("没有找到这条档案");
      return;
    }

    currentCenterId = id;
    if (!document.body.classList.contains("drawer-open")) lastFocused = document.activeElement;
    const content = $("#detailContent");
    const drawer = $("#detailDrawer");
    const backdrop = $("#drawerBackdrop");
    if (!content || !drawer || !backdrop) return;

    content.innerHTML = detailTemplate(c);
    drawer.scrollTop = 0;
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    document.body.classList.add("drawer-open");
    setBackgroundInert(true);
    document.title = `${c.name} · 算力地理`;

    if (options.push) {
      const nextHash = `#/center/${encodeURIComponent(id)}`;
      if (location.hash !== nextHash) setHash(nextHash, "push");
    }

    setTimeout(() => $("#closeDrawer")?.focus({ preventScroll: true }), 60);
  }

  function closeDrawerUI() {
    const drawer = $("#detailDrawer");
    const backdrop = $("#drawerBackdrop");
    if (!drawer || !backdrop) return;

    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("inert", "");
    document.body.classList.remove("drawer-open");
    setBackgroundInert(false);
    document.title = "算力地理 · 中国算力中心公开档案";
    currentCenterId = null;

    setTimeout(() => {
      if (!document.body.classList.contains("drawer-open")) backdrop.hidden = true;
    }, 400);

    if (lastFocused && typeof lastFocused.focus === "function" && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function closeDetail() {
    closeDrawerUI();
    setHash("#directory", "replace");
  }

  function setBackgroundInert(active) {
    const targets = [document.querySelector("main"), $("#siteHeader"), $(".site-footer"), $("#compareTray")];
    targets.forEach((element) => {
      if (!element) return;
      if (active) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
    });
  }

  function trapDrawerFocus(event) {
    if (event.key !== "Tab") return false;
    if (!document.body.classList.contains("drawer-open") || document.querySelector("dialog[open]")) return false;
    const drawer = $("#detailDrawer");
    if (!drawer) return false;

    const focusables = Array.from(drawer.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element.getClientRects().length > 0 && !element.hasAttribute("inert"));

    if (!focusables.length) return false;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (!drawer.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return true;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return true;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
      return true;
    }
    return false;
  }

  function handleRoute() {
    const id = parseCenterHash(location.hash);
    if (id) {
      const drawer = $("#detailDrawer");
      const isAlreadyOpen = document.body.classList.contains("drawer-open") && currentCenterId === id;
      if (!isAlreadyOpen) openDetail(id, { push: false });
      return;
    }
    if (document.body.classList.contains("drawer-open")) closeDrawerUI();
  }

  /* ------------------------------------------------------------------------
     Compare
     ------------------------------------------------------------------------ */

  function loadCompare() {
    try {
      const raw = JSON.parse(localStorage.getItem("compute-atlas-compare") || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.filter((id) => CENTERS.some((c) => c.id === id)).slice(0, 3);
    } catch {
      return [];
    }
  }

  function saveCompare() {
    try {
      localStorage.setItem("compute-atlas-compare", JSON.stringify(state.compare));
      return true;
    } catch {
      return false;
    }
  }

  function toggleCompare(id) {
    if (!CENTERS.some((c) => c.id === id)) return;
    let message = "";
    if (state.compare.includes(id)) {
      state.compare = state.compare.filter((item) => item !== id);
      message = "已从对比栏移除";
    } else {
      if (state.compare.length >= 3) {
        showToast("最多同时对比 3 个设施");
        return;
      }
      state.compare.push(id);
      message = "已加入对比栏";
    }
    const saved = saveCompare();
    showToast(saved ? message : `${message}；本机存储不可用，刷新后会丢失`);
    renderDirectory();
    if (currentCenterId) {
      const c = CENTERS.find((item) => item.id === currentCenterId);
      if (c) $("#detailContent").innerHTML = detailTemplate(c);
    }

    const scope = document.body.classList.contains("drawer-open") ? $("#detailContent") : $("#directoryGrid");
    const focusTarget = scope && Array.from(scope.querySelectorAll("[data-compare]")).find((button) => button.dataset.compare === id);
    focusTarget?.focus({ preventScroll: true });
  }

  function updateCompareTray() {
    const tray = $("#compareTray");
    const list = $("#trayList");
    const count = $("#trayCount");
    const open = $("#openCompare");
    if (!tray || !list || !count || !open) return;

    tray.hidden = state.compare.length === 0;
    document.body.classList.toggle("has-tray", state.compare.length > 0);
    count.textContent = `${state.compare.length} / 3`;
    list.innerHTML = state.compare.map((id) => {
      const c = CENTERS.find((item) => item.id === id);
      return c ? `<span class="tray-item">${escapeHTML(c.name)}<button type="button" data-compare="${escapeHTML(id)}" aria-label="移除 ${escapeHTML(c.name)}">×</button></span>` : "";
    }).join("");
    open.disabled = state.compare.length < 2;
    open.textContent = state.compare.length < 2 ? "再选 1 个" : "开始对比";
  }

  function compareRow(label, render) {
    return `<tr><th scope="row">${escapeHTML(label)}</th>${state.compare.map((id) => {
      const c = CENTERS.find((item) => item.id === id);
      return `<td>${c ? render(c) : ""}</td>`;
    }).join("")}</tr>`;
  }

  function openCompare() {
    if (state.compare.length < 2) {
      showToast("至少选择 2 个设施");
      return;
    }
    const content = $("#compareContent");
    const dialog = $("#compareDialog");
    if (!content || !dialog) return;
    if (dialog.open) return;

    const heads = state.compare.map((id) => {
      const c = CENTERS.find((item) => item.id === id);
      return `<th><span class="cmp-name">${escapeHTML(c.name)}</span><span class="cmp-sub">${escapeHTML(locationText(c))} · ${escapeHTML(c.type)}</span></th>`;
    }).join("");

    content.innerHTML = `
      <table class="compare-table">
        <thead><tr><th>字段 / FIELD</th>${heads}</tr></thead>
        <tbody>
          ${compareRow("公开算力", (c) => `<strong>${escapeHTML(formatCompute(c))}</strong><br><small>${escapeHTML(c.computeText || "")}</small>`)}
          ${compareRow("整机 / 系统", (c) => ((c.models || []).join(" / ") || "未披露"))}
          ${compareRow("芯片 / 加速卡", (c) => ((c.chips || []).join(" / ") || "未披露"))}
          ${compareRow("地址", (c) => `${escapeHTML(c.address || "待补充")}<br><small>${escapeHTML(c.precision || "待核实")}</small>`)}
          ${compareRow("联系方式", (c) => [c.phone ? escapeHTML(c.phone) : "", c.email ? escapeHTML(c.email) : "", c.website ? `<a href="${escapeHTML(c.website)}" target="_blank" rel="noopener">官网</a>` : ""].filter(Boolean).join("<br>") || "未公开")}
          ${compareRow("计费", (c) => `${escapeHTML((c.pricing && c.pricing.mode) || "需询价")}<br><small>${escapeHTML((c.pricing && c.pricing.text) || "")}</small>`)}
          ${compareRow("规模", (c) => escapeHTML(c.scale || "待补充"))}
          ${compareRow("资料完整度", (c) => `${completeness(c).pct}%`)}
          ${compareRow("可信度", (c) => escapeHTML(confMeta(c).label))}
        </tbody>
      </table>
      <p class="detail-note" style="margin-top:14px">横向对比只使用公开字段；没有数据的单元格保留为“未披露 / 待补充”。</p>
    `;

    dialog.showModal();
    document.body.classList.add("modal-open");
  }

  /* ------------------------------------------------------------------------
     Contributions
     ------------------------------------------------------------------------ */

  function loadSubmissions() {
    try {
      const data = JSON.parse(localStorage.getItem("compute-atlas-submissions") || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveSubmissions(items) {
    try {
      localStorage.setItem("compute-atlas-submissions", JSON.stringify(items));
      return true;
    } catch {
      return false;
    }
  }

  function renderSubmissions() {
    const list = $("#submissionList");
    const count = $("#submissionCount");
    const items = loadSubmissions();
    if (count) count.textContent = String(items.length);
    if (!list) return;

    if (!items.length) {
      list.innerHTML = '<div class="submission-empty">还没有本地补充。填写上方表单后，会先暂存在这台设备。</div>';
      return;
    }
    list.innerHTML = items.slice().reverse().map((item) => `
      <div class="submission-item">
        <strong>${escapeHTML(item.centerName || "未命名设施")}</strong>
        <p>${escapeHTML(item.field || "")}：${escapeHTML(item.value || "")}</p>
        <div class="sub-meta">${escapeHTML(item.location || "未填地区")} · ${escapeHTML(new Date(item.createdAt).toLocaleString("zh-CN"))}${item.sourceUrl ? ` · ${escapeHTML(item.sourceUrl)}` : ""}</div>
      </div>
    `).join("");
  }

  function openContribute() {
    const dialog = $("#contributeDialog");
    if (!dialog) return;
    if (dialog.open) return;
    renderSubmissions();
    dialog.showModal();
    document.body.classList.add("modal-open");
  }

  function downloadFile(filename, content, type = "application/json;charset=utf-8") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function csvEscape(value) {
    const text = Array.isArray(value) ? value.join(" / ") : String(value == null ? "" : value);
    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    const list = getFiltered();
    const rows = [
      ["名称", "别名", "省份", "城市", "区县", "类型", "运营方", "地址", "定位精度", "电话", "邮箱", "官网", "整机/系统", "芯片/加速卡", "智能算力PFLOPS", "超算峰值PFLOPS", "算力说明", "规模", "能力", "计费方式", "计费说明", "状态", "可信度", "来源"],
      ...list.map((c) => [
        c.name, c.alias, c.province, c.city, c.district, c.type, c.operator, c.address, c.precision,
        c.phone, c.email, c.website, c.models, c.chips, c.aiCompute, c.hpcCompute, c.computeText,
        c.scale, c.uses, c.pricing && c.pricing.mode, c.pricing && c.pricing.text, c.status,
        confMeta(c).label, (c.sources || []).map((source) => source.url).join(" / "),
      ]),
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
    downloadFile(`算力地理-${SITE.snapshot}-${list.length}条.csv`, csv, "text/csv;charset=utf-8");
    showToast(`已导出当前筛选的 ${list.length} 条 CSV`);
  }

  function downloadTemplate() {
    const template = {
      centerName: "",
      alias: "",
      province: "",
      city: "",
      district: "",
      type: "智算中心",
      operator: "",
      address: "",
      precision: "门牌 | 园区 | 城市",
      phone: "",
      email: "",
      website: "",
      models: [],
      chips: [],
      aiCompute: null,
      hpcCompute: null,
      computeText: "",
      computeNote: "请注明精度、实测/峰值与时间",
      scale: "",
      uses: [],
      pricing: { mode: "商务询价", public: false, text: "" },
      status: "运营中",
      confidence: "pending",
      sources: [{ label: "", url: "" }],
      gaps: [],
    };
    downloadFile("算力中心-资料补充模板.json", JSON.stringify(template, null, 2));
    showToast("字段模板已下载");
  }

  function downloadSubmissions() {
    const items = loadSubmissions();
    if (!items.length) {
      showToast("还没有可导出的补充");
      return;
    }
    downloadFile(`算力地理-补充-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(items, null, 2));
    showToast("补充 JSON 已导出");
  }

  function initContribute() {
    const form = $("#contributeForm");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        if (!data.centerName || !data.value) {
          showToast("请至少填写设施名称和补充内容");
          return;
        }
        const items = loadSubmissions();
        items.push({
          ...data,
          createdAt: new Date().toISOString(),
          page: "compute-atlas",
          snapshot: SITE.snapshot,
        });
        if (!saveSubmissions(items)) {
          showToast("浏览器存储不可用，未能暂存；请先复制内容再重试");
          return;
        }
        renderSubmissions();
        form.reset();
        showToast("已暂存在本机浏览器");
      });
    }

    $("#downloadTemplate")?.addEventListener("click", downloadTemplate);
    $("#downloadSubmissions")?.addEventListener("click", downloadSubmissions);
    $("#copySubmissions")?.addEventListener("click", () => {
      const items = loadSubmissions();
      if (!items.length) { showToast("还没有可复制的补充"); return; }
      copyText(JSON.stringify(items, null, 2));
    });
    $("#clearSubmissions")?.addEventListener("click", () => {
      const items = loadSubmissions();
      if (!items.length) return;
      if (window.confirm("确定清空本机暂存的全部补充吗？此操作不可撤销。")) {
        if (!saveSubmissions([])) {
          showToast("浏览器存储不可用，未能清空");
          return;
        }
        renderSubmissions();
        showToast("已清空本机补充");
      }
    });
    renderSubmissions();
  }

  /* ------------------------------------------------------------------------
     Calculator
     ------------------------------------------------------------------------ */

  function initCalculator() {
    const form = $("#calcForm");
    const output = $("#calcOutput");
    if (!form || !output) return;

    const update = () => {
      const cards = Number($("#calcCards")?.value || 0);
      const rate = Number($("#calcRate")?.value || 0);
      const hours = Math.min(24, Math.max(0, Number($("#calcHours")?.value || 0)));
      const days = Math.max(0, Number($("#calcDays")?.value || 0));

      if (!rate) {
        output.innerHTML = "等待输入单价";
        return;
      }
      if (!cards || !hours || !days) {
        output.innerHTML = "请填写卡数、每天时长与天数";
        return;
      }
      const total = cards * rate * hours * days;
      output.innerHTML = `约 ${number.format(Math.round(total))} 元 <small>${cards} 卡 × ${rate} 元 × ${hours} 小时 × ${days} 天</small>`;
    };

    form.addEventListener("input", update);
    form.addEventListener("submit", (event) => event.preventDefault());
    update();
  }

  /* ------------------------------------------------------------------------
     Events
     ------------------------------------------------------------------------ */

  function syncModalBody() {
    const anyOpen = Boolean(document.querySelector("dialog[open]"));
    document.body.classList.toggle("modal-open", anyOpen);
  }

  function resetAll() {
    state.query = "";
    state.province = "全部";
    state.type = "全部";
    state.use = "全部";
    state.sort = "relevance";
    state.completeOnly = false;
    const search = $("#searchInput");
    if (search) search.value = "";
    const province = $("#provinceFilter");
    if (province) province.value = "全部";
    const type = $("#typeFilter");
    if (type) type.value = "全部";
    const use = $("#useFilter");
    if (use) use.value = "全部";
    const sort = $("#sortFilter");
    if (sort) sort.value = "relevance";
    const complete = $("#completeOnly");
    if (complete) complete.checked = false;
    renderAtlas();
    renderDirectory();
  }

  function clearFilter(key) {
    if (key === "query") { state.query = ""; if ($("#searchInput")) $("#searchInput").value = ""; }
    if (key === "province") { state.province = "全部"; if ($("#provinceFilter")) $("#provinceFilter").value = "全部"; renderAtlas(); }
    if (key === "type") { state.type = "全部"; if ($("#typeFilter")) $("#typeFilter").value = "全部"; }
    if (key === "use") { state.use = "全部"; if ($("#useFilter")) $("#useFilter").value = "全部"; }
    if (key === "completeOnly") { state.completeOnly = false; if ($("#completeOnly")) $("#completeOnly").checked = false; }
    renderDirectory();
  }

  function bindEvents() {
    const header = $("#siteHeader");
    const menuToggle = $("#menuToggle");
    const nav = $("#siteNav");

    const updateHeader = () => {
      if (!header) return;
      header.classList.toggle("is-stuck", window.scrollY > 32);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    menuToggle?.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    });
    nav?.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        header?.classList.remove("nav-open");
        menuToggle?.setAttribute("aria-expanded", "false");
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) header?.classList.remove("nav-open");
    });

    $("#searchInput")?.addEventListener("input", (event) => {
      state.query = event.target.value;
      renderDirectory();
    });
    $("#provinceFilter")?.addEventListener("change", (event) => {
      state.province = event.target.value;
      renderAtlas();
      renderDirectory();
    });
    $("#typeFilter")?.addEventListener("change", (event) => {
      state.type = event.target.value;
      renderDirectory();
    });
    $("#useFilter")?.addEventListener("change", (event) => {
      state.use = event.target.value;
      renderDirectory();
    });
    $("#sortFilter")?.addEventListener("change", (event) => {
      state.sort = event.target.value;
      renderDirectory();
    });
    $("#completeOnly")?.addEventListener("change", (event) => {
      state.completeOnly = event.target.checked;
      renderDirectory();
    });
    $("#resetFilters")?.addEventListener("click", resetAll);
    $("#exportCsv")?.addEventListener("click", exportCsv);

    $$(".view-toggle [data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        state.view = button.dataset.view;
        $$(".view-toggle [data-view]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        renderDirectory();
      });
    });

    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]");
      if (action) {
        const name = action.dataset.action;
        if (name === "open-contribute") openContribute();
        if (name === "reset-all") resetAll();
        if (name === "reset-province") {
          if (state.province === "全部") {
            showToast("当前没有省份筛选");
          } else {
            state.province = "全部";
            if ($("#provinceFilter")) $("#provinceFilter").value = "全部";
            renderAtlas();
            renderDirectory();
          }
        }
        return;
      }

      const openCenter = event.target.closest("[data-open-center]");
      if (openCenter) {
        event.preventDefault();
        openDetail(openCenter.dataset.openCenter, { push: true });
        return;
      }

      const compareButton = event.target.closest("[data-compare]");
      if (compareButton) {
        event.preventDefault();
        event.stopPropagation();
        toggleCompare(compareButton.dataset.compare);
        return;
      }

      const copyButton = event.target.closest("[data-copy]");
      if (copyButton) {
        event.preventDefault();
        if (copyButton.dataset.copy) copyText(copyButton.dataset.copy);
        return;
      }

      const summaryButton = event.target.closest("[data-copy-summary]");
      if (summaryButton) {
        const c = CENTERS.find((item) => item.id === summaryButton.dataset.copySummary);
        if (c) {
          copyText([
            `${c.name}${c.alias ? `（${c.alias}）` : ""}`,
            `位置：${locationText(c)}`,
            `地址：${c.address || "待补充"}`,
            `电话：${c.phone || "未公开"}`,
            `邮箱：${c.email || "未公开"}`,
            `官网：${c.website || "未公开"}`,
            `算力：${c.computeText || formatCompute(c)}`,
            `机型：${(c.models || []).join(" / ") || "未披露"}`,
            `计费：${(c.pricing && c.pricing.text) || "需询价"}`,
            `来源：${(c.sources || []).map((source) => source.url).join(" ")}`,
            `数据快照：${SITE.snapshot}`,
          ].join("\n"));
        }
        return;
      }

      const clear = event.target.closest("[data-clear-filter]");
      if (clear) {
        clearFilter(clear.dataset.clearFilter);
        return;
      }

      const closeDialog = event.target.closest("[data-close-dialog]");
      if (closeDialog) {
        const dialog = document.getElementById(closeDialog.dataset.closeDialog);
        if (dialog) dialog.close();
        return;
      }

      const provinceCard = event.target.closest("[data-province]");
      if (provinceCard) {
        state.province = provinceCard.dataset.province;
        if ($("#provinceFilter")) $("#provinceFilter").value = state.province;
        renderAtlas();
        renderDirectory();
        $("#directory")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        return;
      }
    });

    $("#directoryGrid")?.addEventListener("click", (event) => {
      if (event.target.closest("button, a")) return;
      const card = event.target.closest("[data-id]");
      if (card) openDetail(card.dataset.id, { push: true });
    });

    $("#closeDrawer")?.addEventListener("click", closeDetail);
    $("#drawerBackdrop")?.addEventListener("click", closeDetail);
    window.addEventListener("popstate", handleRoute);
    window.addEventListener("hashchange", () => {
      if (parseCenterHash(location.hash)) handleRoute();
      else if (document.body.classList.contains("drawer-open")) closeDrawerUI();
    });

    $("#clearCompare")?.addEventListener("click", () => {
      state.compare = [];
      saveCompare();
      updateCompareTray();
      renderDirectory();
      showToast("已清空对比栏");
    });
    $("#openCompare")?.addEventListener("click", openCompare);
    $("#compareDialog")?.addEventListener("close", () => {
      syncModalBody();
      renderDirectory();
    });
    $("#contributeDialog")?.addEventListener("close", syncModalBody);

    $$("dialog").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (!inside) dialog.close();
      });
    });

    document.addEventListener("keydown", (event) => {
      const tag = (event.target && event.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select" || event.target.isContentEditable;
      const dialogOpen = Boolean(document.querySelector("dialog[open]"));

      if (event.key === "/" && !typing && !dialogOpen && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        $("#searchInput")?.focus();
      }
      if (event.key === "Escape") {
        if (dialogOpen) return;
        header?.classList.remove("nav-open");
        menuToggle?.setAttribute("aria-expanded", "false");
        if (document.body.classList.contains("drawer-open")) closeDetail();
      }
    });

    $("#calcForm")?.addEventListener("submit", (event) => event.preventDefault());
    syncModalBody();
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */

  function init() {
    if (!Array.isArray(window.CENTERS) || !window.CENTERS.length) {
      const count = $("#resultsCount");
      if (count) count.textContent = "数据加载失败，请检查 assets/data.js。";
      return;
    }

    state.compare = loadCompare();
    renderHeroGrid();
    renderProvinceFilter();
    renderAtlas();
    renderModelIndex();
    renderGaps();
    updateStats();
    bindEvents();
    initContribute();
    initCalculator();
    renderDirectory();

    if (parseCenterHash(location.hash)) {
      handleRoute();
    } else if (location.hash.length > 1) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) setTimeout(() => target.scrollIntoView({ block: "start" }), 80);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
