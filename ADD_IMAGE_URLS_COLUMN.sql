-- Run this SQL in your Supabase SQL Editor
-- This will add support for multiple images

-- Step 1: Add image_urls column
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing image_url data to image_urls array
UPDATE public.projects 
SET image_urls = 
  CASE 
    WHEN image_url IS NOT NULL AND image_url != '' 
    THEN jsonb_build_array(image_url)
    ELSE '[]'::jsonb
  END
WHERE image_urls = '[]'::jsonb OR image_urls IS NULL;

-- Step 3: Verify the migration
SELECT id, title, image_url, image_urls FROM public.projects LIMIT 5;
