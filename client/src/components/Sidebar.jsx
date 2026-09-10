// Sidebar — Left navigation sidebar with role-based menu items.
// Displays different nav items for admin vs organizer views.
// Shows user profile info and avatar at the bottom.
import { BarChart3, CalendarDays, ClipboardCheck, Clock3, FileText, LayoutDashboard, MoreHorizontal, Settings, ShieldCheck, Users, WalletCards } from 'lucide-react'
import BuildingIcon from './BuildingIcon'

// Navigation items for organizer view (8 items: Dashboard, My Events, Venues, Vendors, Guests, Tasks, Schedule, Feedback)
const navItems = [
  ['Dashboard', LayoutDashboard], ['My Events', CalendarDays], ['Venues', BuildingIcon], ['Vendors', WalletCards],
  ['Guests', Users], ['Tasks', ClipboardCheck], ['Schedule', Clock3], ['Feedback', FileText],
]

// Navigation items for admin view (6 items: Dashboard, Users, Event Categories, Audit Logs, Venues, Vendors)
const adminNavItems = [
  ['Dashboard', LayoutDashboard], ['Users', Users], ['Event Categories', FileText], ['Audit Logs', ClipboardCheck], ['Venues', BuildingIcon], ['Vendors', WalletCards],
]

// Props: activeNav (current tab), onNavigate (callback), open (sidebar visibility), admin (boolean), user (profile data)
export default function Sidebar({ activeNav, onNavigate, open, admin = false, user }) {
  // Determine display user; falls back to defaults matching the admin/organizer role
  const displayUser = user || { firstName: admin ? 'Zayid' : 'Meyadur', lastName: admin ? 'Karim' : 'Rahman', initials: admin ? 'ZK' : 'MR', role: admin ? 'Admin' : 'Organizer' }
  // Select the appropriate nav items array based on admin flag
  const items = admin ? adminNavItems : navItems
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      {/* Brand logo */}
      <div className="brand"><span className="brand-mark"><i className="fa-regular fa-calendar-check" aria-hidden="true" /></span><span>Event<span>Flow</span></span></div>
      {/* Workspace label changes based on role */}
      <div className="workspace-label">{admin ? 'Admin Control Center' : 'Event Planning &amp; Management'}</div>
      {/* Navigation buttons */}
      <nav className="nav-list" aria-label="Main navigation">
        {items.map(([label, Icon]) => <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => onNavigate(label)}><Icon size={17} /><span>{label}</span></button>)}
      </nav>
      {/* Bottom section: Settings + user profile mini card */}
      <div className="sidebar-bottom">
        <button className="nav-item"><Settings size={17} /><span>Settings</span></button>
        <div className="profile-mini">
          <div className="avatar avatar-amber">{displayUser.initials}</div>
          <div><strong>{displayUser.firstName} {displayUser.lastName}</strong><small>Active Role · {displayUser.role}</small></div>
          <MoreHorizontal size={16} />
        </div>
      </div>
    </aside>
  )
}
