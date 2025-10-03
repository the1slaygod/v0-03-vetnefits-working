-- Create clinic_settings table
CREATE TABLE IF NOT EXISTS clinic_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL UNIQUE,
    clinic_name VARCHAR(255) NOT NULL,
    clinic_email VARCHAR(255) NOT NULL,
    clinic_phone VARCHAR(50) NOT NULL,
    clinic_address TEXT NOT NULL,
    clinic_logo TEXT DEFAULT '/placeholder-logo.png',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinic_settings_updated_at 
    BEFORE UPDATE ON clinic_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default clinic settings
INSERT INTO clinic_settings (
    clinic_id,
    clinic_name,
    clinic_email,
    clinic_phone,
    clinic_address,
    clinic_logo
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Vetnefits Animal Hospital',
    'admin@vetnefits.com',
    '+91 98765 43210',
    '123 Pet Street, Animal City, AC 12345',
    '/placeholder-logo.png'
) ON CONFLICT (clinic_id) DO NOTHING;
