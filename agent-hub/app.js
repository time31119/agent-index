/* ==========================================================================
   AGENT INDEX · 我的 Agent 档案馆
   数据 + 交互（无第三方依赖，可直接 file:// 打开）
   ========================================================================== */

/* -------------------------------------------------------------- 分类定义 */

const CATS = [
  { id: 'trading',  name: '交易与投研',   en: 'TRADING',  desc: '策略库、回测台与交易终端',        color: '#b45309' },
  { id: 'video',    name: '短剧与视频',   en: 'VIDEO',    desc: '短剧平台、生成工具与视频工作台',  color: '#a16207' },
  { id: 'atlas',    name: '行业图谱',     en: 'ATLAS',    desc: 'AI 产业、城市与加密生态的全景索引',   color: '#0f766e' },
  { id: 'product',  name: 'AI 产品与硬件', en: 'PRODUCT',  desc: '设计智能体、AI 挂件与概念硬件',   color: '#1d4ed8' },
  { id: 'business', name: '商业与撮合',   en: 'BUSINESS', desc: '融资、社区与 AI 经营系统',        color: '#7e22ce' },
  { id: 'toolbox',  name: '创意与工具',   en: 'TOOLBOX',  desc: '开发者工具、点子库与清单',            color: '#475569' }
];

/* -------------------------------------------------------------- 站点数据 */

