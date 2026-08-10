import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useWishlistStore } from '../store/ui.store';
import { ProductGrid } from '../components/product/ProductGrid';
import { PageHeader } from '../components/layout/PageHeader';

export default function Wishlist() {
  const ids = useWishlistStore((s) => s.ids);
  const clear = useWishlistStore((s) => s.clear);
  const { data: all, loading } = useProducts({});
  const saved = all.filter((p) => ids.includes(p.id));

  return (
    <div className="min-h-screen bg-ink text-bone">
      <PageHeader
        kicker="Saved"
        title="Wishlist"
        accent="#ff4a1c"
        count={saved.length}
        intro="Pieces you have kept an eye on. Saved to this device."
      />

      <div className="edge pb-28">
        {ids.length > 0 && (
          <div className="mb-8 flex justify-end">
            <button
              type="button"
              onClick={clear}
              className="text-[11px] uppercase tracking-[0.16em] underline underline-offset-4 opacity-55 transition-opacity hover:opacity-100"
            >
              Clear wishlist
            </button>
          </div>
        )}

        {!loading && saved.length === 0 ? (
          <div className="rounded-3xl border border-bone/10 py-24 text-center">
            <p className="font-display text-4xl">Nothing saved yet</p>
            <p className="mx-auto mt-3 max-w-sm text-sm opacity-60">
              Tap the heart on any piece to keep it here.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex h-14 items-center rounded-full bg-bone px-10 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-transform hover:scale-105"
            >
              Browse the range
            </Link>
          </div>
        ) : (
          <ProductGrid products={saved} loading={loading} flipKey={ids.join(',')} />
        )}
      </div>
    </div>
  );
}
