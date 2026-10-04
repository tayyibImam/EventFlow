import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, DollarSign, Users, Tag, Info, ArrowLeft, Check, Wallet } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import FormInput from '../component/FormInput';
import Button from '../component/Button';

const PLATFORM_FEE_DISPLAY = '৳5,000';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { categories, addEvent, currentProfile, authToken, realUser, initiateEventCreationFee } = useEventFlow();

  // Creating an event is gated behind EventFlow's flat platform convenience
  // fee for a real, logged-in organizer session — paid via SSLCommerz, and
  // the event only actually gets created once that payment clears (see
  // EventFlowContext#initiateEventCreationFee). There's no real session to
  // charge in demo/perspective-switcher mode, so that path stays the old
  // free, instant creation.
  const isPaidFlow = !!(authToken && realUser?.role === 'organizer');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    startDate: '',
    endDate: '',
    expectedGuests: '250',
    budget: '৳25,000',
    status: 'Planned'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Event Title is required';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required';
    if (!formData.expectedGuests) newErrors.expectedGuests = 'Expected guest count is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Resolve the picked name against the real category list — this select
    // is keyed by name, but the backend needs the real id.
    const matchedCategory = categories.find(c => c.name === formData.category);
    const eventPayload = {
      title: formData.title,
      category: formData.category,
      categoryId: matchedCategory ? matchedCategory.id : null,
      description: formData.description || `Event planned by ${currentProfile.name} for ${formData.expectedGuests} attendees.`,
      venue: 'TBD',
      venueId: null,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      expectedGuests: parseInt(formData.expectedGuests, 10) || 100,
      budget: formData.budget || '৳15,000',
      status: formData.status
    };

    setSubmitting(true);

    if (isPaidFlow) {
      try {
        const { GatewayPageURL } = await initiateEventCreationFee(eventPayload);
        window.location.href = GatewayPageURL;
      } catch (err) {
        setPaymentError(err.message || 'Could not start the payment session. Please try again.');
        setSubmitting(false);
      }
      return;
    }

    const created = await addEvent(eventPayload);
    setSubmitting(false);

    if (created?.id != null) {
      navigate(`/events/${created.id}`);
    }
  };

  const categoryOptions = categories.map(c => ({ value: c.name, label: c.name }));

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

          {/* Category — status isn't picked here; a brand-new event always
              starts out Planned (see formData's initial state above), and
              the display status recomputes from the event's own dates
              everywhere else in the app (see computeDisplayStatus in
              EventFlowContext). */}
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
              placeholder="e.g. ৳45,000"
              icon={DollarSign}
              helperText="Informational planning estimation only — not charged. Separate from the platform fee below."
            />
          </div>

          {/* Platform fee notice */}
          {isPaidFlow ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/70 flex items-start gap-3 text-xs text-amber-900">
              <Wallet className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Platform Convenience Fee:</strong> Creating an event costs a flat <strong>{PLATFORM_FEE_DISPLAY}</strong>, paid to EventFlow via SSLCommerz. Submitting below takes you to the secure payment page — your event is only created once that payment clears.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/70 flex items-start gap-3 text-xs text-amber-900">
              <Wallet className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Demo Mode:</strong> You're browsing without a real organizer account, so event creation here is free and instant. A real session is charged a flat {PLATFORM_FEE_DISPLAY} platform fee via SSLCommerz instead.
              </p>
            </div>
          )}

          {paymentError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {paymentError}
            </div>
          )}

          {/* Informational callout note */}
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-200/70 flex items-start gap-3 text-xs text-[#1B3A5C]">
            <Info className="w-4 h-4 text-[#1B3A5C] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Connected Architecture:</strong> Once created, this event automatically opens dedicated sub-modules for Venue reservation, Vendor contracts, Guest RSVP tables, Staff tasks, Schedule timelines, and Feedback collection. Venues are assigned afterward from the Venues catalog and require paying the confirmation deposit — they can't be attached for free here.
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
              icon={isPaidFlow ? Wallet : Check}
              disabled={submitting}
            >
              {submitting
                ? (isPaidFlow ? 'Redirecting to payment...' : 'Creating...')
                : (isPaidFlow ? `Pay ${PLATFORM_FEE_DISPLAY} & Create Event` : 'Create Event')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
