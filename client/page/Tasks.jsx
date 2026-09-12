import React, { useState } from 'react';
import { CheckSquare, Plus, Search, Filter, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import TaskCard from '../component/TaskCard';
import SearchBar from '../component/SearchBar';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';
import Modal from '../component/Modal';
import FormInput from '../component/FormInput';
import DashboardCard from '../component/DashboardCard';

export default function Tasks() {
  const { tasks, events, addTask, updateTaskStatus, deleteTask } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStaff, setSelectedStaff] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    eventId: 'evt-101',
    assignedTo: 'Tariqul Islam',
    dueDate: '2026-10-12',
    priority: 'High',
    status: 'Pending'
  });

  const staffOptions = ['All', 'Tariqul Islam', 'Farhan Ahmed', 'Tanvir Hasan', 'Meyadur Rahman'];
  const statusOptions = ['All', 'Pending', 'In Progress', 'Done'];
  const priorityOptions = ['All', 'High', 'Medium', 'Low'];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    const matchesStaff = selectedStaff === 'All' || t.assignedTo === selectedStaff;

    return matchesSearch && matchesStatus && matchesPriority && matchesStaff;
  });

  // Summary counts
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;

  const handleOpenCreate = () => {
    setEditingTask(null);
    setForm({
      title: '',
      description: '',
      eventId: events[0]?.id || 'evt-101',
      assignedTo: 'Tariqul Islam',
      dueDate: '2026-10-12',
      priority: 'High',
      status: 'Pending'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      eventId: task.eventId || events[0]?.id || 'evt-101',
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) return;

    const ev = events.find(e => e.id === form.eventId);

    if (editingTask) {
      updateTaskStatus(editingTask.id, form.status);
      // Update full details
      setTasksFromContext(editingTask.id, form);
    } else {
      addTask({
        ...form,
        eventTitle: ev ? ev.title : 'Tech Conference 2026'
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            Task Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Coordinate catering checks, stage decoration, audio rigs, and team execution deadlines
          </p>
        </div>

        <Button
          id="btn-create-task"
          variant="gold"
          icon={Plus}
          onClick={handleOpenCreate}
        >
          Create Task
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          id="card-total-tasks"
          title="Total Tasks"
          value={totalTasks.toString()}
          subtitle="Platform active duties"
          icon={CheckSquare}
          iconBg="bg-blue-50"
          iconColor="text-[#1B3A5C]"
        />
        <DashboardCard
          id="card-pending-tasks"
          title="Pending"
          value={pendingTasks.toString()}
          subtitle="Awaiting kickoff"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-800"
          badge="Action Required"
          badgeType="gold"
        />
        <DashboardCard
          id="card-in-progress-tasks"
          title="In Progress"
          value={inProgressTasks.toString()}
          subtitle="Currently underway"
          icon={AlertCircle}
          iconBg="bg-sky-50"
          iconColor="text-sky-700"
        />
        <DashboardCard
          id="card-done-tasks"
          title="Completed"
          value={doneTasks.toString()}
          subtitle="Verified by coordinators"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          badge="Closed"
          badgeType="positive"
        />
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search task title or description..."
            id="tasks-search-bar"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <FilterDropdown
            label="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
            id="filter-task-status"
          />

          <FilterDropdown
            label="Priority"
            value={selectedPriority}
            onChange={setSelectedPriority}
            options={priorityOptions}
            id="filter-task-priority"
          />

          <FilterDropdown
            label="Staff"
            value={selectedStaff}
            onChange={setSelectedStaff}
            options={staffOptions}
            id="filter-task-staff"
          />
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            onStatusChange={updateTaskStatus}
            onEdit={handleOpenEdit}
            onDelete={deleteTask}
          />
        ))}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Edit Task Details" : "Create Operational Task"}
        subtitle="Set task scope, assign staff member, and designate deadlines"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Task Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Confirm catering head count and dietary options"
            required
          />

          <FormInput
            label="Detailed Description"
            type="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Specify milestones, delivery addresses, and vendor liaisons..."
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
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Assigned Staff Member"
              type="select"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              options={["Tariqul Islam", "Farhan Ahmed", "Tanvir Hasan", "Meyadur Rahman"]}
            />

            <FormInput
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Priority Level"
              type="select"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={["High", "Medium", "Low"]}
            />

            <FormInput
              label="Status"
              type="select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={["Pending", "In Progress", "Done"]}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
