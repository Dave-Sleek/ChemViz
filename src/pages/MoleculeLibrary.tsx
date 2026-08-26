import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Beaker, Filter, ArrowRight, X, FlaskConical, Atom } from 'lucide-react';
import { COMMON_MOLECULES } from '../data/commonMolecules';
import { formatFormula } from '../utils/formulaParser';

interface MoleculeLibraryProps {
  onSelect: (formula: string) => void;
}

export default function MoleculeLibrary({ onSelect }: MoleculeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(COMMON_MOLECULES.map(m => m.category)));
  }, []);

  const filteredMolecules = useMemo(() => {
    return COMMON_MOLECULES.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.formula.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || m.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0B0E14] transition-colors duration-300">
      {/* Header section */}
      <div className="p-8 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FlaskConical size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Compound Library</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Browse and explore curated chemical compounds.</p>
            </div>
          </div>

          <div className="relative group max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search by name or formula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === null 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white dark:bg-[#161B22] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
            }`}
          >
            All Compounds
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white dark:bg-[#161B22] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid section */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMolecules.map((m, idx) => (
              <motion.div
                key={m.formula}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="group relative bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
                onClick={() => onSelect(m.formula)}
              >
                <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#0B0E14] border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-colors">
                  <Atom size={20} />
                </div>

                <div className="mb-8">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{m.category}</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 leading-tight">{m.name}</h3>
                  <div 
                    className="text-blue-600 dark:text-blue-400 font-mono font-bold text-sm mt-2"
                    dangerouslySetInnerHTML={{ __html: formatFormula(m.formula) }}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">View Details</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0B0E14] flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredMolecules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4">
              <Beaker size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No compounds found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-2">We couldn't find any molecules matching "{searchQuery}" in our local scientific database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
