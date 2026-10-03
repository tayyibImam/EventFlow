import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import FormInput from './FormInput';
import Button from './Button';
import { useEventFlow } from '../context/EventFlowContext';

// Lets a staff member leave a note on their own task's progress, either
// midway through ("In Progress") or once it's wrapped up ("Completed") —
// this goes straight to the organizer's Staff Feedback tab, not the task
// record itself.
export default function TaskFeedbackModal({ isOpen, onClose, task }) {
  const { addTaskFeedback } = useEventFlow();

  const [stage, setStage] = useState('In Progress');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setStage(task.status === 'Done' ? 'Completed' : 'In Progress');
      setComment('');
      setSubmitted(false);
    }
  }, [isOpen, task]);

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await addTaskFeedback({ taskId: task.id, stage, comment: comment.trim() });
      setSubmitted(true);
      setComment('');
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1200);
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
      {submitted ? (
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

          <FormInput
            label="Feedback Stage"
            type="select"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            options={['In Progress', 'Completed']}
            helperText="Choose whether this is a midway update or your final/completion note."
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
