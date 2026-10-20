// @ts-check
import { defineConfig } from 'astro/config';

// SITE / BASE는 GitHub Actions 배포 시 자동으로 채워집니다.
// - <아이디>.github.io 저장소 → BASE = '/'
// - 그 외 이름의 저장소   → BASE = '/<저장소이름>'
// 로컬 개발 시에는 기본값(localhost, '/')이 쓰입니다.
export default defineConfig({
  site: process.env.SITE || 'http://localhost:4321',
  base: process.env.BASE || '/',
  trailingSlash: 'ignore',
});
