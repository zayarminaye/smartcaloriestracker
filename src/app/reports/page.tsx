'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/hooks/use-translation';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Flame,
  Target,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { language, t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [stats, setStats] = useState({
    avgCalories: 0,
    totalMeals: 0,
    streakDays: 0,
    goalMetDays: 0,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, selectedPeriod]);

  const fetchStats = async () => {
    // TODO: Fetch actual stats from API
    // For now, using placeholder data
    setStats({
      avgCalories: 1850,
      totalMeals: 42,
      streakDays: profile?.streak_days || 0,
      goalMetDays: 5,
    });
  };

  const periods = [
    { key: 'week', label: language === 'mm' ? 'ရက်သတ္တပတ်' : 'Week' },
    { key: 'month', label: language === 'mm' ? 'လ' : 'Month' },
    { key: 'year', label: language === 'mm' ? 'နှစ်' : 'Year' },
  ] as const;

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

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className={cn(
            "text-3xl font-bold text-gray-900 dark:text-white mb-2",
            language === 'mm' && 'font-myanmar'
          )}>
            {language === 'mm' ? 'အစီရင်ခံစာ' : 'Reports & Analytics'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'mm' ? 'သင်၏ တိုးတက်မှုကို ခြေရာခံကြည့်ရှုပါ' : 'Track your progress over time'}
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all",
                language === 'mm' && 'font-myanmar',
                selectedPeriod === period.key
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Calories */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingDown className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {language === 'mm' ? 'ပျမ်းမျှ ကယ်လိုရီ' : 'Avg Calories'}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.avgCalories}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {language === 'mm' ? 'ရက်လျှင်' : 'per day'}
            </p>
          </div>

          {/* Total Meals */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {language === 'mm' ? 'စုစုပေါင်း အစားအသောက်' : 'Total Meals'}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalMeals}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {language === 'mm' ? `${selectedPeriod === 'week' ? 'ရက်သတ္တပတ်' : selectedPeriod === 'month' ? 'လ' : 'နှစ်'}တွင်` : `this ${selectedPeriod}`}
            </p>
          </div>

          {/* Streak Days */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {language === 'mm' ? 'ရက်ဆက်' : 'Current Streak'}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.streakDays}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {language === 'mm' ? 'ရက်' : 'days'}
            </p>
          </div>

          {/* Goal Met Days */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {language === 'mm' ? 'ပန်းတိုင်ရောက်သည့်ရက်' : 'Goal Met'}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.goalMetDays}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {language === 'mm' ? 'ရက်' : 'days'}
            </p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Calorie Trend Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <h3 className={cn(
              "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2",
              language === 'mm' && 'font-myanmar'
            )}>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              {language === 'mm' ? 'ကယ်လိုရီ လမ်းကြောင်း' : 'Calorie Trend'}
            </h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'mm' ? 'ဂရပ်ဇယား မကြာမီ ထည့်သွင်းမည်' : 'Chart coming soon'}
                </p>
              </div>
            </div>
          </div>

          {/* Macros Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <h3 className={cn(
              "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2",
              language === 'mm' && 'font-myanmar'
            )}>
              <Calendar className="w-5 h-5 text-emerald-600" />
              {language === 'mm' ? 'အာဟာရဓာတ် ဖြန့်ဝေမှု' : 'Macros Distribution'}
            </h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'mm' ? 'ဂရပ်ဇယား မကြာမီ ထည့်သွင်းမည်' : 'Chart coming soon'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
          <h3 className={cn(
            "text-lg font-semibold text-gray-900 dark:text-white mb-4",
            language === 'mm' && 'font-myanmar'
          )}>
            {language === 'mm' ? 'ရက်သတ္တပတ် အကျဉ်းချုပ်' : 'Weekly Summary'}
          </h3>
          <div className="space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {day}
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full flex items-center justify-end px-3"
                    style={{ width: `${Math.random() * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white">
                      {Math.floor(Math.random() * 2000)} kcal
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
