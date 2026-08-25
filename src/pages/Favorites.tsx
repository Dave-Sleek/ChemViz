import { motion } from 'motion/react';
import { Heart, Trash2, ArrowRight, FlaskConical } from 'lucide-react';
import { formatFormula } from '../utils/formulaParser';
import { useState, useEffect } from 'react';

interface FavoritesProps {
  onSelect: (query: string) => void;
}

export function Favorites({ onSelect }: FavoritesProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favorite_molecules') || '[]');
    const recs = JSON.parse(localStorage.getItem('recent_molecules') || '[]');
    setFavorites(favs);
    setRecent(recs);
  }, []);

  const removeFavorite = (formula: string) => {
    const newFavs = favorites.filter(f => f !== formula);
    localStorage.setItem('favorite_molecules', JSON.stringify(newFavs));
    setFavorites(newFavs);
  };

  const clearRecent = () => {
    localStorage.setItem('recent_molecules', '[]');
    setRecent([]);
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#0B0E14] overflow-y-auto scrollbar-hide">
      <section className="mb-16">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
              <Heart size={24} className="fill-current" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Saved Compounds</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{favorites.length} Entries Archived</p>
            </div>
          </div>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <MoleculeCard 
                key={fav} 
                formula={fav} 
                onSelect={() => onSelect(fav)} 
                onRemove={() => removeFavorite(fav)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#161B22]/50 border-2 border-dashed border-slate-800 rounded-3xl">
            <Heart size={48} className="text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-1">No Saved Compounds</h3>
            <p className="text-slate-600 text-sm">Molecules you save will appear in this collection.</p>
          </div>
        )}
      </section>

      <section className="pb-12">
        <div className="flex items-center justify-between mb-8 pt-12 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-800 text-slate-400 rounded-2xl border border-slate-700">
              <FlaskConical size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Recent Explorations</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Terminal Session History</p>
            </div>
          </div>
          {recent.length > 0 && (
            <button 
              onClick={clearRecent}
              className="text-[10px] font-bold text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all border border-red-500/20 uppercase tracking-widest"
            >
              Purge Logs
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {recent.map((rec) => (
            <button
              key={rec}
              onClick={() => onSelect(rec)}
              className="px-6 py-4 bg-[#161B22] border border-slate-800 rounded-xl font-bold flex items-center gap-4 hover:border-blue-500 hover:text-white group transition-all shadow-sm"
            >
              <span className="text-slate-500 group-hover:text-blue-500 transition-colors">{formatFormula(rec)}</span>
              <ArrowRight size={16} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
            </button>
          ))}
          {recent.length === 0 && (
            <p className="text-slate-600 text-sm font-medium italic">Terminal history is currently empty.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function MoleculeCard({ formula, onSelect, onRemove }: { formula: string, onSelect: () => void, onRemove: () => void }) {
  return (
    <div className="group bg-[#161B22] border border-slate-800 rounded-2xl p-6 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/5 transition-all flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center font-black text-blue-500 border border-blue-500/20">
          {formula.substring(0, 1)}
        </div>
        <button 
          onClick={onRemove}
          className="p-2 text-slate-700 hover:text-red-500 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>
      
      <div className="mb-8">
        <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors leading-none mb-2">
          {formatFormula(formula)}
        </h3>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Validated Compound</p>
      </div>

      <button 
        onClick={onSelect}
        className="w-full py-4 bg-[#0B0E14] text-slate-400 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all border border-slate-800 hover:border-blue-600 shadow-inner"
      >
        Re-visualize Structure
      </button>
    </div>
  );
}
