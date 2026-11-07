"""第二批 20 家杭州企业抽取。复用 run_ten 的抓取/抽取函数。"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from run_ten import call_deepseek, collect_pages, read_key  # noqa: E402

COMPANIES = [
    ("启明医疗", "https://www.venusmedtech.com/"),
    ("微泰医疗", "https://www.medtrum.com/"),
    ("贝达药业", "https://www.bettapharma.com/"),
    ("老板电器", "https://www.robam.com/"),
    ("春风动力", "https://www.cfmoto.com/"),
    ("正元智慧", "https://www.hzzhengyuan.com/"),
    ("蓝芯科技", "https://www.lanxincn.com/"),
    ("微策生物", "https://www.vivachek.com/"),
    ("迪安诊断", "https://www.dazd.cn/"),
    ("士兰微", "https://www.silan.com.cn/"),
    ("国芯科技", "https://www.china-core.com/"),
    ("广立微", "https://www.semitronix.com/"),
    ("税友软件", "https://www.servyou.com.cn/"),
    ("宏华数科", "https://www.atexco.com/"),
    ("远方信息", "https://www.everfine.cn/"),
    ("大立科技", "https://www.dali-tech.com/"),
    ("乒乓智能", "https://www.pingpongx.com/"),
    ("数库科技", "https://www.chinascope.com/"),
    ("恒生聚源", "https://www.gildata.com/"),
    ("明度智云", "https://www.mingdutech.com/"),
]

OUT = ROOT / "data" / "pipeline" / "batch20.json"


def main():
    key = read_key()
    results = []
    for company, url in COMPANIES:
        print("RUN", company, flush=True)
        item = {"company": company, "url": url, "pages": [], "extracted": None, "error": None}
        try:
            pages = collect_pages(company, url)
            item["pages"] = [{"url": p["url"], "title": p.get("title", ""), "chars": len(p.get("text", "")), "error": p.get("error")} for p in pages]
            item["extracted"] = call_deepseek(key, company, pages)
            print(json.dumps(item["extracted"], ensure_ascii=False)[:600], flush=True)
        except Exception as exc:
            item["error"] = str(exc)[:300]
            print("ERR", company, item["error"], flush=True)
        results.append(item)
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print("WROTE", OUT)


if __name__ == "__main__":
    main()
