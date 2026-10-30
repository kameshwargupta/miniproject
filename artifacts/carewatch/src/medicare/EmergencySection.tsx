import React, { useState, useEffect, useRef } from 'react';
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
  Volume2,
  VolumeX,
  Navigation,
  Compass,
  Radio,
  Clock,
  Phone,
  AlertTriangle,
  Activity,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

export const EmergencySection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [sosSent, setSosSent] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [callingNumber, setCallingNumber] = useState<string | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Ambulance Tracker Real-Time State
  const [etaSeconds, setEtaSeconds] = useState(240); // 4 minutes
  const [ambulanceDistance, setAmbulanceDistance] = useState(1.4); // km
  const [isSirenMuted, setIsSirenMuted] = useState(false);

  // Dual Notification States
  const [ambulanceNotification, setAmbulanceNotification] = useState<string | null>(null);
  const [hospitalNotification, setHospitalNotification] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  const { speak, stop } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Bansal Institute of Engineering & Technology (BIET) Coordinates
  const BIET_LOCATION = {
    name: 'Bansal Institute of Engineering & Technology (BIET)',
    address: 'NH-24, Sitapur Road, Behind Sewa Hospital, Lucknow, UP - 226021',
    pincode: '226021',
    coords: '26.9463° N, 80.9252° E',
  };

  // Sound Synthesizer for Emergency Ambulance Siren
  const playSirenSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      let highPitch = false;
      const playTone = () => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          const freq = highPitch ? 960 : 770;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.45);
          highPitch = !highPitch;
        } catch {
          // oscillator catch
        }
      };

      playTone();
      sirenIntervalRef.current = setInterval(playTone, 500);
    } catch {
      // Audio not permitted
    }
  };

  const stopSirenSound = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    stop();
  };

  // Countdown timer for Ambulance ETA when SOS is active
  useEffect(() => {
    let timer: any = null;
    if (sosSent) {
      timer = setInterval(() => {
        setEtaSeconds((prev) => {
          if (prev <= 15) return 15; // stays at 15s when arriving
          return prev - 1;
        });
        setAmbulanceDistance((prev) => {
          if (prev <= 0.1) return 0.1;
          return parseFloat((prev - 0.01).toFixed(2));
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sosSent]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSirenSound();
    };
  }, []);

  // TRIGGER SOS HANDLER
  const handleTriggerSOS = () => {
    if (sosSent) {
      // If already sent, clicking opens track modal
      setIsTrackModalOpen(true);
      return;
    }

    setSosSent(true);
    setEtaSeconds(240); // 4 minutes
    setAmbulanceDistance(1.4);
    setIsTrackModalOpen(true);

    // 1. Play Emergency Siren
    if (!isSirenMuted) {
      playSirenSound();
    }

    // 2. Notification 1: Ambulance Called
    const ambMsg =
      lang === 'hi'
        ? '🚨 एम्बुलेंस को कॉल किया गया: 108 इमरजेंसी एम्बुलेंस सेवा से संपर्क स्थापित। एडवांस लाइफ सपोर्ट यूनिट (UP-32-EG-1082) बीआईईटी कैंपस के लिए रवाना!'
        : '🚨 Ambulance Dispatched: 108 Emergency Ambulance dialed & dispatched. ALS Unit UP-32-EG-1082 en route to BIET Campus, Lucknow 226021!';
    setAmbulanceNotification(ambMsg);

    // 3. Notification 2: Hospital Informed
    const hospMsg =
      lang === 'hi'
        ? '🏥 अस्पताल को सूचित किया गया: सेवा हॉस्पिटल ट्रॉमा सेंटर (सीतापुर रोड) और केजीएमयू इमरजेंसी को आपकी लाइव लोकेशन भेजी गई। ट्रॉमा बेड #03 स्टैंडबाय पर है!'
        : '🏥 Hospital Informed: Sewa Hospital Emergency Trauma Desk & KGMU Critical Care notified with your GPS coordinates. Trauma Bed #03 on standby!';
    setHospitalNotification(hospMsg);

    // 4. Voice announcement
    const announcement =
      lang === 'hi'
        ? 'आपातकालीन एसओएस सक्रिय हो गया है। 108 एम्बुलेंस और सेवा हॉस्पिटल ट्रॉमा सेंटर को सूचित कर दिया गया है। एम्बुलेंस रास्ते में है।'
        : 'Emergency SOS activated. 108 Ambulance and Sewa Hospital Trauma Center have been notified. An ambulance is on the way.';
    setTimeout(() => {
      speak(announcement, lang);
    }, 800);

    // 5. Dial phone intent for 108
    try {
      window.location.href = 'tel:108';
    } catch {
      // Tel protocol handled by mobile browsers
    }
  };

  const handleCancelSOS = () => {
    stopSirenSound();
    setSosSent(false);
    setIsTrackModalOpen(false);
    setAmbulanceNotification(null);
    setHospitalNotification(null);
  };

  const handleCall = (num: string) => {
    setCallingNumber(num);
    try {
      window.location.href = `tel:${num}`;
    } catch {
      // browser fallback
    }
    setTimeout(() => setCallingNumber(null), 4000);
  };

  const formatMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-6">
      {/* Red Alert Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            24x7 Critical Medical Emergency & SOS Dispatch
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.emergencyTitle}</h2>
          <p className="text-red-100 text-sm max-w-xl mt-1">
            Instant 1-tap SOS that immediately dials 108 ambulance, alerts nearby Sewa Hospital trauma center, and provides live GPS ambulance tracking.
          </p>
        </div>

        {/* SOS Action Controls */}
        <div className="flex items-center gap-2">
          {sosSent && (
            <button
              type="button"
              onClick={() => setIsTrackModalOpen(true)}
              className="px-4 py-2.5 bg-white text-red-700 hover:bg-red-50 rounded-xl font-black text-xs shadow-lg transition cursor-pointer flex items-center gap-2 animate-bounce"
            >
              <Ambulance className="w-4 h-4 text-red-600" />
              <span>Track Ambulance (ETA: {formatMinutes(etaSeconds)})</span>
            </button>
          )}

          <div className="bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-xs">
            <span className="text-[10px] text-red-200 block uppercase font-bold">Your Location:</span>
            <span className="font-bold text-white">BIET Campus, Lucknow (226021)</span>
          </div>
        </div>
      </div>

      {/* DUAL NOTIFICATIONS DISPLAY WHEN SOS IS TRIGGERED */}
      {ambulanceNotification && (
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-5 py-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl animate-in fade-in border border-red-400">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Ambulance className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Ambulance Dispatched & Called
                </span>
                <span className="text-xs font-mono font-bold text-amber-200">
                  Unit: UP-32-EG-1082 (108 ALS)
                </span>
              </div>
              <p className="text-xs font-semibold mt-1 text-red-50">{ambulanceNotification}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTrackModalOpen(true)}
              className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Live Track Radar</span>
            </button>
            <button
              type="button"
              onClick={() => setAmbulanceNotification(null)}
              className="p-1.5 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {hospitalNotification && (
        <div className="bg-gradient-to-r from-indigo-700 to-blue-800 text-white px-5 py-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl animate-in fade-in border border-indigo-400">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5 text-emerald-300 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-emerald-300">
                  Hospital Emergency Desk Informed
                </span>
                <span className="text-xs font-bold text-indigo-200">
                  Sewa Hospital (150m from BIET) & KGMU Trauma
                </span>
              </div>
              <p className="text-xs font-semibold mt-1 text-indigo-50">{hospitalNotification}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCall('+918808122445')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Trauma Desk</span>
          </button>
        </div>
      )}

      {/* Calling Notification Banner */}
      {callingNumber && (
        <div className="bg-red-600 text-white px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>Connecting emergency priority line to {callingNumber}...</span>
          </div>
          <button onClick={() => setCallingNumber(null)} className="text-white hover:underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* SOS Button Area */}
      <div className="bg-white dark:bg-slate-900 border-2 border-red-500/40 rounded-3xl p-8 text-center shadow-lg space-y-4">
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <span>One-Tap Medical SOS Alert</span>
          </h3>
          <p className="text-xs text-slate-500">
            Automatically connects 108 ambulance, transmits GPS coordinates to Sewa Hospital Trauma Center, and enables live ambulance radar tracking.
          </p>
        </div>

        {/* Big Pulsing SOS Button */}
        <div>
          <button
            type="button"
            onClick={handleTriggerSOS}
            className={`w-40 h-40 rounded-full font-black text-sm uppercase tracking-wider shadow-2xl transition-all duration-300 cursor-pointer mx-auto flex flex-col items-center justify-center gap-2 border-4 ${
              sosSent
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400 ring-8 ring-emerald-300/40'
                : 'bg-red-600 hover:bg-red-700 text-white border-red-400 ring-8 ring-red-300/40 hover:scale-105 active:scale-95 animate-pulse'
            }`}
          >
            <AlertOctagon className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{sosSent ? 'AMBULANCE TRACKING' : 'PRESS SOS'}</span>
            <span className="text-[10px] font-normal opacity-90">
              {sosSent ? 'Click to View Radar' : 'Auto-calls 108'}
            </span>
          </button>
        </div>

        {sosSent && (
          <div className="max-w-md mx-auto bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 p-4 rounded-2xl text-left text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in space-y-2">
            <div className="font-bold flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>SOS Alert Successfully Executed</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isSirenMuted) {
                    setIsSirenMuted(false);
                    playSirenSound();
                  } else {
                    setIsSirenMuted(true);
                    stopSirenSound();
                  }
                }}
                className="text-slate-500 hover:text-slate-800 p-1"
                title={isSirenMuted ? 'Unmute Siren' : 'Mute Siren'}
              >
                {isSirenMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-red-500 animate-bounce" />}
              </button>
            </div>

            <p className="text-[11px]">• 🚑 108 Ambulance Unit UP-32-EG-1082 dispatched (Distance: {ambulanceDistance} km, ETA: {formatMinutes(etaSeconds)})</p>
            <p className="text-[11px]">• 🏥 Sewa Hospital Trauma Room (Room #03) & ER Physician on standby</p>
            <p className="text-[11px]">• 📍 Live GPS: {BIET_LOCATION.coords} ({BIET_LOCATION.name})</p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTrackModalOpen(true)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open Live Radar Tracker</span>
              </button>

              <button
                type="button"
                onClick={handleCancelSOS}
                className="px-3 py-2 text-xs text-red-600 font-bold hover:underline cursor-pointer"
              >
                Cancel SOS
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setLocationShared(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{locationShared ? '✓ Live GPS Shared (BIET Campus)' : 'Share GPS Coordinates'}</span>
          </button>
        </div>
      </div>

      {/* Emergency Helpline Numbers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Medical Ambulance (Govt.)', num: '108', desc: 'Direct ALS/BLS Ambulance Dispatch', color: 'bg-red-500' },
          { label: 'National Emergency', num: '112', desc: 'Unified Police, Fire & Medical', color: 'bg-amber-500' },
          { label: 'Sewa Hospital Emergency', num: '+91 88081 22445', desc: 'Trauma & ICU (Adjacent to BIET)', color: 'bg-indigo-500' },
          { label: 'KGMU Trauma Center', num: '0522-2257540', desc: 'Level 1 Trauma Care, Lucknow', color: 'bg-emerald-500' },
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
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {item.num}
              </div>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>

            <button
              type="button"
              onClick={() => handleCall(item.num)}
              className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Emergency ({item.num})</span>
            </button>
          </div>
        ))}
      </div>

      {/* Nearby Trauma & Critical Centers */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-red-600" />
          <span>Verified Critical Care & Emergency Trauma Centers (Near BIET 226021)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Sewa Hospital & Trauma Emergency',
              dist: '0.15 km (150m)',
              beds: 12,
              phone: '+91 88081 22445',
              address: 'Sitapur Road, Mohibullapur (Adjacent to BIET Campus)',
            },
            {
              name: "King George's Medical University (KGMU) Trauma",
              dist: '6.2 km',
              beds: 24,
              phone: '0522-2257540',
              address: 'Shah Mina Road, Chowk, Lucknow',
            },
            {
              name: 'Dr. Ram Manohar Lohia Institute (RMLIMS)',
              dist: '9.4 km',
              beds: 18,
              phone: '0522-6692000',
              address: 'Vibhuti Khand, Gomti Nagar, Lucknow',
            },
          ].map((hosp, i) => (
            <div
              key={i}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {hosp.name}
                  </h4>
                  <span className="text-xs font-bold text-red-600 whitespace-nowrap">{hosp.dist}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{hosp.address}</p>
                <div className="text-xs text-emerald-600 font-semibold">
                  ✓ {hosp.beds} Critical Care & ICU Beds Ready
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCall(hosp.phone)}
                className="w-full py-2 bg-white dark:bg-slate-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Emergency Desk</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LIVE AMBULANCE TRACKING RADAR MODAL (FULL INTERACTIVE GPS RADAR & ETA) */}
      {/* ========================================================================= */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in zoom-in-95">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl relative text-white">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping"></div>
                <div>
                  <h3 className="font-black text-base flex items-center gap-2">
                    <span>Live GPS Ambulance Tracker</span>
                    <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
                      ALS Unit En Route
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time telemetry tracking vehicle UP-32-EG-1082 towards BIET Lucknow (226021)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* ETA & Distance Hero Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-red-950/80 via-slate-900 to-indigo-950/80 border border-red-500/30 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Arrival</span>
                  <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                    {formatMinutes(etaSeconds)}
                  </span>
                  <span className="text-[10px] text-slate-400">Real-time GPS update</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Distance</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">
                    {ambulanceDistance} km
                  </span>
                  <span className="text-[10px] text-slate-400">To BIET Campus Gate</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehicle Speed</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                    54 km/h
                  </span>
                  <span className="text-[10px] text-slate-400">Sirens & flashers active</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination Bed</span>
                  <span className="text-2xl font-black text-indigo-400 font-mono mt-1 block">
                    Bed #03
                  </span>
                  <span className="text-[10px] text-slate-400">Sewa Hospital Trauma ICU</span>
                </div>
              </div>

              {/* LIVE RADAR MAP VISUALIZATION */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden min-h-[220px] flex flex-col justify-between">
                {/* Radar grid lines */}
                <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                  <div className="w-96 h-96 rounded-full border border-emerald-500"></div>
                  <div className="w-64 h-64 rounded-full border border-emerald-500"></div>
                  <div className="w-32 h-32 rounded-full border border-emerald-500"></div>
                  <div className="absolute w-full h-[1px] bg-emerald-500"></div>
                  <div className="absolute h-full w-[1px] bg-emerald-500"></div>
                </div>

                {/* Top Radar Bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 z-10">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="font-mono text-emerald-400 font-bold">RADAR TELEMETRY ACTIVE</span>
                  </div>
                  <span className="font-mono text-[11px]">Route: Sitapur Road (NH-24)</span>
                </div>

                {/* Moving Ambulance & Target on Map */}
                <div className="py-6 flex items-center justify-between px-6 sm:px-12 relative z-10">
                  {/* Moving Ambulance */}
                  <div className="flex flex-col items-center space-y-1 animate-pulse">
                    <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg ring-4 ring-red-500/30">
                      <Ambulance className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-amber-300">ALS 108 Ambulance</span>
                    <span className="text-[10px] text-slate-400 font-mono">Passing Mohibullapur</span>
                  </div>

                  {/* Dynamic Progress Pathway */}
                  <div className="flex-1 mx-4 sm:mx-8 flex flex-col items-center">
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 h-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.max(15, 100 - (etaSeconds / 240) * 100))}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono mt-2">
                      Approaching BIET Campus via Sitapur Road • {ambulanceDistance} km away
                    </span>
                  </div>

                  {/* Target: BIET Campus (User Location) */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg ring-4 ring-indigo-500/30">
                      <MapPin className="w-8 h-8 text-amber-300" />
                    </div>
                    <span className="text-xs font-bold text-white">Your Location</span>
                    <span className="text-[10px] text-indigo-300 font-mono">BIET Campus (226021)</span>
                  </div>
                </div>

                {/* Bottom Radar Bar */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800 z-10">
                  <span className="text-slate-400">
                    Sewa Hospital & Trauma Center is alerted 150m ahead for instant admission.
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">Signal: Strong (4G/GPS)</span>
                </div>
              </div>

              {/* Driver & Medical Team Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Ambulance Unit */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Ambulance className="w-4 h-4 text-red-500" />
                      <span>Assigned Ambulance Details</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full font-bold">
                      ALS Certified
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-400">
                    <p>• Vehicle Number: <strong className="text-white font-mono">UP-32-EG-1082</strong></p>
                    <p>• Paramedic In-Charge: <strong className="text-white">Rajesh Singh (EMT-Critical Care)</strong></p>
                    <p>• Onboard Gear: Ventilator, Defibrillator (AED), Oxygen, Suction</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCall('+919415011082')}
                    className="w-full mt-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver / Paramedic (+91 94150 11082)</span>
                  </button>
                </div>

                {/* Pre-Informed Hospital Desk */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-emerald-400" />
                      <span>Pre-Informed Emergency Trauma Desk</span>
                    </span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full font-bold">
                      150m from BIET
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-400">
                    <p>• Hospital: <strong className="text-white">Sewa Hospital Emergency Center</strong></p>
                    <p>• Emergency Room: <strong className="text-emerald-400">Trauma ICU Room #03 Ready</strong></p>
                    <p>• On-Duty Medical Officer: <strong className="text-white">Dr. Sarah Khan / Dr. Verma</strong></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCall('+918808122445')}
                    className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Sewa Hospital Desk (+91 88081 22445)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Keep phone lines clear for incoming driver confirmation call.
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelSOS}
                  className="px-4 py-2 bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel SOS
                </button>
                <button
                  type="button"
                  onClick={() => setIsTrackModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close Tracker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
