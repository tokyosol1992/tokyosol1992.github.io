# MoHo 현재 상태

기준: 2026-11-06. 통합 PR #16 main 병합·Pages 배포 완료.

- 기존 MoHo 소스를 `sites/moho/`로 분류했다. 화면 구성과 콘텐츠는 보존했다.
- 홈 하프톤·연기·pill 헤더·소개/Work/Library/Contact 흐름이 기존 main에 있다. 홈 외 페이지는 예전 디자인이 남고 콘텐츠는 샘플이다.
- 포트폴리오 소스는 `sites/portfolio/`, 새 경로는 `/portfolio/`다. 기존 `/ohsolgil/`는 호환 PR #11 배포 후 새 `/portfolio/`로 이동한다.
- PR #13·#15의 미병합 문서 수정은 `../PENDING.md`에 별도 기록했다. 이번 통합을 이유로 완료·폐기하지 않는다.

## 다음 작업

1. 통합 #16·주소 호환 #11의 병합·Pages 성공 확인을 마쳤다. 새 개발은 최신 main의 작업별 브랜치에서 시작한다.
2. 기존 미병합 작업은 PENDING에서 확인하고 요청한 범위만 옮긴다.
3. Codex·Claude Code의 클라우드 원본을 이 저장소로 맞춘다(`../workspace/CLOUD.md`).
4. 실제 사이트 개선은 사용자 우선순위에 따라 재개한다. 렌즈 시뮬레이터의 연결 방식은 아직 결정 전이다.

## Cloud 확인 범위

Claude **MoHo · 포트폴리오** 환경에 이 원본 하나를 연결했다. 런타임 준비와 저장소별 SessionStart 설치를 분리했다. 환경 저장과 이 저장소의 새 세션 설치·Codex 재게시·양방향 시험은 구분한다. 상세는 루트 `CLOUD_HANDOFF.md`를 따른다.
