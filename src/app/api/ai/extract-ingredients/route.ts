import { NextRequest, NextResponse } from 'next/server'
import { extractIngredientsFromText, estimateNutrition } from '@/lib/ai/gemini'
import { supabase } from '@/lib/supabase/client'

/**
 * AI-powered ingredient extraction from dish description
 * Uses Gemini AI to parse Myanmar text
 */
export async function POST(request: NextRequest) {
  try {
    const { text, language = 'mm' } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Extract ingredients using Gemini
    const extraction = await extractIngredientsFromText(text, language)

    // Match extracted ingredients with database
    const enrichedIngredients = await Promise.all(
      extraction.ingredients.map(async (item) => {
        // Search database for matching ingredient
        const { data: matches } = await supabase
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
          .or(`name_myanmar.ilike.%${item.name_mm}%,name_english.ilike.%${item.name_en}%`)
          .is('deleted_at', null)
          .limit(1)

        const dbMatch = matches?.[0]

        // If no database match, get AI estimation
        let aiEstimate = null
        if (!dbMatch) {
          try {
            aiEstimate = await estimateNutrition(item.name_en)
          } catch (error) {
            console.error(`AI estimation failed for ${item.name_en}:`, error)
          }
        }

        return {
          ...item,
          database_match: dbMatch || null,
          ai_estimate: aiEstimate,
          matched: !!dbMatch
        }
      })
    )

    return NextResponse.json({
      dish_name: extraction.dish_name,
      cooking_method: extraction.cooking_method,
      ingredients: enrichedIngredients,
      total_ingredients: enrichedIngredients.length,
      matched_count: enrichedIngredients.filter(i => i.matched).length
    })
  } catch (error: any) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract ingredients', message: error.message },
      { status: 500 }
    )
  }
}
