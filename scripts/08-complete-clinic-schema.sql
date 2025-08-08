-- Drop existing tables to recreate with proper schema
DROP TABLE IF EXISTS public.clinic_staff CASCADE;
DROP TABLE IF EXISTS public.clinic_settings CASCADE;

-- Create clinic_settings table with ALL required columns
CREATE TABLE public.clinic_settings (
    clinic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_name TEXT NOT NULL DEFAULT 'Vetnefits Animal Hospital',
    clinic_phone TEXT DEFAULT '+91 98765 43210',
    clinic_email TEXT DEFAULT 'admin@vetnefits.com',
    clinic_address TEXT DEFAULT '123 Pet Street, Animal City, AC 12345',
    clinic_logo TEXT DEFAULT '',
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
    subscription_plan TEXT DEFAULT 'monthly' CHECK (subscription_plan IN ('monthly', 'yearly')),
    subscription_valid_till DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    default_view TEXT DEFAULT 'dashboard' CHECK (default_view IN ('dashboard', 'appointments', 'admit')),
    modules JSONB DEFAULT '{"vaccines": true, "compliance": true, "lab_reports": true, "otc_billing": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinic_staff table
CREATE TABLE public.clinic_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES public.clinic_settings(clinic_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('doctor', 'receptionist', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_clinic_staff_clinic_id ON public.clinic_staff(clinic_id);
CREATE INDEX idx_clinic_staff_email ON public.clinic_staff(email);

-- Insert default clinic settings
INSERT INTO public.clinic_settings (
    clinic_id,
    clinic_name,
    clinic_phone,
    clinic_email,
    clinic_address,
    clinic_logo,
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
    'https://example.com/logo.png',
    'trial',
    'monthly',
    CURRENT_DATE + INTERVAL '30 days',
    'light',
    'dashboard',
    '{"vaccines": true, "compliance": true, "lab_reports": true, "otc_billing": true}'
);

-- Insert default staff members
INSERT INTO public.clinic_staff (clinic_id, name, email, role, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Dr. Sarah Wilson', 'sarah@vetnefits.com', 'doctor', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'Dr. Mike Davis', 'mike@vetnefits.com', 'doctor', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'Dr. Lisa Garcia', 'lisa@vetnefits.com', 'doctor', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'John Receptionist', 'john@vetnefits.com', 'receptionist', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'Mary Admin', 'mary@vetnefits.com', 'admin', 'active');

-- Grant necessary permissions
GRANT ALL ON public.clinic_settings TO authenticated;
GRANT ALL ON public.clinic_staff TO authenticated;
GRANT ALL ON public.clinic_settings TO anon;
GRANT ALL ON public.clinic_staff TO anon;
