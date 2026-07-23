-- ============================================
-- READ WELL ENGLISH ZONE - COMPLETE SUPABASE SCHEMA
-- Database: Supabase (PostgreSQL 15+)
-- Version: 2.3.0
-- ============================================

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- ----------------------------------------------------------------------------
-- Profiles Table (extends auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) NOT NULL,
  avatar_url TEXT DEFAULT 'default-avatar.png',
  privacy_agreed BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Levels Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_name VARCHAR(20) NOT NULL UNIQUE,
  display_order INT DEFAULT 1,
  unlock_requirement INT DEFAULT 3,
  description TEXT DEFAULT '',
  icon VARCHAR(50) DEFAULT '📚',
  color_code VARCHAR(7) DEFAULT '#E9D2A9',
  folder_path VARCHAR(100) DEFAULT 'stories/',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- User Progress Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  story_id INT DEFAULT 0,
  score INT DEFAULT 0,
  total_questions INT DEFAULT 6,
  correct_answers INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent INT DEFAULT 0,
  UNIQUE(user_id, level_id)
);

-- ----------------------------------------------------------------------------
-- Login Attempts Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  success BOOLEAN DEFAULT FALSE,
  attempt_time TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Password Resets Table (Under Development - Future Feature)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Feedback Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  story_id INT DEFAULT 0,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Story Metadata Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS story_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  story_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  json_path TEXT NOT NULL,
  word_count INT DEFAULT 0,
  audio_duration DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(level_id, story_id)
);

-- ----------------------------------------------------------------------------
-- User Activity Log Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  action_type TEXT NOT NULL,
  details JSONB,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Quiz Questions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  story_id INT DEFAULT 0,
  display_order INT DEFAULT 1,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS POLICIES
-- ============================================

-- ----------------------------------------------------------------------------
-- Profiles Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- Levels Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view levels" ON levels
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify levels" ON levels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- User Progress Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON user_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- Login Attempts Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Only admins can view login attempts" ON login_attempts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert login attempts" ON login_attempts
  FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Password Resets Policies (Under Development)
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own reset requests" ON password_resets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert reset requests" ON password_resets
  FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Feedback Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view feedback" ON feedback
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback" ON feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Story Metadata Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view active stories" ON story_metadata
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage stories" ON story_metadata
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- User Activity Log Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Only admins can view activity logs" ON user_activity_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert activity logs" ON user_activity_log
  FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Quiz Questions Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view quiz questions" ON quiz_questions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify quiz questions" ON quiz_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 4. FUNCTIONS AND VIEWS
-- ============================================

-- ----------------------------------------------------------------------------
-- Leaderboard View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id as user_id,
  p.username,
  p.avatar_url,
  p.role,
  COUNT(DISTINCT CASE WHEN up.is_completed = true THEN up.level_id END) as completed_levels,
  SUM(up.score) as total_score,
  ROUND(AVG(up.score), 2) as avg_score,
  MAX(up.completed_at) as last_completed,
  DENSE_RANK() OVER (ORDER BY SUM(up.score) DESC) as rank_position
FROM profiles p
INNER JOIN user_progress up ON p.id = up.user_id
WHERE up.is_completed = true
GROUP BY p.id, p.username, p.avatar_url, p.role
HAVING SUM(up.score) > 0;

