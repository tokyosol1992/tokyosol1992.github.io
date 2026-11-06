/** `.reveal` 요소를 스크롤해서 보일 때 아래에서 떠오르게 함 (모션 줄이기면 CSS에서 바로 보임) */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (const el of document.querySelectorAll('.reveal')) {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  }
}
