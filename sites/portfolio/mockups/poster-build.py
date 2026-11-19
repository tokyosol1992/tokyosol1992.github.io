#!/usr/bin/env python3
"""포스터 표지 메인 화면 이미지를 서가 원본(portfolio-shelf.src.html)에 data URI로 채운다.

사용: python3 poster-build.py [이미지 폴더(기본 posters/)] [HTML(기본 portfolio-shelf.src.html)]
- 폴더의 파일 이름은 프로젝트 번호(0부터): 00.png → 첫 번째 책, 01.png → 두 번째 책 ...
- 이미지는 화면 캡처 그대로(폰 틀·브라우저 틀은 표지 템플릿이 그린다). 폭 560px 이하로 줄여 WebP로 담는다.
- HTML의 `POSTERS:BEGIN` ~ `POSTERS:END` 사이만 바꾼다.
"""
import base64, io, os, re, sys
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
img_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, 'posters')
html = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, 'portfolio-shelf.src.html')

items = {}
if os.path.isdir(img_dir):
    for f in sorted(os.listdir(img_dir)):
        m = re.match(r'^(\d+)\.(png|jpg|jpeg|webp)$', f, re.I)
        if not m: continue
        im = Image.open(os.path.join(img_dir, f)).convert('RGB')
        if im.width > 560: im = im.resize((560, round(im.height * 560 / im.width)), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, 'WEBP', quality=82, method=6)
        items[int(m.group(1))] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
        print(f'{f}: {im.width}x{im.height}, {len(buf.getvalue()) // 1024}KB')

body = '  var POSTER_IMG = {' + ','.join(f"\n    {k}: '{v}'" for k, v in sorted(items.items())) + ('\n  ' if items else '') + '}; // 키 = 프로젝트 번호(it.m). 메인 화면 이미지는 mockups/posters/ 아래 PNG에서 poster-build.py로 채운다\n'
s = open(html, encoding='utf-8').read()
new, n = re.subn(r'(  // POSTERS:BEGIN\n).*?(  // POSTERS:END)', lambda m: m.group(1) + body + m.group(2), s, flags=re.S)
assert n == 1, 'POSTERS 표식을 찾지 못했습니다'
open(html, 'w', encoding='utf-8').write(new)
print('채운 이미지:', len(items))
