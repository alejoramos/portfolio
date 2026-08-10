import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '../../lib/gsap';
import { BRAND, CHARACTERS } from '../../data/site';
import { usePrefersReducedMotion } from '../../hooks/useEnvironment';
import { SplitHeading, SectionKicker } from '../../components/ui/Reveal';
import { Marquee } from '../../components/ui/Marquee';

const STATS = [
  { value: '218g', label: 'Flux Runner, US 9' },
  { value: '4-way', label: 'Stretch across the range' },
  { value: '62%', label: 'Recycled content' },
  { value: '11oz', label: 'Denim programme weight' },
];

/**
 * Section G — Campaign.
 *
 * The quiet, confident beat between two loud sections. Almost no chrome: a
 * cropped figure, one statement, a stat row, and a single marquee. The restraint
 * is the point — it is what makes the sections around it land.
 */
export function Campaign() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      gsap.to('[data-campaign-figure]', {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      });

      gsap.from('[data-stat]', {
        opacity: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-stats]', start: 'top 88%', once: true },
      });
    },
    { scope: ref, dependencies: [reduced] }
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-bone text-ink">
      <div className="edge grid items-center gap-12 py-24 lg:grid-cols-2 lg:gap-16 lg:py-32">
        <div className="order-2 lg:order-1">
          <SectionKicker accent="#ff4a1c">{BRAND.season} Campaign</SectionKicker>
          <SplitHeading
            text="Train like it counts"
            className="font-display mt-6 text-[clamp(2.75rem,8vw,7rem)] leading-[0.85]"
          />
          <p className="mt-7 max-w-md text-base leading-relaxed opacity-70">
            We build for the sessions nobody posts. The fourth rep, the wet Tuesday, the last
            kilometre when the pace is a decision rather than a number. Everything in this range
            was tested there first.
          </p>

          <div data-stats className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-2">
            {STATS.map((stat) => (
              <div data-stat key={stat.label} className="border-t border-ink/20 pt-4">
                <p className="font-display text-3xl leading-none">{stat.value}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] opacity-55">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/new"
            className="mt-12 inline-flex h-14 items-center rounded-full bg-ink px-10 text-xs font-semibold uppercase tracking-[0.2em] text-bone transition-transform duration-200 hover:scale-105"
          >
            See the {BRAND.season} drop
          </Link>
        </div>

        <div className="relative order-1 lg:order-2">
          <div
            className="relative overflow-hidden rounded-[2rem]"
            style={{ background: 'linear-gradient(165deg, #ff4a1c 0%, #12141f 70%)' }}
          >
            <img
              data-campaign-figure
              src={CHARACTERS.campaign}
              alt="KINETA athlete in the SS26 track suit"
              width={342}
              height={955}
              loading="lazy"
              className="mx-auto h-[clamp(420px,58vw,660px)] w-auto object-contain object-bottom will-change-transform"
            />
            <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-25" />
          </div>
        </div>
      </div>

      <div className="border-y border-ink/15 py-5">
        <Marquee
          items={[
            'Built at speed',
            'SS26 out now',
            'Free shipping over £150',
            'Tested with athletes',
            'Engineered in London',
          ]}
          className="font-display text-[clamp(1.5rem,4vw,3rem)] leading-none opacity-85"
          speed={38}
        />
      </div>
    </section>
  );
}
