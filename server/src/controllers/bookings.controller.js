const pool = require('../config/db');
const sslcommerz = require('../services/sslcommerz.service');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Inclusive calendar-day span of an event — matches the venue's "price per day".
function dayCount(startDatetime, endDatetime) {
  const start = new Date(String(startDatetime).split(' ')[0]);
  const end = new Date(String(endDatetime).split(' ')[0]);
  const days = Math.floor((end - start) / 86400000) + 1;
  return Math.max(1, days);
}

// Rows from venue_bookings joined to events that currently block venueId for
// the given date range — 'paid' always blocks, 'pending' only blocks while
// fresh (abandoned checkouts shouldn't permanently lock a venue).
async function findConflict(venueId, excludeEventId, startDatetime, endDatetime) {
  const [rows] = await pool.query(
    `SELECT e.event_id, e.title, e.start_datetime, e.end_datetime
     FROM venue_bookings vb
     JOIN events e ON e.event_id = vb.event_id
     WHERE vb.venue_id = ?
       AND e.event_id != ?
       AND (vb.status = 'paid' OR (vb.status = 'pending' AND vb.created_at > NOW() - INTERVAL 30 MINUTE))
       AND e.start_datetime <= ? AND e.end_datetime >= ?`,
    [venueId, excludeEventId, endDatetime, startDatetime]
  );
  return rows[0] || null;
}

async function getAvailability(req, res) {
  try {
    const { venueId } = req.params;
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({ error: 'eventId query param is required' });
    }

    const [events] = await pool.query('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = events[0];
    const conflict = await findConflict(venueId, event.event_id, event.start_datetime, event.end_datetime);

    res.json({
      available: !conflict,
      conflict: conflict
        ? { eventTitle: conflict.title, startDate: conflict.start_datetime, endDate: conflict.end_datetime }
        : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check venue availability' });
  }
}

async function createBooking(req, res) {
  try {
    const { venueId } = req.params;
    const { event_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: 'event_id is required' });
    }

    const [events] = await pool.query('SELECT * FROM events WHERE event_id = ?', [event_id]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const event = events[0];

    if (event.organizer_id !== req.user.user_id) {
      return res.status(403).json({ error: 'You can only book venues for your own events' });
    }

    if (event.venue_id === Number(venueId)) {
      return res.status(409).json({ error: 'This venue is already assigned to this event' });
    }

    const [venues] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [venueId]);
    if (venues.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    const venue = venues[0];

    const conflict = await findConflict(venueId, event.event_id, event.start_datetime, event.end_datetime);
    if (conflict) {
      return res.status(409).json({
        error: 'This venue is already booked for an overlapping date range',
        conflict: { eventTitle: conflict.title, startDate: conflict.start_datetime, endDate: conflict.end_datetime }
      });
    }

    const [organizerRows] = await pool.query('SELECT name, email, phone FROM users WHERE user_id = ?', [req.user.user_id]);
    const organizer = organizerRows[0];

    const totalPrice = Number(venue.price_per_day) * dayCount(event.start_datetime, event.end_datetime);
    const depositAmount = Math.round(totalPrice * 0.10 * 100) / 100;

    const tranId = `EVF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const [result] = await pool.query(
      `INSERT INTO venue_bookings (event_id, venue_id, organizer_id, total_price, deposit_amount, status, tran_id)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [event.event_id, venue.venue_id, req.user.user_id, totalPrice, depositAmount, tranId]
    );

    const apiResponse = await sslcommerz.initiatePayment({
      tranId,
      amount: depositAmount,
      customer: { name: organizer.name, email: organizer.email, phone: organizer.phone, address: venue.address, city: venue.city },
      successUrl: `${SERVER_URL}/api/payments/sslcommerz/success?tran_id=${tranId}`,
      failUrl: `${SERVER_URL}/api/payments/sslcommerz/fail?tran_id=${tranId}`,
      cancelUrl: `${SERVER_URL}/api/payments/sslcommerz/cancel?tran_id=${tranId}`,
      ipnUrl: `${SERVER_URL}/api/payments/sslcommerz/ipn?tran_id=${tranId}`
    });

    if (!apiResponse || !apiResponse.GatewayPageURL) {
      await pool.query(`UPDATE venue_bookings SET status = 'failed' WHERE booking_id = ?`, [result.insertId]);
      return res.status(502).json({ error: 'Could not start the payment session' });
    }

    res.status(201).json({ bookingId: result.insertId, GatewayPageURL: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create venue booking' });
  }
}

module.exports = { getAvailability, createBooking, findConflict };
