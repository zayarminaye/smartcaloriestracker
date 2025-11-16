'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/contexts/auth-context';
import {
  Home,
  Utensils,
  BarChart3,
  User,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useTranslation();
  const { profile } = useAuth();

  const navItems = [
    {
      href: '/',
      label: language === 'mm' ? 'မူလ' : 'Home',
      icon: Home,
    },
    {
      href: '/add-meal',
      label: language === 'mm' ? 'ထည့်မည်' : 'Log',
      icon: Utensils,
    },
    {
      href: '/reports',
      label: language === 'mm' ? 'အစီရင်ခံ' : 'Reports',
      icon: BarChart3,
    },
    {
      href: '/profile',
      label: language === 'mm' ? 'ကျွန်ုပ်' : 'Profile',
      icon: User,
    },
  ];

  // Add admin button for admin users
  if (profile?.is_admin) {
    navItems.push({
      href: '/admin',
      label: language === 'mm' ? 'စီမံ' : 'Admin',
      icon: Shield,
    });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-pb">
      <div className="grid grid-cols-4 md:grid-cols-5 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                language === 'mm' && 'font-myanmar',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon className={cn(
                "w-6 h-6",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
