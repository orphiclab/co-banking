'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Building2, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@cobanking.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const doLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Hard redirect so Zustand re-hydrates cleanly from localStorage with the fresh token
      window.location.href = '/dashboard';
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@cobanking.com', pass: 'Admin@123' },
    { label: 'Manager', email: 'manager@cobanking.com', pass: 'Manager@123' },
    { label: 'Loan Officer', email: 'loanoffice@cobanking.com', pass: 'Loan@123' },
    { label: 'Teller', email: 'teller@cobanking.com', pass: 'Teller@123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bank-950 via-bank-900 to-bank-800 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Co-Banking System</span>
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Integrated Core<br />
            <span className="text-bank-300">Banking Platform</span>
          </h1>
          <p className="text-bank-300 text-lg leading-relaxed max-w-md">
            A unified solution for Loans, Leases, Fixed Deposits, General Ledger, Recovery, and Real-time Analytics.
          </p>
        </div>
        <div className="text-bank-400 text-sm">© 2024 Co-Banking System</div>
      </div>

      {/* Right panel - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Building2 className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">Co-Banking System</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account</p>

          <div className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') doLogin(); }}
                  className="form-input pl-10"
                  placeholder="you@cobanking.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') doLogin(); }}
                  className="form-input pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div id="login-error" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="button"
              onClick={doLogin}
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </div>

          {/* Demo accounts */}
          <div className="mt-8">
            <p className="text-xs text-muted-foreground text-center mb-3 font-medium uppercase tracking-wider">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  id={`demo-${acc.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => { setEmail(acc.email); setPassword(acc.pass); setError(''); }}
                  className="text-left px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors group"
                >
                  <div className="text-xs font-semibold text-foreground group-hover:text-primary">{acc.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
