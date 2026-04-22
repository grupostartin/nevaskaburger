import React, { useState } from 'react';
import { useMenuStore } from '../store/menuStore';
import { useSettingsStore } from '../store/settingsStore';
import { Trash2, Plus, ArrowLeft, Settings as SettingsIcon, Utensils, Edit, PlusCircle, X, Copy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

export default function Admin() {
  const { items, addItem, deleteItem, updateItem, duplicateItem, categories, isLoading: menuLoading } = useMenuStore();
  const { 
    deliveryFeePerKm, 
    baseDeliveryFee, 
    minOrderValue, 
    freeDeliveryRadius,
    restaurantAddress, 
    globalIngredients,
    globalAddons,
    globalDrinks,
    globalMilkshakes,
    updateSettings, 
    isLoading: settingsLoading 
  } = useSettingsStore();

  // Local state for settings to avoid auto-saving on every keystroke
  const [localSettings, setLocalSettings] = React.useState({
    deliveryFeePerKm,
    baseDeliveryFee,
    minOrderValue,
    freeDeliveryRadius,
    restaurantAddress,
    globalIngredients,
    globalAddons,
    globalDrinks,
    globalMilkshakes
  });

  // Sync local state when store updates (initial load)
  React.useEffect(() => {
    setLocalSettings({
      deliveryFeePerKm,
      baseDeliveryFee,
      minOrderValue,
      freeDeliveryRadius,
      restaurantAddress,
      globalIngredients,
      globalAddons,
      globalDrinks,
      globalMilkshakes
    });
  }, [deliveryFeePerKm, baseDeliveryFee, minOrderValue, freeDeliveryRadius, restaurantAddress, globalIngredients, globalAddons, globalDrinks, globalMilkshakes]);

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
    alert('Configurações salvas com sucesso!');
  };

  const [newItem, setNewItem] = useState<Omit<Product, 'id' | 'imageUrl'>>({
    name: '',
    description: '',
    price: 0,
    categoryId: categories[0]?.id || '',
    options: []
  });

  const toggleIngredient = (ingredient: string, isEditing: boolean) => {
    const currentItem = isEditing ? editingItem : newItem;
    if (!currentItem) return;

    const currentIngredients = currentItem.description.split(', ').filter(i => i.length > 0);
    let newIngredients;

    if (currentIngredients.includes(ingredient)) {
      newIngredients = currentIngredients.filter(i => i !== ingredient);
    } else {
      newIngredients = [...currentIngredients, ingredient];
    }

    const newDescription = newIngredients.join(', ');

    if (isEditing && editingItem) {
      setEditingItem({ ...editingItem, description: newDescription });
    } else {
      setNewItem({ ...newItem, description: newDescription });
    }
  };

  const applyRemovePreset = (isEditing: boolean) => {
    const newOpt = { 
      id: Math.random().toString(), 
      title: 'Retirar Ingredientes', 
      type: 'checkbox' as const, 
      required: false, 
      choices: [
        { id: Math.random().toString(), label: 'Sem Alface', price: 0 },
        { id: Math.random().toString(), label: 'Sem Tomate', price: 0 },
        { id: Math.random().toString(), label: 'Sem Milho', price: 0 },
        { id: Math.random().toString(), label: 'Sem Cebola', price: 0 },
        { id: Math.random().toString(), label: 'Sem Batata Palha', price: 0 },
        { id: Math.random().toString(), label: 'Sem Maionese', price: 0 },
      ] 
    };
    if (isEditing && editingItem) {
      setEditingItem({ ...editingItem, options: [...(editingItem.options || []), newOpt] });
    } else {
      setNewItem({ ...newItem, options: [...(newItem.options || []), newOpt] });
    }
  };

  const applyAddonsPreset = (isEditing: boolean) => {
    const newOpt = { 
      id: Math.random().toString(), 
      title: 'Acréscimos', 
      type: 'checkbox' as const, 
      required: false, 
      choices: globalAddons.map(a => ({ id: Math.random().toString(), label: a.label, price: a.price }))
    };
    if (isEditing && editingItem) {
      setEditingItem({ ...editingItem, options: [...(editingItem.options || []), newOpt] });
    } else {
      setNewItem({ ...newItem, options: [...(newItem.options || []), newOpt] });
    }
  };

  const applyDrinkPreset = (isEditing: boolean) => {
    const newOpt = { 
      id: Math.random().toString(), 
      title: 'Escolha o Refrigerante', 
      type: 'radio' as const, 
      required: true, 
      choices: globalDrinks.map(d => ({ id: Math.random().toString(), label: d, price: 0 }))
    };
    if (isEditing && editingItem) {
      setEditingItem({ ...editingItem, options: [...(editingItem.options || []), newOpt] });
    } else {
      setNewItem({ ...newItem, options: [...(newItem.options || []), newOpt] });
    }
  };

  const applyMilkshakePreset = (isEditing: boolean) => {
    const newOpt = { 
      id: Math.random().toString(), 
      title: 'Sabor do Milkshake', 
      type: 'radio' as const, 
      required: true, 
      choices: globalMilkshakes.map(m => ({ id: Math.random().toString(), label: m, price: 0 }))
    };
    if (isEditing && editingItem) {
      setEditingItem({ ...editingItem, options: [...(editingItem.options || []), newOpt] });
    } else {
      setNewItem({ ...newItem, options: [...(newItem.options || []), newOpt] });
    }
  };

  const [activeTab, setActiveTab] = useState<'items' | 'settings'>('items');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const [newImage, setNewImage] = useState<File | null>(null);
  const [editingImage, setEditingImage] = useState<File | null>(null);


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await updateItem(editingItem.id, editingItem, editingImage || undefined);
      setEditingItem(null);
      setEditingImage(null);
    }
  };

  const addOption = (isEditing: boolean) => {
    const newOpt = { id: Math.random().toString(), title: 'Novo Grupo', type: 'checkbox' as const, required: false, choices: [] };
    if (isEditing && editingItem) {
      setEditingItem({ ...editingItem, options: [...(editingItem.options || []), newOpt] });
    } else {
      setNewItem({ ...newItem, options: [...(newItem.options || []), newOpt] });
    }
  };

  const removeOption = (optId: string, isEditing: boolean) => {
    if (isEditing && editingItem) {
      setEditingItem({ ...editingItem, options: editingItem.options.filter(o => o.id !== optId) });
    } else {
      setNewItem({ ...newItem, options: newItem.options.filter(o => o.id !== optId) });
    }
  };

  const addChoice = (optId: string, isEditing: boolean) => {
    const newChoice = { label: 'Nova Opção', price: 0 };
    if (isEditing && editingItem) {
      setEditingItem({
        ...editingItem,
        options: editingItem.options.map(o => o.id === optId ? { ...o, choices: [...o.choices, newChoice] } : o)
      });
    } else {
      setNewItem({
        ...newItem,
        options: newItem.options.map(o => o.id === optId ? { ...o, choices: [...o.choices, newChoice] } : o)
      });
    }
  };

  const updateChoice = (optId: string, index: number, field: 'label' | 'price', value: any, isEditing: boolean) => {
    const update = (opts: any[]) => opts.map(o => o.id === optId ? {
      ...o,
      choices: o.choices.map((c: any, i: number) => i === index ? { ...c, [field]: value } : c)
    } : o);

    if (isEditing && editingItem) {
      setEditingItem({ ...editingItem, options: update(editingItem.options) });
    } else {
      setNewItem({ ...newItem, options: update(newItem.options) });
    }
  };

  const removeChoice = (optId: string, index: number, isEditing: boolean) => {
    const update = (opts: any[]) => opts.map(o => o.id === optId ? {
      ...o,
      choices: o.choices.filter((_: any, i: number) => i !== index)
    } : o);

    if (isEditing && editingItem) {
      setEditingItem({ ...editingItem, options: update(editingItem.options) });
    } else {
      setNewItem({ ...newItem, options: update(newItem.options) });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem(newItem, newImage || undefined);
    setIsAdding(false);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id || '',
      options: []
    });
    setNewImage(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === 'Nevaska31') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta! Tente novamente.');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-2xl w-full max-w-sm flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
          <div className="text-center">
            <h1 className="text-2xl font-heading text-white uppercase tracking-widest mb-2">Painel Restrito</h1>
            <p className="text-sm text-[#A1A1AA]">Digite a senha para continuar</p>
          </div>
          <input 
            type="password" 
            placeholder="Senha de acesso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white focus:border-[#7C3AED] outline-none text-center tracking-widest"
          />
          <button type="submit" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#7C3AED]/20">
            Acessar Painel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-[#1A1A1A] rounded-full transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-heading uppercase tracking-wider">Painel Admin</h1>
          </div>
          
          <div className="flex bg-[#1A1A1A] p-1 rounded-xl border border-[#2A2A2A]">
            <button 
              onClick={() => setActiveTab('items')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold ${activeTab === 'items' ? 'bg-[#7C3AED] text-white' : 'text-[#A1A1AA] hover:text-white'}`}
            >
              <Utensils size={18} /> Cardápio
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold ${activeTab === 'settings' ? 'bg-[#7C3AED] text-white' : 'text-[#A1A1AA] hover:text-white'}`}
            >
              <SettingsIcon size={18} /> Configurações
            </button>
          </div>
        </header>

        {activeTab === 'items' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Gerenciar Itens</h2>
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold"
              >
                {isAdding ? 'Cancelar' : <><Plus size={20} /> Adicionar Item</>}
              </button>
            </div>

        {editingItem && (
          <form onSubmit={handleUpdate} className="bg-[#1A1A1A] border-2 border-[#7C3AED] p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Edit size={22} className="text-[#7C3AED]" /> Editar Item: {editingItem.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Nome</label>
                <input 
                  required
                  type="text" 
                  value={editingItem.name}
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Preço (R$)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={editingItem.price}
                  onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-[#A1A1AA]">Selecionar Ingredientes (Auto-gera a descrição)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg">
                  {globalIngredients.map(ing => (
                    <label
                      key={ing}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={editingItem.description.includes(ing)}
                          onChange={() => toggleIngredient(ing, true)}
                          className="peer appearance-none w-5 h-5 border-2 border-[#2A2A2A] rounded-md checked:bg-[#7C3AED] checked:border-[#7C3AED] transition-all cursor-pointer"
                        />
                        <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      </div>
                      <span className={`text-xs font-bold transition-colors ${editingItem.description.includes(ing) ? 'text-white' : 'text-[#A1A1AA] group-hover:text-white'}`}>
                        {ing}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-[#A1A1AA]">Descrição (Manual)</label>
                <textarea 
                  required
                  value={editingItem.description}
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none h-20 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Foto do Produto</label>
                <div className="flex flex-col gap-2">
                  {editingItem.imageUrl && !editingImage && (
                    <img src={editingItem.imageUrl} className="w-20 h-20 object-cover rounded-lg border border-[#2A2A2A]" alt="Preview" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setEditingImage(e.target.files?.[0] || null)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none text-sm"
                  />
                  <p className="text-[10px] text-[#555]">Deixe em branco para manter a imagem atual.</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Categoria</label>
                <select 
                  value={editingItem.categoryId}
                  onChange={e => setEditingItem({...editingItem, categoryId: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gestão de Opcionais */}
            <div className="mt-10 border-t border-[#2A2A2A] pt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Grupos de Opcionais</h3>
                  <p className="text-sm text-[#A1A1AA]">Adicionais, ingredientes para retirar, etc.</p>
                </div>
                 <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => applyAddonsPreset(true)}
                    className="text-[10px] bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#25D366]/20 transition-all font-bold"
                  >
                    <Plus size={14} /> + Acréscimos Padrão
                  </button>
                  <button 
                    type="button"
                    onClick={() => applyDrinkPreset(true)}
                    className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#3B82F6]/20 transition-all font-bold"
                  >
                    <Plus size={14} /> + BEBIDAS
                  </button>
                  <button 
                    type="button"
                    onClick={() => applyMilkshakePreset(true)}
                    className="text-[10px] bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#EC4899]/20 transition-all font-bold"
                  >
                    <Plus size={14} /> + MILKSHAKE
                  </button>
                  <button 
                    type="button"
                    onClick={() => addOption(true)}
                    className="text-[10px] bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#7C3AED]/20 transition-all font-bold"
                  >
                    <PlusCircle size={16} /> Adicionar Grupo
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {editingItem.options?.filter(opt => !opt.title.toLowerCase().includes('retirar')).map((opt) => (
                  <div key={opt.id} className="bg-[#0D0D0D] border border-[#2A2A2A] p-5 rounded-xl relative group">
                    <button 
                      type="button"
                      onClick={() => removeOption(opt.id, true)}
                      className="absolute -top-2 -right-2 bg-[#EF4444] text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100"
                    >
                      <X size={14} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#555] uppercase tracking-wider font-bold">Título do Grupo</label>
                        <input 
                          type="text"
                          value={opt.title}
                          onChange={e => setEditingItem({
                            ...editingItem,
                            options: editingItem.options.map(o => o.id === opt.id ? { ...o, title: e.target.value } : o)
                          })}
                          placeholder="Ex: Turbine seu Burger"
                          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:border-[#7C3AED] outline-none"
                        />
                      </div>
                      <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] text-[#555] uppercase tracking-wider font-bold">Tipo</label>
                          <select 
                            value={opt.type}
                            onChange={e => setEditingItem({
                              ...editingItem,
                              options: editingItem.options.map(o => o.id === opt.id ? { ...o, type: e.target.value as any } : o)
                            })}
                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:border-[#7C3AED] outline-none"
                          >
                            <option value="checkbox">Seleção Múltipla</option>
                            <option value="radio">Seleção Única (Obrigatória)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[11px] text-[#555] uppercase tracking-wider font-bold block mb-1">Opções do Grupo</label>
                       {opt.choices.map((choice, idx) => (
                         <div key={idx} className="flex gap-2 items-center">
                            <input 
                              type="text"
                              value={choice.label}
                              onChange={e => updateChoice(opt.id, idx, 'label', e.target.value, true)}
                              placeholder="Nome da opção"
                              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs focus:border-[#7C3AED] outline-none"
                            />
                            <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2">
                               <span className="text-[10px] text-[#555]">R$</span>
                               <input 
                                type="number"
                                step="0.01"
                                value={choice.price || 0}
                                onChange={e => updateChoice(opt.id, idx, 'price', parseFloat(e.target.value), true)}
                                className="w-16 bg-transparent py-1.5 text-xs focus:outline-none text-right"
                              />
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeChoice(opt.id, idx, true)}
                              className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                            >
                              <X size={14} />
                            </button>
                         </div>
                       ))}
                       <button 
                        type="button"
                        onClick={() => addChoice(opt.id, true)}
                        className="text-[10px] font-bold text-[#7C3AED] hover:text-[#A78BFA] transition-all flex items-center gap-1 mt-2"
                       >
                        <Plus size={12} /> Adicionar Opção
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-10">
              <button type="submit" className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl font-bold transition-all">
                Salvar Alterações
              </button>
              <button 
                type="button" 
                onClick={() => setEditingItem(null)}
                className="px-6 bg-[#2A2A2A] hover:bg-[#333] text-white py-3 rounded-xl font-bold transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {isAdding && (
          <form onSubmit={handleAdd} className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-4">Novo Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Nome</label>
                <input 
                  required
                  type="text" 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Preço (R$)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={newItem.price}
                  onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-[#A1A1AA]">Selecionar Ingredientes (Auto-gera a descrição)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg">
                  {globalIngredients.map(ing => (
                    <label
                      key={ing}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={newItem.description.includes(ing)}
                          onChange={() => toggleIngredient(ing, false)}
                          className="peer appearance-none w-5 h-5 border-2 border-[#2A2A2A] rounded-md checked:bg-[#7C3AED] checked:border-[#7C3AED] transition-all cursor-pointer"
                        />
                        <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      </div>
                      <span className={`text-xs font-bold transition-colors ${newItem.description.includes(ing) ? 'text-white' : 'text-[#A1A1AA] group-hover:text-white'}`}>
                        {ing}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-[#A1A1AA]">Descrição (Manual)</label>
                <textarea 
                  required
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none h-20 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Foto do Produto</label>
                <input 
                  required
                  type="file" 
                  accept="image/*"
                  onChange={e => setNewImage(e.target.files?.[0] || null)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Categoria</label>
                <select 
                  value={newItem.categoryId}
                  onChange={e => setNewItem({...newItem, categoryId: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gestão de Opcionais (New Item) */}
            <div className="mt-10 border-t border-[#2A2A2A] pt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Grupos de Opcionais</h3>
                  <p className="text-sm text-[#A1A1AA]">Adicionais, ingredientes para retirar, etc.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => applyAddonsPreset(false)}
                    className="text-[10px] bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#25D366]/20 transition-all font-bold"
                  >
                    <Plus size={14} /> + Acréscimos Padrão
                  </button>
                  <button 
                    type="button"
                    onClick={() => applyDrinkPreset(false)}
                    className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#3B82F6]/20 transition-all font-bold"
                  >
                    <Plus size={14} /> + BEBIDAS
                  </button>
                  <button 
                    type="button"
                    onClick={() => applyMilkshakePreset(false)}
                    className="text-[10px] bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#EC4899]/20 transition-all font-bold"
                  >
                    <Plus size={14} /> + MILKSHAKE
                  </button>
                  <button 
                    type="button"
                    onClick={() => addOption(false)}
                    className="text-[10px] bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#7C3AED]/20 transition-all font-bold"
                  >
                    <PlusCircle size={16} /> Adicionar Grupo
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {newItem.options?.filter(opt => !opt.title.toLowerCase().includes('retirar')).map((opt) => (
                  <div key={opt.id} className="bg-[#0D0D0D] border border-[#2A2A2A] p-5 rounded-xl relative group">
                    <button 
                      type="button"
                      onClick={() => removeOption(opt.id, false)}
                      className="absolute -top-2 -right-2 bg-[#EF4444] text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100"
                    >
                      <X size={14} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#555] uppercase tracking-wider font-bold">Título do Grupo</label>
                        <input 
                          type="text"
                          value={opt.title}
                          onChange={e => setNewItem({
                            ...newItem,
                            options: newItem.options.map(o => o.id === opt.id ? { ...o, title: e.target.value } : o)
                          })}
                          placeholder="Ex: Turbine seu Burger"
                          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:border-[#7C3AED] outline-none"
                        />
                      </div>
                      <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] text-[#555] uppercase tracking-wider font-bold">Tipo</label>
                          <select 
                            value={opt.type}
                            onChange={e => setNewItem({
                              ...newItem,
                              options: newItem.options.map(o => o.id === opt.id ? { ...o, type: e.target.value as any } : o)
                            })}
                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:border-[#7C3AED] outline-none"
                          >
                            <option value="checkbox">Seleção Múltipla</option>
                            <option value="radio">Seleção Única (Obrigatória)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[11px] text-[#555] uppercase tracking-wider font-bold block mb-1">Opções do Grupo</label>
                       {opt.choices.map((choice, idx) => (
                         <div key={idx} className="flex gap-2 items-center">
                            <input 
                              type="text"
                              value={choice.label}
                              onChange={e => updateChoice(opt.id, idx, 'label', e.target.value, false)}
                              placeholder="Nome da opção"
                              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs focus:border-[#7C3AED] outline-none"
                            />
                            <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2">
                               <span className="text-[10px] text-[#555]">R$</span>
                               <input 
                                type="number"
                                step="0.01"
                                value={choice.price || 0}
                                onChange={e => updateChoice(opt.id, idx, 'price', parseFloat(e.target.value), false)}
                                className="w-16 bg-transparent py-1.5 text-xs focus:outline-none text-right"
                              />
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeChoice(opt.id, idx, false)}
                              className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                            >
                              <X size={14} />
                            </button>
                         </div>
                       ))}
                       <button 
                        type="button"
                        onClick={() => addChoice(opt.id, false)}
                        className="text-[10px] font-bold text-[#7C3AED] hover:text-[#A78BFA] transition-all flex items-center gap-1 mt-2"
                       >
                        <Plus size={12} /> Adicionar Opção
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full mt-10 bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl font-bold transition-all">
              Salvar Item
            </button>
          </form>
        )}

        <div className="space-y-12">
          {categories.map(category => {
            const categoryItems = items.filter(item => item.categoryId === category.id);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                    {category.title}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#7C3AED]/30 to-transparent"></div>
                  <span className="text-[10px] font-bold text-[#555] uppercase bg-[#1A1A1A] px-2 py-1 rounded border border-[#2A2A2A]">
                    {categoryItems.length} {categoryItems.length === 1 ? 'Item' : 'Itens'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="bg-[#1A1A1A] border border-[#2A2A2A] p-4 rounded-xl flex gap-4 items-center group relative hover:border-[#7C3AED]/50 transition-all">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-[#222]" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate text-sm">{item.name}</h3>
                        <p className="text-[#A1A1AA] text-[10px] truncate">{item.description}</p>
                        <p className="text-[#7C3AED] font-bold mt-1 text-sm">R$ {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            if(confirm('Deseja duplicar este item?')) duplicateItem(item.id);
                          }}
                          className="p-1.5 text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors"
                          title="Duplicar item"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingItem(item);
                            setIsAdding(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-1.5 text-[#A78BFA] hover:bg-[#7C3AED]/10 rounded-lg transition-colors"
                          title="Editar item"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm('Deseja realmente excluir este item?')) deleteItem(item.id);
                          }}
                          className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                          title="Excluir item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </>
    ) : (
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <SettingsIcon className="text-[#7C3AED]" /> Configurações Gerais
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#A1A1AA]">Taxa Fixa (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={localSettings.baseDeliveryFee}
                    onChange={e => setLocalSettings(prev => ({ ...prev, baseDeliveryFee: Number(e.target.value) }))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#A1A1AA]">Taxa por Km (R$)</label>
                  <input 
                    type="number"
                    step="0.10"
                    value={localSettings.deliveryFeePerKm}
                    onChange={e => setLocalSettings(prev => ({ ...prev, deliveryFeePerKm: Number(e.target.value) }))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#A1A1AA]">Frete Grátis (km)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={localSettings.freeDeliveryRadius}
                    onChange={e => setLocalSettings(prev => ({ ...prev, freeDeliveryRadius: Number(e.target.value) }))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none border-[#25D366]/30 text-[#25D366]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#A1A1AA]">Pedido Mínimo (R$)</label>
                  <input 
                    type="number"
                    value={localSettings.minOrderValue}
                    onChange={e => setLocalSettings(prev => ({ ...prev, minOrderValue: Number(e.target.value) }))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-4">
                  <label className="text-sm text-[#A1A1AA]">Endereço da Hamburgueria</label>
                  <input 
                    type="text"
                    value={localSettings.restaurantAddress}
                    onChange={e => setLocalSettings(prev => ({ ...prev, restaurantAddress: e.target.value }))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                  />
                </div>
              </div>

              {/* Gestão Global de Ingredientes */}
              <div className="mt-10 space-y-8">
                <div className="border-t border-[#2A2A2A] pt-8">
                  <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={20} className="text-[#7C3AED]" /> Ingredientes para Seleção
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mb-4">Estes itens aparecerão no checklist de descrição ao cadastrar qualquer hambúrguer.</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl">
                    {localSettings.globalIngredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded-full group hover:border-[#EF4444]/50 transition-all">
                        <span className="text-xs font-bold text-white">{ing}</span>
                        <button 
                          onClick={() => setLocalSettings(prev => ({ ...prev, globalIngredients: prev.globalIngredients.filter((_, i) => i !== idx) }))}
                          className="text-[#555] hover:text-[#EF4444] transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {localSettings.globalIngredients.length === 0 && <p className="text-xs text-[#555] italic">Nenhum ingrediente cadastrado.</p>}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      id="new-global-ingredient"
                      placeholder="Adicionar novo ingrediente (ex: Pão, Bacon, Alface...)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.trim();
                          if (val && !localSettings.globalIngredients.includes(val)) {
                            setLocalSettings(prev => ({ ...prev, globalIngredients: [...prev.globalIngredients, val] }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 focus:border-[#7C3AED] outline-none text-sm"
                    />
                    <button 
                      onClick={() => {
                        const el = document.getElementById('new-global-ingredient') as HTMLInputElement;
                        const val = el.value.trim();
                        if (val && !localSettings.globalIngredients.includes(val)) {
                          setLocalSettings(prev => ({ ...prev, globalIngredients: [...prev.globalIngredients, val] }));
                          el.value = '';
                        }
                      }}
                      className="bg-[#7C3AED] text-white px-4 rounded-lg hover:bg-[#6D28D9] transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#2A2A2A] pt-8">
                  <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Utensils size={20} className="text-[#3B82F6]" /> Gestão de Bebidas
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mb-4">Lista de refrigerantes (Lata, 1L, 2L, etc) para seleção nos combos.</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl">
                    {localSettings.globalDrinks.map((drink, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded-full group hover:border-[#EF4444]/50 transition-all">
                        <span className="text-xs font-bold text-white">{drink}</span>
                        <button 
                          onClick={() => setLocalSettings(prev => ({ ...prev, globalDrinks: prev.globalDrinks.filter((_, i) => i !== idx) }))}
                          className="text-[#555] hover:text-[#EF4444] transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {localSettings.globalDrinks.length === 0 && <p className="text-xs text-[#555] italic">Nenhuma bebida cadastrada.</p>}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      id="new-global-drink"
                      placeholder="Adicionar bebida (ex: Coca-Cola Lata, Guaraná 2L...)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.trim();
                          if (val && !localSettings.globalDrinks.includes(val)) {
                            setLocalSettings(prev => ({ ...prev, globalDrinks: [...prev.globalDrinks, val] }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 focus:border-[#7C3AED] outline-none text-sm"
                    />
                    <button 
                      onClick={() => {
                        const el = document.getElementById('new-global-drink') as HTMLInputElement;
                        const val = el.value.trim();
                        if (val && !localSettings.globalDrinks.includes(val)) {
                          setLocalSettings(prev => ({ ...prev, globalDrinks: [...prev.globalDrinks, val] }));
                          el.value = '';
                        }
                      }}
                      className="bg-[#3B82F6] text-white px-4 rounded-lg hover:bg-[#2563EB] transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#2A2A2A] pt-8">
                  <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                    <PlusCircle size={20} className="text-[#EC4899]" /> Sabores de Milkshake
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mb-4">Lista de sabores disponíveis para os milkshakes nos combos.</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl">
                    {localSettings.globalMilkshakes.map((ms, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded-full group hover:border-[#EF4444]/50 transition-all">
                        <span className="text-xs font-bold text-white">{ms}</span>
                        <button 
                          onClick={() => setLocalSettings(prev => ({ ...prev, globalMilkshakes: prev.globalMilkshakes.filter((_, i) => i !== idx) }))}
                          className="text-[#555] hover:text-[#EF4444] transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {localSettings.globalMilkshakes.length === 0 && <p className="text-xs text-[#555] italic">Nenhum sabor cadastrado.</p>}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      id="new-global-milkshake"
                      placeholder="Adicionar sabor (ex: Ninho com Nutella, Morango...)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.trim();
                          if (val && !localSettings.globalMilkshakes.includes(val)) {
                            setLocalSettings(prev => ({ ...prev, globalMilkshakes: [...prev.globalMilkshakes, val] }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 focus:border-[#7C3AED] outline-none text-sm"
                    />
                    <button 
                      onClick={() => {
                        const el = document.getElementById('new-global-milkshake') as HTMLInputElement;
                        const val = el.value.trim();
                        if (val && !localSettings.globalMilkshakes.includes(val)) {
                          setLocalSettings(prev => ({ ...prev, globalMilkshakes: [...prev.globalMilkshakes, val] }));
                          el.value = '';
                        }
                      }}
                      className="bg-[#EC4899] text-white px-4 rounded-lg hover:bg-[#DB2777] transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#2A2A2A] pt-8">
                  <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                    <PlusCircle size={20} className="text-[#25D366]" /> Acréscimos Globais
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mb-4">Estes itens são os opcionais pagos (Ex: Dobro de Carne, Bacon extra).</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {localSettings.globalAddons.map((addon, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded-xl group hover:border-[#7C3AED]/30 transition-all">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{addon.label}</span>
                          <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-tighter">R$ {addon.price.toFixed(2)}</span>
                        </div>
                        <button 
                          onClick={() => setLocalSettings(prev => ({ ...prev, globalAddons: prev.globalAddons.filter((_, i) => i !== idx) }))}
                          className="p-1.5 bg-[#EF4444]/10 text-[#EF4444] rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#EF4444] hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {localSettings.globalAddons.length === 0 && <p className="text-xs text-[#555] italic col-span-full">Nenhum acréscimo cadastrado.</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#555] uppercase font-bold">Nome do Adicional</label>
                      <input 
                        id="new-addon-name"
                        type="text"
                        placeholder="Ex: Bacon Extra"
                        className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#555] uppercase font-bold">Preço (R$)</label>
                      <div className="flex gap-2">
                        <input 
                          id="new-addon-price"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none text-sm"
                        />
                        <button 
                          onClick={() => {
                            const nameEl = document.getElementById('new-addon-name') as HTMLInputElement;
                            const priceEl = document.getElementById('new-addon-price') as HTMLInputElement;
                            const name = nameEl.value.trim();
                            const price = Number(priceEl.value);
                            if (name && !isNaN(price)) {
                              setLocalSettings(prev => ({ ...prev, globalAddons: [...prev.globalAddons, { label: name, price }] }));
                              nameEl.value = '';
                              priceEl.value = '';
                            }
                          }}
                          className="bg-[#25D366] text-white px-6 rounded-lg hover:bg-[#1fb355] transition-all font-bold"
                        >
                          ADICIONAR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#555] text-center sm:text-left">
                  As alterações só serão aplicadas após clicar em salvar.
                </p>
                <button 
                  onClick={handleSaveSettings}
                  disabled={settingsLoading}
                  className="w-full sm:w-auto bg-[#7C3AED] text-white px-10 py-3.5 rounded-xl font-bold hover:bg-[#6D28D9] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#7C3AED]/20 disabled:opacity-50"
                >
                  {settingsLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      SALVANDO...
                    </>
                  ) : (
                    <>
                      <SettingsIcon size={20} />
                      SALVAR CONFIGURAÇÕES
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
