'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Edit, Trash2, Plus, Minus } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'

interface TransactionListProps {
  searchTerm: string
  category: string
}

export function TransactionList({ searchTerm, category }: TransactionListProps) {
  const { data: session } = useSession()
  const { transactions, loading, error } = useTransactions()
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])

  useEffect(() => {
    if (!transactions) return

    let filtered = transactions

    // Filtruj po wyszukiwaniu
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtruj po kategorii
    if (category !== 'all') {
      filtered = filtered.filter(transaction =>
        transaction.category.name.toLowerCase() === category.toLowerCase()
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, category])

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę transakcję?')) {
      return
    }

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania transakcji')
      }

      // Odśwież listę
      window.location.reload()
    } catch (error) {
      console.error('Błąd usuwania:', error)
      alert('Błąd podczas usuwania transakcji')
    }
  }

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'jedzenie':
        return 'bg-blue-100 text-blue-800'
      case 'transport':
        return 'bg-green-100 text-green-800'
      case 'mieszkanie':
        return 'bg-red-100 text-red-800'
      case 'rozrywka':
        return 'bg-yellow-100 text-yellow-800'
      case 'zdrowie':
        return 'bg-purple-100 text-purple-800'
      case 'przychód':
      case 'wynagrodzenie':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Błąd podczas ładowania transakcji: {error}</p>
      </div>
    )
  }

  if (!filteredTransactions.length) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-4">
          <Plus className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Brak transakcji</h3>
        <p className="text-gray-500">
          {searchTerm || category !== 'all' 
            ? 'Nie znaleziono transakcji spełniających kryteria wyszukiwania.'
            : 'Dodaj pierwszą transakcję, aby rozpocząć śledzenie wydatków.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {filteredTransactions.map((transaction) => {
        const amount = Number(transaction.amount)
        const isIncome = transaction.type === 'INCOME'
        
        return (
          <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isIncome ? (
                    <Plus className={`h-5 w-5 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
                  ) : (
                    <Minus className={`h-5 w-5 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{transaction.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category.name)}`}>
                      {transaction.category.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('pl-PL')}
                    </span>
                    {transaction.description && (
                      <span className="text-sm text-gray-500">• {transaction.description}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`font-semibold text-lg ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'}{Math.abs(amount).toFixed(2)} zł
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {/* TODO: Implement edit */}}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edytuj"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Usuń"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
