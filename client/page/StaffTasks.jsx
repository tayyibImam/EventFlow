import React, { useState } from 'react';
import { CheckSquare, Clock, CheckCircle2, User, AlertCircle, Calendar } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import TaskCard from '../component/TaskCard';
import FilterDropdown from '../component/FilterDropdown';
import SearchBar from '../component/SearchBar';
import DashboardCard from '../component/DashboardCard';

export default function StaffTasks() {
  const { tasks, updateTaskStatus } = useEventFlow();

  const [activeStaffName, setActiveStaffName] = useState('Tariqul Islam');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const staffList = ['Tariqul Islam', 'Farhan Ahmed', 'Tanvir Hasan', 'Meyadur Rahman'];
  const statusOptions = ['All', 'Pending', 'In Progress', 'Done'];

  // Filter tasks assigned to the selected staff member
  const staffTasks = tasks.filter((t) => {
    const matchesStaff = t.assignedTo === activeStaffName;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.eventTitle && t.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStaff && matchesStatus && matchesSearch;
  });

  const totalAssigned = tasks.filter(t => t.assignedTo === activeStaffName).length;
  const pendingCount = tasks.filter(t => t.assignedTo === activeStaffName && t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.assignedTo === activeStaffName && t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.assignedTo === activeStaffName && t.status === 'Done').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Staff Persona Selector */}
      <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2a5582] text-white rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#D4A537] mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Staff Operations Workspace</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Assigned Field Duties: {activeStaffName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
            You are responsible for executing on-ground AV checks, stage logistics, and safety checks. Update statuses as you complete milestones.
          </p>
        </div>

        {/* Switch staff persona dropdown */}
        <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#D4A537] block mb-1.5">
            Switch Staff Profile:
          </label>
          <select
            value={activeStaffName}
            onChange={(e) => setActiveStaffName(e.target.value)}
            className="w-full bg-white text-slate-900 text-xs font-bold px-3 py-2 rounded-lg border-0 focus:outline-none cursor-pointer"
          >
            {staffList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
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
          No tasks found matching your filter for {activeStaffName}.
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
