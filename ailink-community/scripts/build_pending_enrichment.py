"""把已抓取但未达核验分的公开官网字段，补到待核验记录上（不改变 pending 状态）。"""
import json
import re
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOCK = (
    "alibaba.com", "ai-bot.cn", "bidizhaobiao.com", "zhaobiao.cn", "51miit.com", "qixin.com",
    "shuididp.cn", "guba.eastmoney.com", "zol.com.cn", "sina.com.cn", "china.com", "gkong.com",
    "chinaz.com", "cn.china.cn", "leshanvc.com", "dayinmao.com", "qichamao.com", "b2b168.com",
    "saasruanjian.com", "dostor.com", "ppsj.com.cn", "epaper.cs.com.cn", "bidchance.com",
    "zhaoshang.net", "ecnu.edu.cn", "xidian.edu.cn", "bistu.edu.cn", "baike", "zhihu",
    "eeworld.com.cn", "zbytb.com",
)
SOURCES = [
    ("batch100.json", "杭州"),
    ("sz100.json", "深圳"),
    ("rest-hz.json", "杭州"),
    ("rest-sz.json", "深圳"),
    ("hzrest68.json", "杭州"),
    ("batch20.json", "杭州"),
    ("ten-hangzhou.json", "杭州"),
]
merged = {}
for filename, city in SOURCES:
    path = ROOT / "data" / "pipeline" / filename
    if not path.exists():
        continue
    for row in json.loads(path.read_text(encoding="utf-8")):
        e = row.get("extracted") or {}
        key = row.get("company")
        if not key or not e:
            continue
        got_city = e.get("city") or ""
        if got_city and city not in got_city:
            continue
        website = e.get("website") or row.get("url") or ""
        host = urllib.parse.urlparse(website).netloc.lower()
        if any(b in host for b in BLOCK):
            continue
        name = e.get("name") or ""
        if name and key.lower() not in name.lower() and key[:2] not in name:
            continue
        item = merged.setdefault(key, {"city": city})
        for src, dst in [
            ("website", "website"), ("description", "description"), ("sector", "sector"),
            ("founded_year", "founded"), ("phone", "phone"), ("email", "email"),
            ("address", "address"), ("confidence", "confidence"),
        ]:
            if e.get(src) and not item.get(dst):
                item[dst] = e[src]
        if row.get("url") and not item.get("website"):
            item["website"] = row["url"]
        item["source"] = "官网公开（待核验）：" + (e.get("website") or row.get("url") or "")

js = "/* 待核验记录的公开官网字段补充；不改变 pending / verified 状态 */\nwindow.PENDING_ENRICHMENT = " + json.dumps(merged, ensure_ascii=False, indent=2) + ";\n"
(ROOT / "assets" / "pending-enrichment.js").write_text(js, encoding="utf-8")
print("records", len(merged))
