-- =====================================================
-- COMPLETE FIX: Registration + Existing Users
-- =====================================================
-- This script does 3 things:
-- 1. Checks current state
-- 2. Creates missing profiles for existing users
-- 3. Sets up the trigger for future registrations
-- =====================================================

-- PART 1: DIAGNOSTICS
-- =====================================================
SELECT '=== DIAGNOSTICS ===' as step;

-- Check if trigger exists
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers
            WHERE trigger_name = 'on_auth_user_created'
        )
        THEN '✅ Trigger EXISTS'
        ELSE '❌ Trigger MISSING - will create it'
    END as trigger_status;

-- Check if function exists
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_name = 'handle_new_user'
        )
        THEN '✅ Function EXISTS'
        ELSE '❌ Function MISSING - will create it'
    END as function_status;

-- Find users in auth.users but NOT in public.users
SELECT
    COUNT(*) as missing_profiles,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ All users have profiles'
        ELSE '⚠️  Some users missing profiles - will create them'
    END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- PART 2: FIX EXISTING USERS
-- =====================================================
SELECT '=== FIXING EXISTING USERS ===' as step;

-- Create profiles for any users that don't have them
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
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(au.raw_user_meta_data->>'display_name', 'User'),
    COALESCE(au.raw_user_meta_data->>'preferred_language', 'mm'),
    COALESCE((au.raw_user_meta_data->>'daily_calorie_target')::INTEGER, 2000),
    au.email_confirmed_at IS NOT NULL,
    FALSE,
    0,
    1,
    0,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Show how many were created
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ No missing profiles found'
        ELSE '✅ Created ' || COUNT(*) || ' missing profile(s)'
    END as result
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- PART 3: SET UP TRIGGER FOR FUTURE
-- =====================================================
SELECT '=== SETTING UP TRIGGER ===' as step;

-- Drop old policies
DROP POLICY IF EXISTS users_insert_own ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_insert_service ON users;

-- Create the trigger function
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

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Keep existing SELECT and UPDATE policies
DROP POLICY IF EXISTS users_select_own ON users;
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Add INSERT policy for service role (migrations/seeds)
CREATE POLICY users_insert_service ON users
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

-- Add helpful comments
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates user profile when someone registers. Runs with SECURITY DEFINER to bypass RLS.';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Creates user profile in public.users when new user signs up';

-- PART 4: FINAL VERIFICATION
-- =====================================================
SELECT '=== VERIFICATION ===' as step;

-- Verify all users now have profiles
SELECT
    COUNT(au.id) as total_auth_users,
    COUNT(pu.id) as total_profiles,
    CASE
        WHEN COUNT(au.id) = COUNT(pu.id) THEN '✅ ALL USERS HAVE PROFILES'
        ELSE '❌ MISMATCH: Some users still missing profiles'
    END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;

-- Show trigger status
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    '✅ Trigger is active' as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Show policies
SELECT
    tablename,
    policyname,
    cmd as operation,
    '✅ Policy active' as status
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- Final message
SELECT
    '✅✅✅ SETUP COMPLETE! ✅✅✅' as status,
    'Try logging in now - it should work!' as next_step;
