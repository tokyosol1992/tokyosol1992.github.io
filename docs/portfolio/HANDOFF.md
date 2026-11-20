# 포트폴리오 서가 인수인계 (2026-11-19 기준, Claude → 다른 AI·다음 세션)

이 파일만 읽어도 이어서 작업할 수 있게 정리했다. 더 자세한 경위는 `HISTORY.md`(최신 항목부터), 결정은 `DECISIONS.md`, 상태는 `STATUS.md`, 책 후보·근거는 `PROJECTS.md`, Figma 구조는 `FIGMA.md`.

## 1. 저장 상태

| 항목 | 상태 |
| --- | --- |
| 작업 브랜치 | `claude/sharp-volta-tdqx1r` (원격에 푸시됨). 같은 브랜치를 두 AI가 동시에 수정하지 않는다. |
| main 병합·배포 | **하지 않음.** 실제 `/portfolio/`는 2026-11-18 배포본(샘플 9권) 그대로다. PR도 만들지 않았다. |
| 서가 원본 | `sites/portfolio/mockups/portfolio-shelf.src.html` — 실제 프로젝트 22권 반영(v15). 실제 페이지(`src/pages/index.astro`)와 아티팩트가 이 파일을 그대로 쓴다. |
| 아티팩트(Claude 전용) | https://claude.ai/artifact/94oDmyLEhfM49CYWkNja8s (Version 23). 다른 AI는 이 링크를 못 열 수 있으니 저장소 파일을 기준으로 한다. |
| Figma 템플릿 | 파일 `WqDqO6r4ukeLLNhAm4qIRl`(최종 26_PF_작업중)의 `템플릿` 페이지(`146:1627`). 코드와 직접 연결돼 있지 않다. |
| 검증 | `npm run build` 성공, Chromium 1440×960·390×800에서 책 넘김·포스터 표지·상세 열기 확인, 콘솔 오류 없음. **Safari·실제 배포 주소는 이번 변경분 미확인.** |

## 2. 지금 서가의 구조 (코드)

- `PROJECTS` 배열(원본 안, `(function () {` 바로 아래)이 책 목록이다: `t`(상세 제목 줄) · `ko`(책등/캡션) · `sp`(긴 책등 제목 줄임) · `co`(회사) · `g`(분류 ai/platform/system/etc) · `kind`(app/web/kiosk) · `c`(배경색, 포인트색). 순서 = 최근 재직 순. 책 수 `N`은 배열 길이다.
- 포스터 표지 템플릿: CSS `.cv.pst`(앱·웹·키오스크 틀), JS `posterHTML`. 종이 헤짐 레이어는 포스터 위에서 55%로 옅게 했다.
- 화면 이미지: `POSTER_IMG`(`POSTERS:BEGIN~END` 표식 사이)는 `mockups/posters/NN.png`(NN = 목록 순서, 0부터)에서 `poster-build.py`가 채운다. 이미지는 560px 이하 WebP data URI로 한 파일에 들어가므로 원본이 약 840KB다.
- 글꼴: 한글은 SUIT 부분 글꼴(`suit-subset.py`), 함렛은 가운데 제목만. 문구를 바꾸면 SUIT를 다시 만든다.
- 분류는 가안이다(AI/AX 5권, 디자인 시스템 1권, 기타 = 키오스크 4권, 나머지 플랫폼). 기간·역할·요약은 모두 입력 예정(`YYYY`)이다.

## 3. 책별 메인 화면 출처 (책 번호 = `posters/NN.png`)

Figma 파일 키 / 노드 ID. 해상도를 높이거나 다른 화면으로 바꿀 때 `get_screenshot`을 이 노드로 부른다.

