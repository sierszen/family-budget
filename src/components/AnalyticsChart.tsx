'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AnalyticsChartProps {
  period: string;
}

const data = [
  { month: 'Sty', rzeczywiste: 6200, predykcja: 6000, trend: 5800 },
  { month: 'Lut', rzeczywiste: 6100, predykcja: 6200, trend: 6000 },
  { month: 'Mar', rzeczywiste: 5900, predykcja: 6100, trend: 6200 },
  { month: 'Kwi', rzeczywiste: null, predykcja: 6000, trend: 6400 },
  { month: 'Maj', rzeczywiste: null, predykcja: 5900, trend: 6600 },
  { month: 'Cze', rzeczywiste: null, predykcja: 5800, trend: 6800 },
  { month: 'Lip', rzeczywiste: null, predykcja: 5700, trend: 7000 },
  { month: 'Sie', rzeczywiste: null, predykcja: 5600, trend: 7200 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value ? `${entry.value} zł` : 'Brak danych'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsChart({ period }: AnalyticsChartProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Predykcje wydatków</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Rzeczywiste</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Predykcja</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Trend</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
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
            <Area
              type="monotone"
              dataKey="rzeczywiste"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="predykcja"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Area
              type="monotone"
              dataKey="trend"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Dokładność predykcji</h4>
          <p className="text-2xl font-bold text-blue-600">94.2%</p>
          <p className="text-sm text-blue-700 mt-1">
            Średnia dokładność predykcji na podstawie danych historycznych
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <h4 className="font-medium text-orange-900 mb-2">Przewidywane oszczędności</h4>
          <p className="text-2xl font-bold text-orange-600">2,500 zł</p>
          <p className="text-sm text-orange-700 mt-1">
            W następnym miesiącu dzięki optymalizacji wydatków
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">Trend oszczędności</h4>
          <p className="text-2xl font-bold text-green-600">+18%</p>
          <p className="text-sm text-green-700 mt-1">
            Wzrost oszczędności w ciągu ostatnich 3 miesięcy
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <h4 className="font-medium text-purple-900 mb-3">AI Rekomendacje</h4>
        <div className="space-y-2 text-sm text-purple-800">
          <p>• Kontynuuj trend oszczędzania na transporcie (carpooling)</p>
          <p>• Rozważ ograniczenie wydatków na rozrywkę o 15%</p>
          <p>• Przewidywane oszczędności w kwietniu: 2,500 zł</p>
          <p>• Zalecane utworzenie funduszu awaryjnego: 15,000 zł</p>
        </div>
      </div>
    </div>
  );
}
