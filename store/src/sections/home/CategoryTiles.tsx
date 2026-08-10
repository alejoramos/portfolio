import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORY_THEMES, CHARACTERS } from '../../data/site';
import { useProductsBySlugs } from '../../hooks/useProducts';
import { Reveal, SectionKicker } from '../../components/ui/Reveal';
import { SmartImage } from '../../components/ui/Primitives';
import { useTilt } from '../../hooks/useInteractions';

const TILES = [
  { key: 'tops', slug: 'voltage-speed-tee-volt', span: 'lg:col-span-4' },
  { key: 'footwear', slug: 'flux-runner-ember', span: 'lg:col-span-5' },
  { key: 'bottoms', slug: 'stretch-denim-jogger-indigo', span: 'lg:col-span-3' },
] as const;

/**
 * Section H — entry points to the catalogue.
 *
 * Three tiles on an uneven twelve-column split so it does not read as a row of
 * equal boxes, each carrying its category accent. Tilt is the only effect, and
 * it is pointer-gated.
 */
export function CategoryTiles() {
  const { data: products } = useProductsBySlugs(TILES.map((t) => t.slug));
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  return (
    <section className="relative bg-ink py-24 text-bone sm:py-28">
      <div className="edge">
        <SectionKicker accent="#ffffff" className="opacity-60">
          Shop by category
        </SectionKicker>

        <Reveal
          className="mt-10 grid gap-4 lg:grid-cols-12"
          stagger={0.1}
        >
          {TILES.map(({ key, slug, span }) => {
            const theme = CATEGORY_THEMES[key];
            const product = bySlug.get(slug);
            const colorway = product?.colorways[0];

            return (
              <CategoryTile
                key={key}
                to={theme.href}
                label={theme.label}
                tagline={theme.tagline}
                accent={theme.accent}
                className={span}
                image={colorway?.image}
                imageWidth={colorway?.width}
                imageHeight={colorway?.height}
              />
            );
          })}
        </Reveal>

        {/* Full-width New Drop banner closes the row. */}
        <Reveal className="mt-4">
          <Link
            to="/new"
            className="group relative flex min-h-[220px] items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-r from-bone/[0.09] to-transparent p-8"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] opacity-60">
                Just landed
              </p>
              <p className="font-display mt-3 text-[clamp(2rem,6vw,4.5rem)] leading-none">
                The SS26 Drop
              </p>
            </div>
            <ArrowUpRight
              className="relative z-10 h-10 w-10 shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-16 sm:w-16"
              strokeWidth={1.5}
            />
            <img
              src={CHARACTERS.tile}
              alt=""
              width={313}
              height={958}
              loading="lazy"
              className="pointer-events-none absolute bottom-0 right-24 hidden h-[150%] w-auto object-contain opacity-25 transition-transform duration-700 group-hover:scale-105 sm:block"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function CategoryTile({
  to,
  label,
  tagline,
  accent,
  image,
  imageWidth,
  imageHeight,
  className,
}: {
  to: string;
  label: string;
  tagline: string;
  accent: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
}) {
  const tiltRef = useTilt<HTMLAnchorElement>(6, 1.01);

  return (
    <Link
      ref={tiltRef}
      to={to}
      className={`group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-3xl bg-bone/[0.04] p-7 transition-colors duration-500 hover:bg-bone/[0.08] ${className ?? ''}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Accent floods up from the base on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0 transition-[height] duration-500 ease-out group-hover:h-full"
        style={{ background: `linear-gradient(to top, ${accent}30, transparent)` }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <h3 className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none">{label}</h3>
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] opacity-55">{tagline}</p>
        </div>
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundColor: accent, color: '#0a0a0b' }}
        >
          <ArrowUpRight size={17} strokeWidth={2.25} />
        </span>
      </div>

      {image && (
        <SmartImage
          src={image}
          alt=""
          width={imageWidth}
          height={imageHeight}
          sizes="(max-width: 1024px) 90vw, 33vw"
          className="relative mx-auto mt-6 max-h-[190px] w-full"
          imgClassName="drop-shadow-[0_28px_40px_rgba(0,0,0,0.55)] transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-105"
        />
      )}
    </Link>
  );
}