| NN | 책 | 파일 키 | 노드 | 틀 |
| --- | --- | --- | --- | --- |
| 00 | CDI+ 서비스 | `MQ1RppSSdSaRj3PHx0XjXx` | `1955:8534` | web |
| 01 | CDI+ 디자인 시스템 | `0lsZPUdN0Kh8AyPczT9VNc` | `1:4`(표지 프레임) | web |
| 02 | 평화이즈 | `mpG2oWr4eii0oYZkD0Ih86` | `789:685` | app |
| 03 | 커넥트케어 | `PeITQUowCJxS0UqKCCGc4S` | `17441:110346` | app |
| 04 | ASP-CDSS | `hEadQFtuBs47OrLsDEghhN` | `670:2270` (내용 적음, 교체 후보) | web |
| 05 | 소아 약 용량 계산기 | `9n3cUxTWDoxXwM2idxtjh8` | `205:567` (교체 후보: `205:422` 계산 결과) | web |
| 06 | 참약사 | `gNG5o90KnXDI2DiySFN1Bi` | `6521:3500` | kiosk |
| 07 | ARPA-H 시니어앱 | `Z1jKxZ2cLrQo0j2DVS0lXB` | `971:32` | app |
| 08 | 삼성생명 PoC | `Sn6QjPrkjaVJhcHyRA8pZY` | `505:46949` | web |
| 09 | 식봄 | `rLaVXrhgPsns6wQliVql98` | `2:3421` | app |
| 10 | Grow | `oXAFdmcpKOnHG5b1Darl3f` | `0:1257` | app |
| 11 | 할인꾹 | `qs6zCBSbOSKiDQrSii32tc` | `0:2` | app |
| 12 | 파트너 오피스 | `UEmAx9MhgvR6wWbTwWipiW` | `0:2726` | web |
| 13 | 해피포인트 | `mUIi4lO9HqpmIRQQGnDWLv` | `0:2016` | app |
| 14 | 해피오더 | `xddC8UfIIPMAVMmwdAtcdg` | `0:10766` | app |
| 15 | 바르미 | `cgnyUc8zSikz3pHjIqLJSk` | `0:2587` | app |
| 16 | 링고 | `UatcNIWaUOMSZSnXMQvzne` | `0:2` | app |
| 17 | 시티델리 | `6Jme8kN5l84zWtWJzo9oe1` | `0:1231` | app |
| 18 | 올가 키오스크 | `ETUsYJZmt1A1ma6OnQuclQ` | `0:81` | kiosk |
| 19 | 던킨 키오스크 (= 해피스테이션) | `chCOt3lQ6G73n1ckJgWkHT` | `0:4` | kiosk |
| 20 | 배스킨라빈스31 키오스크 | `WqDqO6r4ukeLLNhAm4qIRl` | `63:13065`(이전 포트폴리오 슬라이드, 왼쪽 화면을 (848,262)-(1232,950)로 자름, 약간 흐림 — 원본 파일 필요) | kiosk |
| 21 | KACO | `MpYYilBBZhXMGz2nO7FBL5` | `0:669` | app |

이미지 가공: 앱은 폭×2.2, 웹은 폭×0.8, 키오스크는 폭×1.8 높이로 위에서 자른 뒤 `poster-build.py`로 넣었다. Figma `get_screenshot`은 큰 프레임도 1배로만 줘서 상세 화면에서 약간 흐리다(Figma 템플릿을 2배로 만들면 해결).

## 4. Figma 템플릿 (파일 `WqDqO6r4ukeLLNhAm4qIRl`, 페이지 `템플릿` = `146:1627`)

- 안내 `148:1055` / 01 표지 섹션 `149:1071`(`Cover` 컴포넌트 세트 `149:1070`: Type=App·Web·Kiosk, 속성 `Title#149:0`·`Company#149:4`, 안전 여백 가이드 `153:1164`) / 02 설명 섹션 `149:1138`(`Field` `149:1098`, `Info` `149:1101`, 식봄 예시 `149:1139`, 위치 표 `149:1176`) / 03 상세 섹션 `152:1229`(예시 `152:1141`, 컴포넌트 `152:1125` `152:1128` `152:1132` `152:1135` `152:1138`).
- 변수: `OSOL Base`(`VariableCollectionId:148:1044`), `Cover Color`(`...148:1051`, 모드 식봄 `148:1`·CDI+ `148:2`·던킨 `148:3`).
- 글자 칸 이름(코드가 읽을 규칙): `#title #company #group #kind #period #team #role #contribution #summary #problem #process #result #link`.
- 식봄 예시의 기간·인원·기여·결과는 이전 포트폴리오 슬라이드 값이며 사용자 확인 전이다.

