import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1B3A5C] rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl relative overflow-hidden border border-[#244b75]">
          {/* Subtle architectural glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#7FB3D5]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4A537]/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-4 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A537]" />
              <span>Unified Management Awaits</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to Make Event Planning Easier?
            </h2>

            {/* Text */}
            <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl mx-auto">
              Bring your entire event workflow together with EventFlow.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-[#1B3A5C] bg-white hover:bg-slate-100 rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center justify-center gap-2 group"
                id="cta-btn-get-started"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-[#1B3A5C] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/signin"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white hover:text-white bg-transparent hover:bg-white/10 border border-white/30 rounded-xl transition-all inline-flex items-center justify-center"
                id="cta-btn-sign-in"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
