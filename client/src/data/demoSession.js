const SESSION_KEY = 'eventflow-demo-session'

export function clearDemoSession() {
  window.localStorage.removeItem(SESSION_KEY)
}

export const demoUsers = {
  Organizer: { role: 'Organizer', firstName: 'Meyadur', lastName: 'Rahman', email: 'meyadurrahman777@gmail.com', initials: 'MR' },
  Staff: { role: 'Staff', firstName: 'Tariqul', lastName: 'Islam', email: 'staff@eventflow.io', initials: 'TI' },
  Guest: { role: 'Guest', firstName: 'Salman', lastName: 'Chowdhury', email: 'guest@eventflow.io', initials: 'SC' },
  Admin: { role: 'Admin', firstName: 'Zayid', lastName: 'Karim', email: 'zayid.karim@eventflow.com', initials: 'ZK' },
}

export function saveDemoSession(role, profile = {}) {
  const baseUser = demoUsers[role] || demoUsers.Organizer
  const user = { ...baseUser, ...profile, role }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

export function getDemoSession(role) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null')
    if (stored?.role && (!role || stored.role === role)) return stored
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
  }
  return demoUsers[role] || demoUsers.Organizer
}
