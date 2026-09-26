import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEventFlow } from '../context/EventFlowContext';

// Gates the /admin/* routes behind a real backend-verified admin session —
// the old behavior let anyone visiting /admin in as admin via the demo
// perspective switcher, with no real auth check.
export default function RequireAdmin({ children }) {
  const { authToken, realUser } = useEventFlow();

  if (!authToken || !realUser || realUser.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
