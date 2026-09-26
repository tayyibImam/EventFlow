import React, { useState } from 'react';
import { Building2, Plus, MapPin, Users, Phone, Pencil, Trash2 } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import SearchBar from '../component/SearchBar';
import Button from '../component/Button';
import Modal from '../component/Modal';
import ConfirmModal from '../component/ConfirmModal';
import FormInput from '../component/FormInput';

const emptyForm = { name: '', address: '', city: '', capacity: '', pricePerDay: '', contactNumber: '' };

export default function AdminVenues() {
  const { venues, addVenue, updateVenue, deleteVenue } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const filteredVenues = venues.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setModalMode('add');
  };

  const openEdit = (venue) => {
    setEditingId(venue.id);
    setForm({
      name: venue.name,
      address: venue.address || '',
      city: venue.city || '',
      capacity: venue.capacity,
      pricePerDay: venue.pricePerDay,
      contactNumber: venue.contactNumber || ''
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
    if (!form.name || !form.address || !form.city || !form.capacity || !form.pricePerDay) {
      setFormError('Name, address, city, capacity, and price per day are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'edit') {
        await updateVenue(editingId, form);
      } else {
        await addVenue(form);
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
      await deleteVenue(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this venue.');
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
            Venue Directory Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, edit, and remove venues available platform-wide to every organizer
          </p>
        </div>

        <Button id="btn-add-venue" variant="gold" icon={Plus} onClick={openAdd}>
          Add Venue
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by venue name or location..."
            id="admin-venues-search-bar"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4 sm:px-6">Venue</th>
                <th className="py-3.5 px-4">Capacity</th>
                <th className="py-3.5 px-4">Price / Day</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVenues.map((venue) => (
                <tr key={venue.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 text-xs font-mono text-slate-400">#{venue.id}</td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1B3A5C]/10 text-[#1B3A5C] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1B3A5C] text-sm leading-tight">{venue.name}</p>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {venue.location}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {venue.capacity}</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-[#1B3A5C]">{venue.planningPrice}</td>
                  <td className="py-4 px-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {venue.phone}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(venue)}
                        className="p-2 text-slate-500 hover:text-[#1B3A5C] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Edit ${venue.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeleteTarget(venue); setDeleteError(''); }}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Delete ${venue.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVenues.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No venues match your search.
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
        title={modalMode === 'edit' ? 'Edit Venue' : 'Add New Venue'}
        subtitle="Venue details are visible to every organizer on the platform"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {formError}
            </div>
          )}

          <FormInput
            label="Venue Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Grand Convention Hall"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. Gulshan Avenue"
              required
            />
            <FormInput
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Dhaka"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Capacity"
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              placeholder="e.g. 500"
              required
            />
            <FormInput
              label="Price Per Day (USD)"
              type="number"
              value={form.pricePerDay}
              onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
              placeholder="e.g. 5000"
              required
            />
          </div>

          <FormInput
            label="Contact Number"
            value={form.contactNumber}
            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
            placeholder="e.g. +880 1712-889900"
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : modalMode === 'edit' ? 'Save Changes' : 'Add Venue'}
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
        title="Delete this venue?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed from the venue directory. Events currently using it will keep their record but lose the venue link.` : ''}
        error={deleteError}
      />
    </div>
  );
}
