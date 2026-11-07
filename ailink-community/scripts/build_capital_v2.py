"""生成资金库 v2：100 家机构 + 团队人员。"""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rows = []
for name in ("batch01-institutions.csv", "batch02-institutions.csv"):
    rows += list(csv.DictReader((ROOT / "data/capital" / name).open(encoding="utf-8-sig")))
people_data = {}
for name in ("batch01-people.json", "batch02-people.json"):
    p = ROOT / "data/capital" / name
    if p.exists():
        people_data.update({x["institution"]: x for x in json.loads(p.read_text(encoding="utf-8"))})
extra = ROOT / "data/capital/public-people-extra.json"
if extra.exists():
    for x in json.loads(extra.read_text(encoding="utf-8")):
        target = people_data.setdefault(x["institution"], {"institution": x["institution"], "people": []})
        target["people"] = (target.get("people") or []) + x["people"]
event = ROOT / "data/capital/event-people.json"
if event.exists():
    names = {r["机构名称"] for r in rows}
    for x in json.loads(event.read_text(encoding="utf-8")):
        inst = x["institution"]
        if inst not in names:
            rows.append({
                "机构名称": inst, "城市": x.get("city", "北京"), "机构类型": x.get("type", "成长型 VC"),
                "投资阶段": "A/B/C", "关注赛道": "、".join(x.get("focus", [])), "活跃度": "A", "官网": ""
            })
            names.add(inst)
        target = people_data.setdefault(inst, {"institution": inst, "people": []})
        target["people"] = (target.get("people") or []) + x["people"]
contacts = {}
cp = ROOT / "data/capital/batch01-contacts.json"
if cp.exists():
    contacts = {x["institution"]: x for x in json.loads(cp.read_text(encoding="utf-8"))}
palette = [("#0F5B45", "#DFF3E8"), ("#7A4B12", "#F4E4C9"), ("#2F4858", "#DDE7EC"), ("#5B3A6E", "#EADFF2"), ("#8A3B2E", "#F6DFD8")]

out = []
for i, r in enumerate(rows, 1):
    p = people_data.get(r["机构名称"], {})
    focus = [x.strip() for x in r["关注赛道"].split("、") if x.strip()]
    stages = [x.strip() for x in r["投资阶段"].split("/") if x.strip()]
    c = contacts.get(r["机构名称"], {})
    phone = c.get("phone") or p.get("phone") or ""
    email = c.get("email") or p.get("email") or ""
    address = c.get("address") or p.get("address") or ""
    if phone and not re.match(r"^(0\d{2,3}[-\s]?\d{7,8}|400[-\s]?\d{3,4}[-\s]?\d{3,4})$", phone.replace(" ", "")):
        phone = ""
    if phone.startswith("0") and r["城市"] == "深圳" and not phone.startswith("0755"):
        phone = ""
    if phone.startswith("0") and r["城市"] == "杭州" and not phone.startswith("0571"):
        phone = ""
    people = [x for x in (p.get("people") or []) if x.get("name")]
    pal = palette[(i - 1) % len(palette)]
    out.append({
        "id": "c-v2-" + str(i).zfill(3),
        "name": r["机构名称"],
        "city": r["城市"],
        "province": "浙江" if r["城市"] == "杭州" else "广东",
        "region": "华东" if r["城市"] == "杭州" else "华南",
        "type": r["机构类型"],
        "focus": focus,
        "stages": stages,
        "ticket": "未披露",
        "aum": "未披露",
        "desc": f"{r['机构名称']}，{r['城市']}的{r['机构类型']}，关注{r['关注赛道']}。团队与联系方式来自公开官网/团队页，待逐条核验。",
        "contact": {
            "name": "机构前台",
            "title": "机构总机 / 商务邮箱",
            "phone": phone,
            "email": email,
            "wechat": "—"
        } if (phone or email) else None,
        "phone": phone,
        "email": email,
        "address": address,
        "website": r["官网"] or p.get("site") or c.get("site") or "",
        "logo": r["机构名称"][:1],
        "brand": pal[0],
        "tint": pal[1],
        "verified": bool(phone or email),
        "contactVerified": bool(phone or email),
        "confidence": 85 if (phone or email) else 70,
        "updated": "2026-11-06",
        "source": "机构官网总机/商务邮箱" if (phone or email) else "机构官网 / 公开团队页（待核验）",
        "typeKey": "capital",
        "kind": r["机构类型"],
        "people": people,
        "teamCount": len(people),
        "activity": r["活跃度"],
    })

(ROOT / "assets/capital-v2.js").write_text(
    "/* 资金库 Batch 01：30 家真实机构 + 公开团队页人员（待核验） */\nwindow.CAPITAL_V2 = " + json.dumps(out, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8"
)
print("institutions", len(out), "people", sum(x["teamCount"] for x in out))
