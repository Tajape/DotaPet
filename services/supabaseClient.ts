import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY não configurados.');
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    persistSession: false,
  },
});
