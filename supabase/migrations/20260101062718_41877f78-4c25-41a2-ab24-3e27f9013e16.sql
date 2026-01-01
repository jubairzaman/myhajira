-- Add new columns to sms_settings for Punch SMS, Late SMS, and WhatsApp integration
ALTER TABLE public.sms_settings 
ADD COLUMN IF NOT EXISTS punch_sms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS punch_sms_template TEXT DEFAULT 'প্রিয় অভিভাবক, আপনার সন্তান {{StudentName}} ({{Class}}) আজ {{Date}} সকাল {{Time}} এ স্কুলে এসেছে। - {{SchoolName}}',
ADD COLUMN IF NOT EXISTS late_sms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS late_sms_template TEXT DEFAULT 'প্রিয় অভিভাবক, আপনার সন্তান {{StudentName}} ({{Class}}) আজ {{Date}} স্কুলে {{LateMinutes}} মিনিট দেরিতে এসেছে। - {{SchoolName}}',
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_fallback_to_sms BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_channel TEXT DEFAULT 'sms_only';

-- Add new columns to sms_logs for channel tracking
ALTER TABLE public.sms_logs
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'sms',
ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
ADD COLUMN IF NOT EXISTS fallback_used BOOLEAN DEFAULT false;