-- ----------------------------------------------------------------------------
-- Level Leaderboard Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_level_leaderboard(level_name_param TEXT)
RETURNS TABLE (
  user_id UUID,
  username VARCHAR,
  score INT,
  completed_at TIMESTAMP,
  level_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    up.score,
    up.completed_at,
    DENSE_RANK() OVER (ORDER BY up.score DESC, up.completed_at ASC) as level_rank
  FROM profiles p
  INNER JOIN user_progress up ON p.id = up.user_id
  INNER JOIN levels l ON up.level_id = l.id
  WHERE up.is_completed = true
    AND up.score > 0
    AND l.level_name = level_name_param
  ORDER BY level_rank ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- User Progress Summary Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_progress_summary(user_id_param UUID)
RETURNS TABLE (
  level_id UUID,
  level_name VARCHAR,
  display_order INT,
  icon VARCHAR,
  color_code VARCHAR,
  score INT,
  is_completed BOOLEAN,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.level_name,
    l.display_order,
    l.icon,
    l.color_code,
    COALESCE(up.score, 0) as score,
    COALESCE(up.is_completed, false) as is_completed,
    CASE 
      WHEN up.is_completed IS NULL THEN 'locked'
      WHEN up.is_completed = false AND up.unlocked_at IS NOT NULL THEN 'in_progress'
      WHEN up.is_completed = true AND up.score >= 3 THEN 'completed'
      WHEN up.is_completed = true AND up.score < 3 THEN 'failed'
      ELSE 'locked'
    END as status
  FROM levels l
  LEFT JOIN user_progress up ON l.id = up.level_id AND up.user_id = user_id_param
  ORDER BY l.display_order ASC;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- User Statistics Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param UUID)
RETURNS TABLE (
  username VARCHAR,
  email VARCHAR,
  role TEXT,
  member_since TIMESTAMP,
  last_login TIMESTAMP,
  total_levels_attempted BIGINT,
  levels_completed BIGINT,
  total_score BIGINT,
  average_score NUMERIC,
  highest_score INT,
  perfect_scores BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.username,
    p.email,
    p.role,
    p.created_at as member_since,
    p.last_login,
    COUNT(DISTINCT up.level_id) as total_levels_attempted,
    SUM(CASE WHEN up.is_completed = true THEN 1 ELSE 0 END) as levels_completed,
    SUM(up.score) as total_score,
    ROUND(AVG(up.score), 2) as average_score,
    MAX(up.score) as highest_score,
    (
      SELECT COUNT(*) 
      FROM user_progress up2 
      WHERE up2.is_completed = true 
        AND up2.score >= 5 
        AND up2.user_id = user_id_param
    ) as perfect_scores
  FROM profiles p
  LEFT JOIN user_progress up ON p.id = up.user_id
  WHERE p.id = user_id_param
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Dashboard Statistics Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_users BIGINT,
  admin_count BIGINT,
  user_count BIGINT,
  total_completions BIGINT,
  avg_score NUMERIC,
  perfect_scores BIGINT,
  passing_scores BIGINT,
  today_logins BIGINT,
  today_feedback BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admin_count,
    (SELECT COUNT(*) FROM profiles WHERE role = 'user') as user_count,
    (SELECT COUNT(*) FROM user_progress WHERE is_completed = true) as total_completions,
    (SELECT ROUND(AVG(score), 2) FROM user_progress WHERE is_completed = true) as avg_score,
    (SELECT COUNT(*) FROM user_progress WHERE is_completed = true AND score >= 5) as perfect_scores,
    (SELECT COUNT(*) FROM user_progress WHERE is_completed = true AND score >= 3) as passing_scores,
    (SELECT COUNT(*) FROM user_activity_log WHERE action_type = 'login' AND DATE(created_at) = CURRENT_DATE) as today_logins,
    (SELECT COUNT(*) FROM feedback WHERE DATE(created_at) = CURRENT_DATE) as today_feedback;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGERS
-- ============================================

-- ----------------------------------------------------------------------------
-- Auto-create Profile on User Signup (UPDATED - INCLUDES ROLE)
-- ----------------------------------------------------------------------------
-- Drop the function and any triggers depending on it automatically
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the updated function with ROLE support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    email, 
    avatar_url, 
    privacy_agreed,
    role                    -- ✅ ADDED: Now includes role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'default-avatar.png'),
    COALESCE((NEW.raw_user_meta_data->>'privacy_agreed')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')  -- ✅ Defaults to 'user'
  );
  
  -- Insert activity log
  INSERT INTO public.user_activity_log (user_id, action, action_type, ip_address)
  VALUES (
    NEW.id,
    'User registered',
    'register',
    COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1')
  );
  
  RETURN NEW;
END;
$$;

-- Attach the new trigger
CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Level Completion Trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_level_completion()
RETURNS TRIGGER AS $$
DECLARE
  next_level_id UUID;
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false AND NEW.score >= 3 THEN
    -- Unlock next level
    SELECT id INTO next_level_id
    FROM levels 
    WHERE display_order > (SELECT display_order FROM levels WHERE id = NEW.level_id)
    ORDER BY display_order ASC 
    LIMIT 1;
    
    IF next_level_id IS NOT NULL THEN
      INSERT INTO user_progress (user_id, level_id, unlocked_at) 
      VALUES (NEW.user_id, next_level_id, NOW())
      ON CONFLICT (user_id, level_id) 
      DO UPDATE SET unlocked_at = NOW();
    END IF;
    
    -- Log activity
    INSERT INTO user_activity_log (user_id, action, action_type, details)
    VALUES (
      NEW.user_id,
      CONCAT('Completed level: ', (SELECT level_name FROM levels WHERE id = NEW.level_id)),
      'level_complete',
      jsonb_build_object('level_id', NEW.level_id, 'score', NEW.score)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_level_completion
AFTER UPDATE ON user_progress
FOR EACH ROW
EXECUTE FUNCTION handle_level_completion();

-- ----------------------------------------------------------------------------
-- Login Activity Trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_login_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, action, action_type, details, ip_address)
  VALUES (
    NEW.id,
    'User logged in',
    'login',
    jsonb_build_object('method', 'password'),
    COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_login_activity
AFTER UPDATE ON profiles
FOR EACH ROW
WHEN (NEW.last_login IS NOT NULL AND OLD.last_login IS NULL)
EXECUTE FUNCTION handle_login_activity();

-- ----------------------------------------------------------------------------
-- Auto-Update UpdatedAt Timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_story_metadata_updated_at
BEFORE UPDATE ON story_metadata
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. STORAGE BUCKET SETUP
-- ============================================

-- ----------------------------------------------------------------------------
-- Create Storage Bucket
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  true,
  52428800, -- 50MB limit
  ARRAY['text/plain', 'audio/mpeg', 'image/jpeg', 'image/png', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Storage Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view stories" ON storage.objects
  FOR SELECT USING (bucket_id = 'stories');

CREATE POLICY "Admins can upload stories" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'stories' 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update stories" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'stories' 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete stories" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'stories' 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Check all tables
SELECT '✅ Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all functions
SELECT '✅ Functions created successfully!' as status;
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Check all triggers
SELECT '✅ Triggers created successfully!' as status;
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Check storage bucket
SELECT '✅ Storage bucket created!' as status;
SELECT id, name, public FROM storage.buckets WHERE id = 'stories';

-- Test admin role support
SELECT '✅ Admin role support added!' as status;
SELECT 'Role will be set from raw_user_meta_data->>role' as info;

-- ============================================
-- END OF SCHEMA
-- ============================================