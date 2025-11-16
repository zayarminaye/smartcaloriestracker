-- =====================================================
-- FIX REGISTRATION ERROR - RUN THIS NOW IN SUPABASE
-- =====================================================
--
-- INSTRUCTIONS:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Click "SQL Editor" in left sidebar
-- 4. Copy this ENTIRE file and paste it
-- 5. Click "RUN" button
-- 6. Try registration again - it should work!
--
-- =====================================================

-- First, check if the policy already exists (to avoid errors)
DO $$
BEGIN
    -- Drop the policy if it exists (in case it was created incorrectly)
    DROP POLICY IF EXISTS users_insert_own ON users;

    -- Create the INSERT policy
    EXECUTE 'CREATE POLICY users_insert_own ON users
        FOR INSERT
        WITH CHECK (auth.uid() = id)';

    RAISE NOTICE '✅ SUCCESS! Registration should now work.';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;

-- Verify the fix
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'users'
            AND policyname = 'users_insert_own'
            AND cmd = 'INSERT'
        ) THEN '✅ VERIFIED: INSERT policy exists - try registration now!'
        ELSE '❌ PROBLEM: INSERT policy still missing - contact support'
    END as verification_result;

-- Show all current policies on users table
SELECT
    policyname,
    cmd as operation,
    CASE
        WHEN cmd = 'SELECT' THEN '👁️  Allows users to view their profile'
        WHEN cmd = 'UPDATE' THEN '✏️  Allows users to update their profile'
        WHEN cmd = 'INSERT' THEN '✨ Allows users to create profile (REGISTRATION)'
        WHEN cmd = 'DELETE' THEN '🗑️  Allows users to delete their profile'
        ELSE 'Other'
    END as description
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd;
