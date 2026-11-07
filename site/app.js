/* 讲义 LECTURE — 数据与交互 */
const SKILLS = [
  {
    id: "collage",
    no: "01",
    name: "拼贴编辑体",
    en: "PAPER COLLAGE",
    tagline: "把一段论证，剪成一张张十九世纪的插图。",
    tempo: "3.5–5 s / 屏",
    level: "中",
    fit: "观点文 · 人物访谈 · 书评 · 方法论",
    lead: "纸的质感负责可信，剪贴的粗糙负责亲近。适合把抽象概念落到一个具体的老物件上——野心是热气球，深度是螺旋钻。",
    motion: [
      "贴上去，不要淡进来：位移 60–120px、倾斜 2°、末段 3 帧过冲回弹。",
      "12fps 定格：posterizeTime(12)，让动作有手工的顿挫。",
      "全局 0.6px、1Hz 的微抖，超过 1.5px 就变成手抖。"
    ],
    spec: [
      ["色", "纸 #EFEAE0 · 墨 #1A1A18 · 印红 #B23A2E · 高亮 #F2E39B"],
      ["字", "思源宋体 Black，字距 −3%；标签用黑体 Medium"],
      ["投影", "(4,6) / blur 10 / 不透明度 30%，全片只有这一组"],
      ["质感", "纸纹 12–18% + 网点 6–10% + 暗角 12–18%，三层缺一不可"],
      ["网格", "左右留白 80px，上下 220px；留白率 ≥ 45%"]
    ],
    cite: "右下角“来源贴纸”，常驻 ≥3 秒；插图注明馆藏机构与编号。",
    anti: ["用淡入淡出做所有入场，会立刻变成 PPT。", "插画铺满全屏，留白低于 40% 就没有呼吸。"],
    tools: "Figma 排版 → After Effects / 本索引的 Python 渲染器",
    refs: [{ label: "Felix Rieseberg《How to be more ambitious》", url: "https://gbti.network/shares/gbtilabs/20261015145009-how-to-be-more-ambitious-a-tutorial-for-humans-w/" }]
  },
  {
    id: "minimal",
    no: "02",
    name: "极简排版",
    en: "MINIMAL EDITORIAL",
    tagline: "一屏一句，剩下的交给留白。",
    tempo: "5–8 s / 屏",
    level: "低",
    fit: "定义 · 金句 · 概念对比 · 宣言",
    lead: "最便宜也最危险的一种：没有装饰可以遮丑，文案不行就全垮。它的价值在于让一句话独自站着，不被任何东西分心。",
    motion: [
      "只做透明度与 ≤12px 的位移，不做旋转、不做缩放。",
      "每屏 5–8 秒，慢到足够读两遍。",
      "换屏不做转场，直接切；转场本身也是干扰。"
    ],
    spec: [
      ["色", "底 #FAF9F6 · 字 #121212 · 辅助 #8A8A86"],
      ["字", "单一字重，宋体 Black 或 Light 二选一，绝不混用"],
      ["网格", "留白 ≥ 65%；文字块永远居中或永远左对齐"],
      ["质感", "无纹理、无投影、无渐变"]
    ],
    cite: "页脚常驻小字，字号不小于 16px；引文用「」包裹并署名。",
    anti: ["往画面里放 logo 和二维码。", "用三种以上字重制造“层次”。"],
    tools: "Figma / Keynote 导出序列帧",
    refs: []
  },
  {
    id: "blueprint",
    no: "03",
    name: "蓝图工程图",
    en: "BLUEPRINT",
    tagline: "把机制画成图，而不是讲成话。",
    tempo: "4–6 s / 屏",
    level: "高",
    fit: "系统架构 · 机制拆解 · 流程 · 因果链",
    lead: "当内容本身是结构的时候，唯一诚实的表现方式就是把它画出来。线条的生长速度就是观众的理解速度。",
    motion: [
      "线条生长：stroke-dashoffset 从 100% 到 0，速度恒定，不加速。",
      "标注线依次点亮，前一根走完再走下一根。",
      "图元不做弹跳、不做旋转，工程图不相信弹性。"
    ],
    spec: [
      ["色", "底 #0E2233 · 线 #E2ECF4 · 标注 #F0C878"],
      ["网格", "40px 栅格，8% 白，用来对齐所有图元"],
      ["线", "2–3px；箭头 6px；圆角一律 0"],
      ["字", "等宽或窄体无衬线，字号 ≤ 图元高度的 1/4"]
    ],
    cite: "图号 + 修订号（Fig.3 / Rev.B）+ 数据来源，固定在左下角。",
    anti: ["3D 爆炸图与透视，会破坏“可测量”的暗示。", "无意义的粒子与光效。"],
    tools: "Figma / Illustrator → AE 的 Trim Paths",
    refs: []
  },
  {
    id: "data",
    no: "04",
    name: "数据墨水",
    en: "DATA-INK",
    tagline: "让图表自己说话，别给它配花边。",
    tempo: "5–7 s / 屏",
    level: "中",
    fit: "研究解读 · 趋势 · 对比 · 预算与成本",
    lead: "Tufte 的老规矩在竖屏里依然成立：每一滴墨水都要承载信息。柱子长出来的那 0.4 秒，就是观众读数的 0.4 秒。",
    motion: [
      "柱子沿基线生长，0.4 秒，ease-out，不弹跳。",
      "数值从 0 滚到终值，滚完停住，不回弹。",
      "整屏只给一个数据点上色，其余全部灰。"
    ],
    spec: [
      ["色", "底 #FAF9F5 · 数据 #46463F · 强调 #B23A2E"],
      ["元素", "无网格线、无 3D、无渐变、无阴影"],
      ["轴", "只保留基线；数值标在柱顶，字号 ≥ 22px"]
    ],
    cite: "图表左下常驻 Source: 完整出处；坐标轴标注单位与口径。",
    anti: ["截断 y 轴放大差异，这是误导不是设计。", "饼图超过 5 类，观众读不出来。"],
    tools: "D3 / Observable 导出 → 或直接程序化渲染",
    refs: [{ label: "Edward Tufte, The Visual Display of Quantitative Information", url: "https://www.edwardtufte.com/tufte/books_vdqi" }]
  },
  {
    id: "cards",
    no: "05",
    name: "索引卡笔记",
    en: "INDEX CARD",
    tagline: "一张卡一件事，按顺序飞到该在的位置。",
    tempo: "3–4 s / 屏",
    level: "低",
    fit: "读书笔记 · 清单 · 多线索 · 教程步骤",
    lead: "卡片天然带着“这是笔记、可以质疑”的语气，比全屏大字更适合讲过程。适合内容还没定型、需要展示思考顺序的场合。",
    motion: [
      "卡片从画外抛入，落点 3 帧回弹，像真的被放下。",
      "夹角在 −9° 到 +5° 之间，没有一张是水平的。",
      "连线手绘感：每帧抖动 1px，不要平滑曲线。"
    ],
    spec: [
      ["色", "卡纸 #F3ECDC · 边 #3C372D · 投影 30%"],
      ["形态", "圆角 0，边框 2px；胶带用 55% 透明的米色块"],
      ["字", "标题黑体 Bold，正文用细线代替（示意）"]
    ],
    cite: "卡片背面式：角上的编号对应片尾的文献表，点开才展开。",
    anti: ["一张卡塞三件事。", "整段用手写字体，可读性会崩。"],
    tools: "Figma + AE；或纯 CSS 也能做",
    refs: []
  },
  {
    id: "book",
    no: "06",
    name: "书页引用体",
    en: "BOOK PAGE",
    tagline: "像翻一本书那样讲，脚注就在手边。",
    tempo: "6–8 s / 屏",
    level: "高",
    fit: "论文 · 经典文本 · 引文密集的评论",
    lead: "最慢、最重、也最可信的一种。它把“我在引用”写在版式里：双栏、页码、上标、脚注区，观众一眼就知道这不是随口说的。",
    motion: [
      "只有视差与遮罩，位移 ≤20px。",
      "引文块淡入 0.6 秒，比正文慢半拍。",
      "页码与页眉全程可见，不要为了“干净”藏起来。"
    ],
    spec: [
      ["色", "纸 #F6F2E8 · 正文 #2A2A28 · 注释 #6E685C"],
      ["版式", "双栏，栏距 24px，行高 1.7"],
      ["字", "正文宋体；引文加大一号并加底色块"]
    ],
    cite: "上标编号 + 页脚注释区：作者、年份、页码齐全，缺一不可。",
    anti: ["写“有研究表明”而不给出处。", "把注释缩到读不清的字号。"],
    tools: "InDesign / Figma → AE 的遮罩位移动画",
    refs: []
  }
];

