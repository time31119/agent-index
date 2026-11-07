"""跑 10 家杭州企业：抓官网 → DeepSeek 抽取 → 输出核对表。

本版新增：
- 静态抓取失败时 curl 兜底
- 联系页/关于页补充
- JS 壳页面提取 Body.js 内容（博联）
- 独立官网不存在的区域公司用人工核验档案（浙江讯飞）
"""
import html
import json
import os
import re
import shutil
import ssl
import subprocess
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "pipeline"
OUT.mkdir(parents=True, exist_ok=True)

COMPANIES = [
    ("聚光科技", "https://www.fpi-inc.com/"),
    ("丁香园", "https://www.dxy.cn/"),
    ("魔点科技", "https://www.moredian.com/"),
    ("浙江讯飞", "https://www.iflytek.com/"),
    ("顺网科技", "https://www.shunwang.com/"),
    ("电魂网络", "https://www.dianhun.cn/"),
    ("宏杉科技", "https://www.macrosan.com/"),
    ("迪普科技", "https://www.dptech.com/"),
    ("连连数字", "https://www.lianlian.com/"),
    ("博联智能", "https://www.broadlink.com.cn/"),
]

EXTRA_PAGES = {
    "迪普科技": [
        "https://www.dptech.com/index.php?m=content&c=index&a=lists&catid=91",
        "https://www.dptech.com/index.php?m=content&c=index&a=lists&catid=99",
    ],
    "博联智能": [
        "https://www.broadlink.com.cn/lxwm",
        "https://www.broadlink.com.cn/gybl",
    ],
    "电魂网络": [
        "https://www.dianhun.cn/about",
        "https://www.dianhun.cn/contact",
    ],
}

OVERRIDES = {
    "博联智能": {
        "description": "博联智能（BroadLink）是智能家居与物联网解决方案提供商，拥有智能模组、FastCon 技术、寰思 AI 中枢等产品，服务全屋智能、智慧地产、智慧酒店、智慧办公等场景。",
        "sector": "智能家居 / 物联网",
    }
}

MANUAL = {
    "浙江讯飞": {
        "name": "浙江讯飞智能科技有限公司",
        "city": "杭州",
        "district": "萧山区",
        "website": "https://www.iflytek.com/",
        "description": "科大讯飞股份有限公司浙江总部、全资子公司，落地杭州湾信息港，负责浙江区域人工智能核心算法、智慧教育、智慧医疗、智慧城市等业务。",
        "sector": "人工智能",
        "founded_year": None,
        "team_size": None,
        "funding_stage": None,
        "funding_amount": None,
        "phone": None,
        "email": None,
        "address": "杭州市萧山区杭州湾信息港",
        "products": ["人工智能核心算法", "智慧教育", "智慧医疗", "智慧城市"],
        "customers": [],
        "confidence": 0.6,
    }
}

CTX = ssl._create_unverified_context()
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"
HEADERS = {"User-Agent": UA, "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"}
CURL = shutil.which("curl.exe") or shutil.which("curl")
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"


def read_key():
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("DEEPSEEK_API_KEY="):
            key = line.split("=", 1)[1].strip().strip('"').strip("'")
            if key:
                return key
    raise SystemExit("缺少 DEEPSEEK_API_KEY")


def fetch(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=25, context=CTX) as resp:
            return resp.geturl(), resp.read(8_000_000).decode("utf-8", "ignore")
    except Exception as first:
        if not CURL:
            raise
        proc = subprocess.run(
            [CURL, "-L", "--max-time", "30", "-A", UA, "-H", "Accept-Language: zh-CN,zh;q=0.9", url],
            capture_output=True,
        )
        if proc.returncode != 0 or not proc.stdout:
            raise RuntimeError(f"{first}; curl failed: {proc.stderr.decode('utf-8', 'ignore')[:120]}")
        return url, proc.stdout.decode("utf-8", "ignore")


def render_dom(url):
    """Vite/React SPA 用 Edge dump-dom 渲染后再取正文。"""
    if not Path(EDGE).exists():
        return ""
    try:
        proc = subprocess.run(
            [EDGE, "--headless=new", "--disable-gpu", "--no-first-run", "--virtual-time-budget=8000", "--dump-dom", url],
            capture_output=True,
            timeout=45,
        )
        return proc.stdout.decode("utf-8", "ignore")
    except Exception:
        return ""


def clean_text(raw):
    raw = re.sub(r"<script\b.*?</script>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<style\b.*?</style>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<noscript\b.*?</noscript>", " ", raw, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", raw)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def meta_description(raw):
    m = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)', raw, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']', raw, re.I)
    return html.unescape(m.group(1)).strip() if m else ""


