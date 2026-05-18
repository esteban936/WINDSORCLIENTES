import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const demoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !supabaseConfigured;

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://example.supabase.co', 'anon-key');
