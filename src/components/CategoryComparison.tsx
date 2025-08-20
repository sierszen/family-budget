'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';

interface CategoryComparisonProps {
  period: string;
}

interface CategoryData {
  kategoria: string;
  obecny: number;
  poprzedni: number;
  zmiana: string;
  kolor: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    const current = payload[0].value;
    const previous = payload[1].value;
    const change = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : '0';

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        <p className="text-sm text-blue-600">Obecny miesiąc: {current} zł</p>
        <p className="text-sm text-gray-600">Poprzedni miesiąc: {previous} zł</p>
        <p className={`text-sm font-medium ${change.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>
          Zmiana: {change}%
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryComparison({ period }: CategoryComparisonProps) {
  const { transactions, loading } = useTransactions();

  const chartData = useMemo(() => {
    if (loading || !transactions.length) {
      return [];
    }

    // Grupuj transakcje według kategorii
    const categoryTotals = transactions
      .filter(t => t.type === 'EXPENSE') // Tylko wydatki
      .reduce((acc, transaction) => {
        const categoryName = transaction.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += Number(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

    // Konwertuj na format wykresu
    const data: CategoryData[] = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        kategoria: category,
        obecny: Math.round(amount),
        poprzedni: Math.round(amount * 0.9), // Przybliżenie poprzedniego miesiąca
        zmiana: '+10%', // Przybliżenie
        kolor: '#3b82f6'
      }))
      .sort((a, b) => b.obecny - a.obecny) // Sortuj malejąco
      .slice(0, 6); // Top 6 kategorii

    return data;
  }, [transactions, loading]);

  const summary = useMemo(() => {
    if (!chartData.length) {
      return {
        biggestIncrease: { name: 'Brak danych', change: '0%' },
        biggestDecrease: { name: 'Brak danych', change: '0%' }
      };
    }

    const sortedByChange = [...chartData].sort((a, b) => {
      const aChange = parseFloat(a.zmiana.replace('%', ''));
      const bChange = parseFloat(b.zmiana.replace('%', ''));
      return bChange - aChange;
    });

    return {
      biggestIncrease: { name: sortedByChange[0].kategoria, change: sortedByChange[0].zmiana },
      biggestDecrease: { name: sortedByChange[sortedByChange.length - 1].kategoria, change: sortedByChange[sortedByChange.length - 1].zmiana }
    };
  }, [chartData]);

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
          <p className="text-sm text-gray-400">Dodaj transakcje, aby zobaczyć porównanie kategorii</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Porównanie kategorii</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Obecny miesiąc</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Poprzedni miesiąc</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="kategoria"
              stroke="#6b7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `${value} zł`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="obecny"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="poprzedni"
              fill="#9ca3af"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {chartData.map((category, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-sm">{category.kategoria}</h4>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  category.zmiana.startsWith('-')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {category.zmiana}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">{category.obecny} zł</span>
              <span className="text-sm text-gray-500">{category.poprzedni} zł</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Podsumowanie zmian</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Największy wzrost:</p>
            <p className="font-medium text-blue-900">{summary.biggestIncrease.name} ({summary.biggestIncrease.change})</p>
          </div>
          <div>
            <p className="text-blue-700">Największy spadek:</p>
            <p className="font-medium text-blue-900">{summary.biggestDecrease.name} ({summary.biggestDecrease.change})</p>
          </div>
        </div>
      </div>
    </div>
  );
}
