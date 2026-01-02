-- Weekly holidays table (সাপ্তাহিক ছুটি)
CREATE TABLE public.weekly_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_holiday BOOLEAN NOT NULL DEFAULT true,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_of_week, academic_year_id)
);

-- School calendar table (ক্যালেন্ডার এন্ট্রি)
CREATE TABLE public.school_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_date DATE NOT NULL,
  day_type TEXT NOT NULL CHECK (day_type IN ('working', 'holiday', 'exam_day', 'half_day')),
  title TEXT,
  title_bn TEXT,
  description TEXT,
  applies_to_all_classes BOOLEAN NOT NULL DEFAULT true,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(calendar_date, academic_year_id)
);

-- Calendar class entries table (ক্লাসভিত্তিক এন্ট্রি)
CREATE TABLE public.calendar_class_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id UUID NOT NULL REFERENCES public.school_calendar(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('holiday', 'exam', 'working')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(calendar_id, class_id)
);

-- Enable RLS
ALTER TABLE public.weekly_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_class_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weekly_holidays
CREATE POLICY "Admins can manage weekly holidays"
  ON public.weekly_holidays FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view weekly holidays"
  ON public.weekly_holidays FOR SELECT
  USING (true);

-- RLS Policies for school_calendar
CREATE POLICY "Admins can manage school calendar"
  ON public.school_calendar FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view school calendar"
  ON public.school_calendar FOR SELECT
  USING (true);

-- RLS Policies for calendar_class_entries
CREATE POLICY "Admins can manage calendar class entries"
  ON public.calendar_class_entries FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view calendar class entries"
  ON public.calendar_class_entries FOR SELECT
  USING (true);

-- Database function to check if a date is a working day for a specific class
CREATE OR REPLACE FUNCTION public.is_working_day(
  p_date DATE,
  p_class_id UUID,
  p_academic_year_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_day_of_week INTEGER;
  v_is_weekly_holiday BOOLEAN;
  v_calendar_entry RECORD;
  v_class_entry RECORD;
BEGIN
  -- Get day of week (0=Sunday, 6=Saturday)
  v_day_of_week := EXTRACT(DOW FROM p_date)::INTEGER;
  
  -- Check weekly holiday
  SELECT is_holiday INTO v_is_weekly_holiday
  FROM weekly_holidays
  WHERE day_of_week = v_day_of_week
    AND academic_year_id = p_academic_year_id;
  
  IF v_is_weekly_holiday IS TRUE THEN
    RETURN FALSE;
  END IF;
  
  -- Check school calendar entry for this date
  SELECT * INTO v_calendar_entry
  FROM school_calendar
  WHERE calendar_date = p_date
    AND academic_year_id = p_academic_year_id;
  
  -- If no calendar entry, it's a working day
  IF v_calendar_entry IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- If applies to all classes
  IF v_calendar_entry.applies_to_all_classes THEN
    RETURN v_calendar_entry.day_type = 'working';
  END IF;
  
  -- Check class-specific entry
  SELECT * INTO v_class_entry
  FROM calendar_class_entries
  WHERE calendar_id = v_calendar_entry.id
    AND class_id = p_class_id;
  
  -- If no class entry, use calendar day_type
  IF v_class_entry IS NULL THEN
    RETURN v_calendar_entry.day_type = 'working';
  END IF;
  
  -- Return based on class entry type
  RETURN v_class_entry.entry_type = 'working';
END;
$$;

-- Function to get working days count in a date range
CREATE OR REPLACE FUNCTION public.get_working_days_count(
  p_start_date DATE,
  p_end_date DATE,
  p_class_id UUID,
  p_academic_year_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER := 0;
  v_current_date DATE;
BEGIN
  v_current_date := p_start_date;
  
  WHILE v_current_date <= p_end_date LOOP
    IF is_working_day(v_current_date, p_class_id, p_academic_year_id) THEN
      v_count := v_count + 1;
    END IF;
    v_current_date := v_current_date + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_weekly_holidays_updated_at
  BEFORE UPDATE ON public.weekly_holidays
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_calendar_updated_at
  BEFORE UPDATE ON public.school_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();