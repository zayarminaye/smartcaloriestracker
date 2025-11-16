'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/hooks/use-translation';
import {
  User,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
  Globe,
} from 'lucide-react';

export function UserMenu() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { t, language, toggleLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user || !profile) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className={`p-2 rounded-lg hover:bg-gray-100 transition ${language === 'mm' ? 'font-myanmar' : ''}`}
          title={language === 'mm' ? 'ဘာသာစကား' : 'Language'}
        >
          <Globe className="w-5 h-5" />
        </button>
        <button
          onClick={() => router.push('/auth/login')}
          className={`px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition ${language === 'mm' ? 'font-myanmar' : ''}`}
        >
          {t.auth.login}
        </button>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold">
          {profile.display_name?.[0]?.toUpperCase() || profile.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className={`hidden md:block text-left ${language === 'mm' ? 'font-myanmar' : ''}`}>
          <div className="text-sm font-medium text-gray-700">
            {profile.display_name || profile.full_name || 'User'}
          </div>
          {profile.is_admin && (
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Admin
            </div>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className={`p-4 border-b border-gray-200 ${language === 'mm' ? 'font-myanmar' : ''}`}>
              <div className="font-medium text-gray-900">
                {profile.display_name || profile.full_name}
              </div>
              <div className="text-sm text-gray-500">{profile.email}</div>
              {profile.is_admin && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                  <Shield className="w-3 h-3" />
                  Administrator
                </div>
              )}
            </div>

            <div className="py-2">
              {profile.is_admin && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/admin');
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition ${language === 'mm' ? 'font-myanmar' : ''}`}
                >
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{t.admin.dashboard}</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/profile');
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition ${language === 'mm' ? 'font-myanmar' : ''}`}
              >
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {language === 'mm' ? 'ပရိုဖိုင်' : 'Profile'}
                </span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings');
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition ${language === 'mm' ? 'font-myanmar' : ''}`}
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{t.admin.settings}</span>
              </button>

              <button
                onClick={toggleLanguage}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition ${language === 'mm' ? 'font-myanmar' : ''}`}
              >
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {language === 'mm' ? 'English' : 'မြန်မာ'}
                </span>
              </button>
            </div>

            <div className="border-t border-gray-200 py-2">
              <button
                onClick={handleSignOut}
                className={`w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 transition ${language === 'mm' ? 'font-myanmar' : ''}`}
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{t.auth.logout}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
