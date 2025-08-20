import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  category: {
    name: string
    icon: string
    color: string
  }
  description?: string
  date: string
  createdAt: string
  updatedAt: string
}

export function useTransactions() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      setTransactions([])
      setLoading(false)
      return
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/transactions?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })

        if (!response.ok) {
          throw new Error('Błąd podczas pobierania transakcji')
        }

        const data = await response.json()
        setTransactions(data.transactions || [])
      } catch (err) {
        console.error('Błąd pobierania transakcji:', err)
        setError(err instanceof Error ? err.message : 'Nieznany błąd')
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [session])

  return { transactions, loading, error }
}
