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

// There is deliberately no unpaid "book vendor" endpoint here — a vendor
// hire requires full payment first (see vendorBookings.controller.js). The
// event_vendors row is only ever created server-side by
// payments.controller.js's confirmPaidBooking, once that payment clears.

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

module.exports = { getEventVendors, updateBooking, removeBooking };