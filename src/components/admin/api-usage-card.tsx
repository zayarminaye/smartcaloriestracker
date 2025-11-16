'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Activity, Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { getUsageWarningLevel } from '@/lib/api-usage-tracker';

interface UsageStats {
  current: {
    requests_today: number;
    successful_today: number;
    requests_this_hour: number;
    requests_this_minute: number;
    total_requests: number;
    unique_users: number;
    rpm_limit: number;
    rpd_limit: number;
    rpm_percentage: number;
    rpd_percentage: number;
  };
  limits: {
    rpm: number;
    rpd: number;
    tier: string;
  };
}

export function ApiUsageCard() {
  const { language } = useTranslation();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsageStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/admin/usage');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const rpmWarning = getUsageWarningLevel(stats.current.rpm_percentage);
  const rpdWarning = getUsageWarningLevel(stats.current.rpd_percentage);

  const getWarningColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-emerald-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold text-gray-900 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                {language === 'mm' ? 'AI API အသုံးပြုမှု' : 'AI API Usage'}
              </h3>
              <p className={`text-sm text-gray-600 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                Gemini 2.5 Flash • {stats.limits.tier} Tier
              </p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            rpdWarning === 'none' ? 'bg-green-100 text-green-700' : getWarningColor(rpdWarning)
          }`}>
            {rpdWarning === 'critical' ? (language === 'mm' ? 'ကန့်သတ်ချက် ပြည့်' : 'Limit Reached') :
             rpdWarning === 'high' ? (language === 'mm' ? 'မကြာမီ ပြည့်' : 'Near Limit') :
             language === 'mm' ? 'ပုံမှန်' : 'Healthy'}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-6 space-y-6">
        {/* Requests Per Minute */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className={`text-sm font-medium text-gray-700 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                {language === 'mm' ? 'တစ်မိနစ်လျှင် တောင်းဆိုမှု' : 'Requests Per Minute (RPM)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {stats.current.requests_this_minute} / {stats.limits.rpm}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getWarningColor(rpmWarning)}`}>
                {stats.current.rpm_percentage}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(stats.current.rpm_percentage)}`}
              style={{ width: `${Math.min(100, stats.current.rpm_percentage)}%` }}
            />
          </div>
        </div>

        {/* Requests Per Day */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className={`text-sm font-medium text-gray-700 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                {language === 'mm' ? 'ယနေ့ တောင်းဆိုမှု' : 'Requests Today (RPD)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {stats.current.requests_today} / {stats.limits.rpd}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getWarningColor(rpdWarning)}`}>
                {stats.current.rpd_percentage}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(stats.current.rpd_percentage)}`}
              style={{ width: `${Math.min(100, stats.current.rpd_percentage)}%` }}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.current.successful_today}
            </div>
            <div className={`text-xs text-gray-600 mt-1 ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {language === 'mm' ? 'အောင်မြင်သော' : 'Successful'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.current.total_requests.toLocaleString()}
            </div>
            <div className={`text-xs text-gray-600 mt-1 ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {language === 'mm' ? 'စုစုပေါင်း' : 'Total'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.current.unique_users}
            </div>
            <div className={`text-xs text-gray-600 mt-1 ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {language === 'mm' ? 'အသုံးပြုသူများ' : 'Users'}
            </div>
          </div>
        </div>

        {/* Warning Messages */}
        {(rpmWarning === 'high' || rpmWarning === 'critical' || rpdWarning === 'high' || rpdWarning === 'critical') && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className={language === 'mm' ? 'font-myanmar' : ''}>
                <p className="text-sm font-medium text-orange-900">
                  {language === 'mm' ? 'သတိပြုရန်' : 'Warning'}
                </p>
                <p className="text-sm text-orange-800 mt-1">
                  {language === 'mm'
                    ? 'API အသုံးပြုမှု ကန့်သတ်ချက် နီးကပ်နေပါသည်။ ကျေးဇူးပြု၍ အသုံးပြုမှု လျှော့ချပါ သို့မဟုတ် Pay-as-you-go သို့ အဆင့်မြှင့်တင်ရန် စဉ်းစားပါ။'
                    : 'Approaching API usage limits. Please reduce usage or consider upgrading to Pay-as-you-go tier.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className={`text-xs text-gray-500 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {language === 'mm'
            ? 'အခမဲ့ အဆင့်: တစ်မိနစ်လျှင် ၁၅ ကြိမ်၊ တစ်ရက်လျှင် ၁၅၀၀ ကြိမ်'
            : 'Free tier: 15 RPM, 1,500 RPD • Pay-as-you-go: 1,000 RPM, 4,000 RPD'}
        </div>
      </div>
    </div>
  );
}
