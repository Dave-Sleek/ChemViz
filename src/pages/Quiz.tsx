import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, CheckCircle2, XCircle, RefreshCw, Trophy, ArrowRight, Download, Medal, History } from 'lucide-react';
import { formatFormula } from '../utils/formulaParser';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface LeaderboardEntry {
  score: number;
  total: number;
  date: string;
  streak: number;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is the molecular formula of water?",
    options: ["CO2", "H2O", "CH4", "NaCl"],
    correct: 1,
    explanation: "Water consists of two hydrogen atoms covalently bonded to a single oxygen atom."
  },
  {
    id: 2,
    text: "Which element has the atomic number 6?",
    options: ["Oxygen", "Nitrogen", "Carbon", "Boron"],
    correct: 2,
    explanation: "Carbon is the 6th element in the periodic table and is the basis of all organic life."
  },
  {
    id: 3,
    text: "What is the common name for NaCl?",
    options: ["Glucose", "Baking Soda", "Table Salt", "Bleach"],
    correct: 2,
    explanation: "Sodium chloride (NaCl) is commonly known as table salt."
  },
  {
    id: 4,
    text: "Which of these is a noble gas?",
    options: ["Hydrogen", "Helium", "Oxygen", "Chlorine"],
    correct: 1,
    explanation: "Helium is the first noble gas (Group 18), known for being extremely unreactive."
  },
  {
    id: 5,
    text: "What is the approximate molar mass of CO2?",
    options: ["18.0 g/mol", "28.0 g/mol", "44.0 g/mol", "58.5 g/mol"],
    correct: 2,
    explanation: "Carbon (12.0) + 2 × Oxygen (16.0) = 44.0 g/mol."
  },
  {
    id: 6,
    text: "Which of these is the strongest acid?",
    options: ["CH3COOH", "HCl", "NH3", "H2O"],
    correct: 1,
    explanation: "Hydrochloric acid (HCl) is a strong mineral acid that completely dissociates in water."
  },
  {
    id: 7,
    text: "What functional group is characteristic of alcohols?",
    options: ["-COOH", "-CHO", "-OH", "-NH2"],
    correct: 2,
    explanation: "Alcohols contain the hydroxyl (-OH) functional group."
  },
  {
    id: 8,
    text: "What is the oxidation state of Oxygen in H2O2?",
    options: ["-2", "-1", "0", "+1"],
    correct: 1,
    explanation: "In peroxides like H2O2, oxygen has an unusual oxidation state of -1."
  },
  {
    id: 9,
    text: "Which gas is known as 'Laughing Gas'?",
    options: ["NO2", "N2O", "NO", "NH3"],
    correct: 1,
    explanation: "Nitrous oxide (N2O) is used in dentistry and surgery for its anesthetic and analgesic effects."
  },
  {
    id: 10,
    text: "What is the shape of a CH4 (Methane) molecule?",
    options: ["Linear", "Bent", "Tetrahedral", "Trigonal Planar"],
    correct: 2,
    explanation: "Methane has a tetrahedral geometry due to sp3 hybridization of the central carbon atom."
  },
  {
    id: 11,
    text: "Who developed the first widely recognized Periodic Table?",
    options: ["Newton", "Mendeleev", "Dalton", "Bohr"],
    correct: 1,
    explanation: "Dmitri Mendeleev published the first periodic table in 1869, arranging elements by atomic mass."
  },
  {
    id: 12,
    text: "Which of these elements is a liquid at room temperature?",
    options: ["Mercury", "Gallium", "Iron", "Copper"],
    correct: 0,
    explanation: "Mercury (Hg) is the only metal that is liquid at standard room temperature."
  },
  {
    id: 13,
    text: "What is the main component of natural gas?",
    options: ["Ethane", "Propane", "Methane", "Butane"],
    correct: 2,
    explanation: "Natural gas is primarily composed of methane (CH4)."
  },
  {
    id: 14,
    text: "In a solution, the substance being dissolved is called the:",
    options: ["Solvent", "Solute", "Suspension", "Colloid"],
    correct: 1,
    explanation: "The solute is the substance that is dissolved in the solvent to form a solution."
  },
  {
    id: 15,
    text: "What is the pH of a neutral solution at 25°C?",
    options: ["0", "1", "7", "14"],
    correct: 2,
    explanation: "A pH of 7 indicates a neutral solution where [H+] = [OH-]."
  },
  {
    id: 16,
    text: "Which law states P1V1 = P2V2?",
    options: ["Charles's Law", "Boyle's Law", "Avogadro's Law", "Gay-Lussac's Law"],
    correct: 1,
    explanation: "Boyle's Law describes the inverse relationship between pressure and volume of a gas."
  },
  {
    id: 17,
    text: "What is the most abundant element in the Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    correct: 2,
    explanation: "Nitrogen makes up approximately 78% of Earth's atmosphere."
  },
  {
    id: 18,
    text: "Which particle is responsible for electricity in metals?",
    options: ["Protons", "Neutrons", "Electrons", "Positrons"],
    correct: 2,
    explanation: "Delocalized valence electrons form a 'sea' that allows for electrical conductivity in metals."
  },
  {
    id: 19,
    text: "What is the process of a liquid turning into a solid called?",
    options: ["Melting", "Freezing", "Evaporation", "Condensation"],
    correct: 1,
    explanation: "Freezing (or solidification) is the phase transition from liquid to solid."
  },
  {
    id: 20,
    text: "Which element has the symbol 'Ag'?",
    options: ["Gold", "Silver", "Aluminum", "Argon"],
    correct: 1,
    explanation: "Ag comes from the Latin word 'Argentum', which means silver."
  }
];

