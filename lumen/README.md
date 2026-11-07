# LUMEN — The Design Agent

一个受 Lovart 启发的原创 AI 设计智能体概念站。纯静态实现，无构建步骤、无前端框架、无外部图片依赖。

## 查看

直接双击 `index.html` 即可。Windows 上也可以双击 `serve.cmd`，自动启动本地服务器并打开 <http://localhost:8080>。

若浏览器限制本地文件，也可在目录中运行：

```powershell
python -m http.server 8080
```

然后打开 <http://localhost:8080>。

## 结构

- `index.html` — 完整单页结构
- `styles.css` — 视觉系统、响应式布局与动效
- `app.js` — 交互与 ChatCanvas 概念演示
- `assets/muse-*.svg` — 六张本地生成的海报艺术资产
- `assets/favicon.svg` — 站点图标

## 可交互内容

- Hero 提示词输入、快捷示例、六张 Muse 海报（悬停光晕 + 点击带入工作台）
- ChatCanvas 概念演示：发送任意 brief 后，Lumen 思考、更新画板、切换视觉方向
- 三块画板可点选/键盘选择，并触发对话反馈
- 作品筛选、案例详情弹窗、从案例一键开始同款方向
- 定价月付/年付切换
- FAQ 手风琴、登录弹窗、移动端菜单、滚动进度与光标跟随微交互
- 完整的 `prefers-reduced-motion` 适配

## 说明

LUMEN 为原创概念品牌，与 Lovart 无关联。页面中的客户、作品、评价、数据与价格均为演示内容；登录与分享不会向任何服务器发送数据。所有图像视觉均由本地 CSS/SVG 构成，Google Fonts 加载失败时会自动回退到系统字体。
