# 환경 정리 실행 확인 · 2026-11-06 (Asia/Seoul)

| 환경 표시 이름 | 개발 원본 |
| --- | --- |
| 동물의GYM | `tokyosol1992/animal-gym` |
| MoHo · 포트폴리오 | `tokyosol1992/tokyosol1992.github.io` |
| 렌즈 시뮬레이터 | `tokyosol1992/lens-view-simulator` |
| 아사달 | `tokyosol1992/asadal` |

GitHub 저장소는 총 6개를 보존한다. `animal-gym-review`는 공개 검토 배포 전용이고 `ohsolgil`은 이전 주소·원본 이력 보존용이다. 새 개발은 위 4개에서 한다. 배포용 저장소를 개발 원본으로 선택하거나 개수를 맞추기 위해 삭제하지 않는다.

## 2026-11-06 (Asia/Seoul) · 승인된 통합 실행

- 사용자 승인: 제안한 6단계 플랜을 실행한다. 저장소 삭제나 비공개 원본의 공개 이전은 포함하지 않는다.
- 병합 완료: 동물의GYM [#39](https://github.com/tokyosol1992/animal-gym/pull/39), 공개 검토 [#15](https://github.com/tokyosol1992/animal-gym-review/pull/15) `a73a3710fb73d5d08ac40af7f9fd747b93f3ffb3`, MoHo 통합 [#16](https://github.com/tokyosol1992/tokyosol1992.github.io/pull/16) `4219a601880e213c478886953631e4b229d44ac6`, 이전 주소 호환 [#11](https://github.com/tokyosol1992/ohsolgil/pull/11) `784ede9b3161dac113a028a4d4e8685a3bd31456`.
- 배포 성공: MoHo [42162241924](https://github.com/tokyosol1992/tokyosol1992.github.io/actions/runs/42162241924), 기존 포트폴리오 주소 [42162546782](https://github.com/tokyosol1992/ohsolgil/actions/runs/42162546782), 공개 검토 [42162224658](https://github.com/tokyosol1992/animal-gym-review/actions/runs/42162224658).
- 실서비스 확인: MoHo `/`, 포트폴리오 `/portfolio/`, 검토 `/animal-gym-review/`, 렌즈 `/lens-view-simulator/` 모두 HTTP 200. MoHo 로컬 정적 자산 8개·포트폴리오 2개가 200이고 옛 `/ohsolgil/`의 새 주소 이동 HTML을 확인했다.
- 기존 미병합 후보·브랜치·원본 기록은 보존한다. `ohsolgil` PR #3·#10의 시안은 main에 자동 반영하지 않았다. 두 보조 저장소 모두 아직 보관·삭제하지 않았다. 검토 배포는 계속 갱신하고 포트폴리오 이전 작업은 별도 범위를 정해 재개한다.


## 실제 계정 환경·기록 전달

- Claude에 동물의GYM·MoHo · 포트폴리오·렌즈 시뮬레이터·아사달 전용 Cloud 환경을 만들고 각각 원본 하나만 연결했다. 기존 Default와 대화·Git 브랜치는 보존했다.
- 최초 설치가 저장소 바깥에서 실행된 실패를 고쳐, 환경 스크립트의 런타임 준비와 저장소 위치가 확정된 SessionStart 설치를 분리했다.
- 아사달의 새 Cloud 세션에서 초기화·문서 8개 검사가 성공했다. Claude가 HANDOFF_CHECK·HISTORY·STATUS만 커밋·푸시했고 Codex가 실제 원격 diff를 다시 읽어 검토했다. [아사달 검증 PR #5](https://github.com/tokyosol1992/asadal/pull/5)에 기록했다. 비공개 원장·시나리오·인증 내용은 이 공개 저장소로 복사하지 않는다.
- MoHo의 Claude 실행 확인 세션에서 Node 기본 22 우선 선택을 확인했다. 캐시 Node 24(v24.22.2)를 PATH 앞에 지정한 뒤 전체 빌드가 성공했다. MoHo 15페이지·포트폴리오 1페이지이며 파일 수정·커밋은 요청하지 않았다. 공개 링크를 통한 대화 공유 권한은 변경하지 않았다.
- `scripts/with-node24.sh`는 새 Bash 명령마다 Node 24를 확실히 선택하는 진입점이다. BASH_ENV만으로 항상 기본 Node가 바뀐다고 가정하지 않는다.
- Codex가 Git에 기록한 변경→Claude의 실제 읽기·문서 작성·푸시→Codex 원격 재검토라는 Git 전달을 확인했다. 새 Codex Cloud 환경 자체를 재게시·실행한 검증과는 다르다.

## 검사 범위와 남은 작업

- 네 저장소의 셸 구문·hook JSON·Local 자동 설치 생략 검사 통과. 저장소 밖에서 아사달 기준 문서 8개와 렌즈 광학·카탈로그 검사 통과.
- MoHo·포트폴리오 GitHub 자동 빌드와 Pages 성공·HTTP 200·정적 자산 확인. 이전 포트폴리오 주소의 이동 HTML과 실제 새 포트폴리오 화면을 확인했다.
- Codex 설정 화면은 앞선 브라우저 접근 정책으로 직접 편집할 수 없었다. 사용자의 계정에서 기존 4개 환경의 연결 원본·Node 24·설치·시작 지침을 확인하고 재게시한 뒤 새 작업으로 검증해야 한다. 이 제한을 우회하지 않는다.
- GYM의 실제 앱·전체 모델 검사, 렌즈 WebGPU·장비 정확도 검사를 이번 환경 정리에서 새로 완료한 것으로 확대하지 않는다.
- 보조 저장소 삭제·보관·연결 권한 축소는 하지 않았다. 기존 미병합 후보는 PENDING 문서와 원본 PR에 보존했다.
