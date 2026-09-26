import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEventFlow } from '../context/EventFlowContext';

const HOME_BY_ROLE = { admin: '/admin', organizer: '/dashboard', staff: '/staff' };

// Guards the organizer (/dashboard, /events, /venues, ...) and staff (/staff)
// route trees against a real, logged-in user of a DIFFERENT role landing on
// them — e.g. an admin editing /admin/venues down to /venues would otherwise
// land straight on the organizer's unguarded Venues page.
//
// Unauthenticated/demo visitors (no authToken) are let through unchanged —
// the app's role-picker demo mode (Quick Fill / currentRole switcher) relies
// on browsing these pages without a real backend session, and this guard
// only exists to stop a *real* session from crossing into another role's
// pages, not to require login here.
export default function RequireRoleOrDemo({ role, children }) {
  const { authToken, realUser } = useEventFlow();

  if (authToken && realUser && realUser.role !== role) {
    return <Navigate to={HOME_BY_ROLE[realUser.role] || '/'} replace />;
  }

  return children;
}
