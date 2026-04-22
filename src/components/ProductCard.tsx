import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index: number;
  onClick?: (product: Product) => void;
  key?: string | number;
}

export function ProductCard({ product, index, onClick }: ProductCardProps) {
  const handleClick = () => {
    if (onClick) onClick(product);
  };

  const hasPriceVariation = product.options?.some(opt => 
    opt.choices.some(choice => choice.price && Number(choice.price) > 0)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] flex p-3 gap-4 items-center cursor-pointer hover:border-[#7C3AED] transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)] relative"
      onClick={handleClick}
    >
      <div className="w-[100px] h-[100px] shrink-0 rounded-xl bg-[#222] overflow-hidden relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="flex-1 min-w-0 pr-12 sm:pr-16 pt-1">
        <h4 className="text-white font-bold text-[14px] sm:text-[16px] mb-1 truncate">{product.name}</h4>
        <p className="text-[#A1A1AA] text-[11px] sm:text-[12px] leading-[1.4] mb-2 line-clamp-2">{product.description}</p>
        <p className="text-[#A78BFA] font-bold text-[14px] sm:text-[16px] flex items-baseline">
          {hasPriceVariation && <span className="text-[10px] sm:text-[11px] opacity-70 mr-1 uppercase font-normal">A partir de</span>}
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
      </div>
      
      <button className="absolute bottom-3 right-3 bg-[#7C3AED] text-white text-[10px] sm:text-[12px] font-semibold px-2 sm:px-[14px] py-1 sm:py-[6px] rounded-lg border-none hover:bg-[#6D28D9] transition-colors">
        + Detalhes
      </button>
    </motion.div>
  );
}
