-- Insert sample patients
INSERT INTO patients (
  id, name, species, breed, age, gender, weight, color, microchip_id,
  owner_name, owner_phone, owner_email, owner_address,
  emergency_contact, emergency_phone, insurance_provider, insurance_policy,
  allergies, medical_conditions, current_medications
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Buddy',
  'Dog',
  'Golden Retriever',
  5,
  'Male',
  65.5,
  'Golden',
  'CHIP123456789',
  'John Smith',
  '+1 (555) 123-4567',
  'john.smith@email.com',
  '123 Main St, Anytown, ST 12345',
  'Jane Smith',
  '+1 (555) 123-4568',
  'PetInsure Plus',
  'POL-123456',
  'None known',
  'Hip dysplasia (mild)',
  'Glucosamine supplement'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Whiskers',
  'Cat',
  'Persian',
  3,
  'Female',
  8.2,
  'White',
  'CHIP987654321',
  'Sarah Johnson',
  '+1 (555) 987-6543',
  'sarah.johnson@email.com',
  '456 Oak Ave, Somewhere, ST 67890',
  'Mike Johnson',
  '+1 (555) 987-6544',
  'VetCare Insurance',
  'POL-789012',
  'Chicken',
  'None',
  'None'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Luna',
  'Cat',
  'Siamese',
  2,
  'Female',
  8.0,
  'Cream',
  'CHIP987654322',
  'Sarah Johnson',
  '+1 (555) 987-6543',
  'sarah@example.com',
  '456 Oak St, Anytown, ST 12345',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Max',
  'Dog',
  'German Shepherd',
  5,
  'Male',
  85.0,
  'Black and Tan',
  'CHIP456789124',
  'Michael Brown',
  '+1 (555) 456-7890',
  'michael@example.com',
  '789 Pine St, Anytown, ST 12345',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
);

-- Insert sample SOAP notes for Buddy
INSERT INTO soap_notes (
  patient_id, date, time, subjective, objective, assessment, plan, doctor_name
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  '2024-01-20',
  '10:30:00',
  'Owner reports dog has been limping on right front leg for 2 days. No known trauma.',
  'Temperature: 101.5°F, Heart rate: 90 bpm, Weight: 65.5 lbs. Mild lameness on right front leg. No swelling or heat detected.',
  'Mild strain of right front leg, possibly from overexertion during play.',
  'Prescribed rest for 5-7 days, anti-inflammatory medication (Rimadyl 75mg twice daily). Recheck in 1 week if no improvement.',
  'Dr. Sarah Wilson'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '2024-01-18',
  '14:15:00',
  'Annual wellness exam. Owner reports cat is eating and drinking normally, using litter box regularly.',
  'Temperature: 100.8°F, Heart rate: 180 bpm, Weight: 8.2 lbs. Dental tartar present, otherwise normal physical exam.',
  'Healthy adult cat with mild dental disease.',
  'Dental cleaning recommended within next 3 months. Continue current diet and routine care.',
  'Dr. Mike Davis'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  '2024-01-15',
  '10:00:00',
  'Lethargy and decreased appetite',
  '{"temperature": "102.5°F", "weight": "65 lbs", "heart_rate": "120 bpm", "respiratory_rate": "24 rpm", "blood_pressure": "Normal", "notes": "Mild dehydration noted. Gums slightly pale. Abdomen soft, no masses palpated."}',
  'Possible gastroenteritis. Rule out dietary indiscretion. Monitor for improvement.',
  'Prescribe bland diet (boiled chicken and rice) for 3 days. Probiotics BID. Recheck in 1 week if symptoms persist. Owner to monitor appetite and energy levels.',
  'Dr. Sarah Johnson'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  '2024-07-12',
  '12:00:00',
  'Fever and vomiting',
  'Sudden onset fever and vomiting since morning. Pet appears distressed.',
  '{"temperature": "104.2°F", "weight": "64 lbs", "heart_rate": "140 bpm", "respiratory_rate": "28 rpm", "notes": "Dehydrated, elevated temperature"}',
  'Acute gastroenteritis with fever',
  'IV fluids, antiemetics, antibiotics. Monitor closely.',
  'Dr. Mike Wilson'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  '2024-07-05',
  '09:00:00',
  'Annual vaccinations',
  '{"temperature": "101.8°F", "weight": "65 lbs", "heart_rate": "110 bpm", "notes": "Normal physical examination"}',
  'Healthy for vaccination',
  'DHPP and Rabies vaccines administered. Next vaccines due in 1 year.',
  'Dr. Sarah Johnson'
);
