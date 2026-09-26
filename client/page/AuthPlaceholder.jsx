import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ArrowLeft,
  Lock,
  Mail,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  CheckSquare,
  Shield,
  ArrowRight,
  Info,
  Check
} from 'lucide-react';
import Button from '../component/Button';
import { useEventFlow } from '../context/EventFlowContext';

export default function AuthPlaceholder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loginWithApi, registerWithApi, logout } = useEventFlow();

  // Check if redirected after signout
  const [justLoggedOut, setJustLoggedOut] = useState(Boolean(location.state?.loggedOut));

  // Determine mode from URL: '/signup' or '/signin'
  const isInitialSignup = location.pathname.includes('signup');
  const [authMode, setAuthMode] = useState(isInitialSignup ? 'signup' : 'signin');

  // Synchronize mode if user navigates via browser back/forward buttons
  useEffect(() => {
    setAuthMode(location.pathname.includes('signup') ? 'signup' : 'signin');
  }, [location.pathname]);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signInSuccess, setSignInSuccess] = useState(false);

  // Sign Up state
  const [selectedRole, setSelectedRole] = useState('organizer'); // 'organizer' | 'staff' | 'guest' (Admin forbidden)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpOrg, setSignUpOrg] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Forgot password modal/inline state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Quick Demo account fill helper
  const handleQuickFill = (roleKey) => {
    setSignInError('');
    // These match the real accounts seeded in the database (sql/seed.sql).
    // Guest has no real login yet — the guest portal stays demo-only for now.
    if (roleKey === 'organizer') {
      setSignInEmail('organizer@eventflow.com');
      setSignInPassword('password123');
    } else if (roleKey === 'staff') {
      setSignInEmail('staff@eventflow.com');
      setSignInPassword('password123');
    } else if (roleKey === 'guest') {
      setSignInEmail('farhan.ahmed@investor.io');
      setSignInPassword('GuestInvite2026!');
    }
  };

  // Sign In Handler — calls the real backend (bcrypt + JWT) for everyone
  // except the guest demo account, which has no row in the users table.
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setSignInError('');

    if (!signInEmail || !signInPassword) {
      setSignInError('Please provide both your work email and password.');
      return;
    }

    // Guest portal is demo-only for now — the guests table has no password column.
    if (signInEmail.includes('guest') || signInEmail.includes('investor')) {
      setSignInSuccess(true);
      setJustLoggedOut(false);
      setTimeout(() => {
        login('guest');
        navigate('/guest');
      }, 900);
      return;
    }

    try {
      const user = await loginWithApi(signInEmail, signInPassword);

      // Admin accounts don't sign in here — this keeps the admin portal
      // reachable only through its own dedicated login at /admin/login.
      if (user.role === 'admin') {
        logout();
        setSignInError('Administrator accounts must sign in through the Admin Portal.');
        return;
      }

      setSignInSuccess(true);
      setJustLoggedOut(false);

      setTimeout(() => {
        if (user.role === 'staff') {
          navigate('/staff');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (err) {
      setSignInError(err.message || 'Invalid email or password.');
    }
  };

  // Sign Up Handler — real account creation for Organizer; Staff/Guest stay
  // demo-only for now (see the role-picker note below).
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError('');

    if (!signUpName.trim()) {
      setSignUpError('Full name is required.');
      return;
    }
    if (!signUpEmail.trim()) {
      setSignUpError('Work email is required.');
      return;
    }
    if (signUpPassword.length < 8) {
      setSignUpError('Password must be at least 8 characters in length.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match. Please verify both fields.');
      return;
    }
    if (!agreeTerms) {
      setSignUpError('Please accept the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    if (selectedRole !== 'organizer') {
      // Staff/Guest signup isn't wired to the backend yet — keep the old demo flow.
      setSignUpSuccess(true);
      setJustLoggedOut(false);
      setTimeout(() => {
        login(selectedRole);
        navigate(selectedRole === 'staff' ? '/staff' : '/guest');
      }, 1200);
      return;
    }

    try {
      await registerWithApi(signUpName.trim(), signUpEmail.trim(), signUpPassword);
      setSignUpSuccess(true);
      setJustLoggedOut(false);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      setSignUpError(err.message || 'Could not create your account. Please try again.');
    }
  };

  const handleModeSwitch = (mode) => {
    setAuthMode(mode);
    setSignInError('');
    setSignUpError('');
    window.history.pushState(null, '', mode === 'signup' ? '/signup' : '/signin');
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength(signUpPassword);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          id="auth-brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1B3A5C] text-[#D4A537] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5 text-[#D4A537]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#1B3A5C]">
              Event<span className="text-[#D4A537]">Flow</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">
              Management Platform
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1B3A5C] flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
          id="auth-back-link"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
      </header>

      {/* Main Container - Target of CSS Selector: div#root > div > main */}
      <main className="max-w-xl w-full mx-auto my-6 sm:my-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden animate-in fade-in duration-200">
        {/* Subtle decorative top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B3A5C] via-[#7FB3D5] to-[#D4A537]"></div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-7 border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleModeSwitch('signin')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white text-[#1B3A5C] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-btn-signin"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('signup')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-[#1B3A5C] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-btn-signup"
          >
            Create Account
          </button>
        </div>

        {/* ======================================================== */}
        {/* 1. SIGN IN FORM VIEW */}
        {/* ======================================================== */}
        {authMode === 'signin' && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3A5C] tracking-tight">
                Welcome Back
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Sign in to coordinate venues, vendors, guests, schedules, and operations.
              </p>
            </div>

            {/* Logged Out Notice */}
            {justLoggedOut && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-[#1B3A5C] text-xs font-semibold animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>You have been safely signed out. Please sign in below to access your workspace.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setJustLoggedOut(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Success Alert */}
            {signInSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Credentials authenticated. Directing to your workspace...</span>
              </div>
            )}

            {/* Error Alert */}
            {signInError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{signInError}</span>
              </div>
            )}

            {/* Demo Quick-Fill Bar */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#1B3A5C]" />
                  Quick Fill Demo Account:
                </span>
                <span className="text-[10px] text-slate-400 font-medium">1-Click Setup</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill('organizer')}
                  className="px-2 py-1.5 bg-white hover:bg-slate-100 text-[#1B3A5C] font-semibold rounded-lg border border-slate-200 text-center transition-colors cursor-pointer"
                >
                  Organizer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('staff')}
                  className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 text-center transition-colors cursor-pointer"
                >
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('guest')}
                  className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 text-center transition-colors cursor-pointer"
                >
                  Guest
                </button>
              </div>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSignInSubmit} className="space-y-4" id="form-signin">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signin-email"
                  className="block text-xs font-semibold text-slate-700 tracking-wide"
                >
                  Work Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signin-email"
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="name@eventflow.io"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="signin-password"
                    className="block text-xs font-semibold text-slate-700 tracking-wide"
                  >
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setResetSent(false);
                    }}
                    className="text-xs font-semibold text-[#1B3A5C] hover:text-[#D4A537] transition-colors cursor-pointer"
                    id="btn-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signin-password"
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 transition-colors shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#1B3A5C] rounded border-slate-300 focus:ring-[#1B3A5C]"
                  />
                  <span className="text-xs font-medium text-slate-600">
                    Remember me for 30 days
                  </span>
                </label>
                <span className="text-[11px] text-slate-400">SSL 256-Bit Encrypted</span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-sm font-bold shadow-xs flex items-center justify-center gap-2"
                  id="btn-submit-signin"
                >
                  <span>Sign In to EventFlow</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Bottom Switcher Note */}
            <div className="pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Don&apos;t have an EventFlow account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signup')}
                  className="font-bold text-[#1B3A5C] hover:text-[#D4A537] hover:underline cursor-pointer"
                  id="link-switch-to-signup"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. SIGN UP FORM VIEW */}
        {/* ======================================================== */}
        {authMode === 'signup' && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3A5C] tracking-tight">
                Create Your Account
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Join EventFlow to plan, coordinate, or participate in unified events.
              </p>
            </div>

            {/* Success Alert */}
            {signUpSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Account registered successfully! Directing you to your workspace...</span>
              </div>
            )}

            {/* Error Alert */}
            {signUpError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{signUpError}</span>
              </div>
            )}

            {/* Role Selection (Admin strictly excluded as required) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1B3A5C] uppercase tracking-wider">
                Select Your Account Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'organizer',
                    label: 'Organizer',
                    desc: 'Create & manage events',
                    icon: UserCheck
                  },
                  {
                    id: 'staff',
                    label: 'Staff',
                    desc: 'View & update tasks',
                    icon: CheckSquare
                  },
                  {
                    id: 'guest',
                    label: 'Guest',
                    desc: 'RSVP & invitations',
                    icon: Mail
                  }
                ].map((role) => {
                  const IconComp = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#1B3A5C] bg-[#1B3A5C]/5 shadow-xs ring-1 ring-[#1B3A5C]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      id={`signup-role-${role.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#1B3A5C] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#1B3A5C] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-[#1B3A5C]' : 'text-slate-800'}`}>
                          {role.label}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                          {role.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Note: Administrative accounts are provisioned directly via platform governance.
              </p>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSignUpSubmit} className="space-y-4" id="form-signup">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-semibold text-slate-700 tracking-wide"
                >
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Meyadur Rahman"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-semibold text-slate-700 tracking-wide"
                >
                  Work Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Organization (Optional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-org"
                  className="block text-xs font-semibold text-slate-700 tracking-wide"
                >
                  Organization / Agency Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-org"
                    type="text"
                    value={signUpOrg}
                    onChange={(e) => setSignUpOrg(e.target.value)}
                    placeholder="e.g. Apex Events Ltd."
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold text-slate-700 tracking-wide"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-password"
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 transition-colors shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {signUpPassword && (
                  <div className="pt-1 space-y-1">
                    <div className="flex gap-1 h-1.5 w-full">
                      <div className={`flex-1 rounded-full ${passwordScore >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                      <div className={`flex-1 rounded-full ${passwordScore >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
                      <div className={`flex-1 rounded-full ${passwordScore >= 3 ? 'bg-sky-500' : 'bg-slate-200'}`}></div>
                      <div className={`flex-1 rounded-full ${passwordScore >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        Strength:{' '}
                        {passwordScore <= 1 && <strong className="text-rose-600">Weak</strong>}
                        {passwordScore === 2 && <strong className="text-amber-600">Fair</strong>}
                        {passwordScore === 3 && <strong className="text-sky-600">Good</strong>}
                        {passwordScore >= 4 && <strong className="text-emerald-600">Strong</strong>}
                      </span>
                      <span>Mix upper, numbers & symbols</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-confirm-password"
                  className="block text-xs font-semibold text-slate-700 tracking-wide"
                >
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-confirm-password"
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#1B3A5C] rounded border-slate-300 focus:ring-[#1B3A5C]"
                    id="chk-terms"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the EventFlow{' '}
                    <span className="text-[#1B3A5C] font-semibold underline">Terms of Service</span>{' '}
                    and{' '}
                    <span className="text-[#1B3A5C] font-semibold underline">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-sm font-bold shadow-xs flex items-center justify-center gap-2"
                  id="btn-submit-signup"
                >
                  <span>Create Account & Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Bottom Switcher Note */}
            <div className="pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  className="font-bold text-[#1B3A5C] hover:text-[#D4A537] hover:underline cursor-pointer"
                  id="link-switch-to-signin"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-6 sm:p-8 flex flex-col justify-center animate-in fade-in duration-150 z-20">
            <div className="max-w-sm mx-auto text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D4A537] mx-auto flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1B3A5C]">
                Reset Your Password
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your work email address to receive password reset instructions.
              </p>

              {resetSent ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                  Password reset link sent to <strong>{resetEmail || 'your email'}</strong>. Please check your inbox.
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@eventflow.io"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetSent(true)}
                      className="flex-1 py-2 text-xs font-semibold text-white bg-[#1B3A5C] hover:bg-[#142d48] rounded-lg transition-colors cursor-pointer"
                    >
                      Send Link
                    </button>
                  </div>
                </div>
              )}

              {resetSent && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-xs font-semibold text-[#1B3A5C] hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Note */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-400 py-3">
        &copy; 2026 EventFlow. All rights reserved. &bull; Academic SaaS Platform
      </footer>
    </div>
  );
}