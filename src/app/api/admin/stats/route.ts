import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await (supabase
      .from('users') as any)
      .select('is_admin')
      .eq('id', user.id)
      .single<{ is_admin: boolean }>();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch stats
    const [usersResult, ingredientsResult, verifiedResult, pendingResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('ingredients').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('ingredients').select('id', { count: 'exact', head: true }).eq('verified', true).is('deleted_at', null),
      supabase.from('ingredients').select('id', { count: 'exact', head: true }).eq('verified', false).is('deleted_at', null),
    ]);

    return NextResponse.json({
      totalUsers: usersResult.count || 0,
      totalIngredients: ingredientsResult.count || 0,
      verifiedIngredients: verifiedResult.count || 0,
      pendingIngredients: pendingResult.count || 0,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', message: error.message },
      { status: 500 }
    );
  }
}
