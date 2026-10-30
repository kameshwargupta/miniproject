import React, { useState } from 'react';
import {
  PhoneCall,
  AlertOctagon,
  HeartPulse,
  Ambulance,
  MapPin,
  ShieldAlert,
  Share2,
  CheckCircle,
  X,
} from 'lucide-react';
import { type LanguageCode, TRANSLATIONS } from './translations';

export const EmergencySection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [sosSent, setSosSent] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [callingNumber, setCallingNumber] = useState<string | null>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleTriggerSOS = () => {
    setSosSent(true);
  };

  const handleCall = (num: string) => {
    setCallingNumber(num);
    setTimeout(() => setCallingNumber(null), 4000);
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
          <h2 className="text-2xl font-bold mt-2">{t.emergencyTitle}</h2>
          <p className="text-red-100 text-sm max-w-xl mt-1">{t.emergencySubtitle}</p>
        </div>
      </div>

      {callingNumber && (
        <div className="bg-red-600 text-white px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in">
          <span>Connecting urgent call to {callingNumber}...</span>
          <button onClick={() => setCallingNumber(null)} className="text-white hover:underline text-xs">
            Dismiss
          </button>
        </div>
      )}

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
            className={`w-36 h-36 rounded-full font-black text-sm uppercase tracking-wider shadow-2xl transition-all duration-300 cursor-pointer mx-auto flex flex-col items-center justify-center gap-1.5 border-4 ${
              sosSent
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400 ring-8 ring-emerald-300/40'
                : 'bg-red-600 hover:bg-red-700 text-white border-red-400 ring-8 ring-red-300/40 hover:scale-105 active:scale-95 animate-pulse'
            }`}
          >
            <AlertOctagon className="w-8 h-8" />
            <span>{sosSent ? 'SOS ACTIVE' : 'PRESS SOS'}</span>
          </button>
        </div>

        {sosSent && (
          <div className="max-w-md mx-auto bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 p-4 rounded-xl text-left text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{t.sosAlertSent}</span>
            </div>
            <p>• Live GPS coordinates dispatched to Local Ambulance Dispatch (Sector 29)</p>
            <p>• SMS notification broadcast to Emergency Contact: +91 98765 43210</p>
            <button
              onClick={() => setSosSent(false)}
              className="text-xs text-red-600 font-bold hover:underline mt-2 block"
            >
              Cancel SOS Alert
            </button>
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setLocationShared(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{locationShared ? '✓ Live Location Shared' : t.shareLocation}</span>
          </button>
        </div>
      </div>

      {/* Emergency Helpline Numbers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'National Emergency', num: '112', desc: 'Police, Fire & Ambulance', color: 'bg-red-500' },
          { label: 'Medical Ambulance', num: '108', desc: 'Govt. 24x7 Ambulance', color: 'bg-amber-500' },
          { label: 'Women Helpline', num: '1091', desc: 'Safety & Emergency', color: 'bg-indigo-500' },
          { label: 'Child Helpline', num: '1098', desc: 'Emergency Protection', color: 'bg-teal-500' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{item.label}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {item.num}
              </div>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>

            <button
              type="button"
              onClick={() => handleCall(item.num)}
              className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call {item.num}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Nearby Trauma & Critical Centers */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-red-600" />
          <span>{t.nearbyEmergency}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'AIIMS Trauma Center', dist: '1.2 km', beds: 14, phone: '011-26598500' },
            { name: 'Safdarjung Hospital Emergency', dist: '2.4 km', beds: 8, phone: '011-26165060' },
            { name: 'Max Super Speciality Emergency', dist: '3.8 km', beds: 19, phone: '011-26515050' },
          ].map((hosp, i) => (
            <div
              key={i}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {hosp.name}
                  </h4>
                  <span className="text-xs font-bold text-red-600">{hosp.dist}</span>
                </div>
                <div className="text-xs text-emerald-600 font-semibold mb-2">
                  ✓ {hosp.beds} {t.availableBeds}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCall(hosp.phone)}
                className="w-full py-1.5 bg-white dark:bg-slate-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition cursor-pointer flex items-center justify-center gap-1"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Call Hospital ({hosp.phone})</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
