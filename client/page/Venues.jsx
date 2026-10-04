import React, { useState, useMemo, useEffect } from 'react';
import { Building2, Plus, MapPin, Users, Check, Search, CalendarPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import VenueCard from '../component/VenueCard';
import SearchBar from '../component/SearchBar';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';
import Modal from '../component/Modal';

// Inclusive calendar-day span of an event — mirrors the server's pricing
// calc (server/src/controllers/bookings.controller.js) for display only;
// the server recomputes and charges authoritatively.
function dayCount(startDate, endDate) {
  const start = new Date(String(startDate).split('T')[0]);
  const end = new Date(String(endDate || startDate).split('T')[0]);
  const days = Math.floor((end - start) / 86400000) + 1;
  return Math.max(1, days);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Venues() {
  const { venues: rawVenues, events, checkVenueAvailability, initiateVenueBooking } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedBookingStatus, setSelectedBookingStatus] = useState('All');

  const [selectedVenueForAssign, setSelectedVenueForAssign] = useState(null);
  const [targetEventId, setTargetEventId] = useState('');
  const [detailsModalVenue, setDetailsModalVenue] = useState(null);

  const [availability, setAvailability] = useState(null); // { available, conflict } | null
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [startingPayment, setStartingPayment] = useState(false);

  const availabilityOptions = ['All', 'Available', 'Booked'];
  const bookingStatusOptions = ['All', 'Available', 'Confirmed'];

  // A venue's booking status is derived live from events.venue_id, not a
  // separately-mutated field on the venue — so it can never drift out of
  // sync with what's actually assigned in the database.
  const venues = useMemo(() => {
    return rawVenues.map((v) => {
      const assignedEvent = events.find((e) => e.venueId === v.id && e.status !== 'Cancelled');
      return {
        ...v,
        bookingStatus: assignedEvent ? 'Confirmed' : 'Available',
        availability: assignedEvent ? 'Booked' : 'Available',
        assignedEventId: assignedEvent?.id,
        assignedEventTitle: assignedEvent?.title
      };
    });
  }, [rawVenues, events]);

  const filteredVenues = venues.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = selectedAvailability === 'All' || v.availability === selectedAvailability;
    const matchesStatus = selectedBookingStatus === 'All' || v.bookingStatus === selectedBookingStatus;
    return matchesSearch && matchesAvailability && matchesStatus;
  });

  const handleOpenAssign = (venue) => {
    setSelectedVenueForAssign(venue);
    setTargetEventId(events[0]?.id || '');
    setAvailability(null);
    setBookingError('');
  };

  // Live-checks the venue against the picked event's dates every time either
  // changes, so the conflict message and deposit total stay accurate before
  // the organizer commits to paying.
  useEffect(() => {
    if (!selectedVenueForAssign || !targetEventId) {
      setAvailability(null);
      return;
    }
    const targetEvt = events.find((e) => e.id === targetEventId);
    if (targetEvt?.venueId === selectedVenueForAssign.id) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    setCheckingAvailability(true);
    setBookingError('');
    checkVenueAvailability(selectedVenueForAssign.id, targetEventId)
      .then((result) => { if (!cancelled) setAvailability(result); })
      .catch((err) => { if (!cancelled) setBookingError(err.message); })
      .finally(() => { if (!cancelled) setCheckingAvailability(false); });
    return () => { cancelled = true; };
  }, [selectedVenueForAssign, targetEventId]);

  const targetEvent = events.find((e) => e.id === targetEventId);
  const isSameVenue = !!(selectedVenueForAssign && targetEvent && targetEvent.venueId === selectedVenueForAssign.id);
  const totalPrice = selectedVenueForAssign && targetEvent
    ? Number(selectedVenueForAssign.pricePerDay) * dayCount(targetEvent.startDate, targetEvent.endDate)
    : 0;
  const depositAmount = Math.round(totalPrice * 0.10 * 100) / 100;

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!selectedVenueForAssign || !targetEventId || isSameVenue || availability?.available === false) return;

    setBookingError('');
    setStartingPayment(true);
    try {
      const { GatewayPageURL } = await initiateVenueBooking(selectedVenueForAssign.id, targetEventId);
      window.location.href = GatewayPageURL;
    } catch (err) {
      setBookingError(err.message || 'Could not start the payment session.');
      setStartingPayment(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            Venues Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Convention halls, auditoriums, and banquet centers with facility specifications &amp; booking reference rates
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by venue name or location..."
            id="venues-search-bar"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <FilterDropdown
            label="Availability"
            value={selectedAvailability}
            onChange={setSelectedAvailability}
            options={availabilityOptions}
            id="filter-venue-avail"
          />

          <FilterDropdown
            label="Status"
            value={selectedBookingStatus}
            onChange={setSelectedBookingStatus}
            options={bookingStatusOptions}
            id="filter-venue-status"
          />
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVenues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            onAssign={handleOpenAssign}
            onViewDetails={(v) => setDetailsModalVenue(v)}
          />
        ))}
      </div>

      {/* Assign Venue Modal */}
      <Modal
        isOpen={!!selectedVenueForAssign}
        onClose={() => setSelectedVenueForAssign(null)}
        title="Assign Venue to Event"
        subtitle={selectedVenueForAssign ? `Assign "${selectedVenueForAssign.name}"` : ""}
      >
        <form onSubmit={handleConfirmAssign} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <p className="font-bold text-slate-800 text-sm mb-1">{selectedVenueForAssign?.name}</p>
            <p>{selectedVenueForAssign?.location} &bull; Capacity: {selectedVenueForAssign?.capacity} guests</p>
            <p className="font-semibold text-[#1B3A5C] mt-1">Planning Rate: {selectedVenueForAssign?.planningPrice} (Informational only)</p>
          </div>

          {events.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
              You don't have any events yet — create one first, then come back to assign a venue.
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
                Select Target Event:
              </label>
              <select
                id="select-target-event-for-venue"
                value={targetEventId}
                onChange={(e) => setTargetEventId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#1B3A5C] focus:outline-none"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({formatDate(evt.startDate)}) — Currently: {evt.venue || "None"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isSameVenue && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>"{selectedVenueForAssign?.name}" is already the confirmed venue for this event. Pick a different venue or event.</span>
            </div>
          )}

          {!isSameVenue && checkingAvailability && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Checking availability for these dates...
            </div>
          )}

          {!isSameVenue && !checkingAvailability && availability?.available === false && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Already booked by "{availability.conflict.eventTitle}" ({availability.conflict.startDate} to {availability.conflict.endDate}). Pick a different venue or event.
              </span>
            </div>
          )}

          {!isSameVenue && !checkingAvailability && availability?.available && (
            <div className="p-3 bg-sky-50 border border-sky-200/70 rounded-xl text-xs text-[#1B3A5C] space-y-1">
              <div className="flex justify-between"><span>Total venue price</span><strong>৳{totalPrice.toLocaleString()}</strong></div>
              <div className="flex justify-between font-bold"><span>Confirmation deposit due now (10%)</span><strong>৳{depositAmount.toLocaleString()}</strong></div>
              <p className="text-[11px] text-slate-500 pt-1">
                You'll be redirected to SSLCommerz to pay the deposit. The venue is only locked in once payment clears.
                The remaining 90% appears on your Payments tab after the event ends, and is due within 3 days.
              </p>
            </div>
          )}

          {bookingError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
              {bookingError}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedVenueForAssign(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={CalendarPlus}
              disabled={events.length === 0 || isSameVenue || checkingAvailability || availability?.available === false || startingPayment}
            >
              {startingPayment ? 'Redirecting to payment...' : 'Pay Deposit & Confirm'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!detailsModalVenue}
        onClose={() => setDetailsModalVenue(null)}
        title={detailsModalVenue?.name || "Venue Details"}
        subtitle={detailsModalVenue?.location}
      >
        {detailsModalVenue && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="h-44 rounded-xl overflow-hidden bg-slate-100">
              <img
                src={detailsModalVenue.image}
                alt={detailsModalVenue.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Capacity</span>
                <span className="font-bold text-slate-800 text-sm">{detailsModalVenue.capacity} guests</span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Planning Rate</span>
                <span className="font-bold text-[#1B3A5C] text-sm">{detailsModalVenue.planningPrice}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">Installed Facilities &amp; Equipment:</span>
              <div className="grid grid-cols-2 gap-2">
                {detailsModalVenue.facilities.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 p-2 rounded-lg">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200/60">
              <span className="text-xs font-bold text-[#1B3A5C] block">Management Contact:</span>
              <p className="text-xs text-slate-700 mt-0.5">{detailsModalVenue.contactPerson} &bull; {detailsModalVenue.phone}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const target = detailsModalVenue;
                  setDetailsModalVenue(null);
                  handleOpenAssign(target);
                }}
              >
                Assign to an Event
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
