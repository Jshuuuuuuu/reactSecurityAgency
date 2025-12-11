-- Seed data for gender and civilstatus tables
-- Run this in your PostgreSQL database if the tables are empty

-- Insert genders
INSERT INTO gender (gender_id, gender_name) VALUES 
(1, 'Male'),
(2, 'Female'),
(3, 'Other')
ON CONFLICT (gender_id) DO NOTHING;

-- Insert civil statuses
INSERT INTO civilstatus (civilstatus_id, title) VALUES 
(1, 'Single'),
(2, 'Married'),
(3, 'Divorced'),
(4, 'Widowed')
ON CONFLICT (civilstatus_id) DO NOTHING;

-- Set the sequences to continue from the last inserted ID
SELECT setval('gender_gender_id_seq', (SELECT MAX(gender_id) FROM gender));
SELECT setval('civilstatus_civilstatus_id_seq', (SELECT MAX(civilstatus_id) FROM civilstatus));
