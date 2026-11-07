import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rows = json.loads((ROOT / "data" / "pipeline" / "ten-hangzhou.json").read_text(encoding="utf-8"))
manual = {
    "聚光科技": (10, "全字段可用；官网/电话/邮箱/地址来自官网"),
    "丁香园": (7, "缺区县/总机；hr@dxy.cn 是招聘邮箱，不是商务邮箱"),
    "魔点科技": (10, "全字段可用；官网/电话/邮箱/地址准确"),
    "浙江讯飞": (7, "无独立官网；用母公司官网 + 公开报道人工核验，缺总机/邮箱"),
    "顺网科技": (9, "区县正确；成立年已补 2005"),
    "电魂网络": (6, "缺区县/总机/邮箱；联系页仍未抓到有效联系方式"),
    "宏杉科技": (8, "抓到英文站；电话格式错误，缺中文地址"),
    "迪普科技": (8, "联系页补齐总机/地址/描述；缺成立年/邮箱"),
    "连连数字": (10, "全字段可用；官网/电话/邮箱/地址准确"),
    "博联智能": (8, "JS 壳已绕过，补齐电话/邮箱/地址/描述；缺成立年"),
}

path = ROOT / "data" / "pipeline" / "ten-hangzhou-review.csv"
with path.open("w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["企业", "官网", "城市", "区县", "成立年", "电话", "邮箱", "人工评分/10", "结论"])
    for item in rows:
        e = item.get("extracted") or {}
        score, note = manual.get(item["company"], (0, ""))
        w.writerow([item["company"], item["url"], e.get("city"), e.get("district"), e.get("founded_year"), e.get("phone"), e.get("email"), score, note])
print(path)
print("total", sum(v[0] for v in manual.values()))
