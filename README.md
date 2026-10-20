# 솔길 포트폴리오

Astro로 만든 포트폴리오 + 개인 저장소. `main`에 push하면 GitHub Pages로 자동 배포됩니다.

## 폴더 구조

```
src/
  content/
    work/       ← 포트폴리오 케이스 스터디 (.md)
    archive/    ← 노트·기록·레퍼런스 (.md)
  pages/        ← 페이지 (홈, work, archive, about)
  layouts/      ← 공통 레이아웃
  styles/       ← 전역 스타일
public/         ← 그대로 복사되는 정적 파일 (favicon 등)
.github/workflows/deploy.yml  ← 자동 배포
```

## 글 추가하기

1. `src/content/work/` 또는 `src/content/archive/`에 `.md` 파일 추가 (샘플 파일 복사)
2. 맨 위 `---` 사이의 정보(title, date 등) 수정
3. 커밋 & push → 1~2분 뒤 사이트에 반영

공개하기 싫은 글은 `draft: true`.

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
