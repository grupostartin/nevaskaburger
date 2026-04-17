import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMenuStore } from '../store/menuStore';

export function CategoryTabs() {
  const { categories } = useMenuStore();
  const [activeCategory, setActiveCategory] = useState('all');

  const handleChange = (id: string) => {
    setActiveCategory(id);
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(`category-${id}`);
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 160;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex gap-[12px] px-4 py-3 overflow-x-auto scrollbar-hide bg-[#0A0A0A] sticky top-[100px] z-30 border-b border-[#1A1A1A]">
      <button
        onClick={() => handleChange('all')}
        className={`px-[20px] py-[10px] rounded-full text-[14px] font-bold whitespace-nowrap transition-colors relative ${
          activeCategory === 'all' ? 'text-white' : 'text-[#A1A1AA] hover:text-white'
        }`}
      >
        {activeCategory === 'all' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-[#7C3AED] rounded-full -z-10 shadow-[0_0_15px_rgba(124,58,237,0.4)]"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        Todos
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleChange(category.id)}
          className={`px-[20px] py-[10px] rounded-full text-[14px] font-bold whitespace-nowrap transition-colors relative ${
            activeCategory === category.id ? 'text-white' : 'text-[#A1A1AA] hover:text-white'
          }`}
        >
          {activeCategory === category.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-[#7C3AED] rounded-full -z-10 shadow-[0_0_15px_rgba(124,58,237,0.4)]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          {category.title}
        </button>
      ))}
    </div>
  );
}
