import fs from "node:fs";
import path from "node:path";

const PORT = Number(process.env.CDP_PORT || 9333);
const URL_ = "file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/shortdrama-top50/index.html";
const OUT = "C:/Users/Administrator/Documents/deepseek-harness/default-workspace/shortdrama-top50/_preview";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findPage() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page) return page;
    } catch {}
    await sleep(300);
  }
  throw new Error("devtools not reachable");
}

const page = await findPage();
const ws = new WebSocket(page.webSocketDebuggerUrl);
let seq = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};
await new Promise((res) => (ws.onopen = res));

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

async function shot(name, expr, wait = 700) {
  if (expr) await send("Runtime.evaluate", { expression: expr, awaitPromise: true });
  await sleep(wait);
  const res = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  if (!res.result || !res.result.data) throw new Error("screenshot failed: " + JSON.stringify(res).slice(0, 300));
  fs.writeFileSync(path.join(OUT, name), Buffer.from(res.result.data, "base64"));
  console.log("wrote", name);
}

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false
});
await send("Page.navigate", { url: URL_ });
await sleep(1400);
await send("Runtime.evaluate", { expression: "document.documentElement.style.scrollBehavior='auto'" });

const errors = await send("Runtime.evaluate", {
  expression: "JSON.stringify({rows: document.querySelectorAll('.item').length, h: document.documentElement.scrollHeight, first: document.querySelector('.pname')?.textContent})",
  returnByValue: true
});
console.log("page state:", errors.result?.result?.value);

await shot("shot-top.png", "window.scrollTo(0,0)");

await shot("shot-ranking.png",
  "(function(){var el=document.querySelector('#ranking'); window.scrollTo(0, el.getBoundingClientRect().top+window.scrollY-84);})();", 800);

await shot("shot-mid.png",
  "(function(){var el=document.querySelectorAll('.item')[24]; window.scrollTo(0, el.getBoundingClientRect().top+window.scrollY-200);})();", 800);

const dbg = await send("Runtime.evaluate", {
  expression: `(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return Math.round(b.left) + '-' + Math.round(b.right); };
    const head = [...document.querySelector('.board-head').children].map(r);
    const row = [...document.querySelector('.row').children].map(r);
    return JSON.stringify({ head, row });
  })()`,
  returnByValue: true
});
console.log("columns debug:", dbg.result?.result?.value);

const smoke = await send("Runtime.evaluate", {
  expression: `(() => {
    const q = document.getElementById('q');
    const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));
    q.value = '九州'; fire(q, 'input');
    const searchHits = document.querySelectorAll('.item').length;
    q.value = ''; fire(q, 'input');
    document.querySelector('.chip[data-filter="model"][data-value="IAA"]').click();
    const iaaCount = document.querySelectorAll('.item').length;
    document.querySelector('.chip[data-filter="model"][data-value="all"]').click();
    const allCount = document.querySelectorAll('.item').length;
    const s = document.getElementById('sort');
    s.value = 'revenue'; fire(s, 'change');
    const topByRevenue = document.querySelector('.pname').textContent;
    s.value = 'score'; fire(s, 'change');
    const exts = [...document.querySelectorAll('.ext')];
    const extCount = exts.length;
    const allHttps = exts.every(a => a.href.startsWith('https://'));
    const beforeOpen = document.querySelectorAll('.item.open').length;
    exts[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const afterOpen = document.querySelectorAll('.item.open').length;
    return JSON.stringify({ searchHits, iaaCount, allCount, topByRevenue, back: document.querySelector('.pname').textContent, extCount, allHttps, beforeOpen, afterOpen });
  })()`,
  returnByValue: true
});
console.log("smoke:", smoke.result?.result?.value ?? JSON.stringify(smoke).slice(0, 600));

await shot("shot-detail.png",
  "document.querySelector('.row').click(); (function(){var el=document.querySelector('.item'); var y=el.getBoundingClientRect().top+window.scrollY-84; window.scrollTo(0,y);})();", 900);

await shot("shot-charts.png",
  "(function(){var el=document.querySelector('#structure'); var y=el.getBoundingClientRect().top+window.scrollY-84; window.scrollTo(0,y);})();", 900);

await shot("shot-method.png",
  "(function(){var el=document.querySelector('#method'); var y=el.getBoundingClientRect().top+window.scrollY-84; window.scrollTo(0,y);})();", 900);

await shot("shot-sources.png",
  "(function(){var el=document.querySelector('#sources'); var y=el.getBoundingClientRect().top+window.scrollY-84; window.scrollTo(0,y);})();", 900);

// mobile view — fresh load so no row is expanded
await send("Emulation.setDeviceMetricsOverride", {
  width: 390, height: 844, deviceScaleFactor: 2, mobile: true
});
await send("Page.navigate", { url: URL_ });
await sleep(1200);
await send("Runtime.evaluate", { expression: "document.documentElement.style.scrollBehavior='auto'" });
await shot("shot-mobile.png",
  "(function(){var el=document.querySelector('#ranking'); window.scrollTo(0, el.getBoundingClientRect().top+window.scrollY-20);})();", 900);

ws.close();
process.exit(0);
