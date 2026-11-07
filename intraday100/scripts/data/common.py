"""Shared schema for the 100 intraday dossiers."""

FAMILIES = {
    "A": "开盘与突破",
    "B": "日内均值回归",
    "C": "日内动量",
    "D": "盘口与做市",
    "E": "事件与新闻",
    "F": "期权与 0DTE",
    "G": "加密日内",
    "H": "执行与套利",
    "I": "日内组合与风控",
    "J": "AI 与另类数据",
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
        "session": "",
        "holding": "",
        "direction": "",
        "edge": "",
        "aiRole": "",
        "ai": "",
        "thesis": "",
        "setup": "",
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
        "dataset": None,
        "benchmark": "SPY",
        "riskLevel": "中",
        "capital": "US$25,000 起",
        "access": "IBKR / 富途 / 老虎",
        "capacity": "中",
        "readiness": 65,
        "costBps": 2,
        "tags": [],
        "caseStudy": "",
        "caseType": "event",
    }
    d.update(kw)
    if d["familyCode"] and not d["family"]:
        d["family"] = FAMILIES.get(d["familyCode"], "")
    if not d["code"] and d["id"]:
        d["code"] = d["familyCode"] + d["id"][-2:]
    return d
