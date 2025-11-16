'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/hooks/use-translation';
import {
  Settings as SettingsIcon,
  Bell,
  Globe,
  Moon,
  Sun,
  Lock,
  Trash2,
  Shield,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    goalAlerts: true,
    weeklyReports: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    // Check for dark mode preference
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
  }, []);

  const handleToggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    // You would apply dark mode class to document here
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Save notification settings to database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert(language === 'mm' ? 'သိမ်းဆည်းပြီးပါပြီ' : 'Settings saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert(language === 'mm' ? 'သိမ်းဆည်း၍မရပါ' : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = language === 'mm'
      ? 'သင်၏ အကောင့်ကို အပြီးအပြတ် ဖျက်လိုသည်မှာ သေချာပါသလား? ဤလုပ်ဆောင်ချက်ကို နောက်ပြန်မလှည့်နိုင်ပါ။'
      : 'Are you sure you want to permanently delete your account? This action cannot be undone.';

    if (!confirm(confirmMessage)) {
      return;
    }

    const secondConfirm = language === 'mm'
      ? 'နောက်ဆုံး အတည်ပြုချက်: သင့်ဒေတာအားလုံး ပျက်ပြယ်သွားမည်ဖြစ်ပါသည်။ ဆက်လုပ်မည်လား?'
      : 'Final confirmation: All your data will be permanently deleted. Continue?';

    if (!confirm(secondConfirm)) {
      return;
    }

    try {
      // TODO: Implement account deletion API
      alert(language === 'mm' ? 'အကောင့်ဖျက်မှု လုပ်ဆောင်နေသည်...' : 'Account deletion in progress...');
      // await deleteAccount(user.id);
      // await signOut();
      // router.push('/auth/register');
    } catch (error) {
      console.error('Delete account error:', error);
      alert(language === 'mm' ? 'အကောင့်ဖျက်၍မရပါ' : 'Failed to delete account');
    }
  };

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
            {language === 'mm' ? 'ဆက်တင်များ' : 'Settings'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'mm' ? 'သင်၏ အက်ပ်အပြင်အဆင်များကို စီမံပါ' : 'Manage your app preferences'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Language Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <h3 className={cn(
              "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2",
              language === 'mm' && 'font-myanmar'
            )}>
              <Globe className="w-5 h-5 text-emerald-600" />
              {language === 'mm' ? 'ဘာသာစကား' : 'Language'}
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                  language === 'en'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                )}
              >
                <span className="font-medium text-gray-900 dark:text-white">English</span>
                {language === 'en' && (
                  <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
              <button
                onClick={() => setLanguage('mm')}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between font-myanmar",
                  language === 'mm'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                )}
              >
                <span className="font-medium text-gray-900 dark:text-white">မြန်မာ (Myanmar)</span>
                {language === 'mm' && (
                  <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <h3 className={cn(
              "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2",
              language === 'mm' && 'font-myanmar'
            )}>
              {isDarkMode ? <Moon className="w-5 h-5 text-emerald-600" /> : <Sun className="w-5 h-5 text-emerald-600" />}
              {language === 'mm' ? 'အသွင်အပြင်' : 'Appearance'}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "font-medium text-gray-900 dark:text-white",
                  language === 'mm' && 'font-myanmar'
                )}>
                  {language === 'mm' ? 'မှောင်မိုက်မုဒ်' : 'Dark Mode'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'mm' ? 'မျက်စိ သက်သာစေရန်' : 'Easier on the eyes'}
                </p>
              </div>
              <button
                onClick={handleToggleDarkMode}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-colors",
                  isDarkMode ? 'bg-emerald-600' : 'bg-gray-300'
                )}
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full transition-transform",
                  isDarkMode ? 'translate-x-7' : 'translate-x-1'
                )}></div>
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <h3 className={cn(
              "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2",
              language === 'mm' && 'font-myanmar'
            )}>
              <Bell className="w-5 h-5 text-emerald-600" />
              {language === 'mm' ? 'အကြောင်းကြားချက်များ' : 'Notifications'}
            </h3>
            <div className="space-y-4">
              {/* Meal Reminders */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "font-medium text-gray-900 dark:text-white",
                    language === 'mm' && 'font-myanmar'
                  )}>
                    {language === 'mm' ? 'အစားအသောက် သတိပေးချက်' : 'Meal Reminders'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'mm' ? 'အစားအသောက် မှတ်တမ်းတင်ဖို့ သတိပေးမည်' : 'Remind you to log meals'}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, mealReminders: !notifications.mealReminders })}
                  className={cn(
                    "relative w-14 h-8 rounded-full transition-colors",
                    notifications.mealReminders ? 'bg-emerald-600' : 'bg-gray-300'
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 bg-white rounded-full transition-transform",
                    notifications.mealReminders ? 'translate-x-7' : 'translate-x-1'
                  )}></div>
                </button>
              </div>

              {/* Goal Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "font-medium text-gray-900 dark:text-white",
                    language === 'mm' && 'font-myanmar'
                  )}>
                    {language === 'mm' ? 'ပန်းတိုင် သတိပေးချက်' : 'Goal Alerts'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'mm' ? 'ပန်းတိုင်ရောက်ချိန် အကြောင်းကြားမည်' : 'Notify when you reach goals'}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, goalAlerts: !notifications.goalAlerts })}
                  className={cn(
                    "relative w-14 h-8 rounded-full transition-colors",
                    notifications.goalAlerts ? 'bg-emerald-600' : 'bg-gray-300'
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 bg-white rounded-full transition-transform",
                    notifications.goalAlerts ? 'translate-x-7' : 'translate-x-1'
                  )}></div>
                </button>
              </div>

              {/* Weekly Reports */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "font-medium text-gray-900 dark:text-white",
                    language === 'mm' && 'font-myanmar'
                  )}>
                    {language === 'mm' ? 'အပတ်စဉ် အစီရင်ခံစာ' : 'Weekly Reports'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'mm' ? 'တစ်ပတ်လျှင် တစ်ကြိမ် အကျဉ်းချုပ် ပေးပို့မည်' : 'Send weekly summary emails'}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, weeklyReports: !notifications.weeklyReports })}
                  className={cn(
                    "relative w-14 h-8 rounded-full transition-colors",
                    notifications.weeklyReports ? 'bg-emerald-600' : 'bg-gray-300'
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 bg-white rounded-full transition-transform",
                    notifications.weeklyReports ? 'translate-x-7' : 'translate-x-1'
                  )}></div>
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={cn(
                "w-full mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2",
                isSaving && 'opacity-50 cursor-not-allowed',
                language === 'mm' && 'font-myanmar'
              )}
            >
              <Save className="w-5 h-5" />
              {isSaving ? (language === 'mm' ? 'သိမ်းနေသည်...' : 'Saving...') : (language === 'mm' ? 'သိမ်းဆည်းမည်' : 'Save Settings')}
            </button>
          </div>

          {/* Account Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg">
            <h3 className={cn(
              "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2",
              language === 'mm' && 'font-myanmar'
            )}>
              <Lock className="w-5 h-5 text-emerald-600" />
              {language === 'mm' ? 'အကောင့်' : 'Account'}
            </h3>
            <div className="space-y-3">
              {/* Change Password */}
              <button
                onClick={() => alert(language === 'mm' ? 'လျှို့ဝှက်နံပါတ် ပြောင်းလဲခြင်း မကြာမီ ထည့်သွင်းမည်' : 'Password change coming soon!')}
                className={cn(
                  "w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 transition-all flex items-center gap-3",
                  language === 'mm' && 'font-myanmar'
                )}
              >
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {language === 'mm' ? 'လျှို့ဝှက်နံပါတ် ပြောင်းမည်' : 'Change Password'}
                </span>
              </button>

              {/* Admin Panel (if admin) */}
              {profile.is_admin && (
                <button
                  onClick={() => router.push('/admin')}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 hover:border-emerald-400 transition-all flex items-center gap-3",
                    language === 'mm' && 'font-myanmar'
                  )}
                >
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                    {language === 'mm' ? 'စီမံခန့်ခွဲမှု စာမျက်နှာ' : 'Admin Panel'}
                  </span>
                </button>
              )}

              {/* Delete Account */}
              <button
                onClick={handleDeleteAccount}
                className={cn(
                  "w-full p-4 rounded-xl border-2 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30 hover:border-red-400 transition-all flex items-center gap-3",
                  language === 'mm' && 'font-myanmar'
                )}
              >
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 font-medium">
                  {language === 'mm' ? 'အကောင့် ဖျက်မည်' : 'Delete Account'}
                </span>
              </button>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700 rounded-3xl p-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <h4 className={cn(
                  "font-semibold text-amber-900 dark:text-amber-200 mb-2",
                  language === 'mm' && 'font-myanmar'
                )}>
                  {language === 'mm' ? 'ကိုယ်ရေးကိုယ်တာ လုံခြုံမှု' : 'Privacy & Security'}
                </h4>
                <p className={cn(
                  "text-sm text-amber-800 dark:text-amber-300",
                  language === 'mm' && 'font-myanmar'
                )}>
                  {language === 'mm'
                    ? 'သင်၏ ကျန်းမာရေး အချက်အလက်များကို လုံခြုံစွာ သိမ်းဆည်းထားပါသည်။ သင့်ဒေတာကို တတိယပါတီများနှင့် မျှဝေမည် မဟုတ်ပါ။'
                    : 'Your health data is securely stored and encrypted. We never share your data with third parties.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
