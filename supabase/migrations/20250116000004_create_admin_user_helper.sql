-- =====================================================
-- Admin User Setup Helper
-- =====================================================

-- Function to promote a user to admin by email
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE users
    SET is_admin = TRUE
    WHERE email = user_email;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    IF affected_rows = 0 THEN
        RETURN 'No user found with email: ' || user_email;
    ELSE
        RETURN 'Successfully promoted ' || user_email || ' to admin';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON FUNCTION promote_user_to_admin IS 'Promotes an existing user to admin status by email address';

-- =====================================================
-- INSTRUCTIONS TO CREATE FIRST ADMIN USER:
-- =====================================================
--
-- 1. Register a new account through your app's registration page
--    Example: admin@yourdomain.com / YourSecurePassword123
--
-- 2. After registration, run this SQL in Supabase SQL Editor:
--    SELECT promote_user_to_admin('admin@yourdomain.com');
--
-- 3. Or manually update the user:
--    UPDATE users SET is_admin = TRUE WHERE email = 'admin@yourdomain.com';
--
-- =====================================================

-- Example: Uncomment and modify the line below to create your first admin
-- UPDATE users SET is_admin = TRUE WHERE email = 'your-admin-email@example.com';
