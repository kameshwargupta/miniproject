import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Clock,
  Plus,
  Pill,
  CheckCircle,
  AlertCircle,
  Calendar,
  Trash2,
  Check,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  AlarmClock,
  ShieldAlert,
  X,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';
import { type MedicineReminder } from './mockData';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

// Safe local date string generator (YYYY-MM-DD) avoiding UTC midnight timezone shift
const getLocalDateString = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Safe End Date calculator with absolute error guarding
const calculateEndDateSafely = (startDateStr: string, days: number): string => {
  if (!startDateStr || typeof startDateStr !== 'string') {
    return getLocalDateString(days || 5);
  }
  try {
    const parts = startDateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const target = new Date(y, m, d);
        target.setDate(target.getDate() + (Number(days) || 1));
        const resY = target.getFullYear();
        const resM = String(target.getMonth() + 1).padStart(2, '0');
        const resD = String(target.getDate()).padStart(2, '0');
        return `${resY}-${resM}-${resD}`;
      }
    }
    const parsed = new Date(startDateStr);
    if (!isNaN(parsed.getTime())) {
      parsed.setDate(parsed.getDate() + (Number(days) || 1));
      return parsed.toISOString().split('T')[0];
    }
  } catch {
    // Return safe fallback
  }
  return getLocalDateString(days || 5);
};

