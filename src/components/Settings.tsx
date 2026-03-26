import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Type, 
  Shield, 
  Database, 
  Trash2, 
  Save, 
  RefreshCw, 
  ChevronRight,
  Monitor,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface SettingsProps {
  profile: UserProfile | null;
}

export default function Settings({ profile }: SettingsProps) {
  const [settings, setSettings] = useState(profile?.settings || {
    language: 'ar',
    theme: 'system',
    fontSize: 'medium',
    notifications: true,
    locationAccuracy: 'high'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile?.settings) {
      setSettings(profile.settings);
    }
  }, [profile]);

  const handleSave = async (newSettings: any) => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const userDoc = doc(db, 'users', profile.uid);
      await updateDoc(userDoc, { settings: newSettings });
      setSettings(newSettings);
      setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });
    } catch (error) {
      console.error("Settings error:", error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ الإعدادات' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    handleSave(newSettings);
  };

  const sections = [
    {
      title: 'التنبيهات والإشعارات',
      icon: <Bell className="text-amber-500" />,
      items: [
        {
          label: 'تفعيل إشعارات الصلاة',
          desc: 'تلقي تنبيهات عند دخول وقت كل صلاة',
          type: 'toggle',
          value: settings.notifications,
          onChange: (v: boolean) => updateSetting('notifications', v)
        }
      ]
    },
    {
      title: 'المظهر والسمات',
      icon: <Sun className="text-indigo-500" />,
      items: [
        {
          label: 'الوضع الليلي',
          desc: 'اختر المظهر المفضل للتطبيق',
          type: 'select',
          options: [
            { label: 'فاتح', value: 'light', icon: <Sun size={16} /> },
            { label: 'داكن', value: 'dark', icon: <Moon size={16} /> },
            { label: 'تلقائي', value: 'system', icon: <Monitor size={16} /> }
          ],
          value: settings.theme,
          onChange: (v: string) => updateSetting('theme', v)
        },
        {
          label: 'حجم الخط',
          desc: 'تعديل حجم النصوص داخل التطبيق',
          type: 'select',
          options: [
            { label: 'صغير', value: 'small' },
            { label: 'متوسط', value: 'medium' },
            { label: 'كبير', value: 'large' }
          ],
          value: settings.fontSize,
          onChange: (v: string) => updateSetting('fontSize', v)
        }
      ]
    },
    {
      title: 'اللغة والموقع',
      icon: <Globe className="text-emerald-500" />,
      items: [
        {
          label: 'لغة التطبيق',
          desc: 'اختر اللغة المفضلة للواجهة',
          type: 'select',
          options: [
            { label: 'العربية', value: 'ar' },
            { label: 'English', value: 'en' }
          ],
          value: settings.language,
          onChange: (v: string) => updateSetting('language', v)
        },
        {
          label: 'دقة تحديد الموقع',
          desc: 'توفير البطارية أو الحصول على أدق النتائج',
          type: 'select',
          options: [
            { label: 'عالية (GPS)', value: 'high' },
            { label: 'منخفضة (شبكة)', value: 'low' }
          ],
          value: settings.locationAccuracy,
          onChange: (v: string) => updateSetting('locationAccuracy', v)
        }
      ]
    },
    {
      title: 'البيانات والنسخ الاحتياطي',
      icon: <Database className="text-blue-500" />,
      items: [
        {
          label: 'نسخ احتياطي للبيانات',
          desc: 'حفظ إعداداتك ومواقعك المفضلة سحابياً',
          type: 'action',
          action: () => handleSave(settings),
          icon: <Save size={18} />
        },
        {
          label: 'استعادة البيانات',
          desc: 'استرجاع آخر نسخة محفوظة من السحابة',
          type: 'action',
          action: () => window.location.reload(),
          icon: <RefreshCw size={18} />
        }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-[#5A5A40]">الإعدادات</h2>
        <p className="text-[#8e8e8e]">خصص التطبيق ليناسب احتياجاتك وتفضيلاتك</p>
      </section>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-2xl flex items-center gap-3 border shadow-sm",
            message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
          )}
        >
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{message.text}</span>
        </motion.div>
      )}

      <div className="space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-[#e5e5e0] shadow-sm overflow-hidden">
            <div className="p-6 bg-[#fcfcf9] border-b border-[#e5e5e0] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#e5e5e0] flex items-center justify-center shadow-sm">
                {section.icon}
              </div>
              <h3 className="text-xl font-bold text-[#5A5A40]">{section.title}</h3>
            </div>
            <div className="divide-y divide-[#e5e5e0]">
              {section.items.map((item, j) => (
                <div key={j} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#fcfcf9] transition-all">
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#5A5A40]">{item.label}</h4>
                    <p className="text-sm text-[#8e8e8e]">{item.desc}</p>
                  </div>
                  
                  {item.type === 'toggle' && (
                    <button 
                      onClick={() => item.onChange(!item.value)}
                      className={cn(
                        "w-14 h-8 rounded-full relative transition-all",
                        item.value ? "bg-[#5A5A40]" : "bg-[#e5e5e0]"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm",
                        item.value ? "right-7" : "right-1"
                      )} />
                    </button>
                  )}

                  {item.type === 'select' && (
                    <div className="flex gap-2 bg-[#f5f5f0] p-1 rounded-xl">
                      {item.options?.map((opt: any) => (
                        <button 
                          key={opt.value}
                          onClick={() => item.onChange(opt.value)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            item.value === opt.value ? "bg-white text-[#5A5A40] shadow-sm" : "text-[#8e8e8e] hover:text-[#5A5A40]"
                          )}
                        >
                          {opt.icon}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {item.type === 'action' && (
                    <button 
                      onClick={item.action}
                      className="flex items-center gap-2 px-6 py-2 bg-[#f5f5f0] text-[#5A5A40] rounded-xl font-bold hover:bg-[#e5e5e0] transition-all"
                    >
                      {item.icon}
                      <span>تنفيذ</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-right">
          <h4 className="text-xl font-bold text-red-700">منطقة الخطر</h4>
          <p className="text-sm text-red-600">حذف جميع البيانات والنسخ الاحتياطية نهائياً</p>
        </div>
        <button className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
          <Trash2 size={20} />
          <span>حذف الحساب</span>
        </button>
      </div>
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
