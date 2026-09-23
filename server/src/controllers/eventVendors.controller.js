const pool = require('../config/db');

// GET /api/events/:eventId/vendors — list vendors booked for this event
async function getEventVendors(req, res) {
  try {
    const { eventId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM event_vendors WHERE event_id = ?',
      [eventId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event vendors' });
  }
}

// POST /api/events/:eventId/vendors — book a vendor for this event
async function bookVendor(req, res) {
  try {
    const { eventId } = req.params;
    const { vendor_id, agreed_price, status } = req.body;

    if (!vendor_id || agreed_price === undefined) {
      return res.status(400).json({ error: 'vendor_id and agreed_price are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO event_vendors (event_id, vendor_id, agreed_price, status)
       VALUES (?, ?, ?, ?)`,
      [eventId, vendor_id, agreed_price, status || 'pending']
    );

    const [newBooking] = await pool.query(
      'SELECT * FROM event_vendors WHERE event_vendor_id = ?',
      [result.insertId]
    );
    res.status(201).json(newBooking[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This vendor is already booked for this event' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to book vendor' });
  }
}

// PUT /api/events/:eventId/vendors/:vendorId — update price/status of a booking
async function updateBooking(req, res) {
  try {
    const { eventId, vendorId } = req.params;
    const { agreed_price, status } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM event_vendors WHERE event_id = ? AND vendor_id = ?',
      [eventId, vendorId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await pool.query(
      'UPDATE event_vendors SET agreed_price = ?, status = ? WHERE event_id = ? AND vendor_id = ?',
      [agreed_price, status, eventId, vendorId]
    );

    const [updated] = await pool.query(
      'SELECT * FROM event_vendors WHERE event_id = ? AND vendor_id = ?',
      [eventId, vendorId]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
}

// DELETE /api/events/:eventId/vendors/:vendorId — unbook a vendor
async function removeBooking(req, res) {
  try {
    const { eventId, vendorId } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM event_vendors WHERE event_id = ? AND vendor_id = ?',
      [eventId, vendorId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await pool.query(
      'DELETE FROM event_vendors WHERE event_id = ? AND vendor_id = ?',
      [eventId, vendorId]
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove booking' });
  }
}

module.exports = { getEventVendors, bookVendor, updateBooking, removeBooking };