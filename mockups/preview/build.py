"""dist/index.html → 아티팩트 미리보기 폴더 (assets/ 상대 경로, 사이트 안 링크는 #)"""
import glob, json, os, re, shutil, sys

DIST, OUT = sys.argv[1], sys.argv[2]
shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(os.path.join(OUT, 'assets'))
html = open(os.path.join(DIST, 'index.html'), encoding='utf-8').read()
head = re.search(r'<head>([\s\S]*?)</head>', html).group(1)
body = re.search(r'<body>([\s\S]*?)</body>', html).group(1)
tail = html[html.index('</html>') + len('</html>'):]
head = re.sub(r'<meta charset="utf-8">|<meta name="viewport"[^>]*>|<link rel="icon"[^>]*>', '', head)
head = re.sub(r'<title>[^<]*</title>', '<title>MoHo 홈 미리보기</title>', head)
page = (head + body + tail).replace('"/_astro/', '"./assets/').replace(' /_astro/', ' ./assets/')
page = re.sub(r'href="/(?!/)[^"]*"', 'href="#"', page)
page = re.sub(r'&quot;/(?!/)[^&]*&quot;', '&quot;#&quot;', page)
page = page.replace('<a href="mailto:tokyosol1992@gmail.com" data-scramble>tokyosol1992@gmail.com</a>', '<span data-scramble>tokyosol1992@gmail.com</span>')
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(page)
files = {}
for f in glob.glob(os.path.join(DIST, '_astro', '*')):
    name = os.path.basename(f)
    if name.endswith('.webp') or (name.startswith('cover.') and name not in page):
        continue
    dst = os.path.join(OUT, 'assets', name)
    if name.endswith('.css'):
        open(dst, 'w', encoding='utf-8').write(open(f, encoding='utf-8').read().replace('/_astro/', ''))
    else:
        shutil.copy(f, dst)
    files['assets/' + name] = dst
json.dump(files, open(os.path.join(OUT, 'files.json'), 'w'), indent=1)
print(len(files), 'files; leftover:', re.findall(r'(?:src|href)="/[^"]*"', page)[:5])
