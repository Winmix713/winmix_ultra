import { createClient } from '@supabase/supabase-js'

 phase1-modern-football-prediction-system-migration-foundation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Match {
  id: number
  home_team: string
  away_team: string
  score_home: number
  score_away: number
  score_home_ht: number
  score_away_ht: number
  date: string
  created_at?: string
  updated_at?: string
}

export interface PredictionSettings {
  id: string
  recent_weight: number
  home_advantage: number
  goal_multiplier: number
  half_time_weight: number
  min_matches: number
  updated_at: string
  created_by?: string
  is_active: boolean
}

export interface ModelVersion {
  id: string
  version_name: string
  model_type: string
  accuracy?: number
  training_data_count?: number
  model_file_path?: string
  feature_importance?: Record<string, any>
  hyperparameters?: Record<string, any>
  is_active: boolean
  created_at: string
  trained_by?: string
}

export interface SystemLog {
  id: string
  event_type: string
  event_data?: Record<string, any>
  user_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: 'admin' | 'user'
  granted_by?: string
  created_at: string
  updated_at: string
}
=======
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
 main
