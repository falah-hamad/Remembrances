import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Target, 
  CheckCircle, 
  Eye, 
  Zap, 
  Users, 
  History, 
  Award, 
  Handshake,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  HelpCircle,
  BookOpen,
  Video,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

export function OurValues() {
  const values = [
    { icon: <Target className="text-orange-500" />, title: 'رؤيتنا', desc: 'أن نكون الرفيق الرقمي الأول لكل مسلم في حياته اليومية، موفرين أدوات تجمع بين الأصالة والتقنية.' },
    { icon: <Zap className="text-indigo-500" />, title: 'رسالتنا', desc: 'تسهيل العبادات اليومية وتقديم محتوى إسلامي موثوق بأسلوب عصري وسهل الاستخدام.' },
    { icon: <CheckCircle className="text-emerald-500" />, title: 'الالتزام بالشريعة', desc: 'جميع محتويات التطبيق مراجعة ومدققة لتتوافق مع أحكام الشريعة الإسلامية الغراء.' },
    { icon: <Shield className="text-blue-500" />, title: 'الشفافية والأمان', desc: 'نلتزم بأعلى معايير الخصوصية وحماية بيانات المستخدمين، مع وضوح تام في سياسات العمل.' },
    { icon: <Award className="text-purple-500" />, title: 'التطوير المستمر', desc: 'نعمل باستمرار على إضافة ميزات جديدة وتحسين الأداء بناءً على ملاحظات واحتياجات مستخدمينا.' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 pb-12"
    >
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-[#5A5A40]">قيمنا ومبادئنا</h2>
        <p className="text-[#8e8e8e] text-lg">الأسس التي نبني عليها خدمتنا للمجتمع الإسلامي</p>
      </section>

      <div className="grid gap-8">
        {values.map((v, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-[#e5e5e0] shadow-sm flex items-start gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#f5f5f0] flex items-center justify-center flex-shrink-0">
              {v.icon}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#5A5A40]">{v.title}</h3>
              <p className="text-[#5c5c5c] leading-relaxed">{v.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function AboutUs() {
  const stats = [
    { label: 'مستخدم نشط', value: '+100,000' },
    { label: 'سورة قرآنية', value: '114' },
    { label: 'ذكر ودعاء', value: '+500' },
    { label: 'دولة حول العالم', value: '50' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-16 pb-12"
    >
      <section className="text-center space-y-6">
        <h2 className="text-4xl font-bold text-[#5A5A40]">من نحن</h2>
        <div className="bg-white p-10 rounded-[3rem] border border-[#e5e5e0] shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-6 text-right">
            <p className="text-lg text-[#5c5c5c] leading-relaxed">
              نحن فريق من المطورين والمصممين المسلمين الذين جمعهم شغف واحد: تسخير التقنية لخدمة الدين. بدأنا كفكرة بسيطة لتطبيق أذكار، وتطورنا لنصبح منصة شاملة تخدم المسلم في كل جوانب حياته التعبدية.
            </p>
            <p className="text-lg text-[#5c5c5c] leading-relaxed">
              قصتنا بدأت من الحاجة لتطبيق يجمع بين الجمال البصري، سهولة الاستخدام، ودقة المعلومات. نحن نؤمن أن الأدوات الرقمية يجب أن تكون وسيلة للسكينة والهدوء، لا مصدراً للتشتت.
            </p>
          </div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#5A5A40]/5 rounded-full blur-3xl" />
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#5A5A40] p-6 rounded-3xl text-white text-center space-y-2">
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs opacity-80">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="space-y-8">
        <h3 className="text-2xl font-bold text-[#5A5A40] text-center">شركاء النجاح</h3>
        <div className="flex flex-wrap justify-center gap-6">
          {['مجمع الملك فهد', 'رابطة العالم الإسلامي', 'جامعة أم القرى', 'مركز الفجر التقني'].map((partner, i) => (
            <div key={i} className="bg-white px-6 py-4 rounded-2xl border border-[#e5e5e0] text-[#5c5c5c] font-medium shadow-sm">
              {partner}
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

export function Help() {
  const faqs = [
    { q: 'كيف يمكنني تغيير لغة التطبيق؟', a: 'يمكنك تغيير اللغة من خلال صفحة الإعدادات، حيث ندعم حالياً العربية والإنجليزية.' },
    { q: 'هل يعمل التطبيق بدون إنترنت؟', a: 'نعم، معظم ميزات التطبيق مثل الأذكار والقرآن والمسبحة تعمل بدون إنترنت. ميزات الخرائط والذكاء الاصطناعي تتطلب اتصالاً.' },
    { q: 'كيف يتم تحديد اتجاه القبلة؟', a: 'نستخدم بوصلة الهاتف وبيانات GPS لتحديد موقعك وحساب الزاوية الدقيقة للكعبة المشرفة.' },
    { q: 'هل بياناتي الشخصية آمنة؟', a: 'نعم، نحن لا نشارك بياناتك مع أي طرف ثالث، ونستخدم تشفيراً قوياً لحماية معلوماتك.' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 pb-12"
    >
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-[#5A5A40]">مركز المساعدة</h2>
        <p className="text-[#8e8e8e]">كل ما تحتاجه لفهم واستخدام التطبيق بشكل أفضل</p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-[#5A5A40] flex items-center gap-2">
            <HelpCircle size={24} />
            الأسئلة الشائعة
          </h3>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-[#e5e5e0] shadow-sm">
                <h4 className="font-bold text-[#5A5A40] mb-2">{f.q}</h4>
                <p className="text-sm text-[#5c5c5c]">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-[#5A5A40] flex items-center gap-2">
            <Video size={24} />
            فيديوهات تعليمية
          </h3>
          <div className="aspect-video bg-[#5A5A40]/10 rounded-3xl flex items-center justify-center border-2 border-dashed border-[#5A5A40]/30">
            <div className="text-center space-y-2">
              <Video size={48} className="mx-auto text-[#5A5A40]" />
              <p className="text-[#5A5A40] font-medium">قريباً: شروحات مرئية</p>
            </div>
          </div>

          <div className="bg-[#5A5A40] p-8 rounded-3xl text-white space-y-4">
            <h4 className="text-xl font-bold flex items-center gap-2">
              <Lightbulb size={20} />
              اقتراح ميزة
            </h4>
            <p className="text-sm opacity-90">هل لديك فكرة تجعل التطبيق أفضل؟ نحن نحب سماع اقتراحاتكم!</p>
            <button className="bg-white text-[#5A5A40] px-6 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all">
              أرسل اقتراحك
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 pb-12"
    >
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-[#5A5A40]">تواصل معنا</h2>
        <p className="text-[#8e8e8e]">نحن هنا للإجابة على استفساراتكم ومساعدتكم</p>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-[#e5e5e0] shadow-xl space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5A5A40]">الاسم</label>
                <input 
                  type="text" 
                  className="w-full p-3 rounded-xl border border-[#e5e5e0] focus:border-[#5A5A40] outline-none transition-all"
                  placeholder="أدخل اسمك"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5A5A40]">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  className="w-full p-3 rounded-xl border border-[#e5e5e0] focus:border-[#5A5A40] outline-none transition-all"
                  placeholder="example@mail.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#5A5A40]">الموضوع</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-[#e5e5e0] focus:border-[#5A5A40] outline-none transition-all"
                placeholder="كيف يمكننا مساعدتك؟"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#5A5A40]">الرسالة</label>
              <textarea 
                rows={5}
                className="w-full p-3 rounded-xl border border-[#e5e5e0] focus:border-[#5A5A40] outline-none transition-all resize-none"
                placeholder="اكتب رسالتك هنا..."
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold hover:bg-[#4a4a35] transition-all shadow-lg shadow-[#5A5A40]/20"
            >
              {sent ? 'تم الإرسال بنجاح!' : 'إرسال الرسالة'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e5e5e0] shadow-sm space-y-4">
            <h3 className="font-bold text-[#5A5A40]">معلومات التواصل</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-[#5c5c5c]">
                <Mail size={18} className="text-[#5A5A40]" />
                <span>support@azkarapp.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5c5c5c]">
                <Phone size={18} className="text-[#5A5A40]" />
                <span>+966 50 000 0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5c5c5c]">
                <Globe size={18} className="text-[#5A5A40]" />
                <span>www.azkarapp.com</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e5e5e0] shadow-sm space-y-4">
            <h3 className="font-bold text-[#5A5A40]">تابعنا على</h3>
            <div className="flex justify-between">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <div key={social} className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white transition-all cursor-pointer">
                  <Globe size={20} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
