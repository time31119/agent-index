/* =========================================================
   起量 QILIANG — minimal interactions
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const pageTitles = {
    home: "工作台",
    studio: "创作",
    publish: "发布",
    data: "数据"
  };

  const pageAliases = { dashboard: "home", analytics: "data" };

  const templateBriefs = {
    "本地生活": "给杭州一家只卖 3 样菜的社区小馆，做一条 30 秒到店视频。老板本人出镜，真实感优先，结尾只留到店一个动作。",
    "电商带货": "给巷子口小馆的招牌羊肉汤做一条 30 秒带货视频，突出 3 个细节，结尾引导点击团购。",
    "知识口播": "用 45 秒讲清楚「为什么这家店只卖 3 样菜却能开 12 年」，口播 + 大字字幕，不要花哨转场。",
    "小红书封面": "给巷子口小馆的秋冬新菜做一条小红书视频，3:4 封面，标题写「杭州 / 拱墅 / 羊肉汤」，正文给地址和营业时间。"
  };

  let toastTimer = null;
  let playing = false;
  let goal = "到店";

  const goalBriefs = {
    "到店": "给杭州一家只卖 3 样菜的社区小馆，做一条 30 秒到店视频，老板本人出镜，真实感优先。",
    "带货": "给巷子口小馆的招牌羊肉汤做一条 30 秒带货视频，突出 3 个细节，结尾引导点击团购。",
    "涨粉": "用 30 秒讲清楚「一家只卖 3 样菜的小店，为什么能开 12 年」，真实感优先，结尾引导关注。",
    "品牌": "给巷子口小馆做一条品牌故事视频，讲清楚 12 年、3 样菜和老板的坚持，克制、真实。"
  };

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove("show"), 2600);
  }

  function navigate(page) {
    page = pageAliases[page] || page;
    if (!pageTitles[page]) return;
    $$(".page").forEach((el) => el.classList.toggle("active", el.id === "page-" + page));
    $$(".nav-item[data-page]").forEach((el) => el.classList.toggle("active", el.dataset.page === page));
    const title = $("#topTitle");
    if (title) title.textContent = pageTitles[page];
    if (window.location.protocol !== "file:" && window.history.replaceState) {
      try {
        window.history.replaceState(null, "", "#page-" + page);
      } catch (error) {
        // Some embedded browsers block history updates.
      }
    }
    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openSidebar() {
    $("#sidebar")?.classList.add("open");
    $("#scrim")?.classList.add("open");
  }

  function closeSidebar() {
    $("#sidebar")?.classList.remove("open");
    $("#scrim")?.classList.remove("open");
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    closeSidebar();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
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
    $$(".modal-backdrop.open").forEach((modal) => closeModal(modal));
  }

  function applyTemplate(name) {
    const brief = $("#brief");
    if (brief) brief.value = templateBriefs[name] || templateBriefs["本地生活"];
    closeAllModals();
    navigate("studio");
    toast("已套用「" + name + "」模板");
  }

  function startCreate() {
    const brief = $("#brief");
    if (brief && !brief.value.trim()) {
      brief.value = goalBriefs[goal] || goalBriefs["到店"];
    }
    navigate("studio");
    toast("已生成第一版脚本");
  }

  function setPanel(step) {
    const panels = $$("[data-panel]");
    panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === step));
    $$("#studioSteps .step").forEach((btn) => btn.classList.toggle("active", btn.dataset.step === step));

    const title = $("#panelTitle");
    const meta = $("#panelMeta");
    const tip = $("#studioTip span");
    const map = {
      script: ["脚本", "86 字 · 28 秒", "把「12 年只卖 3 样菜」放在前 2 秒，先给冲突。"],
      visual: ["画面", "5 个镜头", "第 4 镜停留略长，建议提前 0.8 秒切到上桌。"],
      voice: ["配音", "2 个声音", "先选声音，再微调语速。字幕按语义断句。"],
      final: ["成片", "3 个平台", "结尾只留一个动作：到店。标题、封面和地址已按平台重写。"]
    };
    const copy = map[step] || map.visual;
    if (title) title.textContent = copy[0];
    if (meta) meta.textContent = copy[1];
    if (tip) tip.textContent = copy[2];
  }

  function updatePublishCount() {
    const count = $$(".check-row.checked").length;
    const btn = $("#confirmPublish");
    if (btn) btn.textContent = count ? "确认发布 " + count + " 个平台" : "请选择平台";
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    const page = target.closest("[data-page]");
    if (page) {
      event.preventDefault();
      navigate(page.dataset.page);
      return;
    }

    const modal = target.closest("[data-modal]");
    if (modal) {
      event.preventDefault();
      const map = {
        templates: "templatesModal",
        publish: "publishModal",
        settings: "settingsModal",
        member: "membershipModal"
      };
      openModal(map[modal.dataset.modal] || modal.dataset.modal);
      return;
    }

    const close = target.closest("[data-close]");
    if (close) {
      closeModal(close.closest(".modal-backdrop"));
      return;
    }

    const template = target.closest("[data-template]");
    if (template) {
      applyTemplate(template.dataset.template);
      return;
    }

    const step = target.closest("[data-step]");
    if (step && step.closest("#studioSteps")) {
      setPanel(step.dataset.step);
      return;
    }

    const toggle = target.closest("[data-switch]");
    if (toggle) {
      toggle.classList.toggle("on");
      toast(toggle.classList.contains("on") ? "已开启 AI 内容标识" : "已关闭；发布前会再次提示");
      return;
    }

    const member = target.closest("[data-member]");
    if (member) {
      closeAllModals();
      toast("演示：已开启 7 天免费试用，未扣费");
      return;
    }

    const check = target.closest(".check-row");
    if (check) {
      check.classList.toggle("checked");
      updatePublishCount();
      return;
    }

    const toastBtn = target.closest("[data-toast]");
    if (toastBtn) {
      toast(toastBtn.dataset.toast);
      return;
    }

    const voice = target.closest(".voice-option");
    if (voice) {
      $$(".voice-option").forEach((item) => item.classList.remove("active"));
      voice.classList.add("active");
      toast("已选择声音");
      return;
    }

    if (target.classList.contains("modal-backdrop")) {
      closeModal(target);
    }
  });

  $$("#goalChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$("#goalChips .chip").forEach((el) => el.classList.remove("active"));
      chip.classList.add("active");
      goal = chip.dataset.goal || "到店";
    });
  });

  $("#startBtn")?.addEventListener("click", startCreate);

  $("#brief")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      startCreate();
    }
  });

  $("#playBtn")?.addEventListener("click", () => {
    playing = !playing;
    const btn = $("#playBtn");
    if (btn) {
      btn.innerHTML = playing
        ? '<svg class="ic"><use href="#i-pause"/></svg> 暂停'
        : '<svg class="ic"><use href="#i-play"/></svg> 播放';
    }
    toast(playing ? "播放中" : "已暂停");
  });

  $("#useAdvice")?.addEventListener("click", () => {
    const brief = $("#brief");
    if (brief) {
      brief.value = "把「12 年只卖 3 样菜」做成 3 集系列，固定周五 19:10 发视频号，测试追更。";
    }
    navigate("home");
    window.setTimeout(() => brief?.focus(), 260);
    toast("建议已带入工作台");
  });

  $("#confirmPublish")?.addEventListener("click", () => {
    const count = $$(".check-row.checked").length;
    if (!count) {
      toast("至少选择一个平台");
      return;
    }
    closeAllModals();
    navigate("publish");
    toast("已提交发布。抖音直发，视频号 / 小红书待确认");
  });

  $("#mobileMenu")?.addEventListener("click", openSidebar);
  $("#scrim")?.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals();
      closeSidebar();
    }
  });

  updatePublishCount();

  const initial = window.location.hash.replace(/^#page-/, "");
  const initialPage = pageAliases[initial] || initial;
  if (initialPage && pageTitles[initialPage]) navigate(initialPage);

  window.addEventListener("hashchange", () => {
    const page = window.location.hash.replace(/^#page-/, "");
    const resolved = pageAliases[page] || page;
    if (resolved && pageTitles[resolved]) navigate(resolved);
  });
})();
