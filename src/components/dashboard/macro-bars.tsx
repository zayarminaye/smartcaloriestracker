'use client'

import { cn, formatNumber } from '@/lib/utils'

interface MacroBarsProps {
  protein: { current: number; target: number }
  fat: { current: number; target: number }
  carbs: { current: number; target: number }
  language?: 'mm' | 'en'
}

export function MacroBars({ protein, fat, carbs, language = 'mm' }: MacroBarsProps) {
  const macros = [
    {
      name: language === 'mm' ? 'ပရိုတင်း' : 'Protein',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      current: protein.current,
      target: protein.target,
      unit: 'g'
    },
    {
      name: language === 'mm' ? 'အဆီ' : 'Fat',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      current: fat.current,
      target: fat.target,
      unit: 'g'
    },
    {
      name: language === 'mm' ? 'ကာဗွန်ဟိုက်ဒရိတ်' : 'Carbs',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      current: carbs.current,
      target: carbs.target,
      unit: 'g'
    }
  ]

  return (
    <div className="space-y-4">
      {macros.map((macro) => {
        const percentage = Math.min((macro.current / macro.target) * 100, 100)

        return (
          <div key={macro.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {macro.name}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {formatNumber(Math.round(macro.current), language)}
                {' / '}
                {formatNumber(Math.round(macro.target), language)}
                {macro.unit}
              </span>
            </div>

            <div className={cn("h-3 rounded-full overflow-hidden", macro.bgColor)}>
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  macro.color
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
