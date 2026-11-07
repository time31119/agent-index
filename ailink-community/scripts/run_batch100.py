"""100 家杭州企业批量抽取（并发 6）。"""
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import run_ten  # noqa: E402

SITES = json.loads((ROOT / "data" / "pipeline" / "batch100-sites.json").read_text(encoding="utf-8"))
BAD = ("it168.com", "pedaily.cn", "jyb.cjlu.edu.cn", "11467.com", "gkzhan.com", "woyaoce.cn", "qgrz.org.cn", "gxt.hebei.gov.cn", "china.cn")
key = run_ten.read_key()
OUT = ROOT / "data" / "pipeline" / "batch100.json"


def work(row):
    company = row["name"]
    url = row.get("site")
    item = {"company": company, "url": url, "pages": [], "extracted": None, "error": None}
    if not url or any(b in url for b in BAD):
        item["error"] = "无可用官网/命中聚合站"
        return item
    try:
        pages = run_ten.collect_pages(company, url)
        item["pages"] = [{"url": p["url"], "title": p.get("title", ""), "chars": len(p.get("text", "")), "error": p.get("error")} for p in pages]
        item["extracted"] = run_ten.call_deepseek(key, company, pages)
    except Exception as exc:
        item["error"] = str(exc)[:300]
    return item


def main():
    results = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(work, row): row for row in SITES}
        for i, fut in enumerate(as_completed(futures), 1):
            item = fut.result()
            results.append(item)
            e = item.get("extracted") or {}
            print(f"{i:03d}/100 {item['company']} -> {e.get('name') or item.get('error','')[:60]}", flush=True)
    results.sort(key=lambda x: [r["name"] for r in SITES].index(x["company"]))
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    ok = sum(1 for x in results if x.get("extracted"))
    print("WROTE", OUT, "ok", ok)


if __name__ == "__main__":
    main()
