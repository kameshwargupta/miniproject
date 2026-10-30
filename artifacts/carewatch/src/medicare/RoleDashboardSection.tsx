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
} from 'lucide-react';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { INITIAL_HOSPITALS, SAMPLE_REPORTS, INITIAL_MEDICINES } from './mockData';

export const RoleDashboardSection: React.FC<{
  lang: LanguageCode;
  onNavigateTab: (tab: string) => void;
}> = ({ lang, onNavigateTab }) => {
  const [activeRole, setActiveRole] = useState<'patient' | 'doctor' | 'hospital' | 'pharmacy'>('patient');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <div className="space-y-6">
      {/* Role Switcher Pill Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xs flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Switch Dashboard Role:
          </span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveRole('patient')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeRole === 'patient'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ?? {t.rolePatient}
            </button>
            <button
              onClick={() => setActiveRole('doctor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeRole === 'doctor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ????? {t.roleDoctor}
            </button>
            <button
              onClick={() => setActiveRole('hospital')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeRole === 'hospital'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ?? {t.roleHospitalAdmin}
            </button>
            <button
              onClick={() => setActiveRole('pharmacy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeRole === 'pharmacy'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ?? {t.rolePharmacyAdmin}
            </button>
          </div>
        </div>

        <ListenButton
          text={
            activeRole === 'patient'
              ? 'Patient Dashboard. Your active token is A-024. Next appointment is with Dr. Sarah Khan. Hemoglobin report is available.'
              : activeRole === 'doctor'
              ? 'Doctor Portal. You have 4 scheduled teleconsultations today and 18 patients in OPD queue.'
              : activeRole === 'hospital'
              ? 'Hospital Administration. 3 active departments operating at 84% capacity. Total waiting queue is 28 patients.'
              : 'Pharmacy Admin. Inventory holds 148 verified medicines. Reported low stock on 2 items.'
          }
          lang={lang}
          label="Listen Summary"
          size="sm"
        />
      </div>

      {/* PATIENT ROLE VIEW */}
      {activeRole === 'patient' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => onNavigateTab('queue')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-blue-500 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-center text-blue-600 mb-2">
                <Ticket className="w-6 h-6" />
                <span className="text-xs font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                  Live Queue
                </span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100">#A-024</h4>
              <p className="text-xs text-slate-500 mt-1">General Medicine • Est: ~18 mins</p>
            </div>

            <div
              onClick={() => onNavigateTab('reports')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-teal-500 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-center text-teal-600 mb-2">
                <FileText className="w-6 h-6" />
                <span className="text-xs font-bold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full">
                  Latest Scan
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">CBC & Lipid</h4>
              <p className="text-xs text-slate-500 mt-1">Hemoglobin 11.8 • 1 Flag</p>
            </div>

            <div
              onClick={() => onNavigateTab('telemedicine')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-500 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-center text-indigo-600 mb-2">
                <Video className="w-6 h-6" />
                <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                  Consultation
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dr. Sarah Khan</h4>
              <p className="text-xs text-slate-500 mt-1">Today, 4:30 PM • Video Call</p>
            </div>

            <div
              onClick={() => onNavigateTab('reminders')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-cyan-500 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-center text-cyan-600 mb-2">
                <Pill className="w-6 h-6" />
                <span className="text-xs font-bold bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full">
                  Upcoming
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pantocid 40</h4>
              <p className="text-xs text-slate-500 mt-1">Next dose: 8:00 AM (Before Meal)</p>
            </div>
          </div>

          {/* Health Journey Timeline & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>Personalized Healthcare Activity Timeline</span>
                <span className="text-xs font-normal text-slate-400">Chronological Record</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Digital Queue Token #A-024 Generated
                    </p>
                    <p className="text-slate-500">AIIMS New Delhi • General Medicine OPD</p>
                    <span className="text-[10px] text-slate-400">Today, 09:45 AM</span>
                  </div>
                  <ListenButton
                    text="Token A-024 generated at AIIMS New Delhi General Medicine OPD. Estimated wait time 18 minutes."
                    lang={lang}
                    label=""
                    size="sm"
                  />
                </div>

                <div className="flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Pathology Report Scanned with AI Explainer
                    </p>
                    <p className="text-slate-500">Complete Blood Count (CBC) • Mild anemia observed</p>
                    <span className="text-[10px] text-slate-400">Today, 10:30 AM</span>
                  </div>
                  <ListenButton
                    text="Pathology report scanned. Mild anemia observed in Hemoglobin parameters. Iron rich food recommended."
                    lang={lang}
                    label=""
                    size="sm"
                  />
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Teleconsultation Scheduled
                    </p>
                    <p className="text-slate-500">Dr. Sarah Khan, MD Medicine • Virtual Room Prepared</p>
                    <span className="text-[10px] text-slate-400">Confirmed for Today 4:30 PM</span>
                  </div>
                  <ListenButton
                    text="Teleconsultation scheduled with Dr. Sarah Khan for today at 4:30 PM."
                    lang={lang}
                    label=""
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Quick Access Card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md space-y-4">
              <h3 className="font-bold text-base">Quick Voice & Health Tools</h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Use your microphone to speak any question, or scan your medicine strip to hear warnings in your mother tongue.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigateTab('medicines')}
                  className="w-full py-2.5 px-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Scan Medicine Blister</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigateTab('pharmacies')}
                  className="w-full py-2.5 px-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Find 24x7 Open Chemist</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigateTab('emergency')}
                  className="w-full py-2.5 px-3 bg-red-500/80 hover:bg-red-500 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Emergency Helpline 112</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR ROLE VIEW */}
      {activeRole === 'doctor' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Clinician Portal • Dr. Sarah Khan
              </h3>
              <p className="text-xs text-slate-500">OPD Queue: 18 Patients • 4 Telehealth Appointments</p>
            </div>
            <button
              onClick={() => onNavigateTab('telemedicine')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Open Consultation Room
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-400 block mb-1">Serving Token</span>
              <span className="text-2xl font-black text-blue-600">#A-020</span>
              <p className="text-slate-500 mt-1">Next: Kameshwar Gupta (#A-024)</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-400 block mb-1">Reviewed AI Reports</span>
              <span className="text-2xl font-black text-teal-600">12 Scans</span>
              <p className="text-slate-500 mt-1">High/Low values pre-extracted</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-400 block mb-1">Telemedicine Status</span>
              <span className="text-2xl font-black text-emerald-600">Online</span>
              <p className="text-slate-500 mt-1">Camera & Mic ready for patients</p>
            </div>
          </div>
        </div>
      )}

      {/* HOSPITAL ADMIN VIEW */}
      {activeRole === 'hospital' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Hospital Queue Command Center
              </h3>
              <p className="text-xs text-slate-500">AIIMS New Delhi • OPD & Specialization Management</p>
            </div>
            <button
              onClick={() => onNavigateTab('queue')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Manage Tokens
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-400 block">General OPD</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">12 Waiting</span>
              <span className="text-[11px] text-emerald-600 block mt-1">Serving #24</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-400 block">Cardiology</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">7 Waiting</span>
              <span className="text-[11px] text-emerald-600 block mt-1">Serving #11</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-400 block">Pediatrics</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">5 Waiting</span>
              <span className="text-[11px] text-emerald-600 block mt-1">Serving #18</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-400 block">Orthopedics</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">8 Waiting</span>
              <span className="text-[11px] text-emerald-600 block mt-1">Serving #09</span>
            </div>
          </div>
        </div>
      )}

      {/* PHARMACY ADMIN VIEW */}
      {activeRole === 'pharmacy' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Pharmacy Stock Management Portal
              </h3>
              <p className="text-xs text-slate-500">Apollo Pharmacy 24x7 • Metro Gate 2</p>
            </div>
            <button
              onClick={() => onNavigateTab('pharmacies')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Update Medicine Stock
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-400 block">Reported In-Stock</span>
              <span className="text-2xl font-black text-emerald-600">142 Medicines</span>
              <p className="text-slate-500 mt-1">Dolo 650, Augmentin, Pantocid</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-400 block">Nearby Patient Enquiries</span>
              <span className="text-2xl font-black text-blue-600">38 Today</span>
              <p className="text-slate-500 mt-1">Direction requests via MediCare</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-400 block">Store Status</span>
              <span className="text-2xl font-black text-indigo-600">Open 24 Hours</span>
              <p className="text-slate-500 mt-1">Emergency counter verified</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
