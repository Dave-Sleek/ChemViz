import React from 'react';
import { Search, FlaskConical, Beaker, Atom, Microscope, Calculator } from 'lucide-react';
import { motion } from 'motion/react';
import { formatFormula } from '../utils/formulaParser';

interface HomeProps {
  onSearch: (query: string) => void;
  loading: boolean;
  error: string | null;
}

const EXAMPLES = ['H2O', 'CO2', 'CH4', 'NH3', 'NaCl', 'C6H12O6', 'H2SO4', 'CaCO3'];

export function Home({ onSearch, loading, error }: HomeProps) {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full text-center max-w-4xl mx-auto py-20 px-6 bg-[#0B0E14]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-10 p-8 bg-blue-500/10 rounded-3xl border border-blue-500/20 shadow-2xl shadow-blue-500/10"
      >
        <FlaskConical className="w-20 h-20 text-blue-500" />
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-8xl font-black tracking-tight mb-8 text-white leading-tight"
      >
        See Chemistry <span className="text-blue-500">Come to Life</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg md:text-2xl text-slate-400 mb-12 max-w-2xl font-light"
      >
        Explore the invisible world of molecules through high-fidelity 3D visualization and real-time scientific data.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl mb-16"
      >
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a formula (e.g. C6H12O6)..."
            className="w-full text-lg md:text-xl bg-[#161B22] border-2 border-slate-700 rounded-2xl py-6 pl-8 pr-16 shadow-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-white placeholder:text-slate-600"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search size={28} />
            )}
          </button>
        </form>
        {error && (
          <p className="mt-4 text-red-400 text-sm font-bold tracking-tight">{error}</p>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <span className="block text-[10px] text-slate-500 mb-4 font-black uppercase tracking-[0.3em]">Trending Molecules</span>
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar sm:flex-wrap sm:justify-center">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onSearch(ex)}
              className="whitespace-nowrap px-6 py-3 bg-[#0D1117] border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:border-blue-500 hover:text-white transition-all shadow-sm shrink-0"
            >
              {formatFormula(ex)}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

