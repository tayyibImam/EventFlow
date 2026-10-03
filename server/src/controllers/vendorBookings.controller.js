const pool = require('../config/db');
const sslcommerz = require('../services/sslcommerz.service');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// Full-payment ledger for hiring a vendor — unlike venue_bookings this is
// charged in full, not a 10% deposit (see schema.sql). A 'pending' row less
// than 30 minutes old also blocks a second checkout for the same event +
// vendor so a double-click can't start two payment sessions for one hire.
async function hasOpenBooking(eventId, vendorId) {
  const [rows] = await pool.query(
    `SELECT booking_id FROM vendor_bookings
     WHERE event_id = ? AND vendor_id = ?
       AND (status = 'paid' OR (status = 'pending' AND created_at > NOW() - INTERVAL 30 MINUTE))`,
    [eventId, vendorId]
  );
  return rows.length > 0;
}

async function createBooking(req, res) {
  try {
    const { vendorId } = req.params;
    const { event_id, agreed_price } = req.body;

    if (!event_id || agreed_price === undefined) {
      return res.status(400).json({ error: 'event_id and agreed_price are required' });
    }

    const price = Number(agreed_price);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ error: 'agreed_price must be a positive number' });
    }

    const [events] = await pool.query('SELECT * FROM events WHERE event_id = ?', [event_id]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const event = events[0];

    if (event.organizer_id !== req.user.user_id) {
      return res.status(403).json({ error: 'You can only hire vendors for your own events' });
    }

    const [vendors] = await pool.query('SELECT * FROM vendors WHERE vendor_id = ?', [vendorId]);
    if (vendors.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    const vendor = vendors[0];

    const [existingHire] = await pool.query(
      'SELECT event_vendor_id FROM event_vendors WHERE event_id = ? AND vendor_id = ?',
      [event_id, vendorId]
    );
    if (existingHire.length > 0) {
      return res.status(409).json({ error: 'This vendor is already hired for this event' });
    }

    if (await hasOpenBooking(event_id, vendorId)) {
      return res.status(409).json({ error: 'A payment for this vendor and event is already pending' });
    }

    const [organizerRows] = await pool.query('SELECT name, email, phone FROM users WHERE user_id = ?', [req.user.user_id]);
    const organizer = organizerRows[0];

    const tranId = `VND-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const [result] = await pool.query(
      `INSERT INTO vendor_bookings (event_id, vendor_id, organizer_id, agreed_price, status, tran_id)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [event.event_id, vendor.vendor_id, req.user.user_id, price, tranId]
    );

    const apiResponse = await sslcommerz.initiatePayment({
      tranId,
      amount: price,
      customer: { name: organizer.name, email: organizer.email, phone: organizer.phone, address: 'N/A', city: 'Dhaka' },
      successUrl: `${SERVER_URL}/api/payments/sslcommerz/success?tran_id=${tranId}`,
      failUrl: `${SERVER_URL}/api/payments/sslcommerz/fail?tran_id=${tranId}`,
      cancelUrl: `${SERVER_URL}/api/payments/sslcommerz/cancel?tran_id=${tranId}`,
      ipnUrl: `${SERVER_URL}/api/payments/sslcommerz/ipn?tran_id=${tranId}`,
      productName: 'Vendor Hire Payment'
    });

    if (!apiResponse || !apiResponse.GatewayPageURL) {
      await pool.query(`UPDATE vendor_bookings SET status = 'failed' WHERE booking_id = ?`, [result.insertId]);
      return res.status(502).json({ error: 'Could not start the payment session' });
    }

    res.status(201).json({ bookingId: result.insertId, GatewayPageURL: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create vendor booking' });
  }
}

module.exports = { createBooking };
