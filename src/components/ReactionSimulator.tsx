import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FlaskConical, Play, RefreshCw, AlertCircle, CheckCircle2, ChevronRight, X, Sparkles } from 'lucide-react';
import { formatFormula } from '../utils/formulaParser';

interface ReactionResult {
  possible: boolean;
  equation: string;
  summary: string;
  steps: string[];
  conditions: string;
  danger: string;
}

interface ReactionSimulatorProps {
  initialFormula?: string;
  onClose: () => void;
}

export function ReactionSimulator({ initialFormula, onClose }: ReactionSimulatorProps) {
  const [formula1, setFormula1] = useState(initialFormula || '');
  const [formula2, setFormula2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReactionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateReaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formula1 || !formula2) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/reactions/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formula1, formula2 }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to simulate reaction');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-40 bg-[#0B0E14] p-8 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <FlaskConical size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Reaction Simulator</h2>
              <p className="text-slate-500 text-sm">AI-powered chemical interaction analysis</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors bg-[#161B22] rounded-full border border-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={simulateReaction} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-12">
          <div className="md:col-span-2">
            <input 
              type="text" 
              value={formula1}
              onChange={(e) => setFormula1(e.target.value)}
              placeholder="Formula 1 (e.g. HCl)"
              className="w-full bg-[#161B22] border-2 border-slate-800 rounded-2xl py-4 px-6 text-white font-bold placeholder:text-slate-600 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex justify-center md:col-span-1">
            <div className="p-3 bg-slate-800/50 rounded-full text-slate-400">
              <RefreshCw size={20} />
            </div>
          </div>
          <div className="md:col-span-2">
            <input 
              type="text" 
              value={formula2}
              onChange={(e) => setFormula2(e.target.value)}
              placeholder="Formula 2 (e.g. NaOH)"
              className="w-full bg-[#161B22] border-2 border-slate-800 rounded-2xl py-4 px-6 text-white font-bold placeholder:text-slate-600 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="md:col-span-5 flex justify-center mt-4">
            <button 
              disabled={loading || !formula1 || !formula2}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-600/30 flex items-center gap-3"
            >
              {loading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
              {loading ? 'Synthesizing...' : 'Calculate Potential Outcome'}
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-slate-400"
            >
              <div className="relative w-20 h-20 mb-6">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-500 rounded-full blur-2xl"
                />
                <FlaskConical size={80} className="relative z-10 text-blue-500" />
              </div>
              <p className="text-lg font-bold animate-pulse text-white">Running Quantum Simulation</p>
              <p className="text-sm opacity-60 mt-2">Gemini AI is analyzing valence electrons and thermodynamic stability...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4"
            >
              <AlertCircle className="text-red-500 shrink-0" />
              <div>
                <h4 className="text-red-400 font-bold mb-1">Simulation Error</h4>
                <p className="text-sm text-red-400/80">{error}</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {result.possible ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <CheckCircle2 size={120} />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Reaction Likely</span>
                    <span className="text-slate-400 text-xs font-bold font-mono">{result.conditions}</span>
                  </div>

                  <h3 className="text-3xl font-black text-white mb-4 font-mono">{result.equation}</h3>
                  <p className="text-slate-300 leading-relaxed mb-8 text-lg max-w-2xl">{result.summary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ChevronRight size={12} className="text-emerald-500" /> Reaction Mechanism
                      </h4>
                      <div className="space-y-4">
                        {result.steps.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <span className="text-emerald-500 font-mono font-bold">0{i+1}</span>
                            <p className="text-sm text-slate-400 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {result.danger && (
                      <div className="p-6 bg-[#0B0E14] border border-orange-500/20 rounded-2xl">
                        <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <AlertCircle size={14} /> Laboratory Safety
                        </h4>
                        <p className="text-sm text-orange-400/80 leading-relaxed font-bold">{result.danger}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/20 border border-slate-700 rounded-3xl p-10 text-center">
                  <FlaskConical size={64} className="text-slate-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-black text-white mb-2">No Spontaneous Interaction Detected</h3>
                  <p className="text-slate-400 max-w-md mx-auto">Gemini AI predicts these compounds are chemically inert relative to each other under standard conditions.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
