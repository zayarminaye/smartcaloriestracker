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
    if (!ingredient.database_match) return null

    const multiplier = portionG / 100
    return {
      calories: Math.round(ingredient.database_match.calories_per_100g * multiplier),
      protein: (ingredient.database_match.protein_g * multiplier).toFixed(1),
      fat: (ingredient.database_match.fat_g * multiplier).toFixed(1),
      carbs: (ingredient.database_match.carbs_g * multiplier).toFixed(1)
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

      {/* Ingredients List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-2">
          {language === 'mm' ? 'ပါဝင်ပစ္စည်းများ' : 'Ingredients'}
        </h3>

        {result.ingredients.map((ingredient, index) => {
          const portion = portions[ingredient.name_en]
          const nutrition = calculateNutrition(ingredient, portion)

          return (
            <div
              key={index}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-md",
                "border-2",
                ingredient.matched
                  ? "border-green-200 dark:border-green-900"
                  : "border-orange-200 dark:border-orange-900"
              )}
            >
              {/* Ingredient Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {ingredient.matched ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {language === 'mm' ? ingredient.name_mm : ingredient.name_en}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'mm' ? ingredient.name_en : ingredient.name_mm}
                  </p>
                  {!ingredient.matched && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                      {language === 'mm' ? 'ခန့်မှန်းချက်' : 'Estimated'} • {Math.round(ingredient.confidence * 100)}%
                    </span>
                  )}
                </div>

                {ingredient.database_match && (
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                    {ingredient.database_match.category}
                  </span>
                )}
              </div>

              {/* Portion Adjuster */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'mm' ? 'ပမာဏ' : 'Portion'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePortion(ingredient.name_en, -10)}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>

                  <span className="font-semibold text-gray-900 dark:text-white min-w-[60px] text-center">
                    {portion}g
                  </span>

                  <button
                    onClick={() => updatePortion(ingredient.name_en, 10)}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Nutrition Info */}
              {nutrition && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">kcal</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{nutrition.calories}</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Protein</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{nutrition.protein}g</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Fat</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{nutrition.fat}g</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Carbs</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{nutrition.carbs}g</div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
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
