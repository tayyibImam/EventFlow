import React, { useState } from 'react';
import { CheckSquare, Clock, CheckCircle2, User, AlertCircle, Calendar } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import TaskCard from '../component/TaskCard';
import FilterDropdown from '../component/FilterDropdown';
import SearchBar from '../component/SearchBar';
import DashboardCard from '../component/DashboardCard';

// `tasks` here is already scoped to this account's own assignments by
// EventFlowContext's visibleTasks (real login: tasks.assigned_to === your
// user_id; demo/no-login perspective: every task, same as other roles'
// unauthenticated fallback) — no client-side re-filtering by name needed.
export default function StaffTasks() {
  const { tasks, currentProfile, updateTaskStatus } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statusOptions = ['All', 'Pending', 'In Progress', 'Done'];

  const staffTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.eventTitle && t.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalAssigned = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Done').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2a5582] text-white rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#D4A537] mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Staff Operations Workspace</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Assigned Field Duties: {currentProfile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
            You are responsible for executing on-ground AV checks, stage logistics, and safety checks. Update statuses as you complete milestones.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Assigned to You"
          value={totalAssigned.toString()}
          subtitle="Total action items"
          icon={CheckSquare}
          iconBg="bg-blue-50"
          iconColor="text-[#1B3A5C]"
        />
        <DashboardCard
          title="Pending Kickoff"
          value={pendingCount.toString()}
          subtitle="Need immediate action"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-800"
          badge="Pending"
          badgeType="gold"
        />
        <DashboardCard
          title="Underway"
          value={inProgressCount.toString()}
          subtitle="In active execution"
          icon={AlertCircle}
          iconBg="bg-sky-50"
          iconColor="text-sky-700"
        />
        <DashboardCard
          title="Completed"
          value={completedCount.toString()}
          subtitle="Signed off"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          badge="Done"
          badgeType="positive"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search my tasks by title..."
            id="staff-task-search"
          />
        </div>

        <FilterDropdown
          label="Duty Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          id="filter-staff-task-status"
        />
      </div>

      {/* Task Cards Grid */}
      {staffTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          No tasks found matching your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onStatusChange={updateTaskStatus}
              readOnly={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
