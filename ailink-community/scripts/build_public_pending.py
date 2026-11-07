"""把公开名单批次中评分 >=7 的记录加入待核验库（不是已核验）。"""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
prefix = "hz-public30"
rows = json.loads((ROOT / "data" / "pipeline" / f"{prefix}.json").read_text(encoding="utf-8"))
names = {x["name"]: x for x in json.loads((ROOT / "data" / "pipeline" / "hz-public30-names.json").read_text(encoding="utf-8"))}
BAD = ("北京", "上海", "广州", "成都", "重庆", "苏州", "南京", "青岛", "东莞", "惠州", "衢州", "合肥", "武汉", "西安")
PALETTE = [("#0F5B45", "#DFF3E8"), ("#7A4B12", "#F4E4C9"), ("#2F4858", "#DDE7EC"), ("#5B3A6E", "#EADFF2"), ("#8A3B2E", "#F6DFD8")]


def team_int(v):
    if not v:
        return 0
    m = re.search(r"(\d[\d,]*)\s*(?:余)?\s*人", str(v))
    return int(m.group(1).replace(",", "")) if m else 0


def phone(v):
    return str(v).replace("+86-", "").replace("+86 ", "").replace("+86400", "400").strip() if v else ""


def email(v):
    return str(v).split(",")[0].strip() if v else ""


records = []
review = []
for item in rows:
    e = item.get("extracted") or {}
    key = item["company"]
    name = e.get("name") or key
    city = e.get("city") or ""
    district = e.get("district") or names.get(key, {}).get("district", "") or "杭州"
    bad = any(b in city for b in BAD)
    city_ok = (not city) or ("杭州" in city)
    name_ok = key.lower() in name.lower() or key[:2] in name
    score = 0
    score += 2 if name else 0
    score += 2 if (e.get("website") or item.get("url")) else 0
    score += 1 if len(e.get("description") or "") >= 30 else 0
    score += 1 if e.get("sector") else 0
    score += 1 if e.get("founded_year") else 0
    score += 1 if (e.get("phone") or e.get("email")) else 0
    score += 1 if e.get("address") else 0
    score += 1 if (city_ok or district) else 0
    if bad or not city_ok or not name_ok:
        score = min(score, 4)
    ok = score >= 7
    review.append({"company": key, "url": item.get("url") or "", "name": name, "city": city, "district": district,
                   "score": score, "status": "入待核验库" if ok else "暂不入库", "note": "城市不符" if bad else ("字段不足" if not ok else "")})
    if not ok:
        continue
    pal = PALETTE[len(records) % len(PALETTE)]
    records.append({
        "id": f"p-hzpub-{len(records)+1:03d}",
        "name": name,
        "city": "杭州",
        "district": district,
        "province": "浙江",
        "region": "华东",
        "sector": e.get("sector") or "AI 原生应用与数字内容",
        "stage": "待核验",
        "status": "待核验",
        "statusGroup": "pending",
        "listed": False,
        "ticker": "—",
        "founded": e.get("founded_year") or 0,
        "team": team_int(e.get("team_size")),
        "funding": e.get("funding_stage") or "未披露",
        "desc": e.get("description") or (name + "：公开名单候选，待补充业务描述。"),
        "tagline": "公开名单 · 待核验",
        "highlights": [e.get("sector") or "AI 原生应用与数字内容", "公开名单 + 官网", "待核验"],
        "metrics": [],
        "milestones": [],
        "atlasSources": [{"label": names.get(key, {}).get("source", "公开名单"), "url": names.get(key, {}).get("sourceUrl", "")}],
        "keywords": "杭州 公开名单 待核验 " + (e.get("sector") or ""),
        "contact": None,
        "contactPending": True,
        "pending": True,
        "batchId": "HZ-PUB30",
        "logo": name[:1],
        "brand": pal[0],
        "tint": pal[1],
        "verified": False,
        "confidence": min(90, score * 10),
        "updated": "2026-11-06",
        "source": "公开名单 + 官网公开（待核验）",
        "website": e.get("website") or item.get("url") or "",
        "phone": phone(e.get("phone")),
        "email": email(e.get("email")),
        "address": e.get("address") or "",
        "dataset": "hz-public30",
        "type": "project"
    })

with (ROOT / "data" / "pipeline" / "hz-public30-review.csv").open("w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["company", "url", "name", "city", "district", "score", "status", "note"])
    w.writeheader(); w.writerows(review)

js = "/* 公开名单批次：评分 >=7 的记录，仅进入待核验库 */\nwindow.HZ_PUBLIC30_PENDING = " + json.dumps(records, ensure_ascii=False, indent=2) + ";\n"
(ROOT / "assets" / "hz-public30-pending.js").write_text(js, encoding="utf-8")
print("pending import", len(records), "review", len(review))
