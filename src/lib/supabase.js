import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// In production, fail hard if env vars missing
if (import.meta.env.PROD && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing required Supabase environment variables')
}

// Fallback to hardcoded values for local dev only
const url = supabaseUrl || 'https://zsnnmgdebebqkmntgcss.supabase.co'
const key = supabaseAnonKey || 'sb_publishable_dMXBoUGnQewZycASe2Yb_A_9FsK1-Vc'

export const supabase = createClient(url, key)
