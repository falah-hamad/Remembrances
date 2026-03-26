import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart, Share2, RotateCcw, Check, ArrowRight, Trash2 } from 'lucide-react';
import { UserProfile, Zikr } from '../types';
import azkarData from '../data/azkar.json';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Favorites({ profile }: { profile: UserProfile | null }) {
  const navigate = useNavigate();
  const [favoriteItems, setFavoriteItems] = useState<Zikr[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      const favs = azkarData.filter(z => profile.favorites.includes(z.id));
      setFavoriteItems(favs);
      const initialCounts: Record<string, number> = {};
      favs.forEach(z => initialCounts[z.id] = z.count);
      setCounts(initialCounts);
    }
  }, [profile]);

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

  const removeFromFavorites = async (id: string) => {
    if (!profile) return;
    const userDoc = doc(db, 'users', profile.uid);
    await updateDoc(userDoc, {
      favorites: arrayRemove(id)
    });
  };

  const handleDecrement = (id: string) => {
    if (counts[id] > 0) {
      setCounts(prev => ({ ...prev, [id]: prev[id] - 1 }));
    }
  };

  const handleReset = (id: string) => {
    const original = favoriteItems.find(z => z.id === id);
    if (original) {
      setCounts(prev => ({ ...prev, [id]: original.count }));
    }
  };

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <Heart size={48} />
        </div>
        <h2 className="text-3xl font-bold text-[#5A5A40]">الأذكار المفضلة</h2>
        <p className="text-[#8e8e8e]">يرجى تسجيل الدخول لحفظ أذكارك المفضلة</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#5A5A40] text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg transition-all"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <header className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-[#e5e5e0] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
            <Heart size={32} fill="currentColor" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-[#5A5A40]">المفضلة</h2>
            <p className="text-[#8e8e8e]">{favoriteItems.length} أذكار محفوظة</p>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="p-4 hover:bg-[#f5f5f0] rounded-2xl text-[#5A5A40] transition-all">
          <ArrowRight size={24} />
        </button>
      </header>

      <div className="space-y-6">
        {favoriteItems.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-[#e5e5e0] text-center space-y-4 shadow-sm">
            <Star size={48} className="mx-auto text-[#d1d1d1]" />
            <p className="text-[#8e8e8e] text-lg">لا يوجد أذكار مفضلة حالياً</p>
            <button 
              onClick={() => navigate('/')}
              className="text-[#5A5A40] font-bold hover:underline"
            >
              استكشف الأذكار الآن
            </button>
          </div>
        ) : (
          favoriteItems.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] border border-[#e5e5e0] shadow-xl overflow-hidden relative group"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[#5A5A40] bg-[#f5f5f0] px-4 py-2 rounded-full">
                    {item.category}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleShare(item)}
                      className="p-3 text-[#8e8e8e] hover:text-[#5A5A40] hover:bg-[#f5f5f0] rounded-xl transition-all"
                    >
                      {copiedId === item.id ? <Check size={20} className="text-emerald-500" /> : <Share2 size={20} />}
                    </button>
                    <button 
                      onClick={() => removeFromFavorites(item.id)}
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
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
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
