import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL: Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing.\n' +
    'Please set these in your Project Settings (Environment Variables).'
  );
}

// We use a fallback URL to prevent the 'supabaseUrl is required' exception from crashing the app bundle.
// This allows the UI to render so the user can see what's wrong.
export const supabase = createClient(
  supabaseUrl || 'https://MISSING_SUPABASE_URL.supabase.co',
  supabaseAnonKey || 'MISSING_ANON_KEY'
);
