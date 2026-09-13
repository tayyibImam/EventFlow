// Topbar — Header bar with menu toggle, breadcrumbs, search, notifications, and profile menu.
// Includes role-switching dropdown to toggle between Admin/Organizer/Staff/Guest perspectives.
import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { clearDemoSession } from '../data/demoSession'

// Props: onMenuToggle (sidebar toggle callback), admin (boolean), user (profile data), onSwitchPerspective (role switch callback)
export default function Topbar({ onMenuToggle, admin = false, user, onSwitchPerspective }) {
  const [profileOpen, setProfileOpen] = useState(false)
  // Determine display user; falls back to role-appropriate defaults
  const displayUser = user || { firstName: admin ? 'Zayid' : 'Meyadur', lastName: admin ? 'Karim' : 'Rahman', initials: admin ? 'ZK' : 'MR', role: admin ? 'Admin' : 'Organizer', email: admin ? 'zayid.karim@eventflow.com' : 'meyadurrahman777@gmail.com' }
  const fullName = `${displayUser.firstName} ${displayUser.lastName}`

  // Clear session and redirect to account creation page
  const handleSignOut = () => { clearDemoSession(); window.location.href = '/create-account' }

  // Switch role perspective and close profile dropdown
  const switchRole = (role) => { onSwitchPerspective(role); setProfileOpen(false) }

  return (
    <header className="topbar">
      {/* Hamburger menu button for mobile sidebar toggle */}
      <button className="icon-button menu-button" onClick={onMenuToggle} aria-label="Toggle navigation"><Menu size={20} /></button>
      {/* Breadcrumb navigation */}
      <div className="breadcrumbs">
        <span>EventFlow</span>
        <span className="crumb-separator">/</span>
        <strong>{admin ? 'Admin Control Center' : `${displayUser.role} Workspace`}</strong>
      </div>
      {/* Right-side actions: search, notifications, profile menu */}
      <div className="topbar-actions">
        {/* Search input */}
        <div className="search-box">
          <Search size={16} />
          <input aria-label="Search" placeholder={admin ? 'Search users, events, logs...' : 'Search events, guests, tasks...'} />
        </div>
        {/* Notification bell */}
        <button className="icon-button notification-button" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>
        {/* Profile dropdown menu */}
        <div className="profile-menu">
          <button className="profile" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-haspopup="menu">
            <div className="avatar avatar-navy">{displayUser.initials}</div>
            <div className="profile-text">
              <strong>{fullName}</strong>
              <small>{displayUser.role}</small>
            </div>
            <ChevronDown size={15} />
          </button>
          {profileOpen && (
            <div className="account-menu" role="menu">
              {/* Account info header */}
              <div className="account-heading">
                <strong>{fullName}</strong>
                <span>{displayUser.email}</span>
                <em>Role: {displayUser.role}</em>
              </div>
              {/* Role switching options */}
              <div className="perspective-label">Switch perspective:</div>
              {[['Organizer', 'Meyadur Rahman'], ['Admin', 'Zayid Karim'], ['Staff', 'Tariqul Islam'], ['Guest', 'Dr. Salman Chowdhury']].map(([role, name]) => (
                <button key={role} className={`perspective-item ${displayUser.role === role ? 'selected' : ''}`} onClick={() => switchRole(role)} role="menuitem">
                  <span>{role} View</span>
                  <small>{name}</small>
                </button>
              ))}
              {/* Sign out button */}
              <button className="sign-out" onClick={handleSignOut} role="menuitem">
                <LogOut size={14} /> Sign Out of EventFlow
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
