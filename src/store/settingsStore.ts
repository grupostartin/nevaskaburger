import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SettingsState {
  deliveryFeePerKm: number;
  baseDeliveryFee: number;
  minOrderValue: number;
  freeDeliveryRadius: number;
  restaurantAddress: string;
  restaurantCoords: { lat: number; lng: number } | null;
  globalIngredients: string[];
  globalAddons: { label: string; price: number }[];
  globalDrinks: string[];
  globalMilkshakes: string[];
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Omit<SettingsState, 'isLoading' | 'error' | 'fetchSettings' | 'updateSettings'>>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  deliveryFeePerKm: 2.00,
  baseDeliveryFee: 5.00,
  minOrderValue: 20.00,
  freeDeliveryRadius: 0,
  restaurantAddress: 'R. Tamboril, 800 - Concórdia, Belo Horizonte - MG, 31110-640',
  restaurantCoords: { lat: -19.899247, lng: -43.938688 },
  globalIngredients: [],
  globalAddons: [],
  globalDrinks: [],
  globalMilkshakes: [],
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;

      if (data) {
        set({
          deliveryFeePerKm: Number(data.delivery_fee_per_km),
          baseDeliveryFee: Number(data.base_delivery_fee),
          minOrderValue: Number(data.min_order_value),
          freeDeliveryRadius: Number(data.free_delivery_radius || 0),
          restaurantAddress: data.restaurant_address,
          restaurantCoords: { lat: Number(data.restaurant_lat), lng: Number(data.restaurant_lng) },
          globalIngredients: data.global_ingredients || [],
          globalAddons: data.global_addons || [],
          globalDrinks: data.global_drinks || [],
          globalMilkshakes: data.global_milkshakes || [],
          isLoading: false
        });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateSettings: async (newSettings) => {
    set({ isLoading: true });
    try {
      const updateData: any = {};
      if (newSettings.deliveryFeePerKm !== undefined) updateData.delivery_fee_per_km = newSettings.deliveryFeePerKm;
      if (newSettings.baseDeliveryFee !== undefined) updateData.base_delivery_fee = newSettings.baseDeliveryFee;
      if (newSettings.minOrderValue !== undefined) updateData.min_order_value = newSettings.minOrderValue;
      if (newSettings.freeDeliveryRadius !== undefined) updateData.free_delivery_radius = newSettings.freeDeliveryRadius;
      if (newSettings.restaurantAddress !== undefined) updateData.restaurant_address = newSettings.restaurantAddress;
      if (newSettings.restaurantCoords !== undefined) {
        updateData.restaurant_lat = newSettings.restaurantCoords.lat;
        updateData.restaurant_lng = newSettings.restaurantCoords.lng;
      }
      if (newSettings.globalIngredients !== undefined) updateData.global_ingredients = newSettings.globalIngredients;
      if (newSettings.globalAddons !== undefined) updateData.global_addons = newSettings.globalAddons;
      if (newSettings.globalDrinks !== undefined) updateData.global_drinks = newSettings.globalDrinks;
      if (newSettings.globalMilkshakes !== undefined) updateData.global_milkshakes = newSettings.globalMilkshakes;

      const { error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', 1);

      if (error) throw error;
      
      set((state) => ({ ...state, ...newSettings, isLoading: false }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
