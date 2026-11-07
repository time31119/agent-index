/* ==========================================================================
   Mosaic prototype — interactions + container-query mini screens
   ========================================================================== */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------------------------------------------------
     Mini screen factory
     ------------------------------------------------------------------------ */

  const status = `<div class="ms__status"><span>9:41</span><span class="ms__sig"><i></i><i></i><i></i></span></div>`;

  const layouts = {
    onboard() {
      return `${status}
        <div class="ms__art"><span class="ms__orb"></span><span class="ms__orb ms__orb--2"></span></div>
        <div class="ms__kicker">WELCOME</div>
        <div class="ms__title">A calmer<br>way to build.</div>
        <div class="ms__sub">Small steps. Visible progress. No noise.</div>
        <div class="ms__cta">Get started</div>
        <div class="ms__dots"><i class="on"></i><i></i><i></i></div>`;
    },

    paywall() {
      return `${status}
        <div class="ms__top"><span class="ms__pill">PRO</span><span class="ms__x">×</span></div>
        <div class="ms__title" style="margin-top:2.4cqw">Everything,<br>unlocked.</div>
        <div class="ms__features">
          <div class="ms__feature"><span class="ms__check"></span>Unlimited habits</div>
          <div class="ms__feature"><span class="ms__check"></span>Weekly insights</div>
          <div class="ms__feature"><span class="ms__check"></span>Private by default</div>
        </div>
        <div class="ms__price"><b>$4.99</b><span>/ month</span></div>
        <div class="ms__cta">Start 7-day trial</div>
        <div class="ms__tiny">Cancel anytime · no charge today</div>`;
    },

    home() {
      const bars = [42, 66, 50, 78, 58, 90, 72]
        .map((h) => `<i style="height:${h}%"></i>`)
        .join("");
      const row = `<div class="ms__item"><span class="ms__sq"></span><div class="ms__lines"><span class="ms__line"></span><span class="ms__line ms__line--short"></span></div><span class="ms__chev"></span></div>`;
      return `${status}
        <div class="ms__row"><div><div class="ms__kicker" style="margin-bottom:0.8cqw">FRI, NOV 6</div><div class="ms__h">Morning, Lin</div></div><span class="ms__avatar"></span></div>
        <div class="ms__hero">
          <div class="ms__kicker" style="margin-bottom:0">TODAY</div>
          <div class="ms__big">3<span>/5</span></div>
          <div class="ms__bars">${bars}</div>
        </div>
        <div class="ms__list">${row}${row}${row}</div>`;
    },

    stats() {
      const bars = [46, 72, 58, 88, 64, 92, 78]
        .map((h) => `<i style="height:${h}%"></i>`)
        .join("");
      return `${status}
        <div class="ms__kicker">THIS WEEK</div>
        <div class="ms__title ms__title--sm">You showed up<br>6 of 7 days.</div>
        <div class="ms__bars" style="height:21cqw;margin-top:4.6cqw">${bars}</div>
        <div style="margin-top:4cqw">
          <div class="ms__money"><span>MON</span><b>4 / 5</b></div>
          <div class="ms__money"><span>TUE</span><b>5 / 5</b></div>
          <div class="ms__money"><span>WED</span><b>3 / 5</b></div>
          <div class="ms__money"><span>THU</span><b>4 / 5</b></div>
        </div>`;
    },

    chat() {
      return `${status}
        <div class="ms__row"><div class="ms__h">Ritual AI</div><span class="ms__pill">ONLINE</span></div>
        <div style="display:flex;flex-direction:column;gap:2.2cqw;margin-top:4.4cqw">
          <div class="ms__bubble">How did the run feel today?</div>
          <div class="ms__bubble ms__bubble--me">Easy. 5.2k in 28:40.</div>
          <div class="ms__bubble">Nice. Keep the same pace tomorrow?</div>
        </div>
        <div class="ms__input">Ask anything…</div>`;
    },

    profile() {
      return `${status}
        <div class="ms__pavatar"></div>
        <div class="ms__pname">Lin Chen</div>
        <div class="ms__prole">Since March 2024</div>
        <div class="ms__pstats">
          <div class="ms__pstat"><b>128</b><span>Days</span></div>
          <div class="ms__pstat"><b>12</b><span>Streak</span></div>
          <div class="ms__pstat"><b>86%</b><span>Rate</span></div>
        </div>
        <div class="ms__list">
          <div class="ms__item"><span class="ms__sq"></span><div class="ms__lines"><span class="ms__line"></span><span class="ms__line ms__line--short"></span></div><span class="ms__chev"></span></div>
          <div class="ms__item"><span class="ms__sq"></span><div class="ms__lines"><span class="ms__line"></span><span class="ms__line ms__line--short"></span></div><span class="ms__chev"></span></div>
        </div>`;
    },

    checkout() {
      return `${status}
        <div class="ms__row"><div class="ms__h">Checkout</div><span class="ms__x">×</span></div>
        <div class="ms__photo"></div>
        <div class="ms__money"><span>Ritual Pro · yearly</span><b>$39.99</b></div>
        <div class="ms__money"><span>Tax</span><b>$0.00</b></div>
        <div class="ms__total"><span>Total</span><span>$39.99</span></div>
        <div class="ms__cta" style="margin-top:4cqw">Pay with Apple Pay</div>
        <div class="ms__tiny">Secured by StoreKit 2</div>`;
    },

    map() {
      return `${status}
        <div class="ms__row"><div class="ms__h">Kyoto</div><span class="ms__pill">3 DAYS</span></div>
        <div class="ms__map">
          <span class="ms__pin" style="left:28%;top:40%"></span>
          <span class="ms__pin" style="left:63%;top:23%"></span>
          <div class="ms__sheet">
            <div class="ms__kicker" style="margin:0 0 1cqw">DAY 2</div>
            <div class="ms__h" style="font-size:3.6cqw">Gion → Kiyomizu</div>
            <div class="ms__sub" style="margin-top:1cqw">4 stops · 2.8 km · 1h 20m</div>
          </div>
        </div>`;
    },

    reader() {
      return `${status}
        <div class="ms__kicker">ESSAY · 8 MIN</div>
        <div class="ms__readtitle">The quiet<br>architecture<br>of habit.</div>
        <div class="ms__readmeta">BY LIN CHEN · NOV 2026</div>
        <div class="ms__readimg"></div>
        <div class="ms__readlines"><i></i><i></i><i></i><i></i><i></i></div>`;
    },
  };

  function buildMS(layout, pal) {
    const fn = layouts[layout] || layouts.home;
    return `<div class="ms ms--${layout} p-${pal}">${fn()}</div>`;
  }

  function mountMS(root = document) {
    $$("[data-ms]", root).forEach((node) => {
      if (node.dataset.msMounted) return;
      const [layout, pal] = node.dataset.ms.split(":");
      node.innerHTML = buildMS(layout, pal);
      node.dataset.msMounted = "1";
    });
  }

  /* ------------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------------ */

  const toast = $("#toast");
  const toastText = $("#toastText");
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !message) return;
    toastText.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
  }

  /* ------------------------------------------------------------------------
     Navigation
     ------------------------------------------------------------------------ */

  const navItems = $$(".nav__item");
  const views = $$(".view");

  function go(view) {
    const target = $("#v-" + view);
    if (!target) return;
    views.forEach((v) => v.classList.toggle("active", v === target));
    navItems.forEach((b) => b.classList.toggle("active", b.dataset.nav === view));
    if (view !== "studio") window.scrollTo(0, 0);
    if (view === "studio") mountMS();
    closeDrawer();
  }

  /* ------------------------------------------------------------------------
     Library
     ------------------------------------------------------------------------ */

  const refs = [
    {
      app: "Rise",
      screen: "Onboarding · 01",
      cat: "健康 · 引导",
      tag: "iOS",
      layout: "onboard",
      pal: "lime",
      desc: "单屏价值主张，把品牌语气放在第一屏。大留白、单 CTA，适合需要建立信任的健康类产品。",
      patterns: ["单屏价值主张", "底部单 CTA", "三点进度", "大圆角插画"],
      tags: "ios onboard",
    },
    {
      app: "Northwind",
      screen: "Paywall · Yearly",
      cat: "效率 · 订阅",
      tag: "iOS",
      layout: "paywall",
      pal: "ink",
      desc: "深色付费墙，价格锚定年付。三条价值点、7 天试用、随时取消，信息密度克制。",
      patterns: ["年付默认", "7 天试用", "三条价值点", "深色品牌页"],
      tags: "ios paywall",
    },
    {
      app: "Bloom",
      screen: "Today",
      cat: "健康 · 首页",
      tag: "Android",
      layout: "home",
      pal: "sand",
      desc: "用「大数字 + 周柱状图」代替卡片堆叠，首屏只保留一个核心承诺：今天完成了多少。",
      patterns: ["环形/大数字进度", "周视图", "底部四 Tab", "低饱和纸感"],
      tags: "android home",
    },
    {
      app: "Tally",
      screen: "Insights",
      cat: "财务 · 数据",
      tag: "iOS",
      layout: "stats",
      pal: "blue",
      desc: "把周数据讲成一句话，再用柱状图与逐日列表支撑。适合需要「先结论后细节」的分析页。",
      patterns: ["结论先行", "柱状周视图", "逐日明细", "蓝色单色系"],
      tags: "ios stats",
    },
    {
      app: "Kite",
      screen: "Assistant",
      cat: "AI · 对话",
      tag: "iOS",
      layout: "chat",
      pal: "violet",
      desc: "对话式首页，品牌语气通过气泡与状态标签表达。输入框固定底部，历史消息不超过一屏。",
      patterns: ["对话式入口", "在线状态", "底部输入", "短气泡"],
      tags: "ios chat",
    },
    {
      app: "Morrow",
      screen: "Profile",
      cat: "旅行 · 我的",
      tag: "iOS",
      layout: "profile",
      pal: "coral",
      desc: "把「我是谁」与「我做了什么」压缩在一屏。三个关键数字，下面才是设置入口。",
      patterns: ["头像 + 三指标", "分段统计", "设置列表", "珊瑚强调"],
      tags: "ios profile",
    },
    {
      app: "Ledger",
      screen: "Checkout",
      cat: "财务 · 支付",
      tag: "iOS",
      layout: "checkout",
      pal: "lime",
      desc: "商品、税费、总计三段式，Apple Pay 作为唯一主按钮。避免在支付页出现第二个 CTA。",
      patterns: ["三段式金额", "Apple Pay 优先", "单一主按钮", "安全说明"],
      tags: "ios checkout",
    },
    {
      app: "Atlas",
      screen: "Trip map",
      cat: "出行 · 地图",
      tag: "Android",
      layout: "map",
      pal: "blue",
      desc: "地图占主要面积，底部抽屉承载行程。用两个 pin 建立空间感，不堆叠信息。",
      patterns: ["全屏地图", "底部抽屉", "行程卡片", "双 pin 焦点"],
      tags: "android map",
    },
    {
      app: "Fable",
      screen: "Essay",
      cat: "阅读 · 详情",
      tag: "iOS",
      layout: "reader",
      pal: "sand",
      desc: "杂志式长文排版：衬线标题、窄栏、克制的元信息。适合内容型产品的详情页。",
      patterns: ["衬线标题", "窄栏正文", "元信息等宽", "单图分隔"],
      tags: "ios reader",
    },
    {
      app: "Orbit",
      screen: "Welcome · 03",
      cat: "社交 · 引导",
      tag: "iOS",
      layout: "onboard",
      pal: "coral",
      desc: "用品牌色块替代插画，降低素材成本，同时保持第一屏的辨识度与情绪。",
      patterns: ["色块主视觉", "两行标题", "单 CTA", "进度点"],
      tags: "ios onboard",
    },
    {
      app: "Pulse",
      screen: "Upgrade",
      cat: "健康 · 订阅",
      tag: "iOS",
      layout: "paywall",
      pal: "violet",
      desc: "浅色付费墙，把「为什么值得」放在价格之前。适合客单价较低、决策轻的订阅。",
      patterns: ["浅色付费墙", "价值先于价格", "月付锚点", "试用说明"],
      tags: "ios paywall",
    },
    {
      app: "Studio",
      screen: "Dashboard",
      cat: "创作 · 首页",
      tag: "iOS",
      layout: "home",
      pal: "ink",
      desc: "深色工作台，把最近项目与本周产出放在同一视线。强调「继续」而不是「新建」。",
      patterns: ["深色工作台", "最近项目", "周产出", "单主按钮"],
      tags: "ios home",
    },
    {
      app: "Haven",
      screen: "Account",
      cat: "家居 · 我的",
      tag: "iOS",
      layout: "profile",
      pal: "lime",
      desc: "以家庭成员为核心的头像组，替代传统个人信息页。适合共享型产品。",
      patterns: ["成员头像组", "共享状态", "轻量设置", "青柠强调"],
      tags: "ios profile",
    },
    {
      app: "Drift",
      screen: "Sleep",
      cat: "睡眠 · 数据",
      tag: "iOS",
      layout: "stats",
      pal: "ink",
      desc: "深色数据页，用低对比度柱状图降低夜间使用时的视觉刺激。",
      patterns: ["深色数据页", "低对比图表", "周趋势", "结论句"],
      tags: "ios stats",
    },
    {
      app: "Nook",
      screen: "Order",
      cat: "电商 · 支付",
      tag: "Web",
      layout: "checkout",
      pal: "coral",
      desc: "移动 Web 结算页，保留原生感的底部主按钮与安全提示，减少跨端割裂。",
      patterns: ["移动 Web", "底部固定 CTA", "订单摘要", "安全标识"],
      tags: "web checkout",
    },
  ];

  const libGrid = $("#libGrid");
  let activeFilter = "all";
  let searchTerm = "";

  function shotMarkup(ref, index) {
    return `<article class="shot" data-ref="${index}" data-tags="${ref.tags}">
      <div class="shot__frame">
        ${buildMS(ref.layout, ref.pal)}
        <div class="shot__actions">
          <button type="button" data-apply="${index}">应用到我的 App</button>
          <button type="button" data-open="${index}" aria-label="查看详情"><svg class="i"><use href="#i-eye"/></svg></button>
        </div>
      </div>
      <div class="shot__meta">
        <div><b>${ref.app}</b><span>${ref.screen}</span></div>
        <span class="shot__tag">${ref.tag}</span>
      </div>
    </article>`;
  }

  function renderLibrary() {
    if (!libGrid) return;
    let html = refs.map(shotMarkup).join("");

    // A full-width flow feature after the grid, not a broken masonry gap.
    html += `<article class="shot shot--flow" data-ref="9" data-tags="ios onboard flow">
      <div class="shot__frame">
        <div class="flow__copy">
          <div class="eyebrow">Flow · 6 steps</div>
          <b>Onboarding →<br>First value</b>
          <p>从价值主张到第一个成功时刻。只保留 3 个必要步骤，把权限请求推迟到用户理解价值之后。</p>
          <span class="stat">6 屏 · 42 个参考 · iOS</span>
        </div>
        <div class="flow__rail">
          <div class="flow__phone">${buildMS("onboard", "violet")}</div>
          <div class="flow__phone">${buildMS("home", "violet")}</div>
          <div class="flow__phone">${buildMS("paywall", "violet")}</div>
        </div>
        <div class="shot__actions">
          <button type="button" data-apply="9">应用整个流程</button>
          <button type="button" data-open="9" aria-label="查看流程"><svg class="i"><use href="#i-eye"/></svg></button>
        </div>
      </div>
      <div class="shot__meta">
        <div><b>Orbit · Onboarding flow</b><span>6 步 · 从价值主张到首个成功时刻</span></div>
        <span class="shot__tag">FLOW</span>
      </div>
    </article>`;

    libGrid.innerHTML = html;
    applyFilters();
  }

  function applyFilters() {
    $$(".shot", libGrid).forEach((shot) => {
      const tags = (shot.dataset.tags || "").split(" ");
      const text = shot.textContent.toLowerCase();
      const matchFilter = activeFilter === "all" || tags.includes(activeFilter);
      const matchSearch = !searchTerm || text.includes(searchTerm);
      shot.style.display = matchFilter && matchSearch ? "" : "none";
    });
  }

  /* ------------------------------------------------------------------------
     Drawer
     ------------------------------------------------------------------------ */

  const drawer = $("#drawer");
  const scrim = $("#scrim");
  const drawerTitle = $("#drawerTitle");
  const drawerSub = $("#drawerSub");
  const drawerPreview = $("#drawerPreview");
  const drawerIcon = $("#drawerIcon");
  const drawerApp = $("#drawerApp");
  const drawerScreen = $("#drawerScreen");
  const drawerTags = $("#drawerTags");
  const drawerDesc = $("#drawerDesc");
  const drawerPatterns = $("#drawerPatterns");
  let currentRef = null;

  function openDrawer(index) {
    const ref = refs[index] || refs[0];
    if (!ref) return;
    currentRef = ref;
    drawerTitle.textContent = `${ref.app} · ${ref.screen}`;
    drawerSub.textContent = `${ref.cat} · ${ref.tag} · 2026`;
    drawerPreview.innerHTML = buildMS(ref.layout, ref.pal);
    drawerIcon.textContent = ref.app.charAt(0);
    drawerApp.textContent = ref.app;
    drawerScreen.textContent = `${ref.screen} · ${ref.cat}`;
    drawerTags.innerHTML = ref.patterns
      .map((p) => `<span class="chip" style="height:22px;font-size:9px;padding:0 8px">${p}</span>`)
      .join("");
    drawerDesc.textContent = ref.desc;
    drawerPatterns.innerHTML = ref.patterns
      .map(
        (p, i) =>
          `<div class="pattern-row"><span>${p}</span><b>${String(i + 1).padStart(2, "0")}</b></div>`
      )
      .join("");
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.classList.add("open");
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.classList.remove("open");
  }

  function applyReference() {
    const name = currentRef ? currentRef.app : "参考";
    showToast(`已把 ${name} 的布局与 token 应用到 Ritual，生成 3 个变体。`);
    closeDrawer();
    setTimeout(() => go("studio"), 650);
  }

  /* ------------------------------------------------------------------------
     Command palette
     ------------------------------------------------------------------------ */

  const cmdk = $("#cmdk");
  const cmdkInput = $("#cmdkInput");
  const cmdkItems = $$(".cmdk__item");
  let cmdkIndex = 0;

  function openCmdk() {
    cmdk.classList.add("open");
    cmdkInput.value = "";
    cmdkItems.forEach((it) => (it.style.display = ""));
    cmdkIndex = 0;
    setCmdkActive(0);
    setTimeout(() => cmdkInput.focus(), 30);
  }

  function closeCmdk() {
    cmdk.classList.remove("open");
  }

  function visibleCmdkItems() {
    return cmdkItems.filter((it) => it.style.display !== "none");
  }

  function setCmdkActive(index) {
    const items = visibleCmdkItems();
    if (!items.length) return;
    cmdkIndex = (index + items.length) % items.length;
    items.forEach((it) => it.classList.remove("active"));
    items[cmdkIndex].classList.add("active");
    items[cmdkIndex].scrollIntoView({ block: "nearest" });
  }

  /* ------------------------------------------------------------------------
     Studio tabs
     ------------------------------------------------------------------------ */

  function initStudioTabs() {
    const leftTabs = $$("#leftTabs .seg__item");
    const leftPanes = $$("[data-lpane]");
    leftTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        leftTabs.forEach((t) => t.classList.toggle("active", t === tab));
        leftPanes.forEach((p) => (p.hidden = p.dataset.lpane !== tab.dataset.ltab));
      });
    });

    const rightTabs = $$("#rightTabs .seg__item");
    const rightPanes = $$("[data-rpane]");
    rightTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        rightTabs.forEach((t) => t.classList.toggle("active", t === tab));
        rightPanes.forEach((p) => {
          const isChat = p.dataset.rpane === "chat";
          const show = p.dataset.rpane === tab.dataset.rtab;
          p.hidden = !show;
          p.style.display = show ? (isChat ? "flex" : "block") : "none";
        });
      });
    });

    $$(".screen-row").forEach((row) => {
      row.addEventListener("click", () => {
        $$(".screen-row").forEach((r) => r.classList.toggle("active", r === row));
      });
    });

    $$(".film").forEach((film) => {
      film.addEventListener("click", () => {
        $$(".film").forEach((f) => f.classList.toggle("on", f === film));
      });
    });
  }

  /* ------------------------------------------------------------------------
     Agent composer
     ------------------------------------------------------------------------ */

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function sendAgentMessage() {
    const input = $("#agentPrompt");
    const chat = $('[data-rpane="chat"]');
    if (!input || !chat) return;
    const text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }
    const msg = document.createElement("div");
    msg.className = "msg msg--user";
    msg.innerHTML = `<div class="msg__body">${escapeHtml(text)}</div>`;
    const dna = $(".dna", chat);
    chat.insertBefore(msg, dna || null);
    input.value = "";
    chat.scrollTop = chat.scrollHeight;

    showToast("Designer 正在读取这条反馈…");
    setTimeout(() => {
      const reply = document.createElement("div");
      reply.className = "msg";
      reply.innerHTML = `<div class="msg__avatar"></div><div class="msg__body"><p>收到。我会保留现有排版，只调整你提到的部分，并给出 2 个变体。</p><div class="typing"><i></i><i></i><i></i> <span style="margin-left:4px">生成中</span></div></div>`;
      chat.insertBefore(reply, dna || null);
      chat.scrollTop = chat.scrollHeight;
    }, 700);
  }

  /* ------------------------------------------------------------------------
     Generate flow
     ------------------------------------------------------------------------ */

  function initGenerate() {
    const btn = $("#generate");
    const prompt = $("#prompt");
    if (!btn || !prompt) return;
    const original = btn.innerHTML;
    let running = false;

    function run() {
      if (running) return;
      const text = prompt.value.trim();
      if (!text) {
        prompt.focus();
        showToast("先用一句话描述你想做的 App。");
        return;
      }
      running = true;
      btn.style.pointerEvents = "none";
      btn.innerHTML = "解析意图…";
      setTimeout(() => {
        btn.innerHTML = "规划页面…";
      }, 650);
      setTimeout(() => {
        btn.innerHTML = "生成首屏…";
      }, 1300);
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.pointerEvents = "";
        running = false;
        go("studio");
        showToast("已生成 3 个页面 · 12 个组件 · 用时 87 秒");
      }, 2200);
    }

    btn.addEventListener("click", run);
    prompt.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      }
    });
  }

  /* ------------------------------------------------------------------------
     Events
     ------------------------------------------------------------------------ */

  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      e.preventDefault();
      go(nav.dataset.nav);
      closeCmdk();
      return;
    }

    const toastEl = e.target.closest("[data-toast]");
    if (toastEl) {
      showToast(toastEl.dataset.toast);
      if (toastEl.closest("#cmdk")) closeCmdk();
    }
  });

  // Library interactions (delegated)
  if (libGrid) {
    libGrid.addEventListener("click", (e) => {
      const applyBtn = e.target.closest("[data-apply]");
      if (applyBtn) {
        e.stopPropagation();
        const ref = refs[Number(applyBtn.dataset.apply)] || refs[0];
        currentRef = ref;
        showToast(`已应用 ${ref.app} 的布局与 token，正在生成 3 个变体…`);
        setTimeout(() => go("studio"), 700);
        return;
      }

      const openBtn = e.target.closest("[data-open]");
      if (openBtn) {
        e.stopPropagation();
        openDrawer(Number(openBtn.dataset.open));
        return;
      }

      const shot = e.target.closest(".shot");
      if (shot) {
        openDrawer(Number(shot.dataset.ref) || 0);
      }
    });
  }

  $$(".filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      $$(".filters .chip").forEach((c) => c.classList.toggle("active", c === chip));
      applyFilters();
    });
  });

  const libSearch = $("#libSearch");
  if (libSearch) {
    libSearch.addEventListener("input", () => {
      searchTerm = libSearch.value.trim().toLowerCase();
      applyFilters();
    });
  }

  $("#drawerClose")?.addEventListener("click", closeDrawer);
  scrim?.addEventListener("click", closeDrawer);
  $("#applyRef")?.addEventListener("click", applyReference);

  $("#openCmdk")?.addEventListener("click", openCmdk);
  cmdk?.addEventListener("click", (e) => {
    if (e.target === cmdk) closeCmdk();
  });

  if (cmdkInput) {
    cmdkInput.addEventListener("input", () => {
      const q = cmdkInput.value.trim().toLowerCase();
      cmdkItems.forEach((it) => {
        it.style.display = it.textContent.toLowerCase().includes(q) ? "" : "none";
      });
      setCmdkActive(0);
    });
  }

  $("#agentSend")?.addEventListener("click", sendAgentMessage);
  $("#agentPrompt")?.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      sendAgentMessage();
    }
  });

  $$(".suggest button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = $("#agentPrompt");
      if (input) {
        input.value = btn.textContent.trim();
        input.focus();
      }
    });
  });

  const autoRoute = $("#autoRoute");
  autoRoute?.addEventListener("click", () => {
    const on = autoRoute.getAttribute("aria-pressed") === "true";
    autoRoute.setAttribute("aria-pressed", String(!on));
    const label = autoRoute.querySelector("b");
    if (label) label.textContent = on ? "关闭" : "开启";
    showToast(on ? "自动路由已关闭：将固定使用 Claude Opus 5.5。" : "自动路由已开启：按任务选择最合适的模型。");
  });

  const contrastToggle = $("#contrastToggle");
  contrastToggle?.addEventListener("click", () => {
    const on = document.body.classList.toggle("hc");
    contrastToggle.setAttribute("aria-pressed", String(on));
    showToast(on ? "高对比模式已开启：纯白底、深墨字、更清楚的边界。" : "已恢复标准模式。");
  });

  document.addEventListener("keydown", (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdk.classList.contains("open")) closeCmdk();
      else openCmdk();
      return;
    }
    if (e.key === "Escape") {
      closeCmdk();
      closeDrawer();
      return;
    }
    if (cmdk.classList.contains("open")) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCmdkActive(cmdkIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCmdkActive(cmdkIndex - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const items = visibleCmdkItems();
        items[cmdkIndex]?.click();
      }
    }
  });

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */

  mountMS();
  renderLibrary();
  initStudioTabs();
  initGenerate();

  if (window.location.hash) {
    const view = window.location.hash.replace("#", "");
    if ($("#v-" + view)) go(view);
  }
})();
