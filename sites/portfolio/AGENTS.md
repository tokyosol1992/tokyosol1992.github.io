# Oh SolGil 포트폴리오

- 소스는 이 폴더, 상태·결정·기록은 `../../docs/portfolio/`다. 루트 공통 규칙도 적용한다.
- 2026-11-18부터 실제 `/portfolio/` 페이지는 OSOL LIBRARY 서가다. 원본은 `mockups/portfolio-shelf.src.html` 한 파일이고 `src/pages/index.astro`가 그대로 불러온다(아티팩트 게시본과 같은 파일). 서가를 고칠 때는 이 파일을 고치고 `npm run build`로 확인한다. 한글 문구를 바꾸면 `mockups/suit-subset.py`로 SUIT 부분 글꼴을 다시 만든다.
- 서가 기준: 밝은 종이 배경 `#e7e5df`, 포인트 파랑 `#1c3694`, 함렛은 가운데 제목(OSOL LIBRARY)에만, 메뉴(AI/AX 포함)·한글은 SUIT, 이름은 영문 OSOL LIBRARY. 결정은 `../../docs/portfolio/DECISIONS.md`.
- 경력·성과·요약·연락처는 사용자에게 받은 사실만 쓴다. 지금 서가 내용(샘플 프로젝트 01~09, YYYY 기간, 역할 입력 예정)은 자리표시다.
- 이전 다크 한 페이지(다크 고정, 파랑 #2895f7, Border Glow, Lenis·검색 등)는 `src/legacy/index-dark-2026-11-06.astro`에 보존했다(경로 없음). Soft Aurora와 오로라 배경은 사용자 철회 사항이므로 되살리지 않는다.
- 기간 표기는 YYYY - YYYY / YYYY.MM.DD 규칙을 따른다(`src/lib/period.ts`). 연차 표기를 새로 넣지 않는다.
- `backdrop-filter`는 `blur(0)` 대신 `blur(.1px)`, -webkit- 속성을 표준 속성보다 앞에 둔다. Lenis 시작·정지는 html 클래스 관찰 대신 이벤트로 처리한다.
- 사용자가 "포폴 사이트에 올릴 작업 시작하자"고 하면 `../../docs/portfolio/STATUS.md`와 `FIGMA.md`로 진행 상황을 먼저 설명한다. Figma 설명은 화면 이름으로 하고 노드 ID 나열을 피한다.
- 사용자가 "포트폴리오 페이지 수정하자"고 하면 루트 `AGENTS.md`의 새 채팅 시작 명령대로 오솔길 서가 시안(`mockups/portfolio-shelf.src.html`)과 `../../docs/portfolio/REFERENCES.md`를 불러와 브리핑한다. 서가는 2026-11-18 실제 사이트로 배포 결정됐다.
- 미병합 그로우 시안과 Figma 정리는 `../../docs/PENDING.md`를 확인한다. 이미 병합·승인됐다고 단정하지 않는다.
- 상세 화면 결정과 Figma 체크리스트는 `../../docs/archive/portfolio-instructions-2026-11-06.md`에 원문 보존했다. 옛 소스 경로는 이 폴더 기준이다.
