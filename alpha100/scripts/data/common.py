"""Shared schema/defaults for the 100 strategy dossiers."""

FAMILIES = {
    "A": "趋势与动量",
    "B": "均值回归",
    "C": "统计套利",
    "D": "横截面因子",
    "E": "事件驱动",
    "F": "新闻与语言模型",
    "G": "期权与波动率",
    "H": "加密与链上",
    "I": "微观结构与执行",
    "J": "宏观与跨资产",
}


def S(**kw):
    d = {
        "id": "",
        "code": "",
        "slug": "",
        "name": "",
        "en": "",
        "familyCode": "",
        "family": "",
        "market": "",
        "symbols": [],
        "universe": [],
        "timeframe": "日线",
        "holding": "",
        "direction": "",
        "edge": "",
        "aiRole": "",
        "ai": "",
        "thesis": "",
        "entry": "",
        "exit": "",
        "risk": "",
        "data": "",
        "execution": "",
        "fails": "",
        "liveCheck": [],
        "protocol": [],
        "verification": "paper",
        "engine": None,
        "params": {},
        "benchmark": "SPY",
        "riskLevel": "中",
        "capital": "US$10,000 起",
        "access": "IBKR / 富途 / 老虎",
        "capacity": "中",
        "readiness": 70,
        "costBps": 2,
        "tags": [],
    }
    d.update(kw)
    if d["familyCode"] and not d["family"]:
        d["family"] = FAMILIES.get(d["familyCode"], "")
    if not d["code"] and d["id"]:
        d["code"] = d["familyCode"] + d["id"][-2:]
    return d