/* ---------------- 版式 ---------------- */
const LAYOUTS = [
  { k: "statement", name: "单点陈述", en: "STATEMENT", use: "钩子 · 结论 · 一个数字", param: "1 个视觉重心，字号 ≥120px" },
  { k: "three", name: "三等分并列", en: "3-UP", use: "三个方法 · 三个误解", param: "3 栏等宽，栏间 24px" },
  { k: "split", name: "左右对照", en: "SPLIT", use: "前后对比 · 问题 vs 方案", param: "50:50，中线留 32px" },
  { k: "metric", name: "关键数字", en: "METRIC", use: "数据结论 · 规模 · 增长率", param: "数字 ≥96px，标签 18px" },
  { k: "timeline", name: "时间线", en: "TIMELINE", use: "历史 · 演进 · 版本", param: "4–6 节点，间距 ≥160px" },
  { k: "process", name: "流程步骤", en: "PROCESS", use: "操作步骤 · 管线 · 因果链", param: "3–5 步，箭头统一向右" },
  { k: "quote", name: "引文块", en: "QUOTE", use: "文献引用 · 专家观点", param: "引文 ≤3 行，出处紧随" },
  { k: "matrix", name: "二维矩阵", en: "MATRIX", use: "分类 · 取舍 · 定位", param: "2×2，轴标签 12px" }
];

