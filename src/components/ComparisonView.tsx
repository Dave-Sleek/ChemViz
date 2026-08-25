import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type MoleculeData } from '../types';
import { formatFormula } from '../utils/formulaParser';
import { Table, ArrowRight, ArrowLeftRight, X } from 'lucide-react';

interface ComparisonViewProps {
  currentMolecule: MoleculeData;
  history: MoleculeData[];
  onClose: () => void;
}

export function ComparisonView({ currentMolecule, history, onClose }: ComparisonViewProps) {
  const [compareWith, setCompareWith] = useState<MoleculeData | null>(null);

  const filteredHistory = history.filter(m => m.formula !== currentMolecule.formula);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-40 bg-[#0B0E14] p-8 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <ArrowLeftRight size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Molecule Comparison</h2>
              <p className="text-slate-500 text-sm">Analyze physical and structural differences side-by-side</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors bg-[#161B22] rounded-full border border-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Molecule 1 (Current) */}
          <div className="p-6 bg-[#161B22] border border-blue-500/20 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Table size={64} />
            </div>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Primary Target</span>
            <h3 className="text-xl font-black text-white mb-1">{currentMolecule.name}</h3>
            <p className="text-blue-400 font-mono font-bold mb-6">{formatFormula(currentMolecule.formula)}</p>
            
            <div className="space-y-3">
              <ComparisonRow label="Molecular Weight" value={`${currentMolecule.molecularWeight} g/mol`} />
              <ComparisonRow label="Exact Mass" value={`${currentMolecule.properties.ExactMass || currentMolecule.molecularWeight} g/mol`} />
              <ComparisonRow label="Complexity" value={currentMolecule.properties.Complexity || 'N/A'} />
              <ComparisonRow label="H-Bond Donors" value={currentMolecule.properties.HBondDonorCount || 0} />
            </div>
          </div>

          {/* Molecule 2 (Selection) */}
          <div className="p-6 bg-[#161B22] border border-slate-800 rounded-3xl shadow-xl">
            {compareWith ? (
              <div className="relative group h-full">
                <button 
                  onClick={() => setCompareWith(null)}
                  className="absolute top-0 right-0 p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Comparator</span>
                <h3 className="text-xl font-black text-white mb-1">{compareWith.name}</h3>
                <p className="text-blue-400 font-mono font-bold mb-6">{formatFormula(compareWith.formula)}</p>
                
                <div className="space-y-3">
                  <ComparisonRow 
                    label="Molecular Weight" 
                    value={`${compareWith.molecularWeight} g/mol`} 
                    diff={compareWith.molecularWeight - currentMolecule.molecularWeight}
                  />
                  <ComparisonRow 
                    label="Exact Mass" 
                    value={`${compareWith.properties.ExactMass || compareWith.molecularWeight} g/mol`} 
                  />
                  <ComparisonRow label="Complexity" value={compareWith.properties.Complexity || 'N/A'} />
                  <ComparisonRow label="H-Bond Donors" value={compareWith.properties.HBondDonorCount || 0} />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-500 text-sm mb-4 font-bold">Select a molecule from your history to start comparison</p>
                <div className="flex flex-wrap justify-center gap-2 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
                  {filteredHistory.length > 0 ? filteredHistory.map((m, i) => (
                    <button
                      key={`${m.formula}-${i}`}
                      onClick={() => setCompareWith(m)}
                      className="px-4 py-2 bg-[#0B0E14] border border-slate-700 rounded-lg text-xs font-bold text-slate-300 hover:border-blue-500 hover:text-white transition-all whitespace-nowrap"
                    >
                      {formatFormula(m.formula)}
                    </button>
                  )) : (
                    <p className="text-xs text-slate-600">No other molecules in session history yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {compareWith && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6"
          >
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Molar Weight Delta Analysis</h4>
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <p className="text-sm text-slate-300 leading-relaxed">
                  The weight difference between these compounds is <span className="text-white font-bold">{Math.abs(compareWith.molecularWeight - currentMolecule.molecularWeight).toFixed(3)} g/mol</span>. 
                  {compareWith.molecularWeight > currentMolecule.molecularWeight 
                    ? ` ${compareWith.name} is the heavier variant.` 
                    : ` ${currentMolecule.name} is the heavier variant.`}
                </p>
              </div>
              <div className="shrink-0 text-3xl font-black text-white">
                {((Math.abs(compareWith.molecularWeight - currentMolecule.molecularWeight) / currentMolecule.molecularWeight) * 100).toFixed(1)}%
                <span className="text-xs text-blue-400 block mt-1 font-bold">Variance</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function ComparisonRow({ label, value, diff }: { label: string, value: string | number, diff?: number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      <div className="text-right">
        <span className="text-sm font-black text-slate-200">{value}</span>
        {diff !== undefined && diff !== 0 && (
          <span className={`block text-[10px] font-bold ${diff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
