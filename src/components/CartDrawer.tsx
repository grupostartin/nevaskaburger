import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ShoppingBag, Trash2, MapPin, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddressAutocomplete } from './AddressAutocomplete';

const WHATSAPP_NUMBER = "5531999999999";
const RESTAURANT_NAME = "NEVASKA";

export function CartDrawer() {
  const { items, isCartOpen, setCartOpen, removeItem, getCartTotal, clearCart } = useCartStore();
  const { baseDeliveryFee, deliveryFeePerKm, minOrderValue } = useSettingsStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  const [observations, setObservations] = useState('');

  const deliveryFee = deliveryDistance !== null 
    ? baseDeliveryFee + (deliveryDistance * deliveryFeePerKm)
    : 0;

  const totalWithDelivery = getCartTotal() + deliveryFee;

  const handleCheckout = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      return;
    }

    let message = `🍔 *NOVO PEDIDO - ${RESTAURANT_NAME}*\n\n`;
    message += `👤 *Cliente:* ${customerName.trim()}\n`;
    message += `📱 *WhatsApp:* ${customerPhone.trim()}\n`;
    message += `📍 *Endereço:* ${customerAddress.trim()}\n\n`;
    message += `📋 *Itens:*\n`;

    items.forEach(item => {
      message += `- ${item.quantity}x ${item.name} - R$ ${item.totalPrice.toFixed(2).replace('.', ',')}\n`;
      if (item.options.length > 0) {
        const optionsText = item.options.map(opt => opt.label).join(', ');
        message += `  ↳ ${optionsText}\n`;
      }
      if (item.observation) {
        message += `  📝 Obs do item: ${item.observation}\n`;
      }
    });

    const subtotal = getCartTotal();
    message += `\n💰 *Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}*\n`;
    message += `🚚 *Frete: R$ ${deliveryFee.toFixed(2).replace('.', ',')}*\n`;
    message += `⭐ *Total: R$ ${totalWithDelivery.toFixed(2).replace('.', ',')}*\n`;

    if (observations.trim()) {
      message += `\n📝 *Obs:* ${observations.trim()}\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Clear cart and close
    clearCart();
    setCartOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setObservations('');
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md bg-[#111111] border-l border-[#2A2A2A] p-0 flex flex-col pt-0">
        <SheetHeader className="bg-[#7C3AED] p-[24px] !text-left shrink-0">
          <SheetTitle className="text-white flex items-center gap-3 text-[20px] font-heading tracking-[1px] font-normal">
            <ShoppingBag size={24} /> SEU PEDIDO
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 text-[#2A2A2A]">
              <ShoppingBag size={48} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Carrinho vazio</h3>
            <p className="text-[#A1A1AA] text-sm">Adicione alguns burgers deliciosos para continuar.</p>
            <button 
              onClick={() => setCartOpen(false)}
              className="mt-8 bg-[#2A2A2A] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#7C3AED] transition-colors"
            >
              Ver Cardápio
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-[20px] space-y-[16px] scrollbar-hide">
              <div className="space-y-[16px]">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 border-b border-[#2A2A2A] pb-[12px]">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-[2px]">
                        <h4 className="text-white text-[14px]">
                          {item.quantity}x {item.name}
                        </h4>
                        <span className="text-[#A78BFA] font-bold text-[14px] shrink-0 ml-2">
                          R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      {item.options.length > 0 && (
                        <p className="text-[#A1A1AA] text-[11px] mt-1 block">
                          ↳ {item.options.map(o => o.label).join(', ')}
                        </p>
                      )}
                      {item.observation && (
                        <p className="text-[#A1A1AA] text-[11px] mt-1 block">
                          📝 {item.observation}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-[#A78BFA] hover:text-white transition-colors h-fit p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-[8px] pt-[16px]">
                <div>
                  <Input 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome (obrigatório)"
                    className="w-full bg-[#1A1A1A] border-[#2A2A2A] focus-visible:ring-[#7C3AED] text-white placeholder:text-[#A1A1AA]/50 h-11 text-[13px] rounded-lg"
                  />
                </div>
                <div>
                  <Input 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="WhatsApp (obrigatório)"
                    type="tel"
                    className="w-full bg-[#1A1A1A] border-[#2A2A2A] focus-visible:ring-[#7C3AED] text-white placeholder:text-[#A1A1AA]/50 h-11 text-[13px] rounded-lg"
                  />
                </div>
                <div className="space-y-[8px]">
                  <label className="text-[11px] text-[#A1A1AA] uppercase tracking-wider font-bold ml-1 flex items-center gap-1">
                    <MapPin size={12} /> Endereço de entrega
                  </label>
                  <AddressAutocomplete 
                    onAddressSelect={(address, distance) => {
                      setCustomerAddress(address);
                      setDeliveryDistance(distance);
                    }} 
                  />
                  {deliveryDistance !== null && (
                    <p className="text-[10px] text-[#A78BFA] ml-1 animate-in fade-in slide-in-from-left-2">
                      Distância estimada: {deliveryDistance.toFixed(1)} km
                    </p>
                  )}
                </div>
                <div>
                  <textarea 
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observações gerais (troco, detalhes...)"
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-[10px] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] text-white placeholder:text-[#A1A1AA]/50 text-[13px] resize-none h-16"
                  />
                </div>
              </div>
            </div>

            <div className="p-[24px] bg-[#111111] border-t border-[#2A2A2A] space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#A1A1AA]">Subtotal</span>
                <span className="text-white">
                  R$ {getCartTotal().toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#A1A1AA] flex items-center gap-2 italic">
                  <Truck size={14} /> Frete {deliveryDistance !== null ? `(${deliveryDistance.toFixed(1)} km)` : ''}
                </span>
                <span className="text-white">
                  {deliveryDistance !== null 
                    ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}` 
                    : <span className="text-[10px] uppercase text-[#555]">Calculado no endereço</span>}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-[#2A2A2A]">
                <span className="text-white font-bold">Total</span>
                <span className="text-[20px] font-bold text-[#A78BFA]">
                  R$ {totalWithDelivery.toFixed(2).replace('.', ',')}
                </span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={!customerName.trim() || !customerPhone.trim() || !customerAddress.trim() || getCartTotal() < minOrderValue}
                className="w-full bg-[#25D366] text-white font-bold py-[14px] rounded-[10px] hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-[14px] mt-4"
              >
                <span>
                  {getCartTotal() < minOrderValue 
                    ? `Mínimo R$ ${minOrderValue.toFixed(2).replace('.', ',')}` 
                    : 'Fazer Pedido via WhatsApp'}
                </span> 🟢
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
