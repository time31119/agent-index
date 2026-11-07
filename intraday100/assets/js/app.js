/* INTRADAY 100 — session-only research terminal. */
(function () {
  "use strict";

  const STRATEGIES = window.INTRADAY_STRATEGIES || [];
  const META = window.INTRADAY_META || { families: [], counts: {} };
  const RESULTS = (window.INTRADAY_RESULTS || {}).byId || {};
  const DATA = window.INTRADAY_DATA || { datasets: {} };
  const ENGINE = window.IntradayEngine;
  const BY_ID = new Map(STRATEGIES.map((s) => [s.id, s]));
  const FAMILIES = META.families || [];
  const FAMILY_BY_CODE = new Map(FAMILIES.map((f) => [f.code, f]));

  const VERIFY_LABEL = { backtest: "可回测", paper: "纸面验证", data: "需另类数据", audit: "结构核验" };
  const VERIFY_CLASS = { backtest: "pill-acid", paper: "pill-cyan", data: "pill-orange", audit: "pill-muted" };
  const RISK_CLASS = { "低": "pill-cyan", "中": "pill-muted", "中高": "pill-orange", "高": "pill-orange", "极高": "pill-red" };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = (x, d) => (Number.isFinite(x) ? (x * 100).toFixed(d == null ? 1 : d) + "%" : "—");
  const signedPct = (x, d) => (Number.isFinite(x) ? (x >= 0 ? "+" : "") + (x * 100).toFixed(d == null ? 1 : d) + "%" : "—");
  const num = (x, d) => (x === Infinity ? "∞" : Number.isFinite(x) ? x.toFixed(d == null ? 2 : d) : "—");
  const cls = (x, invert) => (!Number.isFinite(x) || Math.abs(x) < 1e-9 ? "" : (invert ? x < 0 : x > 0) ? "pos" : "neg");
  const verdictClass = (v) => (v === "样本外通过" ? "pass" : v && v.indexOf("未通过") >= 0 ? "fail" : "");

  /* storage */
  const LS = { journal: "intraday100.journal.v1", checks: "intraday100.checks.v1", runs: "intraday100.runs.v1" };
  function load(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function getJournal() { const j = load(LS.journal, { trades: [], reviews: [] }); return { trades: Array.isArray(j.trades) ? j.trades : [], reviews: Array.isArray(j.reviews) ? j.reviews : [] }; }
  function getChecks() { return load(LS.checks, {}); }
  function getRuns() { return load(LS.runs, {}); }
  function recordRun(id, payload) { const r = getRuns(); if (!r[id]) r[id] = []; r[id].unshift(payload); r[id] = r[id].slice(0, 12); save(LS.runs, r); }

  /* charts */
  let UID = 0;
  const uid = () => "g" + (++UID);
  function norm(values) { const f = values.find((v) => Number.isFinite(v) && v !== 0); return f ? values.map((v) => (Number.isFinite(v) ? v / f : 1)) : values.map(() => 1); }
  function sparkline(values, opts) {
    const o = opts || {};
    if (!values || values.length < 2) return "";
    const w = o.w || 140, h = o.h || 36, pad = 2;
    const v = norm(values), min = Math.min(...v), max = Math.max(...v), span = max - min || 1;
    const pts = v.map((x, i) => [pad + (i / (v.length - 1)) * (w - pad * 2), h - pad - ((x - min) / span) * (h - pad * 2)]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    const up = v[v.length - 1] >= v[0], color = o.color || (up ? "var(--acid)" : "var(--red)");
    const area = d + ` L${w - pad},${h - pad} L${pad},${h - pad} Z`, gid = uid();
    return `<svg class="spark-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#${gid})"></path><path d="${d}" fill="none" stroke="${color}" stroke-width="1.4" vector-effect="non-scaling-stroke"></path></svg>`;
  }
  function equitySeries(r) {
    if (!r || !r.equity || !r.equity.length) return { d: [], e: [], b: null };
    return { d: r.equity.map((x) => x.date), e: r.equity.map((x) => x.v), b: null, splitDate: r.splitDate };
  }
  function lineChart(series, opts) {
    const o = opts || {}, W = 860, H = o.height || 260, pad = { l: 48, r: 18, t: 18, b: 30 };
    const e = norm(series.e || []), dts = series.d || [], n = e.length;
    if (n < 2) return `<div class="empty">没有足够的数据</div>`;
    let min = Math.min(...e), max = Math.max(...e);
    if (max === min) { min *= 0.99; max *= 1.01; }
    const pv = (max - min) * 0.08 || 0.01; min -= pv; max += pv;
    const x = (i) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
    const path = (arr) => arr.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + "," + y(v).toFixed(1)).join(" ");
    const area = path(e) + ` L${x(n - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
    const splitIdx = series.splitDate ? dts.findIndex((d) => d >= series.splitDate) : -1;
    const grid = [0, 1, 2, 3, 4].map((k) => { const v = max - ((max - min) * k) / 4, yy = y(v); return `<line x1="${pad.l}" y1="${yy}" x2="${W - pad.r}" y2="${yy}" stroke="rgba(255,255,255,.06)"/><text x="${pad.l - 8}" y="${yy + 3}" text-anchor="end" fill="#65736c" font-size="9" font-family="monospace">${v.toFixed(2)}</text>`; }).join("");
    const shade = splitIdx > 1 ? `<rect x="${x(splitIdx)}" y="${pad.t}" width="${W - pad.r - x(splitIdx)}" height="${H - pad.t - pad.b}" fill="rgba(255,159,90,.04)"/><line x1="${x(splitIdx)}" y1="${pad.t}" x2="${x(splitIdx)}" y2="${H - pad.b}" stroke="rgba(255,159,90,.35)" stroke-dasharray="3 4"/><text x="${x(splitIdx) + 6}" y="${pad.t + 11}" fill="#ff9f5a" font-size="8" font-family="monospace">OOS</text>` : "";
    const idx = [0, Math.floor((n - 1) / 2), n - 1];
    const labels = idx.map((i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="${i === 0 ? "start" : i === n - 1 ? "end" : "middle"}" fill="#65736c" font-size="8.5" font-family="monospace">${dts[i] || ""}</text>`).join("");
    const gid = uid();
    return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9f56b" stop-opacity=".18"/><stop offset="1" stop-color="#c9f56b" stop-opacity="0"/></linearGradient></defs>${grid}${shade}<path d="${area}" fill="url(#${gid})"></path><path d="${path(e)}" fill="none" stroke="#c9f56b" stroke-width="1.8" vector-effect="non-scaling-stroke"></path><circle cx="${x(n - 1)}" cy="${y(e[n - 1])}" r="3" fill="#c9f56b"></circle>${labels}</svg>`;
  }
  function dailyBars(days, opts) {
    const o = opts || {}, W = 860, H = o.height || 190, pad = { l: 42, r: 14, t: 16, b: 24 };
    if (!days || !days.length) return `<div class="empty">没有交易日数据</div>`;
    const vals = days.map((d) => d.pnl);
    const maxAbs = Math.max(...vals.map((v) => Math.abs(v)), 0.001);
    const x = (i) => pad.l + (i / Math.max(1, days.length - 1)) * (W - pad.l - pad.r);
    const zero = pad.t + (H - pad.t - pad.b) / 2;
    const y = (v) => zero - (v / maxAbs) * ((H - pad.t - pad.b) / 2 - 4);
    const bw = Math.max(1.2, (W - pad.l - pad.r) / Math.max(1, days.length) - 1.2);
    const bars = days.map((d, i) => `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${Math.min(y(d.pnl), zero).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, Math.abs(y(d.pnl) - zero)).toFixed(1)}" class="${d.pnl >= 0 ? "pos" : "neg"}"><title>${d.date} ${signedPct(d.pnl)}</title></rect>`).join("");
    const labels = [0, Math.floor((days.length - 1) / 2), days.length - 1].map((i) => `<text x="${x(i)}" y="${H - 7}" text-anchor="${i === 0 ? "start" : i === days.length - 1 ? "end" : "middle"}" fill="#65736c" font-size="8" font-family="monospace">${days[i].date}</text>`).join("");
    return `<svg class="daily-bars" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"><line x1="${pad.l}" y1="${zero}" x2="${W - pad.r}" y2="${zero}" stroke="rgba(255,255,255,.12)"/><text x="${pad.l - 6}" y="${pad.t + 8}" text-anchor="end" fill="#65736c" font-size="8" font-family="monospace">+${(maxAbs * 100).toFixed(1)}%</text><text x="${pad.l - 6}" y="${H - pad.b}" text-anchor="end" fill="#65736c" font-size="8" font-family="monospace">-${(maxAbs * 100).toFixed(1)}%</text>${bars}${labels}</svg>`;
  }

  function tickerHTML() {
    const ds = DATA.datasets.five || DATA.datasets.hour;
    if (!ds) return "";
    const defs = ["SPY", "QQQ", "NVDA", "BTC-USD"];
    return defs.map((sym) => {
      const s = ds.symbols[sym];
      if (!s) return "";
      let last = -1, prev = -1;
      for (let i = s.c.length - 1; i >= 0; i--) if (Number.isFinite(s.c[i])) { last = i; break; }
      for (let i = last - 1; i >= 0; i--) if (Number.isFinite(s.c[i])) { prev = i; break; }
      if (last < 0 || prev < 0) return "";
      const chg = s.c[last] / s.c[prev] - 1;
      return `<div class="tick"><b>${sym.replace("-USD", "")}</b><span>${s.c[last].toFixed(2)}</span><em class="${chg < 0 ? "down" : ""}">${signedPct(chg, 2)}</em></div>`;
    }).join("");
  }

  /* components */
  const pillVerify = (v) => `<span class="pill ${VERIFY_CLASS[v] || "pill-muted"}">${VERIFY_LABEL[v] || v}</span>`;
  const pillRisk = (r) => `<span class="pill ${RISK_CLASS[r] || "pill-muted"}">${esc(r)}风险</span>`;
  function verdictPill(v) {
    if (!v) return "";
    const c = v === "样本外通过" ? "pill-acid" : v === "样本外未通过" ? "pill-red" : v === "仅样本外通过" ? "pill-orange" : "pill-muted";
    return `<span class="pill ${c}">${esc(v)}</span>`;
  }
  function resultOf(s) { return RESULTS[s.id] && RESULTS[s.id].ok ? RESULTS[s.id] : null; }
  function card(s) {
    const r = resultOf(s), m = r ? r.metrics : null;
    const green = m ? m.greenDayRate : null;
    return `<a class="strategy-card" href="#/strategy/${s.id}">
      <span class="card-arrow">↗</span>
      <div class="card-top"><span class="card-code">${s.code}</span><span class="pill pill-muted">${esc(s.family)}</span>${pillVerify(s.verification)}${r ? verdictPill(r.verdict) : ""}</div>
      <h3>${esc(s.name)}</h3><div class="card-en">${esc(s.en)}</div>
      <p class="card-thesis">${esc(s.thesis)}</p>
      <div class="card-ai"><span>AI</span>${esc(s.aiRole)} · ${esc(s.session)}</div>
      <div class="card-daily">${m ? `<span>绿天率 <b>${pct(green, 0)}</b></span><span>最大连亏 <b>${m.maxLosingStreak}</b></span><span>总收益 <b class="${cls(m.total)}">${signedPct(m.total)}</b></span>` : `<span>仅日内 · 0 隔夜</span>`}</div>
      <div class="card-foot">
        <div class="card-risk"><b>${esc(s.holding)}</b> · ${esc(s.direction)}<br>${pillRisk(s.riskLevel)}</div>
        <div class="readiness"><div class="readiness-top"><span>就绪</span><b>${s.readiness}</b></div><div class="bar"><i style="width:${s.readiness}%"></i></div></div>
      </div>
    </a>`;
  }
  function familyBlurb(code) {
    return {
      A: "开盘区间、跳空、前日高低点与波动压缩。",
      B: "VWAP、布林带、RSI 与短期过度反应。",
      C: "VWAP 趋势、EMA、相对强弱与尾盘动量。",
      D: "价差、OFI、冰山、做市与执行。",
      E: "CPI、FOMC、非农、财报与到期日。",
      F: "0DTE、gamma、偏斜与尾部对冲。",
      G: "BTC/ETH session、资金费率与链上。",
      H: "TWAP、MOC、基差与跨市场套利。",
      I: "日篮、波动目标、损失上限与时段过滤。",
      J: "新闻、电话会、社媒与订单流 AI。",
    }[code] || "";
  }
  function familyCard(f) {
    const list = STRATEGIES.filter((s) => s.familyCode === f.code);
    const bt = list.filter((s) => s.verification === "backtest").length;
    return `<a class="family-card" href="#/library?family=${f.code}" data-code="${f.code}"><div class="family-code">${f.code} / ${String(list.length).padStart(2, "0")}</div><h3>${esc(f.name)}</h3><p>${esc(familyBlurb(f.code))}</p><div class="family-meta"><span>可回测 <b>${bt}</b></span><span>仅日内 <b>10</b></span></div></a>`;
  }
  function metricBox(label, value, klass) { return `<div class="metric"><span>${label}</span><strong class="${klass || ""}">${value}</strong></div>`; }
  function resultMetrics(r) {
    const m = r.metrics || {}, o = r.oos || {};
    const oos = Number.isFinite(o.cagr) ? signedPct(o.cagr) : signedPct(o.total);
    return `<div class="metric-grid">
      ${metricBox("GREEN DAYS", pct(m.greenDayRate, 0), m.greenDayRate >= 0.55 ? "pos" : "")}
      ${metricBox("MAX LOSING STREAK", String(m.maxLosingStreak), m.maxLosingStreak > 5 ? "neg" : "")}
      ${metricBox("AVG DAY", signedPct(m.avgDaily, 2), cls(m.avgDaily))}
      ${metricBox("WORST DAY", signedPct(m.worstDay, 2), "neg")}
      ${metricBox("TOTAL", signedPct(m.total), cls(m.total))}
      ${metricBox("MAX DD", pct(m.maxDD), "neg")}
      ${metricBox("TRADES", String(m.trades))}
      ${metricBox("OOS", oos, cls(o.cagr == null ? o.total : o.cagr))}
    </div>`;
  }
  function sessionClock() {
    return `<div class="session-clock"><div class="session-slot"><span>09:30</span><b>开盘</b></div><div class="session-slot active"><span>09:30–10:30</span><b>ORB / 跳空</b></div><div class="session-slot"><span>11:30–14:00</span><b>午盘回归</b></div><div class="session-slot"><span>15:25–15:55</span><b>尾盘 / 平仓</b></div></div>`;
  }

  /* home */
  function viewHome() {
    const all = Object.values(RESULTS).filter((r) => r.ok);
    const liquid = all.filter((r) => r.metrics.trades >= 20);
    const bestGreen = liquid.length ? Math.max(...liquid.map((r) => r.metrics.greenDayRate)) : 0;
    const passed = all.filter((r) => r.verdict === "样本外通过").length;
    const feat = ["013", "021", "018"].map((id) => ({ s: BY_ID.get(id), r: RESULTS[id] })).filter((x) => x.s);
    const main = feat[0];
    return `<div class="container">
      <section class="hero">
        <div class="hero-grid">
          <div class="hero-copy">
            <div class="eyebrow">SESSION-ONLY / 100 DOSSIERS</div>
            <h1>100 条日内策略，<br><em>没有一条保证<br>每天盈利。</em></h1>
            <p class="hero-lede">只做日内，<strong>15:55 前全部平仓</strong>。每条都有入场、出场、风控、AI 用法、历史案例与实盘门槛；但“每天必赚”不是策略，是<strong style="color:var(--red)">红线</strong>。</p>
            <div class="hero-actions"><a class="btn btn-primary" href="#/library">进入策略库 →</a><a class="btn" href="#/lab?s=021">跑一条回测</a><a class="btn btn-ghost" href="#/daily">先看每日真相</a></div>
            <div class="hero-note"><span>100 条策略</span><span>${META.counts.backtest} 条可回测</span><span>最高绿天率 ${pct(bestGreen, 0)}</span><span>0 隔夜</span></div>
            <div class="stat-row">
              <div class="stat-block"><strong>100</strong><span>日内策略</span></div>
              <div class="stat-block"><strong>${META.counts.backtest}</strong><span>真实分钟回测</span></div>
              <div class="stat-block"><strong>${bestGreen ? pct(bestGreen, 0) : "—"}</strong><span>最高历史绿天率</span></div>
              <div class="stat-block"><strong>${passed}</strong><span>样本外通过</span></div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-orbit" aria-hidden="true"></div>
            <div class="terminal">
              <div class="terminal-head"><span>SESSION QUEUE / FEATURED</span><span>● NO OVERNIGHT</span></div>
              <div class="terminal-body">
                <div class="terminal-label"><i></i> ${main ? main.s.code : "013"} · ${main ? esc(main.s.session) : ""}</div>
                <div class="terminal-title">${main ? esc(main.s.name) : "RSI(2) 日内超卖"}</div>
                <div class="terminal-sub">${main ? esc(main.s.en) : ""}</div>
                <div class="terminal-chart">${main && main.r && main.r.ok ? sparkline(main.r.equity.map((x) => x.v), { w: 560, h: 150 }) : ""}</div>
                <div class="terminal-metrics">
                  <div class="terminal-metric"><span>GREEN DAYS</span><strong>${main && main.r ? pct(main.r.metrics.greenDayRate, 0) : "—"}</strong></div>
                  <div class="terminal-metric"><span>MAX STREAK</span><strong class="red">${main && main.r ? main.r.metrics.maxLosingStreak : "—"}</strong></div>
                  <div class="terminal-metric"><span>OOS</span><strong>${main && main.r ? (Number.isFinite(main.r.oos.cagr) ? signedPct(main.r.oos.cagr) : signedPct(main.r.oos.total)) : "—"}</strong></div>
                </div>
                <div class="terminal-foot"><span>${main && main.r ? main.r.verdict : ""} · 无隔夜</span><a href="#/lab?s=${main ? main.s.id : "013"}">打开实验室 →</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><div><div class="section-kicker">01 / THE RED LINE</div><h2>“每天盈利”<br><em style="color:var(--red);font-style:italic">是一个危险信号。</em></h2></div><p>如果有人承诺每天盈利，他要么在隐藏亏损日，要么在卖一个尾部风险极高的策略。数学上，即使每天 70% 胜率，20 天全绿的概率也只有 0.08%。</p></div>
        ${sessionClock()}
        <div class="truth-banner"><div class="tb-mark">!</div><div><h3>本站不提供“每天盈利”策略</h3><p>只提供可验证的日内规则，并把绿天率、最大连亏、最差单日与样本外表现一起展示。你可以追求高胜率，但不能要求每天都赢。</p></div></div>
      </section>

      <section class="section">
        <div class="section-head"><div><div class="section-kicker">02 / THE MAP</div><h2>十个时段，<br>一百种打法。</h2></div><p>从开盘拍卖到收盘竞价，从 5 分钟到 1 小时，从 ETF 到加密。所有策略都在收盘前平仓。</p></div>
        <div class="family-grid">${FAMILIES.map(familyCard).join("")}</div>
      </section>

      <section class="section">
        <div class="section-head"><div><div class="section-kicker">03 / FEATURED</div><h2>先用三条，<br>测“每天盈利”的幻觉。</h2></div><p>一条样本外通过、一条高绿天率但样本不足、一条回测亏损。把它们放在一起看，比只看收益曲线更有用。</p></div>
        <div class="featured-grid">${feat.map(({ s, r }, i) => {
          const rr = r && r.ok ? r : null;
          return `<a class="featured-card ${i === 0 ? "primary" : ""}" href="#/strategy/${s.id}"><span class="featured-number">${s.code}</span><div class="featured-top">${pillVerify(s.verification)}${rr ? verdictPill(rr.verdict) : ""}<span class="pill pill-muted">${esc(s.session)}</span></div><h3>${esc(s.name)}</h3><p>${esc(s.thesis)}</p><div class="featured-chart">${rr ? sparkline(rr.equity.map((x) => x.v), { w: 260, h: 64 }) : ""}</div><div class="featured-metrics"><span>绿天 <b>${rr ? pct(rr.metrics.greenDayRate, 0) : "—"}</b></span><span>连亏 <b>${rr ? rr.metrics.maxLosingStreak : "—"}</b></span><span>OOS <b>${rr ? (Number.isFinite(rr.oos.cagr) ? signedPct(rr.oos.cagr) : signedPct(rr.oos.total)) : "—"}</b></span></div></a>`;
        }).join("")}</div>
      </section>

      <section class="section">
        <div class="ladder-grid">
          <div class="ladder-copy"><div class="section-kicker">04 / EVIDENCE</div><h2>回测通过，<br><em style="color:var(--acid);font-style:italic">只是第二级。</em></h2><p>日内策略的样本很短、成本很高、制度变化很快。E2 只说明规则在特定数据上跑通；E4 才接近可以用真钱。</p><div style="margin-top:22px"><a class="link-arrow" href="#/method">阅读方法论</a></div></div>
          <div class="ladder">${[["E0","规则草案","想法，没有可执行规则。","不交易"],["E1","规则审计","入场/出场/风控/数据写清。","本站 100 条"],["E2","分钟回测","固定数据/成本/样本外。","${META.counts.backtest} 条"],["E3","滚动样本外","walk-forward、跨制度。","需要你完成"],["E4","纸面/小资金","20–30 笔、真实滑点。","最终门槛"]].map(([lv, t, d, s], i) => `<div class="ladder-step ${i === 2 ? "active" : ""}"><div class="level">${lv}</div><div><h4>${t}</h4><p>${d}</p></div><div class="status">${s}</div></div>`).join("")}</div>
        </div>
      </section>

      <section class="section"><div class="notice"><div class="notice-icon">!</div><p><strong>先读这句：</strong>日内交易的成本、滑点与情绪压力都很高；加密、期权、0DTE、微观结构策略风险极高。本站不是信号服务，不承诺任何收益，也不提供“每天盈利”策略。实盘前请完成样本外、纸面与小资金验证。</p></div></section>
    </div>`;
  }

  /* library */
  const lib = { q: "", family: "all", session: "all", verification: "all", risk: "all", sort: "green" };
  function filtered() {
    let list = STRATEGIES.slice();
    const q = lib.q.trim().toLowerCase();
    if (q) list = list.filter((s) => [s.id, s.code, s.name, s.en, s.family, s.market, s.aiRole, s.session, s.tags.join(" ")].join(" ").toLowerCase().includes(q));
    if (lib.family !== "all") list = list.filter((s) => s.familyCode === lib.family);
    if (lib.session !== "all") list = list.filter((s) => s.session.indexOf(lib.session) >= 0);
    if (lib.verification !== "all") list = list.filter((s) => s.verification === lib.verification);
    if (lib.risk !== "all") list = list.filter((s) => s.riskLevel === lib.risk);
    if (lib.sort === "green") list.sort((a, b) => { const ra = resultOf(a), rb = resultOf(b); return (rb ? rb.metrics.greenDayRate : -1) - (ra ? ra.metrics.greenDayRate : -1); });
    else if (lib.sort === "readiness") list.sort((a, b) => b.readiness - a.readiness);
    else if (lib.sort === "id") list.sort((a, b) => a.id.localeCompare(b.id));
    else if (lib.sort === "risk") { const o = { "低": 0, "中": 1, "中高": 2, "高": 3, "极高": 4 }; list.sort((a, b) => (o[a.riskLevel] || 0) - (o[b.riskLevel] || 0)); }
    return list;
  }
  function grid() {
    const list = filtered(), g = $("#strategy-grid"), c = $("#result-count");
    if (c) c.innerHTML = `<strong>${list.length}</strong> / 100 条日内策略`;
    if (g) g.innerHTML = list.length ? list.map(card).join("") : `<div class="empty">没有匹配的策略。</div>`;
  }
  function viewLibrary() {
    return `<div class="container">
      <header class="page-head"><div class="eyebrow kicker">THE LIBRARY / 100 SESSION DOSSIERS</div><h1>日内策略库。<br><em>没有隔夜。</em></h1><p class="lede">每条都写到可以下单：时段、入场、出场、风控、数据、执行场所、失败模式与历史案例。先筛掉你不能执行的。</p><div class="head-meta"><span>总计 <b>100</b></span><span>可回测 <b>${META.counts.backtest}</b></span><span>纸面 <b>${META.counts.paper}</b></span><span>需数据 <b>${META.counts.data}</b></span><span>结构核验 <b>${META.counts.audit}</b></span></div></header>
      <div class="toolbar">
        <div class="search-box"><span>⌕</span><input id="lib-search" type="search" placeholder="搜索策略、时段、AI 用法、标签…" value="${esc(lib.q)}"></div>
        <select class="select" id="lib-family"><option value="all">全部家族</option>${FAMILIES.map((f) => `<option value="${f.code}" ${lib.family === f.code ? "selected" : ""}>${f.code} · ${esc(f.name)}</option>`).join("")}</select>
        <select class="select" id="lib-session"><option value="all">全部时段</option><option value="09:30" ${lib.session === "09:30" ? "selected" : ""}>开盘</option><option value="10:00" ${lib.session === "10:00" ? "selected" : ""}>上午</option><option value="11:30" ${lib.session === "11:30" ? "selected" : ""}>午盘</option><option value="15:" ${lib.session === "15:" ? "selected" : ""}>尾盘</option><option value="全天" ${lib.session === "全天" ? "selected" : ""}>全天</option></select>
        <select class="select" id="lib-verification"><option value="all">全部验证</option>${Object.entries(VERIFY_LABEL).map(([k, v]) => `<option value="${k}" ${lib.verification === k ? "selected" : ""}>${v}</option>`).join("")}</select>
        <select class="select" id="lib-risk"><option value="all">全部风险</option>${["中", "中高", "高", "极高"].map((r) => `<option value="${r}" ${lib.risk === r ? "selected" : ""}>${r}风险</option>`).join("")}</select>
        <select class="select" id="lib-sort"><option value="green" ${lib.sort === "green" ? "selected" : ""}>按绿天率</option><option value="readiness" ${lib.sort === "readiness" ? "selected" : ""}>按就绪度</option><option value="id" ${lib.sort === "id" ? "selected" : ""}>按编号</option><option value="risk" ${lib.sort === "risk" ? "selected" : ""}>按风险</option></select>
        <a class="btn btn-sm btn-ghost" href="data/intraday-index.csv" download>CSV 索引</a>
      </div>
      <div class="result-line"><span id="result-count"><strong>${filtered().length}</strong> / 100 条日内策略</span><span>绿天率是历史统计，不是每日承诺。</span></div>
      <div class="strategy-grid" id="strategy-grid">${filtered().map(card).join("")}</div>
    </div>`;
  }
  function bindLibrary() {
    $("#lib-search")?.addEventListener("input", (e) => { lib.q = e.target.value; grid(); });
    $("#lib-family")?.addEventListener("change", (e) => { lib.family = e.target.value; grid(); });
    $("#lib-session")?.addEventListener("change", (e) => { lib.session = e.target.value; grid(); });
    $("#lib-verification")?.addEventListener("change", (e) => { lib.verification = e.target.value; grid(); });
    $("#lib-risk")?.addEventListener("change", (e) => { lib.risk = e.target.value; grid(); });
    $("#lib-sort")?.addEventListener("change", (e) => { lib.sort = e.target.value; grid(); });
  }

  /* detail */
  function viewDetail(id) {
    const s = BY_ID.get(id);
    if (!s) return notFound("找不到这条策略。");
    const r = resultOf(s), m = r ? r.metrics : null;
    const checks = getChecks()[id] || [];
    const runs = getRuns()[id] || [];
    const family = STRATEGIES.filter((x) => x.familyCode === s.familyCode && x.id !== id).slice(0, 3);
    const protocol = s.protocol && s.protocol.length ? s.protocol : ["接入并校验数据：" + s.data, "用 6–12 个月样本外数据回放，冻结参数", "纸面 20–30 次，记录滑点/成交率", "扣成本后仍为正，且最大回撤可承受，才考虑小资金"];
    return `<div class="container detail">
      <div class="breadcrumb"><a href="#/">首页</a><span>/</span><a href="#/library">策略库</a><span>/</span><span>${s.code}</span></div>
      <header class="detail-head"><div><div class="detail-kicker"><span class="pill pill-muted">${esc(s.family)}</span>${pillVerify(s.verification)}${pillRisk(s.riskLevel)}<span class="intraday-badge">仅日内</span></div><h1>${esc(s.name)}</h1><div class="detail-en">${esc(s.en)}</div><div class="detail-tags"><span class="pill pill-cyan">${esc(s.session)}</span><span class="pill pill-muted">${esc(s.holding)}</span>${s.tags.map((t) => `<span class="pill pill-muted">${esc(t)}</span>`).join("")}</div></div><div class="detail-score"><div class="score-label">LIVE READINESS</div><div class="score-value">${s.readiness}</div><div class="score-bar"><i style="width:${s.readiness}%"></i></div><div class="score-note">${esc(s.capital)} · ${esc(s.access)}</div></div></header>
      <div class="detail-grid">
        <div class="dossier">
          <section><div class="section-label">01 / THESIS</div><h2>这条优势从哪来</h2><p>${esc(s.thesis)}</p><div class="ai-box"><div class="ai-head"><span>AI LAYER</span><b>${esc(s.aiRole)}</b></div><p>${esc(s.ai)}</p></div></section>
          <section><div class="section-label">02 / SESSION SETUP</div><h2>时段与前置条件</h2><p>${esc(s.setup)}</p><div class="rule-grid"><div class="rule-card"><div class="rule-title">ENTRY / 入场</div><p>${esc(s.entry)}</p></div><div class="rule-card exit"><div class="rule-title">EXIT / 出场</div><p>${esc(s.exit)}</p></div><div class="rule-card risk"><div class="rule-title">RISK / 风控</div><p>${esc(s.risk)}</p></div></div></section>
          <section><div class="section-label">03 / OPERATIONS</div><h2>数据、执行与容量</h2><div class="two-col"><div><div class="section-label">DATA</div><p>${esc(s.data)}</p></div><div><div class="section-label">EXECUTION</div><p>${esc(s.execution)}</p></div></div><div class="two-col"><div><div class="section-label">CAPACITY</div><p>${esc(s.capacity)} · ${esc(s.capital)} · ${esc(s.access)}</p></div><div><div class="section-label">SESSION</div><p>${esc(s.session)} · ${esc(s.holding)} · ${esc(s.direction)}</p></div></div></section>
          <section><div class="section-label">04 / FAILURE MODES</div><h2>它会在哪里失效</h2><div class="two-col"><div><div class="section-label">FAILS</div><ul class="mini-list fails"><li>${esc(s.fails)}</li></ul></div><div><div class="section-label">LIVE CHECK</div><ul class="mini-list">${s.liveCheck.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div></section>
          ${r ? `<section><div class="section-label">05 / BACKTEST</div><h2>分钟数据说了什么</h2><div class="verdict ${verdictClass(r.verdict)}"><div class="verdict-mark">${r.verdict === "样本外通过" ? "✓" : r.verdict === "样本外未通过" ? "×" : "!"}</div><div><h4>${esc(r.verdict)} · ${esc(r.start)} → ${esc(r.end)}</h4><p>${esc(r.dataset)} 数据；70% 样本内 / 30% 样本外；成本 ${s.costBps || 2} bps/边；不放隔夜。</p></div></div>${resultMetrics(r)}<div class="chart-card" style="margin-top:12px"><div class="chart-head"><h4>EQUITY / 净值</h4><span class="no-overnight">NO OVERNIGHT</span></div>${lineChart(equitySeries(r), { height: 260 })}</div><div class="chart-card" style="margin-top:10px"><div class="chart-head"><h4>DAILY P&L / 每日盈亏</h4><span class="mono" style="font-size:8px;color:var(--dim)">GREEN ${pct(m.greenDayRate, 0)}</span></div>${dailyBars(r.days, { height: 190 })}</div><div class="daily-summary"><div class="daily-cell"><span>GREEN DAYS</span><strong>${pct(m.greenDayRate, 0)}</strong></div><div class="daily-cell"><span>MAX LOSING STREAK</span><strong class="red">${m.maxLosingStreak}</strong></div><div class="daily-cell"><span>WORST DAY</span><strong class="red">${signedPct(m.worstDay, 2)}</strong></div><div class="daily-cell"><span>AVG DAY</span><strong class="${cls(m.avgDaily)}">${signedPct(m.avgDaily, 2)}</strong></div></div><div class="case-card"><div class="case-head"><span>BEST TRADE</span><b>${r.best ? `${esc(r.best.entryDate)} ${esc(r.best.entryTime)} · ${esc(r.best.side)}` : "—"}</b></div><p>${r.best ? `收益 ${signedPct(r.best.pnl, 2)}，${esc(r.best.reason)}。这是回测中的一个成功样本，不代表未来。` : "无交易样本。"}</p>${r.worst ? `<div class="case-result">最差交易：${esc(r.worst.entryDate)} ${esc(r.worst.entryTime)} · ${signedPct(r.worst.pnl, 2)}</div>` : ""}</div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><a class="btn btn-sm btn-primary" href="#/lab?s=${s.id}">改参数重跑</a><button class="btn btn-sm" data-copy="${s.id}">复制规则摘要</button></div></section>` : `<section><div class="section-label">05 / VERIFICATION</div><h2>没有分钟回测，怎么求证</h2><div class="notice"><div class="notice-icon">i</div><p>这条策略需要${s.verification === "data" ? "另类数据或专业通道" : "纸面/前向验证"}。不要用“感觉”替代证据。</p></div><ol class="protocol">${protocol.map((p) => `<li>${esc(p)}</li>`).join("")}</ol></section>`}
          <section><div class="section-label">06 / CASE</div><h2>历史案例</h2><div class="case-card"><div class="case-head"><span>${s.caseType === "backtest" ? "BACKTEST" : "EVENT"}</span><b>${esc(s.caseType === "backtest" ? "回测样本" : "历史场景")}</b></div><p>${esc(s.caseStudy)}</p>${s.caseType === "backtest" ? `<div class="case-result">上方 BEST TRADE 是本数据集的真实回测交易；本段是场景说明，不构成额外验证。</div>` : `<div class="case-result">这是事件复盘，不是已验证的盈利记录。</div>`}</div></section>
          <section><div class="section-label">07 / CHECKLIST</div><h2>实盘前，逐项打勾</h2><p>勾选状态保存在本机浏览器。没有全部勾完，不要上真钱。</p><div class="check-list">${s.liveCheck.map((x, i) => `<label><input type="checkbox" data-check="${s.id}" data-index="${i}" ${checks[i] ? "checked" : ""}><span>${esc(x)}</span></label>`).join("")}</div></section>
          <section><div class="section-label">08 / RELATED</div><h2>同家族的其它打法</h2><div class="related-grid">${family.map((x) => `<a class="related-card" href="#/strategy/${x.id}"><div class="code">${x.code}</div><h4>${esc(x.name)}</h4></a>`).join("")}</div></section>
        </div>
        <aside class="aside">
          <div class="evidence-card"><div class="ev-head"><div><div class="score-label">DAILY REALITY</div><div class="ev-level">${m ? pct(m.greenDayRate, 0) : "—"}</div></div>${pillVerify(s.verification)}</div><div class="ev-title">${m ? `绿天率 ${pct(m.greenDayRate, 0)}，最大连亏 ${m.maxLosingStreak} 天` : "仅日内，暂无回测"}</div><div class="ev-sub">${m ? `最差单日 ${signedPct(m.worstDay, 2)}；平均日 ${signedPct(m.avgDaily, 2)}。没有一天是保证的。` : "先完成纸面/数据验证，再谈实盘。"}</div><div class="ev-row"><span>就绪度</span><b>${s.readiness}/100</b></div><div class="ev-row"><span>风险</span><b>${esc(s.riskLevel)}</b></div><div class="ev-row"><span>时段</span><b>${esc(s.session)}</b></div><div class="ev-row"><span>隔夜</span><b style="color:var(--cyan)">0</b></div>${runs.length ? `<div class="ev-row"><span>本机运行</span><b>${runs.length} 次</b></div>` : ""}<div class="ev-actions"><a class="btn btn-primary btn-block" href="#/lab?s=${s.id}">在实验室打开</a><button class="btn btn-ghost btn-block" data-journal="${s.id}">加入复盘</button></div></div>
          <div class="evidence-card"><div class="score-label">OPERATING NOTES</div><div class="ev-title" style="margin-top:8px">${esc(s.capital)} · ${esc(s.access)}</div><div class="ev-sub">容量：${esc(s.capacity)}。风险：${esc(s.riskLevel)}。持有：${esc(s.holding)}。方向：${esc(s.direction)}。</div><div class="ev-row"><span>市场</span><b>${esc(s.market)}</b></div><div class="ev-row"><span>标的</span><b>${esc((s.symbols || []).join(" / ") || "多资产")}</b></div></div>
        </aside>
      </div>
    </div>`;
  }
  function bindDetail(id) {
    $$("[data-check]").forEach((cb) => cb.addEventListener("change", () => { const all = getChecks(); if (!all[id]) all[id] = []; all[id][Number(cb.dataset.index)] = cb.checked; save(LS.checks, all); }));
    const copy = $('[data-copy="' + id + '"]'); if (copy) copy.addEventListener("click", () => copyRules(id));
    const j = $('[data-journal="' + id + '"]'); if (j) j.addEventListener("click", () => { try { sessionStorage.setItem("intraday100.prefill", id); } catch (e) {} location.hash = "#/journal"; });
  }
  function copyRules(id) {
    const s = BY_ID.get(id); if (!s) return;
    const txt = [`${s.code} ${s.name} (${s.en})`, `市场：${s.market} | 时段：${s.session} | 持有：${s.holding} | 方向：${s.direction}`, `AI：${s.aiRole} — ${s.ai}`, `逻辑：${s.thesis}`, `Setup：${s.setup}`, `入场：${s.entry}`, `出场：${s.exit}`, `风控：${s.risk}`, `数据：${s.data}`, `执行：${s.execution}`, `失效：${s.fails}`].join("\n");
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast("规则摘要已复制")).catch(() => toast("复制失败", true)); else toast("浏览器不支持剪贴板", true);
  }

  /* lab */
  const lab = { id: "021", start: null, end: null, costBps: 1.5, tab: "equity" };
  function labOptions(selected) {
    return FAMILIES.map((f) => `<optgroup label="${f.code} · ${esc(f.name)}">${STRATEGIES.filter((s) => s.familyCode === f.code && s.verification === "backtest").map((s) => `<option value="${s.id}" ${s.id === selected ? "selected" : ""}>${s.id} · ${esc(s.name)}</option>`).join("")}</optgroup>`).join("");
  }
  function datasetMeta(key) { return DATA.datasets[key]?.meta || {}; }
  function viewLab() {
    const s = BY_ID.get(lab.id) || STRATEGIES.find((x) => x.verification === "backtest");
    if (lab._id !== s.id) { lab._id = s.id; lab.costBps = s.costBps || 2; lab.start = null; lab.end = null; }
    const isBt = s.verification === "backtest";
    const r = RESULTS[s.id] && RESULTS[s.id].ok ? RESULTS[s.id] : null;
    const initial = isBt ? (r ? renderResult(r, s, "precomputed") : `<div class="lab-placeholder">点击运行回测</div>`) : renderNonBt(s);
    return `<div class="container lab">
      <header class="lab-head"><div><div class="eyebrow">SESSION LAB</div><h1>日内实验室。</h1><p>真实 5 分钟/1 小时 bars，固定成本，按时间切分。看净值，也看每日盈亏与最大连亏。</p></div><div class="head-meta"><span>5m <b>${datasetMeta("five").bars || 0}</b> bars</span><span>1h <b>${datasetMeta("hour").bars || 0}</b> bars</span><span>crypto <b>${datasetMeta("crypto").bars || 0}</b> bars</span></div></header>
      <div class="lab-layout">
        <div class="lab-controls">
          <div class="control"><label>策略 <b>${s.code}</b></label><select id="lab-strategy">${labOptions(s.id)}</select></div>
          <div class="control"><label>数据集</label><select id="lab-dataset">${["five","hour","crypto"].map((k) => `<option value="${k}" ${s.dataset === k ? "selected" : ""}>${k} · ${DATA.datasets[k]?.interval || ""} · ${datasetMeta(k).start || ""}</option>`).join("")}</select></div>
          <div class="control"><label>起始 <b>${lab.start || datasetMeta(s.dataset).start || ""}</b></label><input type="date" id="lab-start" value="${lab.start || datasetMeta(s.dataset).start || ""}" min="${datasetMeta(s.dataset).start || ""}" max="${datasetMeta(s.dataset).end || ""}"></div>
          <div class="control"><label>结束 <b>${lab.end || datasetMeta(s.dataset).end || ""}</b></label><input type="date" id="lab-end" value="${lab.end || datasetMeta(s.dataset).end || ""}" min="${datasetMeta(s.dataset).start || ""}" max="${datasetMeta(s.dataset).end || ""}"></div>
          <div class="control"><label>单边成本 <b><span id="lab-cost-out">${lab.costBps}</span> bps</b></label><div class="range-row"><input type="range" id="lab-cost" min="0" max="8" step="0.5" value="${lab.costBps}"><output id="lab-cost-val">${lab.costBps}</output></div></div>
          <div class="lab-params" id="lab-params">${isBt ? paramsHTML(s) : ""}</div>
          <button class="btn btn-primary run-btn" id="lab-run" ${isBt ? "" : "disabled"}>${isBt ? "运行回测 →" : "需另类验证"}</button>
          <div class="lab-meta">成本 1.5–4 bps/边<br>收盘前强平 · 无隔夜<br>结果不含融资/借券/税/冲击</div>
        </div>
        <div class="lab-results" id="lab-results">${initial}</div>
      </div>
    </div>`;
  }
  function paramsHTML(s) {
    const nums = Object.entries(s.params || {}).filter(([, v]) => typeof v === "number");
    return `<div class="param-grid">${nums.map(([k, v]) => `<div class="param"><label>${esc(k)}</label><input type="number" step="any" data-param="${esc(k)}" value="${v}"></div>`).join("")}</div>`;
  }
  function renderNonBt(s) {
    const proto = s.protocol && s.protocol.length ? s.protocol : ["接入并校验数据：" + s.data, "6–12 个月样本外回放", "纸面 20–30 次，记录滑点", "扣成本后仍为正再考虑实盘"];
    return `<div class="nonbt"><div class="head-meta" style="margin-bottom:12px">${pillVerify(s.verification)}${pillRisk(s.riskLevel)}<span class="intraday-badge">仅日内</span></div><h2>${esc(s.name)}</h2><p>${esc(s.thesis)}</p><div class="nonbt-grid"><div class="nonbt-box"><h4>WHY NOT BACKTEST</h4><p>${esc(s.verification === "data" ? "需要另类数据/专业通道，现有 bars 无法忠实复现。" : s.verification === "audit" ? "基础设施型策略，重点在延迟/库存/工程。" : "核心变量无法用现有 bars 覆盖，必须纸面/前向验证。")}</p></div><div class="nonbt-box"><h4>DATA REQUIRED</h4><p>${esc(s.data)}</p></div></div><div class="nonbt-box" style="margin-top:12px"><h4>VERIFICATION PROTOCOL</h4><ol class="protocol">${proto.map((p) => `<li>${esc(p)}</li>`).join("")}</ol></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><a class="btn btn-sm btn-primary" href="#/strategy/${s.id}">看完整档案</a><button class="btn btn-sm" data-journal="${s.id}">加入复盘</button></div></div>`;
  }
  function normalize(raw) {
    if (raw.metrics && raw.equity && raw.equity[0] && raw.equity[0].v != null) return raw;
    const dates = raw.dates || [];
    const eq = raw.equity.map((v, i) => ({ date: dates[i], v }));
    const dayMap = new Map();
    for (const t of raw.trades) dayMap.set(t.exitDate, (dayMap.get(t.exitDate) || 0) + t.pnl);
    const days = Array.from(dayMap.entries()).map(([date, pnl]) => ({ date, pnl }));
    const fullOk = raw.metrics.trades >= 20 && raw.metrics.sharpe > 0.1 && raw.metrics.cagr > 0 && raw.metrics.greenDayRate > 0.4;
    const oosOk = raw.oosMetrics.trades >= 8 && raw.oosMetrics.sharpe > 0.1 && raw.oosMetrics.cagr > 0;
    const verdict = raw.oosMetrics.trades < 8 ? "样本不足" : fullOk && oosOk ? "样本外通过" : oosOk ? "仅样本外通过" : "样本外未通过";
    return { ...raw, metrics: raw.metrics, is: raw.isMetrics, oos: raw.oosMetrics, verdict, equity: eq, days, start: dates[0], end: dates[dates.length - 1], splitDate: dates[Math.floor(dates.length * 0.7)] };
  }
  function renderResult(raw, s, source) {
    const r = normalize(raw), m = r.metrics, o = r.oos;
    const trades = (r.trades || []).slice().reverse().slice(0, 50);
    return `<div class="lab-result-head"><div><h2>${esc(s.name)}</h2><p>${s.code} · ${esc(r.start)} → ${esc(r.end)} · ${esc(source === "precomputed" ? "预计算 baseline" : "刚刚运行")} · ${esc(r.verdict)}</p></div><div class="lab-verdict verdict ${verdictClass(r.verdict)}" style="padding:9px 12px"><div class="verdict-mark">${r.verdict === "样本外通过" ? "✓" : r.verdict === "样本外未通过" ? "×" : "!"}</div><div><h4>${esc(r.verdict)}</h4><p>OOS ${Number.isFinite(o.cagr) ? signedPct(o.cagr) : signedPct(o.total)}</p></div></div></div>
      ${resultMetrics(r)}
      <div class="lab-chart-grid"><div class="chart-card"><div class="chart-head"><h4>EQUITY / 净值</h4><span class="no-overnight">NO OVERNIGHT</span></div>${lineChart(equitySeries(r), { height: 280 })}</div><div class="chart-card"><div class="chart-head"><h4>DAILY P&L / 每日盈亏</h4><span class="mono" style="font-size:8px;color:var(--dim)">${pct(m.greenDayRate, 0)} GREEN</span></div>${dailyBars(r.days, { height: 180 })}</div></div>
      <div class="tabs" data-tabs><button class="tab active" data-tab="trades">交易记录 (${m.trades})</button><button class="tab" data-tab="daily">每日明细</button></div>
      <div class="tab-panel active" data-panel="trades">${trades.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>日期</th><th>入场</th><th>出场</th><th>方向</th><th class="num">收益</th><th class="num">bars</th><th>原因</th></tr></thead><tbody>${trades.map((t) => `<tr><td>${esc(t.entryDate)}</td><td>${esc(t.entryTime || "")}</td><td>${esc(t.exitTime || "")}</td><td>${esc(t.side)}</td><td class="num ${cls(t.pnl)}">${signedPct(t.pnl, 2)}</td><td class="num">${t.bars}</td><td>${esc(t.reason || "")}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">没有交易记录。</div>`}</div>
      <div class="tab-panel" data-panel="daily">${r.days && r.days.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>日期</th><th class="num">当日收益</th><th>颜色</th></tr></thead><tbody>${r.days.slice(-80).reverse().map((d) => `<tr><td>${esc(d.date)}</td><td class="num ${cls(d.pnl)}">${signedPct(d.pnl, 2)}</td><td>${d.pnl > 0 ? "GREEN" : d.pnl < 0 ? "RED" : "FLAT"}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">没有每日数据。</div>`}</div>`;
  }
  function bindLab() {
    $("#lab-strategy")?.addEventListener("change", (e) => { lab.id = e.target.value; const s = BY_ID.get(lab.id); lab.costBps = s.costBps || 2; lab.start = null; lab.end = null; history.replaceState(null, "", "#/lab?s=" + lab.id); render(); });
    $("#lab-dataset")?.addEventListener("change", (e) => { const s = BY_ID.get(lab.id); const ds = e.target.value; const m = datasetMeta(ds); lab.start = m.start; lab.end = m.end; render(); });
    $("#lab-cost")?.addEventListener("input", (e) => { lab.costBps = Number(e.target.value); $("#lab-cost-out").textContent = e.target.value; $("#lab-cost-val").textContent = e.target.value; });
    $("#lab-start")?.addEventListener("change", (e) => { lab.start = e.target.value; });
    $("#lab-end")?.addEventListener("change", (e) => { lab.end = e.target.value; });
    $("#lab-run")?.addEventListener("click", runLab);
    bindTabs();
    $$("[data-journal]").forEach((b) => b.addEventListener("click", () => { try { sessionStorage.setItem("intraday100.prefill", b.dataset.journal); } catch (e) {} location.hash = "#/journal"; }));
  }
  function bindTabs() { $$("[data-tabs] .tab").forEach((t) => t.addEventListener("click", () => { $$("[data-tabs] .tab").forEach((x) => x.classList.remove("active")); t.classList.add("active"); $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === t.dataset.tab)); })); }
  function runLab() {
    const s = BY_ID.get(lab.id); if (!s || s.verification !== "backtest") return;
    const ds = $("#lab-dataset")?.value || s.dataset;
    const start = $("#lab-start")?.value || datasetMeta(ds).start;
    const end = $("#lab-end")?.value || datasetMeta(ds).end;
    if (start >= end) { toast("起始日期必须早于结束日期", true); return; }
    const params = {}; $$("[data-param]").forEach((i) => { const v = Number(i.value); if (Number.isFinite(v)) params[i.dataset.param] = v; });
    const btn = $("#lab-run"); if (btn) { btn.disabled = true; btn.textContent = "计算中…"; }
    setTimeout(() => {
      try {
        const r = ENGINE.run(s, ds, { start, end, costBps: lab.costBps, ...params });
        $("#lab-results").innerHTML = renderResult(r, s, "live"); bindTabs();
        recordRun(s.id, { ts: new Date().toISOString(), dataset: ds, start, end, costBps: lab.costBps, params, metrics: r.metrics, oos: r.oosMetrics });
        toast("回测完成；已写入本机证据记录");
      } catch (e) {
        $("#lab-results").innerHTML = `<div class="lab-run-error"><b>回测失败：</b>${esc(e.message || e)}</div>`; toast("回测失败", true);
      } finally { if (btn) { btn.disabled = false; btn.textContent = "运行回测 →"; } }
    }, 30);
  }

  /* daily reality */
  function simulate(p, win, loss, days, n) {
    const finals = [], redCounts = [];
    for (let k = 0; k < n; k++) {
      let eq = 1, red = 0;
      for (let d = 0; d < days; d++) {
        if (Math.random() < p) eq *= 1 + win / 100;
        else { eq *= 1 - loss / 100; red++; }
      }
      finals.push(eq); redCounts.push(red);
    }
    finals.sort((a, b) => a - b);
    return { finals, redCounts, p5: finals[Math.floor(n * 0.05)], median: finals[Math.floor(n * 0.5)], worst: finals[0] };
  }
  function viewDaily() {    const all = Object.values(RESULTS).filter((r) => r.ok).sort((a, b) => b.metrics.greenDayRate - a.metrics.greenDayRate);
    const rows = all.map((r) => `<tr><td>${r.id}</td><td>${esc(BY_ID.get(r.id)?.name || "")}</td><td class="num">${pct(r.metrics.greenDayRate, 0)}</td><td class="num">${r.metrics.maxLosingStreak}</td><td class="num neg">${signedPct(r.metrics.worstDay, 2)}</td><td class="num ${cls(r.metrics.total)}">${signedPct(r.metrics.total)}</td><td>${esc(r.verdict)}</td></tr>`).join("");
    return `<div class="container">
      <header class="reality-hero"><div><div class="eyebrow">DAILY REALITY</div><h1>每天盈利？<br><em>先算一下概率。</em></h1><p>“每天必须盈利”不是策略目标，是数学上几乎不可能的事件。下面这个模拟器把每日胜率、盈亏比和交易天数放在一起，让你看到 20 天、60 天、250 天里至少出现一个亏损日的概率。</p></div><div class="reality-card"><h2>20 天全绿的概率</h2><p class="sub">即使每天胜率 70%，20 天全绿也只有 0.08%。</p><div class="reality-result"><div class="reality-stat"><span>每天胜率</span><strong id="dr-p">70%</strong></div><div class="reality-stat"><span>20 天全绿</span><strong id="dr-all" class="red">0.08%</strong></div><div class="reality-stat"><span>至少 1 个亏损日</span><strong id="dr-red" class="red">99.92%</strong></div><div class="reality-stat"><span>最大连亏（中位）</span><strong id="dr-streak">2 天</strong></div></div><div class="prob-bar"><i id="dr-bar" style="width:99.9%"></i></div><div class="reality-explain"><b>这不是策略好坏，而是算术。</b> 胜率越高、交易越频繁，越容易在某个时刻遇到亏损日。任何“每天必赚”的承诺，都在隐藏亏损日或尾部风险。</div></div></header>
      <div class="reality-grid">
        <div class="reality-card"><h2>模拟器</h2><p class="sub">假设每天独立、固定盈亏；真实市场有相关性，连亏会更长。这个模拟只用于打破“每天必赚”的幻觉。</p>
          <div class="reality-field"><label>每天胜率 %</label><input id="sim-p" type="number" min="1" max="99" step="1" value="62"></div>
          <div class="reality-field"><label>平均盈利 %</label><input id="sim-win" type="number" min="0.01" step="0.01" value="0.55"></div>
          <div class="reality-field"><label>平均亏损 %</label><input id="sim-loss" type="number" min="0.01" step="0.01" value="0.8"></div>
          <div class="reality-field"><label>交易天数</label><input id="sim-days" type="number" min="5" max="500" step="1" value="20"></div>
          <button class="btn btn-primary btn-block" id="sim-run">重新模拟 5,000 条路径</button>
          <div class="reality-result"><div class="reality-stat"><span>全绿概率</span><strong id="sim-all">—</strong></div><div class="reality-stat"><span>至少 1 亏</span><strong id="sim-red" class="red">—</strong></div><div class="reality-stat"><span>中位终值</span><strong id="sim-median">—</strong></div><div class="reality-stat"><span>5% 最差终值</span><strong id="sim-p5" class="red">—</strong></div><div class="reality-stat"><span>最大连亏中位</span><strong id="sim-streak">—</strong></div><div class="reality-stat"><span>最大连亏 95 分位</span><strong id="sim-p95" class="red">—</strong></div></div>
          <div class="sim-hist" id="sim-hist"></div><div class="reality-explain" id="sim-note">加载中…</div>
        </div>
        <div class="reality-card"><h2>回测里的绿天率</h2><p class="sub">按历史绿天率排序。绿天率高不代表能每天盈利；看最大连亏与最差单日。</p><div class="table-wrap reality-table"><table class="data"><thead><tr><th>#</th><th>策略</th><th class="num">绿天率</th><th class="num">最大连亏</th><th class="num">最差单日</th><th class="num">总收益</th><th>结论</th></tr></thead><tbody>${rows}</tbody></table></div><div class="reality-explain"><b>注意：</b>这些是历史回测，不是未来承诺。最高绿天率也可能伴随巨大的尾部风险。</div></div>
      </div>
    </div>`;
  }
  function bindDaily() {
    const run = () => {
      const p = Math.max(1, Math.min(99, Number($("#sim-p").value) || 62)) / 100;
      const win = Math.max(0.01, Number($("#sim-win").value) || 0.55);
      const loss = Math.max(0.01, Number($("#sim-loss").value) || 0.8);
      const days = Math.max(5, Math.min(500, Number($("#sim-days").value) || 20));
      const sim = simulate(p, win, loss, days, 5000);
      const allGreen = Math.pow(p, days);
      const q = 1 - p;
      const approxStreak = q > 0 && days * q > 1 ? Math.log(days * q) / Math.log(1 / q) : 1;
      const medianStreak = Math.max(1, Math.round(approxStreak));
      const p95Streak = Math.max(medianStreak + 1, Math.round(approxStreak + 2));
      $("#sim-all").textContent = pct(allGreen, 2);
      $("#sim-red").textContent = pct(1 - allGreen, 2);
      $("#sim-median").textContent = signedPct(sim.median - 1, 2);
      $("#sim-p5").textContent = signedPct(sim.p5 - 1, 2);
      $("#sim-streak").textContent = "≈ " + medianStreak + " 天";
      $("#sim-p95").textContent = "≈ " + p95Streak + " 天";
      const hist = new Array(12).fill(0);
      for (const red of sim.redCounts) hist[Math.min(11, red)]++;
      $("#sim-hist").innerHTML = hist.map((n, i) => `<i style="height:${Math.max(2, (n / sim.redCounts.length) * 100)}%;opacity:${0.35 + (i / 11) * 0.65}" title="亏损日 ${i === 11 ? "11+" : i} 天：${n} 条路径"></i>`).join("");
      $("#sim-note").innerHTML = `<b>${days} 天</b>里，${pct(1 - allGreen, 2)} 的路径至少出现一个亏损日；按近似公式，最大连亏中位约 ${medianStreak} 天。即使每天胜率 ${pct(p, 0)}，也不要承诺每天盈利。`;
      $("#dr-p").textContent = pct(p, 0); $("#dr-all").textContent = pct(allGreen, 2); $("#dr-red").textContent = pct(1 - allGreen, 2); $("#dr-streak").textContent = "≈ " + medianStreak + " 天"; $("#dr-bar").style.width = Math.min(100, (1 - allGreen) * 100) + "%";
    };
    $("#sim-run")?.addEventListener("click", run);
    run();
  }

  /* journal */
  function journalStats(trades) {
    const valid = trades.filter((t) => Number.isFinite(Number(t.pnl)));
    const byDay = new Map();
    for (const t of valid) { if (!byDay.has(t.date)) byDay.set(t.date, 0); byDay.set(t.date, byDay.get(t.date) + Number(t.pnl) / 100); }
    const days = Array.from(byDay.entries()).map(([date, pnl]) => ({ date, pnl })).sort((a, b) => a.date.localeCompare(b.date));
    let eq = 1; const curve = [1]; for (const d of days) { eq *= (1 + d.pnl); curve.push(eq); }
    let streak = 0, maxStreak = 0;
    for (const d of days) { if (d.pnl < 0) { streak++; maxStreak = Math.max(maxStreak, streak); } else streak = 0; }
    const wins = valid.filter((t) => Number(t.pnl) > 0), losses = valid.filter((t) => Number(t.pnl) <= 0);
    const gw = wins.reduce((a, t) => a + Number(t.pnl) / 100, 0), gl = Math.abs(losses.reduce((a, t) => a + Number(t.pnl) / 100, 0));
    return { count: valid.length, days, curve, greenRate: days.length ? days.filter((d) => d.pnl > 0).length / days.length : 0, maxStreak, total: eq - 1, pf: gl > 1e-9 ? gw / gl : (gw > 0 ? Infinity : 0), worst: days.length ? Math.min(...days.map((d) => d.pnl)) : 0, avg: days.length ? days.reduce((a, d) => a + d.pnl, 0) / days.length : 0 };
  }
  function viewJournal() {
    const j = getJournal(), st = journalStats(j.trades);
    const prefill = (() => { try { return sessionStorage.getItem("intraday100.prefill"); } catch (e) { return null; } })();
    const opts = FAMILIES.map((f) => `<optgroup label="${f.code} · ${esc(f.name)}">${STRATEGIES.filter((s) => s.familyCode === f.code).map((s) => `<option value="${s.id}" ${prefill === s.id ? "selected" : ""}>${s.id} · ${esc(s.name)}</option>`).join("")}</optgroup>`).join("");
    const rows = j.trades.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return `<div class="container journal">
      <header class="journal-head"><div><div class="eyebrow">SESSION REVIEW</div><h1>日内复盘台。</h1><p>记录入场/出场时间、当日盈亏、错误标签。任何隔夜持仓都会被标红。</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-sm" id="journal-export">导出 JSON</button><label class="btn btn-sm" style="margin:0">导入 JSON<input type="file" id="journal-import" accept="application/json,.json" hidden></label></div></header>
      <div class="journal-stats"><div class="journal-stat"><span>交易数</span><strong>${st.count}</strong></div><div class="journal-stat"><span>绿天率</span><strong>${pct(st.greenRate, 0)}</strong></div><div class="journal-stat"><span>累计收益</span><strong class="${cls(st.total)}">${signedPct(st.total)}</strong></div><div class="journal-stat"><span>最大连亏</span><strong class="red">${st.maxStreak} 天</strong></div><div class="journal-stat"><span>盈亏比</span><strong>${num(st.pf)}</strong></div><div class="journal-stat"><span>最差单日</span><strong class="red">${signedPct(st.worst, 2)}</strong></div></div>
      <div class="journal-grid">
        <div>
          <div class="journal-panel"><h2>记一笔</h2><p class="panel-desc">收益 % 按账户净值计。记录入场/出场时间；如果日期不同，系统会提示隔夜违规。</p>
            <form id="trade-form"><div class="form-grid">
              <div class="field"><label>日期</label><input type="date" name="date" required value="${new Date().toISOString().slice(0, 10)}"></div>
              <div class="field"><label>出场日期</label><input type="date" name="exitDate" value="${new Date().toISOString().slice(0, 10)}"></div>
              <div class="field"><label>策略</label><select name="strategyId">${opts}</select></div>
              <div class="field"><label>入场时间</label><input type="time" name="entryTime" value="09:45"></div>
              <div class="field"><label>出场时间</label><input type="time" name="exitTime" value="10:30"></div>
              <div class="field"><label>方向</label><select name="side"><option value="L">做多</option><option value="S">做空</option><option value="P">配对</option></select></div>
              <div class="field"><label>收益 %</label><input type="number" name="pnl" step="0.01" placeholder="例如 0.35" required></div>
              <div class="field"><label>R 倍数</label><input type="number" name="r" step="0.1" placeholder="例如 1.2"></div>
              <div class="field"><label>执行质量</label><select name="grade"><option value="A">A · 按计划</option><option value="B">B · 小幅偏离</option><option value="C">C · 违规</option></select></div>
              <div class="field full"><label>错误标签</label><input type="text" name="tags" placeholder="追高, 止损太慢, 提前止盈"></div>
              <div class="field full"><label>备注</label><textarea name="note" placeholder="当时看到了什么？为什么进？如果重来一次会怎么做？"></textarea></div>
            </div><div class="form-actions"><button class="btn btn-primary btn-sm" type="submit">保存交易</button><span class="hint">本机 localStorage · 可导出</span></div></form>
          </div>
          <div class="journal-trades"><div class="panel-head" style="padding:0 0 10px;margin:0 0 4px"><h3 style="font-family:var(--serif);font-size:20px">交易流水</h3><span class="mono" style="font-size:8px;color:var(--dim)">${rows.length} 条</span></div>${rows.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>日期</th><th>策略</th><th>入场/出场</th><th>方向</th><th class="num">收益</th><th class="num">R</th><th>质量</th><th>标签</th><th></th></tr></thead><tbody>${rows.map((t) => { const s = BY_ID.get(t.strategyId); return `<tr><td>${esc(t.date)}</td><td>${esc(s ? s.code : t.strategyId || "—")}</td><td>${esc(t.entryTime || "")}–${esc(t.exitTime || "")} ${t.entryDate && t.exitDate && t.entryDate !== t.exitDate ? `<span class="red">OVERNIGHT ${esc(t.entryDate)}→${esc(t.exitDate)}</span>` : ""}</td><td>${esc(t.side)}</td><td class="num ${cls(Number(t.pnl) / 100)}">${Number(t.pnl) >= 0 ? "+" : ""}${Number(t.pnl).toFixed(2)}%</td><td class="num">${t.r ? Number(t.r).toFixed(1) + "R" : "—"}</td><td>${esc(t.grade || "—")}</td><td>${esc(t.tags || "")}</td><td><button class="delete-btn" data-del="${esc(t.id)}">×</button></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="empty-state"><div class="es-icon">↗</div><h3>还没有日内交易</h3><p>从一条纸面策略开始。记录 20 笔后，绿天率与连亏才有意义。</p><a class="btn btn-sm btn-primary" href="#/library">去策略库挑一条</a></div>`}</div>
        </div>
        <div class="journal-side"><div class="equity-card"><h3>DAILY EQUITY / 复盘净值</h3>${st.days.length ? lineChart({ d: ["Start", ...st.days.map((d) => d.date)], e: st.curve, b: null }, { height: 220 }) : `<div class="empty" style="padding:30px 10px">记录交易后生成曲线</div>`}</div><div class="equity-card"><h3>DAILY P&L / 每日盈亏</h3>${st.days.length ? dailyBars(st.days, { height: 160 }) : `<div class="empty" style="padding:30px 10px">记录交易后生成</div>`}<div class="reality-explain" style="margin-top:10px">绿天率 <b>${pct(st.greenRate, 0)}</b> · 最大连亏 <b>${st.maxStreak} 天</b> · 最差单日 <b>${signedPct(st.worst, 2)}</b>。不要用“每天盈利”要求自己。</div></div><div class="equity-card"><h3>WEEKLY REVIEW / 周复盘</h3><form id="review-form"><div class="field" style="margin-bottom:8px"><label>日期</label><input type="date" name="date" value="${new Date().toISOString().slice(0, 10)}"></div><div class="field" style="margin-bottom:8px"><label>本周最大教训</label><textarea name="lesson" placeholder="哪条策略失效？哪个错误重复？"></textarea></div><div class="field" style="margin-bottom:8px"><label>下周只做一件事</label><input type="text" name="next" placeholder="例如：只做 021 的纸面跟踪"></div><button class="btn btn-sm btn-block" type="submit">保存周复盘</button></form>${j.reviews.length ? `<div class="review-list">${j.reviews.slice().reverse().slice(0, 6).map((v) => `<div class="review-item"><div class="review-date">${esc(v.date)}</div><p><b>教训：</b>${esc(v.lesson)}</p><p><b>下一步：</b>${esc(v.next)}</p></div>`).join("")}</div>` : ""}</div></div>
      </div>
    </div>`;
  }
  function bindJournal() {
    $("#trade-form")?.addEventListener("submit", (e) => {
      e.preventDefault(); const fd = new FormData(e.target); const j = getJournal();
      const t = { id: "t" + Date.now().toString(36), date: String(fd.get("date")), entryDate: String(fd.get("date")), exitDate: String(fd.get("exitDate") || fd.get("date")), entryTime: String(fd.get("entryTime") || ""), exitTime: String(fd.get("exitTime") || ""), strategyId: String(fd.get("strategyId")), side: String(fd.get("side")), pnl: Number(fd.get("pnl")), r: Number(fd.get("r") || 0), grade: String(fd.get("grade")), tags: String(fd.get("tags") || ""), note: String(fd.get("note") || "") };
      j.trades.push(t); save(LS.journal, j); try { sessionStorage.removeItem("intraday100.prefill"); } catch (err) {} render(true); toast(t.entryDate !== t.exitDate ? "已保存，但检测到隔夜持仓" : "交易已保存");
    });
    $$("[data-del]").forEach((b) => b.addEventListener("click", () => { const j = getJournal(); j.trades = j.trades.filter((t) => t.id !== b.dataset.del); save(LS.journal, j); render(true); toast("已删除"); }));
    $("#review-form")?.addEventListener("submit", (e) => { e.preventDefault(); const fd = new FormData(e.target); const j = getJournal(); j.reviews.push({ id: "r" + Date.now().toString(36), date: String(fd.get("date")), lesson: String(fd.get("lesson")), next: String(fd.get("next")) }); save(LS.journal, j); render(true); toast("周复盘已保存"); });
    $("#journal-export")?.addEventListener("click", () => { const blob = new Blob([JSON.stringify({ ...getJournal(), checks: getChecks(), runs: getRuns(), exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "intraday100-journal-" + new Date().toISOString().slice(0, 10) + ".json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast("已导出"); });
    $("#journal-import")?.addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { const d = JSON.parse(String(rd.result)); if (d.trades) save(LS.journal, { trades: d.trades, reviews: d.reviews || [] }); if (d.checks) save(LS.checks, d.checks); if (d.runs) save(LS.runs, d.runs); render(true); toast("已导入"); } catch (err) { toast("导入失败", true); } }; rd.readAsText(f); });
  }

  /* method */
  function viewMethod() {
    return `<div class="container method"><header class="method-hero"><div class="eyebrow">METHOD / NO DAILY PROMISES</div><h1>“每天盈利”<br><em>是红线。</em></h1><p class="lede">日内策略可以追求高胜率，但不能承诺每天盈利。这个页面说明本站的证据标准、回测口径、成本假设与 AI 失效模式。</p></header><div class="method-grid"><nav class="method-toc"><a href="#m-daily" class="active">01 每日盈利幻觉</a><a href="#m-evidence">02 证据阶梯</a><a href="#m-traps">03 日内陷阱</a><a href="#m-live">04 实盘检查</a><a href="#m-ai">05 AI 失效</a><a href="#m-risk">06 免责声明</a></nav><div class="method-body">
      <section id="m-daily"><div class="section-label">01 / DAILY ILLUSION</div><h2>为什么“每天盈利”不可能</h2><p>假设每天独立、胜率 70%。20 天全部盈利的概率是 0.7²⁰ ≈ 0.08%；至少有一个亏损日的概率是 99.92%。如果每天胜率 60%，20 天全绿只有 0.0036%。</p><p>更现实的是：亏损日会连在一起。即使正期望，连亏 3–5 天也很常见。任何“每天盈利”的展示，通常来自三种东西：隐藏亏损日、极端尾部风险、或事后挑选。</p><div class="callout warn"><p>本站的目标不是让你相信“每天赚钱”，而是让你能算清楚：胜率、盈亏比、最大连亏、最差单日、样本外——然后决定这条策略是否值得小资金试。</p></div></section>
      <section id="m-evidence"><div class="section-label">02 / EVIDENCE</div><h2>证据阶梯</h2><p>E2 只代表在固定 bar、成本和样本外切分下跑通；不代表未来。E4 才接近可以用真钱。</p><div class="table-wrap" style="margin-top:14px"><table class="data"><thead><tr><th>等级</th><th>名称</th><th>需要什么</th><th>常见误判</th></tr></thead><tbody><tr><td>E0</td><td>规则草案</td><td>想法、粗略规则</td><td>把逻辑通当成能赚钱</td></tr><tr><td>E1</td><td>规则审计</td><td>入场/出场/风控/数据写清</td><td>规则完整 ≠ 有优势</td></tr><tr><td>E2</td><td>分钟回测</td><td>固定 bars、成本、样本外</td><td>过拟合、成本低估、前视</td></tr><tr><td>E3</td><td>滚动样本外</td><td>walk-forward、跨制度</td><td>反复调参</td></tr><tr><td>E4</td><td>纸面/小资金</td><td>20–30 笔、真实滑点</td><td>把牛市 beta 当 alpha</td></tr></tbody></table></div></section>
      <section id="m-traps"><div class="section-label">03 / TRAPS</div><h2>日内回测的七个陷阱</h2><ol class="numbered"><li><strong>成本低估：</strong>日内策略交易频繁，2 bps/边可以吃掉全部 edge。必须把佣金、点差、滑点、冲击都算进去。</li><li><strong>前视偏差：</strong>用当前 bar 收盘价产生信号，却在同一收盘价成交。本站尽量用下一根 bar 开盘，但仍需你复核执行假设。</li><li><strong>样本太短：</strong>5 分钟数据只有 60 天；1 小时只有 2 年。短样本很容易过拟合。</li><li><strong>制度依赖：</strong>趋势日、震荡日、危机日的表现完全不同；必须跨制度看。</li><li><strong>幸存者偏差：</strong>用今天还活着的股票/币回测过去；本站对加密与个股案例保留警告。</li><li><strong>执行假设：</strong>回测假设能在下一根开盘成交；真实市场可能滑点、拒单、流动性消失。</li><li><strong>隔夜泄漏：</strong>任何“日内”策略如果持仓过夜，就不是日内；本站强制检查 <code>entryDate === exitDate</code>。</li></ol></section>
      <section id="m-live"><div class="section-label">04 / LIVE CHECK</div><h2>实盘前 12 项检查</h2><div class="two-col"><ul><li>规则能写成 if/then。</li><li>数据时间戳与交易所日历对齐。</li><li>样本外 ≥30%，没有反复调参。</li><li>扣 2–4 bps/边后仍为正。</li><li>最大连亏你能承受。</li><li>单笔风险 ≤0.2–0.5%。</li></ul><ul><li>有日损失上限与停机规则。</li><li>收盘前强平，绝不隔夜。</li><li>执行场所/订单类型已确认。</li><li>纸面 20–30 笔，滑点接近回测。</li><li>有交易日志与周复盘。</li><li>最坏单日不会影响生活。</li></ul></div></section>
      <section id="m-ai"><div class="section-label">05 / AI FAILURES</div><h2>AI 会在哪里骗你</h2><ul><li><strong>新闻幻觉：</strong>LLM 会编造标题、数字与时间；所有事件必须回链原文。</li><li><strong>数据泄漏：</strong>训练集包含未来信息，或用收盘后新闻解释盘中信号。</li><li><strong>制度漂移：</strong>模型在低波动期学到的关系，在高波动期反转。</li><li><strong>执行差距：</strong>模型预测 1 分钟上涨，但延迟、手续费与滑点让净收益为负。</li><li><strong>过拟合：</strong>在 60 天 5 分钟数据上反复调参，几乎必然“找到”一条漂亮曲线。</li></ul><div class="callout"><p>AI 在本站的角色是过滤、排序、抽取、执行、风控；没有一条策略把“让 LLM 直接预测价格”作为唯一 edge。</p></div></section>
      <section id="m-risk"><div class="section-label">06 / RISK</div><h2>风险与免责声明</h2><p>本站是研究与教育工具，不构成投资建议。日内交易成本高、杠杆风险大；期权、0DTE、加密、微观结构策略可能造成超过本金的损失。历史回测不代表未来收益。</p><p>任何“每天盈利”的承诺都应被视为危险信号。请独立评估风险、税务与合规义务，必要时咨询持牌专业人士。</p><div class="callout warn"><p>先证伪，再实盘；先小钱，再放大；先活着，再谈收益。</p></div></section>
    </div></div></div>`;
  }
  function bindMethod() { $$(".method-toc a").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); const t = document.getElementById(a.getAttribute("href").slice(1)); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); $$(".method-toc a").forEach((x) => x.classList.remove("active")); a.classList.add("active"); })); }

  /* command / toast / router */
  let toastTimer;
  function toast(msg, err) { const el = $("#toast"); if (!el) return; el.textContent = msg; el.classList.toggle("error", !!err); el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600); }
  function openCommand() { location.hash = "#/library"; setTimeout(() => $("#lib-search")?.focus(), 120); }
  function notFound(msg) { return `<div class="container" style="padding:100px 0;text-align:center"><div class="eyebrow" style="justify-content:center">404</div><h1 style="font-family:var(--serif);font-size:52px;font-weight:500;margin:18px 0">${esc(msg)}</h1><p class="muted"><a href="#/library" style="color:var(--acid)">回策略库</a></p></div>`; }
  function parseRoute() { const raw = location.hash.replace(/^#\/?/, ""); const [path, q] = raw.split("?"); const p = path.split("/").filter(Boolean); return { name: p[0] || "home", id: p[1] || null, q: new URLSearchParams(q || "") }; }
  function setNav(n) { const x = n === "strategy" ? "library" : n; $$("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === x)); }
  function render(keep) {
    const r = parseRoute(); setNav(r.name); const app = $("#app");
    if (r.name === "home") app.innerHTML = viewHome();
    else if (r.name === "library") { if (r.q.get("family")) lib.family = r.q.get("family"); app.innerHTML = viewLibrary(); bindLibrary(); }
    else if (r.name === "strategy") { app.innerHTML = viewDetail(r.id); bindDetail(r.id); }
    else if (r.name === "lab") { if (r.q.get("s") && BY_ID.has(r.q.get("s"))) lab.id = r.q.get("s"); app.innerHTML = viewLab(); bindLab(); }
    else if (r.name === "daily") { app.innerHTML = viewDaily(); bindDaily(); }
    else if (r.name === "journal") { app.innerHTML = viewJournal(); bindJournal(); }
    else if (r.name === "method") { app.innerHTML = viewMethod(); bindMethod(); }
    else app.innerHTML = notFound("找不到这个页面");
    if (!keep) window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
  function init() {
    $("#market-ticker").innerHTML = tickerHTML();
    $("#open-command")?.addEventListener("click", openCommand);
    document.addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openCommand(); } });
    window.addEventListener("hashchange", () => render());
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
