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
} from 'lucide-react';
import {
  type AuthUser,
  type TiDBStatus,
  getCurrentUser,
  loginUser,
  registerUser,
  logout,
  fetchTiDBUsers,
  fetchTiDBLogs,
  fetchTiDBStatus,
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

  // TiDB Explorer States
  const [tidbStatus, setTidbStatus] = useState<TiDBStatus | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [refreshingDb, setRefreshingDb] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentUser(getCurrentUser());
      loadTiDBData();
    }
  }, [isOpen]);

  const loadTiDBData = async () => {
    setRefreshingDb(true);
    try {
      const [status, users, logs] = await Promise.all([
        fetchTiDBStatus(),
        fetchTiDBUsers(20),
        fetchTiDBLogs(20),
      ]);
      setTidbStatus(status);
      setRegisteredUsers(users);
      setLoginLogs(logs);
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
      setFeedbackMsg({
        type: 'success',
        text:
          lang === 'hi'
            ? `स्वागत है ${res.user.name}! TiDB Cloud पर रिकॉर्ड सुरक्षित हो गया।`
            : `Welcome back, ${res.user.name}! Synced with TiDB Cloud.`,
      });
      loadTiDBData();
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
      setFeedbackMsg({
        type: 'success',
        text:
          lang === 'hi'
            ? `नया खाता बन गया! TiDB Cloud डेटाबेस में सेव हुआ।`
            : `Account created successfully! Saved to TiDB Cloud.`,
      });
      loadTiDBData();
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

  const handleQuickDemoLogin = (demoRole: 'patient' | 'doctor' | 'hospital' | 'pharmacy') => {
    const demos = {
      patient: { name: 'Kameshwar Gupta', email: 'kameshwar.carewatch@gmail.com', role: 'patient', phone: '+91 98765 43210' },
      doctor: { name: 'Dr. Priya Sharma (Cardiologist)', email: 'dr.priya@kgmu.edu.in', role: 'doctor', phone: '+91 88081 22445' },
      hospital: { name: 'Sewa Hospital OPD Desk', email: 'trauma.desk@sewahospital.in', role: 'hospital', phone: '+91 522 2741122' },
      pharmacy: { name: 'Sewa In-House 24x7 Chemist', email: 'pharmacy@sewahospital.in', role: 'pharmacy', phone: '+91 94150 12345' },
    };
    const sel = demos[demoRole];
    setName(sel.name);
    setEmail(sel.email);
    setRole(sel.role as any);
    setPhone(sel.phone);
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
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">CareWatch TiDB Cloud Auth</h3>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  ● TiDB 4000 Live
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                {lang === 'hi'
                  ? 'लॉगिन करते ही डेटा स्वचालित रूप से TiDB Cloud में सुरक्षित होता है'
                  : 'Every login & registration instantly syncs with TiDB Cloud Serverless'}
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
            <span>{lang === 'hi' ? 'TiDB रिकॉर्ड्स (Live DB)' : 'TiDB Cloud Live'}</span>
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
              {/* Quick 1-Click Demo Profiles */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {lang === 'hi' ? '⚡ 1-क्लिक डेमो प्रोफाइल चुनें:' : '⚡ Quick 1-Click Auto Fill Profiles:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('patient')}
                    className="p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-left hover:border-blue-500 cursor-pointer transition-all"
                  >
                    <span className="text-xs font-bold block text-blue-700 dark:text-blue-300">👤 Patient</span>
                    <span className="text-[10px] text-slate-500 block truncate">Kameshwar G.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('doctor')}
                    className="p-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-left hover:border-indigo-500 cursor-pointer transition-all"
                  >
                    <span className="text-xs font-bold block text-indigo-700 dark:text-indigo-300">🩺 Doctor</span>
                    <span className="text-[10px] text-slate-500 block truncate">Dr. Priya (KGMU)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('hospital')}
                    className="p-2 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl text-left hover:border-teal-500 cursor-pointer transition-all"
                  >
                    <span className="text-xs font-bold block text-teal-700 dark:text-teal-300">🏥 Hospital</span>
                    <span className="text-[10px] text-slate-500 block truncate">Sewa Desk</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('pharmacy')}
                    className="p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-left hover:border-emerald-500 cursor-pointer transition-all"
                  >
                    <span className="text-xs font-bold block text-emerald-700 dark:text-emerald-300">💊 Chemist</span>
                    <span className="text-[10px] text-slate-500 block truncate">24x7 In-House</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'hi' ? 'ईमेल पता (Email)' : 'Email Address'}
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
                      {lang === 'hi' ? 'पूरा नाम (Optional)' : 'Full Name (Optional)'}
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
                      ? 'लॉगिन करें और TiDB Cloud में सिंक करें'
                      : 'Sign In & Sync Directly to TiDB Cloud'}
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
                    {lang === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
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
                    {lang === 'hi' ? 'ईमेल पता *' : 'Email Address *'}
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
                    ? 'खाता बनाएं और TiDB Cloud में सेव करें'
                    : 'Create Account & Save to TiDB Cloud'}
                </span>
              </button>
            </form>
          )}

          {/* TAB 3: TIDB DATABASE LIVE INSPECTOR */}
          {tab === 'database' && (
            <div className="space-y-4">
              {/* TiDB Connection Card */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-black text-white">TiDB Cloud Serverless</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Connected (Port 4000)
                    </span>
                    <button
                      type="button"
                      onClick={loadTiDBData}
                      disabled={refreshingDb}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Refresh TiDB Data"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshingDb ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">HOST</span>
                    <span className="font-mono text-cyan-300 font-bold truncate block">
                      gateway01.ap-northeast-1...
                    </span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">PORT</span>
                    <span className="font-mono text-white font-bold block">4000</span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">DATABASE</span>
                    <span className="font-mono text-emerald-300 font-bold block">
                      {tidbStatus?.database || 'carewatch'}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">USER</span>
                    <span className="font-mono text-amber-300 font-bold truncate block">
                      2yubzc3at6JgYiJ.root
                    </span>
                  </div>
                </div>
              </div>

              {/* Registered Users Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {lang === 'hi' ? 'TiDB में पंजीकृत उपयोगकर्ता (Users Table):' : 'TiDB Cloud `users` Table:'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-bold">
                      {registeredUsers.length}
                    </span>
                  </h4>
                </div>

                {registeredUsers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    {lang === 'hi'
                      ? 'कोई भी लॉगिन करेगा तो यहां तुरंत दिखाई देगा'
                      : 'Sign in above to see live records populate here from TiDB Cloud!'}
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
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

              {/* Login Sessions Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {lang === 'hi' ? 'TiDB हालिया लॉगिन सत्र (login_logs Table):' : 'TiDB Cloud `login_logs` Table:'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded font-bold">
                      {loginLogs.length}
                    </span>
                  </h4>
                </div>

                {loginLogs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    {lang === 'hi'
                      ? 'लॉगिन सत्र TiDB क्लाउड में रिकॉर्ड किए जाते हैं'
                      : 'Login audit sessions will appear here as soon as users sign in.'}
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
