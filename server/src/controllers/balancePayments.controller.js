const pool = require('../config/db');
const sslcommerz = require('../services/sslcommerz.service');
const { sendMail } = require('../config/mailer');
const { renderEmail, card } = require('../utils/emailTemplates');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// Days an organizer gets to settle the remaining 90% once an event has ended,
// before the admin is alerted.
const GRACE_DAYS = 3;

// The outstanding list is derived, never stored: a venue booking or vendor
// hire whose deposit cleared, whose event has finished, and which has no
// settled balance_payments row yet. Deriving it (rather than pre-creating
// "invoice" rows at event end) means it can't go stale — it disappears the
// moment the balance is paid and appears on its own as soon as an event
// ends, with no cron to run.
//
// `scope` is appended to the WHERE of both halves of the UNION; `params` is
// repeated once per half, since the two halves take the same placeholders.
function outstandingSql(scope = '') {
  const venueScope = scope.replace(/\{b\}/g, 'vb');
  const vendorScope = scope.replace(/\{b\}/g, 'vnb');

  return `
    SELECT
      'venue' AS booking_type, vb.booking_id AS source_booking_id, vb.event_id, vb.organizer_id,
      vb.total_price AS total_amount, vb.deposit_amount,
      (vb.total_price - vb.deposit_amount) AS balance_amount,
      vb.overdue_alert_sent_at,
      e.title AS event_title, e.end_datetime,
      DATE_ADD(e.end_datetime, INTERVAL ${GRACE_DAYS} DAY) AS due_date,
      NOW() > DATE_ADD(e.end_datetime, INTERVAL ${GRACE_DAYS} DAY) AS is_overdue,
      v.name AS payee_name,
      u.name AS organizer_name, u.email AS organizer_email
    FROM venue_bookings vb
    JOIN events e ON e.event_id = vb.event_id
    JOIN venues v ON v.venue_id = vb.venue_id
    JOIN users u ON u.user_id = vb.organizer_id
    WHERE vb.status = 'paid'
      AND e.end_datetime < NOW()
      AND e.status <> 'cancelled'
      AND NOT EXISTS (
        SELECT 1 FROM balance_payments bp
        WHERE bp.booking_type = 'venue' AND bp.source_booking_id = vb.booking_id AND bp.status = 'paid'
      )
      ${venueScope}

    UNION ALL

    SELECT
      'vendor' AS booking_type, vnb.booking_id AS source_booking_id, vnb.event_id, vnb.organizer_id,
      vnb.agreed_price AS total_amount, vnb.deposit_amount,
      (vnb.agreed_price - vnb.deposit_amount) AS balance_amount,
      vnb.overdue_alert_sent_at,
      e.title AS event_title, e.end_datetime,
      DATE_ADD(e.end_datetime, INTERVAL ${GRACE_DAYS} DAY) AS due_date,
      NOW() > DATE_ADD(e.end_datetime, INTERVAL ${GRACE_DAYS} DAY) AS is_overdue,
      vn.name AS payee_name,
      u.name AS organizer_name, u.email AS organizer_email
    FROM vendor_bookings vnb
    JOIN events e ON e.event_id = vnb.event_id
    JOIN vendors vn ON vn.vendor_id = vnb.vendor_id
    JOIN users u ON u.user_id = vnb.organizer_id
    WHERE vnb.status = 'paid'
      AND e.end_datetime < NOW()
      AND e.status <> 'cancelled'
      AND NOT EXISTS (
        SELECT 1 FROM balance_payments bp
        WHERE bp.booking_type = 'vendor' AND bp.source_booking_id = vnb.booking_id AND bp.status = 'paid'
      )
      ${vendorScope}

    ORDER BY due_date ASC`;
}

