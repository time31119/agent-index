import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const [base, outArg] = process.argv.slice(2);
const OUT = resolve(outArg || "qa"); mkdirSync(OUT, { recursive: true });
const EXE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9600 + Math.floor(Math.random() * 100);
const profile = mkdtempSync(join(tmpdir(), "cdp-intraday-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const child = spawn(EXE, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--allow-file-access-from-files", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"], { stdio: "ignore" });
async function wsUrl() { for (let i = 0; i < 200; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) { const j = await r.json(); if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl; } } catch {} await sleep(100); } throw new Error("no devtools"); }
const ws = new WebSocket(await wsUrl()); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws")); });
let seq = 1; const pending = new Map(); const events = [];
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else if (m.method) events.push(m); };
function send(method, params = {}, sessionId) { const id = seq++; const payload = { id, method, params }; if (sessionId) payload.sessionId = sessionId; ws.send(JSON.stringify(payload)); return new Promise((res, rej) => pending.set(id, { res, rej })); }
let session;
async function ev(expression) { const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }, session); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description || "")); return r.result?.value; }
async function go(url, wait = 1500) { await send("Page.navigate", { url }, session); await sleep(wait); }
async function shot(name) { const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, session); writeFileSync(join(OUT, name), Buffer.from(r.data, "base64")); console.log("shot", name); }
async function full(name) { const m = await send("Page.getLayoutMetrics", {}, session); const { width, height } = m.cssContentSize; const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } }, session); writeFileSync(join(OUT, name), Buffer.from(r.data, "base64")); console.log("full", name, width, height); }
try {
  const t = await send("Target.createTarget", { url: "about:blank" });
  session = (await send("Target.attachToTarget", { targetId: t.targetId, flatten: true })).sessionId;
  await send("Page.enable", {}, session); await send("Runtime.enable", {}, session); await send("Log.enable", {}, session);
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false }, session);
  await go(base + "/", 2400);
  console.log("HOME", await ev(`({h1:document.querySelector('h1')?.innerText, families:document.querySelectorAll('.family-card').length, ticks:document.querySelectorAll('.tick').length, stats:document.querySelectorAll('.stat-block').length})`));
  await full("home-full.png");

  await go(base + "/#/library", 1200);
  console.log("LIB", await ev(`({cards:document.querySelectorAll('.strategy-card').length, count:document.querySelector('#result-count')?.innerText})`));
  await ev(`document.querySelector('#lib-search').value='VWAP'; document.querySelector('#lib-search').dispatchEvent(new Event('input',{bubbles:true}))`); await sleep(350);
  console.log("SEARCH", await ev(`({cards:document.querySelectorAll('.strategy-card').length, count:document.querySelector('#result-count')?.innerText})`));
  await ev(`document.querySelector('#lib-search').value=''; document.querySelector('#lib-search').dispatchEvent(new Event('input',{bubbles:true}))`); await sleep(250);
  await shot("library.png");

  await go(base + "/#/strategy/013", 1300);
  console.log("DETAIL", await ev(`({h1:document.querySelector('.detail-head h1')?.innerText, metrics:document.querySelectorAll('.metric').length, daily:document.querySelectorAll('.daily-bars').length, case:!!document.querySelector('.case-card'), checks:document.querySelectorAll('[data-check]').length})`));
  await full("detail-full.png");

  await go(base + "/#/lab?s=013", 1400);
  console.log("LAB", await ev(`({select:document.querySelector('#lab-strategy')?.value, metrics:document.querySelectorAll('.metric').length, daily:document.querySelectorAll('.daily-bars').length, tabs:document.querySelectorAll('[data-tabs] .tab').length})`));
  await ev(`document.querySelector('#lab-run').click()`); await sleep(1200);
  console.log("LAB RUN", await ev(`({metrics:document.querySelectorAll('.metric').length, verdict:document.querySelector('.lab-verdict h4')?.innerText, toast:document.querySelector('#toast')?.innerText})`));
  await shot("lab.png");

  await go(base + "/#/daily", 1400);
  console.log("DAILY", await ev(`({rows:document.querySelectorAll('.reality-table tbody tr').length, all:document.querySelector('#sim-all')?.innerText, red:document.querySelector('#sim-red')?.innerText, hist:document.querySelectorAll('.sim-hist i').length})`));
  await ev(`document.querySelector('#sim-p').value='55'; document.querySelector('#sim-run').click()`); await sleep(500);
  console.log("DAILY RUN", await ev(`({all:document.querySelector('#sim-all')?.innerText, red:document.querySelector('#sim-red')?.innerText, streak:document.querySelector('#sim-streak')?.innerText})`));
  await full("daily-full.png");

  await go(base + "/#/journal", 1200);
  console.log("JOURNAL", await ev(`({form:!!document.querySelector('#trade-form'), stats:document.querySelectorAll('.journal-stat').length})`));
  await ev(`(() => { const f=document.querySelector('#trade-form'); f.querySelector('[name="pnl"]').value='0.35'; f.querySelector('[name="r"]').value='1.2'; f.querySelector('[name="tags"]').value='测试, 追高'; f.requestSubmit(); })()`); await sleep(500);
  console.log("JOURNAL ADD", await ev(`({rows:document.querySelectorAll('.journal-trades tbody tr').length, green:document.querySelector('.journal-stat strong')?.innerText})`));
  await full("journal-full.png");

  await go(base + "/#/method", 900);
  console.log("METHOD", await ev(`({sections:document.querySelectorAll('.method-body section').length, toc:document.querySelectorAll('.method-toc a').length})`));
  await shot("method.png");

  const errs = events.filter((e) => e.method === "Runtime.exceptionThrown" || (e.method === "Log.entryAdded" && e.params.entry.level === "error"));
  console.log("ERRORS", errs.length ? JSON.stringify(errs).slice(0, 4000) : "none");

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, session);
  await go(base + "/", 1500); await shot("mobile-home.png");
  await ev(`document.querySelector('a[href="#/library"]').click()`); await sleep(1100); await shot("mobile-library.png");
  await ev(`document.querySelector('.strategy-card').click()`); await sleep(900); await shot("mobile-detail.png");
  console.log("DONE");
} finally { ws.close(); child.kill(); }
process.exit(0);
