/* Mosaic — palette directions */

(function () {
  "use strict";

  const palettes = [
    {
      id: "lime",
      num: "01",
      short: "暖纸 / 青柠",
      name: "暖纸白 · 墨黑 · 酸性青柠",
      badge: "已选定",
      vibe: "编辑 / 独立",
      desc: "编辑部式的安静。纸白、墨黑，青柠只在「AI 正在工作」的地方出现。它不试图显得高科技，而是显得有判断。",
      best: "设计驱动的独立开发者、创意工具、面向设计师的 AI 产品。",
      risk: "青柠的流行度高，企业采购可能觉得太跳；大面积使用会刺眼。",
      textContrast: "17:1",
      accentContrast: "15:1",
      vars: {
        bg: "#f1efe7",
        surface: "#ffffff",
        ink: "#0a0a09",
        muted: "#4d4d43",
        line: "#d3cfc2",
        accent: "#d5f23f",
        accentInk: "#0a0a09",
        accentText: "#5f7a17",
        soft: "#edf6c8",
        promptBg: "#0a0a09",
        promptInk: "#f4f2ea",
        promptMuted: "#b8b8af",
      },
    },
    {
      id: "cobalt",
      num: "02",
      short: "冷瓷 / 钴蓝",
      name: "冷瓷白 · 墨黑 · 电光钴蓝",
      badge: "",
      vibe: "精密 / 可信",
      desc: "冷瓷白、墨黑、电光钴蓝。像一台校准过的仪器：精确、可信、没有多余情绪。更接近工程团队每天愿意打开的软件。",
      best: "工程团队、B2B SaaS、需要建立信任的开发者工具。",
      risk: "蓝色是 SaaS 的默认答案，容易缺个性；要和链接色、信息色区分开。",
      textContrast: "18:1",
      accentContrast: "6.5:1",
      vars: {
        bg: "#f2f5f8",
        surface: "#ffffff",
        ink: "#0b0f14",
        muted: "#4c5560",
        line: "#d2dae2",
        accent: "#1f4bff",
        accentInk: "#ffffff",
        accentText: "#1f4bff",
        soft: "#e5ebff",
        promptBg: "#0a1740",
        promptInk: "#f5f7ff",
        promptMuted: "#b6c0d4",
      },
    },
    {
      id: "oxblood",
      num: "03",
      short: "骨白 / 酒红",
      name: "骨白 · 深酒红 · 杏桃",
      badge: "",
      vibe: "高端 / 人文",
      desc: "骨白、深酒红、杏桃。纸、皮革、印刷品的气质，更像一间品牌工作室，而不是一台开发机。",
      best: "agency、品牌设计、高端定制、面向客户提案的场景。",
      risk: "酒红容易被读成错误或危险；必须控制面积，不要让它出现在失败态以外的操作里。",
      textContrast: "15:1",
      accentContrast: "8.1:1",
      vars: {
        bg: "#f3ede3",
        surface: "#fffbf4",
        ink: "#241512",
        muted: "#6a5147",
        line: "#dccfc0",
        accent: "#8e2f2a",
        accentInk: "#fff8f0",
        accentText: "#8e2f2a",
        soft: "#f0d9c9",
        promptBg: "#2a1512",
        promptInk: "#fbf2e6",
        promptMuted: "#d8b9a8",
      },
    },
    {
      id: "graphite",
      num: "04",
      short: "石墨 / 信号橙",
      name: "石墨 · 暖白 · 信号橙",
      badge: "",
      vibe: "专业 / 高能",
      desc: "石墨底、暖白字、信号橙。深色车间里的一颗焊点：高能量、长时间工作不刺眼，适合把「构建」当成核心动作的产品。",
      best: "专业开发者工具、夜间工作台、AI 编程产品。",
      risk: "全深色对营销页不友好；橙色大面积会焦躁，只适合做关键动作。",
      textContrast: "16:1",
      accentContrast: "7.2:1",
      vars: {
        bg: "#101214",
        surface: "#171a1d",
        ink: "#f2f0ea",
        muted: "#a7adb5",
        line: "#2e3338",
        accent: "#ff5a1f",
        accentInk: "#120b08",
        accentText: "#ff8a5c",
        soft: "#3a1e13",
        promptBg: "#1d2125",
        promptInk: "#f6f3ec",
        promptMuted: "#b8b0a6",
      },
    },
    {
      id: "pine",
      num: "05",
      short: "雾白 / 松绿",
      name: "雾白 · 深松 · 黄铜",
      badge: "",
      vibe: "自然 / 平静",
      desc: "雾白、深松、黄铜。安静、自然、可持续，像一本关于习惯的册子。它让「做 App」这件事显得不那么工业。",
      best: "健康、习惯、生活方式、教育类产品。",
      risk: "对构建工具来说能量偏弱；黄铜色需要小心搭配，容易显旧。",
      textContrast: "13:1",
      accentContrast: "7.8:1",
      vars: {
        bg: "#eef1ea",
        surface: "#ffffff",
        ink: "#14211b",
        muted: "#4e5e54",
        line: "#cbd6c9",
        accent: "#2f5d46",
        accentInk: "#f6f2e8",
        accentText: "#2f5d46",
        soft: "#dde8da",
        promptBg: "#173126",
        promptInk: "#f4f1e6",
        promptMuted: "#b9c8bc",
      },
    },
  ];

  const $ = (sel) => document.querySelector(sel);

  function toVars(vars) {
    return Object.entries(vars)
      .map(([key, value]) => `--p-${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}: ${value}`)
      .join("; ");
  }

  function swatches(p) {
    const items = [
      ["纸底", p.vars.bg],
      ["卡面", p.vars.surface],
      ["墨色", p.vars.ink],
      ["强调", p.vars.accent],
      ["边界", p.vars.line],
    ];
    return items
      .map(
        ([label, value]) =>
          `<div class="pal-swatch"><i style="background:${value}"></i><span>${label}</span><b>${value.toUpperCase()}</b></div>`
      )
      .join("");
  }

  function preview() {
    const habit = `<div class="pv-habit"><i></i><span></span><em>✓</em></div>`;
    return `<div class="pv">
      <div class="pv-bar">
        <span class="pv-logo"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
        <span class="pv-nav"><i></i><i></i><i></i></span>
        <span class="pv-cta">打开工作室</span>
      </div>
      <div class="pv-body">
        <div class="pv-main">
          <div class="pv-prompt">
            <span class="pv-label">PROMPT</span>
            <p class="pv-copy">做一个帮上班族坚持晨跑的习惯 App，安静克制，不要游戏化。</p>
            <div class="pv-foot">
              <span class="pv-model"><i></i>Auto · 12 模型</span>
              <span class="pv-gen">生成首屏</span>
            </div>
          </div>
          <div class="pv-row">
            <div class="pv-stat"><span>本周交付</span><b>18</b><em>+4</em></div>
            <div class="pv-stat"><span>节省</span><b>62%</b><em>$21.40</em></div>
          </div>
        </div>
        <div class="pv-phone">
          <div class="pv-screen">
            <div class="pv-island"></div>
            <div class="pv-date">FRI, NOV 6</div>
            <div class="pv-hello">早上好，Lin</div>
            <div class="pv-big">3<span>/5</span></div>
            <div class="pv-progress"><i></i></div>
            ${habit}${habit}${habit}
          </div>
        </div>
      </div>
    </div>`;
  }

  function card(p) {
    return `<article class="pal-card" id="p-${p.id}" style="${toVars(p.vars)}">
      <div class="pal-card__head">
        <div class="pal-card__meta">
          <span class="pal-num">${p.num}</span>
          <span class="pal-vibe">${p.vibe}</span>
          ${p.badge ? `<span class="pal-badge">${p.badge}</span>` : ""}
        </div>
        <h2>${p.name}</h2>
        <p class="pal-card__desc">${p.desc}</p>
      </div>
      ${preview()}
      <div class="pal-swatches">${swatches(p)}</div>
      <div class="pal-data">
        <div><span>正文对比度</span><b>${p.textContrast}</b></div>
        <div><span>强调对比度</span><b>${p.accentContrast}</b></div>
        <div><span>推荐语气</span><b>${p.vibe}</b></div>
      </div>
      <div class="pal-notes">
        <p><b>适合：</b>${p.best}</p>
        <p><b>风险：</b>${p.risk}</p>
      </div>
    </article>`;
  }

  function render() {
    const grid = $("#paletteGrid");
    const selector = $("#paletteSelector");
    if (!grid || !selector) return;

    grid.innerHTML = palettes.map(card).join("");
    selector.innerHTML = palettes
      .map(
        (p, i) =>
          `<button class="pal-chip${i === 0 ? " active" : ""}" type="button" data-target="p-${p.id}"><i style="background:${p.vars.accent}"></i>${p.short}</button>`
      )
      .join("");

    const chips = Array.from(selector.querySelectorAll(".pal-chip"));
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const target = document.getElementById(chip.dataset.target);
        if (!target) return;
        chips.forEach((c) => c.classList.toggle("active", c === chip));
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  render();
})();
