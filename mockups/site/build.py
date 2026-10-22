"""dist(빌드 결과)의 마크업·CSS로 아티팩트용 단일 HTML을 만든다. 사용: python3 -I build.py <repo>/dist"""
import base64, glob, json, os, re, sys

DIST = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))


def b64(p, mime):
    return f"data:{mime};base64," + base64.b64encode(open(p, 'rb').read()).decode()


persona = b64(os.path.join(DIST, '../src/assets/persona/portrait.webp'), 'image/webp')
depth = b64(os.path.join(DIST, '../src/assets/persona/depth.png'), 'image/png')
cover = b64(glob.glob(os.path.join(DIST, '_astro/cover.*.svg'))[0], 'image/svg+xml')
css = open(glob.glob(os.path.join(DIST, '_astro/Base*.css'))[0]).read()
idx = open(os.path.join(DIST, 'index.html')).read()
header = re.search(r'<header[^>]*class="site"[\s\S]*?</header>', idx).group(0)
footer = re.search(r'<footer[^>]*class="site"[\s\S]*?</footer>', idx).group(0)
header = re.sub(r' data-astro-transition-persist="[^"]*"', '', header)


def img(t):
    t = t.group(0)
    t = re.sub(r'\s(srcset|sizes)="[^"]*"', '', t)
    if 'portrait' in t:
        t = re.sub(r'src="[^"]*"', 'src="" data-persona', t)
    elif 'cover' in t:
        t = re.sub(r'src="[^"]*"', f'src="{cover}"', t)
    return t


def clean(m):
    m = re.sub(r'<script[\s\S]*?</script>', '', m)
    m = re.sub(r'<div class="intro"[\s\S]*?(?=<section class="hero3d")', '', m)
    m = re.sub(r'<img[^>]*>', img, m)
    return re.sub(r'\sdata-(portrait|depth)="[^"]*"', '', m)


pages = {}
for f in sorted(glob.glob(os.path.join(DIST, '**/index.html'), recursive=True)):
    rel = os.path.relpath(f, DIST)[:-len('index.html')].rstrip('/')
    p = '/' + rel if rel else '/'
    pages[p] = clean(re.search(r'<main[\s\S]*?</main>', open(f).read()).group(0))

over = open(os.path.join(HERE, 'over.css')).read()
app = open(os.path.join(HERE, 'app.js')).read()
pages_json = json.dumps(pages, ensure_ascii=False).replace('</', '<\\/')

html = f'''<title>SOLGIL 사이트 시안</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans+KR:wght@400;600;700&family=Silkscreen&display=swap">
<style>
{css}
{over}
</style>
<div class="docbar"><div class="wrap">
  <span class="mono">solgil 사이트 시안 · 2026-10-22 배포본</span>
  <div class="views" role="group" aria-label="보기">
    <button type="button" id="view-one" data-view-btn="one" aria-pressed="true">페이지 전환 보기</button>
    <button type="button" id="view-all" data-view-btn="all" aria-pressed="false">전체 펼치기 · Figma용</button>
  </div>
</div></div>
<p class="docnote wrap">페이지 {len(pages)}개를 세로로 펼쳤어요. 움직이는 효과는 멈추고 사진은 원본 그대로 들어갑니다. html.to.design 같은 Figma 플러그인으로 이 화면을 가져가면 됩니다.</p>
<div id="site">
<div class="hud-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<div class="pt" data-pt aria-hidden="true"><div class="pt-dim" data-pt-dim></div><div class="pt-ret" data-pt-ret><i></i><i></i><i></i><i></i><u></u><u></u><u></u><u></u><span class="pt-tag mono" data-pt-tag></span></div></div>
{header}
<main></main>
{footer}
</div>
<div id="sheets"></div>
<script type="application/json" id="pages">{pages_json}</script>
<script>
const PERSONA = "{persona}";
const DEPTH = "{depth}";
{app}
</script>
'''
out = os.path.join(HERE, 'solgil-site.html')
open(out, 'w').write(html)
print(out, len(html), list(pages))
