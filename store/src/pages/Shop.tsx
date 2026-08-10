import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Category, SortKey } from '../types/product';
import { useProducts } from '../hooks/useProducts';
import { getSizeOptions } from '../lib/repository';
import { CATEGORY_THEMES } from '../data/site';
import { cn } from '../lib/utils';
import { ProductGrid } from '../components/product/ProductGrid';
import { PageHeader } from '../components/layout/PageHeader';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
];

interface ShopProps {
  /** When set the page behaves as a category page and hides the category filter. */
  category?: Category;
  title?: string;
  kicker?: string;
  intro?: string;
  badge?: 'new';
}

/**
 * The catalogue surface, shared by /shop and every category route.
 *
 * One component covers all of them because they differ only in their locked
 * filter and copy — duplicating it per category is how these pages drift apart.
 */
export default function Shop({ category, title, kicker, intro, badge }: ShopProps) {
  const [activeCategory, setActiveCategory] = useState<Category | undefined>(category);
  const [sort, setSort] = useState<SortKey>('featured');
  const [sizes, setSizes] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sizeOptions, setSizeOptions] = useState<string[]>([]);

  useEffect(() => setActiveCategory(category), [category]);

  useEffect(() => {
    let active = true;
    getSizeOptions(activeCategory).then((s) => active && setSizeOptions(s));
    return () => {
      active = false;
    };
  }, [activeCategory]);

  const filter = useMemo(
    () => ({ category: activeCategory, sort, sizes: sizes.length ? sizes : undefined, badge }),
    [activeCategory, sort, sizes, badge]
  );

  const { data: products, loading } = useProducts(filter);
  const theme = activeCategory ? CATEGORY_THEMES[activeCategory] : undefined;
  const accent = theme?.accent ?? '#f2f0eb';

  const toggleSize = (size: string) =>
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));

  const activeFilterCount = sizes.length + (!category && activeCategory ? 1 : 0);

  return (
    <div className="min-h-screen bg-ink text-bone">
      <PageHeader
        kicker={kicker ?? 'Catalogue'}
        title={title ?? 'Shop All'}
        intro={intro}
        accent={accent}
        count={products.length}
      />

      <div className="edge pb-28">
        {/* Control bar */}
        <div className="sticky top-16 z-40 -mx-[clamp(1rem,4vw,5rem)] mb-10 border-y border-bone/10 bg-ink/90 px-[clamp(1rem,4vw,5rem)] py-3 backdrop-blur-xl sm:top-[72px]">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              className="inline-flex items-center gap-2 rounded-full border border-bone/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors hover:border-bone/50"
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] text-ink"
                  style={{ backgroundColor: accent }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="hidden text-[11px] uppercase tracking-[0.16em] opacity-50 sm:block">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-full border border-bone/20 bg-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] outline-none transition-colors hover:border-bone/50"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key} className="bg-ink">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-x-10 gap-y-6 pb-5 pt-6">
                  {!category && (
                    <fieldset>
                      <legend className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
                        Category
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        <Chip
                          active={!activeCategory}
                          onClick={() => setActiveCategory(undefined)}
                          accent={accent}
                        >
                          All
                        </Chip>
                        {(Object.keys(CATEGORY_THEMES) as Category[]).map((key) => (
                          <Chip
                            key={key}
                            active={activeCategory === key}
                            onClick={() => setActiveCategory(key)}
                            accent={CATEGORY_THEMES[key].accent}
                          >
                            {CATEGORY_THEMES[key].label}
                          </Chip>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  <fieldset>
                    <legend className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
                      Size
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((size) => (
                        <Chip
                          key={size}
                          active={sizes.includes(size)}
                          onClick={() => toggleSize(size)}
                          accent={accent}
                        >
                          {size}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSizes([]);
                        if (!category) setActiveCategory(undefined);
                      }}
                      className="self-end pb-1 text-[11px] uppercase tracking-[0.16em] underline underline-offset-4 opacity-60 hover:opacity-100"
                    >
                      <X size={12} className="mr-1 inline" />
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          /* Any filter change re-keys the grid, which drives the Flip re-layout. */
          flipKey={`${activeCategory ?? 'all'}-${sort}-${sizes.join(',')}`}
        />
      </div>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
  accent,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200',
        active ? 'border-transparent text-ink' : 'border-bone/20 hover:border-bone/50'
      )}
      style={active ? { backgroundColor: accent } : undefined}
    >
      {children}
    </button>
  );
}
