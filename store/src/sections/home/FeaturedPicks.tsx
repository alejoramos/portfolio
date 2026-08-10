import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { Reveal, SectionKicker } from '../../components/ui/Reveal';
import { ProductGrid } from '../../components/product/ProductGrid';

/**
 * Section I — curated picks.
 *
 * Intentionally the calmest section on the page: standard grid, one entrance
 * stagger, no parallax, no accent field. After the Chamber and the Runway the
 * page needs somewhere to rest, and a store needs somewhere you can just browse.
 */
export function FeaturedPicks() {
  const { data: products, loading } = useProducts({ sort: 'featured', limit: 8 });

  return (
    <section className="relative bg-ink py-24 text-bone sm:py-28">
      <div className="edge">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionKicker accent="#ffffff" className="opacity-60">
              Curated
            </SectionKicker>
            <h2 className="font-display mt-5 text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.9]">
              Featured picks
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] underline underline-offset-4 opacity-65 transition-opacity hover:opacity-100"
          >
            Shop all 28 pieces
          </Link>
        </Reveal>

        <div className="mt-14">
          <ProductGrid products={products} loading={loading} variant="compact" />
        </div>
      </div>
    </section>
  );
}
