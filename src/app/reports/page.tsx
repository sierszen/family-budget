'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, BarChart3, FileText, Filter } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useStats } from '@/hooks/useStats';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'monthly' | 'category' | 'trends' | 'yearly';
  lastGenerated: string;
  status: 'ready' | 'generating' | 'error';
  icon: any;
}

export default function ReportsPage() {
  const { transactions, loading } = useTransactions();
  const { stats } = useStats();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reports, setReports] = useState<Report[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [customReport, setCustomReport] = useState({
    period: 'month',
    type: 'summary',
    categories: 'all',
    format: 'pdf'
  });

  // Inicjalizuj raporty na podstawie rzeczywistych danych
  useEffect(() => {
    if (!loading && transactions.length > 0) {
      const currentDate = new Date().toISOString().split('T')[0];

      const defaultReports: Report[] = [
        {
          id: '1',
          name: 'Raport miesięczny',
          description: `Podsumowanie wydatków i przychodów za ${new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}`,
          type: 'monthly',
          lastGenerated: currentDate,
          status: 'ready',
          icon: Calendar
        },
        {
          id: '2',
          name: 'Analiza kategorii',
          description: `Szczegółowa analiza wydatków według kategorii (${transactions.filter(t => t.type === 'EXPENSE').length} transakcji)`,
          type: 'category',
          lastGenerated: currentDate,
          status: 'ready',
          icon: BarChart3
        },
        {
          id: '3',
          name: 'Trendy oszczędności',
          description: `Analiza trendów oszczędności - obecnie: ${stats.savings.toFixed(0)} zł`,
          type: 'trends',
          lastGenerated: currentDate,
          status: 'ready',
          icon: TrendingUp
        },
        {
          id: '4',
          name: 'Raport roczny',
          description: 'Kompletny raport roczny z podsumowaniem',
          type: 'yearly',
          lastGenerated: currentDate,
          status: 'ready',
          icon: FileText
        }
      ];

      setReports(defaultReports);
    }
  }, [transactions, loading, stats]);

  const handleGenerateReport = async (reportId: string) => {
    setGeneratingReport(true);

    try {
      // Symulacja generowania raportu
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Aktualizuj status raportu
      setReports(prev => prev.map(report =>
        report.id === reportId
          ? { ...report, status: 'ready', lastGenerated: new Date().toISOString().split('T')[0] }
          : report
      ));

      alert('Raport został wygenerowany pomyślnie!');
    } catch (error) {
      console.error('Błąd generowania raportu:', error);
      alert('Błąd podczas generowania raportu');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = (reportId: string, format: 'pdf' | 'csv') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Symulacja pobierania
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${report.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}`;
    link.click();

    alert(`Pobieranie raportu ${report.name} w formacie ${format.toUpperCase()}...`);
  };

  const handleGenerateCustomReport = async () => {
    if (!transactions.length) {
      alert('Brak danych do wygenerowania raportu');
      return;
    }

    setGeneratingReport(true);

    try {
      // Symulacja generowania niestandardowego raportu
      await new Promise(resolve => setTimeout(resolve, 3000));

      alert(`Raport niestandardowy został wygenerowany w formacie ${customReport.format.toUpperCase()}!`);
    } catch (error) {
      console.error('Błąd generowania raportu:', error);
      alert('Błąd podczas generowania raportu');
    } finally {
      setGeneratingReport(false);
    }
  };

  const getReportStats = () => {
    if (loading || !transactions.length) {
      return {
        availableReports: 0,
        lastReport: 'Brak',
        exports: 0,
        automatic: 0
      };
    }

    return {
      availableReports: reports.length,
      lastReport: new Date().toLocaleDateString('pl-PL'),
      exports: Math.floor(transactions.length / 10), // Przybliżenie
      automatic: 2
    };
  };

  const reportStats = getReportStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie raportów...</p>
        </div>
      </div>
    );
  }

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
              <p className="text-2xl font-bold text-gray-900">{reportStats.availableReports}</p>
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
              <p className="text-2xl font-bold text-gray-900">{reportStats.lastReport}</p>
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
              <p className="text-2xl font-bold text-gray-900">{reportStats.exports}</p>
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
              <p className="text-2xl font-bold text-gray-900">{reportStats.automatic}</p>
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
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  report.status === 'ready'
                    ? 'bg-green-100 text-green-800'
                    : report.status === 'generating'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {report.status === 'ready' ? 'Gotowy' : report.status === 'generating' ? 'Generowanie...' : 'Błąd'}
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
              <button
                onClick={() => handleGenerateReport(report.id)}
                disabled={generatingReport}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>{generatingReport ? 'Generowanie...' : 'Pobierz PDF'}</span>
              </button>
              <button
                onClick={() => handleDownloadReport(report.id, 'csv')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
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
            <select
              value={customReport.period}
              onChange={(e) => setCustomReport({ ...customReport, period: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
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
            <select
              value={customReport.type}
              onChange={(e) => setCustomReport({ ...customReport, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
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
            <select
              value={customReport.categories}
              onChange={(e) => setCustomReport({ ...customReport, categories: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
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
            <select
              value={customReport.format}
              onChange={(e) => setCustomReport({ ...customReport, format: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-3">
          <button
            onClick={handleGenerateCustomReport}
            disabled={generatingReport || !transactions.length}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-4 w-4" />
            <span>{generatingReport ? 'Generowanie...' : 'Wygeneruj raport'}</span>
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Zapisz szablon
          </button>
        </div>
      </div>

      {/* Report History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Historia raportów</h3>

        {!transactions.length ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Brak historii raportów</p>
            <p className="text-sm text-gray-400">Dodaj transakcje, aby generować raporty</p>
          </div>
        ) : (
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
                  { name: `Raport ${new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}`, date: new Date().toISOString().split('T')[0], format: 'PDF', size: '2.3 MB' },
                  { name: 'Analiza kategorii', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], format: 'CSV', size: '156 KB' },
                  { name: 'Trendy wydatków', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], format: 'PDF', size: '1.8 MB' },
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
        )}
      </div>
    </div>
  );
}
