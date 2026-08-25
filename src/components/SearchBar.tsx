import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COMMON_MOLECULES, SuggestionMolecule } from '../data/commonMolecules';
import { formatFormula } from '../utils/formulaParser';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  size?: 'sm' | 'lg';
}

export function SearchBar({ onSearch, placeholder = "Search formula...", className = "", initialValue = "", size = 'sm' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SuggestionMolecule[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const inputClasses = size === 'lg' 
    ? "w-full text-lg md:text-xl bg-slate-50 dark:bg-[#161B22] border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-6 pl-14 pr-16 shadow-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
    : "w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-600 rounded-full py-2 px-4 pl-10 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500";

  const searchIconSize = size === 'lg' ? 24 : 16;
  const searchIconLeft = size === 'lg' ? "left-5" : "left-3.5";

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = COMMON_MOLECULES.filter(m => 
        m.formula.toLowerCase().includes(query.toLowerCase()) || 
        m.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (molecule: SuggestionMolecule) => {
    onSearch(molecule.formula);
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className={`relative group ${className}`} ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className={`absolute ${searchIconLeft} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors`} size={searchIconSize} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length > 0 && setShowSuggestions(suggestions.length > 0)}
          placeholder={placeholder}
          className={inputClasses}
        />
        {query && (
          <button 
            type="button"
            onClick={() => { setQuery(''); setShowSuggestions(false); }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors`}
          >
            <X size={size === 'lg' ? 20 : 14} />
          </button>
        )}
      </form>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-[100]`}
          >
            <div className="p-3">
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/50 mb-2">
                Compound Matches
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((molecule, index) => (
                  <button
                    key={molecule.formula}
                    onClick={() => handleSelect(molecule)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left group/item ${
                      index === selectedIndex ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${index === selectedIndex ? 'text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                        {formatFormula(molecule.formula)}
                      </span>
                      <span className={`text-[11px] ${index === selectedIndex ? 'text-blue-100' : 'text-slate-500'}`}>
                        {molecule.name}
                      </span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${
                      index === selectedIndex 
                        ? 'bg-blue-500/30 border-blue-400 text-white' 
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}>
                      {molecule.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
