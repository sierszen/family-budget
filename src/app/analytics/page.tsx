'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { SpendingTrends } from '@/components/SpendingTrends';
import { CategoryComparison } from '@/components/CategoryComparison';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedChart, setSelectedChart] = useState('trends');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analizy</h1>
          <p className="text-gray-600">Zaawansowane analizy i trendy wydatków</p>
        </div>
        <div className="flex items-center space-x-3">
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
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filtry</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Średnie wydatki dzienne</p>
              <p className="text-2xl font-bold text-gray-900">208 zł</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingDown className="h-4 w-4 mr-1" />
                -12% vs poprzedni miesiąc
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Największa kategoria</p>
              <p className="text-2xl font-bold text-gray-900">Mieszkanie</p>
              <p className="text-sm text-gray-600 mt-1">30% wszystkich wydatków</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Oszczędności</p>
              <p className="text-2xl font-bold text-gray-900">2,180 zł</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +15% vs poprzedni miesiąc
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Liczba transakcji</p>
              <p className="text-2xl font-bold text-gray-900">127</p>
              <p className="text-sm text-gray-600 mt-1">W tym miesiącu</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setSelectedChart('trends')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedChart === 'trends'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Trendy wydatków
          </button>
          <button
            onClick={() => setSelectedChart('categories')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedChart === 'categories'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Porównanie kategorii
          </button>
          <button
            onClick={() => setSelectedChart('predictions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedChart === 'predictions'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Predykcje
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedChart === 'trends' && <SpendingTrends period={selectedPeriod} />}
          {selectedChart === 'categories' && <CategoryComparison period={selectedPeriod} />}
          {selectedChart === 'predictions' && <AnalyticsChart period={selectedPeriod} />}
        </div>

        {/* Insights Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kluczowe wnioski</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Trend oszczędności</h4>
              <p className="text-sm text-blue-700">
                Twoje oszczędności rosną o 15% miesięcznie. To świetny wynik!
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900 mb-2">Uwaga: Wydatki na rozrywkę</h4>
              <p className="text-sm text-orange-700">
                Wydatki na rozrywkę są o 20% wyższe niż średnia. Rozważ ograniczenie.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Pozytywny trend</h4>
              <p className="text-sm text-green-700">
                Wydatki na transport spadły o 25% dzięki carpoolingowi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Szczegółowa analiza</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top 5 kategorii wydatków</h4>
            <div className="space-y-3">
              {[
                { name: 'Mieszkanie', amount: 1800, percentage: 30 },
                { name: 'Jedzenie', amount: 1200, percentage: 20 },
                { name: 'Transport', amount: 800, percentage: 13 },
                { name: 'Rozrywka', amount: 600, percentage: 10 },
                { name: 'Zdrowie', amount: 400, percentage: 7 },
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.amount} zł
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Trendy miesięczne</h4>
            <div className="space-y-3">
              {[
                { month: 'Styczeń', income: 8000, expenses: 6200, savings: 1800 },
                { month: 'Luty', income: 8200, expenses: 6100, savings: 2100 },
                { month: 'Marzec', income: 8100, expenses: 5900, savings: 2200 },
              ].map((data, index) => (
                <div key={index} className="border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{data.month}</span>
                    <span className="text-sm text-green-600 font-medium">
                      +{data.savings} zł
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Przychody: {data.income} zł</span>
                    <span>Wydatki: {data.expenses} zł</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
