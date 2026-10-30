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
  Pause,
  SkipForward,
  UserCheck,
  UserX,
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
  Stethoscope,
  AlertCircle,
  Search,
} from 'lucide-react';
import { INITIAL_HOSPITALS, INITIAL_QUEUE_PATIENTS, type QueueToken, type Hospital } from './mockData';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

export const SmartQueueSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [hospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [selectedHosp, setSelectedHosp] = useState(INITIAL_HOSPITALS[0].id);
  const [selectedDep, setSelectedDep] = useState(INITIAL_HOSPITALS[0].departments[0].id);
  const [patientName, setPatientName] = useState('Kameshwar Gupta');
  const [patientPhone, setPatientPhone] = useState('+91 88081 22445');
  const [patientAge, setPatientAge] = useState('23');
  const [patientProblem, setPatientProblem] = useState('Mild anemia (Hb 11.8 g/dL) & fatigue follow-up');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Auto-Call Control State (Stop Call / Pause Auto-Call)
  const [isAutoCallActive, setIsAutoCallActive] = useState<boolean>(false);
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'absent' | 'completed'>('all');
  const [patientSearch, setPatientSearch] = useState('');

  // Digital Pass Modal & TV Lounge Display State
  const [selectedTokenForPass, setSelectedTokenForPass] = useState<QueueToken | null>(null);
  const [isTvDisplayOpen, setIsTvDisplayOpen] = useState(false);
  const [smsAlertEnabled, setSmsAlertEnabled] = useState(true);
  const [smsToast, setSmsToast] = useState<string | null>(null);

  // 15 Registered Patients Loaded by Default
  const [activeTokens, setActiveTokens] = useState<QueueToken[]>(INITIAL_QUEUE_PATIENTS);
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

  // Announce Token & Patient Name via Voice
  const announceToken = (tokenNumber: string, patientName?: string, room = 'OPD Room 104') => {
    playHospitalChime();
    setTimeout(() => {
      const nameHi = patientName ? `श्री/श्रीमती ${patientName}` : '';
      const nameEn = patientName ? `${patientName}` : '';
      const announcement =
        lang === 'hi'
          ? `कृपया ध्यान दें, टोकन नंबर ${tokenNumber}, ${nameHi}, कृपया ${room} में आएं।`
          : `Attention please, Token Number ${tokenNumber}, ${nameEn}, please proceed to ${room}.`;
      speak(announcement, lang);
    }, 600);
  };

  // Automated queue progression: ONLY runs when isAutoCallActive is true
  // And it will NOT call an absent person!
  useEffect(() => {
    if (!isAutoCallActive) return;

    const timer = setInterval(() => {
      advanceQueue();
    }, 45000);

    return () => clearInterval(timer);
  }, [isAutoCallActive, activeTokens]);

  const advanceQueue = () => {
    // Find next eligible patient who is 'Waiting' and NOT 'Absent'
    const nextPatient = activeTokens.find((tok) => tok.status === 'Waiting');

    if (!nextPatient) {
      // No more present patients waiting
      setSmsToast('No more waiting present patients in queue. Auto-call paused.');
      setIsAutoCallActive(false);
      return;
    }

    const nextTokenDigits = parseInt(nextPatient.tokenNumber.replace(/\D/g, ''), 10) || 21;
    setServingTokenNum(nextTokenDigits);

    setActiveTokens((prevTokens) =>
      prevTokens.map((tok) => {
        if (tok.id === nextPatient.id) {
          return {
            ...tok,
            status: 'Serving Now' as const,
            queuePosition: 0,
            estimatedWaitMinutes: 0,
            currentServing: nextTokenDigits,
          };
        }
        if (tok.status === 'Serving Now' && tok.id !== nextPatient.id) {
          return {
            ...tok,
            status: 'Completed' as const,
          };
        }
        if (tok.status === 'Waiting') {
          const newPos = Math.max(1, tok.queuePosition - 1);
          return {
            ...tok,
            currentServing: nextTokenDigits,
            queuePosition: newPos,
            estimatedWaitMinutes: newPos * 4,
          };
        }
        return tok;
      })
    );

    announceToken(nextPatient.tokenNumber, nextPatient.patientName, nextPatient.roomNumber || 'OPD Room 104');
  };

  // Call a specific patient directly
  const handleCallSpecificPatient = (patient: QueueToken) => {
    if (patient.status === 'Absent') {
      alert(`Patient ${patient.patientName} (${patient.tokenNumber}) is marked Absent / Not Present. Please mark them Present before calling.`);
      return;
    }

    const tokenDigits = parseInt(patient.tokenNumber.replace(/\D/g, ''), 10) || servingTokenNum;
    setServingTokenNum(tokenDigits);

    setActiveTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === patient.id) {
          return {
            ...tok,
            status: 'Serving Now' as const,
            queuePosition: 0,
            estimatedWaitMinutes: 0,
          };
        }
        if (tok.status === 'Serving Now' && tok.id !== patient.id) {
          return {
            ...tok,
            status: 'Completed' as const,
          };
        }
        return tok;
      })
    );

    announceToken(patient.tokenNumber, patient.patientName, patient.roomNumber || 'OPD Room 104');
  };

  // Toggle patient Absent / Present status
  const handleToggleAbsent = (id: string) => {
    setActiveTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === id) {
          const isCurrentlyAbsent = tok.status === 'Absent';
          const nextStatus = isCurrentlyAbsent ? ('Waiting' as const) : ('Absent' as const);
          return {
            ...tok,
            status: nextStatus,
          };
        }
        return tok;
      })
    );
  };

  // Mark patient completed
  const handleMarkCompleted = (id: string) => {
    setActiveTokens((prev) =>
      prev.map((tok) => (tok.id === id ? { ...tok, status: 'Completed' as const, queuePosition: 0 } : tok))
    );
  };

  // Book new token form submit
  const handleBookToken = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenSeq = 20 + activeTokens.length;
    const nextTokenNum = `A-0${tokenSeq}`;
    const waitTime = (activeTokens.filter((t) => t.status === 'Waiting').length + 1) * 4;

    const newToken: QueueToken = {
      id: `tok-${Date.now()}`,
      tokenNumber: nextTokenNum,
      hospitalName: currentHospital.name,
      departmentName: currentDepartment.name,
      patientName: patientName || 'Patient',
      patientPhone: patientPhone || '+91 88081 22445',
      patientAge: parseInt(patientAge, 10) || 28,
      patientGender: 'Male',
      problem: patientProblem || 'Routine medical checkup and health evaluation',
      queuePosition: activeTokens.filter((t) => t.status === 'Waiting').length + 1,
      currentServing: servingTokenNum,
      estimatedWaitMinutes: waitTime,
      status: 'Waiting',
      bookedAt: 'Just now',
      doctorName: 'Dr. Sarah Khan (MD, FACP)',
      roomNumber: 'OPD Room 104',
    };

    setActiveTokens([...activeTokens, newToken]);
    setBookingSuccess(true);
    setSelectedTokenForPass(newToken);
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  const handleCancelToken = (id: string) => {
    setActiveTokens((prev) => prev.filter((t) => t.id !== id));
  };

  const primaryToken = activeTokens.find((t) => t.patientName.toLowerCase().includes('kameshwar')) || activeTokens[0];

  const filteredPatients = activeTokens.filter((p) => {
    if (queueFilter === 'waiting' && p.status !== 'Waiting') return false;
    if (queueFilter === 'absent' && p.status !== 'Absent') return false;
    if (queueFilter === 'completed' && p.status !== 'Completed') return false;
    if (!patientSearch.trim()) return true;
    const query = patientSearch.toLowerCase();
    return (
      p.patientName.toLowerCase().includes(query) ||
      p.tokenNumber.toLowerCase().includes(query) ||
      (p.problem && p.problem.toLowerCase().includes(query))
    );
  });

  const waitingCount = activeTokens.filter((p) => p.status === 'Waiting').length;
  const absentCount = activeTokens.filter((p) => p.status === 'Absent').length;
  const completedCount = activeTokens.filter((p) => p.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            Live Smart OPD Queue & Doctor Calling System
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.queueTitle}</h2>
          <p className="text-blue-100 text-sm max-w-xl mt-1">
            Real-time OPD token engine with automated/manual voice calls, pause controls, absent skipping, and complete patient complaint tracking.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* STOP CALL / RESUME AUTO-CALL BUTTON */}
          <button
            type="button"
            onClick={() => {
              const next = !isAutoCallActive;
              setIsAutoCallActive(next);
              setSmsToast(next ? '▶️ Auto-calling resumed: Calling next present patient every 45s.' : '⏸️ Auto-calling stopped: Next patient will not be called automatically.');
              setTimeout(() => setSmsToast(null), 5000);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md ${
              isAutoCallActive
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse ring-2 ring-amber-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isAutoCallActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isAutoCallActive ? 'Stop Auto-Call (Active)' : 'Start Auto-Call'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTvDisplayOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/20 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>TV Lounge Display</span>
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
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Hospital OPD Doctor Desk Controls
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isAutoCallActive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {isAutoCallActive ? '● Auto-Call Running' : '⏸ Auto-Call Stopped'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Department: General Medicine (Room 104) • Dr. Sarah Khan
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Stop / Resume Auto-Call Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoCallActive(!isAutoCallActive)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
              isAutoCallActive
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isAutoCallActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isAutoCallActive ? 'Pause Auto-Call' : 'Resume Auto-Call'}</span>
          </button>

          {/* Call Next Present Patient */}
          <button
            type="button"
            onClick={advanceQueue}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Call Next Present Patient</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const servingPatient = activeTokens.find((p) => p.status === 'Serving Now');
              announceToken(`A-0${servingTokenNum}`, servingPatient?.patientName, 'OPD Room 104');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            title="Repeat voice announcement"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice Chime</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Now Serving</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-2">A-0{servingTokenNum}</div>
          <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
            {activeTokens.find((t) => t.status === 'Serving Now')?.patientName || 'Inside Room 104'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs">Total Registered</div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 mt-2">
            {activeTokens.length} Patients
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{waitingCount} Waiting • {completedCount} Done</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs">Absent / Not Present</div>
          <div className="text-2xl sm:text-3xl font-black text-red-500 mt-2">
            {absentCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Skipped during auto-call</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs">Your Token (#A-024)</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {primaryToken ? `#${primaryToken.queuePosition}` : 'None'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {primaryToken?.queuePosition === 0 ? 'Serving Now!' : `Wait: ~${primaryToken?.estimatedWaitMinutes || 0}m`}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 15 REGISTERED QUEUE PATIENTS DIRECTORY & STATUS MANAGEMENT TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Registered OPD Patients Directory ({activeTokens.length} Registered)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live roster showing patient name, chief medical problem, priority token, presence status, and doctor call buttons.
            </p>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search patient / problem..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-1 text-[11px]">
              {(['all', 'waiting', 'absent', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setQueueFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer border ${
                    queueFilter === filter
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patients Roster List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPatients.map((patient) => {
            const isServing = patient.status === 'Serving Now';
            const isAbsent = patient.status === 'Absent';
            const isCompleted = patient.status === 'Completed';

            return (
              <div
                key={patient.id}
                className={`rounded-2xl p-4 border transition flex flex-col justify-between space-y-3 relative ${
                  isServing
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : isAbsent
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-900/60 opacity-80'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 shadow-xs'
                }`}
              >
                <div>
                  {/* Top Bar: Token & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {patient.tokenNumber}
                    </span>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isServing
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 animate-pulse'
                          : isAbsent
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : isCompleted
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>

                  {/* Patient Name & Demographics */}
                  <div className="mt-1.5">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>{patient.patientName}</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        {patient.patientAge}y • {patient.patientGender || 'Male'}
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">{patient.patientPhone}</span>
                  </div>

                  {/* Medical Problem / Complaint */}
                  <div className="mt-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                      <Stethoscope className="w-3 h-3 text-indigo-500" />
                      Health Problem / Complaint:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                      {patient.problem || 'Routine health checkup & OPD consultation'}
                    </p>
                  </div>
                </div>

                {/* Queue Position & Waiting Details */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {isServing
                      ? 'Inside OPD Room 104'
                      : isCompleted
                      ? 'Consultation Done'
                      : isAbsent
                      ? 'Absent (Auto-Skip)'
                      : `Ahead: ${patient.queuePosition} • ~${patient.estimatedWaitMinutes}m wait`}
                  </span>

                  <span className="font-medium text-slate-400">{patient.bookedAt}</span>
                </div>

                {/* Patient Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {/* Call Patient Button */}
                  <button
                    type="button"
                    onClick={() => handleCallSpecificPatient(patient)}
                    disabled={isCompleted}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    title="Call patient into doctor room"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Call</span>
                  </button>

                  {/* Mark Absent / Present Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleAbsent(patient.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 border ${
                      isAbsent
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-50 dark:bg-red-950/60 border-red-200 text-red-700 dark:text-red-300'
                    }`}
                    title={isAbsent ? 'Mark patient present' : 'Mark patient not present'}
                  >
                    {isAbsent ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                    <span>{isAbsent ? 'Present' : 'Absent'}</span>
                  </button>

                  {/* View OPD Pass */}
                  <button
                    type="button"
                    onClick={() => setSelectedTokenForPass(patient)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs transition cursor-pointer"
                    title="View QR OPD Pass"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  {/* Mark Done */}
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleMarkCompleted(patient.id)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg text-xs transition cursor-pointer"
                      title="Mark consultation completed"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two Columns: Book Token Form (Left) & Active Token Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book Token Form (1 Col) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            <span>Book New Digital OPD Token</span>
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="23"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number *
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
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Health Problem / Chief Complaint *
              </label>
              <textarea
                required
                rows={2}
                value={patientProblem}
                onChange={(e) => setPatientProblem(e.target.value)}
                placeholder="e.g. Fever, chest pain, acidity, diabetes checkup..."
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

        {/* Priority Active Pass (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Your Active Priority Pass
            </h4>
          </div>

          {primaryToken && (
            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-indigo-600">{primaryToken.tokenNumber}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {primaryToken.status}
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1">
                    {primaryToken.hospitalName}
                  </h5>
                  <p className="text-xs text-slate-500">{primaryToken.departmentName}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{primaryToken.bookedAt}</span>
                  <span className="text-xs font-bold text-emerald-600">
                    Est. Turn: ~{primaryToken.estimatedWaitMinutes} mins
                  </span>
                </div>
              </div>

              {/* Patient Info Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{primaryToken.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Doctor Assigned:</span>
                  <span className="font-bold text-indigo-600">{primaryToken.doctorName || 'Dr. Sarah Khan'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Room:</span>
                  <span className="font-bold text-emerald-600">{primaryToken.roomNumber || 'OPD Room 104'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Ahead in Line:</span>
                  <span className="font-bold text-blue-600">{primaryToken.queuePosition} Patients</span>
                </div>
              </div>

              {/* Patient Problem */}
              {primaryToken.problem && (
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200">
                  <span className="font-bold block text-[10px] uppercase text-indigo-500">Chief Complaint:</span>
                  <span>{primaryToken.problem}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTokenForPass(primaryToken)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View & Print OPD Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => announceToken(primaryToken.tokenNumber, primaryToken.patientName, primaryToken.roomNumber)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Test Voice Announcement</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCancelToken(primaryToken.id)}
                  className="px-3 py-2 text-slate-400 hover:text-red-600 text-xs font-medium cursor-pointer ml-auto"
                >
                  Cancel Token
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIGITAL OPD PASS MODAL (QR Code + Barcode + Hospital Stamp) */}
      {/* ========================================================================= */}
      {selectedTokenForPass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedTokenForPass(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                Official Digital OPD Appointment Pass
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-2">
                {selectedTokenForPass.hospitalName}
              </h3>
              <p className="text-xs text-slate-500">{selectedTokenForPass.departmentName}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white rounded-2xl p-4 text-center shadow-lg">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">
                Priority Token Number
              </span>
              <div className="text-4xl font-black tracking-wider mt-1 font-mono">
                {selectedTokenForPass.tokenNumber}
              </div>
              <span className="text-xs font-semibold bg-white/20 px-3 py-0.5 rounded-full inline-block mt-1">
                Assigned: {selectedTokenForPass.roomNumber || 'OPD Room 104'}
              </span>
            </div>

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

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Patient:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTokenForPass.patientName}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Consulting Doctor:</span>
                  <span className="font-bold text-indigo-600">{selectedTokenForPass.doctorName || 'Dr. Sarah Khan'}</span>
                </div>
              </div>

              {selectedTokenForPass.problem && (
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Medical Problem:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedTokenForPass.problem}</span>
                </div>
              )}
            </div>

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
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping"></div>
              <div>
                <h2 className="text-xl font-black tracking-wider">{currentHospital.name}</h2>
                <p className="text-xs text-slate-400">
                  Real-Time OPD Lounge Queue Display • Department of General Medicine • Room 104
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

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center justify-center py-6">
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950/80 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl h-full">
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-4 py-1 rounded-full border border-emerald-800">
                Now Serving / अब देख रहे हैं
              </span>
              <div className="text-7xl sm:text-8xl font-black text-white font-mono mt-4 tracking-wider">
                A-0{servingTokenNum}
              </div>
              <div className="text-xl font-bold text-indigo-300 mt-4">
                Patient: <strong className="text-white">{activeTokens.find((t) => t.status === 'Serving Now')?.patientName || 'Next Patient'}</strong>
              </div>
              <div className="text-sm text-slate-300 mt-1">
                Please Proceed to: <strong className="text-emerald-400">OPD Room 104 (Dr. Sarah Khan)</strong>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Auto-calling status: {isAutoCallActive ? 'Active (every 45s)' : 'Paused (Manual calling)'}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                  Next Waiting Patients
                </h4>
                <div className="space-y-2">
                  {activeTokens
                    .filter((t) => t.status === 'Waiting')
                    .slice(0, 5)
                    .map((pat) => (
                      <div
                        key={pat.id}
                        className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono text-sm font-bold text-slate-200 block">
                            {pat.tokenNumber} • {pat.patientName}
                          </span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{pat.problem}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                          #{pat.queuePosition}
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
