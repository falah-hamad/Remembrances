import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Search, ChevronRight, ChevronLeft, ChevronDown, Settings, List, Info, X, Play, Pause, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  surah?: {
    number: number;
    name: string;
    englishName: string;
  };
}

interface Tafsir {
  text: string;
  ayahNumber: number;
}

export default function QuranReader() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [allAyahs, setAllAyahs] = useState<Ayah[]>([]); // Store all ayahs of selected surah
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('quran_fontSize') || '26'));
  const [showSettings, setShowSettings] = useState(false);
  const [viewType, setViewType] = useState<'mushaf' | 'text'>(() => (localStorage.getItem('quran_viewType') as any) || 'text');
  const [showTranslation, setShowTranslation] = useState(() => localStorage.getItem('quran_showTranslation') === 'true');
  const [translations, setTranslations] = useState<{[key: number]: string}>({});
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [jumpPage, setJumpPage] = useState('');
  const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState<Ayah | null>(null);
  const [tafsir, setTafsir] = useState<Tafsir | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'surah' | 'juz' | 'page'>('surah');
  const [navDirection, setNavDirection] = useState<'horizontal' | 'vertical'>(() => (localStorage.getItem('quran_navDirection') as any) || 'horizontal');
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>(() => (localStorage.getItem('quran_theme') as any) || 'light');
  const [showUI, setShowUI] = useState(true);
  
  useEffect(() => {
    localStorage.setItem('quran_viewType', viewType);
  }, [viewType]);

  useEffect(() => {
    localStorage.setItem('quran_showTranslation', showTranslation.toString());
  }, [showTranslation]);

  useEffect(() => {
    localStorage.setItem('quran_navDirection', navDirection);
  }, [navDirection]);

  useEffect(() => {
    localStorage.setItem('quran_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('quran_fontSize', fontSize.toString());
  }, [fontSize]);
  
  useEffect(() => {
    if (!showUI) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showUI]);

  useEffect(() => {
    fetchSurahs();
  }, []);

  const fetchSurahs = async () => {
    setInitialLoading(true);
    try {
      const res = await fetch('/api/proxy/surahs');
      const data = await res.json();
      const mappedSurahs = data.map((s: any) => ({
        number: parseInt(s.number),
        name: s.name_ar,
        englishName: s.name_en,
        englishNameTranslation: '', 
        numberOfAyahs: parseInt(s.ayat_count),
        revelationType: s.type
      }));
      setSurahs(mappedSurahs);
    } catch (err) {
      console.error('Error fetching surahs:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to top when page changes
    const container = document.querySelector('.custom-scrollbar');
    if (container) {
      container.scrollTop = 0;
    }
  }, [currentPage, selectedSurah]);

  const fetchSurahContent = async (number: number) => {
    setLoading(true);
    setImageError(false);
    setSelectedSurah(number);
    setCurrentPage(null);
    setTranslations({});
    try {
      const [res, transRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`),
        showTranslation ? fetch(`https://api.alquran.cloud/v1/surah/${number}/en.sahih`) : Promise.resolve(null)
      ]);
      
      const data = await res.json();
      const surahAyahs = data.data.ayahs;
      setAllAyahs(surahAyahs);

      if (transRes) {
        const transData = await transRes.json();
        const transMap: {[key: number]: string} = {};
        transData.data.ayahs.forEach((a: any) => {
          transMap[a.numberInSurah] = a.text;
        });
        setTranslations(transMap);
      }

      if (surahAyahs.length > 0) {
        setCurrentPage(surahAyahs[0].page);
      }
    } catch (err) {
      console.error('Error fetching surah content:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageContent = async (page: number) => {
    setLoading(true);
    setImageError(false);
    setCurrentPage(page);
    setSelectedSurah(null);
    setAllAyahs([]);
    setTranslations({});
    try {
      const [res, transRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`),
        showTranslation ? fetch(`https://api.alquran.cloud/v1/page/${page}/en.sahih`) : Promise.resolve(null)
      ]);
      
      const data = await res.json();
      setAllAyahs(data.data.ayahs);

      if (transRes) {
        const transData = await transRes.json();
        const transMap: {[key: number]: string} = {};
        transData.data.ayahs.forEach((a: any) => {
          transMap[a.numberInSurah] = a.text;
        });
        setTranslations(transMap);
      }
    } catch (err) {
      console.error('Error fetching page content:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTafsir = async (ayah: Ayah) => {
    setTafsirLoading(true);
    setSelectedAyahForTafsir(ayah);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayah.number}/ar.jalalayn`);
      const data = await res.json();
      setTafsir({ text: data.data.text, ayahNumber: ayah.numberInSurah });
    } catch (err) {
      console.error('Error fetching tafsir:', err);
    } finally {
      setTafsirLoading(false);
    }
  };

  const playAyahAudio = async (ayah: Ayah) => {
    if (playingAyah === ayah.number) {
      audio?.pause();
      setPlayingAyah(null);
      return;
    }

    if (audio) {
      audio.pause();
    }

    const newAudio = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`);
    setAudio(newAudio);
    setPlayingAyah(ayah.number);
    
    newAudio.play();
    newAudio.onended = () => {
      setPlayingAyah(null);
    };
  };

  const playPageAudio = async (ayahs: Ayah[]) => {
    if (playingAyah) {
      audio?.pause();
      setPlayingAyah(null);
      return;
    }

    let currentIndex = 0;
    const playNext = () => {
      if (currentIndex >= ayahs.length) {
        setPlayingAyah(null);
        return;
      }

      const ayah = ayahs[currentIndex];
      const newAudio = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`);
      setAudio(newAudio);
      setPlayingAyah(ayah.number);
      
      newAudio.play();
      newAudio.onended = () => {
        currentIndex++;
        playNext();
      };
    };

    playNext();
  };

  const fetchJuzContent = async (juz: number) => {
    setLoading(true);
    setImageError(false);
    setSelectedSurah(null);
    setCurrentPage(null);
    setAllAyahs([]);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/juz/${juz}/quran-uthmani`);
      const data = await res.json();
      setAllAyahs(data.data.ayahs);
    } catch (err) {
      console.error('Error fetching juz content:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.name.includes(searchQuery) || 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString() === searchQuery
  );

  const toArabicNumber = (num: number) => {
    return num.toLocaleString('ar-EG');
  };

  const renderAyahEnd = (num: number) => {
    return <span className="ayah-end">{toArabicNumber(num)}</span>;
  };

  if (selectedSurah || currentPage) {
    const displayedAyahs = selectedSurah 
      ? allAyahs.filter(a => a.page === currentPage)
      : allAyahs;

    const pageNum = currentPage || (displayedAyahs.length > 0 ? displayedAyahs[0].page : 1);
    const surah = selectedSurah ? surahs.find(s => s.number === selectedSurah) : (displayedAyahs.length > 0 ? displayedAyahs[0].surah : null);
    const hizbQuarter = displayedAyahs.length > 0 ? displayedAyahs[0].hizbQuarter : 0;
    const juz = displayedAyahs.length > 0 ? displayedAyahs[0].juz : 0;
    const hizb = hizbQuarter ? Math.ceil(hizbQuarter / 4) : 0;

    const pagePadded = pageNum.toString().padStart(3, '0');
    // Use Mushaf Madinah GitHub as primary source (very reliable)
    const mushafImageUrl = `https://raw.githubusercontent.com/mushaf-madinah/mushaf-madinah-images/master/images/${pagePadded}.png`;

    // Determine if there's a next/prev page within the surah
    const surahPages = selectedSurah ? Array.from(new Set(allAyahs.map(a => a.page))).sort((a, b) => a - b) : [];
    const currentPageIdx = surahPages.indexOf(currentPage || 0);
    const hasNextSurahPage = selectedSurah && currentPageIdx < surahPages.length - 1;
    const hasPrevSurahPage = selectedSurah && currentPageIdx > 0;

    // Determine global next/prev page
    const hasNextGlobalPage = pageNum < 604;
    const hasPrevGlobalPage = pageNum > 1;

    const handleNextPage = () => {
      if (selectedSurah && hasNextSurahPage) {
        setCurrentPage(surahPages[currentPageIdx + 1]);
      } else if (!selectedSurah && hasNextGlobalPage) {
        fetchPageContent(pageNum + 1);
      }
    };

    const handlePrevPage = () => {
      if (selectedSurah && hasPrevSurahPage) {
        setCurrentPage(surahPages[currentPageIdx - 1]);
      } else if (!selectedSurah && hasPrevGlobalPage) {
        fetchPageContent(pageNum - 1);
      }
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "mx-auto flex flex-col h-[100dvh] overflow-hidden transition-all duration-500",
          theme === 'light' ? "bg-white" : theme === 'sepia' ? "bg-[#f4ecd8]" : "bg-[#1a1a1a] text-gray-300",
          showUI ? "max-w-5xl relative" : "!fixed !inset-0 !z-[99999] !w-[100vw] !h-[100vh] !max-w-none !m-0 !p-0 !transform-none"
        )}
      >
        <AnimatePresence>
          {showUI && (
            <motion.header 
              initial={{ y: -64, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -64, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 150 }}
              className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-b border-[#e5e5e0] bg-white z-30 h-16"
            >
              <div className="flex items-center gap-2 flex-1">
                <button 
                  onClick={() => { setSelectedSurah(null); setCurrentPage(null); setAllAyahs([]); }}
                  className="p-2 hover:bg-[#f5f5f0] rounded-full transition-colors text-[#5A5A40]"
                >
                  <ChevronRight size={22} />
                </button>
                <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors">
                  <h2 className="text-lg font-bold text-black">{surah?.number}. {surah?.name}</h2>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-medium text-gray-600 flex-1 justify-center">
                <div className="flex items-center gap-1">
                  <span>صفحة</span>
                  <input 
                    type="number" 
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const p = parseInt(jumpPage);
                        if (p >= 1 && p <= 604) fetchPageContent(p);
                        setJumpPage('');
                      }
                    }}
                    placeholder={pageNum.toString()}
                    className="w-10 px-1 py-0.5 text-center bg-gray-100 rounded outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div className="h-4 w-[1px] bg-gray-200" />
                <span>جزء {toArabicNumber(juz || 0)}</span>
                <div className="h-4 w-[1px] bg-gray-200" />
                <span>حزب {toArabicNumber(hizb || 0)}</span>
              </div>

              <div className="flex items-center gap-2 flex-1 justify-end">
                <button 
                  onClick={() => playPageAudio(displayedAyahs)}
                  className={cn(
                    "p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1",
                    playingAyah ? "text-emerald-600" : "text-gray-600"
                  )}
                  title="تشغيل الصفحة"
                >
                  {playingAyah ? <Pause size={20} /> : <Volume2 size={20} />}
                  <span className="text-xs font-bold">استماع</span>
                </button>
                {viewType === 'mushaf' && displayedAyahs.length > 0 && (
                  <button 
                    onClick={() => fetchTafsir(displayedAyahs[0])}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 flex items-center gap-1"
                    title="تفسير الصفحة"
                  >
                    <Info size={20} />
                    <span className="text-xs font-bold">تفسير</span>
                  </button>
                )}
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                  <Settings size={20} />
                </button>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSettings && showUI && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 left-4 right-4 bg-white p-6 rounded-2xl border border-[#e5e5e0] shadow-xl space-y-6 z-40"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#5A5A40]">نوع العرض</span>
                <div className="flex bg-[#f5f5f0] p-1 rounded-xl">
                  <button 
                    onClick={() => setViewType('mushaf')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      viewType === 'mushaf' ? "bg-[#5A5A40] text-white shadow-sm" : "text-[#8e8e8e]"
                    )}
                  >
                    مصحف
                  </button>
                  <button 
                    onClick={() => setViewType('text')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      viewType === 'text' ? "bg-[#5A5A40] text-white shadow-sm" : "text-[#8e8e8e]"
                    )}
                  >
                    نصي
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-[#5A5A40]">السمة</span>
                <div className="flex bg-[#f5f5f0] p-1 rounded-xl">
                  {[
                    { id: 'light', label: 'فاتح', color: 'bg-white' },
                    { id: 'sepia', label: 'قديم', color: 'bg-[#f4ecd8]' },
                    { id: 'dark', label: 'داكن', color: 'bg-[#1a1a1a]' }
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                        theme === t.id ? "bg-[#5A5A40] text-white shadow-sm" : "text-[#8e8e8e]"
                      )}
                    >
                      <div className={cn("w-3 h-3 rounded-full border border-gray-300", t.color)} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-[#5A5A40]">الترجمة (الإنجليزية)</span>
                <button 
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    showTranslation ? "bg-[#5A5A40]" : "bg-gray-200"
                  )}
                >
                  <motion.div 
                    animate={{ x: showTranslation ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {viewType === 'text' && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5A5A40]">حجم الخط</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setFontSize(Math.max(16, fontSize - 2))} className="p-2 bg-[#f5f5f0] rounded-lg">-</button>
                    <span className="font-mono">{fontSize}px</span>
                    <button onClick={() => setFontSize(Math.min(50, fontSize + 2))} className="p-2 bg-[#f5f5f0] rounded-lg">+</button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="font-bold text-[#5A5A40]">طريقة التقليب</span>
                <div className="flex bg-[#f5f5f0] p-1 rounded-xl">
                  <button 
                    onClick={() => setNavDirection('horizontal')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      navDirection === 'horizontal' ? "bg-white text-[#5A5A40] shadow-sm" : "text-[#8e8e8e]"
                    )}
                  >
                    أفقي
                  </button>
                  <button 
                    onClick={() => setNavDirection('vertical')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      navDirection === 'vertical' ? "bg-white text-[#5A5A40] shadow-sm" : "text-[#8e8e8e]"
                    )}
                  >
                    عمودي
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main 
          className={cn(
            "flex-1 relative overflow-hidden transition-all duration-500",
            theme === 'light' ? "bg-[#f4f1ea]" : theme === 'sepia' ? "bg-[#f4ecd8]" : "bg-[#1a1a1a]",
            showUI ? "mt-16" : "mt-0"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageNum}
              initial={{ x: navDirection === 'horizontal' ? 100 : 0, y: navDirection === 'vertical' ? 100 : 0, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{ x: navDirection === 'horizontal' ? -100 : 0, y: navDirection === 'vertical' ? -100 : 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "w-full h-full flex flex-col",
                theme === 'light' ? "bg-white" : theme === 'sepia' ? "bg-[#f4ecd8]" : "bg-[#1a1a1a]"
              )}
              drag={navDirection === 'horizontal' ? 'x' : 'y'}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onTap={() => setShowUI(!showUI)}
              onDragEnd={(_, info) => {
                const threshold = 50;
                if (navDirection === 'horizontal') {
                  if (info.offset.x > threshold) handlePrevPage();
                  else if (info.offset.x < -threshold) handleNextPage();
                } else {
                  if (info.offset.y > threshold) handlePrevPage();
                  else if (info.offset.y < -threshold) handleNextPage();
                }
              }}
            >
              {loading && displayedAyahs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#5A5A40] font-bold animate-pulse">جاري تحميل الصفحة...</p>
                  </div>
                </div>
              ) : viewType === 'mushaf' && !imageError ? (
                <div className={cn("mushaf-page-container", theme === 'light' ? "!bg-[#fdfbf0]" : theme === 'sepia' ? "!bg-[#f4ecd8]" : "!bg-[#1a1a1a]", !showUI && "!p-0 !m-0")}>
                  <div className={cn(
                    "mushaf-image-wrapper transition-all duration-500", 
                    theme === 'sepia' && "sepia-[0.3]",
                    theme === 'dark' && "invert brightness-90",
                    !showUI && "!w-full !h-full !max-w-[min(100vw,calc(100vh/1.5))] !mx-auto !border-none !shadow-none !rounded-none !aspect-auto !min-h-0"
                  )}>
                    <div className={cn("mushaf-decorative-frame", !showUI && "!inset-1 opacity-10")} />
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#fdfbf0] z-10">
                        <div className="w-8 h-8 border-3 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <img 
                      src={mushafImageUrl} 
                      alt={`Quran Page ${pageNum}`}
                      className={cn("mushaf-image", !showUI && "!object-contain")}
                      referrerPolicy="no-referrer"
                      onLoad={() => {
                        setLoading(false);
                        setImageError(false);
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error("Image failed to load:", target.src);
                        
                        // Fallback chain
                        if (target.src.includes('mushaf-madinah-images')) {
                          target.src = `https://images.quran.com/images/quran/page${pagePadded}.png`;
                        } else if (target.src.includes('images.quran.com')) {
                          target.src = `https://www.everyayah.com/data/quran_pages_png/${pagePadded}.png`;
                        } else if (target.src.includes('everyayah.com')) {
                          target.src = `https://raw.githubusercontent.com/globalquran/quran-images/master/images-1024/${pageNum}.png`;
                        } else {
                          setImageError(true);
                          setLoading(false);
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className={cn("mushaf-page-container", theme === 'light' ? "!bg-white" : theme === 'sepia' ? "!bg-[#f4ecd8]" : "!bg-[#1a1a1a]", !showUI && "!p-0 !m-0")}>
                  <div className={cn(
                    "transition-all duration-500 flex flex-col", 
                    !showUI ? "!w-full !h-full !max-w-none !p-4 md:!p-8" : "text-mushaf-wrapper",
                    theme === 'light' ? "bg-white" : theme === 'sepia' ? "bg-[#f4ecd8]" : "bg-[#1a1a1a]"
                  )}>
                    {showUI && <div className="mushaf-decorative-frame" />}
                    
                    {imageError && viewType === 'mushaf' && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                        تعذر تحميل الصورة، تم التحويل للعرض النصي
                      </div>
                    )}

                    <div className="flex-1 flex flex-col overflow-hidden py-6">
                      <div 
                        className={cn(
                          "quran-text-exact h-full px-6 md:px-12",
                          theme === 'dark' && "text-white"
                        )}
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {displayedAyahs.map((ayah, index) => {
                          const isFirstAyahOfSurah = ayah.numberInSurah === 1;
                          const isNewSurahOnPage = index > 0 && ayah.surah?.number !== displayedAyahs[index-1].surah?.number;
                          const shouldShowSurahHeader = isFirstAyahOfSurah && (index === 0 || isNewSurahOnPage);

                          return (
                            <span key={ayah.number}>
                              {shouldShowSurahHeader && (
                                <div className={cn(
                                  "surah-header-mushaf",
                                  theme === 'dark' && "bg-gray-800 border-gray-700 text-white"
                                )}>
                                  <h3 className={cn(theme === 'dark' && "text-white")}>{ayah.surah?.name}</h3>
                                  {ayah.surah?.number !== 9 && ayah.surah?.number !== 1 && (
                                    <div className={cn("bismillah-mushaf", theme === 'dark' && "text-white")}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                                  )}
                                </div>
                              )}
                              <span 
                                onClick={(e) => { e.stopPropagation(); fetchTafsir(ayah); }}
                                className={cn(
                                  "inline cursor-pointer hover:bg-[#5A5A40]/5 transition-colors rounded px-0.5 relative group",
                                  playingAyah === ayah.number && "bg-emerald-50 text-emerald-700",
                                  theme === 'dark' && playingAyah === ayah.number && "bg-emerald-900/30 text-emerald-400"
                                )}
                              >
                                {isFirstAyahOfSurah && ayah.surah?.number !== 1 && ayah.surah?.number !== 9
                                  ? ayah.text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '')
                                  : ayah.text
                                }
                                {renderAyahEnd(ayah.numberInSurah)}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); playAyahAudio(ayah); }}
                                  className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 bg-white border border-gray-200 rounded-full shadow-sm transition-all"
                                >
                                  {playingAyah === ayah.number ? <Pause size={12} /> : <Play size={12} />}
                                </button>
                                {showTranslation && translations[ayah.numberInSurah] && (
                                  <div className="translation-text">
                                    {translations[ayah.numberInSurah]}
                                  </div>
                                )}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Floating Navigation Buttons like in the image */}
          <AnimatePresence>
            {showUI && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="absolute bottom-6 left-6 flex flex-col gap-2 z-20"
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrevPage(); }}
                  disabled={!hasPrevGlobalPage && (!selectedSurah || !hasPrevSurahPage)}
                  className="p-3 bg-black/80 text-white rounded-lg shadow-lg hover:bg-black disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNextPage(); }}
                  disabled={!hasNextGlobalPage && (!selectedSurah || !hasNextSurahPage)}
                  className="p-3 bg-black/80 text-white rounded-lg shadow-lg hover:bg-black disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {selectedAyahForTafsir && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedAyahForTafsir(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-white border-b border-gray-100 p-6 text-black flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Info size={24} className="text-gray-400" />
                    <h3 className="text-xl font-bold">تفسير الجلالين</h3>
                  </div>
                  <button onClick={() => setSelectedAyahForTafsir(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto bg-white">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-2xl text-black font-quran leading-relaxed text-right">
                      {selectedAyahForTafsir.text}
                    </p>
                  </div>
                  {tafsirLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-lg text-gray-800 leading-loose text-right">
                        {tafsir?.text}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-[#5A5A40] text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
          <Book size={40} />
        </div>
        <h2 className="text-4xl font-bold text-[#5A5A40]">القرآن الكريم</h2>
        <p className="text-[#8e8e8e]">تصفح المصحف الشريف بالرسم العثماني</p>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
        <div className="flex bg-white p-1 rounded-2xl border border-[#e5e5e0] shadow-sm">
          <button 
            onClick={() => setViewMode('surah')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all",
              viewMode === 'surah' ? "bg-[#5A5A40] text-white shadow-md" : "text-[#5c5c5c] hover:bg-[#f5f5f0]"
            )}
          >
            السور
          </button>
          <button 
            onClick={() => setViewMode('juz')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all",
              viewMode === 'juz' ? "bg-[#5A5A40] text-white shadow-md" : "text-[#5c5c5c] hover:bg-[#f5f5f0]"
            )}
          >
            الأجزاء
          </button>
          <button 
            onClick={() => setViewMode('page')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all",
              viewMode === 'page' ? "bg-[#5A5A40] text-white shadow-md" : "text-[#5c5c5c] hover:bg-[#f5f5f0]"
            )}
          >
            الصفحات
          </button>
        </div>

        {viewMode === 'surah' && (
          <div className="relative flex-1 min-w-[300px]">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن سورة بالاسم أو الرقم..."
              className="w-full p-4 pr-12 rounded-2xl border border-[#e5e5e0] outline-none focus:border-[#5A5A40] shadow-sm"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e8e8e]" size={20} />
          </div>
        )}
      </div>

      {viewMode === 'surah' && !searchQuery && (
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          <span className="text-sm text-gray-400 ml-2">روابط سريعة:</span>
          {[
            { name: 'الكهف', number: 18 },
            { name: 'يس', number: 36 },
            { name: 'الملك', number: 67 },
            { name: 'الواقعة', number: 56 },
            { name: 'الرحمن', number: 55 }
          ].map(link => (
            <button 
              key={link.number}
              onClick={() => fetchSurahContent(link.number)}
              className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#5A5A40] hover:text-[#5A5A40] transition-all"
            >
              {link.name}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#5A5A40] font-bold">جاري تحميل قائمة السور...</p>
          </div>
        ) : surahs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-500 font-bold">حدث خطأ في تحميل البيانات. يرجى التأكد من الاتصال بالإنترنت.</p>
            <button onClick={fetchSurahs} className="px-6 py-2 bg-[#5A5A40] text-white rounded-xl">إعادة المحاولة</button>
          </div>
        ) : viewMode === 'surah' && (
          <motion.div 
            key="surahs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredSurahs.map((surah) => (
              <motion.button
                key={surah.number}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchSurahContent(surah.number)}
                className="flex items-center gap-4 p-6 bg-white rounded-[2rem] border border-[#e5e5e0] hover:border-[#5A5A40] transition-all hover:shadow-lg text-right group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#f5f5f0] text-[#5A5A40] font-bold flex items-center justify-center group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                  {surah.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#5A5A40]">{surah.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[#8e8e8e]">{surah.englishName}</p>
                    <span className="text-[10px] text-[#8e8e8e] opacity-60">•</span>
                    <p className="text-[10px] text-[#8e8e8e] uppercase tracking-wider">
                      {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-xs bg-[#f5f5f0] text-[#5c5c5c] px-3 py-1 rounded-full">
                    {surah.numberOfAyahs} آية
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {viewMode === 'juz' && (
          <motion.div 
            key="juzs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
              <motion.button
                key={juz}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchJuzContent(juz)}
                className="p-8 bg-white rounded-[2rem] border border-[#e5e5e0] hover:border-[#5A5A40] transition-all hover:shadow-lg text-center"
              >
                <div className="text-2xl font-bold text-[#5A5A40]">الجزء</div>
                <div className="text-4xl font-bold text-[#5A5A40] mt-2">{toArabicNumber(juz)}</div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {viewMode === 'page' && (
          <motion.div 
            key="pages"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
          >
            {Array.from({ length: 604 }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fetchPageContent(page)}
                className="p-4 bg-white rounded-xl border border-[#e5e5e0] hover:border-[#5A5A40] transition-all hover:shadow-md text-center"
              >
                <div className="text-sm text-[#8e8e8e] mb-1">صفحة</div>
                <div className="text-xl font-bold text-[#5A5A40]">{toArabicNumber(page)}</div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
