import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://sofascvwyltjuliovsen.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZmFzY3Z3eWx0anVsaW92c2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDY0OTAsImV4cCI6MjA5NDY4MjQ5MH0.WLv6Z7w6nZINCFwRzrzkGOo7GmqH-bxOn03nioYPtZU'
);
export const demoMode = false;
export const supabaseConfigured = true;
