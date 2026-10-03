import React, { useState } from 'react';
import { ClipboardCheck, Clock, CheckCircle2, Users, MailWarning } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import StaffFeedbackCard from '../component/StaffFeedbackCard';
import FilterDropdown from '../component/FilterDropdown';
import SearchBar from '../component/SearchBar';
import DashboardCard from '../component/DashboardCard';

// Read-only for the organizer — these notes are written by staff from their
// own task view (see TaskFeedbackModal), never here. New feedback always
// starts unread ("New"/red) until the organizer explicitly marks it read
// ("Read"/gray) below — there's no way to flip it back to unread.
export default function StaffFeedback() {
  const { taskFeedback, events, staffDirectory, markTaskFeedbackRead } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('All');
  const [selectedStaff, setSelectedStaff] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedReadStatus, setSelectedReadStatus] = useState('All');

  const eventFilterOptions = [
    { value: 'All', label: 'All Events' },
    ...events.map((e) => ({ value: e.id, label: e.title }))
  ];

  const staffFilterOptions = ['All', ...staffDirectory.map((s) => s.name)];
  const stageFilterOptions = ['All', 'In Progress', 'Completed'];
  const readStatusOptions = [
    { value: 'All', label: 'All' },
    { value: 'Unread', label: 'Unread' },
    { value: 'Read', label: 'Read' }
  ];

  const filtered = taskFeedback
    .filter((tf) => {
      const matchesEvent = selectedEventId === 'All' || String(tf.eventId) === String(selectedEventId);
      const matchesStaff = selectedStaff === 'All' || tf.staffName === selectedStaff;
      const matchesStage = selectedStage === 'All' || tf.stage === selectedStage;
      const matchesReadStatus =
        selectedReadStatus === 'All' ||
        (selectedReadStatus === 'Unread' ? !tf.isRead : tf.isRead);
      const matchesSearch =
        tf.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tf.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tf.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesEvent && matchesStaff && matchesStage && matchesReadStatus && matchesSearch;
    })
    // Unread notes surface first so a new review never gets buried under
    // older, already-read ones.
    .sort((a, b) => (a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1));

  const totalNotes = taskFeedback.length;
  const unreadNotes = taskFeedback.filter((tf) => !tf.isRead).length;
  const inProgressNotes = taskFeedback.filter((tf) => tf.stage === 'In Progress').length;
  const completedNotes = taskFeedback.filter((tf) => tf.stage === 'Completed').length;
  const reportingStaffCount = new Set(taskFeedback.map((tf) => tf.staffId)).size;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            Staff Feedback
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Progress and completion notes your field staff leave on their own assigned tasks
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <DashboardCard
          id="card-total-staff-feedback"
          title="Total Notes"
          value={totalNotes.toString()}
          subtitle="Across all assigned tasks"
          icon={ClipboardCheck}
          iconBg="bg-blue-50"
          iconColor="text-[#1B3A5C]"
        />
        <DashboardCard
          id="card-unread-staff-feedback"
          title="Unread"
          value={unreadNotes.toString()}
          subtitle="Needs your review"
          icon={MailWarning}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          badge={unreadNotes > 0 ? "Action Required" : undefined}
          badgeType="gold"
        />
        <DashboardCard
          id="card-in-progress-staff-feedback"
          title="Midway Updates"
          value={inProgressNotes.toString()}
          subtitle="Logged while work is underway"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-800"
          badge="In Progress"
          badgeType="gold"
        />
        <DashboardCard
          id="card-completed-staff-feedback"
          title="Completion Notes"
          value={completedNotes.toString()}
          subtitle="Logged once work wrapped up"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          badge="Completed"
          badgeType="positive"
        />
        <DashboardCard
          id="card-reporting-staff-count"
          title="Staff Reporting"
          value={reportingStaffCount.toString()}
          subtitle="Distinct team members"
          icon={Users}
          iconBg="bg-sky-50"
          iconColor="text-sky-700"
        />
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by comment, task, or event..."
            id="staff-feedback-search"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <FilterDropdown
            label="Event"
            value={selectedEventId}
            onChange={setSelectedEventId}
            options={eventFilterOptions}
            id="filter-staff-feedback-event"
          />

          <FilterDropdown
            label="Staff"
            value={selectedStaff}
            onChange={setSelectedStaff}
            options={staffFilterOptions}
            id="filter-staff-feedback-staff"
          />

          <FilterDropdown
            label="Stage"
            value={selectedStage}
            onChange={setSelectedStage}
            options={stageFilterOptions}
            id="filter-staff-feedback-stage"
          />

          <FilterDropdown
            label="Status"
            value={selectedReadStatus}
            onChange={setSelectedReadStatus}
            options={readStatusOptions}
            id="filter-staff-feedback-read-status"
          />
        </div>
      </div>

      {/* Feedback Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No staff feedback yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Progress and completion notes your staff leave on their assigned tasks will show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tf) => (
            <StaffFeedbackCard key={tf.id} feedback={tf} onMarkRead={markTaskFeedbackRead} />
          ))}
        </div>
      )}
    </div>
  );
}
