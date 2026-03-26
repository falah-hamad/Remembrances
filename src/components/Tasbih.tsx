import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Plus, Sparkles, Trophy, Target, History } from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import Confetti from 'react-confetti';

interface TasbihProps {
  profile: UserProfile | null;
}

export default function Tasbih({ profile }: TasbihProps) {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(profile?.tasbihCount || 0);
  const [target, setTarget] = useState(33);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (profile) {
      setTotal(profile.tasbihCount);
    }
  }, [profile]);

  const handleIncrement = async () => {
    const newCount = count + 1;
    setCount(newCount);
    setTotal(prev => prev + 1);

    if (newCount === target) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    if (profile) {
      const userDoc = doc(db, 'users', profile.uid);
      await updateDoc(userDoc, {
        tasbihCount: increment(1)
      });
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const targets = [33, 99, 100, 1000];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto space-y-8 pb-12"
    >
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} gravity={0.2} />}

      <section className="bg-white p-8 rounded-[2.5rem] border border-[#e5e5e0] shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-[#5A5A40]">المسبحة الإلكترونية</h2>
            <p className="text-[#8e8e8e]">حافظ على وردك اليومي من التسبيح</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#f5f5f0] flex items-center justify-center text-[#5A5A40] shadow-inner">
            <Sparkles size={32} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#fcfcf9] p-4 rounded-2xl border border-[#e5e5e0] flex items-center gap-3">
            <Trophy className="text-amber-500" size={20} />
            <div>
              <p className="text-[10px] font-bold text-[#8e8e8e] uppercase">إجمالي التسبيح</p>
              <p className="text-xl font-bold text-[#5A5A40]">{total}</p>
            </div>
          </div>
          <div className="bg-[#fcfcf9] p-4 rounded-2xl border border-[#e5e5e0] flex items-center gap-3">
            <Target className="text-indigo-500" size={20} />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#8e8e8e] uppercase">الهدف الحالي</p>
              <select 
                value={target} 
                onChange={(e) => setTarget(Number(e.target.value))}
                className="bg-transparent font-bold text-[#5A5A40] outline-none w-full"
              >
                {targets.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="relative flex flex-col items-center">
        {/* Main Counter Button */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrement}
          className="w-72 h-72 md:w-80 md:h-80 rounded-full bg-white border-[12px] border-[#5A5A40] shadow-[0_20px_50px_rgba(90,90,64,0.3)] flex flex-col items-center justify-center relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#5A5A40] opacity-0 group-active:opacity-5 transition-opacity" />
          <span className="text-7xl md:text-8xl font-black text-[#5A5A40] tracking-tighter">{count}</span>
          <span className="text-sm font-bold text-[#8e8e8e] mt-2 uppercase tracking-widest">اضغط للتسبيح</span>
          
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle 
              cx="50%" cy="50%" r="48%" 
              fill="none" 
              stroke="#5A5A40" 
              strokeWidth="4" 
              strokeDasharray="1000"
              strokeDashoffset={1000 - (1000 * (count % target)) / target}
              className="transition-all duration-300 opacity-20"
            />
          </svg>
        </motion.button>

        {/* Reset Button */}
        <button 
          onClick={handleReset}
          className="absolute -bottom-6 bg-white p-4 rounded-2xl border border-[#e5e5e0] text-[#5A5A40] shadow-lg hover:bg-[#f5f5f0] transition-all active:rotate-180 duration-500"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="bg-[#5A5A40] p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">أذكار مقترحة</h3>
            <p className="text-sm opacity-75">سبحان الله وبحمده، سبحان الله العظيم</p>
          </div>
          <History size={24} className="opacity-50" />
        </div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>
    </motion.div>
  );
}
