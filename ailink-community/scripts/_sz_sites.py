import html
import re
import subprocess
import urllib.parse

names = ['赢时胜', '招商局金融科技', '兆威机电', '鹏鼎控股', '领益智造', '深南电路', '贝仕达克', '新产业生物', '基本半导体', '昂纳科技', '李未可科技']
for name in names:
    u = 'https://www.so.com/s?q=' + urllib.parse.quote(name + ' 官网')
    h = subprocess.run(['curl.exe', '-L', '--max-time', '20', '-A', 'Mozilla/5.0', u], capture_output=True).stdout.decode('utf-8', 'ignore')
    urls = []
    for x in re.findall(r'data-mdurl="([^"]+)"', h):
        x = html.unescape(x)
        if x.startswith('http') and 'so.com' not in x and '360' not in x and 'bing' not in x and 'baidu' not in x:
            if x not in urls:
                urls.append(x)
    print(name, urls[:5])
