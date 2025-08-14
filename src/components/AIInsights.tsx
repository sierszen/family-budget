'use client';

import { Brain, TrendingUp, Lightbulb, Target } from 'lucide-react';

const insights = [
  {
    id: 1,
    type: 'savings',
    title: 'Oszczędności',
    message: 'Możesz zaoszczędzić 300 zł miesięcznie ograniczając wydatki na rozrywkę o 20%.',
    icon: TrendingUp,
    color: 'green'
  },
  {
    id: 2,
    type: 'alert',
    title: 'Uwaga',
    message: 'Wydatki na jedzenie są o 15% wyższe niż średnia z ostatnich 3 miesięcy.',
    icon: Target,
    color: 'orange'
  },
  {
    id: 3,
    type: 'tip',
    title: 'Wskazówka',
    message: 'Rozważ zakup karty rabatowej do stacji benzynowej - możesz zaoszczędzić 50 zł miesięcznie.',
    icon: Lightbulb,
    color: 'blue'
  }
];

const getInsightColor = (color: string) => {
  switch (color) {
    case 'green':
      return 'border-green-200 bg-green-50';
    case 'orange':
      return 'border-orange-200 bg-orange-50';
    case 'blue':
      return 'border-blue-200 bg-blue-50';
    default:
      return 'border-gray-200 bg-gray-50';
  }
};

const getIconColor = (color: string) => {
  switch (color) {
    case 'green':
      return 'text-green-600';
    case 'orange':
      return 'text-orange-600';
    case 'blue':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export function AIInsights() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="h-5 w-5 text-purple-600" />
        <span className="text-sm font-medium text-gray-600">AI Analiza</span>
      </div>

      {insights.map((insight) => (
        <div key={insight.id} className={`p-4 rounded-lg border ${getInsightColor(insight.color)}`}>
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg bg-white ${getIconColor(insight.color)}`}>
              <insight.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
              <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">AI Rekomendacja</span>
        </div>
        <p className="text-sm text-purple-800">
          Twój budżet wygląda dobrze! Rozważ utworzenie funduszu awaryjnego w wysokości 3 miesięcznych wydatków.
        </p>
      </div>
    </div>
  );
}
