import { motion } from 'motion/react';
import { type MoleculeData } from '../types';
import { Molecule3D } from '../components/Molecule3D';
import { formatFormula } from '../utils/formulaParser';
import { getElement } from '../data/elements';
import { calculatePercentageComposition, getElementColor } from '../utils/chemistry';
import { 
  Info, 
  Weight, 
  Layers, 
  Activity, 
  ChevronDown, 
  Star, 
  Share2, 
  Microscope,
  AlertCircle,
  Calculator,
  Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateMoleculeReport } from '../utils/report';

interface ExplorerProps {
  molecule: MoleculeData | null;
  loading: boolean;
  error: string | null;
  onSearch: (query: string) => void;
}

export function Explorer({ molecule, loading, error, onSearch }: ExplorerProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [activeTab, setActiveTab] = useState<'3d' | 'lewis'>('3d');

  useEffect(() => {
    if (molecule) {
      const favorites = JSON.parse(localStorage.getItem('favorite_molecules') || '[]');
      setIsFavorite(favorites.includes(molecule.formula));
    }
  }, [molecule]);

  const toggleFavorite = () => {
    if (!molecule) return;
    const favorites = JSON.parse(localStorage.getItem('favorite_molecules') || '[]');
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((f: string) => f !== molecule.formula);
    } else {
      newFavorites = [...favorites, molecule.formula];
    }
    localStorage.setItem('favorite_molecules', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0B0E14]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-6 text-slate-500 text-sm font-medium tracking-widest uppercase">Analyzing Molecular Structure</p>
      </div>
    );
  }

  if (error || !molecule) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-[#0B0E14]">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mb-6 border border-red-500/20">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Molecular Analysis Failed</h2>
        <p className="text-slate-500 max-w-md mb-8">
          {error || "We couldn't retrieve information for this compound."}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors border border-slate-700"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  const composition = calculatePercentageComposition(molecule.elements);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[320px] bg-[#0D1117] border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 scrollbar-hide">
        <section>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-white leading-tight">{molecule.name === 'Unknown Compound' ? molecule.formula : molecule.name}</h2>
            {molecule.cid && (
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-blue-500/20">
                CID: {molecule.cid}
              </span>
            )}
          </div>
          <p className="text-4xl font-light text-slate-300 tracking-wide break-all">
            {formatFormula(molecule.formula)}
          </p>
          {molecule.description && (
            <p className="text-xs text-slate-500 mt-3 leading-relaxed italic line-clamp-4">
              {molecule.description}
            </p>
          )}
        </section>

        <div className="h-px bg-slate-800" />

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Molecular Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#161B22] p-3 rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Molar Mass</p>
              <p className="text-lg font-semibold text-blue-400 truncate">
                {molecule.molecularWeight.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">g/mol</span>
              </p>
            </div>
            <div className="bg-[#161B22] p-3 rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Charge</p>
              <p className="text-lg font-semibold text-emerald-400">{molecule.properties.Charge ?? 0}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Composition</h3>
          <div className="space-y-4">
            {composition.map((c) => (
              <div key={c.symbol}>
                <div className="flex justify-between text-[11px] mb-1.5 text-slate-400">
                  <span>{getElement(c.symbol)?.name || c.symbol} ({molecule.elements.find(e => e.symbol === c.symbol)?.count})</span>
                  <span className="font-mono text-slate-200">{c.percentage.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percentage}%` }}
                    className="h-full"
                    style={{ backgroundColor: getElementColor(c.symbol) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Properties</h3>
          <div className="space-y-2">
            <PropItem label="Exact Mass" value={molecule.properties.ExactMass?.toFixed(4)} />
            <PropItem label="H-Bond Donors" value={molecule.properties.HBondDonorCount} />
            <PropItem label="H-Bond Acceptors" value={molecule.properties.HBondAcceptorCount} />
            <PropItem label="Complexity" value={molecule.properties.Complexity} />
          </div>
        </section>

        <div className="mt-auto pt-4 flex flex-col gap-2">
          <button 
            onClick={() => generateMoleculeReport(molecule)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Download Report
          </button>
          <button 
            onClick={toggleFavorite}
            className={`w-full text-sm font-medium py-2 rounded-lg transition-colors border ${
              isFavorite 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20' 
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            {isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
          </button>
          <button 
            onClick={() => setShowCalculation(!showCalculation)}
            className="w-full text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest py-2 transition-colors"
          >
            {showCalculation ? 'Hide Calculation' : 'Show Molar Calculation'}
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <section className="flex-1 flex flex-col relative bg-[#0B0E14]">
        <div className="absolute top-6 left-6 z-10 flex gap-2">
          <button 
            onClick={() => setActiveTab('3d')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all border ${
              activeTab === '3d' 
                ? 'bg-[#161B22]/80 backdrop-blur border-slate-600 text-white shadow-xl' 
                : 'bg-slate-800/40 backdrop-blur border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            3D Model
          </button>
          <button 
            onClick={() => setActiveTab('lewis')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all border ${
              activeTab === 'lewis' 
                ? 'bg-[#161B22]/80 backdrop-blur border-slate-600 text-white shadow-xl' 
                : 'bg-slate-800/40 backdrop-blur border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            Lewis Structure
          </button>
        </div>

        <div className="flex-1 relative overflow-hidden">
          {activeTab === '3d' ? (
            molecule.structure3d ? (
              <div className="absolute inset-0">
                <Molecule3D structure={molecule.structure3d} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-[#0B0E14]">
                <Microscope size={48} className="mb-4 opacity-10" />
                <p className="text-sm font-medium tracking-widest uppercase opacity-30">3D Structure Unavailable</p>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-[#0B0E14] p-12">
              <div className="max-w-2xl w-full aspect-video bg-[#161B22]/40 rounded-3xl border border-slate-800 border-dashed flex flex-col items-center justify-center">
                 <p className="text-slate-400 font-mono text-xl mb-4">{formatFormula(molecule.formula)}</p>
                 <p className="text-xs text-slate-600 italic">2D Lewis Visualization coming soon in Engine v4.3</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Elements Strip */}
        <div className="h-24 bg-[#161B22]/50 border-t border-slate-800 p-4 flex gap-4 overflow-x-auto items-center px-8 scrollbar-hide shrink-0">
          {molecule.elements.map(el => (
            <div key={el.symbol} className="flex-shrink-0 bg-[#0D1117] border border-slate-700 p-3 rounded-lg flex gap-3 items-center min-w-[160px]">
              <div 
                className="w-10 h-10 rounded flex items-center justify-center font-bold text-white shadow-inner"
                style={{ backgroundColor: getElementColor(el.symbol) }}
              >
                {el.symbol}
              </div>
              <div>
                <p className="text-xs font-bold leading-none mb-1 text-slate-200">{getElement(el.symbol)?.name || el.symbol}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                  {getElement(el.symbol)?.category || 'Element'} • {el.count} Atom(s)
                </p>
              </div>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-3">
             <button 
               onClick={() => generateMoleculeReport(molecule)}
               className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] px-4 py-2 rounded font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
             >
               <Download size={14} />
               Download PDF
             </button>
             <button className="bg-slate-700 hover:bg-slate-600 text-white text-[11px] px-4 py-2 rounded font-bold transition-all">Export JSON</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PropItem({ label, value }: { label: string, value: any }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-800/50 last:border-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
      <span className="text-xs font-mono text-slate-300">{value ?? '—'}</span>
    </div>
  );
}
