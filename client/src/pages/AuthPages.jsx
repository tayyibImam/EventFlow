// AuthPages — Authentication pages for Sign In and Create Account.
// Provides role-based account selection with 4 roles (Organizer, Staff, Guest, Admin).
// Uses demoSession.js for session persistence to localStorage.
// Exports two components: SignIn() and CreateAccount()

import { useState } from 'react'
import { ArrowRight, BriefcaseBusiness, Check, CheckCircle2, Eye, EyeOff, Grid2X2, LockKeyhole, ShieldCheck, UserRound, Users } from 'lucide-react'
import { saveDemoSession } from '../data/demoSession'

// Role metadata: icon, description, default email, first/last name
const accountRoles = {
  Organizer: { icon: UserRound, description: 'Create & manage events', email: 'name@eventflow.io', firstName: 'Meyadur', lastName: 'Rahman' },
  Staff: { icon: BriefcaseBusiness, description: 'View & update tasks', email: 'staff@eventflow.io', firstName: 'Tariqul', lastName: 'Islam' },
  Guest: { icon: Users, description: 'RSVP to invitations', email: 'guest@eventflow.io', firstName: 'Salman', lastName: 'Chowdhury' },
  Admin: { icon: ShieldCheck, description: 'Manage platform', email: 'admin@eventflow.com', firstName: 'Zayid', lastName: 'Karim' },
}

// AuthShell — Wrapper component that provides consistent header, card container, and footer.
// Props: mode ('sign-in' or 'create-account'), children (form content)
function AuthShell({ mode, children }) {
  const isSignIn = mode === 'sign-in'
  return (
    <main className="auth-page">
      {/* Top header with logo, prompt text, and navigation link */}
      <header className="auth-header">
        <a className="auth-brand" href="/">
          <span className="brand-mark"><i className="fa-regular fa-calendar-check" aria-hidden="true" /></span>
          <span>Event<span>Flow</span></span>
        </a>
        <span>{isSignIn ? 'New to EventFlow?' : 'Already have an account?'}</span>
        <a className="auth-header-link" href={isSignIn ? '/create-account' : '/sign-in'}>
          {isSignIn ? 'Create account' : 'Sign in'} <ArrowRight size={13} />
        </a>
      </header>
      {/* Auth card container */}
      <section className="auth-card-wrap">
        <div className="auth-card">{children}</div>
        <p className="auth-note"><LockKeyhole size={12} /> Your information is protected and never shared.</p>
      </section>
      <footer className="auth-footer">© 2026 EventFlow <span>·</span> Event planning &amp; management platform</footer>
    </main>
  )
}

// AuthTabs — Toggle tabs for switching between Sign In and Create Account views
function AuthTabs({ active }) {
  return (
    <div className="auth-tabs">
      <a className={active === 'sign-in' ? 'active' : ''} href="/sign-in">Sign In</a>
      <a className={active === 'create-account' ? 'active' : ''} href="/create-account">Create Account</a>
    </div>
  )
}

// RoleCards — Grid of clickable role cards for selecting account type.
// Props: role (current selection), onRoleChange (callback), includeAdmin (boolean)
function RoleCards({ role, onRoleChange, includeAdmin = false }) {
  const roles = includeAdmin ? ['Organizer', 'Staff', 'Guest', 'Admin'] : ['Organizer', 'Staff', 'Guest']
  return (
    <div className="role-card-picker">
      <div className="role-picker-heading">
        <span><Grid2X2 size={11} /> Select your account role <b>*</b></span>
        {!includeAdmin && <small>Role determines your workspace permissions</small>}
      </div>
      <div className={`role-card-grid ${includeAdmin ? 'with-admin' : ''}`}>
        {roles.map((item) => {
          const roleInfo = accountRoles[item]
          const Icon = roleInfo.icon
          return (
            <button
              type="button"
              key={item}
              className={`role-card-option ${role === item ? 'selected' : ''} ${item === 'Admin' ? 'admin' : ''}`}
              onClick={() => onRoleChange(item)}
            >
              <span className="role-card-icon"><Icon size={13} /></span>
              <strong>{item}</strong>
              <small>{roleInfo.description}</small>
              {role === item && <CheckCircle2 className="role-card-check" size={11} />}
            </button>
          )
        })}
      </div>
      {!includeAdmin && <small className="role-picker-note">Admin accounts are provisioned by the EventFlow team.</small>}
    </div>
  )
}

