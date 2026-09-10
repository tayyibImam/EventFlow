const express = require('express');
const cors = require('cors');
require('dotenv').config();

const eventsRoutes = require('./src/routes/events.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/events', eventsRoutes);

app.get('/', (req, res) => res.send('EventFlow API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));