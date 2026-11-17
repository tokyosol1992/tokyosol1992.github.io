# MoHo

- 소스는 이 폴더, 작업 기록은 `../../docs/moho/`다. 루트의 공통 규칙도 적용한다.
- MoHo는 팁·AI·툴·기록 라이브러리다. 포트폴리오 작업은 `../portfolio/`에서 한다.
- 현재 배포된 홈은 다크 고정, SUIT Variable, Hahmlet 900 하프톤+파란 연기, 클릭 충격파다. 2026-11-16 사용자가 이 아이덴티티를 전면 교체하기로 결정했으나 확정 시안은 아직 없다. 새 시안이 확정되기 전에는 `src/`의 기존 디자인을 임의로 바꾸지 않는다. 현재 시안·레퍼런스는 `../../docs/moho/STATUS.md`, `REFERENCES.md`를 본다. 디자인 변경은 시안 검토 흐름을 따른다.
- 사용자가 "moho 작업하자"고 하면 루트 `AGENTS.md`의 새 채팅 시작 명령대로 브리핑부터 한다.
- `src/styles/global.css`의 토큰과 `src/lib/url.ts`의 링크 헬퍼를 우선한다. 내부 링크에 배포 base 경로를 반영한다.
- 스크램블 효과, 화면 모서리 HUD, 조준 사각형 전환, 소리는 다시 넣지 않는다. ClientRouter 페이지별 동작은 `astro:page-load`, 정리는 `astro:before-swap`에서 한다.
- 콘텐츠는 여전히 샘플이다. 사용자 지시 없이 실제 Figma 포트폴리오나 추정 경력·성과를 채우지 않는다.
- 상세 과거 결정은 `../../docs/archive/moho-instructions-2026-11-06.md`, 개편 계획은 `../../docs/moho/PLAN.md`에서 필요한 부분을 확인한다. 그 문서의 옛 루트 소스 경로는 현재 이 폴더 기준이다.
