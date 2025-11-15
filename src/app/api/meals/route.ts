import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/**
 * Save a meal with its ingredients to the database
 */
export async function POST(request: NextRequest) {
  try {
    const {
      meal_name,
      meal_type,
      eaten_at,
      ingredients,
      user_id
    } = await request.json()

    // Validate required fields
    if (!user_id || !ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'user_id and ingredients are required' },
        { status: 400 }
      )
    }

    // Step 1: Create the meal record
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id,
        meal_name,
        meal_type: meal_type || 'other',
        eaten_at: eaten_at || new Date().toISOString(),
        ai_generated: true
      })
      .select()
      .single()

    if (mealError) {
      console.error('Meal creation error:', mealError)
      return NextResponse.json(
        { error: 'Failed to create meal', details: mealError.message },
        { status: 500 }
      )
    }

    // Step 2: Create meal_items for each ingredient
    const mealItems = await Promise.all(
      ingredients.map(async (item: any) => {
        const {
          ingredient,
          portion_g
        } = item

        // Calculate nutrition based on portion
        const multiplier = portion_g / 100

        // Use database match if available, otherwise skip (or use AI estimation)
        if (!ingredient.database_match) {
          console.warn(`No database match for ingredient: ${ingredient.name_en}`)
          return null
        }

        const dbMatch = ingredient.database_match
        const calculatedNutrition = {
          calories: Math.round(dbMatch.calories_per_100g * multiplier * 100) / 100,
          protein_g: Math.round(dbMatch.protein_g * multiplier * 100) / 100,
          fat_g: Math.round(dbMatch.fat_g * multiplier * 100) / 100,
          carbs_g: Math.round(dbMatch.carbs_g * multiplier * 100) / 100,
          fiber_g: Math.round(dbMatch.fiber_g * multiplier * 100) / 100
        }

        return {
          meal_id: meal.id,
          ingredient_id: dbMatch.id,
          portion_grams: portion_g,
          calories: calculatedNutrition.calories,
          protein_g: calculatedNutrition.protein_g,
          fat_g: calculatedNutrition.fat_g,
          carbs_g: calculatedNutrition.carbs_g,
          fiber_g: calculatedNutrition.fiber_g,
          confidence_level: ingredient.matched ? 'exact' : 'estimated',
          ai_suggested: true,
          user_confirmed: true
        }
      })
    )

    // Filter out null items (ingredients without database match)
    const validMealItems = mealItems.filter(item => item !== null)

    if (validMealItems.length === 0) {
      // Clean up the meal if no valid ingredients
      await supabase.from('meals').delete().eq('id', meal.id)
      return NextResponse.json(
        { error: 'No valid ingredients with nutrition data found' },
        { status: 400 }
      )
    }

    // Insert meal items
    const { error: itemsError } = await supabase
      .from('meal_items')
      .insert(validMealItems)

    if (itemsError) {
      console.error('Meal items creation error:', itemsError)
      // Clean up the meal
      await supabase.from('meals').delete().eq('id', meal.id)
      return NextResponse.json(
        { error: 'Failed to create meal items', details: itemsError.message },
        { status: 500 }
      )
    }

    // Step 3: Fetch the complete meal with updated totals (triggers will have run)
    const { data: completeMeal } = await supabase
      .from('meals')
      .select(`
        *,
        meal_items (
          *,
          ingredients (
            name_english,
            name_myanmar,
            category
          )
        )
      `)
      .eq('id', meal.id)
      .single()

    return NextResponse.json({
      success: true,
      meal: completeMeal
    })
  } catch (error: any) {
    console.error('Save meal error:', error)
    return NextResponse.json(
      { error: 'Failed to save meal', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * Get today's meals for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Get meals for the specified date
    const { data: meals, error } = await supabase
      .from('meals')
      .select(`
        *,
        meal_items (
          *,
          ingredients (
            name_english,
            name_myanmar,
            category
          )
        )
      `)
      .eq('user_id', user_id)
      .gte('eaten_at', `${date}T00:00:00Z`)
      .lte('eaten_at', `${date}T23:59:59Z`)
      .is('deleted_at', null)
      .order('eaten_at', { ascending: false })

    if (error) {
      console.error('Fetch meals error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch meals', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ meals })
  } catch (error: any) {
    console.error('Get meals error:', error)
    return NextResponse.json(
      { error: 'Failed to get meals', message: error.message },
      { status: 500 }
    )
  }
}
