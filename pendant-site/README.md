# 识途 SHITU · 品牌站 / 原型 / 众筹方案

一个「会带路的 AI 挂件」的完整前端：**品牌落地页 + 手机 Web 原型 + Kickstarter 众筹方案**。

---

## 四个页面

| 页面 | 文件 | 内容 |
|---|---|---|
| 品牌站 | `index.html` | 定位、场景、WAY One 参数与尺寸图、包装清单、**佩戴场景**、**配件（含 lanyard）**、10 款设计、预约表单 |
| 众筹方案 | `crowdfund.html` | 平台门槛、目标测算、奖励档位、项目页文案、视频脚本、预热、风险 |
| 分镜动画 | `video.html` | 75 秒故事板播放器（中英双语字幕 + 合成音效/旁白）+ 镜头表 + SRT 下载 |
| 手机原型 | `prototype.html` | 定位 + 语音输入 + 路线绘制 + 语音播报（可模拟走完） |

---

## 怎么打开

### 品牌站 / 众筹页

**直接双击 `index.html`** 即可。没有构建、没有依赖。

### 手机原型（必须用本地服务器）

浏览器只在 `http://localhost` 或 HTTPS 下才允许**定位**和**麦克风**。直接双击 `prototype.html`（`file://`）会被浏览器禁用这两项，页面顶部会给出提示。

```bash
cd pendant-site
python -m http.server 8000
# 打开 http://localhost:8000/prototype.html
```

手机想看？确保手机和电脑在同一 Wi-Fi，用电脑局域网 IP 访问。但**非 localhost 的 http:// 仍不是安全上下文**，麦克风会被禁——想上手机测，建议用内网穿透给一个 https 地址，或先只看文字/演示路线。

---

## 文件结构

```
pendant-site/
├── index.html          品牌落地页（识途）+ 预约表单
├── crowdfund.html      Kickstarter 众筹执行方案
├── video.html          75 秒分镜动画（播放器 + 镜头表）
├── prototype.html      手机原型外壳
├── concepts.js         10 款设计的参数 + SVG 生成器（被 index / video 引用）
├── assets/
│   ├── style.css       全站共用样式
│   ├── prototype.js    定位 / 语音 / 路线 / 播报 / 画布
│   ├── video.js        分镜动画时间轴与字幕
│   ├── scenes.js       佩戴场景 / 配件 / 尺寸图插画生成器
│   └── subtitles/
│       ├── shitu-cn.srt         中文字幕
│       ├── shitu-en.srt         英文字幕
│       └── shitu-bilingual.srt  中英双语字幕
└── README.md
```

---

## 分镜动画与字幕

`video.html` 是一个 **75 秒的分镜动画（animatic）**：9 个镜头、10 条字幕，用 CSS/JS 在浏览器里按时间轴播放，验证成片节奏。

- 不是实拍视频，没有视频文件；它是给拍摄和剪辑用的“动态故事板”
- **声音是浏览器实时合成的**：底噪 pad、脚步声、手机蜂鸣、转弯震动、雨声、结尾提示音；旁白用系统 TTS 朗读字幕
- 右下角可单独开关「音效」「旁白」；受浏览器自动播放策略限制，**必须点一次播放才会出声**
- 字幕可切换 **中英 / 中文 / EN**
- 三条 SRT 可直接导入 Premiere / Final Cut / DaVinci Resolve，也可上传 YouTube

字幕时间码：

| 片段 | 时间 | 中文 | English |
|---|---|---|---|
| 1 | 00:00.8–00:04.6 | 每次出门，你都要先掏出手机。 | Every time you leave, you reach for your phone. |
| 2 | 00:05.2–00:14.2 | 可你的手，早就满了。 | But your hands are already full. |
| 3 | 00:15.3–00:24.2 | 识途。按一下，说去哪。 | SHITU. Press once. Say where. |
| 4 | 00:25.3–00:28.2 | “去最近的地铁站。” | "Take me to the nearest subway." |
| 5 | 00:28.6–00:31.6 | “直走两百米。” | "Straight for 200 meters." |
| 6 | 00:32.2–00:39.8 | 它只说一句：前面路口，右转。 | It says one thing: turn right at the corner. |
| 7 | 00:40.3–00:51.5 | 不掏手机，不看屏。 | No phone. No screen. |
| 8 | 00:52.2–01:01.5 | 没信号，也认得回家的路。 | No signal. Still knows the way home. |
| 9 | 01:02.2–01:09.5 | 给不会用地图的人。 | For people who don't use maps. |
| 10 | 01:10.2–01:14.5 | 识途。Kickstarter 首发，129 美元起。 | SHITU. Back us on Kickstarter. From $129. |

改字幕时，**同时改 `video.js` 里的 `CUES` 和 SRT 文件**，两边时间码保持一致。

---

## 原型做了什么

1. **定位**：`navigator.geolocation` 取当前位置；拒绝授权则用内置演示起点
2. **目的地**：点演示点、打字、或点麦克风说“去王府井”（`SpeechRecognition`）
3. **路线**：默认用内置模拟路线（带折角，像街道）；填了高德 Key 就调地理编码 + 步行路线
4. **播报**：`speechSynthesis` 中文语音，按“直行 X 米，然后右转”播报
5. **跟随**：点“开始导航”后按 5 米/120ms 模拟前进；勾选真实 GPS 则跟随实际位置
6. **绘制**：Canvas 画路线、已走部分、终点、当前位置、比例尺（不依赖地图瓦片）

### 高德 Key（可选）

在 `prototype.html` 的“设置”里填 **Web 服务 Key**（不是 JS API Key），会调用：

- `restapi.amap.com/v3/geocode/geo` 地址转坐标
- `restapi.amap.com/v3/direction/walking` 步行路线

浏览器直接请求高德可能遇到 CORS 限制；代码里做了失败回退——**调不通就自动用模拟路线**，不影响演示。

---

## 预约表单

静态站没有后端，表单把数据存在浏览器 `localStorage`（键名 `shitu_reservations`），并支持“导出 CSV”。

接真实后端时，把 `index.html` 里 `form.addEventListener('submit', ...)` 中 `save(list)` 之前，换成一次 `fetch('/api/reserve', {...})` 即可。

---

## 怎么改

- **换品牌名**：搜 `识途` / `SHITU`，各页各改一遍；`concepts.js` 里不涉及品牌
- **换主色**：`assets/style.css` 顶部 `--accent`（现在 `#ff6b35`）
- **改设计图**：见 `concepts.js` 里的 `CONCEPTS` 与 `README` 中的参数表（换 `shape` / `screen` / `colors`）
- **改众筹数字**：`crowdfund.html` 里的目标、档位、预算表是静态文本，直接改

---

## 说明与限制

- 设计图是**矢量概念示意图**，不是产品渲染
- 参数、价格、BOM、交付时间均为**目标值**，不是最终数据
- 名称「识途」尚需商标检索（第 9 / 42 类），页面底部已注明
- 本目录**未在真实浏览器中做过自动化测试**；如有显示或交互问题，把控制台报错发我
