'use client'

import { useEffect, useState } from 'react'
import { cn, formatNumber } from '@/lib/utils'

interface CalorieRingProps {
  current: number
  target: number
  language?: 'mm' | 'en'
  size?: 'sm' | 'md' | 'lg'
}

export function CalorieRing({
  current,
  target,
  language = 'mm',
  size = 'lg'
}: CalorieRingProps) {
  const [progress, setProgress] = useState(0)
  const percentage = Math.min((current / target) * 100, 100)

  useEffect(() => {
    // Animate progress
    const timer = setTimeout(() => setProgress(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const sizes = {
    sm: { radius: 50, stroke: 8, text: 'text-xl' },
    md: { radius: 70, stroke: 10, text: 'text-2xl' },
    lg: { radius: 90, stroke: 12, text: 'text-4xl' }
  }

  const config = sizes[size]
  const circumference = 2 * Math.PI * config.radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const getColor = () => {
    if (percentage < 50) return '#10b981' // green
    if (percentage < 80) return '#f59e0b' // yellow
    if (percentage < 100) return '#f97316' // orange
    return '#ef4444' // red
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={(config.radius + config.stroke) * 2}
        height={(config.radius + config.stroke) * 2}
      >
        {/* Background circle */}
        <circle
          cx={config.radius + config.stroke}
          cy={config.radius + config.stroke}
          r={config.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Progress circle */}
        <circle
          cx={config.radius + config.stroke}
          cy={config.radius + config.stroke}
          r={config.radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={cn(config.text, "font-bold text-gray-900 dark:text-white")}>
          {formatNumber(Math.round(current), language)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          / {formatNumber(target, language)}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {language === 'mm' ? 'kcal' : 'kcal'}
        </div>
      </div>
    </div>
  )
}
