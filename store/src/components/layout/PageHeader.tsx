import { SectionKicker, SplitHeading } from '../ui/Reveal';

interface PageHeaderProps {
  kicker: string;
  title: string;
  intro?: string;
  accent: string;
  count?: number;
}

/**
 * Shared masthead for catalogue pages. Carries the category accent as a wash so
 * each route feels like its own space without a bespoke layout per category.
 */
export function PageHeader({ kicker, title, intro, accent, count }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden pb-12 pt-32 sm:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[380px] opacity-45"
        style={{ background: `radial-gradient(70% 100% at 50% 0%, ${accent}55 0%, transparent 70%)` }}
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-25" />

      <div className="edge relative">
        <SectionKicker accent={accent}>{kicker}</SectionKicker>
        <SplitHeading
          text={title}
          as="h1"
          className="font-display mt-5 text-[clamp(3rem,12vw,10rem)] leading-[0.84]"
        />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          {intro && <p className="max-w-lg text-sm leading-relaxed opacity-65">{intro}</p>}
          {count != null && (
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-45">
              {count} {count === 1 ? 'piece' : 'pieces'}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
