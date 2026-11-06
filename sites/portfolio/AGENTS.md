# Oh SolGil 포트폴리오

- 소스는 이 폴더, 상태·결정·기록은 `../../docs/portfolio/`다. 루트 공통 규칙도 적용한다.
- 기존 한 페이지 디자인과 실제 경력·성과 입력 원칙을 유지한다. 경력·성과·요약·연락처는 사용자에게 받은 사실만 쓴다.
- 다크 고정, 파랑 #2895f7, Border Glow, Lenis·진입 효과·모바일 프로젝트 스크롤·검색을 유지한다. Soft Aurora와 오로라 배경은 사용자 철회 사항이므로 되살리지 않는다.
- 기간은 `src/lib/period.ts`의 YYYY - YYYY / YYYY.MM.DD 규칙을 따른다. 연차 표기를 새로 넣지 않는다.
- `backdrop-filter`는 `blur(0)` 대신 `blur(.1px)`, -webkit- 속성을 표준 속성보다 앞에 둔다. Lenis 시작·정지는 html 클래스 관찰 대신 이벤트로 처리한다.
- 사용자가 "포폴 사이트에 올릴 작업 시작하자"고 하면 `../../docs/portfolio/STATUS.md`와 `FIGMA.md`로 진행 상황을 먼저 설명한다. Figma 설명은 화면 이름으로 하고 노드 ID 나열을 피한다.
- 미병합 그로우 시안과 Figma 정리는 `../../docs/PENDING.md`를 확인한다. 이미 병합·승인됐다고 단정하지 않는다.
- 상세 화면 결정과 Figma 체크리스트는 `../../docs/archive/portfolio-instructions-2026-11-06.md`에 원문 보존했다. 옛 소스 경로는 이 폴더 기준이다.
