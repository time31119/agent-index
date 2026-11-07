/* ============================================================
   PERP ATLAS — live observation logic
   Vanilla JS. No build step, no tracking, no order execution.
   ============================================================ */

(function () {
  "use strict";

  const DATA = window.PERP_DATA || { repos: [] };
  const AGENTS = window.PERP_AGENTS || [];
  const SNAP = window.PERP_MARKET_SNAPSHOT || null;

  const BINANCE = "https://fapi.binance.com";
  const OKX = "https://www.okx.com";
  const GITHUB = "https://api.github.com";
  const REFRESH_MS = 45 * 1000;
  const GITHUB_TTL = 30 * 60 * 1000;
  const COMMIT_TTL = 20 * 60 * 1000;
  const DOWNLOAD_TTL = 6 * 60 * 60 * 1000;

  const SYMBOLS = [
    { id: "BTCUSDT", base: "BTC", name: "Bitcoin", okx: "BTC-USDT-SWAP", leverage: "125×" },
    { id: "ETHUSDT", base: "ETH", name: "Ethereum", okx: "ETH-USDT-SWAP", leverage: "100×" },
    { id: "SOLUSDT", base: "SOL", name: "Solana", okx: "SOL-USDT-SWAP", leverage: "50×" },
    { id: "BNBUSDT", base: "BNB", name: "BNB", okx: "BNB-USDT-SWAP", leverage: "75×" }
  ];
  const SYMBOL_MAP = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));
  const INTERVAL_MINUTES = { "1m": 1, "5m": 5, "15m": 15, "1h": 60 };
  const SORT_META = {
    stars: { label: "按社区星标排序" },
    downloads: { label: "按 Release 下载排序" },
    updated: { label: "按最近更新排序" },
    heat: { label: "按综合观察分排序" }
  };
  const CAT_META = {
    all: "全部",
    library: "策略库",
    market: "做市/网格",
    trend: "趋势/突破",
    ai: "AI/ML",
    engine: "执行引擎",
    research: "回测研究"
  };
  const LS = {
    watch: "perp-atlas.watch.v1",
    repos: "perp-atlas.repos.v1",
    downloads: "perp-atlas.downloads.v1",
    commits: "perp-atlas.commits.v1"
  };

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const state = {
    repos: (DATA.repos || []).map((repo) => ({ ...repo })),
    market: null,
    seriesCache: {},
    metrics: null,
    fits: [],
    symbol: "BTCUSDT",
    interval: "5m",
    selectedId: (DATA.repos && DATA.repos[0] && DATA.repos[0].id) || null,
    filter: "all",
    sort: "stars",
    agentSort: "evidence",
    query: "",
    watchOnly: false,
    watchlist: [],
    commitCache: {},
    commitLoading: {},
    marketStatus: "snapshot",
    marketLatency: null,
    lastMarketAt: null,
    marketFetching: false,
    pendingMarket: false,
    marketReq: 0,
    githubStatus: "snapshot",
    githubFetching: false,
    githubAt: null,
    githubRemaining: null,
    githubLimit: 60,
    githubBlocked: false,
    downloadsFetching: false,
    downloadsAt: null,
    lastToastAt: 0,
    lastFocus: null,
    chartGeom: null,
    flash: {},
    hasFetchedMarket: false,
    hasFetchedGithub: false
  };

  /* ------------------------------------------------------------
     Formatting
     ------------------------------------------------------------ */

  const nf0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nf2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function compact(n) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    const value = Number(n);
    if (Math.abs(value) >= 1e9) return nf1.format(value / 1e9) + "B";
    if (Math.abs(value) >= 1e6) return nf1.format(value / 1e6) + "M";
    if (Math.abs(value) >= 1e3) return nf1.format(value / 1e3) + "K";
    return nf0.format(value);
  }

  function compactHTML(n) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    const value = Number(n);
    if (Math.abs(value) >= 1e9) return nf1.format(value / 1e9) + "<span>B</span>";
    if (Math.abs(value) >= 1e6) return nf1.format(value / 1e6) + "<span>M</span>";
    if (Math.abs(value) >= 1e3) return nf1.format(value / 1e3) + "<span>K</span>";
    return nf0.format(value);
  }

  function formatPrice(value) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const n = Number(value);
    const abs = Math.abs(n);
    let digits = 2;
    if (abs > 0 && abs < 0.01) digits = 6;
    else if (abs < 1) digits = 4;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(n);
  }

  function formatSigned(value, digits = 2) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const n = Number(value);
    if (Math.abs(n) < 0.5 * Math.pow(10, -digits)) return (0).toFixed(digits);
    const sign = n >= 0 ? "+" : "−";
    return sign + Math.abs(n).toFixed(digits);
  }

  function formatPct(value, digits = 2, withSign = false) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const n = Number(value);
    return (withSign ? (n >= 0 ? "+" : "−") : "") + Math.abs(n).toFixed(digits) + "%";
  }

  function usdParts(value) {
    if (value == null || Number.isNaN(Number(value))) return { value: "—", unit: "" };
    const n = Number(value);
    if (Math.abs(n) >= 1e9) return { value: nf2.format(n / 1e9), unit: "B" };
    if (Math.abs(n) >= 1e6) return { value: nf2.format(n / 1e6), unit: "M" };
    if (Math.abs(n) >= 1e3) return { value: nf1.format(n / 1e3), unit: "K" };
    return { value: nf0.format(n), unit: "" };
  }

  function formatUsd(value) {
    const parts = usdParts(value);
    return "$" + parts.value + parts.unit;
  }

  function providerMeta(provider) {
    if (provider === "Binance Futures") return { badge: "BINANCE · LIVE", short: "BINANCE FUTURES", state: "live" };
    if (provider === "OKX Swap") return { badge: "OKX · FAILOVER", short: "OKX SWAP", state: "fallback" };
    if (provider === "Cached Feed") return { badge: "CACHED · STALE", short: "CACHED FEED", state: "stale" };
    return { badge: "LOCAL · SNAPSHOT", short: "LOCAL SNAPSHOT", state: "snapshot" };
  }

  function formatTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(date);
  }

  function formatShortTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date).replace(/\//g, "-");
  }

  function formatDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date).replace(/\//g, "-");
  }

  function timeAgo(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
    if (seconds < 45) return "刚刚";
    if (seconds < 3600) return Math.floor(seconds / 60) + " 分钟前";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " 小时前";
    if (seconds < 86400 * 30) return Math.floor(seconds / 86400) + " 天前";
    if (seconds < 86400 * 365) return Math.floor(seconds / (86400 * 30)) + " 个月前";
    return Math.floor(seconds / (86400 * 365)) + " 年前";
  }

  function daysSince(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 9999;
    return Math.max(0, (Date.now() - date.getTime()) / 86400000);
  }

  function maintainState(repo) {
    const days = daysSince(repo.pushedAt);
    if (days <= 90) return { key: "active", label: "活跃", dot: "" };
    if (days <= 365) return { key: "watch", label: "放缓", dot: "watch" };
    return { key: "stale", label: "停更", dot: "stale" };
  }

  function heatScore(repo) {
    const recency = clamp(1 - daysSince(repo.pushedAt) / 540, 0, 1);
    return (
      Math.log10((repo.stars || 0) + 1) * 52 +
      Math.log10((repo.forks || 0) + 1) * 22 +
      Math.log10((repo.downloads || 0) + 1) * 18 +
      recency * 26
    );
  }

  function storageGet(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* Private browsing / file:// storage can be unavailable. */
    }
  }

  function toast(message, duration = 2800) {
    const node = $("toast");
    if (!node) return;
    window.clearTimeout(state.toastTimer);
    node.textContent = message;
    node.classList.add("is-visible");
    state.toastTimer = window.setTimeout(() => node.classList.remove("is-visible"), duration);
  }

  /* ------------------------------------------------------------
     Market data normalisation
     ------------------------------------------------------------ */

  function snapshotMarket() {
    const tickers = {};
    const funding = {};
    const capturedAt = SNAP && SNAP.capturedAt ? SNAP.capturedAt : new Date().toISOString();

    if (SNAP && Array.isArray(SNAP.tickers)) {
      SNAP.tickers.forEach((ticker) => {
        tickers[ticker.symbol] = {
          symbol: ticker.symbol,
          last: Number(ticker.last),
          change: Number(ticker.change),
          high: Number(ticker.high),
          low: Number(ticker.low),
          volume: Number(ticker.volume),
          mark: Number(ticker.last)
        };
      });
    }

    if (SNAP && SNAP.funding) {
      Object.entries(SNAP.funding).forEach(([symbol, value]) => {
        funding[symbol] = {
          rate: value.rate == null ? null : Number(value.rate),
          next: value.next == null ? null : Number(value.next),
          mark: value.mark == null ? null : Number(value.mark)
        };
      });
    }

    const seriesCache = {};
    if (SNAP) {
      seriesCache["BTCUSDT:5m"] = {
        candles: Array.isArray(SNAP.candles) ? SNAP.candles.map(mapSnapshotCandle) : [],
        oi: Array.isArray(SNAP.oi) ? SNAP.oi : [],
        longShort: Array.isArray(SNAP.longShort) ? SNAP.longShort : [],
        taker: Array.isArray(SNAP.taker) ? SNAP.taker : [],
        at: new Date(capturedAt).getTime() || Date.now()
      };
    }

    return {
      market: {
        provider: "Local Snapshot",
        tickers,
        funding,
        capturedAt
      },
      seriesCache
    };
  }

  function mapSnapshotCandle(candle) {
    return {
      t: Number(candle[0]),
      o: Number(candle[1]),
      h: Number(candle[2]),
      l: Number(candle[3]),
      c: Number(candle[4]),
      v: Number(candle[5])
    };
  }

  function currentSeries() {
    return state.seriesCache[state.symbol + ":" + state.interval] || null;
  }

  function currentTicker() {
    return (state.market && state.market.tickers && state.market.tickers[state.symbol]) || null;
  }

  function currentFunding() {
    return (state.market && state.market.funding && state.market.funding[state.symbol]) || null;
  }

  function seriesTimestamp(series) {
    if (!series) return 0;
    return series.at || 0;
  }

  /* ------------------------------------------------------------
     HTTP helpers
     ------------------------------------------------------------ */

  async function getJSON(url, timeout = 9000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        const error = new Error("HTTP " + response.status);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function githubGet(path) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(GITHUB + path, {
        signal: controller.signal,
        cache: "no-store",
        headers: { Accept: "application/vnd.github+json" }
      });
      const remaining = response.headers.get("x-ratelimit-remaining");
      const limit = response.headers.get("x-ratelimit-limit");
      if (remaining != null) state.githubRemaining = Number(remaining);
      if (limit != null) state.githubLimit = Number(limit);
      if (!response.ok) {
        const error = new Error("GitHub HTTP " + response.status);
        error.status = response.status;
        error.remaining = remaining;
        throw error;
      }
      return {
        data: await response.json(),
        remaining: remaining == null ? null : Number(remaining),
        limit: limit == null ? null : Number(limit)
      };
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function mapLimit(items, limit, worker) {
    const results = new Array(items.length);
    let cursor = 0;
    async function run() {
      while (cursor < items.length) {
        const index = cursor++;
        try {
          results[index] = await worker(items[index], index);
        } catch (error) {
          results[index] = null;
        }
      }
    }
    const workers = Array.from({ length: Math.min(limit, items.length) }, run);
    await Promise.all(workers);
    return results;
  }

  /* ------------------------------------------------------------
     Live market providers
     ------------------------------------------------------------ */

  function parseBinanceKline(kline) {
    return {
      t: Number(kline[0]),
      o: Number(kline[1]),
      h: Number(kline[2]),
      l: Number(kline[3]),
      c: Number(kline[4]),
      v: Number(kline[7] || kline[5])
    };
  }

  async function fetchBinanceSeries(symbol, interval) {
    const tickersPromise = Promise.all(
      SYMBOLS.map((item) => getJSON(BINANCE + "/fapi/v1/ticker/24hr?symbol=" + item.id, 9000))
    );
    const premiumPromise = getJSON(BINANCE + "/fapi/v1/premiumIndex", 9000).catch(() => []);
    const [tickerRows, premiumRows] = await Promise.all([tickersPromise, premiumPromise]);

    const tickers = {};
    tickerRows.forEach((row) => {
      tickers[row.symbol] = {
        symbol: row.symbol,
        last: Number(row.lastPrice),
        change: Number(row.priceChangePercent),
        high: Number(row.highPrice),
        low: Number(row.lowPrice),
        volume: Number(row.quoteVolume),
        mark: Number(row.lastPrice)
      };
    });

    const funding = {};
    const premium = Array.isArray(premiumRows) ? premiumRows : [];
    SYMBOLS.forEach((item) => {
      const row = premium.find((entry) => entry.symbol === item.id);
      const fallback = SNAP && SNAP.funding ? SNAP.funding[item.id] : null;
      funding[item.id] = {
        rate: row ? Number(row.lastFundingRate) : fallback ? Number(fallback.rate) : null,
        next: row ? Number(row.nextFundingTime) : fallback ? Number(fallback.next) : null,
        mark: row ? Number(row.markPrice) : tickers[item.id] ? tickers[item.id].last : null
      };
      if (tickers[item.id] && funding[item.id].mark) tickers[item.id].mark = funding[item.id].mark;
    });

    const okxItem = SYMBOL_MAP[symbol];
    const [klineResult, oiResult, lsResult, takerResult] = await Promise.allSettled([
      getJSON(
        BINANCE + "/fapi/v1/klines?symbol=" + symbol + "&interval=" + interval + "&limit=160",
        9000
      ),
      getJSON(
        BINANCE + "/futures/data/openInterestHist?symbol=" + symbol + "&period=5m&limit=30",
        9000
      ),
      getJSON(
        BINANCE + "/futures/data/globalLongShortAccountRatio?symbol=" + symbol + "&period=5m&limit=30",
        9000
      ),
      getJSON(
        BINANCE + "/futures/data/takerlongshortRatio?symbol=" + symbol + "&period=5m&limit=30",
        9000
      )
    ]);

    const candles = klineResult.status === "fulfilled" && Array.isArray(klineResult.value)
      ? klineResult.value.map(parseBinanceKline)
      : [];

    const oi = oiResult.status === "fulfilled" && Array.isArray(oiResult.value)
      ? oiResult.value.map((row) => ({
          t: Number(row.timestamp),
          v: Number(row.sumOpenInterest),
          usd: Number(row.sumOpenInterestValue)
        }))
      : [];

    const longShort = lsResult.status === "fulfilled" && Array.isArray(lsResult.value)
      ? lsResult.value.map((row) => ({
          t: Number(row.timestamp),
          ratio: Number(row.longShortRatio),
          long: Number(row.longAccount),
          short: Number(row.shortAccount)
        }))
      : [];

    const taker = takerResult.status === "fulfilled" && Array.isArray(takerResult.value)
      ? takerResult.value.map((row) => ({
          t: Number(row.timestamp),
          ratio: Number(row.buySellRatio),
          buy: Number(row.buyVol),
          sell: Number(row.sellVol)
        }))
      : [];

    return {
      provider: "Binance Futures",
      tickers,
      funding,
      series: { candles, oi, longShort, taker },
      capturedAt: new Date().toISOString()
    };
  }

  function parseOkxCandle(row) {
    return {
      t: Number(row[0]),
      o: Number(row[1]),
      h: Number(row[2]),
      l: Number(row[3]),
      c: Number(row[4]),
      v: Number(row[7] || row[5])
    };
  }

  async function fetchOKXSeries(symbol, interval) {
    const item = SYMBOL_MAP[symbol];
    const [tickersResponse, fundingResult, candlesResult, oiResult, lsResult] = await Promise.all([
      getJSON(OKX + "/api/v5/market/tickers?instType=SWAP", 9000),
      getJSON(OKX + "/api/v5/public/funding-rate?instId=" + item.okx, 9000).catch(() => null),
      getJSON(
        OKX + "/api/v5/market/candles?instId=" + item.okx + "&bar=" + okxBar(interval) + "&limit=160",
        9000
      ).catch(() => null),
      getJSON(OKX + "/api/v5/public/open-interest?instType=SWAP&instId=" + item.okx, 9000).catch(() => null),
      getJSON(
        OKX + "/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=" + item.base + "&period=5m",
        9000
      ).catch(() => null)
    ]);

    if (!tickersResponse || !Array.isArray(tickersResponse.data)) throw new Error("OKX ticker unavailable");

    const tickers = {};
    SYMBOLS.forEach((entry) => {
      const row = tickersResponse.data.find((ticker) => ticker.instId === entry.okx);
      if (!row) return;
      const last = Number(row.last);
      const open = Number(row.open24h);
      const volume = Number(row.volCcy24h) * last;
      tickers[entry.id] = {
        symbol: entry.id,
        last,
        change: open ? ((last - open) / open) * 100 : 0,
        high: Number(row.high24h),
        low: Number(row.low24h),
        volume: Number.isFinite(volume) ? volume : 0,
        mark: last
      };
    });

    if (!tickers[symbol]) throw new Error("OKX selected ticker unavailable");

    const funding = {};
    const fundingRow = fundingResult && fundingResult.data && fundingResult.data[0];
    const fallback = SNAP && SNAP.funding ? SNAP.funding[symbol] : null;
    funding[symbol] = {
      rate: fundingRow ? Number(fundingRow.fundingRate) : fallback ? Number(fallback.rate) : null,
      next: fundingRow ? Number(fundingRow.nextFundingTime) : fallback ? Number(fallback.next) : null,
      mark: tickers[symbol].last
    };

    const candles = candlesResult && Array.isArray(candlesResult.data)
      ? candlesResult.data.map(parseOkxCandle).sort((a, b) => a.t - b.t)
      : [];

    let oi = [];
    if (oiResult && Array.isArray(oiResult.data) && oiResult.data[0]) {
      const row = oiResult.data[0];
      oi = [{
        t: Number(row.ts),
        v: Number(row.oiCcy),
        usd: Number(row.oiUsd)
      }];
    }

    let longShort = [];
    if (lsResult && Array.isArray(lsResult.data)) {
      longShort = lsResult.data
        .map((row) => {
          const ratio = Number(row[1]);
          return {
            t: Number(row[0]),
            ratio,
            long: ratio / (1 + ratio),
            short: 1 - ratio / (1 + ratio)
          };
        })
        .sort((a, b) => a.t - b.t);
    }

    return {
      provider: "OKX Swap",
      tickers,
      funding,
      series: { candles, oi, longShort, taker: [] },
      capturedAt: new Date().toISOString()
    };
  }

  function okxBar(interval) {
    return interval === "1h" ? "1H" : interval;
  }

  async function loadMarket(options = {}) {
    if (state.marketFetching) {
      state.pendingMarket = true;
      return;
    }

    state.marketFetching = true;
    const started = performance.now();
    const req = ++state.marketReq;
    const symbol = state.symbol;
    const interval = state.interval;
    const key = symbol + ":" + interval;
    const existing = state.seriesCache[key];

    if (!existing) setChartLoading(true, "正在拉取 K 线");

    try {
      let payload = null;
      let status = "live";

      try {
        payload = await fetchBinanceSeries(symbol, interval);
      } catch (primaryError) {
        try {
          payload = await fetchOKXSeries(symbol, interval);
          status = "fallback";
        } catch (fallbackError) {
          status = "snapshot";
        }
      }

      if (req !== state.marketReq) return;

      if (!payload) {
        state.marketStatus = "snapshot";
        state.marketLatency = Math.round(performance.now() - started);
        if (state.market && state.market.provider !== "Local Snapshot") {
          state.market.provider = "Cached Feed";
        }
        if (Date.now() - state.lastToastAt > 20000) {
          state.lastToastAt = Date.now();
          toast("实时行情暂不可达，保留最近快照。");
        }
        updateStatuses();
        return;
      }

      state.market = {
        provider: payload.provider,
        tickers: payload.tickers,
        funding: payload.funding,
        capturedAt: payload.capturedAt
      };

      state.seriesCache[key] = {
        candles: payload.series.candles.length ? payload.series.candles : existing ? existing.candles : [],
        oi: payload.series.oi,
        longShort: payload.series.longShort,
        taker: payload.series.taker,
        at: Date.now()
      };

      state.marketStatus = status;
      state.marketLatency = Math.round(performance.now() - started);
      state.lastMarketAt = Date.now();
      state.hasFetchedMarket = true;
      state.marketReq = req;
      renderMarketAll();
      updateStatuses();
    } finally {
      state.marketFetching = false;
      setChartLoading(false);
      if (state.pendingMarket) {
        state.pendingMarket = false;
        window.setTimeout(() => loadMarket(), 220);
      }
    }
  }

  /* ------------------------------------------------------------
     Market maths
     ------------------------------------------------------------ */

  function emaSeries(values, period) {
    if (!values.length) return [];
    const multiplier = 2 / (period + 1);
    const output = new Array(values.length).fill(null);
    let sum = 0;
    let previous = null;
    for (let index = 0; index < values.length; index += 1) {
      const value = values[index];
      if (index < period - 1) {
        sum += value;
      } else if (index === period - 1) {
        sum += value;
        previous = sum / period;
        output[index] = previous;
      } else {
        previous = value * multiplier + previous * (1 - multiplier);
        output[index] = previous;
      }
    }
    return output;
  }

  function lastNonNull(values) {
    for (let index = values.length - 1; index >= 0; index -= 1) {
      if (values[index] != null) return values[index];
    }
    return null;
  }

  function atr14(candles) {
    if (candles.length < 2) return 0;
    const start = Math.max(1, candles.length - 14);
    let total = 0;
    let count = 0;
    for (let index = start; index < candles.length; index += 1) {
      const current = candles[index];
      const previous = candles[index - 1];
      const trueRange = Math.max(
        current.h - current.l,
        Math.abs(current.h - previous.c),
        Math.abs(current.l - previous.c)
      );
      total += trueRange;
      count += 1;
    }
    return count ? total / count : 0;
  }

  function realizedVol(candles, interval) {
    if (candles.length < 8) return 0;
    const sample = candles.slice(-90);
    const returns = [];
    for (let index = 1; index < sample.length; index += 1) {
      const previous = sample[index - 1].c;
      const current = sample[index].c;
      if (previous > 0 && current > 0) returns.push(Math.log(current / previous));
    }
    if (returns.length < 4) return 0;
    const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
    const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (returns.length - 1);
    const perYear = (365 * 24 * 60) / INTERVAL_MINUTES[interval];
    return Math.sqrt(variance) * Math.sqrt(perYear) * 100;
  }

  function calculateMetrics(series, ticker, funding) {
    const candles = series && Array.isArray(series.candles) ? series.candles : [];
    const closes = candles.map((candle) => candle.c);
    const last = closes.length ? closes[closes.length - 1] : ticker ? ticker.last : null;
    const high24 = ticker && ticker.high != null ? ticker.high : candles.length ? Math.max(...candles.map((c) => c.h)) : null;
    const low24 = ticker && ticker.low != null ? ticker.low : candles.length ? Math.min(...candles.map((c) => c.l)) : null;
    const ema20 = lastNonNull(emaSeries(closes, 20));
    const ema60 = lastNonNull(emaSeries(closes, 60));
    const atr = atr14(candles);
    const atrPct = last ? (atr / last) * 100 : 0;
    const momentum = closes.length > 1 ? ((last - closes[0]) / closes[0]) * 100 : ticker ? ticker.change : 0;
    const emaSpread = ema20 && ema60 ? ((ema20 - ema60) / ema60) * 100 : 0;
    const rangePos = high24 != null && low24 != null && high24 > low24
      ? clamp(((last - low24) / (high24 - low24)) * 100, 0, 100)
      : 50;
    const volatility = realizedVol(candles, state.interval);
    const rate = funding && funding.rate != null ? funding.rate : null;
    const fundingPct = rate == null ? null : rate * 100;
    const fundingApr = fundingPct == null ? null : fundingPct * 3 * 365;
    const oi = series && Array.isArray(series.oi) ? series.oi : [];
    const oiLast = oi.length ? oi[oi.length - 1] : null;
    const oiFirst = oi.length ? oi[0] : null;
    const oiChangePct = oi.length > 1 && oiLast && oiFirst && oiFirst.v
      ? ((oiLast.v - oiFirst.v) / oiFirst.v) * 100
      : null;
    const oiUsd = oiLast && oiLast.usd ? oiLast.usd : oiLast && last ? oiLast.v * last : null;
    const oiHours = oiLast && oiFirst ? (oiLast.t - oiFirst.t) / 3600000 : null;
    const longShort = series && Array.isArray(series.longShort) ? series.longShort : [];
    const lsLast = longShort.length ? longShort[longShort.length - 1] : null;
    const taker = series && Array.isArray(series.taker) ? series.taker : [];
    const takerLast = taker.length ? taker[taker.length - 1] : null;

    const volLabel = volatility < 25 ? "低波动" : volatility < 48 ? "中波动" : "高波动";
    const trendLabel = emaSpread > 0.055 ? "偏多结构" : emaSpread < -0.055 ? "偏空结构" : "区间震荡";
    const fundingLabel = fundingApr == null
      ? "费率未知"
      : fundingApr > 20
        ? "正费率偏高"
        : fundingApr > 5
          ? "正费率中性"
          : fundingApr < -5
            ? "负费率"
            : "费率中性";
    const oiLabel = oiChangePct == null
      ? "持仓待同步"
      : oiChangePct > 0.45
        ? "持仓扩张"
        : oiChangePct < -0.45
          ? "持仓收缩"
          : "持仓稳定";

    return {
      last,
      high24,
      low24,
      ema20,
      ema60,
      atr,
      atrPct,
      momentum,
      emaSpread,
      rangePos,
      volatility,
      volLabel,
      trendLabel,
      fundingPct,
      fundingApr,
      fundingLabel,
      oiLast,
      oiUsd,
      oiChangePct,
      oiHours,
      oiLabel,
      lsLast,
      takerLast,
      closes,
      candles,
      funding,
      ticker
    };
  }

  function buildFits(metrics) {
    const m = metrics || {};
    const spread = Math.abs(m.emaSpread || 0);
    const momentum = Math.abs(m.momentum || 0);
    const atrPct = m.atrPct || 0;
    const fundingAbs = Math.abs(m.fundingApr || 0);
    const range = m.rangePos == null ? 50 : m.rangePos;
    const volume = m.ticker && m.ticker.volume ? m.ticker.volume : 1e8;

    const scores = {
      trend: clamp(24 + spread * 150 + momentum * 9, 0, 100),
      grid: clamp(74 - spread * 170 - momentum * 7 + (atrPct > 0.1 && atrPct < 0.8 ? 8 : -4), 0, 100),
      carry: clamp(22 + fundingAbs * 2.1, 8, 96),
      mm: clamp(58 + Math.log10(Math.max(volume, 1) / 1e8) * 8 - momentum * 5 - spread * 80 + (atrPct > 0.15 ? 6 : 0), 0, 100),
      breakout: clamp(10 + Math.abs(range - 50) * 1.3 + (atrPct > 0.25 ? 15 : 0) + (range > 70 || range < 30 ? 10 : 0), 0, 100)
    };

    const definitions = [
      {
        key: "trend",
        name: "趋势跟随",
        en: "TREND FOLLOWING",
        cat: "trend",
        score: scores.trend,
        reason: "EMA20 " + (m.emaSpread >= 0 ? "高于" : "低于") + " EMA60 " + Math.abs(m.emaSpread || 0).toFixed(2) + "%，近端动量 " + formatSigned(m.momentum || 0, 2) + "%。"
      },
      {
        key: "grid",
        name: "网格",
        en: "GRID / MEAN REVERSION",
        cat: "market",
        score: scores.grid,
        reason: "5m ATR " + (m.atrPct || 0).toFixed(2) + "%，趋势强度 " + spread.toFixed(2) + "%；" + (atrPct > 0.8 ? "波动过大，库存风险上升" : "区间波动尚可") + "。"
      },
      {
        key: "carry",
        name: "费率套利",
        en: "FUNDING CARRY",
        cat: "market",
        score: scores.carry,
        reason: "资金费率年化 " + formatSigned(m.fundingApr, 1) + "%，" + (fundingAbs > 25 ? "绝对费率为套利提供空间" : "单边空间有限") + "。"
      },
      {
        key: "mm",
        name: "做市/高频",
        en: "MARKET MAKING",
        cat: "market",
        score: scores.mm,
        reason: "24h 成交额 " + formatUsd(volume) + "；趋势越强，库存与逆选择风险越高。"
      },
      {
        key: "breakout",
        name: "突破",
        en: "BREAKOUT",
        cat: "trend",
        score: scores.breakout,
        reason: "现价处于 24H 区间 " + Math.round(range) + "% 位置，ATR " + (m.atrPct || 0).toFixed(2) + "%；" + (range > 70 || range < 30 ? "已接近区间边界" : "尚未接近边界") + "。"
      }
    ];

    return definitions.map((item) => {
      const score = Math.round(item.score);
      const tone = score >= 65 ? "hot" : score >= 45 ? "neutral" : "low";
      const label = score >= 65 ? "顺风" : score >= 45 ? "中性" : "逆风";
      return { ...item, score, tone, label };
    });
  }

  /* ------------------------------------------------------------
     Render: market
     ------------------------------------------------------------ */

  function renderMarketAll() {
    state.metrics = calculateMetrics(currentSeries(), currentTicker(), currentFunding());
    state.fits = buildFits(state.metrics);
    renderTicker();
    renderHero();
    renderMarket();
    renderFit();
    updateStatuses();
  }

  function changeMeta(change) {
    if (change == null || Number.isNaN(Number(change))) return { className: "flat", text: "—" };
    const value = Number(change);
    return {
      className: Math.abs(value) < 0.005 ? "flat" : value > 0 ? "up" : "down",
      text: formatSigned(value, 2) + "%"
    };
  }

  function renderTicker() {
    const track = $("tickerTrack");
    if (!track) return;
    track.innerHTML = SYMBOLS.map((item) => {
      const ticker = state.market && state.market.tickers ? state.market.tickers[item.id] : null;
      const meta = changeMeta(ticker ? ticker.change : null);
      return (
        '<span class="ticker-item">' +
          '<span class="ticker-symbol">' + item.id + "</span>" +
          '<span class="ticker-price">' + formatPrice(ticker ? ticker.last : null) + "</span>" +
          '<span class="ticker-change ' + meta.className + '">' + meta.text + "</span>" +
        "</span>"
      );
    }).join("");
  }

  function flashPrice(element, key, value) {
    if (!element || value == null) return;
    const previous = state.flash[key];
    if (previous != null && Number(previous) !== Number(value)) {
      element.classList.remove("flash-up", "flash-down");
      void element.offsetWidth;
      element.classList.add(Number(value) > Number(previous) ? "flash-up" : "flash-down");
      window.setTimeout(() => element.classList.remove("flash-up", "flash-down"), 700);
    }
    state.flash[key] = value;
  }

  function renderHero() {
    const symbol = SYMBOL_MAP[state.symbol];
    const ticker = currentTicker();
    const funding = currentFunding();
    const metrics = state.metrics || {};
    const price = ticker && ticker.mark != null ? ticker.mark : ticker ? ticker.last : null;
    const meta = changeMeta(ticker ? ticker.change : null);

    if ($("heroBase")) $("heroBase").textContent = symbol ? symbol.base : "BTC";
    if ($("heroLeverage")) $("heroLeverage").textContent = "最高 " + (symbol ? symbol.leverage : "125×");

    const priceNode = $("heroPrice");
    if (priceNode) {
      priceNode.textContent = formatPrice(price);
      flashPrice(priceNode, "hero", price);
    }

    const changeNode = $("heroChange");
    if (changeNode) {
      changeNode.textContent = meta.text;
      changeNode.className = "change-chip is-" + meta.className;
    }

    const rate = funding && funding.rate != null ? funding.rate * 100 : null;
    const apr = rate == null ? null : rate * 3 * 365;
    if ($("heroFunding")) $("heroFunding").textContent = rate == null ? "—" : formatSigned(rate, 4) + "%";
    if ($("heroFundingApr")) {
      $("heroFundingApr").textContent = apr == null ? "年化 —" : "年化 " + formatSigned(apr, 2) + "%";
    }

    if ($("heroOi")) $("heroOi").textContent = metrics.oiUsd == null ? "—" : formatUsd(metrics.oiUsd);
    if ($("heroOiChange")) {
      $("heroOiChange").textContent = metrics.oiChangePct == null
        ? "区间 —"
        : (metrics.oiHours ? metrics.oiHours.toFixed(1) + "h " : "") + formatSigned(metrics.oiChangePct, 2) + "%";
    }
    if ($("heroLs")) $("heroLs").textContent = metrics.lsLast ? metrics.lsLast.ratio.toFixed(2) : "—";
    if ($("heroLongPct")) {
      $("heroLongPct").textContent = metrics.lsLast
        ? "多头账户 " + (metrics.lsLast.long * 100).toFixed(1) + "%"
        : "多头账户 —";
    }

    if ($("heroUpdated")) {
      const stamp = state.lastMarketAt || (state.market && state.market.capturedAt);
      $("heroUpdated").textContent = "更新于 " + (stamp ? formatTime(stamp) : "--:--:--");
    }
    if ($("heroRegime")) {
      $("heroRegime").textContent = metrics.last == null
        ? "读取市场结构…"
        : metrics.trendLabel + " · " + metrics.fundingLabel;
    }

    renderHeroSpark();
  }

  function renderHeroSpark() {
    const node = $("heroSpark");
    if (!node) return;
    const series = currentSeries();
    const candles = series && series.candles ? series.candles.slice(-76) : [];
    if (candles.length < 2) {
      node.innerHTML = '<div class="spark-empty">等待 K 线数据</div>';
      return;
    }

    const width = 400;
    const height = 94;
    const pad = 4;
    const closes = candles.map((candle) => candle.c);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const span = max - min || 1;
    const points = closes.map((close, index) => {
      const x = pad + (index / (closes.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (close - min) / span) * (height - pad * 2);
      return [x, y];
    });
    const line = points.map((point, index) => (index ? "L" : "M") + point[0].toFixed(1) + " " + point[1].toFixed(1)).join("");
    const area = line + " L" + points[points.length - 1][0].toFixed(1) + " " + height + " L" + points[0][0].toFixed(1) + " " + height + " Z";
    const last = points[points.length - 1];
    const ticker = currentTicker();
    const up = ticker && ticker.change != null ? ticker.change >= 0 : closes[closes.length - 1] >= closes[0];

    node.innerHTML =
      '<svg viewBox="0 0 ' + width + " " + height + '" preserveAspectRatio="none" aria-hidden="true">' +
        "<defs>" +
          '<linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="' + (up ? "#8ce8bb" : "#ff6e63") + '" stop-opacity=".18"/>' +
            '<stop offset="1" stop-color="' + (up ? "#8ce8bb" : "#ff6e63") + '" stop-opacity="0"/>' +
          "</linearGradient>" +
        "</defs>" +
        '<path d="' + area + '" fill="url(#heroFill)"/>' +
        '<path d="' + line + '" fill="none" stroke="' + (up ? "#8ce8bb" : "#ff6e63") + '" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<line x1="' + last[0].toFixed(1) + '" y1="' + last[1].toFixed(1) + '" x2="400" y2="' + last[1].toFixed(1) + '" stroke="' + (up ? "#8ce8bb" : "#ff6e63") + '" stroke-opacity=".18" stroke-dasharray="2 4"/>' +
        '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.2" fill="' + (up ? "#8ce8bb" : "#ff6e63") + '"/>' +
      "</svg>";
  }

  function renderMarket() {
    const symbol = SYMBOL_MAP[state.symbol];
    const ticker = currentTicker();
    const funding = currentFunding();
    const metrics = state.metrics || {};
    const meta = changeMeta(ticker ? ticker.change : null);
    const series = currentSeries();

    if ($("chartSymbol")) $("chartSymbol").textContent = (symbol ? symbol.base : "BTC") + " / USDT 永续";
    if ($("chartPrice")) {
      const price = ticker ? ticker.last : null;
      $("chartPrice").textContent = formatPrice(price);
      flashPrice($("chartPrice"), "chart", price);
    }
    if ($("chartChange")) {
      $("chartChange").textContent = meta.text;
      $("chartChange").className = "change-chip is-" + meta.className;
    }
    if ($("chartHigh")) $("chartHigh").textContent = formatPrice(metrics.high24);
    if ($("chartLow")) $("chartLow").textContent = formatPrice(metrics.low24);
    if ($("chartVolume")) $("chartVolume").textContent = formatUsd(ticker ? ticker.volume : null);
    if ($("chartAtr")) {
      $("chartAtr").textContent = metrics.atr ? formatPrice(metrics.atr) + " / " + metrics.atrPct.toFixed(2) + "%" : "—";
    }
    if ($("chartRangePos")) $("chartRangePos").textContent = Math.round(metrics.rangePos) + "%";
    if ($("chartRangeFill")) $("chartRangeFill").style.width = metrics.rangePos + "%";
    if ($("chartRangeMarker")) $("chartRangeMarker").style.left = metrics.rangePos + "%";

    if ($("marketUpdated")) {
      const stamp = state.lastMarketAt || (state.market && state.market.capturedAt);
      $("marketUpdated").textContent = "更新于 " + (stamp ? formatTime(stamp) : "--:--:--");
    }
    if ($("marketLatency")) $("marketLatency").textContent = state.marketLatency == null ? "— ms" : state.marketLatency + " ms";
    if ($("heroSource")) {
      const source = state.market && state.market.provider ? state.market.provider : "Local Snapshot";
      const provider = providerMeta(source);
      $("heroSource").textContent = provider.badge;
      $("heroSource").className = "terminal-badge" + (provider.state !== "live" ? " is-fallback" : "");
    }
    if ($("chartSourceTag")) {
      const source = state.market && state.market.provider ? state.market.provider : "Local Snapshot";
      $("chartSourceTag").textContent = source.toUpperCase();
    }

    renderFunding(funding, metrics);
    renderOI(metrics, series);
    renderPositioning(metrics);
    renderRegime(metrics);
    renderSymbolSelection();
    renderChart(series);
  }

  function renderFunding(funding, metrics) {
    const ratePct = metrics.fundingPct;
    const apr = metrics.fundingApr;
    if ($("fundingRate")) {
      $("fundingRate").innerHTML = ratePct == null ? "—" : formatSigned(ratePct, 4) + "<small>%</small>";
    }
    if ($("fundingApr")) {
      $("fundingApr").textContent = apr == null ? "年化 —" : "年化 " + formatSigned(apr, 2) + "%";
      $("fundingApr").className = "metric-delta" + (apr == null ? " is-neutral" : apr < 0 ? " is-down" : "");
    }
    if ($("fundingBar")) {
      const position = ratePct == null ? 50 : clamp((ratePct + 0.05) / 0.1 * 100, 0, 100);
      $("fundingBar").style.left = position + "%";
    }
    if ($("fundingSide")) {
      $("fundingSide").textContent = ratePct == null ? "等待费率" : ratePct > 0.0005 ? "多头付费" : ratePct < -0.0005 ? "空头付费" : "接近中性";
    }
    if ($("fundingCountdown")) {
      const next = funding && funding.next;
      if (!next) {
        $("fundingCountdown").textContent = "—";
      } else {
        const remaining = Number(next) - Date.now();
        if (remaining <= 0) {
          $("fundingCountdown").textContent = "结算中";
        } else {
          const total = Math.floor(remaining / 1000);
          const hours = Math.floor(total / 3600);
          const minutes = Math.floor((total % 3600) / 60);
          const seconds = total % 60;
          $("fundingCountdown").textContent = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
        }
      }
    }
  }

  function renderOI(metrics, series) {
    const parts = usdParts(metrics.oiUsd);
    if ($("oiValue")) $("oiValue").innerHTML = parts.value + "<small>" + parts.unit + "</small>";
    if ($("oiChange")) {
      $("oiChange").textContent = metrics.oiChangePct == null ? "—" : formatSigned(metrics.oiChangePct, 2) + "%";
      $("oiChange").className = "metric-delta" + (metrics.oiChangePct == null ? " is-neutral" : metrics.oiChangePct < 0 ? " is-down" : "");
    }
    if ($("oiTag")) $("oiTag").textContent = metrics.oiHours ? metrics.oiHours.toFixed(1) + "H" : "—";
    if ($("oiSub")) {
      const base = SYMBOL_MAP[state.symbol] ? SYMBOL_MAP[state.symbol].base : "BTC";
      $("oiSub").textContent = metrics.oiLast ? base + " 计价 " + compact(metrics.oiLast.v) : "等待持仓数据";
    }
    if ($("oiChangeLabel")) $("oiChangeLabel").textContent = metrics.oiHours ? "区间变化 · " + metrics.oiHours.toFixed(1) + "h" : "区间变化";

    const bars = $("oiBars");
    if (bars) {
      const oi = series && Array.isArray(series.oi) ? series.oi : [];
      if (oi.length < 2) {
        bars.innerHTML = '<span class="oi-empty">OI HISTORY UNAVAILABLE</span>';
      } else {
        const sample = [];
        const count = 22;
        for (let index = 0; index < count; index += 1) {
          const position = Math.round((index / (count - 1)) * (oi.length - 1));
          sample.push(oi[position].v);
        }
        const min = Math.min(...sample);
        const max = Math.max(...sample);
        const span = max - min || 1;
        bars.innerHTML = sample.map((value, index) => {
          const height = 12 + ((value - min) / span) * 78;
          const down = sample[sample.length - 1] < sample[0];
          const lastClass = index === sample.length - 1 ? (down ? " is-down" : "") : "";
          return '<i style="height:' + height.toFixed(1) + '%" class="' + (down && index === sample.length - 1 ? "is-down" : "") + lastClass + '"></i>';
        }).join("");
      }
    }
  }

  function renderPositioning(metrics) {
    const ls = metrics.lsLast;
    const ratio = ls ? ls.ratio : null;
    const longPct = ls ? ls.long * 100 : 50;
    const shortPct = ls ? ls.short * 100 : 50;
    if ($("lsRatio")) $("lsRatio").textContent = ratio == null ? "—" : ratio.toFixed(2);
    if ($("lsLong")) $("lsLong").textContent = ratio == null ? "多 —" : "多 " + longPct.toFixed(1) + "%";
    if ($("lsShort")) $("lsShort").textContent = ratio == null ? "空 —" : "空 " + shortPct.toFixed(1) + "%";
    if ($("lsBarLong")) $("lsBarLong").style.width = (ratio == null ? 0 : longPct) + "%";
    if ($("lsBarShort")) $("lsBarShort").style.width = (ratio == null ? 0 : shortPct) + "%";

    const taker = metrics.takerLast;
    if ($("takerRatio")) $("takerRatio").textContent = taker ? taker.ratio.toFixed(2) : "—";
    if ($("takerBar")) {
      const width = taker ? clamp((taker.ratio / (1 + taker.ratio)) * 100, 0, 100) : 0;
      $("takerBar").style.width = width + "%";
    }
  }

  function renderRegime(metrics) {
    if ($("regimeLabel")) {
      $("regimeLabel").textContent = metrics.last == null
        ? "数据同步中"
        : metrics.trendLabel + " · " + metrics.volLabel;
    }
    if ($("regimeNote")) {
      $("regimeNote").textContent = metrics.last == null
        ? "正在用 K 线、资金费率与持仓数据计算市场结构。"
        : "24h " + (metrics.ticker && metrics.ticker.change != null ? formatSigned(metrics.ticker.change, 2) + "%" : "—") + "，EMA20 位于 EMA60 " +
          (metrics.emaSpread >= 0 ? "上方" : "下方") + " " + Math.abs(metrics.emaSpread).toFixed(2) +
          "%；资金费率年化 " + formatSigned(metrics.fundingApr, 1) + "%，" + metrics.oiLabel + "。";
    }
    if ($("regimeTags")) {
      const tags = [metrics.trendLabel, metrics.volLabel, metrics.fundingLabel, metrics.oiLabel];
      $("regimeTags").innerHTML = tags.map((tag, index) => {
        const hot = index === 0 && metrics.trendLabel !== "区间震荡";
        const cool = index === 1;
        return '<span class="' + (hot ? "is-hot" : cool ? "is-cool" : "") + '">' + esc(tag) + "</span>";
      }).join("");
    }
  }

  function renderSymbolSelection() {
    $$("#symbolTabs .symbol-tab").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.symbol === state.symbol);
    });
    $$("#intervalTabs .interval-tab").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.interval === state.interval);
    });
  }

  /* ------------------------------------------------------------
     Chart
     ------------------------------------------------------------ */

  function setChartLoading(visible, text) {
    const node = $("chartLoading");
    if (!node) return;
    node.classList.toggle("is-visible", Boolean(visible));
    if (text) {
      const label = node.querySelector("span:last-child");
      if (label) label.textContent = text;
    }
  }

  function renderChart(series) {
    const svg = $("priceChart");
    if (!svg) return;
    const compact = window.matchMedia("(max-width: 680px)").matches;
    const W = compact ? 600 : 960;
    const H = compact ? 420 : 430;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    const candles = series && Array.isArray(series.candles) ? series.candles : [];
    if (!candles.length) {
      svg.innerHTML =
        '<line class="axis-line" x1="10" y1="24" x2="' + (W - 70) + '" y2="24"/>' +
        '<line class="axis-line" x1="10" y1="184" x2="' + (W - 70) + '" y2="184"/>' +
        '<line class="axis-line" x1="10" y1="344" x2="' + (W - 70) + '" y2="344"/>' +
        '<text x="' + (W / 2) + '" y="204" text-anchor="middle" style="fill:#707c76;font-size:10px;letter-spacing:.08em">NO K-LINE / 暂无 K 线</text>' +
        '<text x="' + (W / 2) + '" y="222" text-anchor="middle" style="fill:#535e59;font-size:8px">当前数据源未返回该合约的 K 线</text>';
      state.chartGeom = null;
      return;
    }

    const left = compact ? 8 : 10;
    const right = compact ? 84 : 78;
    const priceTop = compact ? 12 : 14;
    const priceBottom = compact ? 300 : 318;
    const volTop = compact ? 322 : 340;
    const volBottom = compact ? 378 : 400;
    const plotW = W - left - right;
    const priceH = priceBottom - priceTop;
    const step = plotW / candles.length;
    const bodyW = clamp(step * 0.58, compact ? 1.4 : 1.1, 6.8);

    const highs = candles.map((candle) => candle.h);
    const lows = candles.map((candle) => candle.l);
    const rawMax = Math.max(...highs);
    const rawMin = Math.min(...lows);
    const padding = (rawMax - rawMin) * 0.09 || rawMax * 0.001 || 1;
    const max = rawMax + padding;
    const min = rawMin - padding;
    const spread = max - min || 1;

    const x = (index) => left + (index + 0.5) * step;
    const y = (price) => priceTop + (1 - (price - min) / spread) * priceH;

    const parts = [];
    parts.push('<title>PERP ATLAS · ' + SYMBOL_MAP[state.symbol].base + "USDT " + state.interval + " K线</title>");

    for (let grid = 0; grid < 5; grid += 1) {
      const gy = priceTop + (grid / 4) * priceH;
      const value = max - (grid / 4) * spread;
      parts.push('<line class="grid-line" x1="' + left + '" y1="' + gy.toFixed(2) + '" x2="' + (left + plotW) + '" y2="' + gy.toFixed(2) + '"/>');
      parts.push('<text x="' + (left + plotW + 8) + '" y="' + (gy + 3).toFixed(2) + '">' + formatPrice(value) + "</text>");
    }

    parts.push('<line class="axis-line" x1="' + left + '" y1="' + priceBottom + '" x2="' + (left + plotW) + '" y2="' + priceBottom + '"/>');

    const maxVolume = Math.max(...candles.map((candle) => candle.v || 0)) || 1;
    candles.forEach((candle, index) => {
      const cx = x(index);
      const up = candle.c >= candle.o;
      const colour = up ? "#8ce8bb" : "#ff6e63";
      const openY = y(candle.o);
      const closeY = y(candle.c);
      const highY = y(candle.h);
      const lowY = y(candle.l);
      const top = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));

      parts.push('<line x1="' + cx.toFixed(2) + '" y1="' + highY.toFixed(2) + '" x2="' + cx.toFixed(2) + '" y2="' + lowY.toFixed(2) + '" stroke="' + colour + '" stroke-width="0.8" stroke-opacity=".78"/>');
      parts.push('<rect x="' + (cx - bodyW / 2).toFixed(2) + '" y="' + top.toFixed(2) + '" width="' + bodyW.toFixed(2) + '" height="' + bodyHeight.toFixed(2) + '" fill="' + colour + '" fill-opacity="' + (up ? ".82" : ".7") + '"/>');

      const volumeHeight = ((candle.v || 0) / maxVolume) * (volBottom - volTop);
      parts.push('<rect x="' + (cx - bodyW / 2).toFixed(2) + '" y="' + (volBottom - volumeHeight).toFixed(2) + '" width="' + bodyW.toFixed(2) + '" height="' + Math.max(0.7, volumeHeight).toFixed(2) + '" fill="' + colour + '" fill-opacity=".16"/>');
    });

    const closes = candles.map((candle) => candle.c);
    const ema20 = emaSeries(closes, 20);
    const ema60 = emaSeries(closes, 60);

    function emaPath(values) {
      const points = [];
      values.forEach((value, index) => {
        if (value == null) return;
        points.push((points.length ? "L" : "M") + x(index).toFixed(2) + " " + y(value).toFixed(2));
      });
      return points.join("");
    }

    if (ema20.some((value) => value != null)) parts.push('<path class="ema-20" d="' + emaPath(ema20) + '"/>');
    if (ema60.some((value) => value != null)) parts.push('<path class="ema-60" d="' + emaPath(ema60) + '"/>');

    const last = candles[candles.length - 1];
    const lastY = y(last.c);
    parts.push('<line class="last-line" x1="' + left + '" y1="' + lastY.toFixed(2) + '" x2="' + (left + plotW) + '" y2="' + lastY.toFixed(2) + '"/>');
    const labelWidth = 66;
    const labelX = W - labelWidth - 2;
    parts.push('<rect class="last-label-bg" x="' + labelX + '" y="' + (lastY - 9).toFixed(2) + '" width="' + labelWidth + '" height="17" rx="1"/>');
    parts.push('<text class="last-label-text" x="' + (labelX + labelWidth / 2) + '" y="' + (lastY + 3).toFixed(2) + '" text-anchor="middle">' + formatPrice(last.c) + "</text>");
    parts.push('<circle cx="' + x(candles.length - 1).toFixed(2) + '" cy="' + lastY.toFixed(2) + '" r="2.6" fill="#ff7548"/>');

    const timeCount = compact ? 4 : 5;
    for (let index = 0; index < timeCount; index += 1) {
      const candleIndex = Math.round((index / (timeCount - 1)) * (candles.length - 1));
      const candle = candles[candleIndex];
      const showDate = state.interval === "15m" || state.interval === "1h";
      const label = new Intl.DateTimeFormat("zh-CN", {
        month: showDate ? "2-digit" : undefined,
        day: showDate ? "2-digit" : undefined,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(new Date(candle.t));
      const anchor = index === 0 ? "start" : index === timeCount - 1 ? "end" : "middle";
      const tx = clamp(x(candleIndex), left + 4, left + plotW - 4);
      parts.push('<text x="' + tx.toFixed(2) + '" y="' + (H - 10) + '" text-anchor="' + anchor + '">' + label + "</text>");
    }

    parts.push('<g id="chartCrosshair" visibility="hidden" pointer-events="none">' +
      '<line id="chartCrosshairLine" class="crosshair-line" x1="0" y1="' + priceTop + '" x2="0" y2="' + volBottom + '"/>' +
      '<circle id="chartCrosshairDot" cx="0" cy="0" r="3" fill="#edf1e7" stroke="#0a0d0f" stroke-width="1.5"/>' +
      "</g>");

    svg.innerHTML = parts.join("");
    state.chartGeom = {
      candles,
      x,
      y,
      left,
      plotW,
      step,
      width: W,
      height: H,
      priceTop,
      priceBottom
    };
    setChartLoading(false);
  }

  function bindChartPointer() {
    const wrap = $("chartWrap");
    if (!wrap || wrap.dataset.bound === "1") return;
    wrap.dataset.bound = "1";
    wrap.addEventListener("pointermove", (event) => {
      const geometry = state.chartGeom;
      if (!geometry) return;
      const rect = wrap.getBoundingClientRect();
      const svgX = ((event.clientX - rect.left) / rect.width) * geometry.width;
      let index = Math.floor((svgX - geometry.left) / geometry.step);
      index = clamp(index, 0, geometry.candles.length - 1);
      const candle = geometry.candles[index];
      if (!candle) return;

      const crosshair = $("chartCrosshair");
      const line = $("chartCrosshairLine");
      const dot = $("chartCrosshairDot");
      if (crosshair) crosshair.setAttribute("visibility", "visible");
      if (line) {
        const cx = geometry.x(index).toFixed(2);
        line.setAttribute("x1", cx);
        line.setAttribute("x2", cx);
      }
      if (dot) {
        dot.setAttribute("cx", geometry.x(index).toFixed(2));
        dot.setAttribute("cy", geometry.y(candle.c).toFixed(2));
      }

      const tooltip = $("chartTooltip");
      if (!tooltip) return;
      $("ttTime").textContent = formatShortTime(candle.t);
      $("ttOpen").textContent = formatPrice(candle.o);
      $("ttHigh").textContent = formatPrice(candle.h);
      $("ttLow").textContent = formatPrice(candle.l);
      $("ttClose").textContent = formatPrice(candle.c);
      $("ttVol").textContent = formatUsd(candle.v);
      tooltip.hidden = false;

      const localX = event.clientX - rect.left;
      const tooltipWidth = 166;
      const tooltipX = localX + 16 + tooltipWidth > rect.width ? localX - tooltipWidth - 16 : localX + 16;
      const localY = event.clientY - rect.top;
      const tooltipY = clamp(localY - 82, 8, Math.max(8, rect.height - 112));
      tooltip.style.left = Math.max(8, tooltipX) + "px";
      tooltip.style.top = tooltipY + "px";
    });

    wrap.addEventListener("pointerleave", () => {
      const crosshair = $("chartCrosshair");
      const tooltip = $("chartTooltip");
      if (crosshair) crosshair.setAttribute("visibility", "hidden");
      if (tooltip) tooltip.hidden = true;
    });
  }

  /* ------------------------------------------------------------
     Fit
     ------------------------------------------------------------ */

  function renderFit() {
    const metrics = state.metrics || {};
    const symbol = SYMBOL_MAP[state.symbol];
    if ($("fitSymbol")) $("fitSymbol").textContent = symbol ? symbol.base + "USDT" : "BTCUSDT";
    if ($("fitInterval")) $("fitInterval").textContent = state.interval;
    if ($("fitUpdated")) {
      $("fitUpdated").textContent = "CALCULATED " + formatTime(new Date());
    }

    const fits = state.fits.length ? state.fits : buildFits(metrics);
    const ranked = fits.slice().sort((a, b) => b.score - a.score);
    if ($("radarTopScore")) {
      $("radarTopScore").textContent = "LEAD · " + ranked[0].name + " " + ranked[0].score;
    }
    if ($("fitNarrative")) {
      const top = ranked[0];
      $("fitNarrative").textContent = metrics.last == null
        ? "等待行情数据，适配度尚未计算。"
        : top.score >= 45
          ? "当前 " + (symbol ? symbol.base : "BTC") + " 永续处于「" + metrics.trendLabel + " / " + metrics.volLabel + "」。相对占优的是 " + top.name + "（" + top.score + "），但这是环境读数，不是入场信号。"
          : "当前 " + (symbol ? symbol.base : "BTC") + " 永续没有明显占优的策略族。环境读数 " + top.name + " 仅 " + top.score + "，更适合等待结构变化。";
    }

    if ($("fitList")) {
      $("fitList").innerHTML = ranked.map((fit) => (
        '<button class="fit-row" type="button" data-cat="' + fit.cat + '" data-tone="' + fit.tone + '">' +
          '<span class="fit-name"><strong>' + esc(fit.name) + "</strong><small>" + esc(fit.en) + "</small></span>" +
          '<span class="fit-meter-wrap"><span class="fit-meter"><i style="width:' + fit.score + '%"></i></span><b>' + fit.score + "</b></span>" +
          '<span class="fit-judge">' + fit.label + "</span>" +
          '<span class="fit-reason">' + esc(fit.reason) + "</span>" +
        "</button>"
      )).join("");
    }

    drawRadar(fits);
  }

  function drawRadar(fits) {
    const svg = $("fitRadar");
    if (!svg) return;
    const cx = 210;
    const cy = 190;
    const radius = 126;
    const count = fits.length;
    const angle = (index) => -Math.PI / 2 + (index * Math.PI * 2) / count;
    const point = (index, ratio) => [
      cx + Math.cos(angle(index)) * radius * ratio,
      cy + Math.sin(angle(index)) * radius * ratio
    ];
    const polygon = (values) => values.map((value, index) => {
      const p = point(index, value / 100);
      return p[0].toFixed(2) + "," + p[1].toFixed(2);
    }).join(" ");

    const parts = [];
    parts.push("<title>策略适配雷达： " + fits.map((fit) => fit.name + " " + fit.score).join("，") + "</title>");

    [0.25, 0.5, 0.75, 1].forEach((ratio) => {
      const points = Array.from({ length: count }, (_, index) => {
        const p = point(index, ratio);
        return p[0].toFixed(2) + "," + p[1].toFixed(2);
      }).join(" ");
      parts.push('<polygon class="radar-grid" points="' + points + '"/>');
    });

    fits.forEach((fit, index) => {
      const p = point(index, 1);
      parts.push('<line class="radar-axis" x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(2) + '" y2="' + p[1].toFixed(2) + '"/>');
      const labelPoint = point(index, 1.21);
      const dx = labelPoint[0] - cx;
      const anchor = dx > 8 ? "start" : dx < -8 ? "end" : "middle";
      const yOffset = labelPoint[1] < cy - 40 ? -5 : labelPoint[1] > cy + 40 ? 13 : 4;
      parts.push('<text class="radar-label" x="' + labelPoint[0].toFixed(2) + '" y="' + (labelPoint[1] + yOffset).toFixed(2) + '" text-anchor="' + anchor + '">' + esc(fit.name) + "</text>");
    });

    const baseline = Array.from({ length: count }, () => 50);
    parts.push('<polygon class="radar-baseline" points="' + polygon(baseline) + '"/>');
    parts.push('<polygon class="radar-area" points="' + polygon(fits.map((fit) => fit.score)) + '"/>');
    fits.forEach((fit, index) => {
      const p = point(index, fit.score / 100);
      parts.push('<circle class="radar-point" cx="' + p[0].toFixed(2) + '" cy="' + p[1].toFixed(2) + '" r="2.6"/>');
    });
    parts.push('<circle class="radar-center" cx="' + cx + '" cy="' + cy + '" r="2"/>');

    svg.innerHTML = parts.join("");
  }

  /* ------------------------------------------------------------
     Repo data and rendering
     ------------------------------------------------------------ */

  function applyGithubValues(values) {
    if (!values) return;
    state.repos.forEach((repo) => {
      const value = values[repo.id];
      if (!value) return;
      if (value.stars != null) repo.stars = Number(value.stars);
      if (value.forks != null) repo.forks = Number(value.forks);
      if (value.issues != null) repo.issues = Number(value.issues);
      if (value.pushedAt) repo.pushedAt = value.pushedAt;
      if (value.language) repo.language = value.language;
      if (value.license) repo.license = value.license;
    });
  }

  async function loadGitHub(options = {}) {
    const force = Boolean(options.force);
    if (state.githubFetching) return;

    const cache = storageGet(LS.repos, null);
    if (cache && cache.values) {
      applyGithubValues(cache.values);
      state.githubAt = cache.at || null;
      state.githubStatus = "cached";
      renderTopStats();
      renderRepos();
    }

    if (!force && cache && cache.at && Date.now() - cache.at < GITHUB_TTL) {
      state.githubStatus = "cached";
      updateStatuses();
      return;
    }

    state.githubFetching = true;
    state.githubStatus = "loading";
    state.githubBlocked = false;
    updateStatuses();

    const values = {};
    let successes = 0;
    let rateLimited = false;

    const results = await mapLimit(state.repos, 4, async (repo) => {
      if (state.githubBlocked) return null;
      try {
        const result = await githubGet("/repos/" + repo.repo);
        const data = result.data;
        values[repo.id] = {
          stars: data.stargazers_count,
          forks: data.forks_count,
          issues: data.open_issues_count,
          pushedAt: data.pushed_at,
          language: data.language,
          license: data.license ? data.license.spdx_id : null
        };
        successes += 1;
        return values[repo.id];
      } catch (error) {
        if (error.status === 403 || error.status === 429) {
          rateLimited = true;
          state.githubBlocked = true;
        }
        return null;
      }
    });

    state.githubFetching = false;
    state.hasFetchedGithub = true;

    if (successes > 0) {
      applyGithubValues(values);
      state.githubAt = Date.now();
      state.githubStatus = rateLimited ? "partial" : "live";
      storageSet(LS.repos, { at: state.githubAt, values });
      renderTopStats();
      renderRepos();
      if (rateLimited) toast("GitHub 部分请求受限，已混合使用缓存。");
    } else {
      state.githubStatus = "snapshot";
      if (rateLimited) toast("GitHub 匿名 API 已达限额，继续展示最近快照。", 3600);
      else toast("GitHub 暂不可达，继续展示最近快照。", 3200);
    }
    updateStatuses();
    return results;
  }

  async function loadDownloads(options = {}) {
    const force = Boolean(options.force);
    if (state.downloadsFetching) return;

    const cache = storageGet(LS.downloads, null);
    if (cache && cache.values) {
      applyDownloads(cache.values);
      state.downloadsAt = cache.at || null;
    }

    if (!force && cache && cache.at && Date.now() - cache.at < DOWNLOAD_TTL) {
      updateDownloadFreshness();
      return;
    }

    if (!force && state.downloadsAt && Date.now() - state.downloadsAt < DOWNLOAD_TTL) {
      updateDownloadFreshness();
      return;
    }

    state.downloadsFetching = true;
    updateDownloadFreshness("正在汇总 Release 资产…");
    const targets = state.repos.filter((repo) => repo.hasAssets);
    const values = {};
    let successes = 0;

    await mapLimit(targets, 2, async (repo) => {
      try {
        let total = 0;
        let page = 1;
        let releaseCount = 0;
        while (page <= 4) {
          const result = await githubGet("/repos/" + repo.repo + "/releases?per_page=100&page=" + page);
          const releases = Array.isArray(result.data) ? result.data : [];
          releaseCount += releases.length;
          releases.forEach((release) => {
            (release.assets || []).forEach((asset) => {
              total += Number(asset.download_count) || 0;
            });
          });
          if (releases.length < 100) break;
          page += 1;
        }
        values[repo.id] = { downloads: total, releases: releaseCount };
        successes += 1;
      } catch (error) {
        /* Keep the verified snapshot for this repo. */
      }
    });

    state.downloadsFetching = false;

    if (successes > 0) {
      applyDownloads(values);
      state.downloadsAt = Date.now();
      storageSet(LS.downloads, { at: state.downloadsAt, values });
      renderTopStats();
      renderRepos();
    } else {
      toast("Release 下载数据暂不可达，保留快照。", 3200);
    }
    updateDownloadFreshness();
    updateStatuses();
  }

  function applyDownloads(values) {
    state.repos.forEach((repo) => {
      const value = values[repo.id];
      if (!value) return;
      repo.downloads = Number(value.downloads) || 0;
      repo.hasAssets = repo.downloads > 0;
    });
  }

  function updateDownloadFreshness(override) {
    const node = $("downloadFreshness");
    if (!node) return;
    if (override) {
      node.textContent = override;
      return;
    }
    if (state.downloadsFetching) {
      node.textContent = "正在汇总 Release 资产…";
      return;
    }
    if (state.downloadsAt) {
      node.textContent = "Release 资产累计 · 更新于 " + formatTime(state.downloadsAt);
      return;
    }
    node.textContent = "下载量为 GitHub Release 资产累计 · 快照 " + (DATA.repoSnapshotAt ? formatDate(DATA.repoSnapshotAt) : "2026-10-31");
  }

  function getVisibleRepos() {
    const query = state.query.trim().toLowerCase();
    let visible = state.repos.filter((repo) => {
      if (state.filter !== "all" && repo.cat !== state.filter) return false;
      if (state.watchOnly && !state.watchlist.includes(repo.id)) return false;
      if (!query) return true;
      const haystack = [
        repo.name,
        repo.repo,
        repo.owner,
        repo.family,
        repo.kind,
        repo.language,
        repo.description,
        ...(repo.tags || [])
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    });

    visible = visible.slice().sort((a, b) => {
      if (state.sort === "downloads") {
        return (b.downloads || 0) - (a.downloads || 0) || (b.stars || 0) - (a.stars || 0);
      }
      if (state.sort === "updated") {
        return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
      }
      if (state.sort === "heat") {
        return heatScore(b) - heatScore(a);
      }
      return (b.stars || 0) - (a.stars || 0);
    });

    return visible;
  }

  function renderTopStats() {
    const totalStars = state.repos.reduce((sum, repo) => sum + (repo.stars || 0), 0);
    const totalDownloads = state.repos.reduce((sum, repo) => sum + (repo.downloads || 0), 0);

    if ($("statRepos")) $("statRepos").textContent = state.repos.length;
    if ($("statAgents")) $("statAgents").textContent = AGENTS.length;
    if ($("statStars")) $("statStars").innerHTML = compactHTML(totalStars);
    if ($("statDownloads")) $("statDownloads").innerHTML = compactHTML(totalDownloads);
    if ($("statMarkets")) $("statMarkets").textContent = SYMBOLS.length;
    if ($("repoCount")) $("repoCount").textContent = state.repos.length;
    if ($("repoStarTotal")) $("repoStarTotal").textContent = compact(totalStars);
    if ($("repoDownloadTotal")) $("repoDownloadTotal").textContent = compact(totalDownloads);
    updateFilterCounts();
  }

  function updateFilterCounts() {
    const buttons = $$("#repoFilters .filter-pill");
    buttons.forEach((button) => {
      const category = button.dataset.cat;
      const count = category === "all"
        ? state.repos.length
        : state.repos.filter((repo) => repo.cat === category).length;
      const badge = button.querySelector("span");
      if (badge) badge.textContent = count;
      button.classList.toggle("is-active", category === state.filter);
    });
  }

  function renderRepos() {
    const visible = getVisibleRepos();

    if (visible.length && !visible.some((repo) => repo.id === state.selectedId)) {
      state.selectedId = visible[0].id;
    }

    renderTopStats();
    renderRepoList(visible);
    renderRepoDetail(visible);
    updateWatchUI();
    updateDownloadFreshness();
    updateStatuses();

    if ($("repoVisibleCount")) $("repoVisibleCount").textContent = visible.length;
    if ($("repoResultMeta")) {
      const filterLabel = state.watchOnly ? "观察清单" : state.filter === "all" ? "全部方向" : CAT_META[state.filter];
      $("repoResultMeta").innerHTML =
        "<strong>" + visible.length + "</strong> 个仓库 <span aria-hidden=\"true\">/</span> " +
        SORT_META[state.sort].label + " <span aria-hidden=\"true\">/</span> " + esc(filterLabel) +
        " <span aria-hidden=\"true\">/</span> 共 " + state.repos.length + " 个";
    }

    if ($("repoEmpty")) $("repoEmpty").hidden = visible.length !== 0;
  }

  function renderAgents() {
    const grid = $("agentGrid");
    if (!grid) return;

    const bCount = AGENTS.filter((agent) => agent.grade === "B").length;
    const cCount = AGENTS.filter((agent) => agent.grade === "C").length;
    const aCount = AGENTS.filter((agent) => agent.grade === "A").length;

    if ($("agentCount")) $("agentCount").textContent = AGENTS.length;
    if ($("agentEvidenceCount")) $("agentEvidenceCount").textContent = bCount;
    if ($("agentAuditedCount")) $("agentAuditedCount").textContent = aCount;
    if ($("auditB")) $("auditB").textContent = bCount;
    if ($("auditC")) $("auditC").textContent = cCount;

    const sorted = AGENTS.slice().sort((a, b) => {
      if (state.agentSort === "stars") return (b.stars || 0) - (a.stars || 0);
      if (state.agentSort === "updated") {
        return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
      }
      const gradeWeight = { A: 3, B: 2, C: 1 };
      return (gradeWeight[b.grade] || 0) - (gradeWeight[a.grade] || 0) || (b.stars || 0) - (a.stars || 0);
    });

    $$("#agentSortTabs .agent-sort-btn").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.agentSort === state.agentSort);
    });

    grid.innerHTML = sorted.map((agent, index) => {
      const gradeLabel = agent.grade === "A" ? "审计实盘" : agent.grade === "B" ? "回测" : "未审计";
      return (
        '<a class="agent-card" href="https://github.com/' + encodeURI(agent.repo) + '" target="_blank" rel="noopener noreferrer" data-grade="' + esc(agent.grade) + '" aria-label="打开 ' + esc(agent.name) + ' 的 GitHub 仓库">' +
          '<div class="agent-top">' +
            '<span class="agent-index">AGENT ' + String(index + 1).padStart(2, "0") + "</span>" +
            '<span class="agent-grade"><span class="grade grade-' + agent.grade.toLowerCase() + '">' + esc(agent.grade) + "</span>" + gradeLabel + "</span>" +
          "</div>" +
          '<div class="agent-head">' +
            "<div><h3 class=\"agent-name\">" + esc(agent.name) + "</h3><span class=\"agent-owner\">" + esc(agent.repo) + " · " + esc(agent.language || "—") + "</span></div>" +
            '<span class="agent-market">' + esc(agent.market) + "</span>" +
          "</div>" +
          '<p class="agent-desc">' + esc(agent.description) + "</p>" +
          '<div class="agent-return"><span>RETURN EVIDENCE / 收益声明</span><strong>' + esc(agent.returnClaim) + "</strong></div>" +
          '<p class="agent-why"><b>为什么入选：</b>' + esc(agent.why) + "</p>" +
          '<p class="agent-caution"><b>注意：</b>' + esc(agent.caution) + "</p>" +
          '<div class="agent-foot">' +
            '<span class="agent-stats">STARS <b>' + compact(agent.stars) + "</b> · FORKS <b>" + compact(agent.forks) + "</b> · <b>" + timeAgo(agent.pushedAt) + "</b></span>" +
            '<span class="agent-open">GITHUB ↗</span>' +
          "</div>" +
        "</a>"
      );
    }).join("");
  }

  function renderRepoList(visible) {
    const list = $("repoList");
    if (!list) return;

    list.innerHTML = visible.map((repo, index) => {
      const maint = maintainState(repo);
      const downloads = repo.downloads ? compact(repo.downloads) : "—";
      const downloadsClass = repo.downloads ? " has-downloads" : " is-zero";
      const selected = repo.id === state.selectedId;
      return (
        '<button class="repo-row' + (selected ? " is-selected" : "") + '" type="button" data-id="' + esc(repo.id) + '" aria-label="查看 ' + esc(repo.name) + ' 详情" aria-current="' + (selected ? "true" : "false") + '">' +
          '<span class="col-rank">' + String(index + 1).padStart(2, "0") + "</span>" +
          '<span class="col-repo">' +
            '<span class="repo-name-row"><span class="repo-name">' + esc(repo.name) + "</span></span>" +
            '<span class="repo-owner">' + esc(repo.repo) + "</span>" +
            '<span class="repo-family">' + esc(repo.family) + "</span>" +
            '<span class="repo-mobile-meta"><span>' + esc(repo.kind) + "</span><i></i><span>" + maint.label + "</span><i></i><span>" + timeAgo(repo.pushedAt) + "</span></span>" +
          "</span>" +
          '<span class="col-kind"><span class="kind-badge cat-' + esc(repo.cat) + '">' + esc(repo.kind) + "</span></span>" +
          '<span class="col-stars" data-label="STARS">' + compact(repo.stars) + "</span>" +
          '<span class="col-downloads' + downloadsClass + '" data-label="RELEASE DLS" title="' + (repo.downloads ? nf0.format(repo.downloads) + " 次 Release 资产下载" : "该项目未发布二进制 Release") + '">' + downloads + (repo.downloads ? '<span class="dl-mark">↧</span>' : "") + "</span>" +
          '<span class="col-status"><i class="status-dot ' + maint.dot + '"></i>' + maint.label + "</span>" +
          '<span class="col-updated">' + timeAgo(repo.pushedAt) + "</span>" +
        "</button>"
      );
    }).join("");
  }

  function renderRepoDetail(visible) {
    const container = $("repoDetail");
    if (!container) return;

    if (!visible.length) {
      const emptyMessage = state.watchOnly
        ? "观察清单还是空的。点开任一仓库，把它加入清单。"
        : "当前筛选没有可展示的仓库。";
      container.innerHTML =
        '<div class="detail-placeholder">' +
          '<span class="detail-index">SELECT / —</span>' +
          "<p>" + emptyMessage + "</p>" +
        "</div>";
      return;
    }

    const repo = visible.find((item) => item.id === state.selectedId) || visible[0];
    const maint = maintainState(repo);
    const watched = state.watchlist.includes(repo.id);
    const parts = repo.repo.split("/");
    const owner = parts[0] || repo.owner;
    const name = parts[1] || repo.name;
    const cachedCommit = state.commitCache[repo.id];
    const commitHTML = cachedCommit
      ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10" stroke="currentColor" stroke-width="1.2"/></svg><span class="commit-text">' + esc(cachedCommit.message) + '</span><span class="commit-date">' + timeAgo(cachedCommit.date) + "</span>"
      : '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="2 2"/></svg><span class="commit-text">读取最近提交…</span><span class="commit-date">GITHUB</span>';

    container.innerHTML =
      '<div class="detail-content">' +
        '<div class="detail-topline">' +
          '<span class="detail-role">' + esc(repo.kind) + " / " + esc(repo.family) + "</span>" +
          '<span class="detail-maintain"><i class="status-dot ' + maint.dot + '"></i>' + maint.label + "</span>" +
        "</div>" +
        '<h3 class="detail-title">' + esc(repo.name) + "</h3>" +
        '<p class="detail-repo"><span>' + esc(owner) + '</span><span class="repo-sep">/</span><span>' + esc(name) + '</span><span class="repo-sep">·</span><span>' + esc(repo.language || "—") + "</span></p>" +
        '<div class="detail-tags">' + [repo.language, ...(repo.tags || [])].filter(Boolean).slice(0, 6).map((tag) => "<span>" + esc(tag) + "</span>").join("") + "</div>" +
        '<p class="detail-summary">' + esc(repo.summary) + "</p>" +
        '<div class="detail-stats">' +
          '<div class="detail-stat"><span>STARS</span><strong>' + compact(repo.stars) + "</strong></div>" +
          '<div class="detail-stat"><span>FORKS</span><strong>' + compact(repo.forks) + "</strong></div>" +
          '<div class="detail-stat"><span>RELEASE DLS</span><strong title="' + (repo.downloads ? nf0.format(repo.downloads) : "未发布二进制 Release") + '">' + (repo.downloads ? compact(repo.downloads) : "—") + "</strong></div>" +
          '<div class="detail-stat"><span>LICENSE</span><strong>' + esc(repo.license || "未声明") + "</strong></div>" +
        "</div>" +
        '<div class="detail-block">' +
          '<div class="detail-block-label">STRATEGY STRUCTURE / 策略结构</div>' +
          "<p>" + esc(repo.strategy) + "</p>" +
        "</div>" +
        '<div class="detail-caution"><span>BEFORE LIVE / 实盘之前</span><p>' + esc(repo.caution) + "</p></div>" +
        '<div class="commit-box" id="commitBox">' + commitHTML + "</div>" +
        '<div class="detail-actions">' +
          '<a class="detail-link" href="https://github.com/' + encodeURI(repo.repo) + '" target="_blank" rel="noopener noreferrer">打开 GitHub <span aria-hidden="true">↗</span></a>' +
          '<button class="detail-watch' + (watched ? " is-watched" : "") + '" type="button" id="detailWatch" data-id="' + esc(repo.id) + '" aria-pressed="' + watched + '">' +
            '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m8 2.2 1.72 3.48 3.84.56-2.78 2.71.66 3.83L8 10.97l-3.44 1.81.66-3.83L2.44 6.24l3.84-.56L8 2.2Z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>' +
            (watched ? "已观察" : "加入清单") +
          "</button>" +
        "</div>" +
      "</div>";

    if (!cachedCommit || Date.now() - (cachedCommit.at || 0) > COMMIT_TTL) {
      window.setTimeout(() => loadCommit(repo), 60);
    }
  }

  async function loadCommit(repo) {
    if (!repo || state.commitLoading[repo.id]) return;
    const cached = state.commitCache[repo.id];
    if (cached && Date.now() - cached.at < COMMIT_TTL) return;

    state.commitLoading[repo.id] = true;
    try {
      const result = await githubGet("/repos/" + repo.repo + "/commits?per_page=1");
      if (!result || !Array.isArray(result.data) || !result.data.length) throw new Error("no commit");
      const commit = result.data[0].commit;
      const message = String(commit.message || "最近提交").split("\n")[0].slice(0, 78);
      state.commitCache[repo.id] = {
        message,
        date: commit.author ? commit.author.date : new Date().toISOString(),
        at: Date.now()
      };
      storageSet(LS.commits, state.commitCache);
      if (state.selectedId === repo.id) {
        const box = $("commitBox");
        if (box) {
          box.innerHTML =
            '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10" stroke="currentColor" stroke-width="1.2"/></svg>' +
            '<span class="commit-text"></span>' +
            '<span class="commit-date">' + timeAgo(state.commitCache[repo.id].date) + "</span>";
          const text = box.querySelector(".commit-text");
          if (text) text.textContent = message;
        }
      }
    } catch (error) {
      if (state.selectedId === repo.id) {
        const box = $("commitBox");
        if (box && !cached) {
          box.innerHTML =
            '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>' +
            '<span class="commit-text">提交信息暂不可用</span><span class="commit-date">—</span>';
        }
      }
    } finally {
      state.commitLoading[repo.id] = false;
    }
  }

  function selectRepo(id, options = {}) {
    if (!id) return;
    state.selectedId = id;
    renderRepoList(getVisibleRepos());
    renderRepoDetail(getVisibleRepos());
    if (options.scroll && window.matchMedia("(max-width: 1020px)").matches) {
      const detail = $("repoDetail");
      if (detail) window.setTimeout(() => detail.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }

  function toggleWatch(id) {
    if (!id) return;
    const index = state.watchlist.indexOf(id);
    if (index >= 0) {
      state.watchlist.splice(index, 1);
      toast("已从观察清单移除。");
    } else {
      state.watchlist.push(id);
      toast("已加入观察清单。");
    }
    storageSet(LS.watch, state.watchlist);
    updateWatchUI();
    renderRepos();
  }

  function updateWatchUI() {
    const count = state.watchlist.length;
    if ($("watchCount")) {
      $("watchCount").textContent = count;
      $("watchCount").classList.toggle("has-items", count > 0);
    }
    if ($("watchBtn")) $("watchBtn").setAttribute("aria-pressed", String(state.watchOnly));
    if ($("watchFilter")) {
      $("watchFilter").classList.toggle("is-active", state.watchOnly);
      $("watchFilter").setAttribute("aria-pressed", String(state.watchOnly));
    }
    const detailWatch = $("detailWatch");
    if (detailWatch) {
      const watched = state.watchlist.includes(detailWatch.dataset.id);
      detailWatch.classList.toggle("is-watched", watched);
      detailWatch.setAttribute("aria-pressed", String(watched));
      detailWatch.innerHTML =
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m8 2.2 1.72 3.48 3.84.56-2.78 2.71.66 3.83L8 10.97l-3.44 1.81.66-3.83L2.44 6.24l3.84-.56L8 2.2Z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>' +
        (watched ? "已观察" : "加入清单");
    }
  }

  /* ------------------------------------------------------------
     Status
     ------------------------------------------------------------ */

  function updateStatuses() {
    const provider = state.market && state.market.provider ? state.market.provider : "Local Snapshot";
    const marketLive = state.marketStatus === "live";
    const marketFallback = state.marketStatus === "fallback";
    const githubLive = state.githubStatus === "live" || state.githubStatus === "partial";
    const githubLabel = state.githubFetching
      ? "GitHub 同步中"
      : state.githubStatus === "live"
        ? "GitHub LIVE"
        : state.githubStatus === "partial"
          ? "GitHub 部分"
          : state.githubStatus === "cached"
            ? "GitHub 缓存"
            : "GitHub 快照";
    const marketLabel = state.marketFetching && !state.lastMarketAt
      ? "行情连接中"
      : marketLive
        ? "行情 LIVE"
        : marketFallback
          ? "行情 OKX"
          : provider === "Cached Feed"
            ? "行情缓存"
            : "行情快照";

    if ($("globalStatusText")) $("globalStatusText").textContent = marketLabel + " · " + githubLabel;
    if ($("globalStatusDot")) {
      $("globalStatusDot").classList.toggle("is-fallback", !marketLive);
      $("globalStatusDot").classList.remove("is-error");
    }

    if ($("methodGithub")) {
      const node = $("methodGithub");
      node.className = "source-state" + (githubLive ? "" : state.githubStatus === "cached" || state.githubStatus === "loading" ? " is-fallback" : " is-error");
      node.textContent = state.githubFetching
        ? "SYNCING"
        : state.githubStatus === "live"
          ? "LIVE · " + (state.githubRemaining == null ? "—" : state.githubRemaining) + "/" + state.githubLimit
          : state.githubStatus === "partial"
            ? "PARTIAL"
            : state.githubStatus === "cached"
              ? "CACHE · " + (state.githubAt ? formatTime(state.githubAt) : "—")
              : "SNAPSHOT";
    }

    if ($("methodMarket")) {
      const node = $("methodMarket");
      node.className = "source-state" + (marketLive ? "" : marketFallback ? " is-fallback" : " is-error");
      node.textContent = marketLive
        ? "LIVE · " + (state.marketLatency == null ? "—" : state.marketLatency) + "ms"
        : marketFallback
          ? "FAILOVER · OKX"
          : state.marketFetching
            ? "CONNECTING"
            : "SNAPSHOT";
    }

    if ($("methodFallback")) {
      const node = $("methodFallback");
      node.className = "source-state" + (marketFallback ? "" : " is-idle");
      node.textContent = marketFallback ? "ACTIVE" : "STANDBY";
    }

    if ($("methodSnapshot")) {
      const node = $("methodSnapshot");
      const active = provider === "Local Snapshot";
      node.className = "source-state" + (active ? " is-fallback" : " is-idle");
      node.textContent = active ? "ACTIVE" : "READY";
    }

    const sourceChip = $("marketSource");
    if (sourceChip) {
      sourceChip.className = "source-chip" + (marketLive ? "" : marketFallback ? " is-fallback" : " is-error");
      sourceChip.innerHTML = "<i></i> " + esc(provider) + (state.marketLatency == null ? "" : " · " + state.marketLatency + "ms");
    }

    if ($("tickerSource")) $("tickerSource").textContent = providerMeta(provider).short;
  }

  /* ------------------------------------------------------------
     Events and init
     ------------------------------------------------------------ */

  function bindEvents() {
    $("symbolTabs")?.addEventListener("click", (event) => {
      const button = event.target.closest(".symbol-tab");
      if (!button || button.dataset.symbol === state.symbol) return;
      state.symbol = button.dataset.symbol;
      state.chartGeom = null;
      const series = currentSeries();
      if (!series) setChartLoading(true, "正在拉取 " + SYMBOL_MAP[state.symbol].base + " K 线");
      state.metrics = calculateMetrics(currentSeries(), currentTicker(), currentFunding());
      state.fits = buildFits(state.metrics);
      renderMarketAll();
      loadMarket();
    });

    $("intervalTabs")?.addEventListener("click", (event) => {
      const button = event.target.closest(".interval-tab");
      if (!button || button.dataset.interval === state.interval) return;
      state.interval = button.dataset.interval;
      state.chartGeom = null;
      if (!currentSeries()) setChartLoading(true, "正在切换 K 线周期");
      state.metrics = calculateMetrics(currentSeries(), currentTicker(), currentFunding());
      state.fits = buildFits(state.metrics);
      renderMarketAll();
      loadMarket();
    });

    $("marketRefreshBtn")?.addEventListener("click", () => {
      loadMarket({ force: true });
      toast("正在刷新永续行情。", 1600);
    });

    $("refreshBtn")?.addEventListener("click", async () => {
      const button = $("refreshBtn");
      button?.classList.add("is-spinning");
      await Promise.allSettled([loadMarket({ force: true }), loadGitHub({ force: true })]);
      if (state.sort === "downloads") await loadDownloads({ force: false });
      button?.classList.remove("is-spinning");
      toast("观察数据已刷新。", 2000);
    });

    $("repoRefreshBtn")?.addEventListener("click", async () => {
      const button = $("repoRefreshBtn");
      button?.classList.add("is-spinning");
      await loadGitHub({ force: true });
      if (state.sort === "downloads") await loadDownloads({ force: false });
      button?.classList.remove("is-spinning");
    });

    $("repoFilters")?.addEventListener("click", (event) => {
      const button = event.target.closest(".filter-pill");
      if (!button) return;
      state.filter = button.dataset.cat;
      state.watchOnly = false;
      renderRepos();
    });

    $("sortTabs")?.addEventListener("click", (event) => {
      const button = event.target.closest(".sort-tab");
      if (!button) return;
      state.sort = button.dataset.sort;
      $$("#sortTabs .sort-tab").forEach((item) => item.classList.toggle("is-active", item === button));
      renderRepos();
      if (state.sort === "downloads") loadDownloads();
    });

    let searchTimer = null;
    $("repoSearch")?.addEventListener("input", (event) => {
      window.clearTimeout(searchTimer);
      const value = event.target.value;
      searchTimer = window.setTimeout(() => {
        state.query = value;
        renderRepos();
      }, 120);
    });

    $("agentSortTabs")?.addEventListener("click", (event) => {
      const button = event.target.closest(".agent-sort-btn");
      if (!button) return;
      state.agentSort = button.dataset.agentSort;
      renderAgents();
    });

    $("watchBtn")?.addEventListener("click", () => {
      state.watchOnly = !state.watchOnly;
      updateWatchUI();
      renderRepos();
      if (state.watchOnly) {
        $("repos")?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (!state.watchlist.length) toast("观察清单为空，先从仓库详情里加入几个。", 2600);
      }
    });

    $("watchFilter")?.addEventListener("click", () => {
      state.watchOnly = !state.watchOnly;
      updateWatchUI();
      renderRepos();
    });

    $("clearFilters")?.addEventListener("click", () => {
      state.filter = "all";
      state.query = "";
      state.watchOnly = false;
      state.sort = "stars";
      if ($("repoSearch")) $("repoSearch").value = "";
      $$("#sortTabs .sort-tab").forEach((button) => button.classList.toggle("is-active", button.dataset.sort === "stars"));
      updateWatchUI();
      renderRepos();
    });

    $("repoList")?.addEventListener("click", (event) => {
      const row = event.target.closest(".repo-row");
      if (!row) return;
      selectRepo(row.dataset.id, { scroll: true });
    });

    $("repoDetail")?.addEventListener("click", (event) => {
      const watch = event.target.closest("#detailWatch");
      if (!watch) return;
      toggleWatch(watch.dataset.id);
    });

    $("fitList")?.addEventListener("click", (event) => {
      const row = event.target.closest(".fit-row");
      if (!row) return;
      state.filter = row.dataset.cat || "all";
      state.watchOnly = false;
      renderRepos();
      $("repos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    $("fitExplainBtn")?.addEventListener("click", (event) => {
      const panel = $("formulaPanel");
      if (!panel) return;
      const open = panel.hasAttribute("hidden");
      panel.toggleAttribute("hidden", !open);
      event.currentTarget.setAttribute("aria-expanded", String(open));
    });

    $("menuToggle")?.addEventListener("click", () => {
      const menu = $("siteMenu");
      const toggle = $("menuToggle");
      if (!menu || !toggle) return;
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
    });

    $$("#siteMenu a").forEach((link) => {
      link.addEventListener("click", () => {
        $("siteMenu")?.classList.remove("is-open");
        $("menuToggle")?.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        $("siteMenu")?.classList.remove("is-open");
        $("menuToggle")?.setAttribute("aria-expanded", "false");
      }
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        $("repoSearch")?.focus();
      }
    });

    let lastScroll = 0;
    window.addEventListener("scroll", () => {
      const header = document.querySelector(".site-header");
      if (!header) return;
      const current = window.scrollY;
      if (current > 260 && current > lastScroll) header.classList.add("is-compact");
      if (current < 70) header.classList.remove("is-compact");
      lastScroll = current;
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") return;
      if (!state.lastMarketAt || Date.now() - state.lastMarketAt > 60000) loadMarket();
      if (!state.githubAt || Date.now() - state.githubAt > GITHUB_TTL) loadGitHub();
    });

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => renderChart(currentSeries()), 140);
    });

    bindChartPointer();
  }

  function initReveal() {
    const nodes = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    nodes.forEach((node) => observer.observe(node));
  }

  function startClock() {
    const tick = () => {
      const now = new Date();
      const value = formatTime(now);
      if ($("clock")) $("clock").textContent = value;
      if ($("footerClock")) $("footerClock").textContent = value;
      if ($("fundingCountdown")) {
        const funding = currentFunding();
        const next = funding && funding.next;
        if (next) {
          const remaining = Number(next) - now.getTime();
          if (remaining <= 0) {
            $("fundingCountdown").textContent = "结算中";
          } else {
            const total = Math.floor(remaining / 1000);
            const hours = Math.floor(total / 3600);
            const minutes = Math.floor((total % 3600) / 60);
            const seconds = total % 60;
            $("fundingCountdown").textContent = [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
          }
        } else {
          $("fundingCountdown").textContent = "—";
        }
      }
    };
    tick();
    window.setInterval(tick, 1000);
  }

  function init() {
    const initial = snapshotMarket();
    state.market = initial.market;
    state.seriesCache = initial.seriesCache;
    state.watchlist = storageGet(LS.watch, []);
    if (!Array.isArray(state.watchlist)) state.watchlist = [];
    state.commitCache = storageGet(LS.commits, {});
    if (!state.commitCache || typeof state.commitCache !== "object") state.commitCache = {};

    const cachedRepos = storageGet(LS.repos, null);
    if (cachedRepos && cachedRepos.values) {
      applyGithubValues(cachedRepos.values);
      state.githubAt = cachedRepos.at || null;
      state.githubStatus = "cached";
    }
    const cachedDownloads = storageGet(LS.downloads, null);
    if (cachedDownloads && cachedDownloads.values) {
      applyDownloads(cachedDownloads.values);
      state.downloadsAt = cachedDownloads.at || null;
    }

    state.metrics = calculateMetrics(currentSeries(), currentTicker(), currentFunding());
    state.fits = buildFits(state.metrics);

    bindEvents();
    updateWatchUI();
    renderAll();
    initReveal();
    startClock();
    updateDownloadFreshness();
    updateStatuses();

    window.setTimeout(() => {
      loadMarket();
      loadGitHub();
    }, 120);

    window.setInterval(() => {
      if (document.visibilityState === "visible") loadMarket();
    }, REFRESH_MS);

    window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (!state.githubAt || Date.now() - state.githubAt > GITHUB_TTL) loadGitHub();
    }, 5 * 60 * 1000);
  }

  function renderAll() {
    renderTopStats();
    renderMarketAll();
    renderRepos();
    renderAgents();
    updateWatchUI();
    updateStatuses();
  }

  init();
})();
