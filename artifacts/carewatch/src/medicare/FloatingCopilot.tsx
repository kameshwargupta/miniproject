import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Volume2,
  Sparkles,
  X,
  Square,
  VolumeX,
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
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const getGreeting = (l: LanguageCode) => {
    switch (l) {
      case 'hi':
        return 'नमस्ते! मैं आपका मेडीकेयर AI स्वास्थ्य सहायक हूँ। मेडिकल रिपोर्ट, दवाओं, अस्पताल टोकन या नजदीकी स्वास्थ्य सेवाओं के बारे में कुछ भी पूछें।';
      case 'bn':
        return 'নমস্কার! আমি আপনার মেডিকেয়ার এআই স্বাস্থ্য সহকারী। রিপোর্ট, ওষুধ বা হাসপাতাল টোকেন সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞাসা করুন।';
      case 'ta':
        return 'வணக்கம்! நான் உங்கள் மெடிகேர் AI நலன் உதவியாளர். அறிக்கைகள், மருந்துகள் அல்லது டோக்கன்கள் குறித்து என்னிடம் கேளுங்கள்.';
      case 'te':
        return 'నమస్కారం! నేను మీ మెడికేర్ AI ఆరోగ్య సహాయకుడిని. రిపోర్టులు, మందులు లేదా ఆసుపత్రి టోకెన్ల గురించి నన్ను అడగండి.';
      case 'mr':
        return 'नमस्कार! मी तुमचा मेडिकेअर AI आरोग्य सहाय्यक आहे. मेडिकल रिपोर्ट, औषधे किंवा रुग्णालय टोकनबद्दल काहीही विचारा.';
      case 'gu':
        return 'નમસ્તે! હું તમારો મેડિકેર AI સહાયક છું. મેડિકલ રિપોર્ટ, દવાઓ અથવા હોસ્પિટલ ટોકન વિશે કંઈપણ પૂછો.';
      case 'kn':
        return 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಮೆಡಿಕೇರ್ AI ಆರೋಗ್ಯ ಸಹಾಯಕ. ವರದಿಗಳು, ಔಷಧಿಗಳು ಅಥವಾ ಟೋಕನ್‌ಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.';
      case 'ml':
        return 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ മെഡികെയർ AI ഹെൽത്ത് അസിസ്റ്റന്റാണ്. റിപ്പോർട്ടുകൾ, മരുന്നുകൾ അല്ലെങ്കിൽ ടോക്കണുകൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കാം.';
      case 'pa':
        return 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਮੈਡੀਕੇਅਰ AI ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ। ਰਿਪੋਰਟਾਂ, ਦਵਾਈਆਂ ਜਾਂ ਹਸਪਤਾਲ ਟੋਕਨ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ।';
      case 'ur':
        return 'ہیلو! میں آپ کا میڈی کیئر AI ہیلتھ اسسٹنٹ ہوں۔ میڈیکل رپورٹس، ادویات یا ہسپتال ٹوکن کے بارے میں کچھ بھی پوچھیں۔';
      default:
        return 'Hello! I am your MediCare AI Health Copilot. Ask me anything about your medical reports, medicines, hospital tokens, or finding nearby healthcare.';
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: getGreeting(lang),
      time: 'Just now',
    },
  ]);

  const { speak, stop, isPlaying, startListening, isListening } = useVoice();

  // Update initial greeting when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === 'ai') {
        return [{ ...prev[0], text: getGreeting(lang) }];
      }
      return prev;
    });
  }, [lang]);

  const handleInterrupt = () => {
    stop();
  };

  const handleSend = (textToSend?: string) => {
    // If AI is currently speaking, interrupt it when user interacts
    stop();

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

    // Generate response in selected language
    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('token') || lower.includes('queue') || lower.includes('टोकन') || lower.includes('कतार')) {
        reply =
          lang === 'hi'
            ? 'आपका सक्रिय टोकन जनरल मेडिसिन के लिए #A-024 है। अस्पताल वर्तमान में टोकन #A-018 की सेवा कर रहा है। अनुमानित प्रतीक्षा समय लगभग 18-20 मिनट है।'
            : 'Your active token is #A-024 for General Medicine. The hospital is currently serving token #A-018. Estimated wait is approximately 18-20 minutes.';
      } else if (lower.includes('dolo') || lower.includes('fever') || lower.includes('बुखार') || lower.includes('दर्द')) {
        reply =
          lang === 'hi'
            ? 'डोलो 650 (पैरासिटामोल 650mg) का उपयोग हल्के से मध्यम बुखार और बदन दर्द के लिए किया जाता है। भोजन के बाद लें। 24 घंटे में डॉक्टर की सलाह के बिना 3 से अधिक गोलियां न लें।'
            : 'Dolo 650 (Paracetamol 650mg) is commonly used for fever and mild to moderate pain relief. Take after food. Do not exceed 3 tablets a day without consulting a clinician.';
      } else if (lower.includes('report') || lower.includes('hemoglobin') || lower.includes('खून') || lower.includes('रिपोर्ट')) {
        reply =
          lang === 'hi'
            ? 'आपकी हालिया सीबीसी (CBC) रिपोर्ट के अनुसार, हीमोग्लोबिन 11.8 g/dL है जो सामान्य सीमा (13.5) से थोड़ा कम है। यह हल्का एनीमिया दर्शाता है। आयरन युक्त आहार लें।'
            : 'According to your recent CBC report, your Hemoglobin is 11.8 g/dL (slightly below normal 13.5). This indicates mild anemia. Incorporate iron-rich leafy vegetables and lentils.';
      } else if (lower.includes('pharmacy') || lower.includes('दवा') || lower.includes('मेडिकल')) {
        reply =
          lang === 'hi'
            ? 'सबसे नजदीकी सत्यापित फार्मेसी अपोलो फार्मेसी (0.6 किमी दूर) है जो 24x7 खुली है और यहां जरूरी दवाइयां उपलब्ध हैं।'
            : 'The nearest verified pharmacy is Apollo Pharmacy (0.6 km away, open 24x7) with current required stock available.';
      } else {
        reply =
          lang === 'hi'
            ? `मैंने आपका स्वास्थ्य प्रश्न नोट कर लिया: "${query}"। किसी भी गंभीर आपात स्थिति के लिए तुरंत 112 या 108 डायल करें।`
            : `I have noted your health query: "${query}". For urgent acute medical emergencies, dial 112 / 108 immediately.`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speak(reply, lang);
    }, 500);
  };

  const handleVoiceInput = () => {
    // If AI is speaking, interrupt it before listening to user
    stop();
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
        <span>{t.copilotTitle}</span>
        {isPlaying && (
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        )}
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
                <h3 className="font-bold text-sm leading-tight">{t.copilotTitle}</h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  {t.copilotStatus}
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

          {/* Interrupt Banner (Active when AI is speaking) */}
          {isPlaying && (
            <div className="bg-amber-500 text-white px-3 py-2 flex items-center justify-between text-xs font-medium animate-pulse shadow-md">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>{t.aiSpeaking}</span>
              </div>
              <button
                type="button"
                onClick={handleInterrupt}
                className="bg-white text-amber-700 hover:bg-amber-100 px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                title="Stop AI speech immediately"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>{t.interruptAudio}</span>
              </button>
            </div>
          )}

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
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-[10px] opacity-70">{m.time}</span>
                    {m.sender === 'ai' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            stop();
                            speak(m.text, lang);
                          }}
                          className="text-[11px] flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium cursor-pointer"
                          title="Listen to this message"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t.listen}</span>
                        </button>
                        {isPlaying && (
                          <button
                            onClick={handleInterrupt}
                            className="text-[11px] flex items-center gap-1 text-red-500 hover:text-red-700 font-medium cursor-pointer ml-1"
                            title="Stop speech"
                          >
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>{t.stop}</span>
                          </button>
                        )}
                      </div>
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
              onClick={() => handleSend(lang === 'hi' ? 'मेरा टोकन स्टेटस बताओ' : 'Check my token status')}
              className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-blue-50 cursor-pointer"
            >
              🎫 {t.yourToken}
            </button>
            <button
              onClick={() => handleSend(lang === 'hi' ? 'डोलो 650 के बारे में बताओ' : 'Explain Dolo 650')}
              className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-blue-50 cursor-pointer"
            >
              💊 Dolo 650
            </button>
            <button
              onClick={() => handleSend(lang === 'hi' ? 'मेरी हालिया रिपोर्ट दिखाओ' : 'Show my latest report')}
              className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-blue-50 cursor-pointer"
            >
              📋 {t.reportSummary}
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
              placeholder={isListening ? 'Listening...' : t.copilotPlaceholder}
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
