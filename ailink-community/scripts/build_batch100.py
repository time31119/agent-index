"""对 100 家批量结果评分，生成 CSV 和可写回的 verified 覆盖数据。"""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rows = json.loads((ROOT / "data" / "pipeline" / "batch100.json").read_text(encoding="utf-8"))
BAD_CITY = ("北京", "上海", "苏州", "南京", "广州", "深圳", "成都", "武汉", "西安", "合肥", "衢州", "四川")


def team_int(v):
    if not v:
        return 0
    m = re.search(r"(\d[\d,]*)\s*(?:余)?\s*人", str(v))
    if m:
        return int(m.group(1).replace(",", ""))
    m = re.search(r"over\s+([\d,]+)\s+people", str(v), re.I)
    return int(m.group(1).replace(",", "")) if m else 0


def norm_phone(v):
    if not v:
        return ""
    return str(v).replace("+86-", "").replace("+86 ", "").replace("+86400", "400").strip()


def norm_email(v):
    return str(v).split(",")[0].strip() if v else ""


verified = {}
review = []
for item in rows:
    e = item.get("extracted") or {}
    city = e.get("city") or ""
    bad_city = any(c in city for c in BAD_CITY)
    score = 0
    score += 2 if e.get("name") else 0
    score += 2 if (e.get("website") or item.get("url")) else 0
    score += 1 if len(e.get("description") or "") >= 30 else 0
    score += 1 if e.get("sector") else 0
    score += 1 if e.get("founded_year") else 0
    score += 1 if (e.get("phone") or e.get("email")) else 0
    score += 1 if e.get("address") else 0
    score += 1 if (city or e.get("district")) else 0
    if bad_city:
        score = min(score, 3)
    ok = score >= 7 and not bad_city
    review.append({
        "company": item["company"],
        "url": item.get("url") or "",
        "name": e.get("name") or "",
        "city": city,
        "district": e.get("district") or "",
        "founded": e.get("founded_year") or "",
        "phone": norm_phone(e.get("phone")),
        "email": norm_email(e.get("email")),
        "score": score,
        "status": "已核验" if ok else "待补",
        "note": "城市不符" if bad_city else ("字段不足" if not ok else ""),
    })
    if ok:
        verified[item["company"]] = {
            "name": e.get("name") or item["company"],
            "city": "杭州" if not city else city.replace("市", ""),
            "district": e.get("district") or "",
            "website": e.get("website") or item.get("url") or "",
            "description": e.get("description") or "",
            "sector": e.get("sector") or "",
            "founded": e.get("founded_year") or 0,
            "team": team_int(e.get("team_size")),
            "funding": e.get("funding_stage") or "未披露",
            "phone": norm_phone(e.get("phone")),
            "email": norm_email(e.get("email")),
            "address": e.get("address") or "",
            "confidence": e.get("confidence") or 0.7,
            "verifiedAt": "2026-11-06",
            "source": "官网公开：" + (e.get("website") or item.get("url") or ""),
        }

with (ROOT / "data" / "pipeline" / "batch100-review.csv").open("w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["company", "url", "name", "city", "district", "founded", "phone", "email", "score", "status", "note"])
    w.writeheader()
    w.writerows(review)

js = "/* 100 家批量抽取中自动评分 >=6 的记录；写回时仍按名称匹配项目库 */\nwindow.BATCH100_VERIFIED = " + json.dumps(verified, ensure_ascii=False, indent=2) + ";\n" + \
     "window.PILOT_VERIFIED = Object.assign(window.PILOT_VERIFIED || {}, window.BATCH100_VERIFIED);\n"
(ROOT / "assets" / "batch100-verified.js").write_text(js, encoding="utf-8")
print("verified", len(verified), "pending", 100 - len(verified))
print("score>=6", sum(1 for x in review if x["score"] >= 6), "badcity", sum(1 for x in review if x["note"] == "城市不符"))
