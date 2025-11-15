-- =====================================================
-- Myanmar Smart Calorie Tracker - Database Schema
-- Designed for scalability, performance, and AI features
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For future AI embeddings

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Ingredients master table (scalable to 100k+ items)
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Names (bilingual)
    name_english TEXT NOT NULL,
    name_myanmar TEXT NOT NULL,

    -- Categorization
    category TEXT NOT NULL, -- 'grains', 'meat', 'vegetables', etc.
    subcategory TEXT,

    -- Base nutritional data (per 100g raw)
    calories_per_100g DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(6,2) NOT NULL DEFAULT 0,
    fat_g DECIMAL(6,2) NOT NULL DEFAULT 0,
    carbs_g DECIMAL(6,2) NOT NULL DEFAULT 0,
    fiber_g DECIMAL(6,2) NOT NULL DEFAULT 0,

    -- Additional micronutrients (for future expansion)
    sodium_mg DECIMAL(8,2),
    calcium_mg DECIMAL(8,2),
    iron_mg DECIMAL(8,2),
    vitamin_a_iu DECIMAL(10,2),
    vitamin_c_mg DECIMAL(8,2),

    -- Data quality metadata
    data_source TEXT NOT NULL, -- 'database', 'api_usda', 'api_nutritionix', 'user_submitted', 'ai_estimated'
    confidence_score DECIMAL(3,2) DEFAULT 1.00, -- 0.00 to 1.00
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID, -- Reference to admin user
    verified_at TIMESTAMPTZ,

    -- Search optimization
    search_vector_en tsvector,
    search_vector_mm tsvector,

    -- Popularity tracking (for auto-suggestions)
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- Additional metadata
    notes TEXT,
    image_url TEXT,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- Cooking methods and their calorie multipliers
CREATE TABLE cooking_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,

    method_name TEXT NOT NULL, -- 'raw', 'boiled', 'fried', 'grilled', 'curry', etc.

    -- Nutritional adjustments
    calorie_multiplier DECIMAL(4,2) DEFAULT 1.00,
    calories_per_100g_cooked DECIMAL(8,2),
    water_content_percent DECIMAL(5,2),

    -- Oil/fat absorption for fried items
    added_fat_g DECIMAL(6,2) DEFAULT 0,

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique cooking method per ingredient
    UNIQUE(ingredient_id, method_name)
);

-- =====================================================
-- USER MANAGEMENT
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Auth (managed by Supabase Auth)
    email TEXT UNIQUE,
    phone TEXT UNIQUE,

    -- Profile
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,

    -- Health profile
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    height_cm DECIMAL(5,2),
    current_weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),

    -- Nutrition goals
    daily_calorie_target INTEGER DEFAULT 2000,
    daily_protein_target_g DECIMAL(6,2),
    daily_fat_target_g DECIMAL(6,2),
    daily_carbs_target_g DECIMAL(6,2),

    -- Activity level (for calorie calculation)
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),

    -- Preferences
    dietary_preferences JSONB DEFAULT '[]'::jsonb, -- ['vegetarian', 'halal', etc.]
    allergies JSONB DEFAULT '[]'::jsonb,
    preferred_language TEXT DEFAULT 'mm', -- 'mm' or 'en'

    -- Gamification
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_log_date DATE,

    -- Settings
    notifications_enabled BOOLEAN DEFAULT TRUE,
    reminder_times JSONB DEFAULT '["08:00", "12:00", "19:00"]'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- MEAL LOGGING
-- =====================================================

CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Meal metadata
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
    eaten_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Optional enrichment
    meal_name TEXT, -- "Mohinga", "Chicken Curry with Rice", etc.
    notes TEXT,
    photo_url TEXT,
    location TEXT, -- "Home", "Restaurant Name", etc.

    -- Calculated totals (denormalized for performance)
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein_g DECIMAL(6,2) DEFAULT 0,
    total_fat_g DECIMAL(6,2) DEFAULT 0,
    total_carbs_g DECIMAL(6,2) DEFAULT 0,
    total_fiber_g DECIMAL(6,2) DEFAULT 0,

    -- AI/Template source tracking
    created_from_template_id UUID, -- Reference to dish_templates
    ai_generated BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE meal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    cooking_method_id UUID REFERENCES cooking_methods(id),

    -- Portion details
    portion_grams DECIMAL(8,2) NOT NULL,
    portion_description TEXT, -- "1 cup", "1 medium piece", etc.

    -- Calculated nutrition (denormalized)
    calories DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(6,2) NOT NULL,
    fat_g DECIMAL(6,2) NOT NULL,
    carbs_g DECIMAL(6,2) NOT NULL,
    fiber_g DECIMAL(6,2) NOT NULL,

    -- Confidence tracking
    confidence_level TEXT CHECK (confidence_level IN ('exact', 'estimated', 'approximate', 'guessed')),
    ai_suggested BOOLEAN DEFAULT FALSE,
    user_confirmed BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DISH TEMPLATES (Smart One-Click Logging)
