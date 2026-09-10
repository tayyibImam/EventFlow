import { useState } from 'react'
import { ArrowUpRight, CalendarDays, ClipboardCheck, Clock3, Plus, Sparkles, Users } from 'lucide-react'
import ActivityCard from '../components/ActivityCard'
import EventCard from '../components/EventCard'
import MetricCard from '../components/MetricCard'
import ProgressCard from '../components/ProgressCard'
import CreateEventModal from '../modal/CreateEventModal'

const events = [
  { category: 'Conference', title: 'xcsdf', date: 'Sep 18, 2026 — Sep 24, 2026', location: 'Grand Convention Hall', guests: '250 Confirmed / Expected Guests', progress: 34, status: 'Planned', tone: 'purple' },
  { category: 'Conference', title: 'Tech Conference 2026', date: 'Oct 15, 2026 — Oct 17, 2026', location: 'Grand Convention Hall', guests: '500 Confirmed / Expected Guests', progress: 74, status: 'Ongoing', tone: 'blue' },
  { category: 'Cultural', title: 'Annual Cultural Night', date: 'Nov 20, 2026', location: 'Royal Crown Auditorium', guests: '350 Confirmed / Expected Guests', progress: 55, status: 'Planned', tone: 'orange' },
  { category: 'Wedding', title: 'Wedding Reception', date: 'Dec 5, 2026', location: 'Lakeview Banquet Center', guests: '250 Confirmed / Expected Guests', progress: 80, status: 'Planned', tone: 'rose' },
]

export default function Dashboard({ user }) {
  const [showModal, setShowModal] = useState(false)
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Meyadur Rahman'

  return <div className="page-content"><section className="welcome-banner"><div><div className="eyebrow"><Sparkles size={12} /> Event Operations Control</div><h1>Welcome back, {displayName}</h1><p>Track multi-track schedules, vendors, guest rosters, and tasks across Tech Conference 2026 and upcoming summits from one central unified dashboard.</p></div><div className="banner-actions"><button className="button button-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Event</button><button className="button button-ghost"><ArrowUpRight size={15} /> Assign Task</button></div></section><section className="metrics-grid" aria-label="Event overview"><MetricCard icon={CalendarDays} label="Total Events" value="12" note="Across 8 categories" color="navy" /><MetricCard icon={Clock3} label="Upcoming Events" value="4" note="Next: Tech Conference '26" color="sky" alert /><MetricCard icon={ClipboardCheck} label="Pending Tasks" value="18" note="5 high priority today" color="amber" /><MetricCard icon={Users} label="Confirmed Guests" value="126" note="72% target RSVP rate" color="green" /></section><div className="content-grid"><section className="events-section"><div className="section-heading"><div><h2>Upcoming Events</h2><p>Scheduled conferences, cultural evenings, and executive gatherings</p></div><button className="text-button">View All Events <ArrowUpRight size={14} /></button></div><div className="events-grid">{events.map((event) => <EventCard event={event} key={event.title} />)}</div></section><aside className="right-column"><ProgressCard /><ActivityCard /></aside></div>{showModal && <CreateEventModal onClose={() => setShowModal(false)} />}</div>
}
