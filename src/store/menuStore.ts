import { create } from 'zustand';
import { Product, MenuCategory } from '../types';
import { supabase } from '../lib/supabase';

interface MenuState {
  items: Product[];
  categories: MenuCategory[];
  isLoading: boolean;
  error: string | null;
  fetchMenu: () => Promise<void>;
  addItem: (product: Omit<Product, 'id' | 'imageUrl'>, imageFile?: File) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, product: Partial<Product>, imageFile?: File) => Promise<void>;
  duplicateItem: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchMenu: async () => {
    set({ isLoading: true });
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('index', { ascending: true })
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      // Transform snake_case from DB to camelCase for the app
      const transformedProducts = (productsRes.data || []).map(p => ({
        id: p.id,
        categoryId: p.category_id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        imageUrl: p.image_url,
        options: p.options || []
      }));

      set({ 
        items: transformedProducts, 
        categories: categoriesRes.data || [],
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addItem: async (product, imageFile) => {
    set({ isLoading: true });
    try {
      let imageUrl = '';
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          category_id: product.categoryId,
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: imageUrl,
          options: product.options
        }])
        .select()
        .single();

      if (error) throw error;
      
      await get().fetchMenu();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateItem: async (id, updatedProduct, imageFile) => {
    set({ isLoading: true });
    try {
      let imageUrl = updatedProduct.imageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('products')
        .update({
          category_id: updatedProduct.categoryId,
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          image_url: imageUrl,
          options: updatedProduct.options
        })
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchMenu();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  duplicateItem: async (id) => {
    const itemToClone = get().items.find(i => i.id === id);
    if (!itemToClone) return;

    await get().addItem({
      categoryId: itemToClone.categoryId,
      name: `${itemToClone.name} (Cópia)`,
      description: itemToClone.description,
      price: itemToClone.price,
      options: itemToClone.options
    });
  },
}));