// Format standard 24hr or 12hr time string to 12hr "HH:MM AM/PM"
const formatTo12HourTime = (timeStr: string): string => {
  if (!timeStr) return '08:00 AM';
  const clean = timeStr.trim();
  // Already in 12hr format
  if (clean.includes('AM') || clean.includes('PM')) {
    return clean;
  }
  // 24hr format "HH:MM"
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h)) h = 8;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h.toString().padStart(2, '0')}:${(isNaN(m) ? 0 : m).toString().padStart(2, '0')} ${ampm}`;
};

export const ReminderSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [reminders, setReminders] = useState<MedicineReminder[]>([
    {
      id: 'rem-1',
      medicineName: 'Pantocid 40',
      dosage: '1 Tablet',
      time: '08:00 AM',
      frequency: 'Once Daily (Morning Empty Stomach)',
      mealTiming: 'Before Meal',
      startDate: getLocalDateString(-2),
      endDate: getLocalDateString(5),
      durationDays: 7,
      specificTimes: ['08:00 AM'],
      alarmSoundEnabled: true,
      notificationEnabled: true,
      active: true,
      taken: true,
    },
    {
      id: 'rem-2',
      medicineName: 'Augmentin 625 Duo',
      dosage: '1 Tablet',
      time: '01:30 PM',
      frequency: 'Twice Daily (Morning & Night)',
      mealTiming: 'After Meal',
      startDate: getLocalDateString(0),
      endDate: getLocalDateString(5),
      durationDays: 5,
      specificTimes: ['08:30 AM', '01:30 PM', '09:00 PM'],
      alarmSoundEnabled: true,
      notificationEnabled: true,
      active: true,
      taken: false,
    },
    {
      id: 'rem-3',
      medicineName: 'Dolo 650',
      dosage: '1 Tablet',
      time: '09:00 PM',
      frequency: 'SOS (Fever > 99.5°F)',
      mealTiming: 'After Meal',
      startDate: getLocalDateString(0),
      endDate: getLocalDateString(3),
      durationDays: 3,
      specificTimes: ['09:00 PM'],
      alarmSoundEnabled: true,
      notificationEnabled: true,
      active: true,
      taken: false,
    },
  ]);

  // Form State
  const [newMed, setNewMed] = useState('');
  const [newDosage, setNewDosage] = useState('1 Tablet');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [newMeal, setNewMeal] = useState<'Before Meal' | 'After Meal'>('After Meal');
  const [newStartDate, setNewStartDate] = useState(getLocalDateString(0));
  const [newDurationDays, setNewDurationDays] = useState(5);
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Alarm Engine State
  const [activeAlarmReminder, setActiveAlarmReminder] = useState<MedicineReminder | null>(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<any>(null);

  const { speak, stop } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Sound Synthesizer for Medical Alarm (Beep-Beep-Beep pattern)
  const triggerAlarmSound = (medName = 'Medicine') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      setIsAlarmPlaying(true);

      const playBeep = () => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
          osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } catch {
          // oscillator error ignored
        }
      };

      playBeep();
      setTimeout(playBeep, 200);

      alarmIntervalRef.current = setInterval(() => {
        playBeep();
        setTimeout(playBeep, 200);
      }, 1400);

      // Speak aloud medicine reminder prompt
      const spokenMsg =
        lang === 'hi'
          ? `दवा का समय हो गया है। कृपया अपनी दवा ${medName} समय पर लें।`
          : `Medicine reminder: It is time to take your prescribed dose of ${medName}.`;
      setTimeout(() => {
        speak(spokenMsg, lang);
      }, 600);
    } catch {
      // Audio not permitted
    }
  };

  const stopAlarmSound = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setIsAlarmPlaying(false);
    stop();
  };

  // Browser Notification helper
  const sendBrowserNotification = (med: MedicineReminder) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`⏰ MediCare Medicine Alarm: ${med.medicineName}`, {
          body: `Time to take ${med.dosage} (${med.mealTiming}). Take with water!`,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(`⏰ MediCare Medicine Alarm: ${med.medicineName}`, {
              body: `Time to take ${med.dosage} (${med.mealTiming}).`,
            });
          }
        }).catch(() => {});
      }
    }
  };

  // Real-Time Clock Checker: checks current time every 10 seconds against reminders
  useEffect(() => {
    const checkClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 12-hour format
      const formattedCurrentTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')} ${ampm}`;

      // Check if any reminder matches and has not been taken today
      const match = reminders.find(
        (r) =>
          r.active &&
          !r.taken &&
          (r.time === formattedCurrentTime || (r.specificTimes && r.specificTimes.includes(formattedCurrentTime)))
      );

      if (match && !activeAlarmReminder) {
        setActiveAlarmReminder(match);
        triggerAlarmSound(match.medicineName);
        sendBrowserNotification(match);
      }
    };

    const timer = setInterval(checkClock, 10000);
    return () => {
      clearInterval(timer);
      stopAlarmSound();
    };
  }, [reminders, activeAlarmReminder]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.trim()) return;

    const chosenTime = useCustomTime && customTimeInput.trim()
      ? formatTo12HourTime(customTimeInput)
      : newTime;

    const endDate = calculateEndDateSafely(newStartDate, newDurationDays);

    const reminder: MedicineReminder = {
      id: `rem-${Date.now()}`,
      medicineName: newMed.trim(),
      dosage: newDosage.trim() || '1 Tablet',
      time: chosenTime,
      frequency: `${newDurationDays} Days Course`,
      mealTiming: newMeal,
      startDate: newStartDate,
      endDate: endDate,
      durationDays: newDurationDays,
      specificTimes: [chosenTime],
      alarmSoundEnabled: true,
      notificationEnabled: true,
      active: true,
      taken: false,
    };

    setReminders([reminder, ...reminders]);
    setNewMed('');
    setShowAddForm(false);
    setStatusMessage(`Alarm scheduled for ${reminder.medicineName} at ${chosenTime}!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const toggleTaken = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, taken: !r.taken } : r))
    );
  };

  const handleDelete = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Test Alarm Button for instant demonstration (Safe even if list empty)
  const handleTestAlarm = (rem?: MedicineReminder) => {
    const targetRem: MedicineReminder = rem || reminders[0] || {
      id: 'test-1',
      medicineName: 'Paracetamol 650mg',
      dosage: '1 Tablet',
      time: '08:00 AM',
      frequency: 'SOS (Fever)',
      mealTiming: 'After Meal',
      startDate: getLocalDateString(0),
      endDate: getLocalDateString(3),
      durationDays: 3,
      specificTimes: ['08:00 AM'],
      alarmSoundEnabled: true,
      notificationEnabled: true,
      active: true,
      taken: false,
    };

    setActiveAlarmReminder(targetRem);
    triggerAlarmSound(targetRem.medicineName);
    sendBrowserNotification(targetRem);
  };

  const handleDismissAlarm = (markAsTaken = false) => {
    stopAlarmSound();
    if (activeAlarmReminder && markAsTaken) {
      toggleTaken(activeAlarmReminder.id);
    }
    setActiveAlarmReminder(null);
  };

  const takenCount = reminders.filter((r) => r.taken).length;
  const progressPercent = Math.round((takenCount / (reminders.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <AlarmClock className="w-3.5 h-3.5 text-amber-300" />
            Smart Medication Schedule, Alarms & Duration Tracker
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.remindersTitle}</h2>
          <p className="text-blue-100 text-sm max-w-xl mt-1">
            Never miss a dose. Set specific medicine times, starting dates, treatment duration, and receive automatic audio alarms and notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTestAlarm(reminders[0])}
            className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            title="Test Alarm Sound and Notification"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Test Alarm Sound</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addReminder}</span>
          </button>
        </div>
      </div>

      {/* Success / Alert Toast */}
      {statusMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-100 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ACTIVE MEDICATION ALARM RINGING MODAL */}
      {activeAlarmReminder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white dark:bg-slate-900 border-2 border-red-500 rounded-3xl p-6 w-full max-w-md shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 mx-auto flex items-center justify-center animate-bounce">
              <AlarmClock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 font-bold uppercase">
                ⏰ Medicine Alarm Ringing!
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                Time to take {activeAlarmReminder.medicineName}
              </h3>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                {activeAlarmReminder.dosage} • {activeAlarmReminder.mealTiming}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Course: {activeAlarmReminder.durationDays} Days ({activeAlarmReminder.startDate} to{' '}
                {activeAlarmReminder.endDate})
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDismissAlarm(true)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>I Took This Dose (Mark as Taken)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDismissAlarm(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Snooze 5 Minutes / Dismiss Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Progress & Adherence Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Today's Progress</span>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
              {progressPercent}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {takenCount} of {reminders.length} doses completed
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Active Courses</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {reminders.length} Medications
          </div>
          <span className="text-[11px] text-slate-500">Audio alarm & notifications active</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Current Adherence Streak</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1.5">
            🔥 5 Days Perfect
          </div>
          <span className="text-[11px] text-slate-500">Consistent timing improves efficacy</span>
        </div>
      </div>

      {/* Add Reminder Form with Date, Time, & Duration Picker */}
      {showAddForm && (
        <form
          onSubmit={handleAddReminder}
          className="bg-white dark:bg-slate-900 border-2 border-blue-400 dark:border-blue-700 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Schedule New Medicine with Alarm & Duration</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Medicine Suggestions */}
          <div>
            <span className="text-[11px] text-slate-400 font-bold block mb-1">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Dolo 650 (Paracetamol)', 'Pantocid 40', 'Augmentin 625 Duo', 'Telma 40', 'Becosules Z'].map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewMed(preset)}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-medium transition cursor-pointer text-slate-700 dark:text-slate-300"
                  >
                    + {preset}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* Medicine Name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                placeholder="e.g. Paracetamol, Dolo 650, Metformin"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dosage */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dosage Amount *
              </label>
              <input
                type="text"
                required
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
                placeholder="1 Tablet, 5ml syrup, 2 drops"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Daily Time Picker (Preset or Custom) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Scheduled Daily Time *
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomTime(!useCustomTime)}
                  className="text-[10px] text-blue-600 hover:underline font-bold"
                >
                  {useCustomTime ? 'Use Presets' : 'Custom Time'}
                </button>
              </div>

              {useCustomTime ? (
                <input
                  type="time"
                  required
                  value={customTimeInput}
                  onChange={(e) => setCustomTimeInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="07:00 AM">07:00 AM (Early Morning)</option>
                  <option value="08:00 AM">08:00 AM (Breakfast)</option>
                  <option value="01:30 PM">01:30 PM (Lunch)</option>
                  <option value="05:00 PM">05:00 PM (Tea/Evening)</option>
                  <option value="08:30 PM">08:30 PM (Dinner)</option>
                  <option value="10:00 PM">10:00 PM (Bedtime)</option>
                </select>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Starting Date *
              </label>
              <input
                type="date"
                required
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* For How Long (Duration in Days) */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                For How Long to Take (Duration) *
              </label>
              <select
                value={newDurationDays}
                onChange={(e) => setNewDurationDays(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 Days Course</option>
                <option value={5}>5 Days Course (Standard Antibiotic)</option>
                <option value={7}>7 Days (1 Week)</option>
                <option value={10}>10 Days Course</option>
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={30}>30 Days (1 Month Refill)</option>
                <option value={90}>90 Days (Chronic Maintenance)</option>
              </select>
            </div>

            {/* Meal Timing */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meal Relation *
              </label>
              <select
                value={newMeal}
                onChange={(e) => setNewMeal(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="After Meal">After Food (Post-Meal)</option>
                <option value="Before Meal">Before Food (Empty Stomach)</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-700 dark:text-slate-300">
              📅 Calculated Schedule: <strong>{newStartDate}</strong> to{' '}
              <strong className="text-blue-600 dark:text-blue-400">
                {calculateEndDateSafely(newStartDate, newDurationDays)}
              </strong>{' '}
              ({newDurationDays} days total)
            </span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Audio Alarm & Notifications Active
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
            >
              Save Schedule & Set Alarm
            </button>
          </div>
        </form>
      )}

      {/* Reminder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-5 rounded-2xl border transition-all duration-300 shadow-xs flex flex-col justify-between ${
              rem.taken
                ? 'bg-slate-50 dark:bg-slate-900/40 border-emerald-300 dark:border-emerald-800/60 opacity-85'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {rem.time}
                </span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    rem.taken
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  }`}
                >
                  {rem.taken ? '✓ Taken' : 'Pending Dose'}
                </span>
              </div>

              <h4
                className={`font-black text-lg text-slate-900 dark:text-slate-100 ${
                  rem.taken ? 'line-through text-slate-400 dark:text-slate-600' : ''
                }`}
              >
                {rem.medicineName}
              </h4>

              <p className="text-xs text-slate-500 mt-0.5">
                {rem.dosage} • {rem.mealTiming}
              </p>

              {/* Course Duration & Date Range */}
              <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-500" />
                    <span>Duration:</span>
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {rem.durationDays} Days Course
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>From: {rem.startDate}</span>
                  <span>Until: {rem.endDate}</span>
                </div>
              </div>
            </div>

            {/* Actions: Mark Taken + Test Alarm + Delete */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
              <button
                type="button"
                onClick={() => toggleTaken(rem.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  rem.taken
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{rem.taken ? 'Taken ✓' : 'Mark Taken'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestAlarm(rem)}
                className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition cursor-pointer"
                title="Ring Alarm Now"
              >
                <AlarmClock className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(rem.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
                title="Delete Reminder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
