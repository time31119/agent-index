/* AI Paper Desk frontend: no framework, SSE + canvas. */
(() => {
  const $ = (id) => document.getElementById(id);
  const state = { last: null, chart: { points: [], hover: -1 }, es: null, poll: null };

  // ---------- formatting ----------
  const nf0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (v, d = 2, signed = true) => {
    if (v === null || v === undefined || !Number.isFinite(Number(v))) return "—";
    let n = Number(v) * 100;
    if (Math.abs(n) < 0.005) n = 0;
    return `${signed && n > 0 ? "+" : ""}${n.toFixed(d)}%`;
  };
  const money = (v, d = 0) => {
    if (v === null || v === undefined || !Number.isFinite(Number(v))) return "—";
    return `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  };
  const signedMoney = (v, d = 0) => {
    if (v === null || v === undefined || !Number.isFinite(Number(v))) return "—";
    const n = Number(v);
    return `${n > 0 ? "+" : n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  };
  const qty = (v) => {
    if (v === null || v === undefined) return "—";
    const n = Number(v);
    if (Math.abs(n) >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
    if (Math.abs(n) >= 1) return n.toFixed(3);
    return n.toFixed(5);
  };
  const compact = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}k`;
    return `$${n.toFixed(0)}`;
  };
  const time = (ts, withDate = false) => {
    if (!ts) return "—";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai", hour12: false,
      ...(withDate ? { month: "2-digit", day: "2-digit" } : {}),
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };
  const dateOnly = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit" });
  };
  const signClass = (v) => (Number(v) > 0 ? "pos" : Number(v) < 0 ? "neg" : "dim");
  const setText = (id, txt, cls) => {
    const el = $(id);
    if (!el) return;
    el.textContent = txt;
    if (cls !== undefined) el.className = cls;
  };

  // ---------- market strip ----------
  function renderMarket(state) {
    const wrap = $("marketStrip");
    if (!state.market || !state.market.length) return;
    wrap.innerHTML = state.market.map((m) => {
      const up = Number(m.change_24h) >= 0;
      return `<div class="ticker">
        <div class="sym">${m.symbol.replace("USDT", "")}<small>USDT PERP · ${m.stale ? "STALE" : "LIVE"}</small></div>
        <div><div class="px">${m.price ? money(m.price, m.price < 10 ? 4 : 2) : "—"}</div>
          <div class="chg ${up ? "up" : "down"}">${pct(m.change_24h, 2)}</div></div>
        <div class="target">目标 ${pct(m.target, 1)}</div>
      </div>`;
    }).join("");
  }

  // ---------- positions ----------
  function renderPositions(state) {
    const body = $("positionsBody");
    const rows = state.positions || [];
    $("positionsCount").textContent = rows.length;
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="9" class="empty">空仓 · 等待下一次信号</td></tr>`;
      $("positionSummary").textContent = "空仓等待信号";
      return;
    }
    const sigMap = Object.fromEntries((state.signals || []).map((s) => [s.symbol, s]));
    const longs = rows.filter((r) => r.side === "LONG").length;
    const shorts = rows.filter((r) => r.side === "SHORT").length;
    $("positionSummary").textContent = `${longs} 多 / ${shorts} 空 · 总敞口 ${pct(state.account.gross_exposure, 1, false)}`;
    body.innerHTML = rows.map((p) => {
      const sig = sigMap[p.symbol] || {};
      return `<tr>
        <td class="sym-cell">${p.symbol.replace("USDT", "")}<small>${p.symbol}</small></td>
        <td><span class="side ${p.side === "LONG" ? "long" : "short"}">${p.side}</span></td>
        <td class="r">${qty(p.qty)}</td>
        <td class="r">${money(p.avg_price, p.avg_price < 10 ? 4 : 2)}</td>
        <td class="r">${money(p.mark, p.mark < 10 ? 4 : 2)}</td>
        <td class="r">${money(p.notional)}</td>
        <td class="r ${signClass(p.upnl)}">${signedMoney(p.upnl, 2)}<br><small>${pct(p.upnl_pct, 2)}</small></td>
        <td class="r">${pct(p.weight, 1)}</td>
        <td class="r">${pct(sig.target || 0, 1)}</td>
      </tr>`;
    }).join("");
  }

  // ---------- signals ----------
  function chip(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || Math.abs(n) < 1e-9) return `<span class="chip z">0</span>`;
    return `<span class="chip ${n > 0 ? "p1" : "n1"}">${n > 0 ? "+1" : "-1"}</span>`;
  }
  function renderSignals(state) {
    const body = $("signalBody");
    const rows = state.signals || [];
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="8" class="empty">等待首轮信号</td></tr>`;
      return;
    }
    const order = { supertrend: 0, donchian: 1, awesome: 2, rsi2: 3, bollinger: 4 };
    const sorted = [...rows].sort((a, b) => (a.symbol > b.symbol ? 1 : -1));
    body.innerHTML = sorted.map((s) => {
      const c = s.components || {};
      return `<tr>
        <td class="sym-cell">${s.symbol.replace("USDT", "")}<small>${s.bar_time ? dateOnly(s.bar_time) : "—"}</small></td>
        <td>${chip(c.supertrend)}</td><td>${chip(c.donchian)}</td><td>${chip(c.awesome)}</td>
        <td>${chip(c.rsi2)}</td><td>${chip(c.bollinger)}</td>
        <td class="r combo ${signClass(s.combined)}">${Number(s.combined).toFixed(2)}</td>
        <td class="r target ${signClass(s.target)}">${pct(s.target, 1)}</td>
      </tr>`;
    }).join("");
    const first = sorted[0];
    $("signalFoot").textContent = first && first.reason
      ? `${first.symbol.replace("USDT", "")}：${first.reason} · 信号在日线收盘后更新`
      : "5 个子策略等权投票，合成目标权重";
  }

  // ---------- trades ----------
  function renderTrades(state) {
    const rows = (state.trades || []).slice(0, 12);
    $("tradesCount").textContent = `${state.account.trades || 0} 笔`;
    const body = $("tradesBody");
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="6" class="empty">还没有成交</td></tr>`;
      return;
    }
    body.innerHTML = rows.map((t) => `<tr>
      <td class="dim">${time(t.ts, true)}</td>
      <td class="sym-cell">${t.symbol.replace("USDT", "")}</td>
      <td><span class="side ${t.side === "BUY" ? "long" : "short"}">${t.side}</span></td>
      <td class="r">${qty(t.qty)}</td>
      <td class="r">${money(t.price, t.price < 10 ? 4 : 2)}</td>
      <td class="r dim">$${Number(t.fee).toFixed(2)}</td>
    </tr>`).join("");
  }

  // ---------- events ----------
  function renderEvents(state) {
    const rows = (state.events || []).slice(0, 18);
    const wrap = $("eventsList");
    if (!rows.length) {
      wrap.innerHTML = `<div class="empty">等待事件…</div>`;
      return;
    }
    wrap.innerHTML = rows.map((e) => `<div class="event">
      <span class="time">${time(e.ts)}</span>
      <span class="tag ${e.level}">${e.level}</span>
      <span class="msg">${escapeHtml(e.message)}</span>
    </div>`).join("");
  }
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- chart ----------
  const canvas = $("chart");
  const ctx = canvas.getContext("2d");
  const chart = { points: [], hover: -1, box: null };

  function resizeChart() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    chart.box = { w: rect.width, h: rect.height };
  }

  function drawChart(state) {
    if (!chart.box) resizeChart();
    const { w, h } = chart.box;
    ctx.clearRect(0, 0, w, h);
    const raw = (state.equity || []).filter((p) => Number.isFinite(Number(p.equity)));
    if (!raw.length) {
      ctx.fillStyle = "#5f7492"; ctx.font = "12px Segoe UI"; ctx.textAlign = "center";
      ctx.fillText("等待净值数据…", w / 2, h / 2);
      return;
    }
    // downsample
    const maxPoints = 620;
    const step = Math.max(1, Math.ceil(raw.length / maxPoints));
    const pts = raw.filter((_, i) => i % step === 0 || i === raw.length - 1);
    chart.points = pts;
    const pad = { l: 58, r: 14, t: 16, b: 28 };
    const vals = [];
    pts.forEach((p) => {
      vals.push(Number(p.equity));
      if (p.benchmark !== null && Number.isFinite(Number(p.benchmark))) vals.push(Number(p.benchmark));
    });
    let lo = Math.min(...vals), hi = Math.max(...vals);
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return;
    if (hi - lo < 1e-9) { hi = lo + 1; }
    const padV = (hi - lo) * 0.08; lo -= padV; hi += padV;
    const x = (i) => pad.l + (pts.length <= 1 ? 0 : i / (pts.length - 1)) * (w - pad.l - pad.r);
    const y = (v) => pad.t + (hi - v) / (hi - lo) * (h - pad.t - pad.b);

    // grid
    ctx.strokeStyle = "rgba(120,160,210,.12)"; ctx.lineWidth = 1;
    ctx.fillStyle = "#6f819b"; ctx.font = "10px Cascadia Mono, monospace"; ctx.textAlign = "right";
    const tightRange = (hi - lo) < Math.abs(hi) * 0.05;
    const axisFmt = (v) => tightRange ? money(v, 0) : compact(v);
    for (let i = 0; i <= 4; i++) {
      const v = lo + (hi - lo) * i / 4;
      const yy = y(v);
      ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(w - pad.r, yy); ctx.stroke();
      ctx.fillText(axisFmt(v), pad.l - 9, yy + 3);
    }

    // benchmark
    const hasBench = pts.some((p) => p.benchmark !== null && Number.isFinite(Number(p.benchmark)));
    if (hasBench) {
      ctx.beginPath();
      let started = false;
      pts.forEach((p, i) => {
        if (p.benchmark === null || !Number.isFinite(Number(p.benchmark))) { started = false; return; }
        const px = x(i), py = y(Number(p.benchmark));
        if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = "rgba(150,168,192,.55)"; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
    }

    // equity area
    const grad = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
    grad.addColorStop(0, "rgba(76,201,240,.22)");
    grad.addColorStop(1, "rgba(76,201,240,0)");
    ctx.beginPath();
    pts.forEach((p, i) => { const px = x(i), py = y(Number(p.equity)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
    ctx.lineTo(x(pts.length - 1), h - pad.b); ctx.lineTo(x(0), h - pad.b); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    // equity line
    ctx.beginPath();
    pts.forEach((p, i) => { const px = x(i), py = y(Number(p.equity)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
    ctx.strokeStyle = "#4cc9f0"; ctx.lineWidth = 2.1; ctx.shadowColor = "rgba(76,201,240,.55)"; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;

    // last dot
    const li = pts.length - 1;
    ctx.beginPath(); ctx.arc(x(li), y(Number(pts[li].equity)), 3.6, 0, Math.PI * 2);
    ctx.fillStyle = "#4cc9f0"; ctx.fill();
    ctx.beginPath(); ctx.arc(x(li), y(Number(pts[li].equity)), 7, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(76,201,240,.25)"; ctx.lineWidth = 2; ctx.stroke();

    // x labels
    ctx.fillStyle = "#5f7492"; ctx.font = "10px Cascadia Mono, monospace"; ctx.textAlign = "left";
    ctx.fillText(time(pts[0].ts, true), pad.l, h - 8);
    ctx.textAlign = "right";
    ctx.fillText(time(pts[li].ts, true), w - pad.r, h - 8);

    // hover
    if (chart.hover >= 0 && chart.hover < pts.length) {
      const i = chart.hover, px = x(i);
      ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, h - pad.b);
      ctx.strokeStyle = "rgba(233,240,251,.22)"; ctx.lineWidth = 1; ctx.stroke();
      const p = pts[i];
      ctx.beginPath(); ctx.arc(px, y(Number(p.equity)), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#4cc9f0"; ctx.fill();
      if (p.benchmark !== null && Number.isFinite(Number(p.benchmark))) {
        ctx.beginPath(); ctx.arc(px, y(Number(p.benchmark)), 3, 0, Math.PI * 2);
        ctx.fillStyle = "#96a8c0"; ctx.fill();
      }
      const tip = $("chartTip");
      tip.style.display = "block";
      tip.innerHTML = `${time(p.ts, true)}<br>模拟 <b>${money(p.equity)}</b>` +
        (p.benchmark !== null && Number.isFinite(Number(p.benchmark)) ? `<br>BTC <span>${money(p.benchmark)}</span>` : "");
      const tw = tip.offsetWidth || 150;
      tip.style.left = `${Math.min(Math.max(px - tw / 2, 8), w - tw - 8)}px`;
      tip.style.top = `${Math.max(8, y(Number(p.equity)) - 60)}px`;
    } else {
      $("chartTip").style.display = "none";
    }
    $("chartStart").textContent = `${dateOnly(pts[0].ts)} 开始`;
    $("chartEnd").textContent = `${dateOnly(pts[li].ts)} 最新`;
    $("chartPoints").textContent = `${state.equity.length} 个快照`;
  }

  canvas.addEventListener("mousemove", (ev) => {
    if (!chart.points.length || !chart.box) return;
    const rect = canvas.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const padL = 58, padR = 14;
    const ratio = Math.min(1, Math.max(0, (mx - padL) / (chart.box.w - padL - padR)));
    chart.hover = Math.round(ratio * (chart.points.length - 1));
    if (state.last) drawChart(state.last);
  });
  canvas.addEventListener("mouseleave", () => {
    chart.hover = -1;
    if (state.last) drawChart(state.last);
  });
  window.addEventListener("resize", () => {
    resizeChart();
    if (state.last) drawChart(state.last);
  });

  // ---------- status / clock ----------
  function setStatus(kind, text) {
    const pill = $("statusPill");
    pill.className = `status ${kind}`;
    $("statusText").textContent = text;
  }
  function tickClock() {
    const now = new Date();
    $("clock").textContent = now.toLocaleTimeString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
    $("footerTime").textContent = `UTC ${now.toISOString().replace("T", " ").slice(0, 19)}`;
  }
  setInterval(tickClock, 1000);

  function countdown(state) {
    const target = state.meta && state.meta.next_rebalance ? new Date(state.meta.next_rebalance) : null;
    if (!target || Number.isNaN(target.getTime())) {
      $("nextRebalance").textContent = "—"; $("countdown").textContent = "—"; return;
    }
    $("nextRebalance").textContent = target.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    const ms = target - new Date();
    if (ms <= 0) { $("countdown").textContent = "等待刷新"; return; }
    const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000);
    $("countdown").textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  setInterval(() => { if (state.last) countdown(state.last); }, 1000);

  // ---------- apply ----------
  function apply(s) {
    state.last = s;
    const a = s.account || {};
    const live = s.status === "live";
    setStatus(live ? "live" : "stale", live ? "LIVE · PAPER" : "STALE · CACHE");
    $("dataAge").textContent = s.last_quote_age === null || s.last_quote_age === undefined ? "等待行情" : `${Number(s.last_quote_age).toFixed(1)}s 前`;

    setText("equityValue", money(a.equity, 0));
    setText("totalReturn", pct(a.total_return, 2), `equity-delta ${Number(a.total_return) >= 0 ? "up" : "down"}`);
    setText("equitySub", `初始资金 ${money(a.initial_capital, 0)} · 可用现金 ${money(a.cash, 0)}`);
    setText("dailyPnl", signedMoney(a.daily_pnl, 2), signClass(a.daily_pnl));
    $("dailyPct").textContent = pct(a.daily_pct, 2);
    $("dailyPct").className = signClass(a.daily_pct);
    setText("maxDD", pct(a.max_drawdown, 1), "neg");
    setText("sharpe", a.sharpe === null || a.sharpe === undefined ? "—" : Number(a.sharpe).toFixed(2));
    setText("grossExposure", pct(a.gross_exposure, 1, false));
    setText("grossSub", `${(s.positions || []).length} 个持仓`);
    setText("cashValue", money(a.cash, 0));
    setText("feesValue", money(a.fees, 2));
    const mins = Math.floor((a.uptime_seconds || 0) / 60);
    setText("uptime", mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`);

    const gross = Number(a.gross_exposure) || 0;
    const maxGross = (s.meta && s.meta.max_gross) || 0.9;
    $("exposureBar").style.width = `${Math.min(100, gross / maxGross * 100)}%`;
    $("exposurePct").textContent = pct(gross, 1, false);

    const rows = s.positions || [];
    const longs = rows.filter((r) => r.side === "LONG").length;
    const shorts = rows.filter((r) => r.side === "SHORT").length;
    let regime = "空仓 · 等待信号";
    if (rows.length) {
      const net = rows.reduce((acc, r) => acc + (r.side === "LONG" ? Math.abs(r.notional) : -Math.abs(r.notional)), 0);
      regime = net > 0 ? "净多头 · 趋势/动量占优" : net < 0 ? "净空头 · 下行趋势占优" : "多空对冲";
    }
    $("regimeText").textContent = regime;
    $("regimeDetail").textContent = `${longs} 多 / ${shorts} 空 · ${pct(gross, 1)} 总敞口 · 5 策略等权`;

    renderMarket(s);
    renderPositions(s);
    renderSignals(s);
    renderTrades(s);
    renderEvents(s);
    drawChart(s);
    countdown(s);
  }

  // ---------- transport ----------
  async function fetchState() {
    try {
      const r = await fetch("/api/state", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      apply(await r.json());
    } catch (e) {
      setStatus("stale", "API 离线");
    }
  }

  function connect() {
    if (state.es) state.es.close();
    const es = new EventSource("/api/stream");
    state.es = es;
    es.onmessage = (ev) => {
      try { apply(JSON.parse(ev.data)); } catch (e) { /* ignore malformed frame */ }
    };
    es.onerror = () => {
      setStatus("stale", "重连中…");
      es.close();
      if (state.poll) clearInterval(state.poll);
      state.poll = setInterval(fetchState, 3000);
      setTimeout(() => {
        if (state.poll) { clearInterval(state.poll); state.poll = null; }
        connect();
      }, 5000);
    };
  }

  tickClock();
  fetchState();
  connect();
})();
