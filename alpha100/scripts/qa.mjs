import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const [base, outDirArg] = process.argv.slice(2);
const OUT = resolve(outDirArg || "qa");
mkdirSync(OUT, { recursive: true });
const EXE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9800 + Math.floor(Math.random() * 100);
const profile = mkdtempSync(join(tmpdir(), "cdp-alpha-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const child = spawn(EXE, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--no-first-run", "--no-default-browser-check", "--allow-file-access-from-files",
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  "--window-size=1440,1000", "about:blank",
], { stdio: "ignore" });

async function wsUrl() {
  for (let i = 0; i < 200; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) { const j = await r.json(); if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl; }
    } catch {}
    await sleep(100);
  }
  throw new Error("devtools endpoint never came up");
}

const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws")); });
let seq = 1;
const pending = new Map();
const events = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id); pending.delete(msg.id);
    if (msg.error) rej(new Error(JSON.stringify(msg.error))); else res(msg.result);
  } else if (msg.method) events.push(msg);
};
function send(method, params = {}, sessionId) {
  const id = seq++;
  const payload = { id, method, params };
  if (sessionId) payload.sessionId = sessionId;
  ws.send(JSON.stringify(payload));
  return new Promise((res, rej) => pending.set(id, { res, rej }));
}

let session;
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }, session);
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + " " + JSON.stringify(result.exceptionDetails.exception?.description || ""));
  return result.result?.value;
}
async function shot(name) {
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, session);
  writeFileSync(join(OUT, name), Buffer.from(result.data, "base64"));
  console.log("shot", name);
}
async function fullShot(name) {
  const m = await send("Page.getLayoutMetrics", {}, session);
  const { width, height } = m.cssContentSize;
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } }, session);
  writeFileSync(join(OUT, name), Buffer.from(result.data, "base64"));
  console.log("fullshot", name, width, height);
}
async function go(url, wait = 1600) {
  await send("Page.navigate", { url }, session);
  await sleep(wait);
}
function errors() {
  return events.filter((e) => e.method === "Runtime.exceptionThrown" || e.method === "Log.entryAdded" || (e.method === "Runtime.consoleAPICalled" && e.params.type === "error"));
}

try {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const attached = await send("Target.attachToTarget", { targetId, flatten: true });
  session = attached.sessionId;
  await send("Page.enable", {}, session);
  await send("Runtime.enable", {}, session);
  await send("Log.enable", {}, session);
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false }, session);
  await go(base + "/", 2400);
  console.log("HOME", await evaluate(`({title:document.title, cards:document.querySelectorAll('.strategy-card').length, families:document.querySelectorAll('.family-card').length, tick:document.querySelectorAll('.tick').length, h1:document.querySelector('h1')?.innerText, err:document.querySelectorAll('.empty').length})`));
  await fullShot("home-full.png");

  await go(base + "/#/library", 1200);
  console.log("LIB", await evaluate(`({cards:document.querySelectorAll('.strategy-card').length, count:document.querySelector('#result-count')?.innerText, toolbar:!!document.querySelector('#lib-search')})`));
  await evaluate(`document.querySelector('#lib-search').value='配对'; document.querySelector('#lib-search').dispatchEvent(new Event('input',{bubbles:true}))`);
  await sleep(400);
  console.log("SEARCH 配对", await evaluate(`({cards:document.querySelectorAll('.strategy-card').length, count:document.querySelector('#result-count')?.innerText})`));
  await evaluate(`document.querySelector('#lib-search').value=''; document.querySelector('#lib-search').dispatchEvent(new Event('input',{bubbles:true}))`);
  await sleep(300);
  await shot("library.png");

  await go(base + "/#/strategy/004", 1300);
  console.log("DETAIL", await evaluate(`({h1:document.querySelector('.detail-head h1')?.innerText, sections:document.querySelectorAll('.dossier section').length, checks:document.querySelectorAll('[data-check]').length, metrics:document.querySelectorAll('.metric').length, svg:document.querySelectorAll('svg.chart-svg').length})`));
  await fullShot("detail-full.png");
  await evaluate(`document.querySelector('a[href="#/lab?s=004"]').click()`);
  await sleep(1300);
  console.log("LAB", await evaluate(`({select:document.querySelector('#lab-strategy')?.value, metrics:document.querySelectorAll('.metric').length, tabs:document.querySelectorAll('[data-tabs] .tab').length, heat:document.querySelectorAll('.hm-cell').length, run:!!document.querySelector('#lab-run')})`));
  await shot("lab.png");
  await evaluate(`document.querySelector('#lab-run').click()`);
  await sleep(1200);
  console.log("LAB RUN", await evaluate(`({metrics:document.querySelectorAll('.metric').length, verdict:document.querySelector('.lab-verdict h4')?.innerText, tabs:document.querySelectorAll('[data-tabs] .tab').length, heat:document.querySelectorAll('.hm-cell').length, toast:document.querySelector('#toast')?.innerText})`));
  await evaluate(`document.querySelector('[data-tab="monthly"]').click()`);
  await sleep(300);
  console.log("LAB MONTHLY", await evaluate(`({visible:document.querySelector('[data-panel="monthly"]').classList.contains('active'), cells:document.querySelectorAll('[data-panel="monthly"] .hm-cell').length})`));
  await shot("lab-monthly.png");

  await go(base + "/#/journal", 1200);
  console.log("JOURNAL", await evaluate(`({form:!!document.querySelector('#trade-form'), stats:document.querySelectorAll('.journal-stat').length, empty:!!document.querySelector('.empty-state')})`));
  await evaluate(`(() => { const f=document.querySelector('#trade-form'); f.querySelector('[name="pnl"]').value='2.5'; f.querySelector('[name="r"]').value='1.8'; f.querySelector('[name="tags"]').value='测试, 追高'; f.querySelector('[name="note"]').value='QA test'; f.requestSubmit(); })()`);
  await sleep(600);
  console.log("JOURNAL ADD", await evaluate(`({rows:document.querySelectorAll('.journal-trades tbody tr').length, count:document.querySelector('.journal-stat strong')?.innerText, toast:document.querySelector('#toast')?.innerText})`));
  await fullShot("journal-full.png");

  await go(base + "/#/method", 1000);
  console.log("METHOD", await evaluate(`({sections:document.querySelectorAll('.method-body section').length, toc:document.querySelectorAll('.method-toc a').length})`));
  await shot("method.png");

  console.log("PAGE ERRORS:", JSON.stringify(errors(), null, 2).slice(0, 8000) || "none");

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, session);
  await go(base + "/", 1600);
  await shot("mobile-home.png");
  await evaluate(`document.querySelector('a[href="#/library"]').click()`);
  await sleep(1200);
  await shot("mobile-library.png");
  await evaluate(`document.querySelector('.strategy-card').click()`);
  await sleep(1000);
  await shot("mobile-detail.png");

  console.log("DONE");
} finally {
  ws.close();
  child.kill();
}
process.exit(0);
