/*
  # Create generations table for saved business plans

  1. New Tables
    - `generations`
      - `id` (uuid, primary key) - Unique identifier for each generation
      - `user_id` (uuid, foreign key) - References auth.users, nullable for anonymous users
      - `business_idea` (text) - The core business idea
      - `industry` (text, nullable) - Selected industry category
      - `context` (jsonb, nullable) - Additional context (market, location, budget, etc.)
      - `sections` (jsonb, nullable) - All 8 sections of generated content
      - `landing_page_html` (text, nullable) - Generated landing page HTML
      - `twitter_plan` (text, nullable) - Generated Twitter launch plan
      - `instagram_plan` (text, nullable) - Generated Instagram campaign
      - `email_sequence` (text, nullable) - Generated email sequence
      - `created_at` (timestamptz) - When the generation was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `generations` table
    - Add policy for authenticated users to read their own generations
    - Add policy for authenticated users to insert their own generations
    - Add policy for authenticated users to update their own generations
    - Add policy for authenticated users to delete their own generations
    - Anonymous users can create generations without user_id (not saved long-term)

  3. Indexes
    - Index on user_id for fast lookups
    - Index on created_at for sorting
*/

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_idea text NOT NULL,
  industry text,
  context jsonb DEFAULT '{}'::jsonb,
  sections jsonb DEFAULT '{}'::jsonb,
  landing_page_html text,
  twitter_plan text,
  instagram_plan text,
  email_sequence text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- RLS Policies

-- Authenticated users can view their own generations
CREATE POLICY "Users can view own generations"
  ON generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own generations
CREATE POLICY "Users can create own generations"
  ON generations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own generations
CREATE POLICY "Users can update own generations"
  ON generations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own generations
CREATE POLICY "Users can delete own generations"
  ON generations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_generations_updated_at
  BEFORE UPDATE ON generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();