// EventsPage — Full listing of all events in the organizer's workspace.
// Shows a welcome banner, "Create Event" button, and a grid of all event cards.
// Props: events (array), onBack (callback to return to Dashboard), onCreateEvent (callback)
import { useState } from 'react'
import { ArrowLeft, CalendarDays, Plus } from 'lucide-react'
import EventCard from '../components/EventCard'
import CreateEventModal from '../modal/CreateEventModal'

export default function EventsPage({ events, onBack, onCreateEvent }) {
  const [showModal, setShowModal] = useState(false)
  // Handler: create event and close modal
  const handleCreate = (values) => { onCreateEvent(values); setShowModal(false) }

  return (
    <div className="page-content">
      {/* Welcome banner with title, description, and action buttons */}
      <section className="welcome-banner">
        <div>
          <div className="eyebrow"><CalendarDays size={12} /> Event workspace</div>
          <h1>My Events</h1>
          <p>All the events you are planning and coordinating in one place.</p>
        </div>
        <div className="banner-actions">
          <button className="button button-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Event</button>
          <button className="button button-ghost" onClick={onBack}><ArrowLeft size={15} /> Dashboard</button>
        </div>
      </section>

      {/* All events grid — displays every event from the events array */}
      <section className="events-section all-events-section">
        <div className="section-heading">
          <div><h2>All events</h2><p>{events.length} event{events.length === 1 ? '' : 's'} in your workspace</p></div>
        </div>
        <div className="events-grid">
          {events.map((event) => <EventCard event={event} key={event.id} />)}
        </div>
      </section>

      {/* Conditional rendering: Create Event modal */}
      {showModal && <CreateEventModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  )
}
