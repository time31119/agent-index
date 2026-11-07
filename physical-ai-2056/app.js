/* =========================================================
   PHYSICAL AI 2056 — interactions
   Vanilla JS. No dependencies. All data is local.
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

  /* ---------------------------------------------------------
     Header, progress, navigation
     --------------------------------------------------------- */

  const header = $("[data-header]");
  const progressBar = $("#pageProgress");
  const toTop = $("[data-to-top]");
  const navToggle = $(".nav-toggle");
  const mainNav = $("#mainNav");
  const navLinks = $$("[data-nav]");
  const sections = navLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  let ticking = false;

  function closeMenu() {
    if (!mainNav || !navToggle) return;
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开菜单");
    document.body.classList.remove("is-locked");
  }

  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? clamp(scrollTop / maxScroll, 0, 1) : 0;

    if (header) header.classList.toggle("is-scrolled", scrollTop > 24);
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (toTop) toTop.classList.toggle("is-visible", scrollTop > 700);

    let activeId = "";
    const probe = scrollTop + window.innerHeight * 0.38;
    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top + scrollTop;
      if (top <= probe) activeId = section.id;
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollUI);
    },
    { passive: true }
  );
  updateScrollUI();

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
      document.body.classList.toggle("is-locked", isOpen);
    });

    $$("a", mainNav).forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1020) closeMenu();
    });
  }

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------
     Reveal in view
     --------------------------------------------------------- */

  const revealElements = $$(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-inview"));
  }

  /* ---------------------------------------------------------
     Hero — point-cloud humanoid
     --------------------------------------------------------- */

  function initBodyCanvas() {
    const canvas = $("#bodyCanvas");
    const stage = canvas && canvas.parentElement;
    if (!canvas || !stage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let points = [];
    let rafId = 0;
    let running = false;
    let visible = true;
    let introStart = 0;
    let hasBuilt = false;
    let pointer = null;

    const BONES = [
      { a: [0, -140], b: [0, -116], w: 9 },
      { a: [-42, -110], b: [-76, -48], w: 12 },
      { a: [-76, -48], b: [-88, 28], w: 12 },
      { a: [-88, 28], b: [-92, 56], w: 9 },
      { a: [42, -110], b: [78, -62], w: 12 },
      { a: [78, -62], b: [96, -96], w: 11 },
      { a: [96, -96], b: [108, -124], w: 8 },
      { a: [-20, 42], b: [-24, 122], w: 16 },
      { a: [-24, 122], b: [-28, 196], w: 13 },
      { a: [-28, 196], b: [-40, 208], w: 10 },
      { a: [20, 42], b: [24, 122], w: 16 },
      { a: [24, 122], b: [28, 196], w: 13 },
      { a: [28, 196], b: [40, 208], w: 10 },
    ];

    const JOINTS = [
      [-42, -110], [42, -110],
      [-76, -48], [78, -62],
      [-92, 56], [108, -124],
      [-20, 42], [20, 42],
      [-24, 122], [24, 122],
      [-28, 196], [28, 196],
    ];

    const TORSO = [
      [-44, -120], [44, -120], [36, -48],
      [26, 42], [-26, 42], [-36, -48],
    ];

    const pointInPolygon = (x, y, polygon) => {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    };

    function resize() {
      const rect = stage.getBoundingClientRect();
      const nextWidth = Math.max(1, rect.width);
      const nextHeight = Math.max(1, rect.height);
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      const unchanged =
        points.length > 0 &&
        Math.round(nextWidth) === Math.round(width) &&
        Math.round(nextHeight) === Math.round(height) &&
        nextDpr === dpr;
      if (unchanged) return;

      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      build();
    }

    function build() {
      const scale = Math.min((height * 0.82) / 408, (width * 0.56) / 230);
      const figureHeight = 408 * scale;
      const top = (height - figureHeight) / 2 + height * 0.015;
      const cx = width / 2;
      const toX = (x) => cx + x * scale;
      const toY = (y) => top + (y + 196) * scale;
      const next = [];

      function addPoint(fx, fy, z = 1) {
        const roll = Math.random();
        let color = "236, 232, 222";
        let alpha = 0.2 + Math.random() * 0.26;
        let size = 0.55 + Math.random() * 0.85;

        if (roll < 0.13) {
          color = "255, 90, 31";
          alpha = 0.55 + Math.random() * 0.35;
          size = 0.8 + Math.random() * 1.15;
        } else if (roll < 0.19) {
          color = "255, 196, 107";
          alpha = 0.42 + Math.random() * 0.3;
          size = 0.65 + Math.random() * 0.8;
        }

        alpha = clamp(alpha * z, 0.08, 1);
        const angle = Math.random() * TAU;
        const radius = 70 + Math.random() * 210;

        next.push({
          tx: toX(fx),
          ty: toY(fy),
          ox: Math.cos(angle) * radius,
          oy: Math.sin(angle) * radius,
          color,
          alpha,
          size: size * (0.75 + scale * 0.2),
          phase: Math.random() * TAU,
          twinkle: 0.75 + Math.random() * 0.5,
        });
      }

      // Torso fill.
      for (let i = 0; i < 380; i += 1) {
        let tries = 0;
        while (tries < 20) {
          const x = -46 + Math.random() * 92;
          const y = -122 + Math.random() * 166;
          if (pointInPolygon(x, y, TORSO)) {
            addPoint(x, y, 0.95);
            break;
          }
          tries += 1;
        }
      }

      // Head: rim + interior.
      for (let i = 0; i < 100; i += 1) {
        const angle = Math.random() * TAU;
        const radius = i < 68 ? 24 + Math.random() * 3.5 : Math.sqrt(Math.random()) * 23;
        addPoint(Math.cos(angle) * radius, -168 + Math.sin(angle) * radius, 1.05);
      }

      // Limbs sampled along capsules.
      BONES.forEach((bone) => {
        const [ax, ay] = bone.a;
        const [bx, by] = bone.b;
        const length = Math.hypot(bx - ax, by - ay);
        const count = Math.max(12, Math.round(length * 0.9));
        for (let i = 0; i < count; i += 1) {
          const t = Math.random();
          const spread = Math.sqrt(Math.random()) * bone.w * 0.5;
          const nx = -(by - ay) / (length || 1);
          const ny = (bx - ax) / (length || 1);
          const side = Math.random() < 0.5 ? -1 : 1;
          addPoint(
            ax + (bx - ax) * t + nx * spread * side,
            ay + (by - ay) * t + ny * spread * side,
            0.9
          );
        }
      });

      // Extra density at the hands and shoulders.
      const nodes = [
        [108, -124, 9], [-42, -110, 7], [42, -110, 7], [-92, 56, 7],
      ];
      nodes.forEach(([nx, ny, spread]) => {
        for (let i = 0; i < 26; i += 1) {
          const angle = Math.random() * TAU;
          const radius = Math.sqrt(Math.random()) * spread;
          addPoint(nx + Math.cos(angle) * radius, ny + Math.sin(angle) * radius, 1.2);
        }
      });

      points = next;
      if (!hasBuilt) {
        introStart = performance.now();
        hasBuilt = true;
      }

      if (reducedMotion) drawStatic();
      else {
        draw(performance.now());
        start();
      }
    }

    function drawStatic() {
      draw(performance.now(), 1);
    }

    function draw(now, forceProgress) {
      if (!width || !height) return;
      const progress = forceProgress !== undefined
        ? forceProgress
        : clamp((now - introStart) / 1600, 0, 1);
      const eased = easeOutQuint(progress);
      const time = now * 0.001;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const scale = Math.min((height * 0.82) / 408, (width * 0.56) / 230);
      const figureHeight = 408 * scale;
      const top = (height - figureHeight) / 2 + height * 0.015;
      const cx = width / 2;
      const groundY = top + 404 * scale + 8;

      // Ambient halo behind the body.
      const halo = ctx.createRadialGradient(
        cx, top + 190 * scale, 0,
        cx, top + 190 * scale, Math.max(width, height) * 0.42
      );
      halo.addColorStop(0, "rgba(255, 90, 31, 0.075)");
      halo.addColorStop(0.45, "rgba(255, 90, 31, 0.022)");
      halo.addColorStop(1, "rgba(255, 90, 31, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);

      // Ground contact shadow.
      ctx.save();
      ctx.translate(cx, groundY);
      ctx.scale(1, 0.16);
      const ground = ctx.createRadialGradient(0, 0, 0, 0, 0, 150 * scale);
      ground.addColorStop(0, "rgba(255, 90, 31, 0.16)");
      ground.addColorStop(0.6, "rgba(255, 90, 31, 0.04)");
      ground.addColorStop(1, "rgba(255, 90, 31, 0)");
      ctx.fillStyle = ground;
      ctx.beginPath();
      ctx.arc(0, 0, 150 * scale, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Skeleton / engineering underlay.
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(236, 232, 222, ${0.035 + 0.05 * eased})`;
      BONES.forEach((bone) => {
        ctx.beginPath();
        ctx.moveTo(cx + bone.a[0] * scale, top + (bone.a[1] + 196) * scale);
        ctx.lineTo(cx + bone.b[0] * scale, top + (bone.b[1] + 196) * scale);
        ctx.stroke();
      });

      JOINTS.forEach(([jx, jy]) => {
        const sx = cx + jx * scale;
        const sy = top + (jy + 196) * scale;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1.8, scale * 2.2), 0, TAU);
        ctx.fillStyle = "rgba(255, 90, 31, 0.32)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(5, scale * 7), 0, TAU);
        ctx.strokeStyle = "rgba(255, 90, 31, 0.10)";
        ctx.stroke();
      });

      // Slow scanline.
      const scanY = height * 0.12 + ((time * 17) % (height * 0.76));
      const scanBoost = 26;
      const lineGradient = ctx.createLinearGradient(width * 0.14, 0, width * 0.86, 0);
      lineGradient.addColorStop(0, "rgba(255, 90, 31, 0)");
      lineGradient.addColorStop(0.5, "rgba(255, 90, 31, 0.26)");
      lineGradient.addColorStop(1, "rgba(255, 90, 31, 0)");
      ctx.fillStyle = lineGradient;
      ctx.fillRect(width * 0.14, scanY, width * 0.72, 1);

      // Points.
      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        let x = p.tx + p.ox * (1 - eased);
        let y = p.ty + p.oy * (1 - eased);

        if (reducedMotion || progress >= 1) {
          const wobble = Math.sin(time * 0.9 + p.phase) * 0.85;
          const cross = Math.cos(time * 0.55 + p.phase * 1.7) * 0.55;
          x += wobble;
          y += cross;
        }

        if (pointer) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0.01 && distance < 115) {
            const force = (1 - distance / 115) ** 2;
            x += (dx / distance) * force * 20;
            y += (dy / distance) * force * 20;
          }
        }

        const nearScan = Math.max(0, 1 - Math.abs(y - scanY) / scanBoost);
        const alpha = clamp(p.alpha + nearScan * 0.32, 0, 1);
        const twinkle = 0.78 + Math.sin(time * 1.2 * p.twinkle + p.phase) * 0.22;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, TAU);
        ctx.fillStyle = `rgba(${p.color}, ${alpha * twinkle})`;
        ctx.fill();
      }

      // A bright node at the raised hand, breathing.
      const handX = cx + 108 * scale;
      const handY = top + (-124 + 196) * scale;
      const pulse = (Math.sin(time * 1.5) + 1) / 2;
      ctx.beginPath();
      ctx.arc(handX, handY, 3.2, 0, TAU);
      ctx.fillStyle = "rgba(255, 90, 31, 0.95)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(handX, handY, 8 + pulse * 12, 0, TAU);
      ctx.strokeStyle = `rgba(255, 90, 31, ${0.34 * (1 - pulse) + 0.06})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Faint baseline ticks.
      ctx.strokeStyle = "rgba(236, 232, 222, 0.08)";
      const baseline = top + 404 * scale + 8;
      for (let x = width * 0.16; x < width * 0.84; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, baseline);
        ctx.lineTo(x + 7, baseline);
        ctx.stroke();
      }
    }

    function frame(now) {
      if (!running) return;
      draw(now);
      rafId = window.requestAnimationFrame(frame);
    }

    function start() {
      if (reducedMotion || running || !visible) return;
      running = true;
      rafId = window.requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(rafId);
    }

    stage.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch") return;
        const rect = canvas.getBoundingClientRect();
        pointer = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      },
      { passive: true }
    );

    stage.addEventListener("pointerleave", () => {
      pointer = null;
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    if ("IntersectionObserver" in window) {
      const stageObserver = new IntersectionObserver(
        (entries) => {
          visible = entries[0] ? entries[0].isIntersecting : true;
          if (visible) start();
          else stop();
        },
        { threshold: 0.01 }
      );
      stageObserver.observe(stage);
    }

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(() => {
        resize();
      });
      resizeObserver.observe(stage);
    } else {
      window.addEventListener("resize", resize);
    }

    resize();
  }

  initBodyCanvas();

  /* ---------------------------------------------------------
     Horizon — timeline tabs
     --------------------------------------------------------- */

  const ERA_META = [
    { year: "2026", range: "— 2029", name: "验证期", sub: "Demo 走向工位" },
    { year: "2030", range: "— 2035", name: "规模化前夜", sub: "第一百万台" },
    { year: "2036", range: "— 2042", name: "通用化拐点", sub: "从专用到通用" },
    { year: "2043", range: "— 2049", name: "基础设施化", sub: "机器人成为劳动力" },
    { year: "2050", range: "— 2056", name: "物理世界 OS", sub: "智能成为环境" },
  ];

  function initHorizon() {
    const tabs = $$(".era-tab");
    const panels = $$(".era-panel");
    const fill = $("#railProgress");
    const yearEl = $("#eraYear");
    const rangeEl = $("#eraRange");
    const nameEl = $("#eraName");
    const subEl = $("#eraSub");
    const counterEl = $("#eraCounter");
    if (!tabs.length || !panels.length) return;

    function activate(index, options = {}) {
      const meta = ERA_META[index];
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel, i) => {
        const active = i === index;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
      if (fill) fill.style.width = `${(index / (tabs.length - 1)) * 100}%`;
      if (yearEl) yearEl.textContent = meta.year;
      if (rangeEl) rangeEl.textContent = meta.range;
      if (nameEl) nameEl.textContent = meta.name;
      if (subEl) subEl.textContent = meta.sub;
      if (counterEl) counterEl.textContent = `PHASE ${String(index + 1).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")}`;
      if (options.focus) tabs[index].focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index));
      tab.addEventListener("keydown", (event) => {
        let next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        activate(next, { focus: true });
      });
    });

    activate(0);
  }

  initHorizon();

  /* ---------------------------------------------------------
     Chart helpers
     --------------------------------------------------------- */

  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(name, attrs = {}, text = "") {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    if (text) element.textContent = text;
    return element;
  }

  function smoothPath(points) {
    if (!points.length) return "";
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  }

  function animateNumber(element, from, to, duration = 700) {
    if (!element) return;
    if (reducedMotion) {
      element.textContent = String(to);
      return;
    }
    const start = performance.now();
    const delta = to - from;
    function tick(now) {
      const progress = clamp((now - start) / duration, 0, 1);
      element.textContent = String(Math.round(from + delta * easeOutCubic(progress)));
      if (progress < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------
     Adoption chart
     --------------------------------------------------------- */

  const ADOPTION = [
    { year: 2026, base: 2, prudent: 1 },
    { year: 2028, base: 3.5, prudent: 2 },
    { year: 2030, base: 6, prudent: 3 },
    { year: 2032, base: 10, prudent: 4.5 },
    { year: 2034, base: 15, prudent: 6 },
    { year: 2036, base: 22, prudent: 10 },
    { year: 2038, base: 31, prudent: 14 },
    { year: 2040, base: 41, prudent: 18 },
    { year: 2042, base: 51, prudent: 23 },
    { year: 2044, base: 59, prudent: 28 },
    { year: 2046, base: 67, prudent: 33 },
    { year: 2048, base: 74, prudent: 37 },
    { year: 2050, base: 80, prudent: 41 },
    { year: 2052, base: 85, prudent: 45 },
    { year: 2054, base: 88, prudent: 49 },
    { year: 2056, base: 90, prudent: 55 },
  ];

  function initAdoptionChart() {
    const svg = $("#adoptionChart");
    const wrap = $("#adoptionChartWrap");
    const tooltip = $("#chartTooltip");
    const tooltipYear = $("#tooltipYear");
    const tooltipValue = $("#tooltipValue");
    if (!svg || !wrap) return;

    const W = 900;
    const H = 480;
    const L = 62;
    const R = 26;
    const T = 38;
    const B = 54;
    const PW = W - L - R;
    const PH = H - T - B;
    const x = (year) => L + ((year - 2026) / 30) * PW;
    const y = (value) => T + (1 - value / 100) * PH;

    svg.textContent = "";
    const defs = svgEl("defs");
    const gradient = svgEl("linearGradient", {
      id: "adoptionArea",
      x1: "0", y1: "0", x2: "0", y2: "1",
    });
    gradient.append(
      svgEl("stop", { offset: "0%", "stop-color": "#ff5a1f", "stop-opacity": "0.20" }),
      svgEl("stop", { offset: "100%", "stop-color": "#ff5a1f", "stop-opacity": "0" })
    );
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Horizontal grid + y labels.
    [0, 25, 50, 75, 100].forEach((value) => {
      svg.appendChild(svgEl("line", {
        x1: L, y1: y(value), x2: W - R, y2: y(value), class: "chart-grid",
      }));
      svg.appendChild(svgEl("text", {
        x: L - 12, y: y(value) + 3, class: "chart-axis chart-axis--y",
      }, `${value}%`));
    });

    // Vertical grid + x labels.
    [2026, 2032, 2038, 2044, 2050, 2056].forEach((year) => {
      svg.appendChild(svgEl("line", {
        x1: x(year), y1: T, x2: x(year), y2: H - B, class: "chart-grid",
      }));
      svg.appendChild(svgEl("text", {
        x: x(year), y: H - 26, "text-anchor": year === 2026 ? "start" : "middle", class: "chart-axis",
      }, String(year)));
    });

    svg.appendChild(svgEl("text", { x: L, y: 20, class: "chart-axis" }, "任务渗透率 / SHARE OF TASKS"));
    svg.appendChild(svgEl("text", { x: W - R, y: H - 6, "text-anchor": "end", class: "chart-axis" }, "YEAR"));

    // Base area.
    const basePoints = ADOPTION.map((d) => ({ x: x(d.year), y: y(d.base) }));
    const areaD = `${smoothPath(basePoints)} L ${x(2056)} ${H - B} L ${x(2026)} ${H - B} Z`;
    const area = svgEl("path", { d: areaD, fill: "url(#adoptionArea)", opacity: "0" });
    svg.appendChild(area);

    // Prudent line.
    const prudentPoints = ADOPTION.map((d) => ({ x: x(d.year), y: y(d.prudent) }));
    const prudentPath = svgEl("path", {
      d: smoothPath(prudentPoints),
      class: "chart-line chart-line--prudent",
      opacity: "0",
    });
    svg.appendChild(prudentPath);

    // Base line.
    const basePath = svgEl("path", {
      d: smoothPath(basePoints),
      class: "chart-line chart-line--base",
    });
    svg.appendChild(basePath);

    // Inflection markers.
    const markers = [
      { year: 2034, label: "成本拐点 / 2034", offsetY: 58 },
      { year: 2043, label: "通用化拐点 / 2043", offsetY: 92 },
    ];
    const markerGroup = svgEl("g", { opacity: "0" });
    markers.forEach((marker) => {
      const mx = x(marker.year);
      markerGroup.appendChild(svgEl("line", {
        x1: mx, y1: T, x2: mx, y2: H - B, class: "chart-marker",
      }));
      markerGroup.appendChild(svgEl("text", {
        x: mx + 6, y: marker.offsetY, class: "chart-annotation",
      }, marker.label));
    });
    svg.appendChild(markerGroup);

    // End labels.
    svg.appendChild(svgEl("circle", {
      cx: x(2056), cy: y(90), r: 4, class: "chart-dot",
    }));
    svg.appendChild(svgEl("circle", {
      cx: x(2056), cy: y(55), r: 3.5, class: "chart-dot chart-dot--prudent",
    }));
    svg.appendChild(svgEl("text", {
      x: x(2056) - 10, y: y(90) - 12, "text-anchor": "end", class: "chart-annotation",
    }, "90%"));
    svg.appendChild(svgEl("text", {
      x: x(2056) - 10, y: y(55) - 10, "text-anchor": "end", class: "chart-annotation chart-annotation--muted",
    }, "55%"));

    // Hover interaction.
    const hoverDot = svgEl("circle", {
      r: 4.5, class: "chart-hover-dot", opacity: "0", "pointer-events": "none",
    });
    svg.appendChild(hoverDot);

    const overlay = svgEl("rect", {
      x: L, y: T, width: PW, height: PH, class: "chart-overlay",
    });
    svg.appendChild(overlay);

    function showPoint(index) {
      const point = ADOPTION[index];
      if (!point) return;
      hoverDot.setAttribute("cx", x(point.year));
      hoverDot.setAttribute("cy", y(point.base));
      hoverDot.setAttribute("opacity", "1");
      if (tooltip && tooltipYear && tooltipValue) {
        tooltipYear.textContent = `${point.year} · 基准情景`;
        tooltipValue.textContent = `${point.base}%`;
        tooltip.hidden = false;
        tooltip.style.left = `${(x(point.year) / W) * 100}%`;
        tooltip.style.top = `${(y(point.base) / H) * 100}%`;
      }
    }

    overlay.addEventListener("pointermove", (event) => {
      const rect = svg.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * W;
      const year = 2026 + ((px - L) / PW) * 30;
      let nearest = 0;
      let best = Infinity;
      ADOPTION.forEach((point, index) => {
        const distance = Math.abs(point.year - year);
        if (distance < best) {
          best = distance;
          nearest = index;
        }
      });
      showPoint(nearest);
    });

    overlay.addEventListener("pointerleave", () => {
      hoverDot.setAttribute("opacity", "0");
      if (tooltip) tooltip.hidden = true;
    });

    function animateChart() {
      if (reducedMotion) {
        area.setAttribute("opacity", "1");
        prudentPath.setAttribute("opacity", "1");
        markerGroup.setAttribute("opacity", "1");
        return;
      }
      const length = basePath.getTotalLength();
      basePath.style.strokeDasharray = String(length);
      basePath.style.strokeDashoffset = String(length);
      basePath.style.transition = "stroke-dashoffset 1.9s cubic-bezier(0.22, 1, 0.36, 1)";
      prudentPath.style.transition = "opacity 1.2s ease 0.35s";
      area.style.transition = "opacity 1.4s ease 0.2s";
      markerGroup.style.transition = "opacity 0.8s ease 0.9s";
      window.requestAnimationFrame(() => {
        basePath.style.strokeDashoffset = "0";
        prudentPath.setAttribute("opacity", "1");
        area.setAttribute("opacity", "1");
        markerGroup.setAttribute("opacity", "1");
      });
    }

    if ("IntersectionObserver" in window && !reducedMotion) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateChart();
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.2 });
      observer.observe(wrap);
    } else {
      animateChart();
    }
  }

  initAdoptionChart();

  /* ---------------------------------------------------------
     Value chain tabs
     --------------------------------------------------------- */

  function initChainTabs() {
    const tabs = $$(".chain-item");
    const panels = $$(".chain-panel");
    if (!tabs.length || !panels.length) return;

    function activate(index, options = {}) {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel, i) => {
        panel.hidden = i !== index;
        panel.classList.toggle("is-active", i === index);
      });
      if (options.focus) tabs[index].focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index));
      tab.addEventListener("keydown", (event) => {
        let next = null;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        activate(next, { focus: true });
      });
    });

    activate(0);
  }

  initChainTabs();

  $$("[data-chain-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.chainJump);
      const tab = $$(".chain-item")[index];
      const section = $("#chain");
      if (tab) tab.click();
      if (section) {
        section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  /* ---------------------------------------------------------
     Opportunity filters
     --------------------------------------------------------- */

  function initOpportunityFilters() {
    const buttons = $$(".filter-btn");
    const cards = $$(".opp");
    const count = $("#oppCount");
    if (!buttons.length || !cards.length) return;

    function apply(filter) {
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.window === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) visible += 1;
      });
      buttons.forEach((button) => {
        const active = button.dataset.filter === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (count) count.textContent = `${String(visible).padStart(2, "0")} 个方向`;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => apply(button.dataset.filter));
    });

    apply("all");
  }

  initOpportunityFilters();

  /* ---------------------------------------------------------
     Capital clock
     --------------------------------------------------------- */

  const CAPITAL_PHASES = [
    {
      span: "2026—2029",
      name: "基础设施军备期",
      desc: "资本追逐确定性稀缺：先进制程、GPU、电力、精密执行器与传感器。订单与产能，比故事更值钱。",
      tags: ["算力芯片", "电力与散热", "精密零部件", "工业软件"],
      exit: "战略并购；芯片与零部件 IPO",
      signal: "资本开支、在手订单、毛利率",
      alloc: [45, 22, 20, 13],
    },
    {
      span: "2029—2034",
      name: "量产验证期",
      desc: "估值从“技术可能性”切换到“单机经济模型”。能交付、能运维、能复购的公司，才拿得到下一轮。",
      tags: ["人形本体", "灵巧手", "Robotaxi", "RaaS"],
      exit: "港股 / 美股 IPO；产业资本并购",
      signal: "BOM、MTBF、车队利用率",
      alloc: [35, 20, 28, 17],
    },
    {
      span: "2034—2043",
      name: "平台整合期",
      desc: "基础模型、机器人 OS、调度网络开始赢家通吃。资本从单点下注转向平台、生态与数据资产。",
      tags: ["基础模型", "机器人 OS", "调度网络", "数据平台"],
      exit: "平台 IPO；二级份额；战略换股",
      signal: "开发者数量、抽成率、跨本体迁移",
      alloc: [25, 18, 32, 25],
    },
    {
      span: "2043—2056",
      name: "基础设施成熟期",
      desc: "物理 AI 成为基础设施，回报来自利用率、维护、保险与资产证券化，而不是估值扩张。",
      tags: ["能源与运维", "机器人保险", "资产平台", "标准与协议"],
      exit: "基础设施基金；REITs；项目债；分红",
      signal: "正常运行时间、单任务成本、监管框架",
      alloc: [30, 10, 25, 35],
    },
  ];

  function initCapitalClock() {
    const tabs = $$(".clock-tab");
    const panel = $("#capitalPanel");
    if (!tabs.length || !panel) return;

    const kickerEl = $("#capitalKicker");
    const nameEl = $("#capitalName");
    const descEl = $("#capitalDesc");
    const tagsEl = $("#capitalTags");
    const exitEl = $("#capitalExit");
    const signalEl = $("#capitalSignal");
    const values = $$("[data-alloc-value]");
    const bars = $$("[data-alloc-bar]");

    function activate(index, options = {}) {
      const phase = CAPITAL_PHASES[index];
      if (!phase) return;

      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });

      panel.setAttribute("aria-labelledby", tabs[index].id);
      if (kickerEl) kickerEl.textContent = `PHASE ${String(index + 1).padStart(2, "0")} / 04 · ${phase.span}`;
      if (nameEl) nameEl.textContent = phase.name;
      if (descEl) descEl.textContent = phase.desc;
      if (exitEl) exitEl.textContent = phase.exit;
      if (signalEl) signalEl.textContent = phase.signal;
      if (tagsEl) tagsEl.innerHTML = phase.tags.map((tag) => `<span>${tag}</span>`).join("");

      values.forEach((el, i) => {
        el.textContent = `${phase.alloc[i]}%`;
      });
      bars.forEach((el, i) => {
        el.style.setProperty("--v", `${phase.alloc[i]}%`);
      });

      if (options.focus) tabs[index].focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index));
      tab.addEventListener("keydown", (event) => {
        let next = null;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        activate(next, { focus: true });
      });
    });

    activate(0);
  }

  initCapitalClock();

  /* ---------------------------------------------------------
     Global capital map
     --------------------------------------------------------- */

  const LAND = [
    [[-168, 65], [-160, 71], [-140, 70], [-125, 70], [-110, 73], [-95, 72], [-82, 68], [-64, 60], [-55, 50], [-66, 47], [-70, 42], [-75, 35], [-81, 25], [-90, 29], [-97, 26], [-106, 31], [-117, 32], [-124, 40], [-130, 50], [-140, 58], [-155, 60]],
    [[-92, 15], [-83, 8], [-77, 8], [-83, 15]],
    [[-81, 12], [-75, 10], [-60, 5], [-50, 0], [-35, -6], [-38, -15], [-48, -25], [-58, -35], [-66, -45], [-72, -53], [-75, -45], [-72, -32], [-70, -20], [-78, -5], [-80, 5]],
    [[-10, 36], [-5, 43], [0, 49], [2, 58], [8, 62], [15, 68], [25, 70], [35, 66], [40, 58], [35, 50], [28, 45], [20, 40], [10, 37], [0, 36]],
    [[-17, 15], [-5, 20], [10, 32], [25, 32], [35, 30], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [25, -34], [18, -34], [12, -18], [8, -5], [0, 5], [-10, 5]],
    [[35, 30], [45, 30], [58, 25], [52, 12], [45, 12], [40, 20]],
    [[68, 24], [80, 24], [88, 22], [80, 8], [72, 12], [68, 24]],
    [[35, 65], [50, 70], [70, 75], [90, 78], [110, 75], [130, 72], [150, 70], [170, 66], [180, 62], [170, 55], [160, 50], [145, 45], [140, 40], [130, 35], [122, 30], [120, 22], [110, 18], [105, 10], [100, 5], [95, 8], [88, 20], [80, 8], [72, 20], [62, 25], [55, 30], [45, 35], [40, 45], [35, 55]],
    [[95, 5], [105, -5], [115, -8], [130, -5], [140, -8], [120, -10], [100, 0]],
    [[113, -22], [122, -18], [130, -12], [142, -11], [150, -22], [153, -28], [150, -38], [140, -38], [130, -32], [118, -34], [113, -26]],
    [[130, 32], [136, 35], [141, 40], [145, 44], [142, 36], [136, 33]],
    [[-6, 50], [-2, 58], [0, 54], [-4, 50]],
    [[-45, 60], [-30, 68], [-20, 78], [-35, 83], [-55, 80], [-58, 70]],
    [[43, -12], [50, -15], [48, -25], [44, -22]],
    [[166, -35], [175, -38], [178, -47], [170, -45]],
  ];

  const MAP_NODES = [
    { id: "us", label: "US", sub: "SF · SEA · BOS", lon: -100, lat: 39, dx: -14, dy: -18, anchor: "end" },
    { id: "cn", label: "CN", sub: "SZX · HGH · SHA", lon: 112, lat: 31, dx: 12, dy: -14, anchor: "start" },
    { id: "eu", label: "EU", sub: "LON · BER · PAR", lon: 12, lat: 51, dx: 10, dy: -18, anchor: "start" },
    { id: "jpkr", label: "JP · KR", sub: "TYO · SEL", lon: 138, lat: 37, dx: 8, dy: 28, anchor: "start" },
    { id: "me", label: "ME", sub: "RUH · DXB", lon: 47, lat: 24, dx: -10, dy: 22, anchor: "end" },
    { id: "insea", label: "IN · SEA", sub: "BLR · SGP", lon: 80, lat: 14, dx: 10, dy: 26, anchor: "start" },
  ];

  function initCapitalMap() {
    const svg = $("#capitalMapSvg");
    if (!svg) return;

    const W = 900;
    const H = 470;
    const PAD = 10;
    const px = (lon) => PAD + ((lon + 180) / 360) * (W - PAD * 2);
    const py = (lat) => PAD + ((90 - lat) / 180) * (H - PAD * 2);

    function inPolygon(lon, lat, polygon) {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    }

    svg.textContent = "";

    const gridGroup = svgEl("g");
    [-60, -30, 0, 30, 60].forEach((lat) => {
      gridGroup.appendChild(svgEl("line", {
        x1: px(-180), y1: py(lat), x2: px(180), y2: py(lat), class: "map-grid-line",
      }));
    });
    [-180, -120, -60, 0, 60, 120, 180].forEach((lon) => {
      gridGroup.appendChild(svgEl("line", {
        x1: px(lon), y1: py(90), x2: px(lon), y2: py(-90), class: "map-grid-line",
      }));
    });
    svg.appendChild(gridGroup);

    const dotGroup = svgEl("g");
    const step = 6.4;
    for (let y = PAD; y < H - PAD; y += step) {
      for (let x = PAD; x < W - PAD; x += step) {
        const lon = ((x - PAD) / (W - PAD * 2)) * 360 - 180;
        const lat = 90 - ((y - PAD) / (H - PAD * 2)) * 180;
        if (LAND.some((polygon) => inPolygon(lon, lat, polygon))) {
          dotGroup.appendChild(svgEl("circle", { cx: x, cy: y, r: 1.35, class: "map-dot" }));
        }
      }
    }
    svg.appendChild(dotGroup);

    const nodeById = new Map(MAP_NODES.map((node) => [node.id, node]));
    const arcGroup = svgEl("g");
    [
      ["us", "eu"], ["eu", "me"], ["me", "insea"], ["insea", "cn"], ["cn", "jpkr"],
    ].forEach(([fromId, toId]) => {
      const from = nodeById.get(fromId);
      const to = nodeById.get(toId);
      if (!from || !to) return;
      const x1 = px(from.lon);
      const y1 = py(from.lat);
      const x2 = px(to.lon);
      const y2 = py(to.lat);
      const midX = (x1 + x2) / 2;
      const midY = Math.min(y1, y2) - 48;
      arcGroup.appendChild(svgEl("path", {
        d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
        class: "map-arc",
      }));
    });
    svg.appendChild(arcGroup);

    const nodeGroup = svgEl("g");
    MAP_NODES.forEach((node) => {
      const cx = px(node.lon);
      const cy = py(node.lat);
      const group = svgEl("g", { class: "map-node", "data-node": node.id });
      group.appendChild(svgEl("circle", { cx, cy, r: 11, class: "map-node-ring" }));
      group.appendChild(svgEl("circle", { cx, cy, r: 3.8, class: "map-node-core" }));
      group.appendChild(svgEl("text", {
        x: cx + node.dx, y: cy + node.dy, "text-anchor": node.anchor, class: "map-node-label",
      }, node.label));
      group.appendChild(svgEl("text", {
        x: cx + node.dx, y: cy + node.dy + 12, "text-anchor": node.anchor, class: "map-node-sub",
      }, node.sub));
      nodeGroup.appendChild(group);
    });
    svg.appendChild(nodeGroup);

    const cards = $$(".region-card");
    cards.forEach((card) => {
      const node = svg.querySelector(`[data-node="${card.dataset.region}"]`);
      if (!node) return;
      card.addEventListener("pointerenter", () => {
        node.classList.add("is-lit");
        card.classList.add("is-lit");
      });
      card.addEventListener("pointerleave", () => {
        node.classList.remove("is-lit");
        card.classList.remove("is-lit");
      });
    });
  }

  initCapitalMap();

  /* ---------------------------------------------------------
     Scenarios
     --------------------------------------------------------- */

  const SCENARIOS = {
    prudent: {
      kicker: "SCENARIO A / PRUDENT",
      name: "工具化：更强的自动化，而不是通用机器人",
      lede: "物理 AI 被封装进产线、仓库、矿区与农场。每一台机器都为明确任务而生，ROI 是唯一的通行证。",
      premises: ["硬件成本下降缓慢", "安全法规趋严", "家庭场景渗透有限"],
      risk: "碎片化市场，难以形成平台型巨头。",
      stats: { value: 5, installed: 2, autonomy: 35, units: 300 },
      adoption: [1, 2, 3, 4.5, 6, 8, 11, 15, 20, 26, 31, 36, 41, 45, 49, 55],
      color: "#8b8880",
    },
    base: {
      kicker: "SCENARIO B / BASE CASE",
      name: "基础设施化：机器人成为新的公共运力",
      lede: "2030 年代跨过成本拐点，2040 年代进入家庭与城市。物理 AI 像电力一样，成为看不见的基础设施。",
      premises: ["世界模型显著降低数据成本", "执行器与传感器年降 8—12%", "安全标准在 2032 年前落地"],
      risk: "算力与能源约束，以及责任界定滞后。",
      stats: { value: 12, installed: 8, autonomy: 60, units: 650 },
      adoption: [2, 3.5, 6, 10, 15, 22, 31, 41, 51, 59, 67, 74, 80, 85, 88, 90],
      color: "#ff5a1f",
    },
    bold: {
      kicker: "SCENARIO C / BOLD",
      name: "通用化：一种新的劳动力",
      lede: "单一基础模型跨本体迁移，机器人从专用设备变成通用劳动力。生产、照护、建造与服务同时被重写。",
      premises: ["具身模型出现规模定律", "灵巧手与电池突破", "社会接受度快速提升"],
      risk: "就业冲击与治理真空，可能引发强烈反弹。",
      stats: { value: 28, installed: 20, autonomy: 85, units: 1200 },
      adoption: [3, 6, 12, 22, 35, 48, 60, 70, 78, 85, 90, 94, 97, 98, 99, 99],
      color: "#ffc46b",
    },
  };

  function initScenarios() {
    const buttons = $$(".scenario-btn");
    const nameEl = $("#scenarioName");
    const kickerEl = $("#scenarioKicker");
    const ledeEl = $("#scenarioLede");
    const premisesEl = $("#scenarioPremises");
    const riskEl = $("#scenarioRisk");
    const stats = $$("[data-stat]");
    const legendItems = $$("[data-legend]");
    const chart = $("#scenarioChart");
    if (!buttons.length || !chart) return;

    const W = 900;
    const H = 420;
    const L = 58;
    const R = 56;
    const T = 30;
    const B = 46;
    const PW = W - L - R;
    const PH = H - T - B;
    const x = (year) => L + ((year - 2026) / 30) * PW;
    const y = (value) => T + (1 - value / 100) * PH;
    const years = Array.from({ length: 16 }, (_, i) => 2026 + i * 2);

    chart.textContent = "";

    [0, 25, 50, 75, 100].forEach((value) => {
      chart.appendChild(svgEl("line", {
        x1: L, y1: y(value), x2: W - R, y2: y(value), class: "sc-grid",
      }));
      chart.appendChild(svgEl("text", {
        x: L - 12, y: y(value) + 3, "text-anchor": "end", class: "sc-axis",
      }, `${value}%`));
    });

    [2026, 2032, 2038, 2044, 2050, 2056].forEach((year) => {
      chart.appendChild(svgEl("line", {
        x1: x(year), y1: T, x2: x(year), y2: H - B, class: "sc-grid",
      }));
      chart.appendChild(svgEl("text", {
        x: x(year), y: H - 22, "text-anchor": year === 2026 ? "start" : "middle", class: "sc-axis",
      }, String(year)));
    });

    const pathRefs = {};
    Object.entries(SCENARIOS).forEach(([key, scenario]) => {
      const points = scenario.adoption.map((value, index) => ({
        x: x(years[index]),
        y: y(value),
      }));
      const path = svgEl("path", {
        d: smoothPath(points),
        class: `sc-path sc-path--${key}`,
        "data-key": key,
      });
      chart.appendChild(path);
      pathRefs[key] = path;

      const endValue = scenario.adoption[scenario.adoption.length - 1];
      const label = svgEl("text", {
        x: x(2056) - 8,
        y: y(endValue) - 10,
        "text-anchor": "end",
        class: "sc-end-label",
        "data-key": key,
      }, `${endValue}%`);
      chart.appendChild(label);
      pathRefs[`${key}-label`] = label;
    });

    // Initial states.
    const current = { value: 12, installed: 8, autonomy: 60, units: 650 };

    function setActive(key, animate = true) {
      const scenario = SCENARIOS[key];
      if (!scenario) return;

      buttons.forEach((button) => {
        const active = button.dataset.scenario === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      if (kickerEl) kickerEl.textContent = scenario.kicker;
      if (nameEl) nameEl.textContent = scenario.name;
      if (ledeEl) ledeEl.textContent = scenario.lede;
      if (riskEl) riskEl.innerHTML = `<b>最大风险</b>${scenario.risk}`;
      if (premisesEl) {
        premisesEl.innerHTML = scenario.premises.map((item) => `<li>${item}</li>`).join("");
      }

      stats.forEach((stat) => {
        const statKey = stat.dataset.stat;
        const target = scenario.stats[statKey];
        if (!statKey || typeof target !== "number") return;
        const from = animate ? current[statKey] : target;
        if (animate) animateNumber(stat, from, target, 650);
        else stat.textContent = String(target);
        current[statKey] = target;
        stat.classList.remove("is-changing");
        void stat.offsetWidth;
        stat.classList.add("is-changing");
      });

      Object.entries(SCENARIOS).forEach(([scenarioKey]) => {
        pathRefs[scenarioKey].classList.toggle("is-active", scenarioKey === key);
        pathRefs[`${scenarioKey}-label`].classList.toggle("is-active", scenarioKey === key);
      });
      legendItems.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.legend === key);
      });
      $$("[data-sm]").forEach((row) => {
        row.classList.toggle("is-active", row.dataset.sm === key);
      });
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => setActive(button.dataset.scenario));
    });

    setActive("base", false);
  }

  initScenarios();

  /* ---------------------------------------------------------
     Keyboard-friendly details and anchor offset
     --------------------------------------------------------- */

  $$("details.risk").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      $$("details.risk").forEach((other) => {
        if (other !== detail && other.open) other.open = false;
      });
    });
  });
})();
