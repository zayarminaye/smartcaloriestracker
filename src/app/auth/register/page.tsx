'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/hooks/use-translation';
import { UserPlus, Loader2, Globe } from 'lucide-react';
import type { Language } from '@/lib/translations';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    display_name: '',
    preferred_language: 'mm' as Language,
    daily_calorie_target: 2000,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.passwordMismatch);
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        display_name: formData.display_name || formData.full_name,
        preferred_language: formData.preferred_language,
        daily_calorie_target: formData.daily_calorie_target,
      });

      if (signUpError) {
        setError(signUpError.message || t.auth.registerError);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || t.auth.registerError);
    } finally {
      setLoading(false);
    }
  };

  const language = formData.preferred_language;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className={`text-2xl font-bold text-gray-800 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {t.auth.registerSuccess}
            </h2>
            <p className={`text-gray-600 ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {language === 'mm' ? 'ခဏစောင့်ပါ၊ Login စာမျက်နှာသို့ ပို့ပေးနေပါသည်...' : 'Redirecting to login...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className={`text-3xl font-bold text-gray-800 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {t.auth.register}
            </h1>
            <p className={`text-gray-600 ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {t.common.appName}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className={`text-red-600 text-sm ${language === 'mm' ? 'font-myanmar' : ''}`}>{error}</p>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="full_name" className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                {t.auth.fullName}
              </label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder={t.auth.fullName}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                {t.auth.email}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder={t.auth.email}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                {t.auth.password}
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder={t.auth.password}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                {t.auth.confirmPassword}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder={t.auth.confirmPassword}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="language" className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                {language === 'mm' ? 'ဘာသာစကား' : 'Language'}
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="language"
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as Language })}
                  className={`w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${language === 'mm' ? 'font-myanmar' : ''}`}
                  disabled={loading}
                >
                  <option value="mm" className="font-myanmar">မြန်မာ (Myanmar)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${language === 'mm' ? 'font-myanmar' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.common.loading}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {t.auth.signUp}
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className={`text-gray-600 text-sm ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {t.auth.alreadyHaveAccount}
              <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                {t.auth.login}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
