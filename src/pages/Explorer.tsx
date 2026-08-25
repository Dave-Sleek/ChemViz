import { 
  FlaskConical, 
  Info, 
  Settings, 
  ChevronRight, 
  History, 
  Share2, 
  Microscope,
  AlertCircle,
  Calculator,
  Download,
  Camera,
  RotateCcw,
  Box,
  Maximize2,
  X,
  GripHorizontal,
  Heart,
  ArrowLeftRight,
  Sparkles,
  Menu
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { generateMoleculeReport } from '../utils/report';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Molecule3D, type Molecule3DHandle } from '../components/Molecule3D';
import { ComparisonView } from '../components/ComparisonView';
import { ReactionSimulator } from '../components/ReactionSimulator';
import { type MoleculeData, type ViewType } from '../types';
import { formatFormula } from '../utils/formulaParser';

interface ExplorerProps {
  molecule: MoleculeData | null;
  loading: boolean;
  error: string | null;
  onSearch: (query: string) => void;
}

export function Explorer({ molecule, loading, error, onSearch }: ExplorerProps) {
  const [activeTab, setActiveTab] = useState<'3d' | '2d' | 'data'>('3d');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBondLengths, setShowBondLengths] = useState(false);
  const [showBondAngles, setShowBondAngles] = useState(false);
  const [projection, setProjection] = useState<'perspective' | 'orthographic'>('perspective');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [showReactionSim, setShowReactionSim] = useState(false);
  const [moleculeHistory, setMoleculeHistory] = useState<MoleculeData[]>([]);
  
  // Unit Converter State
  const [calcMass, setCalcMass] = useState<string>('');
  const [calcMoles, setCalcMoles] = useState<string>('');
  const [calcDirection, setCalcDirection] = useState<'mass-to-moles' | 'moles-to-mass'>('mass-to-moles');
  
  const molecule3DRef = useRef<Molecule3DHandle>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    if (molecule) {
      const favorites = JSON.parse(localStorage.getItem('favorite_molecules_v2') || '[]');
      setIsFavorite(favorites.some((f: any) => f.formula === molecule.formula));

      // Update history
      setMoleculeHistory(prev => {
        if (prev.some(m => m.formula === molecule.formula)) return prev;
        const newHistory = [molecule, ...prev].slice(0, 10);
        return newHistory;
      });
    }
  }, [molecule]);

  // Handle mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleFavorite = () => {
    if (!molecule) return;
    const favorites = JSON.parse(localStorage.getItem('favorite_molecules_v2') || '[]');
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((f: any) => f.formula !== molecule.formula);
    } else {
      newFavorites = [...favorites, { 
        formula: molecule.formula, 
        name: molecule.name, 
        cid: molecule.cid,
        weight: molecule.molecularWeight 
      }];
    }
    localStorage.setItem('favorite_molecules_v2', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0B0E14] text-slate-400">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <FlaskConical size={48} className="text-blue-500" />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Analyzing Compound...</h2>
        <p className="text-sm opacity-60">Synthesizing 3D structures and physical properties</p>
      </div>
    );
  }

  if (error || !molecule) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0B0E14] text-slate-400 px-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-6 opacity-50" />
        <h2 className="text-xl font-bold mb-2 text-white">Analysis Failed</h2>
        <p className="text-sm opacity-60 max-w-md mb-8">{error || 'The molecule structure could not be retrieved from the scientific database.'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
        >
          Return to Terminal
        </button>
      </div>
    );
  }

  const handleSnapshot = () => {
    if (molecule3DRef.current) {
      molecule3DRef.current.takeSnapshot();
    }
  };

  const handleResetCamera = () => {
    if (molecule3DRef.current) {
      molecule3DRef.current.resetCamera();
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#0B0E14] relative overflow-hidden">
      {/* Sidebar Toggle (Desktop & Mobile) */}
      {!isSidebarOpen && (
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-6 left-6 z-40 p-3 bg-[#161B22]/80 backdrop-blur-md border border-white/10 rounded-xl text-white shadow-2xl hover:bg-[#1C2128] transition-all"
        >
          <Menu size={20} />
        </motion.button>
      )}

      {/* Sidebar - Molecule Info */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            className="fixed lg:relative inset-y-0 left-0 w-80 bg-[#161B22] border-r border-slate-800 flex flex-col shrink-0 z-40 lg:z-20 shadow-2xl lg:shadow-none"
          >
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20">
                    <FlaskConical size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Compound Explorer</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors bg-[#0B0E14] rounded-lg border border-slate-800/50"
                >
                  <X size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight mb-1">{molecule.name}</h2>
              <p className="text-blue-400 font-mono font-bold text-lg mb-4">{formatFormula(molecule.formula)}</p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#0B0E14] rounded-xl border border-slate-800">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Molar Mass</p>
                  <p className="text-xs font-black text-slate-200">{molecule.molecularWeight} <span className="text-[10px] font-medium opacity-60">g/mol</span></p>
                </div>
                <div className="p-3 bg-[#0B0E14] rounded-xl border border-slate-800">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Charge</p>
                  <p className="text-xs font-black text-slate-200">{molecule.properties.Charge || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section>
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info size={12} /> Chemical Summary
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed italic">
                  "{molecule.description || 'No detailed scientific description available for this compound in the current session logs.'}"
                </p>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calculator size={12} /> Unit Converter
                </h3>
                <div className="p-4 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between gap-2 p-1 bg-slate-900 rounded-lg">
                    <button 
                      onClick={() => setCalcDirection('mass-to-moles')}
                      className={`flex-1 text-[9px] font-black py-1.5 rounded-md transition-all ${calcDirection === 'mass-to-moles' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                    >
                      MASS → MOLES
                    </button>
                    <button 
                      onClick={() => setCalcDirection('moles-to-mass')}
                      className={`flex-1 text-[9px] font-black py-1.5 rounded-md transition-all ${calcDirection === 'moles-to-mass' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                    >
                      MOLES → MASS
                    </button>
                  </div>

                  <div className="space-y-3">
                    {calcDirection === 'mass-to-moles' ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Input Mass (g)</label>
                          <input 
                            type="number"
                            value={calcMass}
                            onChange={(e) => {
                              setCalcMass(e.target.value);
                              const moles = parseFloat(e.target.value) / molecule.molecularWeight;
                              setCalcMoles(isNaN(moles) ? '' : moles.toFixed(4));
                            }}
                            className="w-full bg-[#161B22] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500">Result:</span>
                          <span className="text-xs font-black text-blue-400">{calcMoles || '0.0000'} <span className="text-[9px] font-medium opacity-60">mol</span></span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Input Moles (mol)</label>
                          <input 
                            type="number"
                            value={calcMoles}
                            onChange={(e) => {
                              setCalcMoles(e.target.value);
                              const mass = parseFloat(e.target.value) * molecule.molecularWeight;
                              setCalcMass(isNaN(mass) ? '' : mass.toFixed(4));
                            }}
                            className="w-full bg-[#161B22] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500">Result:</span>
                          <span className="text-xs font-black text-emerald-400">{calcMass || '0.0000'} <span className="text-[9px] font-medium opacity-60">g</span></span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <History size={12} /> Advanced Labs
                </h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setShowComparison(true)}
                    className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm font-bold py-2.5 rounded-lg transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <ArrowLeftRight size={16} className="text-blue-400" />
                    Weight Comparison
                  </button>
                  <button 
                    onClick={() => setShowReactionSim(true)}
                    className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm font-bold py-2.5 rounded-lg transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} className="text-emerald-400" />
                    Reaction Simulator
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Settings size={12} /> Quick Actions
                </h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setIsPropertiesOpen(true)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold py-2.5 rounded-lg transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <Settings size={16} />
                    Detailed Properties
                  </button>
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
                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                        : 'text-slate-400 hover:text-white border-slate-800'
                    } flex items-center justify-center gap-2`}
                  >
                    <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                    {isFavorite ? 'Remove from Saved' : 'Save Compound'}
                  </button>
                </div>
              </section>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main View Area */}
      <section className="flex-1 flex flex-col relative h-full">
        {/* Comparison & Reaction Overlays */}
        <AnimatePresence>
          {showComparison && (
            <ComparisonView 
              currentMolecule={molecule} 
              history={moleculeHistory} 
              onClose={() => setShowComparison(false)} 
            />
          )}
          {showReactionSim && (
            <ReactionSimulator 
              initialFormula={molecule.formula} 
              onClose={() => setShowReactionSim(false)} 
            />
          )}
        </AnimatePresence>
        {/* View Tabs */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#161B22]/80 backdrop-blur-md p-1 rounded-xl border border-white/5 flex items-center gap-1 z-30 shadow-2xl">
          {[
            { id: '3d', label: '3D Structure', icon: <Box size={14} /> },
            { id: '2d', label: '2D Schema', icon: <Share2 size={14} /> },
            { id: 'data', label: 'Analytics', icon: <Calculator size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3D Visualization Control Panel */}
        {activeTab === '3d' && (
          <>
            <div className="absolute top-24 left-6 flex flex-col gap-2 z-30">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-[#161B22]/90 backdrop-blur-md p-3 rounded-2xl border border-white/5 shadow-2xl flex flex-col gap-3"
              >
                <div className="pb-2 border-b border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">3D Controls</span>
                </div>
                
                <ToggleButton 
                  active={showBondLengths} 
                  onClick={() => setShowBondLengths(!showBondLengths)}
                  label="Bond Lengths"
                />
                <ToggleButton 
                  active={showBondAngles} 
                  onClick={() => setShowBondAngles(!showBondAngles)}
                  label="Bond Angles"
                />
                <ToggleButton 
                  active={autoRotate} 
                  onClick={() => setAutoRotate(!autoRotate)}
                  label="Auto Rotation"
                />
                
                <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                  <button 
                    onClick={() => setProjection(p => p === 'perspective' ? 'orthographic' : 'perspective')}
                    className="flex items-center justify-between gap-4 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-[10px] font-bold text-slate-300"
                  >
                    Projection: {projection === 'perspective' ? 'Persp' : 'Ortho'}
                    <Maximize2 size={12} />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleResetCamera}
                      className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                      title="Reset Camera"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button 
                      onClick={handleSnapshot}
                      className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
                      title="Take Snapshot"
                    >
                      <Camera size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Interactive Visual Legend */}
            <VisualLegend molecule={molecule} />
          </>
        )}

        <div className="flex-1 relative overflow-hidden">
          {activeTab === '3d' ? (
            molecule.structure3d ? (
              <div className="absolute inset-0">
                <Molecule3D 
                  ref={molecule3DRef}
                  structure={molecule.structure3d} 
                  autoRotate={autoRotate}
                  showBondLengths={showBondLengths}
                  showBondAngles={showBondAngles}
                  projection={projection}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400 bg-[#0B0E14] overflow-y-auto">
                <div className="max-w-md w-full text-center space-y-8">
                  <div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-block p-4 bg-orange-500/10 text-orange-500 rounded-2xl mb-4"
                    >
                      <FlaskConical size={32} />
                    </motion.div>
                    <h3 className="text-xl font-black text-white">3D Dataset Not Available</h3>
                    <p className="text-sm opacity-60">This compound lacks a verified 3D conformer record in the PubChem repository.</p>
                  </div>

                  {molecule.cid && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-[#161B22] p-8 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden group"
                    >
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 block">Structural 2D Representation</span>
                      <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-white rounded-3xl p-4 flex items-center justify-center shadow-inner">
                        <img 
                          src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${molecule.cid}/PNG`} 
                          alt={molecule.name}
                          className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-slate-600 uppercase mb-2">Canonical SMILES</span>
                        <p className="text-xs font-mono text-slate-400 break-all bg-[#0B0E14] p-3 rounded-xl border border-slate-800/50 w-full">
                          {molecule.smiles || 'Data unavailable'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )
          ) : activeTab === '2d' ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-[#0B0E14]">
              <Share2 size={48} className="mb-4 opacity-10" />
              <p className="text-sm font-bold uppercase tracking-widest opacity-40">2D Schema Engine Offline</p>
              <p className="text-[10px] mt-2 max-w-xs text-center opacity-30">The PUG REST API record for this CID does not contain valid SVG or static layout nodes.</p>
            </div>
          ) : (
            <div className="h-full p-8 overflow-y-auto bg-[#0B0E14]">
              <div className="max-w-2xl mx-auto space-y-8 pt-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(molecule.properties).map(([key, value]) => (
                    <div key={key} className="p-4 bg-[#161B22] border border-slate-800 rounded-2xl flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm font-bold text-slate-200">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interaction Strip */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#161B22]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 z-30 shadow-2xl">
          <div className="flex items-center gap-2 pr-4 border-r border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Terminal</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleSnapshot}
               className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] px-4 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
             >
               <Camera size={14} />
               Capture Snapshot
             </button>
             <button 
               onClick={() => generateMoleculeReport(molecule)}
               className="bg-slate-700 hover:bg-slate-600 text-white text-[11px] px-4 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2"
             >
               <Download size={14} />
               Export JSON
             </button>
          </div>
        </div>
      </section>

      {/* Draggable Properties Panel */}
      <AnimatePresence>
        {isPropertiesOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#161B22] border-l border-slate-800 z-50 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.4)]"
            drag="x"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ left: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) setIsPropertiesOpen(false);
            }}
          >
            <div 
              className="h-10 w-full flex items-center justify-center border-b border-slate-800 cursor-grab active:cursor-grabbing text-slate-700 hover:text-slate-500 transition-colors"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <GripHorizontal size={24} />
            </div>

            <div className="p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                  <Calculator size={18} />
                </div>
                <h3 className="text-lg font-black text-white">Physical Metrics</h3>
              </div>
              <button 
                onClick={() => setIsPropertiesOpen(false)}
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section className="space-y-4">
                <div className="p-4 bg-[#0B0E14] rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">IUPAC Designation</p>
                  <p className="text-sm font-bold text-slate-200 leading-relaxed">{molecule.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="Molecular Weight" value={`${molecule.molecularWeight} g/mol`} />
                  <MetricCard label="Exact Mass" value={`${molecule.properties.ExactMass || molecule.molecularWeight} g/mol`} />
                  <MetricCard label="H-Bond Donors" value={molecule.properties.HBondDonorCount || 0} />
                  <MetricCard label="H-Bond Acceptors" value={molecule.properties.HBondAcceptorCount || 0} />
                  <MetricCard label="Rotatable Bonds" value={molecule.properties.RotatableBondCount || 0} />
                  <MetricCard label="Complexity" value={molecule.properties.Complexity || 'N/A'} />
                </div>
              </section>

              <section className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertCircle size={12} /> Scientific Metadata
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">PubChem CID</span>
                    <span className="text-slate-300 font-mono">{molecule.cid || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Isomeric SMILES</span>
                    <span className="text-slate-300 font-mono truncate max-w-[150px]" title={molecule.smiles}>{molecule.smiles || 'N/A'}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-slate-800 bg-[#0B0E14]/50">
              <button 
                onClick={() => generateMoleculeReport(molecule)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Generate Dataset PDF
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { getElementColor } from '../utils/chemistry';

function VisualLegend({ molecule }: { molecule: MoleculeData }) {
  // Extract unique elements from the molecule
  const uniqueElements = Array.from(new Set(molecule.elements.map(e => e.symbol)));

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-24 right-6 z-30 flex flex-col gap-2"
    >
      <div className="bg-[#161B22]/90 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-2xl min-w-[120px]">
        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-white/5">Element Legend</h4>
        <div className="space-y-3">
          {uniqueElements.map(symbol => {
            const color = getElementColor(symbol);
            return (
              <div key={symbol} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}40`
                  }}
                />
                <span className="text-[10px] font-black text-slate-300">{symbol}</span>
                <span className="text-[8px] font-medium text-slate-600 uppercase ml-auto">
                  {molecule.elements.find(e => e.symbol === symbol)?.count}x
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function ToggleButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-between gap-4 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors group"
    >
      <span className="text-[10px] font-bold text-slate-300">{label}</span>
      <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-slate-600'}`}>
        <motion.div 
          animate={{ x: active ? 16 : 2 }}
          initial={false}
          className="absolute top-1 left-0 w-2 h-2 bg-white rounded-full shadow-sm"
        />
      </div>
    </button>
  );
}

function MetricCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="p-3 bg-[#0B0E14] rounded-xl border border-slate-800">
      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">{label}</p>
      <p className="text-xs font-black text-slate-200">{value}</p>
    </div>
  );
}
