/**
 * Reservation flow — front-end demonstration, local state only.
 *
 * Nothing here performs a network request. `submitReservation()` at the bottom
 * is the single seam a real booking provider would be connected to; today it
 * resolves immediately and the flow moves to the confirmation state.
 */

import { buildDays, DAYS_SHOWN, TOTAL_STEPS } from '@/data/reservation';

interface ReservationDraft {
  guests: number;
  date: string;
  dateLabel: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  request: string;
}

const REDUCED = () => document.documentElement.hasAttribute('data-reduced-motion');

function init() {
  const section = document.querySelector<HTMLElement>('[data-reserve]');
  const form = section?.querySelector<HTMLFormElement>('[data-reserve-form]');
  if (!section || !form) return;

  const panels = new Map<string, HTMLElement>();
  form.querySelectorAll<HTMLElement>('[data-step-panel]').forEach((panel) => {
    panels.set(panel.dataset.stepPanel!, panel);
  });

  const indicator = form.querySelector<HTMLElement>('[data-step-indicator]');
  const summaryEl = form.querySelector<HTMLElement>('[data-summary]');
  const reviewEl = form.querySelector<HTMLElement>('[data-review]');
  const reviewDoneEl = form.querySelector<HTMLElement>('[data-review-done]');
  const live = form.querySelector<HTMLElement>('[data-live]');

  let step: 1 | 2 | 3 | 'done' = 1;

  // ---- keep the dates current ---------------------------------------------
  // The markup was rendered at build time; refresh it against today's date so a
  // site that has been live for a month still offers the right seven days.
  const refreshDays = () => {
    const days = buildDays(new Date(), DAYS_SHOWN);
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('[data-day]'));
    if (inputs.length !== days.length) return;

    let checkedStillValid = false;

    inputs.forEach((input, i) => {
      const day = days[i]!;
      const label = input.nextElementSibling as HTMLElement | null;
      const wasChecked = input.checked;

      input.value = day.iso;
      input.disabled = !day.open;
      input.dataset.open = day.open ? 'true' : 'false';
      input.id = `date-${day.iso}`;
      label?.setAttribute('for', input.id);

      const dow = label?.querySelector<HTMLElement>('[data-dow]');
      const num = label?.querySelector<HTMLElement>('[data-num]');
      const sr = label?.querySelector<HTMLElement>('.sr-only');
      if (dow) dow.textContent = day.dow;
      if (num) num.textContent = day.num;
      if (sr) sr.textContent = day.open ? day.label : `${day.label} — closed`;

      if (wasChecked && day.open) checkedStillValid = true;
      if (wasChecked && !day.open) input.checked = false;
    });

    if (!checkedStillValid) {
      const firstOpen = inputs.find((i) => !i.disabled);
      if (firstOpen) firstOpen.checked = true;
    }
  };

  refreshDays();

  // ---- reading the draft ---------------------------------------------------
  const value = (name: string): string => {
    const el = form.elements.namedItem(name);
    if (!el) return '';
    if (el instanceof RadioNodeList) return el.value;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value;
    return '';
  };

  const selectedDayLabel = (): string => {
    const checked = form.querySelector<HTMLInputElement>('[data-day]:checked');
    const sr = checked?.nextElementSibling?.querySelector<HTMLElement>('.sr-only');
    const dow = checked?.nextElementSibling?.querySelector<HTMLElement>('[data-dow]');
    const num = checked?.nextElementSibling?.querySelector<HTMLElement>('[data-num]');
    if (sr?.textContent) return sr.textContent.trim();
    return `${dow?.textContent ?? ''} ${num?.textContent ?? ''}`.trim();
  };

  const shortDayLabel = (): string => {
    const checked = form.querySelector<HTMLInputElement>('[data-day]:checked');
    const dow = checked?.nextElementSibling?.querySelector<HTMLElement>('[data-dow]');
    const num = checked?.nextElementSibling?.querySelector<HTMLElement>('[data-num]');
    return `${dow?.textContent ?? ''} ${num?.textContent ?? ''}`.trim();
  };

  const read = (): ReservationDraft => {
    const guests = Number(value('guests')) || 2;
    return {
      guests,
      date: value('date'),
      dateLabel: selectedDayLabel(),
      time: value('time'),
      name: value('name').trim(),
      phone: value('phone').trim(),
      email: value('email').trim(),
      request: value('request').trim(),
    };
  };

  // ---- the live summary ----------------------------------------------------
  const renderSummary = () => {
    if (!summaryEl) return;
    const d = read();
    summaryEl.textContent = `${d.guests} ${d.guests === 1 ? 'guest' : 'guests'} · ${shortDayLabel()} · ${d.time} pm`;
  };

  form.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    if (target.matches('[data-guests], [data-day], [data-time]')) renderSummary();
    if (target instanceof HTMLInputElement && target.getAttribute('aria-invalid') === 'true') {
      validateField(target);
    }
  });

  renderSummary();

  // ---- validation ----------------------------------------------------------
  const setError = (input: HTMLInputElement, message: string | null) => {
    const el = form.querySelector<HTMLElement>(`[data-error-for="${input.id}"]`);
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (el) {
        el.textContent = message;
        el.hidden = false;
      }
    } else {
      input.removeAttribute('aria-invalid');
      if (el) {
        el.textContent = '';
        el.hidden = true;
      }
    }
  };

  const validateField = (input: HTMLInputElement): boolean => {
    const v = input.value.trim();

    if (input.hasAttribute('data-required') && v === '') {
      setError(input, `${input.previousElementSibling?.textContent?.trim() ?? 'This'} is required`);
      return false;
    }
    if (input.type === 'email' && v !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      setError(input, 'Check this email address');
      return false;
    }
    if (input.type === 'tel' && v !== '' && v.replace(/\D/g, '').length < 7) {
      setError(input, 'Check this phone number');
      return false;
    }
    setError(input, null);
    return true;
  };

  const validateStep2 = (): boolean => {
    const inputs = Array.from(
      panels.get('2')?.querySelectorAll<HTMLInputElement>('input') ?? [],
    );
    let ok = true;
    let firstBad: HTMLInputElement | null = null;
    inputs.forEach((input) => {
      if (!validateField(input)) {
        ok = false;
        if (!firstBad) firstBad = input;
      }
    });
    (firstBad as HTMLInputElement | null)?.focus();
    return ok;
  };

  // ---- review --------------------------------------------------------------
  const renderReview = (target: HTMLElement | null) => {
    if (!target) return;
    const d = read();
    const rows: [string, string][] = [
      ['Party', `${d.guests} ${d.guests === 1 ? 'guest' : 'guests'}`],
      ['Date', d.dateLabel],
      ['Time', `${d.time} pm`],
      ['Name', d.name || '—'],
      ['Phone', d.phone || '—'],
    ];
    if (d.email) rows.push(['Email', d.email]);
    if (d.request) rows.push(['Note', d.request]);

    target.replaceChildren(
      ...rows.map(([term, def]) => {
        const wrap = document.createElement('div');
        const dt = document.createElement('dt');
        dt.textContent = term;
        const dd = document.createElement('dd');
        dd.textContent = def;
        wrap.append(dt, dd);
        return wrap;
      }),
    );
  };

  // ---- step machine --------------------------------------------------------
  const show = (next: 1 | 2 | 3 | 'done') => {
    const from = panels.get(String(step));
    const to = panels.get(String(next));
    if (!to) return;

    step = next;

    panels.forEach((panel) => {
      panel.hidden = panel !== to;
    });

    if (indicator) {
      indicator.textContent =
        next === 'done' ? 'Confirmed' : `Step ${next} of ${TOTAL_STEPS}`;
    }

    if (next === 3) renderReview(reviewEl);
    if (next === 'done') {
      renderReview(reviewDoneEl);
      to.setAttribute('data-drawn', '');
    }

    if (live) {
      live.textContent =
        next === 'done'
          ? 'Reservation preview confirmed. Nothing was sent.'
          : `Step ${next} of ${TOTAL_STEPS}`;
    }

    // Step change slides 24px and fades. Additive — the panel is already there.
    if (!REDUCED() && from !== to) {
      to.animate(
        [
          { opacity: 0, transform: 'translateY(24px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' },
      );
    }

    // Move focus to the top of the new step without yanking the page around.
    const heading = to.querySelector<HTMLElement>('input, button, [tabindex]');
    if (from !== to) heading?.focus({ preventScroll: true });
  };

  form.querySelectorAll<HTMLButtonElement>('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (step === 1) show(2);
      else if (step === 2 && validateStep2()) show(3);
    });
  });

  form.querySelectorAll<HTMLButtonElement>('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (step === 3) show(2);
      else if (step === 2) show(1);
    });
  });

  form.querySelector<HTMLButtonElement>('[data-restart]')?.addEventListener('click', () => {
    panels.get('done')?.removeAttribute('data-drawn');
    form
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="text"], input[type="tel"], input[type="email"], textarea')
      .forEach((el) => {
        el.value = '';
        if (el instanceof HTMLInputElement) setError(el, null);
      });
    refreshDays();
    renderSummary();
    show(1);
  });

  form.addEventListener('submit', async (e) => {
    // There is no endpoint and no provider — the submit never leaves the page.
    e.preventDefault();
    if (step !== 3) return;

    const confirm = form.querySelector<HTMLButtonElement>('[data-confirm]');
    if (confirm) confirm.disabled = true;

    try {
      await submitReservation(read());
      show('done');
    } finally {
      if (confirm) confirm.disabled = false;
    }
  });
}

/**
 * The integration seam.
 *
 * Today this is a no-op: the reservation exists only in this browser tab and is
 * discarded when the page unloads. To connect a real provider, replace the body
 * with the provider call (or a redirect to their flow) and keep the signature.
 * Nothing else in the UI needs to change.
 */
async function submitReservation(draft: ReservationDraft): Promise<void> {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[reservation] demonstration only — not sent', draft);
  }
  await new Promise((resolve) => setTimeout(resolve, 260));
}

init();
