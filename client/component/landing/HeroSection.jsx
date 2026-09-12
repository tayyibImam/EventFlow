import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  CheckSquare,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-[#F9FAFB]">
      {/* Subtle architectural background accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-[#7FB3D5]/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-[#D4A537]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Text Content */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs mb-6 text-xs font-semibold text-[#1B3A5C]">
            <span className="w-2 h-2 rounded-full bg-[#D4A537]"></span>
            <span>The Central Event Operating Platform</span>
          </div>

          {/* Large Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1B3A5C] tracking-tight leading-[1.15]">
            Plan Every Event. <span className="text-[#D4A537]">One Flow.</span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            EventFlow brings your venues, vendors, guests, tasks, and schedules together in one simple platform.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-[#1B3A5C] hover:bg-[#142d48] rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center justify-center gap-2.5 group"
              id="hero-btn-get-started"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/signin"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-[#1B3A5C] bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-2xs inline-flex items-center justify-center"
              id="hero-btn-sign-in"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Modern Dashboard Preview Representation */}
        <div className="mt-14 sm:mt-18 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Mock Application Top Bar */}
            <div className="bg-[#1B3A5C] px-5 py-3.5 flex items-center justify-between text-white border-b border-[#244b75]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                </div>
                <div className="h-4 w-px bg-slate-600 mx-1"></div>
                <span className="text-xs font-semibold tracking-wide text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#D4A537]" />
                  EventFlow Workspace &bull; Active Dashboard
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Live Operations
                </span>
              </div>
            </div>

            {/* Dashboard Inner Canvas */}
            <div className="p-5 sm:p-7 bg-[#F9FAFB] space-y-6">
              {/* 1. Event Overview Banner */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4A537] bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                      Featured Event
                    </span>
                    <span className="text-xs text-slate-400 font-medium">ID: #EVF-2026-08</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1B3A5C]">
                    Global Tech Innovators Summit 2026
                  </h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#7FB3D5]" />
                      October 24–26, 2026
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#7FB3D5]" />
                      Grand Horizon Convention Center (Hall A)
                    </span>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-6">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Allocated Budget</p>
                    <p className="text-sm font-extrabold text-[#1B3A5C]">$65,000</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Target Attendees</p>
                    <p className="text-sm font-extrabold text-[#1B3A5C]">450 Pax</p>
                  </div>
                  <div className="bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-100 text-center">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase">Plan Health</p>
                    <p className="text-sm font-extrabold text-emerald-700">92% Ready</p>
                  </div>
                </div>
              </div>

              {/* Grid of Preview Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 2. Upcoming Events Preview */}
                <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1B3A5C] uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#1B3A5C]" />
                      Upcoming Events
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400">3 Scheduled</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-[11px]">AI & Robotics Executive Dinner</p>
                        <p className="text-[10px] text-slate-500">Nov 12 &bull; 80 Guests</p>
                      </div>
                      <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-[11px]">Annual Healthcare Symposium</p>
                        <p className="text-[10px] text-slate-500">Dec 05 &bull; 300 Guests</p>
                      </div>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        Planning
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Task Management Preview */}
                <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1B3A5C] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-[#1B3A5C]" />
                      Coordination Tasks
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      18/24 Completed
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-800 font-medium text-[11px]">Audio & Visual Rigging</span>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-500">Staff: Tariqul</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 shrink-0"></span>
                        <span className="text-slate-800 font-medium text-[11px]">VIP Catering Degustation</span>
                      </div>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">In Progress</span>
                    </div>
                  </div>
                </div>

                {/* 4. Guest RSVP Status Preview */}
                <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1B3A5C] uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#1B3A5C]" />
                      Guest RSVP Status
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-500">400 Invited</span>
                  </div>
                  
                  {/* Segmented Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: '76%' }}></div>
                      <div className="h-full bg-amber-400" style={{ width: '16%' }}></div>
                      <div className="h-full bg-rose-400" style={{ width: '8%' }}></div>
                    </div>
                    <div className="grid grid-cols-3 text-center gap-1 text-[11px] pt-1">
                      <div className="bg-slate-50 rounded-lg p-1.5">
                        <span className="block font-bold text-emerald-700">304</span>
                        <span className="text-[9px] text-slate-500 font-medium">Accepted</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-1.5">
                        <span className="block font-bold text-amber-700">64</span>
                        <span className="text-[9px] text-slate-500 font-medium">Pending</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-1.5">
                        <span className="block font-bold text-rose-700">32</span>
                        <span className="text-[9px] text-slate-500 font-medium">Declined</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Event Schedule Preview */}
                <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-2xs space-y-3 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1B3A5C] uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1B3A5C]" />
                      Live Event Schedule &bull; Day 1 Run of Show
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">3 of 8 Sessions</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-[#1B3A5C] block">09:00 — 10:30 AM</span>
                      <p className="font-semibold text-slate-800 text-[11px] mt-0.5">Opening Keynote</p>
                      <p className="text-[10px] text-slate-500 truncate">Grand Hall &bull; Dr. Elena Vance</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-[#1B3A5C] block">11:00 — 12:30 PM</span>
                      <p className="font-semibold text-slate-800 text-[11px] mt-0.5">Technical Breakouts</p>
                      <p className="text-[10px] text-slate-500 truncate">Rooms 101-104 &bull; 4 Tracks</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-[#1B3A5C] block">01:00 — 02:30 PM</span>
                      <p className="font-semibold text-slate-800 text-[11px] mt-0.5">Networking Luncheon</p>
                      <p className="text-[10px] text-slate-500 truncate">Terrace Pavilion &bull; Live Chef</p>
                    </div>
                  </div>
                </div>

                {/* 6. Venue & Vendor Information Preview */}
                <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1B3A5C] uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#1B3A5C]" />
                      Venues & Vendors
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      All Confirmed
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-[11px]">Grand Horizon Hall A</p>
                        <p className="text-[10px] text-slate-500">Venue &bull; Capacity 500</p>
                      </div>
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Booked
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-[11px]">SonicWave Media AV</p>
                        <p className="text-[10px] text-slate-500">Audio/Visual Partner</p>
                      </div>
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Contracted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
