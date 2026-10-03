import React from 'react';
import { HelpCircle, X, Mail, BookOpen, ChevronRight } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';

const HELP_CONTENT = {
  organizer: {
    title: 'Organizer Help Center',
    intro: 'Guidance for planning events, booking venues/vendors, and coordinating staff and guests.',
    faqs: [
      { q: 'How do I create a new event?', a: 'Go to "My Events" and click "Create Event". Fill in the details, then book a venue and vendors from the Venues and Vendors pages.' },
      { q: 'How do guests RSVP?', a: 'Invite links are generated from the Guests page and sent by email — guests respond on their own RSVP page, no account needed.' },
      { q: 'How do I assign tasks to staff?', a: 'Open the Tasks page, create a task, and assign it to a staff member from your directory. They’ll see it on their Staff Portal.' }
    ]
  },
  admin: {
    title: 'Administrator Help Center',
    intro: 'Guidance for managing users, event categories, and the platform-wide venue/vendor directory.',
    faqs: [
      { q: 'How do I add a staff or admin account?', a: 'Staff/admin accounts are provisioned directly in the database — public sign-up always creates an Organizer account.' },
      { q: 'How do I manage event categories?', a: 'Use "Event Categories" in the sidebar to add, edit, or retire the categories organizers can choose from when creating an event.' },
      { q: 'Where can I audit all events on the platform?', a: '"All Events" gives a cross-organizer view of every event, independent of who created it.' }
    ]
  },
  staff: {
    title: 'Staff Help Center',
    intro: 'Guidance for managing your assigned tasks and staying on top of event-day duties.',
    faqs: [
      { q: 'Where do I see my assigned tasks?', a: '"My Tasks" lists everything assigned to you, with due dates and status. Mark items "In Progress" or "Done" as you complete them.' },
      { q: 'Who do I contact if a task is unclear?', a: 'Reach out to the organizer who assigned it — their contact details are shown on the task card.' }
    ]
  },
  guest: {
    title: 'Guest Help Center',
    intro: 'Guidance for responding to invitations and tracking the events you’re attending.',
    faqs: [
      { q: 'How do I RSVP to an event?', a: 'Open the invite link sent to your email — it takes you straight to that event’s RSVP page, no account needed.' },
      { q: 'Can I change my RSVP after submitting?', a: 'Yes, reopen your invite link any time before the event and submit an updated response.' },
      { q: 'How do I leave feedback after an event?', a: 'Use the Feedback page from your Guest Portal once the event has concluded.' }
    ]
  }
};

export default function HelpModal({ isOpen, onClose }) {
  const { currentRole } = useEventFlow();
  const content = HELP_CONTENT[currentRole] || HELP_CONTENT.organizer;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="help-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
        id="help-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#1B3A5C]/10 text-[#1B3A5C] flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1B3A5C]" id="help-modal-title">
              {content.title}
            </h3>
            <p className="text-xs text-slate-500">
              {content.intro}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {content.faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl"
            >
              <summary className="flex items-center justify-between gap-2 text-xs font-bold text-slate-800 cursor-pointer list-none">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#1B3A5C] shrink-0" />
                  {faq.q}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-2.5 pl-5.5">
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <a
            href="mailto:support@eventflow.app"
            className="flex items-center gap-2 text-xs font-semibold text-[#1B3A5C] hover:text-[#152e4a] transition-colors"
          >
            <Mail className="w-4 h-4" />
            support@eventflow.app
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            id="btn-close-help"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
