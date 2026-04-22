import { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, CartItemOption } from '../types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addItem, setCartOpen } = useCartStore();
  const { globalAddons } = useSettingsStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});
  const [itemObservation, setItemObservation] = useState('');

  // Combine product options with global addons and dynamic removal
  const allOptions = useMemo(() => {
    if (!product) return [];
    
    const options = [...(product.options || [])];
    
    // 1. DYNAMIC REMOVAL: Ensure "Retirar Ingredientes" has all items from description
    if (product.description) {
      const descriptionIngredients = product.description
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0 && !i.toLowerCase().includes('grátis') && !i.toLowerCase().includes('promoção'));
      
      const removalIndex = options.findIndex(opt => opt.title.toLowerCase().includes('retirar'));
      
      if (descriptionIngredients.length > 0) {
        const dynamicChoices = descriptionIngredients.map((ing, index) => ({
          id: `remove-auto-${index}`,
          label: `Sem ${ing}`,
          price: 0
        }));

        if (removalIndex > -1) {
          // Merge: Keep existing choices but add missing ones from description
          const existingChoices = options[removalIndex].choices;
          const mergedChoices = [...existingChoices];
          
          dynamicChoices.forEach(dc => {
            const alreadyExists = mergedChoices.some(ec => 
              ec.label.toLowerCase().trim() === dc.label.toLowerCase().trim()
            );
            if (!alreadyExists) {
              mergedChoices.push(dc);
            }
          });
          
          options[removalIndex] = {
            ...options[removalIndex],
            choices: mergedChoices
          };
        } else {
          // Create new option at the top
          options.unshift({
            id: 'dynamic-removal-opt',
            title: 'Retirar Ingredientes',
            type: 'checkbox',
            required: false,
            choices: dynamicChoices
          });
        }
      }
    }

    // 2. GLOBAL ADDONS: Check if product already has an "Acréscimos" group
    const hasAddons = options.some(opt => opt.title.toLowerCase().includes('acréscimo'));
    
    if (!hasAddons && globalAddons && globalAddons.length > 0) {
      options.push({
        id: 'global-addons-opt',
        title: 'Acréscimos',
        type: 'checkbox',
        required: false,
        choices: globalAddons.map((addon, index) => ({
          id: `global-addon-${index}`,
          label: addon.label,
          price: addon.price
        }))
      });
    }
    
    return options;
  }, [product, globalAddons]);

  // Reset state when product changes
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setItemObservation('');
      const initialOptions: Record<string, string | string[]> = {};
      
      // Select first radio option by default for required fields
      allOptions.forEach(opt => {
        if (opt.type === 'radio' && opt.required && opt.choices.length > 0) {
          initialOptions[opt.id] = opt.choices[0].id;
        } else if (opt.type === 'checkbox') {
          initialOptions[opt.id] = [];
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product, isOpen, allOptions]);

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
    allOptions.forEach(opt => {
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
    const missingRequired = allOptions.filter(opt => {
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
    allOptions.forEach(opt => {
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
      <DialogContent className="max-w-[95vw] md:max-w-4xl bg-[#1A1A1A] border border-[#7C3AED]/30 text-white p-0 overflow-hidden flex flex-col md:flex-row max-h-[95vh] md:h-auto md:max-h-[85vh]">
        {/* Lado Esquerdo: Imagem e Descrição Básica */}
        <div className="w-full md:w-[45%] flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-[#2A2A2A]">
          <div className="w-full h-40 md:h-[300px] relative">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent"></div>
          </div>
        
          <div className="p-4 md:p-6">
            <DialogTitle className="text-xl md:text-2xl font-bold mb-2 uppercase tracking-tight">{product.name}</DialogTitle>
            <DialogDescription className="text-[#A1A1AA] text-xs md:text-sm leading-relaxed">
              {product.description}
            </DialogDescription>
            <div className="mt-4 text-[#7C3AED] font-heading text-xl md:text-2xl">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
        
        {/* Lado Direito: Opções e Botão Final */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0D0D0D]">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-[#7C3AED]/20">

            <div className="space-y-4 md:space-y-6">
              {allOptions.map((option) => (
                <div key={option.id} className="bg-[#111111] p-3 md:p-4 rounded-xl border border-[#2A2A2A]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white text-[11px] md:text-xs uppercase tracking-widest">{option.title}</h4>
                    {option.required && <span className="text-[10px] bg-[#7C3AED]/20 text-[#A78BFA] px-2 py-0.5 rounded-md font-bold uppercase">Obrigatório</span>}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {option.choices.map((choice) => (
                      <label 
                        key={choice.id} 
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                          (option.type === 'radio' && selectedOptions[option.id] === choice.id) || 
                          (option.type === 'checkbox' && Array.isArray(selectedOptions[option.id]) && selectedOptions[option.id].includes(choice.id))
                            ? 'border-[#7C3AED] bg-[#7C3AED]/10 ring-1 ring-[#7C3AED]'
                            : 'border-[#2A2A2A] hover:border-[#7C3AED]/50 bg-[#0A0A0A]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input 
                            type={option.type}
                            name={option.id}
                            checked={
                              option.type === 'radio' 
                                ? selectedOptions[option.id] === choice.id
                                : Array.isArray(selectedOptions[option.id]) && selectedOptions[option.id].includes(choice.id)
                            }
                            onChange={() => handleOptionChange(option.id, choice.id, option.type as any)}
                            className={`w-3.5 h-3.5 bg-[#0A0A0A] border-[#2A2A2A] ${option.type === 'radio' ? 'rounded-full' : 'rounded-sm'} text-[#7C3AED] focus:ring-[#7C3AED]`}
                          />
                          <span className="text-xs font-medium text-white">{choice.label}</span>
                        </div>
                        {choice.price && (
                          <span className="text-[10px] font-bold text-[#7C3AED]">{getOptionsPriceText(choice.price)}</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-[#111111] p-3 md:p-4 rounded-xl border border-[#2A2A2A]">
                <label className="block text-[11px] md:text-xs font-bold text-white uppercase tracking-widest mb-2">
                  Observações (Opcional)
                </label>
                <textarea
                  value={itemObservation}
                  onChange={(e) => setItemObservation(e.target.value)}
                  placeholder="Ex: Sem cebola, carne ao ponto..."
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] text-white placeholder:text-[#555] text-xs resize-none h-16 md:h-20"
                />
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-[#0A0A0A] border-t border-[#2A2A2A] shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3 bg-[#111111] p-1.5 md:p-2 rounded-xl border border-[#2A2A2A]">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-[#2A2A2A] text-white hover:bg-[#7C3AED] transition-colors disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="w-4 text-center font-bold text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-[#2A2A2A] text-white hover:bg-[#7C3AED] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-between bg-[#7C3AED] text-white font-bold py-2.5 md:py-3.5 px-4 rounded-xl hover:bg-[#6D28D9] transition-all transform active:scale-95 shadow-lg shadow-[#7C3AED]/20"
              >
                <span className="flex items-center gap-2 text-sm uppercase tracking-wider"><ShoppingBag size={18} /> Adicionar</span>
                <span className="text-sm">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
