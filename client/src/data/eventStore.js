const EVENTS_KEY = 'eventflow-events'

export const defaultEvents = [
  { id: 'event-1', category: 'Conference', title: 'Tech Conference 2026', startDate: '2026-10-15', endDate: '2026-10-17', location: 'Grand Convention Hall', guests: 500, progress: 74, status: 'Ongoing', tone: 'blue' },
  { id: 'event-2', category: 'Cultural', title: 'Annual Cultural Night', startDate: '2026-11-20', endDate: '', location: 'Royal Crown Auditorium', guests: 350, progress: 55, status: 'Planned', tone: 'orange' },
  { id: 'event-3', category: 'Wedding', title: 'Wedding Reception', startDate: '2026-12-05', endDate: '', location: 'Lakeview Banquet Center', guests: 250, progress: 80, status: 'Planned', tone: 'rose' },
]

export function getEvents() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(EVENTS_KEY) || 'null')
    return Array.isArray(saved) && saved.every((event) => event && typeof event.id === 'string' && typeof event.title === 'string') ? saved : defaultEvents
  } catch {
    return defaultEvents
  }
}

export function saveEvents(events) {
  window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

export function createEvent(values) {
  const event = {
    id: crypto.randomUUID?.() || `event-${Date.now()}`,
    title: values.title.trim(),
    category: values.category,
    startDate: values.startDate,
    endDate: values.endDate,
    location: values.location.trim() || 'Venue to be confirmed',
    guests: Number(values.guests) || 0,
    progress: 0,
    status: 'Planned',
    tone: 'purple',
  }
  const nextEvents = [event, ...getEvents()]
  saveEvents(nextEvents)
  return nextEvents
}

export function formatEventDate(startDate, endDate) {
  const format = (date) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
  if (!startDate) return 'Date to be confirmed'
  return endDate ? `${format(startDate)} — ${format(endDate)}` : format(startDate)
}
