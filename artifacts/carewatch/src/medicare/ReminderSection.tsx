import React, { useState } from 'react';
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
} from 'lucide-react';
import { type MedicineReminder } from './mockData';
import { type LanguageCode, TRANSLATIONS } from './translations';

export const ReminderSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [reminders, setReminders] = useState<Array<MedicineReminder & { taken?: boolean }>>([
    {
      id: 'rem-1',
      medicineName: 'Pantocid 40',
      dosage: '1 Tablet',
      time: '08:00 AM',
      frequency: 'Daily Morning',
      mealTiming: 'Before Meal',
      active: true,
      taken: true,
    },
    {
      id: 'rem-2',
      medicineName: 'Dolo 650',
      dosage: '1 Tablet',
      time: '02:00 PM',
      frequency: 'As needed (SOS)',
      mealTiming: 'After Meal',
      active: true,
      taken: false,
    },
    {
      id: 'rem-3',
      medicineName: 'Telma 40',
      dosage: '1 Tablet',
      time: '09:00 PM',
      frequency: 'Daily Night',
      mealTiming: 'After Meal',
      active: true,
      taken: false,
    },
  ]);

  const [newMed, setNewMed] = useState('');
  const [newDosage, setNewDosage] = useState('1 Tablet');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newMeal, setNewMeal] = useState<'Before Meal' | 'After Meal'>('After Meal');
  const [showAddForm, setShowAddForm] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.trim()) return;

    const reminder = {
      id: `rem-${Date.now()}`,
      medicineName: newMed,
      dosage: newDosage,
      time: newTime,
      frequency: 'Daily',
      mealTiming: newMeal,
      active: true,
      taken: false,
    };

    setReminders([...reminders, reminder]);
    setNewMed('');
    setShowAddForm(false);
  };

  const toggleTaken = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, taken: !r.taken } : r))
    );
  };

  const handleDelete = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const takenCount = reminders.filter((r) => r.taken).length;
  const progressPercent = Math.round((takenCount / (reminders.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            Daily Medication Schedule
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.remindersTitle}</h2>
          <p className="text-blue-100 text-sm max-w-xl mt-1">{t.remindersSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addReminder}</span>
        </button>
      </div>

      {/* Daily Progress Tracker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Today's Adherence Progress
          </h3>
          <p className="text-xs text-slate-500">
            {takenCount} of {reminders.length} doses taken today
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-1/2">
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 font-mono">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Add Reminder Modal / Inline Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddReminder}
          className="bg-white dark:bg-slate-900 border border-blue-400 dark:border-blue-700 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in"
        >
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>{t.addReminder}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.medName}
              </label>
              <input
                type="text"
                required
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                placeholder="e.g. Paracetamol, Metformin"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.dosage}
              </label>
              <input
                type="text"
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
                placeholder="1 Tablet, 5ml"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.time}
              </label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.mealTiming}
              </label>
              <select
                value={newMeal}
                onChange={(e) => setNewMeal(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Before Meal">{t.beforeFood}</option>
                <option value="After Meal">{t.afterFood}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {/* Reminder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-5 rounded-2xl border transition-all duration-300 shadow-xs flex flex-col justify-between ${
              rem.taken
                ? 'bg-slate-50 dark:bg-slate-900/40 border-emerald-300 dark:border-emerald-800/60 opacity-80'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
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
                  {rem.taken ? `✓ ${t.taken}` : t.pending}
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
                {rem.dosage} • {rem.mealTiming === 'Before Meal' ? t.beforeFood : t.afterFood}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => toggleTaken(rem.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  rem.taken
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{rem.taken ? t.taken : t.markTaken}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(rem.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                title={t.delete}
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
