import React, { useState, useEffect } from 'react';
import { type ViewType, type MoleculeData } from './types';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Explorer } from './pages/Explorer';
import { PeriodicTable } from './pages/PeriodicTable';
import { Quiz } from './pages/Quiz';
import { Favorites } from './pages/Favorites';
import { fetchMoleculeByFormula } from './services/pubchem';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [view, setView] = useState<ViewType>('home');
  const [currentMolecule, setCurrentMolecule] = useState<MoleculeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'light' | 'dark') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMoleculeByFormula(query);
      if (data) {
        setCurrentMolecule(data);
        setView('explorer');
        // Save to recent
        const recent = JSON.parse(localStorage.getItem('recent_molecules') || '[]');
        const newRecent = [data.formula, ...recent.filter((f: string) => f !== data.formula)].slice(0, 10);
        localStorage.setItem('recent_molecules', JSON.stringify(newRecent));
      } else {
        setError("We couldn't recognize that formula. Try something like H₂O, CO₂, or NaCl.");
      }
    } catch (e) {
      setError("An error occurred while fetching the molecule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0E14] text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      <Navbar view={view} setView={setView} toggleTheme={toggleTheme} theme={theme} onSearch={handleSearch} />
      
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {view === 'home' && <Home onSearch={handleSearch} loading={loading} error={error} />}
            {view === 'explorer' && (
              <Explorer 
                molecule={currentMolecule} 
                loading={loading} 
                error={error} 
                onSearch={handleSearch}
              />
            )}
            {view === 'table' && <PeriodicTable />}
            {view === 'quiz' && <Quiz />}
            {view === 'favorites' && <Favorites onSelect={handleSearch} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="h-8 bg-[#0D1117] border-t border-slate-800 px-6 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ready</span>
          <span>Engine: v4.2.1-Scientific</span>
          <span>Data Source: PubChem API</span>
        </div>
        <div className="flex gap-4">
          <span>© 2026 ChemViz — Visual Chemistry Education</span>
          <span className="text-blue-500 cursor-pointer hover:text-blue-400 transition-colors">Help & Documentation</span>
        </div>
      </footer>
    </div>
  );
}
