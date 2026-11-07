# A/100 — AI & Big Data 生态索引

一个不依赖框架、构建工具或外部服务的独立静态网站。把 100 个 AI & Big Data 项目按市值排位整理成可搜索、可筛选、可导出、可直达官网的索引。

## 打开方式

直接双击 `index.html`，用浏览器打开即可。所有数据、样式和脚本都在本地，没有网络请求。

如果需要用本地服务器预览：

```powershell
# 在 ai-big-data-100 目录中
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 页面能力

- **100 条项目记录**：排名、项目名、代币、赛道、官方网址、业务说明和标签。
- **实时搜索**：支持项目名、代币、赛道、简介和标签。
- **六大赛道筛选**：基础设施、算力、数据、智能体、身份隐私、应用工具。
- **三种排序**：市值排名、名称 A–Z、按赛道归类。
- **列表 / 卡片视图**：视图偏好会保存在浏览器本地。
- **项目详情弹窗**：展示完整说明、赛道、排名、官网和 CMC 查询入口。
- **CSV 导出**：把当前筛选结果导出为带 BOM 的 UTF-8 CSV。
- **深链接**：`index.html#project-12` 可以直接打开第 12 名项目。
- **键盘快捷键**：按 `/` 跳到搜索框。
- **响应式与无障碍**：移动端单列布局、语义化标签、可见焦点、`prefers-reduced-motion` 支持。

## 文件结构

```text
ai-big-data-100/
├── index.html              # 页面结构
├── assets/
│   ├── styles.css          # 设计系统与响应式布局
│   ├── data.js             # 100 条项目数据
│   └── app.js              # 搜索、筛选、弹窗、导出
└── README.md
```

## 数据口径

- 以 [CoinMarketCap — AI & Big Data](https://coinmarketcap.com/zh/view/ai-big-data/?tagSlug=ai-big-data) 分类和市值排位为骨架，结合项目官网与公开资料做编辑整理。
- 口径是**可交易的链上项目**，不包含 OpenAI、Anthropic 等未发行代币的 AI 公司。
- 名次是**静态整理快照**，不是实时行情。页面刻意不展示会迅速过期的价格和市值数字；最新数据请通过每个项目的 CMC 查询入口核对。
- 合并后的生态主体按联盟口径只收录一次（例如 Fetch.ai / SingularityNET / Ocean 合并为 Artificial Superintelligence Alliance）。
- 官网优先使用项目主域名；域名可能迁移，访问前请自行核验。
- AI 文化资产仅保留少量生态样本，并在简介中明确标注；收录不代表背书，也不构成投资建议。

## 更新数据

所有内容集中在 `assets/data.js` 的 `window.A100_PROJECTS` 数组里。每条记录如下：

```js
{
  rank: 1,
  name: "NEAR Protocol",
  ticker: "NEAR",
  sector: "infra", // infra | compute | data | agents | privacy | apps
  url: "https://near.org",
  desc: "一句话说明主要业务。",
  tags: ["L1", "链抽象", "AI 执行"]
}
```

改完后刷新页面即可。新增赛道需要同步修改 `assets/app.js` 中的 `SECTORS`，以及 `index.html` 中的赛道卡片。

> 更新排名时，请同时检查项目官网是否仍可访问、代币是否已迁移或合并，避免把旧域名留在索引里。
