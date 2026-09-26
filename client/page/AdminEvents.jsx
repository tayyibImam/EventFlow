import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import SearchBar from '../component/SearchBar';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';
import Modal from '../component/Modal';
import ConfirmModal from '../component/ConfirmModal';
import FormInput from '../component/FormInput';
import StatusBadge from '../component/StatusBadge';

const emptyForm = {
  title: '',
  description: '',
  organizerId: '',
  categoryId: '',
  venueId: '',
  startDate: '',
  endDate: '',
  status: 'Planned',
  budget: ''
};

export default function AdminEvents() {
  const { events, users, venues, categories, addEvent, updateEvent, deleteEvent } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const statusOptions = ['All', 'Planned', 'Ongoing', 'Completed', 'Cancelled'];

  const organizerNameById = useMemo(() => {
    const map = {};
    users.forEach((u) => { map[u.id] = u.name; });
    return map;
  }, [users]);

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

  const organizerOptions = useMemo(
    () => users.filter((u) => u.role === 'Organizer' || u.role === 'Admin'),
    [users]
  );

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || evt.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const toDateInputValue = (isoLike) => (isoLike ? isoLike.slice(0, 10) : '');

  const openAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setModalMode('add');
  };

  const openEdit = (evt) => {
    setEditingId(evt.id);
    setForm({
      title: evt.title,
      description: evt.description || '',
      organizerId: evt.organizerId ?? '',
      categoryId: evt.categoryId ?? '',
      venueId: evt.venueId ?? '',
      startDate: toDateInputValue(evt.startDate),
      endDate: toDateInputValue(evt.endDate),
      status: evt.status || 'Planned',
      budget: evt.budget ?? ''
    });
    setFormError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Event title is required.');
      return;
    }
    if (!form.organizerId) {
      setFormError('An organizer must be assigned to this event.');
      return;
    }
    if (!form.startDate) {
      setFormError('Start date is required.');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      organizerId: Number(form.organizerId),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      venueId: form.venueId ? Number(form.venueId) : null,
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      status: form.status,
      budget: form.budget
    };

    setSubmitting(true);
    try {
      if (modalMode === 'edit') {
        await updateEvent(editingId, payload);
      } else {
        await addEvent(payload);
      }
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteEvent(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this event.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            Platform Event Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, reassign, and remove any event across every organizer on the platform
          </p>
        </div>

        <Button id="btn-add-event" variant="gold" icon={Plus} onClick={openAdd}>
          Add Event
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search events by title..."
            id="admin-events-search-bar"
          />
        </div>
        <FilterDropdown
          label="Status"
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={statusOptions}
          id="admin-filter-event-status"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Event</th>
                <th className="py-3.5 px-4">Organizer</th>
                <th className="py-3.5 px-4">Venue</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1B3A5C]/10 text-[#1B3A5C] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <Link to={`/events/${evt.id}`} className="font-bold text-[#1B3A5C] text-sm leading-tight hover:underline">
                          {evt.title}
                        </Link>
                        <p className="text-[11px] text-slate-400">
                          {toDateInputValue(evt.startDate) || 'No date'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600">
                    {organizerNameById[evt.organizerId] || evt.organizer || '—'}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500">
                    {venueNameById[evt.venueId] || evt.venue || 'TBD'}
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                      {categoryNameById[evt.categoryId] || evt.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={evt.status} size="sm" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/events/${evt.id}`}
                        className="p-2 text-slate-500 hover:text-[#1B3A5C] hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label={`View ${evt.title}`}
                        title="View event"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(evt)}
                        className="p-2 text-slate-500 hover:text-[#1B3A5C] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Edit ${evt.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeleteTarget(evt); setDeleteError(''); }}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Delete ${evt.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No events match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={!!modalMode}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Edit Event' : 'Add New Event'}
        subtitle="Changes are saved directly to the platform database"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {formError}
            </div>
          )}

          <FormInput
            label="Event Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. South Asia AI & Cloud Summit 2026"
            required
          />

          <FormInput
            label="Description"
            type="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Outline the core theme and objectives..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Organizer"
              type="select"
              value={form.organizerId}
              onChange={(e) => setForm({ ...form, organizerId: e.target.value })}
              options={[
                { value: '', label: 'Select an organizer...' },
                ...organizerOptions.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` }))
              ]}
              required
            />

            <FormInput
              label="Status"
              type="select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={['Planned', 'Ongoing', 'Completed', 'Cancelled']}
              helperText="Planned/Ongoing/Completed switch automatically based on the event dates — only Cancelled sticks."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Venue"
              type="select"
              value={form.venueId}
              onChange={(e) => setForm({ ...form, venueId: e.target.value })}
              options={[
                { value: '', label: 'Unassigned' },
                ...venues.map((v) => ({ value: v.id, label: v.name }))
              ]}
            />

            <FormInput
              label="Category"
              type="select"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              options={[
                { value: '', label: 'Uncategorized' },
                ...categories.map((c) => ({ value: c.id, label: c.name }))
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <FormInput
            label="Budget (USD)"
            type="number"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            placeholder="e.g. 25000"
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : modalMode === 'edit' ? 'Save Changes' : 'Add Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={deleting}
        title="Delete this event?"
        message={deleteTarget ? `"${deleteTarget.title}" and all of its associated records will be permanently removed.` : ''}
        error={deleteError}
      />
    </div>
  );
}
