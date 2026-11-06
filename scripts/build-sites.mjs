import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const target = process.argv[2] || 'all';
if (!['all', 'moho', 'portfolio'].includes(target)) {
  throw new Error('사용법: node scripts/build-sites.mjs [all|moho|portfolio]');
}
const base = '/' + (process.env.BASE || '').split('/').filter(Boolean).join('/');
const childBase = `${base === '/' ? '' : base}/portfolio/`;
if (target === 'all') rmSync(new URL('../dist/', import.meta.url), { recursive: true, force: true });
for (const area of target === 'all' ? ['moho', 'portfolio'] : [target]) {
  const out = area === 'moho' ? '../../dist' : '../../dist/portfolio';
  const result = spawnSync('npm', ['run', 'build', `--workspace=@solgil/${area}`, '--', '--outDir', out], {
    cwd: root, stdio: 'inherit',
    env: { ...process.env, BASE: area === 'moho' ? base : childBase },
    shell: process.platform === 'win32'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
