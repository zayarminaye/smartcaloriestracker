# Myanmar Food Nutrition Database Documentation

## Database Overview
This comprehensive food nutrition database contains 180 food items commonly consumed in Myanmar, with nutritional data from reliable sources including USDA FoodData Central, ASEANFOODS, and peer-reviewed nutritional studies.

## Data Sources
1. **USDA FoodData Central** - Primary source for nutritional values
2. **ASEANFOODS Database** - Regional Southeast Asian foods
3. **FAO/INFOODS** - International food composition standards
4. **Scientific Literature** - Peer-reviewed studies on cooking methods

## Database Structure

### Fields Description
- **food_id**: Unique identifier for each food item
- **name_english**: English name of the food
- **name_myanmar**: Myanmar/Burmese name (Unicode)
- **category**: Main food category
- **subcategory**: Specific food type within category
- **calories_per_100g_raw**: Calories in raw state (kcal/100g)
- **protein_g**: Protein content (grams/100g)
- **fat_g**: Total fat content (grams/100g)
- **carbs_g**: Carbohydrate content (grams/100g)
- **fiber_g**: Dietary fiber (grams/100g)
- **cooking_method**: Preparation method
- **calories_per_100g_cooked**: Calories after cooking (kcal/100g)
- **water_content_percent**: Water percentage in food
- **notes**: Additional information

## Categories Included

### 1. Grains (13 items)
- Rice varieties (white, brown, sticky)
- Noodles (rice, wheat)

### 2. Meat (18 items)
- Chicken (breast, thigh, wings)
- Pork (loin, belly, ground)
- Beef (sirloin, ground)

### 3. Seafood (16 items)
- Fish (tilapia, catfish, hilsa)
- Shellfish (shrimp, prawns, crab)
- Squid

### 4. Vegetables (54 items)
- Leafy greens (spinach, water spinach, mustard greens)
- Gourds (bottle gourd, pumpkin, bitter gourd)
- Root vegetables (carrot, radish, potato)
- Local favorites (bamboo shoots, drumstick)

### 5. Legumes (10 items)
- Peas, beans, lentils
- Traditional Myanmar legumes

### 6. Herbs & Spices (13 items)
- Fresh herbs (lemongrass, basil, mint)
- Spices (chili, turmeric, ginger)

### 7. Fruits (14 items)
- Tropical fruits common in Myanmar
- Citrus fruits

### 8. Other Categories
- Nuts & Seeds
- Dairy products
- Oils & Fats
- Traditional dishes
- Snacks

## Cooking Method Adjustments

### Calorie Multipliers by Cooking Method:
1. **Boiling/Steaming**: 1.0x (minimal change)
2. **Grilling/Roasting**: 1.0-1.1x (fat drips away)
3. **Stir-frying**: 1.2-1.3x (moderate oil absorption)
4. **Deep-frying**: 1.5-2.5x (significant oil absorption)
5. **Curry**: 1.3-1.4x (oil-based preparation)

### Oil Absorption Estimates:
- Dense proteins (meat/fish): +50-64% calories when fried
- Breaded items: +100-128% calories
- Vegetables: +10-30% calories depending on porosity
- General estimate: 10% of food weight absorbed as oil

## Implementation Guide

### 1. Database Setup (SQL)
```sql
CREATE TABLE foods (
    food_id INTEGER PRIMARY KEY,
    name_english VARCHAR(100) NOT NULL,
    name_myanmar NVARCHAR(100),
    category VARCHAR(50),
    subcategory VARCHAR(50),
    calories_per_100g_raw DECIMAL(6,2),
    protein_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fiber_g DECIMAL(4,2),
    cooking_method VARCHAR(50),
    calories_per_100g_cooked DECIMAL(6,2),
    water_content_percent DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX idx_name_english ON foods(name_english);
CREATE INDEX idx_name_myanmar ON foods(name_myanmar);
CREATE INDEX idx_category ON foods(category);
CREATE INDEX idx_cooking_method ON foods(cooking_method);
```

### 2. Search Implementation
```sql
-- Search by English name
SELECT * FROM foods WHERE name_english LIKE '%chicken%';

-- Search by Myanmar name
SELECT * FROM foods WHERE name_myanmar LIKE N'%ကြက်%';

-- Get all items in a category
SELECT * FROM foods WHERE category = 'Vegetables';

-- Get nutritional info for different cooking methods
SELECT name_english, cooking_method, calories_per_100g_cooked 
FROM foods 
WHERE name_english = 'Chicken Breast'
ORDER BY calories_per_100g_cooked;
```

