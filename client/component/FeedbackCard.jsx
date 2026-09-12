import React from 'react';
import { Star, Calendar, MessageSquareQuote } from 'lucide-react';

export default function FeedbackCard({ feedback }) {
  const {
    id,
    guestName,
    rating,
    comment,
    date
  } = feedback;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      id={`feedback-card-${id}`}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
    >
      <div>
        {/* Rating Stars & Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= rating
                    ? 'fill-[#D4A537] text-[#D4A537]'
                    : 'text-slate-200'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-slate-700 ml-1.5">{rating}.0</span>
          </div>

          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDate(date)}
          </span>
        </div>

        {/* Comment */}
        <div className="relative">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
            "{comment}"
          </p>
        </div>
      </div>

      {/* Guest Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] flex items-center justify-center font-bold text-xs shrink-0">
          {guestName ? guestName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'G'}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 leading-none">
            {guestName}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            Verified Event Attendee
          </span>
        </div>
      </div>
    </div>
  );
}