const AGENTS = [
  /* ---- 交易与投研 ---- */
  {
    id: "ai-paper-desk",
    cat: "trading",
    name: "AI Paper Desk",
    en: "AUTO QUANT DESK",
    sub: "规则型 AI 组合 · 模拟交易台",
    desc: "用真实 Binance USDT-M 永续行情驱动的模拟交易台：5 策略组合、1x、模拟撮合与 SSE 实时仪表盘，展示账户、持仓、信号与净值；不接真实交易所、不需要 API key。",
    tags: [
      "模拟交易",
      "Binance 永续",
      "SSE 实时",
      "5 策略组合"
    ],
    href: "http://127.0.0.1:8770/",
    src: "http://127.0.0.1:8770/",
    port: "8770",
    start: "python -m paper_desk.server --port 8770（在 quant-runner 目录）",
    alt: "../paper-desk/index.html",
    altLabel: "静态快照",
    no: 1
  },
  {
    id: "agent-alpha",
    cat: "trading",
    name: "Agent Alpha",
    en: "AGENT / ALPHA",
    sub: "自主加密交易指数",
    desc: "追踪加密市场里最强的一批自主代理：社交原生研究员、DeFi 执行集群与对抗型策略家；12 个 AI 交易代理的榜单、档案与方法论，内含可点通的模拟交易台。",
    tags: [
      "加密交易",
      "AI 代理",
      "指数榜单",
      "模拟交易"
    ],
    href: "http://127.0.0.1:8080/index.html",
    src: "http://127.0.0.1:8080/index.html",
    alt: "../agent-alpha/index.html",
    altLabel: "静态入口",
    port: "8080",
    start: "在 agent-alpha 目录运行 python -m http.server 8080",
    no: 2
  },
  {
    id: "alpha100",
    no: 3,
    cat: "trading",
    name: "ALPHA 100",
    en: "ALPHA 100",
    sub: "100 条可实盘的 AI 交易策略",
    desc: "把交易想法写成 100 条可执行规则：每条都有入场与离场定义、逐笔记录、十年回测与样本内外切分，并按证据等级排序，附复盘台与净值曲线。",
    tags: [
      "美股 ETF",
      "逐条规则",
      "样本外验证",
      "回测"
    ],
    href: "../alpha100/index.html",
    src: "http://127.0.0.1:8899/#/library",
    port: "8899",
    start: "alpha100\\start-server.bat"
  },
  {
    id: "intraday100",
    no: 4,
    cat: "trading",
    name: "INTRADAY 100",
    en: "INTRADAY 100",
    sub: "100 条只做日内的 AI 交易策略",
    desc: "专攻「不留隔夜」的策略库：覆盖 5 分钟、1 小时与加密三个数据集，用真实分钟数据回测，公开绿天率、最大连亏和每日复盘，亏损也照实展示。",
    tags: [
      "日内交易",
      "分钟级数据",
      "绿天率",
      "复盘"
    ],
    href: "../intraday100/index.html",
    src: "http://127.0.0.1:8900/#/library",
    port: "8900",
    start: "intraday100\\start-server.bat"
  },
  {
    id: "global-ai-trading",
    no: 5,
    cat: "trading",
    name: "全球 AI 交易 TOP 100",
    en: "GLOBAL AI TRADING 100",
    sub: "100 位交易员、机构与策略范式",
    desc: "一份可复现的 AI 交易全景图谱：100 个交易员与机构、25 个策略族、15 个可运行的 Python 实现，按流派与方法论而非收益榜排列。",
    tags: [
      "策略族",
      "人物图谱",
      "Python 实现",
      "全景图谱"
    ],
    href: "../global-ai-trading-top100/site/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/global-ai-trading-top100/site/index.html"
  },
  {
    id: "trading-lab",
    no: 6,
    cat: "trading",
    name: "技术分析研究实验室",
    en: "TRADING LAB",
    sub: "33 本经典 × 28 个指标 × 21 年回测",
    desc: "把 33 本交易经典读薄，把 28 个技术指标放进 4 大市场、21 年真实数据里，用同一套成本与规则回测，按收益率排名并做类别归纳——亏损与失效一并展示。",
    tags: [
      "书单",
      "指标回测",
      "收益率排名",
      "A 股 / 美股"
    ],
    href: "../trading-lab/site/books.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/trading-lab/site/books.html"
  },
  {
    id: "okx-scalp-lab",
    no: 7,
    cat: "trading",
    name: "SCALP//LAB",
    en: "SCALP LAB",
    sub: "OKX 永续合约 30 分钟策略榜",
    desc: "10 类 TradingView 高频指标策略，在 OKX BTC/ETH/SOL/DOGE 永续 30m K 线上做 90 天真实回测：扣费后排名、Pine Script v6 源码、周期阶梯与成本拖累。",
    tags: [
      "OKX 永续",
      "30m",
      "Pine Script",
      "手续费"
    ],
    href: "../okx-scalp-lab/site/data.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/okx-scalp-lab/site/data.html"
  },
  {
    id: "perp-atlas",
    no: 8,
    cat: "trading",
    name: "PERP ATLAS",
    en: "PERP ATLAS",
    sub: "开源合约策略观测站",
    desc: "把 GitHub 上最受关注的永续合约策略仓库、Release 下载量与 BTC/ETH/SOL/BNB 实时行情放进同一张观察桌面：看代码、看市场、不看喊单。",
    tags: [
      "开源策略",
      "实时行情",
      "GitHub",
      "永续合约"
    ],
    href: "../perp-atlas/index.html",
    src: "http://127.0.0.1:8765/perp-atlas/"
  },
  {
    id: "trace",
    no: 9,
    cat: "trading",
    name: "循迹 TRACE",
    en: "TRACE",
    sub: "链上永续合约跟单执行层",
    desc: "以 Hyperliquid 原生 WebSocket 捕获信号，用硬性滑点、杠杆上限与日亏熔断，把链上仓位复制到你自己的规则之内。",
    tags: [
      "跟单",
      "Hyperliquid",
      "风控",
      "WebSocket"
    ],
    href: "../trace/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/trace/index.html"
  },
  {
    id: "trading-desk",
    no: 10,
    cat: "trading",
    name: "值班交易台",
    en: "TRADING DESK",
    sub: "7×24 自动化交易运维流程",
    desc: "一套可值守的交易运维流程：风险闸、资金阶梯与确定性执行。AI 只出现在研究、监控与复盘环节，下单环节保持确定性。",
    tags: [
      "运维流程",
      "风险闸",
      "资金管理"
    ],
    href: "../trading-desk/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/trading-desk/index.html"
  },
  {
    id: "leadscope",
    no: 11,
    cat: "trading",
    name: "LeadScope",
    en: "LEADSCOPE",
    sub: "币安合约带单员收益榜的真相",
    desc: "抓取 931 位币安 USDT-M 合约带单员的 30 天收益、回撤与逐笔结构，用蒙特卡洛与「运气剥离」检验榜单前十：到底是策略，还是幸存者偏差。",
    tags: [
      "币安",
      "带单员",
      "蒙特卡洛",
      "反幸存者偏差"
    ],
    href: "../leadscope/index.html",
    src: "http://127.0.0.1:8788/index.html",
    port: "8788",
    start: "python -m http.server 8788（纯静态，也可直接双击 index.html）"
  },
  {
    id: "ai-trader-100u",
    cat: "trading",
    name: "交易终端",
    en: "AI TRADER 100U",
    sub: "1000 U 纸上交易终端",
    desc: "拉取 Hyperliquid 公开行情，用确定性规则给出方向、入场、止损与仓位，并把每笔决策记成纸上交易，用数据检验这套信号到底有没有边缘；不接私钥、不签名、不下真单。",
    tags: [
      "Hyperliquid",
      "纸上交易",
      "确定性规则",
      "风险控制"
    ],
    href: "http://127.0.0.1:8777/",
    src: "http://127.0.0.1:8777/",
    demo: "../ai-trader-100u/static/index.html",
    port: "8777",
    start: "ai-trader-100u\\run.bat（实时行情版）",
    no: 12
  },
  /* ---- 短剧与视频 ---- */
  {
    id: "nextact",
    no: 13,
    cat: "video",
    name: "次幕 NEXTACT",
    en: "NEXTACT",
    sub: "AI 短剧出海的资产与信用基础设施",
    desc: "不生产短剧，而是搭基础设施：用资产交易所解决内容与买方的匹配效率，用数据信用档案解决制作方的信用缺失，让好内容找到对的买方。",
    tags: [
      "短剧出海",
      "资产交易",
      "数据信用",
      "平台"
    ],
    href: "../nextact/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/index.html"
  },
  {
    id: "shortframe",
    no: 14,
    cat: "video",
    name: "短幕 SHORTFRAME",
    en: "SHORTFRAME",
    sub: "全球热播短剧 TOP 100 聚合",
    desc: "聚合 ReelShort、DramaBox、FlareFlow 等 12 家平台，追踪全球 100 部热播短剧：原版封面、跨平台热度榜、题材筛选与个人片单。",
    tags: [
      "短剧",
      "榜单聚合",
      "12 平台",
      "片单"
    ],
    href: "../shortframe/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/shortframe/index.html"
  },
  {
    id: "shortdrama-top50",
    no: 15,
    cat: "video",
    name: "全球短剧平台流量榜 TOP 50",
    en: "SHORT DRAMA TOP 50",
    sub: "50 个短剧平台的流量指数",
    desc: "按估算月下载、月流水与市场覆盖合成流量指数，盘点全球 50 个面向成年观众的剧情短剧平台，标注其市场、变现方式与内容风格。",
    tags: [
      "平台榜",
      "流量指数",
      "市场覆盖"
    ],
    href: "../shortdrama-top50/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/shortdrama-top50/index.html"
  },
  {
    id: "cijing",
    no: 16,
    cat: "video",
    name: "词镜",
    en: "CIJING",
    sub: "说到哪、动到哪的竖屏短视频生成器",
    desc: "把一句口播文案直接变成 9:16 短视频：文案分镜、画面与节奏同步，适合批量做口播、知识科普与带货切片。",
    tags: [
      "短视频生成",
      "9:16",
      "口播",
      "分镜"
    ],
    href: "../cijing/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/cijing/index.html"
  },
  {
    id: "shortgen-2026",
    no: 17,
    cat: "video",
    name: "短视频生成器索引 2026",
    en: "SHORTGEN 2026",
    sub: "33 款模型与工具，按出片链路整理",
    desc: "2026 年 11 月的短视频生成全景索引：Seedance、Kling、海螺、Vidu 等 33 款模型与工具，附价格、横评、成本计算器与工作流对比。",
    tags: [
      "工具索引",
      "33 款",
      "成本计算",
      "工作流"
    ],
    href: "../shortgen-2026/index.html#compare",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/shortgen-2026/index.html#compare"
  },
  {
    id: "lecture",
    no: 18,
    cat: "video",
    name: "讲义 LECTURE",
    en: "LECTURE",
    sub: "AI 知识解说视频的范式与版式库",
    desc: "把知识做成视频，不做成短剧：6 种叙事范式、8 种竖屏版式、4 种幻灯片版式，每种都带样板、参数与引用规范。",
    tags: [
      "知识视频",
      "版式库",
      "方法论",
      "样板"
    ],
    href: "../site/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/site/index.html"
  },
  /* ---- 行业图谱 ---- */
  {
    id: "ai-atlas",
    no: 19,
    cat: "atlas",
    name: "AI Atlas 2026",
    en: "AI ATLAS",
    sub: "全球 AI 网站与 APP 百强",
    desc: "100 个全球 AI 网站与 APP：分类、网址、月访问、下载量、月活与商业模式，一份可筛选、可查证、可下载的 AI 产品地图。",
    tags: [
      "100 强",
      "流量数据",
      "商业模式",
      "产品地图"
    ],
    href: "../ai-atlas/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/ai-atlas/index.html"
  },
  {
    id: "hangzhou-ai-atlas",
    no: 20,
    cat: "atlas",
    name: "杭州 AI 图谱",
    en: "HANGZHOU AI ATLAS",
    sub: "42 家企业、7 条产业链与城市数据",
    desc: "一张城市 AI 产业地图：42 家杭州代表企业、7 条产业链、关键城市数据与政策脉络，用来快速判断一座城市的 AI 结构。",
    tags: [
      "杭州",
      "产业链",
      "城市图谱",
      "企业名录"
    ],
    href: "../hangzhou-ai-atlas/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/hangzhou-ai-atlas/index.html"
  },
  {
    id: "physical-ai-2056",
    no: 21,
    cat: "atlas",
    name: "物理 AI 2056",
    en: "PHYSICAL AI 2056",
    sub: "未来三十年，智能走出屏幕",
    desc: "一份关于物理 AI 的三十年展望：从芯片、本体、基础模型、感知、仿真到场景，梳理 2026–2056 的机会、产业玩家、全球资本路径与关键风险。",
    tags: [
      "物理 AI",
      "三十年展望",
      "产业玩家",
      "资本路径"
    ],
    href: "../physical-ai-2056/index.html#horizon",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/physical-ai-2056/index.html#horizon"
  },
  {
    id: "edge32",
    no: 22,
    cat: "atlas",
    name: "EDGE32",
    en: "EDGE32",
    sub: "ESP32 物理 AI 应用图谱",
    desc: "给产品人的 ESP32 图谱：26 个真实产品与项目、7 条赛道、可复用架构与成本带，以及 2027–2030 年的趋势判断。",
    tags: [
      "ESP32",
      "硬件产品",
      "成本带",
      "趋势"
    ],
    href: "../edge32.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/edge32.html"
  },
  {
    id: "ai-radar",
    no: 23,
    cat: "atlas",
    name: "AI 雷达",
    en: "AI RADAR",
    sub: "实时追踪 AI 新应用",
    desc: "聚合 Hacker News、Product Hunt、GitHub、Hugging Face、机器之心等信源，每 5 分钟自动刷新，用来第一时间发现新的 AI 应用。",
    tags: [
      "实时",
      "多信源",
      "新应用",
      "监控"
    ],
    href: "../ai-radar/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/ai-radar/index.html"
  },
  {
    id: "ai-big-data-100",
    cat: "atlas",
    name: "A/100",
    en: "AI & BIG DATA 100",
    sub: "100 个 AI & Big Data 项目官网索引",
    desc: "把链上 AI & Big Data 赛道里最值得知道的 100 个项目，按市值排位、按赛道归类；每个都附官网与一句话业务说明，从底层算力一路看到应用层。",
    tags: [
      "100 强",
      "官网索引",
      "去中心化算力",
      "数据网络",
      "大数据",
      "链上 AI"
    ],
    href: "../ai-big-data-100/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/ai-big-data-100/index.html",
    no: 24
  },
  {
    id: "china-compute-atlas",
    cat: "atlas",
    name: "算力地理",
    en: "CHINA COMPUTE ATLAS",
    sub: "中国算力中心公开档案",
    desc: "按省份整理国家超算、智算中心、数据中心与算力园区：地址、联系方式、机型、算力、规模与计费口径，未知字段如实留白，支持筛选、详情与对比。",
    tags: [
      "算力中心",
      "超算 / 智算",
      "省份地图",
      "公开档案"
    ],
    href: "../china-compute-atlas/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/china-compute-atlas/index.html",
    no: 25
  },
  /* ---- AI 产品与硬件 ---- */
  {
    id: "lumen",
    no: 26,
    cat: "product",
    name: "LUMEN",
    en: "LUMEN",
    sub: "真正懂审美的 AI 设计智能体",
    desc: "一位会思考、会推演、能交付的 AI 设计智能体：从一句 brief 出发推演方向，最终交付完整的品牌世界，而不只是几张图。",
    tags: [
      "设计 Agent",
      "品牌",
      "创意",
      "交付"
    ],
    href: "../lumen/index.html#faq",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/lumen/index.html#faq"
  },
  {
    id: "botique",
    no: 27,
    cat: "product",
    name: "BOTIQUE",
    en: "BOTIQUE",
    sub: "100 款小型机器人与 AI 伴侣",
    desc: "一份按需求排序、人工筛选的「小型机器人货架」：AI 伴侣、机器宠物与桌面机器人，覆盖价格、续航、订阅陷阱与全球配送。",
    tags: [
      "机器人",
      "AI 伴侣",
      "选品",
      "英文站"
    ],
    href: "../botique/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/botique/index.html"
  },
  {
    id: "shitu",
    no: 28,
    cat: "product",
    name: "识途 SHITU",
    en: "SHITU",
    sub: "会带路的 AI 向导挂件",
    desc: "30 克的 AI 向导挂件：按一下说话，它替你问路；走在路上，它只说一句「前面路口右转」。不掏手机、不看屏，没信号也能带你回家。",
    tags: [
      "AI 硬件",
      "挂件",
      "离线",
      "语音"
    ],
    href: "../pendant-site/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/pendant-site/index.html"
  },
  {
    id: "moqi",
    no: 29,
    cat: "product",
    name: "默契 MOQI",
    en: "MOQI",
    sub: "记得住，也懂分寸的 AI 记忆卡",
    desc: "证件大小的共识式 AI 记忆卡：先征得同意再开始记录，把对话整理成决定、承诺与下一步，并给双方一张回执。",
    tags: [
      "AI 记忆",
      "隐私",
      "共识记录",
      "硬件"
    ],
    href: "../moqi-site/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/moqi-site/index.html"
  },
  {
    id: "slide",
    no: 30,
    cat: "product",
    name: "SLIDE 01",
    en: "SLIDE",
    sub: "把一卷照片，放进口袋",
    desc: "一台口袋里的电子纸幻灯机：2.9 英寸彩色电子纸、12 张照片、一枚 12 档滚轮。不发光，不熄灭——概念产品与品牌官网。",
    tags: [
      "电子纸",
      "概念产品",
      "品牌站",
      "硬件"
    ],
    href: "../slide/index.html",
    src: "http://127.0.0.1:8099/index.html#interaction",
    port: "8099",
    start: "python -m http.server 8099（纯静态，也可直接双击 index.html）"
  },
  /* ---- 商业与撮合 ---- */
  {
    id: "lansuan",
    cat: "business",
    name: "澜算 LANSUAN",
    en: "LANSUAN",
    sub: "把算力做成一份长期资产",
    desc: "GPU 算力整机「采购 → 托管 → 租赁收益」的一站式资产平台：H200 / H100 / RTX 4090 机型、实时收益测算、托管节点网络、资产台账与合伙人分享机制。",
    tags: [
      "GPU 算力",
      "算力资产",
      "托管",
      "收益测算"
    ],
    href: "../lansuan/index.html#top",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/lansuan/index.html#top",
    no: 31
  },
  {
    id: "conflux",
    no: 32,
    cat: "business",
    name: "合流 Conflux",
    en: "CONFLUX",
    sub: "机器人与 AI 产品的融资合伙撮合",
    desc: "面向机器人与 AI 产品团队的融资与合伙撮合平台：TRL 验证、第三方技术尽调、里程碑托管与匿名意向，把一次融资变成一次可验证的交割。",
    tags: [
      "融资撮合",
      "机器人",
      "尽调",
      "托管"
    ],
    href: "../conflux/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/conflux/index.html"
  },
  {
    id: "ailink",
    no: 33,
    cat: "business",
    name: "AILink 智链",
    en: "AILINK",
    sub: "AI 创业者的项目、资本与人才网络",
    desc: "社区型数据平台：项目库、资金库、人才库三库联动，会员可查看核验联系方式，并用 AI 邮件引擎精准触达。首站覆盖杭州与深圳。",
    tags: [
      "创业社区",
      "项目库",
      "会员",
      "AI 邮件"
    ],
    href: "../ailink-community/index.html",
    src: "http://127.0.0.1:4173/#/home",
    port: "4173",
    start: "node serve.mjs（或在 ailink-community 内 npm run dev）",
    serve: true
  },
  {
    id: "zhanggui",
    no: 34,
    cat: "business",
    name: "掌柜 ZHANGGUI",
    en: "ZHANGGUI",
    sub: "你打烊，它开张",
    desc: "面向中文生意场景的 AI 经营系统：7 位 Agent 轮班，从选品、门面、内容、投流到客服复购，你只在花钱与对外发布前点头。",
    tags: [
      "AI 经营",
      "多 Agent",
      "电商",
      "自动化"
    ],
    href: "../zhanggui/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/zhanggui/index.html"
  },
  {
    id: "gift-studio",
    no: 35,
    cat: "business",
    name: "礼序 LIXU",
    en: "LIXU",
    sub: "企业礼品定制所",
    desc: "上传品牌 Logo，在线预览 13 件常用促销品上的真实效果；50 件起订，支持丝印、刺绣、激光雕刻与 UV 彩印。",
    tags: [
      "礼品定制",
      "品牌预览",
      "电商",
      "印刷工艺"
    ],
    href: "../gift-studio/index.html#top",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/gift-studio/index.html#top"
  },
  /* ---- 创意与工具 ---- */
  {
    id: "nexusgate",
    cat: "toolbox",
    name: "NexusGate",
    en: "NEXUSGATE",
    sub: "可自托管的 AI 网关",
    desc: "把 OpenAI、Anthropic、DeepSeek、通义千问、Moonshot 等上游收敛成一套兼容 OpenAI 的接口，在同一套控制台完成鉴权、渠道路由、故障转移、额度计费与调用审计。",
    tags: [
      "AI 网关",
      "自托管",
      "路由",
      "成本核算"
    ],
    href: "http://127.0.0.1:3000/",
    src: "http://127.0.0.1:3000/",
    port: "3000",
    start: "python app.py（在 nexusgate 目录运行）",
    no: 36
  },
  {
    id: "apex",
    cat: "toolbox",
    name: "APEX",
    en: "APEX",
    sub: "智能体时代的 App Store",
    desc: "智能体与算力的全球市场：发现经过验证的智能体，按秒调用全球 GPU，统一计量与结算；附平台规划文档与完整产品原型。",
    tags: [
      "智能体市场",
      "算力市场",
      "GPU",
      "平台规划"
    ],
    href: "../apex/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/apex/index.html",
    live: "http://127.0.0.1:8791/index.html",
    port: "8791",
    start: "python -m http.server 8791（在 apex 目录运行）",
    no: 37
  },
  {
    id: "mosaic",
    cat: "toolbox",
    name: "Mosaic 万象",
    en: "MOSAIC",
    sub: "把一句话，变成能上架的 App",
    desc: "整合顶尖模型矩阵、真实产品设计库与原生 App 交付流水线的一间 AI 工作室；附完整产品规划、多模型编排设计与五视图高保真原型（工作台 / 工作室 / 设计库 / 模型矩阵 / 发布）。",
    tags: [
      "AI App Studio",
      "多模型编排",
      "设计库",
      "高保真原型"
    ],
    href: "../mosaic/prototype/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/mosaic/prototype/index.html",
    alt: "../mosaic/prototype/landing.html",
    altLabel: "营销官网",
    no: 38
  },
  {
    id: "100ideas",
    no: 39,
    cat: "toolbox",
    name: "蜂院长 · 100 个 AI 点子",
    en: "100 IDEAS",
    sub: "100 个能被验证的 AI 赚钱点子",
    desc: "每个点子都写清四件事：谁付钱、第一块钱怎么收、48 小时怎么验证、每周复盘什么。不是灵感清单，是可执行的验证流程。",
    tags: [
      "点子库",
      "变现",
      "48 小时验证",
      "复盘"
    ],
    href: "../100ideas/index.html#ideas",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/100ideas/index.html#ideas"
  },
  {
    id: "bookletai",
    no: 40,
    cat: "toolbox",
    name: "AI 册子工具清单",
    en: "BOOKLETAI 71",
    sub: "71 个「说一句话就出一本册子」的网站",
    desc: "把 BookletAI 同一条链路上的站点全部挑出来：从几乎一模一样的直接竞品，到翻页书、AI 写书、儿童绘本、照片书印刷与中文替代，共 71 个。",
    tags: [
      "工具清单",
      "71 个",
      "AI 册子",
      "竞品"
    ],
    href: "../bookletai-like-sites.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/bookletai-like-sites.html"
  },
  {
    id: "aster",
    cat: "toolbox",
    name: "ASTER",
    en: "ASTER",
    sub: "一个插座，接上所有 AI",
    desc: "全球模型统一网关：OpenAI、Claude、Gemini、DeepSeek 用一个接口、一种货币、一张账单；人民币充值、余额不过期、可开发票，官方 API 与自部署双供给。",
    tags: [
      "模型网关",
      "API 聚合",
      "统一计费",
      "自部署"
    ],
    href: "../aster/stable/index.html",
    src: "http://localhost:8787/",
    live: "http://localhost:8787/",
    port: "8787",
    start: "aster\\start.cmd（实时版）",
    no: 41
  },
  {
    id: "tianshu-cloud",
    cat: "toolbox",
    name: "天枢云 TIANSHU CLOUD",
    en: "TIANSHU CLOUD",
    sub: "一个接口，接入全球前沿大模型",
    desc: "面向企业与开发者的 AI 模型 API 聚合网关：OpenAI 兼容协议，覆盖文本、图像、视频与多模态模型，按量计费、多线路智能路由，分钟级完成接入。",
    tags: [
      "模型网关",
      "API 聚合",
      "OpenAI 兼容",
      "多模态"
    ],
    href: "../tianshu-cloud/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/tianshu-cloud/index.html",
    no: 42
  },
  {
    id: "qiliang",
    cat: "toolbox",
    name: "起量 QILIANG",
    en: "QILIANG",
    sub: "中小业主的 AI 短视频营销工具",
    desc: "给中小业主的自动化营销短视频工具：说一句话，AI 写成片，并适配抖音、视频号、小红书；会员制软件 699/月，商家自己就能持续出片。",
    tags: [
      "AI 短视频",
      "营销获客",
      "会员制",
      "多平台分发"
    ],
    href: "../qiliang/index.html",
    src: "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/qiliang/index.html",
    no: 43
  },
  {
    id: "whiteboard-studio",
    cat: "toolbox",
    name: "Whiteboard Studio",
    en: "WHITEBOARD STUDIO",
    sub: "口播一键转手绘白板图卡",
    desc: "上传真人口播、照片或零素材，自动生成「主播小窗 + 右侧图卡」的 1280×720 讲解视频；三种主播、手绘白板与图文 PPT 两种卡面，配音全程离线。",
    tags: [
      "白板动画",
      "口播转视频",
      "离线配音",
      "本地服务"
    ],
    href: "http://localhost/",
    src: "http://localhost/",
    port: "80",
    start: "whiteboard-studio\\server.py 80",
    no: 44
  },
];

