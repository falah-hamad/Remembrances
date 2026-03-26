import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import moment from 'moment-hijri';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Moon, 
  Sun, 
  Star, 
  Plus, 
  Trash2, 
  Share2, 
  Bell,
  CheckCircle,
  CalendarDays
} from 'lucide-react';

// Set locale to Arabic
moment.locale('ar-SA');

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(moment());
  const [view, setView] = useState<'hijri' | 'gregorian'>('hijri');
  const [personalEvents, setPersonalEvents] = useState<{ id: string; date: string; title: string }[]>(() => {
    const saved = localStorage.getItem('personal_events');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ date: '', title: '' });

  useEffect(() => {
    localStorage.setItem('personal_events', JSON.stringify(personalEvents));
  }, [personalEvents]);

  const islamicEvents = [
    { date: '01-01', title: 'رأس السنة الهجرية', type: 'major' },
    { date: '10-01', title: 'يوم عاشوراء', type: 'minor' },
    { date: '12-03', title: 'المولد النبوي الشريف', type: 'major' },
    { date: '27-07', title: 'الإسراء والمعراج', type: 'major' },
    { date: '01-09', title: 'بداية شهر رمضان', type: 'major' },
    { date: '27-09', title: 'ليلة القدر (تقديرياً)', type: 'major' },
    { date: '01-10', title: 'عيد الفطر المبارك', type: 'major' },
    { date: '09-12', title: 'يوم عرفة', type: 'major' },
    { date: '10-12', title: 'عيد الأضحى المبارك', type: 'major' },
  ];

  const getDaysInMonth = () => {
    const startOfMonth = view === 'hijri' 
      ? moment(currentDate).startOf('iMonth') 
      : moment(currentDate).startOf('month');
    const endOfMonth = view === 'hijri' 
      ? moment(currentDate).endOf('iMonth') 
      : moment(currentDate).endOf('month');
    
    const days = [];
    let day = startOfMonth.clone();
    while (day.isBefore(endOfMonth) || day.isSame(endOfMonth, 'day')) {
      days.push(day.clone());
      day.add(1, 'day');
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentDate(prev => view === 'hijri' ? moment(prev).add(1, 'iMonth') : moment(prev).add(1, 'month'));
  };

  const prevMonth = () => {
    setCurrentDate(prev => view === 'hijri' ? moment(prev).subtract(1, 'iMonth') : moment(prev).subtract(1, 'month'));
  };

  const addEvent = () => {
    if (!newEvent.date || !newEvent.title) return;
    setPersonalEvents([...personalEvents, { ...newEvent, id: Date.now().toString() }]);
    setNewEvent({ date: '', title: '' });
    setShowAddEvent(false);
  };

  const deleteEvent = (id: string) => {
    setPersonalEvents(personalEvents.filter(e => e.id !== id));
  };

  const days = getDaysInMonth();
  const monthName = view === 'hijri' ? currentDate.format('iMMMM iYYYY') : currentDate.format('MMMM YYYY');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <section className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-[#e5e5e0] shadow-xl">
        <div className="space-y-2 text-center md:text-right">
          <h2 className="text-3xl font-bold text-[#5A5A40]">التقويم الإسلامي</h2>
          <p className="text-[#8e8e8e]">متابعة التاريخ الهجري والميلادي والمناسبات الدينية</p>
        </div>
        <div className="flex items-center gap-2 bg-[#f5f5f0] p-1 rounded-2xl">
          <button 
            onClick={() => setView('hijri')}
            className={cn(
              "px-6 py-2 rounded-xl font-bold transition-all",
              view === 'hijri' ? "bg-[#5A5A40] text-white shadow-lg" : "text-[#5c5c5c] hover:bg-white"
            )}
          >
            هجري
          </button>
          <button 
            onClick={() => setView('gregorian')}
            className={cn(
              "px-6 py-2 rounded-xl font-bold transition-all",
              view === 'gregorian' ? "bg-[#5A5A40] text-white shadow-lg" : "text-[#5c5c5c] hover:bg-white"
            )}
          >
            ميلادي
          </button>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-[#e5e5e0] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <button onClick={prevMonth} className="p-2 hover:bg-[#f5f5f0] rounded-full text-[#5A5A40]">
                <ChevronRight size={24} />
              </button>
              <h3 className="text-xl font-bold text-[#5A5A40]">{monthName}</h3>
              <button onClick={nextMonth} className="p-2 hover:bg-[#f5f5f0] rounded-full text-[#5A5A40]">
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-[#8e8e8e] py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                const isToday = day.isSame(moment(), 'day');
                const hDate = day.format('iDD');
                const gDate = day.format('DD');
                const hasIslamicEvent = islamicEvents.some(e => e.date === day.format('iDD-iMM'));
                const hasPersonalEvent = personalEvents.some(e => e.date === day.format('YYYY-MM-DD'));

                return (
                  <div 
                    key={i}
                    className={cn(
                      "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer border border-transparent",
                      isToday ? "bg-[#5A5A40] text-white shadow-lg scale-105 z-10" : "bg-[#fcfcf9] hover:border-[#5A5A40]/30",
                      (hasIslamicEvent || hasPersonalEvent) && !isToday && "border-[#5A5A40]/20"
                    )}
                  >
                    <span className="text-lg font-bold">{view === 'hijri' ? hDate : gDate}</span>
                    <span className="text-[10px] opacity-60">{view === 'hijri' ? gDate : hDate}</span>
                    <div className="absolute bottom-2 flex gap-1">
                      {hasIslamicEvent && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                      {hasPersonalEvent && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#5A5A40] p-8 rounded-[2rem] text-white space-y-4">
            <h4 className="text-xl font-bold flex items-center gap-2">
              <Star size={20} className="text-amber-400" />
              المناسبات الإسلامية القادمة
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {islamicEvents.slice(0, 4).map((e, i) => (
                <div key={i} className="bg-white/10 p-4 rounded-2xl flex items-center justify-between">
                  <span className="font-medium">{e.title}</span>
                  <span className="text-xs opacity-75">{e.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Events */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-[#e5e5e0] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#5A5A40] flex items-center gap-2">
                <CalendarDays size={20} />
                مناسباتك الخاصة
              </h3>
              <button 
                onClick={() => setShowAddEvent(true)}
                className="p-2 bg-[#5A5A40] text-white rounded-xl hover:bg-[#4a4a35] transition-all"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {personalEvents.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-[#f5f5f0] rounded-full flex items-center justify-center mx-auto text-[#8e8e8e]">
                    <CalendarIcon size={32} />
                  </div>
                  <p className="text-sm text-[#8e8e8e]">لا توجد مناسبات مضافة بعد</p>
                </div>
              ) : (
                personalEvents.map((e) => (
                  <div key={e.id} className="bg-[#fcfcf9] p-4 rounded-2xl border border-[#e5e5e0] flex items-center justify-between group">
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#5A5A40] text-sm">{e.title}</h4>
                      <p className="text-xs text-[#8e8e8e]">{e.date}</p>
                    </div>
                    <button 
                      onClick={() => deleteEvent(e.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white space-y-4 shadow-xl">
            <h4 className="text-xl font-bold flex items-center gap-2">
              <Share2 size={20} />
              مشاركة التقويم
            </h4>
            <p className="text-sm opacity-90 leading-relaxed">
              شارك المناسبات الإسلامية مع أصدقائك وعائلتك عبر تطبيقات التواصل.
            </p>
            <button className="w-full bg-white text-indigo-600 py-3 rounded-2xl font-bold hover:bg-opacity-90 transition-all">
              مشاركة الآن
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddEvent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-[2rem] w-full max-w-md space-y-6"
            >
              <h3 className="text-2xl font-bold text-[#5A5A40]">إضافة مناسبة جديدة</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#5A5A40]">عنوان المناسبة</label>
                  <input 
                    type="text" 
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-[#e5e5e0] outline-none focus:border-[#5A5A40]"
                    placeholder="مثلاً: ذكرى زواج، موعد عمرة"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#5A5A40]">التاريخ</label>
                  <input 
                    type="date" 
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-[#e5e5e0] outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={addEvent}
                  className="flex-1 bg-[#5A5A40] text-white py-4 rounded-2xl font-bold hover:bg-[#4a4a35] transition-all"
                >
                  إضافة
                </button>
                <button 
                  onClick={() => setShowAddEvent(false)}
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

// Helper for tailwind classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
