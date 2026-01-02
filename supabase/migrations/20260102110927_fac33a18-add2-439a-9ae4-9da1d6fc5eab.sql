-- Create monitor_news table for news ticker
CREATE TABLE public.monitor_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_bn TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monitor_videos table for video ads
CREATE TABLE public.monitor_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add monitor_logo_url to system_settings
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS monitor_logo_url TEXT;

-- Enable RLS on new tables
ALTER TABLE public.monitor_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitor_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for monitor_news
CREATE POLICY "Admins can manage monitor news" 
ON public.monitor_news 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active monitor news" 
ON public.monitor_news 
FOR SELECT 
USING (is_active = true);

-- RLS policies for monitor_videos
CREATE POLICY "Admins can manage monitor videos" 
ON public.monitor_videos 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active monitor videos" 
ON public.monitor_videos 
FOR SELECT 
USING (is_active = true);

-- Create triggers for updated_at
CREATE TRIGGER update_monitor_news_updated_at
BEFORE UPDATE ON public.monitor_news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monitor_videos_updated_at
BEFORE UPDATE ON public.monitor_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();