/* ------------------------------------------------------------------ 工具 */

const $ = function (sel, root) { return (root || document).querySelector(sel); };
const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = function (value) { return String(value).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; }); };

const CAT_MAP = Object.fromEntries(CATS.map(function (c) { return [c.id, c]; }));

const state = { q: '', cat: 'all' };

/* ------------------------------------------------------------------ 筛选 */

function currentList() {
  const query = state.q.trim().toLowerCase();
  const terms = query ? query.split(/\s+/) : [];

  return AGENTS.filter(function (a) {
    if (state.cat !== 'all' && a.cat !== state.cat) return false;
    if (!terms.length) return true;
    const hay = [a.name, a.en, a.sub, a.desc, a.tags.join(' '), CAT_MAP[a.cat].name, a.id, a.port || '']
      .join(' ').toLowerCase();
    return terms.every(function (t) { return hay.indexOf(t) !== -1; });
  });
}

/* ------------------------------------------------------------------ 渲染 */

function cardHTML(a) {
  const c = CAT_MAP[a.cat];
  return '<article class="card cat-' + a.cat + '" data-id="' + a.id + '" tabindex="0" role="button" aria-label="查看 ' + esc(a.name) + ' 详情">' +
    '<div class="card-head">' +
      '<span class="chip">' + esc(c.name) + '</span>' +
      '<span class="no">' + String(a.no).padStart(2, '0') + '</span>' +
    '</div>' +
    '<h2 class="card-name">' + esc(a.name) + '<span class="card-en">' + esc(a.en) + '</span></h2>' +
    '<p class="card-sub">' + esc(a.sub) + '</p>' +
    '<div class="card-foot">' +
      '<a class="open-link" href="' + esc(a.href) + '">打开站点 <span aria-hidden="true">↗</span></a>' +
      (a.port ? '<span class="port">:' + a.port + '</span>' : '') +
    '</div>' +
  '</article>';
}

