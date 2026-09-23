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


app.get('/', (req, res) => res.send('EventFlow API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
