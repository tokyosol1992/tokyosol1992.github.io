#!/usr/bin/env python3
"""서가 시안용 SUIT 부분 글꼴을 HTML 안에 넣는다.

시안 게시본(Claude 아티팩트)은 외부 스타일시트를 Google Fonts에서만 불러올 수 있어
SUIT(SIL OFL 1.1, https://sun.fo/suit)를 파일 안에 base64로 넣는다. 크기를 줄이려고
HTML에 쓰인 글자만 남긴다. 문구를 바꾸면 이 스크립트를 다시 실행한다.

준비: npm pack @sun-typeface/suit@2.0.5 → fonts/variable/woff2/SUIT-Variable.woff2
      pip install fonttools brotli
실행: python3 suit-subset.py <SUIT-Variable.woff2> [portfolio-shelf.src.html]
글꼴 이름은 OFL의 예약 이름(SUIT)을 수정본에 쓰지 않도록 CSS에서 'OsolSans'로 부른다.
"""
import base64, io, re, sys
from fontTools import subset
from fontTools.ttLib import TTFont

src = sys.argv[1]
html_path = sys.argv[2] if len(sys.argv) > 2 else 'portfolio-shelf.src.html'
html = open(html_path, encoding='utf-8').read()
B, E = '/* SUIT-SUBSET:BEGIN */', '/* SUIT-SUBSET:END */'
i0, i1 = html.index(B), html.index(E)
body = html[:i0] + html[i1:]
chars = set(ch for ch in body if ord(ch) >= 0x20) | set(chr(c) for c in range(0x20, 0x7F)) | set('·–—…‘’“”')
chars -= set('←→↗')  # 화살표는 SUIT 모양(꺾쇠)이 아니라 기본 글꼴의 긴 화살표를 쓴다

font = TTFont(src)
opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
sub = subset.Subsetter(opts); sub.populate(unicodes=[ord(c) for c in chars]); sub.subset(font)
for rec in font['name'].names:  # 수정본에는 예약 이름(SUIT)을 쓰지 않는다
    if rec.nameID in (1, 3, 4, 6, 16, 21):
        rec.string = rec.toUnicode().replace('SUIT', 'OsolSans')
buf = io.BytesIO(); font.save(buf); data = base64.b64encode(buf.getvalue()).decode()
face = ("/* SUIT(SIL OFL 1.1, https://sun.fo/suit) 부분 글꼴: 이 파일에 쓰인 %d자만. 다시 만들기: suit-subset.py */\n"
        "@font-face { font-family: 'OsolSans'; font-weight: 100 900; font-display: swap; src: url(data:font/woff2;base64,%s) format('woff2'); }\n") % (len(chars), data)
html = html[:i0] + B + '\n' + face + html[i1:]
open(html_path, 'w', encoding='utf-8').write(html)
print('glyph chars', len(chars), 'woff2 bytes', len(buf.getvalue()))
