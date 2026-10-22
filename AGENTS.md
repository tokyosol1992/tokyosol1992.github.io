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
  - ✅ 확정 이미지: `src/assets/persona/portrait.webp` (상반신, 1142×1377, 은색 후디·오렌지 바이저·후드 안쪽 파란 글로우·카메라, 검정 배경). 2026-10-22 사용자가 준 새 버전으로 교체 (홈 히어로·About 공용). 3D 모델은 아직 없음 → 사진을 셰이더 평면으로 사용 중
  - 깊이맵 `src/assets/persona/depth.png`(밝을수록 가까움, 얼굴이 가장 가까움): 사진에서 인물 윤곽을 따고 타원으로 몸통·후드·얼굴·카메라 깊이를 얹어 만든 근사치. 사진을 바꾸면 다시 만들어야 함
  - (2026-10-22) 홀로그램 UI 패널은 "촌스럽다"는 피드백으로 삭제
  - 실사 프롬프트 핵심(재생성 시 참고): `ultra photorealistic studio portrait photograph of an androgynous adult person in their late 20s, gender-ambiguous face, neutral calm expression, looking directly into the camera, perfectly frontal symmetrical pose, oversized techwear hoodie with the hood up, long bangs covering the eyebrows, neck gaiter up to the jawline, over-ear headset over the hood, mirrorless camera on a chest strap, real skin texture with visible pores, Hasselblad 90mm, dark #15151c backdrop` / 네거티브: `cartoon, anime, 3d render, cgi, doll, toy, plastic skin, childish, teenager, heavy neon, overtly masculine or feminine features`
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
mockups/                   ← 아티팩트 시안 원본 HTML (빌드에 안 들어감)
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
    Hero.astro             ← 홈 히어로: 페르소나 사진 + HUD (스캔 모드 버튼 [01]~[03], 키보드 1·2·3). WebGL 전엔 <Image>로 같은 사진. 홈에 올 때마다 mount, 떠날 때 destroy
  scripts/
    hero-scene.ts          ← Three.js 씬: 페르소나 셰이더 평면(레퍼런스 효과 스택 + visual/thermal/edge 스윕 전환), 깊이맵 마우스 시차, 얼굴 레티클(FACE 좌표), 먼지
    page-transition.ts     ← 페이지 전환 C · 레티클 포커스 (ClientRouter 이벤트에 연결, Base에서 initPageTransition())
    hero-modes.ts          ← 스캔 모드 이름·HUD 수치
    scramble.ts            ← 글자 스크램블 hover. `data-scramble` 붙이면 동작(링크·버튼 안이면 그 hover 기준), `="fixed"`는 너비 고정. Base에서 initScramble()
    reveal.ts              ← `.reveal` 스크롤 등장(GSAP). 홈·About에서 initReveal()
  assets/persona/portrait.webp ← 페르소나 사진 (+ depth.png 깊이맵)
  layouts/Base.astro       ← <head>(ClientRouter), 헤더(로고 · 항목 메뉴 + About · 서울 시계), 화면 코너 HUD, 전환 레이어, 푸터, Lenis. 헤더·HUD·전환 레이어는 transition:persist. slot="full"은 .wrap 밖(풀폭)
  pages/
    index.astro            ← 홈: Intro + Hero + 전체 리스트
    category/[slug].astro  ← 항목별 페이지
    work/index.astro, work/[...slug].astro
    archive/index.astro (제목 "Notes"), archive/[...slug].astro
    about.astro            ← HUD 프로필: 페르소나 카드(레티클·스캔라인) + 스펙표 + [01] 경력 · [02] focus · [03] contact
    404.astro
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
  - `--bg #0b0b0d` `--surface #131316` `--raise #1a1a1e` `--fg #f0ebe5` `--muted #8d8992` `--dim #55545a` `--line #242429` `--accent #2895f7`
  - (2026-10-22) 배경을 남색 기가 도는 `#15151c`에서 무채색에 가까운 `#0b0b0d`로 더 어둡게 바꿈. 히어로 3D 배경 패널(`hero-scene.ts` back 셰이더)과 사진 블렌딩 `uBg`(CSS `--bg`를 읽음), `theme-color`도 함께 맞춤
  - 폰트: `--font` Pretendard / `--mono` JetBrains Mono / `--pixel` Silkscreen. HUD 라벨은 `.mono` (대문자 12px)
  - 레이아웃: `--max 1200px`, `--narrow 720px`, `--radius 4px`, `--gutter clamp(16px,4vw,40px)`, `--header 60px`
  - 항목 색: 요소에 `style="--h: <hue>"` → 배지 배경 `oklch(26% 0.045 h)`, 글자 `oklch(80% 0.12 h)`
