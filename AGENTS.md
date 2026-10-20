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

- 사용자가 준 참고 사이트: https://huddling.ai/prompt-pedia
  - ⚠️ 지금까지 작업한 클라우드 환경에서는 네트워크 정책으로 이 사이트에 접속하지 못해 **실제 화면을 본 적이 없음**.
    현재 디자인은 사용자의 설명만으로 잡은 구조임. 참고 사이트 스타일에 맞추려면 사용자에게 스크린샷을 받거나, 접속 가능한 환경에서 직접 확인할 것.
- 사용자가 정한 글 구분 원칙: **글은 항목별로, 형식은 '케이스 스터디' 또는 '노트(아카이브)'로 구분해서 적절히 배치.**

## 2. 기술 스택 · 배포

- **Astro 7** (정적 사이트), Node 22 (`.nvmrc`), 의존성은 `astro` 하나뿐
- 폰트: Pretendard (jsDelivr CDN, `src/layouts/Base.astro`)
- 배포: `.github/workflows/deploy.yml` — **`main`에 push되면** GitHub Actions가 빌드해서 GitHub Pages에 배포 (1분 내외)
  - PR에는 자동 검사가 없음. 머지 전에 로컬에서 `npm run build`로 확인할 것
  - `SITE`/`BASE`는 워크플로에서 자동 주입. 내부 링크는 반드시 `url()` 헬퍼(`src/lib/url.ts`)로 만들 것
- `package-lock.json`은 커밋하지 않는 상태 (워크플로가 `npm install` 사용)

```
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ — 현재 15페이지
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
    Card.astro             ← 카드 (썸네일/플레이스홀더, 배지, 형식, 날짜, 요약, 태그)
    Library.astro          ← 항목 탭 + 형식 필터 칩 + 검색 + 카드 그리드 (클라이언트 필터 스크립트 포함)
    Entry.astro            ← 상세 페이지 공통 틀 (헤더, 커버, 본문, 같은 항목의 다른 글)
  layouts/Base.astro       ← <head>, 헤더 내비(Work / Notes / About), 푸터
  pages/
    index.astro            ← 홈: 히어로 + Library(active="all")
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

방향: **미니멀 · 카드 그리드 · 작업물(이미지) 중심**, 라이트/다크 자동(`prefers-color-scheme`).

- 토큰 (`src/styles/global.css` `:root`)
  - 라이트: `--bg #fafaf9` `--surface #fff` `--fg #1c1917` `--muted #78716c` `--line #e7e5e4` `--accent #2563eb`
  - 다크: `--bg #0c0a09` `--surface #1c1917` `--fg #f5f5f4` `--muted #a8a29e` `--line #292524` `--accent #60a5fa`
  - 레이아웃: `--max 1120px`(목록), `--narrow 720px`(본문), `--radius 14px`
  - 항목 색: 요소에 `style="--h: <hue>"`를 주면 `oklch(var(--tint-l) var(--tint-c) var(--h))`로 배경, `oklch(var(--ink-l) 0.12 var(--h))`로 글자색
- 타이포: h1 `clamp(26px, 4vw, 36px)`, 자간 -0.025em / 카드 제목 17px / 본문 16px, `word-break: keep-all`
- 그리드: 3열 → 2열(≤1024px) → 1열(≤640px), gap 24px, 썸네일 16:10
- 헤더: sticky + 반투명 blur
- 홈 히어로 문구: "플랫폼과 디자인 시스템을 만드는 / 프로덕트 디자이너 솔길입니다."

## 6. 현재 상태 (2026-10-20 기준)

- ✅ PR #1 머지 · 배포 성공 — 카테고리별 카드 라이브러리 리뉴얼 반영됨
- ✅ 빌드 확인, 데스크톱·모바일·다크 모드 스크린샷 확인, 필터·검색 동작 확인
- ⚠️ 모든 글이 **샘플**임: `work/sample-case-study.md`(+`cover.svg`), `archive/sample-tip.md`, `sample-ai-prompt.md`, `sample-tool.md`, `hello-archive.md`
- ⚠️ About 페이지는 경력 3곳(원스글로벌, 마켓보로(식봄), 휴넷 그로우포웍스)과 이메일만 있음
- ⚠️ 참고 사이트(huddling.ai/prompt-pedia) 스타일은 아직 반영 못 함 (위 1번 참고)

## 7. 다음 할 일 (우선순위 순, 사용자와 협의 필요)

1. **홈페이지 디자인 다듬기** — 참고 사이트 스크린샷을 받아 레이아웃·카드·타이포를 맞추기 (사용자가 다음 대화에서 진행 예정)
2. 실제 콘텐츠 작성 — 사용자에게 프로젝트 정보(회사, 역할, 기간, 문제, 성과)를 받아 케이스 스터디로 정리. **성과·수치를 지어내지 말 것**
3. 항목 구성 확정 (현재 5개는 임시 제안)
4. 샘플 글 삭제, OG 이미지·파비콘·메타 태그 정리

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
