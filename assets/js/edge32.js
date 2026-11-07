/* EDGE32 — application logic
   Vanilla JS. No build step, no dependencies, no trackers. */
(function () {
  "use strict";

  var A = window.ATLAS;
  if (!A) {
    console.error("EDGE32: data.js did not load.");
    return;
  }

  document.documentElement.classList.add("js");

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var TRACKS = {};
  A.tracks.forEach(function (t) { TRACKS[t.id] = t; });
  var CASES = A.cases.map(function (c, i) {
    var copy = {};
    Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
    copy.index = i + 1;
    return copy;
  });
  var CASE_BY_ID = {};
  CASES.forEach(function (c) { CASE_BY_ID[c.id] = c; });

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = {
    track: "all",
    query: "",
    sort: "curated",
    feature: 0,
    step: 0,
    useCase: "voice",
    matrix: "voice",
    searchQuery: ""
  };
  var modalVideo = null;
  var currentCaseId = null;
  var lastFocus = null;
  var toastTimer = null;

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function track(id) { return TRACKS[id] || A.tracks[0]; }

  function icon(name, cls) {
    return '<svg class="icon ' + (cls || "") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }

  function splitName(name) {
    if (name.length <= 13) return [name];
    if (name.indexOf(" ") > -1) {
      var words = name.split(" ");
      var best = 1;
      var bestDiff = Infinity;
      for (var i = 1; i < words.length; i++) {
        var a = words.slice(0, i).join(" ").length;
        var b = words.slice(i).join(" ").length;
        if (Math.abs(a - b) < bestDiff) { bestDiff = Math.abs(a - b); best = i; }
      }
      return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
    }
    return [name];
  }

  function externalVideoUrl(v) {
    var id = v.videoId || v.id;
    if (v.type === "youtube") return "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
    if (v.type === "bilibili") return "https://www.bilibili.com/video/" + encodeURIComponent(id);
    return "#";
  }

  function embedVideo(v) {
    var id = v.videoId || v.id;
    if (v.type === "youtube") {
      return '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
        '?autoplay=1&rel=0" title="' + esc(v.title || "视频") +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>';
    }
    var query = String(id).indexOf("av") === 0 ? "aid=" + encodeURIComponent(id.slice(2)) : "bvid=" + encodeURIComponent(id);
    return '<iframe src="https://player.bilibili.com/player.html?' + query +
      '&page=1&high_quality=1&danmaku=0&autoplay=1" title="' + esc(v.title || "视频") +
      '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen scrolling="no" loading="lazy"></iframe>';
  }

  function normalizeVideo(v) {
    if (!v) return null;
    return {
      type: v.type,
      id: v.videoId || v.id,
      title: v.title || "视频",
      note: v.note || "",
      source: v.source || (v.type === "youtube" ? "YouTube" : "Bilibili")
    };
  }

  /* ------------------------------------------------------------------------
     Poster generator — an editorial "field plate" behind every case.
     ------------------------------------------------------------------------ */

  function motif(trackId, c) {
    if (trackId === "ai") {
      return '<g transform="translate(560 275)" fill="none" stroke="' + c + '" stroke-opacity=".55">' +
        '<circle r="158" stroke-dasharray="2 9" stroke-opacity=".6"/>' +
        '<circle r="112"/>' +
        '<circle r="66" stroke-opacity=".8"/>' +
        '<path d="M-188 26h54l18-54 24 112 19-58h220" stroke-width="2"/>' +
        '<circle r="5" fill="' + c + '" stroke="none"/>' +
        '<circle cx="-112" cy="-78" r="3" fill="' + c + '" stroke="none" opacity=".6"/>' +
        '<circle cx="118" cy="92" r="2.5" fill="' + c + '" stroke="none" opacity=".5"/>' +
        '</g>';
    }
    if (trackId === "robotics") {
      return '<g transform="translate(550 300)" fill="none" stroke="' + c + '" stroke-opacity=".55" stroke-linecap="round">' +
        '<path d="M-150 130h104" stroke-width="2"/>' +
        '<path d="M-98 130V42l92-58 82 52" stroke-width="4"/>' +
        '<path d="M-6 -16l82 60 78-38" stroke-width="4"/>' +
        '<circle cx="-98" cy="130" r="10"/><circle cx="-98" cy="42" r="10"/><circle cx="-6" cy="-16" r="9"/><circle cx="76" cy="44" r="8"/><circle cx="154" cy="6" r="7"/>' +
        '<path d="M-166 94a116 116 0 0 1 52-98" stroke-dasharray="2 8" stroke-opacity=".5"/>' +
        '<path d="M-104 166a160 160 0 0 1 48-118" stroke-dasharray="2 8" stroke-opacity=".35"/>' +
        '<circle cx="154" cy="6" r="19" stroke-opacity=".35"/>' +
        '</g>';
    }
    if (trackId === "home") {
      return '<g transform="translate(558 300)" fill="none" stroke="' + c + '" stroke-opacity=".5" stroke-linejoin="round">' +
        '<path d="M-128 24 0 -52 128 24 0 100Z" stroke-width="2"/>' +
        '<path d="M-128 24v92L0 190l128-74V24M0 100v90"/>' +
        '<path d="M-72 54v68l46 27 46-27V54" stroke-opacity=".7"/>' +
        '<path d="M-24 110v56" stroke-opacity=".5"/>' +
        '<circle cx="0" cy="30" r="148" stroke-dasharray="2 10" stroke-opacity=".35"/>' +
        '<circle cx="0" cy="30" r="182" stroke-dasharray="2 14" stroke-opacity=".2"/>' +
        '</g>';
    }
    if (trackId === "wearable") {
      return '<g transform="translate(556 285)" fill="none" stroke="' + c + '" stroke-opacity=".55">' +
        '<rect x="-72" y="-92" width="144" height="184" rx="38" stroke-width="2"/>' +
        '<rect x="-58" y="-78" width="116" height="156" rx="28" stroke-opacity=".55"/>' +
        '<path d="M-48 -92v-56h96v56M-48 92v56h96v-56" stroke-opacity=".45"/>' +
        '<path d="M-155 0h54M101 0h54" stroke-dasharray="3 6" stroke-opacity=".4"/>' +
        '<circle r="132" stroke-dasharray="2 9" stroke-opacity=".35"/>' +
        '<path d="M-30 24h20l12-44 16 86 13-54 10 12h23" stroke-width="2"/>' +
        '</g>';
    }
    if (trackId === "industry") {
      return '<g transform="translate(560 292)" fill="none" stroke="' + c + '" stroke-opacity=".52">' +
        '<path d="M-172 136h344" stroke-width="2"/>' +
        '<path d="M-82 136V-36l82-54v226M0 136V-90l82 54v172M82 136V-50" stroke-width="2"/>' +
        '<path d="M-82 16h82M0 -16h82M-82 64h164" stroke-opacity=".45"/>' +
        '<path d="M-146 58l36-36 36 36M118 92l30-30 30 30" stroke-opacity=".6"/>' +
        '<path d="M-150 136c28-30 58-44 92-44s64 14 92 44" stroke-dasharray="2 8" stroke-opacity=".35"/>' +
        '<circle cx="-72" cy="-116" r="4" fill="' + c + '" stroke="none" opacity=".7"/>' +
        '</g>';
    }
    if (trackId === "field") {
      return '<g transform="translate(556 292)" fill="none" stroke="' + c + '" stroke-opacity=".48">' +
        '<path d="M-190 34c54-60 102-60 156 0s102 60 156 0 104-54 158 4" stroke-width="1.5"/>' +
        '<path d="M-190 76c54-60 102-60 156 0s102 60 156 0 104-54 158 4" stroke-opacity=".6"/>' +
        '<path d="M-190 -8c54-60 102-60 156 0s102 60 156 0 104-54 158 4" stroke-opacity=".35"/>' +
        '<path d="M0 -124v-40M-34 -148 0 -182l34 34" stroke-width="2"/>' +
        '<path d="M-56 -112a80 80 0 0 1 112 0M-80 -88a114 114 0 0 1 160 0" stroke-opacity=".55"/>' +
        '<circle cy="-124" r="5" fill="' + c + '" stroke="none"/>' +
        '</g>';
    }
    var cells = "";
    for (var y = 0; y < 6; y++) {
      for (var x = 0; x < 6; x++) {
        var on = (x * 7 + y * 3) % 5 === 0 || (x === 4 && y === 2);
        cells += '<rect x="' + (-108 + x * 38) + '" y="' + (-108 + y * 38) + '" width="26" height="26" rx="2" fill="' +
          (on ? c : "none") + '" fill-opacity="' + (on ? ".65" : "0") + '" stroke="' + c + '" stroke-opacity="' +
          (on ? ".8" : ".22") + '"/>';
      }
    }
    return '<g transform="translate(560 280)" fill="none" stroke="' + c + '" stroke-opacity=".5">' +
      cells +
      '<path d="M-170 146h340" stroke-width="1.5" stroke-opacity=".7"/>' +
      '<path d="M-170 160h340" stroke-width="1" stroke-opacity=".3"/>' +
      '<circle cx="100" cy="-20" r="78" stroke-dasharray="2 8" stroke-opacity=".35"/>' +
      '</g>';
  }

  function posterSvg(item, index, options) {
    var plain = options && options.plain;
    var t = track(item.track);
    var c = t.color;
    var uid = "p" + index + "-" + String(item.id).replace(/[^a-z0-9]/gi, "");
    var lines = splitName(item.name);
    var two = lines.length > 1;
    var size = two ? 52 : item.name.length > 17 ? 54 : item.name.length > 11 ? 66 : 82;
    var ys = two ? [414, 474] : [462];
    var name = plain ? "" : lines.map(function (line, i) {
      return '<text x="48" y="' + ys[i] + '" font-family="\'Arial Narrow\',\'Bahnschrift\',sans-serif" font-weight="700" font-size="' +
        size + '" letter-spacing="-2" fill="#f1f2e9">' + esc(line) + "</text>";
    }).join("");
    var org = plain ? "" : esc(item.org) + " / " + esc(item.year);
    var chip = plain ? "" : esc(item.chip);
    var bottom = plain
      ? '<text x="752" y="560" text-anchor="end" font-family="\'Arial Narrow\',\'Bahnschrift\',sans-serif" font-weight="700" font-size="160" letter-spacing="-8" fill="' + c + '" fill-opacity=".13">' + pad(index) + "</text>"
      : '<text x="48" y="' + (two ? 524 : 506) + '" font-family="\'Cascadia Mono\',Consolas,monospace" font-size="10.5" letter-spacing=".8" fill="#9aa095">' + org + "</text>" +
        '<text x="48" y="' + (two ? 550 : 532) + '" font-family="\'Cascadia Mono\',Consolas,monospace" font-size="9" letter-spacing="1.5" fill="#747b70">EDGE32 FIELD PLATE</text>' +
        '<text x="752" y="' + (two ? 550 : 532) + '" text-anchor="end" font-family="\'Cascadia Mono\',Consolas,monospace" font-size="9" letter-spacing=".8" fill="' + c + '">' + chip + "</text>" +
        '<path d="M48 574h704" stroke="' + c + '" stroke-opacity=".28"/>' +
        '<text x="48" y="592" font-family="\'Cascadia Mono\',Consolas,monospace" font-size="7" letter-spacing="2" fill="#5d655b">CURATED APPLICATION ATLAS / 2026</text>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="' + esc(item.name) + ' 编辑图形">' +
      '<defs>' +
      '<linearGradient id="g-' + uid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#141b15"/><stop offset=".55" stop-color="#0a0f0b"/><stop offset="1" stop-color="#070a08"/></linearGradient>' +
      '<radialGradient id="r-' + uid + '" cx="74%" cy="20%" r="78%"><stop offset="0" stop-color="' + c + '" stop-opacity=".24"/><stop offset=".55" stop-color="' + c + '" stop-opacity=".05"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>' +
      '<pattern id="grid-' + uid + '" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="' + c + '" stroke-opacity=".07"/></pattern>' +
      '</defs>' +
      '<rect width="800" height="600" fill="url(#g-' + uid + ')"/>' +
      '<rect width="800" height="600" fill="url(#r-' + uid + ')"/>' +
      '<rect width="800" height="600" fill="url(#grid-' + uid + ')"/>' +
      '<path d="M0 452h800" stroke="#f1f2e9" stroke-opacity=".11"/>' +
      motif(item.track, c) +
      name +
      bottom +
      "</svg>";
  }

  function bindImages(root) {
    $$("img[data-media]", root || document).forEach(function (img) {
      function loaded() { img.classList.add("is-loaded"); }
      function failed() {
        var host = img.closest(".case-visual, .feature-media, .modal-media");
        if (host) host.classList.add("poster-only");
        if (img.parentNode) img.parentNode.removeChild(img);
      }
      if (img.complete) {
        if (img.naturalWidth > 0) loaded();
        else failed();
      } else {
        img.addEventListener("load", loaded, { once: true });
        img.addEventListener("error", failed, { once: true });
      }
    });
  }

  /* ------------------------------------------------------------------------
     Reveal + count-up
     ------------------------------------------------------------------------ */

  var revealObserver = null;
  if ("IntersectionObserver" in window && !reducedMotion) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add("is-in");
          revealObserver.unobserve(el);
          window.setTimeout(function () {
            el.classList.remove("reveal", "is-in");
            el.style.transitionDelay = "";
          }, 1150);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  }

  function observeReveals(root) {
    var els = $$(".reveal:not(.is-in)", root || document);
    if (!revealObserver) {
      els.forEach(function (el) { el.classList.remove("reveal", "is-in"); });
      return;
    }
    els.forEach(function (el) { revealObserver.observe(el); });
  }

  function animateCount(el) {
    var target = Number(el.getAttribute("data-count"));
    if (!target || isNaN(target)) return;
    if (reducedMotion) { el.textContent = String(target); return; }
    var start = null;
    var duration = 1000;
    function tick(now) {
      if (!start) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------------
     Header, menu, scroll
     ------------------------------------------------------------------------ */

  var header = $(".site-header");
  var scrollProgress = $("#scrollProgress");
  var mobileNav = $("#mobileNav");
  var menuToggle = $(".menu-toggle");

  function syncBodyLock() {
    var locked = !!document.querySelector(".modal.is-open, .search-overlay.is-open, .video-modal.is-open, .mobile-nav.is-open");
    document.body.classList.toggle("is-locked", locked);
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", y > 18);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = (max > 0 ? Math.min(y / max, 1) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    mobileNav.classList.toggle("is-open", open);
    mobileNav.setAttribute("aria-hidden", String(!open));
    if ("inert" in mobileNav) mobileNav.inert = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    var use = $("use", menuToggle);
    if (use) use.setAttribute("href", open ? "#i-close" : "#i-menu");
    syncBodyLock();
  }
  if ("inert" in mobileNav) mobileNav.inert = true;
  menuToggle.addEventListener("click", function () {
    setMenu(!mobileNav.classList.contains("is-open"));
  });
  $$("a", mobileNav).forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1024 && mobileNav.classList.contains("is-open")) setMenu(false);
  });

  /* ------------------------------------------------------------------------
     Atlas
     ------------------------------------------------------------------------ */

  var trackFilters = $("#trackFilters");
  var caseGrid = $("#caseGrid");
  var atlasSearch = $("#atlasSearch");
  var sortSelect = $("#sortSelect");
  var resultCount = $("#resultCount");
  var atlasEmpty = $("#atlasEmpty");

  function renderFilters() {
    var all = '<button class="filter-btn' + (state.track === "all" ? " is-active" : "") +
      '" type="button" data-track="all" aria-pressed="' + (state.track === "all") + '">全部 <small>' + CASES.length + "</small></button>";
    var buttons = A.tracks.map(function (t) {
      var count = CASES.filter(function (c) { return c.track === t.id; }).length;
      return '<button class="filter-btn' + (state.track === t.id ? " is-active" : "") +
        '" type="button" data-track="' + t.id + '" style="--c:' + t.color + '" aria-pressed="' +
        (state.track === t.id) + '">' + esc(t.name) + " <small>" + count + "</small></button>";
    }).join("");
    trackFilters.innerHTML = all + buttons;
  }

  function filteredCases() {
    var q = state.query.trim().toLowerCase();
    var list = CASES.filter(function (c) {
      if (state.track !== "all" && c.track !== state.track) return false;
      if (!q) return true;
      var haystack = [c.name, c.en, c.org, c.year, c.chip, c.tagline, c.summary, c.why]
        .concat(c.tags || [], c.stack || [], c.reuse || [])
        .join(" ").toLowerCase();
      return haystack.indexOf(q) > -1;
    });
    if (state.sort === "newest") {
      list.sort(function (a, b) {
        return Number(String(b.year).slice(-4)) - Number(String(a.year).slice(-4));
      });
    } else if (state.sort === "name") {
      list.sort(function (a, b) { return a.name.localeCompare(b.name, "zh-Hans"); });
    }
    return list;
  }

  function cardHtml(c) {
    var t = track(c.track);
    var media = '<div class="case-visual' + (c.image ? "" : " poster-only") + '">' +
      '<div class="visual-poster" aria-hidden="true">' + posterSvg(c, c.index) + "</div>" +
      (c.image ? '<img data-media src="' + esc(c.image) + '" alt="' + esc(c.imageAlt) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' : "") +
      '<div class="visual-overlay"></div>' +
      '<div class="visual-top"><span class="track-chip" style="--c:' + t.color + '"><i></i>' + esc(t.name) +
      '</span><span class="visual-index">' + pad(c.index) + "</span></div>" +
      (c.video ? '<span class="video-flag">' + icon("video") + "VIDEO</span>" : "") +
      '<div class="visual-bottom"><h3>' + esc(c.name) + '</h3><p>' + esc(c.org) + " / " + esc(c.year) + "</p></div>" +
      "</div>";
    var body = '<div class="case-body">' +
      '<p class="case-tagline">' + esc(c.tagline) + "</p>" +
      '<div class="case-meta"><span class="chip-badge">' + esc(c.chip) + '</span><span class="stage-badge" data-stage="' +
      esc(c.stage) + '">' + esc(c.stage) + "</span></div>" +
      '<div class="case-cta"><span>' + (c.video ? "VIDEO + CASE" : "CASE FILE") + '</span><span>查看拆解 ' + icon("arrow") + "</span></div>" +
      "</div>";
    return '<a class="case-card reveal" href="#cases" data-case="' + esc(c.id) + '" aria-label="查看 ' + esc(c.name) + ' 案例">' + media + body + "</a>";
  }

  function renderCases() {
    var list = filteredCases();
    caseGrid.innerHTML = list.map(cardHtml).join("");
    atlasEmpty.hidden = list.length !== 0;
    resultCount.textContent = "显示 " + list.length + " 个案例" +
      (state.track !== "all" ? " · " + track(state.track).name : "") +
      (state.query ? " · “" + state.query + "”" : "");
    bindImages(caseGrid);
    var cards = $$(".case-card", caseGrid);
    cards.forEach(function (card, i) {
      card.style.transitionDelay = Math.min(i * 28, 280) + "ms";
    });
    observeReveals(caseGrid);
  }

  trackFilters.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-track]");
    if (!btn) return;
    state.track = btn.getAttribute("data-track");
    renderFilters();
    renderCases();
  });

  atlasSearch.addEventListener("input", function () {
    state.query = atlasSearch.value;
    renderCases();
  });

  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    renderCases();
  });

  $("#clearFilters").addEventListener("click", function () {
    state.track = "all";
    state.query = "";
    atlasSearch.value = "";
    renderFilters();
    renderCases();
  });

  renderFilters();
  renderCases();

  /* ------------------------------------------------------------------------
     Featured case files
     ------------------------------------------------------------------------ */

  var featureTabs = $("#featureTabs");
  var featureShell = $("#featureShell");
  featureShell.setAttribute("role", "tabpanel");

  function featureMedia(f) {
    var c = CASE_BY_ID[f.id];
    var p = c ? posterSvg(c, c.index) : "";
    return '<div class="feature-media' + (f.image ? "" : " poster-only") + '">' +
      '<div class="visual-poster" aria-hidden="true">' + p + "</div>" +
      (f.image ? '<img data-media src="' + esc(f.image) + '" alt="' + esc(f.imageAlt) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' : "") +
      '<div class="feature-media-caption"><strong>' + esc(f.subtitle) + '</strong><span>' +
      (f.image ? "OFFICIAL / PUBLIC" : "EDGE32 FIELD PLATE") + "</span></div>" +
      "</div>";
  }

  function featureHtml(f) {
    var decisions = f.decisions.map(function (d, i) {
      return '<div class="feature-decision"><span>' + pad(i + 1) + "</span><div><h4>" + esc(d[0]) + "</h4><p>" + esc(d[1]) + "</p></div></div>";
    }).join("");
    var arch = f.architecture.map(function (a, i) {
      return '<div class="arch-node"><span>' + esc(a[1]) + "</span><strong>" + esc(a[0]) + "</strong></div>" +
        (i < f.architecture.length - 1 ? '<span class="arch-arrow" aria-hidden="true">→</span>' : "");
    }).join("");
    var reuse = f.reuse.map(function (r) { return '<span class="reuse-tag">' + esc(r) + "</span>"; }).join("");
    return '<div class="feature-card">' + featureMedia(f) +
      '<div class="feature-body">' +
      '<div class="feature-kicker">' + esc(f.kicker) + "</div>" +
      "<h3>" + esc(f.title) + "</h3>" +
      '<p class="feature-sub">' + esc(f.subtitle) + "</p>" +
      '<p class="feature-lede">' + esc(f.lede) + "</p>" +
      '<div class="feature-decisions">' + decisions + "</div>" +
      '<div class="arch-flow" aria-label="系统架构">' + arch + "</div>" +
      '<div class="feature-reuse">' + reuse + "</div>" +
      '<div class="feature-foot">' +
      '<div class="feature-facts"><div>PRICE / BOM<b>' + esc(f.price) + "</b></div><div>CHIP<b>" + esc(f.chip) + "</b></div></div>" +
      '<div class="feature-actions"><a class="btn btn-ghost" href="' + esc(f.source) + '" target="_blank" rel="noopener">原始来源 ' + icon("arrow") + "</a>" +
      (f.video ? '<button class="btn btn-primary" type="button" data-feature-video="' + esc(f.id) + '">观看视频 ' + icon("play") + "</button>" : "") +
      "</div></div></div></div>";
  }

  function renderFeatureTabs() {
    featureTabs.innerHTML = A.featured.map(function (f, i) {
      return '<button class="feature-tab" type="button" role="tab" id="ftab-' + i + '" aria-selected="' +
        (state.feature === i) + '" aria-controls="featureShell" data-feature="' + i + '"><span>' + pad(i + 1) + "</span>" +
        esc(f.subtitle.split("·")[0].trim()) + "</button>";
    }).join("");
    $$(".feature-tab", featureTabs).forEach(function (btn) {
      btn.addEventListener("click", function () { setFeature(Number(btn.getAttribute("data-feature"))); });
    });
  }

  function setFeature(index) {
    state.feature = index;
    $$(".feature-tab", featureTabs).forEach(function (btn, i) {
      btn.setAttribute("aria-selected", String(i === index));
      btn.tabIndex = i === index ? 0 : -1;
    });
    featureShell.innerHTML = featureHtml(A.featured[index]);
    featureShell.setAttribute("aria-labelledby", "ftab-" + index);
    featureShell.tabIndex = 0;
    bindImages(featureShell);
    featureShell.style.animation = "none";
    void featureShell.offsetWidth;
    featureShell.style.animation = "";
  }

  featureShell.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-feature-video]");
    if (!btn) return;
    var f = A.featured.filter(function (x) { return x.id === btn.getAttribute("data-feature-video"); })[0];
    if (f) openVideo(f.video);
  });

  renderFeatureTabs();
  setFeature(0);

  /* ------------------------------------------------------------------------
     Videos
     ------------------------------------------------------------------------ */

  var videoGrid = $("#videoGrid");

  function renderVideos() {
    videoGrid.innerHTML = A.videos.map(function (v) {
      var c = CASE_BY_ID[v.caseId];
      var poster = c ? posterSvg(c, c.index, { plain: true }) : "";
      return '<a class="video-card reveal" href="' + externalVideoUrl({ type: v.type, id: v.videoId }) +
        '" target="_blank" rel="noopener" data-video="' + esc(v.id) + '">' +
        '<div class="video-cover"><div class="visual-poster" aria-hidden="true">' + poster + "</div>" +
        (v.cover ? '<img data-media src="' + esc(v.cover) + '" alt="' + esc(v.title) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' : "") +
        "</div>" +
        '<span class="video-source">' + esc(v.source) + " / VIDEO</span>" +
        '<span class="video-play" aria-hidden="true">' + icon("play") + "</span>" +
        '<div class="video-info"><h3>' + esc(v.title) + "</h3><p>" + esc(v.note) + "</p></div>" +
        "</a>";
    }).join("");
    bindImages(videoGrid);
    observeReveals(videoGrid);
  }
  renderVideos();

  /* ------------------------------------------------------------------------
     Playbook
     ------------------------------------------------------------------------ */

  var stepNav = $("#stepNav");
  var stepPanel = $("#stepPanel");

  function renderStepNav() {
    stepNav.innerHTML = A.playbook.map(function (s, i) {
      return '<button class="step-button" type="button" role="tab" aria-selected="' + (state.step === i) +
        '" data-step="' + i + '"><span class="no">' + s.no + '</span><span class="label">' + esc(s.title) +
        "</span>" + icon("arrow") + "</button>";
    }).join("");
    $$(".step-button", stepNav).forEach(function (btn) {
      btn.addEventListener("click", function () { setStep(Number(btn.getAttribute("data-step"))); });
    });
  }

  function stepHtml(s) {
    function list(items) {
      return items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    }
    return '<div class="step-kicker">' + esc(s.kicker) + "</div>" +
      "<h3>" + esc(s.title) + "</h3>" +
      '<p class="step-lede">' + esc(s.lede) + "</p>" +
      '<p class="step-body">' + esc(s.body) + "</p>" +
      '<div class="step-columns">' +
      '<div class="step-column"><h4>关键动作</h4><ul>' + list(s.actions) + "</ul></div>" +
      '<div class="step-column"><h4>交付物</h4><ul>' + list(s.deliverables) + "</ul></div>" +
      '<div class="step-column"><h4>常见坑</h4><ul>' + list(s.pitfalls) + "</ul></div>" +
      "</div>" +
      '<span class="step-tool">' + icon("arrow") + " TOOL / " + esc(s.tool) + "</span>";
  }

  function setStep(index) {
    state.step = index;
    $$(".step-button", stepNav).forEach(function (btn, i) {
      btn.setAttribute("aria-selected", String(i === index));
      btn.tabIndex = i === index ? 0 : -1;
    });
    stepPanel.innerHTML = stepHtml(A.playbook[index]);
    stepPanel.setAttribute("role", "tabpanel");
    stepPanel.tabIndex = 0;
    stepPanel.style.animation = "none";
    void stepPanel.offsetWidth;
    stepPanel.style.animation = "";
  }

  renderStepNav();
  setStep(0);

  /* ------------------------------------------------------------------------
     Selector
     ------------------------------------------------------------------------ */

  var selectorControls = $("#selectorControls");
  var selectorResult = $("#selectorResult");
  var chipTableBody = $("#chipTableBody");

  function renderSelectorControls() {
    selectorControls.innerHTML = A.selector.useCases.map(function (u) {
      return '<button class="use-case-button" type="button" data-use-case="' + u.id + '" aria-pressed="' +
        (state.useCase === u.id) + '"><span>' + esc(u.label) + '</span><span class="uc-arrow">↗</span></button>';
    }).join("");
    $$(".use-case-button", selectorControls).forEach(function (btn) {
      btn.addEventListener("click", function () { setUseCase(btn.getAttribute("data-use-case")); });
    });
  }

  function setUseCase(id) {
    state.useCase = id;
    var u = A.selector.useCases.filter(function (x) { return x.id === id; })[0] || A.selector.useCases[0];
    $$(".use-case-button", selectorControls).forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-use-case") === u.id));
    });
    var metrics = [
      ["AI 能力", u.metrics.ai],
      ["连接", u.metrics.connect],
      ["实时", u.metrics.realtime],
      ["成本效率", u.metrics.cost]
    ].map(function (m) {
      return '<div class="metric-row"><span>' + m[0] + "</span><div class=\"metric-bar\"><i data-value=\"" + m[1] +
        '"></i></div><b>' + m[1] + "</b></div>";
    }).join("");
    var examples = u.examples.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("");
    selectorResult.innerHTML = '<div class="selector-main">' +
      '<div class="selector-label">RECOMMENDED / 主控</div>' +
      '<div class="selector-chip">' + esc(u.chip) + "</div>" +
      '<div class="selector-companion"><b>伴生</b> ' + esc(u.companion) + "</div>" +
      '<p class="selector-why">' + esc(u.why) + "</p>" +
      '<div class="selector-risk"><b>代价 / RISK</b>' + esc(u.risk) + "</div>" +
      '<div class="selector-examples">' + examples + "</div>" +
      "</div>" +
      '<div class="selector-side"><div class="metric-list">' + metrics + "</div>" +
      '<p class="selector-note">评分是编辑判断，用于横向比较，不代表芯片绝对性能。实际选型请以官方 datasheet 与打样测试为准。</p></div>';
    requestAnimationFrame(function () {
      $$(".metric-bar i", selectorResult).forEach(function (bar) {
        bar.style.width = bar.getAttribute("data-value") + "%";
      });
    });
  }

  function renderChipTable() {
    chipTableBody.innerHTML = A.selector.chips.map(function (c) {
      return "<tr><td>" + esc(c.name) + "</td><td>" + esc(c.cpu) + "</td><td>" + esc(c.radio) +
        "</td><td>" + esc(c.thread) + "</td><td>" + esc(c.media) + "</td><td>" + esc(c.ai) +
        "</td><td>" + esc(c.best) + "</td><td>" + esc(c.price) + "</td></tr>";
    }).join("");
  }

  renderSelectorControls();
  setUseCase("voice");
  renderChipTable();

  /* ------------------------------------------------------------------------
     Opportunity matrix
     ------------------------------------------------------------------------ */

  var matrixBoard = $("#matrixBoard");
  var matrixDetail = $("#matrixDetail");

  function renderMatrix() {
    A.matrix.forEach(function (m) {
      var t = track(m.track);
      var size = "clamp(28px, " + (m.size / 7.4).toFixed(2) + "vw, " + m.size + "px)";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "matrix-bubble" + (state.matrix === m.id ? " is-active" : "");
      btn.setAttribute("data-matrix", m.id);
      btn.setAttribute("aria-label", m.label + "：" + m.window + "。" + m.note);
      btn.style.left = "calc(5% + " + (m.x * 0.9) + "%)";
      btn.style.bottom = "calc(6% + " + (m.y * 0.86) + "%)";
      btn.style.width = size;
      btn.style.height = size;
      btn.style.setProperty("--c", t.color);
      btn.innerHTML = '<span class="bubble-label">' + esc(m.label) + "</span>";
      btn.addEventListener("click", function () { setMatrix(m.id); });
      btn.addEventListener("focus", function () { setMatrix(m.id); });
      matrixBoard.appendChild(btn);
    });
    setMatrix(state.matrix);
  }

  function setMatrix(id) {
    var m = A.matrix.filter(function (x) { return x.id === id; })[0] || A.matrix[0];
    var t = track(m.track);
    state.matrix = m.id;
    $$(".matrix-bubble", matrixBoard).forEach(function (b) {
      var active = b.getAttribute("data-matrix") === m.id;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    matrixDetail.style.setProperty("--c", t.color);
    matrixDetail.innerHTML = '<span class="detail-track">' + esc(t.name) + " / " + esc(t.en) + "</span>" +
      "<h3>" + esc(m.label) + "</h3>" +
      '<span class="detail-window">窗口 / ' + esc(m.window) + "</span>" +
      "<p>" + esc(m.note) + "</p>" +
      '<div class="detail-scale"><div><span>技术可行性</span><b>' + m.x + "<small>/100</small></b></div>" +
      "<div><span>市场吸引力</span><b>" + m.y + "<small>/100</small></b></div></div>";
  }
  renderMatrix();

  /* ------------------------------------------------------------------------
     Forecast
     ------------------------------------------------------------------------ */

  var forecastGrid = $("#forecastGrid");

  function renderForecasts() {
    forecastGrid.innerHTML = A.forecasts.map(function (f, i) {
      var color = A.tracks[i % A.tracks.length].color;
      var signals = f.signals.map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("");
      return '<article class="forecast-card reveal" style="--c:' + color + '">' +
        '<div class="forecast-year">' + esc(f.year) + "<small>" + esc(f.horizon) + "</small></div>" +
        '<div class="forecast-content"><h3>' + esc(f.title) + "</h3>" +
        "<p>" + esc(f.thesis) + "</p>" +
        '<div class="confidence"><div class="confidence-bar"><i style="--v:' + f.confidence + '%"></i></div><span>CONFIDENCE ' + f.confidence + "%</span></div>" +
        '<div class="forecast-signals">' + signals + "</div>" +
        '<div class="forecast-opportunity"><b>机会 / OPPORTUNITY</b>' + esc(f.opportunity) + "</div></div></article>";
    }).join("");
    observeReveals(forecastGrid);
  }
  renderForecasts();

  /* ------------------------------------------------------------------------
     Recipes + resources
     ------------------------------------------------------------------------ */

  var recipeGrid = $("#recipeGrid");
  recipeGrid.innerHTML = A.recipes.map(function (r) {
    var tags = r.stack.map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("");
    return '<article class="recipe-card reveal"><div class="recipe-top"><span class="recipe-letter">' + esc(r.no) +
      '</span><span class="recipe-diff">DIFFICULTY / ' + esc(r.difficulty) + "</span></div>" +
      "<h3>" + esc(r.title) + '</h3><p class="recipe-chip">' + esc(r.chip) + "</p>" +
      '<div class="recipe-specs"><div><span>TIME</span><b>' + esc(r.time) + "</b></div><div><span>BOM</span><b>" +
      esc(r.bom) + "</b></div><div><span>RETAIL</span><b>" + esc(r.retail) + "</b></div></div>" +
      '<div class="recipe-validate"><b>必须先回答</b>' + esc(r.validate) + "</div>" +
      '<p class="recipe-note">' + esc(r.note) + "</p>" +
      '<div class="recipe-tags">' + tags + "</div></article>";
  }).join("");
  observeReveals(recipeGrid);

  var resourceGrid = $("#resourceGrid");
  resourceGrid.innerHTML = A.resources.map(function (r, i) {
    return '<a class="resource-link" href="' + esc(r[2]) + '" target="_blank" rel="noopener"><span class="res-no">' +
      pad(i + 1) + "</span><div><h3>" + esc(r[0]) + "</h3><p>" + esc(r[1]) + "</p></div>" + icon("arrow") + "</a>";
  }).join("");

  /* ------------------------------------------------------------------------
     Overlay plumbing
     ------------------------------------------------------------------------ */

  var caseModal = $("#caseModal");
  var searchOverlay = $("#searchOverlay");
  var videoModal = $("#videoModal");
  var videoFrame = $("#videoFrame");
  var videoTitle = $("#videoTitle");
  var videoCaption = $("#videoCaption");
  var videoExternal = $("#videoExternal");

  function focusFirst(el, selector) {
    var target = selector ? $(selector, el) : null;
    if (!target) {
      target = $("button, a[href], input, select, [tabindex]:not([tabindex='-1'])", el);
    }
    if (target) window.setTimeout(function () { target.focus({ preventScroll: true }); }, 40);
  }

  function anyOverlayOpen() {
    return !!(document.querySelector(".modal.is-open, .search-overlay.is-open, .video-modal.is-open"));
  }

  function openOverlay(el, selector) {
    if (!anyOverlayOpen()) lastFocus = document.activeElement;
    el.hidden = false;
    requestAnimationFrame(function () {
      el.classList.add("is-open");
      syncBodyLock();
      focusFirst(el, selector);
    });
  }

  function closeOverlay(el, immediate) {
    if (!el.classList.contains("is-open")) {
      el.hidden = true;
      return;
    }
    el.classList.remove("is-open");
    syncBodyLock();
    if (immediate) {
      el.hidden = true;
      return;
    }
    window.setTimeout(function () {
      if (!el.classList.contains("is-open")) el.hidden = true;
    }, 280);
    if (anyOverlayOpen()) {
      if (caseModal.classList.contains("is-open")) focusFirst(caseModal, ".modal-close");
      return;
    }
    if (lastFocus && document.contains(lastFocus)) {
      lastFocus.focus({ preventScroll: true });
    }
    lastFocus = null;
  }

  function getFocusable(el) {
    return $$("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])", el)
      .filter(function (x) { return x.offsetWidth > 0 || x.offsetHeight > 0 || x === document.activeElement; });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (videoModal.classList.contains("is-open")) { closeVideo(); return; }
      if (caseModal.classList.contains("is-open")) { closeCase(); return; }
      if (searchOverlay.classList.contains("is-open")) { closeSearch(); return; }
      if (mobileNav.classList.contains("is-open")) { setMenu(false); return; }
    }
    if (e.key !== "Tab") return;
    var overlay = [videoModal, caseModal, searchOverlay].filter(function (el) { return el.classList.contains("is-open"); })[0];
    if (!overlay) return;
    var f = getFocusable(overlay);
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ------------------------------------------------------------------------
     Case modal
     ------------------------------------------------------------------------ */

  function openCase(id) {
    var c = CASE_BY_ID[id];
    if (!c) return;
    currentCaseId = id;
    modalVideo = c.video || null;
    var t = track(c.track);
    $("#modalKicker").textContent = t.name + " / " + c.stage + " / " + c.year;
    $("#modalTitle").textContent = c.name;
    $("#modalMeta").innerHTML = '<span class="chip-badge">' + esc(c.chip) + '</span><span class="stage-badge" data-stage="' +
      esc(c.stage) + '">' + esc(c.stage) + '</span><span class="chip-badge">' + esc(c.org) + "</span>";
    $("#modalSummary").textContent = c.summary;
    $("#modalWhy").textContent = c.why;
    $("#modalSpecs").innerHTML = c.specs.map(function (s) {
      return "<div><span>" + esc(s[0]) + "</span><b>" + esc(s[1]) + "</b></div>";
    }).join("");
    $("#modalStack").innerHTML = c.stack.map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("");
    $("#modalReuse").innerHTML = c.reuse.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    $("#modalActions").innerHTML = '<a class="btn btn-primary" href="' + esc(c.source) +
      '" target="_blank" rel="noopener">打开原始来源 ' + icon("arrow") + "</a>" +
      (c.video ? '<button class="btn btn-ghost" type="button" id="modalVideoButton">观看视频 ' + icon("play") + "</button>" : "") +
      '<button class="btn btn-ghost" type="button" id="copyCaseButton">复制链接 ' + icon("copy") + "</button>";
    var poster = posterSvg(c, c.index);
    $("#modalMedia").className = "modal-media" + (c.image ? "" : " poster-only");
    $("#modalMedia").innerHTML = '<div class="visual-poster" aria-hidden="true">' + poster + "</div>" +
      (c.image ? '<img data-media src="' + esc(c.image) + '" alt="' + esc(c.imageAlt) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' : "") +
      '<div class="modal-media-caption"><span>' + esc(c.imageCredit) + "</span><span>" +
      (c.imageKind === "photo" ? "PRODUCT / PROJECT IMAGE" : c.imageKind === "project" ? "PROJECT COVER" : "EDITED FIELD PLATE") + "</span></div>";
    bindImages($("#modalMedia"));
    openOverlay(caseModal, ".modal-close");
    var panel = $(".modal-panel", caseModal);
    if (panel) panel.scrollTop = 0;
  }

  function closeCase() { closeOverlay(caseModal); }

  $$("[data-close-case]").forEach(function (el) { el.addEventListener("click", closeCase); });

  $("#modalActions").addEventListener("click", function (e) {
    if (e.target.closest("#modalVideoButton")) {
      openVideo(modalVideo);
      return;
    }
    if (e.target.closest("#copyCaseButton")) {
      copyCurrentCase();
    }
  });

  function copyCurrentCase() {
    var url = location.href.split("#")[0] + (currentCaseId ? "#case-" + currentCaseId : "");
    function fallback() {
      try { window.prompt("复制案例链接", url); } catch (err) { /* noop */ }
      toast("链接已生成");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast("案例链接已复制"); }, fallback);
    } else {
      fallback();
    }
  }

  /* ------------------------------------------------------------------------
     Search
     ------------------------------------------------------------------------ */

  var globalSearch = $("#globalSearch");
  var searchResults = $("#searchResults");

  function searchMatches(q) {
    var query = q.trim().toLowerCase();
    if (!query) return CASES.slice(0, 6);
    return CASES.filter(function (c) {
      return [c.name, c.en, c.org, c.chip, c.tagline, c.summary]
        .concat(c.tags || [], c.stack || [])
        .join(" ").toLowerCase().indexOf(query) > -1;
    });
  }

  function renderSearch(q) {
    state.searchQuery = q;
    var list = searchMatches(q);
    if (!list.length) {
      searchResults.innerHTML = '<p class="search-empty">没有找到“' + esc(q) + '”。试试芯片型号、公司名或场景词。</p>';
      return;
    }
    searchResults.innerHTML = list.map(function (c) {
      var t = track(c.track);
      return '<a class="search-result" href="#cases" data-case="' + esc(c.id) + '"><span class="res-index">' +
        pad(c.index) + '</span><div><h3>' + esc(c.name) + "</h3><p>" + esc(t.name) + " / " + esc(c.org) +
        "</p></div><span class=\"res-stage\">" + esc(c.stage) + "</span></a>";
    }).join("");
  }

  function openSearch() {
    if (mobileNav.classList.contains("is-open")) setMenu(false);
    $$(".search-trigger").forEach(function (btn) { btn.setAttribute("aria-expanded", "true"); });
    openOverlay(searchOverlay, "#globalSearch");
    globalSearch.value = state.searchQuery || "";
    renderSearch(globalSearch.value);
  }

  function closeSearch(immediate) {
    $$(".search-trigger").forEach(function (btn) { btn.setAttribute("aria-expanded", "false"); });
    closeOverlay(searchOverlay, immediate);
  }

  $$(".search-trigger").forEach(function (btn) { btn.addEventListener("click", openSearch); });
  $$("[data-close-search]").forEach(function (el) { el.addEventListener("click", function () { closeSearch(); }); });
  globalSearch.addEventListener("input", function () { renderSearch(globalSearch.value); });
  $("#searchHints").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-query]");
    if (!btn) return;
    globalSearch.value = btn.getAttribute("data-query");
    renderSearch(globalSearch.value);
    globalSearch.focus();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey) return;
    if (/input|textarea|select/i.test(document.activeElement.tagName)) return;
    if (document.querySelector(".modal.is-open, .video-modal.is-open, .search-overlay.is-open, .mobile-nav.is-open")) return;
    e.preventDefault();
    openSearch();
  });

  /* ------------------------------------------------------------------------
     Video modal
     ------------------------------------------------------------------------ */

  function openVideo(v) {
    var n = normalizeVideo(v);
    if (!n) return;
    videoTitle.textContent = n.title;
    videoCaption.textContent = n.note || "视频来自公开平台，版权归原作者所有。";
    videoExternal.href = externalVideoUrl(n);
    videoFrame.innerHTML = embedVideo(n);
    openOverlay(videoModal, ".video-head .icon-button");
  }

  function closeVideo() {
    closeOverlay(videoModal);
    window.setTimeout(function () {
      if (!videoModal.classList.contains("is-open")) videoFrame.innerHTML = "";
    }, 280);
  }

  $$("[data-close-video]").forEach(function (el) { el.addEventListener("click", closeVideo); });

  /* ------------------------------------------------------------------------
     Global case/video clicks
     ------------------------------------------------------------------------ */

  document.addEventListener("click", function (e) {
    var caseLink = e.target.closest("[data-case]");
    if (caseLink) {
      e.preventDefault();
      if (searchOverlay.classList.contains("is-open")) {
        closeSearch(true);
        lastFocus = null;
      }
      openCase(caseLink.getAttribute("data-case"));
      return;
    }
    var videoLink = e.target.closest("[data-video]");
    if (videoLink) {
      e.preventDefault();
      var v = A.videos.filter(function (x) { return x.id === videoLink.getAttribute("data-video"); })[0];
      if (v) openVideo(v);
    }
  });

  /* ------------------------------------------------------------------------
     Toast + deep link
     ------------------------------------------------------------------------ */

  function toast(message) {
    var el = $("#toast");
    el.textContent = message;
    el.classList.add("is-visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove("is-visible"); }, 2200);
  }

  if (location.hash.indexOf("#case-") === 0) {
    var deepId = location.hash.slice(6);
    if (CASE_BY_ID[deepId]) {
      window.setTimeout(function () { openCase(deepId); }, 260);
    }
  }

  /* ------------------------------------------------------------------------
     Hero tilt + reveals + counters
     ------------------------------------------------------------------------ */

  var heroVisual = $("#heroVisual");
  var chipTilt = $("#chipTilt");
  if (heroVisual && chipTilt && window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
    heroVisual.addEventListener("pointermove", function (e) {
      var r = heroVisual.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      chipTilt.style.setProperty("--ry", (x * 8).toFixed(2) + "deg");
      chipTilt.style.setProperty("--rx", (-y * 7).toFixed(2) + "deg");
    });
    heroVisual.addEventListener("pointerleave", function () {
      chipTilt.style.setProperty("--ry", "0deg");
      chipTilt.style.setProperty("--rx", "0deg");
    });
  }

  $$(".section-head, .why-card, .sprint, .method-grid > article").forEach(function (el) {
    el.classList.add("reveal");
  });
  observeReveals();

  var counted = new WeakSet();
  var countObserver = null;
  if ("IntersectionObserver" in window) {
    countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !counted.has(entry.target)) {
          counted.add(entry.target);
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (el) { countObserver.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Feature/step tab keyboard arrows
     ------------------------------------------------------------------------ */

  function tabKeyboard(container, selector, onSelect) {
    container.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
      var tabs = $$(selector, container);
      var current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      e.preventDefault();
      var next = current;
      if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      tabs[next].focus();
      onSelect(Number(tabs[next].getAttribute("data-feature") || tabs[next].getAttribute("data-step")));
    });
  }

  tabKeyboard(featureTabs, ".feature-tab", setFeature);
  tabKeyboard(stepNav, ".step-button", setStep);
})();
