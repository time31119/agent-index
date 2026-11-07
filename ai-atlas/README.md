# AI Atlas 2026

一个不依赖后端的独立静态站点：**全球 AI 网站与 APP 百强**。

- 100 个产品：精心筛选的 100 个 AI 网站/APP；网站榜与 APP 榜各展示前 50 名
- 10 个赛道：通用助手、搜索研究、图像、影像编辑、视频、音频、生产力、编程/Agent、教育、陪伴
- 每个产品包含：分类、网址、公司、国家/地区、上线年份、定价方式、月访问、月下载、MAU、简介与长描述
- 交互：搜索、分类筛选、免费可用、收藏、站点/APP 切换、六种排序、卡片/表格视图、详情弹窗、CSV 导出、深链接

## 打开方式

直接双击 `index.html`，或在本目录启动任意静态服务器：

```powershell
python -m http.server 8080
# 打开 http://127.0.0.1:8080
```

不需要安装依赖、不需要构建。所有数据、样式和脚本都在本地。

## 文件结构

```text
ai-atlas/
├─ index.html              页面结构
├─ assets/
│  ├─ data.js              100 个产品与分类的数据源
│  ├─ app.js               渲染、筛选、排序、详情、CSV
│  ├─ styles.css           视觉与响应式样式
│  ├─ favicon.svg
│  └─ og-cover.svg
└─ README.md
```

## 数据口径

这不是一份官方榜单，也不是严谨的“全球下载量排名”。网站没有统一下载量，APP 的下载量与网站的访问量也无法直接相加。站点采用如下方式呈现：

1. **网站榜**：按 Similarweb 口径的月度访问量排序，取样本中访问量最高的 50 个网站。
2. **APP 榜**：按近 30 天全球双端预估下载量排序，取样本中下载量最高的 50 个 APP。
3. **总榜**：用 `max(月访问, MAU, 月下载 × 3)` 做近似归一化后排序，目的是提供可浏览的目录顺序，不是官方排名。
4. 带 `*` 的下载量或 MAU 为公开资料估算；卡片和详情页均保留原始指标，可切换单一指标排序。

### 数据快照

- 网站访问量：2025 年 10 月，Similarweb / AI 产品榜网站榜。
- APP 下载量：2025 年 10 月，DataEye × 点点数据全球双端预估下载量。
- MAU：2026 年 1 月前后，Sensor Tower / a16z 与公开资料交叉估算。
- 产品信息（公司、上线年份、定价）按 2026 年公开资料整理。

### 主要来源

- [a16z · Top 100 Gen AI Consumer Apps（2026 年 3 月）](https://www.a16z.news/p/top-100-gen-ai-consumer-apps-march)
- [AI 产品榜 · 2025 年 10 月网站榜 TOP100](https://www.szhzxw.cn/102332.html)
- [DataEye × 点点数据 · 2025 年 10 月 AI APP 下载榜](https://www.jiemian.com/article/13608897.html)
- [Sensor Tower · State of Mobile 2026（9to5Mac 摘要）](https://9to5mac.com/2026/01/21/sensor-towers-state-of-mobile-2026-tiktok-dominates-ai-apps-surge-games-lose-ground/)

## 已知局限

- 第三方访问量与下载量存在统计口径差异，且会随时间变化。
- 中国 Android 渠道没有完全计入，部分中国产品的真实规模可能被低估。
- 网站访问量 ≠ 独立用户；下载量 ≠ 活跃用户；MAU 也包含重复账号与多设备。
- 部分产品（如 Canva、Notion、Grammarly）不是纯 AI 原生公司，但生成式 AI 已成为其核心体验，因此纳入“AI-core”样本。
- 估值、收入、付费用户等数据没有统一口径，未放入主表，避免制造虚假精度。

## 修改数据

编辑 `assets/data.js` 的 `products` 数组即可。字段约定：

```js
{
  id: "chatgpt",          // 唯一 id，用于深链接与收藏
  name: "ChatGPT",
  company: "OpenAI",
  country: "美国",
  code: "US",
  year: 2022,
  category: "assistant",  // 对应 categories 中的 id
  type: "both",           // both | web | app
  url: "https://chatgpt.com",
  visits: 6370,           // 百万/月
  downloads: 80.0,        // 百万/月
  mau: 800,               // 百万
  growth: 4.4,            // 网站月环比，可为 null
  pricing: "免费 / Plus $20/月",
  priceType: "freemium",  // free | freemium | paid
  tagline: "一句话定位",
  desc: "卡片短描述",
  long: "详情页长描述",
  tags: ["多模态", "智能体"],
  color: "#10A37F",
  est: false              // true 表示下载/MAU 为估算
}
```

新增或删除产品后，页面顶部的统计、分类计数、CSV 与洞察图表会自动更新。

## 设计说明

- 视觉：纸感底色 + 近黑墨色 + 酸性黄绿，编辑部索引 / 数据台账风格。
- 字体：全部使用系统字体，离线可用；中文优先 PingFang / 微软雅黑。
- 响应式：桌面三列卡片、平板两列、手机单列；表格可横向滚动。
- 无障碍：键盘可操作、焦点可见、`dialog` 原生模态、`prefers-reduced-motion` 降级。
- 所有图标与封面均为本地 SVG，不依赖外部图片或字体 CDN。

## 许可与声明

产品名称、商标与官网归各自所有者。站点仅用于产品研究与信息整理，不构成投资建议，也不代表任何公司官方立场。
