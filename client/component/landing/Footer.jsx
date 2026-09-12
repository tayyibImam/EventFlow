import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  const handleScrollTo = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
          {/* Logo & Description */}
          <div className="max-w-md space-y-3">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3"
              id="footer-brand-logo"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1B3A5C] text-[#D4A537] flex items-center justify-center shadow-xs">
                <Calendar className="w-4 h-4 text-[#D4A537]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1B3A5C]">
                Event<span className="text-[#D4A537]">Flow</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              EventFlow is a web-based event planning and management platform that helps organizers plan, coordinate, and track events from start to finish in one central place.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-slate-600">
            <button
              onClick={() => handleScrollTo('features')}
              className="hover:text-[#1B3A5C] transition-colors cursor-pointer"
              id="footer-link-features"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo('how-it-works')}
              className="hover:text-[#1B3A5C] transition-colors cursor-pointer"
              id="footer-link-how-it-works"
            >
              How It Works
            </button>
            <button
              onClick={() => handleScrollTo('about')}
              className="hover:text-[#1B3A5C] transition-colors cursor-pointer"
              id="footer-link-about"
            >
              About
            </button>
            <Link
              to="/signin"
              className="hover:text-[#1B3A5C] transition-colors"
              id="footer-link-signin"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-[#1B3A5C] font-bold hover:underline"
              id="footer-link-get-started"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p id="footer-copyright">
            &copy; 2026 EventFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>Primary: #1B3A5C &bull; Gold: #D4A537</span>
            <span>Academic SaaS Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
