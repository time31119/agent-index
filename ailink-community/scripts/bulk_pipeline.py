"""通用批量：360 官网发现 + DeepSeek 抽取。

用法：
    python scripts/bulk_pipeline.py --input data/pipeline/bulk-sz-names.json --prefix sz100
"""
import argparse
import html
import json
import re
import subprocess
import sys
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import run_ten  # noqa: E402

BLOCK = (
    "hao.360.com", "bing.com", "tv.360kan.com", "so.com", "360.cn", "baidu.com", "zhihu.com",
    "baike.baidu.com", "qcc.com", "tianyancha.com", "aiqicha", "qizhidao", "10jqka.com.cn",
    "weixin.qq.com", "mp.weixin.qq.com", "sohu.com", "36kr.com", "iyiou.com", "huxiu.com",
    "thepaper.cn", "baijiahao.baidu.com", "weibo.com", "bilibili.com", "douyin.com", "csdn.net",
    "docin.com", "book118.com", "zhaopin.com", "liepin.com", "zhipin.com", "1688.com",
    "taobao.com", "jd.com", "gongshang", "shuidi.cn", "7icp.com", "nthzp.cn", "jialeijob.com",
    "woshipm.com", "map.360.cn", "job", "xiaohongshu.com", "qq.com", "ifeng.com", "163.com",
    "it168.com", "pedaily.cn", "jyb.cjlu.edu.cn", "11467.com", "gkzhan.com", "woyaoce.cn",
    "qgrz.org.cn", "gxt.hebei.gov.cn", "china.cn",
)


def search(name):
    u = "https://www.so.com/s?q=" + urllib.parse.quote(name + " 官网")
    p = subprocess.run(["curl.exe", "-L", "--max-time", "20", "-A", "Mozilla/5.0", u], capture_output=True)
    h = p.stdout.decode("utf-8", "ignore")
    urls = [html.unescape(x) for x in re.findall(r'data-mdurl="([^"]+)"', h)]
    out = []
    for x in urls:
        host = urllib.parse.urlparse(x).netloc.lower()
        if not x.startswith("http") or any(b in host for b in BLOCK):
            continue
        if x not in out:
            out.append(x)
    return out[:5]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--prefix", required=True)
    args = ap.parse_args()
    rows = json.loads((ROOT / args.input).read_text(encoding="utf-8"))
    sites = []
    for i, row in enumerate(rows, 1):
        links = []
        try:
            links = search(row["name"])
        except Exception as exc:
            print("SEARCH_ERR", row["name"], str(exc)[:80], flush=True)
        sites.append({"name": row["name"], "district": row.get("district", ""), "sector": row.get("sector", ""), "site": links[0] if links else None, "candidates": links})
        print(f"SITE {i:03d}/{len(rows)} {row['name']} -> {links[0] if links else 'NONE'}", flush=True)
        time.sleep(0.25)
    (ROOT / "data" / "pipeline" / f"{args.prefix}-sites.json").write_text(json.dumps(sites, ensure_ascii=False, indent=2), encoding="utf-8")

    key = run_ten.read_key()

    def work(row):
        item = {"company": row["name"], "url": row.get("site"), "pages": [], "extracted": None, "error": None}
        if not row.get("site"):
            item["error"] = "无官网"
            return item
        try:
            pages = run_ten.collect_pages(row["name"], row["site"])
            item["pages"] = [{"url": p["url"], "title": p.get("title", ""), "chars": len(p.get("text", "")), "error": p.get("error")} for p in pages]
            item["extracted"] = run_ten.call_deepseek(key, row["name"], pages)
        except Exception as exc:
            item["error"] = str(exc)[:300]
        return item

    results = []
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {pool.submit(work, row): row for row in sites}
        for i, fut in enumerate(as_completed(futures), 1):
            item = fut.result()
            results.append(item)
            e = item.get("extracted") or {}
            print(f"EXTRACT {i:03d}/{len(sites)} {item['company']} -> {e.get('name') or str(item.get('error') or '')[:60]}", flush=True)
    order = [x["name"] for x in sites]
    results.sort(key=lambda x: order.index(x["company"]))
    (ROOT / "data" / "pipeline" / f"{args.prefix}.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print("WROTE", args.prefix, "ok", sum(1 for x in results if x.get("extracted")))


if __name__ == "__main__":
    main()
