# 部署到 GitHub Pages（免费）

这个文件夹已经是一个可直接发布的静态站点根目录，共 878 个文件、约 66 MB。

## 目录结构

```
index.html                → 自动跳转到 agent-hub/
agent-hub/                → 我的 Agent 档案馆（44 个条目）
nextact/                  → 次幕 NEXTACT（原根目录首页，独立成子目录）
alpha100/ … 等 39 个目录   → 各静态子站（与目录页里的相对链接一一对应）
assets/ + edge32.html     → 根级页面及其样式资源
.nojekyll                 → 关闭 Jekyll 处理
```

## 上传步骤（推荐 GitHub Desktop）

1. GitHub 新建一个**公开**仓库，例如 `agent-index`（免费账户的 Pages 需要公开仓库）。
2. 打开 GitHub Desktop → File → Add local repository → 选择本文件夹。
3. 填一个提交信息，点 Commit，再点 Publish repository（保持 Public）。
4. 打开仓库网页 → Settings → Pages → Source 选 **Deploy from a branch** → 分支 `main`、目录 `/(root)` → Save。
5. 约 1 分钟后访问：`https://<你的用户名>.github.io/agent-index/`

> 如果仓库名是 `<用户名>.github.io`，地址就是 `https://<用户名>.github.io/`。

## 也可以网页上传

仓库页 → Add file → Upload files，把本文件夹**里面的内容**（不要整个文件夹）拖进去。
文件较多（878 个），网页上传会比较慢，建议用 GitHub Desktop。

## 注意事项

- 目录里的 `http://127.0.0.1:…` 卡片是本地服务（8770 / 8766 / 3000 / 8791 等），GitHub Pages 只托管静态文件，线上访客打不开这些服务；你自己在本机访问线上站点时，如果本地服务在跑，仍然可以点开。
- ASTER 用的是本地静态快照（`aster/stable/index.html`），可以正常在线浏览。
- 所有不带 `http://` 的卡片链接都已在本地校验过，44 个入口全部能打开。
- 更新内容后，重新执行一次打包，或在 GitHub Desktop 里提交改动即可自动重新发布。