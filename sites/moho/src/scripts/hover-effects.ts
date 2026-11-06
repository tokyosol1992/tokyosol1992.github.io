/**
 * 호버 인터랙션 (2026-10-27, 시안 mockups/interactions.html에서 사용자가 고른 3개)
 * - 텍스트 롤: `data-roll` 링크의 글자가 위로 굴러 올라가며 흰색으로 바뀜 (CSS는 global.css `.roll`)
 * - 스포트라이트: `data-spot` 카드에 마우스 위치(--x, --y)를 넘겨 파란 빛·테두리가 따라오게 함
 * - 행 썸네일: Library 행에 올리면 커버(없으면 항목 색 + 이름)가 마우스를 따라옴
 * 마우스(hover 가능한 기기)에서만 동작, 모션 줄이기 설정이면 따라오는 썸네일은 끔
 */
const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 글자마다 span을 만들어 두고(::after에 같은 글자) hover 때 CSS로 굴림. 이미 만든 요소는 건너뜀 */
export function initRoll(root: ParentNode = document) {
  for (const el of root.querySelectorAll<HTMLElement>('[data-roll]')) {
    if (el.dataset.rollBuilt) continue;
    el.dataset.rollBuilt = '1';
    const text = el.textContent ?? '';
    el.setAttribute('aria-label', text);
    el.textContent = '';
    const wd = document.createElement('span');
    wd.className = 'wd';
    wd.setAttribute('aria-hidden', 'true');
    [...text].forEach((ch, i) => {
      const l = document.createElement('span');
      l.className = 'l';
      l.style.setProperty('--i', String(i));
      l.dataset.c = ch;
      l.textContent = ch;
      wd.appendChild(l);
    });
    el.appendChild(wd);
  }
}

let float: HTMLElement | null = null;
let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, active = false;

function ensureFloat() {
  // 페이지를 옮기면 body가 바뀌므로 없어졌으면 다시 만듦
  if (!float || !float.isConnected) {
    float = document.createElement('div');
    float.className = 'row-float';
    float.setAttribute('aria-hidden', 'true');
    document.body.appendChild(float);
  }
  return float;
}

function loop() {
  cx += (tx - cx) * 0.2;
  cy += (ty - cy) * 0.2;
  if (float) float.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
  raf = active ? requestAnimationFrame(loop) : 0;
}

let bound = false;
/** 위임 방식이라 한 번만 연결하면 모든 페이지에서 동작 */
export function initHover() {
  if (bound) return;
  bound = true;
  if (!fine()) return;

  // 스포트라이트
  document.addEventListener('pointermove', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-spot]');
    if (el) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', `${e.clientX - r.left}px`);
      el.style.setProperty('--y', `${e.clientY - r.top}px`);
    }
    if (active) { tx = e.clientX + 150; ty = e.clientY - 12; }
  });

  // 행 썸네일
  if (reduced()) return;
  document.addEventListener('pointerover', (e) => {
    const row = (e.target as Element | null)?.closest<HTMLAnchorElement>('a.row');
    if (!row) return;
    const f = ensureFloat();
    const cover = row.dataset.cover;
    const hue = getComputedStyle(row).getPropertyValue('--h').trim() || '250';
    f.style.background = cover ? '' : `radial-gradient(120% 90% at 20% 10%, oklch(40% 0.11 ${hue}), oklch(17% 0.03 ${hue}))`;
    f.replaceChildren();
    if (cover) {
      const img = document.createElement('img');
      img.src = cover; img.alt = '';
      f.appendChild(img);
    } else {
      const label = document.createElement('span');
      label.textContent = row.dataset.cat ?? '';
      f.appendChild(label);
    }
    tx = e.clientX + 150; ty = e.clientY - 12;
    if (!active) { cx = tx; cy = ty; }
    active = true;
    f.classList.add('on');
    if (!raf) raf = requestAnimationFrame(loop);
  });
  document.addEventListener('pointerout', (e) => {
    const row = (e.target as Element | null)?.closest<HTMLAnchorElement>('a.row');
    if (!row || row.contains(e.relatedTarget as Node | null)) return;
    active = false;
    float?.classList.remove('on');
  });
  // 페이지가 바뀌면 남은 썸네일을 숨김
  document.addEventListener('astro:before-swap', () => { active = false; float?.classList.remove('on'); });
}
