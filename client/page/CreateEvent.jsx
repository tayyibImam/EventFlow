import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, DollarSign, Users, MapPin, Tag, Info, ArrowLeft, Check } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import FormInput from '../component/FormInput';
import Button from '../component/Button';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { venues, categories, addEvent } = useEventFlow();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Conference',
    description: '',
    venue: 'Grand Convention Hall',
    startDate: '',
    endDate: '',
    expectedGuests: '250',
    budget: '$25,000',
    status: 'Planned'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Event Title is required';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required';
    if (!formData.expectedGuests) newErrors.expectedGuests = 'Expected guest count is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Match venue ID if possible
    const matchedVenue = venues.find(v => v.name === formData.venue);

    const created = addEvent({
      title: formData.title,
      category: formData.category,
      description: formData.description || `Event planned by Meyadur Rahman for ${formData.expectedGuests} attendees.`,
      venue: formData.venue,
      venueId: matchedVenue ? matchedVenue.id : 'ven-1',
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      expectedGuests: parseInt(formData.expectedGuests, 10) || 100,
      budget: formData.budget || '$15,000',
      status: formData.status
    });

    navigate(`/events/${created.id}`);
  };

  const categoryOptions = categories.map(c => ({ value: c.name, label: c.name }));
  const venueOptions = [
    { value: "Grand Convention Hall", label: "Grand Convention Hall (Dhaka — Cap: 500)" },
    { value: "Royal Crown Auditorium", label: "Royal Crown Auditorium (Gulshan — Cap: 400)" },
    { value: "Lakeview Banquet Center", label: "Lakeview Banquet Center (Dhanmondi — Cap: 300)" },
    { value: "Silicon Bay Tech Hub", label: "Silicon Bay Tech Hub (Banani — Cap: 150)" },
    { value: "Summit Palace Ballroom", label: "Summit Palace Ballroom (Uttara — Cap: 650)" },
    { value: "Emerald Garden Resort", label: "Emerald Garden Resort (Gazipur — Cap: 800)" },
    { value: "TBD / To Be Decided", label: "TBD / Custom External Venue" }
  ];

  const statusOptions = [
    { value: "Planned", label: "Planned (Initial Planning Phase)" },
    { value: "Ongoing", label: "Ongoing (Active Coordination)" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
        <Link to="/events" className="hover:text-[#1B3A5C] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Events
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            Create New Event
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure the baseline parameters, schedule timeline, and guest target for your new event.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <FormInput
            id="create-event-title"
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. South Asia AI & Cloud Summit 2026"
            required
            error={errors.title}
          />

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput
              id="create-event-category"
              label="Event Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              icon={Tag}
            />

            <FormInput
              id="create-event-status"
              label="Event Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
            />
          </div>

          {/* Description */}
          <FormInput
            id="create-event-description"
            label="Description & Event Objectives"
            name="description"
            type="textarea"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Outline the core theme, keynote speakers, target attendees, and key milestones..."
          />

          {/* Venue Selection */}
          <FormInput
            id="create-event-venue"
            label="Selected Venue"
            name="venue"
            type="select"
            value={formData.venue}
            onChange={handleChange}
            options={venueOptions}
            icon={MapPin}
            helperText="Venues can also be changed or assigned later from the Venues catalog."
          />

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput
              id="create-event-start-date"
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              error={errors.startDate}
              icon={Calendar}
            />

            <FormInput
              id="create-event-end-date"
              label="End Date (Optional)"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              icon={Calendar}
            />
          </div>

          {/* Expected Guests & Budget (Planning info only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput
              id="create-event-expected-guests"
              label="Expected Guests / Target Capacity"
              name="expectedGuests"
              type="number"
              value={formData.expectedGuests}
              onChange={handleChange}
              placeholder="e.g. 500"
              required
              error={errors.expectedGuests}
              icon={Users}
            />

            <FormInput
              id="create-event-budget"
              label="Planning Budget (Reference Only)"
              name="budget"
              type="text"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g. $45,000"
              icon={DollarSign}
              helperText="Informational planning estimation only. No payment gateway."
            />
          </div>

          {/* Informational callout note */}
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-200/70 flex items-start gap-3 text-xs text-[#1B3A5C]">
            <Info className="w-4 h-4 text-[#1B3A5C] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Connected Architecture:</strong> Once created, this event automatically opens dedicated sub-modules for Venue reservation, Vendor contracts, Guest RSVP tables, Staff tasks, Schedule timelines, and Feedback collection.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              id="btn-create-event-cancel"
              type="button"
              variant="outline"
              onClick={() => navigate('/events')}
            >
              Cancel
            </Button>
            <Button
              id="btn-create-event-submit"
              type="submit"
              variant="primary"
              icon={Check}
            >
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
