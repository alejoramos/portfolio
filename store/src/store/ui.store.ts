import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  cartOpen: boolean;
  menuOpen: boolean;
  /** True once the hero transformation has played, so returning visitors skip it. */
  introSeen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleMenu: (open?: boolean) => void;
  markIntroSeen: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  cartOpen: false,
  menuOpen: false,
  introSeen: false,
  openCart: () => set({ cartOpen: true, menuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  toggleMenu: (open) => set((s) => ({ menuOpen: open ?? !s.menuOpen, cartOpen: false })),
  markIntroSeen: () => set({ introSeen: true }),
}));

interface WishlistState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: 'kineta-wishlist', version: 1 }
  )
);
