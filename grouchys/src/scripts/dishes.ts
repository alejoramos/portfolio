/**
 * Featured dishes.
 *
 * Selection is plain DOM work and always available. The pinned scroll is
 * layered on top by `motion.ts` once GSAP is ready — this module exposes
 * `setDish` for it and never depends on it.
 */

import { dishes } from '@/data/dishes';

export interface DishController {
  set(index: number, source?: 'click' | 'scroll'): void;
  get(): number;
  count: number;
}

let controller: DishController | null = null;

function init(): DishController | null {
  const section = document.querySelector<HTMLElement>('[data-dishes]');
  if (!section) return null;

  const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-dish-btn]'));
  const slides = Array.from(section.querySelectorAll<HTMLElement>('[data-dish-slide]'));
  const caption = section.querySelector<HTMLElement>('[data-dish-caption]');
  const tagEl = caption?.querySelector<HTMLElement>('.dishes__caption-tag');
  const nameEl = caption?.querySelector<HTMLElement>('.dishes__caption-name');

  let current = 0;

  const set = (index: number) => {
    const next = Math.max(0, Math.min(dishes.length - 1, index));
    if (next === current) return;
    current = next;

    buttons.forEach((btn, i) => {
      const on = i === next;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    slides.forEach((slide, i) => {
      const on = i === next;
      slide.classList.toggle('is-active', on);
      slide.setAttribute('aria-hidden', on ? 'false' : 'true');
    });

    const dish = dishes[next]!;
    if (tagEl) tagEl.textContent = dish.tag;
    if (nameEl) nameEl.textContent = dish.name;
  };

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => set(i));
  });

  // The mobile rail drives its own progress ticks.
  const rail = section.querySelector<HTMLElement>('[data-dishes-rail]');
  const ticks = Array.from(section.querySelectorAll<HTMLElement>('[data-dish-tick]'));

  if (rail && ticks.length) {
    const cards = Array.from(rail.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = cards.indexOf(entry.target as HTMLElement);
          if (i < 0) return;
          ticks.forEach((tick, ti) => {
            if (ti === i) tick.setAttribute('data-on', '');
            else tick.removeAttribute('data-on');
          });
        });
      },
      { root: rail, threshold: 0.6 },
    );
    cards.forEach((card) => io.observe(card));
    ticks[0]?.setAttribute('data-on', '');
  }

  return { set, get: () => current, count: dishes.length };
}

controller = init();

export function getDishController(): DishController | null {
  return controller;
}
