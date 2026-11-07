# 天枢云 TIANSHU CLOUD

面向企业与开发者的 AI 模型 API 聚合网关 —— 品牌官网原型（纯静态站点）。

- 品牌：天枢云 / TIANSHU CLOUD
- 主体：杭州天枢云智科技有限公司（拟注册，页面信息为占位）
- 上游：`token.quanxiyun.cloud`（TOTAL RHINO CLOUD）

---

## 本地预览

无需构建、无需服务器，直接双击 `index.html` 即可。

如需更接近线上环境：

```bash
cd tianshu-cloud
python -m http.server 8787
# 打开 http://127.0.0.1:8787
```

---

## 目录

```
tianshu-cloud/
├── index.html            首页
├── models.html           模型广场（搜索 / 筛选，数据来自 models-data.js）
├── pricing.html          价格与计费（文本价格表、图像视频计费、常见问题）
├── docs.html             开发文档（11 节，含 cURL / Python / Node 示例）
├── partners.html         渠道合作（四级代理、佣金测算、结算规则、白标）
├── about.html            关于我们（品牌、公司、合规、联系方式）
├── assets/
│   ├── css/main.css      全部样式与设计变量
│   ├── js/models-data.js 模型与价格数据（更新模型只改这里）
│   ├── js/app.js         导航、筛选、复制、滚动动效
│   └── img/              Logo、favicon、社交封面（SVG）
├── 天枢云-品牌与建站方案.md
└── README.md
```

---

## 上线前必须替换

| 位置 | 当前值 | 替换为 |
| --- | --- | --- |
| 页脚 / 关于页 | 浙ICP备2026XXXXXX号-1（备案中） | 真实 ICP 备案号 |
| 关于页 | 91330110MA2XXXXXXX（办理中） | 统一社会信用代码 |
| 关于页 | 杭州市余杭区仓前街道文一西路 1500 号（以营业执照为准） | 实际注册地址 |
| 全站 | www.tianshuapi.com | 实际域名 |
| 关于页 | business@ / support@ / hello@tianshuapi.com | 实际邮箱 |
| `og:image` | 相对路径 `assets/img/og-cover.svg` | 绝对 URL + PNG（部分平台不解析 SVG） |

外链集中在 `assets/js/models-data.js` 的 `TIANSHU_API` 对象：

```js
registerUrl: "https://token.quanxiyun.cloud/r/HyicS5"  // 注册（带渠道参数）
consoleUrl:  "https://token.quanxiyun.cloud/console"
upstreamUrl: "https://token.quanxiyun.cloud"
```

> 页面中的注册链接为硬编码（便于无 JS 环境也能跳转），替换时请全局搜索 `token.quanxiyun.cloud/r/`。

---

## 更新模型与价格

1. 模型卡片：编辑 `assets/js/models-data.js` 的 `TIANSHU_MODELS` 数组，字段说明：
   - `id` 调用时使用的模型名；`type` 为 `text` / `image` / `video`；
   - 文本模型填 `inPrice` / `outPrice`（¥ / 百万 tokens）；
   - 图像、视频填 `priceText`（如"按张计费"）。
2. 价格表：`pricing.html` 中的 `<table class="data price-table">` 为静态表格，需同步增删行。
3. 价格口径：官方倍率 × 2 USD/百万 tokens × 6.82 汇率；实际扣费叠加实时渠道折扣。
4. 修改后请同步更新页面上的"价格快照"日期。

---

## 修改代理政策

代理等级、佣金比例、门槛与结算规则分布在三处，改动时必须同步：

1. `partners.html` 的四张等级卡片（文案与百分比）；
2. `assets/js/app.js` 中 `CALC_TIERS` 数组（佣金测算器的等级、门槛与费率）；
3. 文案中的"最高 25%"（首页横幅、页面标题、meta description）。

当前政策：L1 10% / L2 15% / L3 20% / L4 25%，门槛分别为 0 / ¥3,000 / ¥20,000 / ¥80,000（近 3 个月月均有效充值）。
佣金按客户实付充值额计算，月结、满 ¥500 提现、T+7 到账、客户归属 12 个月。

> 上线前须用真实毛利与上游分销结算规则复核费率和门槛，详见方案文档第 10.5 节。

---

## 部署

静态托管即可，推荐：

- **阿里云 OSS + CDN**（国内访问、可绑定备案域名）
- 或 Vercel / Cloudflare Pages（海外访问）

Nginx 示例：

```nginx
server {
  listen 443 ssl http2;
  server_name www.tianshuapi.com;
  root /var/www/tianshu-cloud;
  index index.html;
  location / { try_files $uri $uri/ =404; }
}
```

---

## 说明

- 站点所有模型名称与商标归各自权利人所有，仅用于说明可调用的模型范围。
- 模型算力、账号与计费由上游平台提供，页脚与关于页已作披露。
- 详见 `天枢云-品牌与建站方案.md` 中的合规清单与上线路线图。
