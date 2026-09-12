import React from 'react';
import { Filter } from 'lucide-react';

export default function FilterDropdown({
  label,
  value,
  onChange,
  options = [],
  id = "filter-dropdown",
  className = ""
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-xs hover:border-slate-400 transition-colors">
        <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        {label && <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{label}:</span>}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-xs sm:text-sm font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
        >
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const lbl = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={val} value={val} className="text-slate-800">
                {lbl}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
