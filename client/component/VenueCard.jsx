import React from 'react';
import { MapPin, Users, Check, Tag, Building2, CalendarPlus } from 'lucide-react';
import StatusBadge from './StatusBadge';
import Button from './Button';

export default function VenueCard({
  venue,
  onAssign,
  onViewDetails
}) {
  const {
    id,
    name,
    location,
    capacity,
    facilities = [],
    availability,
    planningPrice,
    bookingStatus,
    assignedEventTitle,
    image
  } = venue;

  return (
    <div
      id={`venue-card-${id}`}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
    >
      {/* Venue Image / Banner */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
            <Building2 className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={bookingStatus} />
        </div>
        <div className="absolute bottom-3 left-3 bg-[#1B3A5C]/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-xs font-semibold">
          {planningPrice} (Ref)
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#1B3A5C]">
              {name}
            </h3>
          </div>

          <div className="mt-2 space-y-1.5 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Capacity: <strong className="text-slate-800 font-semibold">{capacity} guests</strong></span>
            </div>
            {assignedEventTitle && (
              <div className="flex items-center gap-2 text-xs text-[#1B3A5C] bg-sky-50 px-2 py-1 rounded-md mt-2 font-medium">
                <Tag className="w-3.5 h-3.5 text-[#1B3A5C]" />
                <span>Assigned to: {assignedEventTitle}</span>
              </div>
            )}
          </div>

          {/* Facilities list */}
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Key Facilities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {facilities.slice(0, 4).map((fac, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                >
                  <Check className="w-3 h-3 text-emerald-600 mr-1" />
                  {fac}
                </span>
              ))}
              {facilities.length > 4 && (
                <span className="text-xs text-slate-400 self-center">
                  +{facilities.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <Button
            id={`btn-view-venue-${id}`}
            variant="outline"
            size="sm"
            onClick={() => onViewDetails && onViewDetails(venue)}
          >
            View Details
          </Button>

          <Button
            id={`btn-assign-venue-${id}`}
            variant="primary"
            size="sm"
            icon={CalendarPlus}
            onClick={() => onAssign && onAssign(venue)}
          >
            Assign to Event
          </Button>
        </div>
      </div>
    </div>
  );
}
