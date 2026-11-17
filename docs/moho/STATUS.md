# MoHo 현재 상태

기준: 2026-11-17. 실제 사이트는 2026-11-06 통합 배포본 그대로다(하프톤·연기 홈). 개편은 시안 단계이고 사이트 코드는 바꾸지 않았다.

## 진행 중: 홈 대대적 개편

- 사용자 결정: 기존 비주얼 아이덴티티 전면 교체, 홈 먼저, 움직이는 인터랙션 강조. 확정 시안은 아직 없다.
- 최신 시안 v4(Glass Orb 방향): `sites/moho/mockups/home-glass.src.html`, 게시본 https://claude.ai/artifact/E3XdBWkfHg6Ccm3JhtAEbC
- 이전 시안 v1~v3: `sites/moho/mockups/home-cinema.src.html`, 게시본 https://claude.ai/artifact/3ditJrxEU4eNieyB3oDVnx
- 레퍼런스 목록·피드백 이력·다음 작업 제안: `REFERENCES.md`
- 진행 방식(2026-11-17): "하나씩" — 포트폴리오 서가를 먼저 마쳤고 MoHo가 다음 차례다. v4는 사용자 기준에 못 미친다는 피드백이 있어 원본 실측 방식으로 다시 맞춰야 한다.
- 저장: 작업 브랜치 `claude/lucid-albattani-pr1jnv` → PR로 main 반영(병합 결과는 HISTORY 최신 항목 참조).

## 실험: TOTO 얼굴 리그 (2026-11-17)

- 사용자가 올린 강아지 캐릭터 GLB에 Blender 없이 얼굴 리그(눈·눈꺼풀·턱·입꼬리·눈썹·귀)를 굽고, 커서를 따라보는 페이지를 만들었다. 홈 개편과 별개이며 사이트 코드는 바꾸지 않았다.
- 소스: `sites/moho/mockups/toto/rig-toto.mjs`, `toto-face.src.html`. 게시본(비공개): https://claude.ai/artifact/8szpiZ7xQTPGh7sZBRNehf
- 저장: 작업 브랜치 `claude/eager-ride-u9coz2`에 커밋·push. PR·main 병합 전. 모델 파일은 공개 저장소라 커밋하지 않았다(로컬 생성, `.gitignore`).
- 결정 대기: 모델 파일 커밋 여부, 사이트에 실을지와 경로(예: 라이브러리 실험 글), 실기기 확인 후 귀·표정 세기 조정.

## 결정 대기 (사용자)

1. Glass Orb 방향 확정 여부와 원본 대비 다듬을 범위.
2. 새 아이덴티티(색·글꼴·인터랙션) 확정 → 확정 후 `sites/moho/AGENTS.md`·`DECISIONS.md` 갱신.
3. 홈 외 페이지(About·Work·Archive·카테고리) 개편 시점.

## 다음 작업

1. Glass Orb 미리보기 영상을 실측해 v4를 원본 수준으로 다시 맞춘다(`REFERENCES.md` 제안 참조).
2. 확정 시 `src/` 이식, `npm run build`, 모바일·데스크톱 확인.
3. 기존 미병합 작업(PR #13·#15)은 `../PENDING.md`에서 확인하고 요청 범위만 옮긴다. 렌즈 시뮬레이터 연결 방식은 아직 결정 전.

## 이전 상태 (2026-11-06)

- 기존 MoHo 소스를 `sites/moho/`로 분류했다. 홈 하프톤·연기·pill 헤더·소개/Work/Library/Contact 흐름이 main에 있다. 홈 외 페이지는 예전 디자인이고 콘텐츠는 샘플이다.
- Cloud·Node 24 실행 기준은 루트 `CLOUD_HANDOFF.md`와 `AGENTS.md`를 따른다(`bash scripts/with-node24.sh`). 두 사이트 전체 빌드 통과(MoHo 15페이지·포트폴리오 1페이지).
