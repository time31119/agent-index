import fs from "node:fs";
import vm from "node:vm";
const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ctx = { window: {}, console, Date, Math, JSON };
ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ["assets/js/intraday-data.js", "assets/js/strategies.js", "assets/js/results.js", "assets/js/engine.js"]) vm.runInContext(fs.readFileSync(`${root}/${f}`, "utf8"), ctx, { filename: f });
const S = ctx.window.INTRADAY_STRATEGIES, M = ctx.window.INTRADAY_META, R = ctx.window.INTRADAY_RESULTS.byId, D = ctx.window.INTRADAY_DATA;
const errors = [];
if (S.length !== 100) errors.push("strategies " + S.length);
if (M.families.length !== 10) errors.push("families " + M.families.length);
const bt = S.filter((s) => s.verification === "backtest");
if (bt.length !== 20) errors.push("backtest " + bt.length);
if (Object.keys(R).length !== 20) errors.push("results " + Object.keys(R).length);
for (const f of M.families) if (S.filter((s) => s.familyCode === f.code).length !== 10) errors.push("family " + f.code);
const ids = new Set();
for (const s of S) {
  if (ids.has(s.id)) errors.push("dup " + s.id); ids.add(s.id);
  for (const k of ["entry", "exit", "risk", "ai", "thesis", "setup", "fails", "data", "execution", "caseStudy"]) if (!s[k] || String(s[k]).length < 4) errors.push(`${s.id} short ${k}`);
  if (!s.session || !s.holding) errors.push(`${s.id} session/holding`);
  if (s.verification === "backtest") {
    const r = R[s.id];
    if (!r || !r.ok) { errors.push(`${s.id} missing result`); continue; }
    for (const k of ["greenDayRate", "maxLosingStreak", "worstDay", "total", "trades", "maxDD"]) if (!Number.isFinite(r.metrics[k])) errors.push(`${s.id} metric ${k}`);
    if (r.metrics.overnight !== 0) errors.push(`${s.id} overnight ${r.metrics.overnight}`);
    if (!r.equity || r.equity.length < 5) errors.push(`${s.id} equity`);
    if (!r.days || r.days.length < 5) errors.push(`${s.id} days`);
    if (!r.best || !r.worst) errors.push(`${s.id} best/worst`);
    if (!["样本外通过", "仅样本外通过", "样本外未通过", "样本不足"].includes(r.verdict)) errors.push(`${s.id} verdict`);
  } else if (R[s.id]) errors.push(`${s.id} nonbt result`);
}
for (const k of ["five", "hour", "crypto"]) {
  const d = D.datasets[k];
  if (!d || !d.meta || !d.meta.bars) errors.push("dataset " + k);
  for (const sym of Object.keys(d.symbols || {})) {
    const a = d.symbols[sym];
    if (a.c.length !== d.t.length) errors.push(`${k}/${sym} length`);
  }
}
console.log(JSON.stringify({ strategies: S.length, backtest: bt.length, results: Object.keys(R).length, families: M.families.length, datasets: Object.fromEntries(Object.entries(D.datasets).map(([k, v]) => [k, v.meta])), errors: errors.slice(0, 30), errorCount: errors.length }, null, 2));
if (errors.length) process.exit(1);
