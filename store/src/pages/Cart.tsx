import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useCartStore, computeTotals, FREE_SHIPPING_THRESHOLD } from '../store/cart.store';
import { formatPrice, cn } from '../lib/utils';
import { QuantityStepper, SmartImage } from '../components/ui/Primitives';
import { PageHeader } from '../components/layout/PageHeader';
import { usePrefersReducedMotion } from '../hooks/useEnvironment';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Cart() {
  const { lines, setQuantity, remove, clear } = useCartStore();
  const totals = computeTotals(lines);
  const reduced = usePrefersReducedMotion();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal);

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-ink text-bone">
        <PageHeader kicker="Cart" title="Your bag" accent="#f2f0eb" />
        <div className="edge pb-32">
          <div className="rounded-3xl border border-bone/10 py-24 text-center">
            <p className="font-display text-4xl">Empty for now</p>
            <p className="mx-auto mt-3 max-w-sm text-sm opacity-60">
              Nothing here yet. The SS26 drop is live and moving quickly.
            </p>
            <Link
              to="/new"
              className="mt-8 inline-flex h-14 items-center rounded-full bg-bone px-10 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-transform hover:scale-105"
            >
              Shop the drop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-bone">
      <PageHeader kicker="Cart" title="Your bag" accent="#f2f0eb" count={totals.itemCount} />

      <div className="edge pb-32">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <div className="flex items-center justify-between border-b border-bone/10 pb-4">
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-50">
                {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
              </p>
              <button
                type="button"
                onClick={clear}
                className="text-[11px] uppercase tracking-[0.16em] underline underline-offset-4 opacity-50 transition-opacity hover:opacity-100"
              >
                Clear bag
              </button>
            </div>

            <ul>
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.li
                    key={line.key}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="overflow-hidden border-b border-bone/10"
                  >
                    <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center">
                      <Link
                        to={`/product/${line.slug}`}
                        className="shrink-0 rounded-2xl bg-bone/[0.05] p-3 transition-colors hover:bg-bone/[0.09]"
                      >
                        <SmartImage
                          src={line.image}
                          alt={line.name}
                          className="h-28 w-28"
                          imgClassName="object-contain"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link to={`/product/${line.slug}`}>
                          <h2 className="text-base font-semibold">{line.name}</h2>
                        </Link>
                        <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] opacity-50">
                          {line.colorwayName} · Size {line.size}
                        </p>
                        <p className="mt-3 text-sm tabular-nums opacity-70 sm:hidden">
                          {formatPrice(line.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <QuantityStepper
                          value={line.quantity}
                          onChange={(q) => setQuantity(line.key, q)}
                        />
                        <p className="w-20 text-right text-base tabular-nums">
                          {formatPrice(line.price * line.quantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => remove(line.key)}
                          aria-label={`Remove ${line.name}`}
                          className="grid h-9 w-9 place-items-center rounded-full opacity-45 transition-opacity hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <Link
              to="/shop"
              className="mt-8 inline-block text-[11px] uppercase tracking-[0.18em] underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100"
            >
              Continue shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-bone/10 bg-bone/[0.03] p-7">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">Summary</h2>

              <dl className="mt-6 space-y-3 text-sm">
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
                <div className="flex justify-between opacity-60">
                  <dt>VAT included</dt>
                  <dd className="tabular-nums">{formatPrice(totals.tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-bone/10 pt-4 text-xl font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatPrice(totals.total)}</dd>
                </div>
              </dl>

              {remaining > 0 && (
                <p className="mt-5 rounded-xl bg-bone/[0.05] p-3 text-xs opacity-70">
                  Add {formatPrice(remaining)} for free shipping.
                </p>
              )}

              <Link
                to="/checkout"
                className="group mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-bone text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-transform duration-200 hover:scale-[1.02]"
              >
                Checkout
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <p className="mt-4 text-center text-[10px] uppercase tracking-[0.16em] opacity-40">
                Concept store — no payment is taken
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