// Lazy on-read sweep rather than a cron job — same approach as
// rsvp.controller.js#autoDeclineStale, since this app has no background job
// runner. Emails every admin once per overdue balance (tracked by
// overdue_alert_sent_at on the source booking, so a page that runs this
// sweep repeatedly doesn't spam them), and is a safe no-op otherwise. A
// failed email never breaks the request that triggered the sweep: the admin
// dashboard reads the same overdue list live regardless.
async function sweepOverdueBalances() {
  try {
    const [candidates] = await pool.query(outstandingSql('AND {b}.overdue_alert_sent_at IS NULL'), []);

    // is_overdue is computed in SQL (NOW() vs the grace window); filtering it
    // here keeps the one shared query template usable for all three callers.
    const unalerted = candidates.filter((row) => Number(row.is_overdue) === 1);
    if (unalerted.length === 0) return;

    const [admins] = await pool.query("SELECT name, email FROM users WHERE role = 'admin' AND email IS NOT NULL");

    for (const row of unalerted) {
      const table = row.booking_type === 'venue' ? 'venue_bookings' : 'vendor_bookings';

      // Marked before sending so a failure can't turn into a retry loop that
      // re-emails on every subsequent sweep.
      await pool.query(
        `UPDATE ${table} SET overdue_alert_sent_at = NOW() WHERE booking_id = ?`,
        [row.source_booking_id]
      );

      if (admins.length === 0) continue;

      const dueDate = String(row.due_date).split(' ')[0];
      const html = renderEmail({
        preheaderText: `Overdue balance: ${row.organizer_name} owes ৳${Number(row.balance_amount).toLocaleString()} for ${row.event_title}.`,
        bodyHtml: `
          <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1B3A5C;">Overdue post-event payment</p>
          <p style="margin:12px 0 0;">An organizer has not settled the remaining balance within ${GRACE_DAYS} days of their event ending. This needs admin follow-up.</p>
          ${card({
            heading: row.event_title,
            rows: [
              { label: 'Organizer', value: `${row.organizer_name} (${row.organizer_email})` },
              { label: row.booking_type === 'venue' ? 'Venue' : 'Vendor', value: row.payee_name },
              { label: 'Balance', value: `৳${Number(row.balance_amount).toLocaleString()} of ৳${Number(row.total_amount).toLocaleString()}` },
              { label: 'Was Due', value: dueDate }
            ]
          })}
          <p style="margin:0;font-size:12px;color:#64748b;">This alert is sent once per overdue booking. The live list stays on your Admin dashboard until it's paid.</p>
        `
      });

      await sendMail({
        to: admins.map((a) => a.email).join(','),
        subject: `Overdue payment: ${row.event_title} (৳${Number(row.balance_amount).toLocaleString()})`,
        text: `${row.organizer_name} (${row.organizer_email}) has not paid the remaining ৳${row.balance_amount} for "${row.event_title}" (${row.booking_type}: ${row.payee_name}). Due ${dueDate}.`,
        html
      });
    }
  } catch (err) {
    console.error('sweepOverdueBalances: could not process overdue alerts:', err);
  }
}

function mapRow(row) {
  return {
    bookingType: row.booking_type,
    sourceBookingId: row.source_booking_id,
    eventId: row.event_id,
    organizerId: row.organizer_id,
    eventTitle: row.event_title,
    payeeName: row.payee_name,
    organizerName: row.organizer_name,
    organizerEmail: row.organizer_email,
    totalAmount: Number(row.total_amount),
    depositPaid: Number(row.deposit_amount),
    balanceAmount: Number(row.balance_amount),
    endDatetime: row.end_datetime,
    dueDate: row.due_date,
    isOverdue: Number(row.is_overdue) === 1
  };
}

// GET /api/payments/balances/outstanding — what the signed-in organizer
// still owes on their own finished events. Powers the organizer's Payments tab.
async function getOutstandingBalances(req, res) {
  try {
    await sweepOverdueBalances();

    const [rows] = await pool.query(
      outstandingSql('AND {b}.organizer_id = ?'),
      [req.user.user_id, req.user.user_id]
    );
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch outstanding payments' });
  }
}