- HUD: `.hud-frame`(화면 네 귀퉁이, 모바일 숨김), `.framed`(요소 코너), `[01]` 번호, 현재 메뉴는 `[ ]`로 감쌈
- 홈 히어로: 픽셀 "GEEK"(헤더 로고는 SOLGIL_) + "플랫폼과 디자인 시스템을 만드는 / 프로덕트 디자이너 솔길입니다." / 오른쪽 페르소나(사진 배경은 `max(col, --bg)`로 사이트 배경에 녹이고 타원형 페이드), 스캔 모드 3종 visual · thermal · edge scan(위→아래 스윕+글리치 전환), 얼굴 레티클+`SUBJ: SOLGIL.EXE` 라벨, 좌상단 모드 수치(장식). 스크롤 시 흐려짐. 모바일은 페르소나 위·문구 아래
  - 사진 효과 (2026-10-22, chronothreads 히어로의 Unicorn Studio 효과 스택을 셰이더 하나로 재현): ① 깊이맵 시차 — 가까운 곳(얼굴)이 마우스 쪽으로, 관성 0.05 ② 가는 가로 블라인드 결 ③ 가끔 몇 줄이 밀리는 글리치+색 분리 ④ 블룸(visual 모드만) ⑤ 오버레이 그레인 0.18 ⑥ 마우스를 조금 따라가는 비네트. 마우스가 3초 멈추거나 터치 기기면 천천히 떠다님. 레티클은 얼굴 시차만큼 같이 이동
- 목록: 1px 구분선 리스트, hover 시 배경+들여쓰기+화살표 색. ≤760px에서 배지·날짜 한 줄 + 제목 아래로
- 페이지 전환 C · 레티클 포커스 (2026-10-22 사용자 선택): 누른 링크로 HUD 브래킷이 모여 조준(OUT 360ms, 본문 어둡게) → 로딩까지 깜박임(HOLD ≥120ms) → 화면 전체로 펼쳐지며 새 본문 블러→선명(IN 440ms), 제목 스크램블 + 내용 순차 등장, 현재 메뉴 `[ ]` 스크램블. 뒤로 가기는 화면 가운데에서 시작. 모션 줄이기면 크로스페이드. 브라우저 기본 view-transition 애니메이션은 CSS로 끔
  - ⚠️ **ClientRouter 때문에 페이지 스크립트는 처음 한 번만 실행됨** → 페이지마다 할 일은 `astro:page-load`에서, 정리는 `astro:before-swap`에서. ScrollTrigger는 Base에서 이동 전에 전부 kill, reveal·스크램블은 Base가 page-load마다 호출. 진입 화면은 사이트 안에서 이동해 오면 생략(`window.__ptNavigated`)
- 모션: GSAP reveal(`.reveal`), Lenis, 글자 스크램블 hover(로고·메뉴·리스트 제목·히어로 모드·About 회사명/이메일. 마우스 기기만, 한글→한글·영문→영문/기호로 섞어 폭 변화 최소화). `prefers-reduced-motion`이면 인트로·스크롤 보간·흔들림 끔

## 6. 현재 상태 (2026-10-22 기준)

- ✅ PR #1, #2 머지 · 배포됨 (카드 라이브러리 + 인수인계 노트)
- ✅ PR #3 머지 · **배포 성공** (2026-10-21, Actions run #4): **다크 HUD + 페르소나 히어로(타이틀 "GEEK") + huddling식 메뉴·리스트**
  - 헤더 로고는 `SOLGIL_`, 얼굴 라벨은 `SUBJ: SOLGIL.EXE` 그대로 (사용자는 히어로 타이틀만 GEEK으로 바꿈)
  - 메뉴가 항목 기준으로 바뀌어 `/work`, `/archive` 페이지는 메뉴에서 빠짐 (주소는 살아 있음)
  - 사용자 실기기 확인 결과는 아직 못 받음
