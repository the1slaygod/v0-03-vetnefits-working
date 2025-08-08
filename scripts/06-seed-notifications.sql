-- Insert sample notifications for the default clinic
INSERT INTO notifications (clinic_id, title, message, type, priority, read, action_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Low Stock Alert',
    'Flea shampoo is running low (5 units remaining)',
    'warning',
    'medium',
    false,
    '/inventory'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Appointment Reminder',
    'Buddy has an appointment tomorrow at 10:00 AM',
    'info',
    'medium',
    false,
    '/appointments'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Vaccine Due',
    'Max is due for rabies vaccination',
    'warning',
    'high',
    false,
    '/vaccines'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Payment Received',
    'Payment of ₹2,500 received from John Smith',
    'success',
    'low',
    true,
    '/billing'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'New Patient Registered',
    'Luna (Cat) has been registered as a new patient',
    'success',
    'low',
    true,
    '/patients'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Lab Report Ready',
    'Blood test results are ready for Charlie (Labrador).',
    'info',
    'medium',
    false,
    '/lab-reports'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'System Maintenance',
    'Scheduled maintenance will occur tonight from 2 AM to 4 AM.',
    'info',
    'low',
    true,
    null
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Invoice Overdue',
    'Invoice #INV-045 is 15 days overdue. Amount: ₹1,800',
    'warning',
    'high',
    false,
    '/billing'
);

-- Insert default clinic settings
INSERT INTO clinic_settings (
    clinic_id,
    clinic_name,
    clinic_phone,
    clinic_email,
    clinic_address,
    subscription_status,
    subscription_plan,
    subscription_valid_till,
    theme,
    default_view,
    modules
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Vetnefits Animal Hospital',
    '+91 98765 43210',
    'admin@vetnefits.com',
    '123 Pet Street, Animal City, AC 12345',
    'active',
    'yearly',
    '2025-12-31',
    'light',
    'dashboard',
    '{"vaccines": true, "compliance": true, "lab_reports": true, "otc_billing": true}'
) ON CONFLICT (clinic_id) DO UPDATE SET
    clinic_name = EXCLUDED.clinic_name,
    clinic_phone = EXCLUDED.clinic_phone,
    clinic_email = EXCLUDED.clinic_email,
    clinic_address = EXCLUDED.clinic_address,
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan,
    subscription_valid_till = EXCLUDED.subscription_valid_till,
    updated_at = NOW();

-- Insert sample staff members
INSERT INTO clinic_staff (clinic_id, name, email, role, status) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Dr. Sarah Wilson',
    'sarah@vetnefits.com',
    'doctor',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Dr. Mike Davis',
    'mike@vetnefits.com',
    'doctor',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Lisa Garcia',
    'lisa@vetnefits.com',
    'receptionist',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'John Admin',
    'john@vetnefits.com',
    'admin',
    'active'
) ON CONFLICT (clinic_id, email) DO NOTHING;

-- Insert sample activity log entries
INSERT INTO activity_log (clinic_id, activity_type, description, priority, entity_type) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'appointment',
    'New appointment scheduled for Buddy with Dr. Sarah Wilson',
    'medium',
    'appointment'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'patient',
    'New patient Luna (Cat) registered by Lisa Garcia',
    'low',
    'patient'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'inventory',
    'Low stock alert: Flea shampoo (5 units remaining)',
    'high',
    'inventory'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'billing',
    'Invoice #INV-001 paid by John Smith (₹2,500)',
    'low',
    'invoice'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'vaccine',
    'Rabies vaccine administered to Max by Dr. Mike Davis',
    'medium',
    'vaccine'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'patient',
    'New patient "Bella" registered by Dr. Sarah Wilson',
    'medium',
    'patient'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'appointment',
    'Appointment scheduled for Max (Golden Retriever) on Jan 25, 2024',
    'low',
    'appointment'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'inventory',
    'Stock updated: Rabies vaccine quantity reduced to 5 units',
    'high',
    'inventory'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'billing',
    'Invoice #INV-001 paid by John Doe - Amount: ₹2,500',
    'medium',
    'invoice'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'inventory',
    'New stock received: Dog food - 50 units added',
    'low',
    'inventory'
);

-- Insert sample OTC sales
INSERT INTO otc_sales (
    clinic_id, 
    product_name, 
    quantity, 
    unit_price, 
    total_amount, 
    buyer_name, 
    buyer_phone, 
    pet_name,
    sale_date,
    sold_by,
    receipt_number
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Flea Shampoo', 2, 1327, 2654, 'John Smith', '+91 98765 43210', 'Buddy', CURRENT_DATE, 'Lisa Garcia', 'OTC-001'),
('550e8400-e29b-41d4-a716-446655440000', 'Dog Treats', 1, 706, 706, 'Mary Johnson', '+91 98765 43211', 'Max', CURRENT_DATE, 'Lisa Garcia', 'OTC-002'),
('550e8400-e29b-41d4-a716-446655440000', 'Cat Litter', 1, 1078, 1078, 'David Brown', '+91 98765 43212', 'Luna', CURRENT_DATE - INTERVAL '1 day', 'Lisa Garcia', 'OTC-003');