-- =====================================================

CREATE TABLE dish_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Template info
    name_english TEXT NOT NULL,
    name_myanmar TEXT NOT NULL,
    category TEXT, -- 'curry', 'salad', 'soup', 'noodles', etc.
    description TEXT,
    image_url TEXT,

    -- Typical nutrition (pre-calculated)
    typical_calories DECIMAL(8,2),
    typical_protein_g DECIMAL(6,2),
    typical_fat_g DECIMAL(6,2),
    typical_carbs_g DECIMAL(6,2),

    -- Template ingredients (JSONB for flexibility)
    ingredients JSONB NOT NULL,
    /* Example structure:
    [
        {
            "ingredient_id": "uuid",
            "cooking_method_id": "uuid",
            "portion_grams": 150,
            "portion_description": "1 cup",
            "optional": false
        }
    ]
    */

    -- Popularity & ranking
    usage_count INTEGER DEFAULT 0,
    popularity_score INTEGER DEFAULT 0,
    user_rating DECIMAL(3,2),

    -- Ownership
    created_by UUID, -- NULL for system templates, user_id for user-created
    is_public BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,

    -- Search
    search_vector_en tsvector,
    search_vector_mm tsvector,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER CONTRIBUTIONS (Crowdsourcing)
-- =====================================================

CREATE TABLE user_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Contribution type
    contribution_type TEXT CHECK (contribution_type IN ('new_ingredient', 'edit_ingredient', 'new_dish', 'photo', 'correction')),

    -- Proposed data
    ingredient_name_english TEXT,
    ingredient_name_myanmar TEXT,
    proposed_data JSONB, -- Flexible structure for different contribution types

    -- Source verification
    source_url TEXT,
    source_description TEXT,
    evidence_photo_url TEXT,

    -- Review status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    -- Reward tracking
    points_awarded INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & TRACKING
-- =====================================================

CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Daily totals
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein_g DECIMAL(6,2) DEFAULT 0,
    total_fat_g DECIMAL(6,2) DEFAULT 0,
    total_carbs_g DECIMAL(6,2) DEFAULT 0,
    total_fiber_g DECIMAL(6,2) DEFAULT 0,

    -- Meal breakdown
    breakfast_calories DECIMAL(8,2) DEFAULT 0,
    lunch_calories DECIMAL(8,2) DEFAULT 0,
    dinner_calories DECIMAL(8,2) DEFAULT 0,
    snacks_calories DECIMAL(8,2) DEFAULT 0,

    -- Goals
    calorie_goal INTEGER,
    goal_achieved BOOLEAN DEFAULT FALSE,

    -- Weight tracking
    weight_kg DECIMAL(5,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, date)
);

CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    weight_kg DECIMAL(5,2) NOT NULL,
    measured_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AI & SEARCH OPTIMIZATION
-- =====================================================

-- Store AI embeddings for semantic search (future feature)
CREATE TABLE ingredient_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,

    embedding vector(1536), -- OpenAI embedding dimension
    model TEXT DEFAULT 'text-embedding-ada-002',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(ingredient_id)
);

