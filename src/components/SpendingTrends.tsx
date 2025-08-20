'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';

interface SpendingTrendsProps {
  period: string;
}

interface ChartData {
  date: string;
  wydatki: number;
  przychody: number;
  oszczędności: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value} zł
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SpendingTrends({ period }: SpendingTrendsProps) {
  const { transactions, loading } = useTransactions();

  const chartData = useMemo(() => {
    if (loading || !transactions.length) {
      return [];
    }

    // Grupuj transakcje według daty
    const groupedByDate = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short'
      });

      if (!acc[date]) {
        acc[date] = { date, wydatki: 0, przychody: 0, oszczędności: 0 };
      }

      if (transaction.type === 'EXPENSE') {
        acc[date].wydatki += Number(transaction.amount);
      } else {
        acc[date].przychody += Number(transaction.amount);
      }

      return acc;
    }, {} as Record<string, ChartData>);

    // Konwertuj na tablicę i oblicz oszczędności
    const data: ChartData[] = Object.values(groupedByDate).map((item, index, array) => {
      const previousSavings = index > 0 ? array[index - 1]?.oszczędności || 0 : 0;
      const oszczędności = previousSavings + item.przychody - item.wydatki;

      return {
        ...item,
        oszczędności: Math.max(0, oszczędności) // Nie pokazuj negatywnych oszczędności
      };
    });

    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, loading]);

  const stats = useMemo(() => {
    if (!transactions.length) {
      return {
        averageDailyExpenses: 0,
        highestExpense: 0,
        daysWithoutExpenses: 0
      };
    }

    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const averageDailyExpenses = totalExpenses / 30; // Przybliżenie

    const highestExpense = Math.max(...expenses.map(t => Number(t.amount)));

    // Liczba dni z wydatkami
    const daysWithExpenses = new Set(expenses.map(t =>
      new Date(t.date).toDateString()
    )).size;
    const daysWithoutExpenses = 30 - daysWithExpenses; // Przybliżenie

    return {
      averageDailyExpenses: Math.round(averageDailyExpenses),
      highestExpense: Math.round(highestExpense),
      daysWithoutExpenses: Math.max(0, daysWithoutExpenses)
    };
  }, [transactions]);

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Brak danych do wyświetlenia</p>
          <p className="text-sm text-gray-400">Dodaj transakcje, aby zobaczyć trendy</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Trendy wydatków</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Wydatki</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Przychody</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Oszczędności</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `${value} zł`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="wydatki"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="przychody"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="oszczędności"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600">Średnie dzienne wydatki</p>
          <p className="text-lg font-semibold text-red-600">{stats.averageDailyExpenses} zł</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Najwyższy wydatek</p>
          <p className="text-lg font-semibold text-red-600">{stats.highestExpense} zł</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Dni bez wydatków</p>
          <p className="text-lg font-semibold text-green-600">{stats.daysWithoutExpenses}</p>
        </div>
      </div>
    </div>
  );
}
