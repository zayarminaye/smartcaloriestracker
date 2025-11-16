# API Usage Tracking System

## Overview

The Smart Calorie Tracker uses Google's Gemini 2.5 Flash model for AI-powered ingredient extraction and nutrition estimation. To monitor costs and ensure we stay within rate limits, we've implemented a comprehensive usage tracking system.

## Gemini API Limits

### Free Tier (Current)
- **RPM (Requests Per Minute):** 15
- **RPD (Requests Per Day):** 1,500
- **Cost:** Free

### Pay-as-you-go Tier
- **RPM:** 1,000
- **RPD:** 4,000
- **Cost:** Variable based on usage

## How Usage Tracking Works

### 1. Database Tracking

All AI API calls are logged to the `api_usage` table with the following information:

- **API Provider:** gemini
- **Model Name:** gemini-2.5-flash
- **Endpoint:** extract-ingredients, estimate-nutrition, etc.
- **User ID:** Who made the request (if authenticated)
- **Timestamps:** When the request was made
- **Success/Failure:** Whether the request succeeded
- **Response Time:** How long the request took

### 2. Rate Limit Checks

Before each AI API call, the system checks:

```typescript
// Check current usage
const { allowed, reason, usage } = await checkApiRateLimit();

if (!allowed) {
  // Return 429 Too Many Requests error
  return res.status(429).json({ error: reason });
}
```

### 3. Real-time Monitoring

The system provides real-time views:

- **v_current_api_usage**: Current minute, hour, and day usage
- **mv_daily_api_usage**: Historical daily usage stats (materialized view)

## Viewing Usage Statistics

### For Admins

1. Navigate to the Admin Dashboard (`/admin`)
2. Scroll to the "AI API Usage" card
3. View real-time statistics:
   - Requests this minute (RPM)
   - Requests today (RPD)
   - Success rate
   - Total requests
   - Unique users

### Via API

Admins can query usage stats via:

```
GET /api/admin/usage
```

Response:
```json
{
  "current": {
    "requests_today": 145,
    "successful_today": 142,
    "requests_this_hour": 23,
    "requests_this_minute": 2,
    "total_requests": 1523,
    "unique_users": 45,
    "rpm_limit": 15,
    "rpd_limit": 1500,
    "rpm_percentage": 13,
    "rpd_percentage": 9
  },
  "daily": [...],
  "limits": {
    "rpm": 15,
    "rpd": 1500,
    "tier": "Free"
  }
}
```

## Warning Levels

The system shows color-coded warnings based on usage percentage:

- **Green (0-49%):** Healthy usage
- **Blue (50-74%):** Low warning
- **Yellow (75-89%):** Medium warning
- **Orange (90-99%):** High warning - consider reducing usage
- **Red (100%+):** Critical - limit reached, requests will be blocked

## What Happens When Limits Are Reached?

### RPM Limit (15 requests/minute)

If the RPM limit is reached, subsequent requests within that minute will receive:

```json
{
  "error": "Rate limit exceeded",
  "message": "Rate limit exceeded: 15 requests per minute. Please wait.",
  "usage": { ... }
}
```

Users should wait until the next minute to retry.

### RPD Limit (1,500 requests/day)

If the RPD limit is reached, all requests for the rest of the day will be blocked with:

```json
{
  "error": "Rate limit exceeded",
  "message": "Daily limit exceeded: 1,500 requests per day. Please try again tomorrow.",
  "usage": { ... }
}
```

## Optimization Strategies

To stay within limits:

1. **Cache Results:** Store frequently requested ingredient data in the database
2. **Batch Requests:** Combine multiple ingredient lookups when possible
3. **Use Database First:** Always search the ingredients database before calling AI
4. **Verify AI Results:** Admin verification converts AI estimates to database entries
5. **User Education:** Encourage users to select from existing ingredients

## Database Schema

### api_usage Table

```sql
CREATE TABLE api_usage (
    id UUID PRIMARY KEY,
    api_provider TEXT NOT NULL DEFAULT 'gemini',
    model_name TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    endpoint TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    request_tokens INTEGER DEFAULT 0,
    response_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    request_type TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    hour_bucket TIMESTAMPTZ,
    day_bucket DATE
);
```

### Views

- **v_current_api_usage:** Real-time usage counters
- **mv_daily_api_usage:** Daily aggregated stats (materialized, refresh needed)

## Upgrading to Pay-as-you-go

If you need higher limits:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Navigate to API settings
3. Enable billing
4. Update `RPM_LIMIT` and `RPD_LIMIT` in `/src/lib/api-usage-tracker.ts`
5. Update the tier display in the admin dashboard

## Monitoring Best Practices

1. **Check Daily:** Review usage stats in admin dashboard daily
2. **Set Alerts:** Consider setting up alerts at 75% and 90% usage
3. **Analyze Patterns:** Use the daily usage view to identify usage spikes
4. **User Behavior:** Monitor which users are making the most requests
5. **Error Rates:** High error rates may indicate issues with the AI prompts

## Maintenance

### Refresh Materialized View

The daily stats materialized view should be refreshed regularly:

```sql
SELECT refresh_daily_api_usage();
```

Consider setting up a cron job to run this daily.

### Cleanup Old Data

To prevent the table from growing too large, periodically archive or delete old usage records:

```sql
-- Archive records older than 90 days
DELETE FROM api_usage WHERE created_at < NOW() - INTERVAL '90 days';
```

## Questions?

For questions about API usage tracking, contact the development team or file an issue in the repository.
