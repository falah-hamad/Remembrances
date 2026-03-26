import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout } from './firebase';
import { UserProfile } from './types';
import { 
  Home, 
  BookOpen, 
  Moon, 
  Sun, 
  Clock, 
  MessageSquare, 
  Star, 
  Menu, 
  X,
  LogOut,
  Bed,
  Droplets,
  Bell,
  Utensils,
  Wind,
  Heart,
  Sparkles,
  Hash,
  Compass,
  Calendar as CalendarIcon,
  MapPin,
  Settings as SettingsIcon,
  Shield,
  Users,
  HelpCircle,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Components
import AzkarList from './components/AzkarList';
import PrayerTimes from './components/PrayerTimes';
import Tasbih from './components/Tasbih';
import GeminiChat from './components/GeminiChat';
import QuranReader from './components/QuranReader';
import Favorites from './components/Favorites';
import Qibla from './components/Qibla';
import Calendar from './components/Calendar';
import Mosques from './components/Mosques';
import Settings from './components/Settings';
import { OurValues, AboutUs, Help, ContactUs } from './components/StaticPages';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDoc);
        if (!docSnap.exists()) {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            favorites: [],
            tasbihCount: 0,
            settings: {
              language: 'ar',
              theme: 'system',
              fontSize: 'medium',
              notifications: true,
              locationAccuracy: 'high'
            }
          };
          await setDoc(userDoc, newProfile);
          setProfile(newProfile);
        } else {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f0]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-serif flex flex-col" dir="rtl">
        {/* Sidebar / Navigation */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} profile={profile} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-[#e5e5e0] p-4 flex items-center justify-between sticky top-0 z-10">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[#f0f0eb] rounded-full">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-[#5A5A40]">تطبيق أذكار المسلم</h1>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <img src={user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-[#5A5A40]" referrerPolicy="no-referrer" />
                  <span className="hidden sm:inline font-medium text-sm">{user.displayName}</span>
                </div>
              ) : (
                <button 
                  onClick={signInWithGoogle}
                  className="bg-[#5A5A40] text-white px-4 py-2 rounded-full text-sm hover:bg-[#4a4a35] transition-colors"
                >
                  تسجيل الدخول
                </button>
              )}
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/azkar/:category" element={<AzkarList profile={profile} />} />
                <Route path="/prayer-times" element={<PrayerTimes />} />
                <Route path="/tasbih" element={<Tasbih profile={profile} />} />
                <Route path="/quran" element={<QuranReader />} />
                <Route path="/chat" element={<GeminiChat />} />
                <Route path="/favorites" element={<Favorites profile={profile} />} />
                <Route path="/qibla" element={<Qibla />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/mosques" element={<Mosques />} />
                <Route path="/settings" element={<Settings profile={profile} />} />
                <Route path="/values" element={<OurValues />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/help" element={<Help />} />
                <Route path="/contact" element={<ContactUs />} />
              </Routes>
            </AnimatePresence>
          </div>

          {/* Bottom Nav for Mobile */}
          <nav className="md:hidden bg-white border-t border-[#e5e5e0] flex justify-around p-2 sticky bottom-0">
            <NavLink to="/" icon={<Home size={20} />} label="الرئيسية" />
            <NavLink to="/quran" icon={<BookOpen size={20} />} label="القرآن" />
            <NavLink to="/tasbih" icon={<Clock size={20} />} label="تسبيح" />
            <NavLink to="/chat" icon={<MessageSquare size={20} />} label="المساعد" />
          </nav>
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={cn(
      "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
      isActive ? "text-[#5A5A40] bg-[#f5f5f0]" : "text-[#8e8e8e] hover:text-[#5A5A40]"
    )}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

function Sidebar({ isOpen, setIsOpen, user, profile }: { isOpen: boolean; setIsOpen: (o: boolean) => void; user: User | null; profile: UserProfile | null }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Automatically close sidebar when navigating to a new page
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  const menuItems = [
    { to: '/', icon: <Home size={20} />, label: 'الرئيسية' },
    { to: '/quran', icon: <BookOpen size={20} />, label: 'القرآن الكريم' },
    { to: '/prayer-times', icon: <Clock size={20} />, label: 'مواقيت الصلاة' },
    { to: '/qibla', icon: <Compass size={20} />, label: 'اتجاه القبلة' },
    { to: '/calendar', icon: <CalendarIcon size={20} />, label: 'التقويم الهجري' },
    { to: '/mosques', icon: <MapPin size={20} />, label: 'المساجد القريبة' },
    { to: '/tasbih', icon: <Hash size={20} />, label: 'مسبحة إلكترونية' },
    { to: '/favorites', icon: <Star size={20} />, label: 'المفضلة' },
    { to: '/chat', icon: <MessageSquare size={20} />, label: 'مساعد الذكاء الاصطناعي' },
    { to: '/settings', icon: <SettingsIcon size={20} />, label: 'الإعدادات' },
    { to: '/values', icon: <Shield size={20} />, label: 'قيمنا' },
    { to: '/about', icon: <Users size={20} />, label: 'عنا' },
    { to: '/help', icon: <HelpCircle size={20} />, label: 'مساعدة' },
    { to: '/contact', icon: <Mail size={20} />, label: 'اتصل بنا' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-20"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        className={cn(
          "fixed inset-y-0 right-0 w-64 bg-white border-l border-[#e5e5e0] z-30 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 border-b border-[#e5e5e0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5A5A40] rounded-lg flex items-center justify-center text-white">
              <Sun size={20} />
            </div>
            <span className="font-bold text-lg text-[#5A5A40]">أذكار المسلم</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[#f0f0eb] rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link 
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                location.pathname === item.to 
                  ? "bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20" 
                  : "text-[#5c5c5c] hover:bg-[#f5f5f0] hover:text-[#5A5A40]"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {user && (
          <div className="p-4 border-t border-[#e5e5e0]">
            <button 
              onClick={() => logout()}
              className="flex items-center gap-3 p-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        )}
      </motion.aside>
    </>
  );
}

function HomeView() {
  const categories = [
    { name: 'أذكار الصباح', icon: <Sun className="text-orange-500" />, color: 'bg-orange-50', path: '/azkar/أذكار الصباح' },
    { name: 'أذكار المساء', icon: <Moon className="text-indigo-500" />, color: 'bg-indigo-50', path: '/azkar/أذكار المساء' },
    { name: 'القرآن الكريم', icon: <BookOpen className="text-emerald-600" />, color: 'bg-emerald-50', path: '/quran' },
    { name: 'أذكار النوم', icon: <Bed className="text-blue-500" />, color: 'bg-blue-50', path: '/azkar/أذكار النوم' },
    { name: 'أذكار الاستيقاظ', icon: <Sun className="text-yellow-500" />, color: 'bg-yellow-50', path: '/azkar/أذكار الاستيقاظ' },
    { name: 'أذكار بعد الصلاة', icon: <Clock className="text-emerald-500" />, color: 'bg-emerald-50', path: '/azkar/أذكار بعد الصلاة' },
    { name: 'أذكار الصلاة', icon: <Sparkles className="text-purple-500" />, color: 'bg-purple-50', path: '/azkar/أذكار الصلاة' },
    { name: 'أذكار الوضوء', icon: <Droplets className="text-cyan-500" />, color: 'bg-cyan-50', path: '/azkar/أذكار الوضوء' },
    { name: 'أذكار المسجد', icon: <Home className="text-teal-500" />, color: 'bg-teal-50', path: '/azkar/أذكار المسجد' },
    { name: 'أذكار الأذان', icon: <Wind className="text-sky-500" />, color: 'bg-sky-50', path: '/azkar/أذكار الأذان' },
    { name: 'أذكار الطعام', icon: <Utensils className="text-red-500" />, color: 'bg-red-50', path: '/azkar/أذكار الطعام' },
    { name: 'أذكار الخلاء', icon: <Droplets className="text-gray-500" />, color: 'bg-gray-50', path: '/azkar/أذكار الخلاء' },
    { name: 'أذكار المنزل', icon: <Home className="text-amber-500" />, color: 'bg-amber-50', path: '/azkar/أذكار المنزل' },
    { name: 'تسابيح وذكر مطلق', icon: <Hash className="text-pink-500" />, color: 'bg-pink-50', path: '/azkar/تسابيح وذكر مطلق' },
    { name: 'الرقية الشرعية', icon: <Shield className="text-indigo-600" />, color: 'bg-indigo-50', path: '/azkar/الرقية الشرعية' },
    { name: 'أدعية نبوية', icon: <Heart className="text-rose-500" />, color: 'bg-rose-50', path: '/azkar/أدعية نبوية' },
    { name: 'أسماء الله الحسنى', icon: <Sparkles className="text-amber-600" />, color: 'bg-amber-50', path: '/azkar/أسماء الله الحسنى' },
    { name: 'اتجاه القبلة', icon: <Compass className="text-rose-600" />, color: 'bg-rose-50', path: '/qibla' },
    { name: 'التقويم الهجري', icon: <CalendarIcon className="text-blue-600" />, color: 'bg-blue-50', path: '/calendar' },
    { name: 'المساجد القريبة', icon: <MapPin className="text-emerald-600" />, color: 'bg-emerald-50', path: '/mosques' },
    { name: 'الإعدادات', icon: <SettingsIcon className="text-slate-600" />, color: 'bg-slate-50', path: '/settings' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 pb-12"
    >
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-[#5A5A40]">أهلاً بك في تطبيق أذكار المسلم</h2>
        <p className="text-[#8e8e8e] text-lg">حافظ على ذكر الله في كل وقت وحين</p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map((cat) => (
          <Link 
            key={cat.name}
            to={cat.path}
            className={cn(
              "flex flex-col items-center justify-center p-8 rounded-[2.5rem] border border-[#e5e5e0] hover:border-[#5A5A40] transition-all hover:shadow-2xl group relative overflow-hidden",
              cat.color
            )}
          >
            <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-transform">
              {cat.icon}
            </div>
            <span className="font-bold text-lg text-[#5A5A40] text-center">{cat.name}</span>
          </Link>
        ))}
      </div>

      <section className="bg-[#5A5A40] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-6 max-w-2xl">
          <h3 className="text-3xl font-bold italic">فضل الذكر</h3>
          <p className="text-2xl opacity-90 leading-relaxed font-medium">
            "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ"
          </p>
          <p className="text-lg opacity-75 leading-relaxed">
            الذكر هو حياة القلوب، وطمأنينة النفوس، وجلاء الهموم. وهو الحصن الحصين للمسلم في يومه وليله.
          </p>
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </section>
    </motion.div>
  );
}
