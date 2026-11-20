// 서가 원본을 Chromium(Playwright)으로 열어 책을 넘기며 화면을 저장하고 콘솔 오류를 알려 준다.
// 사용: node shelf-check.js <html 경로> <저장 폴더> <책 번호(0부터)...> [--mobile] [--detail]
//  - 책 수는 portfolio-shelf.src.html의 PROJECTS 개수(N)와 같게 아래 N을 맞춘다(현재 22).
//  - --detail: 마지막 책을 눌러 상세 화면까지 저장한다. 첫 책은 target=2에서 시작하므로 이동 횟수를 계산해 넘긴다.
const { chromium } = require('playwright');
const path = require('path');
const [html, outDir, ...rest] = process.argv.slice(2);
const mobile = rest.includes('--mobile'), detail = rest.includes('--detail');
const idxs = rest.filter(a => /^\d+$/.test(a)).map(Number);
const N = 22;
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: mobile ? { width: 390, height: 800 } : { width: 1440, height: 960 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + path.resolve(html)); await p.waitForTimeout(1200);
  let cur = 2;
  for (const idx of idxs) {
    let d = idx - cur; if (d > N / 2) d -= N; if (d < -N / 2) d += N;
    for (let i = 0; i < Math.abs(d); i++) { await p.click(d < 0 ? '#prev' : '#next'); await p.waitForTimeout(450); }
    cur = idx; await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(outDir, `shelf-${idx}.png`) });
  }
  if (detail) {
    const c = await p.evaluate(() => { const r = [...document.querySelectorAll('.box')].map(x => x.querySelector('.cvf')).filter(Boolean).map(e => e.getBoundingClientRect()).filter(q => q.width > 120 && Math.abs(q.left + q.width / 2 - innerWidth / 2) < 120)[0]; return [r.left + r.width / 2, r.top + r.height / 2]; });
    await p.mouse.click(c[0], c[1]); await p.waitForTimeout(1900);
    await p.screenshot({ path: path.join(outDir, `detail-${cur}.png`) });
  }
  console.log('오류:', errs.length ? errs.join('\n') : '없음');
  await b.close();
})();
