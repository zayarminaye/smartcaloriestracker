-- =====================================================
-- Add RLS policies for admin user management
-- =====================================================

-- Drop the old policy that only allows viewing own record
DROP POLICY IF EXISTS users_select_own ON users;

-- Create new policy that allows:
-- 1. Users to see their own record
-- 2. Admins to see all users
CREATE POLICY users_select_policy ON users
    FOR SELECT
    USING (
        auth.uid() = id  -- Users can see themselves
        OR EXISTS (      -- Admins can see everyone
            SELECT 1 FROM users admin_user
            WHERE admin_user.id = auth.uid()
            AND admin_user.is_admin = TRUE
        )
    );

-- Allow admins to update any user (for admin management)
CREATE POLICY admin_update_users ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users admin_user
            WHERE admin_user.id = auth.uid()
            AND admin_user.is_admin = TRUE
        )
    );

-- Add comment for documentation
COMMENT ON POLICY users_select_policy ON users IS 'Users can view their own profile; admins can view all users';
COMMENT ON POLICY admin_update_users ON users IS 'Admins can update any user profile';