- ⚠️ 페르소나는 **사진(2D) 기반**. 진짜 3D(회전)를 원하면 전신 정면/측면/후면 이미지 → Tripo로 .glb 변환 필요
- ⚠️ 모바일 visual 모드에서 RGB 분리(무지개 테두리)가 조금 보임 — 사용자 의견 받으면 모바일에서 끌지 결정
- ⚠️ 모든 글이 **샘플**: `work/sample-case-study.md`(+`cover.svg`), `archive/sample-tip.md`, `sample-ai-prompt.md`, `sample-tool.md`, `hello-archive.md`
- 🔄 브랜치 `claude/admiring-ride-q2c1zu` (PR 미생성, 사용자 확인 대기)에 아래가 들어 있음
  - 페르소나 사진 교체 + 배경색 더 어둡게(`#0b0b0d`)
  - **페이지 전환 C 구현** (시안 v2 https://claude.ai/artifact/VZ7TbHcVrzFCRbs21FC8ck , 원본 `mockups/page-transition.html`)
  - **히어로 리터칭**: 레퍼런스 효과 스택 + 깊이맵 마우스 시차, 홀로그램 패널 삭제
  - 작업 브랜치: `claude/admiring-ride-q2c1zu` (`claude/clever-franklin-ubf6l1` 위에 이어서 커밋, PR 미생성)
- 🔄 About 다크 HUD 리뉴얼 + 글자 스크램블 hover — 브랜치 `claude/clever-franklin-ubf6l1`에 저장(push)만 함, **PR은 아직 안 만듦** (사용자 지시). 다음 작업도 이 브랜치에서 이어서
  - 경력은 회사 이름만 있음. `about.astro`의 `experience` 배열에 `period`·`role`·`desc`를 넣으면 화면에 나타남 (**사용자에게 받은 내용만**, 지어내지 말 것)
  - 스펙표·focus 문구는 기존 소개 문단에서만 가져옴. 'ONLINE'·'ID // SUBJ_01'은 장식

## 7. 다음 할 일 (우선순위 순, 사용자와 협의 필요)

> 단계별 상세 플랜과 진행 상태는 **`PLAN.md`** 참고. 작업 방식(아티팩트 시안 → Figma 수정 → 코드 반영 → 머지)도 거기에 있음.

1. 사용자 실기기 피드백 반영 (WebGL 부드러움, 모바일 RGB 분리, 패널 위치·문구 크기 등)
2. About 경력 기간·역할·한 줄 설명 채우기 (사용자 입력 필요)
3. 히어로 효과 강도 조정(사용자 피드백: 블라인드 결·글리치 빈도·시차 세기는 `hero-scene.ts` 셰이더 상수) / 연출 고도화: 십자선 HUD 커서, 상세 페이지 스크롤 연출(이미지 고정·확대, `[02/05]` 진행률)
4. 항목 구성 확정 (현재 5개는 임시)
5. 실제 콘텐츠: Figma 포트폴리오(위 1번 링크) 기준으로 케이스 스터디 작성 — **사용자 지시 전엔 넣지 말 것**, 성과·수치 지어내지 말 것. 대표작 2~3개부터
6. 샘플 글 삭제, OG 이미지(페르소나 활용)·파비콘·메타 태그 정리
7. (선택) 페르소나 고도화: 깊이맵으로 2.5D 시차, 또는 전신 이미지 → 3D .glb (`hero-scene.ts`에서 사진 평면 대신 GLTFLoader)
8. (선택) 사운드 — 사용자가 일단 제외함

### 작업 환경 메모 (클라우드 세션)

- 에이전트 프록시 때문에 **배포된 사이트(tokyosol1992.github.io)는 curl로 열리지 않음(403)** → 배포 확인은 GitHub Actions 실행 결과로 할 것
- 화면 확인: `npm run build` → `npx astro preview --port 4321`(백그라운드) → Playwright로 스크린샷
  - 전역 playwright 사용: `NODE_PATH=$(npm root -g) node shot.cjs` (CJS로 작성, ESM import는 NODE_PATH를 무시함)
  - 크로미움: `executablePath: '/opt/pw-browsers/chromium'`, WebGL은 `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`
  - 진입 화면이 있으니 홈은 한 번 클릭 후 2~3초 기다려 찍을 것. 데스크톱 1440×860, 모바일 390×844 권장
  - Google Fonts·jsDelivr 폰트 로드가 프록시에 막혀 콘솔 에러가 날 수 있음(정상)
- `pkill -f "astro preview"`처럼 명령 문자열에 패턴이 들어가면 셸 자신이 죽음 → 프리뷰는 그냥 두거나 PID로 종료
- `git add -A`에 무시된 파일(package-lock.json)을 명시하면 add가 실패해 뒤 명령이 안 돌 수 있음 → 커밋 후 `git log`로 꼭 확인

## 8. 작업 규칙

- **작업 방식 (2026-10-21 사용자 결정)**: 플랜(`PLAN.md`) 중 하나를 골라 **아티팩트(HTML 시안)로 먼저 구성** → 사용자가 필요하면 Figma로 옮겨 수정 → 그 디자인을 코드에 반영 → 사용자 확인 후 머지. 바로 코드부터 짜지 말 것

- 변경 후 반드시 `npm run build` 통과 확인. 가능하면 브라우저로 데스크톱(1280)·모바일(390)·다크 모드 확인
- 디자인은 `global.css` 토큰을 우선 수정하고, 컴포넌트에 색을 하드코딩하지 말 것
- 내부 링크는 `url('/path')`, 이미지는 `astro:assets`의 `<Image>` 사용
- 커밋 메시지는 한국어로, 무엇을 왜 바꿨는지 요약
- `main`에 직접 push하지 말고 작업 브랜치 → PR → 사용자 확인 후 머지
- 작업을 마치면 이 파일의 6·7번을 갱신

## 9. 새 대화를 시작할 때 붙여넣을 프롬프트 예시

> tokyosol1992.github.io 저장소의 `AGENTS.md`를 먼저 읽고 이어서 작업해줘.
> 이번에는 (예: 7번의 연출 고도화 / About 페이지 / 케이스 스터디 작성)을 하고 싶어.
> 작업 후 데스크톱·모바일 스크린샷 보내주고, 내가 보고 머지할지 정할게.
