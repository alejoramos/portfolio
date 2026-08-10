import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { gsap, useGSAP } from '../../lib/gsap';
import { useProducts } from '../../hooks/useProducts';
import { usePrefersReducedMotion } from '../../hooks/useEnvironment';
import { BRAND } from '../../data/site';
import { formatPrice } from '../../lib/utils';
import { SectionKicker, SplitHeading } from '../../components/ui/Reveal';
import { SmartImage, ProductSkeleton } from '../../components/ui/Primitives';

/**
 * Section B — the landing point of the hero transformation.
 *
 * Shares the hero reveal's ink background so the seam is invisible. Products are
 * suspended at uneven heights and drift at different rates on scroll, which
 * gives depth without any single loud effect.
 */
export function NewDrop() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { data: products, loading } = useProducts({ badge: 'new', sort: 'featured', limit: 5 });

  useGSAP(
    () => {
      if (reduced || !products.length) return;

      const cards = gsap.utils.toArray<HTMLElement>('[data-drop-card]');

      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 90,
          duration: 1,
          ease: 'expo.out',
          delay: i * 0.07,
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        });

        // Differing drift rates separate the plane each product sits on.
        gsap.to(card, {
          yPercent: -8 - (i % 3) * 7,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        });
      });
    },
    { scope: ref, dependencies: [reduced, products.length] }
  );

  return (
    <section ref={ref} id="new-drop" className="relative bg-ink py-24 text-bone sm:py-32">
      <div className="edge">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionKicker accent="#ffffff" className="opacity-60">
              {BRAND.season} — Just landed
            </SectionKicker>
            <SplitHeading
              text="New Drop"
              className="font-display mt-5 text-[clamp(3rem,11vw,9rem)] leading-[0.85]"
            />
          </div>
          <Link
            to="/new"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70 transition-opacity hover:opacity-100"
          >
            View the drop
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {loading ? (
          <div className="mt-20 grid grid-cols-2 gap-6 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="mt-20 grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-5 lg:gap-x-6">
            {products.map((product, i) => {
              const colorway = product.colorways[0];
              // Alternating offsets break the grid line without breaking the grid.
              const offset = [0, 56, 14, 78, 30][i % 5];

              return (
                <article
                  key={product.id}
                  data-drop-card
                  className="group relative will-change-transform"
                  style={{ marginTop: `${offset}px` }}
                >
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-bone/[0.07] to-transparent p-5 transition-colors duration-500 group-hover:from-bone/[0.12]">
                      <span className="font-display absolute right-3 top-2 text-3xl leading-none opacity-15">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <SmartImage
                        src={colorway.image}
                        alt={`${product.name} in ${colorway.name}`}
                        width={colorway.width}
                        height={colorway.height}
                        sizes="(max-width: 1024px) 45vw, 18vw"
                        className="mx-auto max-h-[210px] w-full"
                        imgClassName="drop-shadow-[0_30px_45px_rgba(0,0,0,0.6)] transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-45">
                        {product.category}
                      </p>
                      <h3 className="mt-1.5 text-sm font-semibold leading-snug">{product.name}</h3>
                      <p className="mt-1 text-sm tabular-nums opacity-70">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
