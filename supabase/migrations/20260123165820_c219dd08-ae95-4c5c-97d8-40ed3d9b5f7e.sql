-- Add SMS provider support columns to sms_settings
ALTER TABLE public.sms_settings 
  ADD COLUMN IF NOT EXISTS active_sms_provider text DEFAULT 'mim_sms' CHECK (active_sms_provider IN ('mim_sms', 'bulksmsbd')),
  ADD COLUMN IF NOT EXISTS bulksmsbd_api_key text,
  ADD COLUMN IF NOT EXISTS bulksmsbd_sender_id text,
  ADD COLUMN IF NOT EXISTS bulksmsbd_balance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bulksmsbd_balance_updated_at timestamp with time zone;

-- Add provider tracking to sms_logs
ALTER TABLE public.sms_logs
  ADD COLUMN IF NOT EXISTS provider_name text DEFAULT 'mim_sms',
  ADD COLUMN IF NOT EXISTS response_code text,
  ADD COLUMN IF NOT EXISTS response_message text,
  ADD COLUMN IF NOT EXISTS sent_by text DEFAULT 'system' CHECK (sent_by IN ('admin', 'system'));

-- Create index for faster log queries
CREATE INDEX IF NOT EXISTS idx_sms_logs_provider ON public.sms_logs(provider_name);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON public.sms_logs(created_at DESC);