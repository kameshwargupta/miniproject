import React, { useState } from 'react';
import {
  Users,
  Ticket,
  Clock,
  Building2,
  CheckCircle,
  AlertTriangle,
  Volume2,
  Calendar,
  Phone,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_HOSPITALS, type QueueToken, type Hospital } from './mockData';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

export const SmartQueueSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [hospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [selectedHosp, setSelectedHosp] = useState(INITIAL_HOSPITALS[0].id);
  const [selectedDep, setSelectedDep] = useState(INITIAL_HOSPITALS[0].departments[0].id);
  const [patientName, setPatientName] = useState('Kameshwar Gupta');
  const [patientPhone, setPatientPhone] = useState('+91 98765 43210');

  const [activeTokens, setActiveTokens] = useState<QueueToken[]>([
    {
      id: 'tok-1',
      tokenNumber: 'A-024',
      hospitalName: 'AIIMS New Delhi',
      departmentName: 'General Medicine / OPD',
      patientName: 'Kameshwar Gupta',
      patientPhone: '+91 98765 43210',
      queuePosition: 4,
      currentServing: 20,
      estimatedWaitMinutes: 18,
      status: 'Waiting',
      bookedAt: 'Today, 9:45 AM',
    },
  ]);

  const { speak } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const currentHospital = hospitals.find((h) => h.id === selectedHosp) || hospitals[0];
  const currentDepartment =
    currentHospital.departments.find((d) => d.id === selectedDep) || currentHospital.departments[0];

  const handleBookToken = (e: React.FormEvent) => {
    e.preventDefault();
    const nextTokenNum = `A-0${currentDepartment.currentServing + currentDepartment.totalWaiting + 1}`;
    const waitTime = (currentDepartment.totalWaiting + 1) * currentDepartment.avgTimePerPatient;

    const newToken: QueueToken = {
      id: `tok-${Date.now()}`,
      tokenNumber: nextTokenNum,
      hospitalName: currentHospital.name,
      departmentName: currentDepartment.name,
      patientName,
      patientPhone,
      queuePosition: currentDepartment.totalWaiting + 1,
      currentServing: currentDepartment.currentServing,
      estimatedWaitMinutes: waitTime,
      status: 'Waiting',
      bookedAt: 'Just now',
    };

    setActiveTokens([newToken, ...activeTokens]);

    const announcement =
      lang === 'hi'
        ? `???? ?? ${patientName}, ???? ???? ???? ${nextTokenNum} ??????????? ??? ?? ??? ??? ???? ???????? ????????? ??? ${waitTime} ???? ???`
        : `Congratulations ${patientName}, your token number is ${nextTokenNum}. Currently serving token is A-0${currentDepartment.currentServing}. Your estimated wait time is approximately ${waitTime} minutes.`;

    speak(announcement, lang);
  };

  const handleCancelToken = (id: string) => {
    setActiveTokens((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            Real-Time Token & Waiting System
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.navQueue}</h2>
          <p className="text-blue-100 text-sm max-w-xl mt-1">
            Book digital queue tokens, track live serving status, and receive audio announcements in your preferred regional language.
          </p>
        </div>
        <ListenButton
          text={
            lang === 'hi'
              ? '??????? ??????? ???? ??????? ??? ???? ?????? ??? ???? ?? ???? ???? ?????? ?? ???? ???? ??? ???? ????'
              : 'Welcome to Smart Hospital Queue Management. You can view your live queue position and estimated waiting time.'
          }
          lang={lang}
          label="Listen Overview"
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        />
      </div>

      {/* Active Token Cards */}
      {activeTokens.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTokens.map((token) => (
            <div
              key={token.id}
              className="bg-white dark:bg-slate-900 border-2 border-blue-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-xl text-xs font-bold tracking-wider">
                {token.status}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 rounded-xl">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    Token: <span className="text-blue-600 dark:text-cyan-400 font-extrabold text-2xl">{token.tokenNumber}</span>
                  </h3>
                  <p className="text-xs text-slate-500">{token.hospitalName} • {token.departmentName}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-center mb-4 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 block">Serving Now</span>
                  <span className="text-lg font-bold text-emerald-600">#{token.currentServing}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Your Position</span>
                  <span className="text-lg font-bold text-indigo-600">#{token.queuePosition}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Est. Wait</span>
                  <span className="text-lg font-bold text-amber-600">~{token.estimatedWaitMinutes} min</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <ListenButton
                  text={
                    lang === 'hi'
                      ? `???? ???? ???? ${token.tokenNumber} ??? ??????? ??? ???? ???? ${token.currentServing} ?? ???? ?? ?? ??? ??? ???? ???? ??? ????? ???? ${token.queuePosition} ?? ?? ???????? ????????? ??? ${token.estimatedWaitMinutes} ???? ???`
                      : `Your token number is ${token.tokenNumber}. Currently token ${token.currentServing} is being served. Your queue position is ${token.queuePosition} and estimated wait time is ${token.estimatedWaitMinutes} minutes.`
                  }
                  lang={lang}
                  label="Announce Token"
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => handleCancelToken(token.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                >
                  Cancel Token
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Two Column Layout: Hospital Dept Live Status & Book Token Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Hospital Status */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Live Hospital Department Queues
            </h3>
            <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Socket Feed
            </span>
          </div>

          <div className="space-y-3">
            {hospitals.map((hosp) => (
              <div
                key={hosp.id}
                className={`border rounded-xl p-4 transition-all ${
                  selectedHosp === hosp.id
                    ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{hosp.name}</h4>
                    <p className="text-xs text-slate-500">{hosp.location} • {hosp.distance}</p>
                  </div>
                  <button
                    onClick={() => setSelectedHosp(hosp.id)}
                    className="text-xs font-medium text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    Select Hospital
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hosp.departments.map((dept) => (
                    <div
                      key={dept.id}
                      onClick={() => {
                        setSelectedHosp(hosp.id);
                        setSelectedDep(dept.id);
                      }}
                      className={`p-3 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition-all ${
                        selectedHosp === hosp.id && selectedDep === dept.id
                          ? 'border-blue-600 bg-white dark:bg-slate-800 shadow-xs'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{dept.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Waiting: <span className="text-blue-600 font-semibold">{dept.totalWaiting} patients</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Serving</span>
                        <span className="font-extrabold text-emerald-600 text-sm">#{dept.currentServing}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Instant Token Booking Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-600" />
            {t.bookToken}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Selected: <span className="font-medium text-blue-600">{currentHospital.name}</span>
          </p>

          <form onSubmit={handleBookToken} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Hospital
              </label>
              <select
                value={selectedHosp}
                onChange={(e) => {
                  setSelectedHosp(e.target.value);
                  const h = hospitals.find((x) => x.id === e.target.value);
                  if (h && h.departments[0]) setSelectedDep(h.departments[0].id);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Department / Specialization
              </label>
              <select
                value={selectedDep}
                onChange={(e) => setSelectedDep(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                {currentHospital.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (Waiting: {d.totalWaiting})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Patient Full Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Mobile Number (for SMS & Voice Alerts)
              </label>
              <input
                type="tel"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
              <span className="font-semibold block mb-0.5">Live Queue Estimate:</span>
              Current Serving: #{currentDepartment.currentServing} • Est. Time: ~{(currentDepartment.totalWaiting + 1) * currentDepartment.avgTimePerPatient} mins
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm"
            >
              Generate Digital Token
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
