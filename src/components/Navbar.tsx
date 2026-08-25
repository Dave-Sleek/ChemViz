import { Search, Moon, Sun, FlaskConical, Table, BrainCircuit, Heart, Info } from 'lucide-react';
import { type ViewType } from '../types';
import { useState } from 'react';

interface NavbarProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  onSearch: (query: string) => void;
}

export function Navbar({ view, setView, toggleTheme, theme, onSearch }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setSearchQuery('');
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#161B22] border-b border-slate-700 h-[64px] shrink-0">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setView('home')}
      >
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          CV
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            ChemViz 
            <span className="text-blue-400 font-light text-sm hidden lg:inline">Chemistry made visual</span>
          </h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 relative group">
        <form onSubmit={handleSubmit}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formula (e.g. H2SO4)..."
            className="w-full bg-[#0B0E14] border border-slate-600 rounded-full py-1.5 px-4 pl-10 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-200 placeholder:text-slate-500"
          />
        </form>
      </div>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <NavButton label="Explorer" active={view === 'explorer' || view === 'home'} onClick={() => setView('explorer')} />
        <NavButton label="Periodic Table" active={view === 'table'} onClick={() => setView('table')} />
        <NavButton label="Quiz" active={view === 'quiz'} onClick={() => setView('quiz')} />
        <NavButton label="Favorites" active={view === 'favorites'} onClick={() => setView('favorites')} />
      </nav>

      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-slate-700 transition-colors text-slate-400"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}

function NavButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`pb-1 pt-1 transition-colors relative border-b-2 ${
        active 
          ? 'text-blue-400 border-blue-400' 
          : 'text-slate-400 hover:text-white border-transparent'
      }`}
    >
      {label}
    </button>
  );
}
