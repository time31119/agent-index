#!/usr/bin/env python3
"""Fetch adjusted daily OHLCV from Yahoo Finance and write a browser-ready JS file.

This is a build-time helper. The shipped site is fully static and does not call
any market API at runtime.
"""
from __future__ import annotations

import json
import math
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "js" / "market-data.js"

SYMBOLS = [
    # core liquid ETFs
    "SPY", "QQQ", "IWM", "TLT", "IEF", "GLD", "SLV", "USO",
    # sectors for cross-sectional rotation
    "XLE", "XLF", "XLK", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB",
    # global / country ETFs
    "EEM", "EFA", "EWJ", "EWZ", "EWU",
    # single names for cross-sectional tests
    "AAPL", "NVDA", "JPM", "XOM", "MSFT", "AMZN", "GOOGL", "META", "TSLA",
    # crypto (7-day calendar)
    "BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD",
    # macro references
    "^VIX", "GC=F", "CL=F", "EURUSD=X",
]

START = datetime(2016, 12, 1, tzinfo=timezone.utc)
END = datetime(2026, 11, 5, tzinfo=timezone.utc)
P1 = int(START.timestamp())
P2 = int(END.timestamp())


def fetch(symbol: str) -> dict:
    base = "https://query1.finance.yahoo.com/v8/finance/chart/"
    query = urllib.parse.urlencode(
        {"period1": P1, "period2": P2, "interval": "1d", "events": "div,splits", "includeAdjustedClose": "true"}
    )
    req = urllib.request.Request(
        base + urllib.parse.quote(symbol) + "?" + query,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
            "Accept": "application/json,text/plain,*/*",
            "Accept-Encoding": "identity",
            "Connection": "close",
        },
    )
    last_error: Exception | None = None
    payload = None
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                payload = json.loads(response.read().decode("utf-8"))
            break
        except Exception as exc:  # noqa: BLE001 - retry transient truncation
            last_error = exc
            time.sleep(1.2 + attempt * 1.5)
    if payload is None:
        raise RuntimeError(f"download failed after retries: {last_error}")
    result = payload["chart"]["result"][0]
    timestamps = result.get("timestamp") or []
    quote = (result.get("indicators", {}).get("quote") or [{}])[0]
    adj = ((result.get("indicators", {}).get("adjclose") or [{}])[0]).get("adjclose") or []
    opens = quote.get("open") or []
    highs = quote.get("high") or []
    lows = quote.get("low") or []
    closes = quote.get("close") or []
    volumes = quote.get("volume") or []

    rows = {}
    for i, ts in enumerate(timestamps):
        try:
            o, h, l, c = opens[i], highs[i], lows[i], closes[i]
        except IndexError:
            continue
        if None in (o, h, l, c) or not all(math.isfinite(float(x)) for x in (o, h, l, c)):
            continue
        if float(c) <= 0 or float(o) <= 0:
            continue
        a = adj[i] if i < len(adj) and adj[i] is not None else c
        if not math.isfinite(float(a)) or float(a) <= 0:
            a = c
        factor = float(a) / float(c)
        date = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")
        v = volumes[i] if i < len(volumes) and volumes[i] is not None else 0
        rows[date] = [
            round(float(o) * factor, 4),
            round(float(h) * factor, 4),
            round(float(l) * factor, 4),
            round(float(a), 4),
            int(v),
        ]
    return rows


def main() -> None:
    all_dates: set[str] = set()
    data: dict[str, dict] = {}
    failures = []
    for n, symbol in enumerate(SYMBOLS, 1):
        try:
            rows = fetch(symbol)
            if len(rows) < 250:
                raise RuntimeError(f"only {len(rows)} rows")
            data[symbol] = rows
            all_dates.update(rows)
            print(f"[{n:02d}/{len(SYMBOLS)}] {symbol:9s} {len(rows):5d} rows  {min(rows)} -> {max(rows)}")
        except Exception as exc:  # noqa: BLE001 - build script should report and continue
            failures.append((symbol, str(exc)))
            print(f"[{n:02d}/{len(SYMBOLS)}] {symbol:9s} FAILED: {exc}")
        time.sleep(0.35)

    if not data:
        raise SystemExit("No symbols downloaded; aborting.")

    dates = sorted(all_dates)
    out = {
        "meta": {
            "source": "Yahoo Finance chart API, adjusted for splits and dividends",
            "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "start": dates[0],
            "end": dates[-1],
            "fields": ["open", "high", "low", "close", "volume"],
            "symbols": list(data.keys()),
            "failures": failures,
        },
        "dates": dates,
        "symbols": {},
    }
    for symbol, rows in data.items():
        cols = {"o": [], "h": [], "l": [], "c": [], "v": []}
        for d in dates:
            row = rows.get(d)
            if row is None:
                for key in cols:
                    cols[key].append(None)
            else:
                for key, value in zip(("o", "h", "l", "c", "v"), row):
                    cols[key].append(value)
        out["symbols"][symbol] = cols

    OUT.parent.mkdir(parents=True, exist_ok=True)
    text = "/* generated by scripts/fetch_market_data.py; do not edit by hand */\nwindow.ALPHA_MARKET = "
    text += json.dumps(out, ensure_ascii=False, separators=(",", ":"))
    text += ";\n"
    OUT.write_text(text, encoding="utf-8")
    print(f"\nwrote {OUT} ({OUT.stat().st_size / 1024 / 1024:.2f} MB), {len(dates)} dates, {len(data)} symbols")
    if failures:
        print("failures:", failures)


if __name__ == "__main__":
    main()
