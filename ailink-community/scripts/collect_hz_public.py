"""采集杭州公开名单（展会/数贸会/园区公开报道），输出去重候选 CSV。"""
import csv
import html
import json
import re
import subprocess
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "pipeline" / "hangzhou-public-candidates.csv"


def curl(url):
    p = subprocess.run(["curl.exe", "-L", "--max-time", "25", "-A", "Mozilla/5.0", url], capture_output=True)
    return p.stdout.decode("utf-8", "ignore")


def ai_show():
    names = []
    for page in range(1, 5):
        url = "http://aishowhz.com/zhanshangminglu/" if page == 1 else f"http://aishowhz.com/zhanshangminglu/list_23_{page}/"
        h = curl(url)
        for name in re.findall(r'/exhibitors/\d+\.html"\s+title="([^"]+)"', h):
            names.append((html.unescape(name), "展会", "AI Show 杭州人工智能与机器人展", url))
    return names


def shumao():
    url = "https://www.hzsc.com.cn/content/content_9839136.html"
    h = curl(url)
    text = re.sub(r"<[^>]+>", " ", h)
    text = html.unescape(text)
    # 只取出现“人工智能展区”到“丝路电商展区”之间的公司名
    m = re.search(r"人工智能展区(.*?)丝路电商展区", text, re.S)
    block = m.group(1) if m else text
    names = []
    for line in re.split(r"\s{2,}|\n", block):
        line = line.strip()
        if 4 <= len(line) <= 40 and ("公司" in line or "科技" in line or "智能" in line or "研究院" in line):
            names.append((line, "展会", "第四届全球数字贸易博览会·上城人工智能展区", url))
    return names


def curated():
    url_binjiang = "https://www.stdaily.com/web/gdxw/2025-05/24/content_344827.html"
    url_xiaoshan = "https://www.xiaoshan.gov.cn/art/2025/2/12/art_1302903_59108750.html"
    url_shumao = "https://www.hzsc.com.cn/content/content_9839136.html"
    rows = [
        ("明度智云", "园区榜单", "滨江人工智能创新项目 TOP5", url_binjiang),
        ("贝丰科技", "园区榜单", "滨江人工智能创新项目 TOP5", url_binjiang),
        ("剂泰医药", "园区榜单", "滨江人工智能创新项目 TOP5", url_binjiang),
        ("联汇科技", "园区榜单", "滨江人工智能创新项目 TOP5", url_binjiang),
        ("浙江讯飞", "园区榜单", "萧山省级人工智能名单", url_xiaoshan),
        ("知衣科技", "园区榜单", "萧山省级人工智能名单", url_xiaoshan),
        ("传播大脑", "园区榜单", "萧山省级人工智能名单", url_xiaoshan),
        ("惠瀜网络", "园区榜单", "萧山省级人工智能名单", url_xiaoshan),
        ("座头鲸科技", "园区榜单", "萧山省级人工智能名单", url_xiaoshan),
        ("北大信研院", "园区榜单", "萧山省级人工智能名单", url_xiaoshan),
        ("大胜达", "园区榜单", "萧山省级人工智能名单", url_xiaoshan),
        ("浙江中泰安全科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("浙江安诺数据技术服务", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州第二人生科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州赫瓦机器人技术开发", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州极光感知科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("全相鹰（杭州）智能科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州捷扬微电子", "展会", "数贸会上城人工智能展区", url_shumao),
        ("华硼中子科技（杭州）", "展会", "数贸会上城人工智能展区", url_shumao),
        ("欧梅空智科技（杭州）", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭擎智能（杭州）", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州动悟机器人科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州动微视觉科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("双擎科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州川核科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州川核灵境科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州群核信息技术", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州征信", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州海兴电力科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("浙江省邮电工程建设", "展会", "数贸会上城人工智能展区", url_shumao),
        ("浙江海卡飞宏航空技术", "展会", "数贸会上城人工智能展区", url_shumao),
        ("铁石安防", "展会", "数贸会上城人工智能展区", url_shumao),
        ("易海创腾信息科技（杭州）", "展会", "数贸会上城人工智能展区", url_shumao),
        ("快捷通支付服务", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州几海里网络科技", "展会", "数贸会上城人工智能展区", url_shumao),
        ("杭州博文股权投资", "展会", "数贸会上城人工智能展区", url_shumao),
        ("长三角数文私募基金管理（杭州）", "展会", "数贸会上城人工智能展区", url_shumao),
        ("中国美院视觉中国协同创新中心", "展会", "数贸会上城人工智能展区", url_shumao),
    ]
    return rows


def main():
    rows = ai_show() + shumao() + curated()
    existing = set(json.loads((ROOT / "data" / "pipeline" / "existing-hz-names.json").read_text(encoding="utf-8")))

    def in_lib(name):
        return any(name in x or x in name for x in existing)

    # 去重
    seen = set()
    uniq = []
    for name, typ, source, url in rows:
        name = name.strip()
        if not name or name in seen:
            continue
        seen.add(name)
        city = "杭州" if name.startswith(("杭州", "浙江", "浙大", "中国美院")) or typ == "园区榜单" else "待核验"
        uniq.append({"企业名称": name, "来源类型": typ, "来源": source, "来源链接": url, "城市": city, "是否已在库": "是" if in_lib(name) else "否", "备注": "公开名单候选，待去重/核验"})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["企业名称", "来源类型", "来源", "来源链接", "城市", "是否已在库", "备注"])
        w.writeheader()
        w.writerows(uniq)
    print("rows", len(uniq), OUT)


if __name__ == "__main__":
    main()
