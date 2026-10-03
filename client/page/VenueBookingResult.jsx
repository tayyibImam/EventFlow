import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Ban, ArrowRight } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    title: 'Deposit Paid — Venue Confirmed',
    message: 'Your confirmation deposit was received and the venue has been assigned to your event.'
  },
  failed: {
    icon: XCircle,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    title: 'Payment Failed',
    message: "The payment didn't go through, so the venue was not assigned. No charge was made — you can try again."
  },
  cancelled: {
    icon: Ban,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    title: 'Payment Cancelled',
    message: 'You cancelled the payment before it completed, so the venue was not assigned.'
  }
};

export default function VenueBookingResult() {
  const [searchParams] = useSearchParams();
  const { refreshEvents } = useEventFlow();
  const [refreshed, setRefreshed] = useState(false);

  const status = searchParams.get('status');
  const eventId = searchParams.get('eventId');
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.failed;
  const Icon = config.icon;

  // Pulls the fresh events.venue_id set server-side on a successful payment —
  // this client never sets it itself (see EventFlowContext.jsx).
  useEffect(() => {
    refreshEvents().finally(() => setRefreshed(true));
  }, []);

  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-8 text-center space-y-5">
        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border ${config.color}`}>
          <Icon className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">{config.title}</h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{config.message}</p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
          <Link
            to="/venues"
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#1B3A5C] border border-slate-200 rounded-xl transition-colors"
          >
            Back to Venues
          </Link>
          {eventId && (
            <Link
              to={`/events/${eventId}`}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1B3A5C] hover:bg-[#142d48] rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
            >
              <span>View Event</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {!refreshed && (
          <p className="text-[11px] text-slate-400">Refreshing event data...</p>
        )}
      </div>
    </div>
  );
}
