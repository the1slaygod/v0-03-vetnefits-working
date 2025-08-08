-- Create clinic_staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.clinic_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('doctor', 'receptionist', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add clinic_address column to clinic_settings if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clinic_settings' 
                   AND column_name = 'clinic_address') THEN
        ALTER TABLE public.clinic_settings ADD COLUMN clinic_address TEXT;
    END IF;
END $$;

-- Add user_id column to clinic_settings if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clinic_settings' 
                   AND column_name = 'user_id') THEN
        ALTER TABLE public.clinic_settings ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Create clinic_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL,
    user_id UUID,
    clinic_name VARCHAR(255),
    clinic_phone VARCHAR(50),
    clinic_email VARCHAR(255),
    clinic_address TEXT,
    clinic_logo TEXT,
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
    subscription_plan VARCHAR(20) DEFAULT 'monthly' CHECK (subscription_plan IN ('monthly', 'yearly')),
    subscription_valid_till TIMESTAMP WITH TIME ZONE,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    default_view VARCHAR(20) DEFAULT 'dashboard' CHECK (default_view IN ('dashboard', 'appointments', 'admit')),
    modules JSONB DEFAULT '{"vaccines": true, "compliance": true, "lab_reports": true, "otc_billing": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinic_staff_clinic_id ON public.clinic_staff(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_staff_email ON public.clinic_staff(email);
CREATE INDEX IF NOT EXISTS idx_clinic_settings_clinic_id ON public.clinic_settings(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_settings_user_id ON public.clinic_settings(user_id);

-- Insert default clinic settings if none exist
INSERT INTO public.clinic_settings (
    clinic_id, 
    clinic_name, 
    clinic_email, 
    clinic_phone, 
    clinic_address,
    subscription_status,
    subscription_plan,
    subscription_valid_till
) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    'Vetnefits Animal Hospital',
    'admin@vetnefits.com',
    '+91 98765 43210',
    '123 Pet Street, Animal City, AC 12345',
    'trial',
    'monthly',
    NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (
    SELECT 1 FROM public.clinic_settings 
    WHERE clinic_id = '550e8400-e29b-41d4-a716-446655440000'
);

-- Insert default staff members
INSERT INTO public.clinic_staff (clinic_id, name, email, role, status)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    'Dr. Sarah Wilson',
    'sarah@vetnefits.com',
    'doctor',
    'active'
WHERE NOT EXISTS (
    SELECT 1 FROM public.clinic_staff 
    WHERE clinic_id = '550e8400-e29b-41d4-a716-446655440000' 
    AND email = 'sarah@vetnefits.com'
);

INSERT INTO public.clinic_staff (clinic_id, name, email, role, status)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    'John Receptionist',
    'john@vetnefits.com',
    'receptionist',
    'active'
WHERE NOT EXISTS (
    SELECT 1 FROM public.clinic_staff 
    WHERE clinic_id = '550e8400-e29b-41d4-a716-446655440000' 
    AND email = 'john@vetnefits.com'
);
