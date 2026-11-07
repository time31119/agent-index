"""用已确认官网重跑深圳 9 家重点企业。"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import run_ten  # noqa: E402

COMPANIES = [
    ("赢时胜", "http://ysstech.com.cn/", "福田区"),
    ("兆威机电", "https://www.zwgear.com/", "宝安区"),
    ("鹏鼎控股", "http://www.avaryholding.com/", "宝安区"),
    ("领益智造", "http://www.lingyiitech.com/index.html", "龙岗区"),
    ("深南电路", "https://www.scc.com.cn/", "龙岗区"),
    ("贝仕达克", "http://www.szbtk.com/", "龙岗区"),
    ("新产业生物", "https://www.snibe.com/", "坪山区"),
    ("基本半导体", "https://www.basicsemi.com/", "坪山区"),
    ("昂纳科技", "http://www.angnakeji.com/", "坪山区"),
]
key = run_ten.read_key()
out = []
for name, url, district in COMPANIES:
    print("RUN", name, url, flush=True)
    item = {"company": name, "url": url, "district": district, "pages": [], "extracted": None, "error": None}
    try:
        pages = run_ten.collect_pages(name, url)
        item["pages"] = [{"url": p["url"], "title": p.get("title", ""), "chars": len(p.get("text", "")), "error": p.get("error")} for p in pages]
        item["extracted"] = run_ten.call_deepseek(key, name, pages)
        print(json.dumps(item["extracted"], ensure_ascii=False)[:500], flush=True)
    except Exception as exc:
        item["error"] = str(exc)[:300]
        print("ERR", name, item["error"], flush=True)
    out.append(item)
(ROOT / "data" / "pipeline" / "sz-key.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
(ROOT / "data" / "pipeline" / "sz-key-names.json").write_text(json.dumps([{"name": a, "district": c} for a, b, c in COMPANIES], ensure_ascii=False, indent=2), encoding="utf-8")
print("WROTE", len(out))
