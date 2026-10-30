import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Calendar,
  Ticket,
  FileText,
  Pill,
  Clock,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users,
  Video,
  CheckCircle,
  AlertTriangle,
  User,
  Plus,
  Send,
} from 'lucide-react';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { INITIAL_HOSPITALS, SAMPLE_REPORTS, INITIAL_MEDICINES } from './mockData';

export const RoleDashboardSection: React.FC<{
  lang: LanguageCode;
  onNavigateTab: (tab: string) => void;
}> = ({ lang, onNavigateTab }) => {
  const [activeRole, setActiveRole] = useState<'patient' | 'doctor' | 'hospital' | 'pharmacy'>('patient');

  // Doctor state
  const [doctorQueue, setDoctorQueue] = useState([
    { token: 'A-024', name: 'Kameshwar Gupta', problem: 'Fever & Fatigue', status: 'Waiting' },
    { token: 'A-025', name: 'Sunita Sharma', problem: 'Chest Tightness', status: 'Waiting' },
    { token: 'A-026', name: 'Rajesh Verma', problem: 'Follow-up BP Check', status: 'Waiting' },
  ]);
  const [currentExamining, setCurrentExamining] = useState('A-023 (Priya Singh - Done)');
  const [prescriptNotes, setPrescriptNotes] = useState('');
  const [prescriptSuccess, setPrescriptSuccess] = useState(false);

  // Pharmacy state
  const [stockLevels, setStockLevels] = useState([
    { name: 'Dolo 650', stock: 450, min: 100, status: 'In Stock' },
    { name: 'Augmentin 625', stock: 18, min: 50, status: 'Low Stock' },
    { name: 'Metformin 500', stock: 240, min: 80, status: 'In Stock' },
    { name: 'Telma 40', stock: 12, min: 40, status: 'Low Stock' },
  ]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleCallNextDoctorPatient = () => {
    if (doctorQueue.length > 0) {
      const next = doctorQueue[0];
      setCurrentExamining(`${next.token} (${next.name})`);
      setDoctorQueue((prev) => prev.slice(1));
    }
  };

  const handleWritePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptNotes.trim()) return;
    setPrescriptSuccess(true);
    setPrescriptNotes('');
    setTimeout(() => setPrescriptSuccess(false), 3000);
  };

  const handleRestock = (index: number) => {
    setStockLevels((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, stock: item.stock + 100, status: 'In Stock' } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Role Switcher Pill Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex flex-wrap gap-2 items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Select View Role:
        </span>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveRole('patient')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeRole === 'patient'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            👤 {t.patientTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('doctor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeRole === 'doctor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🩺 {t.doctorTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('hospital')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeRole === 'hospital'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🏥 {t.hospitalAdminTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('pharmacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeRole === 'pharmacy'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            💊 {t.pharmacyAdminTab}
          </button>
        </div>
      </div>

      {/* PATIENT ROLE VIEW */}
      {activeRole === 'patient' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">{t.activeServing}</span>
              <div className="text-2xl font-black text-blue-600 mt-1">Token #A-024</div>
              <p className="text-xs text-slate-500 mt-1">4 patients ahead of you</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">Daily Doses</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">2 / 3 Taken</div>
              <p className="text-xs text-slate-500 mt-1">Next: Telma 40 at 9:00 PM</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">Latest Lab Report</span>
              <div className="text-2xl font-black text-amber-500 mt-1">CBC & Lipid</div>
              <p className="text-xs text-slate-500 mt-1">Triglycerides slightly high</p>
            </div>

            <div
              onClick={() => onNavigateTab('telemedicine')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-indigo-500 cursor-pointer transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase">Video Consultation</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold group-hover:bg-indigo-600 group-hover:text-white transition">
                  Join Call &rarr;
                </span>
              </div>
              <div className="text-2xl font-black text-indigo-600 mt-1 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-500 animate-pulse" /> Dr. Sarah Khan
              </div>
              <p className="text-xs text-slate-500 mt-1">Ready to connect • Click to launch video consultation</p>
            </div>
          </div>

          {/* Patient Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => onNavigateTab('queue')}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left hover:border-blue-500 shadow-xs transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <Ticket className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {t.navQueue}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Track live hospital queue position</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('report')}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left hover:border-teal-500 shadow-xs transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <FileText className="w-6 h-6 text-teal-600 mb-2" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {t.navReportScanner}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Analyze lab test report with OCR</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('medicine')}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left hover:border-emerald-500 shadow-xs transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <Pill className="w-6 h-6 text-emerald-600 mb-2" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {t.navMedicineScanner}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Identify pills and check safety warnings</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* DOCTOR ROLE VIEW */}
      {activeRole === 'doctor' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                Active Clinical Session
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                Now Attending: {currentExamining}
              </h3>
              <p className="text-xs text-slate-500">
                Department: OPD General Medicine • Room 104
              </p>
            </div>

            <button
              type="button"
              onClick={handleCallNextDoctorPatient}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Call Next Patient ({doctorQueue.length} waiting)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Waiting Queue List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center justify-between">
                <span>{t.patientsInQueue}</span>
                <span className="text-xs text-indigo-600 font-semibold">{doctorQueue.length} Patients</span>
              </h4>

              {doctorQueue.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No patients waiting in queue.</p>
              ) : (
                <div className="space-y-2">
                  {doctorQueue.map((pat, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-indigo-600">{pat.token}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 ml-2">
                          {pat.name}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{pat.problem}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold">
                        {pat.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Electronic Prescription Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">
                Digital Prescription Pad
              </h4>

              {prescriptSuccess && (
                <div className="mb-3 p-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold">
                  ✓ Prescription digitally signed & dispatched to patient app and pharmacy.
                </div>
              )}

              <form onSubmit={handleWritePrescription} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Diagnosis & Clinical Notes</label>
                  <textarea
                    rows={4}
                    value={prescriptNotes}
                    onChange={(e) => setPrescriptNotes(e.target.value)}
                    placeholder="e.g. Mild upper respiratory infection. Tab. Paracetamol 650mg TDS x 3 days. Steam inhalation."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Issue Digital Prescription</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* HOSPITAL ADMIN VIEW */}
      {activeRole === 'hospital' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">{t.bedOccupancy}</span>
              <div className="text-2xl font-black text-teal-600 mt-1">84% (42/50)</div>
              <p className="text-xs text-slate-500 mt-1">8 ICU beds vacant</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">Doctors on Duty</span>
              <div className="text-2xl font-black text-blue-600 mt-1">16 Active</div>
              <p className="text-xs text-slate-500 mt-1">Across 6 departments</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">OPD Footfall Today</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">342 Patients</div>
              <p className="text-xs text-slate-500 mt-1">Average wait: 14 mins</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">Emergency Trauma</span>
              <div className="text-2xl font-black text-red-600 mt-1">Ready</div>
              <p className="text-xs text-slate-500 mt-1">3 Ambulances on standby</p>
            </div>
          </div>
        </div>
      )}

      {/* PHARMACY ADMIN VIEW */}
      {activeRole === 'pharmacy' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span>Pharmacy Inventory & {t.stockAlerts}</span>
              </h4>
              <span className="text-xs text-slate-400">Apollo Pharmacy Central Hub</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Medicine</th>
                    <th className="py-2.5 px-3">Units in Stock</th>
                    <th className="py-2.5 px-3">Minimum Alert Level</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stockLevels.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">{item.stock} units</td>
                      <td className="py-2.5 px-3 text-slate-400">{item.min} units</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'In Stock'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 animate-pulse'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRestock(idx)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          +100 Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
