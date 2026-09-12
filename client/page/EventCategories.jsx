import React, { useState } from 'react';
import { Tag, Plus, Calendar, Layers, Check } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import Button from '../component/Button';
import Modal from '../component/Modal';
import FormInput from '../component/FormInput';

export default function EventCategories() {
  const { categories, events, addCategory } = useEventFlow();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#1B3A5C'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    addCategory(form);
    setForm({ name: '', description: '', color: '#1B3A5C' });
    setIsModalOpen(false);
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
          onClick={() => setIsModalOpen(true)}
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
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
                  </span>
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

      {/* Add Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Event Category"
        subtitle="Add a taxonomic event type available for all organizers"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
