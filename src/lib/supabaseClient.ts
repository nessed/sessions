import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

console.log('supabaseUrl =', supabaseUrl);
console.log('supabaseAnonKey prefix =', supabaseAnonKey?.slice(0, 10));

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase env vars missing. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local at project root.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
