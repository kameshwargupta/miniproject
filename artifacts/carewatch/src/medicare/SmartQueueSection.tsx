import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Ticket,
  Clock,
  Building2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Phone,
  ChevronRight,
  ShieldCheck,
  Play,
  SkipForward,
  UserCheck,
  Volume2,
  QrCode,
  Printer,
  Download,
  Share2,
  Tv,
  X,
  Sparkles,
  Zap,
  Activity,
  Bell,
} from 'lucide-react';
import { INITIAL_HOSPITALS, type QueueToken, type Hospital } from './mockData';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

export const SmartQueueSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [hospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [selectedHosp, setSelectedHosp] = useState(INITIAL_HOSPITALS[0].id);
  const [selectedDep, setSelectedDep] = useState(INITIAL_HOSPITALS[0].departments[0].id);
  const [patientName, setPatientName] = useState('Kameshwar Gupta');
  const [patientPhone, setPatientPhone] = useState('+91 88081 22445');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Digital Pass Modal & TV Lounge Display State
  const [selectedTokenForPass, setSelectedTokenForPass] = useState<QueueToken | null>(null);
  const [isTvDisplayOpen, setIsTvDisplayOpen] = useState(false);
  const [smsAlertEnabled, setSmsAlertEnabled] = useState(true);
  const [smsToast, setSmsToast] = useState<string | null>(null);

  const [activeTokens, setActiveTokens] = useState<QueueToken[]>([
    {
      id: 'tok-1',
      tokenNumber: 'A-024',
      hospitalName: "King George's Medical University (KGMU), Lucknow",
      departmentName: 'General Medicine / OPD Room 104',
      patientName: 'Kameshwar Gupta',
      patientPhone: '+91 88081 22445',
      queuePosition: 4,
      currentServing: 20,
      estimatedWaitMinutes: 16,
      status: 'Waiting',
      bookedAt: 'Today, 9:45 AM',
      doctorName: 'Dr. Sarah Khan (MD, FACP)',
      roomNumber: 'OPD Room 104',
    },
  ]);

  const [servingTokenNum, setServingTokenNum] = useState<number>(20);
  const audioContextRef = useRef<AudioContext | null>(null);

  const { speak } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const currentHospital = hospitals.find((h) => h.id === selectedHosp) || hospitals[0];
  const currentDepartment =
    currentHospital.departments.find((d) => d.id === selectedDep) || currentHospital.departments[0];

  // Play pleasant double-bell hospital chime (Ding-Dong)
  const playHospitalChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // First Ding (E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);

      // Second Dong (C5)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain2.gain.setValueAtTime(0.12, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.6);
      }, 250);
    } catch {
      // Audio not supported
    }
  };

  // Announce Token via Voice
  const announceToken = (tokenNumber: string, room = 'OPD Room 104') => {
    playHospitalChime();
    setTimeout(() => {
      const announcement =
        lang === 'hi'
          ? `कृपया ध्यान दें, टोकन नंबर ${tokenNumber}, कृपया ${room} में जाएं।`
          : `Attention please, Token Number ${tokenNumber}, please proceed to ${room}.`;
      speak(announcement, lang);
    }, 600);
  };

  // Automated queue progression simulation every 50 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      advanceQueue();
    }, 50000);
    return () => clearInterval(timer);
  }, []);

  const advanceQueue = () => {
    setServingTokenNum((prev) => {
      const nextServing = prev + 1;
      const formatted = `A-0${nextServing}`;

      setActiveTokens((prevTokens) =>
        prevTokens.map((tok) => {
          if (tok.status === 'Waiting' || tok.status === 'Serving Now') {
            const newPos = Math.max(0, tok.queuePosition - 1);
            const isNowServing = newPos === 0;

            // Notify patient when turn approaches
            if (newPos === 2 && smsAlertEnabled) {
              setSmsToast(`SMS sent to ${tok.patientPhone}: "Your turn is approaching! 2 patients ahead for ${tok.departmentName}."`);
              setTimeout(() => setSmsToast(null), 5000);
            }

            return {
              ...tok,
              currentServing: nextServing,
              queuePosition: newPos,
              estimatedWaitMinutes: Math.max(0, newPos * 4),
              status: isNowServing ? 'Serving Now' : 'Waiting',
            };
          }
          return tok;
        })
      );

      announceToken(formatted, 'OPD Room 104');
      return nextServing;
    });
  };

  const handleBookToken = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenSeq = servingTokenNum + activeTokens.length + 3;
    const nextTokenNum = `A-0${tokenSeq}`;
    const waitTime = (activeTokens.length + 3) * currentDepartment.avgTimePerPatient;

    const newToken: QueueToken = {
      id: `tok-${Date.now()}`,
      tokenNumber: nextTokenNum,
      hospitalName: currentHospital.name,
      departmentName: currentDepartment.name,
      patientName: patientName || 'Patient',
      patientPhone: patientPhone || '+91 88081 22445',
      queuePosition: activeTokens.length + 3,
      currentServing: servingTokenNum,
      estimatedWaitMinutes: waitTime,
      status: 'Waiting',
      bookedAt: 'Just now',
      doctorName: 'Dr. Sarah Khan (MD, FACP)',
      roomNumber: 'OPD Room 104',
    };

    setActiveTokens([newToken, ...activeTokens]);
    setBookingSuccess(true);
    setSelectedTokenForPass(newToken);
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  const handleCancelToken = (id: string) => {
    setActiveTokens((prev) => prev.filter((t) => t.id !== id));
  };

  // Staff simulation controls
  const handleCallNext = () => {
    advanceQueue();
  };

  const handleSkipToken = () => {
    setServingTokenNum((prev) => prev + 1);
  };

  const handleMarkCompleted = (id: string) => {
    setActiveTokens((prev) =>
      prev.map((tok) => (tok.id === id ? { ...tok, status: 'Completed', queuePosition: 0 } : tok))
    );
  };

  const primaryToken = activeTokens[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            Live OPD Token Engine & Waiting Lounge
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.queueTitle}</h2>
          <p className="text-blue-100 text-sm max-w-xl mt-1">
            Book digital tokens, track serving numbers in real-time, get voice announcements, and download QR-enabled digital OPD passes.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTvDisplayOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/20 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>Counter TV Display Mode</span>
          </button>

          {primaryToken && (
            <button
              type="button"
              onClick={() => setSelectedTokenForPass(primaryToken)}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Digital OPD Pass</span>
            </button>
          )}
        </div>
      </div>

      {/* SMS Alert Toast */}
      {smsToast && (
        <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>{smsToast}</span>
          </div>
          <button onClick={() => setSmsToast(null)} className="text-indigo-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hospital Staff Controls Card */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
              Hospital Staff & OPD Doctor Desk Controls
            </span>
            <span className="text-[11px] text-slate-500">
              Department: General Medicine (Room 104) • Dr. Sarah Khan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCallNext}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Call Next Patient (A-0{servingTokenNum + 1})</span>
          </button>

          <button
            type="button"
            onClick={() => announceToken(`A-0${servingTokenNum}`, 'OPD Room 104')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            title="Repeat voice announcement"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice Chime</span>
          </button>

          <button
            type="button"
            onClick={handleSkipToken}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skip Patient</span>
          </button>
        </div>
      </div>

      {bookingSuccess && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-md animate-in fade-in font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Token Booked Successfully! Digital OPD Pass generated with live tracking.</span>
          </div>
          <span className="text-emerald-100">SMS sent to {patientPhone}</span>
        </div>
      )}

      {/* Real-Time Live Status Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Now Serving</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-3xl font-black text-blue-600 mt-2">A-0{servingTokenNum}</div>
          <div className="text-xs text-slate-500 mt-1">OPD Room 104 • Dr. Sarah Khan</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-slate-500 text-xs">Your Queue Position</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">
            {primaryToken ? `#${primaryToken.queuePosition}` : '0'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {primaryToken?.queuePosition === 0 ? 'Serving Right Now!' : 'Patients ahead of you'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-slate-500 text-xs">Estimated Wait Time</div>
          <div className="text-3xl font-black text-cyan-600 mt-2">
            {primaryToken ? `~${primaryToken.estimatedWaitMinutes}m` : '0m'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Dynamic historical calculation</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-slate-500 text-xs">Your Digital Token</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {primaryToken ? primaryToken.tokenNumber : 'None'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {primaryToken ? primaryToken.status : 'No active token'}
          </div>
        </div>
      </div>

      {/* LIVE ANIMATED QUEUE VISUAL STAGE */}
      {primaryToken && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Live OPD Queue Journey</span>
            </h4>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">
              {primaryToken.hospitalName}
            </span>
          </div>

          {/* Queue Pipeline Visual */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {/* 1. Serving Now */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
                Serving Now
              </span>
              <div className="text-xl font-black text-emerald-600">A-0{servingTokenNum}</div>
              <span className="text-[10px] text-slate-500 block">Inside Room 104</span>
            </div>

            {/* 2. Next Patient */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Next 1</span>
              <div className="text-xl font-black text-slate-700 dark:text-slate-300">
                A-0{servingTokenNum + 1}
              </div>
              <span className="text-[10px] text-slate-400 block">At OPD Door</span>
            </div>

            {/* 3. Patient 2 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Next 2</span>
              <div className="text-xl font-black text-slate-700 dark:text-slate-300">
                A-0{servingTokenNum + 2}
              </div>
              <span className="text-[10px] text-slate-400 block">Waiting Area</span>
            </div>

            {/* 4. Patient 3 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Next 3</span>
              <div className="text-xl font-black text-slate-700 dark:text-slate-300">
                A-0{servingTokenNum + 3}
              </div>
              <span className="text-[10px] text-slate-400 block">Waiting Area</span>
            </div>

            {/* 5. YOUR TOKEN */}
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-600 rounded-2xl text-center space-y-1 shadow-md col-span-2 sm:col-span-1 ring-2 ring-indigo-500/20">
              <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase block flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" /> Your Turn
              </span>
              <div className="text-xl font-black text-indigo-600">{primaryToken.tokenNumber}</div>
              <span className="text-[10px] text-indigo-500 font-bold block">
                {primaryToken.patientName.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Two Columns: Book Token Form (Left) & Active Token Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book Token Form (1 Col) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            <span>Book Digital OPD Token</span>
          </h3>

          <form onSubmit={handleBookToken} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Hospital Center
              </label>
              <select
                value={selectedHosp}
                onChange={(e) => {
                  setSelectedHosp(e.target.value);
                  const hosp = hospitals.find((h) => h.id === e.target.value);
                  if (hosp && hosp.departments.length > 0) {
                    setSelectedDep(hosp.departments[0].id);
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinical Department
              </label>
              <select
                value={selectedDep}
                onChange={(e) => setSelectedDep(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currentHospital.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} • Waiting: {d.totalWaiting}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number (for SMS & WhatsApp Alert) *
              </label>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+91 88081 22445"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Turn alert checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="smsAlert"
                checked={smsAlertEnabled}
                onChange={(e) => setSmsAlertEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="smsAlert" className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                Notify me when 2 patients remain
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition active:scale-98"
            >
              Generate Digital Token & Pass
            </button>
          </form>
        </div>

        {/* Active Tokens List & OPD Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Active Digital OPD Passes ({activeTokens.length})
            </h4>
          </div>

          {activeTokens.map((tok) => (
            <div
              key={tok.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-blue-400 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-indigo-600">{tok.tokenNumber}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        tok.status === 'Serving Now'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 animate-pulse'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}
                    >
                      {tok.status}
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1">
                    {tok.hospitalName}
                  </h5>
                  <p className="text-xs text-slate-500">{tok.departmentName}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{tok.bookedAt}</span>
                  <span className="text-xs font-bold text-emerald-600">
                    Est. Turn: ~{tok.estimatedWaitMinutes} mins
                  </span>
                </div>
              </div>

              {/* Patient Info Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{tok.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Doctor Assigned:</span>
                  <span className="font-bold text-indigo-600">{tok.doctorName || 'Dr. Sarah Khan'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Room:</span>
                  <span className="font-bold text-emerald-600">{tok.roomNumber || 'OPD Room 104'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTokenForPass(tok)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View & Print OPD Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => announceToken(tok.tokenNumber, tok.roomNumber)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Test Voice Announcement</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCancelToken(tok.id)}
                  className="px-3 py-2 text-slate-400 hover:text-red-600 text-xs font-medium cursor-pointer ml-auto"
                >
                  Cancel Token
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIGITAL OPD PASS MODAL (QR Code + Barcode + Hospital Stamp) */}
      {/* ========================================================================= */}
      {selectedTokenForPass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTokenForPass(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pass Header */}
            <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                Official Digital OPD Appointment Pass
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-2">
                {selectedTokenForPass.hospitalName}
              </h3>
              <p className="text-xs text-slate-500">{selectedTokenForPass.departmentName}</p>
            </div>

            {/* Token Badge */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white rounded-2xl p-4 text-center shadow-lg">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">
                Your Priority Token Number
              </span>
              <div className="text-4xl font-black tracking-wider mt-1 font-mono">
                {selectedTokenForPass.tokenNumber}
              </div>
              <span className="text-xs font-semibold bg-white/20 px-3 py-0.5 rounded-full inline-block mt-1">
                Assigned: {selectedTokenForPass.roomNumber || 'OPD Room 104'}
              </span>
            </div>

            {/* QR Code & Barcode Simulation */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                <QrCode className="w-24 h-24 text-slate-900" />
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                PASS-ID: KGMU-2026-{selectedTokenForPass.tokenNumber}
              </span>
              <span className="text-[10px] text-slate-400">
                Scan this QR code at hospital counter / OPD entrance
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Patient:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTokenForPass.patientName}</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Consulting Doctor:</span>
                <span className="font-bold text-indigo-600">{selectedTokenForPass.doctorName || 'Dr. Sarah Khan'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => alert('Digital OPD Pass printed / PDF saved successfully.')}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTokenForPass(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HOSPITAL COUNTER TV DISPLAY MODE (LED Lounge Counter View) */}
      {/* ========================================================================= */}
      {isTvDisplayOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-6 animate-in fade-in">
          {/* TV Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping"></div>
              <div>
                <h2 className="text-xl font-black tracking-wider">{currentHospital.name}</h2>
                <p className="text-xs text-slate-400">
                  Real-Time OPD Lounge Queue Display • Department of General Medicine
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsTvDisplayOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              Exit TV Display
            </button>
          </div>

          {/* Main TV Stage */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center justify-center py-6">
            {/* Huge Currently Serving Card (2 Cols) */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950/80 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl h-full">
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-4 py-1 rounded-full border border-emerald-800">
                Now Serving / अब देख रहे हैं
              </span>
              <div className="text-7xl sm:text-8xl font-black text-white font-mono mt-4 tracking-wider">
                A-0{servingTokenNum}
              </div>
              <div className="text-xl font-bold text-indigo-300 mt-4">
                Please Proceed to: <strong className="text-white">OPD Room 104 (Dr. Sarah Khan)</strong>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Audio announcement is broadcasted automatically upon turn.
              </p>
            </div>

            {/* Upcoming Queue List (1 Col) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                  Next 4 in Line (Upcoming)
                </h4>
                <div className="space-y-2.5">
                  {[1, 2, 3, 4].map((offset) => (
                    <div
                      key={offset}
                      className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between"
                    >
                      <span className="font-mono text-base font-bold text-slate-200">
                        Token A-0{servingTokenNum + offset}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        Queue #{offset}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-center">
                <span className="text-xs text-slate-500 font-mono">
                  Current Time: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
