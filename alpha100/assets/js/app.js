/* ALPHA 100 — static research terminal. No framework, no network. */
(function () {
  "use strict";

  const STRATEGIES = window.ALPHA_STRATEGIES || [];
  const META = window.ALPHA_META || { families: [], counts: {} };
  const RESULTS = (window.ALPHA_RESULTS || {}).byId || {};
  const MARKET = window.ALPHA_MARKET || { dates: [], symbols: {} };
  const ENGINE = window.AlphaEngine;
  const BY_ID = new Map(STRATEGIES.map((s) => [s.id, s]));
  const FAMILIES = META.families || [];
  const FAMILY_BY_CODE = new Map(FAMILIES.map((f) => [f.code, f]));

  const VERIFY_LABEL = { backtest: "可回测", paper: "纸面验证", data: "需另类数据", audit: "结构核验" };
  const VERIFY_CLASS = { backtest: "pill-acid", paper: "pill-cyan", data: "pill-orange", audit: "pill-muted" };
  const RISK_CLASS = { "低": "pill-cyan", "中低": "pill-cyan", "中": "pill-muted", "中高": "pill-orange", "高": "pill-orange", "极高": "pill-red" };
  const CAVEATS = {
    "005": "单票样本（NVDA）存在强烈的事后选择与幸存者偏差；结论只用于验证规则，不可外推。",
    "019": "股票池是 2026 年仍然存活的 8 只大盘股，存在幸存者偏差；短期反转在全样本上并未通过。",
    "031": "股票池是 2026 年仍然存活的 8 只大盘股，存在严重幸存者偏差；42% 的年化不是可复制的预期收益。",
    "076": "加密币池只包含 2026 年仍存活的 5 个币，存在严重幸存者偏差；回测收益不可外推。",
    "035": "回测只验证价格动量骨架；ETF 份额/资金流数据未嵌入，实盘需另行接入并做样本外验证。",
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function pct(x, d) {
    if (!Number.isFinite(x)) return "—";
    return (x * 100).toFixed(d == null ? 1 : d) + "%";
  }
  function signedPct(x, d) {
    if (!Number.isFinite(x)) return "—";
    return (x >= 0 ? "+" : "") + (x * 100).toFixed(d == null ? 1 : d) + "%";
  }
  function num(x, d) {
    if (!Number.isFinite(x)) return x === Infinity ? "∞" : "—";
    return x.toFixed(d == null ? 2 : d);
  }
  function cls(x, invert) {
    if (!Number.isFinite(x) || Math.abs(x) < 1e-9) return "";
    const good = invert ? x < 0 : x > 0;
    return good ? "pos" : "neg";
  }
  function verdictClass(v) {
    if (!v) return "";
    if (v === "样本外通过") return "pass";
    if (v.indexOf("未通过") >= 0) return "fail";
    return "";
  }
  function evidence(s) {
    if (s.verification === "backtest") {
      const r = RESULTS[s.id];
      return { level: "E2", title: "历史回测已跑通", sub: r && r.ok ? r.verdict : "可运行，但样本外结果需你复核" };
    }
    if (s.verification === "paper") return { level: "E1", title: "规则完整，待纸面验证", sub: "需要 20–30 次纸面交易或 8–12 周跟踪" };
    if (s.verification === "data") return { level: "E1", title: "规则完整，需另类数据", sub: "当前数据无法忠实复现，先接数据再做样本外" };
    return { level: "E0", title: "结构核验", sub: "基础设施型策略，重点在工程与执行而非历史回测" };
  }
  function protocolFor(s) {
    if (s.protocol && s.protocol.length) return s.protocol;
    return [
      `接入并校验数据：${s.data}`,
      "用至少 6–12 个月样本外数据重放规则，冻结参数，不做逐月调参",
      "纸面跟踪 20–30 次，记录滑点、成交率与失效场景",
      "只有扣成本后仍为正、且最大回撤可承受，才考虑小资金",
    ];
  }

  /* ------------------------------ storage ------------------------------ */
  const LS = {
    journal: "alpha100.journal.v1",
    checks: "alpha100.checks.v1",
    runs: "alpha100.runs.v1",
  };
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore quota */ }
  }
  function getJournal() {
    const j = load(LS.journal, { trades: [], reviews: [] });
    return { trades: Array.isArray(j.trades) ? j.trades : [], reviews: Array.isArray(j.reviews) ? j.reviews : [] };
  }
  function getChecks() { return load(LS.checks, {}); }
  function getRuns() { return load(LS.runs, {}); }
  function recordRun(id, payload) {
    const runs = getRuns();
    if (!runs[id]) runs[id] = [];
    runs[id].unshift(payload);
    runs[id] = runs[id].slice(0, 12);
    save(LS.runs, runs);
  }

  /* ------------------------------ charts ------------------------------ */
  let UID = 0;
  function uid() { UID += 1; return "g" + UID; }
  function normalize(values) {
    const first = values.find((v) => Number.isFinite(v) && v !== 0);
    if (!Number.isFinite(first)) return values.map(() => 1);
    return values.map((v) => (Number.isFinite(v) ? v / first : 1));
  }
  function sparkline(values, opts) {
    const o = opts || {};
    if (!values || values.length < 2) return "";
    const w = o.w || 120, h = o.h || 32, pad = 2;
    const vals = normalize(values);
    const min = Math.min(...vals), max = Math.max(...vals);
    const span = max - min || 1;
    const pts = vals.map((v, i) => {
      const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return [x, y];
    });
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    const up = vals[vals.length - 1] >= vals[0];
    const color = o.color || (up ? "var(--acid)" : "var(--red)");
    const area = d + ` L${w - pad},${h - pad} L${pad},${h - pad} Z`;
    const gid = uid();
    return `<svg class="spark-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      <path d="${area}" fill="url(#${gid})"></path>
      <path d="${d}" fill="none" stroke="${color}" stroke-width="1.4" vector-effect="non-scaling-stroke"></path>
    </svg>`;
  }
  function lineChart(series, opts) {
    const o = opts || {};
    const W = 860, H = o.height || 300;
    const pad = { l: 48, r: 18, t: 18, b: 30 };
    const e = normalize(series.e || []);
    const b = series.b && series.b.length ? normalize(series.b) : null;
    const dts = series.d || [];
    const n = e.length;
    if (n < 2) return `<div class="empty">没有足够的数据</div>`;
    const all = b ? e.concat(b) : e;
    let min = Math.min(...all), max = Math.max(...all);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) { min = 0.9; max = 1.1; }
    const padV = (max - min) * 0.08 || 0.01;
    min -= padV; max += padV;
    const x = (i) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
    const path = (arr) => arr.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + "," + y(v).toFixed(1)).join(" ");
    const area = path(e) + ` L${x(n - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
    const splitIdx = series.splitDate ? dts.findIndex((d) => d >= series.splitDate) : -1;
    const grid = [0, 1, 2, 3, 4].map((k) => {
      const v = max - ((max - min) * k) / 4;
      const yy = y(v);
      return `<line x1="${pad.l}" y1="${yy.toFixed(1)}" x2="${W - pad.r}" y2="${yy.toFixed(1)}" stroke="rgba(255,255,255,.065)" stroke-width="1"/>
        <text x="${pad.l - 8}" y="${(yy + 3).toFixed(1)}" text-anchor="end" fill="#65736c" font-size="9" font-family="monospace">${v.toFixed(2)}</text>`;
    }).join("");
    const gid = uid();
    const splitLine = splitIdx > 1
      ? `<rect x="${x(splitIdx)}" y="${pad.t}" width="${W - pad.r - x(splitIdx)}" height="${H - pad.t - pad.b}" fill="rgba(255,159,90,.035)"/>
         <line x1="${x(splitIdx)}" y1="${pad.t}" x2="${x(splitIdx)}" y2="${H - pad.b}" stroke="rgba(255,159,90,.35)" stroke-width="1" stroke-dasharray="3 4"/>
         <text x="${x(splitIdx) + 6}" y="${pad.t + 11}" fill="#ff9f5a" font-size="8" font-family="monospace">OUT-OF-SAMPLE</text>`
      : "";
    const labelIdx = [0, Math.floor((n - 1) / 2), n - 1];
    const xlabels = labelIdx.map((i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="${i === 0 ? "start" : i === n - 1 ? "end" : "middle"}" fill="#65736c" font-size="8.5" font-family="monospace">${dts[i] || ""}</text>`).join("");
    return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="策略净值曲线">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9f56b" stop-opacity=".18"/><stop offset="1" stop-color="#c9f56b" stop-opacity="0"/></linearGradient></defs>
      ${grid}${splitLine}
      <path d="${area}" fill="url(#${gid})"></path>
      <path d="${path(e)}" fill="none" stroke="#c9f56b" stroke-width="1.8" vector-effect="non-scaling-stroke"></path>
      ${b ? `<path d="${path(b)}" fill="none" stroke="#65736c" stroke-width="1.1" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"></path>` : ""}
      <circle cx="${x(n - 1)}" cy="${y(e[n - 1])}" r="3.2" fill="#c9f56b" stroke="#0b1008" stroke-width="1.5"></circle>
      ${xlabels}
    </svg>`;
  }
  function drawdownChart(series) {
    const e = normalize(series.e || []);
    if (e.length < 2) return "";
    const W = 860, H = 150, pad = { l: 48, r: 18, t: 12, b: 22 };
    let peak = e[0];
    const dd = e.map((v) => { if (v > peak) peak = v; return v / peak - 1; });
    const min = Math.min(...dd, -0.001);
    const x = (i) => pad.l + (i / (e.length - 1)) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - v / min) * (H - pad.t - pad.b);
    const d = dd.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + "," + y(v).toFixed(1)).join(" ");
    const area = d + ` L${x(e.length - 1)},${pad.t} L${x(0)},${pad.t} Z`;
    const gid = uid();
    return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="回撤曲线">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6f6a" stop-opacity=".04"/><stop offset="1" stop-color="#ff6f6a" stop-opacity=".24"/></linearGradient></defs>
      <line x1="${pad.l}" y1="${pad.t}" x2="${W - pad.r}" y2="${pad.t}" stroke="rgba(255,255,255,.07)"/>
      <text x="${pad.l - 8}" y="${pad.t + 3}" text-anchor="end" fill="#65736c" font-size="8" font-family="monospace">0%</text>
      <text x="${pad.l - 8}" y="${y(min) + 3}" text-anchor="end" fill="#65736c" font-size="8" font-family="monospace">${(min * 100).toFixed(0)}%</text>
      <path d="${area}" fill="url(#${gid})"></path>
      <path d="${d}" fill="none" stroke="#ff6f6a" stroke-width="1.3" vector-effect="non-scaling-stroke"></path>
      <line x1="${pad.l}" y1="${y(min)}" x2="${W - pad.r}" y2="${y(min)}" stroke="rgba(255,111,106,.22)" stroke-dasharray="3 4"/>
    </svg>`;
  }
  function heatmap(monthly) {
    if (!monthly || !monthly.length) return `<div class="empty">暂无月度数据</div>`;
    const byYear = new Map();
    for (const m of monthly) {
      const y = m.month.slice(0, 4), mo = Number(m.month.slice(5, 7));
      if (!byYear.has(y)) byYear.set(y, {});
      byYear.get(y)[mo] = m.ret;
    }
    const years = Array.from(byYear.keys()).sort();
    const mon = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    let html = `<div class="heatmap"><div class="hm-year"></div>${mon.map((m) => `<div class="hm-month">${m}</div>`).join("")}`;
    for (const y of years) {
      html += `<div class="hm-year">${y}</div>`;
      for (let m = 1; m <= 12; m++) {
        const v = byYear.get(y)[m];
        if (!Number.isFinite(v)) { html += `<div class="hm-cell empty"></div>`; continue; }
        const a = Math.min(0.85, 0.1 + Math.abs(v) * 4.5);
        const bg = v >= 0 ? `rgba(201,245,107,${a})` : `rgba(255,111,106,${a})`;
        const color = Math.abs(v) > 0.08 ? "#0b1008" : "rgba(255,255,255,.7)";
        html += `<div class="hm-cell" style="background:${bg};color:${color}" title="${y}-${String(m).padStart(2, "0")} ${signedPct(v)}">${(v * 100).toFixed(0)}</div>`;
      }
    }
    html += `</div>`;
    return html;
  }

  /* ------------------------------ market strip ------------------------------ */
  function tickerHTML() {
    const defs = [["SPY", "SPY"], ["QQQ", "QQQ"], ["BTC-USD", "BTC"], ["GLD", "GLD"], ["TLT", "TLT"], ["^VIX", "VIX"]];
    return defs.map(([sym, label]) => {
      const s = MARKET.symbols[sym];
      if (!s) return "";
      let last = -1, prev = -1;
      for (let i = s.c.length - 1; i >= 0; i--) if (Number.isFinite(s.c[i])) { last = i; break; }
      for (let i = last - 1; i >= 0; i--) if (Number.isFinite(s.c[i])) { prev = i; break; }
      if (last < 0 || prev < 0) return "";
      const price = s.c[last], change = price / s.c[prev] - 1;
      const dp = sym === "^VIX" ? 2 : price > 1000 ? 0 : 2;
      return `<div class="tick"><b>${label}</b><span>${price.toFixed(dp)}</span><em class="${change < 0 ? "down" : ""}">${signedPct(change, 2)}</em></div>`;
    }).join("");
  }

  /* ------------------------------ components ------------------------------ */
  function pillVerify(v) { return `<span class="pill ${VERIFY_CLASS[v] || "pill-muted"}"><i></i>${VERIFY_LABEL[v] || v}</span>`; }
  function pillRisk(r) { return `<span class="pill ${RISK_CLASS[r] || "pill-muted"}">${esc(r)}风险</span>`; }
  function strategyCard(s) {
    const r = RESULTS[s.id];
    const spark = r && r.ok && r.series ? sparkline(r.series.e, { w: 160, h: 36 }) : "";
    return `<a class="strategy-card" href="#/strategy/${s.id}" data-id="${s.id}">
      <span class="card-arrow">↗</span>
      <div class="card-top"><span class="card-code">${s.code}</span><span class="pill pill-muted">${esc(s.family)}</span>${pillVerify(s.verification)}</div>
      <h3>${esc(s.name)}</h3>
      <div class="card-en">${esc(s.en)}</div>
      <p class="card-thesis">${esc(s.thesis)}</p>
      <div class="card-ai"><span>AI</span>${esc(s.aiRole)} · ${esc(s.holding)}</div>
      <div class="card-spark">${spark}</div>
      <div class="card-foot">
        <div class="card-risk"><b>${esc(s.direction)}</b> · ${esc(s.market)}<br>${pillRisk(s.riskLevel)}</div>
        <div class="readiness"><div class="readiness-top"><span>实盘就绪</span><b>${s.readiness}</b></div><div class="bar"><i style="width:${s.readiness}%"></i></div></div>
      </div>
    </a>`;
  }
  function familyBlurb(code) {
    return {
      A: "趋势、突破、动量与日历效应。",
      B: "超卖、跳空、配对与短期反转。",
      C: "协整、基差、并购与相对价值。",
      D: "因子、排序、机器学习与另类数据。",
      E: "财报、回购、FDA 与宏观事件。",
      F: "LLM 从文本与语音中提取信号。",
      G: "期权、波动率与尾部风险。",
      H: "资金费率、链上与加密轮动。",
      I: "盘口、执行、做市与交易成本。",
      J: "利率、美元、商品与多资产配置。",
    }[code] || "";
  }
  function familyCard(f) {
    const list = STRATEGIES.filter((s) => s.familyCode === f.code);
    const avg = Math.round(list.reduce((a, s) => a + s.readiness, 0) / list.length);
    const bt = list.filter((s) => s.verification === "backtest").length;
    return `<a class="family-card" href="#/library?family=${f.code}" data-code="${f.code}">
      <div class="family-code">${f.code} / ${String(list.length).padStart(2, "0")}</div>
      <h3>${esc(f.name)}</h3>
      <p>${esc(familyBlurb(f.code))}</p>
      <div class="family-meta"><span>就绪 <b>${avg}</b></span><span>可回测 <b>${bt}</b></span></div>
    </a>`;
  }
  function metricBox(label, value, klass) {
    return `<div class="metric"><span>${label}</span><strong class="${klass || ""}">${value}</strong></div>`;
  }
  function resultMetrics(r) {
    const m = r.metrics || {};
    const o = r.oos || r.oosMetrics || {};
    return `<div class="metric-grid">
      ${metricBox("CAGR", signedPct(m.cagr), cls(m.cagr))}
      ${metricBox("SHARPE", num(m.sharpe, 2), cls(m.sharpe))}
      ${metricBox("MAX DD", pct(m.maxDD), "neg")}
      ${metricBox("OOS SHARPE", num(o.sharpe, 2), cls(o.sharpe))}
      ${metricBox("TRADES", String(m.trades == null ? "—" : m.trades))}
      ${metricBox("WIN RATE", pct(m.winRate, 0))}
      ${metricBox("EXPOSURE", r.exposure != null ? pct(r.exposure, 0) : "—")}
      ${metricBox("OOS CAGR", signedPct(o.cagr), cls(o.cagr))}
    </div>`;
  }

  /* ------------------------------ home ------------------------------ */
  function viewHome() {
    const all = Object.values(RESULTS).filter((r) => r && r.ok);
    const pass = all.filter((r) => r.verdict === "样本外通过").length;
    const partial = all.filter((r) => r.verdict === "仅样本外通过").length;
    const avg = Math.round(STRATEGIES.reduce((a, s) => a + s.readiness, 0) / STRATEGIES.length);
    const feat = ["004", "095", "096"].map((id) => ({ s: BY_ID.get(id), r: RESULTS[id] })).filter((x) => x.s);
    const main = feat[0];
    const mainSpark = main && main.r && main.r.series ? sparkline(main.r.series.e, { w: 560, h: 150 }) : "";
    return `<div class="container">
      <section class="hero">
        <div class="hero-grid">
          <div class="hero-copy">
            <div class="eyebrow">AI TRADING DOSSIERS / 2026</div>
            <h1>100 条优势，<br><em>逐条求证。</em></h1>
            <p class="hero-lede">不是 100 个赚钱保证。是 <strong>100 条能写进代码、能分级执行、能被证伪</strong> 的 AI 交易假设——从散户 ETF 到机构基础设施，每一条都有入场、出场、风控、数据门槛与证据等级。</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="#/library">进入策略库 <span class="mono">→</span></a>
              <a class="btn" href="#/lab?s=004">跑一条回测</a>
              <a class="btn btn-ghost" href="#/method">先看方法论</a>
            </div>
            <div class="hero-note"><span>10 个策略家族</span><span>${META.counts.backtest || 0} 条可回测</span><span>${pass + partial} 条通过/部分通过样本外</span><span>数据嵌入本地</span></div>
            <div class="stat-row">
              <div class="stat-block"><strong>100</strong><span>策略档案</span></div>
              <div class="stat-block"><strong>10</strong><span>策略家族</span></div>
              <div class="stat-block"><strong>${META.counts.backtest || 0}</strong><span>可直接回测</span></div>
              <div class="stat-block"><strong>${avg}</strong><span>平均实盘就绪度</span></div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-orbit" aria-hidden="true"></div>
            <div class="terminal">
              <div class="terminal-head"><span>RESEARCH QUEUE / FEATURED</span><span>● ENGINE READY</span></div>
              <div class="terminal-body">
                <div class="terminal-label"><i></i> ${main ? main.s.code : "004"} · ${main ? esc(main.s.family) : ""}</div>
                <div class="terminal-title">${main ? esc(main.s.name) : "行业横截面动量"}</div>
                <div class="terminal-sub">${main ? esc(main.s.en) : ""}</div>
                <div class="terminal-chart">${mainSpark}</div>
                <div class="terminal-metrics">
                  <div class="terminal-metric"><span>CAGR</span><strong>${main && main.r ? signedPct(main.r.metrics.cagr) : "—"}</strong></div>
                  <div class="terminal-metric"><span>SHARPE</span><strong>${main && main.r ? num(main.r.metrics.sharpe) : "—"}</strong></div>
                  <div class="terminal-metric"><span>MAX DD</span><strong class="red">${main && main.r ? pct(main.r.metrics.maxDD) : "—"}</strong></div>
                </div>
                <div class="terminal-foot"><span>${main && main.r ? main.r.verdict : ""} · 样本外 ${main && main.r ? main.r.splitDate : ""}</span><a href="#/lab?s=${main ? main.s.id : "004"}">打开实验室 →</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><div class="section-kicker">01 / THE MAP</div><h2>十个战场，<br><em style="color:var(--acid);font-style:italic">一百种打法。</em></h2></div>
          <p>从趋势到微观结构，每个家族 10 条。不是分类收藏，而是按“优势来源”组织：风险溢价、行为偏差、结构摩擦、信息差、执行成本。</p>
        </div>
        <div class="family-grid">${FAMILIES.map(familyCard).join("")}</div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><div class="section-kicker">02 / FEATURED</div><h2>先用三条，<br>验证这套方法。</h2></div>
          <p>三条不同逻辑的样本：横截面动量、风险平价、危机 Alpha。点开可看完整规则，也可以直接改参数重跑。</p>
        </div>
        <div class="featured-grid">${feat.map(({ s, r }, i) => {
          const rr = r && r.ok ? r : null;
          return `<a class="featured-card ${i === 0 ? "primary" : ""}" href="#/strategy/${s.id}">
            <span class="featured-number">${s.code}</span>
            <div class="featured-top">${pillVerify(s.verification)}<span class="pill pill-muted">${esc(s.holding)}</span></div>
            <h3>${esc(s.name)}</h3>
            <p>${esc(s.thesis)}</p>
            <div class="featured-chart">${rr ? sparkline(rr.series.e, { w: 260, h: 64 }) : ""}</div>
            <div class="featured-metrics"><span>Sharpe <b>${rr ? num(rr.metrics.sharpe) : "—"}</b></span><span>MaxDD <b>${rr ? pct(rr.metrics.maxDD) : "—"}</b></span><span>OOS <b>${rr ? num(rr.oos.sharpe) : "—"}</b></span></div>
          </a>`;
        }).join("")}</div>
      </section>

      <section class="section">
        <div class="ladder-grid">
          <div class="ladder-copy">
            <div class="section-kicker">03 / EVIDENCE LADDER</div>
            <h2>回测通过，<br><em style="color:var(--acid);font-style:italic">只是第二级。</em></h2>
            <p>这个站点把“证据”拆成五级。大部分策略停在 E1–E2；能不能走到 E4，不由页面上的数字决定，而由你的纸面交易和小资金实盘决定。</p>
            <div style="margin-top:22px"><a class="link-arrow" href="#/method">阅读完整方法论</a></div>
          </div>
          <div class="ladder">
            ${[
              ["E0", "规则草案", "有想法，但没有可执行规则或数据。", "不交易"],
              ["E1", "规则审计", "入场/出场/风控/数据全部写清，可被机器执行。", "本站 100 条"],
              ["E2", "历史回测", "在固定数据、成本与样本外切分下跑通。", "27 条"],
              ["E3", "滚动样本外", "walk-forward、参数冻结、跨制度验证。", "需要你完成"],
              ["E4", "纸面/小资金", "20–30 笔纸面或 8–12 周小资金，回撤可控。", "最终门槛"],
            ].map(([lv, title, desc, status], i) => `<div class="ladder-step ${i === 2 ? "active" : ""}">
              <div class="level">${lv}</div><div><h4>${title}</h4><p>${desc}</p></div><div class="status">${status}</div>
            </div>`).join("")}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><div><div class="section-kicker">04 / HOW TO USE</div><h2>选一条，<br>把它证伪。</h2></div><p>不要一次做 100 条。每周只推进一条：读规则、跑回测、纸面跟踪、写复盘。</p></div>
        <div class="usage-grid">
          <div class="usage-card"><div class="usage-num">01</div><h3>选战场</h3><p>按市场、周期、风险与就绪度筛。先选你能拿到数据、能执行、能承受回撤的那一类。</p><a class="link-arrow" href="#/library">打开策略库</a></div>
          <div class="usage-card"><div class="usage-num">02</div><h3>跑回测</h3><p>用嵌入的真实日线数据跑样本内/样本外；改成本、改参数，看结论是否脆弱。</p><a class="link-arrow" href="#/lab">进入实验室</a></div>
          <div class="usage-card"><div class="usage-num">03</div><h3>写复盘</h3><p>把纸面/实盘交易记进复盘台，统计胜率、盈亏比、最大回撤与错误标签。</p><a class="link-arrow" href="#/journal">打开复盘台</a></div>
        </div>
      </section>

      <section class="section">
        <div class="notice"><div class="notice-icon">!</div><p><strong>先读这句：</strong>本站不是信号服务，也不承诺任何收益。历史回测只说明“规则在历史上能跑”，不说明未来会赚钱。所有含“加密、期权、高频、MEV”的策略都属于高风险/专业基础设施范畴；实盘前请完成样本外验证、纸面跟踪、独立风控与合规审查。</p></div>
      </section>
    </div>`;
  }

  /* ------------------------------ library ------------------------------ */
  const libState = { q: "", family: "all", verification: "all", risk: "all", sort: "readiness" };

  function filteredStrategies() {
    const q = libState.q.trim().toLowerCase();
    let list = STRATEGIES.slice();
    if (q) list = list.filter((s) => [s.id, s.code, s.name, s.en, s.family, s.market, s.aiRole, s.thesis, s.tags.join(" ")].join(" ").toLowerCase().includes(q));
    if (libState.family !== "all") list = list.filter((s) => s.familyCode === libState.family);
    if (libState.verification !== "all") list = list.filter((s) => s.verification === libState.verification);
    if (libState.risk !== "all") list = list.filter((s) => s.riskLevel === libState.risk);
    if (libState.sort === "readiness") list.sort((a, b) => b.readiness - a.readiness || a.id.localeCompare(b.id));
    else if (libState.sort === "id") list.sort((a, b) => a.id.localeCompare(b.id));
    else if (libState.sort === "risk") {
      const order = { "低": 0, "中低": 1, "中": 2, "中高": 3, "高": 4, "极高": 5 };
      list.sort((a, b) => (order[a.riskLevel] || 0) - (order[b.riskLevel] || 0));
    } else if (libState.sort === "backtest") list.sort((a, b) => (b.verification === "backtest") - (a.verification === "backtest"));
    return list;
  }
  function libraryGrid() {
    const list = filteredStrategies();
    const grid = $("#strategy-grid");
    const count = $("#result-count");
    if (count) count.innerHTML = `<strong>${list.length}</strong> / 100 条策略`;
    if (grid) grid.innerHTML = list.length ? list.map(strategyCard).join("") : `<div class="empty">没有匹配的策略。换一个关键词，或把筛选器调回“全部”。</div>`;
  }
  function viewLibrary() {
    const famOptions = `<option value="all">全部家族</option>` + FAMILIES.map((f) => `<option value="${f.code}" ${libState.family === f.code ? "selected" : ""}>${f.code} · ${esc(f.name)}</option>`).join("");
    return `<div class="container">
      <header class="page-head">
        <div class="eyebrow kicker">THE LIBRARY / 100 DOSSIERS</div>
        <h1>策略库。<br><em>不是收藏夹。</em></h1>
        <p class="lede">每条档案都写到可以下单的程度：入场、出场、仓位、数据、执行场所、失败模式。先筛掉你不能执行的，再谈收益。</p>
        <div class="head-meta"><span>总计 <b>100</b></span><span>可回测 <b>${META.counts.backtest || 0}</b></span><span>纸面验证 <b>${META.counts.paper || 0}</b></span><span>需另类数据 <b>${META.counts.data || 0}</b></span><span>结构核验 <b>${META.counts.audit || 0}</b></span></div>
      </header>
      <div class="toolbar">
        <div class="search-box"><span>⌕</span><input id="lib-search" type="search" placeholder="搜索策略、市场、AI 用法、标签…" autocomplete="off" value="${esc(libState.q)}"></div>
        <select class="select" id="lib-family">${famOptions}</select>
        <select class="select" id="lib-verification"><option value="all">全部验证方式</option>${Object.entries(VERIFY_LABEL).map(([k, v]) => `<option value="${k}" ${libState.verification === k ? "selected" : ""}>${v}</option>`).join("")}</select>
        <select class="select" id="lib-risk"><option value="all">全部风险</option>${["低", "中低", "中", "中高", "高", "极高"].map((r) => `<option value="${r}" ${libState.risk === r ? "selected" : ""}>${r}风险</option>`).join("")}</select>
        <select class="select" id="lib-sort"><option value="readiness" ${libState.sort === "readiness" ? "selected" : ""}>按就绪度</option><option value="id" ${libState.sort === "id" ? "selected" : ""}>按编号</option><option value="risk" ${libState.sort === "risk" ? "selected" : ""}>按风险</option><option value="backtest" ${libState.sort === "backtest" ? "selected" : ""}>可回测优先</option></select>
        <a class="btn btn-sm btn-ghost" href="data/strategy-index.csv" download title="下载 100 条策略索引">CSV 索引</a>
      </div>
      <div class="result-line"><span id="result-count"><strong>100</strong> / 100 条策略</span><span>筛选不是推荐；只是帮你排除不能执行的。</span></div>
      <div class="strategy-grid" id="strategy-grid">${filteredStrategies().map(strategyCard).join("")}</div>
    </div>`;
  }
  function bindLibrary() {
    const q = $("#lib-search"), fam = $("#lib-family"), ver = $("#lib-verification"), risk = $("#lib-risk"), sort = $("#lib-sort");
    if (q) q.addEventListener("input", () => { libState.q = q.value; libraryGrid(); });
    if (fam) fam.addEventListener("change", () => { libState.family = fam.value; libraryGrid(); });
    if (ver) ver.addEventListener("change", () => { libState.verification = ver.value; libraryGrid(); });
    if (risk) risk.addEventListener("change", () => { libState.risk = risk.value; libraryGrid(); });
    if (sort) sort.addEventListener("change", () => { libState.sort = sort.value; libraryGrid(); });
  }

  /* ------------------------------ detail ------------------------------ */
  function viewStrategy(id) {
    const s = BY_ID.get(id);
    if (!s) return notFound("找不到这条策略。");
    const r = RESULTS[id];
    const ev = evidence(s);
    const savedChecks = getChecks()[id] || [];
    const runs = getRuns()[id] || [];
    const family = STRATEGIES.filter((x) => x.familyCode === s.familyCode && x.id !== id).slice(0, 3);
    const rr = r && r.ok ? r : null;
    const caveat = CAVEATS[id] || (rr && rr.caveat) || null;
    const protocol = protocolFor(s);
    const isNonBt = s.verification !== "backtest";
    return `<div class="container detail">
      <div class="breadcrumb"><a href="#/">首页</a><span>/</span><a href="#/library">策略库</a><span>/</span><span>${s.code}</span></div>
      <header class="detail-head">
        <div>
          <div class="detail-kicker"><span class="pill pill-muted">${esc(s.family)}</span>${pillVerify(s.verification)}${pillRisk(s.riskLevel)}<span class="pill pill-muted">${esc(s.timeframe)}</span></div>
          <h1>${esc(s.name)}</h1>
          <div class="detail-en">${esc(s.en)}</div>
          <div class="detail-tags">${s.tags.map((t) => `<span class="pill pill-muted">${esc(t)}</span>`).join("")}</div>
        </div>
        <div class="detail-score"><div class="score-label">LIVE READINESS</div><div class="score-value">${s.readiness}</div><div class="score-bar"><i style="width:${s.readiness}%"></i></div><div class="score-note">${esc(s.capital)} · ${esc(s.access)}</div></div>
      </header>
      <div class="detail-grid">
        <div class="dossier">
          <section>
            <div class="section-label">01 / THESIS</div>
            <h2>这条优势从哪来</h2>
            <p>${esc(s.thesis)}</p>
            <div class="ai-box"><div class="ai-head"><span>AI LAYER</span><b>${esc(s.aiRole)}</b></div><p>${esc(s.ai)}</p></div>
          </section>
          <section>
            <div class="section-label">02 / RULES</div>
            <h2>写到能下单</h2>
            <div class="rule-grid">
              <div class="rule-card"><div class="rule-title">ENTRY / 入场</div><p>${esc(s.entry)}</p></div>
              <div class="rule-card exit"><div class="rule-title">EXIT / 出场</div><p>${esc(s.exit)}</p></div>
              <div class="rule-card risk"><div class="rule-title">RISK / 风控</div><p>${esc(s.risk)}</p></div>
            </div>
          </section>
          <section>
            <div class="section-label">03 / OPERATIONS</div>
            <h2>数据、执行与容量</h2>
            <div class="two-col"><div><div class="section-label">DATA</div><p>${esc(s.data)}</p></div><div><div class="section-label">EXECUTION</div><p>${esc(s.execution)}</p></div></div>
            <div class="two-col"><div><div class="section-label">CAPACITY</div><p>${esc(s.capacity)} · ${esc(s.capital)} · ${esc(s.access)}</p></div><div><div class="section-label">DIRECTION</div><p>${esc(s.direction)} · ${esc(s.market)} · ${esc(s.holding)}</p></div></div>
          </section>
          <section>
            <div class="section-label">04 / FAILURE MODES</div>
            <h2>它会在哪里失效</h2>
            <div class="two-col"><div><div class="section-label">FAILS</div><ul class="mini-list fails"><li>${esc(s.fails)}</li></ul></div><div><div class="section-label">LIVE CHECK</div><ul class="mini-list">${s.liveCheck.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>
          </section>
          ${isNonBt ? `<section><div class="section-label">05 / VERIFICATION PROTOCOL</div><h2>没有日线回测，怎么求证</h2><p>这条策略需要 ${s.verification === "data" ? "额外数据或专业通道" : "纸面/前向验证"}。不要用“感觉”替代证据；按下面的顺序推进。</p><ol class="protocol">${protocol.map((p) => `<li>${esc(p)}</li>`).join("")}</ol></section>` : ""}
          <section>
            <div class="section-label">${isNonBt ? "06" : "05"} / BACKTEST</div>
            <h2>历史数据说了什么</h2>
            ${rr ? `<div class="verdict ${verdictClass(rr.verdict)}"><div class="verdict-mark">${rr.verdict === "样本外通过" ? "✓" : rr.verdict === "样本外未通过" ? "×" : "!"}</div><div><h4>${esc(rr.verdict)} · ${esc(rr.start)} → ${esc(rr.end)}</h4><p>样本内 70% / 样本外 30%，切分日 ${esc(rr.splitDate)}。成本 ${s.costBps || 2} bps/边；结果不包含融资、借券与税。</p></div></div>${caveat ? `<div class="caveat"><b>偏差警告：</b>${esc(caveat)}</div>` : ""}<div class="chart-card" style="margin-top:12px"><div class="chart-head"><h4>EQUITY / 净值曲线</h4><div class="chart-legend"><span><i></i>策略</span><span><i class="bench"></i>${esc(s.benchmark)}</span></div></div>${lineChart(rr.series, { height: 280 })}</div><div style="margin-top:10px">${resultMetrics({ metrics: rr.metrics, oos: rr.oos, exposure: rr.exposure })}</div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><a class="btn btn-sm btn-primary" href="#/lab?s=${s.id}">改参数重跑</a><button class="btn btn-sm" data-copy="${s.id}">复制规则摘要</button></div>` : `<div class="notice"><div class="notice-icon">i</div><p>这条策略当前没有可用的历史回测：${s.verification === "data" ? "需要另类数据/专业通道，嵌入的日线数据无法忠实复现。" : s.verification === "audit" ? "属于基础设施型策略，回测 PnL 意义有限，重点是工程、延迟与执行。" : "需要纸面/前向验证，历史日线无法覆盖其核心变量。"} 上方协议就是它的求证路径。</p></div>`}
          </section>
          <section>
            <div class="section-label">${isNonBt ? "07" : "06"} / CHECKLIST</div>
            <h2>实盘前，逐项打勾</h2>
            <p>勾选状态保存在本机浏览器。没有全部勾完，不要上真钱。</p>
            <div class="check-list">${s.liveCheck.map((x, i) => `<label><input type="checkbox" data-check="${s.id}" data-index="${i}" ${savedChecks[i] ? "checked" : ""}><span>${esc(x)}</span></label>`).join("")}</div>
          </section>
          <section>
            <div class="section-label">${isNonBt ? "08" : "07"} / RELATED</div>
            <h2>同家族的其它打法</h2>
            <div class="related-grid">${family.map((x) => `<a class="related-card" href="#/strategy/${x.id}"><div class="code">${x.code}</div><h4>${esc(x.name)}</h4></a>`).join("")}</div>
          </section>
        </div>
        <aside class="aside">
          <div class="evidence-card">
            <div class="ev-head"><div><div class="score-label">EVIDENCE</div><div class="ev-level">${ev.level}</div></div>${pillVerify(s.verification)}</div>
            <div class="ev-title">${esc(ev.title)}</div><div class="ev-sub">${esc(ev.sub)}</div>
            <div class="ev-row"><span>就绪度</span><b>${s.readiness}/100</b></div>
            <div class="ev-row"><span>风险</span><b>${esc(s.riskLevel)}</b></div>
            <div class="ev-row"><span>方向</span><b>${esc(s.direction)}</b></div>
            <div class="ev-row"><span>数据</span><b>${s.verification === "data" ? "需另类" : s.verification === "backtest" ? "已嵌入" : "需接入"}</b></div>
            ${rr ? `<div class="ev-row"><span>回测结论</span><b style="color:${rr.verdict.indexOf("未通过") >= 0 ? "var(--red)" : "var(--acid)"}">${esc(rr.verdict)}</b></div>` : ""}
            ${runs.length ? `<div class="ev-row"><span>本机运行</span><b>${runs.length} 次</b></div>` : ""}
            <div class="ev-actions"><a class="btn btn-primary btn-block" href="#/lab?s=${s.id}">在实验室打开</a><button class="btn btn-ghost btn-block" data-journal="${s.id}">加入复盘</button></div>
          </div>
          <div class="evidence-card"><div class="score-label">OPERATING NOTES</div><div class="ev-title" style="margin-top:8px">${esc(s.capital)} · ${esc(s.access)}</div><div class="ev-sub">容量：${esc(s.capacity)}。风险等级：${esc(s.riskLevel)}。周期：${esc(s.timeframe)} / ${esc(s.holding)}。</div><div class="ev-row"><span>市场</span><b>${esc(s.market)}</b></div><div class="ev-row"><span>标的</span><b>${esc((s.symbols || []).join(" / ") || "多资产")}</b></div></div>
        </aside>
      </div>
    </div>`;
  }
  function bindStrategy(id) {
    $$("[data-check]").forEach((cb) => cb.addEventListener("change", () => {
      const all = getChecks();
      if (!all[id]) all[id] = [];
      all[id][Number(cb.dataset.index)] = cb.checked;
      save(LS.checks, all);
    }));
    const copy = $('[data-copy="' + id + '"]');
    if (copy) copy.addEventListener("click", () => copyRules(id));
    const journal = $('[data-journal="' + id + '"]');
    if (journal) journal.addEventListener("click", () => { try { sessionStorage.setItem("alpha100.prefill", id); } catch (e) {} location.hash = "#/journal"; });
  }
  function copyRules(id) {
    const s = BY_ID.get(id);
    if (!s) return;
    const text = [`${s.code} ${s.name} (${s.en})`, `市场：${s.market} | 周期：${s.timeframe} | 方向：${s.direction}`, `AI：${s.aiRole} — ${s.ai}`, `逻辑：${s.thesis}`, `入场：${s.entry}`, `出场：${s.exit}`, `风控：${s.risk}`, `数据：${s.data}`, `执行：${s.execution}`, `失效：${s.fails}`].join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast("规则摘要已复制")).catch(() => toast("复制失败，请手动选择文本", true));
    else toast("浏览器不支持剪贴板", true);
  }

  /* ------------------------------ lab ------------------------------ */
  const labState = { id: "004", start: "2017-01-01", end: "2026-11-03", costBps: 2, tab: "equity" };
  function labStrategyOptions(selected) {
    return FAMILIES.map((f) => `<optgroup label="${f.code} · ${esc(f.name)}">${STRATEGIES.filter((s) => s.familyCode === f.code).map((s) => `<option value="${s.id}" ${s.id === selected ? "selected" : ""}>${s.id} · ${esc(s.name)}${s.verification !== "backtest" ? "（" + VERIFY_LABEL[s.verification] + "）" : ""}</option>`).join("")}</optgroup>`).join("");
  }
  function numericParams(s) { return Object.entries(s.params || {}).filter(([, v]) => typeof v === "number"); }
  function labParamsHTML(s) {
    const nums = numericParams(s);
    const extras = [];
    if (s.params && s.params.universe) extras.push(`<div class="param" style="grid-column:1/-1"><label>UNIVERSE</label><div class="mono" style="font-size:9px;color:var(--muted);line-height:1.5">${esc(s.params.universe.join(" · "))}</div></div>`);
    if (s.params && (s.params.a || s.params.b)) extras.push(`<div class="param" style="grid-column:1/-1"><label>PAIR</label><div class="mono" style="font-size:9px;color:var(--muted)">${esc(s.params.a || "")} / ${esc(s.params.b || "")}</div></div>`);
    return `<div class="param-grid">${nums.map(([k, v]) => `<div class="param"><label>${esc(k)}</label><input type="number" step="any" data-param="${esc(k)}" value="${v}"></div>`).join("")}${extras.join("")}</div>`;
  }
  function viewLab() {
    const s = BY_ID.get(labState.id) || STRATEGIES[0];
    if (labState._id !== s.id) { labState._id = s.id; labState.costBps = s.costBps || 2; }
    const isBt = s.verification === "backtest";
    const rr = RESULTS[s.id] && RESULTS[s.id].ok ? RESULTS[s.id] : null;
    const initial = isBt ? (rr ? renderLabResult(rr, s, "precomputed") : labPlaceholder(s)) : renderNonBacktest(s);
    return `<div class="container lab">
      <header class="lab-head"><div><div class="eyebrow">VERIFICATION LAB</div><h1>求证实验室。</h1><p>固定数据、固定成本、按时间切分样本内/样本外。改一个参数，看结论是变强还是变脆。</p></div><div class="head-meta"><span>数据 <b>2017–2026</b></span><span>标的 <b>${Object.keys(MARKET.symbols).length}</b></span><span>成本 <b>2–5 bps</b></span></div></header>
      <div class="lab-layout">
        <div class="lab-controls">
          <div class="control"><label>策略 <b>${s.code}</b></label><select id="lab-strategy">${labStrategyOptions(s.id)}</select></div>
          <div class="control"><label>起始日期 <b>${labState.start}</b></label><input type="date" id="lab-start" value="${labState.start}" min="2017-01-01" max="2026-11-03"></div>
          <div class="control"><label>结束日期 <b>${labState.end}</b></label><input type="date" id="lab-end" value="${labState.end}" min="2017-01-01" max="2026-11-03"></div>
          <div class="control"><label>单边成本 <b><span id="lab-cost-out">${labState.costBps}</span> bps</b></label><div class="range-row"><input type="range" id="lab-cost" min="0" max="10" step="1" value="${labState.costBps}"><output id="lab-cost-val">${labState.costBps}</output></div></div>
          <div class="lab-params" id="lab-params">${isBt ? labParamsHTML(s) : ""}</div>
          <button class="btn btn-primary run-btn" id="lab-run" ${isBt ? "" : "disabled"}>${isBt ? "运行回测 →" : "此策略需另类验证"}</button>
          <div class="lab-meta">嵌入数据：Yahoo Finance 调整后日线<br>样本内 70% · 样本外 30%<br>信号收盘计算，次日开盘执行<br>结果不含融资/借券/税</div>
        </div>
        <div class="lab-results" id="lab-results">${initial}</div>
      </div>
    </div>`;
  }
  function labPlaceholder(s) {
    return `<div class="lab-placeholder"><div><div class="ph-icon">▷</div><h3>${esc(s.name)}</h3><p>点击左侧“运行回测”。系统会用嵌入的日线数据、固定成本与时间切分，重新计算净值、回撤、月度收益与交易记录。</p></div></div>`;
  }
  function renderNonBacktest(s) {
    const proto = s.protocol && s.protocol.length ? s.protocol : ["先接入所需数据，做 6–12 个月样本外", "纸面跟踪 20–30 次", "用小资金验证执行与滑点", "记录失效条件并写进 kill switch"];
    return `<div class="nonbt"><div class="head-meta" style="margin-bottom:12px"><span>${pillVerify(s.verification)}</span><span>${pillRisk(s.riskLevel)}</span><span>${esc(s.timeframe)}</span></div><h2>${esc(s.name)}</h2><p>${esc(s.thesis)}</p><div class="nonbt-grid"><div class="nonbt-box"><h4>WHY NOT BACKTEST</h4><p>${esc(s.verification === "data" ? "需要另类数据/专业通道，嵌入的日线 OHLCV 无法忠实复现核心变量。" : s.verification === "audit" ? "属于基础设施型策略，历史 PnL 不能代表执行质量；重点在延迟、库存与工程。" : "核心变量无法用日线数据覆盖，必须做纸面/前向验证。")}</p></div><div class="nonbt-box"><h4>DATA REQUIRED</h4><p>${esc(s.data)}</p></div></div><div class="nonbt-box" style="margin-top:12px"><h4>VERIFICATION PROTOCOL</h4><ol class="protocol">${proto.map((p) => `<li>${esc(p)}</li>`).join("")}</ol></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><a class="btn btn-sm btn-primary" href="#/strategy/${s.id}">看完整档案</a><button class="btn btn-sm" data-journal="${s.id}">加入复盘</button></div></div>`;
  }
  function normalizeResult(raw, s, source) {
    if (raw.series) return { ...raw, series: raw.series, metrics: raw.metrics, is: raw.is, oos: raw.oos, monthly: raw.monthly || [], verdict: raw.verdict || "样本外未通过", exposure: raw.exposure, source };
    const dates = raw.dates || [];
    const step = Math.max(1, Math.floor(dates.length / 260));
    const pick = (arr) => arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
    const fullOk = raw.metrics.trades >= 10 && raw.metrics.sharpe > 0.2 && raw.metrics.cagr > 0;
    const oosOk = raw.oosMetrics.trades >= 5 && raw.oosMetrics.sharpe >= 0.3 && raw.oosMetrics.total > 0;
    const verdict = raw.oosMetrics.trades < 5 ? "样本不足" : fullOk && oosOk ? "样本外通过" : oosOk ? "仅样本外通过" : "样本外未通过";
    return { ...raw, series: { d: pick(dates), e: pick(raw.equity), b: pick(raw.benchmark) }, metrics: raw.metrics, is: raw.isMetrics, oos: raw.oosMetrics, monthly: raw.monthly || [], verdict, exposure: raw.exposure, source };
  }
  function renderLabResult(raw, s, source) {
    const r = normalizeResult(raw, s, source);
    const m = r.metrics || {};
    const o = r.oos || {};
    const trades = (r.trades || []).slice().reverse().slice(0, 40);
    return `<div class="lab-result-head"><div><h2>${esc(s.name)}</h2><p>${s.code} · ${esc(r.start || "")} → ${esc(r.end || "")} · ${esc(source === "precomputed" ? "预计算基线" : "刚刚运行")} · 切分 ${esc(r.splitDate || "")}</p></div><div class="lab-verdict verdict ${verdictClass(r.verdict)}" style="padding:9px 12px"><div class="verdict-mark">${r.verdict === "样本外通过" ? "✓" : r.verdict === "样本外未通过" ? "×" : "!"}</div><div><h4>${esc(r.verdict)}</h4><p>OOS Sharpe ${num(o.sharpe)}</p></div></div></div>
    ${resultMetrics(r)}
    <div class="lab-chart-grid"><div class="chart-card"><div class="chart-head"><h4>EQUITY / 净值</h4><div class="chart-legend"><span><i></i>策略</span><span><i class="bench"></i>${esc(s.benchmark)}</span></div></div>${lineChart(r.series, { height: 300 })}</div><div class="chart-card"><div class="chart-head"><h4>DRAWDOWN / 回撤</h4><span class="mono" style="font-size:8px;color:var(--dim)">MAX ${pct(m.maxDD)}</span></div>${drawdownChart(r.series)}</div></div>
    ${r.caveat || CAVEATS[s.id] ? `<div class="caveat"><b>偏差警告：</b>${esc(r.caveat || CAVEATS[s.id])}</div>` : ""}
    <div class="tabs" data-tabs><button class="tab active" data-tab="equity">净值与指标</button><button class="tab" data-tab="monthly">月度收益</button><button class="tab" data-tab="trades">交易记录 (${m.trades || 0})</button></div>
    <div class="tab-panel active" data-panel="equity"><div class="metric-grid" style="margin-top:12px">${metricBox("VOL", pct(m.vol), "")}${metricBox("SORTINO", num(m.sortino), cls(m.sortino))}${metricBox("CALMAR", num(m.calmar), cls(m.calmar))}${metricBox("PROFIT FACTOR", num(m.profitFactor), cls(m.profitFactor - 1))}${metricBox("AVG TRADE", signedPct(m.avgTrade, 2), cls(m.avgTrade))}${metricBox("EXPECTANCY", signedPct(m.expectancy, 2), cls(m.expectancy))}${metricBox("OOS TRADES", String(o.trades == null ? "—" : o.trades))}${metricBox("TURNOVER", num(r.turnover, 0), "")}</div><div class="caveat" style="margin-top:12px"><b>怎么读：</b>先看样本外，再看全样本；先看最大回撤，再看收益。参数一改就崩的策略，不要上实盘。</div></div>
    <div class="tab-panel" data-panel="monthly"><div class="chart-card"><div class="chart-head"><h4>MONTHLY HEATMAP / 月度热力</h4><span class="mono" style="font-size:8px;color:var(--dim)">BEST ${signedPct(m.bestMonth)} · WORST ${signedPct(m.worstMonth)}</span></div>${heatmap(r.monthly)}</div></div>
    <div class="tab-panel" data-panel="trades">${trades.length ? `<div class="result-line" style="padding:0 0 8px"><span>显示最近 ${Math.min(trades.length, 40)} 笔</span><span>共 ${m.trades || trades.length} 笔</span></div><div class="table-wrap"><table class="data"><thead><tr><th>入场</th><th>出场</th><th>方向</th><th class="num">收益</th><th class="num">持有</th><th>标的/篮子</th></tr></thead><tbody>${trades.map((t) => `<tr><td>${esc(t.entryDate || "")}</td><td>${esc(t.exitDate || "")}</td><td>${esc(t.side || "")}</td><td class="num ${cls(t.pnl)}">${signedPct(t.pnl, 2)}</td><td class="num">${t.bars == null ? "—" : t.bars}</td><td>${esc(t.basket || t.shortBasket || (t.side === "L" ? "Long" : t.side === "S" ? "Short" : ""))}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">没有交易记录。可能是参数过滤过严，或样本期太短。</div>`}</div>`;
  }
  function bindLab() {
    const sel = $("#lab-strategy");
    if (sel) sel.addEventListener("change", () => {
      labState.id = sel.value;
      const s = BY_ID.get(labState.id);
      labState.costBps = s.costBps || 2;
      history.replaceState(null, "", "#/lab?s=" + labState.id);
      render();
    });
    const cost = $("#lab-cost");
    if (cost) cost.addEventListener("input", () => {
      labState.costBps = Number(cost.value);
      const out = $("#lab-cost-out"), val = $("#lab-cost-val");
      if (out) out.textContent = cost.value;
      if (val) val.textContent = cost.value;
    });
    const startInput = $("#lab-start"), endInput = $("#lab-end");
    if (startInput) startInput.addEventListener("change", () => { labState.start = startInput.value; });
    if (endInput) endInput.addEventListener("change", () => { labState.end = endInput.value; });
    const run = $("#lab-run");
    if (run) run.addEventListener("click", runLab);
    bindLabResultTabs();
    $$("[data-journal]").forEach((b) => b.addEventListener("click", () => { try { sessionStorage.setItem("alpha100.prefill", b.dataset.journal); } catch (e) {} location.hash = "#/journal"; }));
  }
  function bindLabResultTabs() {
    $$("[data-tabs] .tab").forEach((t) => t.addEventListener("click", () => {
      $$("[data-tabs] .tab").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === t.dataset.tab));
    }));
  }
  function runLab() {
    const s = BY_ID.get(labState.id);
    if (!s || s.verification !== "backtest") return;
    const start = $("#lab-start")?.value || "2017-01-01";
    const end = $("#lab-end")?.value || "2026-11-03";
    labState.start = start;
    labState.end = end;
    if (start >= end) { toast("起始日期必须早于结束日期", true); return; }
    const params = {};
    $$("[data-param]").forEach((inp) => { const v = Number(inp.value); if (Number.isFinite(v)) params[inp.dataset.param] = v; });
    const btn = $("#lab-run");
    if (btn) { btn.disabled = true; btn.textContent = "计算中…"; }
    setTimeout(() => {
      try {
        const r = ENGINE.run(s, MARKET, { start, end, costBps: labState.costBps, ...params });
        const target = $("#lab-results");
        if (target) target.innerHTML = renderLabResult(r, s, "live");
        bindLabResultTabs();
        recordRun(s.id, { ts: new Date().toISOString(), start, end, costBps: labState.costBps, params, metrics: r.metrics, oos: r.oosMetrics });
        toast("回测完成；已写入本机证据记录");
      } catch (e) {
        const target = $("#lab-results");
        if (target) target.innerHTML = `<div class="lab-run-error"><b>回测失败：</b>${esc(e.message || e)}<br><span class="muted">检查日期范围、标的可用性与参数。</span></div>`;
        toast("回测失败，请检查参数", true);
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = "运行回测 →"; }
      }
    }, 30);
  }

  /* ------------------------------ journal ------------------------------ */
  function journalStats(trades) {
    const sorted = trades.filter((t) => Number.isFinite(Number(t.pnl))).slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const pnls = sorted.map((t) => Number(t.pnl) / 100);
    let eq = 1, peak = 1, maxDD = 0;
    const curve = [1];
    for (const p of pnls) { eq *= (1 + p); curve.push(eq); if (eq > peak) peak = eq; maxDD = Math.min(maxDD, eq / peak - 1); }
    const wins = pnls.filter((p) => p > 0);
    const losses = pnls.filter((p) => p <= 0);
    const grossW = wins.reduce((a, b) => a + b, 0);
    const grossL = Math.abs(losses.reduce((a, b) => a + b, 0));
    const rs = sorted.map((t) => Number(t.r)).filter(Number.isFinite);
    return { count: pnls.length, winRate: pnls.length ? wins.length / pnls.length : 0, total: curve[curve.length - 1] - 1, maxDD, profitFactor: grossL > 1e-9 ? grossW / grossL : (grossW > 0 ? Infinity : 0), expectancy: pnls.length ? pnls.reduce((a, b) => a + b, 0) / pnls.length : 0, avgR: rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0, curve, dates: ["Start", ...sorted.map((t) => t.date || "")] };
  }
  function journalHTML() {
    const j = getJournal();
    const stats = journalStats(j.trades);
    const prefill = (() => { try { return sessionStorage.getItem("alpha100.prefill"); } catch (e) { return null; } })();
    const stratOptions = FAMILIES.map((f) => `<optgroup label="${f.code} · ${esc(f.name)}">${STRATEGIES.filter((s) => s.familyCode === f.code).map((s) => `<option value="${s.id}" ${prefill === s.id ? "selected" : ""}>${s.id} · ${esc(s.name)}</option>`).join("")}</optgroup>`).join("");
    const rows = j.trades.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const tagCount = {};
    for (const t of j.trades) for (const tag of String(t.tags || "").split(/[,，\s]+/).filter(Boolean)) tagCount[tag] = (tagCount[tag] || 0) + 1;
    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return `<div class="container journal">
      <header class="journal-head"><div><div class="eyebrow">REVIEW DESK</div><h1>复盘台。</h1><p>记录每一笔纸面/实盘交易，统计真实优势。数据只保存在本机浏览器，可导出 JSON。</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-sm" id="journal-export">导出 JSON</button><label class="btn btn-sm" style="margin:0">导入 JSON<input type="file" id="journal-import" accept="application/json,.json" hidden></label></div></header>
      <div class="journal-stats"><div class="journal-stat"><span>交易数</span><strong>${stats.count}</strong></div><div class="journal-stat"><span>胜率</span><strong>${pct(stats.winRate, 0)}</strong></div><div class="journal-stat"><span>累计收益</span><strong class="${cls(stats.total)}">${signedPct(stats.total)}</strong></div><div class="journal-stat"><span>最大回撤</span><strong class="neg">${pct(stats.maxDD)}</strong></div><div class="journal-stat"><span>盈亏比</span><strong>${num(stats.profitFactor)}</strong></div><div class="journal-stat"><span>平均 R</span><strong class="${cls(stats.avgR)}">${stats.count ? stats.avgR.toFixed(2) + "R" : "—"}</strong></div></div>
      <div class="journal-grid">
        <div>
          <div class="journal-panel"><h2>记一笔</h2><p class="panel-desc">“收益 %”按账户净值计。先记纸面交易，再考虑真钱；每笔都写清 setup 与错误标签。</p>
            <form id="trade-form"><div class="form-grid">
              <div class="field"><label>日期</label><input type="date" name="date" required value="${new Date().toISOString().slice(0, 10)}"></div>
              <div class="field"><label>策略</label><select name="strategyId">${stratOptions}</select></div>
              <div class="field"><label>方向</label><select name="side"><option value="L">做多 / Long</option><option value="S">做空 / Short</option><option value="P">配对 / Pair</option></select></div>
              <div class="field"><label>收益 %</label><input type="number" name="pnl" step="0.01" placeholder="例如 1.25" required></div>
              <div class="field"><label>R 倍数</label><input type="number" name="r" step="0.1" placeholder="例如 1.8"></div>
              <div class="field"><label>执行质量</label><select name="grade"><option value="A">A · 按计划</option><option value="B">B · 小幅偏离</option><option value="C">C · 情绪化/违规</option></select></div>
              <div class="field full"><label>错误标签（逗号分隔）</label><input type="text" name="tags" placeholder="追高, 止损太慢, 提前止盈"></div>
              <div class="field full"><label>备注</label><textarea name="note" placeholder="当时看到了什么？为什么进？如果重来一次会怎么做？"></textarea></div>
            </div><div class="form-actions"><button class="btn btn-primary btn-sm" type="submit">保存交易</button><span class="hint">本机 localStorage · 可导出备份</span></div></form>
          </div>
          <div class="journal-trades"><div class="panel-head" style="padding:0 0 10px;margin:0 0 4px"><h3 style="font-family:var(--serif);font-size:20px">交易流水</h3><span class="mono" style="font-size:8px;color:var(--dim)">${rows.length} 条</span></div>
            ${rows.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>日期</th><th>策略</th><th>方向</th><th class="num">收益</th><th class="num">R</th><th>质量</th><th>标签</th><th></th></tr></thead><tbody>${rows.map((t) => { const s = BY_ID.get(t.strategyId); return `<tr><td>${esc(t.date)}</td><td>${esc(s ? s.code + " " + s.name : t.strategyId || "—")}</td><td>${esc(t.side)}</td><td class="num ${cls(Number(t.pnl) / 100)}">${Number(t.pnl) >= 0 ? "+" : ""}${Number(t.pnl).toFixed(2)}%</td><td class="num">${t.r ? Number(t.r).toFixed(1) + "R" : "—"}</td><td>${esc(t.grade || "—")}</td><td>${esc(t.tags || "")}</td><td><button class="delete-btn" data-del="${esc(t.id)}" title="删除">×</button></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="empty-state"><div class="es-icon">↗</div><h3>还没有交易记录</h3><p>从一条纸面策略开始。记录 20 笔之后，统计才有意义。</p><a class="btn btn-sm btn-primary" href="#/library">去策略库挑一条</a></div>`}
          </div>
        </div>
        <div class="journal-side">
          <div class="equity-card"><h3>JOURNAL EQUITY / 复盘净值</h3>${stats.count ? lineChart({ d: stats.dates, e: stats.curve, b: null }, { height: 220 }) : `<div class="empty" style="padding:30px 10px">记录交易后生成曲线</div>`}</div>
          <div class="equity-card"><h3>MISTAKE TAGS / 错误标签</h3>${topTags.length ? `<div class="tag-cloud">${topTags.map(([t, n]) => `<span>${esc(t)} ×${n}</span>`).join("")}</div>` : `<p class="muted" style="font-size:10px">还没有标签。每次亏损都写一个具体原因，而不是“运气不好”。</p>`}</div>
          <div class="equity-card"><h3>WEEKLY REVIEW / 周复盘</h3><form id="review-form"><div class="field" style="margin-bottom:8px"><label>日期</label><input type="date" name="date" value="${new Date().toISOString().slice(0, 10)}"></div><div class="field" style="margin-bottom:8px"><label>本周最大的教训</label><textarea name="lesson" placeholder="哪条策略失效？哪个错误重复出现？"></textarea></div><div class="field" style="margin-bottom:8px"><label>下周只做一件事</label><input type="text" name="next" placeholder="例如：只做 004 的纸面跟踪"></div><button class="btn btn-sm btn-block" type="submit">保存周复盘</button></form>${j.reviews.length ? `<div class="review-list">${j.reviews.slice().reverse().slice(0, 6).map((v) => `<div class="review-item"><div class="review-date">${esc(v.date)}</div><p><b>教训：</b>${esc(v.lesson)}</p><p><b>下一步：</b>${esc(v.next)}</p></div>`).join("")}</div>` : ""}</div>
        </div>
      </div>
    </div>`;
  }
  function bindJournal() {
    const form = $("#trade-form");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const t = { id: "t" + Date.now().toString(36), date: String(fd.get("date") || ""), strategyId: String(fd.get("strategyId") || ""), side: String(fd.get("side") || "L"), pnl: Number(fd.get("pnl") || 0), r: Number(fd.get("r") || 0), grade: String(fd.get("grade") || "B"), tags: String(fd.get("tags") || ""), note: String(fd.get("note") || "") };
      const j = getJournal(); j.trades.push(t); save(LS.journal, j);
      try { sessionStorage.removeItem("alpha100.prefill"); } catch (err) {}
      render(true); toast("交易已保存");
    });
    $$("[data-del]").forEach((b) => b.addEventListener("click", () => { const j = getJournal(); j.trades = j.trades.filter((t) => t.id !== b.dataset.del); save(LS.journal, j); render(true); toast("已删除"); }));
    const rf = $("#review-form");
    if (rf) rf.addEventListener("submit", (e) => { e.preventDefault(); const fd = new FormData(rf); const j = getJournal(); j.reviews.push({ id: "r" + Date.now().toString(36), date: String(fd.get("date") || ""), lesson: String(fd.get("lesson") || ""), next: String(fd.get("next") || "") }); save(LS.journal, j); render(true); toast("周复盘已保存"); });
    const ex = $("#journal-export");
    if (ex) ex.addEventListener("click", () => { const blob = new Blob([JSON.stringify({ ...getJournal(), checks: getChecks(), runs: getRuns(), exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "alpha100-journal-" + new Date().toISOString().slice(0, 10) + ".json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast("已导出 JSON"); });
    const imp = $("#journal-import");
    if (imp) imp.addEventListener("change", () => { const f = imp.files && imp.files[0]; if (!f) return; const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(String(reader.result)); if (data.trades) save(LS.journal, { trades: data.trades, reviews: data.reviews || [] }); if (data.checks) save(LS.checks, data.checks); if (data.runs) save(LS.runs, data.runs); render(); toast("已导入 JSON"); } catch (e) { toast("导入失败：不是有效 JSON", true); } }; reader.readAsText(f); });
  }

  /* ------------------------------ method ------------------------------ */
  function viewMethod() {
    return `<div class="container method">
      <header class="method-hero"><div class="eyebrow">METHOD / FIRST, FALSIFY</div><h1>先证伪，<br><em>再实盘。</em></h1><p class="lede">一个策略从“想法”到“能上钱”，中间隔着数据、成本、样本外、执行与心理。这个页面是本站的审稿标准，也是你使用这 100 条档案的说明书。</p></header>
      <div class="method-grid">
        <nav class="method-toc" aria-label="方法论目录"><a href="#m-evidence" class="active">01 证据阶梯</a><a href="#m-traps">02 回测的七个陷阱</a><a href="#m-live">03 实盘前 12 项检查</a><a href="#m-ai">04 AI 失效模式</a><a href="#m-risk">05 风险与免责声明</a></nav>
        <div class="method-body">
          <section id="m-evidence"><div class="section-label">01 / EVIDENCE</div><h2>证据阶梯：页面上的数字不是结论</h2><p>本站把证据分成五级。E2 只代表“在固定数据与成本下跑通”，不代表未来收益；E4 才接近“可以用真钱”。</p><div class="table-wrap" style="margin-top:16px"><table class="data"><thead><tr><th>等级</th><th>名称</th><th>需要什么</th><th>常见误判</th></tr></thead><tbody><tr><td class="mono">E0</td><td>规则草案</td><td>想法、假设、粗略规则</td><td>把“逻辑通”当成“能赚钱”</td></tr><tr><td class="mono">E1</td><td>规则审计</td><td>入场/出场/仓位/数据/执行全部写清</td><td>规则完整 ≠ 有优势</td></tr><tr><td class="mono">E2</td><td>历史回测</td><td>固定数据、成本、样本内/外切分</td><td>过拟合、幸存者偏差、前视偏差</td></tr><tr><td class="mono">E3</td><td>滚动样本外</td><td>walk-forward、参数冻结、跨制度</td><td>反复调参直到“通过”</td></tr><tr><td class="mono">E4</td><td>纸面/小资金</td><td>20–30 笔或 8–12 周、真实滑点</td><td>把牛市 beta 当成 alpha</td></tr></tbody></table></div><div class="callout"><p>“样本外通过”只说明在这段历史上，策略在扣成本后仍然为正。它不说明下个月会怎样，也不说明你能承受它的回撤。</p></div></section>
          <section id="m-traps"><div class="section-label">02 / TRAPS</div><h2>回测的七个陷阱</h2><ol class="numbered"><li><strong>前视偏差：</strong>用收盘价产生信号，却用同一根 K 线的收盘价成交。本站统一“收盘算信号、次日开盘执行”，但你的实盘数据/执行未必做得到。</li><li><strong>幸存者偏差：</strong>用今天还活着的股票/币回测过去。031、019、076、005 都有这个问题，页面已标注警告。</li><li><strong>成本低估：</strong>只算佣金，不算点差、滑点、借券、融资、税。高频策略尤其容易被成本吃掉。</li><li><strong>过拟合：</strong>反复调参数直到曲线漂亮。参数越多、样本越短，越可能是噪音。</li><li><strong>制度依赖：</strong>策略只在低利率/高波动/牛市中有效。必须跨 2018、2020、2022 这类制度切换看。</li><li><strong>做空幻觉：</strong>回测假设随时能借券、借券费为零、不会被逼空。真实世界不是这样。</li><li><strong>数据质量：</strong>复权、分红、时区、停牌、合约换月都会改变信号。先清洗数据，再谈策略。</li></ol></section>
          <section id="m-live"><div class="section-label">03 / LIVE CHECKLIST</div><h2>实盘前 12 项检查</h2><div class="two-col"><ul><li>规则能写成 if/then，不依赖“盘感”。</li><li>数据源稳定，时间戳与交易日历对齐。</li><li>样本外至少 30% 时间，且没有反复调参。</li><li>扣掉 2–5 bps/边成本后仍然为正。</li><li>最大回撤你能在心理上承受。</li><li>单笔风险 ≤0.5–1% 权益，总敞口有上限。</li></ul><ul><li>有明确的 kill switch（回撤/连续亏损/数据异常）。</li><li>执行场所、订单类型、交易时段已确认。</li><li>借券/融资/税/监管已核查。</li><li>纸面 20–30 笔，滑点与回测假设接近。</li><li>有交易日志与每周复盘，不事后改规则。</li><li>最坏情况下，损失不超过你可承受的范围。</li></ul></div><div class="callout warn"><p>如果任何一项答案是“还没”，就不要用真钱。用纸面账户把这个缺口补上。</p></div></section>
          <section id="m-ai"><div class="section-label">04 / AI FAILURE MODES</div><h2>AI 会在哪里骗你</h2><ul><li><strong>幻觉与过度自信：</strong>LLM 会编造财报数字、条款和新闻。所有结构化输出必须回链原文，关键字段人工抽检。</li><li><strong>数据泄漏：</strong>训练集包含未来信息，或用收盘后的新闻解释盘中信号。时间戳必须严格对齐。</li><li><strong>制度漂移：</strong>模型在 2017–2021 学到的关系，2022 之后可能反转。必须 walk-forward，不能一次训练用到底。</li><li><strong>反馈回路：</strong>你的模型基于市场数据，市场又基于所有模型交易。拥挤后，优势会衰减。</li><li><strong>可解释性陷阱：</strong>SHAP 好看不等于因果。模型只是排序器，不是预言机。</li><li><strong>执行差距：</strong>模型预测 1 分钟后上涨，但你的延迟、手续费和滑点可能让净收益为负。</li></ul><div class="callout"><p>AI 在本站的角色是：<strong>过滤、排序、抽取、执行、风控</strong>。没有一条策略把“让 LLM 直接预测价格”当成唯一 edge。</p></div></section>
          <section id="m-risk"><div class="section-label">05 / RISK & DISCLAIMER</div><h2>风险与免责声明</h2><p>本站是研究与教育工具，不是投资顾问、不是信号服务、不是资产管理。所有策略、回测、指标与示例都可能包含错误；数据来自 Yahoo Finance，可能存在复权、缺失与延迟问题。</p><p>交易涉及亏损风险，杠杆、期权、期货、加密资产与做空可能造成超过本金的损失。你必须独立评估自己的财务状况、风险承受能力、税务与合规义务，并在必要时咨询持牌专业人士。</p><p>本站不构成任何证券、期货、期权、外汇或加密资产的买卖建议。任何根据本站内容做出的决策，风险由你自行承担。</p><div class="callout warn"><p>一句话：<strong>先证伪，再实盘；先小钱，再放大；先活着，再谈收益。</strong></p></div></section>
        </div>
      </div>
    </div>`;
  }

  /* ------------------------------ command palette ------------------------------ */
  let commandOpen = false;
  function openCommand() {
    if (commandOpen) return;
    commandOpen = true;
    const root = $("#modal-root");
    root.innerHTML = `<div class="modal-backdrop" id="command-backdrop"><div class="command" role="dialog" aria-modal="true" aria-label="搜索策略"><div class="command-input"><span>⌕</span><input id="command-search" placeholder="搜索 100 条策略、市场、AI 用法…" autocomplete="off"><kbd>ESC</kbd></div><div class="command-list" id="command-list"></div><div class="command-foot"><span>↑↓ 选择 · Enter 打开 · Esc 关闭</span><a href="#/library" id="command-all" style="color:var(--acid)">查看全部 100 条 →</a></div></div></div>`;
    const input = $("#command-search"), list = $("#command-list");
    let active = 0;
    let keyHandler = null;
    const close = () => {
      commandOpen = false;
      root.innerHTML = "";
      if (keyHandler) document.removeEventListener("keydown", keyHandler);
    };
    const renderList = () => {
      const q = input.value.trim().toLowerCase();
      const items = STRATEGIES.filter((s) => !q || [s.id, s.code, s.name, s.en, s.family, s.market, s.aiRole, s.tags.join(" ")].join(" ").toLowerCase().includes(q)).slice(0, 12);
      active = Math.max(0, Math.min(active, items.length - 1));
      list.innerHTML = items.length ? items.map((s, i) => `<button class="command-item ${i === active ? "active" : ""}" data-goto="${s.id}"><span class="ci-code">${s.code}</span><span class="ci-main"><b>${esc(s.name)}</b><span>${esc(s.family)} · ${esc(s.market)} · ${esc(s.aiRole)}</span></span><span class="ci-pill">${VERIFY_LABEL[s.verification]}</span></button>`).join("") : `<div class="command-empty">没有匹配的策略</div>`;
      $$("[data-goto]", list).forEach((b) => b.addEventListener("click", () => { close(); location.hash = "#/strategy/" + b.dataset.goto; }));
    };
    keyHandler = (e) => {
      const items = $$("[data-goto]", list);
      if (e.key === "Escape") { close(); }
      if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(items.length - 1, active + 1); renderList(); }
      if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(0, active - 1); renderList(); }
      if (e.key === "Enter" && items[active]) { close(); location.hash = "#/strategy/" + items[active].dataset.goto; }
    };
    input.addEventListener("input", () => { active = 0; renderList(); });
    document.addEventListener("keydown", keyHandler);
    $("#command-backdrop").addEventListener("click", (e) => { if (e.target.id === "command-backdrop") close(); });
    $("#command-all").addEventListener("click", () => { close(); location.hash = "#/library"; });
    renderList();
    setTimeout(() => input.focus(), 20);
  }

  /* ------------------------------ toast ------------------------------ */
  let toastTimer = null;
  function toast(msg, isError) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("error", !!isError);
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  /* ------------------------------ router ------------------------------ */
  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [path, queryString] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    return { name: parts[0] || "home", id: parts[1] || null, query: new URLSearchParams(queryString || "") };
  }
  function setActiveNav(name) {
    const navName = name === "strategy" ? "library" : name;
    $$("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === navName));
  }
  function notFound(message) {
    return `<div class="container" style="padding:100px 0;text-align:center"><div class="eyebrow" style="justify-content:center">404 / NOT FOUND</div><h1 style="font-family:var(--serif);font-size:56px;font-weight:500;margin:18px 0">${esc(message || "页面不存在")}</h1><p class="muted">回到 <a href="#/library" style="color:var(--acid)">策略库</a>，或按 ⌘K 搜索。</p></div>`;
  }
  function render(keepScroll) {
    const route = parseRoute();
    setActiveNav(route.name);
    const app = $("#app");
    if (!app) return;
    if (route.name === "home") app.innerHTML = viewHome();
    else if (route.name === "library") {
      libState.family = route.query.get("family") || "all";
      app.innerHTML = viewLibrary();
      bindLibrary();
    } else if (route.name === "strategy") {
      app.innerHTML = viewStrategy(route.id);
      bindStrategy(route.id);
    } else if (route.name === "lab") {
      if (route.query.get("s") && BY_ID.has(route.query.get("s"))) labState.id = route.query.get("s");
      app.innerHTML = viewLab();
      bindLab();
    } else if (route.name === "journal") {
      app.innerHTML = journalHTML();
      bindJournal();
    } else if (route.name === "method") {
      app.innerHTML = viewMethod();
      bindMethodTOC();
    } else {
      app.innerHTML = notFound("找不到这个页面");
    }
    if (!keepScroll) window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
  function bindMethodTOC() {
    $$(".method-toc a").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = a.getAttribute("href").replace("#", "");
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      $$(".method-toc a").forEach((x) => x.classList.remove("active"));
      a.classList.add("active");
    }));
  }

  /* ------------------------------ init ------------------------------ */
  function init() {
    const strip = $("#market-ticker");
    if (strip) strip.innerHTML = tickerHTML();
    const cmd = $("#open-command");
    if (cmd) cmd.addEventListener("click", openCommand);
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openCommand(); }
    });
    window.addEventListener("hashchange", () => render());
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
