import { useState, useEffect } from 'react';
import { useMenuStore } from '../store/menuStore';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

interface ProductGridProps {
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ onProductClick }: ProductGridProps) {
  const items = useMenuStore(state => state.items);
  const categories = useMenuStore(state => state.categories);
  const isLoading = useMenuStore(state => state.isLoading);

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {categories.map(category => {
        const categoryItems = items
          .filter(item => item.categoryId === category.id)
          .sort((a, b) => Number(a.price) - Number(b.price));
        
        if (categoryItems.length === 0) return null;

        return (
          <section 
            key={category.id} 
            id={`category-${category.id}`} 
            className="mb-12 scroll-mt-36"
          >
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-heading text-3xl text-white tracking-wider uppercase">
                {category.title}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#7C3AED]/50 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[24px]">
              {isLoading 
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] flex p-3 gap-4 items-center h-[126px]">
                      <div className="w-[100px] h-[100px] shrink-0 relative bg-[#222] rounded-xl overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent"></div>
                      </div>
                      <div className="flex-1 py-1 h-full flex flex-col justify-center">
                        <div className="h-[16px] bg-[#2A2A2A] rounded-md w-3/4 overflow-hidden relative mb-2"><div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent"></div></div>
                        <div className="h-[12px] bg-[#2A2A2A] rounded-md w-full overflow-hidden relative mb-1"><div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent"></div></div>
                        <div className="h-[12px] bg-[#2A2A2A] rounded-md w-4/5 overflow-hidden relative mb-3"><div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent"></div></div>
                        <div className="h-[16px] bg-[#2A2A2A] rounded-md w-16 overflow-hidden relative"><div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent"></div></div>
                      </div>
                    </div>
                  ))
                : categoryItems.map((product, index) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      index={index}
                      onClick={onProductClick} 
                    />
                  ))
              }
            </div>
          </section>
        );
      })}
    </div>
  );
}
