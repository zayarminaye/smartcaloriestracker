'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Users, Package, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { ApiUsageCard } from '@/components/admin/api-usage-card';

interface Stats {
  totalUsers: number;
  totalIngredients: number;
  verifiedIngredients: number;
  pendingIngredients: number;
}

export default function AdminDashboard() {
  const { t, language } = useTranslation();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalIngredients: 0,
    verifiedIngredients: 0,
    pendingIngredients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t.admin.totalUsers,
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: t.admin.totalIngredients,
      value: stats.totalIngredients,
      icon: Package,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
    },
    {
      title: language === 'mm' ? 'အတည်ပြုပြီး ပစ္စည်းများ' : 'Verified Ingredients',
      value: stats.verifiedIngredients,
      icon: ShieldCheck,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: t.admin.pendingVerification,
      value: stats.pendingIngredients,
      icon: AlertCircle,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {language === 'mm' ? 'အခြေအနေ အကျဉ်း' : 'Overview'}
        </h2>
        <p className={`text-gray-600 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {language === 'mm' ? 'စနစ် အခြေအနေ နှင့် စာရင်းဇယားများ' : 'System statistics and metrics'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div>
                <p className={`text-gray-600 text-sm mb-1 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '-' : stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {language === 'mm' ? 'မကြာမီ လုပ်ဆောင်မှုများ' : 'Recent Activity'}
        </h3>
        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${language === 'mm' ? 'font-myanmar' : ''}`}>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                {language === 'mm'
                  ? `${stats.pendingIngredients} ပစ္စည်းများသည် အတည်ပြုရန် စောင့်ဆိုင်းနေသည်`
                  : `${stats.pendingIngredients} ingredients pending verification`}
              </p>
            </div>
            <a
              href="/admin/ingredients?filter=pending"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {language === 'mm' ? 'ကြည့်ရန်' : 'View'}
            </a>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          {language === 'mm' ? 'စနစ် အခြေအနေ' : 'System Health'}
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm text-gray-600 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                {language === 'mm' ? 'အတည်ပြုမှု နှုန်း' : 'Verification Rate'}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.totalIngredients > 0
                  ? Math.round((stats.verifiedIngredients / stats.totalIngredients) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    stats.totalIngredients > 0
                      ? (stats.verifiedIngredients / stats.totalIngredients) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Usage */}
      <ApiUsageCard />
    </div>
  );
}
