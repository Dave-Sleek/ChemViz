import { motion, AnimatePresence } from 'motion/react';
import { elements } from '../data/elements';
import { useState } from 'react';
import { X } from 'lucide-react';
import { getElementColor } from '../utils/chemistry';

export function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState<typeof elements[0] | null>(null);

  const getGridPos = (el: typeof elements[0]) => {
    return { gridColumn: el.group, gridRow: el.period };
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#0B0E14] overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">The Periodic Table</h2>
        <p className="text-slate-500 font-medium">Interactive exploration of the chemical elements.</p>
      </div>

      <div className="flex-1 relative overflow-auto scrollbar-hide pb-12">
        <div 
          className="grid gap-1.5 min-w-[1100px]"
          style={{ 
            gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(7, minmax(0, 1fr))'
          }}
        >
          {elements.map((el) => (
            <motion.div
              key={el.symbol}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              onClick={() => setSelectedElement(el)}
              className="aspect-square p-1.5 rounded-lg border border-slate-800 cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col items-center justify-center relative overflow-hidden group"
              style={{ 
                ...getGridPos(el),
                backgroundColor: `${getElementColor(el.symbol)}15`
              }}
            >
              <div 
                className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: getElementColor(el.symbol) }}
              />
              <span className="text-[8px] font-bold text-slate-500 self-start leading-none">{el.number}</span>
              <span className="text-sm font-black text-white leading-none my-0.5">{el.symbol}</span>
              <span className="text-[7px] text-slate-400 truncate w-full text-center">{el.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedElement && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-16 right-0 bottom-8 w-80 bg-[#161B22] border-l border-slate-700 shadow-2xl p-6 overflow-y-auto scrollbar-hide z-40"
          >
            <button 
              onClick={() => setSelectedElement(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black text-white mb-6 shadow-xl"
              style={{ backgroundColor: getElementColor(selectedElement.symbol) }}
            >
              {selectedElement.symbol}
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">{selectedElement.name}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">{selectedElement.category}</p>

            <div className="space-y-4 mb-8">
              <DetailRow label="Atomic Number" value={selectedElement.number} />
              <DetailRow label="Atomic Mass" value={selectedElement.atomic_mass.toFixed(4)} />
              <DetailRow label="Electronegativity" value={selectedElement.electronegativity || 'N/A'} />
              <DetailRow label="Melting Point" value={selectedElement.melting_point ? `${selectedElement.melting_point} K` : 'N/A'} />
              <DetailRow label="Boiling Point" value={selectedElement.boiling_point ? `${selectedElement.boiling_point} K` : 'N/A'} />
            </div>

            <p className="text-sm text-slate-400 leading-relaxed italic mb-8">
              {selectedElement.summary}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: any }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800">
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      <span className="text-xs font-mono text-slate-200">{value}</span>
    </div>
  );
}
