import fs from "node:fs";

const checks = [
  ["FreeReels", "freereels", ["https://freereels.com", "https://freereels.tv", "https://freereels.ai"]],
  ["BlinkDrama", "blinkdrama", ["https://blinkdrama.com", "https://blinkdrama.app"]],
  ["ReelyGo", "reelygo", ["https://reelygo.com"]],
  ["FlareFlow", "flareflow", ["https://flareflow.com"]],
  ["DramaShorts", "dramashorts", ["https://dramashorts.com", "https://dramashorts.app"]],
  ["ShortMax", "shortmax", ["https://shortmax.tv", "https://shortmax.com"]],
  ["CandyJarTV", "candyjar", ["https://candyjartv.com", "https://candyjar.tv"]],
  ["Playlet", "playlet", ["https://playlet.com", "https://playlet.app"]],
  ["Shorts", "luni", ["https://luni.app", "https://www.luni.app"]],
  ["DramaBox", "dramabox", ["https://dramabox.app", "https://dramabox.com"]],
  ["Melolo", "melolo", ["https://melolo.com", "https://melolo.tv"]],
  ["NetShort", "netshort", ["https://netshort.com", "https://netshort.app"]],
  ["PineDrama", "pinedrama", ["https://pinedrama.com", "https://pinedrama.tv"]],
  ["FlickReels", "flickreels", ["https://flickreels.com", "https://flickreels.app"]],
  ["KukuTV", "kuku", ["https://kukutv.app", "https://kukutv.tv"]],
  ["StoryTV", "storytv", ["https://storytv.com", "https://storytv.app"]],
  ["QuickTV", "quicktv", ["https://quicktv.tv", "https://quicktv.app"]],
  ["FreeDrama", "freedrama", ["https://freedrama.com", "https://freedrama.app"]],
  ["BibiShort", "bibishort", ["https://bibishort.app"]],
  ["SarosTV", "saros", ["https://sarostv.app"]],
  ["Felveria", "felveria", ["https://felveria.app"]],
  ["SodaTV", "sodatv", ["https://sodatv.app", "https://soda.tv"]],
  ["HotDrama", "hotdrama", ["https://hotdrama.app"]],
  ["PopoVibe", "popovibe", ["https://popovibe.app"]],
  ["MyMuse", "mymuse", ["https://mymuse.app"]],
  ["VibeShort", "vibeshort", ["https://vibeshort.app", "https://vibeshort.tv"]],
  ["StoryReel", "storyreel", ["https://storyreel.app", "https://storyreel.tv"]],
  ["StardustTV", "stardust", ["https://stardusttv.com", "https://stardusttv.app"]],
  ["ShortsWave", "shortswave", ["https://shortswave.com"]],
  ["MoreShort", "moreshort", ["https://moreshort.app"]],
  ["HotMiniDrama", "hotmini", ["https://hotminidrama.com"]],
  ["HaloReels", "haloreels", ["https://haloreels.com"]],
  ["LoveShots", "loveshots", ["https://loveshots.com"]],
  ["StarShort", "starshort", ["https://starshort.com"]],
  ["FlexTV", "flextv", ["https://flextv.com"]],
  ["MangoTV", "mgtv", ["https://www.mgtv.com"]],
  ["Thanks", "", []]
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

function visible(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function check(brand, keyword, url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal, headers: { "user-agent": UA } });
    const html = await res.text();
    const owner = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const site = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)/i);
    const text = visible(html);
    const lower = (html + " " + text).toLowerCase();
    return {
      brand,
      url,
      final: res.url,
      status: res.status,
      title: owner ? owner[1].replace(/\s+/g, " ").trim().slice(0, 70) : "",
      site: site ? site[1].slice(0, 40) : "",
      hasBrand: keyword ? lower.includes(keyword) : false,
      text: text.slice(0, 70)
    };
  } catch (err) {
    return { brand, url, final: "", status: "ERR", title: String(err.message || err).slice(0, 50), site: "", hasBrand: false, text: "" };
  } finally {
    clearTimeout(timer);
  }
}

const jobs = [];
for (const [brand, keyword, urls] of checks) {
  for (const u of urls) jobs.push([brand, keyword, u]);
}

const results = [];
let i = 0;
async function worker() {
  while (i < jobs.length) {
    const [brand, keyword, url] = jobs[i++];
    const r = await check(brand, keyword, url);
    results.push(r);
    console.log(JSON.stringify(r));
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
fs.writeFileSync("C:/Users/Administrator/Documents/deepseek-harness/default-workspace/shortdrama-top50/_preview/probe2.json", JSON.stringify(results, null, 2), "utf8");
console.log("done", results.length);
