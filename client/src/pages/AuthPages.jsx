import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthPages = ({ defaultMode = 'login' }) => {
  const [mode, setMode] = useState(defaultMode); // 'login' | 'register' | 'forgot'
  const navigate = useNavigate();
  const location = useLocation();

  const { login, register } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        navigate(from, { replace: true });
      } else if (mode === 'register') {
        await register({ name, email: email.trim(), password, phone });
        navigate(from, { replace: true });
      } else if (mode === 'forgot') {
        showSuccess(`If an account exists for ${email}, a password reset link has been dispatched.`);
        setMode('login');
      }
    } catch {
      // Error handled via ToastContext
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@auraluxe.com');
      setPassword('admin123');
    } else {
      setEmail('customer@auraluxe.com');
      setPassword('customer123');
    }
    showInfo(`Filled demo credentials for ${role === 'admin' ? 'Executive Admin' : 'Private Customer'}.`);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block select-none">
            <span className="font-cinzel text-2xl font-bold tracking-[0.25em] text-slate-100">
              A U R A
            </span>
            <span className="block text-[9px] uppercase tracking-[0.35em] text-amber-400 font-semibold -mt-1">
              Private Client Portal
            </span>
          </Link>
          <h2 className="text-xl font-serif font-bold text-slate-100 pt-2">
            {mode === 'login'
              ? 'Sign in to Your Account'
              : mode === 'register'
              ? 'Join The AURA Collective'
              : 'Password Recovery'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Access saved addresses, vault orders, and bespoke concierge services.'
              : mode === 'register'
              ? 'Create a private membership to access limited edition releases.'
              : 'Enter your registered email to receive access credentials.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                  required
                  className="w-full bg-aura-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@domain.com"
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
              />
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Phone (Optional)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-aura-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-300 font-medium">Password *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-amber-400 hover:text-amber-300"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-aura-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold py-3.5 text-xs font-bold uppercase shadow-glow-gold flex items-center justify-center gap-2"
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Enter Private Portal'
                : mode === 'register'
                ? 'Create Membership'
                : 'Send Reset Instructions'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div className="p-3.5 rounded-2xl bg-aura-900 border border-slate-800 space-y-2 text-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Logins:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('customer')}
              className="p-2 rounded-lg bg-aura-850 border border-slate-700 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-amber-300 transition-colors text-left"
            >
              <strong className="block text-slate-100">Customer Demo</strong>
              customer@auraluxe.com
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="p-2 rounded-lg bg-aura-850 border border-slate-700 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-amber-300 transition-colors text-left"
            >
              <strong className="block text-amber-400">Admin Demo</strong>
              admin@auraluxe.com
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          {mode === 'login' ? (
            <p>
              Not a member yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-amber-400 font-semibold hover:underline"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-amber-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
