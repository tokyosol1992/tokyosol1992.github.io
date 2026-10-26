/**
 * 페이지 전환 (2026-10-26: 파란 조준 사각형(레티클)은 사용자 요청으로 삭제)
 * OUT 본문이 짧게 사라짐 — 다음 페이지 로딩이 끝날 때까지 기다림
 * IN  새 본문이 나타나고 제목 스크램블 + 내용 순차 등장
 * 모션 줄이기면 짧은 크로스페이드만
 */
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';
import { scramble } from './scramble';

const OUT = 200;
const IN = 360;
const ARRIVE = 520;
const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)';

declare global {
  interface Window { __ptNavigated?: boolean }
}

export function initPageTransition() {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = () => document.querySelector<HTMLElement>('main');

  function arrive(el: HTMLElement) {
    const title = el.querySelector<HTMLElement>('h1');
    if (title) scramble(title, ARRIVE);
    const items = el.querySelectorAll<HTMLElement>(
      '.page-head > :not(h1), .toolbar, .count, .list > li, .entry header > :not(h1), .entry .cover, .prose, .spec, .about-section',
    );
    [...items].filter((it) => !it.closest('.reveal')).slice(0, 10).forEach((it, i) => {
      it.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
        { duration: 420, delay: i * 45, easing: EASE_OUT, fill: 'backwards' });
    });
  }

  // 헤더는 유지되므로 현재 메뉴 표시([ ])를 직접 바꿈
  function markMenu() {
    for (const a of document.querySelectorAll<HTMLAnchorElement>('header.site .menu a')) {
      const on = location.pathname.startsWith(a.pathname);
      if (on && !a.hasAttribute('aria-current')) {
        a.setAttribute('aria-current', 'page');
        if (!reduced()) scramble(a, 420);
      } else if (!on) a.removeAttribute('aria-current');
    }
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
    markMenu();
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
