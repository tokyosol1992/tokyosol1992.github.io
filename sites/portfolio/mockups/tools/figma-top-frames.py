#!/usr/bin/env python3
"""Figma get_metadata 결과가 너무 커서 파일로 저장됐을 때, 최상위 큰 프레임(이름·크기·ID)만 뽑는다.

사용: python3 figma-top-frames.py <저장된 json 파일> [최대 줄 수=60]
- get_metadata를 페이지 단위로 부르면 수십만 자가 나오므로, 결과가 파일로 저장되면 이 스크립트로 대표 프레임을 찾고
  그 노드 ID로 get_screenshot을 부른다(대화 내용에 메타데이터를 쏟지 않는다).
"""
import json, re, sys

text = json.load(open(sys.argv[1]))[0]['text']
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 60
n = 0
for line in text.split('\n'):
    m = re.match(r'^( {2,4})<(\w[\w-]*) id="([^"]+)" name="([^"]*)" x="([-\d.e]+)" y="([-\d.e]+)" width="([\d.]+)" height="([\d.]+)"', line)
    if not m or len(m.group(1)) not in (2, 4):
        continue
    depth = len(m.group(1)) // 2
    w, h = float(m.group(7)), float(m.group(8))
    if (w >= 300 and h >= 300) or m.group(2) == 'section':
        print('  ' * (depth - 1), m.group(3), m.group(2), m.group(4)[:34], int(w), int(h))
        n += 1
        if n >= limit:
            break
