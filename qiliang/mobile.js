/* =========================================================
   起量 QILIANG — mobile app interactions
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  let toastTimer = null;
  let playing = false;
  let goal = "到店";

  const goalBriefs = {
    "到店": "给杭州一家只卖 3 样菜的社区小馆，做一条 30 秒到店视频，老板本人出镜，真实感优先。",
    "带货": "给巷子口小馆的招牌羊肉汤做一条 30 秒带货视频，突出 3 个细节，结尾引导点击团购。",
    "涨粉": "用 30 秒讲清楚「一家只卖 3 样菜的小店，为什么能开 12 年」，真实感优先，结尾引导关注。",
    "品牌": "给巷子口小馆做一条品牌故事视频，讲清楚 12 年、3 样菜和老板的坚持，克制、真实。"
  };

  const templateBriefs = {
    "本地生活": "给杭州一家只卖 3 样菜的社区小馆，做一条 30 秒到店视频。老板本人出镜，真实感优先，结尾只留到店一个动作。",
    "电商带货": "给巷子口小馆的招牌羊肉汤做一条 30 秒带货视频，突出 3 个细节，结尾引导点击团购。",
    "知识口播": "用 45 秒讲清楚「为什么这家店只卖 3 样菜却能开 12 年」，口播 + 大字字幕，不要花哨转场。"
  };

  function toast(message) {
    const el = $("#mToast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove("show"), 2400);
  }

  function goTab(name) {
    if (!name) return;
    $$(".m-page").forEach((page) => page.classList.toggle("active", page.dataset.mpage === name));
    $$(".tab-item").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name));
    const screen = $("#screen");
    if (screen) screen.scrollTop = 0;
  }

  function startCreate() {
    const brief = $("#mBrief");
    if (brief && !brief.value.trim()) {
      brief.value = goalBriefs[goal] || goalBriefs["到店"];
    }
    goTab("create");
    toast("已生成第一版脚本");
  }

  function setStep(step) {
    $$("[data-mpanel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.mpanel === step));
    $$("#mSteps .m-step").forEach((btn) => btn.classList.toggle("active", btn.dataset.mstep === step));

    const title = $("#mPanelTitle");
    const meta = $("#mPanelMeta");
    const tip = $("#mTip");
    const map = {
      script: ["脚本", "86 字 · 28 秒", "把「12 年只卖 3 样菜」放在前 2 秒，先给冲突。"],
      visual: ["画面", "5 个镜头", "第 4 镜停留略长，建议提前 0.8 秒切到上桌。"],
      voice: ["配音", "2 个声音", "先选声音，再微调语速。字幕按语义断句。"],
      final: ["成片", "3 个平台", "结尾只留一个动作：到店。"]
    };
    const copy = map[step] || map.visual;
    if (title) title.textContent = copy[0];
    if (meta) meta.textContent = copy[1];
    if (tip) tip.textContent = copy[2];
  }

  function openSheet(id) {
    const sheet = document.getElementById(id);
    if (!sheet) return;
    sheet.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
    const screen = $("#screen");
    if (screen) screen.style.overflow = "hidden";
  }

  function closeSheet(sheet) {
    if (!sheet) return;
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    if (!$(".sheet-backdrop.open")) {
      const screen = $("#screen");
      if (screen) screen.style.overflow = "";
    }
  }

  function closeAllSheets() {
    $$(".sheet-backdrop.open").forEach((sheet) => closeSheet(sheet));
  }

  function updatePublishCount() {
    const count = $$(".sheet-check.checked").length;
    const btn = $("#mConfirmPublish");
    if (btn) btn.textContent = count ? "确认发布 " + count + " 个平台" : "请选择平台";
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    const tab = target.closest("[data-tab]");
    if (tab) {
      event.preventDefault();
      goTab(tab.dataset.tab);
      if (tab.dataset.toast) toast(tab.dataset.toast);
      return;
    }

    const sheetBtn = target.closest("[data-sheet]");
    if (sheetBtn) {
      event.preventDefault();
      const map = { member: "memberSheet", publish: "publishSheet" };
      openSheet(map[sheetBtn.dataset.sheet] || sheetBtn.dataset.sheet);
      return;
    }

    const close = target.closest("[data-close-sheet]");
    if (close) {
      closeSheet(close.closest(".sheet-backdrop"));
      return;
    }

    const member = target.closest("[data-member]");
    if (member) {
      closeAllSheets();
      toast("演示：已开启 7 天免费试用，未扣费");
      return;
    }

    const check = target.closest("[data-check]");
    if (check) {
      check.classList.toggle("checked");
      updatePublishCount();
      return;
    }

    const step = target.closest("[data-mstep]");
    if (step) {
      setStep(step.dataset.mstep);
      return;
    }

    const template = target.closest("[data-template]");
    if (template) {
      const brief = $("#mBrief");
      if (brief) brief.value = templateBriefs[template.dataset.template] || templateBriefs["本地生活"];
      goTab("create");
      toast("已套用「" + template.dataset.template + "」模板");
      return;
    }

    const toggle = target.closest("[data-switch]");
    if (toggle) {
      toggle.classList.toggle("on");
      toast(toggle.classList.contains("on") ? "已开启 AI 内容标识" : "已关闭；发布前会再次提示");
      return;
    }

    const toastBtn = target.closest("[data-toast]");
    if (toastBtn) {
      toast(toastBtn.dataset.toast);
      return;
    }

    if (target.classList.contains("sheet-backdrop")) {
      closeSheet(target);
    }
  });

  $$("#mGoals .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$("#mGoals .chip").forEach((el) => el.classList.remove("active"));
      chip.classList.add("active");
      goal = chip.dataset.goal || "到店";
    });
  });

  $("#mStart")?.addEventListener("click", startCreate);

  $("#mPlay")?.addEventListener("click", () => {
    playing = !playing;
    const btn = $("#mPlay");
    if (btn) {
      btn.innerHTML = playing
        ? '<svg class="ic"><use href="#i-pause"/></svg> 暂停'
        : '<svg class="ic"><use href="#i-play"/></svg> 播放';
    }
    toast(playing ? "播放中" : "已暂停");
  });

  $("#mConfirmPublish")?.addEventListener("click", () => {
    const count = $$(".sheet-check.checked").length;
    if (!count) {
      toast("至少选择一个平台");
      return;
    }
    closeAllSheets();
    goTab("publish");
    toast("已提交发布。抖音直发，视频号 / 小红书待确认");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllSheets();
  });

  updatePublishCount();
})();
