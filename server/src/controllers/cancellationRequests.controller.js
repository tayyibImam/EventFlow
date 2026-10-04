const pool = require('../config/db');
const { sendMail } = require('../config/mailer');
const { renderEmail, card, button } = require('../utils/emailTemplates');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Long enough to force an actual explanation rather than "no" / "cancel" —
// the whole point of the flow is that an admin has something to judge.
const MIN_REASON_LENGTH = 15;

const SELECT_COLUMNS = `
  r.request_id, r.event_id, r.organizer_id, r.reason, r.status,
  r.reviewed_by, r.review_note, r.requested_at, r.reviewed_at,
  e.title AS event_title, e.start_datetime, e.end_datetime, e.status AS event_status,
  o.name AS organizer_name, o.email AS organizer_email,
  a.name AS reviewer_name`;

const FROM_JOINS = `
  FROM event_cancellation_requests r
  JOIN events e ON e.event_id = r.event_id
  JOIN users o ON o.user_id = r.organizer_id
  LEFT JOIN users a ON a.user_id = r.reviewed_by`;

function mapRow(row) {
  return {
    id: row.request_id,
    eventId: row.event_id,
    eventTitle: row.event_title,
    eventStatus: row.event_status,
    startDate: row.start_datetime,
    endDate: row.end_datetime,
    organizerId: row.organizer_id,
    organizerName: row.organizer_name,
    organizerEmail: row.organizer_email,
    reason: row.reason,
    status: row.status,
    reviewNote: row.review_note || '',
    reviewerName: row.reviewer_name || null,
    requestedAt: row.requested_at,
    reviewedAt: row.reviewed_at
  };
}

// POST /api/cancellation-requests — organizer files a cancellation request
// for one of their own events. Nothing about the event changes here: the
// status only moves to 'cancelled' if an admin approves (see reviewRequest).
async function createRequest(req, res) {
  try {
    const { event_id, reason } = req.body;

    if (!event_id || !reason || !reason.trim()) {
      return res.status(400).json({ error: 'event_id and reason are required' });
    }
    if (reason.trim().length < MIN_REASON_LENGTH) {
      return res.status(400).json({
        error: `Please give the admin a bit more detail — at least ${MIN_REASON_LENGTH} characters explaining why this event needs to be cancelled.`
      });
    }

    const [events] = await pool.query('SELECT * FROM events WHERE event_id = ?', [event_id]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const event = events[0];

    if (event.organizer_id !== req.user.user_id) {
      return res.status(403).json({ error: 'You can only request cancellation for your own events' });
    }
    if (event.status === 'cancelled') {
      return res.status(409).json({ error: 'This event is already cancelled' });
    }

    const [ended] = await pool.query('SELECT (end_datetime < NOW()) AS has_ended FROM events WHERE event_id = ?', [event_id]);
    if (Number(ended[0].has_ended) === 1) {
      return res.status(409).json({ error: 'This event has already finished and can no longer be cancelled' });
    }

    let result;
    try {
      [result] = await pool.query(
        `INSERT INTO event_cancellation_requests (event_id, organizer_id, reason)
         VALUES (?, ?, ?)`,
        [event_id, req.user.user_id, reason.trim()]
      );
    } catch (err) {
      // uniq_open_request — one pending request per event at a time.
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'A cancellation request for this event is already awaiting admin review' });
      }
      throw err;
    }

    const [created] = await pool.query(
      `SELECT ${SELECT_COLUMNS} ${FROM_JOINS} WHERE r.request_id = ?`,
      [result.insertId]
    );
    const request = mapRow(created[0]);

    // Tells the admins there's something to review. A failed email never
    // fails the request itself — it's already queued in their dashboard.
    try {
      const [admins] = await pool.query("SELECT email FROM users WHERE role = 'admin' AND email IS NOT NULL");
      if (admins.length > 0) {
        await sendMail({
          to: admins.map((a) => a.email).join(','),
          subject: `Cancellation request: ${request.eventTitle}`,
          text: `${request.organizerName} (${request.organizerEmail}) has requested cancellation of "${request.eventTitle}".\n\nReason: ${request.reason}\n\nReview it at ${CLIENT_URL}/admin/cancellations`,
          html: renderEmail({
            preheaderText: `${request.organizerName} wants to cancel ${request.eventTitle}.`,
            bodyHtml: `
              <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1B3A5C;">Cancellation request awaiting review</p>
              <p style="margin:12px 0 0;">An organizer has asked to cancel an event. The event stays active until you approve it.</p>
              ${card({
                heading: request.eventTitle,
                rows: [
                  { label: 'Organizer', value: `${request.organizerName} (${request.organizerEmail})` },
                  { label: 'Starts', value: String(request.startDate).split(' ')[0] },
                  { label: 'Reason', value: request.reason }
                ]
              })}
              ${button({ text: 'Review Request', href: `${CLIENT_URL}/admin/cancellations` })}
            `
          })
        });
      }
    } catch (mailErr) {
      console.error('createRequest: cancellation request saved, but the admin email failed:', mailErr);
    }

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit the cancellation request' });
  }
}

