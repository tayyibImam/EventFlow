import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

// ---- Real backend connection ----
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function mapStatusFromApi(status) {
  const map = { planned: 'Planned', ongoing: 'Ongoing', completed: 'Completed', cancelled: 'Cancelled' };
  return map[status] || 'Planned';
}

function toIsoLike(dbDateTime) {
  // MySQL returns "YYYY-MM-DD HH:MM:SS" — Chrome parses that fine with `new Date()`,
  // but Safari/Firefox do not. Swapping the space for a "T" makes it parse everywhere.
  return dbDateTime ? dbDateTime.replace(' ', 'T') : dbDateTime;
}

function mapEventFromApi(row) {
  return {
    id: row.event_id,
    title: row.title,
    description: row.description || '',
    category: row.category_id != null ? String(row.category_id) : 'Uncategorized',
    venue: row.venue_id != null ? String(row.venue_id) : 'TBD',
    venueId: row.venue_id,
    categoryId: row.category_id,
    organizerId: row.organizer_id,
    startDate: toIsoLike(row.start_datetime),
    endDate: toIsoLike(row.end_datetime),
    status: mapStatusFromApi(row.status),
    budget: row.budget,
    expectedGuests: 0,
    organizer: 'You',
    progress: { venue: 0, vendors: 0, guests: 0, tasks: 0, schedule: 0, overall: 0 },
    _fromApi: true
  };
}

