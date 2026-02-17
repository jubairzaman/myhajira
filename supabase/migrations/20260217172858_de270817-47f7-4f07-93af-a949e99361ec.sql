
-- Add receipt copy mode setting to fee_settings
ALTER TABLE public.fee_settings 
ADD COLUMN receipt_copy_mode text NOT NULL DEFAULT 'dual';
-- Values: 'single' (one copy) or 'dual' (institution + student copy)

COMMENT ON COLUMN public.fee_settings.receipt_copy_mode IS 'Receipt print mode: single (1 copy) or dual (institution + student copy)';
