import { create } from 'zustand';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setCartOpen: (isOpen: boolean) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isCartOpen: false,
  addItem: (newItem) => set((state) => {
    // Check if identical item exists (same product and same options)
    const existingItemIndex = state.items.findIndex(item => {
      if (item.productId !== newItem.productId) return false;
      
      const itemOptions = item.options.map(o => o.choiceId).sort().join(',');
      const newItemOptions = newItem.options.map(o => o.choiceId).sort().join(',');
      
      return itemOptions === newItemOptions;
    });

    if (existingItemIndex > -1) {
      const updatedItems = [...state.items];
      const existingItem = updatedItems[existingItemIndex];
      existingItem.quantity += newItem.quantity;
      existingItem.totalPrice += newItem.totalPrice;
      return { items: updatedItems };
    }

    return { items: [...state.items, newItem] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  clearCart: () => set({ items: [] }),
  getCartTotal: () => {
    return get().items.reduce((total, item) => total + item.totalPrice, 0);
  },
  getCartItemsCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  }
}));
