import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  MapPin,
  Store,
  Users,
  CheckSquare,
  Clock,
  MessageSquare,
  Settings,
  HelpCircle,
  FolderTree,
  UserCheck,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import LogoutModal from './LogoutModal';

export default function Sidebar({ isOpen, onClose }) {
  const { currentRole, currentProfile } = useEventFlow();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Define navigation links based on role
  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Event Categories', path: '/admin/categories', icon: FolderTree },
          { name: 'All Events', path: '/admin/events', icon: CalendarDays },
          { name: 'Venues', path: '/admin/venues', icon: MapPin },
          { name: 'Vendors', path: '/admin/vendors', icon: Store }
        ];
      case 'staff':
        return [
          { name: 'Dashboard', path: '/staff/tasks', icon: LayoutDashboard },
          { name: 'My Tasks', path: '/staff/tasks', icon: CheckSquare },
          { name: 'Assigned Events', path: '/events', icon: CalendarDays },
          { name: 'Event Schedule', path: '/schedule', icon: Clock }
        ];
      case 'guest':
        return [
          { name: 'Dashboard', path: '/guest/invitations', icon: LayoutDashboard },
          { name: 'My Invitations', path: '/guest/invitations', icon: CalendarDays },
          { name: 'RSVP & Badges', path: '/guests', icon: UserCheck },
          { name: 'Feedback', path: '/feedback', icon: MessageSquare }
        ];
      case 'organizer':
      default:
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'My Events', path: '/events', icon: CalendarDays },
          { name: 'Venues', path: '/venues', icon: MapPin },
          { name: 'Vendors', path: '/vendors', icon: Store },
          { name: 'Guests', path: '/guests', icon: Users },
          { name: 'Tasks', path: '/tasks', icon: CheckSquare },
          { name: 'Schedule', path: '/schedule', icon: Clock },
          { name: 'Feedback', path: '/feedback', icon: MessageSquare }
        ];
    }
  };

  const navItems = getNavItems();

  const additionalItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help', path: '#help', icon: HelpCircle, isAction: true }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col w-64 bg-[#1B3A5C] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#152e4a] shadow-xl`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              id="sidebar-brand-badge"
              className="w-10 h-10 rounded-xl bg-[#0f233a] border border-white/10 flex items-center justify-center text-[#D4A537] shadow-inner shrink-0"
            >
              <Calendar className="w-5 h-5 text-[#D4A537]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Event<span className="text-[#D4A537]">Flow</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">Event Planning &amp; Management</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Management
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && item.path !== '/dashboard' && item.path !== '/admin' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-[#1B3A5C] shadow-md font-semibold'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#1B3A5C]' : 'text-[#7FB3D5] group-hover:text-white'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4A537]" />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              System
            </p>
            <nav className="space-y-1">
              {additionalItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                if (item.isAction) {
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => alert("EventFlow Help Center: Contact support@eventflow.app or refer to our Quickstart Guide.")}
                      className="w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#7FB3D5] group-hover:text-white" />
                        <span>{item.name}</span>
                      </div>
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-[#1B3A5C] shadow-md font-semibold'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#1B3A5C]' : 'text-[#7FB3D5] group-hover:text-white'}`} />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-white/10 bg-[#152e4a] flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#D4A537] text-[#1B3A5C] flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
              {currentProfile.avatar || "MR"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {currentProfile.name}
              </p>
              <p className="text-xs text-[#7FB3D5] font-medium truncate">
                {currentProfile.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="sidebar-btn-logout"
            onClick={() => setShowLogoutModal(true)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Sign out of EventFlow"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}
