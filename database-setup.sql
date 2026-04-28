-- Neurofied.ai Database Setup Script
-- Run this in your InsForge SQL Editor to create all necessary tables

-- 1. TESTS TABLE
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  instructions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tests (name, slug, description, category, duration_seconds, instructions) VALUES
  ('Reaction Time Test', 'reaction-time', 'Test your reflexes and reaction speed', 'reaction', 60, '{"instruction": "Click as fast as possible when the color changes"}'),
  ('Memory Test', 'memory-test', 'Evaluate your short-term memory', 'memory', 120, '{"instruction": "Remember the sequence of numbers and repeat them"}'),
  ('Attention Test', 'attention-test', 'Check your concentration and focus', 'attention', 90, '{"instruction": "Find the differences between images"}');

-- 2. TEST RESULTS TABLE
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id),
  score INTEGER,
  raw_data JSONB,
  risk_level TEXT,
  risk_score FLOAT,
  ai_insights JSONB,
  duration_seconds INTEGER,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. USER PROGRESS TABLE
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_tests_completed INTEGER DEFAULT 0,
  average_score FLOAT DEFAULT 0,
  latest_risk_level TEXT DEFAULT 'low',
  improvement_trend JSONB,
  last_test_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. LEARNING RESOURCES TABLE
CREATE TABLE learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
  content_url TEXT,
  category TEXT NOT NULL,
  duration_minutes INTEGER,
  reading_time_minutes INTEGER,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO learning_resources (title, description, content_type, content_url, category, duration_minutes, tags) VALUES
  ('What is Alzheimer''s Disease?', 'Learn about Alzheimer''s and early signs', 'video', 'https://example.com/video1', 'brain_health', 5, '{"prevention", "education"}'),
  ('Brain Health Tips', 'Daily habits for cognitive wellness', 'article', 'https://example.com/article1', 'lifestyle', 0, '{"lifestyle", "tips"}'),
  ('Exercise and Memory', 'How physical activity improves memory', 'tip', 'https://example.com/tip1', 'prevention', 0, '{"exercise", "memory"}');

-- 5. USER LEARNING PROGRESS TABLE
CREATE TABLE user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES learning_resources(id),
  completed BOOLEAN DEFAULT FALSE,
  progress_percentage INTEGER DEFAULT 0,
  watched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, resource_id)
);

-- 6. CHATBOT CONVERSATIONS TABLE
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  messages JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. USER PROFILES TABLE
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  location TEXT,
  health_concerns TEXT[],
  medical_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_test_id ON test_results(test_id);
CREATE INDEX idx_test_results_completed_at ON test_results(completed_at);
CREATE INDEX idx_user_learning_progress_user_id ON user_learning_progress(user_id);
CREATE INDEX idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX idx_tests_slug ON tests(slug);

-- ENABLE ROW LEVEL SECURITY (RLS)
-- This restricts users to see only their own data

-- Test Results RLS
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own test results" ON test_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test results" ON test_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Progress RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Learning Resources - public read access
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view learning resources" ON learning_resources
  FOR SELECT
  USING (true);

-- User Learning Progress RLS
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning progress" ON user_learning_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress" ON user_learning_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" ON user_learning_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Chatbot Conversations RLS
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON chatbot_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON chatbot_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON chatbot_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON chatbot_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- User Profiles RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tests - public read access
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tests" ON tests
  FOR SELECT
  USING (true);

-- Create UPDATED_AT trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at BEFORE UPDATE ON test_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_resources_updated_at BEFORE UPDATE ON learning_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_learning_progress_updated_at BEFORE UPDATE ON user_learning_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_conversations_updated_at BEFORE UPDATE ON chatbot_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