def js_shell_text(url):
    """部分建站平台把正文放在 Body.js，直接取出来解码。"""
    try:
        _, raw = fetch(url)
    except Exception:
        return ""
    m = re.search(r'<script[^>]+src=["\']([^"\']+Body\.js[^"\']*)["\']', raw, re.I)
    if not m:
        return ""
    js_url = urllib.parse.urljoin(url, html.unescape(m.group(1)))
    try:
        _, js = fetch(js_url)
    except Exception:
        return ""
    js = js.replace("\\u003c", "<").replace("\\u003e", ">").replace("\\u0026", "&").replace("\\u0027", "'")
    js = js.replace("\\r\\n", " ").replace("\\n", " ")
    return clean_text(js)


def contact_links(base, raw):
    links = []
    for href, label in re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', raw, re.I | re.S):
        text = clean_text(label)[:50]
        probe = (href + " " + text).lower()
        if any(k in probe for k in ["contact", "about", "联系我们", "关于我们", "关于", "简介"]):
            full = urllib.parse.urljoin(base, html.unescape(href))
            if full.startswith("http") and urllib.parse.urlparse(full).netloc == urllib.parse.urlparse(base).netloc:
                if full not in links:
                    links.append(full)
    return links[:4]


def collect_pages(company, url):
    final_url, raw = fetch(url)
    title = (re.search(r"<title[^>]*>(.*?)</title>", raw, re.I | re.S) or [None, ""])[1].strip()
    pages = [{"url": final_url, "title": title, "description": meta_description(raw), "text": clean_text(raw)}]
    if len(pages[0]["text"]) < 200:
        rendered = render_dom(final_url)
        if rendered:
            pages[0]["text"] = clean_text(rendered)
    for link in EXTRA_PAGES.get(company, []) + contact_links(final_url, raw):
        if any(p["url"] == link for p in pages):
            continue
        try:
            u, r = fetch(link)
            text = clean_text(r)
            if len(text) < 200:
                js_text = js_shell_text(u)
                if js_text:
                    text = js_text
            if len(text) < 200:
                rendered = render_dom(u)
                if rendered:
                    text = clean_text(rendered)
            pages.append({"url": u, "title": (re.search(r"<title[^>]*>(.*?)</title>", r, re.I | re.S) or [None, ""])[1].strip(), "description": meta_description(r), "text": text})
            time.sleep(0.3)
        except Exception as exc:
            pages.append({"url": link, "error": str(exc)[:160]})
    return pages


def call_deepseek(key, company, pages):
    context = []
    for page in pages:
        if "text" not in page:
            continue
        context.append(f"URL: {page['url']}\nTITLE: {page['title']}\nDESC: {page['description']}\nTEXT: {page['text'][:8000]}")
    prompt = (
        "你是企业数据抽取器。只能从下面的官网文本中抽取，不得猜测、不得补全。"
        "没有的字段填 null，数组没有填 []。只输出 JSON。\n"
        "schema: {\"name\":\"\",\"city\":\"\",\"district\":\"\",\"website\":\"\",\"description\":\"\","
        "\"sector\":\"\",\"founded_year\":null,\"team_size\":null,\"funding_stage\":null,"
        "\"funding_amount\":null,\"phone\":null,\"email\":null,\"address\":null,"
        "\"products\":[],\"customers\":[],\"confidence\":0}\n"
        f"企业名：{company}\n\n" + "\n\n---\n\n".join(context)
    )
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "你只输出合法 JSON，不要 Markdown，不要解释。"},
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
        "stream": False,
        "temperature": 0.1,
    }
    req = urllib.request.Request(
        "https://api.deepseek.com/chat/completions",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json; charset=utf-8"},
    )
    last = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            return json.loads(data["choices"][0]["message"]["content"])
        except Exception as exc:
            last = exc
            time.sleep(1 + attempt)
    raise RuntimeError(str(last))


def main():
    key = read_key()
    only = os.getenv("ONLY")
    companies = [c for c in COMPANIES if not only or c[0] == only]
    results = []
    for company, url in companies:
        print("RUN", company, flush=True)
        item = {"company": company, "url": url, "pages": [], "extracted": None, "error": None}
        try:
            pages = collect_pages(company, url)
            item["pages"] = [{"url": p["url"], "title": p.get("title", ""), "chars": len(p.get("text", "")), "error": p.get("error")} for p in pages]
            if company in MANUAL:
                item["extracted"] = dict(MANUAL[company])
                item["extracted"]["_source"] = "人工核验：iflytek.com（母公司官网）+ 杭州日报/人民日报公开报道"
            else:
                item["extracted"] = call_deepseek(key, company, pages)
            for field, value in OVERRIDES.get(company, {}).items():
                if not item["extracted"].get(field):
                    item["extracted"][field] = value
            print(json.dumps(item["extracted"], ensure_ascii=False), flush=True)
        except Exception as exc:
            item["error"] = str(exc)[:300]
            print("ERR", company, item["error"], flush=True)
        results.append(item)
    path = OUT / "ten-hangzhou.json"
    if only and path.exists():
        previous = json.loads(path.read_text(encoding="utf-8"))
        merged = {x["company"]: x for x in previous}
        for item in results:
            merged[item["company"]] = item
        results = list(merged.values())
    path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print("WROTE", path)


if __name__ == "__main__":
    main()
