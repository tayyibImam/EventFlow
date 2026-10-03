import React from 'react';
import { Calendar, CalendarDays, CheckSquare, CheckCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function StaffFeedbackCard({ feedback, onMarkRead }) {
  const { id, staffName, stage, comment, taskTitle, eventTitle, date, isRead } = feedback;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      id={`staff-feedback-card-${id}`}
      className={`rounded-2xl border p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between ${
        isRead ? 'bg-slate-50 border-slate-200' : 'bg-white border-rose-300 ring-1 ring-rose-100'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={stage} size="sm" />
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isRead ? 'bg-slate-200 text-slate-500' : 'bg-rose-100 text-rose-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isRead ? 'bg-slate-400' : 'bg-rose-500 animate-pulse'}`} />
              {isRead ? 'Read' : 'New'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDate(date)}
          </span>
        </div>

        <p className={`text-xs sm:text-sm leading-relaxed italic ${isRead ? 'text-slate-500' : 'text-slate-700'}`}>
          "{comment}"
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-[#1B3A5C] shrink-0" />
            <span>Task: <strong className="text-slate-800 font-semibold">{taskTitle}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-[#D4A537] shrink-0" />
            <span>Event: <strong className="text-slate-800 font-semibold">{eventTitle}</strong></span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] flex items-center justify-center font-bold text-xs shrink-0">
            {staffName ? staffName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'S'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-none truncate">
              {staffName}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">
              Operations Staff
            </span>
          </div>
        </div>

        {!isRead && onMarkRead && (
          <button
            type="button"
            id={`btn-mark-read-${id}`}
            onClick={() => onMarkRead(id)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#1B3A5C] bg-sky-50 hover:bg-sky-100 rounded-md transition-colors shrink-0"
            title="Mark this feedback as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark as Read</span>
          </button>
        )}
      </div>
    </div>
  );
}
