# Quick Start: Import Myanmar Food Database

## Prerequisites
1. Supabase project created
2. Database migrations applied
3. Environment variables set in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Import in 3 Steps

### Step 1: Check CSV
```bash
# Verify CSV exists
ls myanmar_food_database.csv

# Preview data
head -20 myanmar_food_database.csv
```

### Step 2: Run Import
```bash
npm run db:import-ingredients
```

### Step 3: Verify
```sql
-- In Supabase SQL Editor, run:
SELECT
  (SELECT COUNT(*) FROM ingredients) as ingredients,
  (SELECT COUNT(*) FROM cooking_methods) as cooking_methods;

-- Expected results:
-- ingredients: ~60
-- cooking_methods: 179
```

## What Gets Imported

### From CSV (179 rows):
```
White Rice - Raw → ingredients table
White Rice - Boiled → cooking_methods table
White Rice - Fried → cooking_methods table
Brown Rice - Raw → ingredients table
Brown Rice - Boiled → cooking_methods table
... (and so on)
```

### Result:
- **~60 base ingredients** in `ingredients` table
- **179 cooking variations** in `cooking_methods` table
- **All rows preserved** - no data loss!

## Troubleshooting

**Error: "Missing environment variables"**
```bash
# Check .env.local exists
cat .env.local

# Or export manually:
export NEXT_PUBLIC_SUPABASE_URL="https://..."
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

**Error: "CSV file not found"**
```bash
# CSV must be in project root
mv path/to/myanmar_food_database.csv .
```

**Want to re-import?**
```sql
-- Clear tables first:
TRUNCATE cooking_methods, ingredients CASCADE;
```

Then run import again.

## Need More Details?
See `IMPORT_INSTRUCTIONS.md` for full documentation.
