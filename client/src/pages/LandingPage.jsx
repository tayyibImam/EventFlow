// LandingPage — Public marketing homepage with hero, capabilities grid,
// workflow steps, CTA, and footer. Uses hardcoded data for the workspace preview simulation.

import { useState } from 'react'
import { ArrowRight, BarChart3, CalendarDays, Check, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, LayoutDashboard, Mail, Menu, ShieldCheck, Users, WalletCards, X } from 'lucide-react'

// Capabilities data: [Title, [bullet descriptions], Icon component]
const capabilities = [
  ['Event Management', ['Create and manage events', 'Track event statuses, dates, venue, and budget'], CalendarDays],
  ['Venue Booking', ['Browse and manage event venues', 'Store capacity and booking information'], LayoutDashboard],
  ['Vendor Management', ['Assign vendors to events', 'Track vendor details and booking status'], WalletCards],
  ['Guest & RSVP', ['Manage invitations', 'Track accepted, declined, and pending guests'], Users],
  ['Task Management', ['Assign tasks to staff', 'Track pending, in-progress, and completed tasks'], ClipboardCheck],
  ['Event Schedule', ['Create event agendas', 'Manage start times, end times, and notes'], Clock3],
]

// 3-step workflow for the marketing section
const workflow = [
  ['1', 'Create your event', 'Input details, set dates, and give your event a clear home.'],
  ['2', 'Plan & execute', 'Manage tasks, vendors, guests, and communications from one dashboard.'],
  ['3', 'Track progress', 'Monitor check-ins, planning milestones, and engagement in real time.'],
]

// WorkspacePreview — Simulates the app dashboard inside the hero section.
// Shows a browser chrome bar, featured event info, stats, and live preview cards.
function WorkspacePreview() {
  return (
    <div className="workspace-preview">
      {/* Browser-style chrome bar with traffic lights and title */}
      <div className="workspace-browser-bar">
        <span><i /><i /><i /></span>
        <b>EventFlow Workspace · Active Dashboard</b>
        <em>Live Operations</em>
      </div>
      {/* Summary section with featured event and key metrics */}
      <div className="workspace-summary">
        <div>
          <small>FEATURED EVENT <b>ID: #EVF-2026-08</b></small>
          <h3>Global Tech Innovators Summit 2026</h3>
          <p>October 24–26, 2026 <span>•</span> Grand Horizon Convention Center (Hall A)</p>
        </div>
        {/* Key stats: budget, attendees, plan health */}
        <dl>
          <div><dt>Allocated budget</dt><dd>$65,000</dd></div>
          <div><dt>Target attendees</dt><dd>450 people</dd></div>
          <div className="health"><dt>Plan health</dt><dd>92% Ready</dd></div>
        </dl>
      </div>
      {/* Preview cards row */}
      <div className="workspace-columns">
        {/* Upcoming events card */}
        <div className="workspace-card upcoming-card">
          <header><strong>Upcoming events</strong><small>3 scheduled</small></header>
          <article><b>AI &amp; Robotics Executive Dinner</b><span>Nov 12 · 8:00 PM</span><em>Confirmed</em></article>
          <article><b>Annual Healthcare Symposium</b><span>Dec 05 · 9:00 AM</span><em className="planning">Planning</em></article>
        </div>
        {/* Coordination tasks card */}
        <div className="workspace-card tasks-card">
          <header><strong>Coordination tasks</strong><em>18/24 Completed</em></header>
          <p><CheckCircle2 size={12} /> Audio &amp; Visual Rigging <small>Staff: Tariq</small></p>
          <p><span className="task-dot" /> VIP Catering Delegation <small className="progress-text">In Progress</small></p>
        </div>
        {/* Guest RSVP status card */}
        <div className="workspace-card guests-card">
          <header><strong>Guest RSVP status</strong><small>450 invited</small></header>
          <div className="rsvp-bar"><i /><i /><i /></div>
          <div className="rsvp-counts">
            <span><b>304</b>Accepted</span>
            <span><b>64</b>Pending</span>
            <span><b>32</b>Declined</span>
          </div>
        </div>
      </div>
      {/* Schedule card at the bottom */}
      <div className="workspace-columns bottom">
        <div className="workspace-card schedule-card">
          <header><strong>Live event schedule · day 1 run of show</strong><small>3 of 5 sessions</small></header>
          <div className="schedule-items">
            <article><b>09:00 – 10:30 AM</b><strong>Opening Keynote</strong><small>Grand Hall · Dr. Elena Vance</small></article>
            <article><b>11:00 – 12:30 PM</b><strong>...</strong></article>
          </div>
        </div>
      </div>
    </div>
  )
}

