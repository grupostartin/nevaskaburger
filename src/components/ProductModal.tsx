import { useState, useEffect } from 'react';
import { Product, CartItem, CartItemOption } from '../types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addItem, setCartOpen } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});
  const [itemObservation, setItemObservation] = useState('');

  // Reset state when product changes
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setItemObservation('');
      const initialOptions: Record<string, string | string[]> = {};
      
      // Select first radio option by default for required fields
      product.options.forEach(opt => {
        if (opt.type === 'radio' && opt.required && opt.choices.length > 0) {
          initialOptions[opt.id] = opt.choices[0].id;
        } else if (opt.type === 'checkbox') {
          initialOptions[opt.id] = [];
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product, isOpen]);

  if (!product) return null;

  const handleOptionChange = (optionId: string, choiceId: string, type: 'radio' | 'checkbox') => {
    if (type === 'radio') {
      setSelectedOptions(prev => ({ ...prev, [optionId]: choiceId }));
    } else {
      setSelectedOptions(prev => {
        const current = (prev[optionId] as string[]) || [];
        if (current.includes(choiceId)) {
          return { ...prev, [optionId]: current.filter(id => id !== choiceId) };
        } else {
          return { ...prev, [optionId]: [...current, choiceId] };
        }
      });
    }
  };

  const calculateTotal = () => {
    let total = product.price;
    product.options.forEach(opt => {
      const selected = selectedOptions[opt.id];
      if (!selected) return;
      
      if (opt.type === 'radio' && typeof selected === 'string') {
        const choice = opt.choices.find(c => c.id === selected);
        if (choice?.price) total += choice.price;
      } else if (opt.type === 'checkbox' && Array.isArray(selected)) {
        selected.forEach(choiceId => {
          const choice = opt.choices.find(c => c.id === choiceId);
          if (choice?.price) total += choice.price;
        });
      }
    });
    return total * quantity;
  };

  const getOptionsPriceText = (price?: number) => {
    if (!price) return '';
    return `+ R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const handleAddToCart = () => {
    // Check required options
    const missingRequired = product.options.filter(opt => {
      if (opt.required && opt.type === 'radio') {
        return !selectedOptions[opt.id];
      }
      return false;
    });

    if (missingRequired.length > 0) {
      toast.error(`Por favor, selecione: ${missingRequired.map(o => o.title).join(', ')}`);
      return;
    }

    const cartOptions: CartItemOption[] = [];
    product.options.forEach(opt => {
      const selected = selectedOptions[opt.id];
      if (!selected) return;

      if (opt.type === 'radio' && typeof selected === 'string') {
        const choice = opt.choices.find(c => c.id === selected);
        if (choice) {
          cartOptions.push({ optionId: opt.id, choiceId: choice.id, label: choice.label, price: choice.price });
        }
      } else if (opt.type === 'checkbox' && Array.isArray(selected)) {
        selected.forEach(choiceId => {
          const choice = opt.choices.find(c => c.id === choiceId);
          if (choice) {
            cartOptions.push({ optionId: opt.id, choiceId: choice.id, label: choice.label, price: choice.price });
          }
        });
      }
    });

    const itemTotal = calculateTotal() / quantity; // total per item
    
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      basePrice: product.price,
      quantity,
      options: cartOptions,
      observation: itemObservation.trim(),
      totalPrice: calculateTotal()
    });

    // Só exibe o popup no desktop (acima de 768px)
    if (window.innerWidth >= 768) {
      toast.success('Item adicionado!', {
        description: `${quantity}x ${product.name} - R$ ${calculateTotal().toFixed(2).replace('.', ',')}`,
        style: {
          background: '#7C3AED',
          color: '#FFFFFF',
          border: 'none',
        },
        icon: '🍔',
        action: {
          label: 'Ver Carrinho',
          onClick: () => setCartOpen(true)
        }
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[#1A1A1A] border border-[#7C3AED]/30 text-white p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="w-full h-48 md:h-64 relative shrink-0">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <DialogTitle className="text-2xl font-bold mb-2">{product.name}</DialogTitle>
          <DialogDescription className="text-[#A1A1AA] text-sm mb-6">
            {product.description}
          </DialogDescription>

          <div className="space-y-6">
            {product.options.map((option) => (
              <div key={option.id} className="bg-[#111111] p-4 rounded-xl border border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider">{option.title}</h4>
                  {option.required && <span className="text-xs bg-[#2A2A2A] text-[#A78BFA] px-2 py-1 rounded-md font-medium">Obrigatório</span>}
                </div>
                
                <div className="space-y-2">
                  {option.choices.map((choice) => (
                    <label 
                      key={choice.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        (option.type === 'radio' && selectedOptions[option.id] === choice.id) || 
                        (option.type === 'checkbox' && Array.isArray(selectedOptions[option.id]) && selectedOptions[option.id].includes(choice.id))
                          ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                          : 'border-[#2A2A2A] hover:border-[#7C3AED]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type={option.type}
                          name={option.id}
                          checked={
                            option.type === 'radio' 
                              ? selectedOptions[option.id] === choice.id
                              : Array.isArray(selectedOptions[option.id]) && selectedOptions[option.id].includes(choice.id)
                          }
                          onChange={() => handleOptionChange(option.id, choice.id, option.type as any)}
                          className={`w-4 h-4 bg-[#0A0A0A] border-[#2A2A2A] ${option.type === 'radio' ? 'rounded-full' : 'rounded-sm'} text-[#7C3AED] focus:ring-[#7C3AED]`}
                        />
                        <span className="text-sm font-medium text-white">{choice.label}</span>
                      </div>
                      {choice.price && (
                        <span className="text-xs text-[#A78BFA]">{getOptionsPriceText(choice.price)}</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-[#111111] p-4 rounded-xl border border-[#2A2A2A]">
            <label className="block text-sm font-bold text-white uppercase tracking-wider mb-2">
              Observações (Opcional)
            </label>
            <textarea
              value={itemObservation}
              onChange={(e) => setItemObservation(e.target.value)}
              placeholder="Ex: Tirar a maionese, carne bem passada, etc."
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] text-white placeholder:text-[#A1A1AA]/50 text-[13px] resize-none h-20"
            />
          </div>
        </div>

        <div className="p-4 bg-[#0A0A0A] border-t border-[#2A2A2A] shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#111111] p-2 rounded-xl border border-[#2A2A2A]">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2A2A2A] text-white hover:bg-[#7C3AED] transition-colors disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="w-4 text-center font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2A2A2A] text-white hover:bg-[#7C3AED] transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-between bg-[#7C3AED] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#6D28D9] transition-colors"
            >
              <span className="flex items-center gap-2"><ShoppingBag size={18} /> Adicionar</span>
              <span>R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
