import React, { useState } from 'react';
import { Ban, Hourglass, CheckCircle2, XCircle, CalendarDays, User, Clock } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import DashboardCard from '../component/DashboardCard';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';
import Modal from '../component/Modal';
import FormInput from '../component/FormInput';

function formatDate(value) {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T'));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-rose-100 text-rose-700',
  rejected: 'bg-slate-200 text-slate-600'
};

// The admin side of event cancellation. Organizers can only ever *request*
// (see EventDetails.jsx); approving here is the single action in the app that
// marks an organizer's event cancelled.
export default function AdminCancellations() {
  const { cancellationRequests, reviewCancellationRequest } = useEventFlow();

  const [statusFilter, setStatusFilter] = useState('Pending');
  const [reviewTarget, setReviewTarget] = useState(null); // { request, decision }
  const [reviewNote, setReviewNote] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pending = cancellationRequests.filter((r) => r.status === 'pending');
  const approved = cancellationRequests.filter((r) => r.status === 'approved');
  const rejected = cancellationRequests.filter((r) => r.status === 'rejected');

  const filtered = cancellationRequests.filter((r) => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter.toLowerCase();
  });

  const openReview = (request, decision) => {
    setReviewTarget({ request, decision });
    setReviewNote('');
    setReviewError('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;

    setSubmitting(true);
    setReviewError('');
    try {
      await reviewCancellationRequest(reviewTarget.request.id, reviewTarget.decision, reviewNote.trim());
      setReviewTarget(null);
      setReviewNote('');
    } catch (err) {
      setReviewError(err.message || 'Could not save your decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const isApproving = reviewTarget?.decision === 'approved';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">Cancellation Requests</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Organizers can't cancel their own events — review each request and approve only valid ones
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <DashboardCard
          id="card-pending-cancellations"
          title="Awaiting Review"
          value={pending.length.toString()}
          subtitle="Events still active until approved"
          icon={Hourglass}
          iconBg="bg-amber-50"
          iconColor="text-amber-800"
          badge={pending.length > 0 ? 'Action Required' : undefined}
          badgeType="gold"
        />
        <DashboardCard
          id="card-approved-cancellations"
          title="Approved"
          value={approved.length.toString()}
          subtitle="Events marked cancelled"
          icon={Ban}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
        <DashboardCard
          id="card-rejected-cancellations"
          title="Declined"
          value={rejected.length.toString()}
          subtitle="Events kept active"
          icon={XCircle}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
        />
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={['Pending', 'Approved', 'Rejected', 'All']}
          id="filter-cancellation-status"
        />
        <span className="text-xs font-semibold text-slate-500">
          Showing {filtered.length} of {cancellationRequests.length}
        </span>
      </div>

      {/* Requests */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">
            {cancellationRequests.length === 0 ? 'No cancellation requests' : 'Nothing in this status'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {cancellationRequests.length === 0
              ? 'When an organizer asks to cancel an event, it lands here for review.'
              : 'Try switching the status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              id={`cancellation-request-${r.id}`}
              className={`bg-white rounded-2xl border p-5 shadow-xs ${
                r.status === 'pending' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      requested {formatDate(r.requestedAt)}
                    </span>
                  </div>

                  <h4 className="mt-2 text-base font-bold text-[#1B3A5C] leading-snug">{r.eventTitle}</h4>

                  <div className="mt-1.5 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-800 font-semibold">{r.organizerName}</strong> ({r.organizerEmail})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-[#D4A537] shrink-0" />
                      <span>Event runs {formatDate(r.startDate)} — {formatDate(r.endDate)}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Organizer's reason</p>
                    <p className="text-xs text-slate-700 italic mt-1 leading-relaxed">"{r.reason}"</p>
                  </div>

                  {r.status !== 'pending' && (
                    <p className="mt-2 text-[11px] text-slate-500">
                      {r.status === 'approved' ? 'Approved' : 'Declined'} by{' '}
                      <strong className="text-slate-700">{r.reviewerName || 'an admin'}</strong> on {formatDate(r.reviewedAt)}
                      {r.reviewNote && <> — "{r.reviewNote}"</>}
                    </p>
                  )}
                </div>

                {r.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={XCircle}
                      onClick={() => openReview(r, 'rejected')}
                      id={`btn-reject-${r.id}`}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Ban}
                      onClick={() => openReview(r, 'approved')}
                      id={`btn-approve-${r.id}`}
                    >
                      Approve &amp; Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision modal */}
      <Modal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        title={isApproving ? 'Approve Cancellation' : 'Decline Cancellation'}
        subtitle={reviewTarget?.request.eventTitle}
        id="cancellation-review-modal"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
            isApproving ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            {isApproving ? (
              <>
                <strong>This cancels the event.</strong> "{reviewTarget?.request.eventTitle}" will be marked
                cancelled for {reviewTarget?.request.organizerName}, and it drops out of active planning and
                outstanding payment lists.
              </>
            ) : (
              <>
                <strong>The event stays active.</strong> {reviewTarget?.request.organizerName} keeps running
                "{reviewTarget?.request.eventTitle}" and can file a new request later.
              </>
            )}
          </div>

          {reviewError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {reviewError}
            </div>
          )}

          <FormInput
            label={isApproving ? 'Note for the organizer (optional)' : 'Why are you declining? (optional)'}
            type="textarea"
            rows={3}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder={isApproving
              ? 'e.g. Confirmed with the venue — deposit refund handled separately.'
              : 'e.g. Please try rescheduling with the venue first and get back to us.'}
            helperText="Emailed to the organizer along with your decision."
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setReviewTarget(null)} disabled={submitting}>
              Back
            </Button>
            <Button
              type="submit"
              variant={isApproving ? 'danger' : 'primary'}
              size="sm"
              icon={isApproving ? Ban : XCircle}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isApproving ? 'Approve & Cancel Event' : 'Decline Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
