/**
 * Reservation configuration.
 *
 * This is a front-end demonstration. No data leaves the browser: there is no
 * backend, no database and no booking provider wired up. The shape below is the
 * seam — when a provider is chosen, `submitReservation()` in
 * `src/scripts/reservation.ts` is the single function that needs to change.
 */

export const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const DEFAULT_PARTY = 2;

/** TODO — real party-size cap to confirm. Design shows 1–8 with a call-out. */
export const MAX_PARTY = 8;

/**
 * TODO — real service windows to confirm. The design's picker covers dinner
 * only (5:00–8:30 pm in 30-minute steps); lunch service (11–2) is not
 * represented and should not be invented.
 */
export const TIMES = ['5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30'] as const;
export const DEFAULT_TIME = '6:30';

/**
 * Demonstration availability only. Hard-coded exactly as in the prototype —
 * there is no availability service to ask.
 */
export const FULLY_BOOKED: readonly string[] = ['7:00', '7:30'];

/** CONFIRMED closed days: Tuesday (2) and Sunday (0). */
export const CLOSED_WEEKDAYS: readonly number[] = [0, 2];

export const DAYS_SHOWN = 7;

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export interface DayCell {
  /** ISO yyyy-mm-dd, used as the stable value. */
  iso: string;
  dow: string;
  num: string;
  month: string;
  /** Full label for screen readers, e.g. "Friday 15 August". */
  label: string;
  open: boolean;
}

/**
 * The next `count` days starting today. Rendered at build time so the markup is
 * complete and readable without JavaScript, then recomputed on load by the
 * reservation script so the dates are never stale.
 */
export function buildDays(from: Date = new Date(), count: number = DAYS_SHOWN): DayCell[] {
  const out: DayCell[] = [];
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const weekday = d.getDay();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;

    out.push({
      iso,
      dow: DOW[weekday]!,
      num: String(d.getDate()),
      month: MONTH[d.getMonth()]!,
      label: d.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      open: !CLOSED_WEEKDAYS.includes(weekday),
    });
  }

  return out;
}

/** First selectable day — used as the default so the card never opens closed. */
export function firstOpenIndex(days: DayCell[]): number {
  const i = days.findIndex((d) => d.open);
  return i === -1 ? 0 : i;
}

export const STEPS = [
  { n: 1, label: 'Table' },
  { n: 2, label: 'Details' },
  { n: 3, label: 'Review' },
] as const;

export const TOTAL_STEPS = STEPS.length;
