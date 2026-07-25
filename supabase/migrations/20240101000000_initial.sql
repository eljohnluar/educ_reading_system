-- ============================================
-- READ WELL ENGLISH ZONE - SIMPLIFIED SUPABASE SCHEMA
-- Database: Supabase (PostgreSQL 15+)
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
-- User Progress Table (Simplified - uses level_name instead of level_id)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level_name VARCHAR(20) NOT NULL CHECK (level_name IN ('easy', 'average', 'difficult')),
  story_id INT DEFAULT 1,
  score INT DEFAULT 0,
  total_questions INT DEFAULT 6,
  correct_answers INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, level_name)
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
-- Feedback Table (Simplified - uses level_name instead of level_id)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level_name VARCHAR(20) NOT NULL CHECK (level_name IN ('easy', 'average', 'difficult')),
  story_id INT DEFAULT 1,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Story Metadata Table (Simplified - uses level_name instead of level_id)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS story_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_name VARCHAR(20) NOT NULL CHECK (level_name IN ('easy', 'average', 'difficult')),
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
  UNIQUE(level_name, story_id)
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
-- Quiz Questions Table (Simplified - uses level_name instead of level_id)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_name VARCHAR(20) NOT NULL CHECK (level_name IN ('easy', 'average', 'difficult')),
  story_id INT DEFAULT 1,
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
-- Leaderboard View (Simplified)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id as user_id,
  p.username,
  p.avatar_url,
  p.role,
  COUNT(DISTINCT CASE WHEN up.is_completed = true THEN up.level_name END) as completed_levels,
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
-- Level Leaderboard Function (Simplified)
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
  WHERE up.is_completed = true
    AND up.score > 0
    AND up.level_name = level_name_param
  ORDER BY level_rank ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- User Progress Summary Function (Simplified - no levels table)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_progress_summary(p_user_id UUID)
