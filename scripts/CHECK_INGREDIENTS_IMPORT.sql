-- =====================================================
-- QUICK CHECK: Verify Ingredients Import Status
-- Paste this in Supabase SQL Editor to check if ingredients were imported
-- =====================================================

-- Check 1: Count ingredients
SELECT
  'Total Ingredients' as check_name,
  COUNT(*) as count
FROM ingredients;

-- Check 2: Count cooking methods
SELECT
  'Total Cooking Methods' as check_name,
  COUNT(*) as count
FROM cooking_methods;

-- Check 3: Sample ingredients (first 10)
SELECT
  id,
  name_english,
  name_myanmar,
  category,
  verified,
  data_source,
  created_at
FROM ingredients
ORDER BY created_at DESC
LIMIT 10;

-- Check 4: Ingredients with cooking methods count
SELECT
  i.name_english,
  i.name_myanmar,
  COUNT(cm.id) as cooking_methods_count
FROM ingredients i
LEFT JOIN cooking_methods cm ON cm.ingredient_id = i.id
GROUP BY i.id, i.name_english, i.name_myanmar
ORDER BY cooking_methods_count DESC
LIMIT 10;

-- =====================================================
-- EXPECTED RESULTS (if import was successful):
-- - Total Ingredients: ~60-63
-- - Total Cooking Methods: 179
-- - Sample ingredients should show recently added items
-- - White Rice should have 3 cooking methods
-- =====================================================

-- If counts are 0, the import script was NOT RUN yet!
-- Go to: scripts/IMPORT_ALL_INGREDIENTS.sql and run that first.
