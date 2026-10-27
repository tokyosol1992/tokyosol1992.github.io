/**
 * 글자 스크램블 (페이지 이동 뒤 제목 등장 연출에서만 씀, page-transition.ts)
 * - 글자가 무작위 글자로 섞였다가 왼쪽부터 원래대로 돌아옴
 * - 한글은 한글로, 영문·숫자는 영문·숫자·기호로 바꿔서 글자 폭 변화를 줄임
 * - 2026-10-27: 마우스 hover 스크램블(`data-scramble`, initScramble)은 사용자 요청으로 삭제
 */
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';
const HANGUL_FIRST = 0xac00;
const HANGUL_COUNT = 11172;
const FRAME_MS = 45;

const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

function randomLike(ch: string) {
  const code = ch.charCodeAt(0);
  if (code >= HANGUL_FIRST && code < HANGUL_FIRST + HANGUL_COUNT) {
    return String.fromCharCode(HANGUL_FIRST + Math.floor(Math.random() * HANGUL_COUNT));
  }
  if (/[a-z]/.test(ch)) return pick(LATIN).toLowerCase();
  if (/[A-Z0-9]/.test(ch)) return pick(LATIN);
  return ch; // 공백·문장부호는 그대로
}

function textNodes(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

const running = new WeakSet<HTMLElement>();

export function scramble(el: HTMLElement, ms?: number) {
  if (running.has(el)) return;
  running.add(el);

  const nodes = textNodes(el).map((node) => ({ node, text: node.data }));
  const total = nodes.reduce((n, t) => n + t.text.length, 0);
  const duration = ms ?? Math.min(700, Math.max(320, total * 28));
  // 글자마다 원래대로 돌아오는 시점: 왼쪽부터 순서대로 + 약간의 흔들림
  let i = 0;
  const settle = nodes.map((t) => [...t.text].map(() => ((i++ / total) * 0.75 + Math.random() * 0.25) * duration));

  const start = performance.now();
  let last = 0;
  const frame = (now: number) => {
    const t = now - start;
    if (t >= duration) {
      nodes.forEach(({ node, text }) => { node.data = text; });
      running.delete(el);
      return;
    }
    if (now - last >= FRAME_MS) {
      last = now;
      nodes.forEach(({ node, text }, n) => {
        node.data = [...text].map((ch, c) => (t >= settle[n][c] ? ch : randomLike(ch))).join('');
      });
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
