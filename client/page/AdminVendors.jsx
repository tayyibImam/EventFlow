import React, { useState } from 'react';
import { Store, Plus, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import SearchBar from '../component/SearchBar';
import Button from '../component/Button';
import Modal from '../component/Modal';
import ConfirmModal from '../component/ConfirmModal';
import FormInput from '../component/FormInput';

const emptyForm = { name: '', serviceType: '', contactEmail: '', contactPhone: '', basePrice: '' };

export default function AdminVendors() {
  const { vendors, addVendor, updateVendor, deleteVendor } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setModalMode('add');
  };

  const openEdit = (vendor) => {
    setEditingId(vendor.id);
    setForm({
      name: vendor.name,
      serviceType: vendor.category,
      contactEmail: vendor.contactEmail || '',
      contactPhone: vendor.contactPhone || '',
      basePrice: vendor.basePrice
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
    if (!form.name || !form.serviceType) {
      setFormError('Name and service type are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'edit') {
        await updateVendor(editingId, form);
      } else {
        await addVendor(form);
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
      await deleteVendor(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this vendor.');
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
            Vendor Directory Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, edit, and remove service vendors available platform-wide to every organizer
          </p>
        </div>

        <Button id="btn-add-vendor" variant="gold" icon={Plus} onClick={openAdd}>
          Add Vendor
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by vendor name or service type..."
            id="admin-vendors-search-bar"
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
                <th className="py-3.5 px-4 sm:px-6">Vendor</th>
                <th className="py-3.5 px-4">Service Type</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Base Price</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 text-xs font-mono text-slate-400">#{vendor.id}</td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1B3A5C]/10 text-[#1B3A5C] flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <p className="font-bold text-[#1B3A5C] text-sm leading-tight">{vendor.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                      {vendor.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600 space-y-1">
                    {vendor.contactPhone && (
                      <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {vendor.contactPhone}</div>
                    )}
                    {vendor.contactEmail && (
                      <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {vendor.contactEmail}</div>
                    )}
                    {!vendor.contactPhone && !vendor.contactEmail && (
                      <span className="text-slate-400">No contact on file</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-[#1B3A5C]">{vendor.agreedPrice}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(vendor)}
                        className="p-2 text-slate-500 hover:text-[#1B3A5C] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Edit ${vendor.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeleteTarget(vendor); setDeleteError(''); }}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Delete ${vendor.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No vendors match your search.
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
        title={modalMode === 'edit' ? 'Edit Vendor' : 'Add New Vendor'}
        subtitle="Vendor details are visible to every organizer on the platform"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {formError}
            </div>
          )}

          <FormInput
            label="Vendor Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Bashir Gourmet Catering"
            required
          />

          <FormInput
            label="Service Type"
            value={form.serviceType}
            onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
            placeholder="e.g. Catering, Decoration, Photography"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Contact Email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="e.g. contact@vendor.com"
            />
            <FormInput
              label="Contact Phone"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="e.g. +880 1711-234567"
            />
          </div>

          <FormInput
            label="Base Price (USD)"
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
            placeholder="e.g. 12500"
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : modalMode === 'edit' ? 'Save Changes' : 'Add Vendor'}
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
        title="Delete this vendor?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed from the vendor directory, along with any event bookings referencing it.` : ''}
        error={deleteError}
      />
    </div>
  );
}
