import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import Modal from './Modal';
import FormInput from './FormInput';
import Button from './Button';
import { useEventFlow } from '../context/EventFlowContext';

// Lets a staff member leave a note on their own task's progress, either
// midway through ("In Progress", unlimited) or once it's wrapped up
// ("Completed", one-time) — this goes straight to the organizer's Staff
// Feedback tab, not the task record itself. Submitting "Completed" also
// flips the task's own status to Done (see EventFlowContext#addTaskFeedback)
// — and once a task is Done, no further feedback of any stage is accepted
// (enforced server-side too — see taskFeedback.controller.js), so this modal
// just shows a closed state instead of a form in that case.
export default function TaskFeedbackModal({ isOpen, onClose, task }) {
  const { addTaskFeedback } = useEventFlow();

  const isDone = task?.status === 'Done';

  const [stage, setStage] = useState('In Progress');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      setStage('In Progress');
      setComment('');
      setSubmitted(false);
      setSubmitError('');
    }
  }, [isOpen, task]);

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await addTaskFeedback({ taskId: task.id, stage, comment: comment.trim() });
      setSubmitted(true);
      setComment('');
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1200);
    } catch (err) {
      setSubmitError(err.message || 'Could not submit your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Give Feedback on This Task"
      subtitle="Let your organizer know how it's going, midway or once it's done"
      id="task-feedback-modal"
    >
      {isDone ? (
        <div className="py-8 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">This task is marked Done</p>
          <p className="text-xs text-slate-500 max-w-xs">
            Feedback closes once a task is completed — your one-time completion note already covered this one.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : submitted ? (
        <div className="py-8 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#1B3A5C]">Feedback sent to your organizer</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs font-bold text-slate-800">{task.title}</p>
            {task.eventTitle && (
              <p className="text-[11px] text-slate-500 mt-0.5">Event: {task.eventTitle}</p>
            )}
          </div>

          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <FormInput
            label="Feedback Stage"
            type="select"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            options={['In Progress', 'Completed']}
            helperText="Progress updates are unlimited. Completed is one-time only — it marks the task Done and closes feedback for good."
            required
          />

          <FormInput
            label="Your Feedback"
            type="textarea"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Catering headcount confirmed with the venue, waiting on final vendor sign-off..."
            required
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Send} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
