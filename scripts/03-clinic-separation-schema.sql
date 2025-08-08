-- Create clinic-specific tables with proper relationships and security

-- Clinics table (master)
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users/Staff table with clinic association
CREATE TABLE IF NOT EXISTS clinic_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin', 'veterinarian', 'nurse', 'receptionist'
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table with clinic separation
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(100) NOT NULL,
    breed VARCHAR(255),
    age INTEGER,
    gender VARCHAR(20),
    weight DECIMAL(10,2),
    color VARCHAR(100),
    microchip_id VARCHAR(100),
    owner_name VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(50),
    owner_email VARCHAR(255),
    owner_address TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    insurance_provider VARCHAR(255),
    insurance_policy VARCHAR(255),
    allergies TEXT,
    medical_conditions TEXT,
    current_medications TEXT,
    photo_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES clinic_users(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    visit_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'
    priority VARCHAR(20) DEFAULT 'normal', -- 'normal', 'urgent', 'emergency'
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_by UUID REFERENCES clinic_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOAP Notes table
CREATE TABLE IF NOT EXISTS soap_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    visit_type VARCHAR(100),
    chief_complaint TEXT,
    subjective TEXT,
    objective JSONB, -- Store vitals and examination findings
    assessment TEXT,
    plan TEXT,
    attachments TEXT[],
    veterinarian_id UUID REFERENCES clinic_users(id),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'completed', 'reviewed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaccines table
CREATE TABLE IF NOT EXISTS vaccines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    vaccine_name VARCHAR(255) NOT NULL,
    dose VARCHAR(100),
    date_administered DATE NOT NULL,
    next_due_date DATE,
    batch_number VARCHAR(255),
    manufacturer VARCHAR(255),
    veterinarian_id UUID REFERENCES clinic_users(id),
    status VARCHAR(50) DEFAULT 'completed', -- 'completed', 'due', 'overdue'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTC Sales table
CREATE TABLE IF NOT EXISTS otc_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id), -- Optional
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    buyer_name VARCHAR(255),
    buyer_phone VARCHAR(50),
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    sold_by UUID REFERENCES clinic_users(id),
    sold_on DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waiting List table
CREATE TABLE IF NOT EXISTS waiting_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_wait_time INTEGER, -- in minutes
    status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'in-progress', 'done'
    veterinarian_id UUID REFERENCES clinic_users(id),
    visit_type VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Tasks table
CREATE TABLE IF NOT EXISTS compliance_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    task VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'overdue', 'cancelled'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    assigned_to UUID REFERENCES clinic_users(id),
    created_by UUID REFERENCES clinic_users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    reminder_sent BOOLEAN DEFAULT false,
    next_reminder_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Miscellaneous Notes table
CREATE TABLE IF NOT EXISTS misc_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'note', -- 'note', 'task', 'reminder', 'idea'
    tags TEXT[],
    attachments JSONB, -- Store file metadata
    assigned_to UUID REFERENCES clinic_users(id),
    created_by UUID REFERENCES clinic_users(id),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'archived'
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing/Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
    payment_method VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES clinic_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_owner_name ON patients(clinic_id, owner_name);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(clinic_id, name);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_patient ON soap_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_patient ON vaccines(patient_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_due_date ON vaccines(clinic_id, next_due_date);
CREATE INDEX IF NOT EXISTS idx_waiting_list_clinic_status ON waiting_list(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_clinic_status ON compliance_tasks(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_due_date ON compliance_tasks(clinic_id, due_date);

-- Row Level Security (RLS) policies
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE otc_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE misc_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their clinic's data)
CREATE POLICY clinic_isolation_patients ON patients FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);
CREATE POLICY clinic_isolation_appointments ON appointments FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);
CREATE POLICY clinic_isolation_soap_notes ON soap_notes FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);
CREATE POLICY clinic_isolation_vaccines ON vaccines FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);
CREATE POLICY clinic_isolation_otc_sales ON otc_sales FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);
CREATE POLICY clinic_isolation_waiting_list ON waiting_list FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);
CREATE POLICY clinic_isolation_compliance_tasks ON compliance_tasks FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);
CREATE POLICY clinic_isolation_misc_notes ON misc_notes FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);
CREATE POLICY clinic_isolation_invoices ON invoices FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);
