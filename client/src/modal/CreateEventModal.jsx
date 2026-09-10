import { X } from 'lucide-react'

export default function CreateEventModal({ onClose }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">New workspace item</span><h2>Create an event</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><label>Event name<input autoFocus placeholder="e.g. Product launch 2026" /></label><label>Event category<select defaultValue=""><option value="" disabled>Select a category</option><option>Conference</option><option>Wedding</option><option>Cultural</option></select></label><div className="modal-actions"><button className="button button-ghost" onClick={onClose}>Cancel</button><button className="button button-primary" onClick={onClose}>Create event</button></div></div></div>
}
