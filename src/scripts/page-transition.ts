/**
 * 페이지 전환 (2026-10-26: 파란 조준 사각형(레티클)은 사용자 요청으로 삭제)
 * OUT 본문이 짧게 사라짐 — 다음 페이지 로딩이 끝날 때까지 기다림
 * IN  (2026-10-27 사용자 선택: 제목 마스크 + 본문 페이드) 제목은 마스크 아래에서 올라오고, 나머지는 살짝 뒤따라 떠오름
 *     제목 스크램블은 사용자 요청으로 삭제
 * 모션 줄이기면 짧은 크로스페이드만
 */
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';

const OUT = 180;
const IN = 240; // 본문이 한 번에 튀어 보이지 않게 까는 짧은 페이드
const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)';

declare global {
  interface Window { __ptNavigated?: boolean }
}

export function initPageTransition() {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = () => document.querySelector<HTMLElement>('main');

  function arrive(el: HTMLElement) {
    const items = [...el.querySelectorAll<HTMLElement>(
      '.page-head > :not(h1), .toolbar, .count, .list > li, .entry header > :not(h1), .entry .cover, .prose, .spec, .about-section',
    )].filter((it) => !it.closest('.reveal')).slice(0, 10);

    // 제목: 마스크(overflow hidden)로 감싸서 아래에서 올라오게 함. 레이아웃은 그대로(아래 여백만큼 상쇄)
    const title = el.querySelector<HTMLElement>('h1');
    if (title && !title.parentElement?.classList.contains('title-mask')) {
      const mask = document.createElement('span');
      mask.className = 'title-mask';
      title.replaceWith(mask);
      mask.appendChild(title);
      title.animate([{ transform: 'translateY(115%)' }, { transform: 'none' }], { duration: 750, easing: EASE_OUT, fill: 'backwards' });
    }
    items.forEach((it, i) => {
      it.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
        { duration: 520, delay: 140 + i * 60, easing: EASE_OUT, fill: 'backwards' });
    });
  }

  document.addEventListener('astro:before-preparation', (e) => {
    const ev = e as TransitionBeforePreparationEvent;
    window.__ptNavigated = true;
    try { sessionStorage.setItem('intro-seen', '1'); } catch {}
    const load = ev.loader;
    const out = reduced() ? 120 : OUT;
    ev.loader = async () => {
      await Promise.all([load(), main()?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: out, easing: 'ease-in', fill: 'forwards' }).finished]);
    };
  });

  document.addEventListener('astro:after-swap', () => {
    const el = main();
    if (!el) return;
    if (reduced()) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
      return;
    }
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: IN, easing: EASE_OUT });
    arrive(el);
  });
}
