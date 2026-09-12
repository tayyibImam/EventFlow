import React from 'react';
import { Clock, MapPin, FileText, Trash2 } from 'lucide-react';

export default function ScheduleTimeline({
  items = [],
  onDeleteItem,
  id = "event-schedule-timeline"
}) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
        No schedule items created yet for this timeline.
      </div>
    );
  }

  // Sort chronologically
  const sortedItems = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div id={id} className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {sortedItems.map((item, idx) => {
        const {
          id: itemId,
          startTime,
          endTime,
          activity,
          location,
          notes
        } = item;

        return (
          <div
            key={itemId}
            id={`schedule-item-${itemId}`}
            className="relative group"
          >
            {/* Timeline node circle */}
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#1B3A5C] flex items-center justify-center text-[10px] font-bold text-[#1B3A5C] shadow-xs group-hover:bg-[#1B3A5C] group-hover:text-white transition-colors">
              {idx + 1}
            </div>

            {/* Timeline content card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1B3A5C] bg-[#7FB3D5]/20 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-[#1B3A5C]" />
                    {startTime} {endTime ? `— ${endTime}` : ''}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {activity}
                  </h4>
                </div>

                {onDeleteItem && (
                  <button
                    type="button"
                    onClick={() => onDeleteItem(itemId)}
                    className="self-end sm:self-center p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove schedule entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {location && (
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-[#D4A537]" />
                  <span>{location}</span>
                </div>
              )}

              {notes && (
                <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
