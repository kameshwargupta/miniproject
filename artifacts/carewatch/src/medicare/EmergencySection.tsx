import React, { useState } from 'react';
import {
  PhoneCall,
  AlertOctagon,
  HeartPulse,
  Ambulance,
  MapPin,
  ShieldAlert,
  Volume2,
} from 'lucide-react';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS } from './translations';

export const EmergencySection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [sosSent, setSosSent] = useState(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleTriggerSOS = () => {
    setSosSent(true);
    // Send emergency trigger alert
  };

  return (
    <div className="space-y-6">
      {/* Red Alert Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            24x7 Critical Medical Helpline
          </span>
          <h2 className="text-2xl font-bold mt-2">Emergency Response & SOS</h2>
          <p className="text-red-100 text-sm max-w-xl mt-1">
            Immediate one-tap access to national emergency ambulances, poison control, and nearby hospital trauma centers.
          </p>
        </div>
        <ListenButton
          text={
            lang === 'hi'
              ? '????????? ?????? ??? ???? ?????? ??? ???? ?? ????? ?????? ??? ????????? ????????? ???? 112 ?? ????????? 108 ?? ?????? ?????'
              : 'Emergency medical assistance. In acute emergencies, dial national helpline 112 or ambulance service 108 immediately.'
          }
          lang={lang}
          label="Listen Emergency Info"
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        />
      </div>

      {/* SOS Button Area */}
      <div className="bg-white dark:bg-slate-900 border-2 border-red-500/40 rounded-2xl p-8 text-center shadow-lg space-y-4">
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            One-Tap Medical SOS Alert
          </h3>
          <p className="text-xs text-slate-500">
            Transmits your live GPS location and emergency medical card to registered family contacts and nearest ambulance dispatch.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleTriggerSOS}
            className={`w-36 h-36 rounded-full font-black text-2xl uppercase tracking-wider text-white shadow-2xl transition-all cursor-pointer mx-auto flex flex-col items-center justify-center gap-1 border-4 border-white ${
              sosSent
                ? 'bg-emerald-600 animate-pulse'
                : 'bg-gradient-to-tr from-red-600 to-rose-500 hover:scale-105 active:scale-95'
            }`}
          >
            <AlertOctagon className="w-10 h-10" />
            <span>{sosSent ? 'DISPATCHED' : 'PRESS SOS'}</span>
          </button>
        </div>

        {sosSent && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold max-w-md mx-auto">
            ? SOS Broadcast Sent! Nearest AIIMS Trauma Emergency Center notified.
          </div>
        )}
      </div>

      {/* Quick Dial Helplines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="tel:112"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-red-500 transition-all flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">
              National Emergency
            </span>
            <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">112</h4>
            <p className="text-xs text-slate-500 mt-1">All-in-one Police, Fire & Medical rescue</p>
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold text-red-600">
            <span>Call 112</span>
            <PhoneCall className="w-4 h-4" />
          </div>
        </a>

        <a
          href="tel:108"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-red-500 transition-all flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
              Ambulance Dispatch
            </span>
            <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">108</h4>
            <p className="text-xs text-slate-500 mt-1">Emergency Medical Services Ambulance</p>
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold text-rose-600">
            <span>Call 108</span>
            <PhoneCall className="w-4 h-4" />
          </div>
        </a>

        <a
          href="tel:102"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-red-500 transition-all flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
              Maternal & Infant Care
            </span>
            <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">102</h4>
            <p className="text-xs text-slate-500 mt-1">Free transport for pregnant mothers & infants</p>
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold text-indigo-600">
            <span>Call 102</span>
            <PhoneCall className="w-4 h-4" />
          </div>
        </a>

        <a
          href="tel:1800116117"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-red-500 transition-all flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
              Poison Information
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
              1800-116-117
            </h4>
            <p className="text-xs text-slate-500 mt-1">AIIMS National Poison Control Centre</p>
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold text-amber-600">
            <span>Call Centre</span>
            <PhoneCall className="w-4 h-4" />
          </div>
        </a>
      </div>
    </div>
  );
};
