// demoSession.js — Client-side session management for demo user accounts.
// Stores the current user session in localStorage. Defines four default roles: Organizer, Staff, Guest, Admin.

// LocalStorage key used to persist the demo session
const SESSION_KEY = 'eventflow-demo-session'

// Default profile data for each role. Used when no saved session exists.
export const demoUsers = {
  Organizer: { role: 'Organizer', firstName: 'Meyadur', lastName: 'Rahman', email: 'meyadurrahman777@gmail.com', initials: 'MR' },
  Staff: { role: 'Staff', firstName: 'Tariqul', lastName: 'Islam', email: 'staff@eventflow.io', initials: 'TI' },
  Guest: { role: 'Guest', firstName: 'Salman', lastName: 'Chowdhury', email: 'guest@eventflow.io', initials: 'SC' },
  Admin: { role: 'Admin', firstName: 'Zayid', lastName: 'Karim', email: 'zayid.karim@eventflow.com', initials: 'ZK' },
}

// Save a demo session to localStorage. Merges any custom profile overrides with the default role data.
// Returns the saved user object.
export function saveDemoSession(role, profile = {}) {
  const baseUser = demoUsers[role] || demoUsers.Organizer
  const user = { ...baseUser, ...profile, role }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

// Retrieve a demo session from localStorage. Returns the stored session if it matches the requested role,
// otherwise falls back to the default profile for that role.
export function getDemoSession(role) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null')
    // Return stored session if it exists and matches the requested role (or any role if none specified)
    if (stored?.role && (!role || stored.role === role)) return stored
  } catch {
    window.localStorage.removeItem(SESSION_KEY) // Clean up corrupted data
  }
  return demoUsers[role] || demoUsers.Organizer
}
