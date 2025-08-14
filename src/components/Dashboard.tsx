'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Calendar,
  Target
} from 'lucide-react';
import { BudgetCard } from './BudgetCard';
import { ExpenseChart } from './ExpenseChart';
import { RecentTransactions } from './RecentTransactions';
import { AIInsights } from './AIInsights';
import { useStats } from '@/hooks/useStats';

export function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { stats, loading } = useStats();

  const statsCards = [
    {
      title: 'Przychody',
      value: loading ? 'Ładowanie...' : `${stats.income.toFixed(2)} zł`,
      change: '+0%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Wydatki',
      value: loading ? 'Ładowanie...' : `${stats.expenses.toFixed(2)} zł`,
      change: '+0%',
      changeType: 'negative' as const,
      icon: TrendingDown,
      color: 'red'
    },
    {
      title: 'Oszczędności',
      value: loading ? 'Ładowanie...' : `${stats.savings.toFixed(2)} zł`,
      change: '+0%',
      changeType: stats.savings >= 0 ? 'positive' as const : 'negative' as const,
      icon: DollarSign,
      color: stats.savings >= 0 ? 'blue' : 'red'
    },
    {
      title: 'Limit miesięczny',
      value: loading ? 'Ładowanie...' : `${stats.budgetLimit}%`,
      change: `${100 - stats.budgetLimit}% pozostało`,
      changeType: stats.budgetLimit > 80 ? 'warning' as const : 'positive' as const,
      icon: Target,
      color: stats.budgetLimit > 80 ? 'orange' : 'green'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Przegląd Twojego budżetu rodzinnego</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Tydzień</option>
            <option value="month">Miesiąc</option>
            <option value="quarter">Kwartał</option>
            <option value="year">Rok</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <BudgetCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Wydatki według kategorii</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Ostatnie 30 dni</span>
            </div>
          </div>
          <ExpenseChart />
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Podpowiedzi</h3>
          <AIInsights />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Ostatnie transakcje</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Zobacz wszystkie
          </button>
        </div>
        <RecentTransactions />
      </div>

      {/* Alerts - tylko jeśli są przekroczenia */}
      {stats.budgetLimit > 80 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
            <div>
              <h4 className="font-semibold text-orange-900">Uwaga: Przekroczenie limitu</h4>
              <p className="text-orange-700 mt-1">
                Wydatki przekroczyły {stats.budgetLimit}% przychodów. Rozważ ograniczenie wydatków.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
