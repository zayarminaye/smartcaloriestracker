'use client'

import { useState } from 'react'
import { Check, AlertCircle, ChefHat, Scale, Plus, Minus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IngredientResult {
  name_mm: string
  name_en: string
  estimated_portion_g: number
  confidence: number
  database_match: {
    id: string
    name_english: string
    name_myanmar: string
    category: string
    calories_per_100g: number
    protein_g: number
    fat_g: number
    carbs_g: number
    fiber_g: number
  } | null
  matched: boolean
}

interface ExtractionResult {
  dish_name?: string
  cooking_method?: string
  ingredients: IngredientResult[]
  total_ingredients: number
  matched_count: number
}

interface IngredientResultsProps {
  result: ExtractionResult
  language: 'mm' | 'en'
  onSave: (adjustedIngredients: Array<{ ingredient: IngredientResult; portion_g: number }>) => void
  onBack: () => void
}

export function IngredientResults({
  result,
  language,
  onSave,
  onBack
}: IngredientResultsProps) {
  const [portions, setPortions] = useState<Record<string, number>>(
    result.ingredients.reduce((acc, ing) => ({
      ...acc,
      [ing.name_en]: ing.estimated_portion_g
    }), {})
  )

  const updatePortion = (ingredientName: string, amount: number) => {
    setPortions(prev => ({
      ...prev,
      [ingredientName]: Math.max(10, prev[ingredientName] + amount)
    }))
  }

  const calculateNutrition = (ingredient: IngredientResult, portionG: number) => {
    const multiplier = portionG / 100

    // Use database match if available, otherwise use AI estimate
    const nutritionSource = ingredient.database_match || (ingredient as any).ai_estimate

    if (!nutritionSource) return null

    return {
      calories: Math.round(nutritionSource.calories_per_100g * multiplier),
      protein: (nutritionSource.protein_g * multiplier).toFixed(1),
      fat: (nutritionSource.fat_g * multiplier).toFixed(1),
      carbs: (nutritionSource.carbs_g * multiplier).toFixed(1)
    }
  }

  const totalCalories = result.ingredients.reduce((sum, ing) => {
    const nutrition = calculateNutrition(ing, portions[ing.name_en])
    return sum + (nutrition?.calories || 0)
  }, 0)

  const handleSave = () => {
    const adjustedIngredients = result.ingredients.map(ing => ({
      ingredient: ing,
      portion_g: portions[ing.name_en]
    }))
    onSave(adjustedIngredients)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Dish Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat className="w-6 h-6" />
              <span className="text-sm opacity-90">
                {language === 'mm' ? 'ထောက်လှမ်းတွေ့ရှိ' : 'Detected'}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {result.dish_name || (language === 'mm' ? 'မသိသော အစားအစာ' : 'Unknown Dish')}
            </h2>
            {result.cooking_method && (
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm">
                {result.cooking_method}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{totalCalories}</div>
            <div className="text-sm opacity-90">kcal</div>
          </div>
        </div>
      </div>

      {/* Match Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'mm' ? 'တွေ့ရှိသော ပါဝင်ပစ္စည်း' : 'Found Ingredients'}
            </span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {result.matched_count} / {result.total_ingredients}
          </span>
        </div>
      </div>

      {/* Ingredients List - Compact */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {language === 'mm' ? 'ပါဝင်ပစ္စည်းများ' : 'Ingredients'}
          </h3>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {result.ingredients.map((ingredient, index) => {
            const portion = portions[ingredient.name_en]
            const nutrition = calculateNutrition(ingredient, portion)

            return (
              <div
                key={index}
                className={cn(
                  "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                  !ingredient.matched && "bg-orange-50/30 dark:bg-orange-900/10"
                )}
              >
                {/* Single Row Layout */}
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {ingredient.matched ? (
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {language === 'mm' ? ingredient.name_mm : ingredient.name_en}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {language === 'mm' ? ingredient.name_en : ingredient.name_mm}
                    </div>
                  </div>

                  {/* Portion Adjuster */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updatePortion(ingredient.name_en, -10)}
                      className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <span className="font-semibold text-gray-900 dark:text-white text-sm min-w-[50px] text-center">
                      {portion}g
                    </span>

                    <button
                      onClick={() => updatePortion(ingredient.name_en, 10)}
                      className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Nutrition Summary */}
                  {nutrition ? (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">{nutrition.calories}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-0.5">kcal</span>
                      </div>
                      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                      <div className="text-gray-600 dark:text-gray-400">
                        P:{nutrition.protein}g F:{nutrition.fat}g C:{nutrition.carbs}g
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      {language === 'mm' ? 'ခန့်မှန်းချက်' : 'AI Est.'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {language === 'mm' ? 'နောက်သို့' : 'Back'}
        </button>

        <button
          onClick={handleSave}
          className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold hover:from-green-600 hover:to-blue-600 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {language === 'mm' ? 'မှတ်တမ်းသိမ်းမည်' : 'Save to Diary'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
