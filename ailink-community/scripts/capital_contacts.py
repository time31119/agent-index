"""资金库：抓 50 家机构官网总机/商务邮箱。"""
import csv
import html
import json
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import run_ten  # noqa: E402

ROWS = []
for name in ("batch01-institutions.csv", "batch02-institutions.csv"):
    ROWS += list(csv.DictReader((ROOT / "data/capital" / name).open(encoding="utf-8-sig")))
ROWS = [r for r in ROWS if r["城市"] in ("杭州", "深圳")][:50]
OUT = ROOT / "data" / "capital" / "batch01-contacts.json"
BLOCK = ("so.com", "360.cn", "bing.com", "baidu.com", "zhihu.com", "qcc.com", "tianyancha.com",
         "aiqicha", "qizhidao", "10jqka.com.cn", "weixin.qq.com", "sohu.com", "36kr.com",
         "iyiou.com", "huxiu.com", "thepaper.cn", "baijiahao", "weibo.com", "bilibili.com",
         "csdn.net", "docin.com", "book118.com", "zhaopin.com", "liepin.com", "zhipin.com",
         "1688.com", "taobao.com", "jd.com", "gongshang", "shuidi.cn", "7icp.com", "nthzp.cn",
         "jialeijob.com", "woshipm.com", "eastmoney.com", "zbytb.com", "qixin.com")


def site_of(name):
    u = "https://www.so.com/s?q=" + urllib.parse.quote(name + " 官网")
    h = subprocess.run(["curl.exe", "-L", "--max-time", "20", "-A", "Mozilla/5.0", u], capture_output=True).stdout.decode("utf-8", "ignore")
    for x in re.findall(r'data-mdurl="([^"]+)"', h):
        x = html.unescape(x)
        host = urllib.parse.urlparse(x).netloc.lower()
        if x.startswith("http") and not any(b in host for b in BLOCK):
            return x
    return ""


def work(row):
    name = row["机构名称"]
    site = row.get("官网") or site_of(name)
    item = {"institution": name, "site": site, "phone": "", "email": "", "address": "", "error": ""}
    if not site:
        item["error"] = "无官网"
        return item
    pages = []
    try:
        final, raw = run_ten.fetch(site)
        pages.append(run_ten.clean_text(raw)[:12000])
        for link in run_ten.contact_links(final, raw)[:3]:
            try:
                _, r = run_ten.fetch(link)
                pages.append(run_ten.clean_text(r)[:10000])
            except Exception:
                pass
    except Exception as exc:
        item["error"] = str(exc)[:160]
        return item
    text = "\n\n".join(pages)
    emails = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    phones = re.findall(r"(?:0\d{2,3}[-\s]?\d{7,8}|400[-\s]?\d{3,4}[-\s]?\d{3,4}|1[3-9]\d{9})", text)
    item["email"] = emails[0] if emails else ""
    item["phone"] = phones[0] if phones else ""
    m = re.search(r"(?:地址|Address)[：:]\s*([^\n]{6,80})", text)
    item["address"] = m.group(1).strip() if m else ""
    return item


def main():
    out = []
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = [pool.submit(work, r) for r in ROWS]
        for i, fut in enumerate(as_completed(futures), 1):
            x = fut.result()
            out.append(x)
            print(f"{i:02d}/50 {x['institution']} phone={x['phone']} email={x['email']}", flush=True)
    out.sort(key=lambda x: [r["机构名称"] for r in ROWS].index(x["institution"]))
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print("WROTE", OUT, "with contact", sum(1 for x in out if x["phone"] or x["email"]))


if __name__ == "__main__":
    main()
