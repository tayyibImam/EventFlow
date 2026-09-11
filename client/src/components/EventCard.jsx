// EventCard — Displays a single event's details in a card layout.
// Shows category/status tags, title, date, location, guest count, and planning progress bar.
// Props: event (object with title, category, date, location, guests, progress, status, tone)
import { ArrowUpRight, CalendarDays, ClipboardCheck, Users } from 'lucide-react'
import BuildingIcon from './BuildingIcon'
import { formatEventDate } from '../data/eventStore'

export default function EventCard({ event }) {
  // Normalize guest count to a display string
  const guests = typeof event.guests === 'number' ? `${event.guests} expected guests` : event.guests
  return (
    <article className="event-card">
      {/* Category tag with colored dot + status tag */}
      <div className="event-card-top">
        <span className={`category-tag ${event.tone}`}><span className="category-dot" />{event.category}</span>
        <span className={`status-tag ${event.status.toLowerCase()}`}>{event.status}</span>
      </div>
      {/* Event title */}
      <h3>{event.title}</h3>
      {/* Event date — uses custom format if startDate/endDate, else falls back to event.date */}
      <div className="event-detail"><CalendarDays size={13} /><span>{event.date || formatEventDate(event.startDate, event.endDate)}</span></div>
      {/* Event location */}
      <div className="event-detail"><BuildingIcon width={14} height={14} /><span>{event.location}</span></div>
      {/* Guest count */}
      <div className="event-detail"><Users size={13} /><span>{guests}</span></div>
      {/* Planning progress bar */}
      <div className="progress-label"><span><ClipboardCheck size={12} /> Planning progress</span><strong>{event.progress}%</strong></div>
      <div className="progress-track"><span className={`progress-fill ${event.tone}`} style={{ width: `${event.progress}%` }} /></div>
      {/* View event button */}
      <div className="event-footer"><button className="text-button" type="button">View event <ArrowUpRight size={13} /></button></div>
    </article>
  )
}
