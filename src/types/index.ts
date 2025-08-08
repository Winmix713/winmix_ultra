export interface Match {
  id?: number;
  home_team: string;
  away_team: string;
  score_home: number;
  score_away: number;
  score_home_ht: number;
  score_away_ht: number;
  date: string;
}

export interface CSVRow {
  [key: string]: string;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

export interface UploadResult {
  success: boolean;
  message: string;
  processed: number;
  errors: ValidationError[];
}

export interface PredictionSettings {
  id?: string;
  recent_weight: number;
  home_advantage: number;
  goal_multiplier: number;
  half_time_weight: number;
  min_matches: number;
  updated_at?: string;
}

export interface DummyMatch {
  home_team: string;
  away_team: string;
  prediction_score: number;
  confidence: number;
}

export interface ChartDataPoint {
  name: string;
  prediction_score: number;
  confidence: number;
}

export interface SettingsInfluence {
  parameter: string;
  influence: 'high' | 'medium' | 'low';
  description: string;
}
