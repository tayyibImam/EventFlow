import React from 'react';

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-slate-100",
  iconColor = "text-[#1B3A5C]",
  badge,
  badgeType = "positive",
  id
}) {
  return (
    <div
      id={id || `card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1B3A5C] mt-2 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-xs`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-500 font-normal">
              {subtitle}
            </span>
          )}
          {badge && (
            <span
              className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                badgeType === 'positive'
                  ? 'bg-emerald-50 text-emerald-700'
                  : badgeType === 'gold'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
