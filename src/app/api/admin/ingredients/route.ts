import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get all ingredients (for admin)
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
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'all', 'verified', 'pending'
    const search = searchParams.get('search');

    let query = supabase
      .from('ingredients')
      .select(`
        id,
        name_english,
        name_myanmar,
        category,
        calories_per_100g,
        protein_g,
        fat_g,
        carbs_g,
        fiber_g,
        verified,
        verified_by,
        verified_at,
        data_source,
        confidence_score,
        usage_count,
        created_at,
        updated_at
      `)
      .is('deleted_at', null);

    // Apply filters
    if (filter === 'verified') {
      query = query.eq('verified', true);
    } else if (filter === 'pending') {
      query = query.eq('verified', false);
    }

    // Apply search
    if (search && search.length >= 2) {
      query = query.or(`name_english.ilike.%${search}%,name_myanmar.ilike.%${search}%`);
    }

    const { data: ingredients, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching ingredients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ingredients', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ingredients: ingredients || [] });
  } catch (error: any) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ingredients', message: error.message },
      { status: 500 }
    );
  }
}
