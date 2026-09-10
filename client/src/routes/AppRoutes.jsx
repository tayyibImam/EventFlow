import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Dashboard from '../pages/Dashboard'
import AdminDashboard from '../pages/AdminDashboard'
import GetStarted from '../pages/GetStarted'
import LandingPage from '../pages/LandingPage'
import { CreateAccount, SignIn } from '../pages/AuthPages'
import { getDemoSession } from '../data/demoSession'
import NotFound from '../pages/NotFound'

export default function AppRoutes() {
  if (window.location.pathname === '/' || window.location.pathname === '/get-started') return <LandingPage />
  if (window.location.pathname === '/sign-in') return <SignIn />
  if (window.location.pathname === '/create-account') return <CreateAccount />
  if (window.location.pathname !== '/dashboard' && window.location.pathname !== '/admin') return <NotFound />

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [adminView, setAdminView] = useState(window.location.pathname === '/admin')
  const [user, setUser] = useState(() => getDemoSession(window.location.pathname === '/admin' ? 'Admin' : 'Organizer'))

  const handleNavigate = (label) => {
    setActiveNav(label)
    setSidebarOpen(false)
  }

  const handlePerspective = (isAdmin) => { const nextRole = isAdmin ? 'Admin' : 'Organizer'; setAdminView(isAdmin); setUser(getDemoSession(nextRole)); setActiveNav('Dashboard') }

  return <div className={`app-shell ${adminView ? 'admin-shell' : ''}`}><Sidebar activeNav={activeNav} onNavigate={handleNavigate} open={sidebarOpen} admin={adminView} user={user} /><main className="main-content"><Topbar onMenuToggle={() => setSidebarOpen((open) => !open)} admin={adminView} user={user} onSwitchPerspective={handlePerspective} />{adminView ? <AdminDashboard user={user} /> : <Dashboard user={user} />}</main></div>
}
