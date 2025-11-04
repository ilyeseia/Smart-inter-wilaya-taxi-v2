-- Smart Inter-Wilaya Taxi Platform Database Setup
-- PostgreSQL Database Schema

-- Create database
CREATE DATABASE smart_taxi_db;

-- Connect to the database
\c smart_taxi_db;

-- Create user service schema for multi-tenant architecture
CREATE SCHEMA IF NOT EXISTS user_service;

-- Set search path
SET search_path TO user_service;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address VARCHAR(200),
    city VARCHAR(100),
    wilaya VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    license_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year_of_manufacture INTEGER,
    vehicle_type VARCHAR(50),
    color VARCHAR(20),
    seats INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    insurance_number VARCHAR(100),
    insurance_expiry TIMESTAMP,
    registration_number VARCHAR(100),
    registration_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table for role management
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_vehicles junction table
CREATE TABLE IF NOT EXISTS user_vehicles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vehicle_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_city_wilaya ON users(city, wilaya);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_license ON users(license_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vehicles_user_id ON user_vehicles(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at 
    BEFORE UPDATE ON vehicles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
-- Sample admin user
INSERT INTO users (email, password, first_name, last_name, phone_number, city, wilaya, license_number) 
VALUES (
    'admin@smarttaxi.dz', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'System',
    'Administrator',
    '+213555000000',
    'Algiers',
    'Algiers',
    'ADMIN001'
);

-- Add admin role
INSERT INTO user_roles (user_id, role) 
SELECT id, 'ROLE_ADMIN' FROM users WHERE email = 'admin@smarttaxi.dz';

-- Sample taxi driver
INSERT INTO users (email, password, first_name, last_name, phone_number, city, wilaya, license_number) 
VALUES (
    'driver1@smarttaxi.dz', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Ahmed',
    'Benali',
    '+213555123456',
    'Algiers',
    'Algiers',
    'D123456'
);

-- Add user role
INSERT INTO user_roles (user_id, role) 
SELECT id, 'ROLE_USER' FROM users WHERE email = 'driver1@smarttaxi.dz';

-- Sample vehicle
INSERT INTO vehicles (license_plate, make, model, year_of_manufacture, vehicle_type, color, seats, insurance_number, registration_number) 
VALUES (
    '12345-Algiers-16',
    'Renault',
    'Symbol',
    2018,
    'sedan',
    'White',
    4,
    'INS123456',
    'REG789012'
);

-- Associate vehicle with user
INSERT INTO user_vehicles (user_id, vehicle_id)
SELECT u.id, v.id 
FROM users u, vehicles v 
WHERE u.email = 'driver1@smarttaxi.dz' AND v.license_plate = '12345-Algiers-16';

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA user_service TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA user_service TO postgres;

-- Enable row level security (RLS) for multi-tenant data isolation
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies for data isolation (will be used by application layer)
-- Note: Application will handle tenant isolation through service layer

-- Database setup completed
SELECT 'Database setup completed successfully!' as status;