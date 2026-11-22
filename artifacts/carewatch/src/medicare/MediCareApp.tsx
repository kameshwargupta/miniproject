import React, { useState, useEffect } from 'react';
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
  User,
  Database,
  UserCheck,
  LogIn,
  LogOut,
  UserPlus,
  KeyRound,
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
import { AuthSection } from './AuthSection';
import { AuthModal } from './AuthModal';
import { getCurrentUser, subscribeAuth, logout, type AuthUser } from './authService';

export const MediCareApp: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // TiDB Auth & User Session
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'database'>('login');

  // Hospital Navigation & Selection
  const [selectedHospitalForPharmacy, setSelectedHospitalForPharmacy] = useState<string>('all');

  useEffect(() => {
    return subscribeAuth((user) => {
      setCurrentUser(user);
    });
  }, []);

  const handleSelectHospitalForPharmacy = (hospId: string) => {
    setSelectedHospitalForPharmacy(hospId);
    setActiveTab('pharmacies');
  };

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
    { id: 'account', label: lang === 'hi' ? 'लॉगिन एवं खाता' : 'Login & Account', icon: KeyRound },
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

          {/* Right Action Bar: Language, Dark Mode, Emergency, and TOP RIGHT UPPER CORNER Auth & Neon DB */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* 11 Regional Languages Dropdown */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[65px] sm:max-w-none"
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
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Emergency SOS Button */}
            <button
              type="button"
              onClick={() => setActiveTab('emergency')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3 h-3 animate-bounce" />
              <span>SOS</span>
            </button>

            {/* Neon DB Live Cloud Data Explorer Pill */}
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('database');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-black text-emerald-700 dark:text-emerald-300 transition-all cursor-pointer shadow-xs"
              title="Neon PostgreSQL Live Cloud Data Viewer"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Neon DB</span>
            </button>

            {/* Subtle Divider */}
            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* RIGHT SIDE UPPER CORNER: SIGN IN & LOGIN BUTTONS */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('account')}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 hover:from-blue-100 hover:to-indigo-100 border border-blue-300 dark:border-blue-700 rounded-xl text-xs font-bold text-blue-800 dark:text-blue-200 transition-all cursor-pointer shadow-xs"
                  title="Account Profile & Neon Database"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-xs font-black leading-tight truncate max-w-[100px]">
                      {currentUser.name}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Neon Active
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setCurrentUser(null);
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-red-200 dark:border-red-800/50 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span className="hidden sm:inline">{lang === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* 1. Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-2 border-blue-500/30 hover:border-blue-600 rounded-xl text-xs font-black text-blue-700 dark:text-blue-300 shadow-xs cursor-pointer transition-all"
                  title="Log In"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{lang === 'hi' ? 'लॉगिन' : 'Log In'}</span>
                </button>

                {/* 2. Sign In / Register Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg cursor-pointer transition-all ring-2 ring-blue-500/20"
                  title="Sign In / Register New Account"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'साइन इन' : 'Sign In'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Layout: Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2 block">
              {t.corePlatform || 'Core Healthcare Platform'}
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
                            ? 'text-red-600 animate-pulse'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.alert && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300">
                        24x7
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Cloud Database Quick Status Banner */}
          <div
            onClick={() => setActiveTab('account')}
            className="p-3.5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-800/40 shadow-sm cursor-pointer hover:border-indigo-600 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black">Neon PostgreSQL DB</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {currentUser
                ? `${currentUser.name} (${currentUser.role})`
                : (lang === 'hi' ? 'खाता बनाएं - सीधा PostgreSQL में सुरक्षित' : 'Sign in to sync your live data')}
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-cyan-300 font-mono">
              <span>5 Live Tables</span>
              <span className="text-emerald-400 font-bold">● Active Sync</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex">
            <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-blue-600" />
                  <span className="font-extrabold text-sm">{t.appTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Auth Buttons */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveTab('account');
                    }}
                    className="flex-1 flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>{currentUser.name}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● Postgres</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setCurrentUser(null);
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-red-600 bg-red-50 dark:bg-red-950/30 cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-blue-600" />
                    <span>{lang === 'hi' ? 'लॉगिन' : 'Log In'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setAuthModalTab('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="p-3 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'साइन इन' : 'Sign In'}</span>
                  </button>
                </div>
              )}

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Primary Page Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <RoleDashboardSection
              lang={lang}
              currentUser={currentUser}
              onNavigateTab={setActiveTab}
              onOpenAuth={(tab) => {
                setAuthModalTab(tab || 'login');
                setIsAuthModalOpen(true);
              }}
            />
          )}
          {activeTab === 'account' && (
            <AuthSection
              lang={lang}
              currentUser={currentUser}
              onUserChanged={setCurrentUser}
              onNavigateTab={setActiveTab}
            />
          )}
          {activeTab === 'queue' && <SmartQueueSection lang={lang} />}
          {activeTab === 'reports' && <ReportScannerSection lang={lang} />}
          {activeTab === 'medicines' && <MedicineScannerSection lang={lang} />}
          {activeTab === 'pharmacies' && (
            <PharmacyFinderSection
              lang={lang}
              initialHospitalId={selectedHospitalForPharmacy}
              onHospitalChange={setSelectedHospitalForPharmacy}
            />
          )}
          {activeTab === 'telemedicine' && <TelemedicineSection lang={lang} />}
          {activeTab === 'reminders' && <ReminderSection lang={lang} />}
          {activeTab === 'emergency' && <EmergencySection lang={lang} />}
        </main>
      </div>

      {/* Floating Multilingual AI Voice Assistant Copilot */}
      <FloatingCopilot lang={lang} />

      {/* TiDB Cloud Authentication & Live Records Inspector Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        initialTab={authModalTab}
        onUserChanged={setCurrentUser}
      />
    </div>
  );
};

export default MediCareApp;
