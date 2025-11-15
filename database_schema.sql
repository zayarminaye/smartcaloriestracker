-- Myanmar Food Nutrition Database Schema
-- Version 1.0
-- Compatible with MySQL, PostgreSQL, SQLite

-- Drop existing tables if they exist
DROP TABLE IF EXISTS cooking_methods;
DROP TABLE IF EXISTS food_nutrients;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS categories;

-- Create categories table
CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    category_name_mm NVARCHAR(50),
    description TEXT
);

-- Create main foods table
CREATE TABLE foods (
    food_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name_english VARCHAR(100) NOT NULL,
    name_myanmar NVARCHAR(100),
    category_id INTEGER,
    subcategory VARCHAR(50),
    
    -- Basic nutritional values (per 100g raw)
    calories_raw DECIMAL(6,2),
    protein_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fiber_g DECIMAL(4,2),
    sugar_g DECIMAL(4,2),
    
    -- Additional nutrients
    sodium_mg DECIMAL(6,2),
    potassium_mg DECIMAL(6,2),
    calcium_mg DECIMAL(6,2),
    iron_mg DECIMAL(4,2),
    vitamin_a_iu DECIMAL(8,2),
    vitamin_c_mg DECIMAL(5,2),
    
    -- Physical properties
    water_percent DECIMAL(5,2),
    edible_portion DECIMAL(5,2) DEFAULT 100.0,
    
    -- Metadata
    source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Create cooking methods table
CREATE TABLE cooking_methods (
    method_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    food_id INTEGER NOT NULL,
    cooking_method VARCHAR(50) NOT NULL,
    
    -- Nutritional values after cooking (per 100g cooked)
    calories_cooked DECIMAL(6,2),
    protein_cooked DECIMAL(5,2),
    fat_cooked DECIMAL(5,2),
    carbs_cooked DECIMAL(5,2),
    fiber_cooked DECIMAL(4,2),
    
    -- Cooking factors
    weight_change_factor DECIMAL(4,2) DEFAULT 1.0, -- Weight after cooking / weight before
    oil_absorbed_g DECIMAL(4,2) DEFAULT 0.0,
    water_change_percent DECIMAL(5,2),
    
    -- Additional info
    cooking_time_min INTEGER,
    cooking_temp_c INTEGER,
    notes TEXT,
    
    FOREIGN KEY (food_id) REFERENCES foods(food_id) ON DELETE CASCADE,
    UNIQUE KEY unique_food_method (food_id, cooking_method)
);

-- Create indexes for better performance
CREATE INDEX idx_foods_name_en ON foods(name_english);
CREATE INDEX idx_foods_name_mm ON foods(name_myanmar);
CREATE INDEX idx_foods_category ON foods(category_id);
CREATE INDEX idx_foods_calories ON foods(calories_raw);
CREATE INDEX idx_cooking_method ON cooking_methods(cooking_method);

-- Insert categories
INSERT INTO categories (category_name, category_name_mm, description) VALUES
('Grains', 'အစေ့အဆန်', 'Rice, wheat, and grain products'),
('Meat', 'အသား', 'Poultry, pork, beef'),
('Seafood', 'ပင်လယ်စာ', 'Fish, shellfish, and seafood'),
('Vegetables', 'ဟင်းသီးဟင်းရွက်', 'All vegetables'),
('Fruits', 'သစ်သီးများ', 'Fresh fruits'),
('Legumes', 'ပဲများ', 'Beans, peas, lentils'),
('Dairy', 'နို့ထွက်ပစ္စည်း', 'Milk and dairy products'),
('Nuts & Seeds', 'အခွံမာသီး', 'Nuts, seeds, and coconut'),
('Herbs & Spices', 'ဟင်းခတ်အမွှေးအကြိုင်', 'Herbs, spices, and seasonings'),
('Oils & Fats', 'ဆီများ', 'Cooking oils and fats'),
('Beverages', 'အချိုရည်များ', 'Drinks and beverages'),
('Dishes', 'ဟင်းလျာများ', 'Prepared dishes'),
('Snacks', 'မုန့်များ', 'Snack foods');

-- Sample data insertion for common foods
-- Rice
INSERT INTO foods (name_english, name_myanmar, category_id, subcategory, calories_raw, protein_g, fat_g, carbs_g, fiber_g, water_percent, source) VALUES
('White Rice', 'ထမင်းဖြူ', 1, 'Rice', 365, 7.13, 0.66, 79.95, 1.3, 11.62, 'USDA'),
('Brown Rice', 'ထမင်းညို', 1, 'Rice', 370, 7.94, 2.92, 77.24, 3.5, 10.37, 'USDA'),
('Sticky Rice', 'ကောက်ညှင်း', 1, 'Rice', 370, 6.81, 0.55, 81.68, 2.4, 10.46, 'USDA');

-- Cooking methods for rice
INSERT INTO cooking_methods (food_id, cooking_method, calories_cooked, protein_cooked, fat_cooked, carbs_cooked, fiber_cooked, weight_change_factor, water_change_percent) VALUES
(1, 'Boiled', 130, 2.69, 0.28, 28.17, 0.4, 2.3, 68.7),
(1, 'Fried', 168, 2.94, 3.5, 31.5, 0.4, 2.0, 60.0),
(2, 'Boiled', 111, 2.54, 0.93, 22.96, 3.5, 2.5, 73.09),
(3, 'Steamed', 97, 2.02, 0.21, 21.09, 1.0, 2.2, 77.0);

-- Chicken
INSERT INTO foods (name_english, name_myanmar, category_id, subcategory, calories_raw, protein_g, fat_g, carbs_g, fiber_g, water_percent, source) VALUES
('Chicken Breast', 'ကြက်သားရင်', 2, 'Poultry', 165, 31.02, 3.57, 0, 0, 65.26, 'USDA'),
('Chicken Thigh', 'ကြက်ပေါင်', 2, 'Poultry', 209, 18.6, 14.7, 0, 0, 68.5, 'USDA'),
('Chicken Wings', 'ကြက်တောင်ပံ', 2, 'Poultry', 203, 30.5, 8.1, 0, 0, 65.78, 'USDA');

-- Cooking methods for chicken
INSERT INTO cooking_methods (food_id, cooking_method, calories_cooked, protein_cooked, fat_cooked, carbs_cooked, fiber_cooked, weight_change_factor, oil_absorbed_g) VALUES
(4, 'Grilled', 165, 31.02, 3.57, 0, 0, 0.75, 0),
(4, 'Fried', 246, 27.38, 13.49, 8.99, 0, 0.85, 10),
(4, 'Curry', 210, 28.5, 9.5, 3.2, 0.5, 0.95, 5);

-- Vegetables
INSERT INTO foods (name_english, name_myanmar, category_id, subcategory, calories_raw, protein_g, fat_g, carbs_g, fiber_g, water_percent, source) VALUES
('Tomato', 'ခရမ်းချဉ်သီး', 4, 'Fruit-vegetable', 18, 0.88, 0.2, 3.89, 1.2, 94.52, 'USDA'),
('Cabbage', 'ဂေါ်ဖီထုပ်', 4, 'Cruciferous', 25, 1.28, 0.1, 5.8, 2.5, 92.18, 'USDA'),
('Spinach', 'ဟင်းနုနွယ်ရွက်', 4, 'Leafy', 23, 2.86, 0.39, 3.63, 2.2, 91.4, 'USDA'),
('Water Spinach', 'ကန်စွန်း', 4, 'Leafy', 19, 2.6, 0.2, 3.14, 2.1, 92.32, 'ASEANFOODS'),
('Onion', 'ကြက်သွန်နီ', 4, 'Allium', 40, 1.1, 0.1, 9.34, 1.7, 89.11, 'USDA');

-- Fish
INSERT INTO foods (name_english, name_myanmar, category_id, subcategory, calories_raw, protein_g, fat_g, carbs_g, fiber_g, water_percent, source) VALUES
('Tilapia', 'တီလာပီးယား', 3, 'Fish', 96, 20.08, 1.7, 0, 0, 78.08, 'USDA'),
('Catfish', 'ငါးခူ', 3, 'Fish', 105, 18.47, 2.82, 0, 0, 76.38, 'USDA'),
('Shrimp', 'ပုစွန်', 3, 'Shellfish', 99, 20.91, 1.08, 0.91, 0, 74.33, 'USDA');

-- Traditional Myanmar ingredients
INSERT INTO foods (name_english, name_myanmar, category_id, subcategory, calories_raw, protein_g, fat_g, carbs_g, fiber_g, water_percent, source, notes) VALUES
('Fish Paste', 'ငပိ', 9, 'Fermented', 179, 34.9, 2.0, 10.0, 0, 48.3, 'ASEANFOODS', 'Ngapi - fermented fish/shrimp paste'),
('Tea Leaves Pickled', 'လက်ဖက်သုတ်', 9, 'Fermented', 22, 1.3, 0.6, 4.5, 3.7, 89.9, 'Myanmar Food Atlas', 'Lahpet - fermented tea leaves'),
('Bamboo Shoots', 'ဝါးပုပ်', 4, 'Shoot', 27, 2.6, 0.3, 5.2, 2.2, 91.0, 'ASEANFOODS', 'Fresh young shoots'),
('Lemongrass', 'စပါး', 9, 'Herb', 99, 1.82, 0.49, 25.31, 2.7, 70.58, 'USDA', 'Cymbopogon citratus');

-- Create view for easy querying
CREATE VIEW food_nutrition_view AS
SELECT 
    f.food_id,
    f.name_english,
    f.name_myanmar,
    c.category_name,
    f.subcategory,
    f.calories_raw,
    f.protein_g,
    f.fat_g,
    f.carbs_g,
    f.fiber_g,
    cm.cooking_method,
    cm.calories_cooked,
    f.water_percent,
    f.source,
    f.notes
FROM foods f
LEFT JOIN categories c ON f.category_id = c.category_id
LEFT JOIN cooking_methods cm ON f.food_id = cm.food_id;

-- Stored procedures for common queries
DELIMITER //

-- Procedure to search food by name (English or Myanmar)
CREATE PROCEDURE SearchFood(IN search_term VARCHAR(100))
BEGIN
    SELECT * FROM food_nutrition_view
    WHERE name_english LIKE CONCAT('%', search_term, '%')
    OR name_myanmar LIKE CONCAT('%', search_term, '%');
END //

-- Procedure to calculate calories for portion
CREATE PROCEDURE CalculatePortionCalories(
    IN p_food_id INT,
    IN p_weight_grams DECIMAL(6,2),
    IN p_cooking_method VARCHAR(50)
)
BEGIN
    SELECT 
        f.name_english,
        f.name_myanmar,
        p_weight_grams as portion_grams,
        p_cooking_method as cooking_method,
        CASE 
            WHEN p_cooking_method = 'Raw' THEN ROUND((f.calories_raw * p_weight_grams / 100), 2)
            ELSE ROUND((cm.calories_cooked * p_weight_grams / 100), 2)
        END as total_calories,
        ROUND((f.protein_g * p_weight_grams / 100), 2) as total_protein,
        ROUND((f.fat_g * p_weight_grams / 100), 2) as total_fat,
        ROUND((f.carbs_g * p_weight_grams / 100), 2) as total_carbs,
        ROUND((f.fiber_g * p_weight_grams / 100), 2) as total_fiber
    FROM foods f
    LEFT JOIN cooking_methods cm ON f.food_id = cm.food_id AND cm.cooking_method = p_cooking_method
    WHERE f.food_id = p_food_id;
END //

-- Procedure to get all cooking methods for a food
CREATE PROCEDURE GetCookingMethods(IN p_food_id INT)
BEGIN
    SELECT 
        f.name_english,
        'Raw' as cooking_method,
        f.calories_raw as calories_per_100g
    FROM foods f
    WHERE f.food_id = p_food_id
    
    UNION ALL
    
    SELECT 
        f.name_english,
        cm.cooking_method,
        cm.calories_cooked as calories_per_100g
    FROM foods f
    JOIN cooking_methods cm ON f.food_id = cm.food_id
    WHERE f.food_id = p_food_id
    ORDER BY calories_per_100g;
END //

DELIMITER ;

-- Sample queries for testing
-- Get all vegetables
-- SELECT * FROM food_nutrition_view WHERE category_name = 'Vegetables';

-- Search for chicken dishes
-- CALL SearchFood('chicken');

-- Calculate calories for 150g of cooked rice
-- CALL CalculatePortionCalories(1, 150, 'Boiled');

-- Get all cooking methods for chicken breast
-- CALL GetCookingMethods(4);

-- Grant permissions (adjust based on your database system)
-- GRANT SELECT, INSERT, UPDATE ON myanmar_food_db.* TO 'app_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE myanmar_food_db.* TO 'app_user'@'localhost';