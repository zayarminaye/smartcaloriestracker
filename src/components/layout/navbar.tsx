'use client';

import { usePathname, useRouter } from 'next/navigation';
import { UserMenu } from './user-menu';
import { useTranslation } from '@/hooks/use-translation';
import {
  Home,
  Utensils,
  BarChart3,
  Calendar,
  User,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, t } = useTranslation();
  const { profile } = useAuth();

  const navItems = [
    {
      href: '/',
      label: language === 'mm' ? 'မူလ' : 'Dashboard',
      icon: Home,
    },
    {
      href: '/add-meal',
      label: language === 'mm' ? 'အစားအသောက် ထည့်' : 'Log Meal',
      icon: Utensils,
    },
    {
      href: '/reports',
      label: language === 'mm' ? 'အစီရင်ခံစာ' : 'Reports',
      icon: BarChart3,
    },
    {
      href: '/history',
      label: language === 'mm' ? 'မှတ်တမ်း' : 'History',
      icon: Calendar,
    },
    {
      href: '/profile',
      label: language === 'mm' ? 'ပရိုဖိုင်' : 'Profile',
      icon: User,
    },
  ];

  // Add admin link if user is admin
  if (profile?.is_admin) {
    navItems.push({
      href: '/admin',
      label: language === 'mm' ? 'စီမံခန့်ခွဲ' : 'Admin',
      icon: Shield,
    });
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div
            onClick={() => router.push('/')}
            className="cursor-pointer"
          >
            <h1 className={cn(
              "text-2xl font-bold text-gray-900 dark:text-white",
              language === 'mm' && 'font-myanmar'
            )}>
              {language === 'mm' ? 'ကယ်လိုရီ ခြေရာခံ' : 'Calorie Tracker'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'mm' ? 'မြန်မာ့အစားအသောက် ခြေရာခံ' : 'Myanmar Food Tracker'}
            </p>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    language === 'mm' && 'font-myanmar',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
