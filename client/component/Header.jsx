import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Calendar,
  CheckCircle2,
  Users,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import LogoutModal from './LogoutModal';

export default function Header({ onMenuClick, title, subtitle }) {
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    currentProfile,
    currentRole,
    setCurrentRole,
    activities
  } = useEventFlow();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      id="top-header"
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200 shadow-xs"
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="btn-sidebar-toggle"
          type="button"
          onClick={onMenuClick}
          className="p-2 -ml-1 text-slate-600 rounded-lg lg:hidden hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#1B3A5C] truncate">
            {title || "EventFlow"}
          </h1>
          {subtitle && (
            <p className="hidden md:block text-xs text-slate-500 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center/Right: Event Selector, Search, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Optional Event Selector */}
        <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <Calendar className="w-4 h-4 text-[#1B3A5C] mr-2 shrink-0" />
          <select
            id="header-event-selector"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
            title="Filter dashboard scope by event"
          >
            <option value="all">All Events (Consolidated)</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.status})
              </option>
            ))}
          </select>
        </div>

        {/* Global Search Bar (compact) */}
        <div className="hidden lg:block relative w-52 xl:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="header-global-search"
            type="text"
            placeholder="Search events, guests, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3A5C] focus:border-[#1B3A5C]"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications"
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4A537] rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {showNotifications && (
            <div
              id="notifications-popover"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="font-semibold text-xs text-[#1B3A5C] uppercase tracking-wider">Live System Activity</span>
                <span className="text-[11px] font-medium text-slate-400">{activities.length} updates</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {activities.map((act) => (
                  <div key={act.id} className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <p className="text-xs font-semibold text-slate-800">{act.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                    <p className="text-[10px] text-[#7FB3D5] font-medium mt-1">{act.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Role Selector */}
        <div className="relative">
          <button
            id="btn-user-profile-menu"
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#1B3A5C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentProfile.avatar || "MR"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                {currentProfile.name}
              </p>
              <p className="text-[10px] text-[#D4A537] font-semibold mt-0.5 leading-none uppercase">
                {currentProfile.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div
              id="profile-dropdown-menu"
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="px-2 pb-2 mb-2 border-b border-slate-100">
                <p className="text-xs font-bold text-[#1B3A5C]">{currentProfile.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentProfile.email}</p>
                <div className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full">
                  Role: {currentProfile.role}
                </div>
              </div>

              <p className="px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                Switch Perspective:
              </p>
              <div className="space-y-1">
                {[
                  { role: 'organizer', label: 'Organizer View', sub: 'Meyadur Rahman' },
                  { role: 'admin', label: 'Admin View', sub: 'Zayd Karim' },
                  { role: 'staff', label: 'Staff View', sub: 'Tariqul Islam' },
                  { role: 'guest', label: 'Guest View', sub: 'Dr. Salman Chowdhury' }
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setCurrentRole(item.role);
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                      currentRole === item.role
                        ? 'bg-[#1B3A5C] text-white font-medium'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-[10px] ${currentRole === item.role ? 'text-slate-200' : 'text-slate-400'}`}>
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sign Out Action */}
              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  id="header-btn-logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out of EventFlow</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </header>
  );
}
