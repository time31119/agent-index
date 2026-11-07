# AI Trading Atlas · 独立站点

「全球 AI 交易 TOP 100 与顶尖策略源代码」的静态网站版本。

## 本地打开

直接双击 `index.html` 即可（所有数据与代码都内联在 `assets/js/data.js`，不需要后端）。

更推荐用静态服务器：

```bash
python -m http.server 8765 --directory site
# http://127.0.0.1:8765/
```

## 页面

- `#/` 首页：榜单速览、策略地图、代码预览、方法论
- `#/rankings` TOP 100：搜索、分档筛选、类型筛选、CSV 导出、条目详情
- `#/strategies` 25 个策略族：风险—收益散点图、分类筛选、策略族详情
- `#/strategy/:id` 策略详情：原理、数学、实现要点、风险、指标、完整源码
- `#/code` 代码库：15 个模块、指标、单文件下载
- `#/method` 方法论与盲区
- `#/report` 报告与数据下载

## 数据来源

`assets/js/data.js` 由项目根目录的 `build_site.py` 生成，数据来自：

- `data/top100.py`：100 条榜单
- `strategies/*.py`：15 个策略模块源码
- `output/results.json`：合成数据自检指标
- `output/`：DOCX / XLSX / Markdown 报告

重新生成：

```bash
python build_site.py
```

## 技术

- 纯静态 HTML / CSS / JavaScript，无构建工具、无外部 CDN
- 哈希路由（`#/...`），可直接部署到 GitHub Pages、Netlify、Nginx 或对象存储
- 深色 / 浅色主题，`?theme=light` 可直接指定
- 响应式布局，支持手机、平板与桌面

## 说明

榜单是编辑性重构，不是官方排名；所有回测指标来自合成数据，仅用于验证代码管线，不构成投资建议。
