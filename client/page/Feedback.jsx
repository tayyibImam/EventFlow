import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import FeedbackCard from '../component/FeedbackCard';
import FilterDropdown from '../component/FilterDropdown';

// Feedback is submitted by attendees, not the organizer running the event —
// there's no "Submit Feedback" action here, only a read-only view of what
// guests have left.
export default function Feedback() {
  const { feedback, events } = useEventFlow();

  const [selectedEventId, setSelectedEventId] = useState('All');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('All');

  const eventFilterOptions = [
    { value: 'All', label: 'All Events' },
    ...events.map(e => ({ value: e.id, label: e.title }))
  ];

  const ratingFilterOptions = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

  const filteredFeedback = feedback.filter((fb) => {
    // Real event ids are numbers, but a <select>'s onChange always yields a
    // string — compare as strings so this keeps matching either way.
    const matchesEvent = selectedEventId === 'All' || String(fb.eventId) === String(selectedEventId);
    const matchesRating = selectedRatingFilter === 'All' || fb.rating.toString() === selectedRatingFilter[0];
    return matchesEvent && matchesRating;
  });

  // Calculate stats
  const totalResponses = feedback.length;
  const avgRating = totalResponses > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalResponses).toFixed(1)
    : '0.0';

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = feedback.filter(f => f.rating === stars).length;
    const percent = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
    return { stars, count, percent };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            Attendee Feedback &amp; Reviews
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time ratings, experience evaluations, and qualitative comments from event participants
          </p>
        </div>
      </div>

      {/* Analytics Summary Card: Average Rating & Distribution */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left: Big Score Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Rating
            </span>
            <div className="text-5xl sm:text-6xl font-black text-[#1B3A5C] mt-2 tracking-tight">
              {avgRating} <span className="text-2xl text-slate-400 font-normal">/ 5</span>
            </div>

            <div className="flex items-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(Number(avgRating))
                      ? 'fill-[#D4A537] text-[#D4A537]'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>

            <span className="text-xs font-medium text-slate-500 mt-2">
              Based on {totalResponses} verified attendee reviews
            </span>
          </div>

          {/* Center/Right: Rating Distribution Bars */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Rating Distribution
            </h4>
            {distribution.map(({ stars, count, percent }) => (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-semibold text-slate-700 flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 fill-[#D4A537] text-[#D4A537]" />
                </span>

                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#D4A537] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="w-10 text-right font-medium text-slate-500">
                  {percent}%
                </span>
                <span className="w-10 text-right text-[11px] text-slate-400">
                  ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="Event Filter"
            value={selectedEventId}
            onChange={setSelectedEventId}
            options={eventFilterOptions}
            id="filter-feedback-event"
          />

          <FilterDropdown
            label="Rating Tier"
            value={selectedRatingFilter}
            onChange={setSelectedRatingFilter}
            options={ratingFilterOptions}
            id="filter-feedback-stars"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredFeedback.length} reviews
        </span>
      </div>

      {/* Feedback Cards Grid */}
      {filteredFeedback.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No feedback yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Reviews left by attendees after your events will show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeedback.map((fb) => (
            <FeedbackCard key={fb.id} feedback={fb} />
          ))}
        </div>
      )}
    </div>
  );
}
