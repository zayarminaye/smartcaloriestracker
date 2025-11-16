-- =====================================================
-- DELETE SPECIFIC USER (Alternative to deleting all)
-- =====================================================
-- Use this if you only want to delete one user
-- Replace 'user@example.com' with the actual email
-- =====================================================

-- OPTION 1: Delete by email
-- =====================================================
-- Replace 'user@example.com' with the email you want to delete

DO $$
DECLARE
    user_to_delete UUID;
    user_email TEXT := 'user@example.com'; -- ← CHANGE THIS
BEGIN
    -- Find the user ID
    SELECT id INTO user_to_delete
    FROM auth.users
    WHERE email = user_email;

    IF user_to_delete IS NULL THEN
        RAISE NOTICE '❌ User with email % not found', user_email;
    ELSE
        -- Delete from public.users first
        DELETE FROM public.users WHERE id = user_to_delete;

        -- Delete from auth.users
        DELETE FROM auth.users WHERE id = user_to_delete;

        RAISE NOTICE '✅ Successfully deleted user: %', user_email;
    END IF;
END $$;

-- =====================================================
-- OPTION 2: Delete by user ID
-- =====================================================
-- Replace the UUID with the actual user ID

DO $$
DECLARE
    user_to_delete UUID := '256c67fc-4625-4f81-8525-1881267bb278'; -- ← CHANGE THIS
BEGIN
    -- Delete from public.users first
    DELETE FROM public.users WHERE id = user_to_delete;

    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = user_to_delete;

    RAISE NOTICE '✅ Successfully deleted user with ID: %', user_to_delete;
END $$;

-- =====================================================
-- OPTION 3: Delete all EXCEPT specific email (keep one user)
-- =====================================================
-- This keeps one user and deletes all others

DO $$
DECLARE
    email_to_keep TEXT := 'admin@yourdomain.com'; -- ← CHANGE THIS
    user_to_keep UUID;
BEGIN
    -- Get the ID of user to keep
    SELECT id INTO user_to_keep
    FROM auth.users
    WHERE email = email_to_keep;

    IF user_to_keep IS NULL THEN
        RAISE NOTICE '❌ User to keep (%) not found - no deletion performed', email_to_keep;
    ELSE
        -- Delete all other users from public.users
        DELETE FROM public.users WHERE id != user_to_keep;

        -- Delete all other users from auth.users
        DELETE FROM auth.users WHERE id != user_to_keep;

        RAISE NOTICE '✅ Kept user % and deleted all others', email_to_keep;
    END IF;
END $$;
