-- Add parent_page_id to website_pages for sub-menu support
ALTER TABLE public.website_pages 
ADD COLUMN IF NOT EXISTS parent_page_id UUID REFERENCES public.website_pages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS custom_content TEXT,
ADD COLUMN IF NOT EXISTS custom_content_bn TEXT,
ADD COLUMN IF NOT EXISTS is_custom_page BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_website_pages_parent ON public.website_pages(parent_page_id);
CREATE INDEX IF NOT EXISTS idx_website_pages_order ON public.website_pages(display_order);

-- Update display_order for existing pages based on id order
UPDATE public.website_pages SET display_order = (
  SELECT row_number FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number 
    FROM public.website_pages
  ) sub WHERE sub.id = website_pages.id
) WHERE display_order = 0 OR display_order IS NULL;