import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Menu, X, ArrowRight, LogOut, LayoutDashboard } from 'lucide-react';
import { useEventFlow } from '../../context/EventFlowContext';
import LogoutModal from '../LogoutModal';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, currentRole, currentProfile } = useEventFlow();

  const getDashboardPath = () => {
    if (currentRole === 'admin') return '/admin';
    if (currentRole === 'staff') return '/staff';
    if (currentRole === 'guest') return '/guest';
    return '/dashboard';
  };

  const handleScrollTo = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group"
            id="nav-brand-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1B3A5C] text-[#D4A537] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5 text-[#D4A537]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#1B3A5C]">
                Event<span className="text-[#D4A537]">Flow</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                Management System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleScrollTo('features')}
              className="text-sm font-medium text-slate-600 hover:text-[#1B3A5C] transition-colors cursor-pointer"
              id="nav-link-features"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo('how-it-works')}
              className="text-sm font-medium text-slate-600 hover:text-[#1B3A5C] transition-colors cursor-pointer"
              id="nav-link-how-it-works"
            >
              How It Works
            </button>
            <button
              onClick={() => handleScrollTo('about')}
              className="text-sm font-medium text-slate-600 hover:text-[#1B3A5C] transition-colors cursor-pointer"
              id="nav-link-about"
            >
              About
            </button>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#1B3A5C] hover:bg-[#142d48] rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
                  id="nav-btn-dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#7FB3D5]" />
                  <span>Open Workspace</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  id="nav-btn-logout"
                  title="Sign out of your session"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-sm font-semibold text-[#1B3A5C] hover:text-[#142d48] border border-slate-200 hover:border-slate-300 rounded-xl transition-all"
                  id="nav-btn-signin"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1B3A5C] hover:bg-[#142d48] rounded-xl shadow-xs hover:shadow transition-all inline-flex items-center gap-2 group"
                  id="nav-btn-get-started"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-[#1B3A5C] hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
              id="btn-mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="flex flex-col space-y-2 pt-1">
            <button
              onClick={() => handleScrollTo('features')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-[#1B3A5C] hover:bg-slate-50 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo('how-it-works')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-[#1B3A5C] hover:bg-slate-50 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => handleScrollTo('about')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-[#1B3A5C] hover:bg-slate-50 transition-colors"
            >
              About
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-sm font-semibold text-white bg-[#1B3A5C] rounded-xl hover:bg-[#142d48] transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#7FB3D5]" />
                  <span>Open Workspace</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full text-center py-2.5 px-4 text-sm font-semibold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-sm font-semibold text-[#1B3A5C] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  id="mobile-btn-signin"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-sm font-semibold text-white bg-[#1B3A5C] rounded-xl hover:bg-[#142d48] transition-colors shadow-xs flex items-center justify-center gap-2"
                  id="mobile-btn-get-started"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </header>
  );
}
