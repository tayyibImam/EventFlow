import { useState } from 'react'
import { Activity, ArrowUpRight, BarChart3, CheckCircle2, ChevronRight, Database, FileText, Plus, ShieldCheck, Users } from 'lucide-react'
import MetricCard from '../components/MetricCard'

const auditRows = [
  ['xcsdf', 'Meyadur Rahman', 'Grand Convention Hall', 'Conference', 'Planned'],
  ['Tech Conference 2026', 'Meyadur Rahman', 'Grand Convention Hall', 'Conference', 'Ongoing'],
  ['Annual Cultural Night', 'Meyadur Rahman', 'Royal Crown Auditorium', 'Cultural', 'Planned'],
  ['Wedding Reception', 'Meyadur Rahman', 'Lakeview Banquet Center', 'Wedding', 'Planned'],
  ['Executive Meetup', 'Meyadur Rahman', 'Lakeside Center', 'Corporate', 'Planned'],
  ['National Education Campaign', 'Meyadur Rahman', 'City Convention Center', 'Workshop', 'Completed'],
  ['Green Tech Venture Summit', 'Meyadur Rahman', 'Innovation Hub', 'Conference', 'Completed'],
]

const globalActivity = [
  ['Guest accepted invitation', 'Dr. Salman Chowdhury confirmed attendance for Tech Conference 2026', '10 minutes ago', 'green'],
  ['Vendor booking confirmed', 'Rafiqul Sound & Stage signed equipment rider for Main Auditorium', '45 minutes ago', 'blue'],
  ['Staff completed task', "Tanvir Hasan marked 'Confirm catering head count' as Done", '2 hours ago', 'amber'],
  ['New task assigned', "'Configure Livestream CDN & AV' assigned to Farhan Ahmed", '3 hours ago', 'purple'],
  ['Schedule updated', 'Keynote speech duration adjusted to 75 minutes', '5 hours ago', 'sky'],
]

export default function AdminDashboard() {
  const [showModal, setShowModal] = useState(false)

  return <div className="page-content admin-page"><section className="welcome-banner admin-banner"><div><div className="eyebrow"><ShieldCheck size={12} /> EventFlow System Control</div><h1>EventFlow System Control</h1><p>Monitor platform activity, manage users, and maintain visibility across every event and operational workspace.</p></div><div className="banner-actions"><button className="button button-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Manage Users</button><button className="button button-ghost"><ArrowUpRight size={15} /> Event Categories</button></div></section><section className="metrics-grid admin-metrics" aria-label="Platform overview"><MetricCard icon={Database} label="Total Platform Events" value="12" note="Across 8 categories" color="navy" /><MetricCard icon={Users} label="Registered Users" value="8" note="Organizers, Staff, Guests" color="sky" /><MetricCard icon={BarChart3} label="Ongoing Events" value="6" note="Conf., Cultural, Activities" color="amber" /><MetricCard icon={ShieldCheck} label="Platform Health" value="8" note="All systems operational" color="green" /></section><div className="admin-content-grid"><section className="audit-card"><div className="section-heading"><div><h2>Platform Event Registry &amp; Compliance Audit</h2><p>Review every event and its ownership, category, venue, and status.</p></div><button className="text-button">All Events <ChevronRight size={13} /></button></div><div className="audit-table-wrap"><table className="audit-table"><thead><tr><th>Event</th><th>Organizer</th><th>Venue</th><th>Category</th><th>Status</th></tr></thead><tbody>{auditRows.map(([event, organizer, venue, category, status]) => <tr key={event}><td><strong>{event}</strong></td><td>{organizer}</td><td>{venue}</td><td>{category}</td><td><span className={`audit-status ${status.toLowerCase()}`}>{status}</span></td></tr>)}</tbody></table></div></section><aside className="admin-side-column"><section className="side-card architecture-card"><div className="side-card-heading"><div><h2><Database size={14} /> Platform Architecture Status</h2><p>System health overview</p></div><span className="health-pill">Online</span></div>{[['Frontend Environment', 'Online · Healthy'], ['Design System', 'Healthy · Gold accents'], ['Storage Infrastructure', 'Operational · Protected'], ['Public Read Access', 'Active · Secure']].map(([label, value]) => <div className="architecture-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section><section className="side-card global-activity"><div className="side-card-heading"><div><h2><Activity size={14} /> Global Audit Stream</h2><p>Latest platform activity</p></div><button className="text-button">View all</button></div><div className="admin-activity-list">{globalActivity.map(([title, detail, time, color]) => <div className="admin-activity-item" key={title}><span className={`activity-icon ${color}`}><CheckCircle2 size={13} /></span><div><strong>{title}</strong><p>{detail}</p><small>{time}</small></div></div>)}</div></section></aside></div>{showModal && <div className="modal-backdrop" onClick={() => setShowModal(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">Administration</span><h2>Manage users</h2></div><button className="icon-button" onClick={() => setShowModal(false)} aria-label="Close">×</button></div><label>Search users<input autoFocus placeholder="Search by name or email" /></label><div className="modal-actions"><button className="button button-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="button button-primary" onClick={() => setShowModal(false)}>Open user management</button></div></div></div>}</div>
}
