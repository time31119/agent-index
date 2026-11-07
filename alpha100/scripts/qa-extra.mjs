import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base = process.argv[2];
const EXE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9700 + Math.floor(Math.random() * 100);
const profile = mkdtempSync(join(tmpdir(), "cdp-alpha-x-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const child = spawn(EXE, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
async function wsUrl() {
  for (let i = 0; i < 200; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) { const j = await r.json(); if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl; } } catch {}
    await sleep(100);
  }
  throw new Error("no devtools");
}
const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws")); });
let seq = 1; const pending = new Map(); const events = [];
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else if (m.method) events.push(m); };
function send(method, params = {}, sessionId) { const id = seq++; const payload = { id, method, params }; if (sessionId) payload.sessionId = sessionId; ws.send(JSON.stringify(payload)); return new Promise((res, rej) => pending.set(id, { res, rej })); }
let session;
async function ev(expression) { const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }, session); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description || "")); return r.result?.value; }
async function go(url, wait = 1500) { await send("Page.navigate", { url }, session); await sleep(wait); }
try {
  const t = await send("Target.createTarget", { url: "about:blank" });
  session = (await send("Target.attachToTarget", { targetId: t.targetId, flatten: true })).sessionId;
  await send("Page.enable", {}, session); await send("Runtime.enable", {}, session);
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false }, session);

  await go(base + "/", 2200);
  await ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}))`);
  await sleep(400);
  console.log("COMMAND OPEN", await ev(`({modal:!!document.querySelector('.command'), items:document.querySelectorAll('.command-item').length})`));
  await ev(`(() => { const i=document.querySelector('#command-search'); i.value='配对'; i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await sleep(300);
  console.log("COMMAND SEARCH", await ev(`({items:document.querySelectorAll('.command-item').length, first:document.querySelector('.command-item')?.innerText})`));
  await ev(`document.querySelector('.command-item')?.click()`);
  await sleep(900);
  console.log("COMMAND GOTO", await ev(`({hash:location.hash, h1:document.querySelector('.detail-head h1')?.innerText})`));

  await go(base + "/#/method", 1000);
  await ev(`document.querySelectorAll('.method-toc a')[1].click()`);
  await sleep(700);
  console.log("METHOD TOC", await ev(`({hash:location.hash, y:window.scrollY, active:document.querySelector('.method-toc a.active')?.innerText})`));

  await go(base + "/#/strategy/001", 1000);
  await ev(`document.querySelector('[data-check]').click()`);
  await sleep(250);
  await send("Page.reload", {}, session);
  await sleep(1200);
  console.log("CHECK PERSIST", await ev(`({checked:document.querySelector('[data-check]')?.checked, runs:localStorage.getItem('alpha100.checks.v1')?.length||0})`));

  await go(base + "/#/lab?s=021", 1200);
  console.log("NONBT LAB", await ev(`({nonbt:!!document.querySelector('.nonbt'), disabled:document.querySelector('#lab-run')?.disabled, protocol:document.querySelectorAll('.nonbt .protocol li').length})`));

  await go(base + "/#/nope", 800);
  console.log("404", await ev(`({text:document.querySelector('#app h1')?.innerText})`));
  const errs = events.filter((e) => e.method === "Runtime.exceptionThrown" || (e.method === "Log.entryAdded" && e.params.entry.level === "error"));
  console.log("ERRORS", errs.length ? JSON.stringify(errs).slice(0, 2000) : "none");
} finally { ws.close(); child.kill(); }
process.exit(0);