// GET /api/payments/balances/overdue — admin-only: every organizer's balance
// that blew past the grace period, derived live so it clears itself the
// moment the organizer pays.
async function getOverdueBalances(req, res) {
  try {
    await sweepOverdueBalances();

    const [rows] = await pool.query(
      outstandingSql(`AND NOW() > DATE_ADD(e.end_datetime, INTERVAL ${GRACE_DAYS} DAY)`),
      []
    );
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch overdue payments' });
  }
}

// POST /api/payments/balances/initiate — starts the SSLCommerz checkout for
// one outstanding balance. The amount is always recomputed server-side from
// the source booking, never taken from the request.
async function initiateBalancePayment(req, res) {
  try {
    const { booking_type, source_booking_id } = req.body;

    if (!['venue', 'vendor'].includes(booking_type) || !source_booking_id) {
      return res.status(400).json({ error: 'booking_type ("venue" or "vendor") and source_booking_id are required' });
    }

    const [rows] = await pool.query(
      outstandingSql('AND {b}.organizer_id = ? AND {b}.booking_id = ?'),
      [req.user.user_id, source_booking_id, req.user.user_id, source_booking_id]
    );
    const outstanding = rows.find((r) => r.booking_type === booking_type);

    if (!outstanding) {
      return res.status(404).json({
        error: 'No outstanding balance found for this booking — it may already be settled, or its event hasn\'t finished yet.'
      });
    }

    const amount = Number(outstanding.balance_amount);
    if (!(amount > 0)) {
      return res.status(409).json({ error: 'There is nothing left to pay on this booking' });
    }

    const [openAttempts] = await pool.query(
      `SELECT booking_id FROM balance_payments
       WHERE booking_type = ? AND source_booking_id = ?
         AND status = 'pending' AND created_at > NOW() - INTERVAL 30 MINUTE`,
      [booking_type, source_booking_id]
    );
    if (openAttempts.length > 0) {
      return res.status(409).json({ error: 'A payment for this balance is already pending' });
    }

    const [organizerRows] = await pool.query('SELECT name, email, phone FROM users WHERE user_id = ?', [req.user.user_id]);
    const organizer = organizerRows[0];

    const tranId = `BAL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const [result] = await pool.query(
      `INSERT INTO balance_payments (booking_type, source_booking_id, event_id, organizer_id, amount, status, tran_id)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [booking_type, source_booking_id, outstanding.event_id, req.user.user_id, amount, tranId]
    );

    const apiResponse = await sslcommerz.initiatePayment({
      tranId,
      amount,
      customer: { name: organizer.name, email: organizer.email, phone: organizer.phone, address: 'N/A', city: 'Dhaka' },
      successUrl: `${SERVER_URL}/api/payments/sslcommerz/success?tran_id=${tranId}`,
      failUrl: `${SERVER_URL}/api/payments/sslcommerz/fail?tran_id=${tranId}`,
      cancelUrl: `${SERVER_URL}/api/payments/sslcommerz/cancel?tran_id=${tranId}`,
      ipnUrl: `${SERVER_URL}/api/payments/sslcommerz/ipn?tran_id=${tranId}`,
      productName: booking_type === 'venue' ? 'Venue Final Balance' : 'Vendor Final Balance'
    });

    if (!apiResponse || !apiResponse.GatewayPageURL) {
      await pool.query(`UPDATE balance_payments SET status = 'failed' WHERE booking_id = ?`, [result.insertId]);
      return res.status(502).json({ error: 'Could not start the payment session' });
    }

    res.status(201).json({ bookingId: result.insertId, amount, GatewayPageURL: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start the balance payment' });
  }
}

module.exports = {
  getOutstandingBalances,
  getOverdueBalances,
  initiateBalancePayment,
  sweepOverdueBalances,
  GRACE_DAYS
};
