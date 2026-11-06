# 솔길의 웹사이트 작업 공간

MoHo 개인 사이트와 Oh SolGil 포트폴리오를 한 저장소에서 작업하고, 기록은 사이트별로 나눕니다.

| 구분 | 소스 | 이어서 읽을 문서 | 배포 경로 |
| --- | --- | --- | --- |
| MoHo | `sites/moho/` | [현재 상태](docs/moho/STATUS.md) · [히스토리](docs/moho/HISTORY.md) | `/` |
| 포트폴리오 | `sites/portfolio/` | [현재 상태](docs/portfolio/STATUS.md) · [히스토리](docs/portfolio/HISTORY.md) | `/portfolio/` |
| 공통 환경 | `scripts/` | [클라우드 연결](docs/workspace/CLOUD.md) · [이전 기록](docs/workspace/MIGRATION.md) | — |

## 설치와 실행

Node.js 24를 선택한 다음 저장소 루트에서 실행합니다.

```sh
bash scripts/cloud-setup.sh
npm run dev:moho
# 포트폴리오는 다른 터미널에서 npm run dev:portfolio
npm run build
```

코드는 `dist/`에 함께 빌드됩니다. 기존 `/ohsolgil/` 주소의 안내 전환은 별도 호환 PR을 MoHo 배포 성공 뒤 병합합니다.

## 기기나 AI를 바꿔 이어가기

두 플랫폼에서 이 저장소를 선택하고 다음처럼 요청합니다.

> AGENTS.md와 docs/portfolio/STATUS.md, DECISIONS.md, HISTORY.md의 최신 항목을 읽고 포트폴리오 작업을 이어가 주세요. 작업 후 같은 문서에 실제 변경·검증·다음 작업을 기록하고 커밋·PR 상태를 알려주세요.

MoHo는 위 경로의 `portfolio`를 `moho`로 바꿉니다. [미병합 작업](docs/PENDING.md)도 확인합니다. 대화 원문 전체가 두 플랫폼 사이에서 자동 동기화되는 것은 아니며, Git에 저장한 문서와 코드가 공통 인수인계 기준입니다.
