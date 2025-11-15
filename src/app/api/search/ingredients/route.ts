import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/**
 * Smart ingredient search with auto-complete
 * Supports both Myanmar and English
 * Returns top 10 most relevant results
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const language = searchParams.get('lang') || 'mm'
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!query || query.length < 2) {
    return NextResponse.json({ ingredients: [] })
  }

  try {
    let searchQuery = supabase
      .from('ingredients')
      .select(`
        id,
        name_english,
        name_myanmar,
        category,
        subcategory,
        calories_per_100g,
        protein_g,
        fat_g,
        carbs_g,
        fiber_g,
        usage_count,
        image_url
      `)
      .is('deleted_at', null)

    // Search based on language
    if (language === 'mm') {
      // Myanmar text search
      searchQuery = searchQuery.or(`name_myanmar.ilike.%${query}%,category.ilike.%${query}%`)
    } else {
      // English text search
      searchQuery = searchQuery.or(`name_english.ilike.%${query}%,category.ilike.%${query}%`)
    }

    const { data: ingredients, error } = await searchQuery
      .order('usage_count', { ascending: false }) // Popular items first
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ ingredients })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    )
  }
}
