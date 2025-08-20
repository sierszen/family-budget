'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useEffect, useState } from 'react'

interface CategoryPoint { name: string; value: number; color?: string }

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-blue-600 font-semibold">{payload[0].value} zł</p>
      </div>
    );
  }
  return null;
};

export function ExpenseChart() {
  const [data, setData] = useState<CategoryPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics/expenses-by-category?days=30', { cache: 'no-store' })
        if (!res.ok) throw new Error('Błąd pobierania danych wykresu')
        const json = await res.json()
        const points: CategoryPoint[] = Array.isArray(json.data) && json.data.length
          ? json.data.map((d: any) => ({ name: String(d.name || 'Inne'), value: Number(d.value || 0), color: d.color }))
          : []
        setData(points)
      } catch (e) {
        setError('Błąd sieci lub brak danych')
        setData([])
      }
    }
    fetchData()
  }, [])

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>
  }

  if (!data) {
    return <div className="h-80 flex items-center justify-center text-gray-500 text-sm">Ładowanie danych...</div>
  }

  if (data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-gray-500 text-sm">Brak danych w ostatnich 30 dniach</div>
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#6B7280'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-gray-700 font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
