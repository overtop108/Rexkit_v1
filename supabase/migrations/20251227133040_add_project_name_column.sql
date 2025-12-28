/*
  # Add project_name column to generations table

  1. Changes
    - Add `project_name` column (text, nullable) - Custom name for the project
    - Defaults to null, will fall back to business_idea if not set
  
  2. Notes
    - This allows users to give their projects memorable names
    - The business_idea field remains as the core description
    - project_name will be used in generated content (Twitter, Instagram, etc.)
*/

-- Add project_name column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generations' AND column_name = 'project_name'
  ) THEN
    ALTER TABLE generations ADD COLUMN project_name text;
  END IF;
END $$;