// SignIn — Sign in form with email/password fields and role selector.
// On submit, saves demo session and redirects based on role.
export function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('Organizer')

  // Handle form submission: save session and redirect
  const handleSubmit = (event) => {
    event.preventDefault()
    saveDemoSession(role)
    window.location.href = role === 'Admin' ? '/admin' : '/dashboard'
  }

  return (
    <AuthShell mode="sign-in">
      <AuthTabs active="sign-in" />
      {/* Reference heading showing current role */}
      <div className="auth-card-top auth-reference-heading">
        <span className="auth-eyebrow">{role} access</span>
        <h1>Welcome Back</h1>
        <p>Sign in to coordinate venues, vendors, guests, schedules, and operations.</p>
      </div>
      <RoleCards role={role} onRoleChange={setRole} includeAdmin />
      <p className="role-context">Signing in as <strong>{role}</strong></p>

      {/* Email and password form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span className="auth-label">Work Email Address <b>*</b></span>
          <span className="input-with-icon">
            <UserRound size={13} />
            <input type="email" placeholder={accountRoles[role].email} autoComplete="email" required />
          </span>
        </label>
        <label>
          <span className="label-row">
            <span>Password <b>*</b></span>
            <a href="/sign-in">Forgot password?</a>
          </span>
          <span className="password-field input-with-icon">
            <LockKeyhole size={13} />
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" autoComplete="current-password" required />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </span>
        </label>
        {/* Remember me checkbox and security note */}
        <div className="auth-meta">
          <label className="check-row">
            <input type="checkbox" defaultChecked /> <span>Remember me for 30 days</span>
          </label>
          <small>SSL 256-bit Encrypted</small>
        </div>
        <button className="auth-submit" type="submit">Sign in to EventFlow <ArrowRight size={14} /></button>
      </form>
      <div className="auth-divider"><span>or continue with</span></div>
      <div className="provider-row">
        <button type="button"><span className="provider-google">G</span> Continue with Google</button>
      </div>
      <p className="auth-switch">Don't have an EventFlow account? <a href="/create-account">Create an account</a></p>
    </AuthShell>
  )
}

// CreateAccount — Registration form with full name, email, organization, password fields.
// Validates password length and confirmation match before creating session.
export function CreateAccount() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState('Organizer')
  const [error, setError] = useState('')

  // Handle form submission: validate, save session, redirect
  const handleSubmit = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = form.get('password')
    const confirmPassword = form.get('confirmPassword')
    // Validate password length (minimum 8 characters)
    if (password.length < 8) return setError('Your password must contain at least 8 characters.')
    // Validate password match
    if (password !== confirmPassword) return setError('Passwords do not match.')
    // Parse full name from form input
    const nameParts = form.get('fullName').trim().split(/\s+/)
    const firstName = nameParts.shift()
    const lastName = nameParts.join(' ') || accountRoles[role].lastName
    // Save session with profile data and redirect
    saveDemoSession(role, {
      firstName,
      lastName,
      email: form.get('email').trim(),
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
    })
    window.location.href = role === 'Admin' ? '/admin' : '/dashboard'
  }

  return (
    <AuthShell mode="create-account">
      <AuthTabs active="create-account" />
      <div className="auth-card-top auth-reference-heading">
        <h1>Create Your Account</h1>
        <p>Join EventFlow to plan, coordinate, or participate in unified events.</p>
      </div>
      <RoleCards role={role} onRoleChange={setRole} />
      <p className="role-context">{role} permissions will be applied to your new account.</p>

      {/* Registration form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Full name and email grid */}
        <div className="form-grid">
          <label>Full Name <b>*</b>
            <input name="fullName" type="text" placeholder={`${accountRoles[role].firstName} ${accountRoles[role].lastName}`} autoComplete="name" required />
          </label>
          <label>Work Email Address <b>*</b>
            <input name="email" type="email" placeholder={accountRoles[role].email} autoComplete="email" required />
          </label>
        </div>
        <label>Organization / Agency Name <small className="optional-label">(Optional)</small>
          <input name="organization" type="text" placeholder="e.g. Apex Events Ltd." />
        </label>
        {/* Password field with toggle */}
        <label>Password <b>*</b>
          <span className="password-field input-with-icon">
            <LockKeyhole size={13} />
            <input name="password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" autoComplete="new-password" required />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </span>
        </label>
        {/* Confirm password field */}
        <label>Confirm Password <b>*</b>
          <span className="password-field input-with-icon">
            <LockKeyhole size={13} />
            <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat password" autoComplete="new-password" required />
            <button type="button" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={() => setShowConfirmPassword((visible) => !visible)}>
              {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </span>
        </label>
        {/* Error message display */}
        {error && <p className="form-error" role="alert">{error}</p>}
        {/* Terms checkbox */}
        <label className="check-row">
          <input type="checkbox" required /> <span>I agree to the Terms of Service</span>
        </label>
        <button className="auth-submit" type="submit">Create Account <ArrowRight size={14} /></button>
      </form>
      <p className="auth-switch">Already have an account? <a href="/sign-in">Sign in</a></p>
    </AuthShell>
  )
}
