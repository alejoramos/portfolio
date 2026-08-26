const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function visible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

/**
 * Keeps Tab inside `container` until the returned function is called.
 * Used by the mobile navigation and the gallery lightbox.
 */
export function trapFocus(container: HTMLElement): () => void {
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(visible);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }

    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;

    if (e.shiftKey && (active === first || !container.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', onKeydown, true);
  return () => document.removeEventListener('keydown', onKeydown, true);
}