function tabHTML(id, label, count, color) {
  const active = state.cat === id;
  return '<button class="tab' + (active ? ' is-active' : '') + '" type="button" data-cat="' + id + '" aria-pressed="' + active + '">' +
    '<span class="dot"' + (color ? ' style="--c:' + color + '"' : '') + '></span>' +
    esc(label) + '<span class="n">' + count + '</span></button>';
}

function buildTabs() {
  let html = tabHTML('all', '全部', AGENTS.length);
  html += CATS.map(function (c) {
    const n = AGENTS.filter(function (a) { return a.cat === c.id; }).length;
    return tabHTML(c.id, c.name, n, c.color);
  }).join('');
  $('#tabs').innerHTML = html;
}

function render() {
  const list = currentList();

  $('#grid').innerHTML = list.map(cardHTML).join('');
  $('#grid').hidden = list.length === 0;
  $('#empty').hidden = list.length > 0;
  $('#searchClear').hidden = !state.q;

  $$('#tabs .tab').forEach(function (btn) {
    const active = btn.dataset.cat === state.cat;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  const meta = $('#resultMeta');
  $('#sectionLabel').textContent = state.cat === 'all' ? '全部站点' : CAT_MAP[state.cat].name;

  const bar = $('#sectionBar');
  if (bar) bar.style.background = state.cat === 'all' ? 'var(--accent)' : CAT_MAP[state.cat].color;

  let text = '<b>' + list.length + '</b> 个站点';
  if (state.q.trim()) text += ' · 包含「' + esc(state.q.trim()) + '」';
  if (state.cat !== 'all' || state.q.trim()) {
    text += ' <button class="reset-link" type="button" data-reset>清除筛选</button>';
  }
  meta.innerHTML = text;
}

/* ------------------------------------------------------------------ 详情 */

let lastFocus = null;

function absoluteHref(href) {
  try { return new URL(href, location.href).href; } catch (err) { return href; }
}

function detailHTML(a) {
  const c = CAT_MAP[a.cat];
  const abs = absoluteHref(a.href);
  const entryLabel = /^https?:/i.test(a.href) ? '入口地址' : '本地路径';
  return '<div class="d-head">' +
      '<span class="chip cat-' + a.cat + '">' + esc(c.name) + '</span>' +
      '<h2 class="d-name" id="sheetTitle">' + esc(a.name) + '</h2>' +
      '<p class="d-en">' + esc(a.en) + '</p>' +
    '</div>' +
    '<p class="d-sub">' + esc(a.sub) + '</p>' +
    '<p class="d-desc">' + esc(a.desc) + '</p>' +
    '<div class="d-tags">' + a.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
    '<dl class="d-meta">' +
      '<div><dt>' + entryLabel + '</dt><dd>' + esc(abs) + '</dd></div>' +
      '<div><dt>原始地址</dt><dd>' + esc(a.src) + '</dd></div>' +
      '<div><dt>端口</dt><dd>' + (a.port ? ':' + esc(a.port) : '—') + '</dd></div>' +
      '<div><dt>打开方式</dt><dd>' + (a.start ? esc(a.start) : '直接打开 index.html') + '</dd></div>' +
    '</dl>' +
    '<div class="d-actions">' +
      '<a class="btn" href="' + esc(a.href) + '">打开站点 ↗</a>' +
      (a.live ? '<a class="btn ghost" href="' + esc(a.live) + '" target="_blank" rel="noopener">实时服务 ↗</a>' : '') +
      (a.demo ? '<a class="btn ghost" href="' + esc(a.demo) + '">演示模式（示例数据）</a>' : '') +
      (a.alt ? '<a class="btn ghost" href="' + esc(a.alt) + '">' + esc(a.altLabel || '另一入口') + ' ↗</a>' : '') +
      '<button class="btn ghost" type="button" data-copy="' + esc(abs) + '">复制链接</button>' +
    '</div>';
}

function openDetail(id, push) {
  const a = AGENTS.find(function (x) { return x.id === id; });
  if (!a) return;

  $('#sheetContent').innerHTML = detailHTML(a);
  $('#modal').hidden = false;
  document.body.classList.add('no-scroll');
  lastFocus = document.activeElement;
  $('#sheet').focus();

  if (push !== false) {
    try { history.replaceState(null, '', '#' + a.id); } catch (err) { /* noop */ }
  }
}

function closeDetail() {
  const modal = $('#modal');
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('no-scroll');
  try { history.replaceState(null, '', location.pathname + location.search); } catch (err) { /* noop */ }
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

/* ------------------------------------------------------------------ 复制 */

function copyText(text, btn) {
  const done = function () {
    const original = btn.textContent;
    btn.textContent = '已复制';
    setTimeout(function () { btn.textContent = original; }, 1400);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-1000px';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (err) { /* noop */ }
  ta.remove();
}

/* ------------------------------------------------------------------ 事件 */

function resetFilters() {
  state.q = '';
  state.cat = 'all';
  $('#searchInput').value = '';
  render();
  $('#searchInput').focus();
}

function bind() {
  $('#searchInput').addEventListener('input', function (e) {
    state.q = e.target.value;
    render();
  });

  $('#searchClear').addEventListener('click', function () {
    state.q = '';
    $('#searchInput').value = '';
    $('#searchInput').focus();
    render();
  });

  $('#modalClose').addEventListener('click', closeDetail);
  $$('[data-close]').forEach(function (el) { el.addEventListener('click', closeDetail); });

  document.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-close]')) { closeDetail(); return; }

    const reset = ev.target.closest('[data-reset]');
    if (reset) { resetFilters(); return; }

    const copyBtn = ev.target.closest('[data-copy]');
    if (copyBtn) { copyText(copyBtn.dataset.copy, copyBtn); return; }

    const tab = ev.target.closest('[data-cat]');
    if (tab) {
      state.cat = tab.dataset.cat;
      render();
      return;
    }

    const card = ev.target.closest('[data-id]');
    if (card && !ev.target.closest('a')) {
      openDetail(card.dataset.id);
    }
  });

  document.addEventListener('keydown', function (ev) {
    const tag = (document.activeElement && document.activeElement.tagName) || '';

    if (ev.key === 'Escape') {
      if (!$('#modal').hidden) { closeDetail(); return; }
      if (state.q) { state.q = ''; $('#searchInput').value = ''; render(); return; }
    }

    if (ev.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) {
      ev.preventDefault();
      $('#searchInput').focus();
      $('#searchInput').select();
      return;
    }

    if ((ev.key === 'Enter' || ev.key === ' ') && document.activeElement && document.activeElement.classList.contains('card')) {
      ev.preventDefault();
      openDetail(document.activeElement.dataset.id);
      return;
    }

    if (ev.key === 'Enter' && document.activeElement === $('#searchInput')) {
      const first = currentList()[0];
      if (first) { ev.preventDefault(); openDetail(first.id); }
    }
  });
}

/* ------------------------------------------------------------------ 启动 */

function init() {
  const barMeta = document.querySelector('.bar-meta');
  if (barMeta) barMeta.textContent = AGENTS.length + ' 个站点 · 2026';

  const siteCount = $('#siteCount');
  if (siteCount) siteCount.textContent = AGENTS.length;

  buildTabs();
  bind();
  render();

  let hash = '';
  try { hash = decodeURIComponent(location.hash.slice(1)); } catch (err) { hash = ''; }
  if (hash && AGENTS.some(function (a) { return a.id === hash; })) {
    openDetail(hash, false);
  }
}

document.addEventListener('DOMContentLoaded', init);
