import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://hzshmbsrrcgnubutjilt.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Eb_L9gfZA8HUjKU97pErGg_wmy4kWzA'
);
