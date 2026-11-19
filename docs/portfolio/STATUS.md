# Oh SolGil 현재 상태

기준: 2026-11-19. 실제 사이트(`/portfolio/`)를 OSOL LIBRARY 서가(v13)로 교체해 배포했다(사용자 결정, PR #20 main 병합, Pages 배포 실행 #19 성공). 원본은 `sites/portfolio/mockups/portfolio-shelf.src.html` 한 파일이고 `src/pages/index.astro`가 그대로 불러온다. 이전 다크 페이지는 `src/legacy/`에 보존.

## 현재: OSOL LIBRARY 서가 (실제 /portfolio/)

- 원본: `sites/portfolio/mockups/portfolio-shelf.src.html`(실제 페이지가 그대로 불러옴), 아티팩트 게시본 https://claude.ai/artifact/94oDmyLEhfM49CYWkNja8s
- 레퍼런스·실측값·버전 이력: `REFERENCES.md`
- 상태: 배포본(2026-11-18) 가운데 영문 제목(함렛), 서가 위 유리 분류 메뉴(AI/AX·플랫폼·디자인 시스템·기타가 같은 여백으로 이어진 한 줄, 표지 위 32px(서가 비율로 축소), 모두 SUIT), 둥근 HOME, 오른쪽 위 검색 버튼+⌘K/Ctrl+K와 유리 검색 창, 가운데 아래 브레드크럼, 한글 SUIT. 열기 물결 전환(v4)은 레퍼런스 대기. Safari는 사용자가 나중에 확인. 내용은 샘플.
- 2026-11-19 작업(브랜치 `claude/sharp-volta-tdqx1r`, 미병합): 유리 메뉴 30% 확대(표지와의 간격 유지), 프로젝트 메인 화면 포스터 표지 템플릿 v1(앱·웹 틀, 샘플 01·02에 자리표시 적용). 사용자 확인: 열기 물결 전환은 현재 그대로, Safari 확인 완료.
- 저장: v3까지는 PR #19, v4~v13과 실제 페이지 교체는 [PR #20](https://github.com/tokyosol1992/tokyosol1992.github.io/pull/20)으로 main 병합(`c05dcd0`)·배포 완료. 배포 주소를 이 Cloud 환경에서 직접 열어 확인하지는 못했다.

## 결정 대기 (사용자)

1. 실제 프로젝트(최근 재직 순): 원스글로벌(재직 중) · 마켓보로 · 휴넷 · 블랙홀릭 · 씨앤디팩토리 · 가장 이전 포트폴리오. 회사별 한 권인지, 프로젝트별 권수인지.
2. 권별 분류(AI/AX · 플랫폼 · 디자인 시스템 · 기타), 기간·역할·요약(사용자에게 받은 사실만).
3. 권별 메인 화면: Figma 폴더 링크는 도구로 읽을 수 없으므로 디자인 파일 링크에 메인 화면 노드(`?node-id=`)를 붙여 받는다. 포스터 색(배경·글자·포인트)도 확인.

## 다음 작업

0. 포스터 표지 템플릿을 사용자가 확인한 뒤 ITEMS를 실제 프로젝트로 바꾸고 `posters/`에 메인 화면을 넣어 `poster-build.py` 실행, `suit-subset.py`로 글꼴 다시 생성, 빌드·배포.
0-1. (완료) 유리 분류 메뉴 리터칭. 문구를 바꾸면 `sites/portfolio/mockups/suit-subset.py`로 SUIT 부분 글꼴을 다시 만든다. 물결 전환은 사용자 레퍼런스를 받은 뒤 다시 만들고, 시작 종이 기울기를 표지(-4°)와 맞춘다.
1. 실제 프로젝트 내용을 받으면 서가 원본의 ITEMS(제목·분류·기간·역할·요약)와 표지를 채우고 `suit-subset.py`로 글꼴을 다시 만든 뒤 빌드·배포한다.
2. 기존 미병합 작업(PR #10 그로우 케이스 스터디 시안, PR #3 Figma 기록)은 `../PENDING.md`에서 확인하고 요청 범위만 옮긴다.
3. Safari 동작 확인(사용자가 나중에 확인 예정, 이 Cloud 환경에는 Chromium만 있음).

## 이전 상태 (2026-11-06)

- 기존 한 페이지 소스를 `sites/portfolio/`에 가져왔다. 검색·카드 Border Glow·Lenis·모바일 프로젝트 가로 스크롤을 유지했다. Soft Aurora는 제거된 상태다.
- 경력·요약·연락처는 입력 예정이고, 프로젝트 상세와 PDF 연결은 후속이다. 사실을 임의로 채우지 않는다.
- 새 배포 경로는 `/portfolio/`. 기존 `/ohsolgil/` 주소는 새 페이지로 이동한다.
- Cloud·Node 24 실행 기준은 루트 `CLOUD_HANDOFF.md`와 `AGENTS.md`를 따른다(`bash scripts/with-node24.sh`).
