import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Generation = {
  id: string;
  user_id: string | null;
  business_idea: string;
  industry: string | null;
  context: Record<string, any>;
  sections: Record<string, any>;
  landing_page_html: string | null;
  twitter_plan: string | null;
  instagram_plan: string | null;
  email_sequence: string | null;
  created_at: string;
  updated_at: string;
};
