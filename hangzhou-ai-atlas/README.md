# 杭州 AI 图谱 / HANGZHOU AI ATLAS

一个无需构建、可离线打开的独立静态网站，用 **42 家代表企业、7 条产业链、6 个核心城区**，梳理杭州人工智能产业的主要经营内容、分类、官网与关键数据。

![站点信息](https://img.shields.io/badge/companies-42-11624f) ![赛道](https://img.shields.io/badge/tracks-7-c94b32) ![数据](https://img.shields.io/badge/updated-2026.11-c9ff7a)

## 快速打开

直接双击 `index.html` 即可。所有资源都在本地，不依赖框架、CDN 或字体服务。

也可以双击 `serve.cmd`，用默认浏览器打开。

> 图片和字体均为系统字体 / 内联 SVG；外链官网需要联网。

## 页面内容

- **Hero**：杭州 AI 城市数据与 42 家代表企业入口
- **产业链**：基础模型与算力、具身智能与机器人、智能物联与视觉、智能终端与出行、产业智能与金融科技、医疗与生命科学、AI 原生应用与数字内容
- **企业索引**：关键词搜索、赛道筛选、城区筛选、仅看上市、CSV 导出
- **企业档案**：主要经营、AI 抓手、关键数据、基础信息、关键节点、来源链接、复制档案链接
- **数据切面**：赛道分布、资本状态、城区密度、成立年代
- **2025—2026 时间线**：政策、上市、融资、中试基地等节点
- **方法与来源**：收录口径、数据边界、完整来源列表、JSON / CSV 下载

## 数据口径

- 收录总部或核心研发团队位于杭州、以 AI 为主要业务或关键增长引擎的代表性企业。
- 不是杭州 938 家 AI 核心企业的全量名录，而是 42 家结构性样本。
- 财务数据优先采用 2025 年年度报告或 2026 年公开季报。
- 未上市公司估值、融资、用户与经营数据采用公开报道或企业口径，并在页面中标注年份和“报道 / 企业口径”。
- “六小龙”标记代表 2025 年前后形成的公众认知，不代表估值、技术或排名。
- 数据截至 **2026-11-01**；不构成投资建议。

## 数据结构

企业数据集中在 `data.js` 的 `window.HZ_AI_DATA.companies`。新增或修改企业时，至少保留：

```js
{
  id: "company-id",
  no: "43",
  name: "企业名",
  en: "COMPANY",
  category: "foundation",       // 7 个 category id 之一
  district: "滨江区",
  founded: 2020,
  status: "成长型",
  statusGroup: "growth",        // listed | unicorn | future | growth | other
  listed: false,
  ticker: "—",
  website: "https://example.com/",
  websiteLabel: "example.com",
  tagline: "一句话定位",
  business: "主要经营内容",
  ai: ["AI 产品 / 技术方向"],
  keywords: "用于搜索的关键词",
  metrics: [
    { value: "10亿元", label: "2025 营收", note: "2025 年报" }
  ],
  sources: [
    { label: "企业官网", url: "https://example.com/" }
  ]
}
```

样本统计（企业数、赛道数、城区数、上市数、独角兽数、三区密度）、筛选、图表、CSV 与详情弹窗都会从 `data.js` 自动重算。城市宏观数据、页面 `<title>` 与 meta description 仍为手工维护，更新企业数量时请一并检查这几处。

## 文件结构

```text
hangzhou-ai-atlas/
├── index.html      # 页面结构
├── styles.css      # 视觉、响应式、打印、减弱动效
├── data.js         # 42 家企业、时间线、统计与来源
├── app.js          # 筛选、检索、图表、弹窗、导出
├── serve.cmd       # 本地打开脚本
├── README.md
└── assets/
    └── favicon.svg
```

## 可访问性与兼容性

- 语义化标题层级、跳转主内容链接、可见焦点样式。
- 企业卡片为整卡按钮，支持键盘 `Tab` / `Enter`。
- 原生 `<dialog>` 弹窗，支持 `Esc` 关闭、焦点返回。
- 支持 `prefers-reduced-motion`。
- 提供打印样式。
- 适配桌面、平板与手机。

建议使用 2023 年之后的 Chrome、Edge、Firefox 或 Safari。

## 主要来源

城市与产业数据：

- [杭州市《加快建设人工智能创新高地实施方案（2025年版）》](https://z.hangzhou.com.cn/sdx/content/content_9022081.html)
- [杭州市统计局：2025 年数字经济核心产业增加值](https://www.hangzhou.gov.cn/col/col1229063407/art/2026/art_5a98b918d54343c0bb542bd1d05f24f3.html)
- [JST Science Portal China：杭州 AI 核心企业 938 家、上半年营收 2705 亿元](https://spap.jst.go.jp/china/news/260902/topic_5_01.html)
- [中国新闻网：杭州提出建设“人工智能创新发展第一城”](https://finance.eastmoney.com/a/202512183595903922.html)
- [中国新闻网：杭州何止“六小龙”](https://www.chinanews.com/cj/2026/07-30/10669116.shtml)
- [杭州日报：从独角兽榜单看科创新生态](https://www.hangzhou.gov.cn/art/2025/4/25/art_812266_59111994.html)

企业与资本市场：

- [证券时报：群核科技港股上市](https://www.stcn.com/article/detail/3758628.html)
- [证券时报：DeepSeek 首轮融资报道](https://stcn.com/article/detail/3904065.html)
- [每日经济新闻：宇树科技上市后首份季报](https://news.qq.com/rain/a/20261028A0DA6300)
- [证券时报：海康威视 2025 年报](https://stcn.com/article/detail/3760899.html)
- [证券时报：同花顺 2025 年报](https://stcn.com/article/detail/3668515.html)
- [上海证券报：萤石网络 2025 业绩快报](https://paper.cnstock.com/html/2026-01/21/content_2172271.htm)
- [清华五道口：深度探索杭州 AI](https://ee.pbcsf.tsinghua.edu.cn/info/1003/1947.htm)

主要来源列表在页面底部“方法与来源”区块；每家企业档案内另有对应官网与补充来源。

## 说明

企业名称、商标与官网内容归各自权利人所有。本页为公开信息整理与可视化，不构成投资建议；如企业信息有更新，以企业官网和最新公开披露为准。
