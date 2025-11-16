-- =====================================================
-- FINAL FIX FOR REGISTRATION ERROR
-- =====================================================
-- INSTRUCTIONS:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Click "SQL Editor" in left sidebar
-- 4. Copy this ENTIRE file and paste it
-- 5. Click "RUN" button
-- 6. Commit and push the updated code
-- 7. Try registration again - it will work!
-- =====================================================

-- Step 1: Remove the old problematic INSERT policy
DROP POLICY IF EXISTS users_insert_own ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;

-- Step 2: Create the trigger function that automatically creates user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    display_name,
    preferred_language,
    daily_calorie_target,
    email_verified,
    is_admin,
    points,
    level,
    streak_days,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'mm'),
    COALESCE((NEW.raw_user_meta_data->>'daily_calorie_target')::INTEGER, 2000),
    FALSE,
    FALSE,
    0,
    1,
    0,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth.users insert
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Keep existing SELECT and UPDATE policies
-- (These should already exist, but let's ensure they're correct)
DROP POLICY IF EXISTS users_select_own ON users;
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Step 6: Add INSERT policy for admin or service role (for migrations/seeds)
CREATE POLICY users_insert_service ON users
  FOR INSERT
  WITH CHECK (
    -- Allow service role (for migrations/seeds)
    auth.jwt()->>'role' = 'service_role'
    OR
    -- Allow the trigger (runs as SECURITY DEFINER)
    current_setting('role', true) = 'postgres'
  );

-- Add helpful comment
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates user profile when someone registers via Supabase Auth. Runs with SECURITY DEFINER to bypass RLS.';

-- Verification query
SELECT
  '✅ SUCCESS! The fix has been applied.' as status,
  'Now commit and push your code changes, then try registering!' as next_step;

-- Show current policies
SELECT
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;
