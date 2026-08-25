import { motion } from 'motion/react';
import { Search, Box, Info, BookOpen, Cpu, Globe, FlaskConical, Trophy } from 'lucide-react';

export function Help() {
  const sections = [
    {
      title: "Molecule Explorer",
      icon: <Search className="text-blue-500" />,
      content: "Enter any chemical formula (e.g., H2O) or name (e.g., Caffeine) in the search bar. The engine retrieves 3D structural data, molecular properties, and descriptions from the PubChem database.",
      tips: ["Try common formulas like C6H12O6", "Use names like 'Aspirin'", "Look for 'Parent Compound' notes if 3D data is derived"]
    },
    {
      title: "3D Visualization",
      icon: <Box className="text-purple-500" />,
      content: "Interact with molecules in real-time. Use your mouse or touch to rotate, zoom, and inspect atomic arrangements. If 3D data is unavailable, Molecufy automatically generates a high-fidelity 2D schematic.",
      tips: ["Scroll to zoom", "Click and drag to rotate", "Blue atoms = Nitrogen, Red = Oxygen"]
    },
    {
      title: "Periodic Table",
      icon: <Globe className="text-emerald-500" />,
      content: "A comprehensive map of all 118 elements. Use the built-in search to filter by symbol, name, or chemical group. Click any element to view its specific electronic and physical properties.",
      tips: ["Filter by group (e.g., 'Noble Gas')", "Search by symbol 'Au'", "Click for detailed sub-atomic metrics"]
    },
    {
      title: "Knowledge Assessments",
      icon: <Trophy className="text-amber-500" />,
      content: "Test your chemical proficiency in the Quiz section. Track your high scores and streaks locally. You can download a professional PDF report of your performance after completion.",
      tips: ["Maintain streaks for local leaderboard", "Download PDF reports for your records", "Review explanations after each answer"]
    }
  ];

  return (
    <div className="min-h-full bg-[#0B0E14] p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <BookOpen size={12} />
            Laboratory Manual
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-4">Documentation & Help</h1>
          <p className="text-slate-500 text-lg max-w-2xl">Everything you need to master molecular visualization and chemical analysis in the Molecufy environment.</p>
        </header>

        <div className="grid gap-8">
          {sections.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#161B22] border border-slate-800 rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#0B0E14] border border-slate-800 flex items-center justify-center shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">{section.title}</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">{section.content}</p>
                  
                  <div className="bg-[#0B0E14] rounded-2xl p-6 border border-slate-800/50">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Pro Tips</h4>
                    <ul className="space-y-3">
                      {section.tips.map((tip, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <footer className="mt-20 pt-12 border-t border-slate-800 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 mb-6">
            <Cpu size={32} />
          </div>
          <h3 className="text-white font-bold mb-2">Technical Support</h3>
          <p className="text-slate-500 text-sm max-w-sm">Molecufy is an educational platform. For complex chemical queries, always consult peer-reviewed scientific literature.</p>
        </footer>
      </div>
    </div>
  );
}
