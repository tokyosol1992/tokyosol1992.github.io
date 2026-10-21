# 프로젝트 인수인계 노트 (AI 작업자용)

이 파일은 다른 대화·다른 모델이 이 사이트 작업을 바로 이어받을 수 있도록 지금까지의 결정과 현재 상태를 정리한 문서입니다.
작업을 시작하기 전에 끝까지 읽고, 작업이 끝나면 **「현재 상태」와 「다음 할 일」을 갱신**해 주세요.

- 사이트: https://tokyosol1992.github.io
- 저장소: https://github.com/tokyosol1992/tokyosol1992.github.io
- 사용자와는 **한국어**로 대화합니다. 사이트 UI 문구도 한국어가 기본입니다.

---

## 1. 무엇을 만드는가

8년 차 프로덕트 디자이너 **솔길**의 개인 사이트.
포트폴리오(케이스 스터디)뿐 아니라 **본인이 쓰는 팁, AI 활용법·프롬프트, 툴, 작업 기록**처럼 다른 사람이 보고 배울 수 있는 글을 **항목(카테고리)별로 모아 보여주는 라이브러리** 형태.

- 레퍼런스 (2026-10-21 확정)
  - **https://chronothreads.webflow.io/** — 전체 분위기: 3D 연출·인터랙션, 어두운 톤, HUD 디테일(코너 브래킷, `[01]` 번호, 수치, 터미널 로딩, 시계)
    - 원본 스택: Three.js, GSAP+ScrollTrigger, Lenis, Howler, Splitting / 색 `#15151c` `#f0ebe5` `#575558` `#0583f2` / 폰트 PP NeueBit·Mori·Mondwest(유료 → 무료 대체)
  - **https://huddling.ai/** — **메뉴 구성과 메뉴 진입 시 리스트만** 참고 (상단 가로 메뉴 = 항목, 목록 = 제목·설명 → 유형 필터+개수 → "N개의 항목" → 한 줄 리스트)
  - 클라우드 환경에서 접속하려면 환경 설정 Network access에 `chronothreads.webflow.io`, `cdn.prod.website-files.com`, `huddling.ai` 허용 필요 (현재 허용됨)
- 실제 포트폴리오 원본(Figma, **아직 사이트에 넣지 말고 참고만**): https://www.figma.com/design/WqDqO6r4ukeLLNhAm4qIRl
  - 표지 "A Bit Nerdy — Design by Oh Sol Gil", 2016–2025
  - 프로젝트: 그로우(포웍스), 마켓보로, 던킨 키오스크, 할인꾹, 바르미, 해피오더, 해피포인트, 배스킨 키오스크 (페이지 `포폴`, 1920×1080 슬라이드)
- 사용자 결정: **가상 캐릭터 페르소나**, **다크 고정**, **사운드 없음(일단)**
- 페르소나 콘셉트 (2026-10-21 수정): **B. 사이버 HUD 페르소나 "SOLGIL.EXE"**, **중성적(성별 구분 불가)** · **초실사 사진 톤** · 정자세 정면 응시
  - 1차 시도(남성, 3D 토이 스타일)는 "너무 캐릭터 같고 유치하다"는 피드백으로 폐기 → 프롬프트에서 3D render/toy/stylized 금지, 사진 용어 사용
  - 성별 드러나는 요소는 깊은 후드, 눈썹 덮는 앞머리, 넥 게이터·하이넥, 후드 위 헤드셋으로 가림. 20대 후반 성숙한 인상, 네온 최소
  - 요소: 차콜 테크웨어 후디(지퍼에 얇은 블루 라인), 헤드셋+마이크, 가슴 스트랩 미러리스 카메라, (사이트에서) 홀로그램 UI 패널
  - 이미지는 **사용자가 직접 생성해서 업로드** (Midjourney 등). 3D 변환용은 정면 A포즈·단색 배경·전신, 가능하면 측면·후면도
  - ✅ 1차 확정 이미지: `src/assets/persona/portrait.webp` (상반신, 1142×1377, 은색 후디·오렌지 바이저·헤드셋·카메라). 3D 모델은 아직 없음 → 사진을 셰이더 평면으로 사용 중
  - 홀로그램 패널은 모델에 포함하지 않고 Three.js로 따로 만들어 손 위에 띄울 예정
- 사용자가 정한 글 구분 원칙: **글은 항목별로, 형식은 '케이스 스터디' 또는 '노트(아카이브)'로 구분해서 적절히 배치.**

## 2. 기술 스택 · 배포

