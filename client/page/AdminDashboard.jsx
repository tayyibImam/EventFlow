import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Calendar,
  Building,
  Store,
  Tag,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Server
} from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import DashboardCard from '../component/DashboardCard';
import StatusBadge from '../component/StatusBadge';
import Button from '../component/Button';

export default function AdminDashboard() {
  const { events, adminStats, categories, activities, users, venues, vendors } = useEventFlow();
  const totalEvents = events.length;
  const totalVenues = venues.length;
  const totalVendors = vendors.length;
  const totalUsers = adminStats.userCount ?? 0;
  const plannedCount = events.filter((e) => e.status === 'Planned').length;

  const venueNameById = useMemo(() => {
    const map = {};
    venues.forEach((v) => { map[v.id] = v.name; });
    return map;
  }, [venues]);

  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  const organizerNameById = useMemo(() => {
    const map = {};
    users.forEach((u) => { map[u.id] = u.name; });
    return map;
  }, [users]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-[#1B3A5C] text-white rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#D4A537] mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Governance &amp; Administration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            EventFlow System Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
            Monitor tenant events, category taxonomy, user permissions, and cross-event operational compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/users">
            <Button variant="gold" icon={Users} id="btn-admin-manage-users">
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/categories">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" icon={Tag}>
              Event Categories
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          title="Total Platform Events"
          value={totalEvents.toString()}
          subtitle={`${plannedCount} in active planning`}
          icon={Calendar}
          iconBg="bg-blue-50"
          iconColor="text-[#1B3A5C]"
          badge="Live"
          badgeType="positive"
        />
        <DashboardCard
          title="Registered Users"
          value={totalUsers.toString()}
          subtitle="Organizers, Staff, Guests"
          icon={Users}
          iconBg="bg-sky-50"
          iconColor="text-[#7FB3D5]"
        />
        <DashboardCard
          title="Verified Venues"
          value={totalVenues.toString()}
          subtitle="Halls, Centers, Auditoriums"
          icon={Building}
          iconBg="bg-amber-50"
          iconColor="text-[#D4A537]"
        />
        <DashboardCard
          title="Partnered Vendors"
          value={totalVendors.toString()}
          subtitle="Catering, AV, Logistics, Decor"
          icon={Store}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
      </div>

      {/* Grid: Platform Events Audit & System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Events Audit Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#1B3A5C]">
                Platform Event Registry &amp; Compliance Audit
              </h3>
              <p className="text-xs text-slate-500">
                Cross-organizer event directory with venue verification and health status
              </p>
            </div>
            <Link
              to="/admin/events"
              className="text-xs font-semibold text-[#1B3A5C] hover:text-[#D4A537]"
            >
              All Events &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Event Name</th>
                  <th className="py-2.5 px-3">Organizer</th>
                  <th className="py-2.5 px-3">Venue</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#1B3A5C]">
                      <Link to={`/events/${evt.id}`} className="hover:underline">
                        {evt.title}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {organizerNameById[evt.organizerId] || evt.organizer || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {venueNameById[evt.venueId] || evt.venue || 'TBD'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                        {categoryNameById[evt.categoryId] || evt.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={evt.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: System Diagnostics & Health */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Server className="w-4 h-4 text-[#1B3A5C]" />
              <h3 className="text-base font-bold text-[#1B3A5C]">
                Platform Architecture State
              </h3>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/60">
                <span className="font-semibold text-emerald-900">Frontend Environment</span>
                <span className="font-bold text-emerald-700">Online &bull; Healthy</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-xl border border-blue-200/60">
                <span className="font-semibold text-blue-900">Design System</span>
                <span className="font-bold text-[#1B3A5C]">Navy / Gold Accents</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Storage Synchronization</span>
                <span className="font-bold text-slate-800">Local Persistence Synchronized</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Role-Based Access</span>
                <span className="font-bold text-slate-800">4 Active Roles</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#1B3A5C]">
                Global Audit Stream
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
            </div>

            <div className="mt-4 space-y-3">
              {activities.slice(0, 4).map((a) => (
                <div key={a.id} className="text-xs">
                  <p className="font-bold text-slate-800">{a.title}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{a.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{a.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
