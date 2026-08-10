/**
 * Domain types for the KINETA catalogue.
 *
 * Everything the UI renders is described here. The mock data in
 * `src/data/products.mock.ts` is the only place these are hand-authored — swap
 * `src/lib/repository.ts` for a real CMS/API client and the components below it
 * do not change.
 */

export type Category = 'tops' | 'footwear' | 'bottoms';

export type Badge = 'new' | 'limited' | 'bestseller';

/** Presentation language for a product. Drives which card/showcase is used. */
export type Presentation = 'suspended' | 'dimensional' | 'editorial';

export interface Colorway {
  id: string;
  /** Human label, e.g. "Raw Indigo". */
  name: string;
  /** Swatch hex. Should be the dominant colour of `image`. */
  hex: string;
  /** Path under /public. One image per colourway in the current catalogue. */
  image: string;
  /** Intrinsic size, used to reserve layout space and avoid CLS. */
  width: number;
  height: number;
}

export interface SizeOption {
  label: string;
  inStock: boolean;
}

export interface ProductDetails {
  fabric: string;
  fit: string;
  /** Short bullet features shown on the PDP. */
  features: string[];
  care: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** One-line positioning statement shown under the name. */
  subtitle: string;
  category: Category;
  presentation: Presentation;
  /** Minor units avoided deliberately — mock data is whole currency units. */
  price: number;
  compareAtPrice?: number;
  colorways: Colorway[];
  sizes: SizeOption[];
  badges: Badge[];
  details: ProductDetails;
  /** Editorial copy for feature sections. */
  story: string;
  /** Higher wins when choosing homepage features. */
  featureRank: number;
}

export interface ProductFilter {
  category?: Category;
  badge?: Badge;
  sizes?: string[];
  maxPrice?: number;
  minPrice?: number;
  search?: string;
  sort?: SortKey;
  limit?: number;
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface Collection {
  id: string;
  title: string;
  kicker: string;
  copy: string;
  href: string;
  accent: string;
  /** Product slug whose image fronts the collection. */
  productSlug: string;
}

/** Per-category theming. Keeps colour logic in one place. */
export interface CategoryTheme {
  key: Category;
  label: string;
  href: string;
  accent: string;
  /** Foreground that meets contrast on `accent`. */
  onAccent: string;
  tagline: string;
}
