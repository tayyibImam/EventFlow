import { useState } from 'react'
import { ArrowUpRight, CalendarDays, ClipboardCheck, Clock3, Plus, Sparkles, Users } from 'lucide-react'
import ActivityCard from '../components/ActivityCard'
import EventCard from '../components/EventCard'
import MetricCard from '../components/MetricCard'
import ProgressCard from '../components/ProgressCard'
import CreateEventModal from '../modal/CreateEventModal'

export default function Dashboard({ user, events, onCreateEvent, onShowEvents }) {
  const [showModal, setShowModal] = useState(false)
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Meyadur Rahman'
  const upcomingCount = events.filter((event) => event.status !== 'Completed').length
  const guestCount = events.reduce((total, event) => total + (Number(event.guests) || 0), 0)
  const handleCreate = (values) => { onCreateEvent(values); setShowModal(false) }

  return <div className="page-content"><section className="welcome-banner"><div><div className="eyebrow"><Sparkles size={12} /> Event Operations Control</div><h1>Welcome back, {displayName}</h1><p>Track schedules, vendors, guest rosters, and tasks for every event from one unified dashboard.</p></div><div className="banner-actions"><button className="button button-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Event</button><button className="button button-ghost" onClick={onShowEvents}><ArrowUpRight size={15} /> My Events</button></div></section><section className="metrics-grid" aria-label="Event overview"><MetricCard icon={CalendarDays} label="Total Events" value={events.length} note="In your workspace" color="navy" /><MetricCard icon={Clock3} label="Upcoming Events" value={upcomingCount} note="Planned and ongoing" color="sky" alert /><MetricCard icon={ClipboardCheck} label="Pending Tasks" value="18" note="5 high priority today" color="amber" /><MetricCard icon={Users} label="Expected Guests" value={guestCount} note="Across all events" color="green" /></section><div className="content-grid"><section className="events-section"><div className="section-heading"><div><h2>Upcoming Events</h2><p>Scheduled conferences, cultural evenings, and executive gatherings</p></div><button className="text-button" type="button" onClick={onShowEvents}>View All Events <ArrowUpRight size={14} /></button></div><div className="events-grid">{events.slice(0, 4).map((event) => <EventCard event={event} key={event.id} />)}</div></section><aside className="right-column"><ProgressCard /><ActivityCard /></aside></div>{showModal && <CreateEventModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}</div>
}
