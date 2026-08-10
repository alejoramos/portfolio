import { useEffect, useMemo, useRef, useState } from 'react';
import * as repo from '../lib/repository';
import type { Product, ProductFilter } from '../types/product';

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetches through the repository rather than reading mock data directly, so the
 * loading and error branches already exist when a real API is wired in.
 */
export function useProducts(filter: ProductFilter = {}): AsyncState<Product[]> {
  // Filters are usually inline object literals; serialising avoids an effect
  // loop from a new reference on every render.
  const key = JSON.stringify(filter);
  const stable = useMemo<ProductFilter>(() => JSON.parse(key), [key]);

  const [state, setState] = useState<AsyncState<Product[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true }));
    repo
      .getProducts(stable)
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error: Error) => active && setState({ data: [], loading: false, error }));
    return () => {
      active = false;
    };
  }, [stable]);

  return state;
}

export function useProduct(slug: string | undefined): AsyncState<Product | null> {
  const [state, setState] = useState<AsyncState<Product | null>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!slug) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let active = true;
    setState({ data: null, loading: true, error: null });
    repo
      .getProductBySlug(slug)
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error: Error) => active && setState({ data: null, loading: false, error }));
    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}

export function useProductsBySlugs(slugs: readonly string[]): AsyncState<Product[]> {
  const key = slugs.join('|');
  const [state, setState] = useState<AsyncState<Product[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    repo
      .getProductsBySlugs(key ? key.split('|') : [])
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error: Error) => active && setState({ data: [], loading: false, error }));
    return () => {
      active = false;
    };
  }, [key]);

  return state;
}

export function useRelatedProducts(product: Product | null, count = 4): Product[] {
  const [related, setRelated] = useState<Product[]>([]);
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product || idRef.current === product.id) return;
    idRef.current = product.id;
    let active = true;
    repo.getRelatedProducts(product, count).then((data) => active && setRelated(data));
    return () => {
      active = false;
    };
  }, [product, count]);

  return related;
}
