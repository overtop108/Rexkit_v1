/*
  # Fix RLS Performance and Security Issues

  1. RLS Policy Performance
    - Drop and recreate all RLS policies on `generations` table
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row
    - This significantly improves query performance at scale

  2. Remove Unused Index
    - Drop `idx_generations_created_at` as it is not being used
    - Keep `idx_generations_user_id` as it's actively used for user-specific queries

  3. Fix Function Security
    - Alter `update_updated_at_column` function to set explicit search_path
    - This prevents potential security issues from role mutable search_path
*/

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own generations" ON generations;
DROP POLICY IF EXISTS "Users can create own generations" ON generations;
DROP POLICY IF EXISTS "Users can update own generations" ON generations;
DROP POLICY IF EXISTS "Users can delete own generations" ON generations;

-- Recreate RLS policies with optimized auth.uid() calls
CREATE POLICY "Users can view own generations"
  ON generations
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own generations"
  ON generations
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own generations"
  ON generations
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own generations"
  ON generations
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop unused index
DROP INDEX IF EXISTS idx_generations_created_at;

-- Fix function search_path security issue
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;