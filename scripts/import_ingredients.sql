-- =====================================================
-- Myanmar Food Database Import Script (SQL Version)
-- =====================================================
-- This is a template - you'll need to adapt it for your use case
-- For automated import, use the TypeScript version instead
-- =====================================================

-- NOTE: This SQL script demonstrates the structure
-- For actual CSV import, use:
-- 1. Supabase Dashboard > Table Editor > Import from CSV
-- 2. OR use the TypeScript import script (recommended)

-- Step 1: Create temporary table to load CSV data
CREATE TEMP TABLE csv_import (
    food_id INTEGER,
    name_english TEXT,
    name_myanmar TEXT,
    category TEXT,
    subcategory TEXT,
    calories_per_100g_raw DECIMAL,
    protein_g DECIMAL,
    fat_g DECIMAL,
    carbs_g DECIMAL,
    fiber_g DECIMAL,
    cooking_method TEXT,
    calories_per_100g_cooked DECIMAL,
    water_content_percent DECIMAL,
    notes TEXT
);

-- Step 2: Load CSV into temp table
-- Using Supabase SQL Editor, you can use:
-- COPY csv_import FROM '/path/to/myanmar_food_database.csv' WITH CSV HEADER;
-- OR import via Supabase Dashboard

-- Step 3: Insert unique ingredients (using RAW versions as base)
WITH unique_ingredients AS (
    SELECT DISTINCT ON (name_english, name_myanmar)
        name_english,
        name_myanmar,
        category,
        subcategory,
        calories_per_100g_raw as calories_per_100g,
        protein_g,
        fat_g,
        carbs_g,
        fiber_g
    FROM csv_import
    WHERE cooking_method = 'Raw'
    ORDER BY name_english, name_myanmar
)
INSERT INTO ingredients (
    name_english,
    name_myanmar,
    category,
    subcategory,
    calories_per_100g,
    protein_g,
    fat_g,
    carbs_g,
    fiber_g,
    data_source,
    confidence_score,
    verified
)
SELECT
    name_english,
    name_myanmar,
    category,
    COALESCE(subcategory, ''),
    calories_per_100g,
    protein_g,
    fat_g,
    carbs_g,
    fiber_g,
    'database',
    1.0,
    TRUE
FROM unique_ingredients;

-- Step 4: Insert cooking methods for all variations
INSERT INTO cooking_methods (
    ingredient_id,
    method_name,
    calories_per_100g_cooked,
    water_content_percent,
    calorie_multiplier,
    notes
)
SELECT
    i.id,
    c.cooking_method,
    c.calories_per_100g_cooked,
    c.water_content_percent,
    ROUND((c.calories_per_100g_cooked::NUMERIC / NULLIF(c.calories_per_100g_raw, 0))::NUMERIC, 2),
    COALESCE(c.notes, '')
FROM csv_import c
INNER JOIN ingredients i
    ON c.name_english = i.name_english
    AND c.name_myanmar = i.name_myanmar;

-- Step 5: Verify import
SELECT
    'Ingredients' as table_name,
    COUNT(*) as row_count
FROM ingredients
UNION ALL
SELECT
    'Cooking Methods' as table_name,
    COUNT(*) as row_count
FROM cooking_methods;

-- Step 6: Sample verification query
SELECT
    i.name_english,
    i.name_myanmar,
    i.category,
    COUNT(cm.id) as cooking_methods_count,
    STRING_AGG(cm.method_name, ', ' ORDER BY cm.method_name) as methods
FROM ingredients i
LEFT JOIN cooking_methods cm ON cm.ingredient_id = i.id
GROUP BY i.id, i.name_english, i.name_myanmar, i.category
ORDER BY i.name_english
LIMIT 10;

-- Clean up temp table
DROP TABLE IF EXISTS csv_import;
