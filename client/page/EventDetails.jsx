import React, { useState, useEffect } from 'react';
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
  Check,
  Loader2,
  Ban,
  Hourglass
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

// Inclusive calendar-day span of an event — mirrors the server's pricing
// calc (server/src/controllers/bookings.controller.js) for display only;
// the server recomputes and charges authoritatively.
function dayCount(startDate, endDate) {
  const start = new Date(String(startDate).split('T')[0]);
  const end = new Date(String(endDate || startDate).split('T')[0]);
  const days = Math.floor((end - start) / 86400000) + 1;
  return Math.max(1, days);
}

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
    initiateVendorBooking,
    updateVendorEventBooking,
    removeVendorFromEvent,
    checkVenueAvailability,
    initiateVenueBooking,
    getEventProgress,
    cancellationRequests,
    requestEventCancellation,
    authToken,
    realUser
  } = useEventFlow();

  // Find targeted event or fallback to the first one
  const event = events.find(e => String(e.id) === String(id)) || events[0];

  const [activeTab, setActiveTab] = useState('Overview');

  // Modals state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [venuePendingConfirm, setVenuePendingConfirm] = useState(null);
  const [venueAvailability, setVenueAvailability] = useState(null); // { available, conflict } | null
  const [checkingVenueAvailability, setCheckingVenueAvailability] = useState(false);
  const [venueBookingError, setVenueBookingError] = useState('');
  const [startingVenuePayment, setStartingVenuePayment] = useState(false);
  const [pickerAvailability, setPickerAvailability] = useState({}); // venueId -> { available, conflict }
  const [checkingPickerAvailability, setCheckingPickerAvailability] = useState(false);
  const [isHireVendorModalOpen, setIsHireVendorModalOpen] = useState(false);
  const [hireVendorForm, setHireVendorForm] = useState({ vendorId: '' });
  const [hireVendorError, setHireVendorError] = useState('');
  const [hiringVendor, setHiringVendor] = useState(false);
  const [inviteLinkResult, setInviteLinkResult] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Forms state
  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    organization: '',
    role: 'Delegate',
    invitationStatus: 'Sent',
    rsvpStatus: 'Accepted',
    guestType: 'Normal'
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

  // The picker only ever shows venues actually open for this event's exact
  // dates — checked against every venue in the catalog up front, rather
  // than letting the organizer pick a venue and find out it's booked only
  // after clicking it (the conflict re-check in handleSelectVenue stays as
  // a safety net against another booking landing between this check and
  // the pay step). Guarded on `event` because this hook must run on every
  // render (including the one before the event has loaded on a hard
  // refresh) — it can't sit below the `if (!event) return` below it.
  useEffect(() => {
    if (!event || !isVenueModalOpen || venuePendingConfirm) return;
    let cancelled = false;
    setCheckingPickerAvailability(true);
    Promise.all(
      venues.map((v) =>
        checkVenueAvailability(v.id, event.id)
          .then((result) => [v.id, result])
          .catch(() => [v.id, { available: true, conflict: null }])
      )
    ).then((entries) => {
      if (cancelled) return;
      setPickerAvailability(Object.fromEntries(entries));
    }).finally(() => {
      if (!cancelled) setCheckingPickerAvailability(false);
    });
    return () => { cancelled = true; };
  }, [event?.id, isVenueModalOpen, venuePendingConfirm, venues]);

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
      agreedPrice: `৳${Number(b.agreedPrice).toLocaleString()}`,
      priceLabel: '(Agreed)',
      bookingStatus: b.status
    };
  });
  const hireableVendors = vendors.filter(v => !eventBookings.some(b => b.vendorId === v.id));

  const currentVenue = venues.find(v => v.id === event.venueId || v.name === event.venue) || null;
  const progress = getEventProgress(event.id);

  // Cancellation is request-based: this page can only ever *ask*. The event's
  // status is changed server-side when an admin approves (see
  // cancellationRequests.controller.js), never from here.
  const eventRequests = cancellationRequests.filter(r => String(r.eventId) === String(event.id));
  const pendingCancellation = eventRequests.find(r => r.status === 'pending') || null;
  const lastRejectedCancellation = !pendingCancellation
    ? eventRequests.find(r => r.status === 'rejected') || null
    : null;
  const eventHasEnded = event.endDate ? new Date() > new Date(event.endDate) : false;
  const canRequestCancellation =
    !!(authToken && realUser?.role === 'organizer') &&
    event.status !== 'Cancelled' &&
    !eventHasEnded &&
    !pendingCancellation;

  const handleRequestCancellation = async (e) => {
    e.preventDefault();
    setCancelError('');
    setSubmittingCancel(true);
    try {
      await requestEventCancellation(event.id, cancelReason.trim());
      setIsCancelModalOpen(false);
      setCancelReason('');
    } catch (err) {
      setCancelError(err.message || 'Could not submit the cancellation request.');
    } finally {
      setSubmittingCancel(false);
    }
  };

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
      rsvpStatus: 'Accepted',
      guestType: 'Normal'
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

  const closeVenueModal = () => {
    setIsVenueModalOpen(false);
    setVenuePendingConfirm(null);
    setVenueAvailability(null);
    setVenueBookingError('');
    setPickerAvailability({});
  };

  // Picking a venue here doesn't assign it for free — it checks the venue
  // is actually open for this event's dates and, if so, moves to the
  // deposit confirmation step. events.venue_id is only ever set server-side
  // once the SSLCommerz deposit payment is validated (see Venues.jsx for
  // the same flow).
  const handleSelectVenue = async (venue) => {
    setVenuePendingConfirm(venue);
    setVenueAvailability(null);
    setVenueBookingError('');
    setCheckingVenueAvailability(true);
    try {
      const result = await checkVenueAvailability(venue.id, event.id);
      setVenueAvailability(result);
    } catch (err) {
      setVenueBookingError(err.message);
    } finally {
      setCheckingVenueAvailability(false);
    }
  };

  const handleConfirmVenuePayment = async () => {
    if (!venuePendingConfirm || venueAvailability?.available === false) return;
    setVenueBookingError('');
    setStartingVenuePayment(true);
    try {
      const { GatewayPageURL } = await initiateVenueBooking(venuePendingConfirm.id, event.id);
      window.location.href = GatewayPageURL;
    } catch (err) {
      setVenueBookingError(err.message || 'Could not start the payment session.');
      setStartingVenuePayment(false);
    }
  };


  const openHireVendorModal = () => {
    setHireVendorForm({ vendorId: hireableVendors[0]?.id || '' });
    setHireVendorError('');
    setIsHireVendorModalOpen(true);
  };

  const selectedHireVendor = hireableVendors.find((v) => String(v.id) === String(hireVendorForm.vendorId)) || null;

  const handleHireVendorSubmit = async (e) => {
    e.preventDefault();
    setHireVendorError('');

    if (!hireVendorForm.vendorId || !selectedHireVendor) {
      setHireVendorError('Select a vendor to hire.');
      return;
    }

    setHiringVendor(true);
    try {
      const { GatewayPageURL } = await initiateVendorBooking(event.id, Number(hireVendorForm.vendorId), selectedHireVendor.basePrice);
      window.location.href = GatewayPageURL;
    } catch (err) {
      setHireVendorError(err.message || 'Could not start the payment session.');
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

            {/* Cancellation — request only. An organizer can ask; only an
                admin's approval actually cancels the event. */}
            {event.status === 'Cancelled' ? (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs">
                <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-rose-800">
                  <strong>This event is cancelled.</strong> It no longer appears in active planning or payment lists.
                </p>
              </div>
            ) : pendingCancellation ? (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs">
                <Hourglass className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-amber-900">
                  <p><strong>Cancellation requested — awaiting admin review.</strong></p>
                  <p className="text-[11px] mt-0.5 text-amber-800">
                    Your reason: "{pendingCancellation.reason}" — the event stays active until an admin approves it.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {lastRejectedCancellation && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-xs">
                    <Ban className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="text-slate-600">
                      <p><strong className="text-slate-700">A previous cancellation request was declined.</strong></p>
                      {lastRejectedCancellation.reviewNote && (
                        <p className="text-[11px] mt-0.5">Admin note: "{lastRejectedCancellation.reviewNote}"</p>
                      )}
                    </div>
                  </div>
                )}
                {canRequestCancellation && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Ban}
                    onClick={() => { setCancelError(''); setIsCancelModalOpen(true); }}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    id="btn-request-cancellation"
                  >
                    {lastRejectedCancellation ? 'Request Cancellation Again' : 'Request Cancellation'}
                  </Button>
                )}
              </div>
            )}
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
              Budget Ref: {event.budget || "৳45,000"}
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
              {currentVenue ? 'Change / Reassign Venue' : 'Assign Venue'}
            </Button>
          </div>

          {currentVenue ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VenueCard
                venue={currentVenue}
                onAssign={() => setIsVenueModalOpen(true)}
                onViewDetails={() => alert(`Venue specifications: Capacity ${currentVenue.capacity} guests. Contact: ${currentVenue.contactPerson}`)}
                assignLabel="Change Venue"
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
                  <StatusBadge status="Confirmed" size="sm" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
              <Building className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No venue assigned yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                This event doesn't have a venue booked. Assign one from the venues available for {event.startDate?.slice(0, 10)}
                {event.endDate && event.endDate !== event.startDate ? ` to ${event.endDate.slice(0, 10)}` : ''} — the venue only locks in once the confirmation deposit clears.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setIsVenueModalOpen(true)}
              >
                Assign Venue
              </Button>
            </div>
          )}
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
          <FormInput
            label="Guest Type"
            type="select"
            value={guestForm.guestType}
            onChange={(e) => setGuestForm({ ...guestForm, guestType: e.target.value })}
            options={["Normal", "VIP", "VVIP"]}
          />
          {(guestForm.guestType === 'VIP' || guestForm.guestType === 'VVIP') && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
              Once this guest accepts, admin will see an alert on the dashboard so the venue authority can be looped in for special handling.
            </div>
          )}
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
        onClose={closeVenueModal}
        title="Assign Venue"
        subtitle={venuePendingConfirm ? `Confirm "${venuePendingConfirm.name}"` : `Select a convention center for ${event.title}`}
      >
        {!venuePendingConfirm ? (
          checkingPickerAvailability ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-6 justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Checking which venues are free for these dates...
            </div>
          ) : (
            <div className="space-y-3">
              {venues.filter((v) => pickerAvailability[v.id]?.available !== false).length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
                  No venues are available for these dates. Every venue in the catalog is already booked over {event.startDate?.slice(0, 10)}
                  {event.endDate && event.endDate !== event.startDate ? `–${event.endDate.slice(0, 10)}` : ''}.
                </div>
              )}
              {venues
                .filter((v) => pickerAvailability[v.id]?.available !== false)
                .map((v) => (
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
                      disabled={v.name === event.venue}
                      onClick={() => handleSelectVenue(v)}
                    >
                      {v.name === event.venue ? "Current Venue" : "Select Venue"}
                    </Button>
                  </div>
                ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {checkingVenueAvailability && (
              <p className="text-xs text-slate-500">Checking availability for these dates...</p>
            )}

            {!checkingVenueAvailability && venueAvailability?.available === false && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                Already booked by "{venueAvailability.conflict.eventTitle}" ({venueAvailability.conflict.startDate} to {venueAvailability.conflict.endDate}). Pick a different venue.
              </div>
            )}

            {!checkingVenueAvailability && venueAvailability?.available && (
              <div className="p-3 bg-sky-50 border border-sky-200/70 rounded-xl text-xs text-[#1B3A5C] space-y-1">
                <div className="flex justify-between">
                  <span>Total venue price</span>
                  <strong>৳{(Number(venuePendingConfirm.pricePerDay) * dayCount(event.startDate, event.endDate)).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Confirmation deposit due now (10%)</span>
                  <strong>৳{(Math.round(Number(venuePendingConfirm.pricePerDay) * dayCount(event.startDate, event.endDate) * 0.10 * 100) / 100).toLocaleString()}</strong>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">You'll be redirected to SSLCommerz to pay the deposit. The venue is only locked in once payment clears.</p>
              </div>
            )}

            {venueBookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                {venueBookingError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setVenuePendingConfirm(null); setVenueAvailability(null); }}>
                Back
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={checkingVenueAvailability || venueAvailability?.available === false || startingVenuePayment}
                onClick={handleConfirmVenuePayment}
              >
                {startingVenuePayment ? 'Redirecting to payment...' : 'Pay Deposit & Confirm'}
              </Button>
            </div>
          </div>
        )}
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

              <div className="p-3 bg-sky-50 border border-sky-200/70 rounded-xl text-xs text-[#1B3A5C] space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Agreed vendor price</span>
                  <span>৳{(Number(selectedHireVendor?.basePrice) || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Confirmation deposit due now (10%)</span>
                  <strong>৳{(Math.round((Number(selectedHireVendor?.basePrice) || 0) * 0.10 * 100) / 100).toLocaleString()}</strong>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  You'll be redirected to SSLCommerz to pay the 10% deposit — the vendor is only hired for this event once it clears.
                  The remaining 90% appears on your Payments tab after the event ends, and is due within 3 days.
                </p>
              </div>
            </>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsHireVendorModalOpen(false)} disabled={hiringVendor}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={hiringVendor || hireableVendors.length === 0}>
              {hiringVendor ? 'Redirecting to payment...' : 'Pay & Hire Vendor'}
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

      {/* Cancellation request — the organizer submits a reason for an admin
          to review. Approving it (from the admin's Cancellations queue) is
          what actually cancels the event; nothing changes here. */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Request Event Cancellation"
        subtitle="An admin reviews every request before an event is cancelled"
        id="cancel-request-modal"
      >
        <form onSubmit={handleRequestCancellation} className="space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs font-bold text-slate-800">{event.title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {formatDate(event.startDate)}
              {event.endDate && event.endDate !== event.startDate && ` — ${formatDate(event.endDate)}`}
            </p>
          </div>

          {cancelError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {cancelError}
            </div>
          )}

          <FormInput
            label="Why does this event need to be cancelled?"
            type="textarea"
            rows={4}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. The main sponsor withdrew and we can't cover the venue cost, so the event can't go ahead."
            helperText="Be specific — the admin team approves or declines based on this. Minimum 15 characters."
            required
          />

          <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 leading-relaxed">
            Submitting this does <strong>not</strong> cancel the event. It stays active — including any guest
            invitations, staff tasks and outstanding payments — until an admin approves the request.
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCancelModalOpen(false)} disabled={submittingCancel}>
              Keep Event
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              icon={Ban}
              disabled={submittingCancel || cancelReason.trim().length < 15}
            >
              {submittingCancel ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}