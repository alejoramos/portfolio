import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '../../lib/gsap';
import { useProducts } from '../../hooks/useProducts';
import { usePrefersReducedMotion } from '../../hooks/useEnvironment';
import { CATEGORY_THEMES, CHARACTERS } from '../../data/site';
import { formatPrice } from '../../lib/utils';
import { SectionKicker } from '../../components/ui/Reveal';
import { SmartImage } from '../../components/ui/Primitives';

/**
 * Section E — "Cut & Weight".
 *
 * Deliberately the opposite of the two sections before it: nothing floats,
 * nothing is centred. An asymmetric editorial grid with oversized index numerals
 * and clip-path wipes, anchored by a full-height figure. Grounded, magazine-like,
 * and the only section on the page built on a left-heavy axis.
 */
export function BottomsEditorial() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const theme = CATEGORY_THEMES.bottoms;
  const { data: products } = useProducts({ category: 'bottoms', sort: 'featured', limit: 4 });

  useGSAP(
    () => {
      // Wait for the products so the wipe targets are all present in one pass;
      // building early and rebuilding on load duplicates the triggers.
      if (reduced || !products.length) return;

      /* Wipe reveals — the fabric-swatch language of a lookbook. */
      gsap.utils.toArray<HTMLElement>('[data-wipe]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.15,
            ease: 'expo.out',
            delay: (i % 2) * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }
        );
      });

      /* The figure sits on a slower plane than the product cards. */
      gsap.to('[data-figure]', {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.7,
        },
      });

      gsap.to('[data-numeral]', {
        yPercent: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    },
    { scope: ref, dependencies: [reduced, products.length] }
  );

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24 text-bone sm:py-32"
      style={{ backgroundColor: '#12141f' }}
    >
      <span
        data-numeral
        aria-hidden
        className="font-display pointer-events-none absolute -right-6 top-10 select-none text-[28vw] leading-none opacity-[0.045]"
      >
        08
      </span>

      <div className="edge relative">
        <div className="max-w-2xl">
          <SectionKicker accent={theme.accent}>Bottoms — {theme.tagline}</SectionKicker>
          <h2 className="font-display mt-5 text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.86]">
            Cut &amp; Weight
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed opacity-70">
            Eleven ounce stretch denim, ripstop cargos and thermal joggers. Built to take a full
            squat and still look like the weekend.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* Figure — grounded, cropped by the frame. */}
          <div className="relative">
            <div
              data-wipe
              className="relative overflow-hidden rounded-sm"
              style={{
                background: `linear-gradient(160deg, ${theme.accent}22 0%, transparent 55%), #171a27`,
              }}
            >
              <img
                data-figure
                src={CHARACTERS.bottoms}
                alt="Athlete wearing the KINETA cargo programme"
                width={363}
                height={931}
                loading="lazy"
                className="mx-auto h-[clamp(380px,52vw,620px)] w-auto object-contain object-bottom will-change-transform"
              />
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] opacity-50">
              Fig. 01 — Rig Cargo Jogger / Black
            </p>
          </div>

          {/* Offset product blocks. */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8">
            {products.map((product, i) => {
              const colorway = product.colorways[0];
              return (
                <article
                  key={product.id}
                  data-wipe
                  className="group relative"
                  style={{ marginTop: i % 2 === 1 ? '3.5rem' : undefined }}
                >
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="relative overflow-hidden bg-bone/[0.04] p-6 transition-colors duration-500 group-hover:bg-bone/[0.08]">
                      <span
                        aria-hidden
                        className="font-display absolute left-3 top-1 text-5xl leading-none opacity-10"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <SmartImage
                        src={colorway.image}
                        alt={`${product.name} in ${colorway.name}`}
                        width={colorway.width}
                        height={colorway.height}
                        sizes="(max-width: 640px) 45vw, 24vw"
                        className="mx-auto max-h-[300px] w-full"
                        imgClassName="drop-shadow-[0_26px_40px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                      <span
                        aria-hidden
                        className="absolute bottom-0 left-0 h-[3px] w-0 transition-[width] duration-500 group-hover:w-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                        <p className="mt-1 truncate text-[11px] uppercase tracking-[0.14em] opacity-45">
                          {product.details.fit}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm tabular-nums">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-16">
          <Link
            to="/bottoms"
            className="inline-flex h-14 items-center rounded-full px-10 text-xs font-semibold uppercase tracking-[0.2em] transition-transform duration-200 hover:scale-105"
            style={{ backgroundColor: theme.accent, color: theme.onAccent }}
          >
            All bottoms
          </Link>
        </div>
      </div>
    </section>
  );
}
