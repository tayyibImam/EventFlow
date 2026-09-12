import React, { useState } from 'react';
import { Building2, Plus, MapPin, Users, Check, Search, CalendarPlus } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import VenueCard from '../component/VenueCard';
import SearchBar from '../component/SearchBar';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';
import Modal from '../component/Modal';

export default function Venues() {
  const { venues, events, assignVenueToEvent } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedBookingStatus, setSelectedBookingStatus] = useState('All');

  const [selectedVenueForAssign, setSelectedVenueForAssign] = useState(null);
  const [targetEventId, setTargetEventId] = useState('');
  const [detailsModalVenue, setDetailsModalVenue] = useState(null);

  const availabilityOptions = ['All', 'Available', 'Booked'];
  const bookingStatusOptions = ['All', 'Available', 'Selected', 'Confirmed', 'Cancelled'];

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
  };

  const handleConfirmAssign = (e) => {
    e.preventDefault();
    if (selectedVenueForAssign && targetEventId) {
      assignVenueToEvent(selectedVenueForAssign.id, targetEventId);
      setSelectedVenueForAssign(null);
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
                  {evt.title} ({evt.startDate}) — Currently: {evt.venue || "None"}
                </option>
              ))}
            </select>
          </div>

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
            >
              Confirm Assignment
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
