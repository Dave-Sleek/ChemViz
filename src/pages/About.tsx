import { motion } from 'motion/react';
import { Info, Atom, Database, Zap, ShieldCheck, Heart } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: <Atom className="text-blue-500" />,
      title: "Scientific Accuracy",
      desc: "Powered by the PubChem PUG REST API, ensuring every molecular structure is grounded in real-world chemical data."
    },
    {
      icon: <Zap className="text-amber-500" />,
      title: "Real-time Exploration",
      desc: "Interactive 3D engines allow students to manipulate geometry and understand spatial relationships instantly."
    },
    {
      icon: <Database className="text-emerald-500" />,
      title: "Durable Knowledge",
      desc: "A built-in local seed database ensures core chemical concepts are available even during global infrastructure outages."
    }
  ];

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#0B0E14] transition-colors duration-300 overflow-y-auto">
      {/* Hero Section */}
      <section className="relative py-24 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-blue-500 rounded-3xl mx-auto flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-500/20 mb-10"
          >
            MF
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6"
          >
            Democratizing <span className="text-blue-500">Molecular</span> Science.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto"
          >
            Molecufy is an advanced interactive laboratory designed to bridge the gap between abstract chemical formulas and tangible physical structures.
          </motion.p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="px-8 pb-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {values.map((v, idx) => (
            <motion.div 
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] hover:border-blue-500/50 transition-colors group shadow-sm"
            >
              <div className="w-12 h-12 bg-slate-50 dark:bg-[#0B0E14] rounded-2xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800 group-hover:scale-110 transition-transform">
                {v.icon}
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-3">{v.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-8 py-24 bg-white/30 dark:bg-[#161B22]/30 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Our Mission</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
              We believe that chemistry should be intuitive, not intimidating. By providing high-fidelity visual context to chemical symbols, we help students develop a deeper spatial intuition for how the universe is constructed at the atomic level.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                <ShieldCheck className="text-blue-500 shrink-0" size={20} />
                <span className="text-sm font-medium">Verified scientific data sources</span>
              </div>
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                <Heart className="text-pink-500 shrink-0" size={20} />
                <span className="text-sm font-medium">Built with love for educators & students</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl absolute inset-0" />
            <div className="relative bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 text-[120px] font-black text-slate-900/5 dark:text-white/5 select-none leading-none">
                H<sub className="text-[60px]">2</sub>O
              </div>
              <div className="relative z-10">
                <span className="text-blue-500 font-black text-5xl">100%</span>
                <p className="text-slate-900 dark:text-white font-bold text-xl mt-2">Open Access</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-4">Available for scientific exploration without account barriers or subscription friction.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <section className="py-24 text-center">
        <p className="text-slate-400 dark:text-slate-600 font-medium text-sm">Molecufy — Laboratory v4.2.1</p>
        <p className="text-slate-500 dark:text-slate-700 text-xs mt-2">Connecting atoms to minds.</p>
      </section>
    </div>
  );
}
