"""最小 DeepSeek API 测试：读取项目根目录 .env，输出中文 JSON。

用法：
    python scripts/test-deepseek.py
"""
import json
import os
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read_key():
    env_path = ROOT / ".env"
    if not env_path.exists():
        raise SystemExit("找不到 .env，请先复制 .env.example 为 .env 并填写 DEEPSEEK_API_KEY")
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("DEEPSEEK_API_KEY="):
            key = line.split("=", 1)[1].strip().strip('"').strip("'")
            if key:
                return key
    raise SystemExit(".env 里没有有效的 DEEPSEEK_API_KEY")


def main():
    key = read_key()
    payload = {
        "model": os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
        "messages": [
            {"role": "system", "content": "你是数据抽取器，只输出 JSON，不要解释。"},
            {
                "role": "user",
                "content": '从这句话抽取公司名、城市、区县，输出 {"name":"","city":"","district":""}。城市是地级市，区县是滨江区：杭州聚光科技位于滨江区。',
            },
        ],
        "response_format": {"type": "json_object"},
        "stream": False,
    }
    req = urllib.request.Request(
        os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/") + "/chat/completions",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json; charset=utf-8",
        },
    )
    last_error = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            break
        except Exception as exc:
            last_error = exc
            if attempt == 2:
                raise SystemExit(f"API 请求失败：{last_error}")
    content = data["choices"][0]["message"]["content"]
    print(content)
    print(json.loads(content))


if __name__ == "__main__":
    main()
