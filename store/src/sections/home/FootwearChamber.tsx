import { Suspense, lazy, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { usePrefersReducedMotion, useIsLowPower } from '../../hooks/useEnvironment';
import { useIsVisible } from '../../hooks/useInteractions';
import { CATEGORY_THEMES } from '../../data/site';
import { cn, formatPrice } from '../../lib/utils';
import { SectionKicker } from '../../components/ui/Reveal';
import { SmartImage } from '../../components/ui/Primitives';

/** Code-split: three + drei never reach the bundle unless this section mounts. */
const ShoeStage = lazy(() => import('../../components/three/ShoeStage'));

/**
 * Section D — "The Chamber".
 *
 * The strongest treatment on the page and the only WebGL on the site. Falls back
 * to a styled static presentation on reduced motion, constrained devices, and
 * any context where the canvas cannot mount, so the section is never empty.
 */
export function FootwearChamber() {
  const [wrapRef, visible] = useIsVisible<HTMLDivElement>('300px');
  const [index, setIndex] = useState(0);
  const [webglFailed, setWebglFailed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const reduced = usePrefersReducedMotion();
  const lowPower = useIsLowPower();
  const theme = CATEGORY_THEMES.footwear;

  const { data: products } = useProducts({ category: 'footwear', sort: 'featured', limit: 5 });
  const active = products[index];

  const use3D = !reduced && !lowPower && !webglFailed && products.length > 0;
  const images = products.map((p) => p.colorways[0].image);
  const aspect = active ? active.colorways[0].width / active.colorways[0].height : 1.4;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 text-chalk sm:py-32"
      style={{ backgroundColor: theme.accent }}
    >
      {/* Depth wash so the flat accent field reads as a lit room. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 18%, rgba(255,255,255,0.24) 0%, transparent 60%), linear-gradient(to bottom, rgba(0,0,0,0.32), rgba(0,0,0,0.06) 45%, rgba(0,0,0,0.55))',
        }}
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-30" />

      <div className="edge relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionKicker accent="#ffffff" className="opacity-75">
              Footwear — {theme.tagline}
            </SectionKicker>
            <h2 className="font-display mt-5 text-[clamp(3rem,11vw,9rem)] leading-[0.85]">
              The Chamber
            </h2>
          </div>
          <Link
            to="/footwear"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80 transition-opacity hover:opacity-100"
          >
            All footwear
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          {/* Stage */}
          <div
            ref={wrapRef}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-black/25 sm:aspect-[16/10]"
          >
            {use3D ? (
              <Suspense fallback={<StageFallback product={active} />}>
                {/* Mounting only once visible keeps the canvas out of the
                    critical path and avoids compiling shaders off screen. */}
                {visible ? (
                  <ErrorBoundary onError={() => setWebglFailed(true)}>
                    <ShoeStage
                      images={images}
                      index={index}
                      aspect={aspect}
                      accent={theme.accent}
                      active={visible}
                    />
                  </ErrorBoundary>
                ) : (
                  <StageFallback product={active} />
                )}
              </Suspense>
            ) : (
              <StageFallback product={active} />
            )}

            {active && (
              <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-2xl leading-none sm:text-4xl">{active.name}</p>
                  <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] opacity-75">
                    {active.colorways[0].name}
                  </p>
                </div>
                <p className="font-display text-2xl tabular-nums sm:text-4xl">
                  {formatPrice(active.price)}
                </p>
              </div>
            )}
          </div>

          {/* Selector */}
          <div>
            <p className="max-w-md text-sm leading-relaxed opacity-85">
              {active?.story ??
                'Five silhouettes, one platform. Supercritical foam, carbon plates and outsoles cut for the surface you actually run on.'}
            </p>

            <ul className="mt-8 space-y-1">
              {products.map((product, i) => {
                const selected = i === index;
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-pressed={selected}
                      className={cn(
                        'group flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition-colors duration-300',
                        selected ? 'bg-black/30' : 'hover:bg-black/15'
                      )}
                    >
                      <span className="w-6 shrink-0 text-[10px] tabular-nums opacity-60">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="h-7 w-7 shrink-0 rounded-full ring-1 ring-inset ring-white/40"
                        style={{ backgroundColor: product.colorways[0].hex }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{product.name}</span>
                        <span className="block truncate text-[11px] opacity-65">
                          {product.subtitle}
                        </span>
                      </span>
                      <ArrowRight
                        size={15}
                        className={cn(
                          'shrink-0 transition-all duration-300',
                          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            {active && (
              <Link
                to={`/product/${active.slug}`}
                className="mt-8 inline-flex h-14 items-center rounded-full bg-chalk px-9 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-transform duration-200 hover:scale-105"
              >
                View {active.name}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StageFallback({ product }: { product?: { name: string; colorways: { image: string; width: number; height: number; name: string }[] } }) {
  if (!product) return <div className="h-full w-full animate-pulse bg-white/5" />;
  const colorway = product.colorways[0];
  return (
    <div className="grid h-full w-full place-items-center p-8">
      <SmartImage
        src={colorway.image}
        alt={`${product.name} in ${colorway.name}`}
        width={colorway.width}
        height={colorway.height}
        priority
        className="w-full max-w-[560px]"
        imgClassName="drop-shadow-[0_45px_60px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
}

/* Minimal boundary — a WebGL context failure must degrade, not blank the page. */
import { Component, type ErrorInfo, type ReactNode } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[KINETA] WebGL scene failed, using static fallback.', error, info);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
