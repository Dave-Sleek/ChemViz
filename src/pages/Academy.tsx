import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Atom, 
  Zap, 
  FlaskConical, 
  ChevronRight, 
  Trophy, 
  CheckCircle2, 
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Lightbulb,
  Database,
  Scale,
  Flame,
  Network,
  Binary
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  icon: React.ReactNode;
  description: string;
  content: {
    heading: string;
    text: string;
    highlights: string[];
  }[];
  questions: {
    question: string;
    options: string[];
    answer: number;
  }[];
}

const LESSONS: Lesson[] = [
  {
    id: 'intro-chem',
    title: 'The Atomic World',
    category: 'Foundations',
    duration: '10 min',
    icon: <Atom size={20} />,
    description: 'Learn the fundamental building blocks of matter and the structure of atoms.',
    content: [
      {
        heading: 'What is Chemistry?',
        text: 'Chemistry is the scientific study of the properties and behavior of matter. It is a physical science within the natural sciences that studies the chemical elements that make up matter and compounds made of atoms, molecules, and ions.',
        highlights: ['Matter consists of atoms', 'Chemistry is the "Central Science"', 'Interactions define behavior']
      },
      {
        heading: 'The Atom',
        text: 'An atom is the smallest unit of ordinary matter that forms a chemical element. Every solid, liquid, gas, and plasma is composed of neutral or ionized atoms.',
        highlights: ['Protons (Positive)', 'Neutrons (Neutral)', 'Electrons (Negative)']
      }
    ],
    questions: [
      {
        question: "What particle in an atom carries a positive charge?",
        options: ["Electron", "Neutron", "Proton", "Molecule"],
        answer: 2
      }
    ]
  },
  {
    id: 'bonding',
    title: 'Chemical Bonding',
    category: 'Advanced',
    duration: '15 min',
    icon: <Zap size={20} />,
    description: 'Explore how atoms join together to create stable molecules.',
    content: [
      {
        heading: 'Ionic vs Covalent',
        text: 'A chemical bond is a lasting attraction between atoms, ions or molecules that enables the formation of chemical compounds.',
        highlights: ['Ionic: Transfer of electrons', 'Covalent: Sharing of electrons', 'Metallic: Sea of electrons']
      }
    ],
    questions: [
      {
        question: "Which type of bond involves the sharing of electrons?",
        options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
        answer: 1
      }
    ]
  },
  {
    id: 'states-of-matter',
    title: 'States of Matter',
    category: 'Foundations',
    duration: '12 min',
    icon: <FlaskConical size={20} />,
    description: 'Understand the different phases of matter and how they transition.',
    content: [
      {
        heading: 'Phases and Kinetic Theory',
        text: 'Matter exists in different physical forms called states. The four fundamental states are solid, liquid, gas, and plasma.',
        highlights: ['Solids have fixed shapes', 'Liquids flow and adapt', 'Gases expand to fill space']
      },
      {
        heading: 'Phase Transitions',
        text: 'Transitions between states occur when energy (heat) is added or removed from a substance.',
        highlights: ['Melting/Freezing', 'Boiling/Condensation', 'Sublimation/Deposition']
      }
    ],
    questions: [
      {
        question: "What is the process called when a solid turns directly into a gas?",
        options: ["Evaporation", "Melting", "Sublimation", "Condensation"],
        answer: 2
      }
    ]
  },
  {
    id: 'periodic-trends',
    title: 'Periodic Trends',
    category: 'Foundations',
    duration: '18 min',
    icon: <Sparkles size={20} />,
    description: 'Master the organization of the periodic table and predict element behavior.',
    content: [
      {
        heading: 'Groups and Periods',
        text: 'Elements are arranged by increasing atomic number. Vertical columns are called Groups, and horizontal rows are called Periods.',
        highlights: ['Groups share characteristics', 'Periods denote energy levels', '118 unique elements']
      }
    ],
    questions: [
      {
        question: "Elements in the same vertical column are part of the same:",
        options: ["Period", "Group", "Block", "Shell"],
        answer: 1
      }
    ]
  },
  {
    id: 'organic-intro',
    title: 'Organic Chemistry Intro',
    category: 'Organic',
    duration: '20 min',
    icon: <Lightbulb size={20} />,
    description: 'Introduction to carbon-based molecules and the chemistry of life.',
    content: [
      {
        heading: 'Carbon: The Versatile Element',
        text: 'Organic chemistry is the study of carbon-based compounds. Carbon is unique because it can form four stable covalent bonds.',
        highlights: ['Carbon backbone', 'Hydrocarbons (C and H)', 'Functional groups']
      }
    ],
    questions: [
      {
        question: "How many covalent bonds does carbon typically form?",
        options: ["Two", "Three", "Four", "Six"],
        answer: 2
      }
    ]
  },
  {
    id: 'thermo',
    title: 'Thermodynamics',
    category: 'Advanced',
    duration: '25 min',
    icon: <Zap size={20} />,
    description: 'Study of heat, energy, and work in chemical systems.',
    content: [
      {
        heading: 'Laws of Thermodynamics',
        text: 'Energy cannot be created or destroyed, only transformed. Entropy always increases in a closed system.',
        highlights: ['First Law: Conservation', 'Second Law: Entropy', 'Enthalpy (H)']
      }
    ],
    questions: [
      {
        question: "Which law states that energy cannot be created or destroyed?",
        options: ["First Law", "Second Law", "Third Law", "Zeroth Law"],
        answer: 0
      }
    ]
  },
  {
    id: 'kinetics',
    title: 'Chemical Kinetics',
    category: 'Advanced',
    duration: '15 min',
    icon: <Zap size={20} />,
    description: 'Understanding the speed and mechanisms of chemical reactions.',
    content: [
      {
        heading: 'Reaction Rates',
        text: 'The rate of a chemical reaction is the speed at which reactants are converted into products.',
        highlights: ['Catalysts speed up reactions', 'Concentration affects rate', 'Activation energy']
      }
    ],
    questions: [
      {
        question: "What substance speeds up a reaction without being consumed?",
        options: ["Reactant", "Product", "Catalyst", "Inhibitor"],
        answer: 2
      }
    ]
  },
  {
    id: 'acids-bases',
    title: 'Acids & Bases',
    category: 'Foundations',
    duration: '15 min',
    icon: <FlaskConical size={20} />,
    description: 'Master the pH scale and the behavior of acidic and basic solutions.',
    content: [
      {
        heading: 'The pH Scale',
        text: 'pH is a measure of how acidic or basic water is. The range goes from 0 to 14, with 7 being neutral.',
        highlights: ['pH < 7 is acidic', 'pH > 7 is basic', 'Logarithmic scale']
      }
    ],
    questions: [
      {
        question: "A solution with a pH of 3 is considered:",
        options: ["Neutral", "Basic", "Acidic", "Alkaline"],
        answer: 2
      }
    ]
  },
  {
    id: 'stoichiometry',
    title: 'Stoichiometry',
    category: 'Intermediate',
    duration: '22 min',
    icon: <BookOpen size={20} />,
    description: 'Learn the quantitative relationships between reactants and products in chemical reactions.',
    content: [
      {
        heading: 'The Mole Concept',
        text: 'The mole is the unit of measurement for amount of substance in the SI system. One mole contains exactly 6.02214076×10²³ particles.',
        highlights: ['Avogadro\'s number', 'Molar mass conversion', 'Balanced equations']
      },
      {
        heading: 'Limiting Reactants',
        text: 'The limiting reactant is the substance that is totally consumed when the chemical reaction is complete.',
        highlights: ['Theoretical yield', 'Percent yield', 'Excess reactants']
      }
    ],
    questions: [
      {
        question: "How many particles are in one mole of a substance?",
        options: ["6.02 x 10^23", "3.01 x 10^23", "1.20 x 10^24", "10^10"],
        answer: 0
      }
    ]
  },
  {
    id: 'solutions',
    title: 'Solutions & Concentration',
    category: 'Intermediate',
    duration: '18 min',
    icon: <FlaskConical size={20} />,
    description: 'Explore the properties of mixtures and how to calculate solution concentrations.',
    content: [
      {
        heading: 'Molarity and Molality',
        text: 'Concentration is the amount of solute dissolved in a specific amount of solvent or solution.',
        highlights: ['Molarity (M) = mol/L', 'Dilution (M1V1 = M2V2)', 'Solubility limits']
      }
    ],
    questions: [
      {
        question: "What is the unit of Molarity?",
        options: ["Grams/Liter", "Moles/Kilogram", "Moles/Liter", "Milliliters/Gram"],
        answer: 2
      }
    ]
  },
  {
    id: 'electrochemistry',
    title: 'Electrochemistry',
    category: 'Advanced',
    duration: '28 min',
    icon: <Zap size={20} />,
    description: 'Study the relationship between electrical energy and chemical change.',
    content: [
      {
        heading: 'Redox Reactions',
        text: 'Electrochemistry deals with chemical reactions that involve the transfer of electrons (Reduction-Oxidation).',
        highlights: ['Oxidation (loss of e-)', 'Reduction (gain of e-)', 'Galvanic cells']
      }
    ],
    questions: [
      {
        question: "In a redox reaction, 'Reduction' refers to:",
        options: ["Loss of electrons", "Gain of electrons", "Loss of protons", "Increase in mass"],
        answer: 1
      }
    ]
  },
  {
    id: 'nuclear-chem',
    title: 'Nuclear Chemistry',
    category: 'Advanced',
    duration: '25 min',
    icon: <Atom size={20} />,
    description: 'Delve into the reactions involving changes in the atomic nucleus.',
    content: [
      {
        heading: 'Radioactivity and Decay',
        text: 'Nuclear chemistry studies radioactive elements and nuclear processes like fission and fusion.',
        highlights: ['Alpha, Beta, Gamma decay', 'Half-life calculations', 'Fission vs Fusion']
      }
    ],
    questions: [
      {
        question: "Which type of nuclear radiation has the highest penetrating power?",
        options: ["Alpha particles", "Beta particles", "Gamma rays", "Protons"],
        answer: 2
      }
    ]
  },
  {
    id: 'matter-props',
    title: 'Properties of Matter',
    category: 'Novice',
    duration: '15 min',
    icon: <Database size={20} />,
    description: 'Understand the fundamental states of matter and their physical properties.',
    content: [
      {
        heading: 'States of Matter',
        text: 'Matter exists primarily in four states: solid, liquid, gas, and plasma. Each state is defined by the arrangement and energy of its particles.',
        highlights: ['Phase changes', 'Density & Buoyancy', 'Kinetic Molecular Theory']
      }
    ],
    questions: [
      {
        question: "Which state of matter has a definite volume but no definite shape?",
        options: ["Solid", "Liquid", "Gas", "Plasma"],
        answer: 1
      }
    ]
  },
  {
    id: 'equilibrium',
    title: 'Chemical Equilibrium',
    category: 'Intermediate',
    duration: '24 min',
    icon: <Scale size={20} />,
    description: 'Explore reversible reactions and how systems balance under stress.',
    content: [
      {
        heading: 'Le Chatelier\'s Principle',
        text: 'When a system at equilibrium is subjected to change in concentration, temperature, or pressure, the system shifts to counteract the change.',
        highlights: ['Equilibrium Constant (Kc)', 'Reaction Quotient (Q)', 'Shift direction']
      }
    ],
    questions: [
      {
        question: "If you increase the concentration of a reactant, the equilibrium will shift towards:",
        options: ["The reactants", "The products", "No change", "It depends on pressure"],
        answer: 1
      }
    ]
  },
  {
    id: 'thermodynamics',
    title: 'Thermodynamics',
    category: 'Intermediate',
    duration: '30 min',
    icon: <Flame size={20} />,
    description: 'The study of heat, energy, and the spontaneity of chemical processes.',
    content: [
      {
        heading: 'Enthalpy and Entropy',
        text: 'Thermodynamics helps us predict if a reaction will occur spontaneously using Gibbs Free Energy.',
        highlights: ['First Law of Thermo', 'Exothermic vs Endothermic', 'Entropy (Disorder)']
      }
    ],
    questions: [
      {
        question: "A reaction that releases heat to the surroundings is called:",
        options: ["Endothermic", "Exothermic", "Isothermal", "Spontaneous"],
        answer: 1
      }
    ]
  },
  {
    id: 'organic-mechanisms',
    title: 'Organic Mechanisms',
    category: 'Advanced',
    duration: '35 min',
    icon: <Network size={20} />,
    description: 'Master the step-by-step electron movements in organic reactions.',
    content: [
      {
        heading: 'Nucleophilic Substitution',
        text: 'Understanding how nucleophiles replace leaving groups is fundamental to synthetic organic chemistry.',
        highlights: ['SN1 vs SN2', 'Carbocation stability', 'Transition states']
      }
    ],
    questions: [
      {
        question: "Which mechanism typically involves a two-step process with a carbocation intermediate?",
        options: ["SN1", "SN2", "E2", "Addition"],
        answer: 0
      }
    ]
  },
  {
    id: 'analytical-chem',
    title: 'Analytical Techniques',
    category: 'Advanced',
    duration: '40 min',
    icon: <Binary size={20} />,
    description: 'Learn the advanced methods used to identify and quantify chemical substances.',
    content: [
      {
        heading: 'Spectroscopy',
        text: 'Analytical chemistry uses electromagnetic radiation to probe the structure and concentration of matter.',
        highlights: ['NMR Spectroscopy', 'Mass Spectrometry', 'Chromatography']
      }
    ],
    questions: [
      {
        question: "Which technique is best for determining the molecular mass of a compound?",
        options: ["UV-Vis", "NMR", "Mass Spectrometry", "Titration"],
        answer: 2
      }
    ]
  }
];

