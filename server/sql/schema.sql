-- ============================================
-- EventFlow Database Schema
-- MySQL 8.0+ | 3NF
-- ============================================

CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','organizer','staff') NOT NULL DEFAULT 'organizer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venues (
  venue_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  contact_number VARCHAR(20) NULL
);

CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
);

CREATE TABLE vendors (
  vendor_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  contact_email VARCHAR(150) NULL,
  contact_phone VARCHAR(20) NULL,
  base_price DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE guests (
  guest_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(20) NULL,
  description VARCHAR(255) NULL,
  guest_type ENUM('Normal','VIP','VVIP') NOT NULL DEFAULT 'Normal'
);

-- ---- core record ----

CREATE TABLE events (
  event_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  category_id INT NULL,
  organizer_id INT NOT NULL,
  venue_id INT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  status ENUM('planned','ongoing','completed','cancelled') DEFAULT 'planned',
  budget DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE SET NULL
);

-- ---- junction & dependent tables ----

CREATE TABLE event_vendors (
  event_vendor_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  vendor_id INT NOT NULL,
  agreed_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  UNIQUE (event_id, vendor_id)
);

CREATE TABLE event_guests (
  event_guest_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  guest_id INT NOT NULL,
  rsvp_status ENUM('invited','accepted','declined','no_response') DEFAULT 'invited',
  -- Set only when the guest THEMSELVES submits accepted/declined through
  -- their own RSVP link (rsvp.controller.js#updateRsvpByToken) — never by
  -- the auto-decline sweep, which still sets rsvp_status='declined' for a
  -- non-responder but leaves this false, so they can still respond for
  -- real afterwards. Once true, rsvp_status is final for that guest.
  rsvp_locked TINYINT(1) NOT NULL DEFAULT 0,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  token VARCHAR(64) UNIQUE NULL,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE,
  UNIQUE (event_id, guest_id)
);

CREATE TABLE tasks (
  task_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  assigned_to INT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  due_date DATE NULL,
  status ENUM('pending','in_progress','done') DEFAULT 'pending',
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
);

-- A staff member's own progress/completion note on a task they're assigned
-- to — distinct from `feedback` above, which is a guest's review of an
-- event. Always tied to the staff account that wrote it, so it can never
-- be submitted anonymously or on someone else's behalf.
CREATE TABLE task_feedback (
  task_feedback_id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  staff_id INT NOT NULL,
  stage ENUM('in_progress','completed') NOT NULL DEFAULT 'in_progress',
  comment TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- NULL for every 'in_progress' row (any number allowed — MySQL doesn't
  -- count NULLs as duplicates in a unique index) and 1 only for a
  -- 'completed' row, so the unique key below allows unlimited progress
  -- notes per staff member per task but at most one completion note.
  completed_marker TINYINT GENERATED ALWAYS AS (IF(stage = 'completed', 1, NULL)) VIRTUAL,
  FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uniq_task_staff_completed (task_id, staff_id, completed_marker)
);

CREATE TABLE event_schedule (
  schedule_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  activity_title VARCHAR(150) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NULL,
  notes VARCHAR(255) NULL,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE TABLE feedback (
  feedback_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  guest_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE,
  CHECK (rating BETWEEN 1 AND 5)
);

-- Venue booking + SSLCommerz deposit ledger. A venue counts as unavailable
-- for an event's dates when a 'paid' row exists, or a 'pending' row less
-- than 30 minutes old (closes the race between two organizers paying for
-- the same slot at once) — see bookings.controller.js. events.venue_id is
-- only set once a booking's payment is validated.
--
-- Only the 10% deposit is charged here; the remaining 90% becomes due after
-- the event ends and is settled through balance_payments below.
-- overdue_alert_sent_at exists purely so the admin alert email for an
-- overdue balance fires once, not on every page load that runs the sweep
-- (see balancePayments.controller.js#sweepOverdueBalances).
CREATE TABLE venue_bookings (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  venue_id INT NOT NULL,
  organizer_id INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
  tran_id VARCHAR(64) NOT NULL UNIQUE,
  val_id VARCHAR(64) NULL,
  paid_at TIMESTAMP NULL,
  overdue_alert_sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Vendor hire + SSLCommerz payment ledger, same two-stage model as
-- venue_bookings: a 10% deposit confirms the hire up front (event_vendors
-- only gets its row once that deposit is validated — see
-- payments.controller.js; there is no free/unpaid path to hire a vendor),
-- and the remaining 90% becomes due after the event ends, settled through
-- balance_payments below.
CREATE TABLE vendor_bookings (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  vendor_id INT NOT NULL,
  organizer_id INT NOT NULL,
  agreed_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
  tran_id VARCHAR(64) NOT NULL UNIQUE,
  val_id VARCHAR(64) NULL,
  paid_at TIMESTAMP NULL,
  overdue_alert_sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Post-event settlement of the remaining 90% owed on a venue booking or a
-- vendor hire — due within 3 days of the event's end_datetime, after which
-- the organizer is flagged to the admin (see balancePayments.controller.js).
--
-- The outstanding list itself is never stored: it's derived live from the
-- paid deposits of completed events minus the settled rows here, so it
-- can't go stale (same reasoning as vipAlerts in EventFlowContext). A row
-- only appears once the organizer actually starts a balance checkout.
--
-- source_booking_id is deliberately not a foreign key — it points at either
-- venue_bookings.booking_id or vendor_bookings.booking_id depending on
-- booking_type, which no single FK can express. paid_marker is NULL for
-- every non-paid attempt (so failed/cancelled retries are unlimited) and 1
-- once settled, letting the unique key below guarantee a booking can never
-- be paid off twice.
-- Event cancellation is request-based, never self-service: an organizer
-- files a reason here and an admin has to approve it before
-- events.status ever becomes 'cancelled' (see
-- cancellationRequests.controller.js — that approval is the only place the
-- app sets a cancelled status for an organizer's own event).
--
-- pending_marker is NULL for every reviewed row and 1 while pending, so the
-- unique key allows only one open request per event while keeping the full
-- history of rejected ones — an organizer can re-file after a rejection.
CREATE TABLE event_cancellation_requests (
  request_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  organizer_id INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by INT NULL,
  review_note TEXT NULL,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  pending_marker TINYINT GENERATED ALWAYS AS (IF(status = 'pending', 1, NULL)) VIRTUAL,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  UNIQUE KEY uniq_open_request (event_id, pending_marker)
);

CREATE TABLE balance_payments (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  booking_type ENUM('venue','vendor') NOT NULL,
  source_booking_id INT NOT NULL,
  event_id INT NOT NULL,
  organizer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
  tran_id VARCHAR(64) NOT NULL UNIQUE,
  val_id VARCHAR(64) NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_marker TINYINT GENERATED ALWAYS AS (IF(status = 'paid', 1, NULL)) VIRTUAL,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  UNIQUE KEY uniq_settled_balance (booking_type, source_booking_id, paid_marker),
  KEY idx_source_booking (booking_type, source_booking_id)
);

-- EventFlow's own flat platform fee for creating an event — SSLCommerz
-- ledger, same shape as venue_bookings/vendor_bookings (including the
-- `booking_id` PK name, so payments.controller.js's shared status/val_id
-- update logic works across all three without a table-specific branch).
-- Unlike those two, the event doesn't exist yet when checkout starts: the
-- organizer's submitted event form is stashed in `payload` and only
-- actually INSERTed into `events` once payment is confirmed (see
-- payments.controller.js#confirmPaidBooking), at which point `event_id`
-- here gets filled in.
CREATE TABLE event_creation_fees (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  organizer_id INT NOT NULL,
  event_id INT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  status ENUM('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
  tran_id VARCHAR(64) NOT NULL UNIQUE,
  val_id VARCHAR(64) NULL,
  payload JSON NOT NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE SET NULL
);