### 3. Portion Size Calculations
```javascript
// Calculate calories for specific portion
function calculateCalories(foodId, weightGrams, cookingMethod) {
    const food = getFoodById(foodId);
    const caloriesPer100g = cookingMethod === 'Raw' ? 
        food.calories_per_100g_raw : 
        food.calories_per_100g_cooked;
    
    return (caloriesPer100g * weightGrams) / 100;
}

// Calculate macros for portion
function calculateMacros(foodId, weightGrams) {
    const food = getFoodById(foodId);
    return {
        protein: (food.protein_g * weightGrams) / 100,
        fat: (food.fat_g * weightGrams) / 100,
        carbs: (food.carbs_g * weightGrams) / 100,
        fiber: (food.fiber_g * weightGrams) / 100
    };
}
```

### 4. API Integration Example
```javascript
// For external nutrition APIs
const nutritionAPIs = {
    usda: {
        url: 'https://api.nal.usda.gov/fdc/v1/',
        key: 'YOUR_API_KEY'
    },
    nutritionix: {
        url: 'https://api.nutritionix.com/v1.1/',
        appId: 'YOUR_APP_ID',
        appKey: 'YOUR_APP_KEY'
    }
};

// Fetch additional nutrition data
async function enrichNutritionData(foodName) {
    // Check local database first
    let localData = await queryDatabase(foodName);
    
    // If not found, query external API
    if (!localData) {
        const apiData = await fetchFromAPI(foodName);
        // Store in local database
        await saveToDatabase(apiData);
    }
    
    return localData || apiData;
}
```

## Data Quality Guidelines

### Verification Process:
1. Cross-reference with multiple sources
2. Prioritize government databases (USDA, FAO)
3. Use lab-analyzed data when available
4. Account for regional variations
5. Regular updates from reliable sources

### Accuracy Considerations:
- Raw food values: ±5% variance expected
- Cooked food values: ±10% variance due to cooking methods
- Oil absorption: ±15% variance based on temperature and time
- Traditional dishes: May vary by recipe

## Myanmar-Specific Considerations

### Local Foods Included:
- **Mohinga** - National dish (fish soup with noodles)
- **Lahpet** - Fermented tea leaves
- **Ngapi** - Fish/shrimp paste
- **Traditional vegetables**: Water spinach, drumstick, bottle gourd
- **Local fruits**: Durian, rambutan, longan

### Cultural Dietary Patterns:
- High rice consumption (staple food)
- Oil-rich curry preparations
- Fermented foods (ngapi, lahpet)
- Fresh herbs and vegetables with meals
- Fish as primary protein in coastal areas

## Maintenance & Updates

### Regular Updates Needed:
1. Seasonal variations in produce
2. New food products
3. Updated nutritional analysis
4. User-submitted foods (after verification)
5. Restaurant menu items

### Quality Control:
- Review user submissions
- Verify against authoritative sources
- Flag questionable entries
- Regular audits of existing data

## Compliance & Standards

### Following International Standards:
- FAO/INFOODS guidelines
- CODEX Alimentarius standards
- ISO food data standards
- Local Myanmar food regulations

### Data Expression:
- All values per 100g edible portion
- Energy in kilocalories (kcal)
- Macronutrients in grams
- Water content as percentage
- Standardized cooking methods

## Contact & Support

For questions, corrections, or additions to the database:
- Review USDA FoodData Central: https://fdc.nal.usda.gov
- FAO/INFOODS: http://www.fao.org/infoods
- ASEANFOODS: Regional food composition data

## License & Attribution

This database compilation uses public domain nutritional data from:
- USDA FoodData Central (Public Domain)
- FAO/INFOODS (CC0 1.0 Universal)
- Published scientific literature

When using this data, please cite:
"Myanmar Food Nutrition Database, compiled from USDA FoodData Central, FAO/INFOODS, and ASEANFOODS sources, 2024."

## Version History
- v1.0 (2024): Initial release with 180 food items
- Future updates will include:
  - More traditional Myanmar dishes
  - Restaurant menu items
  - Branded products available in Myanmar
  - Micronutrient data (vitamins, minerals)