export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ingredients: {
        Row: {
          id: string
          name_english: string
          name_myanmar: string
          category: string
          subcategory: string | null
          calories_per_100g: number
          protein_g: number
          fat_g: number
          carbs_g: number
          fiber_g: number
          sodium_mg: number | null
          calcium_mg: number | null
          iron_mg: number | null
          vitamin_a_iu: number | null
          vitamin_c_mg: number | null
          data_source: string
          confidence_score: number
          verified: boolean
          verified_by: string | null
          verified_at: string | null
          usage_count: number
          last_used_at: string | null
          notes: string | null
          image_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name_english: string
          name_myanmar: string
          category: string
          subcategory?: string | null
          calories_per_100g: number
          protein_g?: number
          fat_g?: number
          carbs_g?: number
          fiber_g?: number
          sodium_mg?: number | null
          calcium_mg?: number | null
          iron_mg?: number | null
          vitamin_a_iu?: number | null
          vitamin_c_mg?: number | null
          data_source: string
          confidence_score?: number
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          usage_count?: number
          last_used_at?: string | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name_english?: string
          name_myanmar?: string
          category?: string
          subcategory?: string | null
          calories_per_100g?: number
          protein_g?: number
          fat_g?: number
          carbs_g?: number
          fiber_g?: number
          sodium_mg?: number | null
          calcium_mg?: number | null
          iron_mg?: number | null
          vitamin_a_iu?: number | null
          vitamin_c_mg?: number | null
          data_source?: string
          confidence_score?: number
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          usage_count?: number
          last_used_at?: string | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      cooking_methods: {
        Row: {
          id: string
          ingredient_id: string
          method_name: string
          calorie_multiplier: number
          calories_per_100g_cooked: number | null
          water_content_percent: number | null
          added_fat_g: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          method_name: string
          calorie_multiplier?: number
          calories_per_100g_cooked?: number | null
          water_content_percent?: number | null
          added_fat_g?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          method_name?: string
          calorie_multiplier?: number
          calories_per_100g_cooked?: number | null
          water_content_percent?: number | null
          added_fat_g?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          full_name: string | null
          display_name: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: string | null
          height_cm: number | null
          current_weight_kg: number | null
          target_weight_kg: number | null
          daily_calorie_target: number
          daily_protein_target_g: number | null
          daily_fat_target_g: number | null
          daily_carbs_target_g: number | null
          activity_level: string | null
          dietary_preferences: Json
          allergies: Json
          preferred_language: string
          points: number
          level: number
          streak_days: number
          longest_streak: number
          last_log_date: string | null
          notifications_enabled: boolean
          reminder_times: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: string | null
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          daily_calorie_target?: number
          daily_protein_target_g?: number | null
          daily_fat_target_g?: number | null
          daily_carbs_target_g?: number | null
          activity_level?: string | null
          dietary_preferences?: Json
          allergies?: Json
          preferred_language?: string
          points?: number
          level?: number
          streak_days?: number
          longest_streak?: number
          last_log_date?: string | null
          notifications_enabled?: boolean
          reminder_times?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: string | null
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          daily_calorie_target?: number
          daily_protein_target_g?: number | null
          daily_fat_target_g?: number | null
          daily_carbs_target_g?: number | null
          activity_level?: string | null
          dietary_preferences?: Json
          allergies?: Json
          preferred_language?: string
          points?: number
          level?: number
          streak_days?: number
          longest_streak?: number
          last_log_date?: string | null
          notifications_enabled?: boolean
          reminder_times?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          meal_type: string | null
          eaten_at: string
          meal_name: string | null
          notes: string | null
          photo_url: string | null
          location: string | null
          total_calories: number
          total_protein_g: number
          total_fat_g: number
          total_carbs_g: number
          total_fiber_g: number
          created_from_template_id: string | null
          ai_generated: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          meal_type?: string | null
          eaten_at?: string
          meal_name?: string | null
          notes?: string | null
          photo_url?: string | null
          location?: string | null
          total_calories?: number
          total_protein_g?: number
          total_fat_g?: number
          total_carbs_g?: number
          total_fiber_g?: number
          created_from_template_id?: string | null
          ai_generated?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          meal_type?: string | null
          eaten_at?: string
          meal_name?: string | null
          notes?: string | null
          photo_url?: string | null
          location?: string | null
          total_calories?: number
          total_protein_g?: number
          total_fat_g?: number
          total_carbs_g?: number
          total_fiber_g?: number
          created_from_template_id?: string | null
          ai_generated?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      meal_items: {
        Row: {
          id: string
          meal_id: string
          ingredient_id: string | null
          cooking_method_id: string | null
          portion_grams: number
          portion_description: string | null
          calories: number
          protein_g: number
          fat_g: number
          carbs_g: number
          fiber_g: number
          confidence_level: string | null
          ai_suggested: boolean
          user_confirmed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          meal_id: string
          ingredient_id?: string | null
          cooking_method_id?: string | null
          portion_grams: number
          portion_description?: string | null
          calories: number
          protein_g: number
          fat_g: number
          carbs_g: number
          fiber_g: number
          confidence_level?: string | null
          ai_suggested?: boolean
          user_confirmed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          meal_id?: string
          ingredient_id?: string | null
          cooking_method_id?: string | null
          portion_grams?: number
          portion_description?: string | null
          calories?: number
          protein_g?: number
          fat_g?: number
          carbs_g?: number
          fiber_g?: number
          confidence_level?: string | null
          ai_suggested?: boolean
          user_confirmed?: boolean
          created_at?: string
        }
      }
      dish_templates: {
        Row: {
          id: string
          name_english: string
          name_myanmar: string
          category: string | null
          description: string | null
          image_url: string | null
          typical_calories: number | null
          typical_protein_g: number | null
          typical_fat_g: number | null
          typical_carbs_g: number | null
          ingredients: Json
          usage_count: number
          popularity_score: number
          user_rating: number | null
          created_by: string | null
          is_public: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_english: string
          name_myanmar: string
          category?: string | null
          description?: string | null
          image_url?: string | null
          typical_calories?: number | null
          typical_protein_g?: number | null
          typical_fat_g?: number | null
          typical_carbs_g?: number | null
          ingredients: Json
          usage_count?: number
          popularity_score?: number
          user_rating?: number | null
          created_by?: string | null
          is_public?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_english?: string
          name_myanmar?: string
          category?: string | null
          description?: string | null
          image_url?: string | null
          typical_calories?: number | null
          typical_protein_g?: number | null
          typical_fat_g?: number | null
          typical_carbs_g?: number | null
          ingredients?: Json
          usage_count?: number
          popularity_score?: number
          user_rating?: number | null
          created_by?: string | null
          is_public?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      daily_summaries: {
        Row: {
          id: string
          user_id: string
          date: string
          total_calories: number
          total_protein_g: number
          total_fat_g: number
          total_carbs_g: number
          total_fiber_g: number
          breakfast_calories: number
          lunch_calories: number
          dinner_calories: number
          snacks_calories: number
          calorie_goal: number | null
          goal_achieved: boolean
          weight_kg: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total_calories?: number
          total_protein_g?: number
          total_fat_g?: number
          total_carbs_g?: number
          total_fiber_g?: number
          breakfast_calories?: number
          lunch_calories?: number
          dinner_calories?: number
          snacks_calories?: number
          calorie_goal?: number | null
          goal_achieved?: boolean
          weight_kg?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_calories?: number
          total_protein_g?: number
          total_fat_g?: number
          total_carbs_g?: number
          total_fiber_g?: number
          breakfast_calories?: number
          lunch_calories?: number
          dinner_calories?: number
          snacks_calories?: number
          calorie_goal?: number | null
          goal_achieved?: boolean
          weight_kg?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
