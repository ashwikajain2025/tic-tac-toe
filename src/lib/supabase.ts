import { createClient } from '@supabase/supabase-js';
import type { Database } from '../store/communityStore.types';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.local.example to .env.local and fill in your project URL and anon key.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnon);
