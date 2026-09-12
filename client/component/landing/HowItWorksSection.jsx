import React from 'react';
import { CalendarPlus, Network, Trophy, ArrowRight } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      stepNumber: '01',
      title: 'Create Your Event',
      description: 'Create an event with its basic information, date, venue, and category.',
      icon: CalendarPlus,
      highlight: 'Core Foundation'
    },
    {
      stepNumber: '02',
      title: 'Organize Everything',
      description: 'Manage guests, vendors, venues, staff, tasks, and schedules from one place.',
      icon: Network,
      highlight: 'Central Coordination'
    },
    {
      stepNumber: '03',
      title: 'Track & Complete',
      description: 'Monitor progress and keep everything organized until the event is completed.',
      icon: Trophy,
      highlight: 'Execution & Wrap-up'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#F9FAFB] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[#1B3A5C] text-xs font-semibold mb-3">
            <span>Simplified Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] tracking-tight">
            How EventFlow Works
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            A linear, dependable methodology designed to eliminate chaos and guarantee flawless staging.
          </p>
        </div>

        {/* 3 Steps: Horizontal on Desktop, Vertical on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.stepNumber}
                id={`step-${item.stepNumber}`}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 relative flex flex-col justify-between"
              >
                <div>
                  {/* Step Header with Number & Highlight */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-[#D4A537] tracking-tight">
                      {item.stepNumber}
                    </span>
                    <span className="text-[11px] font-bold text-[#1B3A5C] bg-slate-100 px-2.5 py-1 rounded-md">
                      {item.highlight}
                    </span>
                  </div>

                  {/* Icon Container */}
                  <div className="w-12 h-12 rounded-xl bg-[#1B3A5C] text-white flex items-center justify-center mb-5 shadow-xs">
                    <IconComponent className="w-6 h-6 text-[#7FB3D5]" />
                  </div>

                  {/* Step Title */}
                  <h3 className="text-xl font-bold text-[#1B3A5C] tracking-tight mb-3">
                    {item.stepNumber} — {item.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Step {index + 1} of 3</span>
                  {index < 2 && (
                    <span className="hidden md:inline-flex items-center text-[#1B3A5C]">
                      Next Step <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#D4A537]" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
