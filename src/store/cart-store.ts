import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  game: {
    id: string;
    slug: string;
    title: string;
    price: number;
    image?: string;
    genre?: { name: string };
    author?: { username?: string; displayUsername?: string };
  };
}

interface CartState {
  items: CartItem[];
  selected: string[];
  add: (item: CartItem) => void;
  remove: (itemId: string) => void;
  toggleSelect: (itemId: string) => void;
  set: (items: CartItem[]) => void;
  clear: () => void;
}

const CART_KEY = "game_cart";

export const useCart = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      selected: [],
      add: (item) => {
        const items = [...get().items, item];
        set({ items });
      },
      remove: (itemId) => {
        const items = get().items.filter((i) => i.id !== itemId);
        set({ items, selected: get().selected.filter((id) => id !== itemId) });
      },
      toggleSelect: (itemId) => {
        set((state) => ({
          selected: state.selected.includes(itemId)
            ? state.selected.filter((id) => id !== itemId)
            : [...state.selected, itemId],
        }));
      },
      set: (items) => {
        set({ items });
      },
      clear: () => {
        set({ items: [], selected: [] });
      },
    }),
    {
      name: CART_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);