function parseBudget(value) {
  const n = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function toDateTime(dateStr, fallbackTime) {
  if (!dateStr) return null;
  return `${dateStr} ${fallbackTime}`;
}

const EventFlowContext = createContext(null);

export function EventFlowProvider({ children }) {
  // Current user role for demonstration: 'organizer' | 'admin' | 'staff' | 'guest'
  const [currentRole, setCurrentRole] = useState('organizer');

  // Authentication session state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('eventflow_authenticated');
    return saved !== 'false';
  });

  // Real backend session (set by loginWithApi)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('eventflow_token') || null);
  const [realUser, setRealUser] = useState(() => {
    const saved = localStorage.getItem('eventflow_user');
    return saved ? JSON.parse(saved) : null;
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

  const [events, setEvents] = useState(initialEvents);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Load real events from the database on first render
  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load events');
        return res.json();
      })
      .then((rows) => {
        setEvents(rows.map(mapEventFromApi));
      })
      .catch((err) => {
        console.warn('Using demo events — could not reach the API:', err.message);
      })
      .finally(() => setEventsLoading(false));
  }, []);

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

  // Organizers only ever see events they created; admins keep the full view
  const visibleEvents = useMemo(() => {
    if (realUser && realUser.role === 'organizer') {
      return events.filter(evt => evt.organizerId === realUser.user_id);
    }
    return events;
  }, [events, realUser]);

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
  const addEvent = async (newEvent) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          category_id: null,
          organizer_id: realUser?.user_id,
          venue_id: null,
          start_datetime: toDateTime(newEvent.startDate, '09:00:00'),
          end_datetime: toDateTime(newEvent.endDate || newEvent.startDate, '17:00:00'),
          status: (newEvent.status || 'planned').toLowerCase(),
          budget: parseBudget(newEvent.budget)
        })
      });

      if (!res.ok) throw new Error('Failed to create event');
      const row = await res.json();
      const eventObj = mapEventFromApi(row);
      setEvents(prev => [eventObj, ...prev]);

      addActivity({
        title: "New event created",
        description: `Event "${eventObj.title}" was saved to the database`,
        type: "event"
      });

      return eventObj;
    } catch (err) {
      console.error('addEvent: could not reach the API, saving locally only:', err);
      const eventObj = {
        ...newEvent,
        id: `evt-${Date.now()}`,
        progress: { venue: 100, vendors: 40, guests: 20, tasks: 10, schedule: 0, overall: 34 },
        organizer: currentProfile.organizer.name
      };
      setEvents(prev => [eventObj, ...prev]);
      return eventObj;
    }
  };

  const updateEvent = async (id, updatedFields) => {
    // Update locally right away so the UI feels instant
    setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...updatedFields } : evt));

    const current = events.find(evt => evt.id === id);
    if (!current) return;

    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          title: updatedFields.title ?? current.title,
          description: updatedFields.description ?? current.description,
          category_id: current.categoryId ?? null,
          organizer_id: current.organizerId ?? realUser?.user_id,
          venue_id: current.venueId ?? null,
          start_datetime: updatedFields.startDate ? toDateTime(updatedFields.startDate, '09:00:00') : current.startDate?.replace('T', ' '),
          end_datetime: updatedFields.endDate ? toDateTime(updatedFields.endDate, '17:00:00') : current.endDate?.replace('T', ' '),
          status: (updatedFields.status ?? current.status ?? 'planned').toLowerCase(),
          budget: updatedFields.budget != null ? parseBudget(updatedFields.budget) : current.budget
        })
      });

      if (!res.ok) throw new Error('Failed to update event');
      const row = await res.json();
      setEvents(prev => prev.map(evt => evt.id === id ? mapEventFromApi(row) : evt));
    } catch (err) {
      console.error('updateEvent: could not reach the API, kept local change only:', err);
    }
  };

  const deleteEvent = async (id) => {
    setEvents(prev => prev.filter(evt => evt.id !== id));
    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete event');
    } catch (err) {
      console.error('deleteEvent: could not reach the API, removed locally only:', err);
    }
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
    setAuthToken(null);
    setRealUser(null);
    localStorage.setItem('eventflow_authenticated', 'false');
    localStorage.removeItem('eventflow_token');
    localStorage.removeItem('eventflow_user');
    addActivity({
      title: `Session Signed Out`,
      description: `Active session terminated for ${currentProfile[currentRole]?.name || 'User'}`,
      type: 'system'
    });
  };

  // Real login against the backend (email + password, checked with bcrypt, returns a JWT)
  const loginWithApi = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password');
    }

    setAuthToken(data.token);
    setRealUser(data.user);
    localStorage.setItem('eventflow_token', data.token);
    localStorage.setItem('eventflow_user', JSON.stringify(data.user));

    const mappedRole = data.user.role === 'admin' ? 'admin' : data.user.role === 'staff' ? 'staff' : 'organizer';
    setCurrentRole(mappedRole);
    setIsAuthenticated(true);
    localStorage.setItem('eventflow_authenticated', 'true');

    addActivity({
      title: `User Signed In`,
      description: `Authenticated as ${data.user.name} (${data.user.role})`,
      type: 'system'
    });

    return data.user;
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

  // Real sign-up against the backend. Always creates an 'organizer' account —
  // Staff and Admin accounts are provisioned separately, not via public sign-up.
  const registerWithApi = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Could not create your account');
    }

    setAuthToken(data.token);
    setRealUser(data.user);
    localStorage.setItem('eventflow_token', data.token);
    localStorage.setItem('eventflow_user', JSON.stringify(data.user));
    setCurrentRole('organizer');
    setIsAuthenticated(true);
    localStorage.setItem('eventflow_authenticated', 'true');

    addActivity({
      title: 'Account created',
      description: `${data.user.name} registered as an organizer`,
      type: 'system'
    });

    return data.user;
  };

  return (
    <EventFlowContext.Provider
      value={{
        isAuthenticated,
        login,
        loginWithApi,
        registerWithApi,
        logout,
        authToken,
        realUser,
        currentRole,
        setCurrentRole,
        currentProfile: realUser
          ? {
              name: realUser.name,
              title: realUser.role === 'admin' ? 'Platform Administrator' : realUser.role === 'staff' ? 'Operations Staff' : 'Event Organizer',
              role: realUser.role.charAt(0).toUpperCase() + realUser.role.slice(1),
              email: realUser.email,
              avatar: realUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            }
          : (currentProfile[currentRole] || currentProfile.organizer),
        allProfiles: currentProfile,
        eventsLoading,
        events: visibleEvents,
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