# Myanmar Food Database Import Instructions

## Overview
This guide explains how to import the `myanmar_food_database.csv` containing 179 ingredient variations into your Supabase database.

## Data Structure Analysis

### CSV File: `myanmar_food_database.csv`
- **Total Rows**: 179 (+ 1 header)
- **Unique Ingredients**: ~60-70 base ingredients
- **Cooking Method Variations**: Each ingredient has 1-4 cooking methods
- **Structure**: Each row = One ingredient + One cooking method combination

### Example:
```
White Rice (ထမင်းဖြူ)
  ├─ Raw (365 cal/100g)
  ├─ Boiled (130 cal/100g)
  └─ Fried (168 cal/100g)
```

### Database Tables
1. **`ingredients`** - Base ingredient information (nutrition per 100g raw)
2. **`cooking_methods`** - Cooking variations (how calories change when cooked)

## Compatibility Analysis

| CSV Column | Maps To | Table | Notes |
|------------|---------|-------|-------|
| name_english | name_english | ingredients | ✅ Direct match |
| name_myanmar | name_myanmar | ingredients | ✅ Direct match |
| category | category | ingredients | ✅ Direct match |
| subcategory | subcategory | ingredients | ✅ Direct match |
| calories_per_100g_raw | calories_per_100g | ingredients | ⚠️ Column name differs |
| protein_g | protein_g | ingredients | ✅ Direct match |
| fat_g | fat_g | ingredients | ✅ Direct match |
| carbs_g | carbs_g | ingredients | ✅ Direct match |
| fiber_g | fiber_g | ingredients | ✅ Direct match |
| cooking_method | method_name | cooking_methods | 📋 Separate table |
| calories_per_100g_cooked | calories_per_100g_cooked | cooking_methods | 📋 Separate table |
| water_content_percent | water_content_percent | cooking_methods | 📋 Separate table |
| notes | notes | cooking_methods | 📋 Separate table |

**✅ No data loss** - All 179 rows will be preserved as cooking method variations.

## Import Methods

### Method 1: TypeScript Import Script (Recommended)

**Prerequisites:**
```bash
npm install csv-parse @supabase/supabase-js
```

**Environment Variables:**
Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Run:**
```bash
npx tsx scripts/import_ingredients.ts
```

**What it does:**
1. Reads CSV file
2. Groups by unique ingredients (name_english + name_myanmar)
3. Inserts base ingredients using "Raw" values
4. Inserts ALL cooking method variations
5. Calculates calorie multipliers automatically
6. Shows progress and verification stats

**Output:**
```
🚀 Starting Myanmar Food Database Import...
📖 Reading CSV from: /path/to/myanmar_food_database.csv
✅ Parsed 179 rows from CSV

📊 Found 60 unique ingredients
📊 Total cooking method variations: 179

💾 Inserting ingredients...
  ✓ 1. White Rice (3 cooking methods)
  ✓ 2. Brown Rice (2 cooking methods)
  ...

✅ Import Complete!
📊 Summary:
  - Unique ingredients imported: 60
  - Cooking method variations: 179
  - Success rate: 100%
```

### Method 2: Supabase Dashboard (Manual)

1. **Prepare CSV for ingredients table:**
   - Filter CSV to keep only "Raw" rows
   - Rename `calories_per_100g_raw` to `calories_per_100g`
   - Upload to `ingredients` table

2. **Prepare CSV for cooking_methods table:**
   - Keep all rows
   - Match ingredient_id with uploaded ingredients
   - Upload to `cooking_methods` table

3. **Drawbacks:**
   - Manual, error-prone
   - Need to match IDs manually
   - Not recommended

### Method 3: SQL Import (Via psql or Supabase SQL Editor)

See `scripts/import_ingredients.sql` for SQL template.

**Note:** Requires manual CSV loading into temp table.

## Data Validation

### After Import, Run These Queries:

**1. Count Check:**
```sql
-- Should show ~60 ingredients, 179 cooking methods
SELECT
  (SELECT COUNT(*) FROM ingredients) as total_ingredients,
  (SELECT COUNT(*) FROM cooking_methods) as total_cooking_methods;
```

**2. Sample Data:**
```sql
-- View ingredients with their cooking methods
SELECT
    i.name_english,
    i.name_myanmar,
    COUNT(cm.id) as methods_count,
    STRING_AGG(cm.method_name, ', ') as cooking_methods
FROM ingredients i
LEFT JOIN cooking_methods cm ON cm.ingredient_id = i.id
GROUP BY i.id, i.name_english, i.name_myanmar
LIMIT 10;
```

**3. Cooking Method Details:**
```sql
-- Check calorie changes by cooking method
SELECT
    i.name_english,
    cm.method_name,
    i.calories_per_100g as raw_calories,
    cm.calories_per_100g_cooked as cooked_calories,
    cm.calorie_multiplier,
    cm.water_content_percent
FROM ingredients i
JOIN cooking_methods cm ON cm.ingredient_id = i.id
WHERE i.name_english = 'White Rice'
ORDER BY cm.calories_per_100g_cooked DESC;
```

## Important Notes

⚠️ **Do NOT remove duplicate rows from CSV!**
- Each row represents a unique cooking method
- Example: "Chicken Breast - Raw", "Chicken Breast - Grilled", "Chicken Breast - Fried" are all needed
- The script handles grouping automatically

✅ **Data Integrity:**
- All 179 CSV rows will be preserved
- Base ingredient uses "Raw" nutritional values
- Cooking methods store how nutrition changes when cooked

🔒 **Safety:**
- Script uses transactions (can rollback if error)
- Duplicate prevention via unique constraints
- Validation queries included

## Troubleshooting

**Issue: "No Raw version found"**
- Some ingredients don't have a "Raw" entry
- Script automatically uses first available cooking method as base
- This is normal (e.g., "Salted Duck Egg" has no raw version)

**Issue: "Duplicate key error"**
- Ingredient already exists in database
- Solution: Clear tables first or skip duplicates

**Clear tables before re-import:**
```sql
TRUNCATE cooking_methods, ingredients CASCADE;
```

**Issue: "Permission denied"**
- Use service role key, not anon key
- Check RLS policies are disabled for service role

## Success Criteria

After successful import:
- ✅ ~60 unique ingredients in `ingredients` table
- ✅ 179 cooking method variations in `cooking_methods` table
- ✅ All ingredients have at least 1 cooking method
- ✅ Calorie multipliers calculated correctly
- ✅ Bilingual names (English + Myanmar) present
- ✅ All data from CSV preserved

## Need Help?

Check:
1. Supabase logs for error messages
2. Script output for specific failures
3. Database constraints/triggers
4. RLS policies (should allow service role)
