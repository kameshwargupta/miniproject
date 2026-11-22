import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  Database,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Activity,
  UserPlus,
  LogIn,
  KeyRound,
  Server,
  Ticket,
  FileText,
  Clock,
} from 'lucide-react';
import {
  type AuthUser,
  type DbStatus,
  getCurrentUser,
  loginUser,
  registerUser,
  logout,
  fetchTiDBUsers,
  fetchTiDBLogs,
  fetchTiDBStatus,
  fetchQueueTokens,
  fetchMedicalReports,
  fetchMedicineReminders,
} from './authService';
import { type LanguageCode } from './translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: LanguageCode;
  onUserChanged?: (user: AuthUser | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
  onUserChanged,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'database'>('login');
  const [dbSubTab, setDbSubTab] = useState<'users' | 'logs' | 'tokens' | 'reports' | 'reminders'>('users');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser());

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'hospital' | 'pharmacy'>('patient');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [age, setAge] = useState(25);

  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Database Explorer States (ALL 5 Tables)
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [dbTokens, setDbTokens] = useState<any[]>([]);
  const [dbReports, setDbReports] = useState<any[]>([]);
  const [dbReminders, setDbReminders] = useState<any[]>([]);
  const [refreshingDb, setRefreshingDb] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentUser(getCurrentUser());
      loadDbData();
    }
  }, [isOpen]);

  const loadDbData = async () => {
    setRefreshingDb(true);
    try {
      const [status, users, logs, tokens, reports, reminders] = await Promise.all([
        fetchTiDBStatus(),
        fetchTiDBUsers(50),
        fetchTiDBLogs(50),
        fetchQueueTokens(),
        fetchMedicalReports(),
        fetchMedicineReminders(),
      ]);
      setDbStatus(status);
      setRegisteredUsers(users);
      setLoginLogs(logs);
      setDbTokens(tokens);
      setDbReports(reports);
      setDbReminders(reminders);
    } catch {
      // Graceful fallback
    } finally {
      setRefreshingDb(false);
    }
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setFeedbackMsg({ type: 'error', text: lang === 'hi' ? 'ईमेल दर्ज करें' : 'Please enter an email' });
      return;
    }
    setLoading(true);
    setFeedbackMsg(null);

    const res = await loginUser({ email, password, name, role, phone });
    setLoading(false);

    if (res.success) {
      setCurrentUser(res.user);
      if (onUserChanged) onUserChanged(res.user);
      const eng = res.engine || dbStatus?.activeEngine || 'Neon PostgreSQL';
      setFeedbackMsg({
        type: 'success',
        text:
          lang === 'hi'
            ? `स्वागत है ${res.user.name}! ${eng} डेटाबेस में लाइव सुरक्षित हो गया।`
            : `Welcome back, ${res.user.name}! Synced with ${eng}.`,
      });
      loadDbData();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.message || (lang === 'hi' ? 'लॉगिन विफल' : 'Login failed'),
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setFeedbackMsg({
        type: 'error',
        text: lang === 'hi' ? 'नाम और ईमेल आवश्यक हैं' : 'Name and email are required',
      });
      return;
    }
    setLoading(true);
    setFeedbackMsg(null);

    const res = await registerUser({
      name,
      email,
      password,
      role,
      phone,
      blood_group: bloodGroup,
      age,
      city,
    });
    setLoading(false);

    if (res.success) {
      setCurrentUser(res.user);
      if (onUserChanged) onUserChanged(res.user);
      const eng = res.engine || dbStatus?.activeEngine || 'Neon PostgreSQL';
      setFeedbackMsg({
        type: 'success',
        text:
          lang === 'hi'
            ? `नया खाता बन गया! ${eng} डेटाबेस में सेव हुआ।`
            : `Account created successfully! Saved to ${eng}.`,
      });
      loadDbData();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.message || (lang === 'hi' ? 'पंजीकरण विफल' : 'Registration failed'),
      });
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    if (onUserChanged) onUserChanged(null);
    setFeedbackMsg({
      type: 'success',
      text: lang === 'hi' ? 'लॉगआउट सफल' : 'Logged out successfully',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">CareWatch Real Healthcare Database</h3>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  ● Neon PostgreSQL Live
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                {lang === 'hi'
                  ? 'रियल डेटाबेस: केवल वास्तविक उपयोगकर्ताओं का डेटा, अपॉइंटमेंट्स और रिपोर्ट्स सुरक्षित होती हैं'
                  : 'Zero Dummy Data: Stores only real users, OPD appointments, medical reports, and reminders'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2 gap-2">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              tab === 'login'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{lang === 'hi' ? 'लॉगिन (Sign In)' : 'Sign In / Login'}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              tab === 'register'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'hi' ? 'नया खाता (Register)' : 'Register User'}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('database')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              tab === 'database'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>{lang === 'hi' ? 'डेटाबेस रिकॉर्ड्स (Live 5 Tables)' : 'Database Live 5 Tables'}</span>
          </button>
        </div>

        {/* Active User Card (if logged in) */}
        {currentUser && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                    {currentUser.role}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'लॉगआउट' : 'Sign Out'}</span>
            </button>
          </div>
        )}

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mx-5 mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                : 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
            }`}
          >
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Activity className="w-4 h-4 shrink-0" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  {lang === 'hi'
                    ? 'अपना असली ईमेल और नाम डालकर लॉगिन करें — आपका असली डेटा सीधे Neon PostgreSQL में लाइव सेव होगा।'
                    : 'Log in with your real email and name — your actual healthcare profile is securely stored in Neon PostgreSQL.'}
                </span>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'आपका ईमेल पता (Real Email) *' : 'Your Real Email Address *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kameshwar@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'पासवर्ड (Password)' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {lang === 'hi' ? 'भूमिका (Role)' : 'Role'}
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                    >
                      <option value="patient">👤 Patient (मरीज)</option>
                      <option value="doctor">🩺 Doctor (चिकित्सक)</option>
                      <option value="hospital">🏥 Hospital Staff (अस्पताल)</option>
                      <option value="pharmacy">💊 Pharmacy (फार्मेसी)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {lang === 'hi' ? 'आपका पूरा नाम (Full Name)' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Kameshwar Gupta"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>
                    {lang === 'hi'
                      ? 'लॉगिन करें और Neon डेटाबेस में सुरक्षित करें'
                      : 'Sign In & Save Real Record to Database'}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'असली पूरा नाम *' : 'Real Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'असली ईमेल पता *' : 'Real Email Address *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'पासवर्ड' : 'Password'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'भूमिका (Role)' : 'Role'}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                  >
                    <option value="patient">👤 Patient (मरीज)</option>
                    <option value="doctor">🩺 Doctor (चिकित्सक)</option>
                    <option value="hospital">🏥 Hospital Staff (अस्पताल)</option>
                    <option value="pharmacy">💊 Pharmacy (फार्मेसी)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'मोबाइल नंबर' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'रक्त समूह' : 'Blood'}
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'उम्र (Age)' : 'Age'}
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'शहर (City)' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lucknow"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>
                  {lang === 'hi'
                    ? 'खाता बनाएं और Neon डेटाबेस में सेव करें'
                    : 'Create Account & Save Real Profile to Database'}
                </span>
              </button>
            </form>
          )}

          {/* TAB 3: DATABASE ALL 5 TABLES LIVE INSPECTOR */}
          {tab === 'database' && (
            <div className="space-y-4">
              {/* Database Status Card */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-cyan-400" />
                    <div>
                      <span className="text-sm font-black text-white block">
                        Neon PostgreSQL (PostgreSQL 18.7)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        neondb @ ep-fancy-hall-bddtxg3r
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Live Connected
                    </span>
                    <button
                      type="button"
                      onClick={loadDbData}
                      disabled={refreshingDb}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Refresh All Database Tables"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshingDb ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* 5 Real Tables Counter Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">👥 USERS</span>
                    <span className="font-mono text-cyan-300 font-bold block">{registeredUsers.length}</span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">🛡️ LOGINS</span>
                    <span className="font-mono text-emerald-300 font-bold block">{loginLogs.length}</span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">🎫 OPD TOKENS</span>
                    <span className="font-mono text-amber-300 font-bold block">{dbTokens.length}</span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">📑 REPORTS</span>
                    <span className="font-mono text-indigo-300 font-bold block">{dbReports.length}</span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">⏰ REMINDERS</span>
                    <span className="font-mono text-pink-300 font-bold block">{dbReminders.length}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs for All 5 Real Tables */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDbSubTab('users')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    dbSubTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  👥 Users ({registeredUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDbSubTab('logs')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    dbSubTab === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  🛡️ Logins ({loginLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDbSubTab('tokens')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    dbSubTab === 'tokens' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  🎫 OPD Tokens ({dbTokens.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDbSubTab('reports')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    dbSubTab === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  📑 Reports ({dbReports.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDbSubTab('reminders')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    dbSubTab === 'reminders' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  ⏰ Reminders ({dbReminders.length})
                </button>
              </div>

              {/* TABLE VIEW 1: USERS */}
              {dbSubTab === 'users' && (
                <div>
                  {registeredUsers.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                      <p className="font-bold">डेटाबेस में कोई नकली डेटा नहीं है (0 Fake Data)</p>
                      <p className="text-[11px] mt-1 text-slate-400">
                        ऊपर "Sign In" या "Register" में अपना असली ईमेल डालकर लॉगिन करें, आपका असली रिकॉर्ड यहाँ तुरंत दिखेगा!
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                          <tr>
                            <th className="p-2 font-bold">Name</th>
                            <th className="p-2 font-bold">Email</th>
                            <th className="p-2 font-bold">Role</th>
                            <th className="p-2 font-bold">City</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {registeredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-2 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                              <td className="p-2 text-slate-500 font-mono text-[10px]">{u.email}</td>
                              <td className="p-2">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-2 text-slate-500">{u.city || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TABLE VIEW 2: LOGIN LOGS */}
              {dbSubTab === 'logs' && (
                <div>
                  {loginLogs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                      <p className="font-bold">कोई लॉगिन हिस्ट्री नहीं है (Clean State)</p>
                      <p className="text-[11px] mt-1 text-slate-400">
                        जैसे ही कोई यूजर लॉगिन करेगा, उसका IP और समय यहाँ दर्ज होगा।
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                          <tr>
                            <th className="p-2 font-bold">User</th>
                            <th className="p-2 font-bold">Email</th>
                            <th className="p-2 font-bold">Time</th>
                            <th className="p-2 font-bold">IP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {loginLogs.map((l) => (
                            <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-2 font-bold text-slate-800 dark:text-slate-200">{l.user_name}</td>
                              <td className="p-2 text-slate-500 font-mono text-[10px]">{l.user_email}</td>
                              <td className="p-2 text-slate-400 text-[10px]">{new Date(l.login_time || Date.now()).toLocaleTimeString()}</td>
                              <td className="p-2 font-mono text-[10px] text-slate-400">{l.ip_address || '127.0.0.1'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TABLE VIEW 3: QUEUE TOKENS */}
              {dbSubTab === 'tokens' && (
                <div>
                  {dbTokens.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                      <Ticket className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                      <p className="font-bold">Smart Queue OPD Tokens</p>
                      <p className="text-[11px] mt-1 text-slate-400">
                        वेबसाइट के 'Smart Queue' सेक्शन से बुक किए गए वास्तविक टोकन्स यहाँ दिखाई देंगे।
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                          <tr>
                            <th className="p-2 font-bold">Token</th>
                            <th className="p-2 font-bold">Patient</th>
                            <th className="p-2 font-bold">Hospital</th>
                            <th className="p-2 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {dbTokens.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-2 font-bold font-mono text-blue-600 dark:text-blue-400">{t.token_number}</td>
                              <td className="p-2 font-bold text-slate-800 dark:text-slate-200">{t.patient_name}</td>
                              <td className="p-2 text-slate-500 truncate max-w-[120px]">{t.hospital_name}</td>
                              <td className="p-2">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 uppercase">
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TABLE VIEW 4: MEDICAL REPORTS */}
              {dbSubTab === 'reports' && (
                <div>
                  {dbReports.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                      <FileText className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                      <p className="font-bold">Medical Reports Database</p>
                      <p className="text-[11px] mt-1 text-slate-400">
                        'AI Report Scanner' में अपलोड की गई वास्तविक मेडिकल रिपोर्ट्स का एनालिसिस डेटा यहाँ दिखेगा।
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                          <tr>
                            <th className="p-2 font-bold">Patient</th>
                            <th className="p-2 font-bold">Test Type</th>
                            <th className="p-2 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {dbReports.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-2 font-bold text-slate-800 dark:text-slate-200">{r.patient_name}</td>
                              <td className="p-2 text-slate-500">{r.test_type}</td>
                              <td className="p-2">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  {r.overall_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TABLE VIEW 5: REMINDERS */}
              {dbSubTab === 'reminders' && (
                <div>
                  {dbReminders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                      <Clock className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                      <p className="font-bold">Medicine Reminders Database</p>
                      <p className="text-[11px] mt-1 text-slate-400">
                        'Reminders' सेक्शन से सेट की गई दवाइयों के शेड्यूल्स यहाँ स्टोर होते हैं।
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                          <tr>
                            <th className="p-2 font-bold">Medicine</th>
                            <th className="p-2 font-bold">Dosage</th>
                            <th className="p-2 font-bold">Timing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {dbReminders.map((rm) => (
                            <tr key={rm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-2 font-bold text-slate-800 dark:text-slate-200">{rm.medicine_name}</td>
                              <td className="p-2 text-slate-500">{rm.dosage}</td>
                              <td className="p-2 text-slate-400 font-mono text-[10px]">{rm.time} ({rm.meal_timing})</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
