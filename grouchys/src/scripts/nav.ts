/**
 * Header + mobile navigation behaviour.
 *
 * Everything here is progressive: without JavaScript the header is a normal
 * sticky bar with working links, and the overlay simply never opens.
 */

import { lockScroll, unlockScroll } from './lib/scroll-lock';
import { trapFocus } from './lib/focus-trap';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function initScrolledState() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  let ticking = false;
  const apply = () => {
    ticking = false;
    if (window.scrollY > 24) header.setAttribute('data-scrolled', '');
    else header.removeAttribute('data-scrolled');
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };

  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileNav() {
  const panel = document.querySelector<HTMLElement>('[data-mobile-nav]');
  const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const closeBtn = panel?.querySelector<HTMLButtonElement>('[data-menu-close]');
  if (!panel || !openBtn) return;

  let releaseTrap: (() => void) | null = null;
  let lastFocused: HTMLElement | null = null;
  let isOpen = false;

  const items = Array.from(panel.querySelectorAll<HTMLElement>('[data-nav-item]'));

  const open = () => {
    if (isOpen) return;
    isOpen = true;

    /*
      Remember where focus came from so Escape can put it back. If nothing was
      focused (a tap rather than a keypress) `document.activeElement` is
      <body>, which cannot take focus — fall back to the toggle, so closing
      always lands somewhere a keyboard user can carry on from.
    */
    const active = document.activeElement;
    lastFocused =
      active instanceof HTMLElement && active !== document.body ? active : openBtn;

    panel.hidden = false;
    // force a frame so the transition has a starting point
    void panel.offsetHeight;
    panel.setAttribute('data-open', '');
    openBtn.setAttribute('aria-expanded', 'true');
    lockScroll();

    const first = panel.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    releaseTrap = trapFocus(panel);

    // Stagger the items in. Purely additive — they are already in place.
    if (!document.documentElement.hasAttribute('data-reduced-motion')) {
      items.forEach((item, i) => {
        item.animate(
          [
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: 520,
            delay: 90 + i * 60,
            easing: 'cubic-bezier(.22,1,.36,1)',
            fill: 'backwards',
          },
        );
      });
    }
  };

  const close = (restore = true) => {
    if (!isOpen) return;
    isOpen = false;

    panel.removeAttribute('data-open');
    openBtn.setAttribute('aria-expanded', 'false');
    releaseTrap?.();
    releaseTrap = null;
    unlockScroll();

    const finish = () => {
      panel.hidden = true;
    };

    if (document.documentElement.hasAttribute('data-reduced-motion')) {
      finish();
    } else {
      window.setTimeout(finish, 260);
    }

    if (restore) (lastFocused ?? openBtn).focus();
  };

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', () => close());

  // Escape closes; the link click closes after navigation starts.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      close();
    }
  });

  panel.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    link.addEventListener('click', () => close(false));
  });

  // A resize past the desktop breakpoint should not strand the overlay open.
  const desktop = window.matchMedia('(min-width: 1024px)');
  const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches && isOpen) close(false);
  };
  desktop.addEventListener('change', onChange);
}

initScrolledState();
initMobileNav();
