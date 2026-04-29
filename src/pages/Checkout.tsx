import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { 
  ShoppingBag, Trash2, MapPin, Truck, Banknote, CreditCard, 
  Smartphone, Wallet, ArrowLeft, ChevronRight, User, Phone,
  MessageSquare
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';

const WHATSAPP_NUMBER = "5531982388036";
const RESTAURANT_NAME = "NEVASKA HAMBURGUER";

type PaymentMethod = 'dinheiro' | 'debito' | 'credito' | 'pix' | '';

const paymentOptions: { id: PaymentMethod; label: string; icon: any; color: string }[] = [
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: '#25D366' },
  { id: 'debito', label: 'Débito', icon: CreditCard, color: '#3B82F6' },
  { id: 'credito', label: 'Crédito', icon: Wallet, color: '#A78BFA' },
  { id: 'pix', label: 'PIX', icon: Smartphone, color: '#00BFFF' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, removeItem, getCartTotal, clearCart, getCartItemsCount } = useCartStore();
  const { 
    baseDeliveryFee, 
    deliveryFeePerKm, 
    minOrderValue, 
    freeDeliveryRadius,
    fetchSettings,
    isLoading: settingsLoading 
  } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  const [observations, setObservations] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('');
  const [changeFor, setChangeFor] = useState('');
  const [step, setStep] = useState(1);

  // Garantir que os valores numéricos sejam tratados corretamente
  const safeRadius = Number(freeDeliveryRadius || 0);
  const safeBaseFee = Number(baseDeliveryFee || 0);
  const safePerKm = Number(deliveryFeePerKm || 0);

  const deliveryFee = deliveryDistance !== null
    ? (Number(deliveryDistance) <= safeRadius ? 3 : safeBaseFee + (Number(deliveryDistance) * safePerKm))
    : 0;

  const totalWithDelivery = getCartTotal() + deliveryFee;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-6 text-[#7C3AED]"
        >
          <ShoppingBag size={48} />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-3">Seu carrinho está vazio</h3>
        <p className="text-[#A1A1AA] mb-8 max-w-xs">Adicione alguns burgers deliciosos antes de finalizar seu pedido.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#7C3AED] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6D28D9] transition-all transform active:scale-95 shadow-lg shadow-[#7C3AED]/20"
        >
          Voltar ao Cardápio
        </button>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim() || !paymentMethod) return;

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
Frete: R$ ${deliveryFee.toFixed(2).replace('.', ',')}

*TOTAL: R$ ${totalWithDelivery.toFixed(2).replace('.', ',')}*

*PAGAMENTO*
Metodo: ${paymentMethod === 'dinheiro'
        ? `Dinheiro ${changeFor ? `(Troco para R$ ${changeFor})` : '(Sem troco)'}`
        : paymentMethod === 'pix' ? 'PIX' : `Cartao de ${paymentMethod === 'debito' ? 'Debito' : 'Credito'}`}

${observations.trim() ? `\n*OBSERVACOES GERAIS*\n${observations.trim()}` : ''}

-----------------------------
Pedido enviado pelo site Nevaska Hamburguer`;

    const mensagemFormatada = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensagemFormatada}`;

    clearCart();
    window.open(url, '_blank');
    navigate('/');
  };

  const isNextDisabled = () => {
    if (step === 1) return false; // Review step
    if (step === 2) return !customerName.trim() || !customerPhone.trim() || !customerAddress.trim();
    if (step === 3) return !paymentMethod || getCartTotal() < minOrderValue;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-[#2A2A2A] px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
          className="p-2 hover:bg-[#1A1A1A] rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-heading tracking-wider uppercase">Finalizar Pedido</h1>
        <div className="ml-auto text-xs font-bold text-[#A1A1AA] bg-[#1A1A1A] px-3 py-1 rounded-full border border-[#2A2A2A]">
          PASSO {step} DE 3
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pt-6">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#7C3AED]' : 'bg-[#1A1A1A]'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="text-[#7C3AED]" size={20} /> Revisão do Pedido
                </h2>
                <span className="text-sm text-[#A1A1AA]">{getCartItemsCount()} itens</span>
              </div>

              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="bg-[#111111] border border-[#2A2A2A] p-4 rounded-2xl flex gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-sm">{item.quantity}x {item.name}</h4>
                        <span className="text-[#A78BFA] font-bold text-sm">R$ {item.totalPrice.toFixed(2).replace('.', ',')}</span>
                      </div>
                      {item.options.length > 0 && (
                        <p className="text-[#A1A1AA] text-[11px] mt-1 italic">
                          {item.options.map(o => o.label).join(' · ')}
                        </p>
                      )}
                      {item.observation && (
                        <p className="text-[#7C3AED] text-[11px] mt-1 bg-[#7C3AED]/10 px-2 py-0.5 rounded-md inline-block">
                          Obs: {item.observation}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-[#EF4444] p-2 hover:bg-[#EF4444]/10 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] p-4 rounded-2xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A1A1AA]">Subtotal</span>
                  <span className="text-white font-bold">R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A1A1AA]">Frete</span>
                  <span className="text-[#25D366] font-bold">Calculado no próximo passo</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="text-[#7C3AED]" size={20} /> Onde Entregamos?
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Seu Nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Como quer ser chamado?"
                      className="w-full bg-[#111111] border-[#2A2A2A] pl-12 h-14 rounded-2xl text-white focus:ring-[#7C3AED] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Seu WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      type="tel"
                      className="w-full bg-[#111111] border-[#2A2A2A] pl-12 h-14 rounded-2xl text-white focus:ring-[#7C3AED] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Endereço Completo</label>
                  <AddressAutocomplete
                    onAddressSelect={(address, distance) => {
                      setCustomerAddress(address);
                      setDeliveryDistance(distance);
                    }}
                  />
                  {deliveryDistance !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 p-3 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-xs text-[#A78BFA] flex items-center gap-2">
                        <Truck size={14} /> Taxa de entrega calculada
                      </span>
                      <span className="text-sm font-bold text-white">
                        R$ {deliveryFee.toFixed(2).replace('.', ',')}
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Observações (Opcional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-[#555]" size={18} />
                    <textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Ex: Apartamento, Bloco, Referência..."
                      className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4 pl-12 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] text-white placeholder:text-[#555] text-sm resize-none h-24 transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="text-[#7C3AED]" size={20} /> Como vai Pagar?
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {paymentOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => { setPaymentMethod(opt.id); setChangeFor(''); }}
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                        isSelected 
                        ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-white shadow-[0_0_20px_rgba(124,58,237,0.1)]' 
                        : 'border-[#2A2A2A] bg-[#111111] text-[#A1A1AA] hover:border-[#7C3AED]/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isSelected ? 'bg-[#7C3AED] text-white' : 'bg-[#1A1A1A] text-[#555]'}`}>
                          <Icon size={24} />
                        </div>
                        <span className="font-bold">{opt.label}</span>
                      </div>
                      {isSelected && <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {paymentMethod === 'dinheiro' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#111111] border border-[#2A2A2A] p-5 rounded-2xl space-y-3">
                      <label className="text-xs font-bold text-[#A1A1AA] uppercase">Precisa de troco para quanto?</label>
                      <Input
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        placeholder="Ex: 50,00"
                        type="number"
                        className="bg-[#0A0A0A] border-[#2A2A2A] h-12 rounded-xl text-white"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-[#111111] border border-[#2A2A2A] p-6 rounded-2xl space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A1A1AA]">Produtos</span>
                  <span className="text-white font-bold">R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A1A1AA]">Entrega</span>
                  <span className="text-white font-bold">R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="h-px bg-[#2A2A2A]" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Final</span>
                  <span className="text-2xl font-bold text-[#A78BFA]">R$ {totalWithDelivery.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Action */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent pt-10 z-50">
        <div className="max-w-2xl mx-auto flex gap-3">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="bg-[#1A1A1A] text-white px-6 rounded-2xl font-bold border border-[#2A2A2A] hover:bg-[#2A2A2A] transition-all"
            >
              Voltar
            </button>
          )}
          <button
            onClick={() => step < 3 ? setStep(step + 1) : handleCheckout()}
            disabled={isNextDisabled()}
            className="flex-1 bg-[#7C3AED] text-white py-4 rounded-2xl font-bold hover:bg-[#6D28D9] transition-all transform active:scale-95 shadow-xl shadow-[#7C3AED]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            {step < 3 ? (
              <>Próximo Passo <ChevronRight size={20} /></>
            ) : (
              getCartTotal() < minOrderValue ? (
                `Pedido Mínimo R$ ${minOrderValue.toFixed(2)}`
              ) : (
                <>Finalizar no WhatsApp 🟢</>
              )
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
