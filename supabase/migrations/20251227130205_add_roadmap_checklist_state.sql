/*
  # Add Roadmap Checklist State Column

  1. Changes
    - Add `roadmap_checklist_state` column to `generations` table
      - Stores JSON object with checklist state for each task
      - Format: { "week-1-task-1": true, "week-2-task-3": false, ... }
      - Allows tracking completion status of roadmap tasks
  
  2. Notes
    - JSONB type for efficient querying and updating
    - Nullable to support existing records
    - Default is NULL for backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generations' AND column_name = 'roadmap_checklist_state'
  ) THEN
    ALTER TABLE generations ADD COLUMN roadmap_checklist_state JSONB DEFAULT NULL;
  END IF;
END $$;
