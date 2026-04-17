import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, MenuCategory } from '../types';
import { MENU_ITEMS, MENU_CATEGORIES } from '../data/menu';

interface MenuState {
  items: Product[];
  categories: MenuCategory[];
  addItem: (product: Omit<Product, 'id'>) => void;
  deleteItem: (id: string) => void;
  updateItem: (id: string, product: Partial<Product>) => void;
  duplicateItem: (id: string) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      items: MENU_ITEMS,
      categories: MENU_CATEGORIES,
      addItem: (product) => set((state) => ({
        items: [...state.items, { ...product, id: Math.random().toString(36).substr(2, 9) }]
      })),
      deleteItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),
      updateItem: (id, updatedProduct) => set((state) => ({
        items: state.items.map((item) => item.id === id ? { ...item, ...updatedProduct } : item)
      })),
      duplicateItem: (id) => set((state) => {
        const itemToClone = state.items.find(i => i.id === id);
        if (!itemToClone) return state;
        const clonedItem = { ...itemToClone, id: Math.random().toString(36).substr(2, 9), name: `${itemToClone.name} (Cópia)` };
        return { items: [...state.items, clonedItem] };
      }),
    }),
    {
      name: 'nevaska-menu-storage',
    }
  )
);
