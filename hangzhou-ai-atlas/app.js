(function () {
  "use strict";

  const DATA = window.HZ_AI_DATA;
  if (!DATA) {
    console.error("杭州 AI 图谱：data.js 未加载或格式错误。");
    const grid = document.getElementById("company-grid");
    const layers = document.getElementById("chain-layers");
    const message =
      '<div class="data-error"><strong>数据加载失败</strong><span>请检查 data.js 是否存在且格式正确，然后刷新页面。</span></div>';
    if (grid) grid.innerHTML = message;
    if (layers) layers.innerHTML = message;
    return;
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const categoryMap = new Map(DATA.categories.map((category) => [category.id, category]));
  const companyMap = new Map(DATA.companies.map((company) => [company.id, company]));

  const state = {
    q: "",
    category: "all",
    district: "all",
    listed: false
  };

  let lastTrigger = null;
  let toastTimer = null;

  const escapeHTML = (value) =>
    String(value == null ? "" : value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return entities[character];
    });

  const normalize = (value) => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();

  const categoryOf = (company) => categoryMap.get(company.category) || DATA.categories[0];

  const companyHaystack = (company) => {
    const category = categoryOf(company);
    return normalize(
      [
        company.name,
        company.en,
        company.tagline,
        company.business,
        company.district,
        company.status,
        company.ticker,
        company.websiteLabel,
        company.badge,
        company.keywords,
        category.name,
        category.en,
        ...(company.ai || []),
        ...(company.aliases || [])
      ].join(" ")
    );
  };

  const filteredCompanies = () => {
    const q = normalize(state.q);
    return DATA.companies.filter((company) => {
      if (state.category !== "all" && company.category !== state.category) return false;
      if (state.district !== "all" && company.district !== state.district) return false;
      if (state.listed && !company.listed) return false;
      if (q && !companyHaystack(company).includes(q)) return false;
      return true;
    });
  };

  const countBy = (items, key) =>
    items.reduce((accumulator, item) => {
      const value = typeof key === "function" ? key(item) : item[key];
      accumulator[value] = (accumulator[value] || 0) + 1;
      return accumulator;
    }, {});

  const toast = (message) => {
    const node = $("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => node.classList.remove("is-visible"), 2600);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      const host = document.querySelector("#company-dialog[open]") || document.body;
      host.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand("copy");
      } catch (fallbackError) {
        return false;
      } finally {
        textarea.remove();
      }
    }
  };

  const downloadFile = (filename, content, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  };

  const csvCell = (value) => {
    const text = String(value == null ? "" : value);
    return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  };

  const toCSV = (items) => {
    const header = [
      "序号",
      "企业",
      "英文名",
      "产业链",
      "城区",
      "成立年份",
      "资本状态",
      "股票代码",
      "主要经营内容",
      "AI 方向",
      "官网/资料页",
      "数据备注"
    ];
    const rows = items.map((company) => {
      const category = categoryOf(company);
      return [
        company.no,
        company.name,
        company.en,
        category.name,
        company.district,
        company.founded,
        company.status,
        company.ticker,
        company.business,
        (company.ai || []).join("；"),
        company.website,
        (company.metrics || [])
          .map((metric) => `${metric.label}：${metric.value}（${metric.note}）`)
          .join("；")
      ];
    });
    return "\ufeff" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  };

  /* ------------------------------------------------------------------------
     Header & navigation
     ------------------------------------------------------------------------ */

  const initHeader = () => {
    const header = $("#site-header");
    const navToggle = $(".nav-toggle");
    const nav = $("#site-nav");

    const setScrolled = () => {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 36);
    };

    setScrolled();
    window.addEventListener("scroll", setScrolled, { passive: true });

    if (navToggle && nav) {
      const mobileNav = window.matchMedia("(max-width: 980px)");
      const syncNavA11y = () => {
        if (!mobileNav.matches) {
          nav.inert = false;
          return;
        }
        nav.inert = !document.body.classList.contains("nav-open");
      };
      syncNavA11y();
      mobileNav.addEventListener("change", syncNavA11y);

      navToggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", String(open));
        navToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
        syncNavA11y();
      });

      nav.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
          document.body.classList.remove("nav-open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "打开导航");
          syncNavA11y();
        }
      });

      const brand = $(".brand");
      if (brand) {
        brand.addEventListener("click", () => {
          if (!document.body.classList.contains("nav-open")) return;
          document.body.classList.remove("nav-open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "打开导航");
          syncNavA11y();
        });
      }

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
          document.body.classList.remove("nav-open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "打开导航");
          syncNavA11y();
          navToggle.focus();
        }
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 980 && document.body.classList.contains("nav-open")) {
          document.body.classList.remove("nav-open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "打开导航");
          syncNavA11y();
        }
      });
    }

    const sections = ["read", "chain", "directory", "data", "timeline", "method"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            $$(".site-nav a").forEach((link) => {
              const active = link.getAttribute("href") === "#" + entry.target.id;
              link.classList.toggle("is-active", active);
              if (active) link.setAttribute("aria-current", "true");
              else link.removeAttribute("aria-current");
            });
          });
        },
        { rootMargin: "-38% 0px -54% 0px", threshold: 0 }
      );
      sections.forEach((section) => spy.observe(section));
    }
  };

  /* ------------------------------------------------------------------------
     Hero ticker
     ------------------------------------------------------------------------ */

  const buildTicker = () => {
    const track = $("#hero-ticker");
    if (!track) return;
    const names = DATA.companies.map(
      (company) => `<span class="ticker-item">${escapeHTML(company.name)} <span>${escapeHTML(company.en)}</span></span>`
    );
    const half = names.join("");
    track.innerHTML = half + half;
  };

  /* ------------------------------------------------------------------------
     Value chain
     ------------------------------------------------------------------------ */

  const buildChain = () => {
    const index = $("#chain-index");
    const layers = $("#chain-layers");
    if (!index || !layers) return;

    index.innerHTML = DATA.categories
      .map((category, position) => {
        const count = DATA.companies.filter((company) => company.category === category.id).length;
        return `
          <li>
            <a href="#layer-${escapeHTML(category.id)}">
              <span class="idx">${String(position + 1).padStart(2, "0")}</span>
              <span>${escapeHTML(category.name)}</span>
              <span class="count">${count}</span>
            </a>
          </li>`;
      })
      .join("");

    layers.innerHTML = DATA.categories
      .map((category, position) => {
        const items = DATA.companies.filter((company) => company.category === category.id);
        const listed = items.filter((company) => company.listed).length;
        const chips = items
          .map(
            (company) => `
              <button
                class="chain-chip"
                type="button"
                data-company="${escapeHTML(company.id)}"
                style="--cat-color:${escapeHTML(category.color)}"
                aria-label="查看${escapeHTML(company.name)}档案"
              >
                <span class="chip-no">${escapeHTML(company.no)}</span>
                <span>${escapeHTML(company.name)}</span>
                ${company.featured ? '<span class="chip-badge">六小龙</span>' : ""}
              </button>`
          )
          .join("");

        return `
          <article
            class="chain-layer reveal"
            id="layer-${escapeHTML(category.id)}"
            style="--cat-color:${escapeHTML(category.color)}"
          >
            <div class="layer-head">
              <span class="layer-no">${String(position + 1).padStart(2, "0")}</span>
              <div>
                <p class="mono">${escapeHTML(category.en)}</p>
                <h3>${escapeHTML(category.name)}</h3>
                <p>${escapeHTML(category.blurb)}</p>
              </div>
            </div>
            <div class="layer-body">
              <div class="layer-meta">
                <strong>${items.length}</strong>
                <span>家收录</span>
                <span>·</span>
                <span>${listed ? listed + " 家上市" : "暂无独立上市主体"}</span>
              </div>
              <div class="layer-chips">${chips}</div>
            </div>
          </article>`;
      })
      .join("");

    layers.addEventListener("click", (event) => {
      const button = event.target.closest("[data-company]");
      if (button) openCompany(button.dataset.company, button);
    });
  };

  /* ------------------------------------------------------------------------
     Directory
     ------------------------------------------------------------------------ */

  const buildCategoryPills = () => {
    const container = $("#category-pills");
    if (!container) return;

    const total = DATA.companies.length;
    const pills = [
      `<button class="filter-pill" type="button" data-category="all" aria-pressed="true" style="--pill-color:#0c1511">
        <i aria-hidden="true"></i>全部赛道 <span>${total}</span>
      </button>`
    ];

    DATA.categories.forEach((category) => {
      const count = DATA.companies.filter((company) => company.category === category.id).length;
      pills.push(`
        <button
          class="filter-pill"
          type="button"
          data-category="${escapeHTML(category.id)}"
          aria-pressed="false"
          style="--pill-color:${escapeHTML(category.color)}"
        >
          <i aria-hidden="true"></i>${escapeHTML(category.name)} <span>${count}</span>
        </button>`);
    });

    container.innerHTML = pills.join("");

    container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      $$(".filter-pill", container).forEach((pill) => {
        pill.setAttribute("aria-pressed", String(pill === button));
      });
      renderDirectory();
    });
  };

  const buildDistrictOptions = () => {
    const select = $("#district-filter");
    if (!select) return;
    const counts = countBy(DATA.companies, "district");
    const districts = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b, "zh-CN"));
    select.innerHTML =
      '<option value="all">全部城区</option>' +
      districts
        .map(
          (district) =>
            `<option value="${escapeHTML(district)}">${escapeHTML(district)} · ${counts[district]}</option>`
        )
        .join("");
  };

  const cardMarkup = (company) => {
    const category = categoryOf(company);
    const statusBadge = company.status ? `<span class="status-badge">${escapeHTML(company.status)}</span>` : "";
    const featureBadge = company.featured
      ? `<span class="feature-badge">${escapeHTML(company.badge || "六小龙")}</span>`
      : "";
    const ticker = company.ticker && company.ticker !== "—" ? `<span>${escapeHTML(company.ticker)}</span>` : "";

    return `
      <article
        class="company-card ${company.featured ? "is-featured" : ""}"
        style="--cat-color:${escapeHTML(category.color)}"
      >
        <button
          class="card-hit"
          type="button"
          data-company="${escapeHTML(company.id)}"
          aria-label="查看${escapeHTML(company.name)}完整档案"
        ></button>
        <div class="card-top">
          <span class="card-no">${escapeHTML(company.no)}</span>
          <span class="card-badges">${featureBadge}${statusBadge}</span>
        </div>
        <div class="card-body">
          <p class="card-en">${escapeHTML(company.en)}</p>
          <h3 class="card-name">${escapeHTML(company.name)}</h3>
          <p class="card-tagline">${escapeHTML(company.tagline)}</p>
          <div class="card-facts">
            <span>${escapeHTML(company.founded)}</span>
            <span>${escapeHTML(company.district)}</span>
            ${ticker}
          </div>
          <p class="card-business">${escapeHTML(company.business)}</p>
        </div>
        <div class="card-foot">
          <span class="card-cat"><i aria-hidden="true"></i>${escapeHTML(category.name)}</span>
          <span class="card-open">档案 <span aria-hidden="true">↗</span></span>
        </div>
      </article>`;
  };

  const renderDirectory = () => {
    const grid = $("#company-grid");
    const count = $("#result-count");
    const empty = $("#empty-state");
    if (!grid || !count || !empty) return;

    const companies = filteredCompanies();
    count.textContent = String(companies.length);
    empty.hidden = companies.length !== 0;
    grid.innerHTML = companies.map(cardMarkup).join("");
  };

  const initDirectory = () => {
    buildCategoryPills();
    buildDistrictOptions();

    const search = $("#company-search");
    const district = $("#district-filter");
    const listed = $("#listed-only");

    if (search) {
      let timer = null;
      search.addEventListener("input", () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          state.q = search.value;
          renderDirectory();
        }, 80);
      });
    }

    if (district) {
      district.addEventListener("change", () => {
        state.district = district.value;
        renderDirectory();
      });
    }

    if (listed) {
      listed.addEventListener("change", () => {
        state.listed = listed.checked;
        renderDirectory();
      });
    }

    const reset = () => {
      state.q = "";
      state.category = "all";
      state.district = "all";
      state.listed = false;
      if (search) search.value = "";
      if (district) district.value = "all";
      if (listed) listed.checked = false;
      $$(".filter-pill").forEach((pill) => {
        pill.setAttribute("aria-pressed", String(pill.dataset.category === "all"));
      });
      renderDirectory();
    };

    ["#reset-filters", "#empty-reset"].forEach((selector) => {
      const button = $(selector);
      if (button) button.addEventListener("click", reset);
    });

    const exportButton = $("#export-csv");
    if (exportButton) {
      exportButton.addEventListener("click", () => {
        const companies = filteredCompanies();
        downloadFile("hangzhou-ai-atlas.csv", toCSV(companies), "text/csv;charset=utf-8");
        toast(`已导出 ${companies.length} 家企业`);
      });
    }

    const grid = $("#company-grid");
    if (grid) {
      grid.addEventListener("click", (event) => {
        const button = event.target.closest("[data-company]");
        if (button) openCompany(button.dataset.company, button);
      });
    }

    renderDirectory();
  };

  /* ------------------------------------------------------------------------
     Data portraits
     ------------------------------------------------------------------------ */

  const statusPalette = {
    listed: { label: "上市", color: "#c9ff7a" },
    unicorn: { label: "独角兽", color: "#d5a14a" },
    future: { label: "未来独角兽", color: "#7fb3a1" },
    growth: { label: "成长型", color: "#708191" },
    other: { label: "新三板 / 子公司 / 未上市", color: "#c94b32" }
  };

  const buildCharts = () => {
    const categoryBars = $("#category-bars");
    if (categoryBars) {
      const counts = countBy(DATA.companies, "category");
      const max = Math.max(...Object.values(counts), 1);
      categoryBars.innerHTML = DATA.categories
        .map((category) => {
          const count = counts[category.id] || 0;
          return `
            <div class="bar-row" style="--bar-color:${escapeHTML(category.color)}">
              <span class="bar-label"><i aria-hidden="true"></i>${escapeHTML(category.name)}</span>
              <span class="bar-track"><span class="bar-fill" style="--w:${(count / max) * 100}%"></span></span>
              <span class="bar-value">${count}</span>
            </div>`;
        })
        .join("");
    }

    const statusCounts = countBy(DATA.companies, "statusGroup");
    const statusData = Object.keys(statusPalette)
      .map((key) => ({
        key,
        label: statusPalette[key].label,
        color: statusPalette[key].color,
        count: statusCounts[key] || 0
      }))
      .filter((item) => item.count > 0);
    const total = statusData.reduce((sum, item) => sum + item.count, 0) || 1;

    const donut = $("#status-donut");
    if (donut) {
      let cursor = 0;
      const stops = statusData
        .map((item) => {
          const start = (cursor / total) * 100;
          cursor += item.count;
          const end = (cursor / total) * 100;
          return `${item.color} ${start}% ${end}%`;
        })
        .join(", ");
      donut.style.background = `conic-gradient(${stops})`;
    }

    const donutValue = $(".donut-center strong");
    if (donutValue) donutValue.textContent = String(statusCounts.listed || 0);

    const legend = $("#status-legend");
    if (legend) {
      legend.innerHTML = statusData
        .map(
          (item) => `
            <li>
              <i style="background:${item.color}" aria-hidden="true"></i>
              <span>${escapeHTML(item.label)}</span>
              <em>${item.count} · ${((item.count / total) * 100).toFixed(1)}%</em>
            </li>`
        )
        .join("");
    }

    const districtBars = $("#district-bars");
    if (districtBars) {
      const counts = countBy(DATA.companies, "district");
      const rows = Object.keys(counts)
        .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b, "zh-CN"))
        .slice(0, 7);
      const max = Math.max(...rows.map((district) => counts[district]), 1);
      districtBars.innerHTML = rows
        .map(
          (district) => `
            <div class="district-row">
              <span>${escapeHTML(district)}</span>
              <span class="track"><span class="fill" style="--w:${(counts[district] / max) * 100}%"></span></span>
              <em>${counts[district]}</em>
            </div>`
        )
        .join("");
    }

    const eraChart = $("#era-chart");
    if (eraChart) {
      const eras = [
        { label: "1990s", test: (year) => year < 2000 },
        { label: "2000s", test: (year) => year >= 2000 && year < 2010 },
        { label: "2010–14", test: (year) => year >= 2010 && year < 2015 },
        { label: "2015–19", test: (year) => year >= 2015 && year < 2020 },
        { label: "2020s", test: (year) => year >= 2020 }
      ];
      const counts = eras.map((era) => DATA.companies.filter((company) => era.test(company.founded)).length);
      const max = Math.max(...counts, 1);
      eraChart.innerHTML = eras
        .map(
          (era, index) => `
            <div class="era-col">
              <strong>${counts[index]}</strong>
              <span class="era-bar" style="height:${Math.max(4, (counts[index] / max) * 60)}%"></span>
              <span>${escapeHTML(era.label)}</span>
            </div>`
        )
        .join("");
    }
  };

  /* ------------------------------------------------------------------------
     Timeline & sources
     ------------------------------------------------------------------------ */

  const buildTimeline = () => {
    const container = $("#timeline-grid");
    if (!container) return;
    container.innerHTML = DATA.timeline
      .map(
        (item) => `
          <article class="timeline-item reveal">
            <span class="timeline-date">${escapeHTML(item.date)}</span>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.text)}</p>
            <a class="timeline-source" href="${escapeHTML(item.source.url)}" target="_blank" rel="noopener noreferrer">
              ${escapeHTML(item.source.label)} <span aria-hidden="true">↗</span>
            </a>
          </article>`
      )
      .join("");
  };

  const buildSources = () => {
    const container = $("#source-groups");
    if (!container) return;
    container.innerHTML = DATA.sources
      .map(
        (group) => `
          <section class="source-group">
            <h4>${escapeHTML(group.group)}</h4>
            ${group.items
              .map(
                (item) => `
                  <a href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">
                    ${escapeHTML(item.label)}
                    <span>${escapeHTML(item.publisher || "")}${item.date ? " · " + escapeHTML(item.date) : ""}</span>
                  </a>`
              )
              .join("")}
          </section>`
      )
      .join("");
  };

  /* ------------------------------------------------------------------------
     Company dialog
     ------------------------------------------------------------------------ */

  const dialog = $("#company-dialog");
  const dialogContent = $("#dialog-content");
  const dialogClose = $("#dialog-close");

  const profileMarkup = (company) => {
    const category = categoryOf(company);
    const metrics = company.metrics || [];
    const facts = [
      ["成立", `${company.founded} 年`],
      ["总部", `杭州 · ${company.district}`],
      ["赛道", category.name],
      ["状态", company.status],
      ["代码", company.ticker || "—"]
    ];

    const metricMarkup = metrics.length
      ? `<section class="profile-section">
           <h3>KEY NUMBERS / 关键数据</h3>
           <div class="metric-grid">
             ${metrics
               .map(
                 (metric) => `
                   <div class="metric">
                     <strong>${escapeHTML(metric.value)}</strong>
                     <span>${escapeHTML(metric.label)}</span>
                     <small>${escapeHTML(metric.note || "")}</small>
                   </div>`
               )
               .join("")}
           </div>
         </section>`
      : `<section class="profile-section">
           <h3>KEY NUMBERS / 关键数据</h3>
           <p>该企业未上市，公开财务数据有限；本页不引用未经披露的经营数字。</p>
         </section>`;

    const milestoneMarkup = company.milestones && company.milestones.length
      ? `<section class="profile-section">
           <h3>MILESTONES / 关键节点</h3>
           <div class="profile-milestones">
             ${company.milestones
               .map(
                 (milestone) => `
                   <div class="profile-milestone">
                     <time>${escapeHTML(milestone.date)}</time>
                     <p>${escapeHTML(milestone.text)}</p>
                   </div>`
               )
               .join("")}
           </div>
         </section>`
      : "";

    const badges = [
      company.badge ? `<span class="profile-badge profile-badge-accent">${escapeHTML(company.badge)}</span>` : "",
      `<span class="profile-badge">${escapeHTML(company.status)}</span>`,
      company.ticker && company.ticker !== "—"
        ? `<span class="profile-badge">${escapeHTML(company.ticker)}</span>`
        : "",
      `<span class="profile-badge">${escapeHTML(company.district)}</span>`
    ]
      .filter(Boolean)
      .join("");

    const websiteNote = company.websiteNote
      ? `<p class="profile-note">${escapeHTML(company.websiteNote)}</p>`
      : "";

    const sources = (company.sources || [])
      .map(
        (source) =>
          `<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(
            source.label
          )} <span aria-hidden="true">↗</span></a>`
      )
      .join("");

    const defaultNote = metrics.length
      ? "财务数据优先采用 2025 年报或 2026 年公开季报；估值、融资与用户数据按公开报道或企业口径标注，不构成投资建议。"
      : "未上市企业财务未公开披露；页面信息来自官网与公开资料，不构成投资建议。";

    return `
      <div class="profile-hero" style="--cat-color:${escapeHTML(category.color)}">
        <div class="profile-eyebrow">
          <span>${escapeHTML(company.no)} / ${DATA.companies.length}</span>
          <span class="profile-cat-dot" aria-hidden="true"></span>
          <span>${escapeHTML(category.en)}</span>
          <span>·</span>
          <span>${escapeHTML(company.district)}</span>
        </div>
        <div class="profile-title-row">
          <h2 class="profile-title" id="dialog-title">${escapeHTML(company.name)}</h2>
          <span class="profile-en">${escapeHTML(company.en)}</span>
        </div>
        <div class="profile-badges">${badges}</div>
        <p class="profile-tagline">${escapeHTML(company.tagline)}</p>
      </div>

      <div class="profile-body" style="--cat-color:${escapeHTML(category.color)}">
        <div class="profile-topline">
          <a class="profile-site" href="${escapeHTML(company.website)}" target="_blank" rel="noopener noreferrer">
            ${company.linkType === "资料页" ? "查看资料页" : "访问官网"}
            <small>${escapeHTML(company.websiteLabel)}</small>
            <span aria-hidden="true">↗</span>
          </a>
          <div class="profile-actions">
            <button type="button" data-copy-link>复制档案链接</button>
            <button type="button" data-close-dialog>关闭</button>
          </div>
        </div>

        <div class="profile-grid">
          <div>
            <section class="profile-section">
              <h3>MAIN BUSINESS / 主要经营</h3>
              <p>${escapeHTML(company.business)}</p>
            </section>

            <section class="profile-section">
              <h3>AI FOCUS / AI 抓手</h3>
              <ul class="focus-list">
                ${(company.ai || []).map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
              </ul>
            </section>

            ${metricMarkup}
            ${milestoneMarkup}
          </div>

          <aside>
            <section class="profile-section">
              <h3>FACT SHEET / 基础信息</h3>
              <dl class="profile-facts">
                ${facts
                  .map(
                    ([term, value]) => `
                      <div class="fact">
                        <dt>${escapeHTML(term)}</dt>
                        <dd>${escapeHTML(value)}</dd>
                      </div>`
                  )
                  .join("")}
              </dl>
            </section>

            <section class="profile-section">
              <h3>POSITION / 图谱位置</h3>
              <p>${escapeHTML(category.name)} · 第 ${escapeHTML(company.no)} 号样本</p>
              <p style="margin-top:10px;color:var(--muted);font-size:11px;">${escapeHTML(category.blurb)}</p>
            </section>
          </aside>
        </div>

        <div class="profile-sources">
          <h3>SOURCES / 来源</h3>
          ${sources || "<p>企业官网与公开资料。</p>"}
        </div>

        ${websiteNote}
        <p class="profile-note">${escapeHTML(defaultNote)}</p>
      </div>`;
  };

  const syncCompanyParam = (companyId) => {
    try {
      const url = new URL(window.location.href);
      if (companyId) url.searchParams.set("company", companyId);
      else url.searchParams.delete("company");
      history.replaceState(null, "", url.toString());
    } catch (error) {
      /* file:// and older browsers may restrict history; the dialog still works. */
    }
  };

  const openCompany = (companyId, trigger) => {
    const company = companyMap.get(companyId);
    if (!company || !dialog || !dialogContent) return;

    lastTrigger = trigger || document.activeElement;
    dialogContent.innerHTML = profileMarkup(company);
    document.body.classList.add("dialog-open");

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    syncCompanyParam(companyId);
    const closeButton = $(".dialog-close", dialog);
    if (closeButton) closeButton.focus({ preventScroll: true });
  };

  const closeCompany = () => {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("dialog-open");
    syncCompanyParam(null);
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus({ preventScroll: true });
    }
  };

  const initDialog = () => {
    if (!dialog) return;

    if (dialogClose) dialogClose.addEventListener("click", closeCompany);

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeCompany();

      const closeButton = event.target.closest("[data-close-dialog]");
      if (closeButton) closeCompany();

      const copyButton = event.target.closest("[data-copy-link]");
      if (copyButton) {
        const originalLabel = copyButton.textContent;
        copyText(window.location.href).then((copied) => {
          copyButton.textContent = copied ? "已复制" : "复制失败";
          window.setTimeout(() => {
            copyButton.textContent = originalLabel;
          }, 1600);
        });
      }
    });

    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      syncCompanyParam(null);
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus({ preventScroll: true });
      }
    });

    dialog.addEventListener("cancel", () => {
      document.body.classList.remove("dialog-open");
    });
  };

  /* ------------------------------------------------------------------------
     Reveal, counters & downloads
     ------------------------------------------------------------------------ */

  const initReveal = () => {
    const elements = $$(".reveal");
    if (!elements.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reducedMotion) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    elements.forEach((element) => element.classList.add("will-reveal"));
    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    elements.forEach((element) => observer.observe(element));
  };

  const initCounters = () => {
    const counters = $$("[data-count]");
    if (!counters.length) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const animate = (element) => {
      const target = Number(element.dataset.count);
      if (!Number.isFinite(target)) return;
      const duration = 900;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          instance.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((counter) => observer.observe(counter));
  };

  const initDownloads = () => {
    const csvButton = $("#download-csv");
    const jsonButton = $("#download-json");

    if (csvButton) {
      csvButton.addEventListener("click", () => {
        downloadFile("hangzhou-ai-atlas.csv", toCSV(DATA.companies), "text/csv;charset=utf-8");
        toast(`已导出全部 ${DATA.companies.length} 家企业`);
      });
    }

    if (jsonButton) {
      jsonButton.addEventListener("click", () => {
        downloadFile(
          "hangzhou-ai-atlas.json",
          JSON.stringify(DATA, null, 2),
          "application/json;charset=utf-8"
        );
        toast("已导出完整 JSON 数据集");
      });
    }
  };

  const restoreFromURL = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("company");
      if (id && companyMap.has(id)) {
        window.setTimeout(() => openCompany(id, null), 160);
      }
    } catch (error) {
      /* no-op */
    }
  };

  const syncOverview = () => {
    const total = DATA.companies.length;
    const listed = DATA.companies.filter((company) => company.listed).length;
    const flagship = DATA.companies.filter(
      (company) => company.statusGroup === "unicorn" || company.statusGroup === "future"
    ).length;
    const districts = new Set(DATA.companies.map((company) => company.district));
    const coreDistricts = ["滨江区", "余杭区", "西湖区"];
    const coreCount = DATA.companies.filter((company) => coreDistricts.includes(company.district)).length;
    const density = total ? ((coreCount / total) * 100).toFixed(1) : "0.0";

    const values = {
      total,
      categories: DATA.categories.length,
      districts: districts.size,
      listed,
      flagship
    };

    $$("[data-count-key]").forEach((element) => {
      const value = values[element.dataset.countKey];
      if (typeof value !== "number") return;
      element.dataset.count = String(value);
      element.textContent = String(value);
    });

    $$("[data-overview]").forEach((element) => {
      const value = values[element.dataset.overview];
      if (typeof value === "number") element.textContent = String(value);
    });

    const orbitTotal = $("#orbit-total");
    if (orbitTotal) orbitTotal.textContent = String(total);

    const densityNode = $("#district-density");
    if (densityNode) densityNode.textContent = `${density}%`;
  };

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */

  const boot = () => {
    initHeader();
    buildTicker();
    buildChain();
    buildCharts();
    buildTimeline();
    buildSources();
    initDirectory();
    initDialog();
    initReveal();
    syncOverview();
    initCounters();
    initDownloads();
    restoreFromURL();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
