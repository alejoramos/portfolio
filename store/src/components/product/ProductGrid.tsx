import { useLayoutEffect, useRef } from 'react';
import type { Product } from '../../types/product';
import { Flip, gsap } from '../../lib/gsap';
import { cn } from '../../lib/utils';
import { ProductCard, type CardVariant } from './ProductCard';
import { ProductSkeleton } from '../ui/Primitives';
import { usePrefersReducedMotion } from '../../hooks/useEnvironment';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  variant?: CardVariant;
  className?: string;
  columns?: string;
  /** Changing this key animates the layout between states via Flip. */
  flipKey?: string | number;
  skeletonCount?: number;
}

/**
 * Catalogue grid with animated re-layout.
 *
 * Filtering and sorting are exactly what GSAP Flip is for: the DOM order changes
 * in one commit and Flip interpolates every card from where it was to where it
 * landed, which reads far better than a fade-out/fade-in.
 */
export function ProductGrid({
  products,
  loading = false,
  variant,
  className,
  columns = 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  flipKey,
  skeletonCount = 8,
}: ProductGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const stateRef = useRef<Flip.FlipState | null>(null);
  const reduced = usePrefersReducedMotion();
  const previousKey = useRef(flipKey);

  // Capture positions before React commits the new order.
  if (flipKey !== previousKey.current && ref.current && !reduced) {
    stateRef.current = Flip.getState(ref.current.querySelectorAll('[data-flip-card]'));
    previousKey.current = flipKey;
  }

  useLayoutEffect(() => {
    const state = stateRef.current;
    if (!state || reduced) return;
    stateRef.current = null;

    Flip.from(state, {
      duration: 0.65,
      ease: 'power3.inOut',
      stagger: 0.02,
      absolute: true,
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
        ),
      onLeave: (elements) =>
        gsap.to(elements, { opacity: 0, scale: 0.9, duration: 0.35, ease: 'power2.in' }),
    });
  });

  /*
   * Skeletons are for the first load only. On a refilter the previous results
   * stay on screen while the new set resolves — otherwise the grid empties for a
   * frame, Flip has no "from" state to measure, and the re-layout is lost.
   */
  if (loading && !products.length) {
    return (
      <div className={cn('grid gap-x-5 gap-y-12', columns, className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className={cn('py-24 text-center', className)}>
        <p className="font-display text-3xl">Nothing here yet</p>
        <p className="mt-3 text-sm opacity-55">Try widening the filters.</p>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('grid gap-x-5 gap-y-12', columns, className)}>
      {products.map((product, i) => (
        <div key={product.id} data-flip-card data-flip-id={product.id}>
          <ProductCard product={product} variant={variant} index={i} priority={i < 4} />
        </div>
      ))}
    </div>
  );
}
