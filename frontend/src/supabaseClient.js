import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://tmpjmzaawmeddvnapmuu.supabase.co";
// Support both naming conventions for the key
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable__F1vAYPgO64CXpmaPer1vw_aZzvHVPg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