function lp(k) {
  const bar = (w, h = 6, cls = "") => `<i class="bar ${cls}" style="width:${w}%;height:${h}px"></i>`;
  switch (k) {
    case "statement":
      return `<div class="lp lp-statement"><i class="bar" style="width:64%;height:15px"></i>${bar(36, 3, "thin")}</div>`;
    case "three":
      return `<div class="lp lp-three">${[1, 2, 3].map(i =>
        `<div class="col"><span class="num">0${i}</span>${bar(78, 7)}${bar(96, 3, "thin")}${bar(88, 3, "thin")}${bar(66, 3, "thin")}</div>`).join("")}</div>`;
    case "split":
      return `<div class="lp lp-split"><div class="col">${bar(92, 8)}${bar(74, 3, "thin")}${bar(86, 3, "thin")}${bar(58, 3, "thin")}</div><div class="blkbox"></div></div>`;
    case "metric":
      return `<div class="lp lp-metric">${["42%", "3.1×", "128"].map(n =>
        `<div class="m"><span class="n">${n}</span>${bar(72, 3, "thin")}</div>`).join("")}</div>`;
    case "timeline":
      return `<div class="lp lp-timeline"><i class="tl-line"></i>${["2023", "2024", "2025", "2026"].map(y =>
        `<div class="tl-node"><i class="dot"></i><span class="lab">${y}</span></div>`).join("")}</div>`;
    case "process":
      return `<div class="lp lp-process">${[1, 2, 3, 4].map(i => `<div class="pbox"><span>0${i}</span></div>`).join("")}</div>`;
    case "quote":
      return `<div class="lp lp-quote"><span class="qmark">“</span><i class="bar" style="width:88%;height:10px"></i><i class="bar" style="width:62%;height:10px"></i>${bar(42, 3, "thin")}</div>`;
    case "matrix":
      return `<div class="lp lp-matrix"><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div></div>`;
    default:
      return `<div class="lp"></div>`;
  }
}

document.getElementById("layoutGrid").innerHTML = LAYOUTS.map((l, i) => `
  <article class="layout-card">
    <div class="layout-top"><span class="layout-no">L${i + 1}</span><span class="layout-en">${l.en}</span></div>
    ${lp(l.k)}
    <h3>${l.name}</h3>
    <p>${l.param}</p>
    <div class="use">适用：${l.use}</div>
  </article>`).join("");

/* ---------------- 幻灯片版式（16:9） ---------------- */
const DECK_LAYOUTS = [
  {
    k: "oneline", name: "一页一句", en: "ONE LINE",
    param: "页眉导轨 + 眉标 + ≤7 词标题 + 一行注解 + 一张图",
    use: "论点 · 牵引 · 结论"
  },
  {
    k: "kpi", name: "指标表", en: "KPI TABLE",
    param: "4 行 × 4 列：本期 / 上期 / 变化 / 状态标签",
    use: "月报 · 尽调 · 复盘"
  },
  {
    k: "three", name: "三色卡", en: "THREE CARDS",
    param: "3 张满色卡片，右上角大号序号，卡内只放一句证据",
    use: "三个杠杆 · 三个方案"
  },
  {
    k: "pillars", name: "四柱", en: "FOUR PILLARS",
    param: "4 列等宽，实心与描边交替，底部对齐正文",
    use: "内容支柱 · 路线图"
  }
];

