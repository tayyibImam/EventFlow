// GetStarted — Onboarding page for new users.
// Features a navigation bar, hero section with preview, workflow steps,
// feature cards, team roles, and footer. Includes navigation handler
// for redirecting between pages.

import { useEffect, useState } from 'react'
import { ArrowRight, BarChart3, CalendarDays, Check, CheckCircle2, ClipboardCheck, FolderKanban, Menu, ShieldCheck, Sparkles, Users, WalletCards, X } from 'lucide-react'

// 3-step workflow for onboarding
const workflow = [
  ['01', 'Create your event', 'Set the basics, invite your team, and give every event a clear home.', CalendarDays],
  ['02', 'Plan every detail', 'Coordinate venues, vendors, guests, tasks, and schedules in one workspace.', ClipboardCheck],
  ['03', 'Stay in control', 'Track progress in real time and keep everyone aligned through event day.', BarChart3],
]

// Feature cards displayed below the hero
const features = [
  ['Event command center', 'See every milestone, task, guest, and booking at a glance.', FolderKanban],
  ['Guest & RSVP tracking', 'Know who is attending and keep every response up to date.', Users],
  ['Vendor coordination', 'Manage venues, suppliers, agreements, and event-ready details.', WalletCards],
  ['Operational clarity', 'Give organizers and staff a shared view of what needs to happen next.', ShieldCheck],
]

// Team roles shown in the "For your team" section
const roles = [
  ['Organizers', 'Build the plan, assign work, and run every event from one place.'],
  ['Staff teams', 'See assigned tasks, update progress, and keep execution moving.'],
  ['Guests', 'Respond to invitations and stay connected to the moments that matter.'],
]

export default function GetStarted() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 820) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <main className="get-started-page">
      {/* Top navigation bar: logo, links, sign-in, mobile menu */}
      <nav className="landing-nav">
        <a className="landing-brand" href="/">
          <span className="brand-mark"><i className="fa-regular fa-calendar-check" aria-hidden="true" /></span>
          <span>Event<span>Flow</span></span>
        </a>
        <div className="landing-links">
          <a href="#workflow">How it works</a>
          <a href="#features">Capabilities</a>
          <a href="#roles">For your team</a>
        </div>
        <a className="landing-login" href="/sign-in">Sign in <ArrowRight size={15} /></a>
        <button 
          className="landing-menu" 
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="landing-mobile-menu">
            <a href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#features" onClick={() => setMenuOpen(false)}>Capabilities</a>
            <a href="#roles" onClick={() => setMenuOpen(false)}>For your team</a>
            <a href="/sign-in" className="mobile-sign-in" onClick={() => setMenuOpen(false)}>Sign in <ArrowRight size={14} /></a>
            <a href="/create-account" className="landing-primary mobile-workspace-cta" onClick={() => setMenuOpen(false)}>Open your workspace <ArrowRight size={15} /></a>
          </div>
        )}
      </nav>

      {/* Hero section: copy on the left, preview on the right */}
      <section className="landing-hero">
        <div className="hero-copy">
          {/* Eyebrow label with sparkles icon */}
          <div className="landing-eyebrow"><Sparkles size={13} /> Event planning, without the scattered tools</div>
          <h1>Plan every event.<br /><span>Bring every detail together.</span></h1>
          <p>EventFlow gives your team one calm, connected workspace to plan, coordinate, and deliver exceptional events from first idea to final guest.</p>
          {/* Primary and secondary action buttons */}
          <div className="hero-actions">
            <a className="landing-primary" href="/create-account">Open your workspace <ArrowRight size={16} /></a>
            <a className="landing-secondary" href="#workflow">See how it works</a>
          </div>
          {/* Proof section with avatar previews */}
          <div className="hero-proof">
            <span className="proof-avatars"><i>MR</i><i>TK</i><i>DS</i></span>
            <span><strong>Built for confident event teams</strong><small>Planning, coordination, and visibility in one place.</small></span>
          </div>
        </div>
        {/* Preview window showing app UI simulation */}
        <div className="hero-preview">
          <div className="preview-window">
            {/* Preview top bar with dots, title, and avatar */}
            <div className="preview-top">
              <span className="preview-dots"><i /><i /><i /></span>
              <span>EventFlow Organizer Hub</span>
              <span className="preview-avatar">MR</span>
            </div>
            {/* Preview body with sidebar and main content */}
            <div className="preview-body">
              {/* Sidebar simulation */}
              <div className="preview-sidebar">
                <b>EventFlow</b>
                <span className="active-line">Dashboard</span>
                <span>My Events</span>
                <span>Guests</span>
                <span>Tasks</span>
                <span>Schedule</span>
              </div>
              {/* Main content simulation */}
              <div className="preview-main">
                {/* Welcome card */}
                <div className="preview-welcome">
                  <small>EVENT ORGANIZER CONSOLE</small>
                  <strong>Welcome back, Meyadur</strong>
                  <span>Track every moving part from one central workspace</span>
                </div>
                {/* Metrics preview */}
                <div className="preview-metrics">
                  <i><small>Events</small><strong>12</strong></i>
                  <i><small>Guests</small><strong>840</strong></i>
                  <i><small>Tasks</small><strong>34</strong></i>
                </div>
                {/* Panels section */}
                <div className="preview-panels">
                  <article><strong>Upcoming Events</strong><span>3 this week</span></article>
                  <article><strong>Pending Tasks</strong><span>8 outstanding</span></article>
                  <article><strong>RSVP Status</strong><span>72% confirmed</span></article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="landing-section" id="features">
        <div className="section-intro centered">
          <div className="landing-eyebrow"><Sparkles size={13} /> Capabilities</div>
          <h2>Everything you need.</h2>
          <p>From guest tracking to vendor coordination, EventFlow covers every aspect of event planning.</p>
        </div>
        <div className="feature-grid">
          {features.map(([title, description, Icon]) => (
            <div className="feature-card" key={title}>
              <div className="feature-icon"><Icon size={18} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow section */}
      <section className="landing-section">
        <div className="section-intro centered">
          <div className="landing-eyebrow"><BarChart3 size={13} /> Workflow</div>
          <h2>How it works.</h2>
          <p>Three simple steps to get started with EventFlow.</p>
        </div>
        <div className="workflow-grid">
          {workflow.map(([number, title, description, Icon]) => (
            <div className="workflow-card" key={number}>
              <div className="workflow-icon"><Icon size={18} /></div>
              <div className="workflow-number">{number}</div>
              <h3>{title}</h3>
              <p>{description}</p>
              <a href="#">Learn more <ArrowRight size={14} /></a>
            </div>
          ))}
        </div>
      </section>

      {/* Roles section */}
      <section className="landing-section roles-section" id="roles">
        <div className="section-intro centered">
          <div className="landing-eyebrow"><ShieldCheck size={13} /> Roles</div>
          <h2>Made for your team.</h2>
          <p>Whether you're organizing, staffing, or attending, there's a place for you.</p>
        </div>
        <div className="roles-grid">
          {roles.map(([title, description]) => (
            <div className="role-card" key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        {/* ... footer content ... */}
      </footer>
    </main>
  )
}
