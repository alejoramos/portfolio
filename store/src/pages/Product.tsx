import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Package, RotateCcw, Truck } from 'lucide-react';
import { useProduct, useRelatedProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cart.store';
import { useUIStore } from '../store/ui.store';
import { CATEGORY_THEMES } from '../data/site';
import { cn, formatPrice } from '../lib/utils';
import { Accordion, QuantityStepper, SmartImage, Badge } from '../components/ui/Primitives';
import { SizeSelector, ColorwaySelector } from '../components/product/Selectors';
import { WishlistButton } from '../components/product/ProductCard';
import { ProductGrid } from '../components/product/ProductGrid';
import { useTilt, useIsVisible } from '../hooks/useInteractions';
import { usePrefersReducedMotion, useIsLowPower, useIsMobile } from '../hooks/useEnvironment';

const ShoeStage = lazy(() => import('../components/three/ShoeStage'));

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, loading } = useProduct(slug);
  const related = useRelatedProducts(product, 4);

  const add = useCartStore((s) => s.add);
  const openCart = useUIStore((s) => s.openCart);

  const [colorwayId, setColorwayId] = useState<string>('');
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const reduced = usePrefersReducedMotion();
  const lowPower = useIsLowPower();
  const mobile = useIsMobile();
  const [stageRef, stageVisible] = useIsVisible<HTMLDivElement>('200px');
  const tiltRef = useTilt<HTMLDivElement>(7, 1.01);

  useEffect(() => {
    if (product) {
      setColorwayId(product.colorways[0].id);
      setSize(null);
      setQuantity(1);
      setSizeError(false);
    }
    window.scrollTo(0, 0);
  }, [product]);

  const colorway = useMemo(
    () => product?.colorways.find((c) => c.id === colorwayId) ?? product?.colorways[0],
    [product, colorwayId]
  );

  const theme = product ? CATEGORY_THEMES[product.category] : CATEGORY_THEMES.tops;
  const isFootwear = product?.category === 'footwear';
  const use3D = isFootwear && !reduced && !lowPower && !mobile;

  const onAdd = () => {
    if (!product || !colorway) return;
    if (!size) {
      setSizeError(true);
      return;
    }
    add({ product, colorwayId: colorway.id, size, quantity });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
    openCart();
  };

  if (loading) return <ProductSkeletonPage />;

  if (!product || !colorway) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink px-6 text-center text-bone">
        <div>
          <p className="font-display text-5xl">Not found</p>
          <p className="mt-3 opacity-60">That piece is not in the SS26 range.</p>
          <Link
            to="/shop"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-bone px-8 text-xs font-semibold uppercase tracking-widest text-ink"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-bone">
      <div className="edge pt-24 sm:pt-28">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 py-6 text-[11px] uppercase tracking-[0.16em] opacity-50">
          <Link to="/shop" className="transition-opacity hover:opacity-100">
            Shop
          </Link>
          <ChevronRight size={12} />
          <Link to={theme.href} className="transition-opacity hover:opacity-100">
            {theme.label}
          </Link>
          <ChevronRight size={12} />
          <span className="truncate opacity-70">{product.name}</span>
        </nav>

        <div className="grid gap-10 pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* ------------------------------------------------ Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div
              ref={stageRef}
              className="relative aspect-square overflow-hidden rounded-3xl"
              style={{
                background: `radial-gradient(80% 70% at 50% 40%, ${theme.accent}26 0%, transparent 70%), #131317`,
              }}
            >
              {use3D ? (
                <Suspense fallback={<GalleryImage colorway={colorway} name={product.name} />}>
                  {stageVisible ? (
                    <ShoeStage
                      images={[colorway.image]}
                      index={0}
                      aspect={colorway.width / colorway.height}
                      accent={theme.accent}
                      active={stageVisible}
                    />
                  ) : (
                    <GalleryImage colorway={colorway} name={product.name} />
                  )}
                </Suspense>
              ) : (
                <div ref={tiltRef} className="h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={colorway.id}
                      initial={reduced ? false : { opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduced ? undefined : { opacity: 0, scale: 1.04 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="grid h-full w-full place-items-center p-10"
                    >
                      <GalleryImage colorway={colorway} name={product.name} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              <div className="pointer-events-none absolute left-5 top-5 flex gap-2">
                {product.badges.map((badge) => (
                  <Badge key={badge} accent={badge === 'new' ? theme.accent : '#f2f0eb'}>
                    {badge}
                  </Badge>
                ))}
              </div>

              {use3D && (
                <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-[10px] uppercase tracking-[0.22em] opacity-40">
                  Move your pointer to inspect
                </p>
              )}
            </div>

            {/* Detail strip — the same render at different crops. */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {['object-left', 'object-center', 'object-right'].map((position, i) => (
                <div
                  key={position}
                  className="aspect-[4/3] overflow-hidden rounded-xl bg-bone/[0.05] p-3"
                >
                  <img
                    src={colorway.image}
                    alt={`${product.name} detail ${i + 1}`}
                    loading="lazy"
                    className={cn('h-full w-full scale-[1.6] object-contain', position)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ------------------------------------------------- Buy box */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] opacity-50">
                  {theme.label} — {product.subtitle}
                </p>
                <h1 className="font-display mt-3 text-[clamp(2.25rem,6vw,4rem)] leading-[0.9]">
                  {product.name}
                </h1>
              </div>
              <WishlistButton productId={product.id} className="mt-2 shrink-0" />
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <p className="text-2xl tabular-nums">{formatPrice(product.price)}</p>
              {product.compareAtPrice && (
                <p className="text-base tabular-nums line-through opacity-40">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
            </div>

            <p className="mt-6 text-sm leading-relaxed opacity-70">{product.story}</p>

            <div className="mt-9 space-y-8">
              {product.colorways.length > 1 && (
                <ColorwaySelector
                  colorways={product.colorways}
                  value={colorway.id}
                  onChange={setColorwayId}
                />
              )}

              <SizeSelector
                sizes={product.sizes}
                value={size}
                accent={theme.accent}
                error={sizeError}
                onChange={(s) => {
                  setSize(s);
                  setSizeError(false);
                }}
              />

              <div className="flex flex-wrap items-center gap-4">
                <QuantityStepper value={quantity} onChange={setQuantity} />
                <button
                  type="button"
                  onClick={onAdd}
                  className="relative h-12 flex-1 overflow-hidden rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-transform duration-200 hover:scale-[1.02]"
                  style={{ backgroundColor: theme.accent }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={justAdded ? 'added' : 'add'}
                      initial={reduced ? false : { y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={reduced ? undefined : { y: -20, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="absolute inset-0 grid place-items-center"
                    >
                      {justAdded ? (
                        <span className="inline-flex items-center gap-2">
                          <Check size={15} /> Added
                        </span>
                      ) : (
                        `Add to cart — ${formatPrice(product.price * quantity)}`
                      )}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Delivery */}
            <ul className="mt-9 grid gap-3 border-y border-bone/10 py-6 text-xs">
              <li className="flex items-center gap-3 opacity-70">
                <Truck size={15} className="shrink-0" />
                Free standard shipping over £150 — 2 to 4 working days
              </li>
              <li className="flex items-center gap-3 opacity-70">
                <RotateCcw size={15} className="shrink-0" />
                60 day returns, free on all orders
              </li>
              <li className="flex items-center gap-3 opacity-70">
                <Package size={15} className="shrink-0" />
                Ships in recycled, plastic-free packaging
              </li>
            </ul>

            <Accordion
              className="mt-2"
              items={[
                {
                  title: 'Details',
                  content: (
                    <ul className="space-y-2">
                      {product.details.features.map((f) => (
                        <li key={f}>— {f}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: 'Fabric & fit',
                  content: (
                    <div className="space-y-2">
                      <p>{product.details.fabric}</p>
                      <p>{product.details.fit}</p>
                    </div>
                  ),
                },
                {
                  title: 'Care',
                  content: (
                    <ul className="space-y-2">
                      {product.details.care.map((c) => (
                        <li key={c}>— {c}</li>
                      ))}
                    </ul>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {related.length > 0 && (
        <section className="border-t border-bone/10 py-20">
          <div className="edge">
            <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-none">
              Completes the kit
            </h2>
            <div className="mt-10">
              <ProductGrid products={related} variant="compact" />
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-bone/10 bg-ink/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{product.name}</p>
            <p className="text-xs tabular-nums opacity-60">{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="h-11 shrink-0 rounded-full px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink"
            style={{ backgroundColor: theme.accent }}
          >
            {size ? 'Add to cart' : 'Select size'}
          </button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </div>
  );
}

function GalleryImage({
  colorway,
  name,
}: {
  colorway: { image: string; width: number; height: number; name: string };
  name: string;
}) {
  return (
    <SmartImage
      src={colorway.image}
      alt={`${name} in ${colorway.name}`}
      width={colorway.width}
      height={colorway.height}
      priority
      sizes="(max-width: 1024px) 92vw, 55vw"
      className="max-h-full w-full"
      imgClassName="drop-shadow-[0_45px_70px_rgba(0,0,0,0.6)]"
    />
  );
}

function ProductSkeletonPage() {
  return (
    <div className="min-h-screen bg-ink">
      <div className="edge grid gap-10 pt-32 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-square animate-pulse rounded-3xl bg-bone/[0.05]" />
        <div className="space-y-5 pt-6">
          <div className="h-3 w-32 animate-pulse rounded bg-bone/[0.06]" />
          <div className="h-14 w-3/4 animate-pulse rounded bg-bone/[0.06]" />
          <div className="h-6 w-24 animate-pulse rounded bg-bone/[0.06]" />
          <div className="h-24 w-full animate-pulse rounded bg-bone/[0.06]" />
          <div className="h-12 w-full animate-pulse rounded-full bg-bone/[0.06]" />
        </div>
      </div>
    </div>
  );
}
