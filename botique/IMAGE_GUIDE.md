# BOTIQUE 真实商品图接入指南

> 真实收款发货的站点，商品卡和详情页必须优先使用**品牌授权的真实商品图**；插画只做缺图 fallback。

当前状态：**12 / 100 款已接入真实图**（官方/零售公开素材，标记 `official-demo`）。  
覆盖清单：[`data/image-status.csv`](data/image-status.csv)

**可售规则：只有 `IMAGES` 里有条目的商品 `p.launch = true`，才会出现在加购与结账；其余 88 款为 Index only，只展示到货通知，不接受订单。**

---

## 1. 为什么没有直接抓 100 张 Amazon 图

Amazon、品牌官网和零售商的商品图**不是默认可商用素材**。直接抓进真实收款站有：

- 品牌方/摄影师著作权投诉风险；
- Amazon 图片使用条款风险（尤其导流到站外）；
- 图片与实物批次/颜色不一致，导致退货和差评；
- 未授权使用品牌 Logo、人物、IP 联名（儿童玩具尤其明显）。

所以当前策略是：

1. 官方图先标记 `official-demo`，用于搭建/评审；
2. 正式上线前替换为品牌授权素材，或你们自己拍摄；
3. 没图的 SKU 用唯一 SVG 插画 fallback，不冒充实拍。

如果你确认“先用公开零售图跑 demo，上线前统一替换”，可以继续批量填；但必须保留来源和替换清单。

---

## 2. 图片规格

| 用途 | 尺寸 | 格式 | 要求 |
| --- | --- | --- | --- |
| 商品卡 | 1200×1200 | WebP | 1:1，白底/透明底，主体占 80% |
| 详情主图 | 2000×2000 | WebP | 1:1，白底/透明底 |
| 细节图 | 2000×2000 | WebP | 接口、材质、屏幕、轮子/腿 |
| 场景图 | 2000×1500 | WebP | 真实使用场景，不加文字水印 |
| 包装/配件 | 2000×2000 | WebP | 箱内清单、充电座、说明书 |

- sRGB，单张 < 300KB。
- 透明底优先，能放在 BOTIQUE 的彩色卡片上。
- 不要用 300px 图放大到详情页；低清图只做缩略图。

---

## 3. 目录命名

```text
assets/products/
├── eilik/
│   ├── 01.webp        # 主图
│   └── 02.webp        # 场景图
├── loona/
│   └── 01.webp
├── joy-for-all-pup/
│   └── 01.webp
└── ...
```

目录名必须与 `data.js` 的 `id` 完全一致。

---

## 4. 在 `data.js` 登记

打开 [`assets/js/data.js`](assets/js/data.js)，底部 `const IMAGES = { ... }`：

```js
'your-product-id': {
  files: [
    'assets/products/your-product-id/01.webp',
    'assets/products/your-product-id/02.webp'
  ],
  alt: 'Product name, colour, what is visible',
  source: 'https://brand.example/product-page',
  credit: 'Brand name',
  rights: 'authorized',       // official-demo | authorized | own-photo
  layout: 'cutout'            // cutout（默认）| lifestyle
}
```

- `layout: 'lifestyle'`：手持/场景横图，卡片和详情主图用 `object-fit: cover`。
- `rights` 只用三种值：`official-demo`、`authorized`、`own-photo`。
- 上线前把所有 `official-demo` 改成 `authorized` 或 `own-photo`，并保留授权邮件/合同。

---

## 5. 当前已接入的 12 款

| 商品 | 图源 | 状态 |
| --- | --- | --- |
| Eilik | Energize Lab 官网 | official-demo |
| Eiliko | Energize Lab 官网 | official-demo |
| Loona | KEYi Tech 官网/零售图 | official-demo |
| EMO | Living.AI 官网 | official-demo |
| AIBI | Living.AI 官网 | official-demo |
| Moflin | Casio 官网 | official-demo |
| Joy for All Pup | Ageless Innovation 官网 | official-demo |
| Miko 3 | Miko 官网 | official-demo |
| Miko Mini | Miko 官网 | official-demo |
| Sphero BOLT | Sphero 官网 | official-demo |
| Sphero Mini | Sphero 官网 | official-demo |
| DJI Neo | DJI 官网 | official-demo |

---

## 6. 还缺的 88 款怎么补

优先级：

1. **Top 20**：先补 Ropet、EBO SE、BubblePal、Fuzozo、EBO Air 2、Loona DeskMate、Pophie、loviPeer。
2. **$150–$500 主力带**：EBO Air 2 Plus、Petoi、Loona DeskMate、DJI/Sphero 其余型号。
3. **长尾**：STEM 套件、RC 玩具、低价白牌。

拿图渠道（按合法性排序）：

1. 品牌方/总代提供的 press kit / asset pack（最好）；
2. 你们自己拍摄的实物图（最稳）；
3. 品牌书面授权的经销商素材；
4. 公开零售图（只做 demo，上线前替换）。

---

## 7. 验收清单

- [ ] 每款至少 1 张主图 + 1 张场景/细节图
- [ ] 主图 1:1，主体完整，不被裁切
- [ ] 透明底/白底，放在彩色卡片上无白框
- [ ] 颜色/型号与当前 SKU 一致
- [ ] alt 写清品牌 + 型号 + 颜色
- [ ] `source`/`credit`/`rights` 已填
- [ ] 上线前无 `official-demo` 残留
- [ ] 图片压缩到 WebP，单张 < 300KB
- [ ] 移动端 390px 下主体仍可辨认

---

## 8. 技术行为

- 有 `images` 条目：卡片、详情、购物袋、结账摘要、搜索、OG 自动用真实图。
- 没有条目：自动回退到唯一 SVG 插画，不破图。
- 多张图：详情缩略图按 `files` 顺序展示，主图可切换。
- `layout: 'lifestyle'`：full-bleed 裁切，适合手持/场景图。
- 图片 404 不会自动回退（浏览器 `<img>` 限制）；上线前跑一遍链接检查。
