const pool = require('../config/db');
const sslcommerz = require('../services/sslcommerz.service');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const PLATFORM_FEE_AMOUNT = 5000;

// POST /api/events/fee/initiate — starts the SSLCommerz checkout for
// EventFlow's flat platform convenience fee. The event itself doesn't exist
// yet: its submitted fields are stashed as JSON in event_creation_fees.payload,
// and only actually become a row in `events` once payment.controller.js
// confirms the payment (see confirmPaidBooking there) — same deferred-until-paid
// pattern as hiring a vendor (event_vendors) elsewhere in this app.
async function initiateEventFee(req, res) {
  try {
    const { title, description, category_id, start_datetime, end_datetime, budget } = req.body;

    if (!title || !start_datetime || !end_datetime) {
      return res.status(400).json({ error: 'title, start_datetime, and end_datetime are required' });
    }

    const [organizerRows] = await pool.query('SELECT name, email, phone FROM users WHERE user_id = ?', [req.user.user_id]);
    const organizer = organizerRows[0];

    const payload = JSON.stringify({
      title,
      description: description || null,
      category_id: category_id || null,
      start_datetime,
      end_datetime,
      budget: budget || 0
    });

    const tranId = `FEE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const [result] = await pool.query(
      `INSERT INTO event_creation_fees (organizer_id, amount, status, tran_id, payload)
       VALUES (?, ?, 'pending', ?, ?)`,
      [req.user.user_id, PLATFORM_FEE_AMOUNT, tranId, payload]
    );

    const apiResponse = await sslcommerz.initiatePayment({
      tranId,
      amount: PLATFORM_FEE_AMOUNT,
      customer: { name: organizer.name, email: organizer.email, phone: organizer.phone, address: 'N/A', city: 'Dhaka' },
      successUrl: `${SERVER_URL}/api/payments/sslcommerz/success?tran_id=${tranId}`,
      failUrl: `${SERVER_URL}/api/payments/sslcommerz/fail?tran_id=${tranId}`,
      cancelUrl: `${SERVER_URL}/api/payments/sslcommerz/cancel?tran_id=${tranId}`,
      ipnUrl: `${SERVER_URL}/api/payments/sslcommerz/ipn?tran_id=${tranId}`,
      productName: 'EventFlow Platform Convenience Fee'
    });

    if (!apiResponse || !apiResponse.GatewayPageURL) {
      await pool.query(`UPDATE event_creation_fees SET status = 'failed' WHERE booking_id = ?`, [result.insertId]);
      return res.status(502).json({ error: 'Could not start the payment session' });
    }

    res.status(201).json({ feeId: result.insertId, GatewayPageURL: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start the platform fee payment' });
  }
}

module.exports = { initiateEventFee, PLATFORM_FEE_AMOUNT };
