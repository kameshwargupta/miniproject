import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Plus,
  Pill,
  CheckCircle,
  AlertCircle,
  Calendar,
  Volume2,
  Trash2,
} from 'lucide-react';
import { type MedicineReminder } from './mockData';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

export const ReminderSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [reminders, setReminders] = useState<MedicineReminder[]>([
    {
      id: 'rem-1',
      medicineName: 'Pantocid 40',
      dosage: '1 Tablet',
      time: '08:00 AM',
      frequency: 'Daily Morning',
      mealTiming: 'Before Meal',
      active: true,
    },
    {
      id: 'rem-2',
      medicineName: 'Dolo 650',
      dosage: '1 Tablet',
      time: '02:00 PM',
      frequency: 'As needed (SOS)',
      mealTiming: 'After Meal',
      active: true,
    },
    {
      id: 'rem-3',
      medicineName: 'Telma 40',
      dosage: '1 Tablet',
      time: '09:00 PM',
      frequency: 'Daily Night',
      mealTiming: 'After Meal',
      active: true,
    },
  ]);

  const [newMed, setNewMed] = useState('');
  const [newDosage, setNewDosage] = useState('1 Tablet');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newMeal, setNewMeal] = useState<'Before Meal' | 'After Meal'>('After Meal');

  const { speak } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.trim()) return;

    const reminder: MedicineReminder = {
      id: `rem-${Date.now()}`,
      medicineName: newMed,
      dosage: newDosage,
      time: newTime,
      frequency: 'Daily',
      mealTiming: newMeal,
      active: true,
    };

    setReminders([...reminders, reminder]);
    setNewMed('');

    speak(
      lang === 'hi'
        ? `??? ???????? ??? ?? ???: ${newMed}, ??? ${newTime}, ${newMeal}?`
        : `Reminder set for ${newMed} at ${newTime}, ${newMeal}.`,
      lang
    );
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-700 via-teal-700 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            Audio & Multilingual Dose Alerts
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.navReminders}</h2>
          <p className="text-cyan-100 text-sm max-w-xl mt-1">
            Never miss prescribed medications. Receive multilingual sound alerts and spoken dosage reminders.
          </p>
        </div>
        <ListenButton
          text={
            lang === 'hi'
              ? '??? ???????? ??? ???? ?????? ??? ???? ?? ???? ??????? ?? ??? ?? ?????? ?? ???? ???????? ??? ?? ???? ????'
              : 'Welcome to Medicine Reminders. Schedule daily alerts and voice notifications for your medications.'
          }
          lang={lang}
          label="Listen Overview"
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reminder Cards */}
        <div className="lg:col-span-2 space-y-3">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {r.medicineName} ({r.dosage})
                  </h4>
                  <p className="text-xs text-slate-500">
                    ? {r.time} • {r.mealTiming} • {r.frequency}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <ListenButton
                  text={`Reminder for ${r.medicineName}, dosage ${r.dosage}, scheduled at ${r.time}, to be taken ${r.mealTiming}.`}
                  lang={lang}
                  label="Listen"
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => toggleReminder(r.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    r.active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {r.active ? 'Active' : 'Paused'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteReminder(r.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Reminder Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-600" />
            Add Medication Reminder
          </h3>

          <form onSubmit={handleAddReminder} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Medicine Name
              </label>
              <input
                type="text"
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                placeholder="e.g. Paracetamol, Metformin"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Dosage
              </label>
              <input
                type="text"
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
                placeholder="e.g. 1 Tablet or 5ml"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Meal Timing
                </label>
                <select
                  value={newMeal}
                  onChange={(e) => setNewMeal(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="Before Meal">Before Meal</option>
                  <option value="After Meal">After Meal</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs transition-all"
            >
              Save Schedule
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
