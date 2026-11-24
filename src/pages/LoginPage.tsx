import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

const DEMO_CREDS = [
  { role: 'Admin',   email: 'admin@smartlab.edu',   password: 'admin123' },
  { role: 'Faculty', email: 'faculty@smartlab.edu', password: 'faculty123' },
  { role: 'Student', email: 'aanya@smartlab.edu',   password: 'student123' },
];

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Login failed.');
    }
  }

  function quickLogin(em: string, pw: string) {
    setEmail(em);
    setPassword(pw);
    setError('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-xl shadow-indigo-500/30">
            SL
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">SmartLab</h1>
          <p className="text-slate-400 text-sm">Computer Laboratory Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <input
                id="login_email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@smartlab.edu"
                autoComplete="email"
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <input
                  id="login_password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-sm cursor-pointer"
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              id="login_submit"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Quick credentials */}
          <div className="mt-6">
            <p className="text-xs text-slate-400 text-center mb-3">── Quick Login ──</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDS.map(cred => (
                <button
                  key={cred.role}
                  onClick={() => quickLogin(cred.email, cred.password)}
                  className="bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white text-xs font-medium py-2 rounded-lg transition-all cursor-pointer"
                >
                  {cred.role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Credentials hint */}
        <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-medium mb-2">Quick Credentials:</p>
          <div className="space-y-1">
            {DEMO_CREDS.map(c => (
              <div key={c.role} className="text-xs text-slate-500 flex justify-between">
                <span className="text-slate-400 font-medium">{c.role}:</span>
                <span>{c.email} / {c.password}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
