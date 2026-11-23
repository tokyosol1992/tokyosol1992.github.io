# 솔길의 웹사이트 작업 공간

MoHo 개인 사이트와 Oh SolGil 포트폴리오를 한 저장소에서 작업하고, 기록은 사이트별로 나눕니다.

| 구분 | 소스 | 이어서 읽을 문서 | 배포 경로 |
| --- | --- | --- | --- |
| MoHo | `sites/moho/` | [현재 상태](docs/moho/STATUS.md) · [히스토리](docs/moho/HISTORY.md) | `/` |
| 포트폴리오 | `sites/portfolio/` | [현재 상태](docs/portfolio/STATUS.md) · [히스토리](docs/portfolio/HISTORY.md) | `/portfolio/` |
| 공통 환경 | `scripts/` | [클라우드 연결](docs/workspace/CLOUD.md) · [이전 기록](docs/workspace/MIGRATION.md) | — |

## 2026-11-23 · OSOL LIBRARY 이력서와 서가 메뉴

- 서가의 첫 권을 이력서로 배치하고 표지 아래에 오솔길의 한 줄 소개를 넣었습니다. 이력서를 열면 데스크톱에서는 소개·PDF 다운로드와 경력을 펼침면에, 모바일에서는 한 열에 표시합니다. `CLOSE / 닫기`를 누르면 보고 있던 책으로 돌아갑니다.
- 분류 메뉴는 RESUME · AI/AX · PLATFORM · DESIGN SYSTEM · OTHER 순서이며 로고와 같은 함렛을 사용합니다. 승인 시안 대비 메뉴 폭을 1440px 화면에서 약 685px → 635px, 390px 화면에서 약 354px → 344px로 줄였습니다.
- 두 사이트 빌드를 통과했습니다. Chromium에서 데스크톱·모바일 화면의 이력서 열기·닫기, PDF 다운로드, 검색, 프로젝트 이동을 확인했습니다. 경력 항목과 PDF는 공개용 자료가 준비될 때까지 시안으로 표시합니다.

[공개 포트폴리오](https://tokyosol1992.github.io/portfolio/) · [PR #24](https://github.com/tokyosol1992/tokyosol1992.github.io/pull/24) · [작업 히스토리](docs/portfolio/HISTORY.md) · [Pages 배포 이력](https://github.com/tokyosol1992/tokyosol1992.github.io/actions/workflows/deploy.yml?query=branch%3Amain)

## 설치와 실행

Node.js 24를 선택한 다음 저장소 루트에서 실행합니다.

```sh
bash scripts/cloud-setup.sh
npm run dev:moho
# 포트폴리오는 다른 터미널에서 npm run dev:portfolio
npm run build
```

코드는 `dist/`에 함께 빌드됩니다. 기존 `/ohsolgil/` 주소는 호환 PR #11 배포를 마쳤으며 새 `/portfolio/`로 이동합니다.

## 기기나 AI를 바꿔 이어가기

두 플랫폼에서 이 저장소를 선택하고 다음처럼 요청합니다.

> AGENTS.md와 docs/portfolio/STATUS.md, docs/portfolio/DECISIONS.md, docs/portfolio/HISTORY.md의 최신 항목을 읽고 포트폴리오 작업을 이어가 주세요. 작업 후 같은 문서에 실제 변경·검증·다음 작업을 기록하고 커밋·PR 상태를 알려주세요.

MoHo는 위 경로의 `portfolio`를 `moho`로 바꿉니다. [미병합 작업](docs/PENDING.md)도 확인합니다. 대화 원문 전체가 두 플랫폼 사이에서 자동 동기화되는 것은 아니며, Git에 저장한 문서와 코드가 공통 인수인계 기준입니다.

## 이번 정리와 인수인계

- [협업·인수인계 규칙](docs/workspace/HANDOFF.md)
- [이번 작업과 PR 진행 기록](docs/workspace/HISTORY.md)
- [통합 PR #16](https://github.com/tokyosol1992/tokyosol1992.github.io/pull/16)은 main 병합·배포를 마쳤습니다. 새 작업은 최신 main에서 작업별 브랜치를 만들고, 기존 작업을 이어받을 때는 기록된 원격 작업 브랜치를 확인합니다.

## 2026-11-06 · 통합 실제 반영

통합 PR #16과 이전 주소 호환 PR #11을 병합하고 Pages 배포를 확인했습니다. [MoHo](https://tokyosol1992.github.io/) · [포트폴리오](https://tokyosol1992.github.io/portfolio/)를 이 저장소에서 개발합니다. [Cloud 인수인계·설치·시작 지침](CLOUD_HANDOFF.md)을 먼저 읽습니다. 각 플랫폼의 환경 저장과 실제 새 세션 검증은 구분합니다.
