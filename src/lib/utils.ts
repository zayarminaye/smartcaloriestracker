import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate nutrition for a portion
 */
export function calculateNutrition(
  per100g: {
    calories: number
    protein_g: number
    fat_g: number
    carbs_g: number
    fiber_g: number
  },
  portionGrams: number,
  cookingMultiplier: number = 1.0
) {
  const factor = (portionGrams / 100) * cookingMultiplier
  return {
    calories: Math.round(per100g.calories * factor),
    protein_g: Math.round(per100g.protein_g * factor * 10) / 10,
    fat_g: Math.round(per100g.fat_g * factor * 10) / 10,
    carbs_g: Math.round(per100g.carbs_g * factor * 10) / 10,
    fiber_g: Math.round(per100g.fiber_g * factor * 10) / 10
  }
}

/**
 * Format number with Myanmar number format
 */
export function formatNumber(num: number, locale: 'en' | 'mm' = 'en'): string {
  if (locale === 'mm') {
    // Myanmar digits: ၀ ၁ ၂ ၃ ၄ ၅ ၆ ၇ ၈ ၉
    const mmDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉']
    return num
      .toString()
      .split('')
      .map(char => (char >= '0' && char <= '9' ? mmDigits[parseInt(char)] : char))
      .join('')
  }
  return num.toLocaleString('en-US')
}

/**
 * Calculate daily calorie needs (Mifflin-St Jeor Equation)
 */
export function calculateDailyCalorieNeeds(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number {
  // BMR calculation
  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  }

  // Activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }

  return Math.round(bmr * activityMultipliers[activityLevel])
}

/**
 * Calculate macro percentages
 */
export function calculateMacroPercentages(
  protein_g: number,
  fat_g: number,
  carbs_g: number
) {
  const totalCalories = protein_g * 4 + fat_g * 9 + carbs_g * 4

  if (totalCalories === 0) {
    return { protein: 0, fat: 0, carbs: 0 }
  }

  return {
    protein: Math.round((protein_g * 4 / totalCalories) * 100),
    fat: Math.round((fat_g * 9 / totalCalories) * 100),
    carbs: Math.round((carbs_g * 4 / totalCalories) * 100)
  }
}

/**
 * Format date in Myanmar or English
 */
export function formatDate(date: Date, locale: 'en' | 'mm' = 'en'): string {
  if (locale === 'mm') {
    const months = [
      'ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်',
      'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'
    ]
    const day = formatNumber(date.getDate(), 'mm')
    const month = months[date.getMonth()]
    const year = formatNumber(date.getFullYear(), 'mm')
    return `${day} ${month} ${year}`
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Get meal type based on time
 */
export function getMealTypeFromTime(time: Date): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const hour = time.getHours()

  if (hour >= 5 && hour < 11) return 'breakfast'
  if (hour >= 11 && hour < 15) return 'lunch'
  if (hour >= 18 && hour < 23) return 'dinner'
  return 'snack'
}

/**
 * Get meal emoji
 */
export function getMealEmoji(mealType: string): string {
  const emojis: Record<string, string> = {
    breakfast: '🌅',
    lunch: '🌞',
    dinner: '🌙',
    snack: '🍪'
  }
  return emojis[mealType] || '🍽️'
}

/**
 * Validate Myanmar Unicode text
 */
export function isMyanmarText(text: string): boolean {
  // Myanmar Unicode range: U+1000 to U+109F
  const myanmarRegex = /[\u1000-\u109F]/
  return myanmarRegex.test(text)
}

/**
 * Debounce function for search
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Get progress color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage < 50) return 'text-green-500'
  if (percentage < 80) return 'text-yellow-500'
  if (percentage < 100) return 'text-orange-500'
  return 'text-red-500'
}

/**
 * Calculate streak bonus points
 */
export function calculateStreakBonus(streakDays: number): number {
  if (streakDays < 7) return streakDays * 10
  if (streakDays < 30) return 70 + (streakDays - 7) * 15
  return 70 + 345 + (streakDays - 30) * 20
}

/**
 * Get level from points
 */
export function getLevelFromPoints(points: number): number {
  // Level up every 1000 points
  return Math.floor(points / 1000) + 1
}

/**
 * Get points needed for next level
 */
export function getPointsForNextLevel(currentPoints: number): number {
  const currentLevel = getLevelFromPoints(currentPoints)
  const nextLevelPoints = currentLevel * 1000
  return nextLevelPoints - currentPoints
}
