import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/**
 * Get popular dish templates
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    let query = (supabase
      .from('dish_templates') as any)
      .select('*')
      .eq('is_public', true)
      .order('popularity_score', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: templates, error } = await query

    if (error) throw error

    return NextResponse.json({ templates })
  } catch (error: any) {
    console.error('Templates fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates', message: error.message },
      { status: 500 }
    )
  }
}
