'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalorieRing } from '@/components/dashboard/calorie-ring'
import { MacroBars } from '@/components/dashboard/macro-bars'
import { QuickLogTemplates } from '@/components/meal/quick-log-templates'
import {
  Flame,
  TrendingUp,
  Award,
  Calendar,
  Plus,
  ChevronRight,
  Utensils,
  Sparkles
} from 'lucide-react'
import { cn, getMealEmoji, formatDate } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'mm' | 'en'>('mm')

  // Mock user data (will be replaced with real data from Supabase)
  const userData = {
    name: language === 'mm' ? 'မင်းသား' : 'Min Thar',
    dailyTarget: 2000,
    currentCalories: 1245,
    protein: { current: 65, target: 150 },
    fat: { current: 42, target: 67 },
    carbs: { current: 145, target: 250 },
    streak: 7,
    level: 3,
    points: 2850
  }

  const todaysMeals = [
    {
      id: '1',
      type: 'breakfast',
      name: language === 'mm' ? 'မုန့်ဟင်းခါး' : 'Mohinga',
      calories: 450,
      time: '08:30 AM'
    },
    {
      id: '2',
      type: 'snack',
      name: language === 'mm' ? 'ကော်ပြန့်ကြော်' : 'Spring Roll',
      calories: 180,
      time: '11:00 AM'
    },
    {
      id: '3',
      type: 'lunch',
      name: language === 'mm' ? 'ကြက်သား ဟင်း' : 'Chicken Curry',
      calories: 615,
      time: '01:30 PM'
    }
  ]

  const handleSelectTemplate = (template: any) => {
    console.log('Selected template:', template)
    // TODO: Pre-fill meal logging form
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'mm' ? 'ကယ်လိုရီ ခြေရာခံ' : 'Calorie Tracker'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(new Date(), language)}
              </p>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'mm' ? 'en' : 'mm')}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {language === 'mm' ? 'EN' : 'မြန်မာ'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Calorie Ring Card */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <div className="flex flex-col items-center">
              <CalorieRing
                current={userData.currentCalories}
                target={userData.dailyTarget}
                language={language}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'mm' ? 'ကျန်ရှိသည်' : 'Remaining'}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {userData.dailyTarget - userData.currentCalories}
                  <span className="text-sm font-normal text-gray-500"> kcal</span>
                </p>
              </div>
            </div>
          </div>

          {/* Macros Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {language === 'mm' ? 'အာဟာရဓာတ်များ' : 'Macronutrients'}
            </h3>
            <MacroBars
              protein={userData.protein}
              fat={userData.fat}
              carbs={userData.carbs}
              language={language}
            />

            {/* Gamification stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                  <Flame className="w-5 h-5" />
                  <span className="text-2xl font-bold">{userData.streak}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {language === 'mm' ? 'ရက်ဆက်' : 'Day Streak'}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                  <Award className="w-5 h-5" />
                  <span className="text-2xl font-bold">{userData.level}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {language === 'mm' ? 'အဆင့်' : 'Level'}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-2xl font-bold">{userData.points}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {language === 'mm' ? 'ရမှတ်များ' : 'Points'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Meal Button */}
        <button
          onClick={() => router.push('/add-meal')}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-3xl p-8 shadow-xl transition-all transform hover:scale-[1.02] mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl">
                <Utensils className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-1">
                  {language === 'mm' ? 'အစားအသောက် ထည့်မည်' : 'Add Your Meal'}
                </h3>
                <p className="text-white/80 text-sm">
                  {language === 'mm' ? 'AI က အလိုအလျောက် ရှာဖွေပေးမည်' : 'AI will find ingredients automatically'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        </button>

        {/* Quick Templates */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg mb-8">
          <QuickLogTemplates
            onSelectTemplate={handleSelectTemplate}
            language={language}
          />
        </div>

        {/* Today's Meals */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {language === 'mm' ? 'ယနေ့ အစားအသောက်' : "Today's Meals"}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {todaysMeals.length} {language === 'mm' ? 'ခေါက်' : 'meals'}
            </span>
          </div>

          <div className="space-y-3">
            {todaysMeals.map((meal) => (
              <button
                key={meal.id}
                className={cn(
                  "w-full flex items-center justify-between",
                  "p-4 rounded-xl",
                  "bg-gray-50 dark:bg-gray-800",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  "transition-colors duration-200",
                  "text-left group"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">
                    {getMealEmoji(meal.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {meal.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {meal.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {meal.calories}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      kcal
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}

            {/* Add meal button */}
            <button
              onClick={() => router.push('/add-meal')}
              className={cn(
                "w-full p-4 rounded-xl",
                "border-2 border-dashed border-gray-300 dark:border-gray-700",
                "hover:border-primary hover:bg-primary/5",
                "transition-all duration-200",
                "flex items-center justify-center gap-2",
                "text-gray-600 dark:text-gray-400 hover:text-primary"
              )}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">
                {language === 'mm' ? 'အစားအသောက် ထပ်ထည့်မည်' : 'Add Another Meal'}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => router.push('/add-meal')}
        className="lg:hidden fixed bottom-20 right-4 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all transform hover:scale-110"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {[
            { icon: '🏠', label: language === 'mm' ? 'မူလ' : 'Home', active: true },
            { icon: '📊', label: language === 'mm' ? 'ခြေရာခံ' : 'Track', active: false },
            { icon: '📈', label: language === 'mm' ? 'အစီရင်ခံ' : 'Reports', active: false },
            { icon: '👤', label: language === 'mm' ? 'ကျွန်ုပ်' : 'Profile', active: false },
          ].map((item, i) => (
            <button
              key={i}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl transition-colors",
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