// Capabilities — Marketing section displaying all feature modules with icons and descriptions
function Capabilities() {
  return (
    <section className="marketing-section capabilities-section" id="features">
      <div className="marketing-section-head">
        <span>Modular Core Capabilities</span>
        <h2>Everything You Need to Manage Your<br /><em>Event</em></h2>
        <p>From venue selection to real-time day-of execution, EventFlow coordinates each milestone inside one unified system.</p>
      </div>
      <div className="capability-grid">
        {capabilities.map(([title, bullets, Icon]) => (
          <article key={title}>
            <div className="capability-icon"><Icon size={17} /></div>
            <span className="capability-dot" />
            <h3>{title}</h3>
            <ul>{bullets.map((bullet) => <li key={bullet}><Check size={10} /> {bullet}</li>)}</ul>
            <footer><small>Structured Flow</small><ChevronRight size={11} /></footer>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="marketing-page">
      {/* Top navigation: logo, feature links, sign-in / open-workspace CTAs */}
      <header className="marketing-header">
        <a className="marketing-brand" href="/">
          <span className="brand-mark"><i className="fa-regular fa-calendar-check" aria-hidden="true" /></span>
          <span><b>Event<span>Flow</span></b><small>MANAGEMENT SYSTEM</small></span>
        </a>
        <nav>
          <a href="#features">Features</a>
          <a href="#workflow">How It Works</a>
          <a href="#about">About</a>
        </nav>
        <div className="marketing-actions">
          <a href="/sign-in">Sign In</a>
          <a className="marketing-workspace" href="/create-account"><LayoutDashboard size={13} /> Open Workspace</a>
        </div>
        <button 
          className="marketing-menu" 
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="landing-mobile-menu">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#workflow" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="/sign-in" className="mobile-sign-in" onClick={() => setMenuOpen(false)}>Sign In</a>
            <a href="/create-account" className="landing-primary mobile-workspace-cta" onClick={() => setMenuOpen(false)}>
              Open Workspace
            </a>
          </div>
        )}
      </header>

      {/* Hero section: headline, description, CTAs, and workspace preview */}
      <section className="marketing-hero">
        <div className="marketing-kicker"><span /> Event management <span /></div>
        <h1>Plan Every Event.<br /><em>One Flow.</em></h1>
        <p>Streamline your event planning with EventFlow. From concept to post-event analysis, manage everything in one powerful platform.</p>
        <div className="marketing-hero-actions">
          <a className="marketing-dark-button" href="/create-account">Get Started <ArrowRight size={15} /></a>
          <a className="marketing-light-button" href="#features">Learn More</a>
        </div>
        <WorkspacePreview />
      </section>

      {/* Features/capabilities section */}
      <Capabilities />

      {/* 3-step workflow section */}
      <section className="marketing-section workflow-v2" id="workflow">
        <div className="marketing-section-head">
          <span>Workflow</span>
          <h2>How EventFlow<br /><em>works.</em></h2>
        </div>
        <div className="workflow-grid-v2">
          {workflow.map(([number, title, description]) => (
            <article key={number}>
              <div>{number}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Call-to-action section */}
      <section className="marketing-cta" id="about">
        <span>Ready to get started?</span>
        <h2>Make event planning easier.</h2>
        <p>Join event teams using EventFlow to create clearer, more connected experiences.</p>
        <div>
          <a className="marketing-light-button" href="/create-account">Get Started Now</a>
          <a className="marketing-outline-button" href="/sign-in">Sign In</a>
        </div>
      </section>

      {/* Footer with links */}
      <footer className="marketing-footer">
        {/* ... footer content ... */}
      </footer>
    </main>
  )
}
