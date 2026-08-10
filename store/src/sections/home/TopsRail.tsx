import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP, ScrollTrigger } from '../../lib/gsap';
import { useProducts } from '../../hooks/useProducts';
import { usePrefersReducedMotion } from '../../hooks/useEnvironment';
import { CATEGORY_THEMES } from '../../data/site';
import { formatPrice } from '../../lib/utils';
import { SectionKicker, SplitHeading } from '../../components/ui/Reveal';
import { SmartImage } from '../../components/ui/Primitives';

/**
 * Section C — "The Rail".
 *
 * A hard tonal break from the ink sections either side: bright, gallery-lit, and
 * the only place on the page where products hang rather than float. Each top is
 * suspended from a visible rail and swings with scroll velocity, so the section
 * responds to how fast you move rather than merely where you are.
 */
export function TopsRail() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const theme = CATEGORY_THEMES.tops;
  const { data: products } = useProducts({ category: 'tops', sort: 'featured', limit: 5 });

  useGSAP(
    () => {
      if (reduced || !products.length) return;

      const hangers = gsap.utils.toArray<HTMLElement>('[data-hanger]');

      /* Entrance: each garment drops in and settles like it was just hung. */
      hangers.forEach((hanger, i) => {
        gsap.from(hanger, {
          yPercent: -22,
          opacity: 0,
          rotate: i % 2 === 0 ? -9 : 9,
          duration: 1.25,
          ease: 'elastic.out(0.85, 0.5)',
          delay: i * 0.09,
          scrollTrigger: { trigger: ref.current, start: 'top 68%', once: true },
        });
      });

      /* Sway: rotation tracks scroll velocity, then decays back to rest. */
      const setters = hangers.map((h) =>
        gsap.quickTo(h, 'rotate', { duration: 0.7, ease: 'power2.out' })
      );

      const trigger = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const sway = gsap.utils.clamp(-7, 7, self.getVelocity() / 260);
          setters.forEach((set, i) => set(sway * (i % 2 === 0 ? 1 : -0.75)));
        },
        onLeave: () => setters.forEach((set) => set(0)),
        onLeaveBack: () => setters.forEach((set) => set(0)),
      });

      return () => trigger.kill();
    },
    { scope: ref, dependencies: [reduced, products.length] }
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-bone py-24 text-ink sm:py-32">
      <div className="edge">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <SectionKicker accent={theme.accent}>Tops — {theme.tagline}</SectionKicker>
            <SplitHeading
              text="The Rail"
              className="font-display mt-5 text-[clamp(3rem,10vw,8rem)] leading-[0.85]"
            />
          </div>
          <p className="max-w-sm text-sm leading-relaxed opacity-65">
            Ten layers built for different jobs — race weight, thermal, recovery. Hung together so
            you can see the difference before you feel it.
          </p>
        </div>
      </div>

      {/* The rail itself. */}
      <div className="relative mt-20">
        <div aria-hidden className="edge">
          <div className="relative h-px w-full bg-ink/25">
            <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-ink/25" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-ink/25" />
          </div>
        </div>

        <div className="edge">
          <div className="grid grid-cols-2 gap-x-4 gap-y-14 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
            {products.map((product, i) => {
              const colorway = product.colorways[0];
              // Staggered drop lengths make the rail read as hand-hung.
              const drop = [26, 68, 14, 54, 34][i % 5];

              return (
                <article key={product.id} className="group relative">
                  {/* Hook and line */}
                  <div aria-hidden className="mx-auto w-px bg-ink/20" style={{ height: drop }} />

                  <div
                    data-hanger
                    className="origin-top will-change-transform"
                    style={{ transformOrigin: 'top center' }}
                  >
                    <Link to={`/product/${product.slug}`} className="block">
                      <div className="relative rounded-xl bg-ink/[0.035] p-4 transition-colors duration-500 group-hover:bg-ink/[0.07]">
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          style={{
                            background: `radial-gradient(90% 70% at 50% 40%, ${theme.accent}33, transparent 70%)`,
                          }}
                        />
                        <SmartImage
                          src={colorway.image}
                          alt={`${product.name} in ${colorway.name}`}
                          width={colorway.width}
                          height={colorway.height}
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                          className="relative mx-auto max-h-[230px] w-full"
                          imgClassName="drop-shadow-[0_22px_30px_rgba(0,0,0,0.22)] transition-transform duration-500 group-hover:scale-[1.06]"
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <h3 className="text-sm font-semibold">{product.name}</h3>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] opacity-50">
                          {colorway.name}
                        </p>
                        <p className="mt-1.5 text-sm tabular-nums">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="edge mt-16 flex justify-center">
        <Link
          to="/tops"
          className="inline-flex h-14 items-center rounded-full px-10 text-xs font-semibold uppercase tracking-[0.2em] transition-transform duration-200 hover:scale-105"
          style={{ backgroundColor: theme.accent, color: theme.onAccent }}
        >
          All tops
        </Link>
      </div>
    </section>
  );
}
