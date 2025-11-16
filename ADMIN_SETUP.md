# Admin User Setup Guide

## Overview
This application has admin functionality built-in, but no default admin credentials exist for security reasons. You need to create your first admin user manually.

## Quick Setup (3 Steps)

### Step 1: Register a Normal User Account
1. Go to your app's registration page: `/auth/register`
2. Register with your admin email and password
3. Example credentials you might use:
   - Email: `admin@yourdomain.com`
   - Password: Choose a strong password
   - Complete the registration form

### Step 2: Fix the Registration RLS Policy (if not done yet)
Run this in your **Supabase Dashboard → SQL Editor**:
```sql
CREATE POLICY users_insert_own ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);
```

### Step 3: Promote User to Admin
After registration is complete, run this in **Supabase Dashboard → SQL Editor**:

**Option A: Using the helper function**
```sql
SELECT promote_user_to_admin('admin@yourdomain.com');
```

**Option B: Direct update**
```sql
UPDATE users
SET is_admin = TRUE
WHERE email = 'admin@yourdomain.com';
```

## Verify Admin Access

After promoting the user, you can verify admin status:

```sql
SELECT email, is_admin, email_verified
FROM users
WHERE email = 'admin@yourdomain.com';
```

You should see:
```
email                    | is_admin | email_verified
-------------------------|----------|---------------
admin@yourdomain.com     | true     | false or true
```

## Admin Capabilities

Once promoted to admin, the user will have access to:

1. **View All Ingredients** - Including unverified ones
2. **Edit Ingredients** - Update nutritional data
3. **Verify Ingredients** - Approve user-submitted ingredients
4. **Delete Ingredients** - Remove inappropriate entries
5. **View System Settings** - Read and modify app settings
6. **View Admin Activity Log** - See all admin actions
7. **View All API Usage** - Monitor API consumption

## Creating Additional Admin Users

To create more admin users, repeat the process:

1. Have them register through the app
2. Run the promotion SQL for their email:
   ```sql
   SELECT promote_user_to_admin('newadmin@example.com');
   ```

## Removing Admin Access

To revoke admin privileges:

```sql
UPDATE users
SET is_admin = FALSE
WHERE email = 'user@example.com';
```

## Security Best Practices

1. **Use Strong Passwords** - At least 12 characters with mixed case, numbers, and symbols
2. **Limit Admin Accounts** - Only promote trusted users
3. **Enable Email Verification** - Ensure admin emails are verified
4. **Monitor Activity** - Check `admin_activity_log` table regularly
5. **Use 2FA** - Enable in Supabase Auth settings

## Troubleshooting

### "New row violates row-level security policy"
Run the RLS policy fix from Step 2 above.

### "No user found with email"
- Make sure the user completed registration first
- Check the email spelling matches exactly (case-sensitive)
- Verify the user exists: `SELECT * FROM users WHERE email = 'admin@example.com';`

### "Email not verified"
This doesn't prevent admin access, but you should verify emails:
```sql
UPDATE users
SET email_verified = TRUE
WHERE email = 'admin@yourdomain.com';
```

## Admin Panel Development

If you're building an admin panel, check for admin status using:

```typescript
// In your React components
const { profile } = useAuth();

if (profile?.is_admin) {
  // Show admin features
}
```

## Database Schema Reference

Admin-related fields in `users` table:
- `is_admin` (boolean) - Admin privilege flag
- `email_verified` (boolean) - Email verification status

Admin-related tables:
- `admin_activity_log` - Logs all admin actions
- `system_settings` - App configuration (admin access required)

---

For questions or issues, please check the main README.md or contact your development team.
