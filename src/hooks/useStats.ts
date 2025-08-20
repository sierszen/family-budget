import { useMemo } from 'react'
import { useTransactions } from './useTransactions'

export interface Stats {
  income: number
  expenses: number
  savings: number
  budgetLimit: number
}

export function useStats() {
  const { transactions, loading } = useTransactions()

  const stats = useMemo(() => {
    if (loading || !transactions || transactions.length === 0) {
      return {
        income: 0,
        expenses: 0,
        savings: 0,
        budgetLimit: 0
      }
    }

    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const savings = income - expenses
    const budgetLimit = expenses > 0 ? Math.round((expenses / (income || 1)) * 100) : 0

    return {
      income,
      expenses,
      savings,
      budgetLimit
    }
  }, [transactions, loading])

  return { stats, loading }
}
