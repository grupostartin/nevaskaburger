import { useState } from 'react';
import { Header } from '../components/Header';

import { CategoryTabs } from '../components/CategoryTabs';
import { ProductGrid } from '../components/ProductGrid';
import { ProductModal } from '../components/ProductModal';
import { MobileCartButton } from '../components/MobileCartButton';
import { Product } from '../types';
import { Toaster } from 'sonner';

export const RESTAURANT_OPEN = true;

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      {!RESTAURANT_OPEN && (
        <div className="bg-[#EF4444] text-white text-center py-2 text-sm font-bold tracking-wide">
          ⚠️ Estamos fechados no momento. Você pode ver o cardápio, mas não entregaremos agora.
        </div>
      )}
      
      <Header />
      
      <main>
        <CategoryTabs />
        <ProductGrid onProductClick={setSelectedProduct} />
      </main>

      <MobileCartButton />

      <ProductModal 
        product={selectedProduct} 
        isOpen={selectedProduct !== null} 
        onClose={() => setSelectedProduct(null)} 
      />
      
      <Toaster position="top-left" expand={false} richColors />
    </>
  );
}
