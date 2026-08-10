import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AddToCartInput, CartLine, CartTotals } from '../types/cart';

const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING = 6;
const TAX_RATE = 0.2;

interface CartState {
  lines: CartLine[];
  /** Set when a line is added, so the UI can flash the relevant row. */
  lastAddedKey: string | null;
  add: (input: AddToCartInput) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      lastAddedKey: null,

      add: ({ product, colorwayId, size, quantity = 1 }) =>
        set((state) => {
          const colorway =
            product.colorways.find((c) => c.id === colorwayId) ?? product.colorways[0];
          const key = `${product.id}:${colorway.id}:${size}`;
          const existing = state.lines.find((l) => l.key === key);

          const lines = existing
            ? state.lines.map((l) =>
                l.key === key ? { ...l, quantity: Math.min(10, l.quantity + quantity) } : l
              )
            : [
                ...state.lines,
                {
                  key,
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: colorway.image,
                  colorwayId: colorway.id,
                  colorwayName: colorway.name,
                  size,
                  price: product.price,
                  quantity,
                },
              ];

          return { lines, lastAddedKey: key };
        }),

      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) =>
                  l.key === key ? { ...l, quantity: Math.min(10, quantity) } : l
                ),
        })),

      clear: () => set({ lines: [], lastAddedKey: null }),
    }),
    { name: 'kineta-cart', version: 1 }
  )
);

/**
 * Derived totals. Kept as a plain function rather than a selector so callers
 * choose when to recompute, and so it can be reused server-side later.
 */
export function computeTotals(lines: CartLine[], express = false): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const baseShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING;
  const shipping = express ? baseShipping + 9 : baseShipping;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  return { subtotal, shipping, tax, total: subtotal + shipping, itemCount };
}

export { FREE_SHIPPING_THRESHOLD };