- **Astro 7** (정적 사이트), Node 22 (`.nvmrc`)
- 의존성: `astro`, `three`(홈 3D, 지연 로드 ~550KB), `gsap`(+ScrollTrigger), `lenis`(부드러운 스크롤) / dev: `@types/three`
- 폰트: Pretendard (jsDelivr), JetBrains Mono(HUD) + Silkscreen(픽셀 로고·타이틀) (Google Fonts) — `src/layouts/Base.astro`
- 배포: `.github/workflows/deploy.yml` — **`main`에 push되면** GitHub Actions가 빌드해서 GitHub Pages에 배포 (1분 내외)
  - PR에는 자동 검사가 없음. 머지 전에 로컬에서 `npm run build`로 확인할 것
  - `SITE`/`BASE`는 워크플로에서 자동 주입. 내부 링크는 반드시 `url()` 헬퍼(`src/lib/url.ts`)로 만들 것
- `package-lock.json`은 커밋하지 않는 상태 (워크플로가 `npm install` 사용)

```
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ — 현재 15페이지 (three 청크 크기 경고는 정상)
```

## 3. 구조

```
src/
  content.config.ts        ← 글 스키마 (work / archive 두 컬렉션)
  content/
    work/                  ← 케이스 스터디 .md (+ 이미지 폴더)
    archive/               ← 노트 .md (팁·프롬프트·툴·기록)
  lib/
    categories.ts          ← ★ 항목 목록 (slug, label, description, hue)
    items.ts               ← work+archive를 하나의 Item 목록으로 합치는 헬퍼, 정렬, 날짜 포맷
    url.ts                 ← base 경로 붙이는 링크 헬퍼
  components/
    Row.astro              ← 리스트 한 줄 ([번호] 배지 · 제목/요약 · 날짜 · →, 커버 있으면 hover 썸네일)
    Library.astro          ← 형식 필터 칩(개수) + 검색 + "N개의 항목" + 리스트 (클라이언트 필터 스크립트 포함)
    Entry.astro            ← 상세 페이지 공통 틀 (헤더, 커버, 본문, 같은 항목의 다른 글)
    Intro.astro            ← 홈 진입 화면 (부팅 로그 → click anywhere to start, 세션당 1회, 모션 줄이기면 생략)
    Hero.astro             ← 홈 히어로: 페르소나 사진 + HUD (스캔 모드 버튼 [01]~[03], 키보드 1·2·3). WebGL 전엔 <Image>로 같은 사진
  scripts/
    hero-scene.ts          ← Three.js 씬: 페르소나 셰이더 평면(visual/thermal/edge, 스윕 전환), 얼굴 레티클(FACE 좌표), 홀로그램 UI 패널(캔버스), 먼지
    hero-modes.ts          ← 스캔 모드 이름·HUD 수치
  assets/persona/portrait.webp ← 페르소나 사진
  layouts/Base.astro       ← <head>, 헤더(로고 · 항목 메뉴 + About · 서울 시계), 화면 코너 HUD, 푸터, Lenis. slot="full"은 .wrap 밖(풀폭)
  pages/
    index.astro            ← 홈: Intro + Hero + 전체 리스트
    category/[slug].astro  ← 항목별 페이지
    work/index.astro, work/[...slug].astro
    archive/index.astro (제목 "Notes"), archive/[...slug].astro
    about.astro, 404.astro
  styles/global.css        ← 전역 스타일 전부 (디자인 토큰 포함)
```

## 4. 콘텐츠 모델

두 컬렉션 모두 `category`(항목)를 가짐. 형식(work/archive)과 항목은 독립적인 축.

| 필드 | work (케이스 스터디) | archive (노트) |
|---|---|---|
| `title` | 필수 | 필수 |
| `summary` / `description` | `summary` 필수 | `description` 선택 |
| `category` | 기본 `portfolio` | 기본 `notes` |
| `cover` | 선택 (md 기준 상대경로 이미지) | 선택 |
| `date` | 선택 | 필수 |
| `company`, `role`, `period` | 선택 | — |
| `tags`, `order`, `draft` | 공통 | 공통 |

- 정렬: `order` 큰 순 → `date` 최신순 (`src/lib/items.ts`)
- `cover`가 없으면 카드 썸네일은 항목 색으로 채운 플레이스홀더 + 항목 이름
- 이미지는 `src/content/work/<글이름>/cover.png`처럼 글 이름 폴더에 두고 상대경로로 참조 (Astro가 최적화)

### 항목 (src/lib/categories.ts)

| slug | label | hue |
|---|---|---|
| `portfolio` | 포트폴리오 | 250 |
| `tips` | 디자인 팁 | 155 |
| `ai` | AI · 프롬프트 | 300 |
| `tools` | 툴 · 리소스 | 65 |
| `notes` | 기록 | 20 |

항목 추가·변경은 이 파일만 고치면 탭·배지·카테고리 페이지·스키마 검증이 함께 바뀜.

## 5. 디자인 시스템 (현재)

방향: **다크 고정 · HUD · 3D 히어로** (chronothreads) + **리스트형 목록** (huddling).

