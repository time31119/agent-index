"""为批量结果评分并生成 verified overlay。"""
import argparse
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AP = argparse.ArgumentParser()
AP.add_argument("--prefix", required=True)
AP.add_argument("--city", required=True)
AP.add_argument("--districts", required=True, help="逗号分隔")
AP.add_argument("--bad", default="北京,上海,广州,成都,重庆,杭州,苏州,南京,青岛,东莞,惠州,衢州,合肥,武汉,西安")
AP.add_argument("--input", default="")
A = AP.parse_args()

rows = json.loads((ROOT / "data" / "pipeline" / f"{A.prefix}.json").read_text(encoding="utf-8"))
expected = {}
if A.input:
    for x in json.loads((ROOT / A.input).read_text(encoding="utf-8")):
        expected[x["name"]] = x
districts = [x.strip() for x in A.districts.split(",") if x.strip()]
bad_cities = [x.strip() for x in A.bad.split(",") if x.strip()]


def team_int(v):
    if not v:
        return 0
    m = re.search(r"(\d[\d,]*)\s*(?:余)?\s*人", str(v))
    if m:
        return int(m.group(1).replace(",", ""))
    m = re.search(r"over\s+([\d,]+)\s+people", str(v), re.I)
    return int(m.group(1).replace(",", "")) if m else 0


def norm_phone(v):
    return str(v).replace("+86-", "").replace("+86 ", "").replace("+86400", "400").strip() if v else ""


def norm_email(v):
    return str(v).split(",")[0].strip() if v else ""


verified = {}
review = []
for item in rows:
    e = item.get("extracted") or {}
    key = item["company"]
    name = e.get("name") or ""
    city = e.get("city") or ""
    district = e.get("district") or expected.get(key, {}).get("district", "")
    bad_city = any(b in city for b in bad_cities)
    city_ok = (A.city in city) or (A.city == "深圳" and "Shenzhen" in city) or (not city)
    name_ok = (key.lower() in name.lower()) or (name and key[:2] in name)
    score = 0
    score += 2 if name else 0
    score += 2 if (e.get("website") or item.get("url")) else 0
    score += 1 if len(e.get("description") or "") >= 30 else 0
    score += 1 if e.get("sector") else 0
    score += 1 if e.get("founded_year") else 0
    score += 1 if (e.get("phone") or e.get("email")) else 0
    score += 1 if e.get("address") else 0
    score += 1 if (city_ok or district) else 0
    if bad_city or not city_ok or not name_ok:
        score = min(score, 4)
    ok = score >= 7
    note = ""
    if bad_city:
        note = "城市不符"
    elif not city_ok:
        note = "城市缺失/不符"
    elif not name_ok:
        note = "主体名不匹配"
    elif not ok:
        note = "字段不足"
    review.append({
        "company": key, "url": item.get("url") or "", "name": name, "city": city,
        "district": district, "founded": e.get("founded_year") or "",
        "phone": norm_phone(e.get("phone")), "email": norm_email(e.get("email")),
        "score": score, "status": "已核验" if ok else "待补", "note": note,
    })
    if ok:
        verified[key] = {
            "name": name or key,
            "city": A.city,
            "district": district,
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

with (ROOT / "data" / "pipeline" / f"{A.prefix}-review.csv").open("w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["company", "url", "name", "city", "district", "founded", "phone", "email", "score", "status", "note"])
    w.writeheader()
    w.writerows(review)

js = ("/* " + A.city + " 批量抽取评分 >=7 的记录 */\n"
      "window.BULK_VERIFIED = Object.assign(window.BULK_VERIFIED || {}, " + json.dumps(verified, ensure_ascii=False, indent=2) + ");\n"
      "window.PILOT_VERIFIED = Object.assign(window.PILOT_VERIFIED || {}, window.BULK_VERIFIED);\n")
(ROOT / "assets" / f"{A.prefix}-verified.js").write_text(js, encoding="utf-8")
print(A.prefix, "verified", len(verified), "pending", len(rows) - len(verified))
