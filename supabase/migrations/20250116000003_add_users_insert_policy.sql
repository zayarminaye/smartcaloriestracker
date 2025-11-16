-- =====================================================
-- Fix RLS: Add INSERT policy for users table
-- This allows users to create their profile during registration
-- =====================================================

-- Add INSERT policy for users table
CREATE POLICY users_insert_own ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Comment for documentation
COMMENT ON POLICY users_insert_own ON users IS 'Allow users to insert their own profile during registration';
