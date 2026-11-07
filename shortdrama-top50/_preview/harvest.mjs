import fs from "node:fs";

const map = {
  "ReelShort": "paid/reelshort",
  "DramaBox": "paid/dramabox",
  "DramaWave": "paid/dramawave",
  "NetShort": "paid/netshort",
  "FreeReels": "free/freereels",
  "ShortMax": "paid/shortmax",
  "PineDrama": "free/pinedrama",
  "GoodShort": "paid/goodshort",
  "BlinkDrama": "paid/blinkdrama",
  "StoryReel": "paid/storyreel",
  "VibeShort": "paid/vibeshort",
  "FlickReels": "paid/flickreels",
  "Melolo": "free/melolo",
  "JoyReels": "paid/joyreels",
  "MoboReels": "paid/moboreels",
  "StardustTV": "paid/stardusttv",
  "iDrama": "paid/idrama",
  "My Drama": "paid/my-drama",
  "Kuku TV": "free/kukutv",
  "Story TV": "free/storytv",
  "FreeDrama": "free/freedrama",
  "QuickTV": "free/quicktv",
  "HotMiniDrama": "free/hotminidrama",
  "Halo Reels": "free/halo-reels",
  "CandyJarTV": "paid/candyjartv",
  "Vigloo": "paid/vigloo",
  "Shortical": "paid/shortical",
  "Pocket FM": "paid/pocket-fm",
  "KalosTV": "paid/kalostv",
  "HotDrama": "paid/hotdrama",
  "Shorts": "paid/shorts",
  "Playlet": "paid/playlet",
  "ShortsWave": "paid/shortswave",
  "MoreShort": "paid/moreshort",
  "My Muse": "paid/my-muse",
  "ReelyGo": "paid/reelygo",
  "MoboDrama": "paid/mobodrama",
  "BibiShort": "paid/bibishort",
  "DramaShorts": "paid/dramashorts",
  "ToonShort": "paid/toonshort",
  "Soda TV": "paid/soda-tv",
  "FlexTV": "paid/flextv",
  "PopoVibe": "paid/popovibe",
  "MangoTV": "paid/mangotv",
  "FlareFlow": "paid/flareflow",
  "DramaBox Lite": "paid/dramabox-lite",
  "StarShort": "paid/starshort",
  "SarosTV": "paid/sarostv",
  "LoveShots": "paid/loveshots",
  "Felveria": "paid/felveria"
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const out = {};

async function one(name, slug) {
  const url = `https://www.shortdramadata.com/zh/apps/${slug}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "user-agent": UA } });
    const html = await res.text();
    const ios = [...html.matchAll(/https:\/\/apps\.apple\.com\/[^"'\\\s]+/g)].map((m) => m[0])[0] || "";
    const android = [...html.matchAll(/https:\/\/play\.google\.com\/store\/apps\/details\?id=[^"'\\\s&]+/g)].map((m) => m[0])[0] || "";
    out[name] = { status: res.status, ios, android };
  } catch (e) {
    out[name] = { status: "ERR", ios: "", android: "" };
  } finally {
    clearTimeout(timer);
  }
  console.log(name, out[name].status, out[name].ios ? "ios" : "-", out[name].android ? "android" : "-");
}

const entries = Object.entries(map);
let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < entries.length) {
    const [name, slug] = entries[i++];
    await one(name, slug);
  }
}));

fs.writeFileSync("C:/Users/Administrator/Documents/deepseek-harness/default-workspace/shortdrama-top50/_preview/harvest.json", JSON.stringify(out, null, 2), "utf8");
console.log("done", Object.keys(out).length);
