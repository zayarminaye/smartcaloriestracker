'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/hooks/use-translation';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  ChevronDown,
} from 'lucide-react';
import { cn, getMealEmoji } from '@/lib/utils';

export default function HistoryPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { language, t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchMealsForDate(selectedDate);
    }
  }, [user, selectedDate]);

  const fetchMealsForDate = async (date: Date) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`/api/meals?user_id=${user.id}&date=${dateStr}`);
      const data = await response.json();

      if (response.ok && data.meals) {
        setMeals(data.meals);
      } else {
        setMeals([]);
      }
    } catch (error) {
      console.error('Failed to fetch meals:', error);
      setMeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm(language === 'mm' ? 'ဖျက်မှာ သေချာပါသလား?' : 'Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh meals
        fetchMealsForDate(selectedDate);
      } else {
        alert(language === 'mm' ? 'ဖျက်၍မရပါ' : 'Failed to delete meal');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(language === 'mm' ? 'ဖျက်၍မရပါ' : 'Failed to delete meal');
    }
  };

  const formatDate = (date: Date) => {
    if (language === 'mm') {
      return date.toLocaleDateString('my-MM', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0);

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className={cn(
            "text-3xl font-bold text-gray-900 dark:text-white mb-2",
            language === 'mm' && 'font-myanmar'
          )}>
            {language === 'mm' ? 'မှတ်တမ်း' : 'Meal History'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'mm' ? 'သင်၏ အစားအသောက် မှတ်တမ်းကို ကြည့်ရှုပါ' : 'View your past meals'}
          </p>
        </div>

        {/* Date Navigator */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousDay}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h2 className={cn(
                  "text-xl font-semibold text-gray-900 dark:text-white",
                  language === 'mm' && 'font-myanmar'
                )}>
                  {formatDate(selectedDate)}
                </h2>
              </div>
              {!isToday && (
                <button
                  onClick={handleToday}
                  className={cn(
                    "text-sm text-emerald-600 hover:text-emerald-700 font-medium",
                    language === 'mm' && 'font-myanmar'
                  )}
                >
                  {language === 'mm' ? 'ယနေ့' : 'Today'}
                </button>
              )}
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={isToday}
            >
              <ChevronRight className={cn(
                "w-6 h-6",
                isToday ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 dark:text-gray-400'
              )} />
            </button>
          </div>

          {/* Daily Summary */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'mm' ? 'စုစုပေါင်း ကယ်လိုရီ' : 'Total Calories'}
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {Math.round(totalCalories)}
                <span className="text-sm font-normal text-gray-500"> kcal</span>
              </p>
            </div>
            <div className="h-12 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'mm' ? 'အစားအသောက်' : 'Meals'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {meals.length}
              </p>
            </div>
          </div>
        </div>

        {/* Meals List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 shadow-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                {language === 'mm' ? 'ရှာနေသည်...' : 'Loading...'}
              </p>
            </div>
          ) : meals.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 shadow-lg text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className={cn(
                "text-lg font-semibold text-gray-900 dark:text-white mb-2",
                language === 'mm' && 'font-myanmar'
              )}>
                {language === 'mm' ? 'မှတ်တမ်း မရှိပါ' : 'No meals logged'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'mm' ? 'ဤရက်တွင် အစားအသောက် မရှိသေးပါ' : 'No meals recorded for this day'}
              </p>
            </div>
          ) : (
            meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">
                      {getMealEmoji(meal.meal_type)}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {meal.meal_name || (language === 'mm' ? 'အစားအစာ' : 'Meal')}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(meal.eaten_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {Math.round(meal.total_calories)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">kcal</p>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-gray-400 transition-transform",
                      expandedMeal === meal.id && 'rotate-180'
                    )} />
                  </div>
                </button>

                {expandedMeal === meal.id && (
                  <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="pt-4 space-y-3">
                      {/* Macros */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {language === 'mm' ? 'ပရိုတိန်း' : 'Protein'}
                          </p>
                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {Math.round(meal.total_protein_g || 0)}g
                          </p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {language === 'mm' ? 'အဆီ' : 'Fat'}
                          </p>
                          <p className="font-bold text-yellow-600 dark:text-yellow-400">
                            {Math.round(meal.total_fat_g || 0)}g
                          </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {language === 'mm' ? 'ကာဗွန်ဟိုက်ဒရိတ်' : 'Carbs'}
                          </p>
                          <p className="font-bold text-green-600 dark:text-green-400">
                            {Math.round(meal.total_carbs_g || 0)}g
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {language === 'mm' ? 'ဖျက်မည်' : 'Delete'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
