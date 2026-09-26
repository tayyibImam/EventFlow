const fs = require('fs');
const path = require('path');

// Registered before anything else that could possibly throw (including the
// route requires below), and before any risky, platform-specific API — a
// previous version of this file called the undocumented
// `process.stdout._handle.setBlocking()` here to work around lost output on
// Windows, but that call itself could throw, and it ran *before* these
// handlers were registered, so it could crash the process with nothing
// caught and nothing logged. Removed; the crash.log file write below is a
// safe, standard way to make sure the next crash is actually diagnosable.
const crashLogPath = path.join(__dirname, 'crash.log');
function logCrash(label, err) {
  const entry = `\n[${new Date().toISOString()}] ${label}\n${err && err.stack ? err.stack : String(err)}\n`;
  console.error(entry);
  try {
    fs.appendFileSync(crashLogPath, entry);
  } catch (writeErr) {
    console.error('Could not write to crash.log:', writeErr);
  }
}

process.on('uncaughtException', (err) => {
  logCrash('UNCAUGHT EXCEPTION', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logCrash('UNHANDLED REJECTION', reason);
});

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const eventsRoutes = require('./src/routes/events.routes');
const authRoutes = require('./src/routes/auth.routes');
const categoriesRoutes = require('./src/routes/categories.routes');
const venuesRoutes = require('./src/routes/venues.routes');
const vendorsRoutes = require('./src/routes/vendors.routes');
const guestsRoutes = require('./src/routes/guests.routes');
const usersRoutes = require('./src/routes/users.routes');
const tasksRoutes = require('./src/routes/tasks.routes');
const scheduleRoutes = require('./src/routes/schedule.routes');
const feedbackRoutes = require('./src/routes/feedback.routes');
const eventVendorsRoutes = require('./src/routes/eventVendors.routes');
const eventGuestsRoutes = require('./src/routes/eventGuests.routes');
const rsvpRoutes = require('./src/routes/rsvp.routes');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/events', eventsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/guests', guestsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/events/:eventId/vendors', eventVendorsRoutes);
app.use('/api/events/:eventId/guests', eventGuestsRoutes);
app.use('/api/rsvp', rsvpRoutes);


app.get('/', (req, res) => res.send('EventFlow API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