// GET /api/cancellation-requests/mine — the organizer's own request history,
// so they can see what's pending and why anything was turned down.
async function getMyRequests(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} ${FROM_JOINS}
       WHERE r.organizer_id = ?
       ORDER BY FIELD(r.status, 'pending', 'rejected', 'approved'), r.requested_at DESC`,
      [req.user.user_id]
    );
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your cancellation requests' });
  }
}

// GET /api/cancellation-requests — admin review queue, pending first.
async function getAllRequests(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} ${FROM_JOINS}
       ORDER BY FIELD(r.status, 'pending', 'rejected', 'approved'), r.requested_at DESC`
    );
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cancellation requests' });
  }
}

// PUT /api/cancellation-requests/:id/review — admin approves or rejects.
// Approving is the single place in the app that cancels an organizer's
// event; rejecting leaves the event untouched and frees the organizer to
// file again with a better reason.
async function reviewRequest(req, res) {
  try {
    const { id } = req.params;
    const { decision, review_note } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be either "approved" or "rejected"' });
    }

    const [existing] = await pool.query(
      `SELECT ${SELECT_COLUMNS} ${FROM_JOINS} WHERE r.request_id = ?`,
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Cancellation request not found' });
    }
    if (existing[0].status !== 'pending') {
      return res.status(409).json({ error: `This request was already ${existing[0].status}` });
    }

    await pool.query(
      `UPDATE event_cancellation_requests
       SET status = ?, reviewed_by = ?, review_note = ?, reviewed_at = NOW()
       WHERE request_id = ?`,
      [decision, req.user.user_id, review_note ? String(review_note).trim() : null, id]
    );

    if (decision === 'approved') {
      // Cancelling also clears the event off the organizer's outstanding
      // payments and the admin's overdue list, since both derive from
      // non-cancelled events (see balancePayments.controller.js).
      await pool.query("UPDATE events SET status = 'cancelled' WHERE event_id = ?", [existing[0].event_id]);
    }

    const [updated] = await pool.query(
      `SELECT ${SELECT_COLUMNS} ${FROM_JOINS} WHERE r.request_id = ?`,
      [id]
    );
    const request = mapRow(updated[0]);

    try {
      if (request.organizerEmail) {
        const approved = decision === 'approved';
        await sendMail({
          to: request.organizerEmail,
          subject: approved
            ? `Cancellation approved: ${request.eventTitle}`
            : `Cancellation declined: ${request.eventTitle}`,
          text: approved
            ? `Your request to cancel "${request.eventTitle}" was approved. The event is now marked cancelled.${request.reviewNote ? `\n\nAdmin note: ${request.reviewNote}` : ''}`
            : `Your request to cancel "${request.eventTitle}" was declined, so the event is still active.${request.reviewNote ? `\n\nAdmin note: ${request.reviewNote}` : ''}`,
          html: renderEmail({
            preheaderText: approved
              ? `${request.eventTitle} is now cancelled.`
              : `${request.eventTitle} is still active.`,
            bodyHtml: `
              <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1B3A5C;">Hi ${request.organizerName},</p>
              <p style="margin:12px 0 0;">${approved
                ? 'Your cancellation request was approved and the event is now marked cancelled.'
                : 'Your cancellation request was declined, so the event is still active. You can file a new request with more detail if the situation has changed.'}</p>
              ${card({
                heading: request.eventTitle,
                rows: [
                  { label: 'Decision', value: approved ? 'Approved — event cancelled' : 'Declined — event still active' },
                  { label: 'Reviewed By', value: request.reviewerName || 'EventFlow Admin' },
                  { label: 'Your Reason', value: request.reason },
                  { label: 'Admin Note', value: request.reviewNote }
                ]
              })}
              ${button({ text: 'Open EventFlow', href: `${CLIENT_URL}/events/${request.eventId}` })}
            `
          })
        });
      }
    } catch (mailErr) {
      console.error('reviewRequest: decision saved, but the organizer email failed:', mailErr);
    }

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to review the cancellation request' });
  }
}

module.exports = { createRequest, getMyRequests, getAllRequests, reviewRequest, MIN_REASON_LENGTH };
