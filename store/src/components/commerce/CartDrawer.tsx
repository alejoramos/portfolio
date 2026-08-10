import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore, computeTotals, FREE_SHIPPING_THRESHOLD } from '../../store/cart.store';
import { useUIStore } from '../../store/ui.store';
import { formatPrice, cn } from '../../lib/utils';
import { QuantityStepper, SmartImage } from '../ui/Primitives';
import { useScrollLock, useEscape, useFocusTrap } from '../../hooks/useInteractions';
import { usePrefersReducedMotion } from '../../hooks/useEnvironment';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Slide-over cart.
 *
 * Quick adds open here rather than navigating, so browsing is never interrupted;
 * `/cart` remains available as a full page for review before checkout.
 */
export function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore();
  const { lines, setQuantity, remove } = useCartStore();
  const totals = computeTotals(lines);
  const reduced = usePrefersReducedMotion();

  useScrollLock(cartOpen);
  useEscape(cartOpen, closeCart);
  const trapRef = useFocusTrap<HTMLDivElement>(cartOpen);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal);
  const progress = Math.min(100, (totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm"
            aria-hidden
          />

          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={reduced ? { opacity: 0 } : { x: '100%' }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-y-0 right-0 z-[111] flex w-full max-w-[460px] flex-col bg-ink-2 text-bone shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-bone/10 px-6 py-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                Cart
                <span className="ml-2 opacity-50">({totals.itemCount})</span>
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-bone/10"
              >
                <X size={18} />
              </button>
            </div>

            {lines.length > 0 && (
              <div className="border-b border-bone/10 px-6 py-4">
                <p className="text-[11px] uppercase tracking-[0.14em] opacity-60">
                  {remaining > 0 ? (
                    <>
                      <span className="text-bone">{formatPrice(remaining)}</span> from free shipping
                    </>
                  ) : (
                    <span className="text-volt">Free shipping unlocked</span>
                  )}
                </p>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-bone/10">
                  <motion.div
                    className="h-full rounded-full bg-volt"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag size={40} strokeWidth={1.2} className="opacity-25" />
                  <p className="font-display mt-6 text-3xl">Nothing in the bag</p>
                  <p className="mt-2 max-w-[240px] text-sm opacity-55">
                    The SS26 drop is live. Start with the Flux Runner.
                  </p>
                  <Link
                    to="/new"
                    onClick={closeCart}
                    className="mt-7 inline-flex h-12 items-center rounded-full bg-bone px-8 text-xs font-semibold uppercase tracking-[0.18em] text-ink"
                  >
                    Shop the drop
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-bone/10">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.key}
                        layout={!reduced}
                        initial={reduced ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={reduced ? undefined : { opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.32, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4 py-5">
                          <Link
                            to={`/product/${line.slug}`}
                            onClick={closeCart}
                            className="shrink-0 rounded-xl bg-bone/[0.05] p-2"
                          >
                            <SmartImage
                              src={line.image}
                              alt={line.name}
                              className="h-20 w-20"
                              imgClassName="object-contain"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link
                                  to={`/product/${line.slug}`}
                                  onClick={closeCart}
                                  className="block truncate text-sm font-semibold"
                                >
                                  {line.name}
                                </Link>
                                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] opacity-50">
                                  {line.colorwayName} · {line.size}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(line.key)}
                                aria-label={`Remove ${line.name}`}
                                className="shrink-0 rounded-full p-1.5 opacity-45 transition-opacity hover:opacity-100"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <QuantityStepper
                                compact
                                value={line.quantity}
                                onChange={(q) => setQuantity(line.key, q)}
                              />
                              <p className="text-sm tabular-nums">
                                {formatPrice(line.price * line.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-bone/10 px-6 py-5">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="opacity-60">Subtotal</dt>
                    <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="opacity-60">Shipping</dt>
                    <dd className={cn('tabular-nums', totals.shipping === 0 && 'text-volt')}>
                      {totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-bone/10 pt-3 text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatPrice(totals.total)}</dd>
                  </div>
                </dl>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="mt-5 grid h-14 w-full place-items-center rounded-full bg-bone text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-transform duration-200 hover:scale-[1.02]"
                >
                  Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="mt-3 block text-center text-[11px] uppercase tracking-[0.18em] underline underline-offset-4 opacity-55 transition-opacity hover:opacity-100"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
