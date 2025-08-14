'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SpendingTrendsProps {
  period: string;
}

const data = [
  { date: '1 Sty', wydatki: 120, przychody: 0, oszczędności: 0 },
  { date: '2 Sty', wydatki: 85, przychody: 0, oszczędności: 0 },
  { date: '3 Sty', wydatki: 200, przychody: 0, oszczędności: 0 },
  { date: '4 Sty', wydatki: 150, przychody: 0, oszczędności: 0 },
  { date: '5 Sty', wydatki: 95, przychody: 0, oszczędności: 0 },
  { date: '6 Sty', wydatki: 180, przychody: 0, oszczędności: 0 },
  { date: '7 Sty', wydatki: 120, przychody: 0, oszczędności: 0 },
  { date: '8 Sty', wydatki: 0, przychody: 3200, oszczędności: 3200 },
  { date: '9 Sty', wydatki: 160, przychody: 0, oszczędności: 3040 },
  { date: '10 Sty', wydatki: 140, przychody: 0, oszczędności: 2900 },
  { date: '11 Sty', wydatki: 90, przychody: 0, oszczędności: 2810 },
  { date: '12 Sty', wydatki: 220, przychody: 0, oszczędności: 2590 },
  { date: '13 Sty', wydatki: 1800, przychody: 0, oszczędności: 790 },
  { date: '14 Sty', wydatki: 85, przychody: 0, oszczędności: 705 },
  { date: '15 Sty', wydatki: 120, przychody: 0, oszczędności: 585 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
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
          <LineChart data={data}>
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
          <p className="text-lg font-semibold text-red-600">208 zł</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Najwyższy wydatek</p>
          <p className="text-lg font-semibold text-red-600">1,800 zł</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Dni bez wydatków</p>
          <p className="text-lg font-semibold text-green-600">1</p>
        </div>
      </div>
    </div>
  );
}
