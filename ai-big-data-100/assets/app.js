/* ==========================================================================
   A/100 — application logic
   Vanilla JavaScript. No build step, no external requests.
   ========================================================================== */

(function () {
  "use strict";

  const PROJECTS = Array.isArray(window.A100_PROJECTS) ? window.A100_PROJECTS : [];

  const SECTORS = {
    infra: {
      label: "AI 基础设施",
      short: "基础设施",
      en: "INFRASTRUCTURE",
      desc: "公链、推理协议与 AI 执行层。"
    },
    compute: {
      label: "去中心化算力",
      short: "算力",
      en: "COMPUTE",
      desc: "GPU、云计算与边缘节点。"
    },
    data: {
      label: "数据与索引",
      short: "数据",
      en: "DATA",
      desc: "存储、语料、索引与数据市场。"
    },
    agents: {
      label: "AI 智能体",
      short: "智能体",
      en: "AGENTS",
      desc: "代理框架、发行平台与自主应用。"
    },
    privacy: {
      label: "身份与隐私",
      short: "身份隐私",
      en: "IDENTITY & PRIVACY",
      desc: "人格证明、机密计算与数据主权。"
    },
    apps: {
      label: "应用与工具",
      short: "应用",
      en: "APPLICATIONS",
      desc: "研究、量化与面向用户的 AI 产品。"
    }
  };

  const SECTOR_KEYS = Object.keys(SECTORS);
  const PAGE_SIZE = 20;
  const SORT_LABELS = {
    rank: "按市值排名",
    name: "按名称 A–Z",
    sector: "按赛道归类"
  };
  const SAVED_VIEW_KEY = "a100-view";
  const SPECIAL_MARKS = {
    TAO: "τ",
    FIL: "⨎",
    ICP: "∞",
    WLD: "◉",
    FET: "ASI",
    "0G": "0G"
  };
  const HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  const state = {
    query: "",
    sector: "all",
    sort: "rank",
    view: "list",
    visible: PAGE_SIZE
  };

  let lastFocused = null;

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

  const els = {
    list: $("#project-list"),
    empty: $("#empty-state"),
    resultsCopy: $("#results-copy"),
    sortCopy: $("#sort-copy"),
    search: $("#project-search"),
    clearSearch: $("#clear-search"),
    sort: $("#project-sort"),
    filterChips: $("#filter-chips"),
    viewToggle: $("#view-toggle"),
    viewIcon: $("#view-icon"),
    viewLabel: $("#view-label"),
    exportButton: $("#export-csv"),
    loadMore: $("#load-more"),
    loadMoreLabel: $("#load-more-label"),
    loadWrap: $(".load-more-wrap"),
    resetFilters: $("#reset-filters"),
    dialog: $("#project-dialog"),
    modalClose: $("#modal-close"),
    modalKicker: $("#modal-kicker"),
    modalSectorCode: $("#modal-sector-code"),
    modalMark: $("#modal-mark"),
    modalTitle: $("#modal-title"),
    modalTicker: $("#modal-ticker"),
    modalDesc: $("#modal-desc"),
    modalTags: $("#modal-tags"),
    modalSector: $("#modal-sector"),
    modalSectorDesc: $("#modal-sector-desc"),
    modalRank: $("#modal-rank"),
    modalSite: $("#modal-site"),
    modalCmc: $("#modal-cmc")
  };

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return HTML_ESCAPES[character];
    });
  }

  function normalize(value) {
    return String(value).toLowerCase().replace(/\s+/g, " ").trim();
  }

  function padRank(rank) {
    return String(rank).padStart(2, "0");
  }

  function sectorFor(project) {
    return SECTORS[project.sector] || SECTORS.infra;
  }

  function markFor(project) {
    return SPECIAL_MARKS[project.ticker] || project.ticker.slice(0, 2);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function scrollToDirectory() {
    const directory = $("#directory");
    if (!directory) return;
    directory.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start"
    });
  }

  const searchIndex = new Map(
    PROJECTS.map(function (project) {
      const sector = sectorFor(project);
      return [
        project.rank,
        normalize([
          project.name,
          project.ticker,
          sector.label,
          sector.short,
          sector.en,
          project.desc,
          project.tags.join(" ")
        ].join(" "))
      ];
    })
  );

  function countBySector() {
    return PROJECTS.reduce(function (counts, project) {
      counts[project.sector] = (counts[project.sector] || 0) + 1;
      return counts;
    }, {});
  }

  function updateCounts() {
    const counts = countBySector();

    $$("[data-sector-count]").forEach(function (node) {
      const key = node.getAttribute("data-sector-count");
      node.textContent = String(counts[key] || 0);
    });

    $$("[data-total-count]").forEach(function (node) {
      node.textContent = String(PROJECTS.length);
    });
  }

  function renderFilterChips() {
    const counts = countBySector();
    const allChip = [
      '<button class="filter-chip" type="button" data-filter="all"',
      ' aria-controls="project-list" aria-pressed="true">',
      '<span>全部</span>',
      '<span class="chip-count">' + PROJECTS.length + "</span>",
      "</button>"
    ].join("");

    const sectorChips = SECTOR_KEYS.map(function (key) {
      const sector = SECTORS[key];
      return [
        '<button class="filter-chip" type="button" data-filter="' + key + '"',
        ' aria-controls="project-list" aria-pressed="false">',
        "<span>" + escapeHTML(sector.label) + "</span>",
        '<span class="chip-count">' + (counts[key] || 0) + "</span>",
        "</button>"
      ].join("");
    }).join("");

    els.filterChips.innerHTML = allChip + sectorChips;
  }

  function filteredProjects() {
    const query = normalize(state.query);
    let items = PROJECTS.filter(function (project) {
      const sectorMatches = state.sector === "all" || project.sector === state.sector;
      if (!sectorMatches) return false;
      if (!query) return true;
      return (searchIndex.get(project.rank) || "").includes(query);
    });

    items.sort(function (a, b) {
      if (state.sort === "name") {
        return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
      }

      if (state.sort === "sector") {
        const aSector = SECTOR_KEYS.indexOf(a.sector);
        const bSector = SECTOR_KEYS.indexOf(b.sector);
        if (aSector !== bSector) return aSector - bSector;
        return a.rank - b.rank;
      }

      return a.rank - b.rank;
    });

    return items;
  }

  function rowTemplate(project) {
    const sector = sectorFor(project);
    const rank = padRank(project.rank);
    const tags = project.tags.map(function (tag) {
      return '<span class="tag">' + escapeHTML(tag) + "</span>";
    }).join("");

    return [
      '<article class="project-row sector-' + project.sector + '"',
      ' data-id="' + project.rank + '"',
      ' tabindex="0"',
      ' aria-label="查看 ' + escapeHTML(project.name) + ' 详情">',
      '<div class="rank"><strong>' + rank + "</strong><small>RANK</small></div>",
      '<div class="identity">',
      '<div class="mark" aria-hidden="true">' + escapeHTML(markFor(project)) + "</div>",
      '<div class="project-name">',
      "<h3>" + escapeHTML(project.name) + "</h3>",
      "<p>" + escapeHTML(project.ticker) + " <span>·</span> " + escapeHTML(sector.short) + "</p>",
      "</div>",
      "</div>",
      '<div class="summary"><p>' + escapeHTML(project.desc) + "</p>",
      '<div class="tags">' + tags + "</div></div>",
      '<div class="sector-cell"><span class="sector-pill">' + escapeHTML(sector.label) + "</span></div>",
      '<a class="visit" href="' + escapeHTML(project.url) + '" target="_blank" rel="noopener noreferrer"',
      ' aria-label="访问 ' + escapeHTML(project.name) + ' 官网">官网 <span aria-hidden="true">↗</span></a>',
      "</article>"
    ].join("");
  }

  function syncSectorControls() {
    $$("[data-sector-card]").forEach(function (card) {
      const active = card.getAttribute("data-sector-card") === state.sector;
      card.setAttribute("aria-pressed", active ? "true" : "false");
    });

    $$("[data-filter]", els.filterChips).forEach(function (chip) {
      const active = chip.getAttribute("data-filter") === state.sector;
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function syncViewUI() {
    const isGrid = state.view === "grid";
    els.list.classList.toggle("view-grid", isGrid);
    els.list.classList.toggle("view-list", !isGrid);
    els.viewIcon.textContent = isGrid ? "☰" : "▦";
    els.viewLabel.textContent = isGrid ? "列表" : "卡片";
    els.viewToggle.setAttribute("aria-label", isGrid ? "切换为列表视图" : "切换为卡片视图");
  }

  function render() {
    const filtered = filteredProjects();
    const visible = filtered.slice(0, state.visible);
    const total = PROJECTS.length;

    els.list.innerHTML = visible.map(rowTemplate).join("");
    els.list.hidden = filtered.length === 0;
    els.empty.hidden = filtered.length !== 0;

    if (state.query.trim() || state.sector !== "all") {
      els.resultsCopy.textContent =
        "显示 " + visible.length + " / " + filtered.length + " · 全站 " + total;
    } else {
      els.resultsCopy.textContent = "显示 " + visible.length + " / " + total;
    }

    const sectorLabel = state.sector === "all" ? "全部赛道" : sectorFor({
      sector: state.sector
    }).label;
    const queryLabel = state.query.trim() ? " · 搜索“" + state.query.trim() + "”" : "";
    els.sortCopy.textContent = SORT_LABELS[state.sort] + " · " + sectorLabel + queryLabel;

    const hasMore = visible.length < filtered.length;
    els.loadMore.hidden = !hasMore;
    els.loadWrap.hidden = !hasMore;
    els.loadMoreLabel.textContent = "+" + Math.min(PAGE_SIZE, filtered.length - visible.length);
    els.exportButton.disabled = filtered.length === 0;

    els.clearSearch.hidden = state.query.length === 0;
    syncSectorControls();
    syncViewUI();
  }

  function setSector(sector, options) {
    const config = options || {};
    state.sector = sector;
    state.visible = PAGE_SIZE;

    if (config.clearQuery) {
      state.query = "";
      els.search.value = "";
    }

    render();

    if (config.scroll) {
      scrollToDirectory();
    }
  }

  function resetEverything() {
    state.query = "";
    state.sector = "all";
    state.sort = "rank";
    state.visible = PAGE_SIZE;
    els.search.value = "";
    els.sort.value = "rank";
    render();
    els.search.focus();
  }

  function jumpToSearch() {
    els.search.focus();
    els.search.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center"
    });
  }

  function openProject(rank, options) {
    const config = options || {};
    const project = PROJECTS.find(function (item) {
      return item.rank === Number(rank);
    });

    if (!project) return;

    const sector = sectorFor(project);
    const rankText = "#" + padRank(project.rank);
    const wasOpen = els.dialog.open;

    if (!wasOpen) {
      lastFocused = document.activeElement;
    }

    els.modalKicker.textContent = "PROJECT / " + padRank(project.rank);
    els.modalSectorCode.textContent = sector.en;
    els.modalMark.className = "modal-mark sector-" + project.sector;
    els.modalMark.textContent = markFor(project);
    els.modalTitle.textContent = project.name;
    els.modalTicker.textContent = project.ticker + " · " + rankText;
    els.modalDesc.textContent = project.desc;
    els.modalSector.textContent = sector.label;
    els.modalSectorDesc.textContent = sector.desc;
    els.modalRank.textContent = rankText + " / " + PROJECTS.length;
    els.modalTags.innerHTML = project.tags.map(function (tag) {
      return '<span class="tag">' + escapeHTML(tag) + "</span>";
    }).join("");
    els.modalSite.href = project.url;
    els.modalSite.setAttribute("aria-label", "访问 " + project.name + " 官网");
    els.modalCmc.href = "https://coinmarketcap.com/search/?q=" + encodeURIComponent(project.name + " " + project.ticker);

    els.dialog.dataset.rank = String(project.rank);

    if (!els.dialog.open) {
      els.dialog.showModal();
    }

    els.dialog.scrollTop = 0;
    document.body.classList.add("modal-open");

    if (config.updateHash !== false) {
      try {
        if (!wasOpen) {
          history.pushState({ a100Project: project.rank }, "", "#project-" + project.rank);
        } else {
          history.replaceState({ a100Project: project.rank }, "", "#project-" + project.rank);
        }
      } catch (error) {
        /* file:// and host restrictions can make history unavailable. */
      }
    }

    els.modalTitle.focus({ preventScroll: true });
  }

  function closeProject() {
    if (els.dialog.open) {
      els.dialog.close();
    }
  }

  function downloadCSV() {
    const items = filteredProjects();
    if (!items.length) return;

    const rows = [
      ["Rank", "Project", "Ticker", "Sector", "Official Website", "Tags", "Summary"]
    ].concat(items.map(function (project) {
      return [
        project.rank,
        project.name,
        project.ticker,
        sectorFor(project).label,
        project.url,
        project.tags.join(" / "),
        project.desc
      ];
    }));

    const csv = rows.map(function (row) {
      return row.map(function (cell) {
        return '"' + String(cell).replace(/"/g, '""') + '"';
      }).join(",");
    }).join("\r\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "ai-big-data-100.csv";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  function restoreSavedView() {
    try {
      const saved = window.localStorage.getItem(SAVED_VIEW_KEY);
      if (saved === "grid" || saved === "list") {
        state.view = saved;
      }
    } catch (error) {
      /* localStorage is optional. */
    }
  }

  function openProjectFromHash() {
    syncProjectFromHash();
  }

  function syncProjectFromHash() {
    const match = window.location.hash.match(/^#project-(\d{1,3})$/);

    if (match) {
      const rank = Number(match[1]);
      if (!els.dialog.open || Number(els.dialog.dataset.rank) !== rank) {
        openProject(rank, { updateHash: false });
      }
      return;
    }

    if (els.dialog.open) {
      closeProject();
    }
  }

  function bindEvents() {
    els.search.addEventListener("input", function () {
      state.query = els.search.value;
      state.visible = PAGE_SIZE;
      render();
    });

    els.search.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && els.search.value) {
        state.query = "";
        els.search.value = "";
        state.visible = PAGE_SIZE;
        render();
      }
    });

    els.clearSearch.addEventListener("click", function () {
      state.query = "";
      els.search.value = "";
      state.visible = PAGE_SIZE;
      render();
      els.search.focus();
    });

    els.sort.addEventListener("change", function () {
      state.sort = els.sort.value;
      state.visible = PAGE_SIZE;
      render();
    });

    els.filterChips.addEventListener("click", function (event) {
      const chip = event.target.closest("[data-filter]");
      if (!chip || !els.filterChips.contains(chip)) return;
      setSector(chip.getAttribute("data-filter"));
    });

    $$("[data-sector-card]").forEach(function (card) {
      card.addEventListener("click", function () {
        const sector = card.getAttribute("data-sector-card");
        const nextSector = state.sector === sector ? "all" : sector;
        setSector(nextSector, { clearQuery: true, scroll: true });
      });
    });

    els.viewToggle.addEventListener("click", function () {
      state.view = state.view === "list" ? "grid" : "list";
      try {
        window.localStorage.setItem(SAVED_VIEW_KEY, state.view);
      } catch (error) {
        /* localStorage is optional. */
      }
      syncViewUI();
    });

    els.exportButton.addEventListener("click", downloadCSV);

    els.loadMore.addEventListener("click", function () {
      state.visible += PAGE_SIZE;
      render();
    });

    els.resetFilters.addEventListener("click", resetEverything);

    els.list.addEventListener("click", function (event) {
      const row = event.target.closest(".project-row");
      if (!row) return;
      if (event.target.closest("a")) return;
      if (window.getSelection && String(window.getSelection()).length) return;
      openProject(Number(row.getAttribute("data-id")));
    });

    els.list.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (!event.target.classList.contains("project-row")) return;
      event.preventDefault();
      openProject(Number(event.target.getAttribute("data-id")));
    });

    els.modalClose.addEventListener("click", closeProject);

    els.dialog.addEventListener("click", function (event) {
      if (event.target === els.dialog) closeProject();
    });

    els.dialog.addEventListener("close", function () {
      document.body.classList.remove("modal-open");

      try {
        const cleanUrl = window.location.href.split("#")[0];
        history.replaceState(null, "", cleanUrl);
      } catch (error) {
        /* Ignore hosts that do not permit history updates. */
      }

      if (lastFocused && document.contains(lastFocused)) {
        lastFocused.focus({ preventScroll: true });
      }
    });

    $(".search-jump").addEventListener("click", jumpToSearch);

    document.addEventListener("keydown", function (event) {
      if (els.dialog.open) return;

      const activeTag = document.activeElement ? document.activeElement.tagName : "";
      const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";

      if (
        event.key === "/" &&
        !isTyping &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        jumpToSearch();
      }
    });
  }

  function init() {
    if (!PROJECTS.length) {
      els.list.innerHTML = "";
      els.list.hidden = true;
      els.empty.hidden = false;
      els.resultsCopy.textContent = "显示 0 / 0";
      els.sortCopy.textContent = "数据未加载";
      els.loadWrap.hidden = true;
      els.exportButton.disabled = true;
      return;
    }

    updateCounts();
    renderFilterChips();
    restoreSavedView();
    els.sort.value = state.sort;
    render();
    bindEvents();
    syncViewUI();

    const year = $("#footer-year");
    if (year) year.textContent = String(new Date().getFullYear());

    window.addEventListener("hashchange", syncProjectFromHash);
    window.addEventListener("popstate", syncProjectFromHash);
    openProjectFromHash();
  }

  init();
})();
