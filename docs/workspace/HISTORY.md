## 2026-11-06 · 교차검증 완료와 Node 실행 경로 고정

아사달의 Claude 검사·문서 커밋을 Codex가 원격에서 재검토해 PR #5로 보관했다. MoHo는 새 Claude 세션에서 기본 Node 22 우선 선택을 발견했고 캐시 Node 24(v24.22.2)를 명시한 전체 빌드가 통과했다. 일반 명령에도 같은 선택을 적용하는 with-node24 진입점을 추가했다. 환경 저장과 실제 확인·Codex 재게시 범위를 구분하며 원본·화면·모델은 유지한다.


## 이번 변경의 로컬 검사

네 저장소의 셸 구문·SessionStart JSON·일반 Local 세션의 자동 설치 생략을 확인했다. 저장소 밖 `/tmp`에서 아사달 기준 문서 8개 읽기와 렌즈 광학·카탈로그 검사를 실행해 통과했다. 렌즈 GPU·브라우저 검사나 실제 앱 전체 검사를 새로 통과한 것으로 확대하지 않는다.

## 2026-11-06 (Asia/Seoul) · 승인된 통합 실행

- 사용자 승인: 제안한 6단계 플랜을 실행한다. 저장소 삭제나 비공개 원본의 공개 이전은 포함하지 않는다.
- 병합 완료: 동물의GYM [#39](https://github.com/tokyosol1992/animal-gym/pull/39), 공개 검토 [#15](https://github.com/tokyosol1992/animal-gym-review/pull/15) `a73a3710fb73d5d08ac40af7f9fd747b93f3ffb3`, MoHo 통합 [#16](https://github.com/tokyosol1992/tokyosol1992.github.io/pull/16) `4219a601880e213c478886953631e4b229d44ac6`, 이전 주소 호환 [#11](https://github.com/tokyosol1992/ohsolgil/pull/11) `784ede9b3161dac113a028a4d4e8685a3bd31456`.
- 배포 성공: MoHo [42162241924](https://github.com/tokyosol1992/tokyosol1992.github.io/actions/runs/42162241924), 기존 포트폴리오 주소 [42162546782](https://github.com/tokyosol1992/ohsolgil/actions/runs/42162546782), 공개 검토 [42162224658](https://github.com/tokyosol1992/animal-gym-review/actions/runs/42162224658).
- 실서비스 확인: MoHo `/`, 포트폴리오 `/portfolio/`, 검토 `/animal-gym-review/`, 렌즈 `/lens-view-simulator/` 모두 HTTP 200. MoHo 로컬 정적 자산 8개·포트폴리오 2개가 200이고 옛 `/ohsolgil/`의 새 주소 이동 HTML을 확인했다.
- 기존 미병합 후보·브랜치·원본 기록은 보존한다. `ohsolgil` PR #3·#10의 시안은 main에 자동 반영하지 않았다. 두 보조 저장소 모두 아직 보관·삭제하지 않았다. 검토 배포는 계속 갱신하고 포트폴리오 이전 작업은 별도 범위를 정해 재개한다.

## 플랫폼 확인과 초기화 수정

- Claude: 같은 한글 이름의 전용 Cloud 환경 4개를 생성하고 각각 원본 하나만 연결했다. 기본 Default 환경·기존 대화는 보존한다. 환경 선택으로 지정된 저장소를 선택할 수 있으며 전체 저장소 검색 목록을 4개로 제한했다고 가정하지 않는다.
- Claude 읽기 시험: 아사달의 새 Cloud 세션에서 새 원본 `tokyosol1992/asadal`, AGENTS·CLAUDE·이름 변경 이력과 인수인계 규칙을 읽었다. 파일 수정·커밋·푸시는 하지 않도록 제한했다.
- 실패·수정: 최초 설치가 저장소 바깥에서 시작되어 `git rev-parse`와 기준 문서 읽기가 실패했다. 환경 설치는 저장소와 무관한 런타임 준비만 수행하고, 실제 저장소 설치는 `CLAUDE_PROJECT_DIR`가 정해지는 SessionStart에서 실행하도록 바꿨다. 실패 이력과 읽기 성공을 구분한다.
- Node 프로젝트 환경: npm으로 Node 24를 외부 캐시에 준비하며 `BASH_ENV=/root/.cache/ai-cloud/node24-env.sh`로 새 Bash 명령의 PATH를 맞춘다. 시크릿·네트워크 권한은 추가하지 않는다. 아사달은 Python 확인만 필요하다.
- Codex: 계정 환경 설정 화면은 앞선 브라우저 보안 정책으로 접근이 차단됐다. 이 작업에서 재게시나 새 Codex Cloud 세션 시험을 완료했다고 기록하지 않는다. 저장소 파일 변경은 적용됐으므로 계정 환경 편집에서 재게시한 뒤 새 작업으로 확인해야 한다.
- 다음 검증: 이 수정 이후의 새 Claude 세션에서 설정 스크립트·SessionStart 성공을 확인한다. 세션을 열기 전에 최신 원격 main과 환경의 연결 저장소를 확인한다. 두 플랫폼 간 양방향 실제 세션 시험은 아직 완료 전이다.

## 2026-11-06 후속 · GitHub 저장소 이름 정리 (Asia/Seoul)

- 사용자 요청: Claude의 저장소 목록에서도 프로젝트를 쉽게 구분하고 변경 이력을 Git에 남긴다.
- 완료: `asadal-g1 → asadal`, `stretching-app-product → animal-gym`. 각 저장소의 동일 ID·이름 변경 전후 main SHA·기존 브랜치·비공개 상태를 확인했다. [아사달 기록 PR #3](https://github.com/tokyosol1992/asadal/pull/3)과 [동물의GYM 기록 PR #40](https://github.com/tokyosol1992/animal-gym/pull/40)은 main에 반영했다.
- 유지: 현재 MoHo 저장소와 렌즈·공개 검토·기존 포트폴리오는 Pages 주소 변경을 피하기 위해 이름을 유지했다.
- 반영: 공통 Cloud 표와 현재 개발 원본 지침을 새 이름으로 갱신했다. 과거 기록의 예전 이름·커밋 링크는 당시 사실로 보존한다.
- 한계·다음: Claude·Codex의 목록 캐시와 실제 연결은 각 서비스에서 새로고침·확인한다. 코드·모델·공개 사이트는 변경하지 않았으며 MoHo 통합 PR #16·원본 통합 PR #39는 main 미병합이다.

# 공통 환경 작업 기록

## 2026-11-06 후속 · README와 다른 AI 인수인계 확인

- 사용자 확인 요청: 각 프로젝트·환경에서 기록을 읽고 다른 AI로 바꿔도 충돌을 줄일 수 있도록 남겼는지 확인한다.
- 반영: 각 사이트·앱 폴더 README에서 원본 지침·현재 상태·결정·히스토리·환경 안내로 연결했다. 순차 인수인계와 동시 작업의 브랜치 분리 규칙을 보강했다.
- 실제 Git 상태: 아래 PR은 생성됐고 아직 main 미병합이다. 통합 규칙을 지금 읽으려면 각 저장소의 `codex/unify-cloud-workspaces-20261106` 브랜치를 선택한다.
- [MoHo·포트폴리오 통합 #16](https://github.com/tokyosol1992/tokyosol1992.github.io/pull/16)
- [동물의GYM 정리 #39](https://github.com/tokyosol1992/stretching-app-product/pull/39)
- [동작검토 배포 지침 #15](https://github.com/tokyosol1992/animal-gym-review/pull/15)
- [기존 포트폴리오 주소 호환 #11](https://github.com/tokyosol1992/ohsolgil/pull/11) — 통합 배포 성공 뒤 적용하는 초안.
- 검증: 기존 통합 코드의 MoHo 15페이지·포트폴리오 1페이지 로컬 빌드와 GitHub 자동 빌드가 성공했다. 이번 후속은 문서만 보강하며 코드·배포·계정 설정은 변경하지 않는다.
- 미완료: 사용자 병합 확인, 실제 Pages 전환, Codex·Claude의 계정별 Cloud 환경 적용·새 세션 검증. 자동 잠금이나 충돌 완전 차단을 구성했다고 보고하지 않는다.

## 2026-11-06 · Codex/Claude 클라우드 작업 기준 통합

- 요청: 여러 기기·AI에서 Git의 기록을 읽고 이어갈 수 있도록 저장소와 환경을 정리한다. MoHo와 포트폴리오는 합치고 기록은 구분한다.
- 반영: 두 사이트를 npm workspaces로 분류하고 루트 설치·빌드·배포 진입점을 통합했다. 짧은 공통 AGENTS와 사이트별 STATUS/DECISIONS/HISTORY를 구성했다.
- 보존: 기존 두 지침 원문, 각 HISTORY, MoHo PLAN, 포트폴리오 원본 커밋·브랜치 링크, 열린 PR 4건의 패치를 보존했다. 예전 PR을 임의 병합·닫기·삭제하지 않았다.
- 렌즈 시뮬레이터: 독립 저장소 유지 후 MoHo에서 연결하는 방식을 권장했다. 사용자의 결정과 실제 연결은 후속이다.
- 계정 설정: 연결된 브라우저의 보안 정책이 Codex 설정 화면 탐색을 차단했다. 계정별 환경 설정을 적용·게시했다고 기록하지 않는다.
- 검증: 실제 결과는 이 변경의 PR 본문과 `MIGRATION.md`의 검증 기록을 확인한다.
- 다음: 사용자 확인→통합 PR 병합·Pages 확인→옛 주소 호환 PR 병합→두 플랫폼에서 클라우드 환경 재설정·새 세션 확인.
