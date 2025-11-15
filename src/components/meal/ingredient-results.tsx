'use client'

import { useState } from 'react'
import { Check, AlertCircle, ChefHat, Scale, Plus, Minus, ArrowRight, X, PlusCircle } from 'lucide-react'
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
  const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set())
  const [addedIngredients, setAddedIngredients] = useState<IngredientResult[]>([])
  const [showAddIngredient, setShowAddIngredient] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const updatePortion = (ingredientName: string, amount: number) => {
    setPortions(prev => ({
      ...prev,
      [ingredientName]: Math.max(10, prev[ingredientName] + amount)
    }))
  }

  const removeIngredient = (ingredientName: string) => {
    setRemovedIngredients(prev => new Set(prev).add(ingredientName))
  }

  const restoreIngredient = (ingredientName: string) => {
    setRemovedIngredients(prev => {
      const newSet = new Set(prev)
      newSet.delete(ingredientName)
      return newSet
    })
  }

  const activeIngredients = [
    ...result.ingredients.filter(ing => !removedIngredients.has(ing.name_en)),
    ...addedIngredients
  ]

  const searchIngredients = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search/ingredients?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const addIngredientFromSearch = (dbIngredient: any) => {
    const newIngredient: IngredientResult = {
      name_mm: dbIngredient.name_myanmar,
      name_en: dbIngredient.name_english,
      estimated_portion_g: 100,
      confidence: 1.0,
      database_match: dbIngredient,
      matched: true
    }

    setAddedIngredients(prev => [...prev, newIngredient])
    setPortions(prev => ({
      ...prev,
      [newIngredient.name_en]: 100
    }))
    setShowAddIngredient(false)
    setSearchQuery('')
    setSearchResults([])
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

  const totalCalories = activeIngredients.reduce((sum, ing) => {
    const nutrition = calculateNutrition(ing, portions[ing.name_en])
    return sum + (nutrition?.calories || 0)
  }, 0)

  const handleSave = () => {
    // Only save active (non-removed) ingredients
    const adjustedIngredients = activeIngredients.map(ing => ({
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
              {language === 'mm' ? 'ရွေးချယ်ထားသော ပါဝင်ပစ္စည်း' : 'Selected Ingredients'}
            </span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {activeIngredients.length} / {result.total_ingredients}
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
          {activeIngredients.map((ingredient, index) => {
            const portion = portions[ingredient.name_en]
            const nutrition = calculateNutrition(ingredient, portion)

            return (
              <div
                key={index}
                className={cn(
                  "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group",
                  !ingredient.matched && "bg-orange-50/30 dark:bg-orange-900/10"
                )}
              >
                {/* Single Row Layout */}
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 w-6">
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
                  <div className="flex-1 min-w-0 max-w-[180px]">
                    <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {language === 'mm' ? ingredient.name_mm : ingredient.name_en}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {language === 'mm' ? ingredient.name_en : ingredient.name_mm}
                    </div>
                  </div>

                  {/* Portion Adjuster */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => updatePortion(ingredient.name_en, -10)}
                      className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <span className="font-semibold text-gray-900 dark:text-white text-sm min-w-[55px] text-center">
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
                    <div className="flex items-center gap-2 text-xs min-w-[220px] flex-shrink-0">
                      <div className="text-right min-w-[60px]">
                        <span className="font-semibold text-gray-900 dark:text-white">{nutrition.calories}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-0.5">kcal</span>
                      </div>
                      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                      <div className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        P:{nutrition.protein}g F:{nutrition.fat}g C:{nutrition.carbs}g
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-orange-600 dark:text-orange-400 min-w-[220px] flex-shrink-0">
                      {language === 'mm' ? 'ခန့်မှန်းချက်' : 'AI Est.'}
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeIngredient(ingredient.name_en)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex-shrink-0"
                    title={language === 'mm' ? 'ဖယ်ရှားမည်' : 'Remove'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Removed Ingredients (can restore) */}
          {removedIngredients.size > 0 && (
            <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {language === 'mm' ? 'ဖယ်ရှားထားသော ပစ္စည်းများ' : 'Removed ingredients'}
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(removedIngredients).map((name) => {
                  const ingredient = result.ingredients.find(i => i.name_en === name)
                  if (!ingredient) return null
                  return (
                    <button
                      key={name}
                      onClick={() => restoreIngredient(name)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {language === 'mm' ? ingredient.name_mm : ingredient.name_en}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add Ingredient Button */}
          <div className="px-4 py-3">
            <button
              onClick={() => setShowAddIngredient(true)}
              className="w-full p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium text-sm">
                {language === 'mm' ? 'ပါဝင်ပစ္စည်း ထပ်ထည့်မည်' : 'Add Missing Ingredient'}
              </span>
            </button>
          </div>
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

      {/* Add Ingredient Modal */}
      {showAddIngredient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === 'mm' ? 'ပါဝင်ပစ္စည်း ရှာမည်' : 'Search Ingredient'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddIngredient(false)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchIngredients(e.target.value)
                }}
                placeholder={language === 'mm' ? 'ပါဝင်ပစ္စည်း အမည်ရိုက်ထည့်ပါ...' : 'Type ingredient name...'}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto max-h-96">
              {isSearching ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === 'mm' ? 'ရှာနေသည်...' : 'Searching...'}
                  </p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => addIngredientFromSearch(item)}
                      className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {language === 'mm' ? item.name_myanmar : item.name_english}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'mm' ? item.name_english : item.name_myanmar} • {item.category}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {item.calories_per_100g} kcal/100g
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === 'mm' ? 'ရလဒ် မတွေ့ပါ' : 'No results found'}
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === 'mm'
                      ? 'ရှာရန် အနည်းဆုံး ၂ လုံး ရိုက်ထည့်ပါ'
                      : 'Type at least 2 characters to search'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
