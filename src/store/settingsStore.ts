import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  deliveryFeePerKm: number;
  baseDeliveryFee: number;
  minOrderValue: number;
  restaurantAddress: string;
  restaurantCoords: { lat: number; lng: number } | null;
  setDeliveryFeePerKm: (value: number) => void;
  setBaseDeliveryFee: (value: number) => void;
  setMinOrderValue: (value: number) => void;
  setRestaurantLocation: (address: string, coords: { lat: number; lng: number }) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      deliveryFeePerKm: 2.00,
      baseDeliveryFee: 5.00,
      minOrderValue: 20.00,
      restaurantAddress: 'R. Tamboril, 800 - Concórdia, Belo Horizonte - MG, 31110-640',
      restaurantCoords: { lat: -19.905634, lng: -43.931818 },
      setDeliveryFeePerKm: (deliveryFeePerKm) => set({ deliveryFeePerKm }),
      setBaseDeliveryFee: (baseDeliveryFee) => set({ baseDeliveryFee }),
      setMinOrderValue: (minOrderValue) => set({ minOrderValue }),
      setRestaurantLocation: (restaurantAddress, restaurantCoords) => set({ restaurantAddress, restaurantCoords }),
    }),
    {
      name: 'nevaska-settings-storage',
    }
  )
);
