import fs from "node:fs";

const harvest = JSON.parse(
  fs.readFileSync("C:/Users/Administrator/Documents/deepseek-harness/default-workspace/shortdrama-top50/_preview/harvest.json", "utf8")
);

// 官网：仅在抓取到明确品牌标题/站点名时收录（部分站点会拦截自动抓取，浏览器可正常访问）
const sites = {
  "ReelShort": "https://www.reelshort.com",
  "DramaBox": "https://www.dramabox.com",
  "DramaWave": "https://drama-wave.com",
  "NetShort": "https://netshort.com",
  "JoyReels": "https://www.joyreels.com",
  "MoboReels": "https://www.moboreels.com",
  "iDrama": "https://www.idrama.com",
  "My Drama": "https://my-drama.com",
  "Kuku TV": "https://kukutv.app",
  "Story TV": "https://storytv.app",
  "FreeDrama": "https://freedrama.app",
  "QuickTV": "https://quicktv.app",
  "HotMiniDrama": "https://www.hotminidrama.com",
  "CandyJarTV": "https://candyjartv.com",
  "Vigloo": "https://www.vigloo.com",
  "Shortical": "https://shortical.com",
  "Pocket FM": "https://pocketfm.com",
  "KalosTV": "https://www.kalostv.com",
  "HotDrama": "https://hotdrama.app",
  "Playlet": "https://www.playlet.com",
  "ShortsWave": "https://www.shortswave.com",
  "MoboDrama": "https://www.mobodrama.com",
  "ToonShort": "https://www.toonshort.com",
  "MangoTV": "https://www.mgtv.com",
  "DramaBox Lite": "https://www.dramabox.com"
};

const order = [
  "ReelShort", "DramaBox", "DramaWave", "NetShort", "FreeReels", "ShortMax", "PineDrama",
  "GoodShort", "BlinkDrama", "StoryReel", "VibeShort", "FlickReels", "Melolo", "JoyReels",
  "MoboReels", "StardustTV", "iDrama", "My Drama", "Kuku TV", "Story TV", "FreeDrama",
  "QuickTV", "HotMiniDrama", "Halo Reels", "CandyJarTV", "Vigloo", "Shortical", "Pocket FM",
  "KalosTV", "HotDrama", "Shorts", "Playlet", "ShortsWave", "MoreShort", "My Muse", "ReelyGo",
  "MoboDrama", "BibiShort", "DramaShorts", "ToonShort", "Soda TV", "FlexTV", "PopoVibe",
  "MangoTV", "FlareFlow", "DramaBox Lite", "StarShort", "SarosTV", "LoveShots", "Felveria"
];

const missing = order.filter((n) => !harvest[n]);
if (missing.length) console.log("MISSING harvest:", missing.join(", "));

const rows = order.map((name) => {
  const h = harvest[name] || { ios: "", android: "" };
  const entry = { site: sites[name] || "", ios: h.ios || "", android: h.android || "" };
  return `  ${JSON.stringify(name)}: ${JSON.stringify(entry)}`;
});

const block =
  "\n\n/* ── 平台入口 ─────────────────────────────────────────────\n" +
  " * site: 官方站点（2026-11-02 抓取校验；部分站点会拦截自动抓取，浏览器可正常访问）\n" +
  " * ios / android: 应用商店正式页（取自 Short Drama Data 的公开链接）\n" +
  " */\n" +
  "window.SD_LINKS = {\n" + rows.join(",\n") + "\n};\n";

const file = "C:/Users/Administrator/Documents/deepseek-harness/default-workspace/shortdrama-top50/assets/js/data.js";
let src = fs.readFileSync(file, "utf8");
const marker = "\n\n/* ── 平台入口";
const idx = src.indexOf(marker);
if (idx > -1) src = src.slice(0, idx);
fs.writeFileSync(file, src.replace(/\s*$/, "") + block, "utf8");

const withSite = rows.filter((r) => r.includes('"site":"https')).length;
console.log("links written:", rows.length, "with site:", withSite);