## 5. 환경에서 알게 된 것

- Figma 도구: 페이지 단위 `get_metadata`는 수십만 자라 파일로 저장된다. 쏟아내지 말고 `mockups/tools/figma-top-frames.py <저장 파일>`로 큰 프레임만 뽑은 뒤 노드로 `get_screenshot`을 부른다. 스크린샷 URL은 `www.figma.com`에서 받는다(허용 필요).
- `use_figma`는 쓰기 도구다. 사용자 작업 파일에는 사용자가 지정한 `템플릿` 페이지에만 썼다. 플러그인 API로 새 이미지를 만들 수 없고(`createImageAsync` 불가) 파일 안의 이미지 채우기만 재사용한다. 이미지 업로드 도구는 `mcp.figma.com` 접속이 필요한데 이 환경에서는 막혀 있다(허용 호스트 추가 필요, 아직 안 함).
- 이 Cloud 환경 `MoHo · 포트폴리오`의 허용 호스트에 `www.figma.com`, `kr.pinterest.com`을 추가했다(사용자 승인). 환경은 계정 설정이므로 다른 환경·세션에는 없을 수 있다.
- 핀터레스트: `my_pins`는 로그인 전용이라 도구로 볼 수 없고, 공개 검색은 자바스크립트로 그려져 목록이 비며, 내부 API 호출은 권한 판단으로 막혔다(우회하지 않음). 레퍼런스는 사용자가 캡처를 첨부해야 한다.
- 검증 도구: `mockups/tools/shelf-check.js`(Playwright로 책 넘김·상세 열기·콘솔 오류 확인). SUIT 글꼴 재생성은 `npm pack @sun-typeface/suit@2.0.5`로 받은 `SUIT-Variable.woff2`와 `pip install fonttools brotli`가 필요하다. Node는 `bash scripts/with-node24.sh`로 실행한다.

## 6. 다음 작업 (우선순위)

1. 표지·상세 디자인을 레퍼런스 방향으로 수정(Figma `템플릿` 페이지에서). 레퍼런스 캡처 5~8장(표지/상세 구분)을 받거나, 공개 웹 조사로 수정안 2~3가지를 만든다. 현재 약한 점: 표지 제목이 작고 화면 주변이 비어 보임, 상세 위쪽 여백과 섹션 간격이 큼.
2. 22권의 표지·설명·상세를 템플릿 복제로 제작하고, 표지를 `posters/NN.png`(2배 크기 권장)로 내보낸 뒤 `poster-build.py`로 서가에 넣는다. 상세를 서가 코드(현재 한 화면형)에서 스크롤형으로 바꾸는 작업이 따로 필요하다.
3. 사용자에게 받을 것: 분류 확정, 기간(YYYY.MM.DD 규칙)·역할·요약, 대표 화면 교체 요청, 공개 가능 범위(원스글로벌 재직 중 작업, 삼성생명 PoC 등 — `posters/`와 서가 파일에 실제 서비스 화면이 들어 있음), `mcp.figma.com` 허용 여부, 메뉴 채움 순서(분류별로 묶을지 최근 재직 순을 유지할지), 던킨·배스킨라빈스31 시기(슬라이드: 던킨 2019.04~2019.08).
4. 배포 전: 이미지로 커진 파일(약 840KB) 크기 검토, Safari 확인, PR 생성 후 사용자 확인을 받고 병합한다(main 직접 푸시 금지).

## 7. 지키는 규칙

- 경력·성과·기간·연락처를 지어내지 않는다. 슬라이드에서 옮긴 값은 "확인 전"으로 표시한다.
- 사용자 작업 Figma 파일의 지정한 페이지 밖은 수정하지 않는다. 쓰기 전에 사용자 지시를 확인한다.
- 같은 브랜치를 두 AI가 동시에 수정하지 않는다. 끝낼 때 `HISTORY.md`·`STATUS.md`를 갱신하고 커밋·푸시한다.