function dlp(k) {
  const bar = (w, h = 3, cls = "") => `<i class="${cls}" style="width:${w}%;height:${h}px;display:block;background:#C6BEAE"></i>`;
  switch (k) {
    case "oneline":
      return `<div class="lp lp-deck">
        <div class="d-rail"><i></i><i style="width:22%"></i></div>
        <div class="d-eye"></div>
        <div class="d-h1"><i style="width:82%"></i><i style="width:54%"></i></div>
        <div class="d-sub">${bar(64, 2.5)}</div>
        <div class="d-chart"><svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,40 0,34 18,29 38,23 58,15 79,9 100,3 100,40" fill="rgba(215,38,61,0.08)"/><polyline points="0,34 18,29 38,23 58,15 79,9 100,3" fill="none" stroke="#D7263D" stroke-width="1.4" vector-effect="non-scaling-stroke"/></svg></div>
      </div>`;
    case "kpi":
      return `<div class="lp lp-deck">
        <div class="d-rail"><i></i><i style="width:18%"></i></div>
        <div class="d-h1"><i style="width:58%"></i></div>
        <div class="d-table">
          <div class="d-tr head"><i></i><b>本期</b><b>上期</b><b>状态</b></div>
          <div class="d-tr"><i></i><b>4.7M</b><b class="up">+6.8%</b><span class="d-chip">AHEAD</span></div>
          <div class="d-tr"><i></i><b>310k</b><b class="up">+72%</b><span class="d-chip">AHEAD</span></div>
          <div class="d-tr"><i></i><b>121%</b><b class="down">−7pp</b><span class="d-chip warn">BEHIND</span></div>
          <div class="d-tr"><i></i><b>18</b><b>−1</b><span class="d-chip">ON TRACK</span></div>
        </div>
      </div>`;
    case "three":
      return `<div class="lp lp-deck">
        <div class="d-rail"><i></i><i style="width:20%"></i></div>
        <div class="d-h1"><i style="width:70%"></i></div>
        <div class="d-cards">
          <div class="c slate"><span class="n">01</span><i class="t"></i><i class="s"></i><i class="s" style="width:62%"></i></div>
          <div class="c signal"><span class="n">02</span><i class="t"></i><i class="s"></i><i class="s" style="width:58%"></i></div>
          <div class="c green"><span class="n">03</span><i class="t"></i><i class="s"></i><i class="s" style="width:66%"></i></div>
        </div>
      </div>`;
    case "pillars":
      return `<div class="lp lp-deck">
        <div class="d-rail"><i></i><i style="width:16%"></i></div>
        <div class="d-h1"><i style="width:62%"></i></div>
        <div class="d-pillars">
          <div class="p a"><span class="k">01 · 35%</span><i style="width:80%"></i><i style="width:56%"></i></div>
          <div class="p b"><span class="k">02 · 25%</span><i style="width:74%"></i><i style="width:50%"></i></div>
          <div class="p c"><span class="k">03 · 25%</span><i style="width:78%"></i><i style="width:60%"></i></div>
          <div class="p d"><span class="k">04 · 15%</span><i style="width:70%"></i><i style="width:46%"></i></div>
        </div>
      </div>`;
    default:
      return `<div class="lp lp-deck"></div>`;
  }
}

document.getElementById("deckGrid").innerHTML = DECK_LAYOUTS.map((l, i) => `
  <article class="layout-card">
    <div class="layout-top"><span class="layout-no">L${i + 9}</span><span class="layout-en">${l.en}</span></div>
    ${dlp(l.k)}
    <h3>${l.name}</h3>
    <p>${l.param}</p>
    <div class="use">适用：${l.use}</div>
  </article>`).join("");

const REC_LAYOUTS = {
  collage: ["statement", "split"],
  minimal: ["statement", "quote"],
  blueprint: ["process", "split"],
  data: ["metric", "three"],
  cards: ["three", "process"],
  book: ["quote", "split"]
};

function layoutChips(id) {
  return (REC_LAYOUTS[id] || []).map(k => {
    const i = LAYOUTS.findIndex(l => l.k === k);
    const l = LAYOUTS[i];
    return `<a class="m-lchip" href="#layouts" data-close>L${i + 1} ${l.name}</a>`;
  }).join("");
}

/* ---------------- 渲染卡片 ---------------- */
const grid = document.getElementById("grid");

