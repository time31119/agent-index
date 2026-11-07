import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rows = json.loads((ROOT / "data" / "pipeline" / "batch20.json").read_text(encoding="utf-8"))
manual = {
    "启明医疗": (10, "全字段可用"),
    "微泰医疗": (9, "改用中文官网；城市/电话/邮箱/地址/描述可用，成立年缺失"),
    "贝达药业": (10, "全字段可用"),
    "老板电器": (8, "缺区县/邮箱/地址"),
    "春风动力": (8, "改用中文站；城市/成立年/电话/邮箱/描述可用，区县/地址缺失"),
    "正元智慧": (10, "改用 hzsun.com；全字段可用"),
    "蓝芯科技": (10, "全字段可用"),
    "微策生物": (7, "有城市/成立年/描述；缺电话/邮箱/地址"),
    "迪安诊断": (6, "缺城市/区县/地址/邮箱；描述与电话可用"),
    "士兰微": (8, "缺区县/邮箱"),
    "国芯科技": (9, "改用 nationalchip.com；城市/电话/地址/描述可用，区县/邮箱缺失"),
    "广立微": (7, "缺成立年/电话/邮箱/地址"),
    "税友软件": (10, "全字段可用"),
    "宏华数科": (9, "抓到英文站；信息完整但缺中文"),
    "远方信息": (7, "缺成立年/电话/邮箱/地址"),
    "大立科技": (10, "全字段可用"),
    "乒乓智能": (8, "缺电话/邮箱/地址"),
    "鸿泉物联": (9, "改用 hopechart.com；城市/区县/电话/地址/描述可用，邮箱为 HR 角色"),
    "安恒信息": (10, "全字段可用"),
    "明度智云": (10, "全字段可用"),
}
path = ROOT / "data" / "pipeline" / "batch20-review.csv"
with path.open("w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["企业", "官网", "城市", "区县", "成立年", "电话", "邮箱", "人工评分/10", "结论"])
    for item in rows:
        e = item.get("extracted") or {}
        score, note = manual.get(item["company"], (0, item.get("error") or ""))
        w.writerow([item["company"], item["url"], e.get("city"), e.get("district"), e.get("founded_year"), e.get("phone"), e.get("email"), score, note])
scores = [manual.get(item["company"], (0, ""))[0] for item in rows]
print(path)
print("total", sum(scores), "usable>=6", sum(1 for s in scores if s >= 6))
