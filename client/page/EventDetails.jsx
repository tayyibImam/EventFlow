import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  CheckSquare,
  Clock,
  MessageSquare,
  Store,
  Building,
  TrendingUp,
  Tag,
  Plus,
  ArrowLeft,
  Share2,
  Edit,
  Sparkles,
  Layers,
  ChevronRight,
  Send,
  Star,
  Link2,
  Check
} from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import StatusBadge from '../component/StatusBadge';
import Button from '../component/Button';
import Modal from '../component/Modal';
import FormInput from '../component/FormInput';
import GuestTable from '../component/GuestTable';
import TaskCard from '../component/TaskCard';
import ScheduleTimeline from '../component/ScheduleTimeline';
import FeedbackCard from '../component/FeedbackCard';
import VendorCard from '../component/VendorCard';
import VenueCard from '../component/VenueCard';

export default function EventDetails() {
  const { id } = useParams();
  const {
    events,
    venues,
    vendors,
    guests,
    tasks,
    schedule,
    feedback,
    eventVendorBookings,
    staffDirectory,
    addGuest,
    updateGuestRSVP,
    addTask,
    updateTaskStatus,
    deleteTask,
    addScheduleItem,
    deleteScheduleItem,
    hireVendorForEvent,
    updateVendorEventBooking,
    removeVendorFromEvent,
    assignVenueToEvent,
    getEventProgress
  } = useEventFlow();

  // Find targeted event or fallback to the first one
  const event = events.find(e => String(e.id) === String(id)) || events[0];

  const [activeTab, setActiveTab] = useState('Overview');

  // Modals state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isHireVendorModalOpen, setIsHireVendorModalOpen] = useState(false);
  const [hireVendorForm, setHireVendorForm] = useState({ vendorId: '', agreedPrice: '', status: 'Pending' });
  const [hireVendorError, setHireVendorError] = useState('');
  const [hiringVendor, setHiringVendor] = useState(false);
  const [inviteLinkResult, setInviteLinkResult] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Forms state
  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    organization: '',
    role: 'Delegate',
    invitationStatus: 'Sent',
    rsvpStatus: 'Accepted'
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedToId: '',
    dueDate: '',
    priority: 'High',
    status: 'Pending'
  });

  const [scheduleForm, setScheduleForm] = useState({
    activity: '',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Main Hall',
    notes: ''
  });

  if (!event) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <h3 className="text-lg font-bold text-slate-800">Event Not Found</h3>
        <Link to="/events" className="mt-4 inline-block text-xs font-semibold text-[#1B3A5C]">
          &larr; Return to Events Catalog
        </Link>
      </div>
    );
  }

  // Filter linked data for this event
  const eventGuests = guests.filter(g => !g.eventId || g.eventId === event.id);
  const eventTasks = tasks.filter(t => !t.eventId || t.eventId === event.id);
  const eventSchedule = schedule.filter(s => !s.eventId || s.eventId === event.id);
  const eventFeedback = feedback.filter(f => !f.eventId || f.eventId === event.id);

  // Only vendors actually hired (event_vendors) for this specific event —
  // joined against the directory for name/contact/category.
  const eventBookings = eventVendorBookings.filter(b => b.eventId === event.id);
  const eventVendors = eventBookings.map(b => {
    const vendor = vendors.find(v => v.id === b.vendorId) || {};
    return {
      ...vendor,
      id: b.vendorId,
      agreedPrice: `$${Number(b.agreedPrice).toLocaleString()}`,
      priceLabel: '(Agreed)',
      bookingStatus: b.status
    };
  });
  const hireableVendors = vendors.filter(v => !eventBookings.some(b => b.vendorId === v.id));

  const currentVenue = venues.find(v => v.id === event.venueId || v.name === event.venue) || venues[0];
  const progress = getEventProgress(event.id);

  // Guest stats
  const totalGuests = eventGuests.length;
  const acceptedGuests = eventGuests.filter(g => g.rsvpStatus === 'Accepted').length;
  const declinedGuests = eventGuests.filter(g => g.rsvpStatus === 'Declined').length;
  const noResponseGuests = eventGuests.filter(g => g.rsvpStatus === 'No Response' || g.rsvpStatus === 'Invited').length;

  const tabs = [
    { id: 'Overview', label: 'Overview', icon: Layers },
    { id: 'Venue', label: 'Venue', icon: Building },
    { id: 'Vendors', label: 'Vendors', icon: Store },
    { id: 'Guests', label: `Guests (${eventGuests.length})`, icon: Users },
    { id: 'Tasks', label: `Tasks (${eventTasks.length})`, icon: CheckSquare },
    { id: 'Schedule', label: 'Schedule', icon: Clock },
    { id: 'Feedback', label: `Feedback (${eventFeedback.length})`, icon: MessageSquare }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAddGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestForm.name || !guestForm.email) return;
    const created = await addGuest({
      ...guestForm,
      eventId: event.id
    });
    if (created?.rsvpLink) {
      setLinkCopied(false);
      setInviteLinkResult(created);
    }
    setGuestForm({
      name: '',
      email: '',
      phone: '',
      description: '',
      organization: '',
      role: 'Delegate',
      invitationStatus: 'Sent',
      rsvpStatus: 'Accepted'
    });
    setIsGuestModalOpen(false);
  };

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.title) return;
    addTask({
      ...taskForm,
      eventId: event.id,
      eventTitle: event.title
    });
    setTaskForm({
      title: '',
      description: '',
      assignedToId: '',
      dueDate: '',
      priority: 'High',
      status: 'Pending'
    });
    setIsTaskModalOpen(false);
  };

  const handleAddScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleForm.activity) return;
    addScheduleItem({
      ...scheduleForm,
      eventId: event.id
    });
    setScheduleForm({
      activity: '',
      startTime: '09:00',
      endTime: '10:00',
      location: 'Main Stage Auditorium',
      notes: ''
    });
    setIsScheduleModalOpen(false);
  };

  const openHireVendorModal = () => {
    setHireVendorForm({ vendorId: hireableVendors[0]?.id || '', agreedPrice: '', status: 'Pending' });
    setHireVendorError('');
    setIsHireVendorModalOpen(true);
  };

  const handleHireVendorSubmit = async (e) => {
    e.preventDefault();
    setHireVendorError('');

    if (!hireVendorForm.vendorId) {
      setHireVendorError('Select a vendor to hire.');
      return;
    }

    setHiringVendor(true);
    try {
      await hireVendorForEvent(event.id, Number(hireVendorForm.vendorId), hireVendorForm.agreedPrice, hireVendorForm.status);
      setIsHireVendorModalOpen(false);
    } catch (err) {
      setHireVendorError(err.message || 'Could not hire this vendor. Please try again.');
    } finally {
      setHiringVendor(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/events" className="hover:text-[#1B3A5C] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> My Events
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">{event.title}</span>
      </div>

      {/* Main Event Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center text-xs font-bold text-[#1B3A5C] bg-[#7FB3D5]/20 px-3 py-1 rounded-md">
                <Tag className="w-3 h-3 mr-1.5" />
                {event.category}
              </span>
              <StatusBadge status={event.status} />
              <span className="text-xs text-slate-400 font-medium">
                Lead Organizer: <strong>{event.organizer || "Meyadur Rahman"}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3A5C] tracking-tight">
              {event.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {event.description}
            </p>

            {/* Event Meta Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-[#D4A537]" />
                <span>
                  {formatDate(event.startDate)}
                  {event.endDate && event.endDate !== event.startDate && ` — ${formatDate(event.endDate)}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{event.venue || "Grand Convention Hall"}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{event.expectedGuests} Expected Guests</span>
              </div>
            </div>
          </div>

          {/* Quick Progress Dial / Overall Readiness */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center shrink-0 min-w-[200px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Planning Readiness
            </span>
            <div className="text-3xl font-black text-[#1B3A5C] mt-1">
              {progress.overall}%
            </div>
            <div className="w-32 bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-[#D4A537] h-2 rounded-full"
                style={{ width: `${progress.overall}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-2">
              Budget Ref: {event.budget || "$45,000"}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-t border-slate-100 bg-[#F9FAFB] flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id.toLowerCase()}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#1B3A5C] text-[#1B3A5C] bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1B3A5C]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'Overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Concept Highlight Banner: ONE EVENT -> EVERYTHING CONNECTED */}
          <div className="bg-[#1B3A5C] text-white rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4A537] bg-white/10 px-2.5 py-0.5 rounded-full">
                  Core SaaS Concept
                </span>
                <h3 className="text-lg font-extrabold text-white mt-2">
                  One Event &rarr; Everything Connected
                </h3>
                <p className="text-xs text-slate-200 mt-1 max-w-2xl">
                  Changes to guests automatically synchronize with catering rosters. Task assignments notify staff coordinators. Schedule updates reflect live on speaker badges.
                </p>
              </div>

              {/* Connected Visual Pipeline */}
              <div className="flex flex-wrap items-center gap-1 text-[11px] font-semibold bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <span className="text-[#7FB3D5]">Venue</span> &bull;
                <span className="text-[#D4A537]">Vendors</span> &bull;
                <span>Guests</span> &bull;
                <span>Tasks</span> &bull;
                <span>Staff</span> &bull;
                <span className="text-emerald-400">Schedule</span> &bull;
                <span>Feedback</span>
              </div>
            </div>
          </div>

          {/* Planning Milestone Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4">
              Planning Track Progress for {event.title}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { name: "Venue", val: progress.venue, label: progress.venue === 100 ? "Assigned" : "Not assigned", icon: Building },
                { name: "Vendors", val: progress.vendors, label: `${progress.vendors}% Confirmed`, icon: Store },
                { name: "Guests", val: progress.guests, label: `${progress.guests}% Confirmed`, icon: Users },
                { name: "Tasks", val: progress.tasks, label: `${progress.tasks}% Done`, icon: CheckSquare },
                { name: "Schedule", val: progress.schedule, label: progress.schedule === 100 ? "Published" : "Not published", icon: Clock }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{item.name}</span>
                      <Icon className="w-4 h-4 text-[#1B3A5C]" />
                    </div>
                    <div className="mt-3">
                      <div className="flex items-baseline justify-between text-xs mb-1">
                        <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
                        <span className="font-bold text-[#1B3A5C]">{item.val}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#1B3A5C] h-1.5 rounded-full"
                          style={{ width: `${item.val}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Split: Next Tasks & Upcoming Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Key Tasks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#1B3A5C] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#1B3A5C]" />
                  Active Event Tasks ({eventTasks.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('Tasks')}
                  className="text-xs font-semibold text-[#1B3A5C] hover:text-[#D4A537]"
                >
                  Manage All &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {eventTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{t.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Assigned: {t.assignedTo} &bull; Due: {formatDate(t.dueDate)}
                      </p>
                    </div>
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Key Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#1B3A5C] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1B3A5C]" />
                  Event Timeline ({eventSchedule.length} blocks)
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('Schedule')}
                  className="text-xs font-semibold text-[#1B3A5C] hover:text-[#D4A537]"
                >
                  Full Timeline &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {eventSchedule.slice(0, 3).map((s) => (
                  <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#1B3A5C] bg-[#7FB3D5]/20 px-2 py-0.5 rounded text-[11px]">
                        {s.startTime}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{s.activity}</p>
                        <p className="text-[11px] text-slate-400">{s.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Venue */}
      {activeTab === 'Venue' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1B3A5C]">
                Venue Allocation for {event.title}
              </h3>
              <p className="text-xs text-slate-500">
                Current assigned facility, floor specs, audio rigging, and hall capacity
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVenueModalOpen(true)}
            >
              Change / Reassign Venue
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VenueCard
              venue={currentVenue}
              onAssign={() => setIsVenueModalOpen(true)}
              onViewDetails={() => alert(`Venue specifications: Capacity ${currentVenue.capacity} guests. Contact: ${currentVenue.contactPerson}`)}
            />

            {/* Venue Floor Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-[#1B3A5C] mb-3">
                  Facility Logistics &amp; Rigging Specs
                </h4>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-800 block">Stage Dimensions:</span>
                    <span>40ft Width &times; 20ft Depth &times; 4ft Clearance with dual access ramps.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-800 block">Electrical &amp; Backup Power:</span>
                    <span>3-Phase 100kVA automatic transfer generator for zero-downtime projection.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-800 block">Dedicated On-Site Manager:</span>
                    <span>{currentVenue.contactPerson} ({currentVenue.phone})</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Booking Status:</span>
                <StatusBadge status={currentVenue.bookingStatus} size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Vendors */}
      {activeTab === 'Vendors' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#1B3A5C]">
                Contracted Event Vendors ({eventVendors.length})
              </h3>
              <p className="text-xs text-slate-500">
                Catering, Decoration, Photography, Videography, Sound &amp; Lighting, and Security
              </p>
            </div>
            <Button
              id="btn-hire-vendor-modal"
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={openHireVendorModal}
              disabled={hireableVendors.length === 0}
            >
              Hire Vendor
            </Button>
          </div>

          {eventVendors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-sm font-semibold text-slate-600">No vendors hired yet</p>
              <p className="text-xs text-slate-400 mt-1">Hire a vendor from the directory for this event.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventVendors.map((vnd) => (
                <VendorCard
                  key={vnd.id}
                  vendor={vnd}
                  onStatusChange={(vendorId, status) => updateVendorEventBooking(event.id, vendorId, status)}
                  onRemove={(vendorId) => removeVendorFromEvent(event.id, vendorId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Guests */}
      {activeTab === 'Guests' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Guest Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Guests</span>
              <p className="text-2xl font-bold text-[#1B3A5C] mt-1">{totalGuests}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase">Accepted</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{acceptedGuests}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-rose-600 uppercase">Declined</span>
              <p className="text-2xl font-bold text-rose-700 mt-1">{declinedGuests}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-600 uppercase">No Response</span>
              <p className="text-2xl font-bold text-amber-700 mt-1">{noResponseGuests}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1B3A5C]">
              Guest List &amp; RSVP Responses
            </h3>
            <Button
              id="btn-add-guest-modal"
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setIsGuestModalOpen(true)}
            >
              Add Guest
            </Button>
          </div>

          <GuestTable
            guests={eventGuests}
            onRSVPChange={updateGuestRSVP}
          />
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'Tasks' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1B3A5C]">
                Operational Tasks for {event.title}
              </h3>
              <p className="text-xs text-slate-500">
                Staff delegations, due dates, priority tiers, and execution updates
              </p>
            </div>
            <Button
              id="btn-add-task-modal"
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setIsTaskModalOpen(true)}
            >
              Add Task
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onStatusChange={updateTaskStatus}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Schedule */}
      {activeTab === 'Schedule' && (
        <div className="space-y-6 animate-in fade-in max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1B3A5C]">
                Event Schedule Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Synchronized running order for speakers, stages, banquets, and workshops
              </p>
            </div>
            <Button
              id="btn-add-schedule-modal"
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Add Schedule Item
            </Button>
          </div>

          <ScheduleTimeline
            items={eventSchedule}
            onDeleteItem={deleteScheduleItem}
          />
        </div>
      )}

      {/* Tab: Feedback */}
      {activeTab === 'Feedback' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1B3A5C]">
                Guest Reviews &amp; Post-Event Ratings
              </h3>
              <p className="text-xs text-slate-500">
                Real-time feedback submitted by verified delegates
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventFeedback.map((fb) => (
              <FeedbackCard key={fb.id} feedback={fb} />
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Guest */}
      <Modal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title="Add New Guest"
        subtitle={`Register delegate for ${event.title}`}
      >
        <form onSubmit={handleAddGuestSubmit} className="space-y-4">
          <FormInput
            label="Guest Full Name"
            value={guestForm.name}
            onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
            placeholder="e.g. Mahfuzur Rahman"
            required
          />
          <FormInput
            label="Email Address"
            type="email"
            value={guestForm.email}
            onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
            placeholder="e.g. mahfuz.rahman@fintechgroup.com"
            required
          />
          <FormInput
            label="Phone Number"
            value={guestForm.phone}
            onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
            placeholder="e.g. +880 1715-500600"
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Organization"
              value={guestForm.organization}
              onChange={(e) => setGuestForm({ ...guestForm, organization: e.target.value })}
              placeholder="e.g. FinTech Capital"
            />
            <FormInput
              label="Role / Title"
              value={guestForm.role}
              onChange={(e) => setGuestForm({ ...guestForm, role: e.target.value })}
              placeholder="e.g. Panelist, Delegate"
            />
          </div>
          <FormInput
            label="Description"
            type="textarea"
            value={guestForm.description}
            onChange={(e) => setGuestForm({ ...guestForm, description: e.target.value })}
            placeholder="Dietary requirements, accessibility notes, VIP handling instructions..."
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="RSVP Status"
              type="select"
              value={guestForm.rsvpStatus}
              onChange={(e) => setGuestForm({ ...guestForm, rsvpStatus: e.target.value })}
              options={["Accepted", "Invited", "Declined", "No Response"]}
            />
            <FormInput
              label="Invitation Status"
              type="select"
              value={guestForm.invitationStatus}
              onChange={(e) => setGuestForm({ ...guestForm, invitationStatus: e.target.value })}
              options={["Sent", "Queued", "Pending"]}
            />
          </div>
          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsGuestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Guest
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Task */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create Operational Task"
        subtitle={`Assign staff duty for ${event.title}`}
      >
        <form onSubmit={handleAddTaskSubmit} className="space-y-4">
          <FormInput
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="e.g. Test wireless audio microphones in Hall B"
            required
          />
          <FormInput
            label="Description"
            type="textarea"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="Provide operational guidelines, contact vendors, and delivery targets..."
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Assigned Staff"
              type="select"
              value={taskForm.assignedToId}
              onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
              options={[
                { value: '', label: 'Unassigned' },
                ...staffDirectory.map(s => ({ value: s.id, label: s.name }))
              ]}
            />
            <FormInput
              label="Due Date"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Priority"
              type="select"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              options={["High", "Medium", "Low"]}
            />
            <FormInput
              label="Status"
              type="select"
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              options={["Pending", "In Progress", "Done"]}
            />
          </div>
          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Assign Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Schedule Item */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Add Schedule Item"
        subtitle={`Update timeline for ${event.title}`}
      >
        <form onSubmit={handleAddScheduleSubmit} className="space-y-4">
          <FormInput
            label="Activity Title"
            value={scheduleForm.activity}
            onChange={(e) => setScheduleForm({ ...scheduleForm, activity: e.target.value })}
            placeholder="e.g. Keynote Speech: Autonomous Tech"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Start Time"
              type="time"
              value={scheduleForm.startTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
              required
            />
            <FormInput
              label="End Time"
              type="time"
              value={scheduleForm.endTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
            />
          </div>
          <FormInput
            label="Location / Room"
            value={scheduleForm.location}
            onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
            placeholder="e.g. Main Stage Auditorium"
          />
          <FormInput
            label="Operational Notes"
            type="textarea"
            value={scheduleForm.notes}
            onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
            placeholder="Speaker intro, mic requirements, video playback cue..."
          />
          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Change Venue */}
      <Modal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        title="Assign Venue"
        subtitle={`Select a convention center for ${event.title}`}
      >
        <div className="space-y-3">
          {venues.map((v) => (
            <div
              key={v.id}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-[#1B3A5C] bg-white transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-slate-800 text-sm">{v.name}</p>
                <p className="text-xs text-slate-500">{v.location} &bull; Capacity: {v.capacity} guests</p>
                <span className="text-[11px] font-semibold text-[#1B3A5C]">{v.planningPrice}</span>
              </div>
              <Button
                size="sm"
                variant={v.name === event.venue ? "outline" : "primary"}
                onClick={() => {
                  assignVenueToEvent(v.id, event.id);
                  setIsVenueModalOpen(false);
                }}
              >
                {v.name === event.venue ? "Current Venue" : "Select Venue"}
              </Button>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal: Hire Vendor */}
      <Modal
        isOpen={isHireVendorModalOpen}
        onClose={() => setIsHireVendorModalOpen(false)}
        title="Hire Vendor"
        subtitle={`Book a vendor from the directory for ${event.title}`}
      >
        <form onSubmit={handleHireVendorSubmit} className="space-y-4">
          {hireVendorError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {hireVendorError}
            </div>
          )}

          {hireableVendors.length === 0 ? (
            <p className="text-xs text-slate-500">Every vendor in the directory is already hired for this event.</p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
                  Vendor:
                </label>
                <select
                  value={hireVendorForm.vendorId}
                  onChange={(e) => setHireVendorForm({ ...hireVendorForm, vendorId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#1B3A5C] focus:outline-none"
                >
                  {hireableVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              <FormInput
                label="Agreed Price (USD)"
                type="number"
                value={hireVendorForm.agreedPrice}
                onChange={(e) => setHireVendorForm({ ...hireVendorForm, agreedPrice: e.target.value })}
                placeholder="e.g. 12500"
                required
              />

              <FormInput
                label="Initial Status"
                type="select"
                value={hireVendorForm.status}
                onChange={(e) => setHireVendorForm({ ...hireVendorForm, status: e.target.value })}
                options={['Pending', 'Confirmed']}
              />
            </>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsHireVendorModalOpen(false)} disabled={hiringVendor}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={hiringVendor || hireableVendors.length === 0}>
              {hiringVendor ? 'Hiring...' : 'Hire Vendor'}
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
                An invitation email was sent to <strong className="text-slate-900">{inviteLinkResult.email}</strong> for {event.title}. You can also share this link directly:
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