function cardHTML(s) {
  return `
  <article class="card" data-id="${s.id}" tabindex="0" role="button" aria-label="查看 ${s.name} 详情">
    <div class="card-top">
      <span class="card-no">${s.no}</span>
      <span class="card-tempo">${s.tempo}</span>
    </div>
    <div class="card-media">
      <video muted loop playsinline preload="metadata" poster="assets/posters/${s.id}.jpg">
        <source src="assets/videos/${s.id}.mp4" type="video/mp4">
      </video>
      <span class="badge">样板 5s</span>
      <span class="play">PLAY 5s</span>
    </div>
    <div class="card-body">
      <h3>${s.name} <small>${s.en}</small></h3>
      <p class="card-tag">${s.tagline}</p>
      <div class="card-meta">
        <span>难度 <b>${s.level}</b></span>
        <span>${s.fit.split(" · ").slice(0, 2).join(" · ")}</span>
      </div>
    </div>
  </article>`;
}

grid.innerHTML = SKILLS.map(cardHTML).join("");

/* ---------------- 悬停播放 ---------------- */
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll(".card").forEach(card => {
  const v = card.querySelector("video");
  if (!v) return;
  const play = () => { if (!reduced) { v.play().catch(() => {}); } };
  const stop = () => { v.pause(); v.currentTime = 0; };
  card.addEventListener("mouseenter", play);
  card.addEventListener("mouseleave", stop);
  card.addEventListener("focus", play);
  card.addEventListener("blur", stop);
});

/* ---------------- 筛选 ---------------- */
document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(b => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn ? "true" : "false");
    });
    const f = btn.dataset.filter;
    document.querySelectorAll(".card").forEach(c => {
      c.hidden = !(f === "all" || c.dataset.id === f);
    });
  });
});

/* ---------------- 弹窗 ---------------- */
const modal = document.getElementById("modal");
const mVideo = document.getElementById("mVideo");
const mBody = document.getElementById("mBody");

function openModal(id) {
  const s = SKILLS.find(x => x.id === id);
  if (!s) return;

  mVideo.src = `assets/videos/${s.id}.mp4`;
  mVideo.poster = `assets/posters/${s.id}.jpg`;
  mVideo.currentTime = 0;
  mVideo.load();
  mVideo.play().catch(() => {});

  mBody.innerHTML = `
    <div class="m-kicker">${s.no} · ${s.en}</div>
    <h2 class="m-title" id="mTitle">${s.name}</h2>
    <p class="m-lead">${s.lead}</p>

    <div class="m-block">
      <h4>适合讲什么</h4>
      <p style="margin:0;font-size:14px;color:var(--ink-2)">${s.fit}</p>
    </div>

    <div class="m-block">
      <h4>推荐版式</h4>
      <div class="m-lchips">${layoutChips(s.id)}</div>
    </div>

    <div class="m-block">
      <h4>动效语法</h4>
      <ul>${s.motion.map(m => `<li>${m}</li>`).join("")}</ul>
    </div>

    <div class="m-block">
      <h4>版式参数</h4>
      <table class="m-spec">
        ${s.spec.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}
      </table>
    </div>

    <div class="m-block">
      <h4>引用规范</h4>
      <p class="m-cite">${s.cite}</p>
    </div>

    <div class="m-block">
      <h4>不要这样做</h4>
      <ul class="m-anti">${s.anti.map(a => `<li>${a}</li>`).join("")}</ul>
    </div>

    <div class="m-block">
      <h4>工具链</h4>
      <p style="margin:0;font-size:13.5px;color:var(--ink-2)">${s.tools}</p>
      ${s.refs.length ? `<p style="margin:10px 0 0;font-size:12.5px">参考：${s.refs.map(r => `<a href="${r.url}" target="_blank" rel="noopener" style="border-bottom:1px solid var(--red)">${r.label}</a>`).join("")}</p>` : ""}
    </div>
  `;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-close").focus();
  try { if (location.hash !== "#" + s.id) location.hash = s.id; } catch (e) {}
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  mVideo.pause();
  mVideo.removeAttribute("src");
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
}

grid.addEventListener("click", e => {
  const card = e.target.closest(".card");
  if (card) openModal(card.dataset.id);
});
grid.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    const card = e.target.closest(".card");
    if (card) { e.preventDefault(); openModal(card.dataset.id); }
  }
});

modal.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeModal(); });
mVideo.addEventListener("click", () => {
  if (mVideo.paused) mVideo.play().catch(() => {}); else mVideo.pause();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

/* ---------------- 深链 ---------------- */
const initial = location.hash.slice(1);
if (initial && SKILLS.some(s => s.id === initial)) {
  setTimeout(() => openModal(initial), 160);
}

/* ---------------- 入场动画 ---------------- */
if (!reduced && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
  document.querySelectorAll(".card, .manifesto article").forEach(el => io.observe(el));
} else {
  document.querySelectorAll(".card, .manifesto article").forEach(el => el.classList.add("in"));
}


