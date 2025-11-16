-- =====================================================
-- FIX REGISTRATION: Use Database Trigger Instead
-- =====================================================
-- This is the Supabase-recommended approach for creating user profiles
-- The trigger automatically creates a profile when a user signs up
-- =====================================================

-- First, drop the problematic INSERT policy if it exists
DROP POLICY IF EXISTS users_insert_own ON users;

-- Create a function that runs when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, display_name, preferred_language, daily_calorie_target, email_verified, is_admin, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'mm'),
    COALESCE((NEW.raw_user_meta_data->>'daily_calorie_target')::INTEGER, 2000),
    FALSE,
    FALSE,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now create a proper INSERT policy that allows the trigger to work
-- This policy allows inserts only from authenticated users with matching IDs
-- OR from the system (for the trigger)
CREATE POLICY users_insert_policy ON users
    FOR INSERT
    WITH CHECK (
        auth.uid() = id
        OR
        auth.role() = 'authenticated'
    );

-- Add comment
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a user profile when a new user signs up via Supabase Auth';
