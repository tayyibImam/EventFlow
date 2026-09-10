import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Dashboard from '../pages/Dashboard'
import AdminDashboard from '../pages/AdminDashboard'

export default function AppRoutes() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [adminView, setAdminView] = useState(false)

  const handleNavigate = (label) => {
    setActiveNav(label)
    setSidebarOpen(false)
  }

  const handlePerspective = (isAdmin) => { setAdminView(isAdmin); setActiveNav('Dashboard') }

  return <div className={`app-shell ${adminView ? 'admin-shell' : ''}`}><Sidebar activeNav={activeNav} onNavigate={handleNavigate} open={sidebarOpen} admin={adminView} /><main className="main-content"><Topbar onMenuToggle={() => setSidebarOpen((open) => !open)} admin={adminView} onSwitchPerspective={handlePerspective} />{adminView ? <AdminDashboard /> : <Dashboard />}</main></div>
}
