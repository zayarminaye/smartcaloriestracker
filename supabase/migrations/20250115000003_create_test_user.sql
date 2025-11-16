-- Create test user for development
-- This user ID matches the TEST_USER_ID used in the application

INSERT INTO users (
  id,
  email,
  full_name,
  display_name,
  daily_calorie_target,
  preferred_language,
  points,
  level,
  streak_days,
  longest_streak,
  notifications_enabled
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  'Test User',
  'Test User',
  2000,
  'mm',
  0,
  1,
  0,
  0,
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  daily_calorie_target = EXCLUDED.daily_calorie_target,
  preferred_language = EXCLUDED.preferred_language;

-- Add comment
COMMENT ON TABLE users IS 'Users table includes test user with ID 00000000-0000-0000-0000-000000000000 for development';
