// ProgressCard — Planning progress tracker sidebar component.
// Displays completion percentages for Venue, Vendors, Guests, Tasks, and Schedule.
// Shows an overall completion pill and a button to open the event workspace.
import { ArrowUpRight } from 'lucide-react'

// Hardcoded progress data for the featured event (Tech Conference 2026)
const progressItems = [['Venue', 'Completed', 'green'], ['Vendors', 'Completed', 'green'], ['Guests', '72%', 'navy'], ['Tasks', '60%', 'amber'], ['Schedule', '40%', 'sky']]

export default function ProgressCard() {
  return (
    <section className="side-card">
      {/* Card header with title, subtitle, and overall completion percentage */}
      <div className="side-card-heading">
        <div><h2>Planning Progress</h2><p>Focus: Tech Conference 2026</p></div>
        <span className="completion-pill">74% Ready</span>
      </div>
      {/* Individual progress rows */}
      {progressItems.map(([label, value, color]) => (
        <div className="progress-row" key={label}>
          <div><span>{label}</span><strong className={color}>{value}</strong></div>
          {/* Progress bar fill — 100% for completed items, percentage value otherwise */}
          <div className="progress-track thin">
            <span className={`progress-fill ${color}`} style={{ width: value === 'Completed' ? '100%' : value }} />
          </div>
        </div>
      ))}
      {/* CTA button to open event workspace */}
      <button className="outline-button">Open Tech Conference 2026 Workspace <ArrowUpRight size={13} /></button>
    </section>
  )
}
