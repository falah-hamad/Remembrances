import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Search, MapPin } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function GeminiChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'السلام عليكم! أنا مساعدك الإسلامي الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن الأذكار، الأدعية، أو حتى البحث عن مساجد قريبة.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: userMsg }] }],
        config: {
          systemInstruction: "أنت مساعد إسلامي ذكي، لبق، ومحترم. تقدم معلومات دقيقة بناءً على القرآن والسنة. استخدم أدوات البحث (Google Search) للمعلومات الحديثة أو (Google Maps) للمواقع عند الطلب. أجب باللغة العربية الفصحى وبأسلوب جميل.",
          tools: [{ googleSearch: {} }, { googleMaps: {} }],
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'عذراً، لم أستطع فهم ذلك.' }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col bg-white rounded-[2rem] shadow-xl border border-[#e5e5e0] overflow-hidden">
      <header className="bg-[#5A5A40] p-6 text-white flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
          <Bot size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold">المساعد الإسلامي</h2>
          <p className="text-xs opacity-80">مدعوم بالذكاء الاصطناعي</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfcf9]">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                msg.role === 'user' ? "bg-[#5A5A40] text-white" : "bg-white border border-[#e5e5e0] text-[#5A5A40]"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user' ? "bg-[#5A5A40] text-white rounded-tr-none" : "bg-white border border-[#e5e5e0] text-[#1a1a1a] rounded-tl-none"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-4 ml-auto">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#e5e5e0] flex items-center justify-center animate-pulse">
              <Bot size={20} className="text-[#5A5A40]" />
            </div>
            <div className="bg-white border border-[#e5e5e0] p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#5A5A40]/30 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#5A5A40]/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-[#5A5A40]/30 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-[#e5e5e0]">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل عن أي شيء..."
            className="w-full bg-[#f5f5f0] border-none rounded-2xl py-4 pr-12 pl-16 focus:ring-2 focus:ring-[#5A5A40] transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute left-4 p-2 bg-[#5A5A40] text-white rounded-xl hover:bg-[#4a4a35] transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
          <div className="absolute right-4 text-[#8e8e8e]">
            <Sparkles size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
