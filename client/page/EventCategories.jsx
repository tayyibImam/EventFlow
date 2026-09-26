import React, { useState } from 'react';
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import Button from '../component/Button';
import Modal from '../component/Modal';
import ConfirmModal from '../component/ConfirmModal';
import FormInput from '../component/FormInput';

const emptyForm = { name: '', description: '', color: '#1B3A5C' };

export default function EventCategories() {
  const { categories, events, addCategory, updateCategory, deleteCategory } = useEventFlow();

  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setModalMode('add');
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '', color: cat.color || '#1B3A5C' });
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
    if (!form.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'edit') {
        await updateCategory(editingId, form);
      } else {
        await addCategory(form);
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
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this category.');
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
            Event Categories &amp; Taxonomy
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Define classification tags, attendee badge types, and event archetypes
          </p>
        </div>

        <Button
          id="btn-add-category"
          variant="gold"
          icon={Plus}
          onClick={openAdd}
        >
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          // Count active events matching this category
          const eventCount = events.filter(e => e.category?.toLowerCase() === cat.name?.toLowerCase()).length;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B3A5C]/10 text-[#1B3A5C] flex items-center justify-center font-bold">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEdit(cat)}
                      className="p-1.5 text-slate-500 hover:text-[#1B3A5C] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeleteTarget(cat); setDeleteError(''); }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#1B3A5C]">
                  {cat.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {cat.description || "Standard event categorization archetype for operations."}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Category ID: {cat.id}</span>
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#1B3A5C' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={!!modalMode}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Edit Category' : 'Create New Event Category'}
        subtitle={modalMode === 'edit' ? 'Changes are saved directly to the platform database' : 'Add a taxonomic event type available for all organizers'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {formError}
            </div>
          )}

          <FormInput
            label="Category Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Hackathon, Summit, Gala"
            required
          />

          <FormInput
            label="Description"
            type="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Briefly describe what kinds of events belong to this category..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
              Accent Color:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-10 h-10 rounded-lg border border-slate-300 p-1 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-600">{form.color}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : modalMode === 'edit' ? 'Save Changes' : 'Save Category'}
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
        title="Delete this category?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed from the event taxonomy. Events already using it will keep their record but show as Uncategorized.` : ''}
        error={deleteError}
      />
    </div>
  );
}
