import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Model optimized for Burmese/Myanmar text
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export interface IngredientExtraction {
  ingredients: Array<{
    name_mm: string
    name_en: string
    estimated_portion_g: number
    confidence: number
  }>
  cooking_method?: string
  dish_name?: string
}

/**
 * Extract ingredients from Myanmar dish description
 * Example input: "ကြက်သား နဲ့ အာလူး ဟင်း"
 * Output: Structured ingredient list with portions
 */
export async function extractIngredientsFromText(
  dishText: string,
  language: 'mm' | 'en' = 'mm'
): Promise<IngredientExtraction> {
  const prompt = `You are a Myanmar food expert. Analyze this dish description and extract ingredients.

Dish: "${dishText}"

Instructions:
1. Identify all main ingredients (ignore minor spices/seasonings)
2. Provide both Myanmar (Unicode) and English names
3. Estimate typical portion size in grams for each ingredient
4. Determine cooking method if mentioned
5. Assign confidence score (0.0-1.0)

Return ONLY a valid JSON object in this exact format:
{
  "dish_name": "dish name in ${language === 'mm' ? 'Myanmar' : 'English'}",
  "ingredients": [
    {
      "name_mm": "ကြက်သား",
      "name_en": "Chicken",
      "estimated_portion_g": 150,
      "confidence": 0.95
    }
  ],
  "cooking_method": "curry" or "fried" or "grilled" etc
}

Focus on common Myanmar ingredients. Be specific (e.g., "Chicken Breast" not just "Chicken").`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0]) as IngredientExtraction
    return parsed
  } catch (error) {
    console.error('Gemini extraction error:', error)
    throw new Error('Failed to extract ingredients from text')
  }
}

/**
 * Find similar ingredients when exact match not found
 */
export async function findSimilarIngredients(
  ingredientName: string,
  availableIngredients: Array<{ name_mm: string; name_en: string }>
): Promise<string[]> {
  const prompt = `Given this ingredient: "${ingredientName}"

And this list of available ingredients:
${availableIngredients.map((i, idx) => `${idx + 1}. ${i.name_mm} (${i.name_en})`).join('\n')}

Find the 3 most similar ingredients from the list. Return ONLY a JSON array of indices (1-based).
Example: [5, 12, 3]

If no similar items found, return empty array: []`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\[[\s\S]*?\]/)
    if (!jsonMatch) return []

    const indices = JSON.parse(jsonMatch[0]) as number[]
    return indices.map(idx => availableIngredients[idx - 1]?.name_en).filter(Boolean)
  } catch (error) {
    console.error('Similarity search error:', error)
    return []
  }
}

/**
 * Estimate nutrition for unknown ingredients using AI
 */
export async function estimateNutrition(
  ingredientName: string,
  category?: string
): Promise<{
  calories_per_100g: number
  protein_g: number
  fat_g: number
  carbs_g: number
  fiber_g: number
  confidence: number
}> {
  const prompt = `Estimate nutritional values per 100g for: "${ingredientName}"
${category ? `Category: ${category}` : ''}

Return ONLY valid JSON in this format:
{
  "calories_per_100g": 165,
  "protein_g": 31,
  "fat_g": 3.6,
  "carbs_g": 0,
  "fiber_g": 0,
  "confidence": 0.85
}

Base estimates on USDA database values for similar foods. Be conservative.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Nutrition estimation error:', error)
    // Return safe default for unknown food
    return {
      calories_per_100g: 100,
      protein_g: 5,
      fat_g: 3,
      carbs_g: 15,
      fiber_g: 1,
      confidence: 0.3
    }
  }
}

/**
 * Smart dish template matching
 * Finds best matching dish template based on user input
 */
export async function matchDishTemplate(
  userInput: string,
  templates: Array<{ id: string; name_mm: string; name_en: string; category: string }>
): Promise<{ template_id: string; confidence: number } | null> {
  if (templates.length === 0) return null

  const prompt = `User input: "${userInput}"

Available dish templates:
${templates.map((t, i) => `${i + 1}. ${t.name_mm} / ${t.name_en} (${t.category})`).join('\n')}

Find the best matching template. Return JSON:
{
  "index": 5,
  "confidence": 0.9
}

If no good match (confidence < 0.6), return:
{
  "index": null,
  "confidence": 0
}`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.index || parsed.confidence < 0.6) return null

    return {
      template_id: templates[parsed.index - 1].id,
      confidence: parsed.confidence
    }
  } catch (error) {
    console.error('Template matching error:', error)
    return null
  }
}

/**
 * Generate meal insights and suggestions
 */
export async function generateMealInsights(dailyData: {
  total_calories: number
  total_protein_g: number
  total_fat_g: number
  total_carbs_g: number
  goal_calories: number
  meals: Array<{ meal_type: string; calories: number; items: string[] }>
}): Promise<string> {
  const prompt = `Analyze this daily nutrition data and provide helpful insights in Myanmar language:

Daily Summary:
- Calories: ${dailyData.total_calories} / ${dailyData.goal_calories} kcal
- Protein: ${dailyData.total_protein_g}g
- Fat: ${dailyData.total_fat_g}g
- Carbs: ${dailyData.total_carbs_g}g

Meals:
${dailyData.meals.map(m => `${m.meal_type}: ${m.calories} kcal - ${m.items.join(', ')}`).join('\n')}

Provide 2-3 friendly, actionable insights in Myanmar language. Be encouraging and culturally relevant.
Keep it concise (max 100 words total).`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Insights generation error:', error)
    return 'သင်၏ အစားအသောက် မှတ်တမ်းကို ဆက်လက် မှတ်သားပါ။'
  }
}
