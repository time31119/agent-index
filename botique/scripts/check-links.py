import glob
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = glob.glob(os.path.join(ROOT, "*.html"))
missing = []
ids = set()
checked = 0

for path in HTML:
    text = open(path, encoding="utf-8").read()
    for match in re.finditer(r'(?:href|src)="([^"]+)"', text):
        url = match.group(1)
        if url.startswith(("http", "mailto:", "tel:", "#", "data:")):
            continue
        checked += 1
        target = url.split("?")[0].split("#")[0]
        if not target:
            continue
        if not os.path.exists(os.path.join(ROOT, target)):
            missing.append((os.path.basename(path), url))
    for match in re.finditer(r"product\.html\?id=([a-z0-9-]+)", text):
        ids.add(match.group(1))

node = os.environ.get("NODE_BIN")
if not node:
    node = r"C:\Users\Administrator\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
raw = subprocess.check_output([
    node, "-e",
    "const D=require(process.argv[1]);console.log(JSON.stringify(D.products.map(p=>p.id)))",
    os.path.join(ROOT, "assets", "js", "data.js")
]).decode("utf-8")
valid = set(json.loads(raw))

print("local links checked:", checked)
print("missing files:", len(missing))
for item in missing:
    print("  MISSING", item)
print("product ids referenced:", len(ids))
print("unknown ids:", sorted(ids - valid))
