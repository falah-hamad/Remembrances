import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Star, 
  MessageSquare, 
  Plus, 
  Info, 
  Clock, 
  Phone, 
  Globe, 
  ExternalLink,
  Map as MapIcon,
  AlertCircle
} from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Mosque {
  name: string;
  address: string;
  distance?: string;
  rating?: number;
  reviewsCount?: number;
  phone?: string;
  website?: string;
  location?: { lat: number; lng: number };
  amenities?: string[];
}

export default function Mosques() {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          findNearbyMosques(latitude, longitude);
        },
        (err) => {
          setError("يرجى تفعيل خدمة الموقع للبحث عن المساجد القريبة.");
          console.error(err);
        }
      );
    }
  }, []);

  const findNearbyMosques = async (lat: number, lng: number, query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const prompt = query 
        ? `Find mosques matching "${query}" near coordinates ${lat}, ${lng}. Return a JSON array of objects with name, address, rating, reviewsCount, phone, website, and distance. Return ONLY the JSON array.`
        : `Find the closest mosques to coordinates ${lat}, ${lng}. Return a JSON array of objects with name, address, rating, reviewsCount, phone, website, and distance. Return ONLY the JSON array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: { latitude: lat, longitude: lng }
            }
          }
        }
      });

      let text = response.text || '';
      // Extract JSON if it's wrapped in code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        text = jsonMatch[1];
      }

      let data: any[] = [];
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn("Failed to parse JSON from response text, falling back to grounding metadata", e);
      }

      // Extract grounding metadata for URLs
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const mapsLinks = groundingChunks
        .filter(chunk => chunk.maps)
        .map(chunk => ({
          title: chunk.maps?.title,
          uri: chunk.maps?.uri
        }));

      // Merge data with grounding links if possible, or just use grounding links
      if (data.length > 0) {
        const merged = data.map(m => {
          const link = mapsLinks.find(l => l.title?.includes(m.name) || m.name?.includes(l.title || ''));
          return { ...m, website: link?.uri || m.website };
        });
        setMosques(merged);
      } else if (mapsLinks.length > 0) {
        const fallbackData = mapsLinks.map(link => ({
          name: link.title || 'مسجد',
          address: 'انقر للحصول على التفاصيل',
          website: link.uri
        }));
        setMosques(fallbackData);
      } else {
        setMosques([]);
      }
    } catch (err) {
      console.error("Gemini Error:", err);
      setError("حدث خطأ أثناء البحث عن المساجد. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (userLocation) {
      findNearbyMosques(userLocation.lat, userLocation.lng, searchQuery);
    }
  };

  const openInGoogleMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      <section className="bg-white p-8 rounded-[2rem] border border-[#e5e5e0] shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <h2 className="text-3xl font-bold text-[#5A5A40]">البحث عن المساجد</h2>
            <p className="text-[#8e8e8e]">ابحث عن أقرب المساجد إليك واحصل على اتجاهات الوصول</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#4a4a35] transition-all shadow-lg shadow-[#5A5A40]/20"
          >
            <Plus size={20} />
            <span>إضافة مسجد جديد</span>
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مسجد بالاسم أو المنطقة..."
            className="w-full p-5 pr-14 rounded-2xl border border-[#e5e5e0] outline-none focus:border-[#5A5A40] shadow-sm text-lg"
          />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8e8e8e]" size={24} />
          <button 
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#5A5A40] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#4a4a35] transition-all"
          >
            بحث
          </button>
        </form>
      </section>

      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 flex items-center gap-4">
          <AlertCircle size={24} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-[#e5e5e0] animate-pulse space-y-4">
              <div className="h-6 bg-[#f5f5f0] rounded-full w-3/4" />
              <div className="h-4 bg-[#f5f5f0] rounded-full w-1/2" />
              <div className="h-20 bg-[#f5f5f0] rounded-2xl w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mosques.map((mosque, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-[2rem] border border-[#e5e5e0] hover:border-[#5A5A40] transition-all hover:shadow-xl group flex flex-col"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold text-[#5A5A40]">{mosque.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded-lg text-xs">
                    <Star size={14} fill="currentColor" />
                    <span>{mosque.rating || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-[#5c5c5c]">
                  <MapPin size={16} className="text-[#5A5A40] flex-shrink-0 mt-1" />
                  <p className="leading-relaxed">{mosque.address}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-xs bg-[#f5f5f0] text-[#5c5c5c] px-3 py-1.5 rounded-full">
                    <Navigation size={12} />
                    <span>{mosque.distance || '...'}</span>
                  </div>
                  {mosque.phone && (
                    <div className="flex items-center gap-1 text-xs bg-[#f5f5f0] text-[#5c5c5c] px-3 py-1.5 rounded-full">
                      <Phone size={12} />
                      <span>{mosque.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#e5e5e0] flex gap-2">
                <button 
                  onClick={() => openInGoogleMaps(mosque.address)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#5A5A40] text-white py-3 rounded-xl font-bold hover:bg-[#4a4a35] transition-all"
                >
                  <Navigation size={18} />
                  <span>توجيه</span>
                </button>
                <button className="p-3 bg-[#f5f5f0] text-[#5A5A40] rounded-xl hover:bg-[#e5e5e0] transition-all">
                  <Share2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {mosques.length === 0 && !loading && !error && (
        <div className="text-center py-20 space-y-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg text-[#5A5A40]">
            <MapIcon size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#5A5A40]">لا توجد مساجد قريبة</h3>
            <p className="text-[#8e8e8e]">حاول البحث في منطقة أخرى أو التأكد من تفعيل الموقع</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-[2rem] w-full max-w-lg space-y-6"
            >
              <h3 className="text-2xl font-bold text-[#5A5A40]">إضافة مسجد جديد</h3>
              <p className="text-sm text-[#8e8e8e]">ساعدنا في إثراء قاعدة البيانات بإضافة مساجد غير مدرجة</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#5A5A40]">اسم المسجد</label>
                  <input type="text" className="w-full p-4 rounded-2xl border border-[#e5e5e0] outline-none focus:border-[#5A5A40]" placeholder="أدخل اسم المسجد" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#5A5A40]">العنوان / الموقع</label>
                  <input type="text" className="w-full p-4 rounded-2xl border border-[#e5e5e0] outline-none focus:border-[#5A5A40]" placeholder="أدخل العنوان بالتفصيل" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#5A5A40]">المدينة</label>
                    <input type="text" className="w-full p-4 rounded-2xl border border-[#e5e5e0] outline-none focus:border-[#5A5A40]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#5A5A40]">رقم التواصل (اختياري)</label>
                    <input type="text" className="w-full p-4 rounded-2xl border border-[#e5e5e0] outline-none focus:border-[#5A5A40]" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#5A5A40] text-white py-4 rounded-2xl font-bold hover:bg-[#4a4a35] transition-all"
                >
                  إرسال للمراجعة
                </button>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#f5f5f0] text-[#5c5c5c] py-4 rounded-2xl font-bold hover:bg-[#e5e5e0] transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Share2({ size }: { size: number }) {
  return <ExternalLink size={size} />;
}
