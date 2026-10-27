/**
 * 진입 인터랙션 (2026-10-27, 시안 mockups/interactions.html에서 사용자가 고른 3개)
 * - 블러 텍스트: `[data-blur]` 섹션 머리말의 제목이 단어 단위로 흐림이 걷히며 올라옴 (화면에 들어올 때 한 번)
 * - 스크롤 단어 점등: `[data-scroll-words]` 문단의 단어가 스크롤하는 만큼 하나씩 밝아짐
 * - 카운트업: `[data-countup]` 숫자가 올라가 멈춤 (HTML에는 최종 숫자를 넣어 둠 → 스크립트가 없어도 보임)
 * 모션 줄이기면 처음부터 완성된 상태. 페이지 이동 뒤마다(astro:page-load) initEnter() 호출
 */
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 텍스트 노드만 단어 span으로 쪼갬 (공백은 그대로 둬서 줄바꿈이 자연스럽게) */
function splitWords(el: HTMLElement, cls: string) {
  const words: HTMLElement[] = [];
  const text = el.textContent ?? '';
  el.setAttribute('aria-label', text);
  el.textContent = '';
  text.split(/\s+/).filter(Boolean).forEach((w, i, all) => {
    const s = document.createElement('span');
    s.className = cls;
    s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--i', String(i));
    s.textContent = w;
    el.appendChild(s);
    words.push(s);
    if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return words;
}

function onceVisible(el: Element, run: () => void, threshold = 0.3) {
  if (!('IntersectionObserver' in window)) { run(); return; }
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { io.disconnect(); run(); }
  }, { threshold });
  io.observe(el);
}

function initBlur() {
  for (const head of document.querySelectorAll<HTMLElement>('[data-blur]')) {
    if (head.dataset.blurBuilt) continue;
    head.dataset.blurBuilt = '1';
    const title = head.querySelector<HTMLElement>('h2, h1');
    if (title) splitWords(title, 'bw');
    if (reduced()) { head.classList.add('on'); continue; }
    head.classList.add('is-split');
    onceVisible(head, () => head.classList.add('on'));
  }
}

function initScrollWords() {
  for (const p of document.querySelectorAll<HTMLElement>('[data-scroll-words]')) {
    if (p.dataset.swBuilt) continue;
    p.dataset.swBuilt = '1';
    splitWords(p, 'sw');
  }
  update();
}

function update() {
  for (const p of document.querySelectorAll<HTMLElement>('[data-scroll-words]')) {
    const words = p.querySelectorAll<HTMLElement>('.sw');
    if (words.length === 0) continue;
    const r = p.getBoundingClientRect();
    const vh = innerHeight;
    // 문단이 화면 아래 90% 지점에 들어올 때 시작해서 위쪽 35% 근처에 올 때 전부 밝아짐
    const k = reduced() ? 1 : Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.55)));
    const n = Math.round(k * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
  }
}

function initCount() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-countup]')) {
    if (el.dataset.countupBuilt) continue;
    el.dataset.countupBuilt = '1';
    if (reduced()) continue;
    const to = Number(el.dataset.countup);
    const from = Number(el.dataset.from ?? 0);
    el.textContent = String(from);
    onceVisible(el, () => {
      const start = performance.now();
      const dur = 1500;
      const frame = (now: number) => {
        const k = Math.min(1, (now - start) / dur);
        el.textContent = String(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 4))));
        if (k < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }, 0.6);
  }
}

let listening = false;
export function initEnter() {
  initBlur();
  initScrollWords();
  initCount();
  if (!listening) {
    listening = true;
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
  }
}
