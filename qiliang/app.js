/* =========================================================
   起量 QILIANG — prototype interactions
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    page: "dashboard",
    goal: "到店转化",
    step: 3,
    timeline: false,
    playing: false,
    toastTimer: null,
    genTimers: [],
    publishTimers: []
  };

  const pageTitles = {
    dashboard: "工作台",
    studio: "创作台",
    radar: "选题雷达",
    templates: "模板",
    publish: "发布中心",
    analytics: "数据复盘",
    library: "素材与声音"
  };

  const stepDetails = {
    1: `
      <div class="step-detail-head"><h3>创意方向</h3><span class="badge badge-accent">推荐 1</span></div>
      <p>三个方向都基于同一个真实事实：12 年、3 样菜、天天排队。区别是切入角度。</p>
      <button class="mini-option selected" type="button" data-choice="反常识">
        <span class="radio"></span>
        <span><strong>反常识：12 年只卖 3 样菜</strong><span>钩子最强，适合视频号与抖音</span></span>
      </button>
      <button class="mini-option" type="button" data-choice="老板口述">
        <span class="radio"></span>
        <span><strong>老板口述：多的我也做不过来</strong><span>真实感最强，适合视频号</span></span>
      </button>
      <button class="mini-option" type="button" data-choice="算账">
        <span class="radio"></span>
        <span><strong>算账：3 样菜如何撑起一家店</strong><span>信息密度高，适合抖音</span></span>
      </button>
      <button class="btn btn-ghost btn-sm btn-block" type="button" data-action="refresh-ideas" style="margin-top:10px">换一批方向</button>
    `,
    2: `
      <div class="step-detail-head"><h3>脚本口播</h3><span class="badge">86 字 · 28s</span></div>
      <p>口语化、短句、留停顿。不写「欢迎光临」，直接进冲突。</p>
      <ul class="detail-list">
        <li><strong style="font-family:var(--font-mono);font-size:9px;color:var(--accent-deep)">0–2s</strong> 在杭州，有一家店，菜单上只有 3 样菜。</li>
        <li><strong style="font-family:var(--font-mono);font-size:9px;color:var(--accent-deep)">2–8s</strong> 却开了 12 年，每天排队。</li>
        <li><strong style="font-family:var(--font-mono);font-size:9px;color:var(--accent-deep)">8–18s</strong> 老板说，不是不想加，是加了他也做不好。</li>
        <li><strong style="font-family:var(--font-mono);font-size:9px;color:var(--accent-deep)">18–25s</strong> 一荤一素一汤，28 块。</li>
        <li><strong style="font-family:var(--font-mono);font-size:9px;color:var(--accent-deep)">25–30s</strong> 地址在拱墅，晚上 7 点后别来，卖完了。</li>
      </ul>
      <button class="btn btn-ghost btn-sm btn-block" type="button" data-action="rewrite-script" style="margin-top:10px">让导演再改一版</button>
    `,
    3: `
      <div class="step-detail-head"><h3>分镜画面</h3><span class="badge">5 镜</span></div>
      <p>真实感优先。前 2 秒用门头 + 大字钩子，第 3 镜保留老板炒菜的环境声。</p>
      <ul class="detail-list">
        <li>第 1 镜 0–3s：门头推近，字幕「只卖 3 样菜」</li>
        <li>第 2 镜 3–6s：菜单特写，只拍 3 个菜名</li>
        <li>第 3 镜 6–12s：老板炒菜，保留锅气声</li>
        <li>第 4 镜 12–20s：菜品上桌，暖色近景</li>
        <li>第 5 镜 20–30s：客人反应 + 地址口播</li>
      </ul>
      <div class="row gap-6" style="margin-top:10px">
        <button class="btn btn-dark btn-sm" type="button" data-action="gen-shots"><svg class="ic ic-sm"><use href="#i-sparkles"/></svg> 补齐 2 个镜头</button>
        <button class="btn btn-ghost btn-sm" type="button" data-action="swap-shots">换一套分镜</button>
      </div>
    `,
    4: `
      <div class="step-detail-head"><h3>配音字幕</h3><span class="badge">3 个候选</span></div>
      <p>先选声音，再微调语速。字幕按语义断句，不按字数硬切。</p>
      <button class="mini-option selected" type="button" data-choice="老板娘">
        <span class="radio"></span>
        <span><strong>老板娘 · 自然女声</strong><span>温暖、克制、杭州口音轻微 · 推荐</span></span>
      </button>
      <button class="mini-option" type="button" data-choice="老板">
        <span class="radio"></span>
        <span><strong>老板 · 低沉男声</strong><span>真实、慢速、适合口述</span></span>
      </button>
      <div class="voice-wave" aria-hidden="true">
        <i style="height:20%"></i><i style="height:44%"></i><i style="height:68%"></i><i style="height:38%"></i><i style="height:82%"></i><i style="height:56%"></i><i style="height:30%"></i><i style="height:74%"></i><i style="height:48%"></i><i style="height:88%"></i><i style="height:40%"></i><i style="height:62%"></i><i style="height:26%"></i><i style="height:70%"></i><i style="height:50%"></i><i style="height:34%"></i><i style="height:78%"></i><i style="height:46%"></i><i style="height:60%"></i><i style="height:28%"></i>
      </div>
      <div class="row between" style="margin-top:8px">
        <span class="mono" style="font-size:8px;color:var(--muted)">语速 1.0x · 停顿自然</span>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="试听：老板娘 · 自然女声">试听</button>
      </div>
      <button class="btn btn-dark btn-sm btn-block" type="button" data-action="regen-voice" style="margin-top:10px">重新生成配音</button>
    `,
    5: `
      <div class="step-detail-head"><h3>成片与适配</h3><span class="badge badge-ok">已生成</span></div>
      <p>一条母版，三平台原生版本。不是简单裁切，标题、封面、字幕断句都会重排。</p>
      <ul class="detail-list">
        <li>抖音：9:16 · 28s · 强钩子 · 话题 3 个</li>
        <li>视频号：9:16 · 30s · 标题重写 · 保留地址</li>
        <li>小红书：3:4 封面 + 9:16 视频 · 正文 SEO</li>
      </ul>
      <div class="render-state">
        <div class="row between"><span>1080P 渲染</span><span class="mono">100%</span></div>
        <div class="progress lime" style="margin-top:5px"><i style="width:100%"></i></div>
      </div>
      <button class="btn btn-primary btn-sm btn-block" type="button" data-modal="publish" style="margin-top:10px">去发布</button>
    `
  };

  /* -------------------------------------------------------
     Toast
     ------------------------------------------------------- */
  function toast(message) {
    const el = $("#toast");
    const text = $("#toastText");
    if (!el || !text) return;
    text.textContent = message;
    el.classList.add("show");
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      el.classList.remove("show");
    }, 2800);
  }

  /* -------------------------------------------------------
     Navigation
     ------------------------------------------------------- */
  function go(page) {
    if (!pageTitles[page]) return;
    state.page = page;

    $$(".page").forEach((el) => {
      el.classList.toggle("active", el.id === "page-" + page);
    });

    $$(".nav-item[data-page]").forEach((el) => {
      el.classList.toggle("active", el.dataset.page === page);
    });

    const crumb = $("#crumbPage");
    if (crumb) crumb.textContent = pageTitles[page];

    if (window.location.protocol !== "file:" && window.history && window.history.replaceState) {
      try {
        window.history.replaceState(null, "", "#page-" + page);
      } catch (error) {
        // Some embedded browsers disallow history updates; navigation still works.
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    closeSidebar();
  }

  function openSidebar() {
    $("#sidebar")?.classList.add("open");
    $("#sidebarScrim")?.classList.add("open");
  }

  function closeSidebar() {
    $("#sidebar")?.classList.remove("open");
    $("#sidebarScrim")?.classList.remove("open");
  }

  /* -------------------------------------------------------
     Modal system
     ------------------------------------------------------- */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    closeSidebar();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (id === "commandModal") {
      const input = $("#commandInput");
      if (input) input.value = "";
      $$("#commandList .command-item").forEach((el) => { el.style.display = ""; });
      window.setTimeout(() => $("#commandInput")?.focus(), 60);
    }
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal-backdrop.open")) {
      document.body.style.overflow = "";
    }
  }

  function closeAllModals() {
    $$(".modal-backdrop.open").forEach(closeModal);
    clearGenTimers();
    clearPublishTimers();
  }

  /* -------------------------------------------------------
     Studio step details
     ------------------------------------------------------- */
  function setStep(step) {
    state.step = step;

    $$("#stepList .step-item").forEach((el) => {
      const n = Number(el.dataset.step);
      el.classList.toggle("active", n === step);
      el.classList.toggle("done", n < step);
      const icon = $(".step-check", el);
      if (icon) {
        icon.innerHTML = n < step
          ? '<use href="#i-check"/>'
          : '<use href="#i-chevron-right"/>';
      }
    });

    $$("#stageSteps .stage-step").forEach((el) => {
      const n = Number(el.dataset.step);
      el.classList.toggle("current", n === step);
      el.classList.toggle("done", n < step);
    });

    const detail = $("#stepDetail");
    if (detail) {
      detail.innerHTML = stepDetails[step] || stepDetails[3];
      detail.classList.remove("fade-up");
      // Force reflow so the animation can replay.
      void detail.offsetWidth;
      detail.classList.add("fade-up");
    }
  }

  /* -------------------------------------------------------
     Studio timeline / preview
     ------------------------------------------------------- */
  function toggleTimeline() {
    state.timeline = !state.timeline;
    const timeline = $("#timeline");
    const storyboard = $("#storyboard");
    const btn = $("#toggleTimeline");
    if (timeline) timeline.hidden = !state.timeline;
    if (storyboard) storyboard.hidden = state.timeline;
    if (btn) {
      btn.classList.toggle("btn-ghost", !state.timeline);
      btn.classList.toggle("btn-dark", state.timeline);
      btn.innerHTML = state.timeline
        ? '<svg class="ic ic-sm"><use href="#i-layers"/></svg> 分镜'
        : '<svg class="ic ic-sm"><use href="#i-layers"/></svg> 时间线';
    }
    toast(state.timeline ? "已展开专业时间线，可逐轨调整" : "已切回分镜视图");
  }

  function togglePlay() {
    state.playing = !state.playing;
    const btn = $('[data-action="play"]');
    const bar = $(".poster-progress i");
    if (btn) {
      btn.innerHTML = state.playing
        ? '<svg class="ic ic-sm"><use href="#i-pause"/></svg>'
        : '<svg class="ic ic-sm"><use href="#i-play"/></svg>';
    }
    if (bar) {
      if (state.playing) {
        bar.style.transition = "width 30s linear";
        bar.style.width = "100%";
      } else {
        const current = window.getComputedStyle(bar).width;
        bar.style.transition = "none";
        bar.style.width = current;
      }
    }
    toast(state.playing ? "预览播放中 · 声音已开启" : "已暂停");
  }

  /* -------------------------------------------------------
     Chat
     ------------------------------------------------------- */
  function appendMessage(text, who) {
    const stream = $(".chat-stream");
    if (!stream) return;
    const msg = document.createElement("div");
    msg.className = "msg " + who;
    msg.textContent = text;
    stream.appendChild(msg);
    stream.scrollTop = stream.scrollHeight;
  }

  function directorReply(text) {
    window.setTimeout(() => {
      const replies = [
        "收到。我会保留真实环境声，只把第 4 镜提前 0.8 秒，让转折更利落。",
        "可以。我把这句改成更短的口语，并留一个 0.4 秒的停顿，听起来更像本人。",
        "已生成 2 个版本：一个更克制，一个更有冲突。你可以都看一遍再定。"
      ];
      appendMessage(replies[Math.floor(Math.random() * replies.length)], "ai");
    }, 520);
  }

  function sendDirector() {
    const input = $("#directorInput");
    if (!input) return;
    const value = input.value.trim();
    if (!value) {
      toast("先告诉导演你想改什么，例如「开头再快一点」");
      input.focus();
      return;
    }
    appendMessage(value, "user");
    input.value = "";
    input.style.height = "auto";
    directorReply(value);
  }

  /* -------------------------------------------------------
     Generation modal
     ------------------------------------------------------- */
  function clearGenTimers() {
    state.genTimers.forEach((t) => window.clearTimeout(t));
    state.genTimers = [];
  }

  function resetGeneration() {
    clearGenTimers();
    $$("#genStages .gen-stage").forEach((el) => {
      el.classList.remove("done", "active");
      const icon = $(".gen-icon", el);
      if (icon) icon.innerHTML = '<svg class="ic"><use href="#i-clock"/></svg>';
    });
    const bar = $("#genBar");
    if (bar) bar.style.width = "0%";
    const done = $("#genDone");
    if (done) done.hidden = true;
    const closeBtn = $("#genModal .modal-close");
    if (closeBtn) closeBtn.hidden = false;
  }

  function runGeneration() {
    resetGeneration();
    const stages = $$("#genStages .gen-stage");
    const bar = $("#genBar");
    const done = $("#genDone");
    const durations = [500, 750, 1650, 700];
    let elapsed = 0;

    stages.forEach((stage, i) => {
      const start = window.setTimeout(() => {
        stage.classList.add("active");
        const icon = $(".gen-icon", stage);
        if (icon) icon.innerHTML = '<span class="spinner"></span>';
      }, elapsed);
      state.genTimers.push(start);

      elapsed += durations[i];
      const finish = window.setTimeout(() => {
        stage.classList.remove("active");
        stage.classList.add("done");
        const icon = $(".gen-icon", stage);
        if (icon) icon.innerHTML = '<svg class="ic"><use href="#i-check"/></svg>';
        if (bar) bar.style.width = Math.round(((i + 1) / stages.length) * 100) + "%";
        if (i === stages.length - 1 && done) {
          done.hidden = false;
        }
      }, elapsed);
      state.genTimers.push(finish);
    });
  }

  /* -------------------------------------------------------
     Publish modal
     ------------------------------------------------------- */
  function clearPublishTimers() {
    state.publishTimers.forEach((t) => window.clearTimeout(t));
    state.publishTimers = [];
  }

  function updatePublishSelection() {
    const count = $$(".publish-platform.checked").length;
    const btn = $("#confirmPublish");
    if (btn) {
      btn.textContent = count ? "确认发布 " + count + " 个平台" : "请选择发布平台";
    }
  }

  function resetPublish() {
    clearPublishTimers();
    const form = $("#publishForm");
    const progress = $("#publishProgress");
    if (form) form.hidden = false;
    if (progress) progress.hidden = true;
    $("#publishResult")?.setAttribute("style", "display:none;margin-top:12px");
    const bar = $("#publishBar");
    if (bar) bar.style.width = "0%";
    const openOfficial = $("#openOfficial");
    const done = $("#publishDone");
    if (openOfficial) openOfficial.hidden = true;
    if (done) done.hidden = true;
    $$(".publish-progress-row").forEach((row) => {
      row.hidden = false;
      row.style.opacity = "";
      row.querySelector(".pp-state").textContent = "等待中";
      row.querySelector(".pp-state").className = "pp-state";
      const icon = $(".gen-icon", row);
      if (icon) {
        icon.style.background = "";
        icon.style.color = "";
        icon.innerHTML = '<svg class="ic"><use href="#i-clock"/></svg>';
      }
    });
    $$(".publish-platform").forEach((row) => row.classList.add("checked"));
    updatePublishSelection();
  }

  function runPublish() {
    const checked = $$(".publish-platform.checked");
    if (!checked.length) {
      toast("至少选择一个发布平台");
      return;
    }
    const form = $("#publishForm");
    const progress = $("#publishProgress");
    if (form) form.hidden = true;
    if (progress) progress.hidden = false;

    const rows = $$(".publish-progress-row");
    const bar = $("#publishBar");
    const selectedKeys = checked.map((el) => el.dataset.platformRow);
    const activeRows = rows.filter((row) => selectedKeys.includes(row.dataset.progressRow));

    rows.forEach((row) => {
      const active = selectedKeys.includes(row.dataset.progressRow);
      row.hidden = !active;
    });

    activeRows.forEach((row, i) => {
      const start = window.setTimeout(() => {
        row.querySelector(".pp-state").textContent = "处理中";
        row.querySelector(".pp-state").className = "pp-state warn";
        const icon = $(".gen-icon", row);
        if (icon) icon.innerHTML = '<span class="spinner"></span>';
      }, i * 520);
      state.publishTimers.push(start);

      const finish = window.setTimeout(() => {
        const stateText = row.dataset.progressRow === "douyin" ? "已提交" : "待确认";
        row.querySelector(".pp-state").textContent = stateText;
        row.querySelector(".pp-state").className = "pp-state " + (row.dataset.progressRow === "douyin" ? "ok" : "warn");
        const icon = $(".gen-icon", row);
        if (icon) {
          icon.style.background = row.dataset.progressRow === "douyin" ? "var(--ok-soft)" : "var(--warning-soft)";
          icon.style.color = row.dataset.progressRow === "douyin" ? "var(--ok)" : "var(--warning)";
          icon.innerHTML = '<svg class="ic"><use href="#i-check"/></svg>';
        }
        if (bar) bar.style.width = Math.round(((i + 1) / activeRows.length) * 100) + "%";
      }, i * 520 + 680);
      state.publishTimers.push(finish);
    });

    const total = activeRows.length * 520 + 900;
    const hasDouyin = selectedKeys.includes("douyin");
    const hasSemi = selectedKeys.some((key) => key !== "douyin");
    const finishAll = window.setTimeout(() => {
      const result = $("#publishResult");
      if (result) {
        result.style.display = "block";
        const copy = result.querySelector(".modal-note span");
        if (copy) {
          copy.textContent = hasDouyin && hasSemi
            ? "抖音已进入发布队列。视频号 / 小红书发布包已生成，请在弹出的官方页面完成最后确认。"
            : hasDouyin
              ? "抖音已进入发布队列，可在发布中心查看状态。"
              : "视频号 / 小红书发布包已生成，请打开官方页面完成最后确认。";
        }
      }
      const openOfficial = $("#openOfficial");
      const done = $("#publishDone");
      if (openOfficial) openOfficial.hidden = !hasSemi;
      if (done) done.hidden = false;
      if (bar) bar.style.width = "100%";
    }, total);
    state.publishTimers.push(finishAll);
  }

  /* -------------------------------------------------------
     Radar filtering
     ------------------------------------------------------- */
  let radarPlatform = "all";

  function filterRadar() {
    const query = ($("#radarSearch")?.value || "").trim().toLowerCase();
    $$("#radarGrid .radar-card").forEach((card) => {
      const platformMatch = radarPlatform === "all" || card.dataset.platform === radarPlatform;
      const textMatch = !query || card.textContent.toLowerCase().includes(query);
      card.style.display = platformMatch && textMatch ? "" : "none";
    });
  }

  /* -------------------------------------------------------
     Reference library
     ------------------------------------------------------- */
  let refSource = "all";

  function filterReferences() {
    const query = ($("#refSearch")?.value || "").trim().toLowerCase();
    $$("#refGrid .ref-card").forEach((card) => {
      const sourceMatch = refSource === "all" || card.dataset.source === refSource;
      const textMatch = !query || card.textContent.toLowerCase().includes(query);
      card.style.display = sourceMatch && textMatch ? "" : "none";
    });
  }

  function getRefHost(el) {
    return el.closest("[data-ref-title]");
  }

  function applyReference(host) {
    if (!host) return;
    if (host.dataset.refKind === "paywall") {
      openModal("paywallModal");
      toast("已打开 Paywall 设计参考，可切换月付 / 年付");
      return;
    }
    const title = host.dataset.refTitle || "精选样板";
    const brief = host.dataset.refBrief || "参考这个样板的结构，做一条 30 秒短视频，真实感优先。";
    const input = $("#briefInput");
    if (input) input.value = brief;
    go("studio");
    toast("已套用「" + title + "」的结构，品牌内容已保留");
  }

  function openReferenceDetail(host) {
    if (!host) return;
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value || "—";
    };
    set("refDetailSource", host.dataset.refLabel || "MOBBIN · REFERENCE");
    set("refDetailTitle", host.dataset.refTitle || "样板拆解");
    set("refDetailDesc", host.dataset.refDesc || "先看结构，再决定要不要用。");
    set("refStep1", host.dataset.refStep1 || "第一帧先给结果。");
    set("refStep2", host.dataset.refStep2 || "用证据补齐信息缺口。");
    set("refStep3", host.dataset.refStep3 || "结尾只留一个动作。");
    set("refPattern", host.dataset.refPattern || "Hook-first / 单 CTA");
    set("refPaywall", host.dataset.refPaywall || "在用户看到价值之后收费。");

    const useBtn = $("#refUseBtn");
    if (useBtn) {
      useBtn.dataset.refTitle = host.dataset.refTitle || "";
      useBtn.dataset.refBrief = host.dataset.refBrief || "";
      useBtn.dataset.refKind = host.dataset.refKind || "flow";
      useBtn.textContent = useBtn.dataset.refKind === "paywall" ? "预览 Paywall 设计" : "用这个结构生成";
    }
    openModal("refDetailModal");
  }

  /* -------------------------------------------------------
     Paywall
     ------------------------------------------------------- */
  function setBilling(mode) {
    const annual = mode === "annual";
    $$(".paywall-toggle button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.billing === mode);
    });
    const growth = $("#priceGrowth");
    const brand = $("#priceBrand");
    const growthPeriod = $("#periodGrowth");
    const brandPeriod = $("#periodBrand");
    if (growth) growth.textContent = annual ? "¥559" : "¥699";
    if (brand) brand.textContent = annual ? "¥1,999" : "¥2,499";
    if (growthPeriod) growthPeriod.textContent = annual ? "/月 · 年付 ¥6,710" : "/月";
    if (brandPeriod) brandPeriod.textContent = annual ? "/月 · 年付 ¥23,990" : "/月";
  }

  /* -------------------------------------------------------
     Theme
     ------------------------------------------------------- */
  const THEME_KEY = "qiliang-theme";
  const THEMES = ["paper", "mist", "sand", "sage", "lilac", "sea"];

  function applyTheme(name, persist) {
    const theme = THEMES.includes(name) ? name : "paper";
    THEMES.forEach((t) => document.body.classList.toggle("theme-" + t, t === theme));
    $$(".theme-option").forEach((option) => {
      option.classList.toggle("active", option.dataset.theme === theme);
    });
    if (persist) {
      try {
        window.localStorage.setItem(THEME_KEY, theme);
      } catch (error) {
        // Private mode or file:// restrictions: theme still applies for this session.
      }
    }
  }

  function initTheme() {
    let saved = "paper";
    try {
      saved = window.localStorage.getItem(THEME_KEY) || "paper";
    } catch (error) {
      saved = "paper";
    }
    applyTheme(saved, false);
  }

  /* -------------------------------------------------------
     Boost estimate
     ------------------------------------------------------- */
  function updateBoost(value) {
    const budget = Number(value);
    const low = Math.round(budget * 40 / 1000) / 10;
    const high = Math.round(budget * 80 / 1000) / 10;
    const format = (n) => (n >= 10 ? n.toFixed(0) : n.toFixed(1));
    const label = $("#boostValue");
    const estimate = $("#boostEstimate");
    if (label) label.textContent = "¥" + budget.toLocaleString("zh-CN");
    if (estimate) estimate.textContent = format(low) + "–" + format(high) + " 万";
  }

  /* -------------------------------------------------------
     Global click handling
     ------------------------------------------------------- */
  document.addEventListener("click", (event) => {
    const target = event.target;

    const pageTrigger = target.closest("[data-page]");
    if (pageTrigger) {
      event.preventDefault();
      go(pageTrigger.dataset.page);
      return;
    }

    const modalTrigger = target.closest("[data-modal]");
    if (modalTrigger) {
      event.preventDefault();
      const id = modalTrigger.dataset.modal;
      const modalId = ({
        publish: "publishModal",
        settings: "settingsModal",
        paywall: "paywallModal",
        theme: "themeModal"
      })[id] || id;
      if (id === "publish") resetPublish();
      if (modalId === "genModal") runGeneration();
      openModal(modalId);
      return;
    }

    const closeTrigger = target.closest("[data-close-modal]");
    if (closeTrigger) {
      closeModal(closeTrigger.closest(".modal-backdrop"));
      return;
    }

    const toastTrigger = target.closest("[data-toast]");
    if (toastTrigger) {
      toast(toastTrigger.dataset.toast);
      return;
    }

    const switchTrigger = target.closest("[data-toggle-switch]");
    if (switchTrigger) {
      switchTrigger.classList.toggle("on");
      const on = switchTrigger.classList.contains("on");
      toast(on ? "已开启 AI 生成内容标识" : "已关闭；若检测到 AI 生成画面，发布前会自动恢复标识");
      return;
    }

    const stepTrigger = target.closest("[data-step]");
    if (stepTrigger && (stepTrigger.closest("#stepList") || stepTrigger.closest("#stageSteps"))) {
      setStep(Number(stepTrigger.dataset.step));
      return;
    }

    const actionTrigger = target.closest("[data-action]");
    if (actionTrigger) {
      const action = actionTrigger.dataset.action;
      if (action === "play") togglePlay();
      if (action === "gen-shots") {
        runGeneration();
        openModal("genModal");
      }
      if (action === "swap-shots") toast("已换一套分镜：更偏「人物关系」，少一点菜品特写");
      if (action === "refresh-ideas") toast("已生成 3 个新方向，保留原来的真实事实");
      if (action === "rewrite-script") toast("导演正在重写：更短句、更少形容词");
      if (action === "regen-voice") toast("正在重新生成配音 · 预计 20 秒");
      return;
    }

    const choiceTrigger = target.closest("[data-choice]");
    if (choiceTrigger) {
      const siblings = Array.from(choiceTrigger.parentElement.querySelectorAll("[data-choice]"));
      siblings.forEach((el) => el.classList.remove("selected"));
      choiceTrigger.classList.add("selected");
      toast("已选择：「" + choiceTrigger.dataset.choice + "」");
      return;
    }

    const platformFilter = target.closest("[data-filter-platform]");
    if (platformFilter) {
      radarPlatform = platformFilter.dataset.filterPlatform;
      const siblings = Array.from(platformFilter.parentElement.querySelectorAll("[data-filter-platform]"));
      siblings.forEach((el) => el.classList.remove("active"));
      platformFilter.classList.add("active");
      filterRadar();
      return;
    }

    const refFilter = target.closest("[data-ref-source]");
    if (refFilter) {
      refSource = refFilter.dataset.refSource;
      const siblings = Array.from(refFilter.parentElement.querySelectorAll("[data-ref-source]"));
      siblings.forEach((el) => el.classList.remove("active"));
      refFilter.classList.add("active");
      filterReferences();
      return;
    }

    const refPreview = target.closest("[data-ref-preview]");
    if (refPreview) {
      openReferenceDetail(getRefHost(refPreview));
      return;
    }

    const templateUse = target.closest("[data-template-use]");
    if (templateUse) {
      applyReference(getRefHost(templateUse));
      return;
    }

    const billingTrigger = target.closest("[data-billing]");
    if (billingTrigger) {
      setBilling(billingTrigger.dataset.billing);
      return;
    }

    const themeTrigger = target.closest("[data-theme]");
    if (themeTrigger) {
      applyTheme(themeTrigger.dataset.theme, true);
      const label = themeTrigger.querySelector(".theme-meta strong")?.textContent || "纸墨";
      toast("已切换主题：「" + label + "」");
      return;
    }

    const topicTrigger = target.closest("[data-topic]");
    if (topicTrigger) {
      const topic = topicTrigger.dataset.topic;
      const platform = topicTrigger.dataset.platform || "三平台";
      const brief = $("#briefInput");
      if (brief) brief.value = "围绕「" + topic + "」做一条面向" + platform + "的短视频，目标是到店转化，真实感优先。";
      go("studio");
      toast("已把选题带入创作台，创意方向已生成");
      return;
    }

    const libTab = target.closest("[data-lib-tab]");
    if (libTab) {
      const siblings = Array.from(libTab.parentElement.querySelectorAll("[data-lib-tab]"));
      siblings.forEach((el) => el.classList.remove("active"));
      libTab.classList.add("active");
      toast("已筛选：" + libTab.dataset.libTab + "（演示数据未过滤）");
      return;
    }

    const pubTab = target.closest("[data-pub-tab]");
    if (pubTab) {
      const siblings = Array.from(pubTab.parentElement.querySelectorAll("[data-pub-tab]"));
      siblings.forEach((el) => el.classList.remove("active"));
      pubTab.classList.add("active");
      toast("已切换到「" + pubTab.textContent.trim() + "」");
      return;
    }

    const rangeBtn = target.closest("[data-range]");
    if (rangeBtn) {
      const siblings = Array.from(rangeBtn.parentElement.querySelectorAll("[data-range]"));
      siblings.forEach((el) => el.classList.remove("active"));
      rangeBtn.classList.add("active");
      toast("统计周期已切换为近 " + rangeBtn.dataset.range + " 天");
      return;
    }

    const platformRow = target.closest(".publish-platform");
    if (platformRow && !target.closest("[data-close-modal]")) {
      platformRow.classList.toggle("checked");
      updatePublishSelection();
      return;
    }

    const commandPage = target.closest("[data-command-page]");
    if (commandPage) {
      closeAllModals();
      go(commandPage.dataset.commandPage);
      return;
    }

    const commandAction = target.closest("[data-command-action]");
    if (commandAction) {
      closeAllModals();
      if (commandAction.dataset.commandAction === "new") {
        go("dashboard");
        window.setTimeout(() => $("#briefInput")?.focus(), 300);
      }
      if (commandAction.dataset.commandAction === "publish") {
        resetPublish();
        openModal("publishModal");
      }
      return;
    }

    const hint = target.closest("[data-hint]");
    if (hint) {
      const input = $("#directorInput");
      if (input) {
        input.value = hint.dataset.hint;
        input.focus();
      }
      return;
    }

    // Backdrop click closes the modal.
    if (target.classList.contains("modal-backdrop")) {
      closeModal(target);
    }
  });

  /* -------------------------------------------------------
     Specific controls
     ------------------------------------------------------- */
  $("#startCreate")?.addEventListener("click", () => {
    const input = $("#briefInput");
    if (input && !input.value.trim()) {
      input.value = "给杭州一家只卖 3 样菜的社区小馆，做一条能带来到店客流的视频，真实感优先。";
    }
    go("studio");
    toast("已生成 3 个创意方向，先选一个开始");
  });

  $$("#goalChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$("#goalChips .chip").forEach((el) => el.classList.remove("active"));
      chip.classList.add("active");
      state.goal = chip.dataset.goal || "到店转化";
    });
  });

  $$("[data-template]").forEach((card) => {
    card.addEventListener("click", () => {
      const brief = $("#briefInput");
      const templates = {
        "本地生活到店": "给杭州一家社区小馆，做一条能带来到店客流的视频，老板本人出镜，真实感优先。",
        "电商带货": "给一款 200 元以内的秋冬保温杯，做一条抖音带货短视频，目标是点击和成交。",
        "知识口播": "用 45 秒讲清楚「为什么你拍的视频没人看」，口播 + 大字字幕，不要花哨转场。",
        "品牌种草": "给一款适合通勤的帆布包，做一条小红书种草视频，审美优先，突出 3 个使用场景。"
      };
      if (brief) brief.value = templates[card.dataset.template] || "";
      if (brief) brief.focus();
      toast("已套用「" + card.dataset.template + "」模板，可继续修改");
    });
  });

  $("#toggleTimeline")?.addEventListener("click", toggleTimeline);

  $("#directorSend")?.addEventListener("click", sendDirector);
  $("#directorInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendDirector();
    }
  });

  $("#directorInput")?.addEventListener("input", (event) => {
    const el = event.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 64) + "px";
  });

  $("#confirmPublish")?.addEventListener("click", runPublish);

  $("#openOfficial")?.addEventListener("click", () => {
    toast("演示环境：已生成视频号 / 小红书官方发布包，真实环境将打开对应官方页面");
  });

  $("#publishDone")?.addEventListener("click", () => {
    closeAllModals();
    go("publish");
    toast("发布任务已创建，可在发布中心查看各平台状态");
  });

  $("#genDone")?.addEventListener("click", () => {
    closeAllModals();
    toast("2 个镜头已补齐，已自动替换到第 4、5 镜");
  });

  $("#boostRange")?.addEventListener("input", (event) => {
    updateBoost(event.currentTarget.value);
  });

  $("#radarSearch")?.addEventListener("input", filterRadar);
  $("#refSearch")?.addEventListener("input", filterReferences);

  $("#refUseBtn")?.addEventListener("click", () => {
    const btn = $("#refUseBtn");
    closeAllModals();
    applyReference(btn);
  });

  $("#paywallCta")?.addEventListener("click", () => {
    closeAllModals();
    toast("演示：已开启 7 天免费试用，未扣费；真实产品会进入支付与授权流程");
  });

  $("#mobileMenu")?.addEventListener("click", openSidebar);
  $("#sidebarScrim")?.addEventListener("click", closeSidebar);

  $("#openCommand")?.addEventListener("click", () => {
    openModal("commandModal");
    const input = $("#commandInput");
    if (input) input.value = "";
    $$("#commandList .command-item").forEach((el) => { el.style.display = ""; });
  });

  $("#commandInput")?.addEventListener("input", (event) => {
    const q = event.currentTarget.value.trim().toLowerCase();
    $$("#commandList .command-item").forEach((el) => {
      el.style.display = !q || el.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });

  // Keyboard shortcuts.
  document.addEventListener("keydown", (event) => {
    const meta = event.metaKey || event.ctrlKey;
    if (meta && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openModal("commandModal");
      window.setTimeout(() => $("#commandInput")?.focus(), 60);
    }
    if (meta && event.key === "Enter") {
      const active = document.activeElement;
      if (active && active.id === "briefInput") {
        event.preventDefault();
        $("#startCreate")?.click();
      }
    }
    if (event.key === "Escape") {
      closeAllModals();
      closeSidebar();
    }
  });

  // Initial state.
  initTheme();
  updateBoost(300);
  setStep(3);
  filterRadar();
  filterReferences();
  setBilling("monthly");

  // Deep links from the product blueprint: index.html#page-studio
  const initialPage = window.location.hash.replace(/^#page-/, "");
  if (initialPage && pageTitles[initialPage]) {
    go(initialPage);
  }

  window.addEventListener("hashchange", () => {
    const page = window.location.hash.replace(/^#page-/, "");
    if (page && pageTitles[page]) go(page);
  });
})();
