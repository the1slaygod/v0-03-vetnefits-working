-- Complete Database Initialization Script for Vetnefits
-- This script creates all necessary tables, relationships, and sample data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    logo TEXT,
    subscription_status VARCHAR(20) DEFAULT 'trial',
    subscription_plan VARCHAR(20) DEFAULT 'monthly',
    subscription_valid_till TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clinic_settings table
CREATE TABLE IF NOT EXISTS clinic_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    clinic_name VARCHAR(255),
    clinic_phone VARCHAR(20),
    clinic_email VARCHAR(255),
    clinic_address TEXT,
    clinic_logo TEXT,
    subscription_status VARCHAR(20) DEFAULT 'trial',
    subscription_plan VARCHAR(20) DEFAULT 'monthly',
    subscription_valid_till TIMESTAMP,
    theme VARCHAR(10) DEFAULT 'light',
    default_view VARCHAR(20) DEFAULT 'dashboard',
    modules JSONB DEFAULT '{"vaccines": true, "compliance": true, "lab_reports": true, "otc_billing": true}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id)
);

-- Create clinic_staff table
CREATE TABLE IF NOT EXISTS clinic_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('doctor', 'receptionist', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(100) NOT NULL,
    breed VARCHAR(100),
    age INTEGER,
    weight DECIMAL(5,2),
    gender VARCHAR(10),
    color VARCHAR(100),
    microchip_id VARCHAR(50),
    photo TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP NOT NULL,
    duration INTEGER DEFAULT 30,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    sku VARCHAR(100),
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    supplier VARCHAR(255),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    follow_up_date DATE,
    veterinarian VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    batch_number VARCHAR(100),
    veterinarian VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create billing table
CREATE TABLE IF NOT EXISTS billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
    payment_method VARCHAR(50),
    items JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lab_reports table
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    results TEXT,
    reference_ranges TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    lab_technician VARCHAR(255),
    veterinarian VARCHAR(255),
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admissions table
CREATE TABLE IF NOT EXISTS admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discharge_date TIMESTAMP,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'admitted' CHECK (status IN ('admitted', 'discharged', 'transferred')),
    room_number VARCHAR(20),
    daily_rate DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default clinic
INSERT INTO clinics (id, name, email, phone, address, logo, subscription_status, subscription_plan, subscription_valid_till)
VALUES (
    'default-clinic-id',
    'Vetnefits Animal Hospital',
    'admin@vetnefits.com',
    '+91 98765 43210',
    '123 Pet Street, Animal City, AC 12345',
    '/images/clinic-logo.png',
    'trial',
    'monthly',
    CURRENT_TIMESTAMP + INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Insert default clinic settings
INSERT INTO clinic_settings (clinic_id, clinic_name, clinic_phone, clinic_email, clinic_address, clinic_logo)
VALUES (
    'default-clinic-id',
    'Vetnefits Animal Hospital',
    '+91 98765 43210',
    'admin@vetnefits.com',
    '123 Pet Street, Animal City, AC 12345',
    '/images/clinic-logo.png'
) ON CONFLICT (clinic_id) DO NOTHING;

-- Insert sample staff
INSERT INTO clinic_staff (clinic_id, name, email, role, status) VALUES
('default-clinic-id', 'Dr. Sarah Johnson', 'dr.sarah@vetnefits.com', 'doctor', 'active'),
('default-clinic-id', 'Mike Wilson', 'mike@vetnefits.com', 'receptionist', 'active'),
('default-clinic-id', 'Admin User', 'admin@vetnefits.com', 'admin', 'active');

-- Insert sample patients
INSERT INTO patients (id, clinic_id, name, email, phone, address) VALUES
('patient-1', 'default-clinic-id', 'John Smith', 'john.smith@email.com', '+91 98765 11111', '456 Oak Street, Pet City'),
('patient-2', 'default-clinic-id', 'Emily Davis', 'emily.davis@email.com', '+91 98765 22222', '789 Pine Avenue, Animal Town'),
('patient-3', 'default-clinic-id', 'Michael Brown', 'michael.brown@email.com', '+91 98765 33333', '321 Elm Road, Pet Village');

-- Insert sample pets
INSERT INTO pets (id, clinic_id, patient_id, name, species, breed, age, weight, gender, color) VALUES
('pet-1', 'default-clinic-id', 'patient-1', 'Buddy', 'Dog', 'Golden Retriever', 3, 25.5, 'Male', 'Golden'),
('pet-2', 'default-clinic-id', 'patient-1', 'Luna', 'Cat', 'Persian', 2, 4.2, 'Female', 'White'),
('pet-3', 'default-clinic-id', 'patient-2', 'Max', 'Dog', 'German Shepherd', 5, 30.0, 'Male', 'Black and Tan'),
('pet-4', 'default-clinic-id', 'patient-3', 'Whiskers', 'Cat', 'Siamese', 1, 3.8, 'Male', 'Cream and Brown');

-- Insert sample inventory
INSERT INTO inventory (clinic_id, name, category, sku, current_stock, minimum_stock, unit_price, supplier) VALUES
('default-clinic-id', 'Rabies Vaccine', 'Vaccines', 'VAC-RAB-001', 50, 10, 250.00, 'VetSupply Co.'),
('default-clinic-id', 'DHPP Vaccine', 'Vaccines', 'VAC-DHPP-001', 30, 5, 180.00, 'VetSupply Co.'),
('default-clinic-id', 'Amoxicillin 500mg', 'Antibiotics', 'ANT-AMX-500', 100, 20, 15.00, 'PharmVet Ltd.'),
('default-clinic-id', 'Surgical Gloves', 'Supplies', 'SUP-GLV-001', 200, 50, 2.50, 'MedSupply Inc.'),
('default-clinic-id', 'Dog Food (Premium)', 'Food', 'FOOD-DOG-PREM', 25, 5, 450.00, 'PetNutrition Co.');

-- Insert sample appointments
INSERT INTO appointments (clinic_id, patient_id, pet_id, appointment_date, reason, status) VALUES
('default-clinic-id', 'patient-1', 'pet-1', CURRENT_TIMESTAMP + INTERVAL '1 day', 'Annual checkup', 'scheduled'),
('default-clinic-id', 'patient-2', 'pet-3', CURRENT_TIMESTAMP + INTERVAL '2 days', 'Vaccination', 'scheduled'),
('default-clinic-id', 'patient-3', 'pet-4', CURRENT_TIMESTAMP + INTERVAL '3 days', 'Dental cleaning', 'confirmed');

-- Insert sample medical records
INSERT INTO medical_records (clinic_id, pet_id, chief_complaint, diagnosis, treatment, veterinarian) VALUES
('default-clinic-id', 'pet-1', 'Limping on front left leg', 'Mild sprain', 'Rest and anti-inflammatory medication', 'Dr. Sarah Johnson'),
('default-clinic-id', 'pet-2', 'Not eating well', 'Dental issues', 'Dental cleaning and antibiotics', 'Dr. Sarah Johnson');

-- Insert sample vaccinations
INSERT INTO vaccinations (clinic_id, pet_id, vaccine_name, vaccination_date, next_due_date, veterinarian) VALUES
('default-clinic-id', 'pet-1', 'Rabies', CURRENT_DATE - INTERVAL '11 months', CURRENT_DATE + INTERVAL '1 month', 'Dr. Sarah Johnson'),
('default-clinic-id', 'pet-1', 'DHPP', CURRENT_DATE - INTERVAL '11 months', CURRENT_DATE + INTERVAL '1 month', 'Dr. Sarah Johnson'),
('default-clinic-id', 'pet-3', 'Rabies', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '6 months', 'Dr. Sarah Johnson');

-- Insert sample notifications
INSERT INTO notifications (clinic_id, title, message, type) VALUES
('default-clinic-id', 'Appointment Reminder', 'Buddy has an appointment tomorrow at 2:00 PM', 'reminder'),
('default-clinic-id', 'Low Stock Alert', 'Rabies vaccine is running low (10 units remaining)', 'warning'),
('default-clinic-id', 'New Patient', 'Whiskers (Siamese cat) has been registered', 'info');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pets_clinic_id ON pets(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pets_patient_id ON pets(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_inventory_clinic_id ON inventory(clinic_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_clinic_id ON medical_records(clinic_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_clinic_id ON vaccinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_billing_clinic_id ON billing(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_clinic_id ON lab_reports(clinic_id);
CREATE INDEX IF NOT EXISTS idx_admissions_clinic_id ON admissions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_notifications_clinic_id ON notifications(clinic_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinic_settings_updated_at BEFORE UPDATE ON clinic_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinic_staff_updated_at BEFORE UPDATE ON clinic_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON vaccinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON lab_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