export function Academy() {
  const [selectedLevel, setSelectedLevel] = useState<'Novice' | 'Intermediate' | 'Advanced'>('Novice');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  // Filter lessons based on selected level
  // Note: Foundations maps to Novice
  const filteredLessons = LESSONS.filter(lesson => {
    if (selectedLevel === 'Novice') return lesson.category === 'Foundations' || lesson.category === 'Novice';
    return lesson.category === selectedLevel;
  });

  const handleComplete = (lessonId: string) => {
    if (!completed.includes(lessonId)) {
      setCompleted([...completed, lessonId]);
    }
    setSelectedLesson(null);
    setQuizMode(false);
    setScore(0);
  };

  const levels: ('Novice' | 'Intermediate' | 'Advanced')[] = ['Novice', 'Intermediate', 'Advanced'];

  return (
    <div className="min-h-full bg-white dark:bg-[#0B0E14] transition-colors duration-300">
      {!selectedLesson ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 max-w-6xl mx-auto"
        >
          <header className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chemistry Academy</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Master the elements through structured scientific modules.</p>
                </div>
              </div>

              <div className="flex bg-slate-100 dark:bg-[#161B22] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all relative ${
                      selectedLevel === level 
                        ? 'text-white' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {selectedLevel === level && (
                      <motion.div
                        layoutId="activeLevel"
                        className="absolute inset-0 bg-blue-600 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{level}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Enrolled Students</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">Explorer Account</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Level Progress</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {completed.filter(id => LESSONS.find(l => l.id === id)?.category === (selectedLevel === 'Novice' ? 'Foundations' : selectedLevel)).length} / {filteredLessons.length}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Academy Standing</p>
                <p className="text-xl font-black text-blue-600 dark:text-blue-500">{selectedLevel}</p>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedLevel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredLessons.length > 0 ? (
                filteredLessons.map((lesson, idx) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedLesson(lesson)}
                    className="group relative bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 cursor-pointer hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 text-blue-500/5 group-hover:text-blue-500/10 transition-colors">
                      {lesson.icon}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-[#0B0E14] border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        {lesson.icon}
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{lesson.category}</span>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{lesson.title}</h3>
                      </div>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">{lesson.description}</p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold">
                        <Zap size={14} className="text-amber-500" />
                        {lesson.duration}
                      </div>
                      {completed.includes(lesson.id) ? (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 text-xs font-black">
                          <CheckCircle2 size={16} />
                          COMPLETED
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 text-xs font-black">
                          START MODULE
                          <ChevronRight size={16} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-[#161B22] rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                    <BookOpen size={40} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Modules Found</h3>
                  <p className="text-slate-500 dark:text-slate-400">We're still developing modules for the {selectedLevel} level.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 max-w-4xl mx-auto"
        >
          <button 
            type="button"
            onClick={() => setSelectedLesson(null)}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Back to Academy</span>
          </button>

          {!quizMode ? (
            <div className="space-y-12 pb-24">
              <header>
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.2em] mb-4 block">{selectedLesson.category} Module</span>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{selectedLesson.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">{selectedLesson.description}</p>
              </header>

              <div className="grid gap-12">
                {selectedLesson.content.map((section, idx) => (
                  <section key={idx} className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                      {section.heading}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">{section.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#161B22] rounded-2xl border border-slate-200 dark:border-slate-800">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{h}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="p-8 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-600/20 text-center space-y-6">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-white">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-black text-white">Module Checkpoint</h3>
                <p className="text-blue-100 max-w-md mx-auto">Ready to verify your understanding of {selectedLesson.title.toLowerCase()}?</p>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuizMode(true);
                  }}
                  className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl relative z-10"
                >
                  Take Checkpoint Test
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto py-12">
              <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 text-center shadow-2xl">
                <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
                  <Trophy size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Checkpoint: {selectedLesson.title}</h2>
                
                <div className="space-y-8 text-left">
                  {selectedLesson.questions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-6">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{q.question}</p>
                      <div className="grid gap-3">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => setScore(oIdx === q.answer ? 100 : 0)}
                            className={`p-4 rounded-2xl border transition-all text-left font-bold ${
                              score === 100 && oIdx === q.answer 
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-500' 
                                : 'bg-slate-50 dark:bg-[#0B0E14] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  type="button"
                  onClick={() => handleComplete(selectedLesson.id)}
                  className="w-full mt-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                >
                  Finish Module
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
