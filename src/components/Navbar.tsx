import React, { useState } from 'react';
import { Search, Moon, Sun, Menu, X, FlaskConical, Table, BrainCircuit, Heart, Info, Home as HomeIcon, GraduationCap } from 'lucide-react';
import { type ViewType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

import { SearchBar } from './SearchBar';

interface NavbarProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  onSearch: (query: string) => void;
}

export function Navbar({ view, setView, toggleTheme, theme, onSearch }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (newView: ViewType) => {
    setView(newView);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-[#161B22] border-b border-slate-200 dark:border-slate-700 h-[64px] shrink-0 sticky top-0 z-50 transition-colors duration-300">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate('home')}
      >
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          MF
        </div>
        <div className="hidden xs:block">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Molecufy 
            <span className="text-blue-500 dark:text-blue-400 font-light text-sm hidden lg:inline">Chemistry made visual</span>
          </h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4 md:mx-8">
        <SearchBar onSearch={onSearch} />
      </div>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <NavButton label="Explorer" active={view === 'explorer' || view === 'home'} onClick={() => navigate('explorer')} />
        <NavButton label="Academy" active={view === 'academy'} onClick={() => navigate('academy')} />
        <NavButton label="Periodic Table" active={view === 'table'} onClick={() => navigate('table')} />
        <NavButton label="Quiz" active={view === 'quiz'} onClick={() => navigate('quiz')} />
        <NavButton label="Favorites" active={view === 'favorites'} onClick={() => navigate('favorites')} />
      </nav>

      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        
        <button 
          className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-[64px] left-0 right-0 bg-white dark:bg-[#161B22] border-b border-slate-200 dark:border-slate-700 md:hidden overflow-hidden shadow-2xl"
          >
            <div className="p-4 flex flex-col gap-2">
              <MobileNavItem label="Home" icon={<HomeIcon size={18} />} active={view === 'home'} onClick={() => navigate('home')} />
              <MobileNavItem label="Academy" icon={<GraduationCap size={18} />} active={view === 'academy'} onClick={() => navigate('academy')} />
              <MobileNavItem label="Explorer" icon={<FlaskConical size={18} />} active={view === 'explorer'} onClick={() => navigate('explorer')} />
              <MobileNavItem label="Periodic Table" icon={<Table size={18} />} active={view === 'table'} onClick={() => navigate('table')} />
              <MobileNavItem label="Quiz" icon={<BrainCircuit size={18} />} active={view === 'quiz'} onClick={() => navigate('quiz')} />
              <MobileNavItem label="Favorites" icon={<Heart size={18} />} active={view === 'favorites'} onClick={() => navigate('favorites')} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`pb-1 pt-1 transition-colors relative border-b-2 ${
        active 
          ? 'text-blue-500 dark:text-blue-400 border-blue-500 dark:border-blue-400' 
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent'
      }`}
    >
      {label}
    </button>
  );
}

function MobileNavItem({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        active ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span className="font-bold">{label}</span>
    </button>
  );
}
