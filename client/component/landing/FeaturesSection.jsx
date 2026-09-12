import React from 'react';
import {
  Calendar,
  Building2,
  Briefcase,
  Users,
  CheckSquare,
  Clock,
  Check
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      id: 'feature-event-management',
      title: 'Event Management',
      icon: Calendar,
      iconColor: 'text-[#1B3A5C]',
      iconBg: 'bg-slate-100',
      bullets: [
        'Create and manage events',
        'Track event status, dates, venue, and budget'
      ]
    },
    {
      id: 'feature-venue-booking',
      title: 'Venue Booking',
      icon: Building2,
      iconColor: 'text-[#1B3A5C]',
      iconBg: 'bg-slate-100',
      bullets: [
        'Browse and manage event venues',
        'Store capacity and booking information'
      ]
    },
    {
      id: 'feature-vendor-management',
      title: 'Vendor Management',
      icon: Briefcase,
      iconColor: 'text-[#1B3A5C]',
      iconBg: 'bg-slate-100',
      bullets: [
        'Assign vendors to events',
        'Track vendor details and booking status'
      ]
    },
    {
      id: 'feature-guest-rsvp',
      title: 'Guest & RSVP',
      icon: Users,
      iconColor: 'text-[#1B3A5C]',
      iconBg: 'bg-slate-100',
      bullets: [
        'Manage invitations',
        'Track accepted, declined, and pending guests'
      ]
    },
    {
      id: 'feature-task-management',
      title: 'Task Management',
      icon: CheckSquare,
      iconColor: 'text-[#1B3A5C]',
      iconBg: 'bg-slate-100',
      bullets: [
        'Assign tasks to staff',
        'Track pending, in-progress, and completed tasks'
      ]
    },
    {
      id: 'feature-event-schedule',
      title: 'Event Schedule',
      icon: Clock,
      iconColor: 'text-[#1B3A5C]',
      iconBg: 'bg-slate-100',
      bullets: [
        'Create event agendas',
        'Manage start times, end times, and notes'
      ]
    }
  ];

  return (
    <section id="features" className="py-20 sm:py-28 bg-white border-y border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[#1B3A5C] text-xs font-semibold mb-3">
            <span>Modular Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] tracking-tight">
            Everything You Need to Manage Your Event
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            From venue selection to real-time day-of execution, EventFlow coordinates each milestone inside one unified system.
          </p>
        </div>

        {/* Six Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                id={feature.id}
                className="bg-white rounded-2xl p-7 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <IconComponent className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    <span className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-[#D4A537] transition-colors"></span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1B3A5C] tracking-tight">
                    {feature.title}
                  </h3>

                  <ul className="mt-4 space-y-2.5">
                    {feature.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-snug">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Structured Flow</span>
                  <span className="text-[#D4A537] group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
