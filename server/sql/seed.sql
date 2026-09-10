INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@eventflow.com', 'hashed_placeholder', 'admin'),
('Mirza Tafhim Osman', 'organizer@eventflow.com', 'hashed_placeholder', 'organizer'),
('Staff One', 'staff@eventflow.com', 'hashed_placeholder', 'staff');

INSERT INTO categories (name, description) VALUES
('Wedding', 'Wedding ceremonies and receptions'),
('Conference', 'Corporate and academic conferences');

INSERT INTO venues (name, address, city, capacity, price_per_day, contact_number) VALUES
('Grand Ballroom', '123 Main St', 'Dhaka', 300, 50000.00, '01700000000');

INSERT INTO vendors (name, service_type, contact_email, base_price) VALUES
('Sweet Treats Catering', 'catering', 'contact@sweettreats.com', 20000.00);

INSERT INTO guests (name, email, phone) VALUES
('Guest One', 'guest1@example.com', '01711111111'),
('Guest Two', 'guest2@example.com', '01722222222');

INSERT INTO events (title, description, category_id, organizer_id, venue_id, start_datetime, end_datetime, status, budget) VALUES
('Rahman-Chowdhury Wedding', 'A grand celebration', 1, 2, 1, '2026-11-20 17:00:00', '2026-11-20 23:00:00', 'planned', 500000.00);

INSERT INTO event_vendors (event_id, vendor_id, agreed_price, status) VALUES
(1, 1, 18000.00, 'confirmed');

INSERT INTO event_guests (event_id, guest_id, rsvp_status) VALUES
(1, 1, 'accepted'),
(1, 2, 'invited');

INSERT INTO tasks (event_id, assigned_to, title, due_date, status) VALUES
(1, 3, 'Confirm final headcount with caterer', '2026-11-10', 'pending');