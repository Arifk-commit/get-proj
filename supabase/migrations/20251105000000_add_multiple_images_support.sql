-- Add image_urls column to support multiple images
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url data to image_urls array
UPDATE public.projects 
SET image_urls = 
  CASE 
    WHEN image_url IS NOT NULL AND image_url != '' 
    THEN jsonb_build_array(image_url)
    ELSE '[]'::jsonb
  END
WHERE image_urls = '[]'::jsonb OR image_urls IS NULL;

-- Keep image_url for backward compatibility (will store the first image)
-- No need to drop it yet to avoid breaking existing code
