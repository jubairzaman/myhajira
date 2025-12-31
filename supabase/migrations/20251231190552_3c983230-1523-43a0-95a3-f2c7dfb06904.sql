-- Create punch_logs table to store every punch event (unlimited per day per person)
CREATE TABLE public.punch_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id uuid NOT NULL,
    person_type text NOT NULL CHECK (person_type IN ('student', 'teacher')),
    punch_date date NOT NULL,
    punch_time timestamp with time zone NOT NULL DEFAULT now(),
    device_id uuid REFERENCES public.devices(id),
    card_number text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_punch_logs_person ON public.punch_logs(person_id, person_type, punch_date);
CREATE INDEX idx_punch_logs_date ON public.punch_logs(punch_date, punch_time DESC);

-- Enable RLS
ALTER TABLE public.punch_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for punch_logs
CREATE POLICY "Authenticated users can view punch logs"
ON public.punch_logs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can insert punch logs"
ON public.punch_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage punch logs"
ON public.punch_logs
FOR ALL
USING (public.is_admin(auth.uid()));

-- Enable realtime for punch_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.punch_logs;

-- Add manual_audit_logs table for tracking manual attendance changes
CREATE TABLE public.manual_attendance_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id uuid NOT NULL,
    person_type text NOT NULL CHECK (person_type IN ('student', 'teacher')),
    attendance_date date NOT NULL,
    admin_id uuid NOT NULL,
    old_status text,
    new_status text NOT NULL,
    reason text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for manual_attendance_logs
ALTER TABLE public.manual_attendance_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for manual_attendance_logs
CREATE POLICY "Admins can view manual attendance logs"
ON public.manual_attendance_logs
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert manual attendance logs"
ON public.manual_attendance_logs
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));