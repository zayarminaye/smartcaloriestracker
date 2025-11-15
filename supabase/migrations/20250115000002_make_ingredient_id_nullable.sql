-- Make ingredient_id nullable in meal_items table
-- This allows saving AI-estimated ingredients that aren't in the database

ALTER TABLE meal_items
ALTER COLUMN ingredient_id DROP NOT NULL;

-- Add comment explaining the nullable ingredient_id
COMMENT ON COLUMN meal_items.ingredient_id IS 'Foreign key to ingredients table. NULL for AI-estimated ingredients not in database';
