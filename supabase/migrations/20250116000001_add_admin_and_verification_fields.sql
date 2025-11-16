-- =====================================================
-- Add admin and verification fields
-- =====================================================

-- Add admin and email verification fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS reset_password_token TEXT,
ADD COLUMN IF NOT EXISTS reset_password_expires_at TIMESTAMPTZ;

-- Create index for admin users
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN users.is_admin IS 'Whether this user has admin privileges';
COMMENT ON COLUMN users.email_verified IS 'Whether the user email has been verified';

-- Update existing verified_by foreign key in ingredients table to reference users
ALTER TABLE ingredients
DROP CONSTRAINT IF EXISTS fk_ingredients_verified_by;

ALTER TABLE ingredients
ADD CONSTRAINT fk_ingredients_verified_by
FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Create index for settings lookup
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Insert default settings
INSERT INTO system_settings (key, value, description)
VALUES
    ('require_ingredient_verification', 'true', 'Whether ingredients must be verified before showing to regular users'),
    ('allow_user_contributions', 'true', 'Whether users can submit new ingredients'),
    ('default_language', '"mm"', 'Default language for the app (mm or en)'),
    ('available_languages', '["mm", "en"]', 'List of available languages')
ON CONFLICT (key) DO NOTHING;

-- Create activity log table for admin actions
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action TEXT NOT NULL, -- 'verify_ingredient', 'edit_ingredient', 'delete_ingredient', 'edit_user', etc.
    entity_type TEXT NOT NULL, -- 'ingredient', 'user', 'setting', etc.
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for activity log
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);

-- Add RLS policies for admin tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on system_settings
CREATE POLICY admin_all_system_settings ON system_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
        )
    );

-- Everyone can read system settings
CREATE POLICY read_system_settings ON system_settings
    FOR SELECT
    USING (TRUE);

-- Admin can do everything on activity log
CREATE POLICY admin_all_activity_log ON admin_activity_log
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
        )
    );

-- Update ingredients RLS to allow admin to see unverified
DROP POLICY IF EXISTS select_ingredients ON ingredients;

CREATE POLICY select_ingredients ON ingredients
    FOR SELECT
    USING (
        deleted_at IS NULL
        AND (
            verified = TRUE  -- Regular users see verified only
            OR EXISTS (       -- Admins see everything
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.is_admin = TRUE
            )
        )
    );

-- Allow admin to update ingredients
CREATE POLICY admin_update_ingredients ON ingredients
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
        )
    );

-- Allow admin to insert ingredients
CREATE POLICY admin_insert_ingredients ON ingredients
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
        )
    );

-- Allow admin to delete ingredients
CREATE POLICY admin_delete_ingredients ON ingredients
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
        )
    );

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.verified = TRUE AND OLD.verified = FALSE THEN
        INSERT INTO admin_activity_log (admin_id, action, entity_type, entity_id, details)
        VALUES (
            NEW.verified_by,
            'verify_ingredient',
            'ingredient',
            NEW.id,
            jsonb_build_object(
                'ingredient_name_en', NEW.name_english,
                'ingredient_name_mm', NEW.name_myanmar
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log ingredient verification
DROP TRIGGER IF EXISTS trigger_log_ingredient_verification ON ingredients;
CREATE TRIGGER trigger_log_ingredient_verification
    AFTER UPDATE ON ingredients
    FOR EACH ROW
    EXECUTE FUNCTION log_admin_activity();
