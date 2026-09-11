// MetricCard — Reusable metric display widget for dashboard stats.
// Shows an icon, label, value, and optional note. Supports a colored "Active" alert badge.
// Props: icon (React component), label (string), value (number/string), note (string), color (theme), alert (boolean)
export default function MetricCard({ icon: Icon, label, value, note, color, alert }) {
  return (
    <div className="metric-card">
      {/* Colored icon container */}
      <div className={`metric-icon ${color}`}><Icon size={17} /></div>
      {/* Metric label, value, and note */}
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
      {/* Optional "Active" alert badge */}
      {alert && <span className="metric-alert">Active</span>}
    </div>
  )
}
