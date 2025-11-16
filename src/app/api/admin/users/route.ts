import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get all users (for admin)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single<{ is_admin: boolean }>();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        display_name,
        is_admin,
        email_verified,
        preferred_language,
        points,
        level,
        streak_days,
        created_at
      `)
      .is('deleted_at', null);

    // Apply search
    if (search && search.length >= 2) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    const { data: users, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: users || [] });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', message: error.message },
      { status: 500 }
    );
  }
}
