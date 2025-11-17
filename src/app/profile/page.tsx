'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/hooks/use-translation';
import {
  User,
  Mail,
  Target,
  Globe,
  Save,
  Shield,
  Award,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    daily_calorie_target: 2000,
    daily_protein_target_g: 150,
    daily_fat_target_g: 67,
    daily_carbs_target_g: 250,
    preferred_language: 'mm' as 'mm' | 'en',
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        display_name: profile.display_name || '',
        daily_calorie_target: profile.daily_calorie_target || 2000,
        daily_protein_target_g: profile.daily_protein_target_g || 150,
        daily_fat_target_g: profile.daily_fat_target_g || 67,
        daily_carbs_target_g: profile.daily_carbs_target_g || 250,
        preferred_language: profile.preferred_language || 'mm',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();

      console.log('Updating profile for user:', user.id);
      console.log('Update data:', {
        full_name: formData.full_name,
        display_name: formData.display_name,
        daily_calorie_target: formData.daily_calorie_target,
        daily_protein_target_g: formData.daily_protein_target_g,
        daily_fat_target_g: formData.daily_fat_target_g,
        daily_carbs_target_g: formData.daily_carbs_target_g,
        preferred_language: formData.preferred_language,
      });

      const { data, error } = await (supabase
        .from('users') as any)
        .update({
          full_name: formData.full_name,
          display_name: formData.display_name,
          daily_calorie_target: formData.daily_calorie_target,
          daily_protein_target_g: formData.daily_protein_target_g,
          daily_fat_target_g: formData.daily_fat_target_g,
          daily_carbs_target_g: formData.daily_carbs_target_g,
          preferred_language: formData.preferred_language,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);

      // Update language if changed
      if (formData.preferred_language !== language) {
        setLanguage(formData.preferred_language);
      }

      // Refresh profile
      await refreshProfile();

      setIsEditing(false);
      alert(language === 'mm' ? 'သိမ်းဆည်းပြီးပါပြီ' : 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Save error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      });
      const errorMsg = error?.message || 'Unknown error';
      alert(
        language === 'mm'
          ? `သိမ်းဆည်း၍မရပါ: ${errorMsg}`
          : `Failed to update profile: ${errorMsg}`
      );
    } finally {
      setIsSaving(false);
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
            {language === 'mm' ? 'ပရိုဖိုင်' : 'Profile'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'mm' ? 'သင်၏ အချက်အလက်များနှင့် ရည်မှန်းချက်များကို စီမံပါ' : 'Manage your information and goals'}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-500 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-4">
              {profile.display_name?.[0]?.toUpperCase() || profile.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <h2 className={cn(
              "text-2xl font-bold text-gray-900 dark:text-white",
              language === 'mm' && 'font-myanmar'
            )}>
              {profile.display_name || profile.full_name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
            {profile.is_admin && (
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm rounded-full">
                <Shield className="w-4 h-4" />
                Administrator
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Flame className="w-5 h-5" />
                <span className="text-2xl font-bold">{profile.streak_days}</span>
              </div>
              <p className={cn(
                "text-xs text-gray-600 dark:text-gray-400",
                language === 'mm' && 'font-myanmar'
              )}>
                {language === 'mm' ? 'ရက်ဆက်' : 'Day Streak'}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                <Award className="w-5 h-5" />
                <span className="text-2xl font-bold">{profile.level}</span>
              </div>
              <p className={cn(
                "text-xs text-gray-600 dark:text-gray-400",
                language === 'mm' && 'font-myanmar'
              )}>
                {language === 'mm' ? 'အဆင့်' : 'Level'}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-bold">{profile.points}</span>
              </div>
              <p className={cn(
                "text-xs text-gray-600 dark:text-gray-400",
                language === 'mm' && 'font-myanmar'
              )}>
                {language === 'mm' ? 'ရမှတ်' : 'Points'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className={cn(
              "text-xl font-semibold text-gray-900 dark:text-white",
              language === 'mm' && 'font-myanmar'
            )}>
              {language === 'mm' ? 'ပရိုဖိုင် အချက်အလက်' : 'Profile Information'}
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={cn(
                  "px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors",
                  language === 'mm' && 'font-myanmar'
                )}
              >
                {language === 'mm' ? 'ပြင်ဆင်မည်' : 'Edit'}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className={cn(
                "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                language === 'mm' && 'font-myanmar'
              )}>
                <User className="w-4 h-4 inline mr-2" />
                {language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!isEditing}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                  !isEditing && 'bg-gray-50 dark:bg-gray-900',
                  language === 'mm' && 'font-myanmar'
                )}
              />
            </div>

            {/* Display Name */}
            <div>
              <label className={cn(
                "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                language === 'mm' && 'font-myanmar'
              )}>
                <User className="w-4 h-4 inline mr-2" />
                {language === 'mm' ? 'ပြသမည့်အမည်' : 'Display Name'}
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                disabled={!isEditing}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                  !isEditing && 'bg-gray-50 dark:bg-gray-900',
                  language === 'mm' && 'font-myanmar'
                )}
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className={cn(
                "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                language === 'mm' && 'font-myanmar'
              )}>
                <Mail className="w-4 h-4 inline mr-2" />
                {language === 'mm' ? 'အီးမေးလ်' : 'Email'}
              </label>
              <input
                type="email"
                value={profile.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-500"
              />
            </div>

            {/* Language Preference */}
            <div>
              <label className={cn(
                "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                language === 'mm' && 'font-myanmar'
              )}>
                <Globe className="w-4 h-4 inline mr-2" />
                {language === 'mm' ? 'ဘာသာစကား' : 'Preferred Language'}
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as 'mm' | 'en' })}
                disabled={!isEditing}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                  !isEditing && 'bg-gray-50 dark:bg-gray-900',
                  language === 'mm' && 'font-myanmar'
                )}
              >
                <option value="mm">မြန်မာ (Myanmar)</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Daily Calorie Target */}
            <div>
              <label className={cn(
                "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                language === 'mm' && 'font-myanmar'
              )}>
                <Target className="w-4 h-4 inline mr-2" />
                {language === 'mm' ? 'နေ့စဉ် ကယ်လိုရီ ပန်းတိုင်' : 'Daily Calorie Target'}
              </label>
              <input
                type="number"
                value={formData.daily_calorie_target}
                onChange={(e) => setFormData({ ...formData, daily_calorie_target: parseInt(e.target.value) || 2000 })}
                disabled={!isEditing}
                min="500"
                max="5000"
                step="50"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                  !isEditing && 'bg-gray-50 dark:bg-gray-900'
                )}
              />
            </div>

            {/* Macro Targets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={cn(
                  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                  language === 'mm' && 'font-myanmar'
                )}>
                  {language === 'mm' ? 'ပရိုတိန်း (g)' : 'Protein (g)'}
                </label>
                <input
                  type="number"
                  value={formData.daily_protein_target_g}
                  onChange={(e) => setFormData({ ...formData, daily_protein_target_g: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                    !isEditing && 'bg-gray-50 dark:bg-gray-900'
                  )}
                />
              </div>

              <div>
                <label className={cn(
                  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                  language === 'mm' && 'font-myanmar'
                )}>
                  {language === 'mm' ? 'အဆီ (g)' : 'Fat (g)'}
                </label>
                <input
                  type="number"
                  value={formData.daily_fat_target_g}
                  onChange={(e) => setFormData({ ...formData, daily_fat_target_g: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                    !isEditing && 'bg-gray-50 dark:bg-gray-900'
                  )}
                />
              </div>

              <div>
                <label className={cn(
                  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                  language === 'mm' && 'font-myanmar'
                )}>
                  {language === 'mm' ? 'ကာဗွန်ဟိုက်ဒရိတ် (g)' : 'Carbs (g)'}
                </label>
                <input
                  type="number"
                  value={formData.daily_carbs_target_g}
                  onChange={(e) => setFormData({ ...formData, daily_carbs_target_g: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                    !isEditing && 'bg-gray-50 dark:bg-gray-900'
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2",
                    isSaving && 'opacity-50 cursor-not-allowed',
                    language === 'mm' && 'font-myanmar'
                  )}
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? (language === 'mm' ? 'သိမ်းနေသည်...' : 'Saving...') : (language === 'mm' ? 'သိမ်းဆည်းမည်' : 'Save Changes')}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    if (profile) {
                      setFormData({
                        full_name: profile.full_name || '',
                        display_name: profile.display_name || '',
                        daily_calorie_target: profile.daily_calorie_target || 2000,
                        daily_protein_target_g: profile.daily_protein_target_g || 150,
                        daily_fat_target_g: profile.daily_fat_target_g || 67,
                        daily_carbs_target_g: profile.daily_carbs_target_g || 250,
                        preferred_language: profile.preferred_language || 'mm',
                      });
                    }
                  }}
                  disabled={isSaving}
                  className={cn(
                    "px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",
                    isSaving && 'opacity-50 cursor-not-allowed',
                    language === 'mm' && 'font-myanmar'
                  )}
                >
                  {language === 'mm' ? 'ပယ်ဖျက်မည်' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
