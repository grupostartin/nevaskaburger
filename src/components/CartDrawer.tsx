import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ShoppingBag, Trash2, MapPin, Truck, Banknote, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddressAutocomplete } from './AddressAutocomplete';

const WHATSAPP_NUMBER = "5531982388036";
const RESTAURANT_NAME = "NEVASKA HAMBURGUER";

type PaymentMethod = 'dinheiro' | 'debito' | 'credito' | 'pix' | '';

const paymentOptions: { id: PaymentMethod; label: string; icon: any; color: string }[] = [
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: '#25D366' },
  { id: 'debito', label: 'Débito', icon: CreditCard, color: '#3B82F6' },
  { id: 'credito', label: 'Crédito', icon: Wallet, color: '#A78BFA' },
  { id: 'pix', label: 'PIX', icon: Smartphone, color: '#00BFFF' },
];

export function CartDrawer() {
  const { items, isCartOpen, setCartOpen, removeItem, getCartTotal, clearCart } = useCartStore();
  const { baseDeliveryFee, deliveryFeePerKm, minOrderValue, freeDeliveryRadius } = useSettingsStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  const [observations, setObservations] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('');
  const [changeFor, setChangeFor] = useState('');

  const deliveryFee = deliveryDistance !== null
    ? (deliveryDistance <= freeDeliveryRadius ? 0 : baseDeliveryFee + (deliveryDistance * deliveryFeePerKm))
    : 0;

  const totalWithDelivery = getCartTotal() + deliveryFee;

  const handleCheckout = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim() || !paymentMethod) return;

    // Estrutura da mensagem limpa e sem emojis
    const message = `*NOVO PEDIDO - ${RESTAURANT_NAME}*
-----------------------------

*CLIENTE*
Nome: ${customerName.trim()}
WhatsApp: ${customerPhone.trim()}

*ENTREGA*
${customerAddress.trim()}
${deliveryDistance !== null ? `Distancia: ${deliveryDistance.toFixed(1)} km` : ''}

*ITENS DO PEDIDO*
-----------------------------
${items.map((item, idx) => `*${idx + 1}. ${item.quantity}x ${item.name}*
Valor: R$ ${item.totalPrice.toFixed(2).replace('.', ',')}
${item.options.length > 0 ? item.options.map(opt => `- ${opt.label}`).join('\n') : ''}
${item.observation ? `Obs: ${item.observation}` : ''}`).join('\n\n')}

-----------------------------
Subtotal: R$ ${getCartTotal().toFixed(2).replace('.', ',')}
Frete: ${deliveryFee === 0 ? 'GRATIS' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}

*TOTAL: R$ ${totalWithDelivery.toFixed(2).replace('.', ',')}*

*PAGAMENTO*
Metodo: ${paymentMethod === 'dinheiro'
        ? `Dinheiro ${changeFor ? `(Troco para R$ ${changeFor})` : '(Sem troco)'}`
        : paymentMethod === 'pix' ? 'PIX' : `Cartao de ${paymentMethod === 'debito' ? 'Debito' : 'Credito'}`}

${observations.trim() ? `\n*OBSERVACOES GERAIS*\n${observations.trim()}` : ''}

-----------------------------
Pedido enviado pelo site Nevaska Hamburguer`;

    // O SEGREDO: EncodeURIComponent para blindar os emojis
    const mensagemFormatada = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensagemFormatada}`;

    // Limpar e fechar
    clearCart();
    setCartOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setObservations('');
    setPaymentMethod('');
    setChangeFor('');

    window.open(url, '_blank');
  };

  const isCheckoutDisabled =
    !customerName.trim() ||
    !customerPhone.trim() ||
    !customerAddress.trim() ||
    !paymentMethod ||
    getCartTotal() < minOrderValue;

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
              {/* Cart items */}
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
                          ✅ {item.options.map(o => o.label).join(' · ')}
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

              {/* Customer info */}
              <div className="space-y-[8px] pt-[8px]">
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome (obrigatório)"
                  className="w-full bg-[#1A1A1A] border-[#2A2A2A] focus-visible:ring-[#7C3AED] text-white placeholder:text-[#A1A1AA]/50 h-11 text-[13px] rounded-lg"
                />
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="WhatsApp (obrigatório)"
                  type="tel"
                  className="w-full bg-[#1A1A1A] border-[#2A2A2A] focus-visible:ring-[#7C3AED] text-white placeholder:text-[#A1A1AA]/50 h-11 text-[13px] rounded-lg"
                />
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

                {/* Payment method */}
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] text-[#A1A1AA] uppercase tracking-wider font-bold ml-1 flex items-center gap-1">
                    💳 Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentOptions.map(opt => {
                      const Icon = opt.icon;
                      const isSelected = paymentMethod === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => { setPaymentMethod(opt.id); setChangeFor(''); }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[12px] font-bold transition-all ${isSelected
                              ? 'border-[#7C3AED] bg-[#7C3AED]/20 text-white'
                              : 'border-[#2A2A2A] bg-[#1A1A1A] text-[#A1A1AA] hover:border-[#7C3AED]/50 hover:text-white'
                            }`}
                        >
                          <Icon size={14} style={{ color: isSelected ? opt.color : undefined }} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {paymentMethod === 'dinheiro' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <Input
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        placeholder="Troco para quanto? (deixe em branco se não precisar)"
                        type="number"
                        className="w-full bg-[#1A1A1A] border-[#2A2A2A] focus-visible:ring-[#25D366] text-white placeholder:text-[#A1A1AA]/50 h-10 text-[12px] rounded-lg mt-1"
                      />
                    </div>
                  )}
                </div>

                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observações gerais (ex: sem cebola, campainha...)"
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-[10px] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] text-white placeholder:text-[#A1A1AA]/50 text-[13px] resize-none h-16"
                />
              </div>
            </div>

            <div className="p-[24px] bg-[#111111] border-t border-[#2A2A2A] space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#A1A1AA]">Subtotal</span>
                <span className="text-white">R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#A1A1AA] flex items-center gap-2 italic">
                  <Truck size={14} /> Frete {deliveryDistance !== null ? `(${deliveryDistance.toFixed(1)} km)` : ''}
                </span>
                <span className="text-white">
                  {deliveryDistance !== null
                    ? (deliveryFee === 0 ? <span className="text-[#25D366] font-bold">GRÁTIS</span> : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`)
                    : <span className="text-[10px] uppercase text-[#555]">Calculado no endereço</span>}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#2A2A2A]">
                <span className="text-white font-bold">Total</span>
                <span className="text-[20px] font-bold text-[#A78BFA]">
                  R$ {totalWithDelivery.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {!paymentMethod && (
                <p className="text-[10px] text-[#EF4444] text-center animate-in fade-in">
                  Selecione uma forma de pagamento para continuar
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckoutDisabled}
                className="w-full bg-[#25D366] text-white font-bold py-[14px] rounded-[10px] hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-[14px] mt-2"
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
