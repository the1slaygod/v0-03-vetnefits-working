-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  age INTEGER,
  gender VARCHAR(20),
  weight DECIMAL(5,2),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create soap_notes table
CREATE TABLE IF NOT EXISTS soap_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  doctor_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_owner_name ON patients(owner_name);
CREATE INDEX IF NOT EXISTS idx_soap_notes_patient_id ON soap_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_date ON soap_notes(date);
