import { ArrowUpRight } from 'lucide-react'

const progressItems = [['Venue', 'Completed', 'green'], ['Vendors', 'Completed', 'green'], ['Guests', '72%', 'navy'], ['Tasks', '60%', 'amber'], ['Schedule', '40%', 'sky']]

export default function ProgressCard() {
  return <section className="side-card"><div className="side-card-heading"><div><h2>Planning Progress</h2><p>Focus: Tech Conference 2026</p></div><span className="completion-pill">74% Ready</span></div>{progressItems.map(([label, value, color]) => <div className="progress-row" key={label}><div><span>{label}</span><strong className={color}>{value}</strong></div><div className="progress-track thin"><span className={`progress-fill ${color}`} style={{ width: value === 'Completed' ? '100%' : value }} /></div></div>)}<button className="outline-button">Open Tech Conference 2026 Workspace <ArrowUpRight size={13} /></button></section>
}
