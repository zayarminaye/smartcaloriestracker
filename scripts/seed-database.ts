#!/usr/bin/env tsx

/**
 * Database Seeding Script
 * Imports data from myanmar_food_database.csv into Supabase
 *
 * Usage: npm run db:seed
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import Papa from 'papaparse'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CSVRow {
  food_id: string
  name_english: string
  name_myanmar: string
  category: string
  subcategory: string
  calories_per_100g_raw: string
  protein_g: string
  fat_g: string
  carbs_g: string
  fiber_g: string
  cooking_method: string
  calories_per_100g_cooked: string
  water_content_percent: string
  notes: string
}

async function seedIngredients() {
  console.log('🌱 Starting database seed...\n')

  // Read CSV file
  const csvPath = path.join(process.cwd(), 'myanmar_food_database.csv')

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`)
    process.exit(1)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')

  // Parse CSV
  const { data: rows } = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true
  })

  console.log(`📊 Found ${rows.length} rows in CSV\n`)

  // Group by ingredient (food items may have multiple cooking methods)
  const ingredientsMap = new Map<string, {
    ingredient: any
    cookingMethods: any[]
  }>()

  for (const row of rows) {
    const key = `${row.name_english}_${row.name_myanmar}`

    if (!ingredientsMap.has(key)) {
      ingredientsMap.set(key, {
        ingredient: {
          name_english: row.name_english,
          name_myanmar: row.name_myanmar,
          category: row.category,
          subcategory: row.subcategory || null,
          calories_per_100g: parseFloat(row.calories_per_100g_raw),
          protein_g: parseFloat(row.protein_g),
          fat_g: parseFloat(row.fat_g),
          carbs_g: parseFloat(row.carbs_g),
          fiber_g: parseFloat(row.fiber_g),
          data_source: 'database',
          confidence_score: 1.0,
          verified: true,
          notes: row.notes || null
        },
        cookingMethods: []
      })
    }

    const item = ingredientsMap.get(key)!

    // Add cooking method
    if (row.cooking_method) {
      item.cookingMethods.push({
        method_name: row.cooking_method,
        calories_per_100g_cooked: parseFloat(row.calories_per_100g_cooked),
        water_content_percent: parseFloat(row.water_content_percent) || null,
        calorie_multiplier: parseFloat(row.calories_per_100g_cooked) / parseFloat(row.calories_per_100g_raw),
        notes: row.notes || null
      })
    }
  }

  console.log(`🔍 Grouped into ${ingredientsMap.size} unique ingredients\n`)

  // Insert ingredients
  let successCount = 0
  let errorCount = 0

  for (const [key, { ingredient, cookingMethods }] of ingredientsMap) {
    try {
      // Insert ingredient
      const { data: insertedIngredient, error: ingredientError } = await supabase
        .from('ingredients')
        .insert(ingredient)
        .select()
        .single()

      if (ingredientError) {
        console.error(`❌ Error inserting ${ingredient.name_english}:`, ingredientError.message)
        errorCount++
        continue
      }

      // Insert cooking methods
      if (cookingMethods.length > 0) {
        const methodsWithIngredientId = cookingMethods.map(method => ({
          ...method,
          ingredient_id: insertedIngredient.id
        }))

        const { error: methodsError } = await supabase
          .from('cooking_methods')
          .insert(methodsWithIngredientId)

        if (methodsError) {
          console.error(`⚠️  Warning: Error inserting cooking methods for ${ingredient.name_english}:`, methodsError.message)
        }
      }

      successCount++
      process.stdout.write(`✅ Imported: ${ingredient.name_english} (${ingredient.name_myanmar}) with ${cookingMethods.length} cooking methods\n`)
    } catch (error: any) {
      console.error(`❌ Error processing ${ingredient.name_english}:`, error.message)
      errorCount++
    }
  }

  console.log(`\n📈 Seeding Summary:`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📊 Total: ${ingredientsMap.size}\n`)
}

async function seedDishTemplates() {
  console.log('🍽️  Creating dish templates...\n')

  const templates = [
    {
      name_english: 'Chicken Curry with Rice',
      name_myanmar: 'ကြက်သား ဟင်း နှင့် ထမင်း',
      category: 'curry',
      description: 'Traditional Myanmar chicken curry served with white rice',
      is_public: true,
      is_verified: true,
      typical_calories: 650,
      typical_protein_g: 45,
      typical_fat_g: 25,
      typical_carbs_g: 65,
      ingredients: [
        {
          name_english: 'Chicken Breast',
          name_myanmar: 'ကြက်သားရင်',
          cooking_method: 'Curry',
          portion_grams: 150,
          portion_description: '1 medium piece'
        },
        {
          name_english: 'White Rice',
          name_myanmar: 'ထမင်းဖြူ',
          cooking_method: 'Boiled',
          portion_grams: 200,
          portion_description: '1 cup cooked'
        },
        {
          name_english: 'Onion',
          name_myanmar: 'ကြက်သွန်နီ',
          cooking_method: 'Sauteed',
          portion_grams: 50,
          portion_description: '1 small'
        },
        {
          name_english: 'Cooking Oil',
          name_myanmar: 'ဆီ',
          cooking_method: 'Pure',
          portion_grams: 15,
          portion_description: '1 tbsp'
        }
      ]
    },
    {
      name_english: 'Mohinga',
      name_myanmar: 'မုန့်ဟင်းခါး',
      category: 'noodles',
      description: 'National dish of Myanmar - rice noodles in fish soup',
      is_public: true,
      is_verified: true,
      typical_calories: 450,
      typical_protein_g: 25,
      typical_fat_g: 18,
      typical_carbs_g: 55,
      ingredients: [
        {
          name_english: 'Rice Noodles',
          name_myanmar: 'မုန့်ဖတ်',
          cooking_method: 'Boiled',
          portion_grams: 200,
          portion_description: '1 bowl'
        },
        {
          name_english: 'Catfish',
          name_myanmar: 'ငါးခူ',
          cooking_method: 'Cooked',
          portion_grams: 100,
          portion_description: '1/2 cup flaked'
        },
        {
          name_english: 'Egg Chicken',
          name_myanmar: 'ကြက်ဥ',
          cooking_method: 'Boiled',
          portion_grams: 50,
          portion_description: '1 egg'
        }
      ]
    },
    {
      name_english: 'Shan Noodles',
      name_myanmar: 'ရှမ်းခေါက်ဆွဲ',
      category: 'noodles',
      description: 'Shan-style rice noodles with chicken or pork',
      is_public: true,
      is_verified: true,
      typical_calories: 520,
      typical_protein_g: 30,
      typical_fat_g: 20,
      typical_carbs_g: 58,
      ingredients: [
        {
          name_english: 'Rice Noodles',
          name_myanmar: 'မုန့်ဖတ်',
          cooking_method: 'Boiled',
          portion_grams: 200,
          portion_description: '1 bowl'
        },
        {
          name_english: 'Chicken Breast',
          name_myanmar: 'ကြက်သားရင်',
          cooking_method: 'Grilled',
          portion_grams: 120,
          portion_description: '1 medium piece'
        },
        {
          name_english: 'Peanuts',
          name_myanmar: 'မြေပဲ',
          cooking_method: 'Roasted',
          portion_grams: 30,
          portion_description: '2 tbsp'
        }
      ]
    },
    {
      name_english: 'Tea Leaf Salad',
      name_myanmar: 'လက်ဖက်သုတ်',
      category: 'salad',
      description: 'Traditional pickled tea leaf salad',
      is_public: true,
      is_verified: true,
      typical_calories: 280,
      typical_protein_g: 12,
      typical_fat_g: 18,
      typical_carbs_g: 22,
      ingredients: [
        {
          name_english: 'Tea Leaves',
          name_myanmar: 'လက်ဖက်ရွက်',
          cooking_method: 'Pickled',
          portion_grams: 50,
          portion_description: '1/4 cup'
        },
        {
          name_english: 'Peanuts',
          name_myanmar: 'မြေပဲ',
          cooking_method: 'Fried_salted',
          portion_grams: 30,
          portion_description: '2 tbsp'
        },
        {
          name_english: 'Tomato',
          name_myanmar: 'ခရမ်းချဉ်သီး',
          cooking_method: 'Raw',
          portion_grams: 100,
          portion_description: '1 medium'
        },
        {
          name_english: 'Cabbage',
          name_myanmar: 'ဂေါ်ဖီထုပ်',
          cooking_method: 'Raw',
          portion_grams: 80,
          portion_description: '1 cup shredded'
        }
      ]
    }
  ]

  let templateSuccess = 0

  for (const template of templates) {
    try {
      const { error } = await supabase
        .from('dish_templates')
        .insert(template)

      if (error) {
        console.error(`❌ Error creating template ${template.name_english}:`, error.message)
      } else {
        console.log(`✅ Created template: ${template.name_english} (${template.name_myanmar})`)
        templateSuccess++
      }
    } catch (error: any) {
      console.error(`❌ Error:`, error.message)
    }
  }

  console.log(`\n📊 Created ${templateSuccess}/${templates.length} dish templates\n`)
}

async function main() {
  try {
    await seedIngredients()
    await seedDishTemplates()

    console.log('✨ Database seeding completed successfully!\n')
    process.exit(0)
  } catch (error: any) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

main()
