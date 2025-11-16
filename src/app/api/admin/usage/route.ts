import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUsageStats, getUsagePercentage } from '@/lib/api-usage-tracker';

export async function GET() {
  try {
    const supabase = createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await (supabase
      .from('users') as any)
      .select('is_admin')
      .eq('id', user.id)
      .single<{ is_admin: boolean }>();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get usage stats
    const stats = await getUsageStats();

    // Calculate limits and percentages
    const RPM_LIMIT = 15;
    const RPD_LIMIT = 1500;

    const current = stats.current || {
      requests_today: 0,
      successful_today: 0,
      requests_this_hour: 0,
      requests_this_minute: 0,
      total_requests: 0,
      unique_users: 0,
    };

    return NextResponse.json({
      current: {
        ...current,
        rpm_limit: RPM_LIMIT,
        rpd_limit: RPD_LIMIT,
        rpm_percentage: getUsagePercentage(current.requests_this_minute || 0, RPM_LIMIT),
        rpd_percentage: getUsagePercentage(current.requests_today || 0, RPD_LIMIT),
      },
      daily: stats.daily,
      limits: {
        rpm: RPM_LIMIT,
        rpd: RPD_LIMIT,
        tier: 'Free',
      },
    });
  } catch (error: any) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage stats', message: error.message },
      { status: 500 }
    );
  }
}
