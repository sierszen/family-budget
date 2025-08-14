'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, Download, Upload } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      weeklyReports: true,
      budgetAlerts: true
    },
    privacy: {
      shareData: false,
      analytics: true
    },
    budget: {
      currency: 'PLN',
      startOfWeek: 'monday'
    },
    appearance: {
      theme: 'light',
      compactMode: false
    }
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSettingChange = (category: string, setting: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleExportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-budget-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setSettings(data.settings || settings);
          alert('Dane zostały zaimportowane pomyślnie!');
        } catch (error) {
          alert('Błąd podczas importowania danych!');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteData = () => {
    if (confirm('Czy na pewno chcesz usunąć wszystkie dane? Ta operacja jest nieodwracalna!')) {
      // Tutaj dodamy API call do usunięcia danych
      alert('Dane zostały usunięte!');
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ustawienia</h1>
        <p className="text-gray-600">Zarządzaj ustawieniami aplikacji i swoimi danymi</p>
      </div>

      <div className="space-y-8">
        {/* Powiadomienia */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Powiadomienia</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Powiadomienia email</h3>
                <p className="text-sm text-gray-500">Otrzymuj powiadomienia na email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Tygodniowe raporty</h3>
                <p className="text-sm text-gray-500">Automatyczne raporty co tydzień</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.weeklyReports}
                  onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Prywatność */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prywatność</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Udostępnianie danych</h3>
                <p className="text-sm text-gray-500">Pozwól rodzinie widzieć Twoje transakcje</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.shareData}
                  onChange={(e) => handleSettingChange('privacy', 'shareData', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Zarządzanie danymi */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Zarządzanie danymi</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Eksport danych</h3>
                <p className="text-sm text-gray-500">Pobierz kopię swoich danych</p>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Eksportuj</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Import danych</h3>
                <p className="text-sm text-gray-500">Zaimportuj dane z pliku JSON</p>
              </div>
              <label className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Importuj</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Strefa niebezpieczna */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold text-red-900">Strefa niebezpieczna</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-900">Usuń wszystkie dane</h3>
              <p className="text-sm text-red-700">Ta operacja jest nieodwracalna!</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Usuń dane</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal potwierdzenia usunięcia */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Potwierdź usunięcie</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Czy na pewno chcesz usunąć wszystkie swoje dane? Ta operacja jest nieodwracalna i usunie wszystkie transakcje, ustawienia i dane rodzinne.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleDeleteData}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Usuń wszystko
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
