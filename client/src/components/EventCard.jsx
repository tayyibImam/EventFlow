import { ArrowUpRight, CalendarDays, ClipboardCheck, Users } from 'lucide-react'
import BuildingIcon from './BuildingIcon'

export default function EventCard({ event }) {
  return <article className="event-card"><div className="event-card-top"><span className={`category-tag ${event.tone}`}><span className="category-dot" />{event.category}</span><span className={`status-tag ${event.status.toLowerCase()}`}>{event.status}</span></div><h3>{event.title}</h3><div className="event-detail"><CalendarDays size={13} /><span>{event.date}</span></div><div className="event-detail"><BuildingIcon width={14} height={14} /><span>{event.location}</span></div><div className="event-detail"><Users size={13} /><span>{event.guests}</span></div><div className="progress-label"><span><ClipboardCheck size={12} /> Planning progress</span><strong>{event.progress}%</strong></div><div className="progress-track"><span className={`progress-fill ${event.tone}`} style={{ width: `${event.progress}%` }} /></div><div className="event-footer"><button className="text-button">View event <ArrowUpRight size={13} /></button></div></article>
}
