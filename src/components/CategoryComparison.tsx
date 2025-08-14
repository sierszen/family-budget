'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CategoryComparisonProps {
  period: string;
}

const data = [
  {
    kategoria: 'Mieszkanie',
    obecny: 1800,
    poprzedni: 1750,
    zmiana: '+2.9%',
    kolor: '#ef4444'
  },
  {
    kategoria: 'Jedzenie',
    obecny: 1200,
    poprzedni: 1100,
    zmiana: '+9.1%',
    kolor: '#3b82f6'
  },
  {
    kategoria: 'Transport',
    obecny: 800,
    poprzedni: 1000,
    zmiana: '-20%',
    kolor: '#10b981'
  },
  {
    kategoria: 'Rozrywka',
    obecny: 600,
    poprzedni: 500,
    zmiana: '+20%',
    kolor: '#f59e0b'
  },
  {
    kategoria: 'Zdrowie',
    obecny: 400,
    poprzedni: 450,
    zmiana: '-11.1%',
    kolor: '#8b5cf6'
  },
  {
    kategoria: 'Inne',
    obecny: 300,
    poprzedni: 350,
    zmiana: '-14.3%',
    kolor: '#6b7280'
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const current = payload[0].value;
    const previous = payload[1].value;
    const change = ((current - previous) / previous * 100).toFixed(1);

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
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
        {data.map((category, index) => (
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
            <p className="font-medium text-blue-900">Rozrywka (+20%)</p>
          </div>
          <div>
            <p className="text-blue-700">Największy spadek:</p>
            <p className="font-medium text-blue-900">Transport (-20%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
