import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckSquare,
  Users,
  MapPin,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Building,
  UserCheck,
  Activity
} from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import DashboardCard from '../component/DashboardCard';
import EventCard from '../component/EventCard';
import Button from '../component/Button';

export default function Dashboard() {
  const { events, tasks, guests, activities, currentProfile, getEventProgress } = useEventFlow();

  // Calculate realistic summary values
  const totalEventsCount = events.length;
  const upcomingEvents = events.filter(e => e.status === 'Planned' || e.status === 'Ongoing');
  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const acceptedGuestsCount = guests.filter(g => g.rsvpStatus === 'Accepted').length;
  const rsvpRate = guests.length > 0 ? Math.round((acceptedGuestsCount / guests.length) * 100) : 0;

  // Featured flagship event for planning progress
  const flagshipEvent = events[0];
  const flagshipProgress = flagshipEvent ? getEventProgress(flagshipEvent.id) : null;

  const planningMilestones = flagshipProgress ? [
    { label: "Venue", status: flagshipProgress.venue === 100 ? "Assigned" : "Not assigned", percent: flagshipProgress.venue, color: "bg-emerald-500", textColor: "text-emerald-700" },
    { label: "Vendors", status: `${flagshipProgress.vendors}%`, percent: flagshipProgress.vendors, color: "bg-emerald-500", textColor: "text-emerald-700" },
    { label: "Guests", status: `${flagshipProgress.guests}%`, percent: flagshipProgress.guests, color: "bg-[#1B3A5C]", textColor: "text-[#1B3A5C]" },
    { label: "Tasks", status: `${flagshipProgress.tasks}%`, percent: flagshipProgress.tasks, color: "bg-[#D4A537]", textColor: "text-[#D4A537]" },
    { label: "Schedule", status: flagshipProgress.schedule === 100 ? "Published" : "Not published", percent: flagshipProgress.schedule, color: "bg-sky-500", textColor: "text-sky-700" }
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome Header */}
      <div className="bg-gradient-to-r from-[#1B3A5C] via-[#234b75] to-[#152e4a] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#D4A537] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Event Operations Control</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentProfile.name}
            </h2>
            <p className="mt-2 text-sm text-slate-200 leading-relaxed">
              Track multi-track schedules, vendors, guest rosters, and tasks
              {flagshipEvent ? <> across <strong>{flagshipEvent.title}</strong> and upcoming summits</> : ''} from one central unified dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/events/create">
              <Button
                variant="gold"
                icon={Plus}
                id="btn-dash-create-event"
              >
                Create Event
              </Button>
            </Link>
            <Link to="/tasks">
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                icon={CheckSquare}
                id="btn-dash-view-tasks"
              >
                Assign Task
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#D4A537]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Summary Cards */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <DashboardCard
            id="dash-total-events"
            title="Total Events"
            value={totalEventsCount.toString()}
            subtitle="All-time across your account"
            icon={CalendarDays}
            iconBg="bg-blue-50"
            iconColor="text-[#1B3A5C]"
            badge="All-time"
          />
          <DashboardCard
            id="dash-upcoming-events"
            title="Upcoming Events"
            value={upcomingEvents.length.toString()}
            subtitle={upcomingEvents[0] ? `Next: ${upcomingEvents[0].title}` : 'Nothing scheduled yet'}
            icon={Clock}
            iconBg="bg-sky-50"
            iconColor="text-[#7FB3D5]"
            badge="Active"
            badgeType="gold"
          />
          <DashboardCard
            id="dash-pending-tasks"
            title="Pending Tasks"
            value={pendingTasksCount.toString()}
            subtitle="Across all your events"
            icon={CheckSquare}
            iconBg="bg-amber-50"
            iconColor="text-[#D4A537]"
            badge={`${pendingTasksCount} Remaining`}
          />
          <DashboardCard
            id="dash-confirmed-guests"
            title="Confirmed Guests"
            value={acceptedGuestsCount.toString()}
            subtitle={`${rsvpRate}% RSVP acceptance rate`}
            icon={Users}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-700"
            badge={`${rsvpRate}% Confirmed`}
            badgeType="positive"
          />
        </div>
      </div>

      {/* Main Grid: Upcoming Events & Planning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Upcoming Events */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1B3A5C]">
                Upcoming Events
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled conferences, cultural evenings, and executive gatherings
              </p>
            </div>
            <Link
              to="/events"
              className="text-xs font-semibold text-[#1B3A5C] hover:text-[#D4A537] flex items-center gap-1 transition-colors"
            >
              <span>View All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-sm font-semibold text-slate-600">No upcoming events yet</p>
              <p className="text-xs text-slate-400 mt-1">Events you create will show up here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcomingEvents.slice(0, 4).map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Planning Progress & Recent Activity */}
        <div className="space-y-6">
          {/* Planning Progress Card */}
          {flagshipEvent && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-[#1B3A5C]">
                    Planning Progress
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">
                    Focus: {flagshipEvent.title}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#D4A537] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {flagshipProgress.overall}% Ready
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {planningMilestones.map((mile) => (
                  <div key={mile.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        {mile.label}
                      </span>
                      <span className={`font-bold ${mile.textColor}`}>
                        {mile.status}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${mile.color}`}
                        style={{ width: `${mile.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  to={`/events/${flagshipEvent.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1B3A5C] bg-slate-50 hover:bg-slate-100 py-2.5 rounded-lg transition-colors border border-slate-200"
                >
                  <span>Open {flagshipEvent.title} Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1B3A5C]" />
                <h3 className="text-base font-bold text-[#1B3A5C]">
                  Recent Activity
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Live stream</span>
            </div>

            <div className="mt-4 space-y-4">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No activity yet this session.
                </p>
              ) : (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#1B3A5C] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 leading-snug">
                        {act.title}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {act.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
