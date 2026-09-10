// ActivityCard — Displays a feed of recent activity items in the sidebar.
// Shows timed events like guest RSVPs, vendor bookings, task completions, and schedule updates.
// Each item has an icon with a color-coded background based on activity type.
import { Activity, CalendarDays, CheckCircle2, ClipboardCheck, Users } from 'lucide-react'

// Hardcoded activity items (will later be replaced by real-time data from the backend)
const activityItems = [
  [CheckCircle2, 'green', 'Guest accepted invitation', 'Dr. Salman Chowdhury confirmed attendance for Tech Conference 2026', '10 minutes ago'],
  [Users, 'sky', 'Vendor booking confirmed', 'Rafiqul Sound & Stage signed equipment rider for Main Auditorium', '45 minutes ago'],
  [ClipboardCheck, 'amber', 'Staff completed task', "Tanvir Hasan marked 'Confirm catering head count' as Done", '2 hours ago'],
  [CalendarDays, 'purple', 'New task assigned', "'Configure Livestream CDN & AV' assigned to Farhan Ahmed", '3 hours ago'],
  [CalendarDays, 'purple', 'Schedule updated', 'Keynote speech duration adjusted to 75 minutes', '5 hours ago'],
]

export default function ActivityCard() {
  return (
    <section className="side-card activity-card">
      {/* Card header with title and "View all" button */}
      <div className="side-card-heading">
        <div><h2><Activity size={15} /> Recent Activity</h2><p>Latest updates from your workspace</p></div>
        <button className="text-button">View all</button>
      </div>
      {/* Activity item list */}
      <div className="activity-list">
        {activityItems.map(([Icon, color, title, detail, time]) => (
          <div className="activity-item" key={title}>
            {/* Color-coded icon */}
            <span className={`activity-icon ${color}`}><Icon size={14} /></span>
            <div>
              <strong>{title}</strong>
              <p>{detail}</p>
              <small>{time}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
