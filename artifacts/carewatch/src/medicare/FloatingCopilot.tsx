import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Volume2,
  Sparkles,
  X,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const FloatingCopilot: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text:
        lang === 'hi'
          ? '??????! ??? ???????? ??? ????? ??????? ???? ?? ????? ???? ???????, ???????, ???? ?? ?????? ?????????? ?? ???? ??? ??? ???? ????'
          : 'Hello! I am your MediCare AI Health Copilot. Ask me anything about your medical reports, medicines, hospital tokens, or finding nearby healthcare.',
      time: 'Just now',
    },
  ]);
  const { speak, stop, isPlaying, startListening, isListening } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Generate intelligent healthcare response
    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('token') || lower.includes('queue') || lower.includes('????') || lower.includes('????')) {
        reply =
          lang === 'hi'
            ? '???? ??????? ???? ?????? #A-024 ??? ???? ??????? ????? ??? ??? ???? #A-018 ?? ??? ??? ???????? ????????? ??? ???? 18-20 ???? ???'
            : 'Your active token is #A-024 for General Medicine. The hospital is currently serving token #A-018. Estimated wait is approximately 18-20 minutes.';
      } else if (lower.includes('dolo') || lower.includes('fever') || lower.includes('?????') || lower.includes('???')) {
        reply =
          lang === 'hi'
            ? '???? 650 (???????????) ????? ?? ??? ???? ?? ??? ?????? ??? ??? ???? ?? ??? ??? ?? 24 ???? ??? 3 ??????? ?? ???? ? ???? ?????? ??? ????? ???? ?? ?????? ?? ??????'
            : 'Dolo 650 (Paracetamol 650mg) is commonly used for fever and mild to moderate pain relief. Take after food. Do not exceed 3 tablets a day without consulting a clinician.';
      } else if (lower.includes('report') || lower.includes('hemoglobin') || lower.includes('???') || lower.includes('???????')) {
        reply =
          lang === 'hi'
            ? '???? ?????? ?????? ??????? ??? ??????????? 11.8 g/dL ?? ?? ??????? ???? (13.5) ?? ????? ?? ??? ????, ??????, ?? ????? ?? ???? ???????'
            : 'According to your recent CBC report, your Hemoglobin is 11.8 g/dL (slightly below normal 13.5). This indicates mild anemia. Incorporate iron-rich leafy vegetables and lentils.';
      } else if (lower.includes('pharmacy') || lower.includes('???????') || lower.includes('?????')) {
        reply =
          lang === 'hi'
            ? '???? ???? ????? ????? ???????? (0.6 ????) 24 ???? ???? ?? ?? ?????? ??????? ?????? ????'
            : 'The nearest verified pharmacy is Apollo Pharmacy (0.6 km away, open 24x7) with current required stock available.';
      } else {
        reply =
          lang === 'hi'
            ? `????? ???? ?????? ????: "${query}"? ???????? ??? ???? ???? ??????? ???? ?? ??? ????? ??? ??? ?? ??? ????? ??????? ?? ?? ????? ????????? 112 ?? 108 ?? ?????? ?????`
            : `I have noted your health query: "${query}". I am here to explain terms and provide guidance. For acute or severe medical emergencies, dial 112 / 108 immediately.`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speak(reply, lang);
    }, 600);
  };

  const handleVoiceInput = () => {
    startListening(lang, (spokenText) => {
      setInput(spokenText);
      handleSend(spokenText);
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open MediCare AI Copilot"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white font-semibold rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
        <span>MediCare Copilot</span>
      </button>

      {/* Copilot Drawer/Modal */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">MediCare AI Copilot</h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Multilingual Voice & Chat
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                stop();
                setIsOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/70 dark:bg-slate-950/40 text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs rounded-bl-xs'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-[10px] opacity-70">{m.time}</span>
                    {m.sender === 'ai' && (
                      <button
                        onClick={() => speak(m.text, lang)}
                        className="text-[11px] flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium cursor-pointer"
                        title="Listen to this message"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick chips */}
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSend('Check my token status')}
              className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full border text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-blue-50"
            >
              ??? Token status
            </button>
            <button
              onClick={() => handleSend('Explain Dolo 650')}
              className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full border text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-blue-50"
            >
              ?? Dolo 650 info
            </button>
            <button
              onClick={() => handleSend('Show my latest report')}
              className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full border text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-blue-50"
            >
              ?? Latest report
            </button>
          </div>

          {/* Input Box */}
          <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={handleVoiceInput}
              aria-label="Speak using microphone"
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title="Click and speak"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-600" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Listening...' : t.speakCommand}
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
