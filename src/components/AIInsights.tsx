'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Brain, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface Insight {
  type: 'positive' | 'negative' | 'warning'
  title: string
  description: string
  icon: React.ComponentType<any>
}

export function AIInsights() {
  const { data: session } = useSession()
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getIconByType = (type: 'positive' | 'negative' | 'warning') => {
    switch (type) {
      case 'positive':
        return TrendingUp
      case 'negative':
        return TrendingDown
      case 'warning':
        return AlertTriangle
      default:
        return TrendingUp
    }
  }

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true)
              const response = await fetch(`/api/insights?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

      if (!response.ok) {
        throw new Error('Błąd podczas pobierania podpowiedzi AI')
      }

      const data = await response.json()

      if (data.insights && Array.isArray(data.insights)) {
        // Używamy tylko znanych pól i mapujemy ikonę po typie, ignorując ewentualne niepoprawne pola z API
        const sanitized = data.insights
          .filter((it: any) => it && typeof it.title === 'string' && typeof it.description === 'string')
          .map((it: any) => {
            const type: 'positive' | 'negative' | 'warning' =
              it.type === 'negative' ? 'negative' : it.type === 'warning' ? 'warning' : 'positive'
            return {
              type,
              title: it.title,
              description: it.description,
              icon: getIconByType(type)
            } as Insight
          })

        setInsights(sanitized)
      } else {
        // Fallback insights jeśli API nie zwraca danych
        setInsights([
          {
            type: 'positive',
            title: 'Dobra kontrola wydatków',
            description: 'Twoje wydatki są w normie. Kontynuuj oszczędzanie!',
            icon: TrendingUp
          },
          {
            type: 'warning',
            title: 'Rozważ oszczędności',
            description: 'Możesz zaoszczędzić więcej na kategorii "Rozrywka".',
            icon: AlertTriangle
          }
        ])
      }
    } catch (err) {
      console.error('Błąd pobierania insights:', err)
      setError(err instanceof Error ? err.message : 'Nieznany błąd')
      // Fallback insights
      setInsights([
        {
          type: 'positive',
          title: 'Dobra kontrola wydatków',
          description: 'Twoje wydatki są w normie. Kontynuuj oszczędzanie!',
          icon: TrendingUp
        },
        {
          type: 'warning',
          title: 'Rozważ oszczędności',
          description: 'Możesz zaoszczędzić więcej na kategorii "Rozrywka".',
          icon: AlertTriangle
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchInsights()
    }
  }, [session, fetchInsights])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Błąd ładowania podpowiedzi AI</p>
        <button
          onClick={fetchInsights}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Spróbuj ponownie
        </button>
      </div>
    )
  }

  if (!insights.length) {
    return (
      <div className="text-center py-4">
        <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Brak podpowiedzi AI</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => {
        const Icon = insight.icon
        const getIconColor = () => {
          switch (insight.type) {
            case 'positive':
              return 'text-green-600'
            case 'negative':
              return 'text-red-600'
            case 'warning':
              return 'text-yellow-600'
            default:
              return 'text-gray-600'
          }
        }

        const getBgColor = () => {
          switch (insight.type) {
            case 'positive':
              return 'bg-green-50 border-green-200'
            case 'negative':
              return 'bg-red-50 border-red-200'
            case 'warning':
              return 'bg-yellow-50 border-yellow-200'
            default:
              return 'bg-gray-50 border-gray-200'
          }
        }

        return (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getBgColor()} transition-colors hover:shadow-sm`}
          >
            <div className="flex items-start space-x-3">
              <Icon className={`h-5 w-5 mt-0.5 ${getIconColor()}`} />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm mb-1">
                  {insight.title}
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
