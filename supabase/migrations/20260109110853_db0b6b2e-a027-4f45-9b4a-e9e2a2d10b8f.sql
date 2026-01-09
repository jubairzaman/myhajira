
-- Add admission_fee and session_charge to class_monthly_fees table
ALTER TABLE public.class_monthly_fees 
ADD COLUMN admission_fee NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN session_charge NUMERIC NOT NULL DEFAULT 0;

-- Remove from fee_settings (not needed globally)
ALTER TABLE public.fee_settings 
DROP COLUMN IF EXISTS admission_fee,
DROP COLUMN IF EXISTS session_charge;
