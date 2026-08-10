import { PRODUCTS as AUTHORED } from '../data/products.mock';
import { asset } from './utils';
import type { Category, Product, ProductFilter, SortKey } from '../types/product';

/**
 * Colourway images are authored as paths under /public. Resolving them against
 * the deployment base happens once, here, because this module is the only door
 * the catalogue comes through — doing it at render sites would mean remembering
 * it in every component that ever shows a product.
 */
const PRODUCTS: Product[] = AUTHORED.map((product) => ({
  ...product,
  colorways: product.colorways.map((c) => ({ ...c, image: asset(c.image) })),
}));

/**
 * The single seam between the UI and the data source.
 *
 * Every function is async and returns plain domain objects, so replacing the
 * mock array with `fetch('/api/products')` (or a CMS SDK) is a change confined
 * to this file. No component imports the mock data directly.
 */

/** Simulated latency, so loading states are exercised in development. */
const LATENCY = import.meta.env.DEV ? 120 : 0;

function settle<T>(value: T): Promise<T> {
  if (!LATENCY) return Promise.resolve(value);
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));
}

const SORTERS: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) => b.featureRank - a.featureRank,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  newest: (a, b) =>
    Number(b.badges.includes('new')) - Number(a.badges.includes('new')) ||
    b.featureRank - a.featureRank,
};

export function applyFilter(source: Product[], filter: ProductFilter = {}): Product[] {
  const { category, badge, sizes, minPrice, maxPrice, search, sort = 'featured', limit } = filter;

  let out = source.filter((p) => {
    if (category && p.category !== category) return false;
    if (badge && !p.badges.includes(badge)) return false;
    if (minPrice != null && p.price < minPrice) return false;
    if (maxPrice != null && p.price > maxPrice) return false;
    if (sizes?.length) {
      const available = p.sizes.filter((s) => s.inStock).map((s) => s.label);
      if (!sizes.some((s) => available.includes(s))) return false;
    }
    if (search) {
      const haystack = `${p.name} ${p.subtitle} ${p.category} ${p.colorways
        .map((c) => c.name)
        .join(' ')}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  out = [...out].sort(SORTERS[sort]);
  return limit ? out.slice(0, limit) : out;
}

export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  return settle(applyFilter(PRODUCTS, filter));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return settle(PRODUCTS.find((p) => p.slug === slug) ?? null);
}

export async function getProductsBySlugs(slugs: readonly string[]): Promise<Product[]> {
  const bySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
  return settle(slugs.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p)));
}

/** Same-category picks, highest ranked first, excluding the product itself. */
export async function getRelatedProducts(product: Product, count = 4): Promise<Product[]> {
  const sameCategory = applyFilter(PRODUCTS, { category: product.category }).filter(
    (p) => p.id !== product.id
  );
  const fill = applyFilter(PRODUCTS, {}).filter(
    (p) => p.id !== product.id && p.category !== product.category
  );
  return settle([...sameCategory, ...fill].slice(0, count));
}

export async function getCategoryCounts(): Promise<Record<Category, number>> {
  return settle({
    tops: PRODUCTS.filter((p) => p.category === 'tops').length,
    footwear: PRODUCTS.filter((p) => p.category === 'footwear').length,
    bottoms: PRODUCTS.filter((p) => p.category === 'bottoms').length,
  });
}

/** All size labels available in a category, for filter UI. */
export async function getSizeOptions(category?: Category): Promise<string[]> {
  const pool = category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;
  const set = new Set<string>();
  pool.forEach((p) => p.sizes.forEach((s) => set.add(s.label)));
  const labels = [...set];
  const apparelOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  return settle(
    labels.sort((a, b) => {
      const ai = apparelOrder.indexOf(a);
      const bi = apparelOrder.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return Number(a) - Number(b);
    })
  );
}

export async function getPriceBounds(): Promise<{ min: number; max: number }> {
  const prices = PRODUCTS.map((p) => p.price);
  return settle({ min: Math.min(...prices), max: Math.max(...prices) });
}
