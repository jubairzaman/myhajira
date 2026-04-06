
ALTER TABLE public.system_settings
ADD COLUMN auto_logout_time time without time zone NOT NULL DEFAULT '21:00:00';
