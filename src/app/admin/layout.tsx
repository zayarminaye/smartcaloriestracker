'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/hooks/use-translation';
import { UserMenu } from '@/components/layout/user-menu';
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  Languages,
  Shield,
  Loader2,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t, language } = useTranslation();

  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) {
      router.push('/');
    }
  }, [loading, user, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user || !profile?.is_admin) {
    return null;
  }

  const navItems = [
    {
      href: '/admin',
      label: t.admin.dashboard,
      icon: LayoutDashboard,
    },
    {
      href: '/admin/users',
      label: t.admin.users,
      icon: Users,
    },
    {
      href: '/admin/ingredients',
      label: t.admin.ingredients,
      icon: Package,
    },
    {
      href: '/admin/languages',
      label: t.admin.languages,
      icon: Languages,
    },
    {
      href: '/admin/settings',
      label: t.admin.settings,
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className={`text-xl font-bold text-gray-900 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {t.admin.dashboard}
                </h1>
                <p className={`text-sm text-gray-600 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {t.common.appName}
                </p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${language === 'mm' ? 'font-myanmar' : ''} hover:bg-emerald-50 text-gray-700 hover:text-emerald-600`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Back to App */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${language === 'mm' ? 'font-myanmar' : ''} text-gray-600 hover:bg-gray-100`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">
                {language === 'mm' ? 'အက်ပ်သို့ ပြန်သွားမည်' : 'Back to App'}
              </span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