-- User search patterns (for improving suggestions)
CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    search_query TEXT NOT NULL,
    search_language TEXT,
    results_count INTEGER,
    clicked_ingredient_id UUID REFERENCES ingredients(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Ingredients search
CREATE INDEX idx_ingredients_name_en ON ingredients USING GIN(name_english gin_trgm_ops);
CREATE INDEX idx_ingredients_name_mm ON ingredients USING GIN(name_myanmar gin_trgm_ops);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_search_en ON ingredients USING GIN(search_vector_en);
CREATE INDEX idx_ingredients_search_mm ON ingredients USING GIN(search_vector_mm);
CREATE INDEX idx_ingredients_usage ON ingredients(usage_count DESC, last_used_at DESC);
CREATE INDEX idx_ingredients_not_deleted ON ingredients(id) WHERE deleted_at IS NULL;

-- Cooking methods
CREATE INDEX idx_cooking_methods_ingredient ON cooking_methods(ingredient_id);

-- Users
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Meals
CREATE INDEX idx_meals_user_date ON meals(user_id, eaten_at DESC);
CREATE INDEX idx_meals_user_type ON meals(user_id, meal_type);
CREATE INDEX idx_meals_not_deleted ON meals(id) WHERE deleted_at IS NULL;

-- Meal items
CREATE INDEX idx_meal_items_meal ON meal_items(meal_id);
CREATE INDEX idx_meal_items_ingredient ON meal_items(ingredient_id);

-- Dish templates
CREATE INDEX idx_dish_templates_search_en ON dish_templates USING GIN(search_vector_en);
CREATE INDEX idx_dish_templates_search_mm ON dish_templates USING GIN(search_vector_mm);
CREATE INDEX idx_dish_templates_popularity ON dish_templates(popularity_score DESC);
CREATE INDEX idx_dish_templates_public ON dish_templates(is_public, is_verified);

-- Daily summaries
CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);

-- Weight logs
CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, measured_at DESC);

