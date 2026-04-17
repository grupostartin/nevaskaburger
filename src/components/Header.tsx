import { ShoppingBag, Settings } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';

export function Header() {
  const { getCartItemsCount, setCartOpen } = useCartStore();
  const count = getCartItemsCount();

  return (
    <header className="sticky top-0 z-40 w-full h-[100px] bg-[#0A0A0A] border-b border-[#2A2A2A] flex items-center justify-center shrink-0">
      <div className="text-center flex flex-col items-center">
        <h1 className="font-heading text-[42px] tracking-[2px] uppercase text-white" style={{ textShadow: '0 0 20px rgba(124, 58, 237, 0.8)' }}>
          NEVASKA
        </h1>
        <p className="text-[#A1A1AA] text-[11px] uppercase tracking-[3px] -mt-[5px]">Feito com carinho, feito pra você.</p>
      </div>

      <button
        onClick={() => setCartOpen(true)}
        className="absolute right-4 md:right-[30px] top-1/2 -translate-y-1/2 bg-[#1A1A1A] p-[12px] rounded-xl border border-[#2A2A2A] text-white hover:text-[#A78BFA] transition-colors"
      >
        <ShoppingBag size={24} />
        {count > 0 && (
          <span className="absolute -top-[5px] -right-[5px] inline-flex items-center justify-center w-[22px] h-[22px] text-[12px] font-bold text-white bg-[#7C3AED] rounded-full border-2 border-[#0A0A0A] animate-in zoom-in">
            {count}
          </span>
        )}
      </button>
    </header>
  );
}
