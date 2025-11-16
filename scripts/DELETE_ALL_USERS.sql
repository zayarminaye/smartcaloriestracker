-- =====================================================
-- DELETE ALL USERS - USE WITH CAUTION!
-- =====================================================
-- This script deletes ALL users from both auth.users and public.users
-- Use this to reset and test registration from scratch
-- =====================================================

-- PART 1: Show what will be deleted
-- =====================================================
SELECT '=== USERS TO BE DELETED ===' as step;

SELECT
    COUNT(*) as total_users_to_delete,
    'All users will be permanently deleted!' as warning
FROM auth.users;

-- Show the users
SELECT
    au.id,
    au.email,
    au.created_at,
    CASE WHEN pu.id IS NOT NULL THEN 'Has profile' ELSE 'No profile' END as profile_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;

-- PART 2: Delete users from public.users first
-- =====================================================
SELECT '=== DELETING FROM public.users ===' as step;

DELETE FROM public.users;

SELECT 'Deleted all rows from public.users' as result;

-- PART 3: Delete users from auth.users
-- =====================================================
SELECT '=== DELETING FROM auth.users ===' as step;

-- This requires special handling because auth.users is in a different schema
-- We need to use a DO block to delete from auth schema
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete all users from auth.users
    DELETE FROM auth.users;

    -- Get count of remaining users
    SELECT COUNT(*) INTO deleted_count FROM auth.users;

    IF deleted_count = 0 THEN
        RAISE NOTICE '✅ Successfully deleted all users from auth.users';
    ELSE
        RAISE NOTICE '⚠️  Warning: % users still remain', deleted_count;
    END IF;
END $$;

-- PART 4: Verification
-- =====================================================
SELECT '=== VERIFICATION ===' as step;

-- Check auth.users
SELECT
    COUNT(*) as remaining_auth_users,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ All auth users deleted'
        ELSE '❌ Some auth users remain'
    END as auth_status
FROM auth.users;

-- Check public.users
SELECT
    COUNT(*) as remaining_public_users,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ All public users deleted'
        ELSE '❌ Some public users remain'
    END as public_status
FROM public.users;

-- Final message
SELECT
    '✅ CLEANUP COMPLETE!' as status,
    'You can now test registration with a fresh database' as next_step;
