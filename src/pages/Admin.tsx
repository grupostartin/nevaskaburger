import React, { useState } from 'react';
import { useMenuStore } from '../store/menuStore';
import { useSettingsStore } from '../store/settingsStore';
import { Trash2, Plus, ArrowLeft, Settings as SettingsIcon, Utensils, Edit, PlusCircle, X, Copy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

export default function Admin() {
  const { items, addItem, deleteItem, updateItem, duplicateItem, categories } = useMenuStore();
  const { deliveryFeePerKm, baseDeliveryFee, minOrderValue, setDeliveryFeePerKm, setBaseDeliveryFee, setMinOrderValue } = useSettingsStore();

  const STANDARD_OPTIONS = [
    { 
      id: 'remove-standard', 
      title: 'Ingredientes para retirar', 
      type: 'checkbox' as const, 
      required: false, 
      choices: [
        { label: 'Sem cebola', price: 0 },
        { label: 'Sem tomate', price: 0 },
        { label: 'Sem picles', price: 0 },
      ] 
    },
    { 
      id: 'turbine-burger', 
      title: 'Turbine seu Burger', 
      type: 'checkbox' as const, 
      required: false, 
      choices: [
        { label: 'Bacon', price: 4 },
        { label: 'Ovo', price: 3 },
        { label: 'Queijo extra', price: 3 },
      ] 
    }
  ];

  const applyPreset = (isEditing: boolean) => {
    const updatedOptions = [...STANDARD_OPTIONS.map(o => ({ ...o, id: Math.random().toString() }))];
    if (isEditing && editingItem) {
      setEditingItem({ ...editingItem, options: [...(editingItem.options || []), ...updatedOptions] });
    } else {
      setNewItem({ ...newItem, options: [...(newItem.options || []), ...updatedOptions] });
    }
  };

  const [activeTab, setActiveTab] = useState<'items' | 'settings'>('items');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const [newItem, setNewItem] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    categoryId: categories[0]?.id || '',
    options: []
  });


  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem(editingItem.id, editingItem);
      setEditingItem(null);
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addItem(newItem);
    setIsAdding(false);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      categoryId: categories[0]?.id || '',
      options: []
    });
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
                <label className="text-sm text-[#A1A1AA]">Descrição</label>
                <textarea 
                  required
                  value={editingItem.description}
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none h-24"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">URL da Imagem</label>
                <input 
                  required
                  type="text" 
                  value={editingItem.imageUrl}
                  onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                />
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
                    onClick={() => applyPreset(true)}
                    className="text-[10px] bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#25D366]/20 transition-all font-bold"
                  >
                    <Zap size={14} /> Aplicar Padrão Burger
                  </button>
                  <button 
                    type="button"
                    onClick={() => addOption(true)}
                    className="text-sm bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#7C3AED]/20 transition-all font-bold"
                  >
                    <PlusCircle size={16} /> Adicionar Grupo
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {editingItem.options?.map((opt) => (
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
                <label className="text-sm text-[#A1A1AA]">Descrição</label>
                <textarea 
                  required
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none h-24"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">URL da Imagem</label>
                <input 
                  required
                  type="text" 
                  value={newItem.imageUrl}
                  onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
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
                <button 
                  type="button"
                  onClick={() => addOption(false)}
                  className="text-sm bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#7C3AED]/20 transition-all font-bold"
                >
                  <PlusCircle size={16} /> Adicionar Grupo
                </button>
              </div>

              <div className="space-y-6">
                {newItem.options?.map((opt) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-[#1A1A1A] border border-[#2A2A2A] p-4 rounded-xl flex gap-4 items-center group relative">
              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-[#222]" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{item.name}</h3>
                <p className="text-[#A1A1AA] text-xs truncate">{item.description}</p>
                <p className="text-[#7C3AED] font-bold mt-1">R$ {item.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    if(confirm('Deseja duplicar este item?')) duplicateItem(item.id);
                  }}
                  className="p-2 text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors"
                  title="Duplicar item"
                >
                  <Copy size={20} />
                </button>
                <button 
                  onClick={() => {
                    setEditingItem(item);
                    setIsAdding(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-2 text-[#A78BFA] hover:bg-[#7C3AED]/10 rounded-lg transition-colors"
                  title="Editar item"
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => {
                    if(confirm('Deseja realmente excluir este item?')) deleteItem(item.id);
                  }}
                  className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                  title="Excluir item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    ) : (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <SettingsIcon className="text-[#7C3AED]" /> Configurações de Entrega
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Taxa Fixa (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={baseDeliveryFee}
                  onChange={e => setBaseDeliveryFee(parseFloat(e.target.value))}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                />
                <p className="text-[10px] text-[#555]">Cobrada em todos os pedidos.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Taxa por Km (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={deliveryFeePerKm}
                  onChange={e => setDeliveryFeePerKm(parseFloat(e.target.value))}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                />
                <p className="text-[10px] text-[#555]">Calculada com base na distância.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#A1A1AA]">Pedido Mínimo (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={minOrderValue}
                  onChange={e => setMinOrderValue(parseFloat(e.target.value))}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 focus:border-[#7C3AED] outline-none"
                />
              </div>
            </div>

            <div className="mt-12 p-4 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-xl">
              <h3 className="font-bold text-[#A78BFA] mb-2 flex items-center gap-2">💡 Dica de Configuração</h3>
              <p className="text-sm text-[#A1A1AA]">
                O valor total do frete será: <strong>Taxa Fixa + (Ditância em Km × Taxa por Km)</strong>. 
                Certifique-se de configurar sua chave de API do Google Maps para o cálculo de distância funcionar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
