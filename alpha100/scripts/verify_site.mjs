import fs from "node:fs";
import vm from "node:vm";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ctx = { window: {}, console, Date, Math, JSON };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ["assets/js/market-data.js", "assets/js/strategies.js", "assets/js/results.js", "assets/js/engine.js"]) {
  vm.runInContext(fs.readFileSync(`${root}/${f}`, "utf8"), ctx, { filename: f });
}
const strategies = ctx.window.ALPHA_STRATEGIES;
const meta = ctx.window.ALPHA_META;
const results = ctx.window.ALPHA_RESULTS.byId;
const market = ctx.window.ALPHA_MARKET;
const errors = [];
const ids = new Set();
const backtest = strategies.filter((s) => s.verification === "backtest");

if (strategies.length !== 100) errors.push(`strategies=${strategies.length}`);
if (backtest.length !== 27) errors.push(`backtest=${backtest.length}`);
if (Object.keys(results).length !== 27) errors.push(`results=${Object.keys(results).length}`);
for (const f of meta.families) {
  const n = strategies.filter((s) => s.familyCode === f.code).length;
  if (n !== 10) errors.push(`family ${f.code} has ${n}`);
}
for (const s of strategies) {
  if (ids.has(s.id)) errors.push(`duplicate id ${s.id}`);
  ids.add(s.id);
  for (const k of ["entry", "exit", "risk", "ai", "thesis", "fails", "data", "execution"]) {
    if (!s[k] || String(s[k]).length < 8) errors.push(`${s.id} short ${k}`);
  }
  if (!Array.isArray(s.liveCheck) || s.liveCheck.length < 1) errors.push(`${s.id} liveCheck`);
  if (s.verification === "backtest") {
    const r = results[s.id];
    if (!r || !r.ok) { errors.push(`${s.id} missing result`); continue; }
    for (const k of ["cagr", "sharpe", "maxDD", "trades", "winRate"]) {
      if (!Number.isFinite(r.metrics[k])) errors.push(`${s.id} metric ${k}`);
    }
    if (r.metrics.maxDD > 0) errors.push(`${s.id} maxDD positive`);
    if (!r.series || r.series.e.length < 10) errors.push(`${s.id} series`);
    if (!r.monthly || r.monthly.length < 12) errors.push(`${s.id} monthly`);
    if (!r.splitDate) errors.push(`${s.id} splitDate`);
  } else if (results[s.id]) {
    errors.push(`${s.id} non-backtest has result`);
  }
}
for (const id of Object.keys(results)) {
  const s = strategies.find((x) => x.id === id);
  if (!s || s.verification !== "backtest") errors.push(`result without backtest strategy ${id}`);
}
if (market.dates.length < 2000) errors.push(`market dates ${market.dates.length}`);
if (Object.keys(market.symbols).length < 30) errors.push(`market symbols ${Object.keys(market.symbols).length}`);
console.log(JSON.stringify({
  strategies: strategies.length,
  backtest: backtest.length,
  results: Object.keys(results).length,
  families: meta.families.length,
  marketDates: market.dates.length,
  marketSymbols: Object.keys(market.symbols).length,
  dateRange: [market.dates[0], market.dates[market.dates.length - 1]],
  errors: errors.slice(0, 40),
  errorCount: errors.length,
}, null, 2));
if (errors.length) process.exit(1);
