CREATE DATABASE vap_bookings;
USE vap_booking;

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    slot_datetime VARCHAR(100) NOT NULL,
    topics TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE page_storage (
    storage_key VARCHAR(100) PRIMARY KEY,
    storage_value LONGTEXT NOT NULL
);
INSERT INTO page_storage (storage_key, storage_value)
VALUES (
  'vap-time-slots',
  '["26 May 2026, 1:00 PM AEST","26 May 2026, 1:30 PM AEST","26 May 2026, 2:00 PM AEST","26 May 2026, 2:30 PM AEST","26 May 2026, 3:00 PM AEST","26 May 2026, 3:30 PM AEST"]'
);
