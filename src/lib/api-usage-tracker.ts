import { createClient } from '@/lib/supabase/server';

export interface ApiUsageRecord {
  api_provider?: string;
  model_name?: string;
  endpoint: string;
  user_id?: string | null;
  request_tokens?: number;
  response_tokens?: number;
  total_tokens?: number;
  request_type?: string;
  success: boolean;
  error_message?: string;
  response_time_ms?: number;
}

/**
 * Track AI API usage in the database
 */
export async function trackApiUsage(record: ApiUsageRecord) {
  try {
    const supabase = createClient();

    await supabase.from('api_usage').insert({
      api_provider: record.api_provider || 'gemini',
      model_name: record.model_name || 'gemini-2.5-flash',
      endpoint: record.endpoint,
      user_id: record.user_id || null,
      request_tokens: record.request_tokens || 0,
      response_tokens: record.response_tokens || 0,
      total_tokens: record.total_tokens || 0,
      request_type: record.request_type,
      success: record.success,
      error_message: record.error_message,
      response_time_ms: record.response_time_ms,
    });
  } catch (error) {
    // Don't throw - usage tracking should not break the main flow
    console.error('Failed to track API usage:', error);
  }
}

/**
 * Check if we're within API rate limits
 * Returns { allowed: boolean, reason?: string }
 */
export async function checkApiRateLimit(): Promise<{ allowed: boolean; reason?: string; usage?: any }> {
  try {
    const supabase = createClient();

    // Get current usage stats
    const { data: usage } = await supabase
      .from('v_current_api_usage')
      .select('*')
      .single();

    if (!usage) {
      return { allowed: true };
    }

    // Get rate limits from settings (with defaults)
    const RPM_LIMIT = 15; // requests per minute
    const RPD_LIMIT = 1500; // requests per day (free tier)

    // Check RPM limit
    if (usage.requests_this_minute >= RPM_LIMIT) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${RPM_LIMIT} requests per minute. Please wait.`,
        usage,
      };
    }

    // Check RPD limit
    if (usage.requests_today >= RPD_LIMIT) {
      return {
        allowed: false,
        reason: `Daily limit exceeded: ${RPD_LIMIT} requests per day. Please try again tomorrow.`,
        usage,
      };
    }

    return { allowed: true, usage };
  } catch (error) {
    console.error('Failed to check rate limit:', error);
    // Allow the request if we can't check limits (fail open)
    return { allowed: true };
  }
}

/**
 * Get usage statistics
 */
export async function getUsageStats() {
  try {
    const supabase = createClient();

    const [currentUsage, dailyUsage] = await Promise.all([
      supabase.from('v_current_api_usage').select('*').single(),
      supabase
        .from('mv_daily_api_usage')
        .select('*')
        .order('day_bucket', { ascending: false })
        .limit(30),
    ]);

    return {
      current: currentUsage.data,
      daily: dailyUsage.data || [],
    };
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    return { current: null, daily: [] };
  }
}

/**
 * Get usage percentage for display
 */
export function getUsagePercentage(current: number, limit: number): number {
  return Math.min(100, Math.round((current / limit) * 100));
}

/**
 * Get usage warning level (none, low, medium, high, critical)
 */
export function getUsageWarningLevel(percentage: number): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  if (percentage >= 100) return 'critical';
  if (percentage >= 90) return 'high';
  if (percentage >= 75) return 'medium';
  if (percentage >= 50) return 'low';
  return 'none';
}
