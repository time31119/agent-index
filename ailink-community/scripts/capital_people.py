"""资金库 Batch 01：抓机构团队页，抽取合伙人/投资总监/CVC 负责人。"""
import csv
import html
import json
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import run_ten  # noqa: E402

import os
SRC = ROOT / os.environ.get("CAP_SRC", "data/capital/batch01-institutions.csv")
OUT = ROOT / os.environ.get("CAP_OUT", "data/capital/batch01-people.json")
BLOCK = ("so.com", "360.cn", "bing.com", "baidu.com", "zhihu.com", "qcc.com", "tianyancha.com",
         "aiqicha", "qizhidao", "10jqka.com.cn", "weixin.qq.com", "sohu.com", "36kr.com",
         "iyiou.com", "huxiu.com", "thepaper.cn", "baijiahao", "weibo.com", "bilibili.com",
         "csdn.net", "docin.com", "book118.com", "zhaopin.com", "liepin.com", "zhipin.com",
         "1688.com", "taobao.com", "jd.com", "gongshang", "shuidi.cn", "7icp.com", "nthzp.cn",
         "jialeijob.com", "woshipm.com", "eastmoney.com", "zbytb.com", "qixin.com")


def search_site(name):
    u = "https://www.so.com/s?q=" + urllib.parse.quote(name + " 团队 合伙人")
    p = subprocess.run(["curl.exe", "-L", "--max-time", "20", "-A", "Mozilla/5.0", u], capture_output=True)
    h = p.stdout.decode("utf-8", "ignore")
    urls = [html.unescape(x) for x in re.findall(r'data-mdurl="([^"]+)"', h)]
    for x in urls:
        host = urllib.parse.urlparse(x).netloc.lower()
        if x.startswith("http") and not any(b in host for b in BLOCK):
            return x
    return ""


def relevant_links(base, raw):
    links = []
    for href, label in re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', raw, re.I | re.S):
        text = run_ten.clean_text(label)[:60]
        probe = (href + " " + text).lower()
        if any(k in probe for k in ["team", "partner", "about", "contact", "团队", "合伙人", "投资团队", "关于", "联系"]):
            full = urllib.parse.urljoin(base, html.unescape(href))
            if full.startswith("http") and urllib.parse.urlparse(full).netloc == urllib.parse.urlparse(base).netloc and full not in links:
                links.append(full)
    return links[:4]


def extract(key, inst):
    name = inst["机构名称"]
    site = inst.get("官网") or search_site(name)
    if not site:
        return {"institution": name, "site": "", "error": "无官网", "people": []}
    context = []
    try:
        final, raw = run_ten.fetch(site)
        context.append(f"URL: {final}\nTEXT: {run_ten.clean_text(raw)[:9000]}")
        for link in relevant_links(final, raw):
            try:
                u, r = run_ten.fetch(link)
                context.append(f"URL: {u}\nTEXT: {run_ten.clean_text(r)[:8000]}")
            except Exception:
                pass
    except Exception as exc:
        return {"institution": name, "site": site, "error": str(exc)[:200], "people": []}

    prompt = (
        "你是投资机构数据抽取器。只从官网文本抽取，不得猜测。没有就 null/[]。只输出 JSON。\n"
        "schema: {\"institution\":\"\",\"type\":\"\",\"city\":\"\",\"website\":\"\",\"phone\":null,\"email\":null,"
        "\"address\":null,\"focus\":[],\"stages\":[],\"people\":[{\"name\":\"\",\"title\":\"\",\"focus\":\"\",\"email\":null,\"phone\":null}],\"confidence\":0}\n"
        "重点抽取合伙人、管理合伙人、投资总监、VP、董事、CVC 负责人；不要分析师/实习生。\n"
        f"机构名：{name}\n\n" + "\n\n---\n\n".join(context)
    )
    payload = {"model": "deepseek-chat", "messages": [
        {"role": "system", "content": "只输出合法 JSON，不要解释。"},
        {"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"}, "stream": False, "temperature": 0.1}
    req = urllib.request.Request(
        "https://api.deepseek.com/chat/completions",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Authorization": "Bearer " + run_ten.read_key(), "Content-Type": "application/json; charset=utf-8"})
    last = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            result = json.loads(data["choices"][0]["message"]["content"])
            result["institution"] = name
            result["site"] = site
            return result
        except Exception as exc:
            last = exc
            time.sleep(1 + attempt)
    return {"institution": name, "site": site, "error": str(last)[:200], "people": []}


def main():
    with SRC.open(encoding="utf-8-sig") as f:
        institutions = list(csv.DictReader(f))
    results = []
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {pool.submit(extract, i, row): row for i, row in enumerate(institutions, 1)}
        for i, fut in enumerate(as_completed(futures), 1):
            row = fut.result()
            results.append(row)
            print(f"{i:02d}/{len(institutions)} {row['institution']} -> {len(row.get('people') or [])} people", flush=True)
    results.sort(key=lambda x: [x["机构名称"] for x in institutions].index(x["institution"]))
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print("WROTE", OUT, "people", sum(len(x.get("people") or []) for x in results))


if __name__ == "__main__":
    main()
