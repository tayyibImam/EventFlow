import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import Header from '../component/Header';
import { useEventFlow } from '../context/EventFlowContext';

export default function GuestLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentRole, setCurrentRole } = useEventFlow();

  useEffect(() => {
    if (currentRole !== 'guest') {
      setCurrentRole('guest');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Guest &amp; Attendee Portal"
          subtitle="Event invitations, RSVP responses, and post-event feedback"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
