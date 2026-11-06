# MoHo · Oh SolGil 공통 작업 기준

## 시작할 때

이 저장소는 MoHo 개인 사이트와 Oh SolGil 포트폴리오의 공통 원본이다. Codex와 Claude Code는 같은 파일을 기준으로 작업한다. 한국어 존댓말로 결론부터 설명한다.

1. 현재 브랜치·작업 트리와 원격 변경을 확인한다. 미커밋 작업을 덮어쓰거나 자동으로 reset하지 않는다.
2. 요청이 MoHo인지 포트폴리오인지 구분하고 아래 해당 폴더의 `AGENTS.md`, `STATUS.md`, `DECISIONS.md`, 최신 `HISTORY.md` 항목을 읽는다. 두 영역을 바꾸면 양쪽 기록을 갱신한다.
3. 미병합 작업은 `docs/PENDING.md`에서 확인한다. 과거 시안이나 보류 PR을 현재 승인본으로 취급하지 않는다.

| 작업 | 소스 | 진행·결정·기록 |
| --- | --- | --- |
| MoHo 개인 사이트 | `sites/moho/` | `docs/moho/` |
| Oh SolGil 포트폴리오 | `sites/portfolio/` | `docs/portfolio/` |
| 공통 환경·저장소 구조 | 루트 `scripts/`, 설정 파일 | `docs/workspace/` |

## 실행 환경

- Node.js 24, npm workspaces. 저장소 루트에서 `bash scripts/cloud-setup.sh`로 설치한다.
- MoHo: `npm run dev:moho`(4321), 포트폴리오: `npm run dev:portfolio`(4322).
- 코드·구조·의존성을 바꾸면 `npm run build`로 두 사이트를 검증한다. 화면 변경은 모바일과 데스크톱도 확인한다.
- `npm run build`는 `dist/`에 MoHo와 `dist/portfolio/`에 포트폴리오를 구성한다. 배포 설정은 `.github/workflows/deploy.yml` 한 곳에 둔다.
- 환경변수와 도구 연결은 `docs/workspace/CLOUD.md`를 확인한다. 저장소 파일이 있다는 이유로 플랫폼 로그인·MCP 인증이 완료됐다고 보고하지 않는다.

## 기록과 인수인계

- 새 작업은 최신 `main`에서 `codex/<주제>` 또는 `claude/<주제>` 브랜치를 만든다. 서로 다른 AI가 같은 브랜치를 동시에 수정하지 않는다.
- 작업 중 바뀐 결정과 실패·철회 이유를 해당 영역의 `HISTORY.md`에 한국 시간 날짜로 기록한다. 요청, 사용자 결정, 변경, 검증, 남은 일, 근거 경로·커밋·PR을 적는다.
- 끝날 때 해당 `STATUS.md`의 현재 상태·다음 작업을 갱신한다. 로컬 저장, 원격 커밋, PR, main 병합, 배포 상태를 구분한다.
- main에 직접 push하지 않고 PR을 만든다. 기존 작업 원칙대로 사용자의 확인 후 병합한다.
- 긴 과거 기록을 이 파일에 누적하지 않는다. 원본 지침·히스토리·미병합 패치는 `docs/archive/`에 보존한다. 이전 결정 확인이 필요할 때 관련 부분을 읽는다.
- 경력·성과·연락처·사용자 반응을 지어내지 않는다. 토큰·비밀번호·개인 로컬 설정을 커밋하지 않는다.

## 저장소 관계

- `ohsolgil`은 전환 PR 병합·배포 후 기존 주소를 새 `/portfolio/`로 안내하는 호환용 저장소다. 앞으로 포트폴리오 소스 작업은 여기서 한다.
- `lens-view-simulator`는 독립 원본을 유지한다. MoHo에서 연결하는 방식을 권장했으며, 실제 통합·공개 경로 변경은 사용자가 결정한 뒤 진행한다.
- 동물의GYM 작업은 별도 비공개 `animal-gym`(이전 `stretching-app-product`)에서 한다. 그 비공개 소스나 제작 원장을 이 공개 저장소에 복사하지 않는다.

## AI 전환·동시 작업

`docs/workspace/HANDOFF.md`를 적용한다. 이어받기는 기록된 작업 브랜치에서 단독 진행하고, 병렬 작업은 작업별 브랜치로 나눈다. main 미병합 PR을 완료·배포 상태로 판단하지 않는다.

## 통합 실행 상태 · 2026-11-06

통합 PR #16과 옛 주소 호환 #11이 병합·배포됐다. 새 작업은 최신 main에서 시작하고 `CLOUD_HANDOFF.md`의 실제 계정 설정·초기화 실패 수정·인수인계를 따른다. Claude SessionStart 설치는 Cloud에서만 실행한다. Codex 계정 환경 재게시와 새 세션 검증은 별도 미확인이다.
