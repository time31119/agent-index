#!/usr/bin/env python3
"""Build and validate the 100-strategy dataset used by the static site."""
from __future__ import annotations

import csv
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from data.batch1 import STRATEGIES as B1  # noqa: E402
from data.batch2 import STRATEGIES as B2  # noqa: E402
from data.batch3 import STRATEGIES as B3  # noqa: E402
from data.batch4 import STRATEGIES as B4  # noqa: E402
from data.batch5 import STRATEGIES as B5  # noqa: E402
from data.common import FAMILIES  # noqa: E402

STRATEGIES = B1 + B2 + B3 + B4 + B5

REQUIRED = [
    "id", "code", "slug", "name", "en", "familyCode", "family", "market", "timeframe",
    "holding", "direction", "edge", "aiRole", "ai", "thesis", "entry", "exit", "risk",
    "data", "execution", "fails", "liveCheck", "verification", "riskLevel", "capital",
    "access", "capacity", "readiness", "tags",
]
ENGINES = {
    "trend_ma", "breakout", "rsi_reversion", "bollinger", "zscore_reversion", "seasonality",
    "gap_continuation", "gap_fade", "pairs", "dual_momentum", "xs_momentum", "xs_reversal",
    "xs_factor", "risk_parity", "trend_basket",
}
VERIFICATIONS = {"backtest", "paper", "data", "audit"}
RISKS = {"低", "中低", "中", "中高", "高", "极高"}


def validate() -> None:
    errors = []
    if len(STRATEGIES) != 100:
        errors.append(f"expected 100 strategies, got {len(STRATEGIES)}")
    ids = [s["id"] for s in STRATEGIES]
    if ids != [f"{i:03d}" for i in range(1, 101)]:
        errors.append("ids must be exactly 001..100 in order")
    if len(set(ids)) != len(ids):
        errors.append("duplicate ids")
    slugs = [s["slug"] for s in STRATEGIES]
    if len(set(slugs)) != len(slugs):
        errors.append("duplicate slugs")
    counts = Counter(s["familyCode"] for s in STRATEGIES)
    if any(counts.get(k, 0) != 10 for k in FAMILIES):
        errors.append(f"family counts must be 10 each: {dict(counts)}")
    for s in STRATEGIES:
        for key in REQUIRED:
            value = s.get(key)
            if value is None or value == "" or (isinstance(value, list) and not value):
                errors.append(f"{s.get('id')}: missing {key}")
        if s["verification"] not in VERIFICATIONS:
            errors.append(f"{s['id']}: bad verification {s['verification']}")
        if s["riskLevel"] not in RISKS:
            errors.append(f"{s['id']}: bad riskLevel {s['riskLevel']}")
        if not isinstance(s["readiness"], int) or not 0 <= s["readiness"] <= 100:
            errors.append(f"{s['id']}: readiness must be int 0..100")
        if s["verification"] == "backtest":
            if s["engine"] not in ENGINES:
                errors.append(f"{s['id']}: unknown engine {s['engine']}")
            if not isinstance(s["params"], dict) or not s["params"]:
                errors.append(f"{s['id']}: backtest needs params")
            if not s.get("universe") and not s.get("symbols"):
                errors.append(f"{s['id']}: backtest needs symbols or universe")
        if s["family"] != FAMILIES.get(s["familyCode"]):
            errors.append(f"{s['id']}: family mismatch")
    if errors:
        print("VALIDATION FAILED")
        for e in errors:
            print(" -", e)
        raise SystemExit(1)
    print(f"validated {len(STRATEGIES)} strategies; "
          f"backtest={sum(1 for s in STRATEGIES if s['verification']=='backtest')}, "
          f"paper={sum(1 for s in STRATEGIES if s['verification']=='paper')}, "
          f"data={sum(1 for s in STRATEGIES if s['verification']=='data')}, "
          f"audit={sum(1 for s in STRATEGIES if s['verification']=='audit')}")


def clean(s: dict) -> dict:
    out = dict(s)
    # keep a compact, stable field order
    order = [
        "id", "code", "slug", "name", "en", "familyCode", "family", "market", "symbols",
        "universe", "timeframe", "holding", "direction", "edge", "aiRole", "ai", "thesis",
        "entry", "exit", "risk", "data", "execution", "fails", "liveCheck", "protocol",
        "verification", "engine", "params", "benchmark", "riskLevel", "capital", "access",
        "capacity", "readiness", "costBps", "tags",
    ]
    return {k: out[k] for k in order if k in out}


def main() -> None:
    validate()
    strategies = [clean(s) for s in STRATEGIES]
    meta = {
        "title": "ALPHA 100",
        "subtitle": "100 条可实盘的 AI 交易策略",
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "families": [{"code": k, "name": v, "count": sum(1 for s in strategies if s["familyCode"] == k)} for k, v in FAMILIES.items()],
        "counts": {
            "total": len(strategies),
            "backtest": sum(1 for s in strategies if s["verification"] == "backtest"),
            "paper": sum(1 for s in strategies if s["verification"] == "paper"),
            "data": sum(1 for s in strategies if s["verification"] == "data"),
            "audit": sum(1 for s in strategies if s["verification"] == "audit"),
        },
        "disclaimer": "研究工具，不构成投资建议。历史回测不代表未来收益；实盘前必须做样本外与纸面验证。",
    }
    out_js = ROOT / "assets" / "js" / "strategies.js"
    out_js.parent.mkdir(parents=True, exist_ok=True)
    text = "/* generated by scripts/build_strategies.py; do not edit by hand */\n"
    text += "window.ALPHA_META = " + json.dumps(meta, ensure_ascii=False, separators=(",", ":")) + ";\n"
    text += "window.ALPHA_STRATEGIES = " + json.dumps(strategies, ensure_ascii=False, separators=(",", ":")) + ";\n"
    out_js.write_text(text, encoding="utf-8")
    out_json = ROOT / "data" / "strategies.json"
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps({"meta": meta, "strategies": strategies}, ensure_ascii=False, indent=2), encoding="utf-8")
    out_csv = ROOT / "data" / "strategy-index.csv"
    with out_csv.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["编号", "家族", "名称", "市场", "周期", "方向", "AI 用法", "验证方式", "风险", "就绪度", "一句话逻辑"])
        for s in strategies:
            w.writerow([s["id"], s["family"], s["name"], s["market"], s["timeframe"], s["direction"], s["aiRole"], s["verification"], s["riskLevel"], s["readiness"], s["thesis"]])
    print(f"wrote {out_js} ({out_js.stat().st_size/1024:.0f} KB)")
    print(f"wrote {out_json} ({out_json.stat().st_size/1024:.0f} KB)")
    print(f"wrote {out_csv}")


if __name__ == "__main__":
    main()
