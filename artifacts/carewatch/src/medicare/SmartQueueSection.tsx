import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { INITIAL_HOSPITALS, type QueueToken, type Hospital } from './mockData';
import { type LanguageCode, TRANSLATIONS } from './translations';

export const SmartQueueSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [hospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [selectedHosp, setSelectedHosp] = useState(INITIAL_HOSPITALS[0].id);
  const [selectedDep, setSelectedDep] = useState(INITIAL_HOSPITALS[0].departments[0].id);
  const [patientName, setPatientName] = useState('Kameshwar Gupta');
  const [patientPhone, setPatientPhone] = useState('+91 98765 43210');
  const [bookingSuccess, setBookingSuccess] = useState(false);

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

  const [servingTokenNum, setServingTokenNum] = useState<number>(20);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const currentHospital = hospitals.find((h) => h.id === selectedHosp) || hospitals[0];
  const currentDepartment =
    currentHospital.departments.find((d) => d.id === selectedDep) || currentHospital.departments[0];

  // Simulated queue progression over time
  useEffect(() => {
    const timer = setInterval(() => {
      setServingTokenNum((prev) => prev + 1);
      setActiveTokens((prevTokens) =>
        prevTokens.map((tok) => {
          if (tok.status === 'Waiting') {
            const newPos = Math.max(0, tok.queuePosition - 1);
            return {
              ...tok,
              currentServing: tok.currentServing + 1,
              queuePosition: newPos,
              estimatedWaitMinutes: Math.max(0, newPos * 4),
              status: newPos === 0 ? 'Serving Now' : 'Waiting',
            };
          }
          return tok;
        })
      );
    }, 45000); // Progresses every 45 seconds

    return () => clearInterval(timer);
  }, []);

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
      patientPhone: patientPhone || '+91 98765 43210',
      queuePosition: activeTokens.length + 3,
      currentServing: servingTokenNum,
      estimatedWaitMinutes: waitTime,
      status: 'Waiting',
      bookedAt: 'Just now',
    };

    setActiveTokens([newToken, ...activeTokens]);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 4000);
  };

  const handleCancelToken = (id: string) => {
    setActiveTokens((prev) => prev.filter((t) => t.id !== id));
  };

  // Staff simulation controls
  const handleCallNext = () => {
    setServingTokenNum((prev) => prev + 1);
    setActiveTokens((prevTokens) =>
      prevTokens.map((tok) => {
        const newPos = Math.max(0, tok.queuePosition - 1);
        return {
          ...tok,
          currentServing: tok.currentServing + 1,
          queuePosition: newPos,
          estimatedWaitMinutes: Math.max(0, newPos * 4),
          status: newPos === 0 ? 'Serving Now' : tok.status,
        };
      })
    );
  };

  const handleSkipToken = () => {
    setServingTokenNum((prev) => prev + 1);
  };

  const handleMarkCompleted = (id: string) => {
    setActiveTokens((prev) =>
      prev.map((tok) => (tok.id === id ? { ...tok, status: 'Completed', queuePosition: 0 } : tok))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            Real-Time Token Tracking
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.queueTitle}</h2>
          <p className="text-blue-100 text-sm max-w-xl mt-1">{t.queueSubtitle}</p>
        </div>
      </div>

      {/* Hospital Staff Controls Card */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
            {t.staffControls}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            Current: A-0{servingTokenNum}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCallNext}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.callNext}</span>
          </button>
          <button
            type="button"
            onClick={handleSkipToken}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>{t.skipPatient}</span>
          </button>
        </div>
      </div>

      {bookingSuccess && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">{t.tokenBookedSuccess}</span>
          </div>
          <span className="text-xs text-emerald-100">SMS confirmation simulated</span>
        </div>
      )}

      {/* Real-Time Live Status Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{t.activeServing}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">A-0{servingTokenNum}</div>
          <div className="text-xs text-slate-500 mt-1">{currentHospital.name}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-slate-500 text-xs">{t.positionInQueue}</div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-2">
            {activeTokens[0] ? `#${activeTokens[0].queuePosition}` : '0'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Patients ahead of you</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-slate-500 text-xs">{t.estimatedWait}</div>
          <div className="text-3xl font-extrabold text-cyan-600 mt-2">
            {activeTokens[0] ? `${activeTokens[0].estimatedWaitMinutes}m` : '0m'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Based on avg OPD speed</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-slate-500 text-xs">{t.yourToken}</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {activeTokens[0] ? activeTokens[0].tokenNumber : 'None'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {activeTokens[0] ? activeTokens[0].status : 'No active token'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book Token Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Ticket className="w-5 h-5 text-blue-600" />
            <span>{t.bookNewToken}</span>
          </h3>

          <form onSubmit={handleBookToken} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.selectHospital}
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.department}
              </label>
              <select
                value={selectedDep}
                onChange={(e) => setSelectedDep(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                {currentHospital.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} • Waiting: {d.totalWaiting}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Patient Name
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
            >
              <Ticket className="w-4 h-4" />
              <span>{t.bookNewToken}</span>
            </button>
          </form>
        </div>

        {/* Active & Booked Tokens List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Active Booked Tokens</span>
            </h3>
            <span className="text-xs text-slate-500">{activeTokens.length} active</span>
          </div>

          {activeTokens.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              <Ticket className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="font-semibold">No active tokens</p>
              <p className="text-xs">Book a new token using the form to reserve your spot.</p>
            </div>
          ) : (
            activeTokens.map((token) => (
              <div
                key={token.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all hover:border-blue-400"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {token.tokenNumber}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          token.status === 'Serving Now'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 animate-pulse'
                            : token.status === 'Completed'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {token.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {token.hospitalName} • {token.departmentName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Patient: {token.patientName} ({token.patientPhone}) • Booked: {token.bookedAt}
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-end gap-2 text-right">
                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs">
                      <span className="text-slate-500">Queue Position: </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        #{token.queuePosition}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Est. Wait: <span className="font-bold text-cyan-600">{token.estimatedWaitMinutes} mins</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Serving A-0{servingTokenNum} now</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {token.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => handleMarkCompleted(token.id)}
                        className="text-xs px-2.5 py-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg font-medium transition cursor-pointer flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{t.markDone}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCancelToken(token.id)}
                      className="text-xs px-2.5 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg font-medium transition cursor-pointer"
                    >
                      {t.cancelToken}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
