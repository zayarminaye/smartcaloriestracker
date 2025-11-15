'use client'

import { useState, useEffect } from 'react'
import { Utensils, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DishTemplate {
  id: string
  name_english: string
  name_myanmar: string
  category: string
  typical_calories: number
  image_url?: string
}

interface QuickLogTemplatesProps {
  onSelectTemplate: (template: DishTemplate) => void
  language?: 'mm' | 'en'
}

export function QuickLogTemplates({
  onSelectTemplate,
  language = 'mm'
}: QuickLogTemplatesProps) {
  const [templates, setTemplates] = useState<DishTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates?limit=6')
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {language === 'mm' ? 'လူကြိုက်များသော အစားအသောက်များ' : 'Popular Dishes'}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={cn(
              "relative overflow-hidden rounded-xl",
              "border-2 border-gray-200 dark:border-gray-700",
              "hover:border-primary hover:shadow-lg",
              "transition-all duration-200",
              "p-4 text-left",
              "bg-white dark:bg-gray-900",
              "group"
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Utensils className="w-4 h-4 text-primary" />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                  {language === 'mm' ? template.name_myanmar : template.name_english}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ~{template.typical_calories} kcal
                </p>
              </div>
            </div>

            {/* Quick log indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-1 rounded-full bg-primary text-white">
                <Clock className="w-3 h-3" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
