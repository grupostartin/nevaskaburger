import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMenuStore } from '../store/menuStore';

export function CategoryTabs() {
  const { categories } = useMenuStore();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Set initial active category
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Scroll Spy Logic
  useEffect(() => {
    if (categories.length === 0) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
          const categoryId = entry.target.id.replace('category-', '');
          setActiveCategory(categoryId);
          
          // Auto scroll the tabs to keep active one visible
          const activeTab = document.getElementById(`tab-${categoryId}`);
          if (activeTab && scrollRef.current) {
            activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-160px 0px -70% 0px',
      threshold: [0.1, 0.5]
    });

    categories.forEach(cat => {
      const el = document.getElementById(`category-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const handleChange = (id: string) => {
    setActiveCategory(id);
    const el = document.getElementById(`category-${id}`);
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 150;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={scrollRef}
      className="flex gap-[12px] px-4 py-3 overflow-x-auto scrollbar-hide bg-[#0A0A0A]/95 backdrop-blur-md sticky top-[80px] md:top-[100px] z-30 border-b border-[#1A1A1A] shadow-lg shadow-black/50"
    >
      {categories.map((category) => (
        <button
          key={category.id}
          id={`tab-${category.id}`}
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
