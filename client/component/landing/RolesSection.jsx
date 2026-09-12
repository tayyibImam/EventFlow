import React from 'react';
import { ShieldCheck, UserCheck, CheckSquare, Mail, Lock } from 'lucide-react';

export default function RolesSection() {
  const roles = [
    {
      id: 'role-admin',
      role: 'Admin',
      description: 'Manage the overall EventFlow platform.',
      badge: 'System Governance',
      isPublic: false,
      icon: ShieldCheck,
      iconBg: 'bg-slate-100',
      iconColor: 'text-[#1B3A5C]'
    },
    {
      id: 'role-organizer',
      role: 'Organizer',
      description: 'Create and manage events and coordinate the entire event.',
      badge: 'Lead Planner',
      isPublic: true,
      icon: UserCheck,
      iconBg: 'bg-blue-50',
      iconColor: 'text-[#1B3A5C]'
    },
    {
      id: 'role-staff',
      role: 'Staff',
      description: 'View assigned tasks and update task progress.',
      badge: 'Field Operations',
      isPublic: true,
      icon: CheckSquare,
      iconBg: 'bg-amber-50',
      iconColor: 'text-[#D4A537]'
    },
    {
      id: 'role-guest',
      role: 'Guest',
      description: 'View invitations, respond to events, and provide feedback.',
      badge: 'Attendee Experience',
      isPublic: true,
      icon: Mail,
      iconBg: 'bg-sky-50',
      iconColor: 'text-[#7FB3D5]'
    }
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[#1B3A5C] text-xs font-semibold mb-3">
            <span>Collaborative Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] tracking-tight">
            Built for Every Event Team
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Purpose-tailored workspaces built around the real responsibilities of your entire event personnel.
          </p>
        </div>

        {/* 4 Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                id={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1B3A5C] tracking-tight mb-2">
                    {item.role}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {!item.isPublic ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Internal platform role (non-public signup)</span>
                    </div>
                  ) : (
                    <div className="text-[11px] font-semibold text-[#1B3A5C]">
                      Standard Team Role
                    </div>
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
