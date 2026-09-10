// eventStore.js — Client-side data layer for events.
// Persists event data to browser localStorage. Provides functions to read, create, and format events.

// LocalStorage key used to store the serialized events array
const EVENTS_KEY = 'eventflow-events'

// Default seed events displayed when no saved data exists in localStorage
export const defaultEvents = [
  { id: 'event-1', category: 'Conference', title: 'Tech Conference 2026', startDate: '2026-10-15', endDate: '2026-10-17', location: 'Grand Convention Hall', guests: 500, progress: 74, status: 'Ongoing', tone: 'blue' },
  { id: 'event-2', category: 'Cultural', title: 'Annual Cultural Night', startDate: '2026-11-20', endDate: '', location: 'Royal Crown Auditorium', guests: 350, progress: 55, status: 'Planned', tone: 'orange' },
  { id: 'event-3', category: 'Wedding', title: 'Wedding Reception', startDate: '2026-12-05', endDate: '', location: 'Lakeview Banquet Center', guests: 250, progress: 80, status: 'Planned', tone: 'rose' },
]

// Retrieve events from localStorage. Falls back to defaultEvents if nothing saved or data is corrupted.
export function getEvents() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(EVENTS_KEY) || 'null')
    // Validate that saved data is an array of objects with id and title strings
    return Array.isArray(saved) && saved.every((event) => event && typeof event.id === 'string' && typeof event.title === 'string') ? saved : defaultEvents
  } catch {
    return defaultEvents
  }
}

// Save the entire events array to localStorage as a JSON string
export function saveEvents(events) {
  window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

// Create a new event from form values, prepend it to the existing list, and persist.
// Returns the updated events array.
export function createEvent(values) {
  const event = {
    id: crypto.randomUUID?.() || `event-${Date.now()}`, // Generate unique ID; fallback for older browsers
    title: values.title.trim(),
    category: values.category,
    startDate: values.startDate,
    endDate: values.endDate,
    location: values.location.trim() || 'Venue to be confirmed',
    guests: Number(values.guests) || 0,
    progress: 0, // New events start at 0% progress
    status: 'Planned',
    tone: 'purple', // Default color theme
  }
  const nextEvents = [event, ...getEvents()]
  saveEvents(nextEvents)
  return nextEvents
}

// Format a start and/or end date into a human-readable string like "Oct 15, 2026 — Dec 5, 2026"
export function formatEventDate(startDate, endDate) {
  const format = (date) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
  if (!startDate) return 'Date to be confirmed'
  return endDate ? `${format(startDate)} — ${format(endDate)}` : format(startDate)
}
