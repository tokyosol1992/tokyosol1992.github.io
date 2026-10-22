/**
 * 페이지 전환 C · 레티클 포커스 (시안: mockups/page-transition.html)
 * OUT  화면 귀퉁이 HUD 브래킷이 누른 링크로 모여 조준하고 본문이 어두워짐
 * HOLD 브래킷 깜박임 — 최소 시간이고 실제로는 다음 페이지 로딩이 끝날 때까지
 * IN   브래킷이 화면 전체로 펼쳐지고 새 본문이 흐렸다가 선명해짐, 제목 스크램블 + 내용 순차 등장
 * 헤더·화면 코너 HUD·이 레이어는 transition:persist로 유지. 모션 줄이기면 짧은 크로스페이드
 */
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';
import { scramble } from './scramble';

const OUT = 360;
const HOLD = 120;
const IN = 440;
const ARRIVE = 520;
const ARRIVE_AT = 0.4; // IN이 이만큼 진행됐을 때 새 내용 등장 시작
const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)';
const DIM = 0.82;

type Box = { x: number; y: number; w: number; h: number };

declare global {
  interface Window { __ptNavigated?: boolean }
}

const css = (b: Box) => ({ left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` });
const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, '0');

export function initPageTransition() {
  const layer = document.querySelector<HTMLElement>('[data-pt]');
  if (!layer) return;
  const dim = layer.querySelector<HTMLElement>('[data-pt-dim]')!;
  const ret = layer.querySelector<HTMLElement>('[data-pt-ret]')!;
  const tag = layer.querySelector<HTMLElement>('[data-pt-tag]')!;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hud = () => document.querySelector<HTMLElement>('.hud-frame');
  // 화면 코너 HUD와 같은 자리 (.hud-frame inset 12px)
  const frame = (): Box => ({ x: 12, y: 12, w: innerWidth - 24, h: innerHeight - 24 });
  let target: Box = frame();
  let run = 0; // 이동이 겹치면 이전 IN의 정리를 건너뜀

  const stop = () => [layer, dim, ret, tag].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));

  function targetOf(el?: Element): Box {
    const r = el?.getBoundingClientRect();
    if (r && r.width && r.bottom > 0 && r.top < innerHeight) {
      return { x: r.left - 10, y: r.top - 8, w: r.width + 20, h: r.height + 16 };
    }
    return { x: innerWidth / 2 - 70, y: innerHeight / 2 - 30, w: 140, h: 60 }; // 뒤로 가기 등: 화면 가운데
  }

  async function playOut(to: string) {
    run++;
    stop();
    const header = document.querySelector<HTMLElement>('header.site');
    dim.style.top = `${header?.offsetHeight ?? 0}px`;
    tag.textContent = `lock x${pad(target.x)} y${pad(target.y)} → ${to}`;
    layer.classList.add('on');
    hud()?.style.setProperty('visibility', 'hidden');
    const opts = { duration: OUT, fill: 'forwards' as const };
    await Promise.all([
      ret.animate([css(frame()), css(target)], { ...opts, easing: EASE_OUT }).finished,
      dim.animate([{ opacity: 0 }, { opacity: DIM }], { ...opts, easing: 'ease-in' }).finished,
      tag.animate([{ opacity: 0 }, { opacity: 1 }], { duration: OUT * 0.3, delay: OUT * 0.7, fill: 'both' }).finished,
    ]);
    await ret.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }],
      { duration: HOLD, easing: 'steps(1, end)' }).finished;
  }

  function arrive(main: HTMLElement) {
    const title = main.querySelector<HTMLElement>('h1');
    if (title) scramble(title, ARRIVE);
    const items = main.querySelectorAll<HTMLElement>(
      '.page-head > :not(h1), .toolbar, .count, .list > li, .entry header > :not(h1), .entry .cover, .prose, .spec, .about-section',
    );
    [...items].filter((el) => !el.closest('.reveal')).slice(0, 10).forEach((el, i) => {
      el.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
        { duration: 420, delay: i * 45, easing: EASE_OUT, fill: 'backwards' });
    });
  }

  async function playIn() {
    const mine = run;
    const main = document.querySelector<HTMLElement>('main');
    if (main) setTimeout(() => arrive(main), IN * ARRIVE_AT);
    tag.getAnimations().forEach((a) => a.cancel());
    tag.style.opacity = '0';
    const opts = { duration: IN, easing: EASE_OUT };
    await Promise.all([
      ret.animate([css(target), css(frame())], { ...opts, fill: 'forwards' }).finished,
      dim.animate([{ opacity: DIM }, { opacity: 0 }], { ...opts, fill: 'forwards' }).finished,
      main?.animate([{ filter: 'blur(8px)', transform: 'scale(1.015)' }, { filter: 'blur(0)', transform: 'none' }], opts).finished,
    ]).catch(() => {}); // 도중에 다음 이동이 시작되면 취소됨
    if (mine === run) {
      stop();
      tag.style.opacity = '';
      layer.classList.remove('on');
      hud()?.style.removeProperty('visibility');
    }
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
    if (reduced()) {
      ev.loader = async () => {
        await Promise.all([load(), document.querySelector('main')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }).finished]);
      };
      return;
    }
    target = targetOf(ev.sourceElement);
    ev.loader = async () => { await Promise.all([load(), playOut(ev.to.pathname)]); };
  });

  document.addEventListener('astro:after-swap', () => {
    markMenu();
    if (reduced()) {
      document.querySelector('main')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
      return;
    }
    if (layer.classList.contains('on')) playIn();
  });
}
