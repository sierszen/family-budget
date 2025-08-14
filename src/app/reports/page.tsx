'use client';

import { useState } from 'react';
import { Download, Calendar, TrendingUp, BarChart3, FileText, Filter } from 'lucide-react';

const reports = [
  {
    id: 1,
    name: 'Raport miesięczny',
    description: 'Podsumowanie wydatków i przychodów za miesiąc',
    type: 'monthly',
    lastGenerated: '2024-01-15',
    status: 'ready',
    icon: Calendar
  },
  {
    id: 2,
    name: 'Analiza kategorii',
    description: 'Szczegółowa analiza wydatków według kategorii',
    type: 'category',
    lastGenerated: '2024-01-14',
    status: 'ready',
    icon: BarChart3
  },
  {
    id: 3,
    name: 'Trendy oszczędności',
    description: 'Analiza trendów oszczędności w czasie',
    type: 'trends',
    lastGenerated: '2024-01-13',
    status: 'ready',
    icon: TrendingUp
  },
  {
    id: 4,
    name: 'Raport roczny',
    description: 'Kompletny raport roczny z podsumowaniem',
    type: 'yearly',
    lastGenerated: '2023-12-31',
    status: 'ready',
    icon: FileText
  }
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Raporty</h1>
          <p className="text-gray-600">Generuj i eksportuj raporty finansowe</p>
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
              <p className="text-sm font-medium text-gray-600">Dostępne raporty</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ostatni raport</p>
              <p className="text-2xl font-bold text-gray-900">Dzisiaj</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eksporty</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Automatyczne</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <report.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  Gotowy
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Ostatnio wygenerowany:</span>
              <span>{new Date(report.lastGenerated).toLocaleDateString('pl-PL')}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Pobierz PDF</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Report Generator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Generator raportów niestandardowych</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Okres
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="custom">Niestandardowy</option>
              <option value="week">Tydzień</option>
              <option value="month">Miesiąc</option>
              <option value="quarter">Kwartał</option>
              <option value="year">Rok</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ raportu
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="summary">Podsumowanie</option>
              <option value="detailed">Szczegółowy</option>
              <option value="comparison">Porównanie</option>
              <option value="trends">Trendy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategorie
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">Wszystkie</option>
              <option value="food">Jedzenie</option>
              <option value="transport">Transport</option>
              <option value="housing">Mieszkanie</option>
              <option value="entertainment">Rozrywka</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            <FileText className="h-4 w-4" />
            <span>Wygeneruj raport</span>
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Zapisz szablon
          </button>
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Zaplanowane raporty</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Raport miesięczny</h4>
                <p className="text-sm text-gray-600">Generowany automatycznie każdego 1. dnia miesiąca</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                Aktywny
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Raport tygodniowy</h4>
                <p className="text-sm text-gray-600">Generowany co poniedziałek o 9:00</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                Nieaktywny
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Dodaj zaplanowany raport</span>
          </button>
        </div>
      </div>

      {/* Report History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Historia raportów</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Nazwa raportu</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Data generowania</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Format</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Rozmiar</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'Raport stycznia 2024', date: '2024-01-15', format: 'PDF', size: '2.3 MB' },
                { name: 'Analiza kategorii', date: '2024-01-14', format: 'CSV', size: '156 KB' },
                { name: 'Trendy Q4 2023', date: '2024-01-10', format: 'PDF', size: '1.8 MB' },
                { name: 'Raport grudnia 2023', date: '2023-12-31', format: 'PDF', size: '2.1 MB' },
              ].map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{report.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(report.date).toLocaleDateString('pl-PL')}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{report.format}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{report.size}</td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Pobierz
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
