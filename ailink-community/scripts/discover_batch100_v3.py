"""用 360 搜索 data-mdurl 为 100 家杭州企业发现官网。"""
import html
import json
import re
import subprocess
import time
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOCK = (
    "hao.360.com", "bing.com", "tv.360kan.com", "so.com", "360.cn", "baidu.com", "zhihu.com",
    "baike.baidu.com", "qcc.com", "tianyancha.com", "aiqicha", "qizhidao", "10jqka.com.cn",
    "weixin.qq.com", "mp.weixin.qq.com", "sohu.com", "36kr.com", "iyiou.com", "huxiu.com",
    "thepaper.cn", "baijiahao.baidu.com", "weibo.com", "bilibili.com", "douyin.com", "csdn.net",
    "docin.com", "book118.com", "zhaopin.com", "liepin.com", "zhipin.com", "1688.com",
    "taobao.com", "jd.com", "gongshang", "shuidi.cn", "7icp.com", "nthzp.cn", "jialeijob.com",
    "woshipm.com", "map.360.cn", "job", "xiaohongshu.com", "qq.com", "ifeng.com", "163.com",
)


def search(name):
    u = "https://www.so.com/s?q=" + urllib.parse.quote(name + " 官网")
    p = subprocess.run(["curl.exe", "-L", "--max-time", "20", "-A", "Mozilla/5.0", u], capture_output=True)
    h = p.stdout.decode("utf-8", "ignore")
    urls = [html.unescape(x) for x in re.findall(r'data-mdurl="([^"]+)"', h)]
    out = []
    for u in urls:
        host = urllib.parse.urlparse(u).netloc.lower()
        if not u.startswith("http") or any(b in host for b in BLOCK):
            continue
        if u not in out:
            out.append(u)
    return out[:6]


def main():
    rows = json.loads((ROOT / "data" / "pipeline" / "pending100.json").read_text(encoding="utf-8"))
    out = []
    for i, row in enumerate(rows, 1):
        name = row["name"]
        try:
            links = search(name)
        except Exception as exc:
            links = []
            print("ERR", name, str(exc)[:100], flush=True)
        site = links[0] if links else None
        out.append({"name": name, "district": row.get("district", ""), "sector": row.get("sector", ""), "site": site, "candidates": links})
        print(f"{i:03d}/{len(rows)} {name} -> {site or 'NONE'}", flush=True)
        time.sleep(0.25)
    (ROOT / "data" / "pipeline" / "batch100-sites.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print("WROTE", len(out), "with site", sum(1 for x in out if x["site"]))


if __name__ == "__main__":
    main()
