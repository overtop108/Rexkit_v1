/*
  # Add competitive_edge column to generations table

  1. Changes
    - Add `competitive_edge` column to `generations` table to store competitive edge analysis content
    - Column is nullable (text) to allow existing records to remain valid
  
  2. Notes
    - This enables saving and retrieving competitive edge analysis for each business generation
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generations' AND column_name = 'competitive_edge'
  ) THEN
    ALTER TABLE generations ADD COLUMN competitive_edge text;
  END IF;
END $$;