- 토큰 (`src/styles/global.css` `:root`, 다크만 있음)
  - `--bg #15151c` `--surface #1c1c25` `--raise #23232e` `--fg #f0ebe5` `--muted #8d8992` `--dim #575558` `--line #2c2c37` `--accent #2895f7`
  - 폰트: `--font` Pretendard / `--mono` JetBrains Mono / `--pixel` Silkscreen. HUD 라벨은 `.mono` (대문자 12px)
  - 레이아웃: `--max 1200px`, `--narrow 720px`, `--radius 4px`, `--gutter clamp(16px,4vw,40px)`, `--header 60px`
  - 항목 색: 요소에 `style="--h: <hue>"` → 배지 배경 `oklch(26% 0.045 h)`, 글자 `oklch(80% 0.12 h)`
- HUD: `.hud-frame`(화면 네 귀퉁이, 모바일 숨김), `.framed`(요소 코너), `[01]` 번호, 현재 메뉴는 `[ ]`로 감쌈
- 홈 히어로: 픽셀 "GEEK"(헤더 로고는 SOLGIL_) + "플랫폼과 디자인 시스템을 만드는 / 프로덕트 디자이너 솔길입니다." / 오른쪽 페르소나(사진 배경은 `max(col, --bg)`로 사이트 배경에 녹이고 타원형 페이드), 스캔 모드 3종 visual · thermal · edge scan(위→아래 스윕+글리치 전환), 얼굴 레티클+`SUBJ: SOLGIL.EXE` 라벨, 왼쪽 홀로그램 컴포넌트 패널(커서 움직임), 좌상단 모드 수치(장식). 포인터 시차, 스크롤 시 흐려짐. 모바일은 페르소나 위·문구 아래
- 목록: 1px 구분선 리스트, hover 시 배경+들여쓰기+화살표 색. ≤760px에서 배지·날짜 한 줄 + 제목 아래로
- 모션: GSAP reveal(`.reveal`), Lenis. `prefers-reduced-motion`이면 인트로·스크롤 보간·흔들림 끔

## 6. 현재 상태 (2026-10-21 기준)

- ✅ PR #1, #2 머지 · 배포됨 (카드 라이브러리 + 인수인계 노트)
- ✅ PR #3 머지 (2026-10-21): **다크 HUD + 페르소나 히어로(타이틀 "GEEK") + huddling식 메뉴·리스트**
  - 메뉴가 항목 기준으로 바뀌어 `/work`, `/archive` 페이지는 메뉴에서 빠짐 (주소는 살아 있음)
- ⚠️ 페르소나는 **사진(2D) 기반**. 진짜 3D(회전)를 원하면 전신 정면/측면/후면 이미지 → Tripo로 .glb 변환 필요
- ⚠️ 모든 글이 **샘플**: `work/sample-case-study.md`(+`cover.svg`), `archive/sample-tip.md`, `sample-ai-prompt.md`, `sample-tool.md`, `hello-archive.md`
- ⚠️ About 페이지는 경력 3곳(원스글로벌, 마켓보로(식봄), 휴넷 그로우포웍스)과 이메일만 있음

## 7. 다음 할 일 (우선순위 순, 사용자와 협의 필요)

1. 배포된 사이트 실기기 확인 (WebGL 성능, 모바일 RGB 분리 효과 거슬리는지)
2. (선택) 페르소나 고도화: 깊이맵(depth map)으로 2.5D 시차, 또는 전신 이미지로 3D .glb 변환 → 회전·시선 추적
3. 실제 콘텐츠: Figma 포트폴리오(위 1번 링크) 기준으로 케이스 스터디 작성 — **사용자 지시 전엔 넣지 말 것**, 성과·수치 지어내지 말 것
4. 항목 구성 확정 (현재 5개는 임시), About 페이지 다크 HUD 스타일로 다듬기
5. 샘플 글 삭제, OG 이미지(페르소나 활용)·파비콘·메타 태그 정리
6. 연출 고도화: 글자 스크램블 hover, 페이지 전환, HUD 커서, 상세 페이지 스크롤 연출
7. (선택) 사운드 — 사용자가 일단 제외함

## 8. 작업 규칙

- 변경 후 반드시 `npm run build` 통과 확인. 가능하면 브라우저로 데스크톱(1280)·모바일(390)·다크 모드 확인
- 디자인은 `global.css` 토큰을 우선 수정하고, 컴포넌트에 색을 하드코딩하지 말 것
- 내부 링크는 `url('/path')`, 이미지는 `astro:assets`의 `<Image>` 사용
- 커밋 메시지는 한국어로, 무엇을 왜 바꿨는지 요약
- `main`에 직접 push하지 말고 작업 브랜치 → PR → 사용자 확인 후 머지
- 작업을 마치면 이 파일의 6·7번을 갱신

## 9. 새 대화를 시작할 때 붙여넣을 프롬프트 예시

> tokyosol1992.github.io 저장소의 `AGENTS.md`를 먼저 읽고 이어서 작업해줘.
> 이번에는 홈페이지 디자인을 다듬고 싶어. 참고 사이트 스크린샷을 첨부할게.
