import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, MapPin, Camera, AlertCircle, RefreshCw } from 'lucide-react';

export default function Qibla() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [qiblaDir, setQiblaDir] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isAR, setIsAR] = useState(false);

  const MECCA_COORDS = { lat: 21.4225, lon: 39.8262 };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
          calculateQibla(latitude, longitude);
        },
        (err) => {
          setError("يرجى تفعيل خدمة الموقع لتحديد القبلة.");
          console.error(err);
        }
      );
    } else {
      setError("متصفحك لا يدعم تحديد الموقع.");
    }

    const handleOrientation = (e: any) => {
      if (e.webkitCompassHeading) {
        setHeading(e.webkitCompassHeading);
      } else if (e.alpha !== null) {
        setHeading(360 - e.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const calculateQibla = (lat: number, lon: number) => {
    const φ1 = lat * Math.PI / 180;
    const λ1 = lon * Math.PI / 180;
    const φ2 = MECCA_COORDS.lat * Math.PI / 180;
    const λ2 = MECCA_COORDS.lon * Math.PI / 180;

    const y = Math.sin(λ2 - λ1);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(λ2 - λ1);
    let q = Math.atan2(y, x) * 180 / Math.PI;
    q = (q + 360) % 360;
    setQiblaDir(q);
  };

  const relativeQibla = qiblaDir !== null ? (qiblaDir - heading + 360) % 360 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto h-full flex flex-col items-center justify-center space-y-8 p-4"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[#5A5A40]">اتجاه القبلة</h2>
        <p className="text-[#8e8e8e]">استخدم البوصلة لتحديد اتجاه الكعبة المشرفة</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 flex items-center gap-4">
          <AlertCircle size={24} />
          <p className="font-medium">{error}</p>
        </div>
      ) : (
        <div className="relative w-72 h-72 md:w-96 md:h-96">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-8 border-[#e5e5e0] shadow-inner" />
          
          {/* Compass Rose */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ rotate: -heading }}
          >
            <div className="relative w-full h-full">
              <span className="absolute top-4 left-1/2 -translate-x-1/2 font-bold text-[#5A5A40]">N</span>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-bold text-[#8e8e8e]">S</span>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#8e8e8e]">W</span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#8e8e8e]">E</span>
            </div>
          </motion.div>

          {/* Qibla Needle */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: relativeQibla }}
            transition={{ type: 'spring', stiffness: 50 }}
          >
            <div className="relative w-1 h-1/2 -top-1/4 bg-[#5A5A40] rounded-full">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#5A5A40] rounded-full flex items-center justify-center text-white shadow-lg">
                <Compass size={16} />
              </div>
            </div>
          </motion.div>

          {/* Center Point */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-white border-4 border-[#5A5A40] rounded-full z-10 shadow-md" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 w-full">
        <button 
          onClick={() => setIsAR(!isAR)}
          className="flex items-center justify-center gap-2 p-4 bg-white border border-[#e5e5e0] rounded-2xl text-[#5A5A40] font-bold hover:bg-[#f5f5f0] transition-all"
        >
          <Camera size={20} />
          <span>{isAR ? 'إغلاق الواقع المعزز' : 'وضع الواقع المعزز'}</span>
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 p-4 bg-white border border-[#e5e5e0] rounded-2xl text-[#5A5A40] font-bold hover:bg-[#f5f5f0] transition-all"
        >
          <RefreshCw size={20} />
          <span>معايرة البوصلة</span>
        </button>
      </div>

      <div className="bg-[#5A5A40] text-white p-6 rounded-[2rem] w-full space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <MapPin size={20} />
          <span className="font-bold">موقعك الحالي:</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm opacity-90">
          <div>خط العرض: {coords?.lat.toFixed(4) || '...'}</div>
          <div>خط الطول: {coords?.lon.toFixed(4) || '...'}</div>
        </div>
        <div className="pt-4 border-t border-white/20">
          <p className="text-xs opacity-75 leading-relaxed">
            * للحصول على أدق النتائج، يرجى تحريك الهاتف في حركة رقم 8 لمعايرة البوصلة والابتعاد عن الأجسام المعدنية.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
