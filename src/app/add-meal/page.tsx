'use client'

import { useState, useEffect } from 'react'
import { SmartDishInput } from '@/components/search/smart-dish-input'
import { IngredientResults } from '@/components/meal/ingredient-results'
import { UserMenu } from '@/components/layout/user-menu'
import { useAuth } from '@/contexts/auth-context'
import { useTranslation } from '@/hooks/use-translation'
import { ArrowLeft, Utensils } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddMealPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { language, setLanguage } = useTranslation()
  const [extractionResult, setExtractionResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  const handleExtractIngredients = async (dishText: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/extract-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: dishText, language })
      })

      const data = await res.json()
      console.log('Extracted ingredients:', data)
      setExtractionResult(data)
    } catch (error) {
      console.error('Extraction failed:', error)
      alert(language === 'mm'
        ? 'ပါဝင်ပစ္စည်းများ ရှာဖွေ၍မရပါ။ ထပ်ကြိုးစားကြည့်ပါ။'
        : 'Failed to extract ingredients. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (adjustedIngredients: any) => {
    if (!user) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          meal_name: extractionResult?.dish_name,
          meal_type: getMealTypeFromTime(), // Auto-detect based on time
          eaten_at: new Date().toISOString(),
          ingredients: adjustedIngredients
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save meal')
      }

      console.log('Meal saved successfully:', data.meal)
      alert(language === 'mm'
        ? 'အစားအသောက် မှတ်တမ်းသိမ်းပြီးပါပြီ!'
        : 'Meal saved successfully!')
      router.push('/')
    } catch (error: any) {
      console.error('Save error:', error)
      alert(language === 'mm'
        ? `မှတ်တမ်းသိမ်း၍မရပါ: ${error.message}`
        : `Failed to save: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to determine meal type based on current time
  const getMealTypeFromTime = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) return 'breakfast'
    if (hour >= 11 && hour < 16) return 'lunch'
    if (hour >= 16 && hour < 22) return 'dinner'
    return 'snack'
  }

  const handleBack = () => {
    setExtractionResult(null)
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">
                {language === 'mm' ? 'နောက်သို့' : 'Back'}
              </span>
            </button>

            <div className="flex items-center gap-3">
              <Utensils className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'mm' ? 'အစားအသောက် ထည့်မည်' : 'Add Meal'}
              </h1>
            </div>

            <button
              onClick={() => setLanguage(language === 'mm' ? 'en' : 'mm')}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {language === 'mm' ? 'EN' : 'မြန်မာ'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!extractionResult ? (
          /* Input State */
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                <Utensils className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'mm' ? 'ဘာစားလဲ?' : 'What did you eat?'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'mm'
                  ? 'သင်စားခဲ့သော အစားအစာကို ရိုက်ထည့်ပါ'
                  : 'Type the dish you ate and we\'ll find the ingredients'}
              </p>
            </div>

            {/* Input Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl">
              <SmartDishInput
                onExtract={handleExtractIngredients}
                language={language}
                placeholder={
                  language === 'mm'
                    ? 'ဥပမာ - "ကြက်သား နဲ့ အာလူး ဟင်း"'
                    : 'Example: "Chicken and potato curry"'
                }
              />

              {/* Loading State */}
              {isLoading && (
                <div className="mt-8 text-center">
                  <div className="inline-flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {language === 'mm'
                        ? 'AI က ပါဝင်ပစ္စည်းများ ရှာနေပါသည်...'
                        : 'AI is finding ingredients...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Help Text */}
              {!isLoading && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {language === 'mm' ? '💡 အကြံပြုချက်များ' : '💡 Tips'}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      {language === 'mm'
                        ? '✓ မြန်မာ သို့မဟုတ် အင်္ဂလိပ်ဘာသာဖြင့် ရိုက်ထည့်နိုင်ပါသည်'
                        : '✓ You can type in Myanmar or English'}
                    </li>
                    <li>
                      {language === 'mm'
                        ? '✓ AI က အလိုအလျောက် ပါဝင်ပစ္စည်းများနှင့် အာဟာရတန်ဖိုးများ ရှာဖွေပေးပါမည်'
                        : '✓ AI will automatically find ingredients and nutrition info'}
                    </li>
                    <li>
                      {language === 'mm'
                        ? '✓ ပမာဏကို နောက်မှ ချိန်ညှိနိုင်ပါသည်'
                        : '✓ You can adjust portions after extraction'}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Examples */}
            <div className="grid grid-cols-2 gap-3">
              {(language === 'mm'
                ? ['ကြက်သား ဟင်း', 'မုန့်ဟင်းခါး', 'ရှမ်းခေါက်ဆွဲ', 'လက်ဖက်သုတ်']
                : ['Chicken curry', 'Mohinga', 'Shan noodles', 'Tea leaf salad']
              ).map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExtractIngredients(example)}
                  disabled={isLoading}
                  className="p-4 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-2xl mb-2 block">🍽️</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {example}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Results State */
          <IngredientResults
            result={extractionResult}
            language={language}
            onSave={handleSave}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  )
}
