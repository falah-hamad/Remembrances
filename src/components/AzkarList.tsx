import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronRight, 
  Star, 
  Share2, 
  RotateCcw, 
  Copy, 
  Check, 
  Heart,
  ArrowRight
} from 'lucide-react';
import azkarData from '../data/azkar.json';
import { Zikr, UserProfile } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface AzkarListProps {
  profile: UserProfile | null;
}

export default function AzkarList({ profile }: AzkarListProps) {
  const { category } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<Zikr[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const filtered = azkarData.filter(z => z.category === category);
    setItems(filtered);
    const initialCounts: Record<string, number> = {};
    filtered.forEach(z => initialCounts[z.id] = z.count);
    setCounts(initialCounts);
  }, [category]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (zikr: Zikr) => {
    const shareText = `${zikr.text}\n\n${zikr.reference ? `المصدر: ${zikr.reference}` : ''}\n\nتمت المشاركة من تطبيق أذكار المسلم`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: zikr.category,
          text: shareText,
        });
      } catch (err) {
        console.error("Share error:", err);
      }
    } else {
      handleCopy(shareText, zikr.id);
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!profile) return;
    const userDoc = doc(db, 'users', profile.uid);
    const isFav = profile.favorites.includes(id);
    await updateDoc(userDoc, {
      favorites: isFav ? arrayRemove(id) : arrayUnion(id)
    });
  };

  const handleDecrement = (id: string) => {
    if (counts[id] > 0) {
      setCounts(prev => ({ ...prev, [id]: prev[id] - 1 }));
    }
  };

  const handleReset = (id: string) => {
    const original = items.find(z => z.id === id);
    if (original) {
      setCounts(prev => ({ ...prev, [id]: original.count }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <header className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-[#e5e5e0] shadow-sm">
        <button onClick={() => navigate('/')} className="p-3 hover:bg-[#f5f5f0] rounded-full text-[#5A5A40] transition-all">
          <ArrowRight size={24} />
        </button>
        <h2 className="text-2xl font-bold text-[#5A5A40]">{category}</h2>
      </header>

      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-[#e5e5e0] shadow-xl overflow-hidden group hover:border-[#5A5A40] transition-all relative"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-[#5A5A40]/20">
                    {index + 1}
                  </div>
                  <span className="text-xs font-bold text-[#5A5A40] bg-[#f5f5f0] px-3 py-1 rounded-full">
                    {item.reference}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleShare(item)}
                    className="p-3 text-[#8e8e8e] hover:text-[#5A5A40] hover:bg-[#f5f5f0] rounded-xl transition-all"
                  >
                    {copiedId === item.id ? <Check size={20} className="text-emerald-500" /> : <Share2 size={20} />}
                  </button>
                  <button 
                    onClick={() => toggleFavorite(item.id)}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      profile?.favorites.includes(item.id) ? "text-rose-500 bg-rose-50" : "text-[#8e8e8e] hover:text-rose-500 hover:bg-rose-50"
                    )}
                  >
                    <Heart size={20} fill={profile?.favorites.includes(item.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              <p className="text-2xl font-bold text-[#1a1a1a] leading-[1.8] text-center py-4">
                {item.text}
              </p>

              {item.benefit && (
                <div className="bg-[#fcfcf9] p-6 rounded-3xl border border-[#e5e5e0] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Star size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-amber-700">فضل الذكر</h4>
                    <p className="text-sm text-[#5c5c5c] leading-relaxed">{item.benefit}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t border-[#f5f5f0] bg-[#fcfcf9]">
              <button 
                onClick={() => handleReset(item.id)}
                className="p-3 text-[#8e8e8e] hover:text-[#5A5A40] hover:bg-white rounded-xl transition-all"
              >
                <RotateCcw size={20} />
              </button>

              <button 
                onClick={() => handleDecrement(item.id)}
                disabled={counts[item.id] === 0}
                className={cn(
                  "w-20 h-20 rounded-3xl flex flex-col items-center justify-center text-2xl font-bold transition-all active:scale-95 shadow-xl",
                  counts[item.id] === 0 
                    ? "bg-emerald-500 text-white" 
                    : "bg-[#5A5A40] text-white shadow-[#5A5A40]/30"
                )}
              >
                {counts[item.id] === 0 ? <Check size={32} /> : counts[item.id]}
                {counts[item.id] > 0 && <span className="text-[10px] opacity-60">متبقي</span>}
              </button>
            </div>

            {counts[item.id] === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] pointer-events-none"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