RETURNS TABLE (
  level_name VARCHAR,
  score INT,
  is_completed BOOLEAN,
  status TEXT,
  unlocked_at TIMESTAMP
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(up.level_name, l.level_name) as level_name,
    COALESCE(up.score, 0) as score,
    COALESCE(up.is_completed, false) as is_completed,
    CASE 
      WHEN up.is_completed IS NULL AND up.unlocked_at IS NULL AND l.level_name != 'easy' THEN 'locked'
      WHEN up.is_completed IS NULL AND l.level_name = 'easy' THEN 'in_progress'
      WHEN up.is_completed = false AND up.unlocked_at IS NOT NULL THEN 'in_progress'
      WHEN up.is_completed = true AND up.score >= 3 THEN 'completed'
      WHEN up.is_completed = true AND up.score < 3 THEN 'failed'
      ELSE 'locked'
    END as status,
    up.unlocked_at
  FROM (VALUES 
    ('easy'), ('average'), ('difficult')
  ) AS l(level_name)
  LEFT JOIN user_progress up ON l.level_name = up.level_name AND up.user_id = p_user_id
  ORDER BY 
    CASE l.level_name
      WHEN 'easy' THEN 1
      WHEN 'average' THEN 2
      WHEN 'difficult' THEN 3
    END;
END;
$$;

-- ----------------------------------------------------------------------------
-- User Statistics Function (Simplified)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_score BIGINT,
  levels_completed BIGINT,
  average_score NUMERIC,
  perfect_scores BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(up.score), 0)::BIGINT as total_score,
    COUNT(CASE WHEN up.is_completed = true THEN 1 END)::BIGINT as levels_completed,
    ROUND(AVG(CASE WHEN up.is_completed = true THEN up.score END), 2) as average_score,
    COUNT(CASE WHEN up.is_completed = true AND up.score >= 5 THEN 1 END)::BIGINT as perfect_scores
  FROM user_progress up
  WHERE up.user_id = p_user_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- Dashboard Statistics Function (Simplified)
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
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

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
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'default-avatar.png'),
    COALESCE((NEW.raw_user_meta_data->>'privacy_agreed')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
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

CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

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
-- Stories Bucket (for story files)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  true,
  52428800, -- 50MB
  ARRAY['text/plain', 'audio/mpeg', 'image/jpeg', 'image/png', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Avatars Bucket (for user profile images) - ✅ ADDED
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket so images can be viewed without auth
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. STORAGE POLICIES
-- ============================================

-- ----------------------------------------------------------------------------
-- Stories Policies
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

-- ----------------------------------------------------------------------------
-- Avatars Policies - ✅ ADDED
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can manage all avatars" ON storage.objects
  FOR ALL USING (
    bucket_id = 'avatars' 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 8. INSERT DATA (Fixed 3 Levels)
-- ============================================

-- ----------------------------------------------------------------------------
-- Story Metadata
-- ----------------------------------------------------------------------------
INSERT INTO story_metadata (level_name, story_id, title, file_path, audio_url, image_url, json_path, word_count, audio_duration) VALUES
('easy', 1, 'The Lost Wallet', 'stories/easy/story_1.txt', 'stories/easy/story_1.mp3', 'stories/easy/story_1.jpg', 'stories/easy/story_1.json', 150, 45.0),
('average', 1, 'The School Podcast', 'stories/average/story_1.txt', 'stories/average/story_1.mp3', 'stories/average/story_1.jpg', 'stories/average/story_1.json', 180, 55.0),
('difficult', 1, 'Beyond the Certificate', 'stories/difficult/story_1.txt', 'stories/difficult/story_1.mp3', 'stories/difficult/story_1.jpg', 'stories/difficult/story_1.json', 220, 65.0);

-- ----------------------------------------------------------------------------
-- Quiz Questions - Easy Level
-- ----------------------------------------------------------------------------
INSERT INTO quiz_questions (level_name, story_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
('easy', 1, 1, 'Where did Joshua find the wallet?', 'Inside the school library', 'On a park bench', 'At a bus stop', 'In a classroom', 'b', 'The story says Joshua found the wallet lying on a park bench.'),
('easy', 1, 2, 'What did Joshua find inside the wallet?', 'Money only', 'An identification card and money only', 'An identification card, cash, and important cards', 'A cellphone and cash', 'c', 'The story mentions an identification card, some cash, and several important cards.'),
('easy', 1, 3, 'Why did Joshua go to the address on the ID?', 'To ask for directions', 'To return the wallet to its owner', 'To claim a reward', 'To visit a relative', 'b', 'Joshua looked at the address and decided to return the wallet to its owner.'),
('easy', 1, 4, 'How did the elderly woman react when she saw Joshua?', 'She became angry.', 'She ignored him.', 'She was relieved and thankful.', 'She called the police.', 'c', 'The woman smiled with relief and thanked Joshua for his honesty.'),
('easy', 1, 5, 'Why did Joshua refuse the reward?', 'He was in a hurry.', 'He believed returning the wallet was the right thing to do.', 'He did not like the owner.', 'He wanted a bigger reward.', 'b', 'Joshua said that returning the wallet was simply the right thing to do.'),
('easy', 1, 6, 'What is the main lesson of the story?', 'Money is the key to happiness.', 'Honesty and kindness are valuable qualities.', 'It is important to avoid helping strangers.', 'Rewards are more important than good deeds.', 'b', 'The story teaches that honesty and kindness are valuable qualities that inspire others.');

-- ----------------------------------------------------------------------------
-- Quiz Questions - Average Level
-- ----------------------------------------------------------------------------
INSERT INTO quiz_questions (level_name, story_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
('average', 1, 1, 'What project did the journalism club create?', 'A school newspaper', 'A television program', 'A weekly podcast', 'A social media page', 'c', 'The club decided to create a weekly podcast to discuss school events.'),
('average', 1, 2, 'Why did only a few students listen to the podcast at first?', 'The episodes were too long.', 'Students preferred watching short videos.', 'The teachers did not support the project.', 'The podcast was available only once a month.', 'b', 'The story says many students preferred watching short videos online.'),
('average', 1, 3, 'How did the club improve the podcast?', 'They shortened every episode.', 'They added music only.', 'They invited teachers, alumni, and student leaders as guests.', 'They charged students to listen.', 'c', 'The club improved by inviting teachers, alumni, and student leaders to share their experiences.'),
('average', 1, 4, 'What happened by the end of the semester?', 'The project ended because of low interest.', 'The podcast became popular in the school.', 'Students stopped listening to the episodes.', 'The school canceled the program.', 'b', 'The podcast became one of the school''s most popular student projects.'),
('average', 1, 5, 'Which quality contributed most to the club''s success?', 'Luck', 'Persistence and willingness to improve', 'Wealth', 'Competition', 'b', 'The adviser praised the club for their persistence and willingness to improve.'),
('average', 1, 6, 'What is the central idea of the passage?', 'Podcasts are better than videos.', 'Success often comes through persistence and continuous improvement.', 'Journalism is the easiest school club.', 'Student projects should always be entertaining.', 'b', 'The passage shows that success comes through persistence and continuous improvement.');

-- ----------------------------------------------------------------------------
-- Quiz Questions - Difficult Level
-- ----------------------------------------------------------------------------
INSERT INTO quiz_questions (level_name, story_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
('difficult', 1, 1, 'Why were many students eager to earn awards?', 'To receive cash prizes', 'To strengthen their college applications', 'To become teachers', 'To avoid graduation', 'b', 'The story says students focused on earning awards to strengthen their college applications.'),
('difficult', 1, 2, 'What volunteer work did Nathan do?', 'He coached a basketball team.', 'He organized school events.', 'He taught computer skills to senior citizens.', 'He tutored elementary students in mathematics.', 'c', 'Nathan spent his weekends teaching basic computer skills to senior citizens.'),
('difficult', 1, 3, 'Why did Nathan enjoy his volunteer work despite receiving little recognition?', 'It paid him well.', 'It helped people become more confident and independent.', 'It gave him more academic awards.', 'It allowed him to travel.', 'b', 'Nathan found satisfaction in seeing his learners become more confident in using technology.'),
('difficult', 1, 4, 'Why did Nathan question his accomplishments after graduation?', 'He failed his classes.', 'He received only one academic award while others received several.', 'He decided not to attend college.', 'He forgot to attend the ceremony.', 'b', 'Nathan received only one academic award while several classmates earned multiple distinctions.'),
('difficult', 1, 5, 'What changed Nathan''s perspective about success?', 'Winning another competition', 'Receiving a scholarship', 'Reading thankful messages from the senior citizens he had taught', 'Talking to his classmates', 'c', 'Nathan received heartfelt messages from the people he taught, thanking him for their independence.'),
('difficult', 1, 6, 'Which statement best expresses the theme of the story?', 'Awards are the only measure of success.', 'Volunteer work is more important than education.', 'True success is measured by the positive impact a person has on others.', 'Academic achievements should always come before helping people.', 'c', 'The story teaches that meaningful success is reflected in the lasting impact on others'' lives.');

-- ============================================
-- 9. VERIFICATION QUERIES
-- ============================================

SELECT '✅ Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT '✅ Functions created successfully!' as status;
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

SELECT '✅ Triggers created successfully!' as status;
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

SELECT '✅ Storage buckets created!' as status;
SELECT id, name, public, file_size_limit FROM storage.buckets 
WHERE id IN ('stories', 'avatars');

SELECT '✅ Data inserted!' as status;
SELECT level_name, COUNT(*) as stories FROM story_metadata GROUP BY level_name;
SELECT level_name, COUNT(*) as questions FROM quiz_questions GROUP BY level_name;

-- ============================================
-- END OF SCHEMA
-- ============================================