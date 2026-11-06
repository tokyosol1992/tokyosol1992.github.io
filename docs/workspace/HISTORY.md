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
