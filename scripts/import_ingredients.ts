/**
 * Import Myanmar Food Database from CSV to Supabase
 *
 * This script:
 * 1. Reads myanmar_food_database.csv
 * 2. Groups by unique ingredients
 * 3. Inserts base ingredients (using Raw values)
 * 4. Inserts all cooking method variations
 * 5. Preserves all 179 rows as unique cooking method combinations
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials - UPDATE THESE!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.log('Please set:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface CSVRow {
  food_id: string;
  name_english: string;
  name_myanmar: string;
  category: string;
  subcategory: string;
  calories_per_100g_raw: string;
  protein_g: string;
  fat_g: string;
  carbs_g: string;
  fiber_g: string;
  cooking_method: string;
  calories_per_100g_cooked: string;
  water_content_percent: string;
  notes: string;
}

interface Ingredient {
  name_english: string;
  name_myanmar: string;
  category: string;
  subcategory: string;
  calories_per_100g: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  data_source: string;
  confidence_score: number;
  verified: boolean;
}

interface CookingMethod {
  ingredient_id: string;
  method_name: string;
  calories_per_100g_cooked: number;
  water_content_percent: number;
  calorie_multiplier: number;
  notes: string;
}

async function main() {
  console.log('🚀 Starting Myanmar Food Database Import...\n');

  // Step 1: Read CSV file
  const csvPath = path.join(process.cwd(), 'myanmar_food_database.csv');
  console.log(`📖 Reading CSV from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const rows: CSVRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`✅ Parsed ${rows.length} rows from CSV\n`);

  // Step 2: Group by unique ingredients
  const ingredientMap = new Map<string, CSVRow[]>();

  rows.forEach((row) => {
    const key = `${row.name_english}|${row.name_myanmar}`;
    if (!ingredientMap.has(key)) {
      ingredientMap.set(key, []);
    }
    ingredientMap.get(key)!.push(row);
  });

  console.log(`📊 Found ${ingredientMap.size} unique ingredients`);
  console.log(`📊 Total cooking method variations: ${rows.length}\n`);

  // Step 3: Insert ingredients
  console.log('💾 Inserting ingredients...');
  let ingredientCount = 0;
  let cookingMethodCount = 0;
  const ingredientIdMap = new Map<string, string>();

  for (const [key, variations] of ingredientMap.entries()) {
    // Find the "Raw" variation as base, or use first one if no Raw exists
    let baseRow = variations.find((v) => v.cooking_method.toLowerCase() === 'raw');
    if (!baseRow) {
      // If no Raw version, use the first one
      baseRow = variations[0];
      console.log(`⚠️  No Raw version for "${variations[0].name_english}", using "${variations[0].cooking_method}" as base`);
    }

    // Insert ingredient
    const ingredient: Ingredient = {
      name_english: baseRow.name_english,
      name_myanmar: baseRow.name_myanmar,
      category: baseRow.category,
      subcategory: baseRow.subcategory || '',
      calories_per_100g: parseFloat(baseRow.calories_per_100g_raw),
      protein_g: parseFloat(baseRow.protein_g),
      fat_g: parseFloat(baseRow.fat_g),
      carbs_g: parseFloat(baseRow.carbs_g),
      fiber_g: parseFloat(baseRow.fiber_g),
      data_source: 'database',
      confidence_score: 1.0,
      verified: true,
    };

    const { data: ingredientData, error: ingredientError } = await supabase
      .from('ingredients')
      .insert(ingredient)
      .select('id')
      .single();

    if (ingredientError) {
      console.error(`❌ Error inserting ingredient "${ingredient.name_english}":`, ingredientError);
      continue;
    }

    const ingredientId = ingredientData.id;
    ingredientIdMap.set(key, ingredientId);
    ingredientCount++;

    console.log(`  ✓ ${ingredientCount}. ${ingredient.name_english} (${variations.length} cooking methods)`);

    // Step 4: Insert all cooking method variations for this ingredient
    for (const row of variations) {
      const rawCalories = parseFloat(row.calories_per_100g_raw);
      const cookedCalories = parseFloat(row.calories_per_100g_cooked);
      const multiplier = rawCalories > 0 ? cookedCalories / rawCalories : 1.0;

      const cookingMethod: CookingMethod = {
        ingredient_id: ingredientId,
        method_name: row.cooking_method,
        calories_per_100g_cooked: cookedCalories,
        water_content_percent: parseFloat(row.water_content_percent),
        calorie_multiplier: Math.round(multiplier * 100) / 100,
        notes: row.notes || '',
      };

      const { error: methodError } = await supabase
        .from('cooking_methods')
        .insert(cookingMethod);

      if (methodError) {
        console.error(`    ❌ Error inserting cooking method "${cookingMethod.method_name}":`, methodError);
      } else {
        cookingMethodCount++;
      }
    }
  }

  // Summary
  console.log('\n✅ Import Complete!\n');
  console.log('📊 Summary:');
  console.log(`  - Unique ingredients imported: ${ingredientCount}`);
  console.log(`  - Cooking method variations: ${cookingMethodCount}`);
  console.log(`  - CSV rows processed: ${rows.length}`);
  console.log(`  - Success rate: ${Math.round((cookingMethodCount / rows.length) * 100)}%\n`);

  // Verification query
  const { count: totalIngredients } = await supabase
    .from('ingredients')
    .select('*', { count: 'exact', head: true });

  const { count: totalMethods } = await supabase
    .from('cooking_methods')
    .select('*', { count: 'exact', head: true });

  console.log('📈 Database Status:');
  console.log(`  - Total ingredients in DB: ${totalIngredients}`);
  console.log(`  - Total cooking methods in DB: ${totalMethods}\n`);

  console.log('🎉 All done! Your ingredients are ready to use.');
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
