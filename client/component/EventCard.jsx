import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  TrendingUp,
  Tag,
  Clock
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EventCard({ event }) {
  const {
    id,
    title,
    category,
    startDate,
    endDate,
    venue,
    status,
    expectedGuests,
    progress = { overall: 0 }
  } = event;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const progressVal = typeof progress === 'number' ? progress : (progress.overall || 0);

  return (
    <div
      id={`event-card-${id}`}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
    >
      <div className="p-5 sm:p-6">
        {/* Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center text-xs font-semibold text-[#1B3A5C] bg-[#7FB3D5]/15 px-2.5 py-0.5 rounded-md">
            <Tag className="w-3 h-3 mr-1 text-[#1B3A5C]" />
            {category}
          </span>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#1B3A5C] group-hover:text-[#D4A537] transition-colors line-clamp-1">
          {title}
        </h3>

        {/* Details list */}
        <div className="mt-4 space-y-2 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4A537] shrink-0" />
            <span>
              {formatDate(startDate)}
              {endDate && endDate !== startDate && ` — ${formatDate(endDate)}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{venue || "Venue not selected"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{expectedGuests} Confirmed / Expected Guests</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#1B3A5C]" />
              Planning Progress
            </span>
            <span className="font-bold text-[#1B3A5C]">{progressVal}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                progressVal === 100
                  ? 'bg-emerald-500'
                  : progressVal > 60
                  ? 'bg-[#1B3A5C]'
                  : 'bg-[#D4A537]'
              }`}
              style={{ width: `${progressVal}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
        <Link
          id={`view-event-${id}`}
          to={`/events/${id}`}
          className="inline-flex items-center text-xs sm:text-sm font-semibold text-[#1B3A5C] hover:text-[#D4A537] transition-colors gap-1 group/btn"
        >
          <span>View Event</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
