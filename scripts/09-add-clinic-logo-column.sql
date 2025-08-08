-- Add the missing clinic_logo column to clinic_settings table
ALTER TABLE public.clinic_settings 
ADD COLUMN IF NOT EXISTS clinic_logo TEXT DEFAULT '';

-- Update existing records to have empty string for clinic_logo if NULL
UPDATE public.clinic_settings 
SET clinic_logo = '' 
WHERE clinic_logo IS NULL;
