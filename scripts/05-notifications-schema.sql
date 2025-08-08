-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinic_settings table
CREATE TABLE IF NOT EXISTS clinic_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL UNIQUE,
    user_id UUID,
    clinic_name VARCHAR(255),
    clinic_phone VARCHAR(50),
    clinic_email VARCHAR(255),
    clinic_address TEXT,
    clinic_logo TEXT,
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
    subscription_plan VARCHAR(20) DEFAULT 'monthly' CHECK (subscription_plan IN ('monthly', 'yearly')),
    subscription_valid_till DATE,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    default_view VARCHAR(20) DEFAULT 'dashboard' CHECK (default_view IN ('dashboard', 'appointments', 'admit')),
    modules JSONB DEFAULT '{"vaccines": true, "compliance": true, "lab_reports": true, "otc_billing": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinic_staff table
CREATE TABLE IF NOT EXISTS clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'receptionist' CHECK (role IN ('doctor', 'receptionist', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    user_id UUID,
    entity_id UUID,
    entity_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create OTC sales table
CREATE TABLE IF NOT EXISTS otc_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    buyer_name VARCHAR(255),
    buyer_phone VARCHAR(50),
    pet_name VARCHAR(255),
    pet_id UUID,
    sale_date DATE DEFAULT CURRENT_DATE,
    sold_by VARCHAR(255),
    receipt_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_clinic_id ON notifications(clinic_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clinic_settings_clinic_id ON clinic_settings(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_settings_user_id ON clinic_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_clinic_staff_clinic_id ON clinic_staff(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_staff_status ON clinic_staff(status);

CREATE INDEX IF NOT EXISTS idx_activity_log_clinic_id ON activity_log(clinic_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_otc_sales_clinic_id ON otc_sales(clinic_id);
CREATE INDEX IF NOT EXISTS idx_otc_sales_date ON otc_sales(sale_date);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE otc_sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view notifications for their clinic" ON notifications
    FOR SELECT USING (clinic_id = current_setting('app.current_clinic_id')::UUID);

CREATE POLICY "Users can insert notifications for their clinic" ON notifications
    FOR INSERT WITH CHECK (clinic_id = current_setting('app.current_clinic_id')::UUID);

CREATE POLICY "Users can update notifications for their clinic" ON notifications
    FOR UPDATE USING (clinic_id = current_setting('app.current_clinic_id')::UUID);

CREATE POLICY "Users can delete notifications for their clinic" ON notifications
    FOR DELETE USING (clinic_id = current_setting('app.current_clinic_id')::UUID);

-- Similar policies for other tables
CREATE POLICY "Users can manage clinic settings for their clinic" ON clinic_settings
    FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);

CREATE POLICY "Users can manage staff for their clinic" ON clinic_staff
    FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);

CREATE POLICY "Users can view activity log for their clinic" ON activity_log
    FOR SELECT USING (clinic_id = current_setting('app.current_clinic_id')::UUID);

CREATE POLICY "Users can insert activity log for their clinic" ON activity_log
    FOR INSERT WITH CHECK (clinic_id = current_setting('app.current_clinic_id')::UUID);

CREATE POLICY "Users can manage OTC sales for their clinic" ON otc_sales
    FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::UUID);
