/*
  # Add twitter_posts and instagram_posts JSON columns

  1. Changes
    - Add `twitter_posts` (jsonb, nullable) - Array of parsed Twitter posts with generated images
    - Add `instagram_posts` (jsonb, nullable) - Array of parsed Instagram posts with generated images
  
  2. Purpose
    - Store generated images for Twitter and Instagram posts so they persist across sessions
    - Previously, generated images were only stored in local state and lost on page refresh
  
  3. Notes
    - These columns store the parsed post objects with image URLs
    - Separate from twitter_plan and instagram_plan which store the raw markdown
*/

-- Add twitter_posts and instagram_posts columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generations' AND column_name = 'twitter_posts'
  ) THEN
    ALTER TABLE generations ADD COLUMN twitter_posts jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generations' AND column_name = 'instagram_posts'
  ) THEN
    ALTER TABLE generations ADD COLUMN instagram_posts jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;