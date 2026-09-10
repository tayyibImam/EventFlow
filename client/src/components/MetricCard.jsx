export default function MetricCard({ icon: Icon, label, value, note, color, alert }) {
  return <div className="metric-card"><div className={`metric-icon ${color}`}><Icon size={17} /></div><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>{alert && <span className="metric-alert">Active</span>}</div>
}
