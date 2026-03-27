import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Search, 
  Navigation, 
  Clock, 
  Calendar,
  AlertCircle,
  Check
} from 'lucide-react';

export default function PrayerTimes() {
  const [times, setTimes] = useState<any>(null);
  const [location, setLocation] = useState<string>('جاري تحديد الموقع...');
  const [hijriDate, setHijriDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchTimes = async (lat: number, lng: number, label: string = 'موقعك الحالي') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/prayer-times?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      
      // The new API returns prayer_times
      const timings = data.prayer_times || data.timings || data.data?.timings || data;
      setTimes(timings);
      setLocation(label);

      if (data.date?.date_hijri) {
        const h = data.date.date_hijri;
        setHijriDate(`${h.day} ${h.month.ar} ${h.year}`);
      }
    } catch (error) {
      setError("حدث خطأ أثناء جلب مواقيت الصلاة.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchByCity = async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      // First, geocode the city to get lat/lng
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`);
      const geoData = await geoRes.json();
      
      if (geoData && geoData.length > 0) {
        const { lat, lon } = geoData[0];
        await fetchTimes(parseFloat(lat), parseFloat(lon), city);
        setShowSearch(false);
      } else {
        setError("لم يتم العثور على المدينة المطلوبة.");
      }
    } catch (error) {
      setError("حدث خطأ أثناء البحث عن المدينة.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchTimes(pos.coords.latitude, pos.coords.longitude),
        () => {
          setLoading(false);
          setLocation('مكة المكرمة');
          fetchByCity('Makkah');
        }
      );
    }
  }, []);

  const handleShare = () => {
    if (!times) return;
    const shareText = `مواقيت الصلاة في ${location}:\nالفجر: ${times.Fajr}\nالظهر: ${times.Dhuhr}\nالعصر: ${times.Asr}\nالمغرب: ${times.Maghrib}\nالعشاء: ${times.Isha}\n\nتمت المشاركة من تطبيق أذكار المسلم`;
    if (navigator.share) {
      navigator.share({ title: 'مواقيت الصلاة', text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const prayerNames: Record<string, string> = {
    Fajr: 'الفجر',
    Sunrise: 'الشروق',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء'
  };

  const formatTime12h = (time24: string) => {
    if (!time24 || time24 === '--:--') return '--:--';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'م' : 'ص'; // Arabic AM/PM
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getNextPrayer = () => {
    if (!times) return { name: 'الظهر', time: '12:15 PM' };
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = Object.entries(prayerNames).map(([key, name]) => {
      const timeStr = times[key] || '00:00';
      const [hours, minutes] = timeStr.split(':').map(Number);
      return { 
        name, 
        time: formatTime12h(timeStr), 
        minutes: (hours || 0) * 60 + (minutes || 0) 
      };
    });
    
    const next = prayers.find(p => p.minutes > currentMinutes) || prayers[0];
    return next;
  };

  const nextPrayer = getNextPrayer();

  if (loading && !times) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#5A5A40] font-bold">جاري جلب المواقيت...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8 pb-12"
    >
      <header className="bg-white p-8 rounded-[2rem] border border-[#e5e5e0] shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#5A5A40]">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f5f0] flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">مواقيت الصلاة</h2>
              <p className="text-sm opacity-60">{location}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-3 bg-[#f5f5f0] text-[#5A5A40] rounded-xl hover:bg-[#e5e5e0] transition-all"
            >
              <Search size={20} />
            </button>
            <button 
              onClick={handleShare}
              className="p-3 bg-[#f5f5f0] text-[#5A5A40] rounded-xl hover:bg-[#e5e5e0] transition-all"
            >
              {copied ? <Check size={20} className="text-emerald-500" /> : <Share2 size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={(e) => { e.preventDefault(); fetchByCity(searchQuery); }}
              className="relative overflow-hidden"
            >
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مدينة (مثلاً: الرياض، دبي...)"
                className="w-full p-4 pr-12 rounded-2xl border border-[#e5e5e0] outline-none focus:border-[#5A5A40]"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e8e8e]" size={20} />
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </header>

      <div className="bg-white rounded-[2.5rem] border border-[#e5e5e0] shadow-2xl overflow-hidden">
        <div className="bg-[#5A5A40] p-10 text-white text-center space-y-4 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-sm font-bold opacity-80 uppercase tracking-widest">الصلاة القادمة</span>
            <h3 className="text-5xl font-bold mt-2">{nextPrayer.name}</h3>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Clock size={20} className="opacity-60" />
              <span className="text-2xl font-light">{nextPrayer.time}</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="p-8 space-y-4">
          {times && Object.entries(prayerNames).map(([key, name]) => (
            <div key={key} className="flex items-center justify-between p-5 rounded-[1.5rem] hover:bg-[#fcfcf9] border border-transparent hover:border-[#e5e5e0] transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f5f0] flex items-center justify-center text-[#5A5A40] group-hover:bg-white group-hover:shadow-md transition-all">
                  <Bell size={22} />
                </div>
                <span className="font-bold text-xl text-[#1a1a1a]">{name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-[#5A5A40]">{formatTime12h(times[key])}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-[#e5e5e0] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <h4 className="font-bold text-[#5A5A40]">طريقة الحساب</h4>
            <p className="text-xs text-[#8e8e8e]">رابطة العالم الإسلامي</p>
          </div>
          <button className="p-2 hover:bg-[#f5f5f0] rounded-xl text-[#5A5A40]">
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#e5e5e0] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <h4 className="font-bold text-[#5A5A40]">التاريخ الهجري</h4>
            <p className="text-xs text-[#8e8e8e]">{hijriDate || 'جاري التحميل...'}</p>
          </div>
          <Calendar size={20} className="text-[#5A5A40]" />
        </div>
      </div>
    </motion.div>
  );
}
