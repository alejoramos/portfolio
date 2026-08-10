import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Product } from '../../types/product';
import { CATEGORY_THEMES } from '../../data/site';
import { cn, formatPrice } from '../../lib/utils';
import { SmartImage, Badge } from '../ui/Primitives';
import { useWishlistStore } from '../../store/ui.store';
import { usePrefersReducedMotion } from '../../hooks/useEnvironment';

export type CardVariant = 'suspended' | 'dimensional' | 'editorial' | 'compact';

interface ProductCardProps {
  product: Product;
  /** Defaults to the product's own presentation, so category drives the look. */
  variant?: CardVariant;
  className?: string;
  priority?: boolean;
  index?: number;
}

/** Wishlist toggle. Sits above the card link so it does not trigger navigation. */
export function WishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const saved = ids.includes(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={saved}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full border border-current/20 backdrop-blur-sm transition-colors hover:border-current/50',
        className
      )}
    >
      <Heart size={15} strokeWidth={2} className={cn(saved && 'fill-current')} />
    </button>
  );
}

/**
 * The catalogue's single card component.
 *
 * Presentation is a prop rather than a separate component per category: the
 * shared behaviour (link target, wishlist, price, badges) stays in one place and
 * only the framing changes, so a new category is a variant rather than a fork.
 */
export const ProductCard = memo(function ProductCard({
  product,
  variant,
  className,
  priority = false,
  index = 0,
}: ProductCardProps) {
  const look: CardVariant = variant ?? product.presentation;
  const [hovered, setHovered] = useState(false);
  const reduced = usePrefersReducedMotion();
  const theme = CATEGORY_THEMES[product.category];
  const colorway = product.colorways[0];

  const lift = reduced ? {} : { y: -8 };

  return (
    <motion.article
      className={cn('group relative', className)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={lift}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
    >
      <Link to={`/product/${product.slug}`} className="block focus:outline-none">
        <div
          className={cn(
            'relative overflow-hidden transition-colors duration-500',
            look === 'suspended' && 'rounded-3xl bg-bone/[0.04]',
            look === 'dimensional' && 'rounded-3xl bg-gradient-to-b from-bone/[0.09] to-transparent',
            look === 'editorial' && 'rounded-none bg-bone/[0.03]',
            look === 'compact' && 'rounded-2xl bg-bone/[0.04]'
          )}
        >
          {/* Accent wash that blooms from behind the product on hover. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(120% 90% at 50% ${
                look === 'dimensional' ? '75%' : '55%'
              }, ${theme.accent}2E 0%, transparent 68%)`,
            }}
          />

          <div className="absolute left-4 top-4 z-10 flex gap-1.5">
            {product.badges.includes('new') && <Badge accent={theme.accent}>New</Badge>}
            {product.badges.includes('limited') && (
              <Badge className="bg-bone text-ink">Limited</Badge>
            )}
          </div>

          <WishlistButton
            productId={product.id}
            className="absolute right-3 top-3 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100"
          />

          <motion.div
            className={cn(
              'relative flex items-center justify-center',
              look === 'editorial' ? 'p-6 sm:p-8' : 'p-6 sm:p-10'
            )}
            animate={
              reduced
                ? {}
                : {
                    y: hovered ? -10 : 0,
                    rotate: look === 'dimensional' ? (hovered ? -3.5 : 0) : 0,
                    scale: hovered ? 1.05 : 1,
                  }
            }
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          >
            <SmartImage
              src={colorway.image}
              alt={`${product.name} in ${colorway.name}`}
              width={colorway.width}
              height={colorway.height}
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'w-full',
                look === 'dimensional' ? 'max-h-[220px]' : 'max-h-[280px]',
                look === 'editorial' && 'max-h-[320px]'
              )}
              imgClassName="drop-shadow-[0_28px_45px_rgba(0,0,0,0.55)]"
            />
          </motion.div>

          {/* Grounding shadow. Suspended products float above it. */}
          {look !== 'editorial' && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute bottom-6 left-1/2 h-3 -translate-x-1/2 rounded-[50%] bg-black/45 blur-md"
              animate={reduced ? {} : { width: hovered ? 132 : 108, opacity: hovered ? 0.32 : 0.5 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            />
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight">{product.name}</h3>
            <p className="mt-1 truncate text-[11px] uppercase tracking-[0.14em] opacity-45">
              {colorway.name}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm tabular-nums">{formatPrice(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-[11px] tabular-nums line-through opacity-40">
                {formatPrice(product.compareAtPrice)}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Index marker gives grids an editorial rhythm. */}
      {look === 'editorial' && (
        <span
          aria-hidden
          className="font-display pointer-events-none absolute -top-3 right-3 text-4xl leading-none opacity-10"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      )}
    </motion.article>
  );
});
