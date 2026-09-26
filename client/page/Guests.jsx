import React, { useState } from 'react';
import { Users, UserCheck, UserX, Clock, Plus, Search, Mail, Send, Link2, Check } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import GuestTable from '../component/GuestTable';
import SearchBar from '../component/SearchBar';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';
import Modal from '../component/Modal';
import FormInput from '../component/FormInput';
import DashboardCard from '../component/DashboardCard';

export default function Guests() {
  const { guests, events, addGuest, updateGuestRSVP } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRSVP, setSelectedRSVP] = useState('All');
  const [selectedEventFilter, setSelectedEventFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inviteLinkResult, setInviteLinkResult] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    organization: '',
    role: 'Delegate',
    eventId: events[0]?.id || '',
    invitationStatus: 'Sent',
    rsvpStatus: 'Accepted'
  });

  const rsvpFilterOptions = ['All', 'Accepted', 'Declined', 'No Response', 'Invited'];
  const eventFilterOptions = [
    { value: 'All', label: 'All Events' },
    ...events.map(e => ({ value: e.id, label: e.title }))
  ];

  const filteredGuests = guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.organization && g.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRSVP = selectedRSVP === 'All' || g.rsvpStatus === selectedRSVP;
    // Real event ids are numbers, but a <select>'s onChange always yields a
    // string — compare as strings so this keeps matching either way.
    const matchesEvent = selectedEventFilter === 'All' || String(g.eventId) === String(selectedEventFilter);

    return matchesSearch && matchesRSVP && matchesEvent;
  });

  // Summary counts
  const totalGuests = guests.length;
  const acceptedGuests = guests.filter(g => g.rsvpStatus === 'Accepted').length;
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'Declined').length;
  const noResponseGuests = guests.filter(g => g.rsvpStatus === 'No Response' || g.rsvpStatus === 'Invited').length;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    const created = await addGuest(form);
    if (created?.rsvpLink) {
      setLinkCopied(false);
      setInviteLinkResult(created);
    }
    setForm({
      name: '',
      email: '',
      phone: '',
      description: '',
      organization: '',
      role: 'Delegate',
      eventId: events[0]?.id || '',
      invitationStatus: 'Sent',
      rsvpStatus: 'Accepted'
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            Guest &amp; Delegate Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track invitation mailings, confirm seat RSVPs, and manage VIP attendance rosters
          </p>
        </div>

        <Button
          id="btn-open-add-guest"
          variant="gold"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Guest
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          id="card-total-guests"
          title="Total Guests"
          value={totalGuests.toString()}
          subtitle="Registered across roster"
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-[#1B3A5C]"
        />
        <DashboardCard
          id="card-accepted-guests"
          title="Accepted"
          value={acceptedGuests.toString()}
          subtitle={`${Math.round((acceptedGuests / (totalGuests || 1)) * 100)}% confirmation rate`}
          icon={UserCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          badge="Confirmed"
          badgeType="positive"
        />
        <DashboardCard
          id="card-declined-guests"
          title="Declined"
          value={declinedGuests.toString()}
          subtitle="Unable to attend"
          icon={UserX}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
        <DashboardCard
          id="card-no-response-guests"
          title="No Response"
          value={noResponseGuests.toString()}
          subtitle="Pending follow-up"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-800"
          badge="Action Needed"
          badgeType="gold"
        />
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, company..."
            id="guests-search-bar"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <FilterDropdown
            label="RSVP Status"
            value={selectedRSVP}
            onChange={setSelectedRSVP}
            options={rsvpFilterOptions}
            id="filter-guest-rsvp"
          />

          <FilterDropdown
            label="Event"
            value={selectedEventFilter}
            onChange={setSelectedEventFilter}
            options={eventFilterOptions}
            id="filter-guest-event"
          />
        </div>
      </div>

      {/* Guest Table */}
      <GuestTable
        guests={filteredGuests}
        onRSVPChange={updateGuestRSVP}
      />

      {/* Add Guest Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Delegate / Guest"
        subtitle="Enter guest contact details and invitation parameters"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Kazi Nazrul"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. kazi.nazrul@poetryarts.org"
              required
            />
            <FormInput
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. +880 1828-890990"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Organization"
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              placeholder="e.g. Dhaka Arts Council"
            />
            <FormInput
              label="Role / Badge Title"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. VIP Guest, Speaker"
            />
          </div>

          <FormInput
            label="Description"
            type="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Dietary requirements, accessibility notes, VIP handling instructions..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
              Associated Event:
            </label>
            <select
              value={form.eventId}
              onChange={(e) => setForm({ ...form, eventId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#1B3A5C] focus:outline-none"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.startDate})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="RSVP Status"
              type="select"
              value={form.rsvpStatus}
              onChange={(e) => setForm({ ...form, rsvpStatus: e.target.value })}
              options={["Accepted", "Invited", "Declined", "No Response"]}
            />
            <FormInput
              label="Invitation Status"
              type="select"
              value={form.invitationStatus}
              onChange={(e) => setForm({ ...form, invitationStatus: e.target.value })}
              options={["Sent", "Queued", "Draft"]}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save Guest
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite Link — shown alongside the emailed invite as a manual fallback */}
      <Modal
        isOpen={!!inviteLinkResult}
        onClose={() => setInviteLinkResult(null)}
        title="Guest Added"
        subtitle={inviteLinkResult?.emailSent ? 'Invitation emailed to the guest' : 'Could not send the invite email automatically'}
      >
        {inviteLinkResult && (
          <div className="space-y-4">
            {inviteLinkResult.emailSent ? (
              <p className="text-sm text-slate-600">
                An invitation email was sent to <strong className="text-slate-900">{inviteLinkResult.email}</strong>. You can also share this link directly:
              </p>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                Could not email <strong>{inviteLinkResult.name}</strong> automatically — share this link with them directly instead.
              </div>
            )}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-700 truncate flex-1">{inviteLinkResult.rsvpLink}</span>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setInviteLinkResult(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={linkCopied ? Check : Link2}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(inviteLinkResult.rsvpLink);
                    setLinkCopied(true);
                  } catch (err) {
                    console.error('Could not copy invite link:', err);
                  }
                }}
              >
                {linkCopied ? 'Copied' : 'Copy Link'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
