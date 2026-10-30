import React, { useState } from 'react';
import {
  HeartPulse,
  Ticket,
  FileText,
  Pill,
  MapPin,
  Video,
  Clock,
  PhoneCall,
  Globe,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, type LanguageCode, TRANSLATIONS } from './translations';
import { FloatingCopilot } from './FloatingCopilot';
import { SmartQueueSection } from './SmartQueueSection';
import { ReportScannerSection } from './ReportScannerSection';
import { MedicineScannerSection } from './MedicineScannerSection';
import { PharmacyFinderSection } from './PharmacyFinderSection';
import { TelemedicineSection } from './TelemedicineSection';
import { ReminderSection } from './ReminderSection';
import { EmergencySection } from './EmergencySection';
import { RoleDashboardSection } from './RoleDashboardSection';

export const MediCareApp: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'queue', label: t.navQueue, icon: Ticket },
    { id: 'reports', label: t.navReportScanner, icon: FileText },
    { id: 'medicines', label: t.navMedicineScanner, icon: Pill },
    { id: 'pharmacies', label: t.navPharmacyFinder, icon: MapPin },
    { id: 'telemedicine', label: t.navTelemedicine, icon: Video },
    { id: 'reminders', label: t.navReminders, icon: Clock },
    { id: 'emergency', label: t.navEmergency, icon: PhoneCall, alert: true },
  ];

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {t.appTitle}
                  </h1>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Bar: Language Selector, Dark Mode, Emergency Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 11 Regional Languages Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Globe className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    {l.native} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Emergency Button */}
            <button
              type="button"
              onClick={() => setActiveTab('emergency')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
              <span>SOS 112</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout: Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2 block">
              Core Healthcare Platform
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : item.alert
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-white'
                            : item.alert
                            ? 'text-red-500'
                            : 'text-blue-500 dark:text-cyan-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.alert && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Voice Feature Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Focused Voice Assistance</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Dedicated voice assistance with speed and playback control is active on AI Report Scanner, AI Medicine Scanner, and MediCare Copilot (with interruption support).
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-xs flex">
            <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 space-y-3 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-base">{t.appTitle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5 mt-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                          activeTab === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-3 border-t text-xs text-slate-400 text-center">
                MediCare AI • All-in-One Healthcare
              </div>
            </div>
          </div>
        )}

        {/* Primary Page Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <RoleDashboardSection lang={lang} onNavigateTab={setActiveTab} />
          )}
          {activeTab === 'queue' && <SmartQueueSection lang={lang} />}
          {activeTab === 'reports' && <ReportScannerSection lang={lang} />}
          {activeTab === 'medicines' && <MedicineScannerSection lang={lang} />}
          {activeTab === 'pharmacies' && <PharmacyFinderSection lang={lang} />}
          {activeTab === 'telemedicine' && <TelemedicineSection lang={lang} />}
          {activeTab === 'reminders' && <ReminderSection lang={lang} />}
          {activeTab === 'emergency' && <EmergencySection lang={lang} />}
        </main>
      </div>

      {/* Floating Multilingual AI Voice Assistant Copilot (with Interrupt Option) */}
      <FloatingCopilot lang={lang} />
    </div>
  );
};

export default MediCareApp;
