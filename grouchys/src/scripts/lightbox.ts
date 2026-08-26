import { lockScroll, unlockScroll } from './lib/scroll-lock';
import { trapFocus } from './lib/focus-trap';

interface Slide {
  src: string;
  caption: string;
  trigger: HTMLElement;
}

function isVisible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function init() {
  const root = document.querySelector<HTMLElement>('[data-lightbox-root]');
  if (!root) return;

  const img = root.querySelector<HTMLImageElement>('[data-lightbox-img]');
  const caption = root.querySelector<HTMLElement>('[data-lightbox-caption]');
  const count = root.querySelector<HTMLElement>('[data-lightbox-count]');
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  const prevBtn = root.querySelector<HTMLButtonElement>('[data-lightbox-prev]');
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-lightbox-next]');
  const backdrop = root.querySelector<HTMLElement>('[data-lightbox-dismiss]');
  if (!img) return;

  let slides: Slide[] = [];
  let index = 0;
  let open = false;
  let release: (() => void) | null = null;
  let lastFocused: HTMLElement | null = null;

  /** Only the grid that is actually on screen is pageable. */
  const collect = (): Slide[] =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-lightbox]'))
      .filter(isVisible)
      .map((trigger) => ({
        src: trigger.dataset.full ?? '',
        caption: trigger.dataset.caption ?? '',
        trigger,
      }));

  const show = (i: number) => {
    if (slides.length === 0) return;
    index = (i + slides.length) % slides.length;
    const slide = slides[index]!;
    img.src = slide.src;
    img.alt = slide.caption;
    if (caption) caption.textContent = slide.caption;
    if (count) count.textContent = `${index + 1} / ${slides.length}`;
  };

  const openAt = (trigger: HTMLElement) => {
    slides = collect();
    const i = slides.findIndex((s) => s.trigger === trigger);
    if (i < 0) return;

    lastFocused = document.activeElement as HTMLElement | null;
    open = true;
    root.hidden = false;
    lockScroll();
    show(i);
    closeBtn?.focus();
    release = trapFocus(root);
  };

  const close = () => {
    if (!open) return;
    open = false;
    root.hidden = true;
    release?.();
    release = null;
    unlockScroll();
    // Return focus to the thumbnail that opened it.
    (slides[index]?.trigger ?? lastFocused)?.focus();
    img.removeAttribute('src');
  };

  document.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-lightbox]');
    if (!trigger) return;
    e.preventDefault();
    openAt(trigger);
  });

  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  prevBtn?.addEventListener('click', () => show(index - 1));
  nextBtn?.addEventListener('click', () => show(index + 1));

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(index - 1);
    }
  });
}

init();
