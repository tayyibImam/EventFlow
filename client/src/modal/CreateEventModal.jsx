import { useState } from 'react'
import { X } from 'lucide-react'

export default function CreateEventModal({ onClose, onCreate }) {
  const [values, setValues] = useState({ title: '', category: '', startDate: '', endDate: '', location: '', guests: '' })
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = (event) => {
    event.preventDefault()
    onCreate(values)
  }

  return <div className="modal-backdrop" onClick={onClose}><form className="modal" onSubmit={submit} onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">New workspace item</span><h2>Create an event</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><label>Event name<input autoFocus name="title" value={values.title} onChange={update} placeholder="e.g. Product launch 2026" required /></label><label>Event category<select name="category" value={values.category} onChange={update} required><option value="" disabled>Select a category</option><option>Conference</option><option>Wedding</option><option>Cultural</option><option>Corporate</option><option>Workshop</option></select></label><div className="form-grid modal-grid"><label>Start date<input name="startDate" type="date" value={values.startDate} onChange={update} required /></label><label>End date <small className="optional-label">(optional)</small><input name="endDate" type="date" value={values.endDate} onChange={update} min={values.startDate} /></label></div><label>Venue <small className="optional-label">(optional)</small><input name="location" value={values.location} onChange={update} placeholder="e.g. Grand Convention Hall" /></label><label>Expected guests <small className="optional-label">(optional)</small><input name="guests" type="number" min="0" value={values.guests} onChange={update} placeholder="e.g. 250" /></label><div className="modal-actions"><button className="button button-ghost" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Create event</button></div></form></div>
}
