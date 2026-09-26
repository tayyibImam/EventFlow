import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from '../layout/DashboardLayout';
import AdminLayout from '../layout/AdminLayout';
import StaffLayout from '../layout/StaffLayout';
import GuestLayout from '../layout/GuestLayout';

// Pages
import Dashboard from '../page/Dashboard';
import Events from '../page/Events';
import CreateEvent from '../page/CreateEvent';
import EventDetails from '../page/EventDetails';
import Venues from '../page/Venues';
import Vendors from '../page/Vendors';
import Guests from '../page/Guests';
import Tasks from '../page/Tasks';
import Schedule from '../page/Schedule';
import Feedback from '../page/Feedback';
import StaffTasks from '../page/StaffTasks';
import Invitations from '../page/Invitations';
import AdminDashboard from '../page/AdminDashboard';
import UsersPage from '../page/Users';
import EventCategories from '../page/EventCategories';
import AdminEvents from '../page/AdminEvents';
import AdminVenues from '../page/AdminVenues';
import AdminVendors from '../page/AdminVendors';
import Settings from '../page/Settings';
import Landing from '../page/Landing';
import AuthPlaceholder from '../page/AuthPlaceholder';
import AdminLogin from '../page/AdminLogin';
import RsvpPage from '../page/RsvpPage';
import RequireAdmin from './RequireAdmin';
import RequireRoleOrDemo from './RequireRoleOrDemo';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing & Get Started Page */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<AuthPlaceholder />} />
      <Route path="/signin" element={<AuthPlaceholder />} />

      {/* Guest RSVP — unauthenticated, reached via a per-invite token link
          (stands in for a real emailed invite for now) */}
      <Route path="/rsvp/:token" element={<RsvpPage />} />

      {/* Organizer Routes (Default Flow) — protected against a real admin/staff
          session landing here (e.g. /admin/venues edited down to /venues),
          but still open to unauthenticated demo/perspective-switcher browsing */}
      <Route
        element={
          <RequireRoleOrDemo role="organizer">
            <DashboardLayout />
          </RequireRoleOrDemo>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Admin Portal — separate login, gated behind a real admin session */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="categories" element={<EventCategories />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="venues" element={<AdminVenues />} />
        <Route path="vendors" element={<AdminVendors />} />
      </Route>

      {/* Staff Portal */}
      <Route
        path="/staff"
        element={
          <RequireRoleOrDemo role="staff">
            <StaffLayout />
          </RequireRoleOrDemo>
        }
      >
        <Route index element={<StaffTasks />} />
      </Route>

      {/* Guest Portal */}
      <Route path="/guest" element={<GuestLayout />}>
        <Route index element={<Invitations />} />
      </Route>

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
