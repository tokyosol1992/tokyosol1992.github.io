# MoHo 레퍼런스 · 홈 개편 시안

기준: 2026-11-17. "moho 작업하자"로 새 채팅을 시작하면 이 파일과 `STATUS.md`, 최신 `HISTORY.md`를 함께 읽고 브리핑한다.

## 사용자 결정 (2026-11-16)

- 홈 디자인을 대대적으로 개편한다. 범위는 홈 화면 먼저.
- 기존 비주얼 아이덴티티(다크 고정, SUIT, Hahmlet 900 하프톤+파란 연기, 클릭 충격파)를 모두 교체한다. 확정 시안은 아직 없다.
- 방향: 움직이는 인터랙션 강조.
- 2026-11-17: "하나씩 하자" — 포트폴리오 서가를 먼저 진행했고 MoHo는 다음 차례.

## 레퍼런스

| 레퍼런스 | 링크 | 메모 |
| --- | --- | --- |
| 사용자 제공 영상(인스타 릴스) | https://www.instagram.com/p/Dd3aeGbhWG3/ (계정 `studiodle_`) | 보석 브랜드 사이트 여러 개를 스크롤하는 영상. 풀블리드 사진, 블러로 섞이는 장면 전환, 큰 세리프 헤드라인, 최소 UI, 커서 반응. 사용자가 올린 화면 녹화로 확인(녹화 파일은 공개 저장소에 넣지 않음) |
| **선택: Glass Orb** | https://motionsites.ai/?prompt=glass-orb | 연한 은회색 장면, 무지개빛 유리 덩어리가 마우스를 따라 일렁임, 바닥 물결, 반투명 유리 카드, 작은 메뉴. Three.js 태그 |
| 후보: Shelf Hero | https://motionsites.ai/?prompt=vasari-vhs-hero | 포트폴리오에 채택(→ `../portfolio/REFERENCES.md`) |
| 후보: VHS Archive | https://motionsites.ai/?prompt=vhs-archive | 서가형 라이브러리 |
| 후보: Bookshop | https://motionsites.ai/?prompt=folio-books-hero | 서가형 |
| 후보: Hover Ink | https://motionsites.ai/?prompt=hover-ink | 마우스에 잉크처럼 번지는 큰 글자 |
| 후보: Sphere Gallery | https://motionsites.ai/?prompt=sphere-gallery | 카드가 구형으로 떠다니는 아카이브 |
| 후보: Space Voyage | https://motionsites.ai/?prompt=space-voyage | 풀블리드 풍경+세리프(사진 필요) |

- motionsites.ai는 유료 AI 웹사이트 프롬프트 판매 사이트다. 미리보기만 보고 프롬프트·코드는 열지 않는다. 그림·문구는 복제하지 않는다.
- awwwards.com은 2026-11-17 확인 시 보안 연결 직후 상대 서버가 끊어(봇 차단 추정) 이 Cloud 환경에서 열 수 없다. 사용자 요청으로 `www.awwwards.com` 허용은 제거했다. 필요하면 사용자가 캡처나 사이트 주소를 준다.

## 시안 이력과 사용자 피드백

| 버전 | 파일 | 게시본 | 내용 | 피드백 |
| --- | --- | --- | --- | --- |
| v1 | `sites/moho/mockups/home-cinema.src.html`(이후 v3로 덮어씀) | https://claude.ai/artifact/3ditJrxEU4eNieyB3oDVnx | 5장면 고정 무대, 스크롤로 블러 디졸브, 기존 페르소나 이미지 | "왜케 뚝딱 잘하냐" → 캐릭터 교체 요청 |
| v2 | 같은 파일 | 같은 링크 | A 초점 렌즈 / B 서리 유리 / C 액체 덩어리 비교, Figma AI로 만든 Y2K 인물 | "캐릭터도 덩어리도 별로" |
| (중단) | 시안 미반영 | — | 얼굴 없는 인물 포즈 6컷(Figma AI, 파일 `qj1DfO1iFrgrGWdSfkkOS8`) | "너무 오글거린다" → 인물 연출 제외 |
| v3 | `sites/moho/mockups/home-cinema.src.html` | https://claude.ai/artifact/3ditJrxEU4eNieyB3oDVnx | 인물 없이 노을 그라데이션+큰 세리프 | 이후 레퍼런스 탐색으로 전환 |
| v4 | `sites/moho/mockups/home-glass.src.html` | https://claude.ai/artifact/E3XdBWkfHg6Ccm3JhtAEbC | Glass Orb 방향: WebGL 유리 덩어리(마우스 변형, 바닥 물결), 라이브러리 유리 카드, 어두운 About | 사용자: "어줍잖게 만든 것 같다, 하나씩 하자" → 포트폴리오 먼저. MoHo는 다시 다듬을 차례 |

교훈: 사용자는 레퍼런스를 "대충 비슷하게"가 아니라 영상을 실측해 정확히 맞추길 원한다(포트폴리오 서가에서 실측 방식으로 진행해 확인받음). 과한 인물 연출·사이버 HUD·과장 카피는 피한다.

## 다음 MoHo 작업 제안

1. Glass Orb 미리보기 영상을 실측(색, 유리 덩어리 크기·위치·움직임 속도, 카드 배치, 커서 반응)해 v4를 원본 수준으로 다시 맞춘다. 포트폴리오 서가와 같은 방식.
2. 그림·문구는 복제하지 않고 MoHo 내용(라이브러리 항목·샘플 글)으로 채운다.
3. 확정되면 `sites/moho/AGENTS.md`의 디자인 기준과 `DECISIONS.md`를 새 아이덴티티로 갱신한 뒤 `src/`로 이식한다.
