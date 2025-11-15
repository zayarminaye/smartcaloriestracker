'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Sparkles, Loader2 } from 'lucide-react'
import { cn, debounce } from '@/lib/utils'

interface SmartDishInputProps {
  onExtract: (dishText: string) => void
  placeholder?: string
  language?: 'mm' | 'en'
}

export function SmartDishInput({
  onExtract,
  placeholder,
  language = 'mm'
}: SmartDishInputProps) {
  const [value, setValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Common Myanmar dish suggestions
  const commonDishes = {
    mm: [
      'ကြက်သား ဟင်း',
      'မုန့်ဟင်းခါး',
      'ရှမ်းခေါက်ဆွဲ',
      'လက်ဖက်သုတ်',
      'ကြက်သား ကြော်',
      'ငါး ဟင်း',
      'ဝက်သား ဟင်း',
      'အာလူး ဟင်း'
    ],
    en: [
      'Chicken curry',
      'Mohinga',
      'Shan noodles',
      'Tea leaf salad',
      'Fried chicken',
      'Fish curry',
      'Pork curry',
      'Potato curry'
    ]
  }

  // Filter suggestions based on input
  useEffect(() => {
    if (value.length > 1) {
      const filtered = commonDishes[language].filter(dish =>
        dish.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [value, language])

  const handleSubmit = async () => {
    if (value.trim().length < 3) return

    setIsProcessing(true)
    try {
      await onExtract(value)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (language === 'mm' ? 'ဘာစားလဲ?' : "What did you eat?")}
          className={cn(
            "w-full px-4 py-3 pl-12 pr-16",
            "text-lg rounded-2xl",
            "border-2 border-gray-200 dark:border-gray-700",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "bg-white dark:bg-gray-900",
            "resize-none overflow-hidden",
            "transition-all duration-200",
            "font-myanmar" // Custom font class for Myanmar text
          )}
          rows={1}
          style={{
            minHeight: '56px',
            maxHeight: '120px'
          }}
          disabled={isProcessing}
        />

        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

        <button
          onClick={handleSubmit}
          disabled={isProcessing || value.trim().length < 3}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "p-2 rounded-xl",
            "bg-primary text-white",
            "hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200",
            "flex items-center gap-2"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && !isProcessing && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setValue(suggestion)
                setSuggestions([])
                inputRef.current?.focus()
              }}
              className={cn(
                "w-full px-4 py-3 text-left",
                "hover:bg-gray-50 dark:hover:bg-gray-800",
                "transition-colors duration-150",
                "border-b border-gray-100 dark:border-gray-800 last:border-0"
              )}
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">
                  {suggestion}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 px-4">
        {language === 'mm'
          ? 'ဥပမာ - "ကြက်သား နဲ့ အာလူး ဟင်း"'
          : 'Example: "Chicken and potato curry"'
        }
      </p>
    </div>
  )
}
