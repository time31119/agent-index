#!/usr/bin/env python3
"""Fetch aligned intraday bars from Yahoo Finance for the static site.

Datasets are separated by calendar:
  five   — 60 days of 5-minute US equity bars
  hour   — 730 days of hourly US equity bars
  crypto — 365 days of hourly crypto bars (24/7)
Each dataset has one shared timestamp axis; missing symbol bars are null.
"""
from __future__ import annotations

import json
import math
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "js" / "intraday-data.js"

DATASETS = {
    "five": {
        "range": "60d",
        "interval": "5m",
        "symbols": ["SPY", "QQQ", "IWM", "AAPL", "NVDA", "TSLA"],
    },
    "hour": {
        "range": "730d",
        "interval": "1h",
        "symbols": ["SPY", "QQQ", "IWM", "AAPL", "NVDA", "TSLA", "MSFT", "GLD", "TLT", "USO"],
    },
    "crypto": {
        "range": "365d",
        "interval": "1h",
        "symbols": ["BTC-USD", "ETH-USD"],
    },
}


def fetch(symbol: str, range_: str, interval: str) -> tuple[str, dict]:
    base = "https://query1.finance.yahoo.com/v8/finance/chart/"
    query = urllib.parse.urlencode({"range": range_, "interval": interval, "includePrePost": "false", "events": "div,splits"})
    req = urllib.request.Request(
        base + urllib.parse.quote(symbol) + "?" + query,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
            "Accept": "application/json,text/plain,*/*",
            "Accept-Encoding": "identity",
            "Connection": "close",
        },
    )
    payload = None
    last = None
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                payload = json.loads(response.read().decode("utf-8"))
            break
        except Exception as exc:  # noqa: BLE001
            last = exc
            time.sleep(1.2 + attempt * 1.5)
    if payload is None:
        raise RuntimeError(f"download failed: {last}")
    result = payload["chart"]["result"][0]
    meta = result["meta"]
    tz = ZoneInfo(meta.get("exchangeTimezoneName") or "UTC")
    timestamps = result.get("timestamp") or []
    q = (result.get("indicators", {}).get("quote") or [{}])[0]
    opens, highs, lows, closes, vols = (q.get(k) or [] for k in ("open", "high", "low", "close", "volume"))
    rows = {}
    for i, ts in enumerate(timestamps):
        try:
            o, h, l, c = float(opens[i]), float(highs[i]), float(lows[i]), float(closes[i])
        except (IndexError, TypeError, ValueError):
            continue
        if not all(math.isfinite(x) and x > 0 for x in (o, h, l, c)):
            continue
        dt = datetime.fromtimestamp(ts, tz)
        v = int(vols[i]) if i < len(vols) and vols[i] is not None else 0
        rows[int(ts)] = [dt.strftime("%Y-%m-%d"), dt.strftime("%H:%M"), round(o, 4), round(h, 4), round(l, 4), round(c, 4), v]
    return str(tz), rows


def main() -> None:
    out = {
        "meta": {
            "source": "Yahoo Finance chart API (regular session, split-adjusted OHLC)",
            "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "fields": ["open", "high", "low", "close", "volume"],
        },
        "datasets": {},
    }
    for key, cfg in DATASETS.items():
        raw: dict[str, tuple[str, dict]] = {}
        for n, symbol in enumerate(cfg["symbols"], 1):
            try:
                got = fetch(symbol, cfg["range"], cfg["interval"])
                if len(got[1]) < 300:
                    raise RuntimeError(f"only {len(got[1])} bars")
                raw[symbol] = got
                print(f"[{key} {n:02d}/{len(cfg['symbols'])}] {symbol:9s} {len(got[1]):6d} bars  {min(got[1])}")
            except Exception as exc:  # noqa: BLE001
                print(f"[{key} {n:02d}/{len(cfg['symbols'])}] {symbol:9s} FAILED: {exc}")
            time.sleep(0.4)
        if not raw:
            raise SystemExit(f"no data for {key}")
        # union timestamp axis, sorted
        all_ts = sorted(set().union(*(set(rows.keys()) for _, rows in raw.values())))
        tzs = {tz for tz, _ in raw.values()}
        ds = {
            "range": cfg["range"],
            "interval": cfg["interval"],
            "tz": sorted(tzs)[0],
            "t": all_ts,
            "d": [raw[next(iter(raw))][1][ts][0] if ts in raw[next(iter(raw))][1] else "" for ts in all_ts],
            "tm": [raw[next(iter(raw))][1][ts][1] if ts in raw[next(iter(raw))][1] else "" for ts in all_ts],
            "symbols": {},
        }
        # derive date/time per timestamp from any symbol that has it; all share exchange tz
        first_rows = next(iter(raw.values()))[1]
        for i, ts in enumerate(all_ts):
            if ts in first_rows:
                ds["d"][i], ds["tm"][i] = first_rows[ts][0], first_rows[ts][1]
            else:
                for _, rows in raw.values():
                    if ts in rows:
                        ds["d"][i], ds["tm"][i] = rows[ts][0], rows[ts][1]
                        break
        for symbol, (_, rows) in raw.items():
            cols = {"o": [], "h": [], "l": [], "c": [], "v": []}
            for ts in all_ts:
                row = rows.get(ts)
                if row is None:
                    for col in cols:
                        cols[col].append(None)
                else:
                    cols["o"].append(row[2]); cols["h"].append(row[3]); cols["l"].append(row[4]); cols["c"].append(row[5]); cols["v"].append(row[6])
            ds["symbols"][symbol] = cols
        ds["meta"] = {
            "start": ds["d"][0], "end": ds["d"][-1],
            "bars": len(all_ts), "symbols": list(ds["symbols"].keys()),
            "exchangeTimezone": ds["tz"],
        }
        out["datasets"][key] = ds
        print(f"[{key}] aligned {len(all_ts)} bars, {len(ds['symbols'])} symbols, {ds['meta']['start']} -> {ds['meta']['end']}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    text = "/* generated by scripts/fetch_intraday.py; do not edit by hand */\nwindow.INTRADAY_DATA = "
    text += json.dumps(out, ensure_ascii=False, separators=(",", ":"))
    text += ";\n"
    OUT.write_text(text, encoding="utf-8")
    print(f"\nwrote {OUT} ({OUT.stat().st_size / 1024 / 1024:.2f} MB)")


if __name__ == "__main__":
    main()
