import { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export function MobileCartButton() {
  const { getCartItemsCount, getCartTotal, setCartOpen } = useCartStore();
  const count = getCartItemsCount();
  const total = getCartTotal();
  const controls = useAnimation();
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (count > prevCountRef.current) {
      // Animação de "bump" quando item é adicionado
      controls.start({
        scale: [1, 1.08, 0.96, 1],
        transition: { duration: 0.4, ease: 'easeInOut' }
      });
    }
    prevCountRef.current = count;
  }, [count, controls]);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden z-30 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent pt-12 pointer-events-none">
      <motion.button
        animate={controls}
        onClick={() => setCartOpen(true)}
        className="w-full bg-[#7C3AED] text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center justify-between pointer-events-auto"
      >
        <div className="flex items-center gap-3">
          <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">
            {count}
          </span>
          <span className="flex items-center gap-2">
            <ShoppingCart size={18} />
            Ver Carrinho
          </span>
        </div>
        <span className="text-[#E9D5FF] font-black">
          R$ {total.toFixed(2).replace('.', ',')}
        </span>
      </motion.button>
    </div>
  );
}
