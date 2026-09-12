import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialEvents,
  initialVenues,
  initialVendors,
  initialGuests,
  initialTasks,
  initialSchedule,
  initialFeedback,
  initialUsers,
  initialCategories,
  initialActivities
} from '../data/mockData';

const EventFlowContext = createContext(null);

export function EventFlowProvider({ children }) {
  // Current user role for demonstration: 'organizer' | 'admin' | 'staff' | 'guest'
  const [currentRole, setCurrentRole] = useState('organizer');

  // Authentication session state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('eventflow_authenticated');
    return saved !== 'false';
  });

  // Currently logged-in profile per role (all male persona as requested)
  const currentProfile = {
    organizer: {
      name: "Meyadur Rahman",
      title: "Lead Event Organizer",
      role: "Organizer",
      email: "meyadurrahman777@gmail.com",
      avatar: "MR"
    },
    admin: {
      name: "Zayd Karim",
      title: "Platform Administrator",
      role: "Admin",
      email: "zayd@imperialdecor.com",
      avatar: "ZK"
    },
    staff: {
      name: "Tariqul Islam",
      title: "Senior Operations Coordinator",
      role: "Staff",
      email: "tariqul.islam@eventflow.org",
      avatar: "TI"
    },
    guest: {
      name: "Dr. Salman Chowdhury",
      title: "Keynote Speaker & Guest",
      role: "Guest",
      email: "salman.chowdhury@techasia.org",
      avatar: "SC"
    }
  };

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('eventflow_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [venues, setVenues] = useState(() => {
    const saved = localStorage.getItem('eventflow_venues');
    return saved ? JSON.parse(saved) : initialVenues;
  });

  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem('eventflow_vendors');
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem('eventflow_guests');
    return saved ? JSON.parse(saved) : initialGuests;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('eventflow_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('eventflow_schedule');
    return saved ? JSON.parse(saved) : initialSchedule;
  });

  const [feedback, setFeedback] = useState(() => {
    const saved = localStorage.getItem('eventflow_feedback');
    return saved ? JSON.parse(saved) : initialFeedback;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('eventflow_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('eventflow_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('eventflow_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  // Global selected event filter (for header event selector)
  const [selectedEventId, setSelectedEventId] = useState('all');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('eventflow_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('eventflow_venues', JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('eventflow_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('eventflow_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('eventflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('eventflow_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('eventflow_feedback', JSON.stringify(feedback));
  }, [feedback]);

  useEffect(() => {
    localStorage.setItem('eventflow_categories', JSON.stringify(categories));
  }, [categories]);

  // Actions
  const addEvent = (newEvent) => {
    const eventObj = {
      ...newEvent,
      id: `evt-${Date.now()}`,
      progress: {
        venue: 100,
        vendors: 40,
        guests: 20,
        tasks: 10,
        schedule: 0,
        overall: 34
      },
      organizer: currentProfile.organizer.name
    };
    setEvents(prev => [eventObj, ...prev]);

    // Add activity
    addActivity({
      title: "New event created",
      description: `Event "${eventObj.title}" was scheduled at ${eventObj.venue}`,
      type: "event"
    });

    return eventObj;
  };

  const updateEvent = (id, updatedFields) => {
    setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...updatedFields } : evt));
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(evt => evt.id !== id));
  };

  const addGuest = (newGuest) => {
    const guestObj = {
      ...newGuest,
      id: `gst-${Date.now()}`
    };
    setGuests(prev => [guestObj, ...prev]);

    addActivity({
      title: "New guest added",
      description: `${guestObj.name} was registered for the guest list`,
      type: "guest"
    });
    return guestObj;
  };

  const updateGuestRSVP = (guestId, newRSVP) => {
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, rsvpStatus: newRSVP } : g));
    const target = guests.find(g => g.id === guestId);
    if (target) {
      addActivity({
        title: "Guest RSVP updated",
        description: `${target.name} marked RSVP as ${newRSVP}`,
        type: "guest"
      });
    }
  };

  const addTask = (newTask) => {
    const taskObj = {
      ...newTask,
      id: `tsk-${Date.now()}`,
      status: newTask.status || "Pending"
    };
    setTasks(prev => [taskObj, ...prev]);

    addActivity({
      title: "New task assigned",
      description: `"${taskObj.title}" assigned to ${taskObj.assignedTo}`,
      type: "task"
    });
    return taskObj;
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      addActivity({
        title: "Task status changed",
        description: `"${target.title}" moved to ${newStatus}`,
        type: "task"
      });
    }
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const addScheduleItem = (newItem) => {
    const itemObj = {
      ...newItem,
      id: `sch-${Date.now()}`
    };
    setSchedule(prev => [...prev, itemObj].sort((a, b) => a.startTime.localeCompare(b.startTime)));

    addActivity({
      title: "Schedule updated",
      description: `Added "${itemObj.activity}" (${itemObj.startTime} - ${itemObj.endTime})`,
      type: "schedule"
    });
    return itemObj;
  };

  const deleteScheduleItem = (itemId) => {
    setSchedule(prev => prev.filter(s => s.id !== itemId));
  };

  const addFeedback = (newFb) => {
    const fbObj = {
      ...newFb,
      id: `fb-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setFeedback(prev => [fbObj, ...prev]);

    addActivity({
      title: "New feedback received",
      description: `${fbObj.guestName} submitted a ${fbObj.rating}-star review`,
      type: "feedback"
    });
    return fbObj;
  };

  const assignVenueToEvent = (venueId, eventId) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    setVenues(prev => prev.map(v => {
      if (v.id === venueId) {
        return {
          ...v,
          bookingStatus: "Confirmed",
          assignedEventId: eventId,
          assignedEventTitle: ev.title
        };
      }
      return v;
    }));

    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const ven = venues.find(v => v.id === venueId);
        return {
          ...e,
          venue: ven ? ven.name : e.venue,
          venueId: venueId
        };
      }
      return e;
    }));

    addActivity({
      title: "Venue assigned",
      description: `Venue confirmed for ${ev.title}`,
      type: "venue"
    });
  };

  const updateVendorBooking = (vendorId, status) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, bookingStatus: status } : v));
    const vend = vendors.find(v => v.id === vendorId);
    if (vend) {
      addActivity({
        title: "Vendor status updated",
        description: `${vend.name} booking marked as ${status}`,
        type: "vendor"
      });
    }
  };

  const addCategory = (catName, description) => {
    const newCat = {
      id: `cat-${Date.now()}`,
      name: catName,
      count: 0,
      color: "blue",
      description: description || "Category description"
    };
    setCategories(prev => [...prev, newCat]);
  };

  const addActivity = ({ title, description, type }) => {
    const newAct = {
      id: `act-${Date.now()}`,
      title,
      description,
      timestamp: "Just now",
      type: type || "system"
    };
    setActivities(prev => [newAct, ...prev.slice(0, 9)]);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('eventflow_authenticated', 'false');
    addActivity({
      title: `Session Signed Out`,
      description: `Active session terminated for ${currentProfile[currentRole]?.name || 'User'}`,
      type: 'system'
    });
  };

  const login = (role) => {
    if (role && currentProfile[role]) {
      setCurrentRole(role);
    }
    setIsAuthenticated(true);
    localStorage.setItem('eventflow_authenticated', 'true');
    addActivity({
      title: `User Signed In`,
      description: `Authenticated as ${currentProfile[role || currentRole]?.name || 'User'} (${role || currentRole})`,
      type: 'system'
    });
  };

  return (
    <EventFlowContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentRole,
        setCurrentRole,
        currentProfile: currentProfile[currentRole] || currentProfile.organizer,
        allProfiles: currentProfile,
        events,
        venues,
        vendors,
        guests,
        tasks,
        schedule,
        feedback,
        users,
        categories,
        activities,
        selectedEventId,
        setSelectedEventId,
        // Methods
        addEvent,
        updateEvent,
        deleteEvent,
        addGuest,
        updateGuestRSVP,
        addTask,
        updateTaskStatus,
        deleteTask,
        addScheduleItem,
        deleteScheduleItem,
        addFeedback,
        assignVenueToEvent,
        updateVendorBooking,
        addCategory,
        addActivity
      }}
    >
      {children}
    </EventFlowContext.Provider>
  );
}

export function useEventFlow() {
  const context = useContext(EventFlowContext);
  if (!context) {
    throw new Error("useEventFlow must be used within an EventFlowProvider");
  }
  return context;
}
