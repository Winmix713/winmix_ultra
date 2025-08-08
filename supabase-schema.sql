-- WinMix Football Prediction System - Supabase PostgreSQL Schema
-- Phase I Foundation Schema

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main matches table to store football match data
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    score_home INTEGER NOT NULL CHECK (score_home >= 0),
    score_away INTEGER NOT NULL CHECK (score_away >= 0),
    score_home_ht INTEGER NOT NULL CHECK (score_home_ht >= 0),
    score_away_ht INTEGER NOT NULL CHECK (score_away_ht >= 0),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_halftime_scores CHECK (
        score_home_ht <= score_home AND 
        score_away_ht <= score_away
    )
);

-- Prediction settings table for ML model parameters
CREATE TABLE prediction_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recent_weight REAL NOT NULL DEFAULT 0.7 CHECK (recent_weight >= 0 AND recent_weight <= 1),
    home_advantage REAL NOT NULL DEFAULT 0.1 CHECK (home_advantage >= -1 AND home_advantage <= 1),
    goal_multiplier REAL NOT NULL DEFAULT 1.0 CHECK (goal_multiplier > 0),
    half_time_weight REAL NOT NULL DEFAULT 0.3 CHECK (half_time_weight >= 0 AND half_time_weight <= 1),
    min_matches INTEGER NOT NULL DEFAULT 5 CHECK (min_matches > 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- Model versions table for tracking ML model deployments
CREATE TABLE model_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_name TEXT NOT NULL,
    model_type TEXT NOT NULL DEFAULT 'xgboost',
    accuracy REAL CHECK (accuracy >= 0 AND accuracy <= 1),
    training_data_count INTEGER,
    model_file_path TEXT,
    feature_importance JSONB,
    hyperparameters JSONB,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trained_by UUID REFERENCES auth.users(id)
);

-- System logs table for audit trail
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictions log table for tracking prediction requests
CREATE TABLE predictions_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID DEFAULT uuid_generate_v4(),
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    match_date DATE,
    input_features JSONB,
    prediction_output JSONB,
    model_version_id UUID REFERENCES model_versions(id),
    confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table for admin access control
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_matches_date ON matches(date DESC);
CREATE INDEX idx_matches_teams ON matches(home_team, away_team);
CREATE INDEX idx_matches_home_team ON matches(home_team);
CREATE INDEX idx_matches_away_team ON matches(away_team);
CREATE INDEX idx_prediction_settings_active ON prediction_settings(is_active) WHERE is_active = true;
CREATE INDEX idx_model_versions_active ON model_versions(is_active) WHERE is_active = true;
CREATE INDEX idx_system_logs_event_type ON system_logs(event_type);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX idx_predictions_log_created_at ON predictions_log(created_at DESC);
CREATE INDEX idx_predictions_log_teams ON predictions_log(home_team, away_team);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_matches_updated_at 
    BEFORE UPDATE ON matches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prediction_settings_updated_at 
    BEFORE UPDATE ON prediction_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default prediction settings
INSERT INTO prediction_settings (recent_weight, home_advantage, goal_multiplier, half_time_weight, min_matches, is_active) 
VALUES (0.7, 0.1, 1.0, 0.3, 5, true);

-- Row Level Security (RLS) Policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for matches
CREATE POLICY "Admin can view all matches" ON matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can insert matches" ON matches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can update matches" ON matches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can delete matches" ON matches
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admin-only policies for prediction_settings
CREATE POLICY "Admin can manage prediction_settings" ON prediction_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admin-only policies for model_versions
CREATE POLICY "Admin can manage model_versions" ON model_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admin-only policies for system_logs
CREATE POLICY "Admin can view system_logs" ON system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "System can insert logs" ON system_logs
    FOR INSERT WITH CHECK (true);

-- Admin-only policies for predictions_log
CREATE POLICY "Admin can view predictions_log" ON predictions_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "System can insert predictions" ON predictions_log
    FOR INSERT WITH CHECK (true);

-- User roles policies
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all user roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Function to automatically create user role on signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user role on new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a view for admin users
CREATE VIEW admin_users AS
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    ur.role,
    ur.created_at as role_assigned_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
