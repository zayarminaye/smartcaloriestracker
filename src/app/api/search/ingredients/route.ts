import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Search ingredients by name (Myanmar or English)
 * Regular users see only verified ingredients
 * Admins see all ingredients
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is admin
    let isAdmin = false
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      isAdmin = profile?.is_admin || false
    }

    // Build query
    let queryBuilder = supabase
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
        data_source
      `)
      .or(`name_myanmar.ilike.%${query}%,name_english.ilike.%${query}%`)
      .is('deleted_at', null)

    // Filter by verified status for non-admin users
    if (!isAdmin) {
      queryBuilder = queryBuilder.eq('verified', true)
    }

    const { data: results, error } = await queryBuilder
      .order('usage_count', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ results: results || [] })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    )
  }
}
