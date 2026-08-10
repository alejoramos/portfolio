import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gsap, useGSAP, ScrollTrigger } from '../../lib/gsap';
import { COLLECTIONS, CHARACTERS } from '../../data/site';
import { useProductsBySlugs } from '../../hooks/useProducts';
import { usePrefersReducedMotion, useIsMobile } from '../../hooks/useEnvironment';
import { SmartImage } from '../../components/ui/Primitives';
import { SectionKicker } from '../../components/ui/Reveal';

/**
 * Section F — "The Runway".
 *
 * The page's single pinned horizontal moment, reserved for collection
 * storytelling so the device stays special. On mobile the pin is dropped
 * entirely and the panels become a native swipe rail — a thumb already knows how
 * to scroll sideways, and pinning fights it.
 */
const PIN_ID = 'kineta-runway-pin';

export function Runway() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();

  const { data: products } = useProductsBySlugs(COLLECTIONS.map((c) => c.productSlug));
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const pinned = !reduced && !mobile;

  useGSAP(
    () => {
      // Building before the panels exist measures the wrong width, and the
      // rebuild once data lands would leave the first pin in place — two pinned
      // triggers on one section double its spacer and displace it.
      if (!pinned || !products.length) return;

      const track = trackRef.current;
      const section = ref.current;
      if (!track || !section) return;

      // Belt and braces: a pin left behind by any path is removed by id before
      // a new one is created. `kill(true)` also unwinds the pin spacing.
      ScrollTrigger.getById(PIN_ID)?.kill(true);

      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          id: PIN_ID,
          trigger: section,
          start: 'top top',
          // Runway length follows content width, so adding a collection needs no
          // change here.
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        ScrollTrigger.getById(PIN_ID)?.kill(true);
        tween.kill();
      };
    },
    { scope: ref, dependencies: [pinned, products.length] }
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink py-20 text-bone sm:py-24">
      <div className="edge mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionKicker accent="#ffffff" className="opacity-60">
            Collections
          </SectionKicker>
          <h2 className="font-display mt-5 text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.88]">
            The Runway
          </h2>
        </div>
        <p className="hidden max-w-xs text-[11px] uppercase tracking-[0.2em] opacity-45 sm:block">
          {pinned ? 'Scroll to travel →' : 'Swipe to travel →'}
        </p>
      </div>

      <div
        ref={trackRef}
        className={
          pinned
            ? 'flex w-max gap-6 pl-[clamp(1rem,4vw,5rem)] pr-[20vw] will-change-transform'
            : 'no-bar flex w-full snap-x snap-mandatory gap-5 overflow-x-auto pl-4 pr-6 sm:pl-8'
        }
      >
        {COLLECTIONS.map((collection, i) => {
          const product = bySlug.get(collection.productSlug);
          const colorway = product?.colorways[0];

          return (
            <article
              key={collection.id}
              className="relative flex h-[clamp(420px,62vh,620px)] w-[82vw] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl p-7 sm:w-[62vw] lg:w-[38vw]"
              style={{
                background: `linear-gradient(155deg, ${collection.accent}38 0%, #101014 58%)`,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full opacity-40 blur-3xl"
                style={{ backgroundColor: collection.accent }}
              />

              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-70">
                  {collection.kicker}
                </p>
                <h3 className="font-display mt-4 text-[clamp(2rem,4.5vw,3.4rem)] leading-[0.9]">
                  {collection.title}
                </h3>
                <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-75">
                  {collection.copy}
                </p>
              </div>

              <div className="relative mt-6 flex items-end justify-between gap-4">
                {colorway && product ? (
                  <SmartImage
                    src={colorway.image}
                    alt={product.name}
                    width={colorway.width}
                    height={colorway.height}
                    sizes="30vw"
                    className="w-[58%] max-w-[280px]"
                    imgClassName="drop-shadow-[0_35px_50px_rgba(0,0,0,0.65)]"
                  />
                ) : (
                  <span className="h-40 w-[58%]" />
                )}

                <Link
                  to={collection.href}
                  className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-bone/30 px-5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-bone hover:text-ink"
                >
                  Explore
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <span
                aria-hidden
                className="font-display absolute bottom-4 right-6 text-6xl leading-none opacity-10"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </article>
          );
        })}

        {/* Closing panel — the campaign figure caps the rail. */}
        <article className="relative flex h-[clamp(420px,62vh,620px)] w-[82vw] shrink-0 snap-start items-end overflow-hidden rounded-3xl bg-gradient-to-b from-bone/10 to-transparent p-7 sm:w-[52vw] lg:w-[30vw]">
          <img
            src={CHARACTERS.runway}
            alt=""
            width={321}
            height={911}
            loading="lazy"
            className="absolute bottom-0 left-1/2 h-[86%] w-auto -translate-x-1/2 object-contain"
          />
          <div className="relative">
            <p className="font-display text-3xl leading-none">Full range</p>
            <Link
              to="/shop"
              className="mt-4 inline-flex h-12 items-center rounded-full bg-bone px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink"
            >
              Shop all
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