-- Search logs
CREATE INDEX idx_search_logs_user ON search_logs(user_id, created_at DESC);
CREATE INDEX idx_search_logs_query ON search_logs USING GIN(search_query gin_trgm_ops);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cooking_methods_updated_at BEFORE UPDATE ON cooking_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dish_templates_updated_at BEFORE UPDATE ON dish_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_contributions_updated_at BEFORE UPDATE ON user_contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_summaries_updated_at BEFORE UPDATE ON daily_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update search vectors for ingredients
CREATE OR REPLACE FUNCTION update_ingredient_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector_en := to_tsvector('english', COALESCE(NEW.name_english, '') || ' ' || COALESCE(NEW.category, '') || ' ' || COALESCE(NEW.subcategory, ''));
    NEW.search_vector_mm := to_tsvector('simple', COALESCE(NEW.name_myanmar, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ingredient_search_vector_trigger
    BEFORE INSERT OR UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_ingredient_search_vector();

-- Auto-update search vectors for dish templates
CREATE OR REPLACE FUNCTION update_dish_template_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector_en := to_tsvector('english', COALESCE(NEW.name_english, '') || ' ' || COALESCE(NEW.category, '') || ' ' || COALESCE(NEW.description, ''));
    NEW.search_vector_mm := to_tsvector('simple', COALESCE(NEW.name_myanmar, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dish_template_search_vector_trigger
    BEFORE INSERT OR UPDATE ON dish_templates
    FOR EACH ROW EXECUTE FUNCTION update_dish_template_search_vector();

-- Auto-update meal totals when meal_items change
CREATE OR REPLACE FUNCTION update_meal_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE meals
    SET
        total_calories = (SELECT COALESCE(SUM(calories), 0) FROM meal_items WHERE meal_id = NEW.meal_id),
        total_protein_g = (SELECT COALESCE(SUM(protein_g), 0) FROM meal_items WHERE meal_id = NEW.meal_id),
        total_fat_g = (SELECT COALESCE(SUM(fat_g), 0) FROM meal_items WHERE meal_id = NEW.meal_id),
        total_carbs_g = (SELECT COALESCE(SUM(carbs_g), 0) FROM meal_items WHERE meal_id = NEW.meal_id),
        total_fiber_g = (SELECT COALESCE(SUM(fiber_g), 0) FROM meal_items WHERE meal_id = NEW.meal_id)
    WHERE id = NEW.meal_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_meal_totals_trigger
    AFTER INSERT OR UPDATE ON meal_items
    FOR EACH ROW EXECUTE FUNCTION update_meal_totals();

-- Track ingredient usage for smart suggestions
CREATE OR REPLACE FUNCTION track_ingredient_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ingredients
    SET
        usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = NEW.ingredient_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_ingredient_usage_trigger
    AFTER INSERT ON meal_items
    FOR EACH ROW EXECUTE FUNCTION track_ingredient_usage();

-- Track dish template usage
CREATE OR REPLACE FUNCTION track_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_from_template_id IS NOT NULL THEN
        UPDATE dish_templates
        SET usage_count = usage_count + 1
        WHERE id = NEW.created_from_template_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_template_usage_trigger
    AFTER INSERT ON meals
    FOR EACH ROW EXECUTE FUNCTION track_template_usage();

-- Update daily summaries
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
    summary_date DATE;
    user_calorie_goal INTEGER;
BEGIN
    summary_date := DATE(NEW.eaten_at);

    -- Get user's calorie goal
    SELECT daily_calorie_target INTO user_calorie_goal
    FROM users WHERE id = NEW.user_id;

    -- Insert or update daily summary
    INSERT INTO daily_summaries (
        user_id,
        date,
        total_calories,
        total_protein_g,
        total_fat_g,
        total_carbs_g,
        total_fiber_g,
        calorie_goal
    )
    SELECT
        NEW.user_id,
        summary_date,
        COALESCE(SUM(m.total_calories), 0),
        COALESCE(SUM(m.total_protein_g), 0),
        COALESCE(SUM(m.total_fat_g), 0),
        COALESCE(SUM(m.total_carbs_g), 0),
        COALESCE(SUM(m.total_fiber_g), 0),
        user_calorie_goal
    FROM meals m
    WHERE m.user_id = NEW.user_id
        AND DATE(m.eaten_at) = summary_date
        AND m.deleted_at IS NULL
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        total_calories = EXCLUDED.total_calories,
        total_protein_g = EXCLUDED.total_protein_g,
        total_fat_g = EXCLUDED.total_fat_g,
        total_carbs_g = EXCLUDED.total_carbs_g,
        total_fiber_g = EXCLUDED.total_fiber_g,
        goal_achieved = EXCLUDED.total_calories <= EXCLUDED.calorie_goal;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_summary_trigger
    AFTER INSERT OR UPDATE ON meals
    FOR EACH ROW EXECUTE FUNCTION update_daily_summary();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on user tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contributions ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY meals_all_own ON meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY meal_items_all_own ON meal_items FOR ALL USING (
    EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())
);

CREATE POLICY daily_summaries_all_own ON daily_summaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY weight_logs_all_own ON weight_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_contributions_all_own ON user_contributions FOR ALL USING (auth.uid() = user_id);

-- Public read access for ingredients and templates
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY ingredients_public_read ON ingredients FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY cooking_methods_public_read ON cooking_methods FOR SELECT USING (true);
CREATE POLICY dish_templates_public_read ON dish_templates FOR SELECT USING (is_public = true OR created_by = auth.uid());

-- =====================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- =====================================================

-- Popular ingredients
CREATE MATERIALIZED VIEW mv_popular_ingredients AS
SELECT
    i.id,
    i.name_english,
    i.name_myanmar,
    i.category,
    i.usage_count,
    COUNT(DISTINCT mi.meal_id) as meal_count,
    COUNT(DISTINCT m.user_id) as user_count
FROM ingredients i
LEFT JOIN meal_items mi ON i.id = mi.ingredient_id
LEFT JOIN meals m ON mi.meal_id = m.id AND m.deleted_at IS NULL
WHERE i.deleted_at IS NULL
GROUP BY i.id, i.name_english, i.name_myanmar, i.category, i.usage_count
ORDER BY i.usage_count DESC;

CREATE UNIQUE INDEX ON mv_popular_ingredients (id);

-- Refresh function (call this periodically)
CREATE OR REPLACE FUNCTION refresh_popular_ingredients()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popular_ingredients;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE ingredients IS 'Master table for all food ingredients with nutritional data';
COMMENT ON TABLE cooking_methods IS 'Different cooking methods and their caloric impact';
COMMENT ON TABLE dish_templates IS 'Pre-configured dish templates for one-click meal logging';
COMMENT ON TABLE meals IS 'User meal logs with aggregated nutrition data';
COMMENT ON TABLE meal_items IS 'Individual ingredients within a meal';
COMMENT ON TABLE user_contributions IS 'Crowdsourced data from users for database expansion';
COMMENT ON TABLE daily_summaries IS 'Daily aggregated nutrition totals per user';

COMMENT ON COLUMN ingredients.confidence_score IS 'Data reliability: 1.0 = verified, 0.5-0.9 = estimated, <0.5 = unreliable';
COMMENT ON COLUMN ingredients.data_source IS 'Where this data came from (database/API/user/AI)';
COMMENT ON COLUMN dish_templates.ingredients IS 'JSON array of ingredient objects with portions';
COMMENT ON COLUMN users.streak_days IS 'Current consecutive days of logging meals';
