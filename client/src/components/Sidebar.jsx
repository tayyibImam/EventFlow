import { BarChart3, CalendarDays, ClipboardCheck, Clock3, FileText, LayoutDashboard, MoreHorizontal, Settings, ShieldCheck, Users, WalletCards } from 'lucide-react'
import BuildingIcon from './BuildingIcon'

const navItems = [
  ['Dashboard', LayoutDashboard], ['My Events', CalendarDays], ['Venues', BuildingIcon], ['Vendors', WalletCards],
  ['Guests', Users], ['Tasks', ClipboardCheck], ['Schedule', Clock3], ['Feedback', FileText],
]

const adminNavItems = [
  ['Dashboard', LayoutDashboard], ['Users', Users], ['Event Categories', FileText], ['Audit Logs', ClipboardCheck], ['Venues', BuildingIcon], ['Vendors', WalletCards],
]

export default function Sidebar({ activeNav, onNavigate, open, admin = false, user }) {
  const displayUser = user || { firstName: admin ? 'Zayid' : 'Meyadur', lastName: admin ? 'Karim' : 'Rahman', initials: admin ? 'ZK' : 'MR', role: admin ? 'Admin' : 'Organizer' }
  const items = admin ? adminNavItems : navItems
  return <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
    <div className="brand"><span className="brand-mark"><i className="fa-regular fa-calendar-check" aria-hidden="true" /></span><span>Event<span>Flow</span></span></div>
    <div className="workspace-label">{admin ? 'Admin Control Center' : 'Event Planning &amp; Management'}</div>
    <nav className="nav-list" aria-label="Main navigation">
      {items.map(([label, Icon]) => <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => onNavigate(label)}><Icon size={17} /><span>{label}</span></button>)}
    </nav>
    <div className="sidebar-bottom"><button className="nav-item"><Settings size={17} /><span>Settings</span></button><div className="profile-mini"><div className="avatar avatar-amber">{displayUser.initials}</div><div><strong>{displayUser.firstName} {displayUser.lastName}</strong><small>Active Role · {displayUser.role}</small></div><MoreHorizontal size={16} /></div></div>
  </aside>
}