export function Quiz() {
  const [currentStep, setCurrentStep] = useState<'start' | 'playing' | 'result'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('quiz_leaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  const saveToLeaderboard = (finalScore: number) => {
    const newEntry: LeaderboardEntry = {
      score: finalScore,
      total: QUESTIONS.length,
      date: new Date().toLocaleDateString(),
      streak: finalScore === QUESTIONS.length ? currentStreak + 1 : 0
    };

    if (finalScore === QUESTIONS.length) {
      setCurrentStreak(s => s + 1);
    } else {
      setCurrentStreak(0);
    }

    const updated = [newEntry, ...leaderboard].slice(0, 10);
    setLeaderboard(updated);
    localStorage.setItem('quiz_leaderboard', JSON.stringify(updated));

    if (finalScore >= QUESTIONS.length * 0.8) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#F59E0B']
      });
    }
  };

  const startQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentStep('playing');
  };

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === QUESTIONS[currentIndex].correct) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      saveToLeaderboard(score);
      setCurrentStep('result');
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();
    
    // Header
    doc.setFillColor(11, 14, 20);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Molecufy Assessment Report', 20, 25);
    
    // Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Student: Chemistry Explorer`, 20, 55);
    doc.text(`Completion Date: ${date}`, 20, 65);
    doc.text(`Final Score: ${score} / ${QUESTIONS.length} (${(score / QUESTIONS.length * 100).toFixed(1)}%)`, 20, 75);
    
    // Grade
    const grade = score === QUESTIONS.length ? 'A+' : score >= 4 ? 'A' : score >= 3 ? 'B' : 'C';
    doc.setFontSize(16);
    doc.text(`Assessment Grade: ${grade}`, 20, 90);
    
    // Detailed Breakdown
    doc.setFontSize(14);
    doc.text('Question Summary:', 20, 110);
    doc.setFontSize(10);
    
    QUESTIONS.forEach((q, i) => {
      const y = 120 + (i * 20);
      doc.text(`${i + 1}. ${q.text}`, 20, y);
      doc.setTextColor(score >= (i + 1) ? 16 : 220, score >= (i + 1) ? 185 : 38, score >= (i + 1) ? 129 : 38);
      doc.text(`Status: Verified Correct`, 25, y + 7);
      doc.setTextColor(0, 0, 0);
    });
    
    doc.save(`Molecufy_Report_${new Date().getTime()}.pdf`);
  };

  const progress = ((currentIndex + (isAnswered ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0E14] transition-colors duration-300 overflow-x-auto overflow-y-auto">
      <AnimatePresence mode="wait">
        {currentStep === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-700 p-12 rounded-3xl shadow-2xl shadow-blue-500/5 max-w-md w-full"
          >
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
              <BrainCircuit size={40} className="text-blue-500" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Chemistry Quiz</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg font-light leading-relaxed">
              Test your knowledge of formulas, elements, and molecular properties.
            </p>
            <button
              onClick={startQuiz}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Start Challenge
            </button>
          </motion.div>
        )}

        {currentStep === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl"
          >
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Question {currentIndex + 1}</h2>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Chemistry Fundamentals</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-blue-500">{currentIndex + 1}<span className="text-slate-300 dark:text-slate-700 font-light mx-1">/</span>{QUESTIONS.length}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-700 p-10 rounded-3xl shadow-xl mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-10 leading-tight">{QUESTIONS[currentIndex].text}</h2>
              <div className="flex sm:grid sm:grid-cols-1 gap-4 overflow-x-auto pb-4 no-scrollbar">
                {QUESTIONS[currentIndex].options.map((opt, idx) => {
                  let statusClass = "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1117] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-[#1C2128]";
                  if (isAnswered) {
                    if (idx === QUESTIONS[currentIndex].correct) {
                      statusClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                    } else if (idx === selectedOption) {
                      statusClass = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                    } else {
                      statusClass = "opacity-30 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1117]";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleOptionClick(idx)}
                      className={`p-5 rounded-xl border-2 text-left font-bold transition-all flex items-center justify-between group min-w-[200px] sm:min-w-0 shrink-0 ${statusClass}`}
                    >
                      <span>{formatFormula(opt)}</span>
                      {isAnswered && idx === QUESTIONS[currentIndex].correct && <CheckCircle2 size={24} className="shrink-0 ml-2" />}
                      {isAnswered && idx === selectedOption && idx !== QUESTIONS[currentIndex].correct && <XCircle size={24} className="shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                    <h3 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1">Concept Explanation</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">{QUESTIONS[currentIndex].explanation}</p>
                  </div>
                  <button
                    onClick={nextQuestion}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                  >
                    {currentIndex < QUESTIONS.length - 1 ? 'Continue' : 'Show Results'}
                    <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {currentStep === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl space-y-6"
          >
            <div className="text-center bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-700 p-10 rounded-3xl shadow-2xl">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/5">
                <Trophy size={40} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Quiz Results</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-10">Assessment performance analytics finalized.</p>
              
              <div className="text-6xl font-black mb-12 flex flex-col items-center">
                <span className="text-blue-500">{score} <span className="text-slate-200 dark:text-slate-700">/</span> {QUESTIONS.length}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-3">Final Score</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <button
                  onClick={startQuiz}
                  className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Retry
                </button>
                <button
                  onClick={generatePDFReport}
                  className="py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Medal size={20} className="text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Recent Assessments</h3>
              </div>
              <div className="space-y-3">
                {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B0E14] rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{entry.score} / {entry.total}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">{entry.date}</p>
                      </div>
                    </div>
                    {entry.streak > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
                        <History size={12} />
                        <span className="text-[10px] font-black">{entry.streak} STREAK</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <p className="text-center py-6 text-slate-400 dark:text-slate-600 text-sm italic font-medium">No previous data logs found.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
