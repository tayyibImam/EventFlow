# EventFlow — Database Schema Reference

**17 tables · 27 foreign keys · MySQL 8.0+ · 3NF**

> Generated from a live introspection of the `eventflow` database (`INFORMATION_SCHEMA`),
> so it matches [`server/sql/schema.sql`](../../server/sql/schema.sql) exactly — that file
> remains the source of truth and the thing you actually run.

See [`../erd/EventFlow_ERD.md`](../erd/EventFlow_ERD.md) for the entity-relationship diagram.

## Contents

- **Reference & identity** — [`users`](#users), [`venues`](#venues), [`vendors`](#vendors), [`categories`](#categories), [`guests`](#guests)
- **Core record** — [`events`](#events)
- **Event dependents & junctions** — [`event_guests`](#event_guests), [`event_vendors`](#event_vendors), [`tasks`](#tasks), [`task_feedback`](#task_feedback), [`event_schedule`](#event_schedule), [`feedback`](#feedback)
- **Payment ledgers & workflow** — [`venue_bookings`](#venue_bookings), [`vendor_bookings`](#vendor_bookings), [`balance_payments`](#balance_payments), [`event_creation_fees`](#event_creation_fees), [`event_cancellation_requests`](#event_cancellation_requests)

---

## Reference & identity

_Standalone lookup data that exists independently of any event._

### `users`

Every authenticated account — `admin`, `organizer` or `staff`. Guests are deliberately *not* users (see `guests`).

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `user_id` | `int` | no | PK | — | auto-increment |
| `name` | `varchar(100)` | no |  | — |  |
| `email` | `varchar(150)` | no | UQ | — |  |
| `phone` | `varchar(20)` | yes |  | NULL |  |
| `password_hash` | `varchar(255)` | no |  | — |  |
| `role` | `enum('admin','organizer','staff')` | no |  | `organizer` |  |
| `created_at` | `timestamp` | yes |  | `CURRENT_TIMESTAMP` |  |

**Keys & indexes**

- `UNIQUE email` (`email`)

### `venues`

Bookable venue catalog, priced per day.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `venue_id` | `int` | no | PK | — | auto-increment |
| `name` | `varchar(150)` | no |  | — |  |
| `address` | `varchar(255)` | no |  | — |  |
| `city` | `varchar(100)` | no |  | — |  |
| `capacity` | `int` | no |  | — |  |
| `price_per_day` | `decimal(10,2)` | no |  | — |  |
| `contact_number` | `varchar(20)` | yes |  | NULL |  |

### `vendors`

Service-provider catalog (catering, décor, AV, …) with a base price.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `vendor_id` | `int` | no | PK | — | auto-increment |
| `name` | `varchar(150)` | no |  | — |  |
| `service_type` | `varchar(100)` | no |  | — |  |
| `contact_email` | `varchar(150)` | yes |  | NULL |  |
| `contact_phone` | `varchar(20)` | yes |  | NULL |  |
| `base_price` | `decimal(10,2)` | yes |  | `0.00` |  |

### `categories`

Event category taxonomy, managed by admins.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `category_id` | `int` | no | PK | — | auto-increment |
| `name` | `varchar(100)` | no | UQ | — |  |
| `description` | `varchar(255)` | yes |  | NULL |  |

**Keys & indexes**

- `UNIQUE name` (`name`)

### `guests`

Unauthenticated invitee directory — no login, no password. Reached only through a per-invite RSVP token.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `guest_id` | `int` | no | PK | — | auto-increment |
| `name` | `varchar(100)` | no |  | — |  |
| `email` | `varchar(150)` | yes |  | NULL |  |
| `phone` | `varchar(20)` | yes |  | NULL |  |
| `description` | `varchar(255)` | yes |  | NULL |  |
| `guest_type` | `enum('Normal','VIP','VVIP')` | no |  | `Normal` |  |

---

## Core record

_The table everything else hangs off._

### `events`

The central record: who is organising what, where, when, and at what budget. `venue_id` is only ever set once a venue deposit is paid.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `event_id` | `int` | no | PK | — | auto-increment |
| `title` | `varchar(150)` | no |  | — |  |
| `description` | `text` | yes |  | NULL |  |
| `category_id` | `int` | yes | FK | NULL | → `categories.category_id` (ON DELETE SET NULL) |
| `organizer_id` | `int` | no | FK | — | → `users.user_id` (ON DELETE RESTRICT) |
| `venue_id` | `int` | yes | FK | NULL | → `venues.venue_id` (ON DELETE SET NULL) |
| `start_datetime` | `datetime` | no |  | — |  |
| `end_datetime` | `datetime` | no |  | — |  |
| `status` | `enum('planned','ongoing','completed','cancelled')` | yes |  | `planned` |  |
| `budget` | `decimal(10,2)` | yes |  | `0.00` |  |
| `created_at` | `timestamp` | yes |  | `CURRENT_TIMESTAMP` |  |

**Keys & indexes**

- `INDEX category_id` (`category_id`)
- `INDEX organizer_id` (`organizer_id`)
- `INDEX venue_id` (`venue_id`)

---

## Event dependents & junctions

_Per-event planning data, including the two many-to-many junctions._

### `event_guests`

M:N junction between events and guests, carrying the RSVP state plus the unique random `token` that is the guest's only credential. `rsvp_locked` makes the guest's own accept/decline final.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `event_guest_id` | `int` | no | PK | — | auto-increment |
| `event_id` | `int` | no | FK | — | → `events.event_id` (ON DELETE CASCADE) |
| `guest_id` | `int` | no | FK | — | → `guests.guest_id` (ON DELETE CASCADE) |
| `rsvp_status` | `enum('invited','accepted','declined','no_response')` | yes |  | `invited` |  |
| `invited_at` | `timestamp` | yes |  | `CURRENT_TIMESTAMP` |  |
| `token` | `varchar(64)` | yes | UQ | NULL |  |
| `rsvp_locked` | `tinyint(1)` | no |  | `0` |  |

**Keys & indexes**

- `UNIQUE event_id` (`event_id`, `guest_id`)
- `UNIQUE token` (`token`)
- `INDEX guest_id` (`guest_id`)

### `event_vendors`

M:N junction between events and vendors, carrying the agreed price. A row only exists once the vendor's 10% deposit has cleared.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `event_vendor_id` | `int` | no | PK | — | auto-increment |
| `event_id` | `int` | no | FK | — | → `events.event_id` (ON DELETE CASCADE) |
| `vendor_id` | `int` | no | FK | — | → `vendors.vendor_id` (ON DELETE CASCADE) |
| `agreed_price` | `decimal(10,2)` | no |  | — |  |
| `status` | `enum('pending','confirmed','cancelled')` | yes |  | `pending` |  |

**Keys & indexes**

- `UNIQUE event_id` (`event_id`, `vendor_id`)
- `INDEX vendor_id` (`vendor_id`)

### `tasks`

Planning to-dos for an event, optionally assigned to a staff account.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `task_id` | `int` | no | PK | — | auto-increment |
| `event_id` | `int` | no | FK | — | → `events.event_id` (ON DELETE CASCADE) |
| `assigned_to` | `int` | yes | FK | NULL | → `users.user_id` (ON DELETE SET NULL) |
| `title` | `varchar(150)` | no |  | — |  |
| `description` | `text` | yes |  | NULL |  |
| `due_date` | `date` | yes |  | NULL |  |
| `status` | `enum('pending','in_progress','done')` | yes |  | `pending` |  |

**Keys & indexes**

- `INDEX assigned_to` (`assigned_to`)
- `INDEX event_id` (`event_id`)

### `task_feedback`

A staff member's progress or completion note on their own task. Unlimited `in_progress` notes, exactly one `completed` note per staff member per task.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `task_feedback_id` | `int` | no | PK | — | auto-increment |
| `task_id` | `int` | no | FK | — | → `tasks.task_id` (ON DELETE CASCADE) |
| `staff_id` | `int` | no | FK | — | → `users.user_id` (ON DELETE CASCADE) |
| `stage` | `enum('in_progress','completed')` | no |  | `in_progress` |  |
| `comment` | `text` | no |  | — |  |
| `submitted_at` | `timestamp` | yes |  | `CURRENT_TIMESTAMP` |  |
| `is_read` | `tinyint(1)` | no |  | `0` |  |
| `completed_marker` | `tinyint` | yes |  | NULL | generated: `if((stage = 'completed'),1,NULL)` |

**Keys & indexes**

- `UNIQUE uniq_task_staff_completed` (`task_id`, `staff_id`, `completed_marker`)
- `INDEX staff_id` (`staff_id`)

### `event_schedule`

Event-day agenda items (activity, start/end time, notes).

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `schedule_id` | `int` | no | PK | — | auto-increment |
| `event_id` | `int` | no | FK | — | → `events.event_id` (ON DELETE CASCADE) |
| `activity_title` | `varchar(150)` | no |  | — |  |
| `start_time` | `time` | no |  | — |  |
| `end_time` | `time` | yes |  | NULL |  |
| `notes` | `varchar(255)` | yes |  | NULL |  |

**Keys & indexes**

- `INDEX event_id` (`event_id`)

### `feedback`

A guest's post-event rating (1–5) and comment.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `feedback_id` | `int` | no | PK | — | auto-increment |
| `event_id` | `int` | no | FK | — | → `events.event_id` (ON DELETE CASCADE) |
| `guest_id` | `int` | no | FK | — | → `guests.guest_id` (ON DELETE CASCADE) |
| `rating` | `tinyint` | no |  | — |  |
| `comment` | `text` | yes |  | NULL |  |
| `submitted_at` | `timestamp` | yes |  | `CURRENT_TIMESTAMP` |  |

**Keys & indexes**

- `INDEX event_id` (`event_id`)
- `INDEX guest_id` (`guest_id`)

---

## Payment ledgers & workflow

_SSLCommerz transaction ledgers and the admin-approval workflow._

### `venue_bookings`

Venue booking ledger. Charges a 10% deposit; the remaining 90% settles through `balance_payments`. A paid row (or a fresh pending one) is what makes a venue unavailable for overlapping dates.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `booking_id` | `int` | no | PK | — | auto-increment |
| `event_id` | `int` | no | FK | — | → `events.event_id` (ON DELETE CASCADE) |
| `venue_id` | `int` | no | FK | — | → `venues.venue_id` (ON DELETE CASCADE) |
| `organizer_id` | `int` | no | FK | — | → `users.user_id` (ON DELETE RESTRICT) |
| `total_price` | `decimal(10,2)` | no |  | — |  |
| `deposit_amount` | `decimal(10,2)` | no |  | — |  |
| `status` | `enum('pending','paid','failed','cancelled')` | no |  | `pending` |  |
| `tran_id` | `varchar(64)` | no | UQ | — |  |
| `val_id` | `varchar(64)` | yes |  | NULL |  |
| `paid_at` | `timestamp` | yes |  | NULL |  |
| `overdue_alert_sent_at` | `timestamp` | yes |  | NULL |  |
| `created_at` | `timestamp` | yes |  | `CURRENT_TIMESTAMP` |  |

**Keys & indexes**

- `UNIQUE tran_id` (`tran_id`)
- `INDEX event_id` (`event_id`)
- `INDEX organizer_id` (`organizer_id`)
- `INDEX venue_id` (`venue_id`)

### `vendor_bookings`

Vendor hire ledger, same two-stage model as `venue_bookings` — a 10% deposit confirms the hire, the remaining 90% settles later.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `booking_id` | `int` | no | PK | — | auto-increment |
| `event_id` | `int` | no | FK | — | → `events.event_id` (ON DELETE CASCADE) |
| `vendor_id` | `int` | no | FK | — | → `vendors.vendor_id` (ON DELETE CASCADE) |
| `organizer_id` | `int` | no | FK | — | → `users.user_id` (ON DELETE RESTRICT) |
| `agreed_price` | `decimal(10,2)` | no |  | — |  |
| `deposit_amount` | `decimal(10,2)` | no |  | `0.00` |  |
| `status` | `enum('pending','paid','failed','cancelled')` | no |  | `pending` |  |
| `tran_id` | `varchar(64)` | no | UQ | — |  |
| `val_id` | `varchar(64)` | yes |  | NULL |  |
| `paid_at` | `timestamp` | yes |  | NULL |  |
| `overdue_alert_sent_at` | `timestamp` | yes |  | NULL |  |
| `created_at` | `timestamp` | yes |  | `CURRENT_TIMESTAMP` |  |

**Keys & indexes**

- `UNIQUE tran_id` (`tran_id`)
- `INDEX event_id` (`event_id`)
- `INDEX organizer_id` (`organizer_id`)
- `INDEX vendor_id` (`vendor_id`)

### `balance_payments`

Post-event settlement of the remaining 90% owed on a venue booking or vendor hire, due within 3 days of the event ending. `source_booking_id` is polymorphic (resolved by `booking_type`), so it carries no FK.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `booking_id` | `int` | no | PK | — | auto-increment |
| `booking_type` | `enum('venue','vendor')` | no |  | — |  |
| `source_booking_id` | `int` | no |  | — |  |
| `event_id` | `int` | no | FK | — | → `events.event_id` (ON DELETE CASCADE) |
| `organizer_id` | `int` | no | FK | — | → `users.user_id` (ON DELETE RESTRICT) |
| `amount` | `decimal(10,2)` | no |  | — |  |
| `status` | `enum('pending','paid','failed','cancelled')` | no |  | `pending` |  |
| `tran_id` | `varchar(64)` | no | UQ | — |  |
| `val_id` | `varchar(64)` | yes |  | NULL |  |
| `paid_at` | `timestamp` | yes |  | NULL |  |
| `created_at` | `timestamp` | yes |  | `CURRENT_TIMESTAMP` |  |
| `paid_marker` | `tinyint` | yes |  | NULL | generated: `if((status = 'paid'),1,NULL)` |

**Keys & indexes**

- `UNIQUE tran_id` (`tran_id`)
- `UNIQUE uniq_settled_balance` (`booking_type`, `source_booking_id`, `paid_marker`)
- `INDEX event_id` (`event_id`)
- `INDEX idx_source_booking` (`booking_type`, `source_booking_id`)
- `INDEX organizer_id` (`organizer_id`)

### `event_creation_fees`

EventFlow's flat platform fee charged at event creation. The submitted event is stashed in `payload` and only becomes a row in `events` once the fee clears.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `booking_id` | `int` | no | PK | — | auto-increment |
| `organizer_id` | `int` | no | FK | — | → `users.user_id` (ON DELETE RESTRICT) |
| `event_id` | `int` | yes | FK | NULL | → `events.event_id` (ON DELETE SET NULL) |
| `amount` | `decimal(10,2)` | no |  | `5000.00` |  |
| `status` | `enum('pending','paid','failed','cancelled')` | no |  | `pending` |  |
| `tran_id` | `varchar(64)` | no | UQ | — |  |
| `val_id` | `varchar(64)` | yes |  | NULL |  |
| `payload` | `json` | no |  | — |  |
| `paid_at` | `timestamp` | yes |  | NULL |  |
| `created_at` | `timestamp` | yes |  | `CURRENT_TIMESTAMP` |  |

**Keys & indexes**

- `UNIQUE tran_id` (`tran_id`)
- `INDEX event_id` (`event_id`)
- `INDEX organizer_id` (`organizer_id`)

### `event_cancellation_requests`

Request/approval workflow for cancelling an event. An organizer files a reason; `events.status` only becomes `cancelled` when an admin approves.

| Column | Type | Null | Key | Default | Notes |
|---|---|:---:|:---:|---|---|
| `request_id` | `int` | no | PK | — | auto-increment |
| `event_id` | `int` | no | FK | — | → `events.event_id` (ON DELETE CASCADE) |
| `organizer_id` | `int` | no | FK | — | → `users.user_id` (ON DELETE CASCADE) |
| `reason` | `text` | no |  | — |  |
| `status` | `enum('pending','approved','rejected')` | no |  | `pending` |  |
| `reviewed_by` | `int` | yes | FK | NULL | → `users.user_id` (ON DELETE SET NULL) |
| `review_note` | `text` | yes |  | NULL |  |
| `requested_at` | `timestamp` | yes |  | `CURRENT_TIMESTAMP` |  |
| `reviewed_at` | `timestamp` | yes |  | NULL |  |
| `pending_marker` | `tinyint` | yes |  | NULL | generated: `if((status = 'pending'),1,NULL)` |

**Keys & indexes**

- `UNIQUE uniq_open_request` (`event_id`, `pending_marker`)
- `INDEX organizer_id` (`organizer_id`)
- `INDEX reviewed_by` (`reviewed_by`)

---

## Relationship summary

| Parent | Child | Type | Meaning | On parent delete |
|---|---|:---:|---|---|
| `events` | `balance_payments.event_id` | 1 : M | One event may owe several balances | CASCADE |
| `users` | `balance_payments.organizer_id` | 1 : M | One organizer settles many balances | RESTRICT |
| `events` | `event_cancellation_requests.event_id` | 1 : M | One event may be the subject of several requests over time | CASCADE |
| `users` | `event_cancellation_requests.organizer_id` | 1 : M | Organizer files the request | CASCADE |
| `users` | `event_cancellation_requests.reviewed_by` | 0..1 : M | Admin reviews and decides the request | SET NULL |
| `users` | `event_creation_fees.organizer_id` | 1 : M | One organizer pays many platform fees | RESTRICT |
| `events` | `event_creation_fees.event_id` | 0..1 : M | The fee row that created the event | SET NULL |
| `events` | `event_guests.event_id` | 1 : M | One event has many invitations | CASCADE |
| `guests` | `event_guests.guest_id` | 1 : M | One guest is invited to many events | CASCADE |
| `events` | `event_schedule.event_id` | 1 : M | One event has many agenda items | CASCADE |
| `events` | `event_vendors.event_id` | 1 : M | One event has many hired vendors | CASCADE |
| `vendors` | `event_vendors.vendor_id` | 1 : M | One vendor is hired for many events | CASCADE |
| `categories` | `events.category_id` | 0..1 : M | One category applies to many events | SET NULL |
| `users` | `events.organizer_id` | 1 : M | One organizer creates many events | RESTRICT |
| `venues` | `events.venue_id` | 0..1 : M | One venue hosts many events, at different times | SET NULL |
| `events` | `feedback.event_id` | 1 : M | One event receives many feedback entries | CASCADE |
| `guests` | `feedback.guest_id` | 1 : M | One guest can leave feedback on multiple events | CASCADE |
| `tasks` | `task_feedback.task_id` | 1 : M | One task collects many staff notes | CASCADE |
| `users` | `task_feedback.staff_id` | 1 : M | One staff member writes many task notes | CASCADE |
| `events` | `tasks.event_id` | 1 : M | One event has many planning tasks | CASCADE |
| `users` | `tasks.assigned_to` | 0..1 : M | One staff member is assigned many tasks | SET NULL |
| `events` | `vendor_bookings.event_id` | 1 : M | One event may hire several vendors | CASCADE |
| `vendors` | `vendor_bookings.vendor_id` | 1 : M | One vendor accumulates many hires | CASCADE |
| `users` | `vendor_bookings.organizer_id` | 1 : M | One organizer pays for many vendor hires | RESTRICT |
| `events` | `venue_bookings.event_id` | 1 : M | One event may go through several venue checkouts | CASCADE |
| `venues` | `venue_bookings.venue_id` | 1 : M | One venue accumulates many bookings | CASCADE |
| `users` | `venue_bookings.organizer_id` | 1 : M | One organizer pays for many venue bookings | RESTRICT |

### Many-to-many pairs

| Between | Via | Payload |
|---|---|---|
| `events` ↔ `guests` | `event_guests` | RSVP status, invite token, RSVP lock |
| `events` ↔ `vendors` | `event_vendors` | Agreed price, booking status |

