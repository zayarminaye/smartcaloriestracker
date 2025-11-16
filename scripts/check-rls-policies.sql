-- =====================================================
-- Diagnostic: Check RLS Policies on Users Table
-- =====================================================

-- Check if RLS is enabled on users table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- List all policies on users table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Check what policies we should have
SELECT
    'Expected policies:' as note,
    ARRAY['users_select_own', 'users_update_own', 'users_insert_own'] as should_exist;

-- Test if INSERT policy exists
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'users'
            AND policyname = 'users_insert_own'
            AND cmd = 'INSERT'
        ) THEN '✅ INSERT policy exists - registration should work'
        ELSE '❌ INSERT policy MISSING - this is why registration fails!'
    END as status;
