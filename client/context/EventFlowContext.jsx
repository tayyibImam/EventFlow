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

function mapCategoryFromApi(row) {
  return {
    id: row.category_id,
    name: row.name,
    description: row.description || ''
  };
}

function mapUserFromApi(row) {
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role.charAt(0).toUpperCase() + row.role.slice(1),
    status: 'Active',
    assignedEvents: 'Platform-wide'
  };
}

function formatCurrency(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toLocaleString()}` : '$0';
}

// venues table has no facilities/image/contact-person columns — those stay
// empty/generic until the schema grows them; everything else is real.
function mapVenueFromApi(row) {
  return {
    id: row.venue_id,
    name: row.name,
    address: row.address,
    city: row.city,
    location: `${row.address}, ${row.city}`,
    capacity: row.capacity,
    pricePerDay: row.price_per_day,
    facilities: [],
    planningPrice: `${formatCurrency(row.price_per_day)} / day`,
    contactPerson: 'Venue Management',
    contactNumber: row.contact_number || '',
    phone: row.contact_number || 'Not provided',
    image: null
  };
}

// vendors table has no rating/specialty/availability columns, and booking
// status genuinely belongs to a specific event (event_vendors), not the
// vendor globally — those stay demo defaults until a per-event booking flow
// exists here.
function mapVendorFromApi(row) {
  return {
    id: row.vendor_id,
    name: row.name,
    category: row.service_type,
    contact: [row.contact_phone, row.contact_email].filter(Boolean).join(' — ') || 'No contact on file',
    contactEmail: row.contact_email || '',
    contactPhone: row.contact_phone || '',
    basePrice: row.base_price,
    availability: 'Available',
    rating: null,
    agreedPrice: formatCurrency(row.base_price),
    bookingStatus: 'Pending',
    specialty: null
  };
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
  // Admin-only real data — the users list needs a JWT + admin role
  // (GET /api/users), unlike venues/vendors/categories below which are
  // public reference data. Populates the real `users` list for the admin
  // Users page and drives the "Registered Users" stat card.
  const [adminStats, setAdminStats] = useState({ userCount: null, loading: true });

  useEffect(() => {
    if (!authToken || !realUser || realUser.role !== 'admin') return;

    fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then((r) => r.json())
      .then((userRows) => {
        setAdminStats({ userCount: userRows.length, loading: false });
        setUsers(userRows.map(mapUserFromApi));
      })
      .catch((err) => {
        console.warn('Could not load admin stats:', err.message);
        setAdminStats((s) => ({ ...s, loading: false }));
      });
  }, [authToken, realUser]);

  // Categories, venues, and vendors are public reference data (no auth on
  // their GET routes), so every role loads the real rows, not just admins.
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load categories');
        return res.json();
      })
      .then((rows) => setCategories(rows.map(mapCategoryFromApi)))
      .catch((err) => {
        console.warn('Using demo categories — could not reach the API:', err.message);
      })
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/venues`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load venues');
        return res.json();
      })
      .then((rows) => setVenues(rows.map(mapVenueFromApi)))
      .catch((err) => {
        console.warn('Using demo venues — could not reach the API:', err.message);
      })
      .finally(() => setVenuesLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/vendors`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load vendors');
        return res.json();
      })
      .then((rows) => setVendors(rows.map(mapVendorFromApi)))
      .catch((err) => {
        console.warn('Using demo vendors — could not reach the API:', err.message);
      })
      .finally(() => setVendorsLoading(false));
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
          category_id: newEvent.categoryId ?? null,
          organizer_id: newEvent.organizerId ?? realUser?.user_id,
          venue_id: newEvent.venueId ?? null,
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
          category_id: updatedFields.categoryId !== undefined ? updatedFields.categoryId : (current.categoryId ?? null),
          organizer_id: updatedFields.organizerId !== undefined ? updatedFields.organizerId : (current.organizerId ?? realUser?.user_id),
          venue_id: updatedFields.venueId !== undefined ? updatedFields.venueId : (current.venueId ?? null),
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

  // Persists to the real events.venue_id column via updateEvent — a venue's
  // "assigned event" is derived live from events elsewhere (see Venues.jsx),
  // not stored back on the venue itself.
  const assignVenueToEvent = async (venueId, eventId) => {
    const ev = events.find(e => e.id === eventId);
    const venue = venues.find(v => v.id === venueId);
    if (!ev || !venue) return;

    await updateEvent(eventId, { venueId: venue.id, venue: venue.name });

    addActivity({
      title: "Venue assigned",
      description: `${venue.name} assigned to ${ev.title}`,
      type: "venue"
    });
  };

  // Vendor booking status is genuinely per-event (event_vendors table), not
  // a field on the vendor itself, and this page has no event-selection step
  // the way Venues does — so this stays a local-only demo toggle until a
  // per-event vendor booking flow exists.
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

  // Full venue/vendor management (admin-only in the UI) — these throw on
  // failure instead of silently falling back to a local-only mutation, since
  // an admin managing the real directory needs to know a write didn't land.
  const addVenue = async (form) => {
    const res = await fetch(`${API_URL}/venues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        address: form.address,
        city: form.city,
        capacity: Number(form.capacity),
        price_per_day: Number(form.pricePerDay),
        contact_number: form.contactNumber || null
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create venue');
    }

    const venueObj = mapVenueFromApi(await res.json());
    setVenues(prev => [venueObj, ...prev]);
    addActivity({
      title: "New venue added",
      description: `"${venueObj.name}" added to the venue directory`,
      type: "venue"
    });
    return venueObj;
  };

  const updateVenue = async (venueId, form) => {
    const res = await fetch(`${API_URL}/venues/${venueId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        address: form.address,
        city: form.city,
        capacity: Number(form.capacity),
        price_per_day: Number(form.pricePerDay),
        contact_number: form.contactNumber || null
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update venue');
    }

    const venueObj = mapVenueFromApi(await res.json());
    setVenues(prev => prev.map(v => v.id === venueId ? venueObj : v));
    return venueObj;
  };

  const deleteVenue = async (venueId) => {
    const res = await fetch(`${API_URL}/venues/${venueId}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete venue');
    }
    setVenues(prev => prev.filter(v => v.id !== venueId));
  };

  const addVendor = async (form) => {
    const res = await fetch(`${API_URL}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        service_type: form.serviceType,
        contact_email: form.contactEmail || null,
        contact_phone: form.contactPhone || null,
        base_price: Number(form.basePrice) || 0
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create vendor');
    }

    const vendorObj = mapVendorFromApi(await res.json());
    setVendors(prev => [vendorObj, ...prev]);
    addActivity({
      title: "New vendor added",
      description: `"${vendorObj.name}" added to the vendor directory`,
      type: "vendor"
    });
    return vendorObj;
  };

  const updateVendor = async (vendorId, form) => {
    const res = await fetch(`${API_URL}/vendors/${vendorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        service_type: form.serviceType,
        contact_email: form.contactEmail || null,
        contact_phone: form.contactPhone || null,
        base_price: Number(form.basePrice) || 0
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update vendor');
    }

    const vendorObj = mapVendorFromApi(await res.json());
    setVendors(prev => prev.map(v => v.id === vendorId ? vendorObj : v));
    return vendorObj;
  };

  const deleteVendor = async (vendorId) => {
    const res = await fetch(`${API_URL}/vendors/${vendorId}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete vendor');
    }
    setVendors(prev => prev.filter(v => v.id !== vendorId));
  };

  const addCategory = async ({ name, description, color }) => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create category');
      }

      const row = await res.json();
      const catObj = mapCategoryFromApi(row);
      setCategories(prev => [...prev, catObj]);

      addActivity({
        title: "New category created",
        description: `"${catObj.name}" added to the event taxonomy`,
        type: "category"
      });

      return catObj;
    } catch (err) {
      console.error('addCategory: could not reach the API, saving locally only:', err);
      const catObj = {
        id: `cat-${Date.now()}`,
        name,
        description: description || '',
        color: color || '#1B3A5C'
      };
      setCategories(prev => [...prev, catObj]);
      return catObj;
    }
  };

  // Update/delete throw on failure (unlike addCategory's silent fallback
  // above) — an admin editing/removing a real taxonomy entry needs to know
  // if it didn't actually persist, not see a change that reverts on refresh.
  const updateCategory = async (categoryId, { name, description }) => {
    const res = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update category');
    }

    const catObj = mapCategoryFromApi(await res.json());
    setCategories(prev => prev.map(c => c.id === categoryId ? catObj : c));
    return catObj;
  };

  const deleteCategory = async (categoryId) => {
    const res = await fetch(`${API_URL}/categories/${categoryId}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete category');
    }
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  // No backend endpoint accepts arbitrary-role user creation without a
  // password (public register always creates an 'organizer'; staff/admin
  // accounts are provisioned directly in the DB per project convention) —
  // this stays a local-only addition, same as the pre-existing mock domains.
  const addUser = (form) => {
    // Admin accounts are hardcoded/provisioned directly in the DB — never
    // creatable through the app, no matter what a caller passes in here.
    const role = form.role === 'Admin' ? 'Staff' : (form.role || 'Staff');
    const userObj = {
      id: `usr-${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone || '',
      role,
      status: form.status || 'Active',
      assignedEvents: form.assignedEvents || ''
    };
    setUsers(prev => [userObj, ...prev]);

    addActivity({
      title: "New user added",
      description: `${userObj.name} was added as ${userObj.role}`,
      type: "system"
    });

    return userObj;
  };

  const updateUserRole = async (userId, newRole) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    // Admins are hardcoded/provisioned directly in the DB — this can demote
    // an existing admin (the UI doesn't offer that either, but the guard
    // lives here too) but never promotes someone into the role.
    if (newRole === 'Admin' && target.role !== 'Admin') {
      console.warn('Promoting a user to Admin isn\'t allowed from the app — admin accounts are provisioned directly in the database.');
      return;
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          name: target.name,
          email: target.email,
          phone: target.phone || null,
          role: newRole.toLowerCase()
        })
      });

      if (!res.ok) throw new Error('Failed to update user role');
      const row = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? mapUserFromApi(row) : u));

      addActivity({
        title: "User role updated",
        description: `${row.name} is now ${newRole}`,
        type: "system"
      });
    } catch (err) {
      console.error('updateUserRole: could not reach the API, kept local change only:', err);
    }
  };

  // Full profile edit (name/email/phone/role) for the admin Users page.
  // Throws on a real failure so the edit modal can show it, except for a
  // 404 — that means the row is a locally-added demo user with no DB row
  // (see addUser above), so the edit is just kept local instead of blocked.
  const updateUser = async (userId, form) => {
    const target = users.find(u => u.id === userId);
    if (form.role === 'Admin' && target?.role !== 'Admin') {
      throw new Error('Admin accounts are provisioned directly in the database and can\'t be assigned through this page.');
    }

    let res;
    try {
      res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          role: form.role.toLowerCase()
        })
      });
    } catch (networkErr) {
      throw new Error('Could not reach the server. Please check your connection and try again.');
    }

    if (res.status === 404) {
      const userObj = {
        id: userId,
        name: form.name,
        email: form.email,
        phone: form.phone || '',
        role: form.role,
        status: 'Active',
        assignedEvents: 'Platform-wide'
      };
      setUsers(prev => prev.map(u => u.id === userId ? userObj : u));
      return userObj;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update user');
    }

    const userObj = mapUserFromApi(await res.json());
    setUsers(prev => prev.map(u => u.id === userId ? userObj : u));
    addActivity({
      title: "User updated",
      description: `${userObj.name}'s profile was updated`,
      type: "system"
    });
    return userObj;
  };

  // Same 404-is-fine-because-it-was-never-real-anyway handling as updateUser.
  const deleteUser = async (userId) => {
    const target = users.find(u => u.id === userId);
    let res;
    try {
      res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
    } catch (networkErr) {
      throw new Error('Could not reach the server. Please check your connection and try again.');
    }

    if (!res.ok && res.status !== 204 && res.status !== 404) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete user');
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    if (target) {
      addActivity({
        title: "User removed",
        description: `${target.name} was removed from the platform`,
        type: "system"
      });
    }
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
        venuesLoading,
        vendors,
        vendorsLoading,
        guests,
        tasks,
        schedule,
        feedback,
        users,
        categories,
        categoriesLoading,
        activities,
        adminStats,
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
        addVenue,
        updateVenue,
        deleteVenue,
        addVendor,
        updateVendor,
        deleteVendor,
        addCategory,
        updateCategory,
        deleteCategory,
        addUser,
        updateUser,
        updateUserRole,
        deleteUser,
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