import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/**
 * Search ingredients by name (Myanmar or English)
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

    // Search in both Myanmar and English names
    const { data: results, error } = await supabase
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
        fiber_g
      `)
      .or(`name_myanmar.ilike.%${query}%,name_english.ilike.%${query}%`)
      .is('deleted_at', null)
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
