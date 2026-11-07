"""把已人工确认的 28 家企业生成前端可加载的 verified 覆盖数据。"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ten = json.loads((ROOT / "data" / "pipeline" / "ten-hangzhou.json").read_text(encoding="utf-8"))
twenty = json.loads((ROOT / "data" / "pipeline" / "batch20.json").read_text(encoding="utf-8"))
scores = {
    "聚光科技": 10, "丁香园": 7, "魔点科技": 10, "浙江讯飞": 7, "顺网科技": 9,
    "电魂网络": 6, "宏杉科技": 8, "迪普科技": 8, "连连数字": 10, "博联智能": 8,
    "启明医疗": 10, "微泰医疗": 9, "贝达药业": 10, "老板电器": 8, "春风动力": 8,
    "正元智慧": 10, "蓝芯科技": 10, "微策生物": 7, "迪安诊断": 6, "士兰微": 8,
    "国芯科技": 9, "广立微": 7, "税友软件": 10, "宏华数科": 9, "远方信息": 7,
    "大立科技": 10, "乒乓智能": 8, "安恒信息": 10, "鸿泉物联": 9, "明度智云": 10,
}


def team_int(value):
    if not value:
        return 0
    m = re.search(r"(\d[\d,]*)\s*(?:余)?\s*人", str(value))
    if m:
        return int(m.group(1).replace(",", ""))
    m = re.search(r"over\s+([\d,]+)\s+people", str(value), re.I)
    if m:
        return int(m.group(1).replace(",", ""))
    return 0


def phone_norm(value):
    if not value:
        return ""
    v = str(value).strip()
    v = v.replace("+86-", "").replace("+86 ", "")
    v = v.replace("+86400", "400")
    return v


def email_norm(value):
    if not value:
        return ""
    return str(value).split(",")[0].strip()


items = {}
for row in ten + twenty:
    e = row.get("extracted") or {}
    name = e.get("name") or row["company"]
    # 用项目库里的标准名做 key
    key_name = row["company"]
    if scores.get(key_name, 0) < 7:
        continue
    items[key_name] = {
        "name": name,
        "city": e.get("city") or "杭州",
        "district": e.get("district") or "",
        "website": e.get("website") or row["url"],
        "description": e.get("description") or "",
        "sector": e.get("sector") or "",
        "founded": e.get("founded_year") or 0,
        "team": team_int(e.get("team_size")),
        "funding": e.get("funding_stage") or "未披露",
        "phone": phone_norm(e.get("phone")),
        "email": email_norm(e.get("email")),
        "address": e.get("address") or "",
        "confidence": e.get("confidence") or 0.7,
        "verifiedAt": "2026-11-06",
        "source": (e.get("_source") or ("官网公开：" + row["url"])),
    }

out = "/* 30 家试点中人工评分 >= 7 的 28 家；仅覆盖项目库同名单条记录 */\nwindow.PILOT_VERIFIED = " + json.dumps(items, ensure_ascii=False, indent=2) + ";\n"
(ROOT / "assets" / "pilot-verified.js").write_text(out, encoding="utf-8")
print("count", len(items), "keys", list(items)[:5])
