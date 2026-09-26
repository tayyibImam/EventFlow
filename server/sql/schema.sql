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
  description VARCHAR(255) NULL
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