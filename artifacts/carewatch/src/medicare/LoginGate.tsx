import React, { useState } from 'react';
import {
  HeartPulse,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Database,
  Sparkles,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { loginUser, registerUser, type AuthUser } from './authService';

interface LoginGateProps {
  onAuthenticated: (user: AuthUser) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'hospital' | 'pharmacy'>('patient');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setFeedback({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    setLoading(true);
    setFeedback(null);

    const res = await loginUser({ email: email.trim(), password, name, role, phone });
    setLoading(false);

    if (res.success && res.user) {
      setFeedback({ type: 'success', text: `Welcome back, ${res.user.name}! Logging you in...` });
      setTimeout(() => onAuthenticated(res.user), 800);
    } else {
      setFeedback({ type: 'error', text: res.message || 'Login failed. Please try again.' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFeedback({ type: 'error', text: 'Name and email are required.' });
      return;
    }
    setLoading(true);
    setFeedback(null);

    const res = await registerUser({ name, email, password, role, phone });
    setLoading(false);

    if (res.success && res.user) {
      setFeedback({ type: 'success', text: `Account created! Welcome, ${res.user.name}!` });
      setTimeout(() => onAuthenticated(res.user), 800);
    } else {
      setFeedback({ type: 'error', text: res.message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md z-10">

        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-2xl shadow-blue-700/40 mb-4">
            <HeartPulse className="w-9 h-9 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1">
            CareWatch<span className="text-cyan-400"> AI</span>
          </h1>
          <p className="text-sm text-blue-200/70 font-medium">
            India's Intelligent Healthcare Platform
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              Neon PostgreSQL Secured
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              AI-Powered Health
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">
              <Globe className="w-3 h-3" />
              11 Languages
            </span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

          {/* Tab switch */}
          <div className="flex p-2 gap-1.5 bg-black/20">
            <button
              type="button"
              onClick={() => { setMode('login'); setFeedback(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-black transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-700/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setFeedback(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-black transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-700/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              New Account
            </button>
          </div>

          <div className="p-6 space-y-4">

            {/* Feedback message */}
            {feedback && (
              <div className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-semibold ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}>
                {feedback.type === 'success'
                  ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />
                }
                {feedback.text}
              </div>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3">

              {/* Name field — only for register */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Kameshwar Gupta"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Phone + Role — only for register */}
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 ..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/60 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-1.5 uppercase tracking-wider">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as typeof role)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-all cursor-pointer"
                    >
                      <option value="patient" className="bg-slate-900 text-white">Patient</option>
                      <option value="doctor" className="bg-slate-900 text-white">Doctor</option>
                      <option value="hospital" className="bg-slate-900 text-white">Hospital</option>
                      <option value="pharmacy" className="bg-slate-900 text-white">Pharmacy</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-700/40 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {mode === 'login' ? 'Log In & Enter CareWatch' : 'Create Account & Enter'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch mode */}
            <p className="text-center text-xs text-white/40 font-medium">
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => { setMode('register'); setFeedback(null); }} className="text-cyan-400 hover:text-cyan-300 font-black cursor-pointer transition-colors">
                    Create one free
                  </button>
                </>
              ) : (
                <>Already registered?{' '}
                  <button onClick={() => { setMode('login'); setFeedback(null); }} className="text-cyan-400 hover:text-cyan-300 font-black cursor-pointer transition-colors">
                    Log In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Features teaser */}
        <div className="mt-6 grid grid-cols-3 gap-2.5 text-center">
          {[
            { icon: '🏥', label: 'OPD Smart Queue' },
            { icon: '🤖', label: 'AI Lab Scanner' },
            { icon: '💊', label: 'Medicine Alerts' },
            { icon: '📹', label: 'Telemedicine' },
            { icon: '🗺️', label: 'Find Pharmacy' },
            { icon: '🚨', label: 'SOS Emergency' },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-white/5 border border-white/8 rounded-xl px-2 py-2.5 flex flex-col items-center gap-1"
            >
              <span className="text-lg">{f.icon}</span>
              <span className="text-[10px] font-bold text-white/50 leading-tight">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-white/30 font-medium">
          <Database className="w-3 h-3 text-emerald-400/60" />
          <span>All data securely stored in <strong className="text-emerald-400/70">Neon PostgreSQL Cloud</strong></span>
        </div>
      </div>
    </div>
  );
};

export default LoginGate;
