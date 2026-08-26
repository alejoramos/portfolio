/**
 * Menu category tabs.
 *
 * The markup ships with every category visible. This module switches the board
 * into single-panel mode and takes over — so a failed script leaves a complete,
 * readable menu behind rather than an empty box.
 */

const REDUCED = () => document.documentElement.hasAttribute('data-reduced-motion');

function init() {
  const board = document.querySelector<HTMLElement>('[data-board]');
  if (!board) return;

  const tablist = board.querySelector<HTMLElement>('[role="tablist"]');
  const tabs = Array.from(board.querySelectorAll<HTMLButtonElement>('[data-tab]'));
  const panels = Array.from(board.querySelectorAll<HTMLElement>('[data-panel]'));
  if (!tablist || tabs.length === 0 || panels.length === 0) return;

  board.setAttribute('data-tabs-ready', '');

  // The sliding gold underline (desktop only — the mobile rail uses chips).
  const slider = document.createElement('span');
  slider.className = 'board__slider';
  slider.setAttribute('aria-hidden', 'true');
  tablist.style.position = 'relative';

  const desktop = window.matchMedia('(min-width: 1024px)');

  const positionSlider = (tab: HTMLElement) => {
    if (!desktop.matches) {
      slider.remove();
      tablist.removeAttribute('data-slider');
      return;
    }
    if (!slider.isConnected) {
      tablist.appendChild(slider);
      tablist.setAttribute('data-slider', '');
    }
    const label = tab.querySelector<HTMLElement>('.board__tab-label') ?? tab;
    const left = label.offsetLeft;
    slider.style.width = `${label.offsetWidth}px`;
    slider.style.transform = `translateX(${left}px)`;
  };

  let index = 0;

  const select = (next: number, focus = false, animate = true) => {
    const i = (next + tabs.length) % tabs.length;
    index = i;

    tabs.forEach((tab, ti) => {
      const on = ti === i;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });

    panels.forEach((panel, pi) => {
      panel.classList.toggle('is-active', pi === i);
    });

    const active = tabs[i]!;
    positionSlider(active);
    if (focus) active.focus();

    /*
      Rows fade + rise, 40ms apart — only on a real tab change, and only while
      the page is actually on screen. `fill: 'backwards'` holds opacity 0 during
      the stagger delay, and a document timeline that is not running (hidden
      tab) would hold it there indefinitely. The board must never be blank.
    */
    if (animate && !REDUCED() && !document.hidden) {
      const rows = panels[i]!.querySelectorAll<HTMLElement>('[data-row]');
      rows.forEach((row, ri) => {
        row.animate(
          [
            { opacity: 0, transform: 'translateY(14px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: 460,
            delay: ri * 40,
            easing: 'cubic-bezier(.22,1,.36,1)',
            fill: 'backwards',
          },
        );
      });
    }

    // Keep the chosen chip in view on the mobile rail.
    active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
  });

  tablist.addEventListener('keydown', (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        select(index + 1, true);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        select(index - 1, true);
        break;
      case 'Home':
        e.preventDefault();
        select(0, true);
        break;
      case 'End':
        e.preventDefault();
        select(tabs.length - 1, true);
        break;
    }
  });

  const reposition = () => positionSlider(tabs[index]!);
  window.addEventListener('resize', reposition, { passive: true });
  desktop.addEventListener('change', reposition);

  // Web fonts change label widths; reposition once they land.
  if ('fonts' in document) {
    document.fonts.ready.then(reposition).catch(() => {});
  }

  // Initial paint: no stagger. The reveal layer already brings the board in.
  select(0, false, false);
}

init();
