import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zsnnmgdebebqkmntgcss.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dMXBoUGnQewZycASe2Yb_A_9FsK1-Vc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
