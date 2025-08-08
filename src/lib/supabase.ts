import { createClient } from '@supabase/supabase-js'

// These would typically be environment variables
// For demo purposes, using placeholder values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  MATCHES: 'matches',
  PREDICTION_SETTINGS: 'prediction_settings',
} as const
