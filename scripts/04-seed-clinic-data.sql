-- Insert sample clinic data
INSERT INTO clinics (id, name, logo_url, address, phone, email) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Vetnefits Animal Hospital',
    '/images/clinic-logo.png',
    '123 Pet Care Lane, Animal City, AC 12345',
    '+1 (555) 123-PETS',
    'info@vetnefits.com'
);

-- Insert sample staff
INSERT INTO clinic_users (id, clinic_id, email, name, role, avatar_url) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'sarah.wilson@vetnefits.com',
    'Dr. Sarah Wilson',
    'veterinarian',
    '/images/dr-sarah.jpg'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'mike.davis@vetnefits.com',
    'Dr. Mike Davis',
    'veterinarian',
    '/images/dr-mike.jpg'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'lisa.garcia@vetnefits.com',
    'Dr. Lisa Garcia',
    'veterinarian',
    '/images/dr-lisa.jpg'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440000',
    'jennifer.nurse@vetnefits.com',
    'Jennifer Smith',
    'nurse',
    '/images/nurse-jennifer.jpg'
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440000',
    'mary.reception@vetnefits.com',
    'Mary Johnson',
    'receptionist',
    '/images/receptionist-mary.jpg'
);

-- Insert sample patients with proper clinic association
INSERT INTO patients (id, clinic_id, name, species, breed, age, gender, weight, color, microchip_id, owner_name, owner_phone, owner_email, owner_address, status, tags) VALUES 
(
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Buddy',
    'Dog',
    'Golden Retriever',
    3,
    'Male',
    65.5,
    'Golden',
    '123456789012345',
    'John Smith',
    '+1 (555) 123-4567',
    'john.smith@email.com',
    '456 Oak Street, Pet City, PC 67890',
    'active',
    ARRAY['friendly', 'vaccinated', 'regular-checkup']
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'Whiskers',
    'Cat',
    'Persian',
    5,
    'Female',
    8.2,
    'White',
    '987654321098765',
    'Sarah Johnson',
    '+1 (555) 987-6543',
    'sarah.johnson@email.com',
    '789 Pine Avenue, Animal Town, AT 54321',
    'active',
    ARRAY['indoor', 'senior', 'special-diet']
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'Max',
    'Dog',
    'German Shepherd',
    7,
    'Male',
    75.0,
    'Black and Tan',
    '456789123456789',
    'Mike Davis',
    '+1 (555) 456-7890',
    'mike.davis@email.com',
    '321 Elm Drive, Pet Haven, PH 98765',
    'active',
    ARRAY['guard-dog', 'trained', 'large-breed']
);

-- Insert sample appointments
INSERT INTO appointments (id, clinic_id, patient_id, veterinarian_id, appointment_date, appointment_time, visit_type, status, priority, notes, created_by) VALUES 
(
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    CURRENT_DATE,
    '09:00:00',
    'Annual Checkup',
    'scheduled',
    'normal',
    'Annual wellness examination',
    '550e8400-e29b-41d4-a716-446655440005'
),
(
    '770e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    CURRENT_DATE,
    '10:30:00',
    'Vaccination',
    'confirmed',
    'normal',
    'FVRCP booster shot',
    '550e8400-e29b-41d4-a716-446655440005'
);

-- Insert sample vaccines
INSERT INTO vaccines (id, clinic_id, patient_id, vaccine_name, dose, date_administered, next_due_date, batch_number, manufacturer, veterinarian_id, status) VALUES 
(
    '880e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440001',
    'DHPP',
    '1ml',
    '2024-01-15',
    '2025-01-15',
    'BATCH123',
    'Zoetis',
    '550e8400-e29b-41d4-a716-446655440001',
    'completed'
),
(
    '880e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440001',
    'Rabies',
    '1ml',
    '2023-12-01',
    '2024-12-01',
    'BATCH456',
    'Merial',
    '550e8400-e29b-41d4-a716-446655440001',
    'overdue'
);

-- Insert sample compliance tasks
INSERT INTO compliance_tasks (id, clinic_id, patient_id, task, description, due_date, status, priority, assigned_to, created_by) VALUES 
(
    '990e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440001',
    '2nd Rabies Dose',
    'Second rabies vaccination due',
    '2024-08-14',
    'pending',
    'high',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001'
);
