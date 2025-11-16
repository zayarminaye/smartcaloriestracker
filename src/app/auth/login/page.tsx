'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/hooks/use-translation';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t, language } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message || t.auth.loginError);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || t.auth.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className={`text-3xl font-bold text-gray-800 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {t.auth.login}
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                {t.auth.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder={t.auth.password}
                disabled={loading}
              />
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
                  <LogIn className="w-5 h-5" />
                  {t.auth.signIn}
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className={`text-gray-600 text-sm ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {t.auth.dontHaveAccount}
              <Link href="/auth/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                {t.auth.register}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
