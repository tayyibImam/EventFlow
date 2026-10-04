const pool = require('../config/db');
const sslcommerz = require('../services/sslcommerz.service');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// tran_id is prefixed per booking type (see bookings.controller.js 'EVF-',
// vendorBookings.controller.js 'VND-', eventFees.controller.js 'FEE-' and
// balancePayments.controller.js 'BAL-') so a single shared set of SSLCommerz
// callback routes can tell which ledger table — and which post-payment side
// effect — a given transaction belongs to.
function tableFor(tranId) {
  if (tranId && tranId.startsWith('VND-')) return 'vendor_bookings';
  if (tranId && tranId.startsWith('FEE-')) return 'event_creation_fees';
  if (tranId && tranId.startsWith('BAL-')) return 'balance_payments';
  return 'venue_bookings';
}

async function loadBooking(tranId) {
  const table = tableFor(tranId);
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE tran_id = ?`, [tranId]);
  if (!rows[0]) return null;
  return { ...rows[0], _table: table };
}

function redirectToResult(res, status, booking) {
  const params = new URLSearchParams({ status });
  if (booking?.event_id != null) params.set('eventId', booking.event_id);
  const base = booking?._table === 'vendor_bookings' ? 'vendors'
    : booking?._table === 'event_creation_fees' ? 'events'
    : booking?._table === 'balance_payments' ? 'payments'
    : 'venues';
  res.redirect(`${CLIENT_URL}/${base}/booking-result?${params.toString()}`);
}

// Confirms a booking's payment — re-validates with SSLCommerz's server
// (never trusts the redirect/IPN body alone) and checks the validated
// amount matches what we charged before touching the DB. Shared by the
// browser-redirected success handler and the server-to-server IPN, so
// either one landing first is enough, and the other is a safe no-op.
async function confirmPaidBooking(booking, valId) {
  if (booking.status === 'paid') return booking;

  // The fee and balance ledgers carry the exact figure charged in `amount`;
  // venue and vendor bookings both charge their 10% `deposit_amount` up
  // front (the other 90% is settled later through balance_payments).
  const chargedAmount = (booking._table === 'event_creation_fees' || booking._table === 'balance_payments')
    ? booking.amount
    : booking.deposit_amount;

  const validation = await sslcommerz.validatePayment(valId);
  const isValid = validation && (validation.status === 'VALID' || validation.status === 'VALIDATED');
  const amountMatches = isValid && Math.abs(Number(validation.amount) - Number(chargedAmount)) < 0.01;

  if (!isValid || !amountMatches) {
    await pool.query(`UPDATE ${booking._table} SET status = 'failed' WHERE booking_id = ?`, [booking.booking_id]);
    return null;
  }

  await pool.query(
    `UPDATE ${booking._table} SET status = 'paid', paid_at = NOW(), val_id = ? WHERE booking_id = ?`,
    [valId, booking.booking_id]
  );

  if (booking._table === 'vendor_bookings') {
    // The vendor is only actually attached to the event once its 10%
    // confirmation deposit clears — this INSERT is the one and only place
    // event_vendors gets a row for a hire (see eventVendors.controller.js,
    // which no longer exposes a free/unpaid way to create one). The row
    // records the full agreed_price, which is what the hire is contracted
    // at; the outstanding 90% is tracked through balance_payments.
    await pool.query(
      `INSERT INTO event_vendors (event_id, vendor_id, agreed_price, status)
       VALUES (?, ?, ?, 'confirmed')
       ON DUPLICATE KEY UPDATE agreed_price = VALUES(agreed_price), status = 'confirmed'`,
      [booking.event_id, booking.vendor_id, booking.agreed_price]
    );
  } else if (booking._table === 'balance_payments') {
    // Nothing structural to do — the venue was already assigned and the
    // vendor already confirmed by their deposit. Marking this row 'paid'
    // above is itself what drops the booking off the organizer's
    // outstanding list (and the admin's overdue list), since both are
    // derived from the absence of a settled balance_payments row.
  } else if (booking._table === 'event_creation_fees') {
    // The event doesn't exist until the platform fee actually clears — this
    // INSERT is the one and only place an event created through the
    // organizer's "Create Event" form gets a row in `events` (see
    // eventFees.controller.js#initiateEventFee, which only ever stashes the
    // submitted fields as JSON). mysql2 auto-parses a JSON column into a JS
    // object already — no JSON.parse needed (and calling it on an object
    // would throw).
    const payload = booking.payload;
    const [eventResult] = await pool.query(
      `INSERT INTO events (title, description, category_id, organizer_id, venue_id, start_datetime, end_datetime, status, budget)
       VALUES (?, ?, ?, ?, NULL, ?, ?, 'planned', ?)`,
      [payload.title, payload.description || null, payload.category_id || null, booking.organizer_id,
       payload.start_datetime, payload.end_datetime, payload.budget || 0]
    );
    await pool.query(`UPDATE event_creation_fees SET event_id = ? WHERE booking_id = ?`, [eventResult.insertId, booking.booking_id]);
    booking.event_id = eventResult.insertId;
  } else {
    // Reassigning a venue supersedes any previously paid booking for this
    // same event — without this, the old venue's row stays 'paid' forever
    // and permanently blocks that venue's dates for every other event.
    await pool.query(
      `UPDATE venue_bookings SET status = 'cancelled' WHERE event_id = ? AND booking_id != ? AND status = 'paid'`,
      [booking.event_id, booking.booking_id]
    );
    await pool.query(`UPDATE events SET venue_id = ? WHERE event_id = ?`, [booking.venue_id, booking.event_id]);
  }

  return booking;
}

async function handleSuccess(req, res) {
  try {
    const tranId = req.query.tran_id || req.body.tran_id;
    const booking = await loadBooking(tranId);
    if (!booking) return redirectToResult(res, 'failed', null);

    const valId = req.body.val_id;
    const confirmed = valId ? await confirmPaidBooking(booking, valId) : null;

    redirectToResult(res, confirmed ? 'success' : 'failed', booking);
  } catch (err) {
    console.error(err);
    redirectToResult(res, 'failed', null);
  }
}

async function handleFail(req, res) {
  try {
    const tranId = req.query.tran_id || req.body.tran_id;
    const booking = await loadBooking(tranId);
    if (booking && booking.status === 'pending') {
      await pool.query(`UPDATE ${booking._table} SET status = 'failed' WHERE booking_id = ?`, [booking.booking_id]);
    }
    redirectToResult(res, 'failed', booking);
  } catch (err) {
    console.error(err);
    redirectToResult(res, 'failed', null);
  }
}

async function handleCancel(req, res) {
  try {
    const tranId = req.query.tran_id || req.body.tran_id;
    const booking = await loadBooking(tranId);
    if (booking && booking.status === 'pending') {
      await pool.query(`UPDATE ${booking._table} SET status = 'cancelled' WHERE booking_id = ?`, [booking.booking_id]);
    }
    redirectToResult(res, 'cancelled', booking);
  } catch (err) {
    console.error(err);
    redirectToResult(res, 'cancelled', null);
  }
}

// Server-to-server notification — SSLCommerz's own servers can't reach a
// localhost ipn_url, so this only actually fires in a deployment with a
// public URL (or a local ngrok tunnel). It's a backstop: the browser
// redirect handlers above already confirm the booking in the common case.
async function handleIpn(req, res) {
  try {
    const tranId = req.query.tran_id || req.body.tran_id;
    const booking = await loadBooking(tranId);
    if (!booking) return res.status(404).json({ error: 'Unknown transaction' });

    const valId = req.body.val_id;
    if (valId) await confirmPaidBooking(booking, valId);

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'IPN processing failed' });
  }
}

module.exports = { handleSuccess, handleFail, handleCancel, handleIpn };
