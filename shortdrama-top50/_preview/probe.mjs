import fs from "node:fs";

const targets = [
  ["ReelShort", ["https://www.reelshort.com"]],
  ["DramaBox", ["https://www.dramabox.com", "https://dramabox.com", "https://drama-box.com", "https://dramabox.app"]],
  ["DramaWave", ["https://www.dramawave.com", "https://dramawave.com", "https://drama-wave.com"]],
  ["NetShort", ["https://www.netshort.com", "https://netshort.com", "https://net-short.com"]],
  ["FreeReels", ["https://www.freereels.com", "https://freereels.com", "https://freereels.app"]],
  ["ShortMax", ["https://www.shortmax.com", "https://shortmax.com", "https://shortmax.tv"]],
  ["PineDrama", ["https://www.pinedrama.com", "https://pinedrama.com", "https://pine-drama.com"]],
  ["GoodShort", ["https://www.goodshort.com", "https://goodshort.com"]],
  ["BlinkDrama", ["https://www.blinkdrama.com", "https://blinkdrama.com", "https://blink-drama.com"]],
  ["StoryReel", ["https://www.storyreel.com", "https://storyreel.com"]],
  ["VibeShort", ["https://www.vibeshort.com", "https://vibeshort.com"]],
  ["FlickReels", ["https://www.flickreels.com", "https://flickreels.com"]],
  ["Melolo", ["https://www.melolo.com", "https://melolo.com", "https://melolo.app"]],
  ["JoyReels", ["https://www.joyreels.com", "https://joyreels.com"]],
  ["MoboReels", ["https://www.moboreels.com", "https://moboreels.com"]],
  ["StardustTV", ["https://www.stardusttv.com", "https://stardusttv.com", "https://stardust.tv"]],
  ["iDrama", ["https://www.idrama.com", "https://idrama.com", "https://i-drama.com"]],
  ["My Drama", ["https://www.mydrama.com", "https://mydrama.com", "https://my-drama.com"]],
  ["Kuku TV", ["https://www.kukutv.com", "https://kukutv.com", "https://kukutv.in"]],
  ["Story TV", ["https://www.storytv.com", "https://storytv.com", "https://storytv.in"]],
  ["FreeDrama", ["https://www.freedrama.com", "https://freedrama.com"]],
  ["QuickTV", ["https://www.quicktv.com", "https://quicktv.com", "https://quicktv.in"]],
  ["HotMiniDrama", ["https://www.hotminidrama.com", "https://hotminidrama.com"]],
  ["Halo Reels", ["https://www.haloreels.com", "https://haloreels.com"]],
  ["CandyJarTV", ["https://www.candyjartv.com", "https://candyjartv.com", "https://candyjar.tv"]],
  ["Vigloo", ["https://www.vigloo.com", "https://vigloo.com"]],
  ["Shortical", ["https://www.shortical.com", "https://shortical.com"]],
  ["Pocket FM", ["https://www.pocketfm.com", "https://pocketfm.com", "https://pocketfm.in"]],
  ["KalosTV", ["https://www.kalostv.com", "https://kalostv.com"]],
  ["HotDrama", ["https://www.hotdrama.com", "https://hotdrama.com"]],
  ["Shorts", ["https://www.shorts.com", "https://shorts.com", "https://www.luni.app"]],
  ["Playlet", ["https://www.playlet.com", "https://playlet.com", "https://playlet.app"]],
  ["ShortsWave", ["https://www.shortswave.com", "https://shortswave.com"]],
  ["MoreShort", ["https://www.moreshort.com", "https://moreshort.com"]],
  ["My Muse", ["https://www.mymuse.com", "https://mymuse.com"]],
  ["ReelyGo", ["https://www.reelygo.com", "https://reelygo.com"]],
  ["MoboDrama", ["https://www.mobodrama.com", "https://mobodrama.com"]],
  ["BibiShort", ["https://www.bibishort.com", "https://bibishort.com"]],
  ["DramaShorts", ["https://www.dramashorts.com", "https://dramashorts.com"]],
  ["ToonShort", ["https://www.toonshort.com", "https://toonshort.com"]],
  ["Soda TV", ["https://www.sodatv.com", "https://sodatv.com"]],
  ["FlexTV", ["https://www.flextv.com", "https://flextv.com"]],
  ["PopoVibe", ["https://www.popovibe.com", "https://popovibe.com"]],
  ["MangoTV", ["https://www.mgtv.com", "https://www.mangotv.com"]],
  ["FlareFlow", ["https://www.flareflow.com", "https://flareflow.com"]],
  ["DramaBox Lite", ["https://www.dramabox.com"]],
  ["StarShort", ["https://www.starshort.com", "https://starshort.com"]],
  ["SarosTV", ["https://www.sarostv.com", "https://sarostv.com"]],
  ["LoveShots", ["https://www.loveshots.com", "https://loveshots.com"]],
  ["Felveria", ["https://www.felveria.com", "https://felveria.com"]]
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

async function check(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal, headers: { "user-agent": UA } });
    const html = await res.text();
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = m ? m[1].replace(/\s+/g, " ").trim().slice(0, 90) : "";
    return { status: res.status, final: res.url, title };
  } catch (err) {
    return { status: "ERR", final: "", title: String(err.message || err).slice(0, 70) };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
const queue = [...targets];
const workers = Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const [brand, urls] = queue.shift();
    let row = null;
    for (const u of urls) {
      const r = await check(u);
      row = { brand, tried: u, ...r };
      if (r.status === 200) break;
    }
    results.push(row);
    console.log(JSON.stringify(row));
  }
});

await Promise.all(workers);
results.sort((a, b) => a.brand.localeCompare(b.brand));
fs.writeFileSync("C:/Users/Administrator/Documents/deepseek-harness/default-workspace/shortdrama-top50/_preview/probe.json", JSON.stringify(results, null, 2), "utf8");
console.log("done", results.length);
