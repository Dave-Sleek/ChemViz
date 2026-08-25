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
    const favs = JSON.parse(localStorage.getItem('favorite_molecules_v2') || '[]');
    const recs = JSON.parse(localStorage.getItem('recent_molecules') || '[]');
    setFavorites(favs);
    setRecent(recs);
  }, []);

  const removeFavorite = (formula: string) => {
    const newFavs = favorites.filter((f: any) => (typeof f === 'string' ? f : f.formula) !== formula);
    localStorage.setItem('favorite_molecules_v2', JSON.stringify(newFavs));
    setFavorites(newFavs);
  };

  const clearRecent = () => {
    localStorage.setItem('recent_molecules', '[]');
    setRecent([]);
  };

  return (
    <div className="h-full flex flex-col p-8 bg-white dark:bg-[#0B0E14] overflow-y-auto scrollbar-hide transition-colors duration-300">
      <section className="mb-16">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
              <Heart size={24} className="fill-current" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Saved Compounds</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{favorites.length} Entries Archived</p>
            </div>
          </div>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((fav: any) => {
              const formula = typeof fav === 'string' ? fav : fav.formula;
              const name = typeof fav === 'string' ? fav : fav.name;
              const cid = typeof fav === 'string' ? null : fav.cid;
              
              return (
                <MoleculeCard 
                  key={formula} 
                  formula={formula} 
                  name={name}
                  cid={cid}
                  onSelect={() => onSelect(formula)} 
                  onRemove={() => removeFavorite(formula)}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center bg-slate-50 dark:bg-[#161B22]/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Heart size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-1">No Saved Compounds</h3>
            <p className="text-slate-500 dark:text-slate-600 text-sm">Molecules you save will appear in this collection.</p>
          </div>
        )}
      </section>

      <section className="pb-12">
        <div className="flex items-center justify-between mb-8 pt-12 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-700">
              <FlaskConical size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Recent Explorations</h2>
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
              className="px-6 py-4 bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl font-bold flex items-center gap-4 hover:border-blue-500 hover:text-slate-900 dark:hover:text-white group transition-all shadow-sm"
            >
              <span className="text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors">{formatFormula(rec)}</span>
              <ArrowRight size={16} className="text-slate-300 dark:text-slate-700 group-hover:text-slate-400 transition-colors" />
            </button>
          ))}
          {recent.length === 0 && (
            <p className="text-slate-400 dark:text-slate-600 text-sm font-medium italic">Terminal history is currently empty.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function MoleculeCard({ formula, name, cid, onSelect, onRemove }: { formula: string, name: string, cid: number | null, onSelect: () => void, onRemove: () => void }) {
  return (
    <div className="group bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight truncate max-w-[150px]">
            {name}
          </h3>
          <p className="text-blue-600 dark:text-blue-400 font-mono text-sm font-bold">{formatFormula(formula)}</p>
        </div>
        <button 
          onClick={onRemove}
          className="p-2 text-slate-400 dark:text-slate-700 hover:text-red-500 transition-colors bg-white dark:bg-[#0B0E14] rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="flex-1 min-h-[160px] bg-white rounded-2xl p-4 mb-5 flex items-center justify-center relative overflow-hidden group/thumb shadow-inner">
        {cid ? (
          <img 
            src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`} 
            alt={name}
            className="max-w-full max-h-full object-contain mix-blend-multiply group-hover/thumb:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <FlaskConical size={32} className="text-slate-100 dark:text-slate-200" />
        )}
        <div className="absolute inset-0 bg-blue-600/0 group-hover/thumb:bg-blue-600/5 transition-colors" />
      </div>

      <button 
        onClick={onSelect}
        className="w-full py-3.5 bg-white dark:bg-[#0B0E14] text-slate-500 dark:text-slate-400 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all border border-slate-200 dark:border-slate-800 hover:border-blue-600 shadow-sm flex items-center justify-center gap-2"
      >
        <span>Analyze Structure</span>
        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}
