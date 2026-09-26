import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../component/Button';
import { useEventFlow } from '../context/EventFlowContext';

// Dedicated admin sign-in — kept separate from the general /signin page so
// the admin portal isn't reachable via the shared organizer/staff/guest form.
export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginWithApi, logout } = useEventFlow();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your admin email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await loginWithApi(email, password);
      if (user.role !== 'admin') {
        logout();
        setError('This portal is for administrators only. Use the regular sign-in page instead.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F2038] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-[#D4A537] flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white">
              Event<span className="text-[#D4A537]">Flow</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-300 tracking-wider uppercase -mt-1">
              Admin Portal
            </span>
          </div>
        </div>

        <Link
          to="/"
          className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
          id="admin-auth-back-link"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
      </header>

      <main className="max-w-md w-full mx-auto my-6 sm:my-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden animate-in fade-in duration-200">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B3A5C] via-[#D4A537] to-[#1B3A5C]"></div>

        <div className="text-center sm:text-left mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B3A5C]/10 text-xs font-semibold text-[#1B3A5C] mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Restricted Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3A5C] tracking-tight">
            Administrator Sign In
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
            This portal is reserved for platform administrators. Organizers and staff should use the regular sign-in page.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="form-admin-signin">
          <div className="space-y-1.5">
            <label htmlFor="admin-signin-email" className="block text-xs font-semibold text-slate-700 tracking-wide">
              Admin Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="admin-signin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eventflow.com"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-signin-password" className="block text-xs font-semibold text-slate-700 tracking-wide">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-signin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 transition-colors shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-full py-3 text-sm font-bold shadow-xs flex items-center justify-center gap-2"
              id="btn-submit-admin-signin"
            >
              <span>{submitting ? 'Verifying...' : 'Sign In to Admin Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <div className="pt-5 mt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Not an administrator?{' '}
            <Link to="/signin" className="font-bold text-[#1B3A5C] hover:text-[#D4A537] hover:underline">
              Go to the regular sign-in page
            </Link>
          </p>
        </div>
      </main>

      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-400 py-3">
        &copy; 2026 EventFlow. All rights reserved. &bull; Academic SaaS Platform
      </footer>
    </div>
  );
}
