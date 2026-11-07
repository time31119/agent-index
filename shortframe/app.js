(function () {
  "use strict";

  var ALL = Array.isArray(window.DRAMAS) ? window.DRAMAS : [];
  var REGION_ORDER = ["北美", "东南亚", "欧洲", "日韩", "拉美", "南亚", "中东"];
  var FEATURED = [ALL[0], ALL[1], ALL[2]].filter(Boolean);
  var PAGE_SIZE = 24;
  var STORAGE_KEY = "shortframe.watchlist.v1";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var state = {
    region: "全部",
    genre: "全部",
    platform: "全部",
    sort: "heat",
    query: "",
    view: "grid",
    limit: PAGE_SIZE,
    watchlist: loadWatchlist()
  };

  var heroIndex = 0;
  var heroPaused = false;
  var heroTimer = null;
  var toastTimer = null;
  var lastFocused = null;
  var searchMatches = [];
  var searchSelected = 0;

  var els = {};

  /* ---------------------------------------------------------
     Utilities
     --------------------------------------------------------- */

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function icon(name, className) {
    return '<svg class="icon ' + (className || "") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }

  function fmtNumber(value) {
    var n = Number(value) || 0;
    if (n >= 100000000) {
      return (n / 100000000).toFixed(2).replace(/\.?0+$/, "") + "亿";
    }
    if (n >= 10000) {
      return (n / 10000).toFixed(1).replace(/\.0$/, "") + "万";
    }
    return n.toLocaleString("zh-CN");
  }

  function fmtInt(value) {
    return Number(value || 0).toLocaleString("zh-CN");
  }

  function trendHTML(drama, compact) {
    var value = drama.trend;
    if (value === "new") {
      return '<span class="trend trend--new">' + (compact ? "NEW" : "NEW") + "</span>";
    }
    if (Number(value) > 0) {
      return '<span class="trend trend--up">↑ ' + Number(value) + "</span>";
    }
    if (Number(value) < 0) {
      return '<span class="trend trend--down">↓ ' + Math.abs(Number(value)) + "</span>";
    }
    return '<span class="trend">—</span>';
  }

  function titleClass(cn) {
    var length = String(cn || "").length;
    if (length > 17) return " is-xlong";
    if (length > 11) return " is-long";
    return "";
  }

  function posterHTML(drama) {
    var palette = drama.palette || ["#ff735c", "#2a0f1a", "#f4c79b"];
    var style = "--p1:" + palette[0] + ";--p2:" + palette[1] + ";--p3:" + palette[2] + ";";
    var hasCover = Boolean(drama.cover);
    var photoClass = hasCover ? " poster--photo" : "";
    var image = hasCover
      ? '<img class="poster__img" src="' + esc(drama.cover) + '" alt="" loading="lazy" decoding="async">'
      : "";
    return '' +
      '<div class="poster theme-' + esc(drama.theme) + photoClass + '" style="' + style + '" aria-hidden="true">' +
        '<div class="poster__art" aria-hidden="true">' +
          '<i class="art-orb"></i>' +
          '<i class="art-ring"></i>' +
          '<i class="art-plane"></i>' +
          '<i class="art-figure"></i>' +
        "</div>" +
        image +
        '<div class="poster__veil"></div>' +
        '<div class="poster__grain"></div>' +
        '<div class="poster__top"><span>SHORTFRAME</span><b>' + drama.year + "</b></div>" +
        '<div class="poster__side" aria-hidden="true">' + String(drama.rank).padStart(2, "0") + "</div>" +
        '<div class="poster__copy">' +
          '<span class="poster__kicker">' + esc(drama.platform) + "</span>" +
          '<h3 class="poster__title' + titleClass(drama.cn) + '">' + esc(drama.cn) + "</h3>" +
          '<p class="poster__en">' + esc(drama.title) + "</p>" +
          '<div class="poster__rule"></div>' +
          '<div class="poster__foot"><span>' + esc(drama.genres.slice(0, 2).join(" / ")) + "</span><span>" + drama.episodes + " EPS</span></div>" +
        "</div>" +
      "</div>";
  }

  function getDrama(id) {
    for (var i = 0; i < ALL.length; i += 1) {
      if (ALL[i].id === id) return ALL[i];
    }
    return null;
  }

  /* ---------------------------------------------------------
     Watchlist
     --------------------------------------------------------- */

  function loadWatchlist() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (id) {
        return ALL.some(function (drama) { return drama.id === id; });
      });
    } catch (error) {
      return [];
    }
  }

  function saveWatchlist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.watchlist));
    } catch (error) {
      /* Storage can be unavailable in private mode. The session still works. */
    }
  }

  function isSaved(id) {
    return state.watchlist.indexOf(id) !== -1;
  }

  function watchCountText() {
    return String(state.watchlist.length);
  }

  function updateWatchCount() {
    if (els.watchCount) els.watchCount.textContent = watchCountText();
  }

  function updateHeartButtons(id) {
    var saved = isSaved(id);
    $$('[data-save="' + id + '"]').forEach(function (button) {
      button.classList.toggle("is-saved", saved);
      button.setAttribute("aria-pressed", String(saved));
      button.setAttribute("aria-label", saved ? "从片单移除" : "加入片单");
      var text = button.querySelector("span");
      if (text) text.textContent = saved ? "已在片单" : "加入片单";
      button.innerHTML = icon(saved ? "heart-fill" : "heart") + (text ? "<span>" + (saved ? "已在片单" : "加入片单") + "</span>" : "");
    });
  }

  function toggleWatch(id) {
    var drama = getDrama(id);
    if (!drama) return;
    var index = state.watchlist.indexOf(id);
    var added = index === -1;
    if (added) state.watchlist.unshift(id);
    else state.watchlist.splice(index, 1);
    saveWatchlist();
    updateWatchCount();
    updateHeartButtons(id);
    renderWatchlist();
    showToast(added ? "已加入片单 · " + drama.cn : "已从片单移除 · " + drama.cn);
  }

  function renderWatchlist() {
    updateWatchCount();
    if (!els.watchList) return;

    var saved = state.watchlist.map(getDrama).filter(Boolean);
    var isEmpty = saved.length === 0;
    els.watchEmpty.hidden = !isEmpty;
    els.watchList.hidden = isEmpty;
    els.clearWatch.hidden = isEmpty;
    els.watchMeta.textContent = isEmpty
      ? "还没有收藏任何短剧"
      : "共 " + saved.length + " 部 · 合计 " + fmtInt(saved.reduce(function (sum, d) { return sum + d.episodes; }, 0)) + " 集";

    els.watchList.innerHTML = saved.map(function (drama) {
      return '<article class="watch-item" data-detail="' + drama.id + '" tabindex="0" role="button" aria-label="查看 ' + esc(drama.cn) + '">' +
        '<div class="watch-thumb">' + posterHTML(drama) + "</div>" +
        '<div class="watch-copy"><strong>' + esc(drama.cn) + "</strong><span>" + esc(drama.platform) + " · " + drama.episodes + " 集</span><em>热度 " + fmtNumber(drama.heat) + "</em></div>" +
        '<button class="watch-remove" type="button" data-remove-watch="' + drama.id + '" aria-label="从片单移除 ' + esc(drama.cn) + '">' + icon("close") + "</button>" +
        "</article>";
    }).join("");
  }

  /* ---------------------------------------------------------
     Hero
     --------------------------------------------------------- */

  function renderHero() {
    if (!els.heroStage || FEATURED.length === 0) return;

    els.heroStage.innerHTML = FEATURED.map(function (drama, index) {
      var delta = (index - heroIndex + FEATURED.length) % FEATURED.length;
      var position = delta === 0 ? "center" : (delta === 1 ? "right" : "left");
      return '<article class="stage-card" data-pos="' + position + '" data-hero-index="' + index + '" data-id="' + drama.id + '" tabindex="0" role="button" aria-label="' + (position === "center" ? "查看" : "切换至") + " " + esc(drama.cn) + '">' +
        posterHTML(drama) +
        '<span class="stage-rank">' + String(drama.rank).padStart(2, "0") + "</span>" +
        "</article>";
    }).join("");

    var active = FEATURED[heroIndex];
    if (!active) return;

    els.heroCaption.innerHTML = '<div class="cap-copy">' +
      '<span class="cap-label">WEEKLY FOCUS · NO.' + String(active.rank).padStart(2, "0") + "</span>" +
      '<strong class="cap-title">' + esc(active.cn) + "</strong>" +
      '<span class="cap-meta">' + esc(active.platform) + " · " + esc(active.genres.join(" / ")) + " · " + active.episodes + " 集 · 热度 " + fmtNumber(active.heat) + "</span>" +
      '</div><span class="cap-arrow" aria-hidden="true">' + icon("arrow") + "</span>";
    els.heroCaption.dataset.detail = active.id;
    els.heroCaption.setAttribute("role", "button");
    els.heroCaption.setAttribute("tabindex", "0");
    els.heroCaption.setAttribute("aria-label", "查看本周焦点 " + active.cn);

    if (els.heroDots) {
      els.heroDots.innerHTML = FEATURED.map(function (drama, index) {
        return '<button type="button" class="' + (index === heroIndex ? "is-active" : "") + '" data-hero-dot="' + index + '" role="tab" aria-selected="' + (index === heroIndex) + '" aria-label="精选第 ' + (index + 1) + " 部：" + esc(drama.cn) + '"></button>';
      }).join("");
    }

    var palette = active.palette;
    if (els.heroAmbient) {
      els.heroAmbient.style.setProperty("--ambient-a", palette[0]);
      els.heroAmbient.style.setProperty("--ambient-b", palette[2]);
    }
    var aura = document.querySelector(".stage-aura");
    if (aura) {
      aura.style.setProperty("--ambient-a", palette[0]);
      aura.style.setProperty("--ambient-b", palette[2]);
    }
  }

  function setHero(index) {
    heroIndex = (index + FEATURED.length) % FEATURED.length;
    renderHero();
    if (els.heroStage) {
      var card = els.heroStage.querySelector('[data-pos="center"]');
      if (card) card.focus({ preventScroll: true });
    }
  }

  function startHeroRotation() {
    if (heroTimer) clearInterval(heroTimer);
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    heroTimer = setInterval(function () {
      if (heroPaused || document.hidden || document.querySelector(".layer.is-open")) return;
      heroIndex = (heroIndex + 1) % FEATURED.length;
      renderHero();
    }, 7600);
  }

  /* ---------------------------------------------------------
     Ticker, trending, platforms
     --------------------------------------------------------- */

  function renderTicker() {
    if (!els.tickerTrack) return;
    var items = ALL.slice(0, 12).map(function (drama) {
      return '<span class="ticker-item"><b>' + String(drama.rank).padStart(2, "0") + "</b><em>" + esc(drama.cn) + "</em><i>" + fmtNumber(drama.heat) + "</i>" + trendHTML(drama, true) + "</span>";
    }).join("");
    els.tickerTrack.innerHTML = items + items;
  }

  function renderTrending() {
    if (!els.trendRail) return;
    els.trendRail.innerHTML = ALL.slice(0, 12).map(function (drama) {
      return '<article class="trend-card" data-detail="' + drama.id + '" tabindex="0" role="button" aria-label="查看 ' + esc(drama.cn) + '">' +
        '<div class="trend-art">' + posterHTML(drama) +
          '<span class="trend-rank">' + String(drama.rank).padStart(2, "0") + "</span>" +
          '<span class="trend-play">' + icon("play") + "</span>" +
        "</div>" +
        '<div class="trend-info">' +
          '<div class="trend-meta"><span class="platform">' + esc(drama.platform) + "</span>" + trendHTML(drama, true) + "</div>" +
          "<h3>" + esc(drama.cn) + "</h3>" +
          "<p>" + esc(drama.title) + "</p>" +
        "</div>" +
      "</article>";
    }).join("");
  }

  function platformCounts() {
    return ALL.reduce(function (counts, drama) {
      counts[drama.platform] = (counts[drama.platform] || 0) + 1;
      return counts;
    }, {});
  }

  function renderPlatforms() {
    if (!els.platformStrip) return;
    var counts = platformCounts();
    var list = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] || a.localeCompare(b);
    });
    els.platformStrip.innerHTML = list.map(function (platform) {
      return '<a class="platform-chip" href="' + esc(window.PLATFORM_URLS[platform] || "#") + '" target="_blank" rel="noopener" title="打开 ' + esc(platform) + ' 官方站点"><b>' + esc(platform) + "</b><i>" + counts[platform] + "</i></a>";
    }).join("");
  }

  /* ---------------------------------------------------------
     Filters + ranking
     --------------------------------------------------------- */

  function allGenres() {
    var counts = {};
    ALL.forEach(function (drama) {
      drama.genres.forEach(function (genre) {
        counts[genre] = (counts[genre] || 0) + 1;
      });
    });
    return Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] || a.localeCompare(b);
    });
  }

  function buildFilters() {
    if (!els.regionChips) return;
    els.regionChips.innerHTML = ["全部"].concat(REGION_ORDER).map(function (region) {
      var count = region === "全部" ? ALL.length : ALL.filter(function (drama) { return drama.region === region; }).length;
      return '<button class="region-chip' + (region === state.region ? " is-active" : "") + '" type="button" data-region="' + esc(region) + '" aria-pressed="' + (region === state.region) + '">' + esc(region) + "<i>" + count + "</i></button>";
    }).join("");

    if (els.genreSelect) {
      els.genreSelect.innerHTML = '<option value="全部">全部题材</option>' + allGenres().map(function (genre) {
        return '<option value="' + esc(genre) + '">' + esc(genre) + "</option>";
      }).join("");
    }

    if (els.platformSelect) {
      var counts = platformCounts();
      var platforms = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
      els.platformSelect.innerHTML = '<option value="全部">全部平台</option>' + platforms.map(function (platform) {
        return '<option value="' + esc(platform) + '">' + esc(platform) + " · " + counts[platform] + "</option>";
      }).join("");
    }
    syncFilters();
  }

  function syncFilters() {
    if (els.regionChips) {
      $$("[data-region]", els.regionChips).forEach(function (button) {
        var active = button.dataset.region === state.region;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }
    if (els.genreSelect) els.genreSelect.value = state.genre;
    if (els.platformSelect) els.platformSelect.value = state.platform;
    if (els.sortSelect) els.sortSelect.value = state.sort;
    if (els.railSearch && els.railSearch.value !== state.query) els.railSearch.value = state.query;
  }

  function hasActiveFilters() {
    return state.region !== "全部" || state.genre !== "全部" || state.platform !== "全部" || state.sort !== "heat" || state.query.trim() !== "";
  }

  function filteredDramas() {
    var query = state.query.trim().toLowerCase();
    var items = ALL.filter(function (drama) {
      if (state.region !== "全部" && drama.region !== state.region) return false;
      if (state.genre !== "全部" && drama.genres.indexOf(state.genre) === -1) return false;
      if (state.platform !== "全部" && drama.platform !== state.platform) return false;
      if (query) {
        var haystack = [drama.cn, drama.title, drama.platform, drama.region, drama.language, drama.genres.join(" "), drama.badge, drama.desc, drama.synopsis].join(" ").toLowerCase();
        if (haystack.indexOf(query) === -1) return false;
      }
      return true;
    });

    items.sort(function (a, b) {
      if (state.sort === "rise") {
        var score = function (drama) {
          if (drama.trend === "new") return 30;
          return Math.max(0, Number(drama.trend) || 0);
        };
        return score(b) - score(a) || b.heat - a.heat;
      }
      if (state.sort === "new") {
        return b.year - a.year || b.heat - a.heat;
      }
      if (state.sort === "episodes") {
        return b.episodes - a.episodes || b.heat - a.heat;
      }
      return b.heat - a.heat || a.rank - b.rank;
    });

    return items;
  }

  function cardHTML(drama) {
    var saved = isSaved(drama.id);
    var badge = drama.badge
      ? '<span class="card-badge' + (drama.badge === "18+" ? " card-badge--adult" : "") + '">' + esc(drama.badge) + "</span>"
      : "";
    return '<article class="drama-card" data-detail="' + drama.id + '" tabindex="0" role="button" aria-label="查看 ' + esc(drama.cn) + '">' +
      '<div class="card-poster">' +
        posterHTML(drama) +
        '<span class="rank-tag">' + String(drama.rank).padStart(2, "0") + "</span>" +
        badge +
        '<button class="card-fav' + (saved ? " is-saved" : "") + '" type="button" data-save="' + drama.id + '" aria-pressed="' + saved + '" aria-label="' + (saved ? "从片单移除" : "加入片单") + '">' + icon(saved ? "heart-fill" : "heart") + "</button>" +
      "</div>" +
      '<div class="card-info">' +
        '<div class="card-topline"><span class="card-platform">' + esc(drama.platform) + "</span>" + trendHTML(drama) + "</div>" +
        "<h3>" + esc(drama.cn) + "</h3>" +
        '<p class="card-en">' + esc(drama.title) + "</p>" +
        '<div class="card-meta"><span class="genres">' + esc(drama.genres.slice(0, 2).join(" · ")) + "</span><span>" + drama.episodes + " 集</span></div>" +
      "</div>" +
      '<div class="card-score"><strong>' + fmtNumber(drama.heat) + "</strong><span>综合热度</span></div>" +
    "</article>";
  }

  function spotlightHTML() {
    var lead = ALL[0];
    var second = ALL[1];
    var third = ALL[2];
    if (!lead || !second || !third) return "";

    return '<article class="spotlight-lead" data-detail="' + lead.id + '" tabindex="0" role="button" aria-label="查看榜首 ' + esc(lead.cn) + '">' +
      '<div class="spotlight-poster">' + posterHTML(lead) + "</div>" +
      '<div class="spotlight-copy">' +
        '<div class="spotlight-rank">01<span>GLOBAL NO.1</span></div>' +
        "<h3>" + esc(lead.cn) + "</h3>" +
        '<p class="spotlight-en">' + esc(lead.title) + "</p>" +
        '<p class="spotlight-desc">' + esc(lead.desc) + "</p>" +
        '<div class="tag-row"><span class="tag tag--accent">' + esc(lead.platform) + "</span>" + lead.genres.slice(0, 2).map(function (genre) { return '<span class="tag">' + esc(genre) + "</span>"; }).join("") + "</div>" +
        '<div class="spotlight-metrics">' +
          "<div><strong>" + fmtNumber(lead.heat) + "</strong><span>热度指数</span></div>" +
          "<div><strong>" + fmtNumber(lead.views) + "</strong><span>估算播放</span></div>" +
          "<div><strong>" + lead.episodes + "</strong><span>剧集数量</span></div>" +
          "<div><strong>" + trendHTML(lead) + "</strong><span>本周趋势</span></div>" +
        "</div>" +
      "</div>" +
    "</article>" +
    '<div class="spotlight-side">' +
      spotlightMini(second) +
      spotlightMini(third) +
    "</div>";
  }

  function spotlightMini(drama) {
    return '<article class="spotlight-mini" data-detail="' + drama.id + '" tabindex="0" role="button" aria-label="查看第 ' + drama.rank + ' 名 ' + esc(drama.cn) + '">' +
      '<div class="mini-poster">' + posterHTML(drama) + "</div>" +
      '<div class="mini-copy">' +
        '<div class="mini-rank">' + String(drama.rank).padStart(2, "0") + "<span>GLOBAL</span></div>" +
        "<h3>" + esc(drama.cn) + "</h3>" +
        "<p>" + esc(drama.title) + "</p>" +
        '<div class="mini-meta"><span>' + esc(drama.platform) + "</span><strong>" + fmtNumber(drama.heat) + "</strong></div>" +
      "</div>" +
    "</article>";
  }

  function renderResults() {
    var items = filteredDramas();
    var active = hasActiveFilters();

    if (els.topSpotlight) {
      els.topSpotlight.innerHTML = active ? "" : spotlightHTML();
      els.topSpotlight.style.display = active ? "none" : "";
    }

    if (els.resultCount) {
      if (active) {
        var queryLabel = state.query.trim() ? ' · 关键词 “' + esc(state.query.trim()) + '”' : "";
        els.resultCount.innerHTML = "找到 <b>" + items.length + "</b> 部作品" + queryLabel;
      } else {
        els.resultCount.innerHTML = "<b>" + ALL.length + "</b> 部在榜作品 · 按综合热度排序";
      }
    }

    if (els.clearFilters) els.clearFilters.hidden = !active;
    if (els.emptyState) els.emptyState.hidden = items.length !== 0;

    var visible = items.slice(0, state.limit);
    if (els.rankingGrid) {
      els.rankingGrid.innerHTML = visible.map(cardHTML).join("");
      els.rankingGrid.classList.toggle("is-list", state.view === "list");
    }

    if (els.loadZone) els.loadZone.hidden = items.length === 0;
    if (els.loadMore) els.loadMore.hidden = items.length <= state.limit;
    if (els.loadStatus) {
      els.loadStatus.textContent = items.length === 0
        ? "没有匹配的作品"
        : "已显示 " + visible.length + " / " + items.length + " 部";
    }
    if (els.loadBar) {
      var percentage = items.length ? (visible.length / items.length) * 100 : 0;
      els.loadBar.style.width = Math.max(4, Math.min(100, percentage)) + "%";
    }

    if (els.loadLabel) {
      els.loadLabel.textContent = String(Math.min(PAGE_SIZE, Math.max(0, items.length - state.limit)));
    }
  }

  function resetFilters() {
    state.region = "全部";
    state.genre = "全部";
    state.platform = "全部";
    state.sort = "heat";
    state.query = "";
    state.limit = PAGE_SIZE;
    if (els.railSearch) els.railSearch.value = "";
    syncFilters();
    renderResults();
  }

  function applyView(view) {
    state.view = view;
    $$("[data-view]").forEach(function (button) {
      var active = button.dataset.view === view;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderResults();
  }

  /* ---------------------------------------------------------
     Insights
     --------------------------------------------------------- */

  function renderInsights() {
    var regionStats = REGION_ORDER.map(function (region) {
      var list = ALL.filter(function (drama) { return drama.region === region; });
      return {
        region: region,
        count: list.length,
        heat: list.reduce(function (sum, drama) { return sum + drama.heat; }, 0)
      };
    }).filter(function (item) { return item.count > 0; }).sort(function (a, b) { return b.heat - a.heat; });

    var totalHeat = regionStats.reduce(function (sum, item) { return sum + item.heat; }, 0);

    if (els.regionBars) {
      els.regionBars.innerHTML = regionStats.map(function (item) {
        var share = totalHeat ? (item.heat / totalHeat) * 100 : 0;
        return '<div class="bar-row"><span>' + esc(item.region) + "</span><div class=\"bar-track\"><i style=\"width:" + share.toFixed(1) + '%"></i></div><b>' + share.toFixed(1) + "%</b></div>";
      }).join("");
    }

    var platformHeat = {};
    ALL.forEach(function (drama) {
      platformHeat[drama.platform] = (platformHeat[drama.platform] || 0) + drama.heat;
    });
    var platformTotal = Object.keys(platformHeat).reduce(function (sum, platform) {
      return sum + platformHeat[platform];
    }, 0);
    var platformList = Object.keys(platformHeat).map(function (platform) {
      return { platform: platform, heat: platformHeat[platform] };
    }).sort(function (a, b) { return b.heat - a.heat; }).slice(0, 7);
    var maxPlatformHeat = platformList.length ? platformList[0].heat : 1;

    if (els.platformBars) {
      els.platformBars.innerHTML = platformList.map(function (item) {
        var share = platformTotal ? (item.heat / platformTotal) * 100 : 0;
        return '<div class="bar-row"><span>' + esc(item.platform) + "</span><div class=\"bar-track\"><i style=\"width:" + ((item.heat / maxPlatformHeat) * 100).toFixed(1) + '%"></i></div><b>' + share.toFixed(1) + "%</b></div>";
      }).join("");
    }

    var totalViews = ALL.reduce(function (sum, drama) { return sum + drama.views; }, 0);
    var newCount = ALL.filter(function (drama) { return drama.trend === "new"; }).length;
    var episodes = ALL.reduce(function (sum, drama) { return sum + drama.episodes; }, 0);
    var marketCount = new Set(ALL.map(function (drama) { return drama.region; })).size;
    var platformCount = new Set(ALL.map(function (drama) { return drama.platform; })).size;

    if (els.statViews) els.statViews.textContent = fmtNumber(totalViews);
    if (els.statPlatforms) els.statPlatforms.textContent = String(platformCount);
    if (els.statMarkets) els.statMarkets.textContent = String(marketCount);
    if (els.insightNew) els.insightNew.textContent = String(newCount);
    if (els.insightEpisodes) els.insightEpisodes.textContent = fmtInt(episodes);
    if (els.insightPlatforms) els.insightPlatforms.textContent = String(platformCount);
    if (els.insightTotal) els.insightTotal.textContent = String(ALL.length);
  }

  /* ---------------------------------------------------------
     Detail modal
     --------------------------------------------------------- */

  function similarDramas(drama) {
    var pool = ALL.filter(function (item) {
      if (item.id === drama.id) return false;
      if (item.platform === drama.platform) return true;
      return item.genres.some(function (genre) { return drama.genres.indexOf(genre) !== -1; });
    }).sort(function (a, b) { return b.heat - a.heat; });

    if (pool.length < 3) {
      ALL.forEach(function (item) {
        if (item.id !== drama.id && pool.indexOf(item) === -1) pool.push(item);
      });
    }
    return pool.slice(0, 3);
  }

  function openDetail(id) {
    var drama = getDrama(id);
    if (!drama || !els.detailBody) return;

    var saved = isSaved(id);
    var recs = similarDramas(drama);

    els.detailBody.innerHTML = '<div class="detail-grid">' +
      '<div class="detail-left">' + posterHTML(drama) + "</div>" +
      '<div class="detail-right">' +
        '<div class="detail-topline"><span class="live"><i></i> NO.' + String(drama.rank).padStart(2, "0") + " · IN THE GLOBAL TOP 100</span><span>" + esc(drama.platform) + " · 原榜 #" + drama.appRank + "</span></div>" +
        "<h2>" + esc(drama.cn) + "</h2>" +
        '<p class="detail-en">' + esc(drama.title) + "</p>" +
        '<div class="tag-row">' +
          (drama.badge ? '<span class="tag tag--accent">' + esc(drama.badge) + "</span>" : "") +
          drama.genres.map(function (genre) { return '<span class="tag">' + esc(genre) + "</span>"; }).join("") +
        "</div>" +
        '<p class="detail-desc">' + esc(drama.desc) + "</p>" +
        (drama.synopsis ? '<div class="detail-synopsis"><span>官方剧情 / ORIGINAL SYNOPSIS</span><p>' + esc(drama.synopsis) + "</p></div>" : "") +
        '<div class="detail-metrics">' +
          "<div><strong>" + fmtNumber(drama.heat) + "</strong><span>综合热度</span></div>" +
          "<div><strong>" + fmtNumber(drama.views) + "</strong><span>估算播放</span></div>" +
          "<div><strong>" + drama.episodes + "</strong><span>剧集数量</span></div>" +
          "<div><strong>" + trendHTML(drama) + "</strong><span>本周趋势</span></div>" +
        "</div>" +
        '<div class="detail-actions">' +
          '<a class="button button--primary" href="' + esc(drama.platformUrl) + '" target="_blank" rel="noopener">前往 ' + esc(drama.platform) + " 观看 " + icon("up-right") + "</a>" +
          '<button class="fav-detail' + (saved ? " is-saved" : "") + '" type="button" data-save="' + drama.id + '" aria-pressed="' + saved + '">' + icon(saved ? "heart-fill" : "heart") + "<span>" + (saved ? "已在片单" : "加入片单") + "</span></button>" +
        "</div>" +
        '<p class="platform-note-detail">将跳转至 ' + esc(drama.platform) + " 官方入口 · 本站不提供剧集资源 · " +
          '<a href="' + esc(drama.sourceUrl) + '" target="_blank" rel="noopener">资料与封面来源 ↗</a></p>' +
        '<div class="similar">' +
          '<div class="similar-head"><h3>你也许还会上头</h3><span>MORE LIKE THIS</span></div>' +
          '<div class="similar-grid">' + recs.map(function (item) {
            return '<button class="similar-card" type="button" data-detail="' + item.id + '">' +
              '<span class="similar-thumb">' + posterHTML(item) + "</span>" +
              '<span class="similar-copy"><strong>' + esc(item.cn) + "</strong><span>" + esc(item.platform) + " · " + item.episodes + " 集</span></span>" +
            "</button>";
          }).join("") + "</div>" +
        "</div>" +
      "</div>" +
    "</div>";

    var shell = els.detailModal.querySelector(".detail-shell");
    if (shell) shell.scrollTop = 0;
    els.detailModal.setAttribute("aria-label", drama.cn + " · " + drama.title);

    if (!els.detailModal.classList.contains("is-open")) {
      openLayer(els.detailModal, els.detailModal.querySelector(".layer-close"));
    }
  }

  /* ---------------------------------------------------------
     Search
     --------------------------------------------------------- */

  function searchDramas(query) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL.filter(function (drama) {
      var haystack = [drama.cn, drama.title, drama.platform, drama.region, drama.language, drama.genres.join(" "), drama.badge, drama.desc, drama.synopsis].join(" ").toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).sort(function (a, b) { return b.heat - a.heat; });
  }

  function renderSearch(query) {
    if (!els.searchResults) return;
    var q = query.trim();
    searchMatches = searchDramas(q);
    searchSelected = 0;

    if (els.searchSuggest) els.searchSuggest.hidden = q.length > 0;
    if (els.searchCount) els.searchCount.textContent = q ? searchMatches.length + " 个结果" : ALL.length + " 部在榜";

    if (!q) {
      els.searchResults.innerHTML = "";
      return;
    }

    if (!searchMatches.length) {
      els.searchResults.innerHTML = '<div class="search-empty"><strong>没有找到这部剧</strong>试试更短的关键词，或搜索一个题材，比如“狼人”“重生”。</div>';
      return;
    }

    els.searchResults.innerHTML = searchMatches.slice(0, 7).map(function (drama, index) {
      return '<button class="search-result' + (index === searchSelected ? " is-selected" : "") + '" type="button" data-search-id="' + drama.id + '">' +
        '<span class="search-thumb">' + posterHTML(drama) + "</span>" +
        '<span class="search-copy"><strong>' + esc(drama.cn) + '<em>NO.' + String(drama.rank).padStart(2, "0") + "</em></strong><span>" + esc(drama.title) + " · " + esc(drama.genres.slice(0, 2).join(" / ")) + "</span></span>" +
        '<span class="search-side"><b>' + fmtNumber(drama.heat) + "</b><span>" + esc(drama.platform) + "</span></span>" +
      "</button>";
    }).join("");
  }

  function selectSearchResult(index) {
    if (!searchMatches.length) return;
    var bounded = Math.max(0, Math.min(Math.min(7, searchMatches.length) - 1, index));
    searchSelected = bounded;
    $$(".search-result", els.searchResults).forEach(function (row, rowIndex) {
      row.classList.toggle("is-selected", rowIndex === bounded);
      if (rowIndex === bounded) row.scrollIntoView({ block: "nearest" });
    });
  }

  function openSearchResult(index) {
    var drama = searchMatches[index];
    if (!drama) return;
    closeLayer(els.searchOverlay, false);
    openDetail(drama.id);
    if (els.globalSearch) els.globalSearch.value = "";
    renderSearch("");
  }

  /* ---------------------------------------------------------
     Layers
     --------------------------------------------------------- */

  function updateBodyLock() {
    document.body.classList.toggle("is-locked", Boolean(document.querySelector(".layer.is-open")));
  }

  function openLayer(layer, focusTarget) {
    if (!layer) return;
    $$(".layer.is-open").forEach(function (open) {
      if (open !== layer) closeLayer(open, false);
    });
    lastFocused = document.activeElement;
    layer.classList.add("is-open");
    layer.setAttribute("aria-hidden", "false");
    updateBodyLock();
    window.setTimeout(function () {
      var target = focusTarget || layer.querySelector("input, button, a[href]");
      if (target) target.focus({ preventScroll: true });
    }, 80);
  }

  function closeLayer(layer, restoreFocus) {
    if (!layer || !layer.classList.contains("is-open")) return;
    layer.classList.remove("is-open");
    layer.setAttribute("aria-hidden", "true");
    updateBodyLock();
    if (restoreFocus !== false && lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      els.toast.classList.remove("is-visible");
    }, 2400);
  }

  function handlePosterError(event) {
    var image = event.target;
    if (!image || !image.classList || !image.classList.contains("poster__img")) return;
    var poster = image.closest(".poster");
    if (poster) poster.classList.add("is-failed");
  }

  /* ---------------------------------------------------------
     Event wiring
     --------------------------------------------------------- */

  function bindEvents() {
    var header = els.header;

    window.addEventListener("scroll", function () {
      var current = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", current > 24);
      if (els.pageProgress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        els.pageProgress.style.width = (max > 0 ? Math.min(100, (current / max) * 100) : 0) + "%";
      }
    }, { passive: true });

    if (els.mobileMenu) {
      els.mobileMenu.addEventListener("click", function () {
        var open = els.mobileMenu.getAttribute("aria-expanded") === "true";
        els.mobileMenu.setAttribute("aria-expanded", String(!open));
        els.mobileNav.classList.toggle("is-open", !open);
        els.mobileNav.setAttribute("aria-hidden", String(open));
      });
    }

    $$(".mobile-nav a, [data-open-search]", document).forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        if (trigger.closest(".mobile-nav")) {
          els.mobileMenu.setAttribute("aria-expanded", "false");
          els.mobileNav.classList.remove("is-open");
          els.mobileNav.setAttribute("aria-hidden", "true");
        }
      });
    });

    $$("[data-open-search]").forEach(function (button) {
      button.addEventListener("click", function () {
        openLayer(els.searchOverlay, els.globalSearch);
      });
    });

    $$("[data-open-watchlist]").forEach(function (button) {
      button.addEventListener("click", function () {
        renderWatchlist();
        openLayer(els.watchDrawer, els.watchDrawer.querySelector(".layer-close"));
      });
    });

    $$("[data-open-method]").forEach(function (button) {
      button.addEventListener("click", function () {
        openLayer(els.methodModal, els.methodModal.querySelector(".layer-close"));
      });
    });

    if (els.heroStage) {
      els.heroStage.addEventListener("mouseenter", function () { heroPaused = true; });
      els.heroStage.addEventListener("mouseleave", function () { heroPaused = false; });
    }

    if (els.heroDots) {
      els.heroDots.addEventListener("click", function (event) {
        var dot = event.target.closest("[data-hero-dot]");
        if (!dot) return;
        setHero(Number(dot.dataset.heroDot));
      });
    }

    if (els.trendPrev) {
      els.trendPrev.addEventListener("click", function () {
        els.trendRail.scrollBy({ left: -460, behavior: "smooth" });
      });
    }
    if (els.trendNext) {
      els.trendNext.addEventListener("click", function () {
        els.trendRail.scrollBy({ left: 460, behavior: "smooth" });
      });
    }

    if (els.railSearch) {
      els.railSearch.addEventListener("input", function () {
        state.query = els.railSearch.value;
        state.limit = PAGE_SIZE;
        renderResults();
      });
    }

    if (els.genreSelect) {
      els.genreSelect.addEventListener("change", function () {
        state.genre = els.genreSelect.value;
        state.limit = PAGE_SIZE;
        renderResults();
      });
    }

    if (els.platformSelect) {
      els.platformSelect.addEventListener("change", function () {
        state.platform = els.platformSelect.value;
        state.limit = PAGE_SIZE;
        renderResults();
      });
    }

    if (els.sortSelect) {
      els.sortSelect.addEventListener("change", function () {
        state.sort = els.sortSelect.value;
        state.limit = PAGE_SIZE;
        renderResults();
      });
    }

    if (els.regionChips) {
      els.regionChips.addEventListener("click", function (event) {
        var button = event.target.closest("[data-region]");
        if (!button) return;
        state.region = button.dataset.region;
        state.limit = PAGE_SIZE;
        syncFilters();
        renderResults();
      });
    }

    if (els.clearFilters) els.clearFilters.addEventListener("click", resetFilters);
    if (els.emptyReset) els.emptyReset.addEventListener("click", resetFilters);

    $$("[data-view]").forEach(function (button) {
      button.addEventListener("click", function () {
        applyView(button.dataset.view);
      });
    });

    if (els.loadMore) {
      els.loadMore.addEventListener("click", function () {
        state.limit += PAGE_SIZE;
        renderResults();
      });
    }

    if (els.clearWatch) {
      els.clearWatch.addEventListener("click", function () {
        if (!state.watchlist.length) return;
        var previous = state.watchlist.slice();
        state.watchlist = [];
        saveWatchlist();
        updateWatchCount();
        previous.forEach(updateHeartButtons);
        renderWatchlist();
        showToast("片单已清空");
      });
    }

    if (els.randomPick) {
      els.randomPick.addEventListener("click", function () {
        var drama = ALL[Math.floor(Math.random() * ALL.length)];
        if (drama) openDetail(drama.id);
      });
    }

    if (els.globalSearch) {
      els.globalSearch.addEventListener("input", function () {
        renderSearch(els.globalSearch.value);
      });
    }

    if (els.searchSuggest) {
      els.searchSuggest.addEventListener("click", function (event) {
        var chip = event.target.closest("[data-query]");
        if (!chip) return;
        els.globalSearch.value = chip.dataset.query;
        renderSearch(chip.dataset.query);
        els.globalSearch.focus();
      });
    }

    if (els.searchOverlay) {
      els.searchOverlay.addEventListener("keydown", function (event) {
        if (event.isComposing) return;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          selectSearchResult(searchSelected + 1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          selectSearchResult(searchSelected - 1);
        } else if (event.key === "Enter") {
          event.preventDefault();
          openSearchResult(searchSelected);
        }
      });
    }

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeydown);

    if ("IntersectionObserver" in window) {
      var sections = ["trending", "ranking", "platforms", "insights"];
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          $$("[data-nav]").forEach(function (link) {
            link.classList.toggle("is-active", link.dataset.nav === entry.target.id);
          });
        });
      }, { rootMargin: "-38% 0px -54% 0px", threshold: 0 });

      sections.forEach(function (id) {
        var section = document.getElementById(id);
        if (section) observer.observe(section);
      });
    }

    startHeroRotation();
  }

  function handleDocumentClick(event) {
    var closeTrigger = event.target.closest("[data-close-layer]");
    if (closeTrigger) {
      var layer = closeTrigger.closest(".layer");
      closeLayer(layer);
      if (closeTrigger.hasAttribute("data-explore")) {
        var ranking = document.getElementById("ranking");
        if (ranking) window.setTimeout(function () { ranking.scrollIntoView({ behavior: "smooth" }); }, 80);
      }
      return;
    }

    var removeWatch = event.target.closest("[data-remove-watch]");
    if (removeWatch) {
      event.preventDefault();
      event.stopPropagation();
      toggleWatch(removeWatch.dataset.removeWatch);
      return;
    }

    var save = event.target.closest("[data-save]");
    if (save) {
      event.preventDefault();
      event.stopPropagation();
      toggleWatch(save.dataset.save);
      return;
    }

    var searchResult = event.target.closest("[data-search-id]");
    if (searchResult) {
      event.preventDefault();
      closeLayer(els.searchOverlay, false);
      openDetail(searchResult.dataset.searchId);
      if (els.globalSearch) els.globalSearch.value = "";
      renderSearch("");
      return;
    }

    var heroCard = event.target.closest("[data-hero-index]");
    if (heroCard) {
      var index = Number(heroCard.dataset.heroIndex);
      if (heroCard.dataset.pos === "center") {
        openDetail(heroCard.dataset.id);
      } else {
        setHero(index);
      }
      return;
    }

    var dot = event.target.closest("[data-hero-dot]");
    if (dot) {
      setHero(Number(dot.dataset.heroDot));
      return;
    }

    var detail = event.target.closest("[data-detail]");
    if (detail) {
      openDetail(detail.dataset.detail);
    }
  }

  function handleDocumentKeydown(event) {
    var openLayerElement = document.querySelector(".layer.is-open");

    if (event.key === "Escape") {
      if (openLayerElement) {
        closeLayer(openLayerElement);
        return;
      }
      if (els.mobileNav && els.mobileNav.classList.contains("is-open")) {
        els.mobileMenu.setAttribute("aria-expanded", "false");
        els.mobileNav.classList.remove("is-open");
        els.mobileNav.setAttribute("aria-hidden", "true");
      }
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openLayer(els.searchOverlay, els.globalSearch);
      return;
    }

    if (event.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      event.preventDefault();
      openLayer(els.searchOverlay, els.globalSearch);
      return;
    }

    if (event.key === "Tab" && openLayerElement) {
      var focusable = $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', openLayerElement).filter(function (element) {
        return element.offsetParent !== null;
      });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-detail], [data-hero-index]")) {
      event.preventDefault();
      if (event.target.hasAttribute("data-hero-index")) {
        if (event.target.dataset.pos === "center") openDetail(event.target.dataset.id);
        else setHero(Number(event.target.dataset.heroIndex));
      } else {
        openDetail(event.target.dataset.detail);
      }
    }
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */

  function cacheElements() {
    els.header = document.getElementById("siteHeader");
    els.mobileMenu = document.getElementById("mobileMenu");
    els.mobileNav = document.getElementById("mobileNav");
    els.pageProgress = document.getElementById("pageProgress");
    els.heroStage = document.getElementById("heroStage");
    els.heroCaption = document.getElementById("heroCaption");
    els.heroDots = document.getElementById("heroDots");
    els.heroAmbient = document.getElementById("heroAmbient");
    els.tickerTrack = document.getElementById("tickerTrack");
    els.trendRail = document.getElementById("trendRail");
    els.trendPrev = document.getElementById("trendPrev");
    els.trendNext = document.getElementById("trendNext");
    els.platformStrip = document.getElementById("platformStrip");
    els.topSpotlight = document.getElementById("topSpotlight");
    els.rankingGrid = document.getElementById("rankingGrid");
    els.resultCount = document.getElementById("resultCount");
    els.clearFilters = document.getElementById("clearFilters");
    els.emptyState = document.getElementById("emptyState");
    els.emptyReset = document.getElementById("emptyReset");
    els.loadZone = document.getElementById("loadZone");
    els.loadMore = document.getElementById("loadMore");
    els.loadLabel = document.getElementById("loadLabel");
    els.loadStatus = document.getElementById("loadStatus");
    els.loadBar = document.getElementById("loadBar");
    els.regionChips = document.getElementById("regionChips");
    els.genreSelect = document.getElementById("genreSelect");
    els.platformSelect = document.getElementById("platformSelect");
    els.sortSelect = document.getElementById("sortSelect");
    els.railSearch = document.getElementById("railSearch");
    els.watchCount = document.getElementById("watchCount");
    els.watchDrawer = document.getElementById("watchDrawer");
    els.watchList = document.getElementById("watchList");
    els.watchEmpty = document.getElementById("watchEmpty");
    els.watchMeta = document.getElementById("watchMeta");
    els.clearWatch = document.getElementById("clearWatch");
    els.detailModal = document.getElementById("detailModal");
    els.detailBody = document.getElementById("detailBody");
    els.searchOverlay = document.getElementById("searchOverlay");
    els.globalSearch = document.getElementById("globalSearch");
    els.searchResults = document.getElementById("searchResults");
    els.searchSuggest = document.getElementById("searchSuggest");
    els.searchCount = document.getElementById("searchCount");
    els.methodModal = document.getElementById("methodModal");
    els.randomPick = document.getElementById("randomPick");
    els.toast = document.getElementById("toast");
    els.statViews = document.getElementById("statViews");
    els.statPlatforms = document.getElementById("statPlatforms");
    els.statMarkets = document.getElementById("statMarkets");
    els.statUpdated = document.getElementById("statUpdated");
    els.insightTotal = document.getElementById("insightTotal");
    els.insightNew = document.getElementById("insightNew");
    els.insightEpisodes = document.getElementById("insightEpisodes");
    els.insightPlatforms = document.getElementById("insightPlatforms");
    els.regionBars = document.getElementById("regionBars");
    els.platformBars = document.getElementById("platformBars");
  }

  function init() {
    if (!ALL.length) {
      document.body.innerHTML = '<p style="padding:40px;color:#fff;font-family:sans-serif">榜单数据加载失败，请确认 data.js 与 index.html 在同一目录。</p>';
      return;
    }
    cacheElements();
    document.addEventListener("error", handlePosterError, true);
    buildFilters();
    renderHero();
    renderTicker();
    renderTrending();
    renderPlatforms();
    renderInsights();
    renderWatchlist();
    renderResults();
    renderSearch("");
    bindEvents();
    if (els.statUpdated) els.statUpdated.textContent = "10.30";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
