# 蜂院长 · 100 个 AI 点子

一个纯静态的个人站点：**100 个 AI 赚钱点子 + 实验记录 + 每周复盘**。

没有后端、没有账号、没有数据库。所有修改保存在浏览器 `localStorage`，可以导出 JSON 备份。

![首页](preview-home2.png)

## 怎么打开

### 方式 1：本地服务器（推荐）

在 `100ideas` 目录下运行：

```bash
python -m http.server 8765
```

然后打开：

```
http://127.0.0.1:8765
```

Windows 也可以直接双击 `start-server.bat`。

### 方式 2：直接双击 index.html

双击 `index.html` 也能看，但部分浏览器会限制 `file://` 下的 `localStorage`，导致修改无法保存。建议用方式 1。

## 功能

- **点子库**：100 个点子，支持搜索、分类、状态、难度、排序。
- **详情**：谁付钱、第一块钱怎么收、难度/成本、合规风险；可改状态、下一步、备注。
- **实验记录**：每次实验记一条，填收入、支出、结果、教训；收入自动累计。
- **实验看板**：未验证 → 验证中 → 收到第一块钱 → 放弃，支持拖拽。
- **每周复盘**：记 6 个数（订阅、播放、实验、收入、支出）+ 一句教训 + 下周一件事；自动生成收入曲线。
- **数据备份**：导出/导入 JSON；恢复默认 100 个。
- **深链**：`#idea-001` 可以直接打开某个点子。

## 数据存在哪

- `localStorage` key：`fengyuanzhang.ideas.v1`（点子 + 实验记录）
- `localStorage` key：`fengyuanzhang.reviews.v1`（每周复盘）
- 换电脑/换浏览器：数据页 → 导出 JSON → 在新浏览器导入。
- 清理浏览器数据会丢失记录，**每周复盘后顺手导出一次**。

## 文件结构

```
100ideas/
├─ index.html
├─ assets/
│  ├─ styles.css
│  └─ app.js
├─ data/
│  └─ ideas.js        # 100 个默认点子
├─ preview-*.png      # 截图，可删
├─ start-server.bat
└─ README.md
```

## 部署

把整个 `100ideas` 文件夹上传到任意静态托管即可：

- GitHub Pages：仓库 Settings → Pages → 选择分支/根目录。
- Netlify / Vercel：拖拽文件夹，或连接仓库，Build command 留空，Publish directory 填 `100ideas`。
- 自己的服务器：把文件夹放到 Nginx/Apache 的静态目录。

所有路径都是相对路径，放在子目录也能用。

## 改默认 100 个

编辑 `data/ideas.js` 里的 `window.DEFAULT_IDEAS` 数组，或改 `brand/fengyuanzhang-100-ai-ideas.xlsx` 后重新生成。

每个点子的字段：

```js
{
  id: "001",
  category: "本地商家",
  title: "餐饮差评回复与申诉",
  what: "抓取大众点评/美团差评，生成可执行的回复和申诉材料",
  payer: "餐厅老板",
  first: "先免费改3条，满意后收99元/月",
  difficulty: "低",
  cost: 0,
  risk: "平台规则；不删差评，只回复/申诉",
  rating: 5,
  status: "未验证",
  notes: "",
  next: "",
  logs: []
}
```

> 改了 `data/ideas.js` 之后，如果浏览器里已经有旧数据，需要在“数据”页点“恢复默认 100 个”，或者清掉 localStorage，才会看到新的默认值。

## 一句话

不是让你把 100 个都做完，是让你**每周挑一个，48 小时验证，收到钱就继续，收不到就换下一个**。
