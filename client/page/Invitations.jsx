import React, { useState } from 'react';
import { Mail, Calendar, MapPin, Check, X, Clock, Sparkles, Building, User } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import StatusBadge from '../component/StatusBadge';
import Button from '../component/Button';

export default function Invitations() {
  const { events, guests, updateGuestRSVP } = useEventFlow();

  // Guest persona: Dr. Kamal Hossain / Tariqul
  const [guestEmail, setGuestEmail] = useState('kamal.hossain@fintechforum.org');

  // Find guest records
  const currentGuestRecord = guests.find(g => g.email === guestEmail) || guests[0];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#1B3A5C] text-white rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#D4A537] mb-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Official Event Invitations</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome, {currentGuestRecord?.name || "Distinguished Guest"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
              You have been formally invited to executive conferences and ceremonies. Please review dates and confirm your RSVP seat status below.
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-xs">
            <span className="text-[11px] font-bold text-[#D4A537] uppercase block mb-1">Invited Attendee:</span>
            <p className="font-bold text-white">{currentGuestRecord?.name}</p>
            <p className="text-slate-300 text-[11px]">{currentGuestRecord?.organization}</p>
          </div>
        </div>
      </div>

      {/* Invitations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#1B3A5C]">
          Your Event Invitations
        </h3>

        {events.slice(0, 3).map((evt) => {
          // Link guest RSVP for this event
          const guestEntry = guests.find(g => g.eventId === evt.id) || currentGuestRecord;
          const currentRSVP = guestEntry ? guestEntry.rsvpStatus : 'Invited';

          return (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1B3A5C] bg-[#7FB3D5]/20 px-2.5 py-0.5 rounded">
                    {evt.category}
                  </span>
                  <StatusBadge status={currentRSVP} size="sm" />
                </div>

                <h4 className="text-xl font-bold text-slate-900 leading-snug">
                  {evt.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {evt.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#D4A537]" />
                    <span>{formatDate(evt.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.venue || "Grand Convention Hall"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lead Organizer: {evt.organizer || "Meyadur Rahman"}</span>
                  </div>
                </div>
              </div>

              {/* RSVP Actions Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-3 shrink-0 min-w-[200px]">
                <span className="text-xs font-bold text-slate-700">
                  Will you attend?
                </span>

                <div className="flex items-center gap-2 w-full">
                  <Button
                    size="sm"
                    variant={currentRSVP === 'Accepted' ? 'primary' : 'outline'}
                    className="flex-1"
                    icon={Check}
                    onClick={() => {
                      if (guestEntry) {
                        updateGuestRSVP(guestEntry.id, 'Accepted');
                      }
                    }}
                  >
                    Accept
                  </Button>

                  <Button
                    size="sm"
                    variant={currentRSVP === 'Declined' ? 'danger' : 'outline'}
                    className="flex-1"
                    icon={X}
                    onClick={() => {
                      if (guestEntry) {
                        updateGuestRSVP(guestEntry.id, 'Declined');
                      }
                    }}
                  >
                    Decline
                  </Button>
                </div>

                <span className="text-[11px] text-slate-400 text-center">
                  Seat Status: <strong className="text-slate-700">{currentRSVP}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
