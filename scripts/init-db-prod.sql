-- Production Database Initialization Script
-- This script sets up the production database schema and sample data

-- Create applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    description TEXT,
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert sample applications if they don't exist (ON CONFLICT to prevent overwriting existing data)
INSERT INTO applications (id, name, base_url, description, contact_email, is_active) VALUES
    (1, 'E-commerce', 'https://shop.graceshoppee.tech', 'QR codes for online store products and promotions', 'shop@graceshoppee.tech', true),
    (2, 'Restaurant', 'https://restaurant.graceshoppee.tech', 'QR codes for menus, reservations, and feedback', 'restaurant@graceshoppee.tech', true),
    (3, 'Event', 'https://events.graceshoppee.tech', 'QR codes for event tickets, schedules, and information', 'events@graceshoppee.tech', true),
    (4, 'Marketing', 'https://marketing.graceshoppee.tech', 'QR codes for campaigns, advertisements, and lead generation', 'marketing@graceshoppee.tech', true)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for applications table if needed
SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications));

-- Create qr_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS qr_codes (
    id BIGSERIAL PRIMARY KEY,
    qr_id VARCHAR(100) UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    description TEXT,
    created_by VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_id BIGINT,
    CONSTRAINT fk_application
        FOREIGN KEY(application_id)
        REFERENCES applications(id)
        ON DELETE SET NULL
);

-- Insert sample QR codes if they don't exist (ON CONFLICT to prevent overwriting existing data)
-- QR IDs must match pattern: ^[A-Z]{2,10}-[A-Z0-9]{8}$ (e.g., SAMPLE-8DEA1C60)
INSERT INTO qr_codes (qr_id, target_url, description, created_by, application_id) VALUES
    ('SAMPLE-8DEA1C60', 'https://www.example.com/product1', 'Sample Product 1 QR', 'admin@graceshoppee.tech', 1),
    ('MENU-B2C1D4E5', 'https://www.restaurant.com/menu', 'Restaurant Menu QR', 'chef@graceshoppee.tech', 2),
    ('EVENT-F6A7B8C9', 'https://www.eventbrite.com/event', 'Event Ticket QR', 'organizer@graceshoppee.tech', 3),
    ('MARKET-A1B2C3D4', 'https://www.marketing-campaign.com', 'Marketing Campaign QR', 'marketing@graceshoppee.tech', 4)
ON CONFLICT (qr_id) DO NOTHING;

-- Reset sequence for qr_codes table if needed
SELECT setval('qr_codes_id_seq', (SELECT MAX(id) FROM qr_codes));

-- Create qr_redirect_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS qr_redirect_logs (
    id BIGSERIAL PRIMARY KEY,
    qr_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    redirect_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_url TEXT,
    success BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_qr_id ON qr_codes(qr_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_redirect_logs_qr_id ON qr_redirect_logs(qr_id);
CREATE INDEX IF NOT EXISTS idx_qr_redirect_logs_redirect_time ON qr_redirect_logs(redirect_time);