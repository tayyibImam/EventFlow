import React from 'react';
import { Star, Phone, Tag, DollarSign, CheckCircle2, Clock, AlertCircle, Briefcase, X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import Button from './Button';

// Two modes: pass `onHire` for the vendor directory (browsing, not tied to
// any event — booking a vendor only makes sense once you pick a target
// event). Pass `onStatusChange` (optionally with `onRemove`) for an
// event-scoped list where the vendor is already hired for that one event.
export default function VendorCard({ vendor, onStatusChange, onHire, onRemove }) {
  const {
    id,
    name,
    category,
    contact,
    availability,
    rating,
    agreedPrice,
    priceLabel = '(Plan Ref)',
    bookingStatus,
    specialty
  } = vendor;

  return (
    <div
      id={`vendor-card-${id}`}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
    >
      <div>
        {/* Header with Category & Booking Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1B3A5C] bg-[#7FB3D5]/15 px-2.5 py-0.5 rounded-md">
            {category}
          </span>
          <StatusBadge status={bookingStatus} size="sm" />
        </div>

        {/* Vendor Name */}
        <h3 className="text-base sm:text-lg font-bold text-[#1B3A5C] mt-1">
          {name}
        </h3>

        {/* Rating & Availability */}
        <div className="flex items-center gap-3 mt-2 text-xs">
          {rating != null && (
            <>
              <div className="flex items-center text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                <span>{rating} / 5.0</span>
              </div>
              <span className="text-slate-300">•</span>
            </>
          )}
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[11px]">
            {availability}
          </span>
        </div>

        {/* Specialty */}
        {specialty && (
          <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            {specialty}
          </p>
        )}

        {/* Contact info */}
        <div className="mt-3.5 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-start gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span className="break-all">{contact}</span>
          </div>
        </div>
      </div>

      {/* Agreed price & Booking Status Toggle */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block">
            {onHire ? 'Base Price' : 'Agreed Price'}
          </span>
          <span className="text-sm font-bold text-[#1B3A5C]">
            {agreedPrice} <span className="text-[10px] text-slate-400 font-normal">{priceLabel}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onHire ? (
            <Button
              id={`btn-hire-vendor-${id}`}
              size="sm"
              variant="primary"
              icon={Briefcase}
              onClick={() => onHire(vendor)}
            >
              Hire for Event
            </Button>
          ) : (
            <>
              {bookingStatus !== 'Confirmed' ? (
                <Button
                  id={`btn-confirm-vendor-${id}`}
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange && onStatusChange(id, 'Confirmed')}
                >
                  Confirm
                </Button>
              ) : (
                <Button
                  id={`btn-pending-vendor-${id}`}
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange && onStatusChange(id, 'Pending')}
                >
                  Mark Pending
                </Button>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Remove from this event"
                  aria-label="Remove vendor from this event"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
