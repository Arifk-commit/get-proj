# How to Add Multiple Images Support

## Step 1: Run the SQL Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of `ADD_IMAGE_URLS_COLUMN.sql`
6. Click "Run" or press Ctrl+Enter

## Step 2: Verify the Migration

After running the SQL, you should see a success message. The query will also show the first 5 projects with their new `image_urls` column.

## What This Does

- Adds a new `image_urls` column to store multiple images as JSON array
- Migrates existing `image_url` data to the new `image_urls` array
- Keeps the original `image_url` column for backward compatibility

## After Migration

Your app will now support:
- Uploading multiple images per project
- Setting any image as the main image
- Displaying images in a carousel on the project details page

## Troubleshooting

If you get an error that the column already exists, that's fine - it means it's already been added. You can skip Step 1 and just verify your data.
