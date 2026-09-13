// AppRoutes — client-side routing controller. 
// Determines which page to render based on window.location.pathname.
// Manages sidebar state, active navigation, admin/organizer perspective switching, and event data.
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Dashboard from '../pages/Dashboard'
import AdminDashboard from '../pages/AdminDashboard'
import LandingPage from '../pages/LandingPage'
import GetStarted from '../pages/GetStarted'
import EventsPage from '../pages/EventsPage'
import { CreateAccount, SignIn } from '../pages/AuthPages'
import { getDemoSession } from '../data/demoSession'
import { createEvent, getEvents } from '../data/eventStore'
import NotFound from '../pages/NotFound'

export default function AppRoutes() {
  // Route matching: render LandingPage at root, /get-started for onboarding, 
  // /sign-in and /create-account for auth, /dashboard for organizer, /admin for admin view
  if (window.location.pathname === '/') return <LandingPage />
  if (window.location.pathname === '/get-started') return <GetStarted />
  if (window.location.pathname === '/sign-in') return <SignIn />
  if (window.location.pathname === '/create-account') return <CreateAccount />
  // Any other path that isn't /dashboard or /admin shows the 404 page
  if (window.location.pathname !== '/dashboard' && window.location.pathname !== '/admin') return <NotFound />

  // State: sidebar open/close, active nav tab, admin view toggle, current user, event list
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [adminView, setAdminView] = useState(window.location.pathname === '/admin')
  // Load demo user session based on whether we're in admin or organizer mode
  const [user, setUser] = useState(() => getDemoSession(window.location.pathname === '/admin' ? 'Admin' : 'Organizer'))
  // Load events from localStorage; createEvent updates this state
  const [events, setEvents] = useState(getEvents)

  // Handler: switch active nav tab and close sidebar on mobile
  const handleNavigate = (label) => { setActiveNav(label); setSidebarOpen(false) }

  // Handler: switch between Admin/Organizer/Staff/Guest perspectives, reset to Dashboard
  const handlePerspective = (nextRole) => { setAdminView(nextRole === 'Admin'); setUser(getDemoSession(nextRole)); handleNavigate('Dashboard') }

  // Handler: create a new event via eventStore and update state
  const handleCreateEvent = (values) => setEvents(createEvent(values))

  // Determine if we should show the EventsPage (only for organizer view when 'My Events' is active)
  const showEvents = !adminView && activeNav === 'My Events'

  return (
    <div className={`app-shell ${adminView ? 'admin-shell' : ''}`}>
      {/* Sidebar navigation — shows different menu items for admin vs organizer */}
      <Sidebar activeNav={activeNav} onNavigate={handleNavigate} open={sidebarOpen} admin={adminView} user={user} />
      <main className="main-content">
        {/* Topbar with search, notifications, profile, and role-switching */}
        <Topbar onMenuToggle={() => setSidebarOpen((open) => !open)} admin={adminView} user={user} onSwitchPerspective={handlePerspective} />
        {/* Conditional rendering: AdminDashboard vs EventsPage vs Dashboard */}
        {adminView ? <AdminDashboard user={user} /> : showEvents ? <EventsPage events={events} onBack={() => handleNavigate('Dashboard')} onCreateEvent={handleCreateEvent} /> : <Dashboard user={user} events={events} onCreateEvent={handleCreateEvent} onShowEvents={() => handleNavigate('My Events')} />}
      </main>
    </div>
  )
}
