# 기기·AI를 바꿔 이어가는 방법

## 공통 원본

| 환경 표시 이름 | 원본 저장소 | 설치·검사 |
| --- | --- | --- |
| MoHo · Portfolio | `tokyosol1992/tokyosol1992.github.io` | Node 24, `bash scripts/cloud-setup.sh`, `npm run build` |
| 모여봐요 동물의GYM | `tokyosol1992/animal-gym`(비공개) | Node 24, 기존 `bash scripts/cloud-setup.sh`, `cd apps/mobile && pnpm typecheck` |
| Lens View Simulator | `tokyosol1992/lens-view-simulator` | Python 3 정적 서버, Node·Chromium GPU 검사는 해당 README 확인 |
| 아사달 | `tokyosol1992/asadal`(비공개) | 문서 단계. 코드 구현 전까지 별도 설치 불필요 |

`animal-gym-review`는 동작검토 배포용, `ohsolgil`은 옛 주소 호환용으로 두고 새 개발 환경의 원본으로 선택하지 않는다. 기존 세션의 미커밋 작업은 해당 브랜치에 보관한 뒤 환경을 바꾼다.

## Codex

웹 또는 앱에서 Settings > Codex Cloud > Environments로 들어가 해당 원본을 선택한다. 기존 환경이 있으면 Edit로 수정한다. Node 24와 위 설치·검사 명령을 지정하고 테스트한 뒤 Publish/Republish한다. 새 세션에서 두 사이트 실행과 최신 지침을 확인한다. 기존 세션은 자신의 상태를 유지하므로 새 환경을 선택했다는 이유로 기존 세션의 변경이 main에 들어갔다고 가정하지 않는다.

## Claude Code

claude.ai/code 또는 앱의 환경 선택기에서 Cloud를 선택한다. GitHub 연결에 위 원본 저장소 접근이 있는지 확인한다. 같은 Node·설치 명령을 사용하고 `CLAUDE.md`가 `AGENTS.md`를 불러오는지 새 세션에서 확인한다. 컴퓨터의 Local 세션과 원격 Cloud 세션을 구분한다. 로컬 ~/.claude 설정이나 로그인 세션이 클라우드로 자동 복사된다고 가정하지 않는다.

## 연결 완료 확인

1. 현재 저장소, 브랜치, 커밋과 해당 영역 STATUS의 다음 작업을 답하게 한다.
2. 설치 후 MoHo·포트폴리오 전체 빌드를 실행한다.
3. 다음 작업에서 코드를 변경하고 해당 영역 HISTORY·STATUS를 같이 커밋한다. 원격 브랜치와 PR 링크를 확인한다.
4. 다른 기기·다른 AI의 새 Cloud 세션에서 그 브랜치를 선택하고 같은 기록이 읽히는지 확인한다.

Figma·Blender·Tripo 같은 도구는 각 플랫폼의 연결·인증을 따로 확인한다. 연결 정의와 인증 완료는 다른 상태다. 토큰이나 개인 인증파일을 이 저장소에 저장하지 않는다.

## 공식 참고

- https://learn.chatgpt.com/docs/environments/cloud-environments
- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://code.claude.com/docs/en/claude-code-on-the-web
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/settings

이 변경에서는 브라우저 보안 정책 때문에 계정 환경 화면에 접근하지 못했다. GitHub 변경과 계정 환경 게시를 구분해 보고한다.

## 저장소 이름 정리 · 2026-11-06

아사달은 `asadal-g1 → asadal`, 동물의GYM은 `stretching-app-product → animal-gym`으로 변경했다. 두 저장소의 README와 `REPOSITORY.md`는 main에 반영했다. 각 플랫폼은 저장소 목록을 새로고침하고 새 원본을 확인한다. 예전 전체 저장소명·고정 폴더 경로를 환경 설정에 사용했다면 새 이름 또는 저장소 루트 탐색으로 갱신한다.

이 공개 저장소와 `lens-view-simulator`·`animal-gym-review`·`ohsolgil`의 이름은 기존 Pages 주소를 보존하기 위해 유지했다. 이 이름 변경은 현재 MoHo·포트폴리오 통합 PR의 병합·배포 완료를 의미하지 않는다.

## 2026-11-06 · 실행 결과와 최신 시작 안내

통합 #16·옛 주소 호환 #11을 병합·배포했다. Claude의 전용 Cloud 환경 4개를 실제로 생성해 원본 하나씩 연결했다. 전체 저장소 검색을 4개로 제한한 것은 아니며 환경 선택으로 지정된 원본에서 시작한다. 환경 설치의 위치 오류를 발견해 Node 24 준비와 저장소별 SessionStart를 분리했다.

계정별 실제 확인 결과·실패 기록·설치 명령·Codex 시작 스킬은 루트 `CLOUD_HANDOFF.md`를 최신 기준으로 사용한다. 기존의 설정 화면 접근 차단 기록은 Codex에 해당한다. Claude 계정 설정 저장을 Codex 환경 재게시 완료로 확대하지 않는다.
