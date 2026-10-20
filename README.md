# 솔길 포트폴리오

Astro로 만든 포트폴리오 + 개인 저장소. `main`에 push하면 GitHub Pages로 자동 배포됩니다.

## 폴더 구조

```
src/
  content/
    work/       ← 케이스 스터디 (.md) — 문제·과정·결과를 길게
    archive/    ← 노트 (.md) — 팁, 프롬프트, 툴, 기록 등 짧은 글
  lib/categories.ts ← 항목(카테고리) 목록 — 탭 이름·색 수정
  pages/        ← 페이지 (홈, category, work, archive, about)
  components/   ← 카드, 목록, 상세 페이지 틀
  layouts/      ← 공통 레이아웃
  styles/       ← 전역 스타일
public/         ← 그대로 복사되는 정적 파일 (favicon 등)
.github/workflows/deploy.yml  ← 자동 배포
```

## 글 추가하기

1. 글 형식을 고르고 샘플 파일을 복사
   - 케이스 스터디 → `src/content/work/` (`sample-case-study.md`)
   - 노트 → `src/content/archive/` (`sample-tip.md` 등)
2. 맨 위 `---` 사이의 정보 수정
   - `category`: 어느 항목 탭에 넣을지 — `portfolio` · `tips` · `ai` · `tools` · `notes`
   - `cover`: 카드·상단 이미지 (선택). 예) `./my-project/cover.png` — 없으면 항목 색으로 채워짐
   - `order`: 숫자가 클수록 목록 위에 고정 (기본 0, 그다음 날짜 최신순)
3. 커밋 & push → 1~2분 뒤 사이트에 반영

공개하기 싫은 글은 `draft: true`.

항목을 바꾸거나 추가하려면 `src/lib/categories.ts`만 고치면 됩니다.

## 어디서든 수정하기

| 환경 | 방법 |
|---|---|
| 맥 | `npm install` → `npm run dev` → http://localhost:4321 |
| 브라우저 (간단 수정) | GitHub 저장소 페이지에서 `.` 키 → github.dev 웹 에디터에서 수정 후 커밋 |
| 브라우저 (미리보기 포함) | 저장소 → 초록색 `Code` → `Codespaces` → `Create codespace on main` → 터미널에 `npm run dev` |
| 휴대폰 | GitHub 앱 또는 github.com에서 파일 열기 → 연필 아이콘 → 수정 후 커밋 |

## 명령어

| 명령 | 설명 |
|---|---|
| `npm run dev` | 로컬 개발 서버 |
| `npm run build` | `dist/`에 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
