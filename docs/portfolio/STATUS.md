# Oh SolGil 현재 상태

기준: 2026-11-18. 실제 사이트(`/portfolio/`)는 2026-11-06 통합 배포본 그대로다. 이번 서가 시안은 시안 폴더에만 있고 사이트 코드는 바꾸지 않았다.

## 진행 중: 오솔길 서가 시안

- 시안: `sites/portfolio/mockups/portfolio-shelf.src.html`, 게시본 https://claude.ai/artifact/94oDmyLEhfM49CYWkNja8s
- 레퍼런스·실측값·버전 이력: `REFERENCES.md`
- 상태: v11(2026-11-18) 가운데 영문 제목, 서가 위 유리 분류 메뉴(더 투명하게), 둥근 HOME, 오른쪽 위 검색 버튼+⌘K/Ctrl+K(고르면 서가 이동), 가운데 아래 브레드크럼, 한글 SUIT·제목/영문 메뉴 함렛. 사용자 확인·리터칭 대기. 열기 물결 전환(v4)은 레퍼런스 대기. Safari는 사용자가 나중에 확인. 내용은 샘플.
- 저장: v3까지는 PR #19로 main 병합. v4~v11은 작업 브랜치 `claude/determined-brahmagupta-1vorl9`(PR 전, main 미병합).

## 결정 대기 (사용자)

0. 서가 채택 시 실제 사이트 이름 표기를 OSOL LIBRARY로 바꿀지(서가 시안은 확정, `DECISIONS.md`).
1. 서가 구조를 실제 포트폴리오에 채택할지.
2. 배경: 시안은 밝은 종이(`#e7e5df`)다. 기존 결정은 다크 고정·파랑 `#2895f7`(`DECISIONS.md`, `sites/portfolio/AGENTS.md`). 채택 시 결정 문서를 먼저 갱신한다.
3. 실제 프로젝트 목록·표지 이미지·기간·역할·요약(사용자에게 받은 사실만).
4. 원본 일러스트 대신 쓸 표지 그림 방향(지금은 직접 만든 도형).

## 다음 작업

0. 유리 분류 메뉴 리터칭(사용자). 문구를 바꾸면 `sites/portfolio/mockups/suit-subset.py`로 SUIT 부분 글꼴을 다시 만든다. 물결 전환은 사용자 레퍼런스를 받은 뒤 다시 만들고, 시작 종이 기울기를 표지(-4°)와 맞춘다.
1. 위 결정을 받으면 시안을 다듬거나 `src/`로 이식한다(이식 시 `npm run build`, 모바일·데스크톱 확인).
2. 기존 미병합 작업(PR #10 그로우 케이스 스터디 시안, PR #3 Figma 기록)은 `../PENDING.md`에서 확인하고 요청 범위만 옮긴다.
3. Safari 동작 확인(사용자가 나중에 확인 예정, 이 Cloud 환경에는 Chromium만 있음).

## 이전 상태 (2026-11-06)

- 기존 한 페이지 소스를 `sites/portfolio/`에 가져왔다. 검색·카드 Border Glow·Lenis·모바일 프로젝트 가로 스크롤을 유지했다. Soft Aurora는 제거된 상태다.
- 경력·요약·연락처는 입력 예정이고, 프로젝트 상세와 PDF 연결은 후속이다. 사실을 임의로 채우지 않는다.
- 새 배포 경로는 `/portfolio/`. 기존 `/ohsolgil/` 주소는 새 페이지로 이동한다.
- Cloud·Node 24 실행 기준은 루트 `CLOUD_HANDOFF.md`와 `AGENTS.md`를 따른다(`bash scripts/with-node24.sh`).
