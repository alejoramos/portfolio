/**
 * Background scroll lock, shared by the mobile nav and the lightbox.
 * Reference-counted so two overlays cannot unlock each other.
 */

let depth = 0;
let savedY = 0;

export function lockScroll(): void {
  depth += 1;
  if (depth > 1) return;

  savedY = window.scrollY;
  const bar = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--scrollbar-w', `${bar}px`);
  document.body.setAttribute('data-locked', '');
}

export function unlockScroll(): void {
  if (depth === 0) return;
  depth -= 1;
  if (depth > 0) return;

  document.body.removeAttribute('data-locked');
  // iOS occasionally drops the scroll position when overflow is restored.
  window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
}
