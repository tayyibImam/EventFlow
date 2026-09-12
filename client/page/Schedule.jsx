import React, { useState } from 'react';
import { Clock, Plus, Calendar, MapPin } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import ScheduleTimeline from '../component/ScheduleTimeline';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';
import Modal from '../component/Modal';
import FormInput from '../component/FormInput';

export default function Schedule() {
  const { schedule, events, addScheduleItem, deleteScheduleItem } = useEventFlow();

  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || 'evt-101');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    activity: '',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Main Stage Auditorium',
    notes: ''
  });

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  const filteredSchedule = schedule.filter(s => !s.eventId || s.eventId === selectedEventId);

  const eventFilterOptions = events.map(e => ({ value: e.id, label: e.title }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.activity) return;

    addScheduleItem({
      ...form,
      eventId: selectedEventId
    });

    setForm({
      activity: '',
      startTime: '09:00',
      endTime: '10:00',
      location: 'Main Stage Auditorium',
      notes: ''
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            Event Schedule &amp; Itinerary
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Timeline schedule for ceremonies, keynote sessions, lunch breaks, and breakout tracks
          </p>
        </div>

        <Button
          id="btn-open-add-schedule"
          variant="gold"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Schedule Item
        </Button>
      </div>

      {/* Event Selector Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#1B3A5C]" />
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Active Itinerary:</span>
            <span className="text-sm font-bold text-[#1B3A5C]">{selectedEvent?.title}</span>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <FilterDropdown
            label="Switch Event"
            value={selectedEventId}
            onChange={setSelectedEventId}
            options={eventFilterOptions}
            id="filter-schedule-event"
          />
        </div>
      </div>

      {/* Timeline Display */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Chronological Running Order ({filteredSchedule.length} sessions)
          </span>
          <span className="text-xs font-bold text-[#1B3A5C] bg-sky-50 px-2.5 py-1 rounded-md">
            Venue: {selectedEvent?.venue || "Grand Convention Hall"}
          </span>
        </div>

        <ScheduleTimeline
          items={filteredSchedule}
          onDeleteItem={deleteScheduleItem}
        />
      </div>

      {/* Add Schedule Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Schedule Item"
        subtitle={`Add programmatic block to ${selectedEvent?.title}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Activity Name"
            value={form.activity}
            onChange={(e) => setForm({ ...form, activity: e.target.value })}
            placeholder="e.g. Panel Discussion: Cloud Native Platforms"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Start Time"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
            <FormInput
              label="End Time"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>

          <FormInput
            label="Hall / Stage / Room Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Workshop Hall B, Level 2"
          />

          <FormInput
            label="Notes &amp; Stage Cues"
            type="textarea"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Keynote speaker mic requirements, slide deck check, lighting dimmer..."
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save Schedule Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
