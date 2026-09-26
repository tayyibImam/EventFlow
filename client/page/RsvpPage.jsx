import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, CheckCircle2, XCircle, Star, Loader2, ShieldAlert } from 'lucide-react';
import Button from '../component/Button';
import StatusBadge from '../component/StatusBadge';
import FormInput from '../component/FormInput';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function mapRsvpDisplay(status) {
  const map = { invited: 'Invited', accepted: 'Accepted', declined: 'Declined', no_response: 'No Response' };
  return map[status] || 'Invited';
}

function formatDateTime(dbDateTime) {
  if (!dbDateTime) return '';
  const d = new Date(dbDateTime.replace(' ', 'T'));
  return `${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

// Fully standalone, unauthenticated page — a guest reaches this via the
// random-token link an organizer copies from the Guests page (there's no
// real email delivery yet, see EventFlowContext's addGuest). No app auth,
// no sidebar/header, no dependency on EventFlowContext.
export default function RsvpPage() {
  const { token } = useParams();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [updating, setUpdating] = useState(false);
  const [rsvpError, setRsvpError] = useState('');

  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/rsvp/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('This invitation link is invalid or has expired.');
        return res.json();
      })
      .then(setInvite)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRsvp = async (status) => {
    setRsvpError('');
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/rsvp/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvp_status: status })
      });
      if (!res.ok) throw new Error('Could not update your RSVP. Please try again.');
      const updated = await res.json();
      setInvite((prev) => ({ ...prev, rsvp_status: updated.rsvp_status }));
    } catch (err) {
      setRsvpError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');

    if (!feedbackForm.comment.trim()) {
      setFeedbackError('Please add a short comment.');
      return;
    }

    setFeedbackSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/rsvp/${token}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: feedbackForm.rating, comment: feedbackForm.comment })
      });
      if (!res.ok) throw new Error('Could not submit your feedback. Please try again.');
      setFeedbackSubmitted(true);
    } catch (err) {
      setFeedbackError(err.message);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="w-6 h-6 text-[#1B3A5C] animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-800">Invitation Not Found</h1>
          <p className="text-sm text-slate-500 mt-2">{loadError}</p>
        </div>
      </div>
    );
  }

  const rsvpStatus = mapRsvpDisplay(invite.rsvp_status);
  const eventHasStarted = invite.start_datetime
    ? new Date() >= new Date(invite.start_datetime.replace(' ', 'T'))
    : false;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#1B3A5C] text-[#D4A537] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#1B3A5C]">You're Invited</h1>
          <p className="text-sm text-slate-500 mt-1">Hi {invite.guest_name}, here are your invitation details.</p>
        </div>

        {/* Event Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">{invite.title}</h2>
            <StatusBadge status={rsvpStatus} size="sm" />
          </div>

          {invite.description && (
            <p className="text-sm text-slate-600">{invite.description}</p>
          )}

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4A537] shrink-0" />
              <span>{formatDateTime(invite.start_datetime)}</span>
            </div>
            {invite.venue_name && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{invite.venue_name}{invite.venue_city ? `, ${invite.venue_city}` : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* RSVP Actions */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Will you be attending?</h3>

          {rsvpError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {rsvpError}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant={rsvpStatus === 'Accepted' ? 'primary' : 'outline'}
              icon={CheckCircle2}
              disabled={updating}
              onClick={() => handleRsvp('accepted')}
            >
              Accept
            </Button>
            <Button
              variant={rsvpStatus === 'Declined' ? 'danger' : 'outline'}
              icon={XCircle}
              disabled={updating}
              onClick={() => handleRsvp('declined')}
            >
              Decline
            </Button>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Share Your Feedback</h3>

          {!eventHasStarted ? (
            <p className="text-xs text-slate-400">
              Feedback opens up once the event has started.
            </p>
          ) : feedbackSubmitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold text-center">
              Thanks — your feedback has been submitted!
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              {feedbackError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
                  {feedbackError}
                </div>
              )}

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= feedbackForm.rating ? 'fill-[#D4A537] text-[#D4A537]' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
                <span className="ml-1 text-sm font-bold text-[#1B3A5C]">{feedbackForm.rating} out of 5</span>
              </div>

              <FormInput
                label="Comments"
                type="textarea"
                rows={4}
                value={feedbackForm.comment}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                placeholder="How was the venue, organization, and overall experience?"
                required
              />

              <Button type="submit" variant="primary" disabled={feedbackSubmitting}>
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400">
          EventFlow &bull; This link is unique to you — no account needed.
        </p>
      </div>
    </div>
  );
}
