-- =====================================================
-- AI API Usage Tracking
-- Track Gemini API usage to monitor limits and costs
-- =====================================================

-- Create api_usage table to track all AI API calls
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- API Details
    api_provider TEXT NOT NULL DEFAULT 'gemini', -- 'gemini', 'openai', etc.
    model_name TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    endpoint TEXT NOT NULL, -- 'extract-ingredients', 'estimate-nutrition', etc.

    -- Usage tracking
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_tokens INTEGER DEFAULT 0,
    response_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,

    -- Request metadata
    request_type TEXT, -- 'ingredient_extraction', 'nutrition_estimation', etc.
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    response_time_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- For hourly/daily aggregation
    hour_bucket TIMESTAMPTZ GENERATED ALWAYS AS (date_trunc('hour', created_at)) STORED,
    day_bucket DATE GENERATED ALWAYS AS (DATE(created_at)) STORED
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_day_bucket ON api_usage(day_bucket);
CREATE INDEX IF NOT EXISTS idx_api_usage_hour_bucket ON api_usage(hour_bucket);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint);

-- Create materialized view for daily usage stats
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_api_usage AS
SELECT
    day_bucket,
    api_provider,
    model_name,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE success = TRUE) as successful_requests,
    COUNT(*) FILTER (WHERE success = FALSE) as failed_requests,
    SUM(total_tokens) as total_tokens,
    AVG(response_time_ms) as avg_response_time_ms
FROM api_usage
GROUP BY day_bucket, api_provider, model_name
ORDER BY day_bucket DESC;

-- Index for the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_api_usage
    ON mv_daily_api_usage(day_bucket, api_provider, model_name);

-- Create view for current usage (today and this hour)
CREATE OR REPLACE VIEW v_current_api_usage AS
SELECT
    -- Today's usage
    COUNT(*) FILTER (WHERE day_bucket = CURRENT_DATE) as requests_today,
    COUNT(*) FILTER (WHERE day_bucket = CURRENT_DATE AND success = TRUE) as successful_today,

    -- This hour's usage
    COUNT(*) FILTER (WHERE hour_bucket = date_trunc('hour', NOW())) as requests_this_hour,

    -- This minute's usage (for RPM tracking)
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 minute') as requests_this_minute,

    -- All time stats
    COUNT(*) as total_requests,
    COUNT(DISTINCT user_id) as unique_users,

    -- Latest request
    MAX(created_at) as last_request_at
FROM api_usage;

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_daily_api_usage()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_api_usage;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Admins can see all usage
CREATE POLICY admin_view_all_api_usage ON api_usage
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
        )
    );

-- Users can see their own usage
CREATE POLICY user_view_own_api_usage ON api_usage
    FOR SELECT
    USING (user_id = auth.uid());

-- Service role can insert usage records
CREATE POLICY service_insert_api_usage ON api_usage
    FOR INSERT
    WITH CHECK (TRUE);

-- Add API usage limit settings to system_settings
INSERT INTO system_settings (key, value, description)
VALUES
    ('gemini_rpm_limit', '15', 'Gemini API requests per minute limit (Free tier)'),
    ('gemini_rpd_limit', '1500', 'Gemini API requests per day limit (Free tier)'),
    ('show_usage_to_users', 'true', 'Whether to show API usage stats to regular users'),
    ('enable_usage_warnings', 'true', 'Show warnings when approaching API limits')
ON CONFLICT (key) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE api_usage IS 'Tracks all AI API calls for monitoring usage limits and costs';
COMMENT ON COLUMN api_usage.request_tokens IS 'Number of tokens in the request (if available)';
COMMENT ON COLUMN api_usage.response_tokens IS 'Number of tokens in the response (if available)';
COMMENT ON COLUMN api_usage.endpoint IS 'Which AI function was called (extract-ingredients, estimate-nutrition, etc.)';
COMMENT ON VIEW v_current_api_usage IS 'Real-time view of current API usage for rate limit monitoring';
